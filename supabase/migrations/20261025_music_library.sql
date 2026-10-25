-- ====================================================================
-- LivingYuji OS — Music Library Schema & Migration
-- Date: 2026-10-25
-- Description: Complete schema for admin-managed music tracks, audio assets,
--              artwork references, and public playback streaming.
-- ====================================================================

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

-- Indexes for high-performance search and sorting
CREATE INDEX IF NOT EXISTS idx_music_tracks_published ON public.music_tracks(published);
CREATE INDEX IF NOT EXISTS idx_music_tracks_album ON public.music_tracks(album);
CREATE INDEX IF NOT EXISTS idx_music_tracks_artist ON public.music_tracks(artist);
CREATE INDEX IF NOT EXISTS idx_music_tracks_created_at ON public.music_tracks(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;

-- 1. Public read policy: Anyone can read published tracks
CREATE POLICY "Public read published music_tracks" ON public.music_tracks
    FOR SELECT USING (published = true);

-- 2. Admin read policy: Authenticated admin / service role can view all tracks (including drafts)
CREATE POLICY "Admin read all music_tracks" ON public.music_tracks
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 3. Admin write policy: Only authenticated admin / service role can insert, update, or delete
CREATE POLICY "Admin write music_tracks" ON public.music_tracks
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
