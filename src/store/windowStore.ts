import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppId =
  | 'thispc'
  | 'recyclebin'
  | 'browser'
  | 'paint'
  | 'music'
  | 'games'
  | 'store'
  | 'minecraftstore'
  | 'textviewer'
  | 'admin'
  | 'projects'
  | 'skills'
  | 'minecraft'
  | 'discord'
  | 'webdev'
  | 'setups'
  | 'services'
  | 'contact'
  | 'resume'
  | 'settings'
  | 'terminal'
  | 'about'
  | 'blog'
  | 'memorywall'
  | 'showcase'
  | 'notes'
  | 'tasks'
  | 'calendar'
  | 'calculator'
  | 'clipboard'
  | 'devstudio'
  | 'sysmonitor'
  | 'appstore';

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
  active: boolean;
  prevBounds?: { x: number; y: number; width: number; height: number };
  initialFolderId?: string; // for file explorer deep link
}

export type Wallpaper =
  | 'matrix'
  | 'cyber'
  | 'default'
  | 'ocean'
  | 'sunset'
  | 'forest'
  | 'dark';

export type WallpaperType = 'preset' | 'image' | 'video';
export type VideoWallpaperSource = 'local' | 'url' | 'iframe' | null;

export interface OSSettings {
  wallpaper: Wallpaper;
  wallpaperType?: WallpaperType;
  videoWallpaperSource?: VideoWallpaperSource;
  theme: 'dark' | 'light' | 'system';
  accentColor: string;
  reducedMotion: boolean;
  soundEnabled: boolean;
  iconSize: 'small' | 'medium' | 'large';
  showDesktopLabels: boolean;
  taskbarPosition: 'bottom';
  taskbarAlignment: 'center' | 'left';
  desktopIconMovement: boolean;
  brandName?: string;
  siteTitle?: string;
  customLogoUrl?: string | null;
  customFaviconUrl?: string | null;
  customWallpaperUrl?: string | null;
  customVideoWallpaperUrl?: string | null;
  videoWallpaperMuted?: boolean;
  wallpaperMode?: 'cover' | 'contain' | 'tile';
  wallpaperOpacity?: number;
  /**
   * True once this visitor explicitly chooses a wallpaper. Cloud branding
   * hydration must not replace that personal preference.
   */
  wallpaperUserOverride?: boolean;
}

interface WindowStore {
  windows: WindowState[];
  nextZIndex: number;
  settings: OSSettings;
  startMenuOpen: boolean;
  quickSettingsOpen: boolean;
  contextMenu: { x: number; y: number; target: 'desktop' | 'icon' | 'file'; data?: unknown } | null;
  altTabActive: boolean;
  altTabIndex: number;
  showDesktopActive: boolean;

  // Window actions
  openWindow: (appId: AppId, options?: { folderId?: string; title?: string }) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, width: number, height: number, x?: number, y?: number) => void;
  toggleMaximize: (id: string) => void;
  closeAllWindows: () => void;
  toggleShowDesktop: () => void;

  // Start & Quick Settings
  setStartMenuOpen: (open: boolean) => void;
  setQuickSettingsOpen: (open: boolean) => void;

  // Context menu
  setContextMenu: (menu: { x: number; y: number; target: 'desktop' | 'icon' | 'file'; data?: unknown } | null) => void;

  // Settings
  updateSettings: (settings: Partial<OSSettings>) => void;
  resetSettings: () => void;

  // Alt+Tab
  setAltTabActive: (active: boolean) => void;
  setAltTabIndex: (index: number) => void;
}

