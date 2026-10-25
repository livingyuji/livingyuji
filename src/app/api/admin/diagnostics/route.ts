import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin, signSessionToken, verifySessionToken } from '@/lib/auth/adminAuth';
import { createServiceClient } from '@/lib/supabase/server';
import { getLocalStore } from '@/lib/storage/serverStore';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // 1. Authenticate admin
  const authenticated = await isAuthenticatedAdmin(req);
  if (!authenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Administrator session required to view diagnostics.' },
      { status: 401 }
    );
  }

  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    overall_status: 'healthy',
  };

  // 2. Environment Configuration Check (Secrets strictly masked)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const passphrase = process.env.ADMIN_ACCESS_PASSPHRASE;
  const secret = process.env.ADMIN_SESSION_SECRET;

  let isValidUrl = false;
  let maskedHost = 'not_configured';
  if (supabaseUrl) {
    try {
      const u = new URL(supabaseUrl);
      isValidUrl = u.protocol === 'http:' || u.protocol === 'https:';
      maskedHost = u.host;
    } catch {
      isValidUrl = false;
    }
  }

  results.environment = {
    supabase_url: {
      configured: Boolean(supabaseUrl),
      valid_format: isValidUrl,
      host: maskedHost,
    },
    supabase_anon_key: {
      configured: Boolean(anonKey),
      valid_format: Boolean(anonKey && anonKey.split('.').length === 3),
      length: anonKey ? anonKey.length : 0,
    },
    supabase_service_role_key: {
      configured: Boolean(serviceKey),
      valid_format: Boolean(serviceKey && serviceKey.split('.').length === 3),
      length: serviceKey ? serviceKey.length : 0,
    },
    admin_access_passphrase: {
      configured: Boolean(passphrase),
      is_custom: Boolean(passphrase && passphrase !== 'livingyuji-admin-2026'),
      length: passphrase ? passphrase.length : 0,
    },
    admin_session_secret: {
      configured: Boolean(secret),
      length: secret ? secret.length : 0,
    },
  };

  // 3. Authentication & HMAC Token Verification Check
  try {
    const testToken = signSessionToken();
    const tokenValid = verifySessionToken(testToken);
    results.authentication = {
      active_session: true,
      hmac_token_generation: 'ok',
      hmac_token_verification: tokenValid ? 'ok' : 'failed',
      session_ttl_hours: 24,
    };
  } catch (err: any) {
    results.authentication = {
      active_session: true,
      hmac_token_generation: 'error',
      error: err.message,
    };
    results.overall_status = 'degraded';
  }

  // 4. Database Table Connectivity Checks
  const expectedTables = [
    'site_settings',
    'music_tracks',
    'minecraft_products',
    'showcase_projects',
    'discord_settings',
    'media_library',
  ];

  results.database = {
    connected: false,
    tables: {} as Record<string, any>,
  };

  let supabase: any = null;
  try {
    supabase = await createServiceClient();
  } catch (err: any) {
    results.database.client_error = err.message;
  }

  if (supabase) {
    results.database.connected = true;
    for (const table of expectedTables) {
      try {
        const { data, count, error, status } = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .limit(1);

        if (error) {
          results.database.tables[table] = {
            status: error.code === 'PGRST205' ? 'missing_table' : 'error',
            error_code: error.code,
            message: error.message,
            http_status: status,
          };
          if (error.code === 'PGRST205') {
            results.overall_status = 'degraded';
          }
        } else {
          results.database.tables[table] = {
            status: 'ok',
            row_count: count ?? data?.length ?? 0,
            has_records: (count ?? data?.length ?? 0) > 0,
          };
        }
      } catch (err: any) {
        results.database.tables[table] = {
          status: 'exception',
          message: err.message,
        };
        results.overall_status = 'degraded';
      }
    }

    // 5. Safe Isolated Reversible Canary Write Test
    const canaryId = `canary-test-${Date.now()}`;
    results.canary_write_test = {
      attempted: true,
      write_ok: false,
      read_ok: false,
      cleanup_ok: false,
    };

    try {
      const insertRes = await supabase.from('site_settings').insert({
        id: canaryId,
        brand_name: 'Diagnostic Canary',
        site_title: 'LivingYuji OS Canary Test',
        wallpaper: 'matrix',
        accent_color: '#0078D4',
        theme: 'dark',
      }).select().single();

      if (!insertRes.error && insertRes.data) {
        results.canary_write_test.write_ok = true;

        // Immediate Read-Back
        const readRes = await supabase.from('site_settings').select('*').eq('id', canaryId).single();
        if (!readRes.error && readRes.data) {
          results.canary_write_test.read_ok = true;
        }

        // Immediate Cleanup
        const delRes = await supabase.from('site_settings').delete().eq('id', canaryId);
        if (!delRes.error) {
          results.canary_write_test.cleanup_ok = true;
        } else {
          results.canary_write_test.cleanup_error = delRes.error.message;
        }
      } else {
        results.canary_write_test.write_error = insertRes.error?.message || 'Insert failed';
      }
    } catch (err: any) {
      results.canary_write_test.exception = err.message;
    }

    // 6. Supabase Storage Buckets Check
    results.storage = {
      provider: 'supabase_storage',
      buckets: {} as Record<string, any>,
    };

    try {
      const bucketsRes = await supabase.storage.listBuckets();
      if (bucketsRes.error) {
        results.storage.buckets_error = bucketsRes.error.message;
      } else {
        const expectedBuckets = ['music', 'wallpapers', 'showcase', 'media'];
        const existingBuckets = (bucketsRes.data || []).map((b: any) => b.name);
        results.storage.all_existing_buckets = existingBuckets;

        for (const eb of expectedBuckets) {
          results.storage.buckets[eb] = {
            exists: existingBuckets.includes(eb),
            status: existingBuckets.includes(eb) ? 'active' : 'missing',
          };
        }
      }
    } catch (err: any) {
      results.storage.exception = err.message;
    }
  } else {
    results.database.status = 'service_client_unavailable';
    results.overall_status = 'local_fallback_active';
  }

  // 7. Local File-System & Fallback Persistence Store Status
  try {
    const localStore = await getLocalStore();
    results.dual_layer_store = {
      status: 'active',
      site_settings_cached: Boolean(localStore.site_settings),
      music_tracks_count: localStore.music_tracks?.length ?? 0,
      minecraft_products_count: localStore.minecraft_products?.length ?? 0,
      showcase_projects_count: localStore.showcase_projects?.length ?? 0,
      discord_settings_cached: Boolean(localStore.discord_settings),
      media_assets_count: localStore.media_assets?.length ?? 0,
    };
  } catch (err: any) {
    results.dual_layer_store = {
      status: 'error',
      message: err.message,
    };
  }

  // 8. Public Directories Check
  const localDirs = ['public/music', 'public/wallpapers', 'public/assets'];
  results.local_storage_directories = {} as Record<string, any>;
  for (const dir of localDirs) {
    try {
      const fullPath = path.join(process.cwd(), dir);
      await fs.access(fullPath);
      results.local_storage_directories[dir] = { exists: true, accessible: true };
    } catch {
      results.local_storage_directories[dir] = { exists: false, accessible: false };
    }
  }

  return NextResponse.json({
    success: true,
    diagnostics: results,
  });
}
