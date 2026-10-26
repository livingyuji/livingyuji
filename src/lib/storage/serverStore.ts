import fs from 'fs/promises';
import path from 'path';
import { createServerClient, createServiceClient } from '@/lib/supabase/server';
import {
  assertSafeMediaUrl,
  assertSafeVideoWallpaperUrl,
} from '@/lib/validation/urls';
import { isPublicShowcaseProject } from '@/lib/showcase/visibility';

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
  published?: boolean;
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
  // Test-only isolation: integration tests must never mutate the tracked
  // development data file. Production and development ignore the override.
  const testDataDir =
    process.env.NODE_ENV === 'test' ? process.env.LIVINGYUJI_DATA_DIR?.trim() : undefined;
  const dataDir = testDataDir
    ? path.resolve(process.cwd(), testDataDir)
    : path.join(process.cwd(), 'data');
  return path.join(dataDir, 'admin-store.json');
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
// SHARED PERSISTENCE HELPERS
// ====================================================================

const PHASE_B_MIGRATION = 'supabase/migrations/20261026_phase_b_schema_storage_foundation.sql';
const PHASE_C_MIGRATION = 'supabase/migrations/20261026_phase_c_showcase_access.sql';

function isMissingRelationError(error: any): boolean {
  const code = String(error?.code || '');
  const message = String(error?.message || '');
  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    /does not exist|schema cache|relation .* not found/i.test(message)
  );
}

function databaseError(action: string, table: string, error: any): Error {
  if (isMissingRelationError(error)) {
    const migration = table === 'showcase_projects' ? PHASE_C_MIGRATION : PHASE_B_MIGRATION;
    return new Error(
      `Database table 'public.${table}' is unavailable while ${action}. Apply the prepared migration '${migration}' in Supabase before retrying.`
    );
  }

  return new Error(
    `Database error while ${action} in 'public.${table}': ${error?.message || 'Unknown database error'}`
  );
}

function assertNoEphemeralUrl(value: unknown, field: string): void {
  // Shared allowlist: absolute HTTP(S) URLs and same-origin root-relative
  // paths only. This rejects blob:, local:, data:, javascript:, file:, and
  // protocol-relative URLs before they reach Supabase or the JSON mirror.
  assertSafeMediaUrl(value, field);
}

function assertSafeMediaList(values: unknown, field: string): void {
  if (!Array.isArray(values)) return;
  values.forEach((value, index) => {
    assertSafeMediaUrl(value, `${field}[${index}]`);
  });
}

function assertSafeRecordId(id: string, label: string): string {
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(id)) {
    throw new Error(`${label} ID contains unsupported characters.`);
  }
  return id;
}

function hasOwn(value: Record<string, any>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function compactRecord<T extends Record<string, any>>(value: T): T {
  const result: Record<string, any> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (entry !== undefined) result[key] = entry;
  }
  return result as T;
}

async function getReadClient() {
  return (await createServiceClient()) || (await createServerClient());
}

async function listRows(
  table: string,
  orderColumn = 'created_at',
  ascending = false
): Promise<any[] | null> {
  const supabase = await getReadClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order(orderColumn, { ascending });

  if (error) throw databaseError('reading records', table, error);
  return Array.isArray(data) ? data : [];
}

async function readRowById(table: string, id: string): Promise<any | null> {
  const supabase = await getReadClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw databaseError('reading a record', table, error);
  return data || null;
}

function assertNoConfiguredBackendInProduction(): void {
  if (isServerlessReadOnlyEnvironment()) {
    throw new Error(
      'Database connection is not configured in this production environment. The local JSON store is not shared production persistence.'
    );
  }
}

// ====================================================================
// 1. SITE SETTINGS PERSISTENCE
// ====================================================================

export async function getSiteSettings(): Promise<{ settings: SiteSettingsRecord; source: 'supabase' | 'local_persistent' }> {
  const supabase = await getReadClient();
  if (supabase) {
    const { data, error } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
    if (error) throw databaseError('reading site settings', 'site_settings', error);
    if (data) return { settings: data as SiteSettingsRecord, source: 'supabase' };

    // A reachable but empty settings table is authoritative. Do not replace it
    // with a developer file or a seeded production record.
    return { settings: DEFAULT_STORE.site_settings, source: 'supabase' };
  }

  assertNoConfiguredBackendInProduction();
  const local = await getLocalStore();
  return { settings: local.site_settings, source: 'local_persistent' };
}

const SITE_SETTINGS_COLUMNS: Array<keyof SiteSettingsRecord> = [
  'brand_name',
  'site_title',
  'wallpaper',
  'accent_color',
  'theme',
  'custom_logo_url',
  'custom_favicon_url',
  'custom_wallpaper_url',
  'custom_video_wallpaper_url',
  'video_wallpaper_muted',
  'wallpaper_mode',
  'wallpaper_opacity',
];

