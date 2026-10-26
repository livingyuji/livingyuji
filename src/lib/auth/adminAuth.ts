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

function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Production must never fall back to development defaults. Both secrets are
 * required so a misconfigured deployment fails closed instead of accepting a
 * publicly known passphrase or exposing a forgeable session secret.
 */
export function isAdminAuthConfigured(): boolean {
  if (!isProductionRuntime()) return true;
  return Boolean(
    process.env.ADMIN_ACCESS_PASSPHRASE?.trim() &&
    process.env.ADMIN_SESSION_SECRET?.trim()
  );
}

function getSigningSecret(): string {
  const configuredSecret = process.env.ADMIN_SESSION_SECRET;
  if (configuredSecret) return configuredSecret;

  if (isProductionRuntime()) {
    throw new Error('ADMIN_SESSION_SECRET is required in production.');
  }

  return (
    process.env.ADMIN_ACCESS_PASSPHRASE ||
    'lyos-dev-session-secret-change-in-production'
  );
}

export function getExpectedPassphrase(): string {
  const configuredPassphrase = process.env.ADMIN_ACCESS_PASSPHRASE;
  if (configuredPassphrase) return configuredPassphrase;

  if (isProductionRuntime()) {
    throw new Error('ADMIN_ACCESS_PASSPHRASE is required in production.');
  }

  return 'livingyuji-admin-2026';
}

/**
 * Validates admin passphrase using timing-safe comparison
 */
export function verifyPassphrase(inputPassphrase: string): boolean {
  if (!inputPassphrase || typeof inputPassphrase !== 'string') return false;

  try {
    const expected = getExpectedPassphrase();
    const inputHash = crypto.createHash('sha256').update(inputPassphrase).digest();
    const expectedHash = crypto.createHash('sha256').update(expected).digest();
    return crypto.timingSafeEqual(inputHash, expectedHash);
  } catch {
    // Missing configuration or malformed input fails closed.
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

  try {
    const secret = getSigningSecret();
    const expectedSignature = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');

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
 * Minimal Supabase user shape needed for authorization.
 *
 * Only server-controlled data is consulted. `user_metadata` is included solely
 * so callers can pass a full Supabase user object; it is never read because
 * authenticated users can edit it themselves.
 */
export interface AdminUserLike {
  email?: string | null;
  app_metadata?: unknown;
  user_metadata?: unknown;
}

function normalizeEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

/**
 * Determines whether a Supabase user is an authorized administrator.
 *
 * Trusted signals (server-controlled only):
 * 1. `app_metadata.role === 'admin'` (writable only with the service role key)
 * 2. Email matches the explicitly configured `ADMIN_EMAIL`
 *
 * `user_metadata.role` is never trusted: ordinary users can set it on
 * themselves and it must not grant administrator access.
 */
export function isAuthorizedAdminUser(user: AdminUserLike | null | undefined): boolean {
  if (!user) return false;

  const appMetadata = user.app_metadata;
  const appRole =
    appMetadata && typeof appMetadata === 'object'
      ? (appMetadata as Record<string, unknown>).role
      : undefined;

  if (typeof appRole === 'string' && appRole.trim().toLowerCase() === 'admin') {
    return true;
  }

  const configuredAdminEmail = normalizeEmail(process.env.ADMIN_EMAIL);
  const userEmail = normalizeEmail(user.email);
  return Boolean(configuredAdminEmail && userEmail && configuredAdminEmail === userEmail);
}

/**
 * Server-side check for admin authentication in Route Handlers or Server Actions
 * Supports:
 * 1. HTTP-only signed session cookie ('lyos-admin-session')
 * 2. Authorization header ('Bearer <token>')
 * 3. Custom admin header ('x-admin-token')
 * 4. Supabase auth cookie ('sb-access-token')
 */
export async function isAuthenticatedAdmin(req: NextRequest | Request): Promise<boolean> {
  const headers = req.headers;

  // 1. Check Authorization Bearer header
  const authHeader = headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7).trim();
    if (verifySessionToken(bearerToken)) {
      return true;
    }
  }

  // 2. Check custom x-admin-token header
  const xAdminToken = headers.get('x-admin-token')?.trim();
  if (xAdminToken && verifySessionToken(xAdminToken)) {
    return true;
  }

  // 3. Check custom signed HMAC session cookie
  const cookieHeader = headers.get('cookie') || '';
  const cookies = parseCookies(cookieHeader);
  const sessionToken = cookies[ADMIN_COOKIE_NAME];
  if (sessionToken && verifySessionToken(sessionToken)) {
    return true;
  }

  // 4. Check Supabase token if configured. This path is also gated on the
  // admin auth configuration so a production deployment missing its secrets
  // fails closed instead of silently relying on a second auth mechanism.
  const supabaseToken = cookies[SUPABASE_COOKIE_NAME];
  if (supabaseToken && isAdminAuthConfigured()) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
        const { data, error } = await supabase.auth.getUser(supabaseToken);
        if (!error && data.user && isAuthorizedAdminUser(data.user)) {
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
