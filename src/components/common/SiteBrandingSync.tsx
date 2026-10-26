'use client';

import { useEffect } from 'react';
import { useWindowStore, DEFAULT_PERMANENT_WALLPAPER_URL } from '@/store/windowStore';
import { detectIframeVideoSource } from '@/lib/validation/urls';

export function SiteBrandingSync() {
  const { settings, updateSettings } = useWindowStore();

  // 1. Fetch cloud site_settings on mount
  useEffect(() => {
    fetch('/api/admin/branding', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.settings) {
          const s = data.settings;
          const current = useWindowStore.getState().settings;
          
          // Non-wallpaper branding can always follow the cloud settings. The
          // wallpaper preset is handled below so an explicit visitor choice is
          // never overwritten while the four wallpaper columns hydrate.
          const updates: Record<string, unknown> = {
            brandName: s.brand_name || 'LivingYuji',
            siteTitle: s.site_title || 'LivingYuji OS â€” Windows-Inspired Web Operating System & Portfolio',
            accentColor: s.accent_color || current.accentColor,
            theme: s.theme || current.theme,
            customLogoUrl: s.custom_logo_url,
            customFaviconUrl: s.custom_favicon_url,
          };

          // Sync the four Phase B wallpaper fields only when the visitor has
          // not explicitly chosen a wallpaper. A failed fetch or missing
          // columns must never erase the currently valid wallpaper.
          const hasLocalPersonalWallpaper =
            current.wallpaperUserOverride === true ||
            current.videoWallpaperSource === 'local' ||
            Boolean(current.customVideoWallpaperUrl?.startsWith('local:')) ||
            Boolean(current.customWallpaperUrl?.startsWith('local:'));

          const hasVideoColumn = Object.prototype.hasOwnProperty.call(s, 'custom_video_wallpaper_url');
          const hasImageColumn = Object.prototype.hasOwnProperty.call(s, 'custom_wallpaper_url');

          if (!hasLocalPersonalWallpaper) {
            const videoUrl =
              hasVideoColumn && typeof s.custom_video_wallpaper_url === 'string'
                ? s.custom_video_wallpaper_url.trim()
                : '';
            const imageUrl =
              hasImageColumn && typeof s.custom_wallpaper_url === 'string'
                ? s.custom_wallpaper_url.trim()
                : '';
            const preset = typeof s.wallpaper === 'string' ? s.wallpaper.trim() : '';

            // Priority:
            // 1. Visitor explicit personal wallpaper (handled by hasLocalPersonalWallpaper above).
            // 2. Intentional admin-configured video override (if explicitly provided).
            // 3. Permanent default background: Cyberpunk City image (/wallpapers/cyberpunk-city.jpg).
            //    Legacy placeholder 'https://imgh.in/host/lhsorq' is superseded by the permanent asset.
            if (videoUrl) {
              updates.customVideoWallpaperUrl = videoUrl;
              updates.videoWallpaperSource = detectIframeVideoSource(videoUrl);
              updates.wallpaperType = 'video';
            } else {
              const activeImage =
                imageUrl && imageUrl !== 'https://imgh.in/host/lhsorq'
                  ? imageUrl
                  : DEFAULT_PERMANENT_WALLPAPER_URL;
              updates.customWallpaperUrl = activeImage;
              updates.wallpaperType = 'image';
              updates.videoWallpaperSource = null;
              updates.customVideoWallpaperUrl = null;
            }
            if (preset) {
              updates.wallpaper = preset;
            }

            if (typeof s.video_wallpaper_muted === 'boolean') {
              updates.videoWallpaperMuted = s.video_wallpaper_muted;
            }
            if (s.wallpaper_mode === 'cover' || s.wallpaper_mode === 'contain' || s.wallpaper_mode === 'tile') {
              updates.wallpaperMode = s.wallpaper_mode;
            }
            if (typeof s.wallpaper_opacity === 'number' && Number.isFinite(s.wallpaper_opacity)) {
              updates.wallpaperOpacity = Math.min(100, Math.max(0, Math.round(s.wallpaper_opacity)));
            }
          }

          updateSettings(updates);
        }
      })
      .catch(() => {
        // Fall back to stored settings
      });
  }, []);

  // 2. Reactively synchronize document title and favicon
  useEffect(() => {
    if (settings.siteTitle) {
      document.title = settings.siteTitle;
    }
    if (settings.customFaviconUrl) {
      let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'shortcut icon';
        document.head.appendChild(link);
      }
      link.href = `${settings.customFaviconUrl}?v=${Date.now()}`;
    }
  }, [settings.siteTitle, settings.customFaviconUrl]);

  return null;
}