function sanitizeSiteSettingsUpdates(
  updates: Partial<SiteSettingsRecord>
): Partial<SiteSettingsRecord> {
  const sanitized: Partial<SiteSettingsRecord> = {};

  for (const column of SITE_SETTINGS_COLUMNS) {
    if (!hasOwn(updates as Record<string, any>, column)) continue;
    const value = updates[column];
    if (value === undefined) continue;

    if (column === 'wallpaper_opacity') {
      const numeric = Number(value);
      sanitized.wallpaper_opacity = Number.isFinite(numeric)
        ? Math.min(100, Math.max(0, Math.round(numeric)))
        : 85;
      continue;
    }

    if (column === 'video_wallpaper_muted') {
      sanitized.video_wallpaper_muted = value === true;
      continue;
    }

    if (column === 'custom_video_wallpaper_url') {
      assertSafeVideoWallpaperUrl(value, String(column));
    } else if (
      column === 'custom_wallpaper_url' ||
      column === 'custom_logo_url' ||
      column === 'custom_favicon_url'
    ) {
      assertSafeMediaUrl(value, String(column));
    }

    (sanitized as Record<string, any>)[column] = value;
  }

  return sanitized;
}

export async function saveSiteSettings(updates: Partial<SiteSettingsRecord>): Promise<{
  settings: SiteSettingsRecord;
  destination: 'supabase_production' | 'local_persistent';
  warning?: string;
}> {
  const safeUpdates = sanitizeSiteSettingsUpdates(updates);
  const supabase = await createServiceClient();
  if (supabase) {
    const current = await getSiteSettings();
    const merged: SiteSettingsRecord = {
      ...current.settings,
      ...safeUpdates,
      id: 'default',
      updated_at: new Date().toISOString(),
    };

    // Attempt the complete schema first. The result is the authoritative
    // persisted row; no fabricated success is returned on an error.
    const { data, error } = await supabase.from('site_settings').upsert(merged).select().single();
    if (!error && data) {
      await syncLocalStoreIfDev((store) => {
        store.site_settings = data;
      });
      return { settings: data as SiteSettingsRecord, destination: 'supabase_production' };
    }

    // Older schemas lack the Phase B wallpaper columns. Save only the columns
    // that actually exist, never copy a video URL into the image column, and
    // report the partial persistence explicitly.
    if (error && (error.code === 'PGRST204' || /column .* does not exist/i.test(error.message || ''))) {
      const basePayload = {
        id: 'default',
        brand_name: merged.brand_name,
        site_title: merged.site_title,
        wallpaper: merged.wallpaper,
        accent_color: merged.accent_color,
        theme: merged.theme,
        custom_logo_url: merged.custom_logo_url || null,
        custom_favicon_url: merged.custom_favicon_url || null,
        custom_wallpaper_url: merged.custom_wallpaper_url || null,
        updated_at: merged.updated_at,
      };

      const retryRes = await supabase.from('site_settings').upsert(basePayload).select().single();
      if (retryRes.error || !retryRes.data) {
        throw databaseError('saving site settings', 'site_settings', retryRes.error);
      }

      await syncLocalStoreIfDev((store) => {
        store.site_settings = retryRes.data as SiteSettingsRecord;
      });
      return {
        settings: retryRes.data as SiteSettingsRecord,
        destination: 'supabase_production',
        warning:
          `Base branding was saved, but the dedicated video-wallpaper columns are not present in Supabase. ` +
          `Apply '${PHASE_B_MIGRATION}' and save again to persist the video wallpaper settings.`,
      };
    }

    throw databaseError('saving site settings', 'site_settings', error);
  }

  assertNoConfiguredBackendInProduction();

  const local = await getLocalStore();
  const merged: SiteSettingsRecord = {
    ...local.site_settings,
    ...safeUpdates,
    id: 'default',
    updated_at: new Date().toISOString(),
  };

  assertSafeVideoWallpaperUrl(merged.custom_video_wallpaper_url, 'custom_video_wallpaper_url');
  assertSafeMediaUrl(merged.custom_wallpaper_url, 'custom_wallpaper_url');
  assertSafeMediaUrl(merged.custom_logo_url, 'custom_logo_url');
  assertSafeMediaUrl(merged.custom_favicon_url, 'custom_favicon_url');

  local.site_settings = merged;
  await saveLocalStore(local);
  return { settings: merged, destination: 'local_persistent' };
}

// ====================================================================
// 2. DISCORD SETTINGS PERSISTENCE
// ====================================================================

