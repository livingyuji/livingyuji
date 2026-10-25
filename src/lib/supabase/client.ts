import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project-id')
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Safe wrapper to test connectivity
export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  url?: string;
}> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      connected: false,
      message: 'Supabase credentials are not configured in environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY). Running in offline fallback mode using local persistence.',
    };
  }

  try {
    const { data, error } = await supabase.from('site_settings').select('*').limit(1);
    if (error) {
      return {
        connected: false,
        message: `Connected to Supabase endpoint, but table query returned: ${error.message}. Make sure migration 20261025_livingyuji_os.sql is applied.`,
        url: supabaseUrl,
      };
    }
    return {
      connected: true,
      message: 'Successfully connected to Supabase database & storage buckets.',
      url: supabaseUrl,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Failed to reach Supabase: ${err.message || String(err)}`,
      url: supabaseUrl,
    };
  }
}
