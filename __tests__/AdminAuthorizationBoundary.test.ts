/**
 * @jest-environment node
 *
 * Focused tests for the administrator authorization boundary.
 *
 * The security property under test: a normal Supabase account (including one
 * that sets `user_metadata.role = 'admin'` on itself) must never receive an
 * admin session. Only server-controlled `app_metadata.role` or an explicitly
 * configured `ADMIN_EMAIL` may authorize an administrator.
 */

const mockCreateClient = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args: any[]) => mockCreateClient(...args),
}));

import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';
import {
  ADMIN_COOKIE_NAME,
  isAuthenticatedAdmin,
  isAdminAuthConfigured,
  isAuthorizedAdminUser,
  signSessionToken,
  verifyPassphrase,
  verifySessionToken,
} from '@/lib/auth/adminAuth';
import { POST as signInRoute } from '@/app/api/admin/signin/route';

function createMockRequest(headers: Record<string, string>): any {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    normalized[key.toLowerCase()] = value;
  }
  return {
    headers: {
      get: (headerName: string) => normalized[headerName.toLowerCase()] || null,
    },
  };
}

function mockSupabaseUser(user: Record<string, unknown> | null, options?: { getUserError?: unknown }) {
  mockCreateClient.mockReturnValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user },
        error: options?.getUserError ?? null,
      }),
      signInWithPassword: jest.fn().mockResolvedValue(
        user
          ? {
              data: {
                user,
                session: { access_token: 'supabase-access-token' },
              },
              error: null,
            }
          : {
              data: { user: null, session: null },
              error: { message: 'Invalid login credentials' },
            }
      ),
    },
  });
}

function signInRequest(body: Record<string, unknown>, ip: string): NextRequest {
  return new NextRequest('https://livingyuji.example/api/admin/signin', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  });
}

function signEdgeToken(secret: string): string {
  const payloadB64 = Buffer.from(
    JSON.stringify({ role: 'admin', iat: Date.now(), exp: Date.now() + 60_000 })
  ).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
  return `${payloadB64}.${signature}`;
}

