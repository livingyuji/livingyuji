-- ====================================================================
-- LivingYuji OS — Complete Database & Storage Setup Migration
-- Date: 2026-10-25
-- Description: Sets up all tables, RLS policies, indexes, and storage
--              buckets required for complete cloud persistence.
-- Run this in your Supabase SQL Editor if any tables or buckets are missing.
-- ====================================================================

-- 1. EXTEND SITE SETTINGS FOR VIDEO WALLPAPER & ADVANCED APPEARANCE
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS custom_video_wallpaper_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS video_wallpaper_muted BOOLEAN DEFAULT true;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS wallpaper_mode TEXT DEFAULT 'cover';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS wallpaper_opacity INTEGER DEFAULT 85;

-- 2. MUSIC TRACKS TABLE
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for music tracks
CREATE INDEX IF NOT EXISTS idx_music_tracks_published ON public.music_tracks(published);
CREATE INDEX IF NOT EXISTS idx_music_tracks_album ON public.music_tracks(album);
CREATE INDEX IF NOT EXISTS idx_music_tracks_artist ON public.music_tracks(artist);
CREATE INDEX IF NOT EXISTS idx_music_tracks_created_at ON public.music_tracks(created_at DESC);

-- Enable RLS on music_tracks
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to allow clean re-runs
DROP POLICY IF EXISTS "Public read published music_tracks" ON public.music_tracks;
DROP POLICY IF EXISTS "Admin read all music_tracks" ON public.music_tracks;
DROP POLICY IF EXISTS "Admin write music_tracks" ON public.music_tracks;

-- Policies for music_tracks
CREATE POLICY "Public read published music_tracks" ON public.music_tracks
    FOR SELECT USING (published = true);

CREATE POLICY "Admin read all music_tracks" ON public.music_tracks
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Admin write music_tracks" ON public.music_tracks
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 2. STORAGE BUCKETS SETUP (Public buckets for OS assets)
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('music', 'music', true),
    ('wallpapers', 'wallpapers', true),
    ('showcase', 'showcase', true),
    ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage object policies
DROP POLICY IF EXISTS "Public access to music bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload to music bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public access to OS assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload to OS assets" ON storage.objects;

CREATE POLICY "Public access to OS assets" ON storage.objects
    FOR SELECT USING (bucket_id IN ('music', 'wallpapers', 'showcase', 'media'));

CREATE POLICY "Admin upload to OS assets" ON storage.objects
    FOR ALL USING (
        bucket_id IN ('music', 'wallpapers', 'showcase', 'media') 
        AND (auth.role() = 'authenticated' OR auth.role() = 'service_role')
    );