export async function getDiscordSettings(): Promise<{ settings: DiscordSettingsRecord; source: 'supabase' | 'local_persistent' }> {
  const supabase = await getReadClient();
  if (supabase) {
    const { data, error } = await supabase.from('discord_settings').select('*').limit(1).maybeSingle();
    if (error) throw databaseError('reading Discord settings', 'discord_settings', error);
    if (data) return { settings: data as DiscordSettingsRecord, source: 'supabase' };

    return { settings: DEFAULT_STORE.discord_settings, source: 'supabase' };
  }

  assertNoConfiguredBackendInProduction();
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

    throw databaseError('saving Discord settings', 'discord_settings', error);
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

function normalizeShowcaseProjectInput(
  input: Partial<ShowcaseProjectRecord> & Record<string, any>
): Partial<ShowcaseProjectRecord> {
  const normalized: Partial<ShowcaseProjectRecord> = {};

  const stringFields: Array<[string, keyof ShowcaseProjectRecord]> = [
    ['title', 'title'],
    ['slug', 'slug'],
    ['category_id', 'category_id'],
    ['category', 'category_id'],
    ['summary', 'summary'],
    ['short_description', 'summary'],
    ['description', 'description'],
    ['version', 'version'],
    ['gradient_bg', 'gradient_bg'],
    ['gradientBg', 'gradient_bg'],
    ['icon_symbol', 'icon_symbol'],
    ['iconSymbol', 'icon_symbol'],
    ['install_guide', 'install_guide'],
    ['created_at', 'created_at'],
    ['createdAt', 'created_at'],
  ];

  for (const [source, target] of stringFields) {
    if (hasOwn(input, source) && input[source] !== undefined) {
      (normalized as Record<string, any>)[target] = input[source];
    }
  }

  for (const field of ['features', 'technologies', 'screenshots'] as const) {
    if (hasOwn(input, field) && input[field] !== undefined) {
      normalized[field] = Array.isArray(input[field]) ? input[field] : [];
    }
  }

  if (hasOwn(input, 'status') && input.status !== undefined) normalized.status = input.status;
  if (hasOwn(input, 'featured') && input.featured !== undefined) normalized.featured = input.featured === true;
  if (hasOwn(input, 'is_free') && input.is_free !== undefined) normalized.is_free = input.is_free !== false;
  if (hasOwn(input, 'isFree') && input.isFree !== undefined) normalized.is_free = input.isFree !== false;
  if (hasOwn(input, 'published') && input.published !== undefined) normalized.published = input.published === true;
  if (hasOwn(input, 'price') && input.price !== undefined) {
    normalized.price = Number(input.price) || 0;
  }
  if (hasOwn(input, 'links') && input.links !== undefined) normalized.links = input.links || {};
  if (hasOwn(input, 'compatibility') && input.compatibility !== undefined) {
    normalized.compatibility = input.compatibility || {};
  }
  if (hasOwn(input, 'changelog') && input.changelog !== undefined) normalized.changelog = input.changelog;

  return normalized;
}

export async function getShowcaseProjects(
  isAdmin = false
): Promise<{ projects: ShowcaseProjectRecord[]; source: 'supabase' | 'local_persistent' }> {
  const rows = await listRows('showcase_projects');
  if (rows) {
    const projects = rows as ShowcaseProjectRecord[];
    return {
      projects: isAdmin ? projects : projects.filter(isPublicShowcaseProject),
      source: 'supabase',
    };
  }

  assertNoConfiguredBackendInProduction();
  const local = await getLocalStore();
  return {
    projects: isAdmin ? local.showcase_projects : local.showcase_projects.filter(isPublicShowcaseProject),
    source: 'local_persistent',
  };
}

export async function saveShowcaseProject(
  project: Partial<ShowcaseProjectRecord>,
  options: { preserveExisting?: boolean } = {}
): Promise<{
  project: ShowcaseProjectRecord;
  destination: 'supabase_production' | 'local_persistent';
  warning?: string;
}> {
  const input = project as Partial<ShowcaseProjectRecord> & Record<string, any>;
  const updates = normalizeShowcaseProjectInput(input);
  assertSafeMediaList(updates.screenshots, 'screenshots');
  const id = assertSafeRecordId(String(input.id || `proj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`), 'Project');
  const now = new Date().toISOString();
  const preserveExisting = options.preserveExisting !== false;

  const supabase = await createServiceClient();
  let existing: ShowcaseProjectRecord | null = null;
  if (preserveExisting) {
    if (supabase) {
      existing = (await readRowById('showcase_projects', id)) as ShowcaseProjectRecord | null;
    } else {
      assertNoConfiguredBackendInProduction();
      const local = await getLocalStore();
      existing = local.showcase_projects.find((entry) => entry.id === id) || null;
    }
  } else if (!supabase) {
    assertNoConfiguredBackendInProduction();
  }

  const title = String(updates.title ?? existing?.title ?? 'Untitled Project').trim();
  const record: ShowcaseProjectRecord = {
    ...existing,
    id,
    title: title || 'Untitled Project',
    slug:
      String(
        updates.slug ??
          existing?.slug ??
          title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')
      ) || `project-${id}`,
    category_id: String(updates.category_id ?? existing?.category_id ?? 'web-apps'),
    summary: String(updates.summary ?? existing?.summary ?? ''),
    description: String(updates.description ?? existing?.description ?? ''),
    features: updates.features ?? existing?.features ?? [],
    technologies: updates.technologies ?? existing?.technologies ?? [],
    status: String(updates.status ?? existing?.status ?? 'Released'),
    featured: updates.featured ?? existing?.featured ?? false,
    is_free: updates.is_free ?? existing?.is_free ?? true,
    price: updates.price ?? existing?.price ?? 0,
    version: String(updates.version ?? existing?.version ?? 'v1.0.0'),
    gradient_bg: String(updates.gradient_bg ?? existing?.gradient_bg ?? 'from-blue-600 to-indigo-900'),
    icon_symbol: String(updates.icon_symbol ?? existing?.icon_symbol ?? '⚡'),
    links: updates.links ?? existing?.links ?? {},
    compatibility: updates.compatibility ?? existing?.compatibility ?? {},
    screenshots: updates.screenshots ?? existing?.screenshots ?? [],
    changelog: updates.changelog ?? existing?.changelog ?? '',
    install_guide: updates.install_guide ?? existing?.install_guide ?? null,
    created_at: existing?.created_at ?? updates.created_at ?? now,
    updated_at: now,
  };

  if (updates.published !== undefined) record.published = updates.published;
  else if (existing?.published !== undefined) record.published = existing.published;

  if (supabase) {
    const { data, error } = await supabase
      .from('showcase_projects')
      .upsert(compactRecord(record))
      .select()
      .single();
    if (error || !data) throw databaseError('saving a showcase project', 'showcase_projects', error);

    await syncLocalStoreIfDev((store) => {
      const idx = store.showcase_projects.findIndex((entry) => entry.id === id);
      if (idx >= 0) store.showcase_projects[idx] = data as ShowcaseProjectRecord;
      else store.showcase_projects.unshift(data as ShowcaseProjectRecord);
    });
    return { project: data as ShowcaseProjectRecord, destination: 'supabase_production' };
  }

  const local = await getLocalStore();
  const existingIdx = local.showcase_projects.findIndex((entry) => entry.id === id);
  if (existingIdx >= 0) local.showcase_projects[existingIdx] = record;
  else local.showcase_projects.unshift(record);
  await saveLocalStore(local);
  return { project: record, destination: 'local_persistent' };
}

export async function deleteShowcaseProject(id: string): Promise<{ success: boolean; error?: string }> {
  assertSafeRecordId(id, 'Project');
  const supabase = await createServiceClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('showcase_projects')
      .delete()
      .eq('id', id)
      .select('id');
    if (error) throw databaseError('deleting a showcase project', 'showcase_projects', error);
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`Project '${id}' was not found; nothing was deleted.`);
    }

    await syncLocalStoreIfDev((store) => {
      store.showcase_projects = store.showcase_projects.filter((entry) => entry.id !== id);
    });
    return { success: true };
  }

  assertNoConfiguredBackendInProduction();
  const local = await getLocalStore();
  const before = local.showcase_projects.length;
  local.showcase_projects = local.showcase_projects.filter((entry) => entry.id !== id);
  if (local.showcase_projects.length === before) {
    throw new Error(`Project '${id}' was not found; nothing was deleted.`);
  }
  await saveLocalStore(local);
  return { success: true };
}

