-- ============================================================================
-- Phase B — Database schema & Supabase Storage foundation
--
-- STATUS: PREPARED ONLY.
-- Do not apply to a remote/production Supabase project without explicit review
-- and approval. Creating this file does not apply it anywhere.
--
-- Apply order:
--   1. Review the live project with the read-only checks in
--      docs/PHASE_B_SCHEMA_STORAGE_FOUNDATION.md.
--   2. Apply this migration.
--   3. Apply 20261026_security_admin_write_lockdown.sql (Phase A) afterwards.
--
-- This filename intentionally sorts before 20261026_security_admin_write_lockdown
-- so a normal `supabase db push` runs the missing tables before the Phase A
-- write-lockdown migration references public.music_tracks.
--
-- Safety properties:
--   * Additive and idempotent: CREATE TABLE/INDEX IF NOT EXISTS, ADD COLUMN IF
--     NOT EXISTS, DROP POLICY IF EXISTS before recreating policies.
--   * No DROP TABLE, DELETE, TRUNCATE, DROP SCHEMA, or Storage object deletion.
--   * RLS remains enabled on every application table touched here.
--   * Existing rows, non-null wallpaper values, existing buckets, and existing
--     Storage objects are preserved.
--   * Public Storage buckets are readable by known public URL only. There is no
--     broad anon/authenticated SELECT policy on storage.objects, so visitors
--     cannot list the buckets. Uploads, replacements, and deletions are
--     service-role-only.
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. ENQUIRIES
--
-- Exact fields written by src/app/api/enquiries/route.ts:
--   name, email, discord, category, title, budget, timeline, description,
--   links, submitted_at, status.
--
-- The API deliberately omits id, so the database supplies a UUID. Enquiries are
-- private: there is intentionally no anon/authenticated SELECT or write policy.
-- The route writes with the server-only service-role key.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    discord TEXT,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    budget TEXT,
    timeline TEXT,
    description TEXT NOT NULL,
    links TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_enquiries_submitted_at
    ON public.enquiries (submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_status
    ON public.enquiries (status);
CREATE INDEX IF NOT EXISTS idx_enquiries_status_submitted
    ON public.enquiries (status, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_email_lower
    ON public.enquiries (lower(email));

ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Remove only known/legacy enquiry policies. A public read policy must never be
-- present on this table.
DROP POLICY IF EXISTS "Public read enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admin write enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Service role manage enquiries" ON public.enquiries;

CREATE POLICY "Service role manage enquiries" ON public.enquiries
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

REVOKE ALL ON TABLE public.enquiries FROM PUBLIC;
REVOKE ALL ON TABLE public.enquiries FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.enquiries TO service_role;

-- ============================================================================
-- 2. MUSIC TRACKS
--
-- Matches src/lib/storage/serverStore.ts (MusicTrackRecord and saveMusicTrack)
-- and the existing canonical 20261025_music_library.sql definition.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.music_tracks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT NOT NULL,
    duration TEXT NOT NULL,
    duration_sec INTEGER NOT NULL DEFAULT 180,
    genre TEXT DEFAULT 'Cyber Lo-Fi',
    description TEXT,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    audio_url TEXT NOT NULL,
    cover_url TEXT,
    cover_gradient TEXT DEFAULT 'from-emerald-900 via-teal-950 to-slate-950',
    published BOOLEAN NOT NULL DEFAULT true,
    featured BOOLEAN NOT NULL DEFAULT false,
    track_order INTEGER NOT NULL DEFAULT 0,
    file_format TEXT NOT NULL DEFAULT 'mp3',
    file_size TEXT,
    storage_key TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_music_tracks_published
    ON public.music_tracks (published);
CREATE INDEX IF NOT EXISTS idx_music_tracks_album
    ON public.music_tracks (album);
CREATE INDEX IF NOT EXISTS idx_music_tracks_artist
    ON public.music_tracks (artist);
CREATE INDEX IF NOT EXISTS idx_music_tracks_created_at
    ON public.music_tracks (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_music_tracks_public_order
    ON public.music_tracks (published, track_order);

ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;

-- Replace the old policies (including the authenticated-write policy in
-- 20261025_music_library.sql/complete_setup.sql) with a public-read /
-- service-role-write model.
DROP POLICY IF EXISTS "Public read published music_tracks" ON public.music_tracks;
DROP POLICY IF EXISTS "Admin read all music_tracks" ON public.music_tracks;
DROP POLICY IF EXISTS "Admin write music_tracks" ON public.music_tracks;
DROP POLICY IF EXISTS "Service role write music_tracks" ON public.music_tracks;

CREATE POLICY "Public read published music_tracks" ON public.music_tracks
    FOR SELECT TO anon, authenticated
    USING (published = true);

-- Keep the policy name aligned with Phase A so its drop/create is idempotent
-- and the project ends with exactly one service-role write policy.
CREATE POLICY "Service role write music_tracks" ON public.music_tracks
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

REVOKE ALL ON TABLE public.music_tracks FROM PUBLIC;
REVOKE ALL ON TABLE public.music_tracks FROM anon, authenticated;
GRANT SELECT ON TABLE public.music_tracks TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.music_tracks TO service_role;

-- ============================================================================
-- 3. SITE SETTINGS — VIDEO WALLPAPER / DISPLAY COLUMNS
--
-- Defaults come from src/lib/storage/serverStore.ts and AdminPanelApp.tsx:
--   wallpaper_mode: cover | contain | tile, default cover
--   wallpaper_opacity: 0..100, UI default 85
--   video_wallpaper_muted: default true
--   custom_video_wallpaper_url: nullable durable public URL produced by the
--     authenticated Storage upload route. Browser blob:/local: sentinels are
--     rejected by application-level validation and must not be persisted here.
--
-- Existing non-null values are never overwritten. NULLs from an older/partial
-- schema are filled with the application defaults so the columns can be made
-- NOT NULL safely.
-- ============================================================================

ALTER TABLE public.site_settings
    ADD COLUMN IF NOT EXISTS custom_video_wallpaper_url TEXT,
    ADD COLUMN IF NOT EXISTS video_wallpaper_muted BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS wallpaper_mode TEXT NOT NULL DEFAULT 'cover',
    ADD COLUMN IF NOT EXISTS wallpaper_opacity INTEGER NOT NULL DEFAULT 85;

UPDATE public.site_settings
SET video_wallpaper_muted = true
WHERE video_wallpaper_muted IS NULL;

UPDATE public.site_settings
SET wallpaper_mode = 'cover'
WHERE wallpaper_mode IS NULL;

UPDATE public.site_settings
SET wallpaper_opacity = 85
WHERE wallpaper_opacity IS NULL;

ALTER TABLE public.site_settings
    ALTER COLUMN video_wallpaper_muted SET DEFAULT true,
    ALTER COLUMN video_wallpaper_muted SET NOT NULL,
    ALTER COLUMN wallpaper_mode SET DEFAULT 'cover',
    ALTER COLUMN wallpaper_mode SET NOT NULL,
    ALTER COLUMN wallpaper_opacity SET DEFAULT 85,
    ALTER COLUMN wallpaper_opacity SET NOT NULL;

-- NOT VALID keeps the migration safe if an older project contains out-of-range
-- values. New inserts/updates are still checked.
ALTER TABLE public.site_settings
    DROP CONSTRAINT IF EXISTS site_settings_wallpaper_mode_check;
ALTER TABLE public.site_settings
    ADD CONSTRAINT site_settings_wallpaper_mode_check
    CHECK (wallpaper_mode IN ('cover', 'contain', 'tile'))
    NOT VALID;

ALTER TABLE public.site_settings
    DROP CONSTRAINT IF EXISTS site_settings_wallpaper_opacity_check;
ALTER TABLE public.site_settings
    ADD CONSTRAINT site_settings_wallpaper_opacity_check
    CHECK (wallpaper_opacity BETWEEN 0 AND 100)
    NOT VALID;

-- ============================================================================
-- 4. STORAGE BUCKETS
--
-- Canonical bucket names match src/app/api/admin/diagnostics/route.ts and the
-- existing 20261025_complete_setup.sql migration:
--   music      — public audio files and cover art
--   wallpapers — public image/video wallpapers
--   showcase   — public project screenshots/media
--   media      — other public brand/general media
--
-- Music logical path prefixes:
--   audio/<track-id>/<safe-file-name>
--   covers/<track-id>/<safe-file-name>
--
-- Wallpaper logical path prefixes:
--   images/<safe-file-name>
--   videos/<safe-file-name>
--
-- Showcase logical path prefixes:
--   projects/<project-slug>/<safe-file-name>
--
-- Media logical path prefixes:
--   <category>/<safe-file-name>
--
-- ON CONFLICT only fills missing restrictions. It does not delete buckets,
-- replace existing non-null restrictions, or modify the public flag of an
-- existing bucket. The public flag remains an explicit per-bucket decision.
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    (
        'music',
        'music',
        true,
        52428800, -- 50 MiB
        ARRAY[
            'audio/mpeg',
            'audio/wav',
            'audio/x-wav',
            'audio/wave',
            'audio/ogg',
            'audio/flac',
            'audio/x-flac',
            'image/png',
            'image/jpeg',
            'image/webp'
        ]::text[]
    ),
    (
        'wallpapers',
        'wallpapers',
        true,
        104857600, -- 100 MiB
        ARRAY[
            'image/png',
            'image/jpeg',
            'image/webp',
            'image/avif',
            'video/mp4',
            'video/webm'
        ]::text[]
    ),
    (
        'showcase',
        'showcase',
        true,
        26214400, -- 25 MiB
        ARRAY[
            'image/png',
            'image/jpeg',
            'image/webp',
            'image/avif'
        ]::text[]
    ),
    (
        'media',
        'media',
        true,
        52428800, -- 50 MiB
        ARRAY[
            'image/png',
            'image/jpeg',
            'image/webp',
            'image/avif',
            'image/x-icon',
            'image/vnd.microsoft.icon',
            'video/mp4',
            'video/webm',
            'application/pdf'
        ]::text[]
    )
ON CONFLICT (id) DO UPDATE
SET file_size_limit = COALESCE(storage.buckets.file_size_limit, EXCLUDED.file_size_limit),
    allowed_mime_types = COALESCE(storage.buckets.allowed_mime_types, EXCLUDED.allowed_mime_types);

-- Remove legacy broad policies. These names come from the earlier setup
-- migrations and from the Phase A lockdown migration.
DROP POLICY IF EXISTS "Public access to music bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public access to OS assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload to music bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload to OS assets" ON storage.objects;
DROP POLICY IF EXISTS "Service role write OS assets" ON storage.objects;

-- Explicit service-role write policy for the four public buckets. There is
-- intentionally no anon/authenticated INSERT/UPDATE/DELETE policy. RLS remains
-- enabled on storage.objects; service_role bypasses RLS as Supabase intends,
-- and this policy documents the allowed buckets.
CREATE POLICY "Service role write OS assets" ON storage.objects
    FOR ALL TO service_role
    USING (bucket_id IN ('music', 'wallpapers', 'showcase', 'media'))
    WITH CHECK (bucket_id IN ('music', 'wallpapers', 'showcase', 'media'));

-- No public SELECT policy is created on storage.objects. Public rendering uses
-- the public object URL, which is available only because the four buckets above
-- are explicitly public. Bucket listing and object metadata remain private.
-- For a future private bucket (for example compiled product downloads), create
-- it separately and issue short-lived signed URLs from a server-only route.

COMMIT;
