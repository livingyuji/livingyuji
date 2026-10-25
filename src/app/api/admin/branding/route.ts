import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth/adminAuth';
import { getSiteSettings, saveSiteSettings } from '@/lib/storage/serverStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await getSiteSettings();
    return NextResponse.json({
      success: true,
      settings: result.settings,
      source: result.source,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // 1. Strict Server-Side Authentication
  const authenticated = await isAuthenticatedAdmin(req);
  if (!authenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Valid administrator session required.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const result = await saveSiteSettings(body);

    return NextResponse.json({
      success: true,
      message: 'Website branding and appearance updated successfully.',
      settings: result.settings,
      destination: result.destination,
      warning: result.warning,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update branding settings.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