export const APP_CONFIGS: Record<AppId, { title: string; defaultWidth: number; defaultHeight: number; minWidth: number; minHeight: number; icon: string }> = {
  thispc: { title: 'This PC', defaultWidth: 920, defaultHeight: 620, minWidth: 540, minHeight: 380, icon: '💻' },
  recyclebin: { title: 'Recycle Bin', defaultWidth: 800, defaultHeight: 520, minWidth: 480, minHeight: 320, icon: '🗑️' },
  browser: { title: 'LivingYuji Browser', defaultWidth: 1040, defaultHeight: 680, minWidth: 600, minHeight: 420, icon: '🌐' },
  paint: { title: 'Paint', defaultWidth: 960, defaultHeight: 640, minWidth: 580, minHeight: 420, icon: '🎨' },
  music: { title: 'Music Lab', defaultWidth: 880, defaultHeight: 580, minWidth: 500, minHeight: 380, icon: '🎵' },
  games: { title: 'Games', defaultWidth: 920, defaultHeight: 640, minWidth: 520, minHeight: 400, icon: '🎮' },
  store: { title: 'LivingYuji Store', defaultWidth: 980, defaultHeight: 660, minWidth: 560, minHeight: 420, icon: '🛍️' },
  minecraftstore: { title: 'Minecraft Store', defaultWidth: 1040, defaultHeight: 680, minWidth: 600, minHeight: 440, icon: '⛏️' },
  textviewer: { title: 'Document Viewer', defaultWidth: 820, defaultHeight: 640, minWidth: 500, minHeight: 400, icon: '📄' },
  admin: { title: 'LivingYuji OS Admin Control Panel', defaultWidth: 1100, defaultHeight: 720, minWidth: 680, minHeight: 480, icon: '🛡️' },
  projects: { title: 'Projects Explorer', defaultWidth: 940, defaultHeight: 640, minWidth: 520, minHeight: 400, icon: '📁' },
  skills: { title: 'Developer Skills', defaultWidth: 840, defaultHeight: 580, minWidth: 460, minHeight: 360, icon: '⚡' },
  minecraft: { title: 'Minecraft Development', defaultWidth: 900, defaultHeight: 620, minWidth: 500, minHeight: 380, icon: '🟩' },
  discord: { title: 'Discord Development', defaultWidth: 900, defaultHeight: 620, minWidth: 500, minHeight: 380, icon: '💬' },
  webdev: { title: 'Web Development', defaultWidth: 900, defaultHeight: 620, minWidth: 500, minHeight: 380, icon: '💻' },
  setups: { title: 'Custom Setups', defaultWidth: 880, defaultHeight: 600, minWidth: 480, minHeight: 380, icon: '🔧' },
  services: { title: 'Services & Pricing', defaultWidth: 880, defaultHeight: 600, minWidth: 480, minHeight: 380, icon: '💼' },
  contact: { title: 'Contact LivingYuji', defaultWidth: 680, defaultHeight: 620, minWidth: 420, minHeight: 400, icon: '✉️' },
  resume: { title: 'Resume.txt', defaultWidth: 820, defaultHeight: 640, minWidth: 500, minHeight: 400, icon: '📄' },
  settings: { title: 'Settings', defaultWidth: 880, defaultHeight: 580, minWidth: 500, minHeight: 380, icon: '⚙️' },
  terminal: { title: 'Terminal', defaultWidth: 760, defaultHeight: 500, minWidth: 420, minHeight: 300, icon: '🖥️' },
  about: { title: 'Biography', defaultWidth: 920, defaultHeight: 640, minWidth: 580, minHeight: 440, icon: '👤' },
  blog: { title: 'Dev Blog & Notes', defaultWidth: 880, defaultHeight: 600, minWidth: 480, minHeight: 380, icon: '📝' },
  memorywall: { title: 'Memory Wall', defaultWidth: 840, defaultHeight: 580, minWidth: 460, minHeight: 360, icon: '💌' },
  showcase: { title: 'Showcase — LivingYuji Portfolio & Systems', defaultWidth: 1060, defaultHeight: 700, minWidth: 640, minHeight: 460, icon: '✨' },
  notes: { title: 'Notes', defaultWidth: 840, defaultHeight: 580, minWidth: 480, minHeight: 360, icon: '📝' },
  tasks: { title: 'Tasks', defaultWidth: 860, defaultHeight: 600, minWidth: 500, minHeight: 380, icon: '☑️' },
  calendar: { title: 'Calendar', defaultWidth: 880, defaultHeight: 620, minWidth: 520, minHeight: 400, icon: '📅' },
  calculator: { title: 'Calculator', defaultWidth: 360, defaultHeight: 520, minWidth: 320, minHeight: 460, icon: '🧮' },
  clipboard: { title: 'Clipboard Manager', defaultWidth: 540, defaultHeight: 520, minWidth: 400, minHeight: 360, icon: '📋' },
  devstudio: { title: 'Developer Studio', defaultWidth: 1040, defaultHeight: 680, minWidth: 640, minHeight: 440, icon: '💻' },
  sysmonitor: { title: 'System Monitor', defaultWidth: 840, defaultHeight: 580, minWidth: 500, minHeight: 380, icon: '📊' },
  appstore: { title: 'LivingYuji App Store', defaultWidth: 980, defaultHeight: 660, minWidth: 600, minHeight: 420, icon: '🏪' },
};

/**
 * Optional Streamable coding-video wallpaper. It is retained in state as a
 * fallback, but only renders when no image or preset wallpaper is available.
 */
