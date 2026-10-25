import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authenticated = await isAuthenticatedAdmin(req);
  return NextResponse.json({ authenticated }, { status: 200 });
}