describe('Administrator authorization boundary', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      ADMIN_ACCESS_PASSPHRASE: 'test-passphrase-2026',
      ADMIN_SESSION_SECRET: 'test-hmac-secret-2026',
      NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    };
    delete process.env.ADMIN_EMAIL;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('isAuthorizedAdminUser', () => {
    test('rejects an account whose only admin signal is user_metadata.role', () => {
      expect(
        isAuthorizedAdminUser({
          email: 'attacker@example.com',
          app_metadata: {},
          user_metadata: { role: 'admin' },
        })
      ).toBe(false);
    });

    test('accepts app_metadata.role = admin', () => {
      expect(
        isAuthorizedAdminUser({
          email: 'admin@example.com',
          app_metadata: { role: 'admin' },
          user_metadata: {},
        })
      ).toBe(true);
    });

    test('rejects non-admin app_metadata even when user_metadata claims admin', () => {
      expect(
        isAuthorizedAdminUser({
          email: 'user@example.com',
          app_metadata: { role: 'user' },
          user_metadata: { role: 'admin' },
        })
      ).toBe(false);
    });

    test('accepts only the explicitly configured ADMIN_EMAIL (case-insensitive)', () => {
      process.env.ADMIN_EMAIL = 'Owner@Example.com';
      expect(
        isAuthorizedAdminUser({
          email: 'owner@example.com ',
          app_metadata: {},
          user_metadata: { role: 'admin' },
        })
      ).toBe(true);

      expect(
        isAuthorizedAdminUser({
          email: 'someone-else@example.com',
          app_metadata: {},
          user_metadata: { role: 'admin' },
        })
      ).toBe(false);
    });

    test('rejects missing users and empty authorization signals', () => {
      expect(isAuthorizedAdminUser(null)).toBe(false);
      expect(isAuthorizedAdminUser(undefined)).toBe(false);
      expect(isAuthorizedAdminUser({ app_metadata: {}, user_metadata: {} })).toBe(false);
    });
  });

  describe('isAuthenticatedAdmin with a Supabase access token', () => {
    test('rejects a valid Supabase token whose only admin signal is user_metadata.role', async () => {
      mockSupabaseUser({
        id: 'user-1',
        email: 'attacker@example.com',
        app_metadata: {},
        user_metadata: { role: 'admin' },
      });

      const req = createMockRequest({ cookie: 'sb-access-token=valid-token' });
      await expect(isAuthenticatedAdmin(req)).resolves.toBe(false);
    });

    test('accepts a Supabase token with app_metadata.role = admin', async () => {
      mockSupabaseUser({
        id: 'admin-1',
        email: 'admin@example.com',
        app_metadata: { role: 'admin' },
        user_metadata: {},
      });

      const req = createMockRequest({ cookie: 'sb-access-token=valid-token' });
      await expect(isAuthenticatedAdmin(req)).resolves.toBe(true);
    });

    test('accepts a Supabase token matching ADMIN_EMAIL', async () => {
      process.env.ADMIN_EMAIL = 'owner@example.com';
      mockSupabaseUser({
        id: 'owner-1',
        email: 'owner@example.com',
        app_metadata: {},
        user_metadata: { role: 'admin' },
      });

      const req = createMockRequest({ cookie: 'sb-access-token=valid-token' });
      await expect(isAuthenticatedAdmin(req)).resolves.toBe(true);
    });
  });

  describe('production fail-closed configuration', () => {
    test('rejects passphrase/token auth when production secrets are missing', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = 'production';
        delete process.env.ADMIN_ACCESS_PASSPHRASE;
        delete process.env.ADMIN_SESSION_SECRET;

        expect(isAdminAuthConfigured()).toBe(false);
        expect(verifyPassphrase('livingyuji-admin-2026')).toBe(false);
        expect(verifySessionToken('payload.signature')).toBe(false);
        expect(() => signSessionToken()).toThrow(/ADMIN_SESSION_SECRET/);
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });

    test('requires both production secrets, not just one', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = 'production';
        delete process.env.ADMIN_ACCESS_PASSPHRASE;
        process.env.ADMIN_SESSION_SECRET = 'present-secret';

        expect(isAdminAuthConfigured()).toBe(false);
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });
  });

  describe('edge middleware', () => {
    test('rejects a token signed with the old dev fallback when production has no secret', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = 'production';
        delete process.env.ADMIN_SESSION_SECRET;
        delete process.env.ADMIN_ACCESS_PASSPHRASE;

        const fallbackToken = signEdgeToken('lyos-dev-session-secret-change-in-production');
        const req = new NextRequest('https://livingyuji.example/admin/dashboard', {
          headers: { cookie: `${ADMIN_COOKIE_NAME}=${fallbackToken}` },
        });

        const res = await middleware(req);
        expect(res.status).toBe(307);
        expect(res.headers.get('location')).toContain('/admin?');
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });

    test('accepts a token signed with the configured production secret', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = 'production';
        process.env.ADMIN_SESSION_SECRET = 'production-hmac-secret';

        const token = signEdgeToken('production-hmac-secret');
        const req = new NextRequest('https://livingyuji.example/admin/dashboard', {
          headers: { cookie: `${ADMIN_COOKIE_NAME}=${token}` },
        });

        const res = await middleware(req);
        expect(res.headers.get('x-middleware-next')).toBe('1');
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });
  });

  describe('POST /api/admin/signin', () => {
    test('does not issue an admin session for a non-admin Supabase account that forges user_metadata.role', async () => {
      mockSupabaseUser({
        id: 'user-1',
        email: 'attacker@example.com',
        app_metadata: {},
        user_metadata: { role: 'admin' },
      });

      const res = await signInRoute(
        signInRequest(
          { email: 'attacker@example.com', password: 'correct-password' },
          '198.51.100.10'
        )
      );

      expect(res.status).toBe(403);
      expect(res.cookies.get(ADMIN_COOKIE_NAME)).toBeUndefined();

      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.token).toBeUndefined();
    });

    test('issues an admin session for an account with app_metadata.role = admin', async () => {
      mockSupabaseUser({
        id: 'admin-1',
        email: 'admin@example.com',
        app_metadata: { role: 'admin' },
        user_metadata: {},
      });

      const res = await signInRoute(
        signInRequest(
          { email: 'admin@example.com', password: 'correct-password' },
          '198.51.100.11'
        )
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);

      const sessionToken = res.cookies.get(ADMIN_COOKIE_NAME)?.value;
      expect(typeof sessionToken).toBe('string');
      expect(verifySessionToken(sessionToken)).toBe(true);
    });

    test('issues an admin session for an account matching ADMIN_EMAIL', async () => {
      process.env.ADMIN_EMAIL = 'owner@example.com';
      mockSupabaseUser({
        id: 'owner-1',
        email: 'owner@example.com',
        app_metadata: {},
        user_metadata: { role: 'admin' },
      });

      const res = await signInRoute(
        signInRequest(
          { email: 'owner@example.com', password: 'correct-password' },
          '198.51.100.12'
        )
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);

      const sessionToken = res.cookies.get(ADMIN_COOKIE_NAME)?.value;
      expect(verifySessionToken(sessionToken)).toBe(true);
    });

    test('fails closed with 503 in production when admin secrets are missing', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = 'production';
        delete process.env.ADMIN_ACCESS_PASSPHRASE;
        delete process.env.ADMIN_SESSION_SECRET;

        const res = await signInRoute(
          signInRequest(
            { email: 'admin@example.com', password: 'correct-password' },
            '198.51.100.13'
          )
        );

        expect(res.status).toBe(503);
        expect(res.cookies.get(ADMIN_COOKIE_NAME)).toBeUndefined();
        expect(mockCreateClient).not.toHaveBeenCalled();
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });
  });
});
