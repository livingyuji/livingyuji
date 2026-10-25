import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth/adminAuth';
import { createServiceClient, createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const DEFAULT_SETTINGS = {
  id: 'default',
  brand_name: 'LivingYuji',
  site_title: 'LivingYuji OS — Windows-Inspired Web Operating System & Portfolio',
  wallpaper: 'matrix',
  accent_color: '#0078D4',
  theme: 'dark',
  custom_logo_url: '/avatar.png',
  custom_favicon_url: '/favicon.png',
  custom_wallpaper_url: 'https://in.pinterest.com/pin/759208449671054524/',
};

export async function GET() {
  try {
    const supabase = await createServerClient();
    if (!supabase) {
      return NextResponse.json({ success: true, settings: DEFAULT_SETTINGS, source: 'fallback' });
    }

    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ success: true, settings: DEFAULT_SETTINGS, source: 'default' });
    }

    return NextResponse.json({ success: true, settings: data, source: 'cloud' });
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
    const {
      brand_name,
      site_title,
      wallpaper,
      accent_color,
      theme,
      custom_logo_url,
      custom_favicon_url,
      custom_wallpaper_url,
    } = body;

    const supabase = await createServiceClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database service role client unavailable.' },
        { status: 500 }
      );
    }

    const payload = {
      id: 'default',
      brand_name: typeof brand_name === 'string' ? brand_name : 'LivingYuji',
      site_title: typeof site_title === 'string' ? site_title : DEFAULT_SETTINGS.site_title,
      wallpaper: typeof wallpaper === 'string' ? wallpaper : 'matrix',
      accent_color: typeof accent_color === 'string' ? accent_color : '#0078D4',
      theme: typeof theme === 'string' ? theme : 'dark',
      custom_logo_url: custom_logo_url || null,
      custom_favicon_url: custom_favicon_url || null,
      custom_wallpaper_url: custom_wallpaper_url || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('site_settings')
      .upsert(payload)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Website branding and appearance updated successfully.',
      settings: data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update branding settings.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
