import fs from 'fs/promises';

const mockCreateServiceClient = jest.fn();
const mockCreateServerClient = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createServiceClient: (...args: any[]) => mockCreateServiceClient(...args),
  createServerClient: (...args: any[]) => mockCreateServerClient(...args),
}));

import {
  isServerlessReadOnlyEnvironment,
  saveLocalStore,
  saveSiteSettings,
  saveDiscordSettings,
} from '@/lib/storage/serverStore';

describe('Production Serverless Read-Only FileSystem (EROFS) Regression Test', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('isServerlessReadOnlyEnvironment correctly identifies production/serverless runtimes', () => {
    process.env.VERCEL = '1';
    expect(isServerlessReadOnlyEnvironment()).toBe(true);

    delete process.env.VERCEL;
    process.env.AWS_LAMBDA_FUNCTION_NAME = 'my-lambda';
    expect(isServerlessReadOnlyEnvironment()).toBe(true);

    delete process.env.AWS_LAMBDA_FUNCTION_NAME;
    process.env.NODE_ENV = 'production';
    expect(isServerlessReadOnlyEnvironment()).toBe(true);

    delete process.env.NODE_ENV;
    expect(isServerlessReadOnlyEnvironment()).toBe(false);
  });

  test('saveLocalStore never attempts filesystem writes when running on Vercel/serverless', async () => {
    process.env.VERCEL = '1';
    const writeFileSpy = jest.spyOn(fs, 'writeFile').mockImplementation(async () => {
      throw new Error("EROFS: read-only file system, open '/var/task/data/admin-store.json.1792953350241.tmp'");
    });

    // Must resolve cleanly without throwing EROFS
    await expect(saveLocalStore({} as any)).resolves.not.toThrow();
    expect(writeFileSpy).not.toHaveBeenCalled();

    writeFileSpy.mockRestore();
  });

  test('saveSiteSettings saves to database and does not attempt filesystem write in serverless production', async () => {
    process.env.VERCEL = '1';

    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: {
                id: 'default',
                brand_name: 'Existing Brand',
                site_title: 'Existing Title',
                wallpaper: 'matrix',
                accent_color: '#0078D4',
                theme: 'dark',
                updated_at: new Date().toISOString(),
              },
              error: null,
            }),
          }),
        }),
        upsert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'default',
                brand_name: 'LivingYuji Production Test',
                site_title: 'LivingYuji OS',
                wallpaper: 'matrix',
                accent_color: '#0078D4',
                theme: 'dark',
                updated_at: new Date().toISOString(),
              },
              error: null,
            }),
          }),
        }),
      }),
    };

    mockCreateServiceClient.mockResolvedValue(mockSupabase);
    mockCreateServerClient.mockResolvedValue(mockSupabase);

    const writeFileSpy = jest.spyOn(fs, 'writeFile').mockImplementation(async () => {
      throw new Error("EROFS: read-only file system, open '/var/task/data/admin-store.json.1792953350241.tmp'");
    });

    const result = await saveSiteSettings({
      brand_name: 'LivingYuji Production Test',
      wallpaper: 'matrix',
    });

    expect(result.settings.brand_name).toBe('LivingYuji Production Test');
    expect(result.destination).toBe('supabase_production');
    expect(mockSupabase.from).toHaveBeenCalledWith('site_settings');
    expect(writeFileSpy).not.toHaveBeenCalled();

    writeFileSpy.mockRestore();
  });

  test('saveDiscordSettings saves to database and does not attempt filesystem write in serverless production', async () => {
    process.env.VERCEL = '1';

    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: {
                id: 'default',
                main_server_url: 'https://discord.gg/livingyuji',
                updated_at: new Date().toISOString(),
              },
              error: null,
            }),
          }),
        }),
        upsert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'default',
                main_server_url: 'https://discord.gg/livingyuji-prod-test',
                updated_at: new Date().toISOString(),
              },
              error: null,
            }),
          }),
        }),
      }),
    };

    mockCreateServiceClient.mockResolvedValue(mockSupabase);
    mockCreateServerClient.mockResolvedValue(mockSupabase);

    const writeFileSpy = jest.spyOn(fs, 'writeFile').mockImplementation(async () => {
      throw new Error("EROFS: read-only file system, open '/var/task/data/admin-store.json.1792953350241.tmp'");
    });

    const result = await saveDiscordSettings({
      main_server_url: 'https://discord.gg/livingyuji-prod-test',
    });

    expect(result.settings.main_server_url).toBe('https://discord.gg/livingyuji-prod-test');
    expect(result.destination).toBe('supabase_production');
    expect(mockSupabase.from).toHaveBeenCalledWith('discord_settings');
    expect(writeFileSpy).not.toHaveBeenCalled();

    writeFileSpy.mockRestore();
  });

  test('when database is unconfigured in production, throws clear error rather than attempting ephemeral file writes', async () => {
    process.env.VERCEL = '1';
    mockCreateServiceClient.mockResolvedValue(null);

    const writeFileSpy = jest.spyOn(fs, 'writeFile');

    await expect(
      saveSiteSettings({ brand_name: 'Test' })
    ).rejects.toThrow('Database connection is not configured in this production environment.');

    expect(writeFileSpy).not.toHaveBeenCalled();
    writeFileSpy.mockRestore();
  });
});
