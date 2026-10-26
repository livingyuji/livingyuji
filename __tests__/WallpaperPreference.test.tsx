import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { migrateWindowStoreState, useWindowStore } from '@/store/windowStore';
import { SiteBrandingSync } from '@/components/common/SiteBrandingSync';

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: async () => body,
  } as Response;
}

describe('Visitor wallpaper preference hydration', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    useWindowStore.getState().resetSettings();
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  test('new stores default to the preset wallpaper with Streamable as fallback', () => {
    const settings = useWindowStore.getState().settings;
    expect(settings.wallpaperType).toBe('preset');
    expect(settings.wallpaper).toBe('matrix');
    expect(settings.customVideoWallpaperUrl).toContain('streamable.com');
    expect(settings.wallpaperUserOverride).toBe(false);
  });

  test('v0 migration preserves an untouched legacy preset instead of forcing video', () => {
    const migrated = migrateWindowStoreState(
      {
        settings: {
          wallpaper: 'matrix',
          wallpaperType: 'preset',
          customVideoWallpaperUrl: null,
          customWallpaperUrl: null,
        },
      },
      0
    );

    expect(migrated.settings?.wallpaperType).toBe('preset');
    expect(migrated.settings?.wallpaper).toBe('matrix');
    expect(migrated.settings?.videoWallpaperSource).toBe(undefined);
    expect(migrated.settings?.customVideoWallpaperUrl).toBeNull();
    expect(migrated.settings?.wallpaperUserOverride).toBe(false);
  });

  test('v0 migration preserves an explicit preset wallpaper', () => {
    const migrated = migrateWindowStoreState(
      {
        settings: {
          wallpaper: 'forest',
          wallpaperType: 'preset',
          customVideoWallpaperUrl: null,
          customWallpaperUrl: null,
        },
      },
      0
    );

    expect(migrated.settings?.wallpaper).toBe('forest');
    expect(migrated.settings?.wallpaperType).toBe('preset');
    expect(migrated.settings?.customVideoWallpaperUrl).toBeNull();
    expect(migrated.settings?.wallpaperUserOverride).toBe(true);
  });

  test('v0 migration preserves a custom image wallpaper', () => {
    const migrated = migrateWindowStoreState(
      {
        settings: {
          wallpaper: 'matrix',
          wallpaperType: 'image',
          customWallpaperUrl: 'https://cdn.example.com/my-wallpaper.jpg',
          customVideoWallpaperUrl: null,
        },
      },
      0
    );

    expect(migrated.settings?.customWallpaperUrl).toBe('https://cdn.example.com/my-wallpaper.jpg');
    expect(migrated.settings?.wallpaperType).toBe('image');
    expect(migrated.settings?.wallpaperUserOverride).toBe(true);
  });

  test('cloud branding never replaces an explicit preset wallpaper', async () => {
    useWindowStore.getState().updateSettings({
      wallpaper: 'forest',
      wallpaperType: 'preset',
      customWallpaperUrl: null,
      customVideoWallpaperUrl: null,
      wallpaperUserOverride: true,
    });

    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({
        success: true,
        settings: {
          brand_name: 'Cloud Brand',
          site_title: 'Cloud Title',
          wallpaper: 'ocean',
          custom_video_wallpaper_url: 'https://cdn.example.com/cloud-video.mp4',
          custom_wallpaper_url: 'https://cdn.example.com/cloud-image.jpg',
        },
      })
    );

    render(React.createElement(SiteBrandingSync));

    await waitFor(() => {
      expect(useWindowStore.getState().settings.brandName).toBe('Cloud Brand');
    });

    const settings = useWindowStore.getState().settings;
    expect(settings.wallpaper).toBe('forest');
    expect(settings.wallpaperType).toBe('preset');
    expect(settings.customWallpaperUrl).toBeNull();
    expect(settings.customVideoWallpaperUrl).toBeNull();
  });

  test('cloud branding never replaces an explicit visitor wallpaper choice', async () => {
    useWindowStore.getState().updateSettings({
      wallpaperType: 'video',
      videoWallpaperSource: 'iframe',
      customVideoWallpaperUrl: 'https://streamable.com/e/personal-choice',
      customWallpaperUrl: null,
      videoWallpaperMuted: true,
      wallpaperMode: 'cover',
      wallpaperOpacity: 85,
      wallpaperUserOverride: true,
      brandName: 'Local Brand',
    });

    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({
        success: true,
        settings: {
          brand_name: 'Cloud Brand',
          site_title: 'Cloud Title',
          custom_video_wallpaper_url: 'https://cdn.example.com/cloud-video.mp4',
          custom_wallpaper_url: 'https://cdn.example.com/cloud-image.jpg',
          video_wallpaper_muted: false,
          wallpaper_mode: 'contain',
          wallpaper_opacity: 40,
        },
      })
    );

    render(React.createElement(SiteBrandingSync));

    await waitFor(() => {
      expect(useWindowStore.getState().settings.brandName).toBe('Cloud Brand');
    });

    const settings = useWindowStore.getState().settings;
    expect(settings.customVideoWallpaperUrl).toBe('https://streamable.com/e/personal-choice');
    expect(settings.wallpaperType).toBe('video');
    expect(settings.videoWallpaperSource).toBe('iframe');
    expect(settings.videoWallpaperMuted).toBe(true);
    expect(settings.wallpaperMode).toBe('cover');
    expect(settings.wallpaperOpacity).toBe(85);
  });

  test('cloud image settings hydrate independently without erasing video fallback', async () => {
    const defaultSettings = useWindowStore.getState().settings;
    expect(defaultSettings.wallpaperUserOverride).toBe(false);

    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({
        success: true,
        settings: {
          brand_name: 'LivingYuji',
          site_title: 'LivingYuji OS',
          custom_video_wallpaper_url: null,
          custom_wallpaper_url: 'https://cdn.example.com/cloud-wallpaper.jpg',
          video_wallpaper_muted: false,
          wallpaper_mode: 'tile',
          wallpaper_opacity: 63,
        },
      })
    );

    render(React.createElement(SiteBrandingSync));

    await waitFor(() => {
      expect(useWindowStore.getState().settings.wallpaperType).toBe('image');
    });

    const settings = useWindowStore.getState().settings;
    expect(settings.customWallpaperUrl).toBe('https://cdn.example.com/cloud-wallpaper.jpg');
    expect(settings.customVideoWallpaperUrl).toBe(defaultSettings.customVideoWallpaperUrl);
    expect(settings.videoWallpaperSource).toBe(defaultSettings.videoWallpaperSource);
    expect(settings.videoWallpaperMuted).toBe(false);
    expect(settings.wallpaperMode).toBe('tile');
    expect(settings.wallpaperOpacity).toBe(63);
  });

  test('server-configured image wins over the Streamable video fallback', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({
        success: true,
        settings: {
          brand_name: 'LivingYuji',
          site_title: 'LivingYuji OS',
          wallpaper: 'matrix',
          custom_wallpaper_url: 'https://cdn.example.com/server-image.jpg',
          custom_video_wallpaper_url: 'https://streamable.com/e/server-fallback',
          video_wallpaper_muted: true,
        },
      })
    );

    render(React.createElement(SiteBrandingSync));

    await waitFor(() => {
      expect(useWindowStore.getState().settings.wallpaperType).toBe('image');
    });

    const settings = useWindowStore.getState().settings;
    expect(settings.customWallpaperUrl).toBe('https://cdn.example.com/server-image.jpg');
    expect(settings.customVideoWallpaperUrl).toBe('https://streamable.com/e/server-fallback');
    expect(settings.videoWallpaperSource).toBe('iframe');
  });

  test('server-configured preset wins over the Streamable video fallback', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({
        success: true,
        settings: {
          brand_name: 'LivingYuji',
          site_title: 'LivingYuji OS',
          wallpaper: 'forest',
          custom_wallpaper_url: null,
          custom_video_wallpaper_url: 'https://streamable.com/e/server-fallback',
          video_wallpaper_muted: true,
        },
      })
    );

    render(React.createElement(SiteBrandingSync));

    await waitFor(() => {
      expect(useWindowStore.getState().settings.wallpaper).toBe('forest');
    });

    const settings = useWindowStore.getState().settings;
    expect(settings.wallpaperType).toBe('preset');
    expect(settings.customVideoWallpaperUrl).toBe('https://streamable.com/e/server-fallback');
    expect(settings.videoWallpaperSource).toBe('iframe');
  });

  test('Streamable video is used when the server has no image or preset', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({
        success: true,
        settings: {
          brand_name: 'LivingYuji',
          site_title: 'LivingYuji OS',
          wallpaper: '',
          custom_wallpaper_url: null,
          custom_video_wallpaper_url: 'https://streamable.com/e/server-fallback',
          video_wallpaper_muted: true,
        },
      })
    );

    render(React.createElement(SiteBrandingSync));

    await waitFor(() => {
      expect(useWindowStore.getState().settings.wallpaperType).toBe('video');
    });

    const settings = useWindowStore.getState().settings;
    expect(settings.customVideoWallpaperUrl).toBe('https://streamable.com/e/server-fallback');
    expect(settings.videoWallpaperSource).toBe('iframe');
  });

  test('built-in Streamable fallback is retained when the server has no image or preset', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({
        success: true,
        settings: {
          brand_name: 'LivingYuji',
          site_title: 'LivingYuji OS',
          wallpaper: '',
          custom_wallpaper_url: null,
          custom_video_wallpaper_url: null,
          video_wallpaper_muted: true,
        },
      })
    );

    render(React.createElement(SiteBrandingSync));

    await waitFor(() => {
      expect(useWindowStore.getState().settings.wallpaperType).toBe('video');
    });

    const settings = useWindowStore.getState().settings;
    expect(settings.customVideoWallpaperUrl).toContain('streamable.com');
    expect(settings.videoWallpaperSource).toBe('iframe');
  });

  test('older schemas without wallpaper columns preserve the configured fallback', async () => {
    const before = useWindowStore.getState().settings;

    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({
        success: true,
        settings: {
          brand_name: 'LivingYuji',
          site_title: 'LivingYuji OS',
          wallpaper: 'matrix',
          accent_color: '#0078D4',
          theme: 'dark',
        },
      })
    );

    render(React.createElement(SiteBrandingSync));

    await waitFor(() => {
      expect(useWindowStore.getState().settings.brandName).toBe('LivingYuji');
    });

    const after = useWindowStore.getState().settings;
    expect(after.wallpaperType).toBe(before.wallpaperType);
    expect(after.customVideoWallpaperUrl).toBe(before.customVideoWallpaperUrl);
    expect(after.videoWallpaperSource).toBe(before.videoWallpaperSource);
    expect(after.customWallpaperUrl).toBe(before.customWallpaperUrl);
  });

  test('a failed branding request does not alter the current wallpaper', async () => {
    const before = useWindowStore.getState().settings;
    (global.fetch as jest.Mock).mockRejectedValue(new Error('network unavailable'));

    render(React.createElement(SiteBrandingSync));
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    const after = useWindowStore.getState().settings;
    expect(after.wallpaperType).toBe(before.wallpaperType);
    expect(after.customVideoWallpaperUrl).toBe(before.customVideoWallpaperUrl);
    expect(after.customWallpaperUrl).toBe(before.customWallpaperUrl);
  });
});
