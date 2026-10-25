import { NextRequest, NextResponse } from 'next/server';
import {
  checkLoginRateLimit,
  resetLoginRateLimit,
  verifyPassphrase,
  signSessionToken,
  ADMIN_COOKIE_NAME,
  ADMIN_COOKIE_OPTIONS,
  getClientIp,
} from '@/lib/auth/adminAuth';

function sanitizeReturnTo(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '/admin/dashboard';
  const trimmed = url.trim();
  // Disallow absolute protocol schemes and protocol-relative URLs (//)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.startsWith('/\\')) {
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
      return trimmed;
    }
  }
  return '/admin/dashboard';
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // 1. Rate Limiting Check
  const rateLimit = checkLoginRateLimit(ip);
  if (!rateLimit.allowed) {
    const errorMsg = `Too many failed login attempts. Please wait ${rateLimit.retryAfterSeconds || 900} seconds before trying again.`;
    if (req.headers.get('accept')?.includes('application/json') || req.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json({ success: false, error: errorMsg }, { status: 429 });
    }
    return NextResponse.redirect(new URL(`/admin?error=rate_limited`, req.url));
  }

  // 2. Parse payload (JSON or FormData)
  let email = '';
  let password = '';
  let passphrase = '';
  let returnTo = '/admin/dashboard';
  const isJson = req.headers.get('content-type')?.includes('application/json');

  if (isJson) {
    try {
      const body = await req.json();
      passphrase = body.passphrase?.toString() || '';
      email = body.email?.toString().trim() || '';
      password = body.password?.toString() || '';
      if (body.returnTo) returnTo = sanitizeReturnTo(body.returnTo.toString());
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid request payload.' }, { status: 400 });
    }
  } else {
    try {
      const formData = await req.formData();
      passphrase = formData.get('passphrase')?.toString() || '';
      email = formData.get('email')?.toString().trim() || '';
      password = formData.get('password')?.toString() || '';
      const r = formData.get('returnTo')?.toString();
      if (r) returnTo = sanitizeReturnTo(r);
    } catch {
      return NextResponse.redirect(new URL('/admin?error=invalid_payload', req.url));
    }
  }

  // 3. Option A: Administrative Passphrase Authentication
  if (passphrase) {
    if (verifyPassphrase(passphrase)) {
      resetLoginRateLimit(ip);
      const token = signSessionToken();

      if (isJson) {
        const res = NextResponse.json({ success: true, message: 'Authentication successful', returnTo, token }, { status: 200 });
        res.cookies.set(ADMIN_COOKIE_NAME, token, ADMIN_COOKIE_OPTIONS);
        return res;
      }

      const res = NextResponse.redirect(new URL(returnTo, req.url));
      res.cookies.set(ADMIN_COOKIE_NAME, token, ADMIN_COOKIE_OPTIONS);
      return res;
    }

    // Invalid passphrase
    const remaining = rateLimit.remainingAttempts;
    const errorMsg = `Invalid administrator passphrase. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`;

    if (isJson) {
      return NextResponse.json({ success: false, error: errorMsg }, { status: 401 });
    }
    return NextResponse.redirect(new URL(`/admin?error=invalid_credentials`, req.url));
  }

  // 4. Option B: Supabase Email & Password Authentication
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (email && password) {
    if (!supabaseUrl || !supabaseAnonKey) {
      const errorMsg = 'Supabase cloud authentication is not configured. Please use administrator passphrase.';
      if (isJson) {
        return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
      }
      return NextResponse.redirect(new URL('/admin?error=not_configured', req.url));
    }

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error || !data.session) {
        const remaining = rateLimit.remainingAttempts;
        const errorMsg = `Invalid credentials. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`;
        if (isJson) {
          return NextResponse.json({ success: false, error: errorMsg }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/admin?error=invalid_credentials', req.url));
      }

      resetLoginRateLimit(ip);
      const customToken = signSessionToken();

      if (isJson) {
        const res = NextResponse.json({ success: true, message: 'Sign in successful', returnTo }, { status: 200 });
        res.cookies.set(ADMIN_COOKIE_NAME, customToken, ADMIN_COOKIE_OPTIONS);
        res.cookies.set('sb-access-token', data.session.access_token, ADMIN_COOKIE_OPTIONS);
        return res;
      }

      const res = NextResponse.redirect(new URL(returnTo, req.url));
      res.cookies.set(ADMIN_COOKIE_NAME, customToken, ADMIN_COOKIE_OPTIONS);
      res.cookies.set('sb-access-token', data.session.access_token, ADMIN_COOKIE_OPTIONS);
      return res;
    } catch (err) {
      console.error('Admin Supabase sign-in error:', err);
      if (isJson) {
        return NextResponse.json({ success: false, error: 'Authentication service error.' }, { status: 500 });
      }
      return NextResponse.redirect(new URL('/admin?error=server_error', req.url));
    }
  }

  // No valid credentials provided
  const errorMsg = 'Please provide an administrator passphrase or email and password.';
  if (isJson) {
    return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
  }
  return NextResponse.redirect(new URL('/admin?error=missing_fields', req.url));
}
