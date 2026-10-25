import {
  signSessionToken,
  verifySessionToken,
  verifyPassphrase,
  isAuthenticatedAdmin,
  ADMIN_COOKIE_NAME,
} from '../src/lib/auth/adminAuth';

function createMockRequest(headers: Record<string, string>): any {
  const normalized: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    normalized[k.toLowerCase()] = v;
  }
  return {
    headers: {
      get: (headerName: string) => normalized[headerName.toLowerCase()] || null,
    },
  };
}

describe('Admin Authentication & Session Token Verification', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      ADMIN_ACCESS_PASSPHRASE: 'test-passphrase-2026',
      ADMIN_SESSION_SECRET: 'test-hmac-secret-2026',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('verifyPassphrase validates the correct passphrase', () => {
    expect(verifyPassphrase('test-passphrase-2026')).toBe(true);
    expect(verifyPassphrase('wrong-passphrase')).toBe(false);
    expect(verifyPassphrase('')).toBe(false);
  });

  test('signSessionToken produces a valid HMAC token verified by verifySessionToken', () => {
    const token = signSessionToken();
    expect(token).toBeDefined();
    expect(token.includes('.')).toBe(true);
    expect(verifySessionToken(token)).toBe(true);
  });

  test('verifySessionToken rejects tampered or malformed tokens', () => {
    const validToken = signSessionToken();
    const parts = validToken.split('.');
    const tampered = `${parts[0]}.fakeSignature12345`;
    expect(verifySessionToken(tampered)).toBe(false);
    expect(verifySessionToken('invalid')).toBe(false);
    expect(verifySessionToken('')).toBe(false);
    expect(verifySessionToken(null)).toBe(false);
  });

  test('isAuthenticatedAdmin accepts token via Authorization: Bearer header', async () => {
    const token = signSessionToken();
    const req = createMockRequest({
      authorization: `Bearer ${token}`,
    });
    const isAuth = await isAuthenticatedAdmin(req);
    expect(isAuth).toBe(true);
  });

  test('isAuthenticatedAdmin accepts token via x-admin-token custom header', async () => {
    const token = signSessionToken();
    const req = createMockRequest({
      'x-admin-token': token,
    });
    const isAuth = await isAuthenticatedAdmin(req);
    expect(isAuth).toBe(true);
  });

  test('isAuthenticatedAdmin accepts token via lyos-admin-session cookie header', async () => {
    const token = signSessionToken();
    const req = createMockRequest({
      cookie: `${ADMIN_COOKIE_NAME}=${token}`,
    });
    const isAuth = await isAuthenticatedAdmin(req);
    expect(isAuth).toBe(true);
  });

  test('isAuthenticatedAdmin rejects requests with no credentials or invalid tokens', async () => {
    const reqNoAuth = createMockRequest({});
    expect(await isAuthenticatedAdmin(reqNoAuth)).toBe(false);

    const reqBadAuth = createMockRequest({
      authorization: 'Bearer bogus.token.value',
    });
    expect(await isAuthenticatedAdmin(reqBadAuth)).toBe(false);
  });
});
