import { NextRequest, NextResponse } from 'next/server';

const ADMIN_COOKIE_NAME = 'lyos-admin-session';
const SUPABASE_COOKIE_NAME = 'sb-access-token';

// Edge-safe HMAC verification using Web Crypto API
async function verifyTokenEdge(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payloadB64, signature] = parts;
  try {
    const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson);

    if (payload.role !== 'admin') return false;
    if (Date.now() > payload.exp) return false;

    // Verify signature using Web Crypto HMAC SHA-256
    const secret =
      process.env.ADMIN_SESSION_SECRET ||
      process.env.ADMIN_ACCESS_PASSPHRASE ||
      'lyos-dev-session-secret-change-in-production';

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );

    const sigBytes = Uint8Array.from(
      atob(signature.replace(/-/g, '+').replace(/_/g, '/')),
      (c) => c.charCodeAt(0)
    );

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      enc.encode(payloadB64)
    );

    return isValid;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect all /admin/dashboard routes
  if (pathname.startsWith('/admin/dashboard')) {
    const adminSession = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const supabaseToken = req.cookies.get(SUPABASE_COOKIE_NAME)?.value;

    const isSessionValid = await verifyTokenEdge(adminSession);

    // If neither session token nor Supabase token is present
    if (!isSessionValid && !supabaseToken) {
      const loginUrl = new URL('/admin', req.url);
      loginUrl.searchParams.set('returnTo', pathname);
      loginUrl.searchParams.set('error', 'session_required');
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
};
