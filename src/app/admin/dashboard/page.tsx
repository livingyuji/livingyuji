import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  verifySessionToken,
  isAdminAuthConfigured,
  isAuthorizedAdminUser,
  ADMIN_COOKIE_NAME,
  SUPABASE_COOKIE_NAME,
} from '@/lib/auth/adminAuth';
import { AdminDashboardClient } from './AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const supabaseToken = cookieStore.get(SUPABASE_COOKIE_NAME)?.value;

  let isAuthorized = verifySessionToken(sessionToken);

  // If session token not valid, check Supabase token. Gated on the admin auth
  // configuration so a production deployment missing its secrets fails closed.
  if (!isAuthorized && supabaseToken && isAdminAuthConfigured()) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
        const { data, error } = await supabase.auth.getUser(supabaseToken);
        if (!error && data.user && isAuthorizedAdminUser(data.user)) {
          isAuthorized = true;
        }
      } catch {
        isAuthorized = false;
      }
    }
  }

  // Strict server-side redirection if unauthorized
  if (!isAuthorized) {
    redirect('/admin?returnTo=/admin/dashboard&error=session_required');
  }

  return <AdminDashboardClient />;
}
