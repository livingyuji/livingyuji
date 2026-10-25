import fs from 'fs/promises';
import path from 'path';
import { createServerClient, createServiceClient } from '@/lib/supabase/server';

export interface SiteSettingsRecord {
  id: string;
  brand_name: string;
  site_title: string;
  wallpaper: string;
  accent_color: string;
  theme: string;
  custom_logo_url?: string | null;
  custom_favicon_url?: string | null;
  custom_wallpaper_url?: string | null;
  custom_video_wallpaper_url?: string | null;
  video_wallpaper_muted?: boolean;
  wallpaper_mode?: string;
  wallpaper_opacity?: number;
  updated_at: string;
}

export interface DiscordSettingsRecord {
  id: string;
  main_server_url: string;
  purchase_support_url: string;
  minecraft_products_url: string;
  web_development_url: string;
  discord_bots_url: string;
  server_setups_url: string;
  resource_packs_url: string;
  fallback_url: string;
  button_label_store: string;
  button_label_minecraft: string;
  button_label_services: string;
  purchase_instructions: string;
  updated_at: string;
}

export interface ShowcaseProjectRecord {
  id: string;
  title: string;
  slug: string;
  category_id: string;
  summary: string;
  description: string;
  features: string[];
  technologies: string[];
  status: string;
  featured: boolean;
  is_free: boolean;
  price: number;
  version: string;
  gradient_bg: string;
  icon_symbol: string;
  links: Record<string, any>;
  compatibility?: Record<string, any>;
  screenshots?: string[];
  changelog?: any;
  install_guide?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MinecraftProductRecord {
  id: string;
  name: string;
  category: string;
  category_name: string;
  short_desc: string;
  full_desc: string;
  price: number;
  is_free: boolean;
  version: string;
  mc_versions: string[];
  server_software: string[];
  dependencies: string[];
  features: string[];
  installation_steps: string[];
  changelog: string;
  file_format: string;
  file_size: string;
  creator: string;
  published: boolean;
  featured: boolean;
  rating: number;
  downloads_count: number;
  icon_bg: string;
  icon_symbol: string;
  download_url?: string | null;
  direct_file_path?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MusicTrackRecord {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  duration_sec: number;
  genre: string;
  description?: string;
  tags?: string[];
  audio_url: string;
  cover_url?: string | null;
  cover_gradient?: string;
  published: boolean;
  featured: boolean;
  track_order: number;
  file_format: string;
  file_size?: string;
  created_at: string;
  updated_at: string;
}

export interface MediaAssetRecord {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: string;
  created_at: string;
}

export interface AdminStoreData {
  site_settings: SiteSettingsRecord;
  discord_settings: DiscordSettingsRecord;
  showcase_projects: ShowcaseProjectRecord[];
  minecraft_products: MinecraftProductRecord[];
  music_tracks: MusicTrackRecord[];
  media_assets: MediaAssetRecord[];
}

const DEFAULT_STORE: AdminStoreData = {
  site_settings: {
    id: 'default',
    brand_name: 'LivingYuji',
    site_title: 'LivingYuji OS — Windows-Inspired Web Operating System & Portfolio',
    wallpaper: 'matrix',
    accent_color: '#0078D4',
    theme: 'dark',
    custom_logo_url: '/avatar.png',
    custom_favicon_url: '/favicon.png',
    custom_wallpaper_url: null,
    custom_video_wallpaper_url: null,
    video_wallpaper_muted: true,
    wallpaper_mode: 'cover',
    wallpaper_opacity: 85,
    updated_at: '2026-10-25T00:00:00Z',
  },
  discord_settings: {
    id: 'default',
    main_server_url: 'https://discord.gg/livingyuji',
    purchase_support_url: 'https://discord.gg/livingyuji',
    minecraft_products_url: 'https://discord.gg/livingyuji',
    web_development_url: 'https://discord.gg/livingyuji',
    discord_bots_url: 'https://discord.gg/livingyuji',
    server_setups_url: 'https://discord.gg/livingyuji',
    resource_packs_url: 'https://discord.gg/livingyuji',
    fallback_url: 'https://discord.gg/livingyuji',
    button_label_store: 'Order via Discord',
    button_label_minecraft: 'Buy on Discord',
    button_label_services: 'Inquire on Discord',
    purchase_instructions:
      '1. Join the LivingYuji Discord server.\n2. Navigate to the #orders or #tickets channel.\n3. Mention the product code or name to open an order ticket.\n4. LivingYuji or our automated assistant will verify payment & deliver your asset instantly.',
    updated_at: '2026-10-25T00:00:00Z',
  },
  showcase_projects: [
    {
      id: 'proj-livingyuji-os',
      title: 'LivingYuji OS',
      slug: 'livingyuji-os',
      category_id: 'web-apps',
      summary: 'Browser-based Windows desktop operating system, portfolio and media workspace.',
      description:
        'LivingYuji OS is an interactive web desktop operating system built with Next.js 14, React 18, and TypeScript. Features a window manager with drag, resize, maximize/minimize, a virtual NTFS filesystem with C: and D: drives, text viewer, Paint canvas, digital stores, matrix background synthesizers, and seamless Discord purchasing coordination.',
      features: [
        'Interactive Windows 11 window manager with boundary clamping & Z-index stacking',
        'Virtual NTFS File System supporting C: and D: drives',
        'Built-in Document Viewer with safe link detection',
        'Admin control console with Supabase cloud synchronisation & persistent local storage',
        'Matrix rain phosphor canvas & synthesizer workstation',
      ],
      technologies: ['Next.js 14', 'React 18', 'TypeScript', 'Tailwind CSS', 'Zustand', 'Supabase'],
      status: 'Released',
      featured: true,
      is_free: true,
      price: 0,
      version: 'v2.5',
      gradient_bg: 'from-blue-600 via-sky-700 to-indigo-900',
      icon_symbol: '💻',
      links: {
        liveDemo: 'https://livingyuji.com',
        github: 'https://github.com/livingyuji/livingyuji',
      },
      screenshots: ['/screenshots/desktop.png'],
      created_at: '2026-10-25T00:00:00Z',
      updated_at: '2026-10-25T00:00:00Z',
    },
    {
      id: 'proj-arcane-arsenal',
      title: 'ArcaneArsenal — Magical Weapons Engine',
      slug: 'arcane-arsenal',
      category_id: 'mc-plugins',
      summary: 'Production-grade custom weapon framework with 10+ arcane items, particle raycasting & sound FX.',
      description:
        'ArcaneArsenal is a high-performance custom weapon system built for Paper and Purpur servers. Features 10+ mythical weapons with raycasted particle beams, sound FX, cooldown management, and complete CustomModelData support for resource packs.',
      features: [
        '10+ unique weapons (Voidwalker Scythe, Sunfire Blade, Tempest Bow, etc.)',
        'Zero-lag asynchronous particle raycasting math',
        'Full CustomModelData compatibility for 3D resource packs',
        'YAML configuration for damage, cooldowns, and sound pitches',
        'Paper & Purpur 1.21.4 native compatibility',
      ],
      technologies: ['Java 21', 'PaperMC API', 'Purpur API', 'CustomModelData', 'YAML'],
      status: 'Released',
      featured: true,
      is_free: true,
      price: 0,
      version: 'v1.4.2',
      gradient_bg: 'from-purple-700 via-indigo-800 to-slate-900',
      icon_symbol: '⚔️',
      links: {
        github: 'https://github.com/livingyuji/livingyuji',
      },
      screenshots: [],
      created_at: '2026-10-25T00:00:00Z',
      updated_at: '2026-10-25T00:00:00Z',
    },
  ],
  minecraft_products: [
    {
      id: 'prod-arcane-arsenal',
      name: 'ArcaneArsenal — Magical Weapons Engine',
      category: 'weapons',
      category_name: 'Custom Weapons & Abilities',
      short_desc: '10+ arcane weapons with particle rays, sound design & custom model data integration.',
      full_desc:
        'ArcaneArsenal is a production-grade custom weapon system built for Paper and Purpur servers. Features 10+ mythical weapons with raycasted particle beams, sound FX, cooldown management, and complete CustomModelData support for resource packs.',
      price: 0,
      is_free: true,
      version: 'v1.4.2',
      mc_versions: ['1.21.4', '1.21.1', '1.20.4'],
      server_software: ['Purpur', 'Paper', 'Folia'],
      dependencies: ['ProtocolLib', 'PlaceholderAPI (Optional)'],
      features: [
        '10+ mythical weapons (Solar Bow, Void Blade, Storm Wand, Arcane Scythe)',
        'Raycast projectile physics and particle trail effects',
        'Configurable mana, cooldowns, and damage multipliers',
        'Custom Model Data integration ready',
      ],
      installation_steps: [
        'Download ArcaneArsenal-v1.4.2.jar',
        'Place into plugins/ directory',
        'Restart server',
      ],
      changelog: 'v1.4.2 — Added Paper 1.21.4 support.',
      file_format: '.jar',
      file_size: '412 KB',
      creator: 'LivingYuji',
      published: true,
      featured: true,
      rating: 5.0,
      downloads_count: 1420,
      icon_bg: 'from-indigo-600 to-purple-800',
      icon_symbol: '⚔️',
      download_url: 'https://discord.gg/livingyuji',
      created_at: '2026-10-25T00:00:00Z',
      updated_at: '2026-10-25T00:00:00Z',
    },
    {
      id: 'prod-vanta-combat',
      name: 'VantaCombat — High-Tickrate PvP Suite',
      category: 'plugins',
      category_name: 'Plugins',
      short_desc: 'Instant hit registration, smooth knockback tuning & anti-combat log system.',
      full_desc:
        'VantaCombat re-engineers melee and projectile combat for high-stakes PvP servers. Eliminates missed hit-ticks, offers custom knockback profiles, action-bar combat tagging, and graceful combat logging protection.',
      price: 0,
      is_free: true,
      version: 'v2.1.0',
      mc_versions: ['1.21.4', '1.21.1', '1.20.4', '1.19.4'],
      server_software: ['Purpur', 'Paper', 'Velocity'],
      dependencies: ['None (Self-contained)'],
      features: [
        'Zero-delay hit registration pipeline',
        'Custom knockback physics (horizontal, vertical multipliers)',
        'Action-bar combat tagging timer',
      ],
      installation_steps: [
        'Download VantaCombat-v2.1.0.jar',
        'Put in /plugins directory and restart server',
      ],
      changelog: 'v2.1.0 — 1.21.4 update with sound feedback.',
      file_format: '.jar',
      file_size: '320 KB',
      creator: 'LivingYuji',
      published: true,
      featured: true,
      rating: 4.9,
      downloads_count: 890,
      icon_bg: 'from-blue-600 to-cyan-800',
      icon_symbol: '⚡',
      download_url: 'https://discord.gg/livingyuji',
      created_at: '2026-10-25T00:00:00Z',
      updated_at: '2026-10-25T00:00:00Z',
    },
  ],
  music_tracks: [
    {
      id: 'track-c1',
      title: 'Frostbite Protocol',
      artist: 'LivingYuji',
      album: 'Christmas 2025: New Tales',
      duration: '2:45',
      duration_sec: 165,
      genre: 'Cyber Lo-Fi',
      description: 'Atmospheric winter lo-fi chords and festive midnight synth rhythms.',
      tags: ['cyber', 'lo-fi', 'winter', 'chill'],
      audio_url: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
      cover_gradient: 'from-teal-500 to-emerald-600',
      published: true,
      featured: true,
      track_order: 1,
      file_format: 'mp3',
      file_size: '2.5 MB',
      created_at: '2026-10-20T00:00:00Z',
      updated_at: '2026-10-20T00:00:00Z',
    },
    {
      id: 'track-c2',
      title: 'Snowfall Synthwave',
      artist: 'LivingYuji',
      album: 'Christmas 2025: New Tales',
      duration: '3:12',
      duration_sec: 192,
      genre: 'Synthwave',
      description: 'Chilled pentatonic arpeggios designed for nocturnal coding sessions.',
      tags: ['synthwave', 'arpeggio', 'chill'],
      audio_url: 'https://assets.mixkit.co/music/preview/mixkit-cyber-punk-synth-chords-and-drums-113.mp3',
      cover_gradient: 'from-cyan-500 to-blue-600',
      published: true,
      featured: false,
      track_order: 2,
      file_format: 'mp3',
      file_size: '2.9 MB',
      created_at: '2026-10-20T00:00:00Z',
      updated_at: '2026-10-20T00:00:00Z',
    },
    {
      id: 'track-f1',
      title: 'Cyber Drift',
      artist: 'LivingYuji',
      album: 'Famous Songs & Soundtracks',
      duration: '2:45',
      duration_sec: 165,
      genre: 'Electronic',
      description: 'Minecraft trailer soundtrack with pulsing basslines.',
      tags: ['soundtrack', 'trailer', 'bass'],
      audio_url: 'https://assets.mixkit.co/music/preview/mixkit-driving-ambition-32.mp3',
      cover_gradient: 'from-purple-500 to-indigo-600',
      published: true,
      featured: true,
      track_order: 3,
      file_format: 'mp3',
      file_size: '2.4 MB',
      created_at: '2026-10-21T00:00:00Z',
      updated_at: '2026-10-21T00:00:00Z',
    },
    {
      id: 'track-l1',
      title: 'Coffee & Redstone',
      artist: 'LivingYuji',
      album: 'Loop 420: Infinite Beats',
      duration: '2:55',
      duration_sec: 175,
      genre: 'Lo-Fi Chillhop',
      description: 'Endless lo-fi chillhop loop for deep work and bug hunting.',
      tags: ['lo-fi', 'beats', 'coding', 'study'],
      audio_url: 'https://assets.mixkit.co/music/preview/mixkit-chill-bro-494.mp3',
      cover_gradient: 'from-amber-500 to-orange-600',
      published: true,
      featured: false,
      track_order: 4,
      file_format: 'mp3',
      file_size: '2.6 MB',
      created_at: '2026-10-22T00:00:00Z',
      updated_at: '2026-10-22T00:00:00Z',
    },
  ],
  media_assets: [
    {
      id: 'media-logo',
      name: 'livingyuji-emblem.svg',
      url: '/icons/logo.svg',
      type: 'icon',
      size: '12 KB',
      created_at: '2026-10-20',
    },
    {
      id: 'media-favicon',
      name: 'favicon.ico',
      url: '/favicon.ico',
      type: 'icon',
      size: '15 KB',
      created_at: '2026-10-20',
    },
    {
      id: 'media-wallpaper-matrix',
      name: 'wallpaper-matrix.png',
      url: '/wallpapers/matrix.png',
      type: 'image',
      size: '1.4 MB',
      created_at: '2026-10-22',
    },
    {
      id: 'media-wallpaper-cyber',
      name: 'wallpaper-cyber.png',
      url: '/wallpapers/cyber.png',
      type: 'image',
      size: '2.1 MB',
      created_at: '2026-10-22',
    },
  ],
};

function getStoreFilePath(): string {
  return path.join(process.cwd(), 'data', 'admin-store.json');
}

/**
 * Loads the local JSON persistent storage file with automatic fallback initialization
 */
export async function getLocalStore(): Promise<AdminStoreData> {
  const filePath = getStoreFilePath();
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      site_settings: parsed.site_settings || DEFAULT_STORE.site_settings,
      discord_settings: parsed.discord_settings || DEFAULT_STORE.discord_settings,
      showcase_projects: Array.isArray(parsed.showcase_projects) ? parsed.showcase_projects : DEFAULT_STORE.showcase_projects,
      minecraft_products: Array.isArray(parsed.minecraft_products) ? parsed.minecraft_products : DEFAULT_STORE.minecraft_products,
      music_tracks: Array.isArray(parsed.music_tracks) ? parsed.music_tracks : DEFAULT_STORE.music_tracks,
      media_assets: Array.isArray(parsed.media_assets) ? parsed.media_assets : DEFAULT_STORE.media_assets,
    };
  } catch {
    // Initialize file on disk if missing or invalid
    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(DEFAULT_STORE, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Unable to write initial admin-store.json:', err);
    }
    return DEFAULT_STORE;
  }
}

