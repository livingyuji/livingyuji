import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth/adminAuth';
import { getShowcaseProjects, saveShowcaseProject, deleteShowcaseProject } from '@/lib/storage/serverStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await getShowcaseProjects();
    return NextResponse.json({
      success: true,
      projects: result.projects,
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
    const { title } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Project title is required.' }, { status: 400 });
    }

    const result = await saveShowcaseProject(body);

    return NextResponse.json({
      success: true,
      message: 'Showcase project saved and persisted successfully.',
      project: result.project,
      destination: result.destination,
      warning: result.warning,
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

    const result = await deleteShowcaseProject(id);
    return NextResponse.json({
      success: true,
      message: `Project ${id} deleted successfully.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete showcase project.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
