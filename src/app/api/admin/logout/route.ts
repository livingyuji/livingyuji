import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, SUPABASE_COOKIE_NAME } from '@/lib/auth/adminAuth';

export async function POST(req: NextRequest) {
  const isJson = req.headers.get('accept')?.includes('application/json') || req.headers.get('content-type')?.includes('application/json');

  if (isJson) {
    const res = NextResponse.json({ success: true, message: 'Logged out successfully' }, { status: 200 });
    res.cookies.delete(ADMIN_COOKIE_NAME);
    res.cookies.delete(SUPABASE_COOKIE_NAME);
    return res;
  }

  const res = NextResponse.redirect(new URL('/admin?message=logged_out', req.url));
  res.cookies.delete(ADMIN_COOKIE_NAME);
  res.cookies.delete(SUPABASE_COOKIE_NAME);
  return res;
}
