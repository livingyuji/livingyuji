/**
 * @jest-environment node
 */

const mockIsAuthenticatedAdmin = jest.fn();
const mockCreateServiceClient = jest.fn();

jest.mock('@/lib/auth/adminAuth', () => ({
  isAuthenticatedAdmin: (...args: any[]) => mockIsAuthenticatedAdmin(...args),
}));

jest.mock('@/lib/supabase/server', () => ({
  createServiceClient: (...args: any[]) => mockCreateServiceClient(...args),
}));

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/admin/upload/route';

function makeFile(name: string, type: string, contents = 'asset'): File {
  return new File([contents], name, { type });
}

function makeRequest(fields: Record<string, unknown>): NextRequest {
  return {
    formData: async () => {
      const formData = new FormData();
      for (const [key, value] of Object.entries(fields)) {
        if (value instanceof File) formData.append(key, value);
        else if (value !== undefined) formData.append(key, String(value));
      }
      return formData;
    },
  } as unknown as NextRequest;
}

function storageClient(options?: {
  uploadError?: { message: string } | null;
  publicUrl?: string;
}) {
  const upload = jest.fn().mockResolvedValue(
    options?.uploadError
      ? { data: null, error: options.uploadError }
      : { data: { path: 'returned/path.png' }, error: null }
  );
  const getPublicUrl = jest.fn().mockReturnValue({
    data: { publicUrl: options?.publicUrl ?? 'https://cdn.example.com/stored-file.png' },
  });
  return {
    upload,
    getPublicUrl,
    client: {
      storage: {
        from: jest.fn().mockReturnValue({ upload, getPublicUrl }),
      },
    },
  };
}

describe('Authenticated admin upload route', () => {
  beforeAll(() => {
    // jsdom's File implementation may not expose arrayBuffer; the route only
    // needs bytes after all validation has passed.
    if (typeof File !== 'undefined' && !File.prototype.arrayBuffer) {
      Object.defineProperty(File.prototype, 'arrayBuffer', {
        value: async () => new Uint8Array([1, 2, 3]).buffer,
        configurable: true,
      });
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAuthenticatedAdmin.mockResolvedValue(false);
    mockCreateServiceClient.mockResolvedValue(null);
  });

  test('rejects unauthenticated uploads before reading the body', async () => {
    const formData = jest.fn();
    const response = await POST({ formData } as unknown as NextRequest);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
    expect(formData).not.toHaveBeenCalled();
  });

  test('requires a supported purpose and a music track ID', async () => {
    mockIsAuthenticatedAdmin.mockResolvedValue(true);

    const invalidPurpose = await POST(
      makeRequest({ file: makeFile('track.mp3', 'audio/mpeg'), purpose: 'unknown' })
    );
    expect(invalidPurpose.status).toBe(400);

    const missingTrackId = await POST(
      makeRequest({ file: makeFile('track.mp3', 'audio/mpeg'), purpose: 'music-audio' })
    );
    expect(missingTrackId.status).toBe(400);
    expect((await missingTrackId.json()).error).toMatch(/stable track ID/i);
    expect(mockCreateServiceClient).not.toHaveBeenCalled();
  });

  test('rejects unsupported extensions and MIME mismatches', async () => {
    mockIsAuthenticatedAdmin.mockResolvedValue(true);

    const badExtension = await POST(
      makeRequest({ file: makeFile('script.exe', 'application/octet-stream'), purpose: 'media' })
    );
    expect(badExtension.status).toBe(415);
    expect((await badExtension.json()).error).toMatch(/Unsupported file extension/i);

    const mimeMismatch = await POST(
      makeRequest({ file: makeFile('poster.png', 'video/mp4'), purpose: 'showcase-image' })
    );
    expect(mimeMismatch.status).toBe(415);
    expect((await mimeMismatch.json()).error).toMatch(/does not match/i);
    expect(mockCreateServiceClient).not.toHaveBeenCalled();
  });

  test('returns a durable public URL for a valid music upload', async () => {
    mockIsAuthenticatedAdmin.mockResolvedValue(true);
    const storage = storageClient({
      publicUrl: 'https://project.supabase.co/storage/v1/object/public/music/audio/track-123/file.mp3',
    });
    mockCreateServiceClient.mockResolvedValue(storage.client);

    const response = await POST(
      makeRequest({
        file: makeFile('My Track.mp3', 'audio/mpeg'),
        purpose: 'music-audio',
        recordId: 'track-123',
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      bucket: 'music',
      url: 'https://project.supabase.co/storage/v1/object/public/music/audio/track-123/file.mp3',
      contentType: 'audio/mpeg',
      purpose: 'music-audio',
    });
    expect(storage.upload).toHaveBeenCalledWith(
      expect.stringMatching(/^audio\/track-123\/\d+-My-Track\.mp3$/),
      expect.any(Buffer),
      expect.objectContaining({
        contentType: 'audio/mpeg',
        upsert: false,
        cacheControl: '31536000',
      })
    );
    expect(storage.getPublicUrl).toHaveBeenCalledWith('returned/path.png');
  });

  test('reports missing buckets and unconfigured storage as actionable 503s', async () => {
    mockIsAuthenticatedAdmin.mockResolvedValue(true);

    const notConfigured = await POST(
      makeRequest({
        file: makeFile('wallpaper.mp4', 'video/mp4'),
        purpose: 'wallpaper-video',
      })
    );
    expect(notConfigured.status).toBe(503);
    expect((await notConfigured.json()).error).toMatch(/Supabase Storage is not configured/i);

    const storage = storageClient({ uploadError: { message: 'Bucket not found' } });
    mockCreateServiceClient.mockResolvedValue(storage.client);
    const missingBucket = await POST(
      makeRequest({
        file: makeFile('wallpaper.mp4', 'video/mp4'),
        purpose: 'wallpaper-video',
      })
    );
    expect(missingBucket.status).toBe(503);
    expect((await missingBucket.json()).error).toMatch(/Phase B migration|phase_b/i);
  });
});