export const STREAMABLE_FALLBACK_VIDEO_URL =
  'https://streamable.com/e/c51sit?autoplay=1&loop=1&muted=1&controls=0';

const DEFAULT_SETTINGS: OSSettings = {
  wallpaper: 'matrix',
  wallpaperType: 'preset',
  videoWallpaperSource: null,
  theme: 'dark',
  accentColor: '#1686DC',
  reducedMotion: false,
  soundEnabled: true,
  iconSize: 'medium',
  showDesktopLabels: true,
  taskbarPosition: 'bottom',
  taskbarAlignment: 'left',
  desktopIconMovement: true,
  brandName: 'LivingYuji',
  siteTitle: 'LivingYuji OS — Windows-Inspired Web Operating System & Portfolio',
  customLogoUrl: '/avatar.png',
  customFaviconUrl: '/favicon.png',
  customWallpaperUrl: null,
  customVideoWallpaperUrl: STREAMABLE_FALLBACK_VIDEO_URL,
  videoWallpaperMuted: true,
  wallpaperMode: 'cover',
  wallpaperOpacity: 85,
  wallpaperUserOverride: false,
};

const getInitialPos = (index: number, width: number, height: number) => {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 720;
  const taskbarH = 50;
  const cascade = (index % 6) * 28;
  const x = Math.max(24, Math.min((vw - width) / 2 + cascade - 40, vw - width - 24));
  const y = Math.max(20, Math.min((vh - taskbarH - height) / 2 + cascade - 20, vh - taskbarH - height - 20));
  return { x, y };
};

/**
 * Pure persist migration for the window store. Exported so the legacy-preset
 * behavior can be regression-tested without re-importing the whole store.
 */
export function migrateWindowStoreState(
  persistedState: unknown,
  version: number
): { settings?: Partial<OSSettings> } {
  const state = persistedState as { settings?: Partial<OSSettings> };
  // v0 stores predate explicit wallpaper tracking. Their preset/image
  // wallpaper is the default, so it is preserved and classified below.
  if (state.settings && version < 2) {
    const settings = state.settings;
    const explicitlyPersonal =
      settings.wallpaperUserOverride === true ||
      settings.videoWallpaperSource === 'local' ||
      Boolean(settings.customVideoWallpaperUrl?.startsWith('local:')) ||
      Boolean(settings.customWallpaperUrl?.startsWith('local:')) ||
      (Boolean(settings.customWallpaperUrl) && settings.wallpaperType === 'image') ||
      (Boolean(settings.wallpaper) && settings.wallpaper !== DEFAULT_SETTINGS.wallpaper) ||
      Boolean(
        settings.customVideoWallpaperUrl &&
          settings.customVideoWallpaperUrl !== DEFAULT_SETTINGS.customVideoWallpaperUrl
      );

    settings.wallpaperUserOverride = explicitlyPersonal;
  }

  return state;
}

