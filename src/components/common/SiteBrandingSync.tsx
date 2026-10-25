'use client';

import { useEffect } from 'react';
import { useWindowStore } from '@/store/windowStore';

export function SiteBrandingSync() {
  const { settings, updateSettings } = useWindowStore();

  // 1. Fetch cloud site_settings on mount
  useEffect(() => {
    fetch('/api/admin/branding')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.settings) {
          const s = data.settings;
          const current = useWindowStore.getState().settings;
          
          updateSettings({
            brandName: s.brand_name || 'LivingYuji',
            siteTitle: s.site_title || 'LivingYuji OS — Windows-Inspired Web Operating System & Portfolio',
            wallpaper: s.wallpaper || current.wallpaper,
            accentColor: s.accent_color || current.accentColor,
            theme: s.theme || current.theme,
            customLogoUrl: s.custom_logo_url,
            customFaviconUrl: s.custom_favicon_url,
            ...(current.wallpaperType !== 'video' ? { customWallpaperUrl: s.custom_wallpaper_url } : {}),
          });
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
