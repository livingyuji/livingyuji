import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth/adminAuth';
import {
  getMusicTracks,
  saveMusicTrack,
  updateMusicTrack,
  deleteMusicTrack,
} from '@/lib/storage/serverStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await isAuthenticatedAdmin(req);
    const result = await getMusicTracks(isAdmin);
    return NextResponse.json({
      success: true,
      tracks: result.tracks,
      source: result.source,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authenticated = await isAuthenticatedAdmin(req);
  if (!authenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Administrator session required.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { title, audio_url } = body;

    // Strict validation
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Track title is required.' }, { status: 400 });
    }
    if (!audio_url || typeof audio_url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid audio URL or storage reference is required.' },
        { status: 400 }
      );
    }

    const result = await saveMusicTrack(body);

    return NextResponse.json({
      success: true,
      message: 'Music track saved and persisted successfully.',
      track: result.track,
      destination: result.destination,
      warning: result.warning,
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

    const result = await updateMusicTrack(id, updates);

    return NextResponse.json({
      success: true,
      message: 'Music track updated successfully.',
      track: result.track,
      destination: result.destination,
      warning: result.warning,
    });
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

    const result = await deleteMusicTrack(id);
    return NextResponse.json({
      success: true,
      message: `Track ${id} deleted successfully.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete music track.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
