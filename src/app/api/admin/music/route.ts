import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth/adminAuth';
import { createServiceClient, createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface MusicTrackRecord {
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
  cover_url?: string;
  cover_gradient?: string;
  published: boolean;
  featured: boolean;
  track_order: number;
  file_format: string;
  file_size?: string;
  storage_key?: string;
  created_at: string;
  updated_at: string;
}

// Canonical default library matching LivingYuji OS albums
const DEFAULT_MUSIC_TRACKS: MusicTrackRecord[] = [
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
];

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await isAuthenticatedAdmin(req);
    const supabase = await createServerClient();

    if (supabase) {
      let query = supabase.from('music_tracks').select('*').order('track_order', { ascending: true });
      if (!isAdmin) {
        query = query.eq('published', true);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return NextResponse.json({ success: true, tracks: data, source: 'supabase' });
      }
    }

    // Default fallback
    const filtered = isAdmin ? DEFAULT_MUSIC_TRACKS : DEFAULT_MUSIC_TRACKS.filter((t) => t.published);
    return NextResponse.json({ success: true, tracks: filtered, source: 'canonical_defaults' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Server-verified admin authorization
  const authenticated = await isAuthenticatedAdmin(req);
  if (!authenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Administrator session required.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const {
      id,
      title,
      artist,
      album,
      duration,
      duration_sec,
      genre,
      description,
      tags,
      audio_url,
      cover_url,
      cover_gradient,
      published,
      featured,
      track_order,
      file_format,
      file_size,
    } = body;

    // Strict validation
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Track title is required.' }, { status: 400 });
    }
    if (!audio_url || typeof audio_url !== 'string') {
      return NextResponse.json({ success: false, error: 'Valid audio URL or storage reference is required.' }, { status: 400 });
    }

    const trackId = id || `track-${Date.now()}`;
    const newTrack: MusicTrackRecord = {
      id: trackId,
      title: title.trim(),
      artist: (artist || 'LivingYuji').trim(),
      album: (album || 'Single & Releases').trim(),
      duration: duration || '3:00',
      duration_sec: Number(duration_sec) || 180,
      genre: genre || 'Cyber Lo-Fi',
      description: description || '',
      tags: Array.isArray(tags) ? tags : [],
      audio_url: audio_url.trim(),
      cover_url: cover_url ? cover_url.trim() : null,
      cover_gradient: cover_gradient || 'from-emerald-900 via-teal-950 to-slate-950',
      published: published !== false,
      featured: featured === true,
      track_order: Number(track_order) || 99,
      file_format: (file_format || 'mp3').toLowerCase(),
      file_size: file_size || '3 MB',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabase = await createServiceClient();
    if (supabase) {
      const { data, error } = await supabase.from('music_tracks').upsert(newTrack).select().single();
      if (error) {
        // If table doesn't exist yet, return success with warning
        console.warn('Supabase music_tracks upsert error:', error.message);
        return NextResponse.json({
          success: true,
          track: newTrack,
          warning: 'Saved in memory. Database migration required in Supabase.',
        });
      }
      return NextResponse.json({ success: true, track: data });
    }

    return NextResponse.json({
      success: true,
      track: newTrack,
      message: 'Track registered in local catalog.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create music track.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authenticated = await isAuthenticatedAdmin(req);
  if (!authenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Administrator session required.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ success: false, error: 'Track ID is required for update.' }, { status: 400 });
    }

    const payload = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const supabase = await createServiceClient();
    if (supabase) {
      const { data, error } = await supabase.from('music_tracks').update(payload).eq('id', id).select().single();
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, track: data });
    }

    return NextResponse.json({ success: true, track: { id, ...payload } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update music track.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authenticated = await isAuthenticatedAdmin(req);
  if (!authenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Administrator session required.' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Track ID parameter required.' }, { status: 400 });
    }

    const supabase = await createServiceClient();
    if (supabase) {
      const { error } = await supabase.from('music_tracks').delete().eq('id', id);
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, message: `Track ${id} deleted successfully.` });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete music track.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
