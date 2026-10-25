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
  description: string;
  tags: string[];
  audio_url: string;
  cover_url?: string | null;
  cover_gradient?: string;
  published: boolean;
  featured: boolean;
  track_order: number;
  file_format: string;
  file_size: string;
  created_at: string;
  updated_at: string;
}

export interface MediaAssetRecord {
  id: string;
  name: string;
  url: string;
  type: string;
  size: string;
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

export const DEFAULT_STORE: AdminStoreData = {
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
    updated_at: '2026-10-25T12:00:00.000Z',
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
    updated_at: '2026-10-25T12:00:00.000Z',
  },
  showcase_projects: [
    {
      id: 'arcane-arsenal',
      title: 'ArcaneArsenal',
      slug: 'arcane-arsenal',
      category_id: 'mc-plugins',
      summary: 'RPG weapon skills engine for Paper & Purpur 1.21.4',
      description:
        'ArcaneArsenal introduces 45+ unique active and passive combat abilities bound to customizable weapons.',
      features: ['45+ Custom Skills', 'Custom Model Data Support', 'MySQL / SQLite Sync'],
      technologies: ['Java 21', 'PaperMC', 'Adventure API', 'Gradle'],
      status: 'Released',
      featured: true,
      is_free: false,
      price: 14.99,
      version: 'v2.4.1',
      gradient_bg: 'from-amber-600 to-red-900',
      icon_symbol: '⚔️',
      links: { discord: 'https://discord.gg/livingyuji' },
      compatibility: { mc_versions: ['1.21.4', '1.20.x'] },
      screenshots: ['/showcase/arcane-1.png'],
      created_at: '2026-10-20T10:00:00.000Z',
      updated_at: '2026-10-25T12:00:00.000Z',
    },
    {
      id: 'living-os-web',
      title: 'LivingYuji OS Web Platform',
      slug: 'living-os-web',
      category_id: 'web-apps',
      summary: 'Interactive web operating system and developer showcase platform',
      description: 'A Windows-inspired web desktop operating system built with Next.js and Tailwind CSS.',
      features: ['Window Management', 'Virtual Filesystem', 'Music Player', 'Admin Control Panel'],
      technologies: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Supabase'],
      status: 'Released',
      featured: true,
      is_free: true,
      price: 0,
      version: 'v1.0.0',
      gradient_bg: 'from-blue-600 to-indigo-900',
      icon_symbol: '💻',
      links: { demo: '/' },
      created_at: '2026-10-22T10:00:00.000Z',
      updated_at: '2026-10-25T12:00:00.000Z',
    },
  ],
  minecraft_products: [
    {
      id: 'living-custom-enchants',
      name: 'LivingCustomEnchants Pro',
      category: 'plugins',
      category_name: 'Plugins',
      short_desc: 'Next-generation custom enchantment suite for 1.21.4',
      full_desc: 'Complete custom enchantment engine with 60+ unique enchantments, custom dusts, scrolls, and books.',
      price: 19.99,
      is_free: false,
      version: 'v3.2.0',
      mc_versions: ['1.21.4', '1.20.6'],
      server_software: ['Paper', 'Purpur'],
      dependencies: ['Vault'],
      features: ['60+ Custom Enchantments', 'GUI Tinker & Alchemist', 'Full RGB Color Support'],
      installation_steps: ['Download .jar', 'Place in plugins/ folder', 'Restart server'],
      changelog: 'v3.2.0: Added 1.21.4 support',
      file_format: '.jar',
      file_size: '2.4 MB',
      creator: 'LivingYuji',
      published: true,
      featured: true,
      rating: 4.9,
      downloads_count: 1420,
      icon_bg: 'from-purple-600 to-indigo-900',
      icon_symbol: '✨',
      created_at: '2026-10-20T10:00:00.000Z',
      updated_at: '2026-10-25T12:00:00.000Z',
    },
    {
      id: 'cyber-hud-pack',
      name: 'CyberHUD Deluxe Resource Pack',
      category: 'resource-packs',
      category_name: 'Resource Packs',
      short_desc: 'Futuristic sci-fi UI and action bar overlay for Minecraft',
      full_desc: 'Transform your Minecraft experience with high-tech custom HUD elements, boss bars, and menus.',
      price: 0,
      is_free: true,
      version: 'v1.1',
      mc_versions: ['1.21.4'],
      server_software: ['Vanilla', 'OptiFine', 'Iris'],
      dependencies: [],
      features: ['Custom Hearts & Armor Bar', 'Sci-Fi Inventory Screen', 'OptiFine CEM Support'],
      installation_steps: ['Download .zip', 'Move to resourcepacks/', 'Activate in Resource Packs menu'],
      changelog: 'Initial release',
      file_format: '.zip',
      file_size: '14.2 MB',
      creator: 'LivingYuji',
      published: true,
      featured: false,
      rating: 4.8,
      downloads_count: 3200,
      icon_bg: 'from-cyan-600 to-blue-900',
      icon_symbol: '🎨',
      created_at: '2026-10-21T10:00:00.000Z',
      updated_at: '2026-10-25T12:00:00.000Z',
    },
  ],
  music_tracks: [
    {
      id: 'track-1',
      title: 'Midnight Overdrive',
      artist: 'LivingYuji',
      album: 'Cybernetic Dreams',
      duration: '3:42',
      duration_sec: 222,
      genre: 'Synthwave',
      description: 'Driving basslines and nostalgic neon synths inspired by late-night terminal coding.',
      tags: ['Synthwave', 'Cyberpunk', 'High-Energy'],
      audio_url: '/music/cyber-overdrive.mp3',
      cover_url: null,
      cover_gradient: 'from-blue-900 via-indigo-950 to-slate-950',
      published: true,
      featured: true,
      track_order: 1,
      file_format: 'mp3',
      file_size: '4.8 MB',
      created_at: '2026-10-22',
      updated_at: '2026-10-25',
    },
    {
      id: 'track-2',
      title: 'Subroutine Chill',
      artist: 'LivingYuji',
      album: 'Lo-Fi Loops Vol. 1',
      duration: '2:15',
      duration_sec: 135,
      genre: 'Cyber Lo-Fi',
      description: 'Gentle vinyl crackle layered over melodic piano chords for deep focus programming sessions.',
      tags: ['Lo-Fi', 'Chill', 'Ambient'],
      audio_url: '/music/lofi-loop.mp3',
      cover_url: null,
      cover_gradient: 'from-emerald-900 via-teal-950 to-slate-950',
      published: true,
      featured: false,
      track_order: 2,
      file_format: 'mp3',
      file_size: '3.1 MB',
      created_at: '2026-10-23',
      updated_at: '2026-10-25',
    },
  ],
  media_assets: [
    {
      id: 'asset-1',
      name: 'Default Avatar',
      url: '/avatar.png',
      type: 'image',
      size: '180 KB',
      created_at: '2026-10-20',
    },
    {
      id: 'asset-2',
      name: 'Cyberpunk Wallpaper',
      url: '/wallpapers/cyber.png',
      type: 'image',
      size: '2.1 MB',
      created_at: '2026-10-22',
    },
  ],
};

