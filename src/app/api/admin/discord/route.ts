import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth/adminAuth';
import { getDiscordSettings, saveDiscordSettings } from '@/lib/storage/serverStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await getDiscordSettings();
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
  const authenticated = await isAuthenticatedAdmin(req);
  if (!authenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Administrator session required.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const result = await saveDiscordSettings(body);

    return NextResponse.json({
      success: true,
      message: 'Discord settings persisted successfully.',
      settings: result.settings,
      destination: result.destination,
      warning: result.warning,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save Discord settings.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
