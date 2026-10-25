import crypto from 'crypto';
import { NextRequest } from 'next/server';

export const ADMIN_COOKIE_NAME = 'lyos-admin-session';
export const SUPABASE_COOKIE_NAME = 'sb-access-token';

// In-memory rate limiting map for login attempts: ip -> { count, resetAt }
const LOGIN_RATE_LIMIT_MAP = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function checkLoginRateLimit(ip: string): { allowed: boolean; remainingAttempts: number; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = LOGIN_RATE_LIMIT_MAP.get(ip);

  if (!entry || now > entry.resetAt) {
    LOGIN_RATE_LIMIT_MAP.set(ip, { count: 1, resetAt: now + LOCKOUT_WINDOW_MS });
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds: retryAfter };
  }

  entry.count += 1;
  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - entry.count };
}

export function resetLoginRateLimit(ip: string): void {
  LOGIN_RATE_LIMIT_MAP.delete(ip);
}

function getSigningSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_ACCESS_PASSPHRASE ||
    'lyos-dev-session-secret-change-in-production'
  );
}

export function getExpectedPassphrase(): string {
  return process.env.ADMIN_ACCESS_PASSPHRASE || 'livingyuji-admin-2026';
}

/**
 * Validates admin passphrase using timing-safe comparison
 */
export function verifyPassphrase(inputPassphrase: string): boolean {
  if (!inputPassphrase || typeof inputPassphrase !== 'string') return false;

  const expected = getExpectedPassphrase();
  const inputHash = crypto.createHash('sha256').update(inputPassphrase).digest();
  const expectedHash = crypto.createHash('sha256').update(expected).digest();

  try {
    return crypto.timingSafeEqual(inputHash, expectedHash);
  } catch {
    return false;
  }
}

interface SessionPayload {
  role: 'admin';
  iat: number;
  exp: number;
}

/**
 * Generates a cryptographically signed HMAC-SHA256 session token
 */
export function signSessionToken(): string {
  const payload: SessionPayload = {
    role: 'admin',
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = getSigningSecret();
  const signature = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies a signed HMAC-SHA256 session token
 */
export function verifySessionToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payloadB64, signature] = parts;
  const secret = getSigningSecret();
  const expectedSignature = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');

  try {
    const isSigValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
    if (!isSigValid) return false;

    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload: SessionPayload = JSON.parse(payloadJson);

    if (payload.role !== 'admin') return false;
    if (Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * Extracts client IP safely from request headers
 */
export function getClientIp(req: NextRequest | Request): string {
  const headers = req.headers;
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}

/**
 * Server-side check for admin authentication in Route Handlers or Server Actions
 */
export async function isAuthenticatedAdmin(req: NextRequest | Request): Promise<boolean> {
  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = parseCookies(cookieHeader);

  // 1. Check custom signed HMAC session
  const sessionToken = cookies[ADMIN_COOKIE_NAME];
  if (sessionToken && verifySessionToken(sessionToken)) {
    return true;
  }

  // 2. Check Supabase token if configured
  const supabaseToken = cookies[SUPABASE_COOKIE_NAME];
  if (supabaseToken) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
        const { data, error } = await supabase.auth.getUser(supabaseToken);
        if (!error && data.user) {
          return true;
        }
      } catch {
        // Fall through
      }
    }
  }

  return false;
}

export function parseCookies(cookieHeader: string): Record<string, string> {
  const map: Record<string, string> = {};
  if (!cookieHeader) return map;
  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const [key, ...vals] = pair.trim().split('=');
    if (key) map[key] = decodeURIComponent(vals.join('='));
  }
  return map;
}

export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 24 * 60 * 60, // 24 hours
  path: '/',
};