/**
 * Checks whether the current runtime environment has a read-only filesystem (e.g. Vercel, AWS Lambda).
 */
export function isServerlessReadOnlyEnvironment(): boolean {
  return Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NEXT_RUNTIME === 'edge' ||
    process.env.NODE_ENV === 'production'
  );
}

function getStoreFilePath(): string {
  return path.join(process.cwd(), 'data', 'admin-store.json');
}

/**
 * Loads baseline defaults or cached store data.
 * Guaranteed safe on read-only serverless filesystems (/var/task).
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
    // In local dev, initialize disk file if writable; in serverless, silently return defaults
    if (!isServerlessReadOnlyEnvironment()) {
      try {
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, JSON.stringify(DEFAULT_STORE, null, 2), 'utf-8');
      } catch (err: any) {
        console.warn('Unable to write initial admin-store.json (non-fatal):', err.message);
      }
    }
    return DEFAULT_STORE;
  }
}

/**
 * Persists store data to local disk strictly in local development environments.
 * Automatically bypassed in production/serverless environments to prevent EROFS.
 */
export async function saveLocalStore(data: AdminStoreData): Promise<void> {
  if (isServerlessReadOnlyEnvironment()) {
    return;
  }
  try {
    const filePath = getStoreFilePath();
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    const tempPath = `${filePath}.${Date.now()}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tempPath, filePath);
  } catch (err: any) {
    console.warn('saveLocalStore skipped (non-fatal filesystem constraint):', err.message);
  }
}

/**
 * Updates the local development mirror only when not in a read-only environment.
 */
async function syncLocalStoreIfDev(updater: (store: AdminStoreData) => void): Promise<void> {
  if (isServerlessReadOnlyEnvironment()) return;
  try {
    const local = await getLocalStore();
    updater(local);
    await saveLocalStore(local);
  } catch {
    // Non-fatal mirror update in dev
  }
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
  destination: 'supabase_production' | 'local_persistent';
  warning?: string;
}> {
  const supabase = await createServiceClient();
  if (supabase) {
    const current = await getSiteSettings();
    const merged: SiteSettingsRecord = {
      ...current.settings,
      ...updates,
      id: 'default',
      updated_at: new Date().toISOString(),
    };

    // 1. Attempt full schema upsert
    const { data, error } = await supabase.from('site_settings').upsert(merged).select().single();
    if (!error && data) {
      await syncLocalStoreIfDev((store) => {
        store.site_settings = data;
      });
      return { settings: data, destination: 'supabase_production' };
    }

    // 2. If column not found (e.g. PGRST204 for unmigrated video wallpaper columns), retry with base schema columns
    if (error && error.code === 'PGRST204') {
      const basePayload = {
        id: 'default',
        brand_name: merged.brand_name,
        site_title: merged.site_title,
        wallpaper: merged.wallpaper,
        accent_color: merged.accent_color,
        theme: merged.theme,
        custom_logo_url: merged.custom_logo_url || null,
        custom_favicon_url: merged.custom_favicon_url || null,
        custom_wallpaper_url: merged.custom_video_wallpaper_url || merged.custom_wallpaper_url || null,
        updated_at: merged.updated_at,
      };

      const retryRes = await supabase.from('site_settings').upsert(basePayload).select().single();
      if (!retryRes.error && retryRes.data) {
        const combinedSettings: SiteSettingsRecord = {
          ...merged,
          ...retryRes.data,
        };
        await syncLocalStoreIfDev((store) => {
          store.site_settings = combinedSettings;
        });
        return {
          settings: combinedSettings,
          destination: 'supabase_production',
          warning:
            'Settings saved to Supabase. To persist dedicated video wallpaper columns in the cloud database, run migration 20261025_complete_setup.sql.',
        };
      }
      throw new Error(`Database error saving site settings: ${retryRes.error?.message || 'Unknown database retry error'}`);
    }

    throw new Error(`Database error saving site settings: ${error?.message || 'Unknown database error'}`);
  }

  if (isServerlessReadOnlyEnvironment()) {
    throw new Error('Database connection is not configured in this production environment.');
  }

  const local = await getLocalStore();
  const merged: SiteSettingsRecord = {
    ...local.site_settings,
    ...updates,
    id: 'default',
    updated_at: new Date().toISOString(),
  };
  local.site_settings = merged;
  await saveLocalStore(local);
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
  destination: 'supabase_production' | 'local_persistent';
  warning?: string;
}> {
  const supabase = await createServiceClient();
  if (supabase) {
    const current = await getDiscordSettings();
    const merged: DiscordSettingsRecord = {
      ...current.settings,
      ...updates,
      id: 'default',
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('discord_settings').upsert(merged).select().single();
    if (!error && data) {
      await syncLocalStoreIfDev((store) => {
        store.discord_settings = data;
      });
      return { settings: data, destination: 'supabase_production' };
    }

    throw new Error(`Database error saving Discord settings: ${error?.message || 'Unknown database error'}`);
  }

  if (isServerlessReadOnlyEnvironment()) {
    throw new Error('Database connection is not configured in this production environment.');
  }

  const local = await getLocalStore();
  const merged: DiscordSettingsRecord = {
    ...local.discord_settings,
    ...updates,
    id: 'default',
    updated_at: new Date().toISOString(),
  };
  local.discord_settings = merged;
  await saveLocalStore(local);
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
  destination: 'supabase_production' | 'local_persistent';
  warning?: string;
}> {
  const id = project.id || `proj-${Date.now()}`;
  const now = new Date().toISOString();

  const record: ShowcaseProjectRecord = {
    id,
    title: (project.title || 'Untitled Project').trim(),
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

  const supabase = await createServiceClient();
  if (supabase) {
    const { data, error } = await supabase.from('showcase_projects').upsert(record).select().single();
    if (!error && data) {
      await syncLocalStoreIfDev((store) => {
        const idx = store.showcase_projects.findIndex((p) => p.id === id);
        if (idx >= 0) store.showcase_projects[idx] = data;
        else store.showcase_projects.unshift(data);
      });
      return { project: data, destination: 'supabase_production' };
    }
    throw new Error(`Database error saving showcase project: ${error?.message || 'Unknown database error'}`);
  }

  if (isServerlessReadOnlyEnvironment()) {
    throw new Error('Database connection is not configured in this production environment.');
  }

  const local = await getLocalStore();
  const existingIdx = local.showcase_projects.findIndex((p) => p.id === id);
  if (existingIdx >= 0) local.showcase_projects[existingIdx] = record;
  else local.showcase_projects.unshift(record);
  await saveLocalStore(local);
  return { project: record, destination: 'local_persistent' };
}

export async function deleteShowcaseProject(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServiceClient();
  if (supabase) {
    const { error } = await supabase.from('showcase_projects').delete().eq('id', id);
    if (error) {
      throw new Error(`Database error deleting showcase project: ${error.message}`);
    }
    await syncLocalStoreIfDev((store) => {
      store.showcase_projects = store.showcase_projects.filter((p) => p.id !== id);
    });
    return { success: true };
  }

  if (isServerlessReadOnlyEnvironment()) {
    throw new Error('Database connection is not configured in this production environment.');
  }

  const local = await getLocalStore();
  local.showcase_projects = local.showcase_projects.filter((p) => p.id !== id);
  await saveLocalStore(local);
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
  destination: 'supabase_production' | 'local_persistent';
  warning?: string;
}> {
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
    file_size: product.file_size || '1.0 MB',
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

  const supabase = await createServiceClient();
  if (supabase) {
    const { data, error } = await supabase.from('minecraft_products').upsert(record).select().single();
    if (!error && data) {
      await syncLocalStoreIfDev((store) => {
        const idx = store.minecraft_products.findIndex((p) => p.id === id);
        if (idx >= 0) store.minecraft_products[idx] = data;
        else store.minecraft_products.unshift(data);
      });
      return { product: data, destination: 'supabase_production' };
    }
    throw new Error(`Database error saving Minecraft product: ${error?.message || 'Unknown database error'}`);
  }

  if (isServerlessReadOnlyEnvironment()) {
    throw new Error('Database connection is not configured in this production environment.');
  }

  const local = await getLocalStore();
  const existingIdx = local.minecraft_products.findIndex((p) => p.id === id);
  if (existingIdx >= 0) local.minecraft_products[existingIdx] = record;
  else local.minecraft_products.unshift(record);
  await saveLocalStore(local);
  return { product: record, destination: 'local_persistent' };
}

export async function deleteMinecraftProduct(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServiceClient();
  if (supabase) {
    const { error } = await supabase.from('minecraft_products').delete().eq('id', id);
    if (error) {
      throw new Error(`Database error deleting Minecraft product: ${error.message}`);
    }
    await syncLocalStoreIfDev((store) => {
      store.minecraft_products = store.minecraft_products.filter((p) => p.id !== id);
    });
    return { success: true };
  }

  if (isServerlessReadOnlyEnvironment()) {
    throw new Error('Database connection is not configured in this production environment.');
  }

  const local = await getLocalStore();
  local.minecraft_products = local.minecraft_products.filter((p) => p.id !== id);
  await saveLocalStore(local);
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
  destination: 'supabase_production' | 'local_persistent';
  warning?: string;
}> {
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

  const supabase = await createServiceClient();
  if (supabase) {
    const { data, error } = await supabase.from('music_tracks').upsert(record).select().single();
    if (!error && data) {
      await syncLocalStoreIfDev((store) => {
        const idx = store.music_tracks.findIndex((t) => t.id === id);
        if (idx >= 0) store.music_tracks[idx] = data;
        else store.music_tracks.push(data);
      });
      return { track: data, destination: 'supabase_production' };
    }

    if (error && error.code === 'PGRST205') {
      throw new Error(
        `Database table 'public.music_tracks' does not exist in Supabase. Please run the SQL migration 'supabase/migrations/20261025_complete_setup.sql' in your Supabase SQL Editor to enable durable cloud music storage.`
      );
    }

    throw new Error(`Database error saving music track: ${error?.message || 'Unknown database error'}`);
  }

  if (isServerlessReadOnlyEnvironment()) {
    throw new Error('Database connection is not configured in this production environment.');
  }

  const local = await getLocalStore();
  const existingIdx = local.music_tracks.findIndex((t) => t.id === id);
  if (existingIdx >= 0) local.music_tracks[existingIdx] = record;
  else local.music_tracks.push(record);
  await saveLocalStore(local);
  return { track: record, destination: 'local_persistent' };
}

export async function updateMusicTrack(id: string, updates: Partial<MusicTrackRecord>): Promise<{
  track: MusicTrackRecord;
  destination: 'supabase_production' | 'local_persistent';
  warning?: string;
}> {
  const merged: Partial<MusicTrackRecord> = {
    ...updates,
    id,
    updated_at: new Date().toISOString(),
  };

  const supabase = await createServiceClient();
  if (supabase) {
    const { data, error } = await supabase.from('music_tracks').update(merged).eq('id', id).select().single();
    if (!error && data) {
      await syncLocalStoreIfDev((store) => {
        const idx = store.music_tracks.findIndex((t) => t.id === id);
        if (idx >= 0) store.music_tracks[idx] = { ...store.music_tracks[idx], ...data };
      });
      return { track: data, destination: 'supabase_production' };
    }
    throw new Error(`Database error updating music track: ${error?.message || 'Unknown database error'}`);
  }

  if (isServerlessReadOnlyEnvironment()) {
    throw new Error('Database connection is not configured in this production environment.');
  }

  const local = await getLocalStore();
  const existing = local.music_tracks.find((t) => t.id === id);
  if (!existing) {
    throw new Error(`Track ${id} not found`);
  }
  const updatedTrack: MusicTrackRecord = {
    ...existing,
    ...updates,
    id,
    updated_at: new Date().toISOString(),
  };
  const idx = local.music_tracks.findIndex((t) => t.id === id);
  local.music_tracks[idx] = updatedTrack;
  await saveLocalStore(local);
  return { track: updatedTrack, destination: 'local_persistent' };
}

export async function deleteMusicTrack(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServiceClient();
  if (supabase) {
    const { error } = await supabase.from('music_tracks').delete().eq('id', id);
    if (error) {
      throw new Error(`Database error deleting music track: ${error.message}`);
    }
    await syncLocalStoreIfDev((store) => {
      store.music_tracks = store.music_tracks.filter((t) => t.id !== id);
    });
    return { success: true };
  }

  if (isServerlessReadOnlyEnvironment()) {
    throw new Error('Database connection is not configured in this production environment.');
  }

  const local = await getLocalStore();
  local.music_tracks = local.music_tracks.filter((t) => t.id !== id);
  await saveLocalStore(local);
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
            url: d.public_url || d.url || d.storage_path,
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
  destination: 'supabase_production' | 'local_persistent';
  warning?: string;
}> {
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

  const supabase = await createServiceClient();
  if (supabase) {
    const payload = {
      id: record.id,
      name: record.name,
      file_type: record.type,
      size_bytes: 1024,
      storage_path: record.url,
      public_url: record.url,
      category: 'general',
      created_at: now,
    };
    const { data, error } = await supabase.from('media_library').upsert(payload).select().single();
    if (!error && data) {
      await syncLocalStoreIfDev((store) => {
        const idx = store.media_assets.findIndex((a) => a.id === id);
        if (idx >= 0) store.media_assets[idx] = record;
        else store.media_assets.unshift(record);
      });
      return { asset: record, destination: 'supabase_production' };
    }
    throw new Error(`Database error saving media asset: ${error?.message || 'Unknown database error'}`);
  }

  if (isServerlessReadOnlyEnvironment()) {
    throw new Error('Database connection is not configured in this production environment.');
  }

  const local = await getLocalStore();
  const existingIdx = local.media_assets.findIndex((a) => a.id === id);
  if (existingIdx >= 0) local.media_assets[existingIdx] = record;
  else local.media_assets.unshift(record);
  await saveLocalStore(local);
  return { asset: record, destination: 'local_persistent' };
}

export async function deleteMediaAsset(id: string): Promise<{ success: boolean }> {
  const supabase = await createServiceClient();
  if (supabase) {
    const { error } = await supabase.from('media_library').delete().eq('id', id);
    if (error) {
      throw new Error(`Database error deleting media asset: ${error.message}`);
    }
    await syncLocalStoreIfDev((store) => {
      store.media_assets = store.media_assets.filter((a) => a.id !== id);
    });
    return { success: true };
  }

  if (isServerlessReadOnlyEnvironment()) {
    throw new Error('Database connection is not configured in this production environment.');
  }

  const local = await getLocalStore();
  local.media_assets = local.media_assets.filter((a) => a.id !== id);
  await saveLocalStore(local);
  return { success: true };
}
