import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth/adminAuth';
import { getMinecraftProducts, saveMinecraftProduct, deleteMinecraftProduct } from '@/lib/storage/serverStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await getMinecraftProducts();
    return NextResponse.json({
      success: true,
      products: result.products,
      source: result.source,
    });
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
    const { name } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Product name is required.' }, { status: 400 });
    }

    const result = await saveMinecraftProduct(body);

    return NextResponse.json({
      success: true,
      message: 'Product saved and persisted successfully.',
      product: result.product,
      destination: result.destination,
      warning: result.warning,
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

    const result = await deleteMinecraftProduct(id);
    return NextResponse.json({
      success: true,
      message: `Product ${id} deleted successfully.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete product.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