export async function resetShowcaseProjects(projects: Partial<ShowcaseProjectRecord>[]): Promise<{
  projects: ShowcaseProjectRecord[];
  destination: 'supabase_production' | 'local_persistent';
}> {
  if (!Array.isArray(projects) || projects.length === 0) {
    throw new Error('Reset requires a non-empty list of default projects.');
  }

  const saved: ShowcaseProjectRecord[] = [];
  for (const project of projects) {
    // A reset means restoring the canonical defaults, not merging arbitrary
    // fields left behind by a previous edit. `preserveExisting: false` also
    // resets fields the client does not explicitly send.
    let result = await saveShowcaseProject(project, { preserveExisting: false });

    // If the optional Phase C `published` column exists, an upsert that omits
    // it would leave an old unpublished row hidden. Restore the default
    // visibility explicitly without making the reset fail on Phase B-only
    // schemas where the column does not exist yet.
    if (project.published !== false && result.project.published === false) {
      result = await saveShowcaseProject(
        { ...project, published: true },
        { preserveExisting: false }
      );
    }
    saved.push(result.project);
  }

  const keepIds = new Set(saved.map((project) => project.id));
  const supabase = await createServiceClient();
  if (supabase) {
    const { data: existing, error } = await supabase.from('showcase_projects').select('id');
    if (error) throw databaseError('reading showcase projects during reset', 'showcase_projects', error);
    const removeIds = (Array.isArray(existing) ? existing : [])
      .map((entry: any) => String(entry.id))
      .filter((id: string) => !keepIds.has(id));
    if (removeIds.length > 0) {
      const { data: deleted, error: deleteError } = await supabase
        .from('showcase_projects')
        .delete()
        .in('id', removeIds)
        .select('id');
      if (deleteError) {
        throw databaseError('removing extra projects during reset', 'showcase_projects', deleteError);
      }
      if (!Array.isArray(deleted) || deleted.length !== removeIds.length) {
        throw new Error('Showcase reset was incomplete. No success was reported because verification failed.');
      }
    }
    return { projects: saved, destination: 'supabase_production' };
  }

  assertNoConfiguredBackendInProduction();
  const local = await getLocalStore();
  local.showcase_projects = saved;
  await saveLocalStore(local);
  return { projects: saved, destination: 'local_persistent' };
}

// ====================================================================
// 4. MINECRAFT PRODUCTS PERSISTENCE
// ====================================================================

