import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth/adminAuth';
import { createServiceClient, createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createServerClient();
    if (!supabase) {
      return NextResponse.json({ success: true, projects: [], source: 'fallback' });
    }

    const { data, error } = await supabase
      .from('showcase_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, projects: data || [] });
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
    const {
      id,
      title,
      slug,
      category_id,
      summary,
      description,
      features,
      technologies,
      status,
      featured,
      is_free,
      price,
      version,
      gradient_bg,
      icon_symbol,
      links,
      compatibility,
      screenshots,
      changelog,
      install_guide,
    } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Project title is required.' }, { status: 400 });
    }

    const supabase = await createServiceClient();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database service unavailable.' }, { status: 500 });
    }

    const projectId = id || `proj-${Date.now()}`;
    const projectSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const record = {
      id: projectId,
      title: title.trim(),
      slug: projectSlug,
      category_id: category_id || 'web-apps',
      summary: summary || '',
      description: description || '',
      features: Array.isArray(features) ? features : [],
      technologies: Array.isArray(technologies) ? technologies : [],
      status: status || 'Released',
      featured: featured === true,
      is_free: is_free !== false,
      price: typeof price === 'number' ? price : parseFloat(price) || 0,
      version: version || 'v1.0.0',
      gradient_bg: gradient_bg || 'from-blue-600 to-indigo-900',
      icon_symbol: icon_symbol || '⚡',
      links: links || {},
      compatibility: compatibility || {},
      screenshots: Array.isArray(screenshots) ? screenshots : [],
      changelog: changelog || [],
      install_guide: install_guide || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('showcase_projects')
      .upsert(record)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Showcase project saved successfully.',
      project: data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save showcase project.';
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
      return NextResponse.json({ success: false, error: 'Project ID is required.' }, { status: 400 });
    }

    const supabase = await createServiceClient();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database service unavailable.' }, { status: 500 });
    }

    const { error } = await supabase.from('showcase_projects').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Project ${id} deleted successfully.` });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete project.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
