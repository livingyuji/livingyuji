-- ============================================================================
-- Phase A security hardening: administrator write lockdown
--
-- STATUS: PREPARED ONLY. Do not apply to a remote Supabase project without
-- explicit approval.
--
-- Problem addressed:
--   The original write policies allowed ANY authenticated Supabase account to
--   insert/update/delete administrator-owned rows. Because public signup is
--   enabled, a self-registered visitor could modify site settings, showcase
--   projects, products, music, media, and storage objects.
--
-- Fix:
--   Administrator writes are server-only. Every admin API route already writes
--   through the Supabase service role key (`createServiceClient`), which
--   bypasses RLS. Browser clients use the anon key and therefore cannot write.
--   Read policies are intentionally left untouched.
--
-- Notes:
--   * RLS remains enabled on every table.
--   * No rows, buckets, or read policies are modified.
--   * `desktop_layouts` is written from the browser today. That write already
--     fails under the current RLS policy (the browser has no authenticated
--     session), so this migration does not regress it. If cloud layout sync is
--     wanted later, it needs an explicit user-scoped policy or server route.
--   * The statements are idempotent: safe to re-run.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- Core OS tables
-- ----------------------------------------------------------------------------
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discord_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.desktop_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minecraft_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin write site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Service role write site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin write discord_settings" ON public.discord_settings;
DROP POLICY IF EXISTS "Service role write discord_settings" ON public.discord_settings;
DROP POLICY IF EXISTS "Admin write desktop_layouts" ON public.desktop_layouts;
DROP POLICY IF EXISTS "Service role write desktop_layouts" ON public.desktop_layouts;
DROP POLICY IF EXISTS "Admin write project_files" ON public.project_files;
DROP POLICY IF EXISTS "Service role write project_files" ON public.project_files;
DROP POLICY IF EXISTS "Admin write minecraft_products" ON public.minecraft_products;
DROP POLICY IF EXISTS "Service role write minecraft_products" ON public.minecraft_products;
DROP POLICY IF EXISTS "Admin write media_library" ON public.media_library;
DROP POLICY IF EXISTS "Service role write media_library" ON public.media_library;

CREATE POLICY "Service role write site_settings" ON public.site_settings
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role write discord_settings" ON public.discord_settings
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role write desktop_layouts" ON public.desktop_layouts
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role write project_files" ON public.project_files
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role write minecraft_products" ON public.minecraft_products
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role write media_library" ON public.media_library
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Showcase tables
-- ----------------------------------------------------------------------------
ALTER TABLE public.showcase_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showcase_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin Full Access for Showcase Categories" ON public.showcase_categories;
DROP POLICY IF EXISTS "Service role write showcase_categories" ON public.showcase_categories;
DROP POLICY IF EXISTS "Admin Full Access for Showcase Projects" ON public.showcase_projects;
DROP POLICY IF EXISTS "Service role write showcase_projects" ON public.showcase_projects;

CREATE POLICY "Service role write showcase_categories" ON public.showcase_categories
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role write showcase_projects" ON public.showcase_projects
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Music table
-- ----------------------------------------------------------------------------
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin write music_tracks" ON public.music_tracks;
DROP POLICY IF EXISTS "Service role write music_tracks" ON public.music_tracks;

CREATE POLICY "Service role write music_tracks" ON public.music_tracks
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Storage objects (upload / overwrite / delete)
-- Buckets themselves are public for reads and are not changed here.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admin upload to OS assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload to music bucket" ON storage.objects;
DROP POLICY IF EXISTS "Service role write OS assets" ON storage.objects;

CREATE POLICY "Service role write OS assets" ON storage.objects
  FOR ALL TO service_role
  USING (bucket_id IN ('music', 'wallpapers', 'showcase', 'media'))
  WITH CHECK (bucket_id IN ('music', 'wallpapers', 'showcase', 'media'));

COMMIT;