/**
 * Persists updated store data to disk atomically
 */
export async function saveLocalStore(data: AdminStoreData): Promise<void> {
  const filePath = getStoreFilePath();
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  const tempPath = `${filePath}.${Date.now()}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tempPath, filePath);
}

// ====================================================================
// 1. SITE SETTINGS PERSISTENCE
// ====================================================================

export async function getSiteSettings(): Promise<{ settings: SiteSettingsRecord; source: 'supabase' | 'local_persistent' }> {
  try {
    const supabase = await createServerClient();
    if (supabase) {
      const { data, error } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
      if (!error && data) {
        return { settings: data, source: 'supabase' };
      }
    }
  } catch (err) {
    console.warn('Supabase getSiteSettings error:', err);
  }

  const local = await getLocalStore();
  return { settings: local.site_settings, source: 'local_persistent' };
}

export async function saveSiteSettings(updates: Partial<SiteSettingsRecord>): Promise<{
  settings: SiteSettingsRecord;
  destination: 'supabase_and_local' | 'local_persistent';
  warning?: string;
}> {
  const local = await getLocalStore();
  const merged: SiteSettingsRecord = {
    ...local.site_settings,
    ...updates,
    id: 'default',
    updated_at: new Date().toISOString(),
  };

  // Always persist locally
  local.site_settings = merged;
  await saveLocalStore(local);

  // Attempt Supabase sync if service client is available
  try {
    const supabase = await createServiceClient();
    if (supabase) {
      const { data, error } = await supabase.from('site_settings').upsert(merged).select().single();
      if (!error && data) {
        return { settings: data, destination: 'supabase_and_local' };
      }
      return {
        settings: merged,
        destination: 'local_persistent',
        warning: `Saved locally. Supabase error: ${error?.message || 'Unknown'}`,
      };
    }
  } catch (err: any) {
    return {
      settings: merged,
      destination: 'local_persistent',
      warning: `Saved locally. Cloud service error: ${err.message}`,
    };
  }

  return { settings: merged, destination: 'local_persistent' };
}

// ====================================================================
// 2. DISCORD SETTINGS PERSISTENCE
// ====================================================================

export async function getDiscordSettings(): Promise<{ settings: DiscordSettingsRecord; source: 'supabase' | 'local_persistent' }> {
  try {
    const supabase = await createServerClient();
    if (supabase) {
      const { data, error } = await supabase.from('discord_settings').select('*').limit(1).maybeSingle();
      if (!error && data) {
        return { settings: data, source: 'supabase' };
      }
    }
  } catch (err) {
    console.warn('Supabase getDiscordSettings error:', err);
  }

  const local = await getLocalStore();
  return { settings: local.discord_settings, source: 'local_persistent' };
}

export async function saveDiscordSettings(updates: Partial<DiscordSettingsRecord>): Promise<{
  settings: DiscordSettingsRecord;
  destination: 'supabase_and_local' | 'local_persistent';
  warning?: string;
}> {
  const local = await getLocalStore();
  const merged: DiscordSettingsRecord = {
    ...local.discord_settings,
    ...updates,
    id: 'default',
    updated_at: new Date().toISOString(),
  };

  local.discord_settings = merged;
  await saveLocalStore(local);

  try {
    const supabase = await createServiceClient();
    if (supabase) {
      const { data, error } = await supabase.from('discord_settings').upsert(merged).select().single();
      if (!error && data) {
        return { settings: data, destination: 'supabase_and_local' };
      }
      return {
        settings: merged,
        destination: 'local_persistent',
        warning: `Saved locally. Supabase error: ${error?.message || 'Unknown'}`,
      };
    }
  } catch (err: any) {
    return {
      settings: merged,
      destination: 'local_persistent',
      warning: `Saved locally. Cloud service error: ${err.message}`,
    };
  }

  return { settings: merged, destination: 'local_persistent' };
}

// ====================================================================
// 3. SHOWCASE PROJECTS PERSISTENCE
// ====================================================================

export async function getShowcaseProjects(): Promise<{ projects: ShowcaseProjectRecord[]; source: 'supabase' | 'local_persistent' }> {
  try {
    const supabase = await createServerClient();
    if (supabase) {
      const { data, error } = await supabase.from('showcase_projects').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return { projects: data, source: 'supabase' };
      }
    }
  } catch (err) {
    console.warn('Supabase getShowcaseProjects error:', err);
  }

  const local = await getLocalStore();
  return { projects: local.showcase_projects, source: 'local_persistent' };
}

export async function saveShowcaseProject(project: Partial<ShowcaseProjectRecord>): Promise<{
  project: ShowcaseProjectRecord;
  destination: 'supabase_and_local' | 'local_persistent';
  warning?: string;
}> {
  const local = await getLocalStore();
  const id = project.id || `proj-${Date.now()}`;
  const now = new Date().toISOString();

  const record: ShowcaseProjectRecord = {
    id,
    title: project.title || 'Untitled Project',
    slug:
      project.slug ||
      (project.title || 'untitled')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, ''),
    category_id: project.category_id || 'web-apps',
    summary: project.summary || '',
    description: project.description || '',
    features: Array.isArray(project.features) ? project.features : [],
    technologies: Array.isArray(project.technologies) ? project.technologies : [],
    status: project.status || 'Released',
    featured: project.featured === true,
    is_free: project.is_free !== false,
    price: typeof project.price === 'number' ? project.price : Number(project.price) || 0,
    version: project.version || 'v1.0.0',
    gradient_bg: project.gradient_bg || 'from-blue-600 to-indigo-900',
    icon_symbol: project.icon_symbol || '⚡',
    links: project.links || {},
    compatibility: project.compatibility || {},
    screenshots: Array.isArray(project.screenshots) ? project.screenshots : [],
    changelog: project.changelog || [],
    install_guide: project.install_guide || null,
    created_at: project.created_at || now,
    updated_at: now,
  };

  const existingIdx = local.showcase_projects.findIndex((p) => p.id === id);
  if (existingIdx >= 0) {
    local.showcase_projects[existingIdx] = record;
  } else {
    local.showcase_projects.unshift(record);
  }
  await saveLocalStore(local);

  try {
    const supabase = await createServiceClient();
    if (supabase) {
      const { data, error } = await supabase.from('showcase_projects').upsert(record).select().single();
      if (!error && data) {
        return { project: data, destination: 'supabase_and_local' };
      }
      return {
        project: record,
        destination: 'local_persistent',
        warning: `Saved locally. Supabase error: ${error?.message || 'Unknown'}`,
      };
    }
  } catch (err: any) {
    return {
      project: record,
      destination: 'local_persistent',
      warning: `Saved locally. Cloud service error: ${err.message}`,
    };
  }

  return { project: record, destination: 'local_persistent' };
}

export async function deleteShowcaseProject(id: string): Promise<{ success: boolean; error?: string }> {
  const local = await getLocalStore();
  local.showcase_projects = local.showcase_projects.filter((p) => p.id !== id);
  await saveLocalStore(local);

  try {
    const supabase = await createServiceClient();
    if (supabase) {
      await supabase.from('showcase_projects').delete().eq('id', id);
    }
  } catch (err: any) {
    console.warn('Supabase deleteShowcaseProject error:', err.message);
  }

  return { success: true };
}

// ====================================================================
// 4. MINECRAFT PRODUCTS PERSISTENCE
// ====================================================================

export async function getMinecraftProducts(): Promise<{ products: MinecraftProductRecord[]; source: 'supabase' | 'local_persistent' }> {
  try {
    const supabase = await createServerClient();
    if (supabase) {
      const { data, error } = await supabase.from('minecraft_products').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return { products: data, source: 'supabase' };
      }
    }
  } catch (err) {
    console.warn('Supabase getMinecraftProducts error:', err);
  }

  const local = await getLocalStore();
  return { products: local.minecraft_products, source: 'local_persistent' };
}

export async function saveMinecraftProduct(product: Partial<MinecraftProductRecord>): Promise<{
  product: MinecraftProductRecord;
  destination: 'supabase_and_local' | 'local_persistent';
  warning?: string;
}> {
  const local = await getLocalStore();
  const id = product.id || `prod-${Date.now()}`;
  const now = new Date().toISOString();

  const record: MinecraftProductRecord = {
    id,
    name: (product.name || 'Untitled Resource').trim(),
    category: product.category || 'plugins',
    category_name: product.category_name || 'Plugins',
    short_desc: product.short_desc || '',
    full_desc: product.full_desc || '',
    price: typeof product.price === 'number' ? product.price : Number(product.price) || 0,
    is_free: product.is_free !== false && (product.price === 0 || !product.price),
    version: product.version || 'v1.0.0',
    mc_versions: Array.isArray(product.mc_versions) ? product.mc_versions : ['1.21.4'],
    server_software: Array.isArray(product.server_software) ? product.server_software : ['Paper', 'Purpur'],
    dependencies: Array.isArray(product.dependencies) ? product.dependencies : [],
    features: Array.isArray(product.features) ? product.features : [],
    installation_steps: Array.isArray(product.installation_steps) ? product.installation_steps : [],
    changelog: product.changelog || '',
    file_format: product.file_format || '.jar',
    file_size: product.file_size || '1 MB',
    creator: product.creator || 'LivingYuji',
    published: product.published !== false,
    featured: product.featured === true,
    rating: typeof product.rating === 'number' ? product.rating : 5.0,
    downloads_count: typeof product.downloads_count === 'number' ? product.downloads_count : 0,
    icon_bg: product.icon_bg || 'from-blue-600 to-indigo-900',
    icon_symbol: product.icon_symbol || '⚡',
    download_url: product.download_url || null,
    direct_file_path: product.direct_file_path || null,
    created_at: product.created_at || now,
    updated_at: now,
  };

  const existingIdx = local.minecraft_products.findIndex((p) => p.id === id);
  if (existingIdx >= 0) {
    local.minecraft_products[existingIdx] = record;
  } else {
    local.minecraft_products.unshift(record);
  }
  await saveLocalStore(local);

  try {
    const supabase = await createServiceClient();
    if (supabase) {
      const { data, error } = await supabase.from('minecraft_products').upsert(record).select().single();
      if (!error && data) {
        return { product: data, destination: 'supabase_and_local' };
      }
      return {
        product: record,
        destination: 'local_persistent',
        warning: `Saved locally. Supabase error: ${error?.message || 'Unknown'}`,
      };
    }
  } catch (err: any) {
    return {
      product: record,
      destination: 'local_persistent',
      warning: `Saved locally. Cloud service error: ${err.message}`,
    };
  }

  return { product: record, destination: 'local_persistent' };
}

export async function deleteMinecraftProduct(id: string): Promise<{ success: boolean; error?: string }> {
  const local = await getLocalStore();
  local.minecraft_products = local.minecraft_products.filter((p) => p.id !== id);
  await saveLocalStore(local);

  try {
    const supabase = await createServiceClient();
    if (supabase) {
      await supabase.from('minecraft_products').delete().eq('id', id);
    }
  } catch (err: any) {
    console.warn('Supabase deleteMinecraftProduct error:', err.message);
  }

  return { success: true };
}

// ====================================================================
// 5. MUSIC TRACKS PERSISTENCE
// ====================================================================

export async function getMusicTracks(isAdmin: boolean): Promise<{ tracks: MusicTrackRecord[]; source: 'supabase' | 'local_persistent' }> {
  try {
    const supabase = await createServerClient();
    if (supabase) {
      let query = supabase.from('music_tracks').select('*').order('track_order', { ascending: true });
      if (!isAdmin) {
        query = query.eq('published', true);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return { tracks: data, source: 'supabase' };
      }
    }
  } catch (err) {
    console.warn('Supabase getMusicTracks error:', err);
  }

  const local = await getLocalStore();
  const filtered = isAdmin ? local.music_tracks : local.music_tracks.filter((t) => t.published);
  return { tracks: filtered, source: 'local_persistent' };
}

export async function saveMusicTrack(track: Partial<MusicTrackRecord>): Promise<{
  track: MusicTrackRecord;
  destination: 'supabase_and_local' | 'local_persistent';
  warning?: string;
}> {
  const local = await getLocalStore();
  const id = track.id || `track-${Date.now()}`;
  const now = new Date().toISOString();

  const record: MusicTrackRecord = {
    id,
    title: (track.title || 'Untitled Track').trim(),
    artist: (track.artist || 'LivingYuji').trim(),
    album: (track.album || 'Single & Releases').trim(),
    duration: track.duration || '3:00',
    duration_sec: Number(track.duration_sec) || 180,
    genre: track.genre || 'Cyber Lo-Fi',
    description: track.description || '',
    tags: Array.isArray(track.tags) ? track.tags : [],
    audio_url: track.audio_url || '',
    cover_url: track.cover_url || null,
    cover_gradient: track.cover_gradient || 'from-emerald-900 via-teal-950 to-slate-950',
    published: track.published !== false,
    featured: track.featured === true,
    track_order: Number(track.track_order) || 99,
    file_format: (track.file_format || 'mp3').toLowerCase(),
    file_size: track.file_size || '3 MB',
    created_at: track.created_at || now,
    updated_at: now,
  };

  const existingIdx = local.music_tracks.findIndex((t) => t.id === id);
  if (existingIdx >= 0) {
    local.music_tracks[existingIdx] = record;
  } else {
    local.music_tracks.push(record);
  }
  await saveLocalStore(local);

  try {
    const supabase = await createServiceClient();
    if (supabase) {
      const { data, error } = await supabase.from('music_tracks').upsert(record).select().single();
      if (!error && data) {
        return { track: data, destination: 'supabase_and_local' };
      }
      return {
        track: record,
        destination: 'local_persistent',
        warning: `Saved locally. Supabase error: ${error?.message || 'Unknown'}`,
      };
    }
  } catch (err: any) {
    return {
      track: record,
      destination: 'local_persistent',
      warning: `Saved locally. Cloud service error: ${err.message}`,
    };
  }

  return { track: record, destination: 'local_persistent' };
}

export async function updateMusicTrack(id: string, updates: Partial<MusicTrackRecord>): Promise<{
  track: MusicTrackRecord;
  destination: 'supabase_and_local' | 'local_persistent';
  warning?: string;
}> {
  const local = await getLocalStore();
  const existing = local.music_tracks.find((t) => t.id === id);
  if (!existing) {
    throw new Error(`Track ${id} not found`);
  }

  const merged: MusicTrackRecord = {
    ...existing,
    ...updates,
    id,
    updated_at: new Date().toISOString(),
  };

  const idx = local.music_tracks.findIndex((t) => t.id === id);
  local.music_tracks[idx] = merged;
  await saveLocalStore(local);

  try {
    const supabase = await createServiceClient();
    if (supabase) {
      const { data, error } = await supabase.from('music_tracks').update(merged).eq('id', id).select().single();
      if (!error && data) {
        return { track: data, destination: 'supabase_and_local' };
      }
      return {
        track: merged,
        destination: 'local_persistent',
        warning: `Updated locally. Supabase error: ${error?.message || 'Unknown'}`,
      };
    }
  } catch (err: any) {
    return {
      track: merged,
      destination: 'local_persistent',
      warning: `Updated locally. Cloud service error: ${err.message}`,
    };
  }

  return { track: merged, destination: 'local_persistent' };
}

export async function deleteMusicTrack(id: string): Promise<{ success: boolean; error?: string }> {
  const local = await getLocalStore();
  local.music_tracks = local.music_tracks.filter((t) => t.id !== id);
  await saveLocalStore(local);

  try {
    const supabase = await createServiceClient();
    if (supabase) {
      await supabase.from('music_tracks').delete().eq('id', id);
    }
  } catch (err: any) {
    console.warn('Supabase deleteMusicTrack error:', err.message);
  }

  return { success: true };
}

// ====================================================================
// 6. MEDIA ASSETS PERSISTENCE
// ====================================================================

export async function getMediaAssets(): Promise<{ assets: MediaAssetRecord[]; source: 'supabase' | 'local_persistent' }> {
  try {
    const supabase = await createServerClient();
    if (supabase) {
      const { data, error } = await supabase.from('media_library').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return {
          assets: data.map((d) => ({
            id: d.id,
            name: d.name,
            url: d.public_url || d.url,
            type: d.file_type || d.type || 'image',
            size: d.size || 'Static',
            created_at: d.created_at,
          })),
          source: 'supabase',
        };
      }
    }
  } catch (err) {
    console.warn('Supabase getMediaAssets error:', err);
  }

  const local = await getLocalStore();
  return { assets: local.media_assets, source: 'local_persistent' };
}

export async function saveMediaAsset(asset: Partial<MediaAssetRecord>): Promise<{
  asset: MediaAssetRecord;
  destination: 'supabase_and_local' | 'local_persistent';
  warning?: string;
}> {
  const local = await getLocalStore();
  const id = asset.id || `media-${Date.now()}`;
  const now = new Date().toISOString();

  const record: MediaAssetRecord = {
    id,
    name: (asset.name || 'asset.png').trim(),
    url: (asset.url || '').trim(),
    type: asset.type || 'image',
    size: asset.size || 'Unknown',
    created_at: asset.created_at || now.split('T')[0],
  };

  const existingIdx = local.media_assets.findIndex((a) => a.id === id);
  if (existingIdx >= 0) {
    local.media_assets[existingIdx] = record;
  } else {
    local.media_assets.unshift(record);
  }
  await saveLocalStore(local);

  try {
    const supabase = await createServiceClient();
    if (supabase) {
      const payload = {
        id: record.id,
        name: record.name,
        file_type: record.type,
        size_bytes: 1024,
        storage_path: record.url,
        public_url: record.url,
        created_at: now,
      };
      const { data, error } = await supabase.from('media_library').upsert(payload).select().single();
      if (!error && data) {
        return { asset: record, destination: 'supabase_and_local' };
      }
    }
  } catch (err: any) {
    console.warn('Supabase saveMediaAsset error:', err.message);
  }

  return { asset: record, destination: 'local_persistent' };
}

export async function deleteMediaAsset(id: string): Promise<{ success: boolean }> {
  const local = await getLocalStore();
  local.media_assets = local.media_assets.filter((a) => a.id !== id);
  await saveLocalStore(local);

  try {
    const supabase = await createServiceClient();
    if (supabase) {
      await supabase.from('media_library').delete().eq('id', id);
    }
  } catch (err: any) {
    console.warn('Supabase deleteMediaAsset error:', err.message);
  }

  return { success: true };
}
