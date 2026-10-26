const mockCreateServiceClient = jest.fn();
const mockCreateServerClient = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createServiceClient: (...args: any[]) => mockCreateServiceClient(...args),
  createServerClient: (...args: any[]) => mockCreateServerClient(...args),
}));

import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import {
  getSiteSettings,
  saveSiteSettings,
  getDiscordSettings,
  saveDiscordSettings,
  getShowcaseProjects,
  saveShowcaseProject,
  deleteShowcaseProject,
  getMinecraftProducts,
  saveMinecraftProduct,
  deleteMinecraftProduct,
  getMusicTracks,
  saveMusicTrack,
  updateMusicTrack,
  deleteMusicTrack,
  getMediaAssets,
  saveMediaAsset,
  deleteMediaAsset,
} from '@/lib/storage/serverStore';
import {
  signSessionToken,
  verifySessionToken,
  verifyPassphrase,
  getExpectedPassphrase,
} from '@/lib/auth/adminAuth';

describe('Admin Panel Persistence Engine', () => {
  const originalDataDir = process.env.LIVINGYUJI_DATA_DIR;
  let temporaryDataDir = '';
  let trackedDataBefore: string | null = null;

  beforeAll(async () => {
    temporaryDataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'livingyuji-admin-store-'));
    process.env.LIVINGYUJI_DATA_DIR = temporaryDataDir;
    mockCreateServiceClient.mockResolvedValue(null);
    mockCreateServerClient.mockResolvedValue(null);

    try {
      trackedDataBefore = await fs.readFile(
        path.join(process.cwd(), 'data', 'admin-store.json'),
        'utf8'
      );
    } catch {
      trackedDataBefore = null;
    }
  });

  afterAll(async () => {
    if (originalDataDir === undefined) delete process.env.LIVINGYUJI_DATA_DIR;
    else process.env.LIVINGYUJI_DATA_DIR = originalDataDir;

    if (temporaryDataDir) {
      await fs.rm(temporaryDataDir, { recursive: true, force: true });
    }
  });

  describe('Authentication & Access Control', () => {
    it('verifies correct passphrase and rejects incorrect ones', () => {
      const correct = getExpectedPassphrase();
      expect(verifyPassphrase(correct)).toBe(true);
      expect(verifyPassphrase('wrong-passphrase-12345')).toBe(false);
      expect(verifyPassphrase('')).toBe(false);
    });

    it('generates a valid HMAC session token and verifies it correctly', () => {
      const token = signSessionToken();
      expect(typeof token).toBe('string');
      expect(verifySessionToken(token)).toBe(true);
    });

    it('strictly rejects tampered and invalid session tokens', () => {
      const valid = signSessionToken();
      const tampered = valid.slice(0, -4) + 'abcd';
      expect(verifySessionToken(tampered)).toBe(false);
      expect(verifySessionToken('invalid.token')).toBe(false);
      expect(verifySessionToken(null)).toBe(false);
      expect(verifySessionToken(undefined)).toBe(false);
    });
  });

  describe('Site Settings Persistence', () => {
    it('saves branding changes and retrieves them accurately', async () => {
      const updatedBrand = 'LivingYuji Test Brand';
      const updatedTitle = 'LivingYuji Test OS Title';

      const saveRes = await saveSiteSettings({
        brand_name: updatedBrand,
        site_title: updatedTitle,
        wallpaper: 'cyber',
        theme: 'dark',
      });

      expect(saveRes.settings.brand_name).toBe(updatedBrand);
      expect(saveRes.settings.site_title).toBe(updatedTitle);
      expect(saveRes.settings.wallpaper).toBe('cyber');

      // Retrieve again to verify persistence
      const getRes = await getSiteSettings();
      expect(getRes.settings.brand_name).toBe(updatedBrand);
      expect(getRes.settings.site_title).toBe(updatedTitle);
      expect(getRes.settings.wallpaper).toBe('cyber');
    });
  });

  describe('Discord Purchasing Settings Persistence', () => {
    it('saves discord destination urls and instructions', async () => {
      const customDiscordUrl = 'https://discord.gg/livingyuji-test';
      const saveRes = await saveDiscordSettings({
        main_server_url: customDiscordUrl,
        button_label_minecraft: 'Get on Discord Now',
      });

      expect(saveRes.settings.main_server_url).toBe(customDiscordUrl);
      expect(saveRes.settings.button_label_minecraft).toBe('Get on Discord Now');

      const getRes = await getDiscordSettings();
      expect(getRes.settings.main_server_url).toBe(customDiscordUrl);
      expect(getRes.settings.button_label_minecraft).toBe('Get on Discord Now');
    });
  });

  describe('Showcase Projects Lifecycle', () => {
    it('creates, retrieves, updates, and deletes showcase projects', async () => {
      const testId = `proj-test-${Date.now()}`;
      const newProj = {
        id: testId,
        title: 'Quantum Portal Engine',
        slug: 'quantum-portal-engine',
        category_id: 'web-apps',
        summary: 'High-speed 3D web portal engine.',
        description: 'Comprehensive WebGL portal simulation.',
        status: 'Released',
        featured: true,
        is_free: false,
        price: 29.99,
      };

      // 1. Create
      const created = await saveShowcaseProject(newProj);
      expect(created.project.id).toBe(testId);
      expect(created.project.title).toBe('Quantum Portal Engine');
      expect(created.project.price).toBe(29.99);

      // 2. Retrieve
      let { projects } = await getShowcaseProjects();
      const found = projects.find((p) => p.id === testId);
      expect(found).toBeDefined();
      expect(found?.title).toBe('Quantum Portal Engine');

      // 3. Update
      const updated = await saveShowcaseProject({
        id: testId,
        title: 'Quantum Portal Engine v2',
        price: 39.99,
      });
      expect(updated.project.title).toBe('Quantum Portal Engine v2');
      expect(updated.project.price).toBe(39.99);

      // 4. Delete
      const delRes = await deleteShowcaseProject(testId);
      expect(delRes.success).toBe(true);

      const afterDel = await getShowcaseProjects();
      expect(afterDel.projects.some((p) => p.id === testId)).toBe(false);
    });
  });

  describe('Minecraft Marketplace Products Lifecycle', () => {
    it('creates, retrieves, and deletes minecraft products', async () => {
      const testId = `prod-test-${Date.now()}`;
      const newProduct = {
        id: testId,
        name: 'VortexWeapons Deluxe',
        category: 'weapons',
        category_name: 'Custom Weapons & Abilities',
        short_desc: 'Mythical vortex weapons for Paper 1.21.4',
        price: 15.0,
        is_free: false,
        version: 'v1.0.0',
        creator: 'LivingYuji',
      };

      // 1. Save
      const saved = await saveMinecraftProduct(newProduct);
      expect(saved.product.id).toBe(testId);
      expect(saved.product.name).toBe('VortexWeapons Deluxe');
      expect(saved.product.price).toBe(15.0);
      expect(saved.product.is_free).toBe(false);

      // 2. Retrieve
      const { products } = await getMinecraftProducts();
      const found = products.find((p) => p.id === testId);
      expect(found).toBeDefined();
      expect(found?.name).toBe('VortexWeapons Deluxe');

      // 3. Delete
      const del = await deleteMinecraftProduct(testId);
      expect(del.success).toBe(true);

      const afterDel = await getMinecraftProducts();
      expect(afterDel.products.some((p) => p.id === testId)).toBe(false);
    });
  });

  describe('Music Library Catalog Persistence', () => {
    it('creates, retrieves with privacy filter, updates, and deletes music tracks', async () => {
      const testId = `track-test-${Date.now()}`;
      const track = {
        id: testId,
        title: 'Midnight Overdrive',
        artist: 'LivingYuji',
        album: 'Cybernetic Dreams',
        duration: '3:30',
        duration_sec: 210,
        genre: 'Synthwave',
        audio_url: 'https://cdn.livingyuji.com/audio/midnight.mp3',
        published: true,
        featured: false,
        track_order: 10,
      };

      // 1. Create track
      const saved = await saveMusicTrack(track);
      expect(saved.track.id).toBe(testId);
      expect(saved.track.title).toBe('Midnight Overdrive');

      // 2. Retrieve as Admin & as Public
      const adminCatalog = await getMusicTracks(true);
      expect(adminCatalog.tracks.some((t) => t.id === testId)).toBe(true);

      const publicCatalog = await getMusicTracks(false);
      expect(publicCatalog.tracks.some((t) => t.id === testId)).toBe(true);

      // 3. Unpublish track
      const updated = await updateMusicTrack(testId, { published: false });
      expect(updated.track.published).toBe(false);

      const publicAfterUnpublish = await getMusicTracks(false);
      expect(publicAfterUnpublish.tracks.some((t) => t.id === testId)).toBe(false);

      // 4. Delete track
      const del = await deleteMusicTrack(testId);
      expect(del.success).toBe(true);

      const adminAfterDel = await getMusicTracks(true);
      expect(adminAfterDel.tracks.some((t) => t.id === testId)).toBe(false);
    });
  });

  describe('Media Asset Catalog Persistence', () => {
    it('registers, retrieves, and deletes media assets', async () => {
      const testId = `media-test-${Date.now()}`;
      const asset = {
        id: testId,
        name: 'custom-banner.png',
        url: '/wallpapers/custom-banner.png',
        type: 'image',
        size: '1.2 MB',
      };

      const saved = await saveMediaAsset(asset);
      expect(saved.asset.id).toBe(testId);
      expect(saved.asset.name).toBe('custom-banner.png');

      const { assets } = await getMediaAssets();
      expect(assets.some((a) => a.id === testId)).toBe(true);

      const del = await deleteMediaAsset(testId);
      expect(del.success).toBe(true);

      const afterDel = await getMediaAssets();
      expect(afterDel.assets.some((a) => a.id === testId)).toBe(false);
    });
  });

  describe('Test isolation', () => {
    it('does not modify the tracked development data file', async () => {
      if (trackedDataBefore === null) return;
      const trackedDataAfter = await fs.readFile(
        path.join(process.cwd(), 'data', 'admin-store.json'),
        'utf8'
      );
      expect(trackedDataAfter).toBe(trackedDataBefore);
    });
  });
});