function normalizeMinecraftProductInput(
  input: Partial<MinecraftProductRecord> & Record<string, any>
): Partial<MinecraftProductRecord> {
  const normalized: Partial<MinecraftProductRecord> = {};

  const stringFields: Array<[string, keyof MinecraftProductRecord]> = [
    ['name', 'name'],
    ['category', 'category'],
    ['category_name', 'category_name'],
    ['categoryName', 'category_name'],
    ['short_desc', 'short_desc'],
    ['shortDesc', 'short_desc'],
    ['full_desc', 'full_desc'],
    ['fullDesc', 'full_desc'],
    ['version', 'version'],
    ['changelog', 'changelog'],
    ['file_format', 'file_format'],
    ['fileFormat', 'file_format'],
    ['file_size', 'file_size'],
    ['fileSize', 'file_size'],
    ['creator', 'creator'],
    ['icon_bg', 'icon_bg'],
    ['iconBg', 'icon_bg'],
    ['icon_symbol', 'icon_symbol'],
    ['iconSymbol', 'icon_symbol'],
    ['download_url', 'download_url'],
    ['downloadUrl', 'download_url'],
    ['direct_file_path', 'direct_file_path'],
    ['directFilePath', 'direct_file_path'],
    ['created_at', 'created_at'],
    ['createdAt', 'created_at'],
  ];

  for (const [source, target] of stringFields) {
    if (hasOwn(input, source) && input[source] !== undefined) {
      (normalized as Record<string, any>)[target] = input[source];
    }
  }

  const arrayFields: Array<[string, keyof MinecraftProductRecord]> = [
    ['mc_versions', 'mc_versions'],
    ['mcVersions', 'mc_versions'],
    ['server_software', 'server_software'],
    ['serverSoftware', 'server_software'],
    ['dependencies', 'dependencies'],
    ['features', 'features'],
    ['installation_steps', 'installation_steps'],
    ['installationSteps', 'installation_steps'],
  ];
  for (const [source, target] of arrayFields) {
    if (hasOwn(input, source) && input[source] !== undefined) {
      (normalized as Record<string, any>)[target] = Array.isArray(input[source]) ? input[source] : [];
    }
  }

  if (hasOwn(input, 'price') && input.price !== undefined) normalized.price = Number(input.price) || 0;
  if (hasOwn(input, 'is_free') && input.is_free !== undefined) normalized.is_free = input.is_free !== false;
  if (hasOwn(input, 'isFree') && input.isFree !== undefined) normalized.is_free = input.isFree !== false;
  if (hasOwn(input, 'published') && input.published !== undefined) normalized.published = input.published === true;
  if (hasOwn(input, 'featured') && input.featured !== undefined) normalized.featured = input.featured === true;
  if (hasOwn(input, 'rating') && input.rating !== undefined) {
    const rating = Number(input.rating);
    normalized.rating = Number.isFinite(rating) ? rating : 5;
  }
  if (hasOwn(input, 'downloads_count') && input.downloads_count !== undefined) {
    normalized.downloads_count = Number(input.downloads_count) || 0;
  }
  if (hasOwn(input, 'downloadsCount') && input.downloadsCount !== undefined) {
    normalized.downloads_count = Number(input.downloadsCount) || 0;
  }

  return normalized;
}

export async function getMinecraftProducts(
  isAdmin = false
): Promise<{ products: MinecraftProductRecord[]; source: 'supabase' | 'local_persistent' }> {
  const rows = await listRows('minecraft_products');
  if (rows) {
    const products = rows as MinecraftProductRecord[];
    return {
      products: isAdmin ? products : products.filter((product) => product.published !== false),
      source: 'supabase',
    };
  }

  assertNoConfiguredBackendInProduction();
  const local = await getLocalStore();
  return {
    products: isAdmin ? local.minecraft_products : local.minecraft_products.filter((product) => product.published !== false),
    source: 'local_persistent',
  };
}

export async function saveMinecraftProduct(product: Partial<MinecraftProductRecord>): Promise<{
  product: MinecraftProductRecord;
  destination: 'supabase_production' | 'local_persistent';
  warning?: string;
}> {
  const input = product as Partial<MinecraftProductRecord> & Record<string, any>;
  const updates = normalizeMinecraftProductInput(input);
  assertNoEphemeralUrl(updates.download_url, 'download_url');
  const id = assertSafeRecordId(String(input.id || `prod-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`), 'Product');
  const now = new Date().toISOString();

  const supabase = await createServiceClient();
  let existing: MinecraftProductRecord | null = null;
  if (supabase) {
    existing = (await readRowById('minecraft_products', id)) as MinecraftProductRecord | null;
  } else {
    assertNoConfiguredBackendInProduction();
    const local = await getLocalStore();
    existing = local.minecraft_products.find((entry) => entry.id === id) || null;
  }

  const price = updates.price ?? existing?.price ?? 0;
  const isFree = updates.is_free ?? (hasOwn(updates, 'price') ? price === 0 : existing?.is_free ?? price === 0);

  const record: MinecraftProductRecord = {
    ...existing,
    id,
    name: String(updates.name ?? existing?.name ?? 'Untitled Resource').trim() || 'Untitled Resource',
    category: String(updates.category ?? existing?.category ?? 'plugins'),
    category_name: String(updates.category_name ?? existing?.category_name ?? 'Plugins'),
    short_desc: String(updates.short_desc ?? existing?.short_desc ?? ''),
    full_desc: String(updates.full_desc ?? existing?.full_desc ?? ''),
    price,
    is_free: isFree,
    version: String(updates.version ?? existing?.version ?? 'v1.0.0'),
    mc_versions: updates.mc_versions ?? existing?.mc_versions ?? ['1.21.4'],
    server_software: updates.server_software ?? existing?.server_software ?? ['Paper', 'Purpur'],
    dependencies: updates.dependencies ?? existing?.dependencies ?? [],
    features: updates.features ?? existing?.features ?? [],
    installation_steps: updates.installation_steps ?? existing?.installation_steps ?? [],
    changelog: String(updates.changelog ?? existing?.changelog ?? ''),
    file_format: String(updates.file_format ?? existing?.file_format ?? '.jar'),
    file_size: String(updates.file_size ?? existing?.file_size ?? '1.0 MB'),
    creator: String(updates.creator ?? existing?.creator ?? 'LivingYuji'),
    published: updates.published ?? existing?.published ?? true,
    featured: updates.featured ?? existing?.featured ?? false,
    rating: updates.rating ?? existing?.rating ?? 5,
    downloads_count: updates.downloads_count ?? existing?.downloads_count ?? 0,
    icon_bg: String(updates.icon_bg ?? existing?.icon_bg ?? 'from-blue-600 to-indigo-900'),
    icon_symbol: String(updates.icon_symbol ?? existing?.icon_symbol ?? '⚡'),
    download_url: updates.download_url ?? existing?.download_url ?? null,
    direct_file_path: updates.direct_file_path ?? existing?.direct_file_path ?? null,
    created_at: existing?.created_at ?? updates.created_at ?? now,
    updated_at: now,
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('minecraft_products')
      .upsert(compactRecord(record))
      .select()
      .single();
    if (error || !data) throw databaseError('saving a Minecraft product', 'minecraft_products', error);

    await syncLocalStoreIfDev((store) => {
      const idx = store.minecraft_products.findIndex((entry) => entry.id === id);
      if (idx >= 0) store.minecraft_products[idx] = data as MinecraftProductRecord;
      else store.minecraft_products.unshift(data as MinecraftProductRecord);
    });
    return { product: data as MinecraftProductRecord, destination: 'supabase_production' };
  }

  const local = await getLocalStore();
  const existingIdx = local.minecraft_products.findIndex((entry) => entry.id === id);
  if (existingIdx >= 0) local.minecraft_products[existingIdx] = record;
  else local.minecraft_products.unshift(record);
  await saveLocalStore(local);
  return { product: record, destination: 'local_persistent' };
}

