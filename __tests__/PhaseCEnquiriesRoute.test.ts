/**
 * @jest-environment node
 */

const mockCreateServiceClient = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createServiceClient: (...args: any[]) => mockCreateServiceClient(...args),
}));

jest.mock('@/lib/storage/serverStore', () => ({
  isServerlessReadOnlyEnvironment: () =>
    process.env.VERCEL === '1' ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    process.env.NODE_ENV === 'production',
}));

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/enquiries/route';

const validEnquiry = {
  name: 'Test Visitor',
  email: 'visitor@example.com',
  discord: 'visitor#1234',
  category: 'web-development',
  title: 'Portfolio website',
  budget: '1000',
  timeline: '4 weeks',
  description: 'I need a durable contact form that stores enquiries in the database.',
  links: 'https://example.com',
};

let ipCounter = 0;

function makeRequest(body: unknown = validEnquiry): NextRequest {
  ipCounter += 1;
  return {
    headers: new Headers({
      'content-type': 'application/json',
      'x-forwarded-for': `203.0.113.${ipCounter}`,
    }),
    json: async () => body,
  } as unknown as NextRequest;
}

describe('Contact enquiry API persistence regressions', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.VERCEL;
    delete process.env.AWS_LAMBDA_FUNCTION_NAME;
    mockCreateServiceClient.mockResolvedValue(null);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('production without a backend fails instead of pretending the enquiry was saved', async () => {
    process.env.VERCEL = '1';

    const response = await POST(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toMatchObject({
      success: false,
      code: 'enquiries_not_configured',
    });
    expect(body.fallback).toBeUndefined();
  });

  test('development fallback is explicitly labelled as non-persistent', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const response = await POST(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body).toMatchObject({
      success: true,
      persistent: false,
      fallback: 'development_log',
    });
    expect(body.message).toMatch(/not stored in the database/i);
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('not persisted'),
      expect.any(String)
    );

    logSpy.mockRestore();
  });

  test('a missing enquiries table returns an actionable 503', async () => {
    mockCreateServiceClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          error: { code: 'PGRST205', message: 'Could not find the table public.enquiries' },
        }),
      }),
    });

    const response = await POST(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toMatchObject({
      success: false,
      code: 'enquiries_table_missing',
    });
    expect(body.error).toMatch(/phase_b_schema_storage_foundation\.sql/);
  });

  test('an existing empty enquiries table accepts a real insert', async () => {
    const insert = jest.fn().mockResolvedValue({ error: null });
    mockCreateServiceClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({ insert }),
    });

    const response = await POST(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      persistent: true,
    });
    expect(insert).toHaveBeenCalledWith([
      expect.objectContaining({
        name: validEnquiry.name,
        email: validEnquiry.email,
        title: validEnquiry.title,
        status: 'new',
      }),
    ]);
  });

  test('validation errors never reach the database', async () => {
    const response = await POST(
      makeRequest({
        ...validEnquiry,
        email: 'not-an-email',
        description: 'too short',
      })
    );
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.errors.email).toBeDefined();
    expect(body.errors.description).toBeDefined();
    expect(mockCreateServiceClient).not.toHaveBeenCalled();
  });
});
