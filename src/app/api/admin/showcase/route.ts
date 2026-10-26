import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth/adminAuth';
import {
  getShowcaseProjects,
  saveShowcaseProject,
  deleteShowcaseProject,
  resetShowcaseProjects,
} from '@/lib/storage/serverStore';

export const dynamic = 'force-dynamic';

function errorStatus(message: string): number {
  if (/browser-only URL|must be an absolute http\(s\) URL|root-relative media path|unapproved iframe provider|must be a URL string/i.test(message)) {
    return 400;
  }
  return /Apply the prepared migration|not configured in this production environment/i.test(message) ? 503 : 500;
}

export async function GET(req: NextRequest) {
  try {
    const forcePublic = (() => {
      try {
        return new URL(req.url).searchParams.get('scope') === 'public';
      } catch {
        return false;
      }
    })();
    const isAdmin = !forcePublic && (await isAuthenticatedAdmin(req));
    const result = await getShowcaseProjects(isAdmin);
    return NextResponse.json({
      success: true,
      projects: result.projects,
      source: result.source,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ success: false, error: message }, { status: errorStatus(message) });
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

    if (body?.action === 'reset') {
      const result = await resetShowcaseProjects(body.projects);
      return NextResponse.json({
        success: true,
        message: 'Showcase catalog reset and verified in persistent storage.',
        projects: result.projects,
        destination: result.destination,
      });
    }

    const hasId = typeof body?.id === 'string' && body.id.trim().length > 0;
    const hasTitle = typeof body?.title === 'string' && body.title.trim().length > 0;

    if (!hasId && !hasTitle) {
      return NextResponse.json(
        { success: false, error: 'Project title is required when creating a project.' },
        { status: 400 }
      );
    }

    const result = await saveShowcaseProject(body);

    return NextResponse.json({
      success: true,
      message: 'Showcase project saved and verified in persistent storage.',
      project: result.project,
      destination: result.destination,
      warning: result.warning,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save showcase project.';
    return NextResponse.json({ success: false, error: message }, { status: errorStatus(message) });
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
    return NextResponse.json({ success: false, error: message }, { status: errorStatus(message) });
  }
}