export async function deleteMinecraftProduct(id: string): Promise<{ success: boolean; error?: string }> {
  assertSafeRecordId(id, 'Product');
  const supabase = await createServiceClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('minecraft_products')
      .delete()
      .eq('id', id)
      .select('id');
    if (error) throw databaseError('deleting a Minecraft product', 'minecraft_products', error);
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`Product '${id}' was not found; nothing was deleted.`);
    }

    await syncLocalStoreIfDev((store) => {
      store.minecraft_products = store.minecraft_products.filter((entry) => entry.id !== id);
    });
    return { success: true };
  }

  assertNoConfiguredBackendInProduction();
  const local = await getLocalStore();
  const before = local.minecraft_products.length;
  local.minecraft_products = local.minecraft_products.filter((entry) => entry.id !== id);
  if (local.minecraft_products.length === before) {
    throw new Error(`Product '${id}' was not found; nothing was deleted.`);
  }
  await saveLocalStore(local);
  return { success: true };
}

// ====================================================================
// 5. MUSIC TRACKS PERSISTENCE
// ====================================================================

function normalizeMusicTrackInput(
  input: Partial<MusicTrackRecord> & Record<string, any>
): Partial<MusicTrackRecord> {
  const normalized: Partial<MusicTrackRecord> = {};

  const stringFields: Array<[string, keyof MusicTrackRecord]> = [
    ['title', 'title'],
    ['artist', 'artist'],
    ['album', 'album'],
    ['duration', 'duration'],
    ['genre', 'genre'],
    ['description', 'description'],
    ['audio_url', 'audio_url'],
    ['audioUrl', 'audio_url'],
    ['cover_url', 'cover_url'],
    ['coverUrl', 'cover_url'],
    ['cover_gradient', 'cover_gradient'],
    ['coverGradient', 'cover_gradient'],
    ['file_format', 'file_format'],
    ['fileFormat', 'file_format'],
    ['file_size', 'file_size'],
    ['fileSize', 'file_size'],
    ['created_at', 'created_at'],
    ['createdAt', 'created_at'],
  ];

  for (const [source, target] of stringFields) {
    if (hasOwn(input, source) && input[source] !== undefined) {
      (normalized as Record<string, any>)[target] = input[source];
    }
  }

  if (hasOwn(input, 'duration_sec') && input.duration_sec !== undefined) {
    normalized.duration_sec = Number(input.duration_sec) || 180;
  }
  if (hasOwn(input, 'durationSec') && input.durationSec !== undefined) {
    normalized.duration_sec = Number(input.durationSec) || 180;
  }
  if (hasOwn(input, 'tags') && input.tags !== undefined) {
    normalized.tags = Array.isArray(input.tags) ? input.tags : [];
  }
  if (hasOwn(input, 'published') && input.published !== undefined) {
    normalized.published = input.published === true;
  }
  if (hasOwn(input, 'featured') && input.featured !== undefined) {
    normalized.featured = input.featured === true;
  }
  if (hasOwn(input, 'track_order') && input.track_order !== undefined) {
    normalized.track_order = Number(input.track_order) || 99;
  }
  if (hasOwn(input, 'trackOrder') && input.trackOrder !== undefined) {
    normalized.track_order = Number(input.trackOrder) || 99;
  }

  return normalized;
}

