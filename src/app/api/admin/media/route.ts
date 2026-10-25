import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth/adminAuth';
import { getMediaAssets, saveMediaAsset, deleteMediaAsset } from '@/lib/storage/serverStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await getMediaAssets();
    return NextResponse.json({
      success: true,
      assets: result.assets,
      source: result.source,
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
    const { name, url } = body;

    if (!name || !url) {
      return NextResponse.json({ success: false, error: 'Name and URL are required.' }, { status: 400 });
    }

    const result = await saveMediaAsset(body);

    return NextResponse.json({
      success: true,
      message: 'Media asset registered and persisted successfully.',
      asset: result.asset,
      destination: result.destination,
      warning: result.warning,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to register media asset.';
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
      return NextResponse.json({ success: false, error: 'Asset ID is required.' }, { status: 400 });
    }

    await deleteMediaAsset(id);

    return NextResponse.json({
      success: true,
      message: `Media asset ${id} deleted successfully.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete media asset.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
