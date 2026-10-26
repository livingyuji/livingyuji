const mockCreateServiceClient = jest.fn();
const mockCreateServerClient = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createServiceClient: (...args: any[]) => mockCreateServiceClient(...args),
  createServerClient: (...args: any[]) => mockCreateServerClient(...args),
}));

import {
  getShowcaseProjects,
  saveShowcaseProject,
  deleteShowcaseProject,
  resetShowcaseProjects,
  getMinecraftProducts,
  saveMinecraftProduct,
  getMusicTracks,
  saveMusicTrack,
  saveSiteSettings,
  saveMediaAsset,
} from '@/lib/storage/serverStore';

function listResult(data: any[], error: any = null) {
  const order = jest.fn().mockResolvedValue({ data, error });
  return {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({ order }),
    }),
  };
}

function readAndUpsertClient(existing: any) {
  const captured: any[] = [];
  const maybeSingle = jest.fn().mockResolvedValue({ data: existing, error: null });
  const eq = jest.fn().mockReturnValue({ maybeSingle });
  const upsert = jest.fn().mockImplementation((payload) => {
    captured.push(payload);
    return {
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: payload, error: null }),
      }),
    };
  });

  return {
    captured,
    client: {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({ eq }),
        upsert,
      }),
    },
  };
}

describe('Phase C persistence regressions', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    // Prevent the development JSON mirror from being written during tests.
    process.env = { ...originalEnv, VERCEL: '1' };
    mockCreateServerClient.mockResolvedValue(null);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('successful empty server reads are authoritative for showcase, products, and music', async () => {
    const emptyQuery = {
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
    };
    mockCreateServiceClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue(emptyQuery),
      }),
    });

    await expect(getShowcaseProjects(true)).resolves.toEqual({
      projects: [],
      source: 'supabase',
    });
    await expect(getMinecraftProducts(true)).resolves.toEqual({
      products: [],
      source: 'supabase',
    });
    await expect(getMusicTracks(true)).resolves.toEqual({
      tracks: [],
      source: 'supabase',
    });
  });

  test('public showcase reads hide Private (any casing/whitespace) and explicitly unpublished projects', async () => {
    mockCreateServiceClient.mockResolvedValue(
      listResult([
        { id: 'visible', status: 'Released', published: true },
        { id: 'private', status: 'Private', published: true },
        { id: 'private-lower', status: 'private', published: true },
        { id: 'private-spaced', status: '  PRIVATE  ', published: true },
        { id: 'draft', status: 'Released', published: false },
      ])
    );

    const publicResult = await getShowcaseProjects(false);
    expect(publicResult.projects.map((project) => project.id)).toEqual(['visible']);

    const adminResult = await getShowcaseProjects(true);
    expect(adminResult.projects).toHaveLength(5);
  });

  test('public music and product reads only expose published records', async () => {
    const client = {
      from: jest.fn((table: string) => ({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data:
              table === 'music_tracks'
                ? [
                    { id: 'published-track', published: true },
                    { id: 'draft-track', published: false },
                    { id: 'legacy-track' },
                  ]
                : [
                    { id: 'published-product', published: true },
                    { id: 'draft-product', published: false },
                  ],
            error: null,
          }),
        }),
      })),
    };
    mockCreateServiceClient.mockResolvedValue(client);

    expect((await getMusicTracks(false)).tracks.map((track) => track.id)).toEqual([
      'published-track',
    ]);
    expect((await getMinecraftProducts(false)).products.map((product) => product.id)).toEqual([
      'published-product',
    ]);
  });

  test('showcase partial updates preserve existing fields and verification result', async () => {
    const existing = {
      id: 'proj-existing',
      title: 'Original title',
      slug: 'original-title',
      category_id: 'mc-plugins',
      summary: 'Original summary',
      description: 'Original description',
      features: ['Feature A'],
      technologies: ['Java'],
      status: 'Beta',
      featured: true,
      is_free: false,
      price: 19.99,
      version: 'v1.2.0',
      gradient_bg: 'from-amber-600 to-red-900',
      icon_symbol: '⚔️',
      links: { discord: 'https://discord.gg/livingyuji' },
      compatibility: { mc_versions: ['1.21.4'] },
      screenshots: ['/screenshot.png'],
      changelog: 'Previous changes',
      published: false,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-02T00:00:00.000Z',
    };
    const { captured, client } = readAndUpsertClient(existing);
    mockCreateServiceClient.mockResolvedValue(client);

    const result = await saveShowcaseProject({
      id: existing.id,
      title: 'Updated title',
    });

    expect(result.project.title).toBe('Updated title');
    expect(captured[0]).toMatchObject({
      id: existing.id,
      title: 'Updated title',
      slug: existing.slug,
      category_id: existing.category_id,
      summary: existing.summary,
      description: existing.description,
      features: existing.features,
      status: existing.status,
      featured: existing.featured,
      is_free: existing.is_free,
      price: existing.price,
      gradient_bg: existing.gradient_bg,
      icon_symbol: existing.icon_symbol,
      changelog: existing.changelog,
      published: false,
      created_at: existing.created_at,
    });
  });

  test('showcase reset restores canonical defaults and published visibility', async () => {
    const captured: any[] = [];
    const upsert = jest.fn().mockImplementation((payload: any) => {
      captured.push(payload);
      // Simulate a Phase C row that exists but is currently unpublished. An
      // upsert that omits `published` leaves the stored false value in place.
      const row = {
        ...payload,
        published: payload.published === undefined ? false : payload.published,
      };
      return {
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: row, error: null }),
        }),
      };
    });
    const select = jest.fn().mockResolvedValue({
      data: [{ id: 'proj-default' }],
      error: null,
    });

    mockCreateServiceClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({
        select,
        upsert,
      }),
    });

    const result = await resetShowcaseProjects([
      {
        id: 'proj-default',
        title: 'Canonical Default',
        category_id: 'web-apps',
        status: 'Released',
        featured: false,
      },
    ]);

    expect(captured).toHaveLength(2);
    expect(captured[0].published).toBeUndefined();
    expect(captured[1]).toMatchObject({
      id: 'proj-default',
      title: 'Canonical Default',
      published: true,
    });
    expect(result.projects[0].published).toBe(true);
    expect(result.destination).toBe('supabase_production');
  });

  test('showcase reset tolerates a Phase B-only schema without a published column', async () => {
    const captured: any[] = [];
    mockCreateServiceClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [{ id: 'proj-default' }],
          error: null,
        }),
        upsert: jest.fn().mockImplementation((payload: any) => {
          captured.push(payload);
          return {
            select: jest.fn().mockReturnValue({
              // A schema without the optional column simply returns the
              // canonical columns and no `published` value.
              single: jest.fn().mockResolvedValue({ data: payload, error: null }),
            }),
          };
        }),
      }),
    });

    const result = await resetShowcaseProjects([
      {
        id: 'proj-default',
        title: 'Canonical Default',
        category_id: 'web-apps',
        status: 'Released',
        featured: false,
      },
    ]);

    expect(captured).toHaveLength(1);
    expect(captured[0].published).toBeUndefined();
    expect(result.projects[0]).not.toHaveProperty('published', true);
  });

  test('camelCase admin payloads map to canonical database columns', async () => {
    const { captured, client } = readAndUpsertClient(null);
    mockCreateServiceClient.mockResolvedValue(client);

    await saveMinecraftProduct({
      id: 'prod-alias',
      name: 'Alias Product',
      category: 'plugins',
      categoryName: 'Plugins',
      shortDesc: 'Short description',
      fullDesc: 'Full description',
      price: 0,
      version: 'v1.0.0',
      mcVersions: ['1.21.4'],
      serverSoftware: ['Paper'],
      installationSteps: ['Drop the jar'],
      fileFormat: '.jar',
      fileSize: '1 MB',
      downloadsCount: 12,
      iconBg: 'from-blue-600 to-indigo-900',
      iconSymbol: '⚡',
      downloadUrl: 'https://cdn.example.com/file.jar',
    });

    expect(captured[0]).toMatchObject({
      id: 'prod-alias',
      category_name: 'Plugins',
      short_desc: 'Short description',
      full_desc: 'Full description',
      is_free: true,
      mc_versions: ['1.21.4'],
      server_software: ['Paper'],
      installation_steps: ['Drop the jar'],
      file_format: '.jar',
      file_size: '1 MB',
      downloads_count: 12,
      icon_bg: 'from-blue-600 to-indigo-900',
      icon_symbol: '⚡',
      download_url: 'https://cdn.example.com/file.jar',
    });

    const music = readAndUpsertClient(null);
    mockCreateServiceClient.mockResolvedValue(music.client);
    await saveMusicTrack({
      id: 'track-alias',
      title: 'Alias Track',
      audioUrl: 'https://cdn.example.com/track.mp3',
      coverUrl: 'https://cdn.example.com/cover.png',
      coverGradient: 'from-blue-900 to-slate-950',
      durationSec: 240,
      trackOrder: 3,
      published: true,
    });

    expect(music.captured[0]).toMatchObject({
      id: 'track-alias',
      audio_url: 'https://cdn.example.com/track.mp3',
      cover_url: 'https://cdn.example.com/cover.png',
      cover_gradient: 'from-blue-900 to-slate-950',
      duration_sec: 240,
      track_order: 3,
      published: true,
    });
  });

  test('browser-only media URLs are rejected instead of being persisted', async () => {
    const { client } = readAndUpsertClient(null);
    mockCreateServiceClient.mockResolvedValue(client);

    await expect(
      saveMusicTrack({
        id: 'track-blob',
        title: 'Unsafe Track',
        audio_url: 'blob:https://livingyuji.com/1234',
      })
    ).rejects.toThrow(/browser-only URL/i);

    await expect(
      saveMusicTrack({
        id: 'track-local',
        title: 'Local Track',
        audio_url: 'local:track-file',
      })
    ).rejects.toThrow(/browser-only URL/i);
  });

  test('branding saves reject browser-only wallpaper URLs', async () => {
    await expect(
      saveSiteSettings({ custom_wallpaper_url: 'blob:https://livingyuji.com/wallpaper' })
    ).rejects.toThrow(/browser-only URL/i);

    await expect(
      saveSiteSettings({ custom_video_wallpaper_url: 'local:lyos_video_wallpaper_blob' })
    ).rejects.toThrow(/browser-only URL/i);
  });

  test('server rejects unsafe schemes, malformed URLs, and unapproved iframe providers', async () => {
    await expect(
      saveSiteSettings({ custom_wallpaper_url: 'javascript:alert(1)' })
    ).rejects.toThrow(/absolute http\(s\) URL/i);

    await expect(
      saveSiteSettings({ custom_wallpaper_url: 'https://exa mple.com/wallpaper.png' })
    ).rejects.toThrow(/absolute http\(s\) URL/i);

    await expect(
      saveSiteSettings({ custom_video_wallpaper_url: 'https://youtube.com/watch?v=unapproved' })
    ).rejects.toThrow(/unapproved iframe provider/i);

    await expect(
      saveSiteSettings({ custom_video_wallpaper_url: 'https://evil.example/embed/unapproved' })
    ).rejects.toThrow(/unapproved iframe provider/i);

    await expect(
      saveMusicTrack({
        id: 'track-data-url',
        title: 'Data URL Track',
        audio_url: 'data:audio/mpeg;base64,AAAA',
      })
    ).rejects.toThrow(/absolute http\(s\) URL/i);

    await expect(
      saveMinecraftProduct({
        id: 'product-file-url',
        name: 'File URL Product',
        download_url: 'file:///C:/Users/example/plugin.jar',
      })
    ).rejects.toThrow(/absolute http\(s\) URL/i);

    await expect(
      saveMediaAsset({
        id: 'media-protocol-relative',
        name: 'Unsafe Asset',
        url: '//evil.example/image.png',
      })
    ).rejects.toThrow(/absolute http\(s\) URL/i);
  });

  test('deletes verify that a row was actually removed', async () => {
    mockCreateServiceClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }),
    });

    await expect(deleteShowcaseProject('missing-project')).rejects.toThrow(
      'was not found; nothing was deleted'
    );
  });

  test('missing tables return an actionable migration error', async () => {
    mockCreateServiceClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: null,
            error: { code: '42P01', message: 'relation "public.music_tracks" does not exist' },
          }),
        }),
      }),
    });

    await expect(getMusicTracks(false)).rejects.toThrow(
      '20261026_phase_b_schema_storage_foundation.sql'
    );
  });
});
