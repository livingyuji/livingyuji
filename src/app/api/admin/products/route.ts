import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth/adminAuth';
import { getMinecraftProducts, saveMinecraftProduct, deleteMinecraftProduct } from '@/lib/storage/serverStore';

export const dynamic = 'force-dynamic';

function errorStatus(message: string): number {
  if (/browser-only URL|must be an absolute http\(s\) URL|root-relative media path|unapproved iframe provider|must be a URL string/i.test(message)) {
    return 400;
  }
  return /Apply the prepared migration|not configured in this production environment/i.test(message) ? 503 : 500;
}

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await isAuthenticatedAdmin(req);
    const result = await getMinecraftProducts(isAdmin);
    return NextResponse.json({
      success: true,
      products: result.products,
      source: result.source,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ success: false, error: message }, { status: errorStatus(message) });
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
    const hasId = typeof body?.id === 'string' && body.id.trim().length > 0;
    const hasName = typeof body?.name === 'string' && body.name.trim().length > 0;

    if (!hasId && !hasName) {
      return NextResponse.json(
        { success: false, error: 'Product name is required when creating a product.' },
        { status: 400 }
      );
    }

    const result = await saveMinecraftProduct(body);

    return NextResponse.json({
      success: true,
      message: 'Product saved and verified in persistent storage.',
      product: result.product,
      destination: result.destination,
      warning: result.warning,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save product.';
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
      return NextResponse.json({ success: false, error: 'Product ID is required.' }, { status: 400 });
    }

    const result = await deleteMinecraftProduct(id);
    return NextResponse.json({
      success: true,
      message: `Product ${id} deleted successfully.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete product.';
    return NextResponse.json({ success: false, error: message }, { status: errorStatus(message) });
  }
}
