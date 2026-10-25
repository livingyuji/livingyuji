import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth/adminAuth';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'icon' | 'document' | 'video';
  size?: string;
  createdAt: string;
}

const DEFAULT_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: 'media-logo',
    name: 'livingyuji-emblem.svg',
    url: '/icons/logo.svg',
    type: 'icon',
    size: '12 KB',
    createdAt: '2026-10-20',
  },
  {
    id: 'media-favicon',
    name: 'favicon.ico',
    url: '/favicon.ico',
    type: 'icon',
    size: '15 KB',
    createdAt: '2026-10-20',
  },
  {
    id: 'media-wallpaper-matrix',
    name: 'wallpaper-matrix.png',
    url: '/wallpapers/matrix.png',
    type: 'image',
    size: '1.4 MB',
    createdAt: '2026-10-22',
  },
  {
    id: 'media-wallpaper-cyber',
    name: 'wallpaper-cyber.png',
    url: '/wallpapers/cyber.png',
    type: 'image',
    size: '2.1 MB',
    createdAt: '2026-10-22',
  },
];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      assets: DEFAULT_MEDIA_ASSETS,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
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
    const { name, url, type, size } = body;

    if (!name || !url) {
      return NextResponse.json({ success: false, error: 'Name and URL are required.' }, { status: 400 });
    }

    const newAsset: MediaAsset = {
      id: `media-${Date.now()}`,
      name: name.trim(),
      url: url.trim(),
      type: type || 'image',
      size: size || 'Unknown',
      createdAt: new Date().toISOString().split('T')[0],
    };

    return NextResponse.json({
      success: true,
      message: 'Media asset registered successfully.',
      asset: newAsset,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to register media asset.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
