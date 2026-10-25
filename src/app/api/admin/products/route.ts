import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth/adminAuth';
import { createServiceClient, createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createServerClient();
    if (!supabase) {
      return NextResponse.json({ success: true, products: [], source: 'fallback' });
    }

    const { data, error } = await supabase
      .from('minecraft_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, products: data || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Server-verified admin check
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
      name,
      category,
      category_name,
      short_desc,
      full_desc,
      price,
      is_free,
      version,
      mc_versions,
      server_software,
      dependencies,
      features,
      installation_steps,
      changelog,
      file_format,
      file_size,
      creator,
      published,
      featured,
      rating,
      downloads_count,
      icon_bg,
      icon_symbol,
      download_url,
      direct_file_path,
    } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Product name is required.' }, { status: 400 });
    }

    const supabase = await createServiceClient();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database service unavailable.' }, { status: 500 });
    }

    const productId = id || `prod-${Date.now()}`;
    const productRecord = {
      id: productId,
      name: name.trim(),
      category: category || 'plugins',
      category_name: category_name || 'Plugins',
      short_desc: short_desc || '',
      full_desc: full_desc || '',
      price: typeof price === 'number' ? price : parseFloat(price) || 0,
      is_free: is_free === true || price === 0,
      version: version || 'v1.0.0',
      mc_versions: Array.isArray(mc_versions) ? mc_versions : ['1.21.4'],
      server_software: Array.isArray(server_software) ? server_software : ['Paper', 'Purpur'],
      dependencies: Array.isArray(dependencies) ? dependencies : [],
      features: Array.isArray(features) ? features : [],
      installation_steps: Array.isArray(installation_steps) ? installation_steps : [],
      changelog: changelog || '',
      file_format: file_format || '.zip',
      file_size: file_size || '1 MB',
      creator: creator || 'LivingYuji',
      published: published !== false,
      featured: featured === true,
      rating: typeof rating === 'number' ? rating : 5.0,
      downloads_count: typeof downloads_count === 'number' ? downloads_count : 0,
      icon_bg: icon_bg || 'from-blue-600 to-indigo-900',
      icon_symbol: icon_symbol || '⚡',
      download_url: download_url || null,
      direct_file_path: direct_file_path || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('minecraft_products')
      .upsert(productRecord)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Product saved successfully.',
      product: data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save product.';
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
      return NextResponse.json({ success: false, error: 'Product ID is required.' }, { status: 400 });
    }

    const supabase = await createServiceClient();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database service unavailable.' }, { status: 500 });
    }

    const { error } = await supabase.from('minecraft_products').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Product ${id} deleted successfully.` });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete product.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