function assertDurableMusicUrls(track: Partial<MusicTrackRecord>): void {
  if (hasOwn(track as Record<string, any>, 'audio_url')) {
    assertNoEphemeralUrl(track.audio_url, 'audio_url');
  }
  if (hasOwn(track as Record<string, any>, 'cover_url')) {
    assertNoEphemeralUrl(track.cover_url, 'cover_url');
  }
}

export async function getMusicTracks(
  isAdmin = false
): Promise<{ tracks: MusicTrackRecord[]; source: 'supabase' | 'local_persistent' }> {
  const rows = await listRows('music_tracks', 'track_order', true);
  if (rows) {
    const tracks = rows as MusicTrackRecord[];
    return {
      // The service-role read intentionally returns all rows so public
      // filtering is an application concern rather than a Storage/RLS leak.
      tracks: isAdmin ? tracks : tracks.filter((track) => track.published === true),
      source: 'supabase',
    };
  }

  assertNoConfiguredBackendInProduction();
  const local = await getLocalStore();
  return {
    tracks: isAdmin ? local.music_tracks : local.music_tracks.filter((track) => track.published === true),
    source: 'local_persistent',
  };
}

export async function saveMusicTrack(track: Partial<MusicTrackRecord>): Promise<{
  track: MusicTrackRecord;
  destination: 'supabase_production' | 'local_persistent';
  warning?: string;
}> {
  const input = track as Partial<MusicTrackRecord> & Record<string, any>;
  const updates = normalizeMusicTrackInput(input);
  assertDurableMusicUrls(updates);

  const id = assertSafeRecordId(String(input.id || `track-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`), 'Track');
  const now = new Date().toISOString();

  const supabase = await createServiceClient();
  let existing: MusicTrackRecord | null = null;
  if (supabase) {
    existing = (await readRowById('music_tracks', id)) as MusicTrackRecord | null;
  } else {
    assertNoConfiguredBackendInProduction();
    const local = await getLocalStore();
    existing = local.music_tracks.find((entry) => entry.id === id) || null;
  }

  const record: MusicTrackRecord = {
    ...existing,
    id,
    title: String(updates.title ?? existing?.title ?? 'Untitled Track').trim() || 'Untitled Track',
    artist: String(updates.artist ?? existing?.artist ?? 'LivingYuji').trim() || 'LivingYuji',
    album: String(updates.album ?? existing?.album ?? 'Single & Releases').trim() || 'Single & Releases',
    duration: String(updates.duration ?? existing?.duration ?? '3:00'),
    duration_sec: updates.duration_sec ?? existing?.duration_sec ?? 180,
    genre: String(updates.genre ?? existing?.genre ?? 'Cyber Lo-Fi'),
    description: String(updates.description ?? existing?.description ?? ''),
    tags: updates.tags ?? existing?.tags ?? [],
    audio_url: String(updates.audio_url ?? existing?.audio_url ?? ''),
    cover_url: updates.cover_url ?? existing?.cover_url ?? null,
    cover_gradient: String(
      updates.cover_gradient ?? existing?.cover_gradient ?? 'from-emerald-900 via-teal-950 to-slate-950'
    ),
    published: updates.published ?? existing?.published ?? true,
    featured: updates.featured ?? existing?.featured ?? false,
    track_order: updates.track_order ?? existing?.track_order ?? 99,
    file_format: String(updates.file_format ?? existing?.file_format ?? 'mp3').toLowerCase(),
    file_size: String(updates.file_size ?? existing?.file_size ?? '3 MB'),
    created_at: existing?.created_at ?? updates.created_at ?? now,
    updated_at: now,
  };

  assertDurableMusicUrls(record);

  if (supabase) {
    const { data, error } = await supabase.from('music_tracks').upsert(compactRecord(record)).select().single();
    if (error || !data) throw databaseError('saving a music track', 'music_tracks', error);

    await syncLocalStoreIfDev((store) => {
      const idx = store.music_tracks.findIndex((entry) => entry.id === id);
      if (idx >= 0) store.music_tracks[idx] = data as MusicTrackRecord;
      else store.music_tracks.push(data as MusicTrackRecord);
    });
    return { track: data as MusicTrackRecord, destination: 'supabase_production' };
  }

  const local = await getLocalStore();
  const existingIdx = local.music_tracks.findIndex((entry) => entry.id === id);
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
  assertSafeRecordId(id, 'Track');
  const normalized = normalizeMusicTrackInput(updates as Partial<MusicTrackRecord> & Record<string, any>);
  assertDurableMusicUrls(normalized);

  const supabase = await createServiceClient();
  if (supabase) {
    const existing = (await readRowById('music_tracks', id)) as MusicTrackRecord | null;
    if (!existing) throw new Error(`Track '${id}' was not found; nothing was updated.`);

    const merged = { ...existing, ...normalized, id, updated_at: new Date().toISOString() };
    const { data, error } = await supabase
      .from('music_tracks')
      .update(compactRecord(merged))
      .eq('id', id)
      .select()
      .single();
    if (error || !data) throw databaseError('updating a music track', 'music_tracks', error);

    await syncLocalStoreIfDev((store) => {
      const idx = store.music_tracks.findIndex((entry) => entry.id === id);
      if (idx >= 0) store.music_tracks[idx] = data as MusicTrackRecord;
    });
    return { track: data as MusicTrackRecord, destination: 'supabase_production' };
  }

  assertNoConfiguredBackendInProduction();
  const local = await getLocalStore();
  const existingIdx = local.music_tracks.findIndex((entry) => entry.id === id);
  if (existingIdx < 0) throw new Error(`Track '${id}' was not found; nothing was updated.`);

  const updatedTrack: MusicTrackRecord = {
    ...local.music_tracks[existingIdx],
    ...normalized,
    id,
    updated_at: new Date().toISOString(),
  };
  local.music_tracks[existingIdx] = updatedTrack;
  await saveLocalStore(local);
  return { track: updatedTrack, destination: 'local_persistent' };
}