export const useWindowStore = create<WindowStore>()(
  persist(
    (set, get) => ({
      windows: [],
      nextZIndex: 10,
      settings: DEFAULT_SETTINGS,
      startMenuOpen: false,
      quickSettingsOpen: false,
      contextMenu: null,
      altTabActive: false,
      altTabIndex: 0,
      showDesktopActive: false,

      openWindow: (appId, options) => {
        const { windows, nextZIndex } = get();
        const existing = windows.find((w) => w.appId === appId);

        if (existing) {
          set({
            windows: windows.map((w) =>
              w.id === existing.id
                ? {
                    ...w,
                    minimized: false,
                    active: true,
                    zIndex: nextZIndex,
                    ...(options?.folderId ? { initialFolderId: options.folderId } : {}),
                    ...(options?.title ? { title: options.title } : {}),
                  }
                : { ...w, active: false }
            ),
            nextZIndex: nextZIndex + 1,
            startMenuOpen: false,
            contextMenu: null,
          });
          return;
        }

        const config = APP_CONFIGS[appId] || {
          title: appId,
          defaultWidth: 800,
          defaultHeight: 540,
          minWidth: 400,
          minHeight: 300,
          icon: '📁',
        };

        const openCount = windows.filter((w) => !w.minimized).length;
        const { x, y } = getInitialPos(openCount, config.defaultWidth, config.defaultHeight);

        const newWin: WindowState = {
          id: `${appId}-${Date.now()}`,
          appId,
          title: options?.title || config.title,
          x,
          y,
          width: config.defaultWidth,
          height: config.defaultHeight,
          zIndex: nextZIndex,
          minimized: false,
          maximized: false,
          active: true,
          initialFolderId: options?.folderId,
        };

        set({
          windows: [...windows.map((w) => ({ ...w, active: false })), newWin],
          nextZIndex: nextZIndex + 1,
          startMenuOpen: false,
          contextMenu: null,
          showDesktopActive: false,
        });
      },

      closeWindow: (id) => {
        set((state) => ({
          windows: state.windows.filter((w) => w.id !== id),
        }));
      },

      minimizeWindow: (id) => {
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === id ? { ...w, minimized: true, active: false } : w
          ),
        }));
      },

      maximizeWindow: (id) => {
        const { windows, nextZIndex } = get();
        set({
          windows: windows.map((w) =>
            w.id === id
              ? {
                  ...w,
                  maximized: true,
                  active: true,
                  zIndex: nextZIndex,
                  prevBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
                }
              : { ...w, active: false }
          ),
          nextZIndex: nextZIndex + 1,
        });
      },

      restoreWindow: (id) => {
        const { windows, nextZIndex } = get();
        set({
          windows: windows.map((w) =>
            w.id === id
              ? {
                  ...w,
                  maximized: false,
                  minimized: false,
                  active: true,
                  zIndex: nextZIndex,
                  ...(w.prevBounds ? { x: w.prevBounds.x, y: w.prevBounds.y, width: w.prevBounds.width, height: w.prevBounds.height } : {}),
                }
              : { ...w, active: false }
          ),
          nextZIndex: nextZIndex + 1,
        });
      },

      focusWindow: (id) => {
        const { windows, nextZIndex } = get();
        set({
          windows: windows.map((w) =>
            w.id === id
              ? { ...w, active: true, minimized: false, zIndex: nextZIndex }
              : { ...w, active: false }
          ),
          nextZIndex: nextZIndex + 1,
          startMenuOpen: false,
        });
      },

      moveWindow: (id, x, y) => {
        set((state) => ({
          windows: state.windows.map((w) => (w.id === id ? { ...w, x, y } : w)),
        }));
      },

      resizeWindow: (id, width, height, x, y) => {
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === id
              ? { ...w, width, height, ...(x !== undefined ? { x } : {}), ...(y !== undefined ? { y } : {}) }
              : w
          ),
        }));
      },

      toggleMaximize: (id) => {
        const win = get().windows.find((w) => w.id === id);
        if (!win) return;
        if (win.maximized) {
          get().restoreWindow(id);
        } else {
          get().maximizeWindow(id);
        }
      },

      closeAllWindows: () => set({ windows: [] }),

      toggleShowDesktop: () => {
        const { windows, showDesktopActive } = get();
        if (showDesktopActive) {
          // Restore previously active
          set({
            windows: windows.map((w) => ({ ...w, minimized: false })),
            showDesktopActive: false,
          });
        } else {
          // Minimize all
          set({
            windows: windows.map((w) => ({ ...w, minimized: true, active: false })),
            showDesktopActive: true,
            startMenuOpen: false,
          });
        }
      },

      setStartMenuOpen: (open) => set({ startMenuOpen: open, contextMenu: null, quickSettingsOpen: false }),
      setQuickSettingsOpen: (open) => set({ quickSettingsOpen: open, startMenuOpen: false, contextMenu: null }),
      setContextMenu: (menu) => set({ contextMenu: menu, startMenuOpen: false, quickSettingsOpen: false }),

      updateSettings: (settings) =>
        set((state) => ({ settings: { ...state.settings, ...settings } })),

      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),

      setAltTabActive: (active) => set({ altTabActive: active }),
      setAltTabIndex: (index) => set({ altTabIndex: index }),
    }),
    {
      name: 'lyos-window-store',
      version: 2, // v2 tracks explicit visitor wallpaper preferences
      partialize: (state) => {
        const settings = { ...state.settings };
        // Never serialize temporary in-memory blob: URLs to localStorage
        if (settings.customVideoWallpaperUrl && settings.customVideoWallpaperUrl.startsWith('blob:')) {
          settings.customVideoWallpaperUrl = 'local:lyos_video_wallpaper_blob';
          settings.videoWallpaperSource = 'local';
        }
        if (settings.customWallpaperUrl && settings.customWallpaperUrl.startsWith('blob:')) {
          settings.customWallpaperUrl = 'local:lyos_image_wallpaper_blob';
        }
        return {
          settings,
        };
      },
      migrate: (persistedState: unknown, version: number) =>
        migrateWindowStoreState(persistedState, version),
    }
  )
);