export async function deleteMusicTrack(id: string): Promise<{ success: boolean; error?: string }> {
  assertSafeRecordId(id, 'Track');
  const supabase = await createServiceClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('music_tracks')
      .delete()
      .eq('id', id)
      .select('id');
    if (error) throw databaseError('deleting a music track', 'music_tracks', error);
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`Track '${id}' was not found; nothing was deleted.`);
    }

    await syncLocalStoreIfDev((store) => {
      store.music_tracks = store.music_tracks.filter((entry) => entry.id !== id);
    });
    return { success: true };
  }

  assertNoConfiguredBackendInProduction();
  const local = await getLocalStore();
  const before = local.music_tracks.length;
  local.music_tracks = local.music_tracks.filter((entry) => entry.id !== id);
  if (local.music_tracks.length === before) {
    throw new Error(`Track '${id}' was not found; nothing was deleted.`);
  }
  await saveLocalStore(local);
  return { success: true };
}

// ====================================================================
// 6. MEDIA ASSETS PERSISTENCE
// ====================================================================

export async function getMediaAssets(): Promise<{ assets: MediaAssetRecord[]; source: 'supabase' | 'local_persistent' }> {
  const rows = await listRows('media_library');
  if (rows) {
    return {
      assets: rows.map((row: any) => ({
        id: row.id,
        name: row.name || row.storage_path || 'asset',
        url: row.public_url || row.url || row.storage_path || '',
        type: row.file_type || row.type || 'image',
        size: row.size || 'Static',
        created_at: row.created_at,
      })),
      source: 'supabase',
    };
  }

  assertNoConfiguredBackendInProduction();
  const local = await getLocalStore();
  return { assets: local.media_assets, source: 'local_persistent' };
}

export async function saveMediaAsset(asset: Partial<MediaAssetRecord>): Promise<{
  asset: MediaAssetRecord;
  destination: 'supabase_production' | 'local_persistent';
  warning?: string;
}> {
  const id = assertSafeRecordId(String(asset.id || `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`), 'Media asset');
  const now = new Date().toISOString();
  const url = String(asset.url || '').trim();
  assertNoEphemeralUrl(url, 'url');

  const record: MediaAssetRecord = {
    id,
    name: String(asset.name || 'asset.png').trim() || 'asset.png',
    url,
    type: String(asset.type || 'image'),
    size: String(asset.size || 'Unknown'),
    created_at: asset.created_at || now.split('T')[0],
  };

  const supabase = await createServiceClient();
  if (supabase) {
    let existing: any = null;
    const { data: current, error: readError } = await supabase
      .from('media_library')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (readError) throw databaseError('reading a media asset', 'media_library', readError);
    existing = current;

    const payload = {
      id: record.id,
      name: record.name,
      file_type: record.type,
      size_bytes: Number(existing?.size_bytes) || 1024,
      storage_path: existing?.storage_path || record.url,
      public_url: record.url,
      category: existing?.category || 'general',
      created_at: existing?.created_at || now,
    };
    const { data, error } = await supabase.from('media_library').upsert(payload).select().single();
    if (error || !data) throw databaseError('saving a media asset', 'media_library', error);

    await syncLocalStoreIfDev((store) => {
      const idx = store.media_assets.findIndex((entry) => entry.id === id);
      if (idx >= 0) store.media_assets[idx] = record;
      else store.media_assets.unshift(record);
    });
    return { asset: record, destination: 'supabase_production' };
  }

  assertNoConfiguredBackendInProduction();
  const local = await getLocalStore();
  const existingIdx = local.media_assets.findIndex((entry) => entry.id === id);
  if (existingIdx >= 0) local.media_assets[existingIdx] = { ...local.media_assets[existingIdx], ...record };
  else local.media_assets.unshift(record);
  await saveLocalStore(local);
  return { asset: record, destination: 'local_persistent' };
}

export async function deleteMediaAsset(id: string): Promise<{ success: boolean }> {
  assertSafeRecordId(id, 'Media asset');
  const supabase = await createServiceClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('media_library')
      .delete()
      .eq('id', id)
      .select('id');
    if (error) throw databaseError('deleting a media asset', 'media_library', error);
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`Media asset '${id}' was not found; nothing was deleted.`);
    }

    await syncLocalStoreIfDev((store) => {
      store.media_assets = store.media_assets.filter((entry) => entry.id !== id);
    });
    return { success: true };
  }

  assertNoConfiguredBackendInProduction();
  const local = await getLocalStore();
  const before = local.media_assets.length;
  local.media_assets = local.media_assets.filter((entry) => entry.id !== id);
  if (local.media_assets.length === before) {
    throw new Error(`Media asset '${id}' was not found; nothing was deleted.`);
  }
  await saveLocalStore(local);
  return { success: true };
}
