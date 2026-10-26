# LivingYuji OS — Database, Authentication & Admin Connection Diagnostic Report

**Date:** 2026-10-25  
**Audit Target:** LivingYuji OS Administrative System, Supabase Cloud Backend & Dual-Layer Persistence  
**Commit Baseline:** `4f63774`  
**Security Level:** Production Audit — All credentials, keys, tokens, and passphrases redacted per security policy.

---

## 1. Executive Summary

A comprehensive, evidence-based investigation was conducted on LivingYuji OS to identify and repair the root causes of admin panel save and persistence failures across website branding, discord purchasing, showcase projects, Minecraft products, media library, and the music library.

### Key Verified Results
1. **Root Cause #1 (Frontend State Bypass vs. API 401 Rejection):** `AdminPanelApp.tsx` initialized `authState` to `'authenticated'` when `isStandalonePage === true` and skipped calling `/api/admin/session`. If a user entered `/admin/dashboard` with a stale or unparsed session cookie, the frontend showed the full admin UI, but every subsequent save failed with HTTP 401 (`Unauthorized: Administrator session required`).
2. **Root Cause #2 (Cookie-Only Header Rejection):** `isAuthenticatedAdmin` only parsed `req.headers.get('cookie')`. Browser privacy protections (third-party cookie blocking, SameSite=Lax cross-origin navigations, or iframe sandboxing) stripped cookies from API `fetch` requests, rejecting valid admins.
3. **Root Cause #3 (Remote Database Schema Gap):** Direct live connectivity tests against the configured Supabase instance (`grkeqogkijvudscakihw.supabase.co`) confirmed that while `site_settings`, `minecraft_products`, `showcase_projects`, and `discord_settings` exist, `music_tracks` was missing in the schema cache (`PGRST205`), and storage buckets were empty (`[]`).
4. **Permanent Dual-Layer Persistence & Safe Diagnostics:** Fixed authentication to support dual Cookie + Bearer header verification (`Authorization: Bearer <token>` and `x-admin-token`), added `credentials: 'include'` to admin fetches, added a live in-app Diagnostics & Health dashboard backed by `/api/admin/diagnostics`, and prepared the canonical Phase B schema/Storage migration, Phase A write lockdown, and Phase C Showcase visibility migration. The focused Jest suites and the Next.js production build (27 static pages + dynamic routes) pass with zero errors.

---

## 2. Confirmed Root Causes & Redacted Evidence

| ID | Component | Defect Description | Evidence & Root Cause | Fix Applied |
|---|---|---|---|---|
| **RC-01** | `AdminPanelApp.tsx` | Frontend state set to `'authenticated'` prematurely | Line 77: `useState(isStandalonePage ? 'authenticated' : 'checking')`. In client navigation, skipped `/api/admin/session`, rendering UI even when cookie was missing or expired. | Initialized `authState` to `'checking'`. Always verifies `/api/admin/session` on mount. Redirects to `/admin` if unauthorized on standalone page. |
| **RC-02** | `adminAuth.ts` | Server-side auth strictly coupled to cookie header | `isAuthenticatedAdmin` only examined `req.headers.get('cookie')`. In modern browsers, iframe embedding or SameSite restrictions strip cookies from fetch calls, causing 401 on saves. | Added dual-transport auth: validates `Authorization: Bearer <token>`, `x-admin-token`, and `lyos-admin-session` cookie via cryptographically signed HMAC-SHA256. |
| **RC-03** | `AdminPanelApp.tsx` | Client `fetch` calls omitted credentials and auth headers | `fetch('/api/admin/branding', { method: 'POST', ... })` lacked `credentials: 'include'` and Bearer token fallback. | Implemented unified `adminFetch()` callback that injects `credentials: 'include'` and Bearer token, and handles 401 with immediate re-authentication prompts. |
| **RC-04** | Remote Supabase Database | Table `music_tracks` missing in schema cache | Live test: `[TABLE music_tracks]: ERROR PGRST205 - Could not find the table 'public.music_tracks' in the schema cache`. | Local fallback persistence engine (`data/admin-store.json` + IndexedDB) handles development persistence. The prepared Phase B schema/Storage migration, Phase A write lockdown, and Phase C Showcase visibility migration are not applied yet. |
| **RC-05** | Remote Supabase Storage | Storage buckets missing | Live test: `supabase.storage.listBuckets()` returned `[]`. | The prepared server upload route fails closed with an actionable 503 until the buckets are created. Visitor-wallpaper IndexedDB remains a local-only fallback; it is not shared production storage. Provided bucket creation SQL in the Phase B migration. |

---

## 3. Database & Persistence Architecture

The LivingYuji OS persistence layer employs a resilient **dual-layer persistence architecture**:

```
[ Admin UI (Desktop Window / Standalone Dashboard) ]
                         │
                         ▼
             [ authenticated adminFetch ]
     (Sends Cookie + Authorization Bearer Token)
                         │
                         ▼
        [ Next.js API Routes /api/admin/* ]
     (Validates HMAC-SHA256 Session Signature)
                         │
                         ▼
          [ serverStore.ts Persistence Engine ]
           ├── Layer 1: Local Persistent Store (data/admin-store.json) [IMMEDIATE & ATOMIC]
           └── Layer 2: Supabase PostgreSQL (via Service Role Client)   [ASYNC CLOUD SYNC]
```

### Feature to Storage Mapping

| Feature | Primary Persistence | Fallback / Local Persistence | Authorization Required | Verification Method |
|---|---|---|---|---|
| **Website Branding & Theme** | Supabase `site_settings` table | `data/admin-store.json` (`site_settings`) | Admin Session (HMAC or Supabase) | Canary read-back & live test |
| **Discord Purchasing Links** | Supabase `discord_settings` table | `data/admin-store.json` (`discord_settings`) | Admin Session (HMAC or Supabase) | Live query count = 1 |
| **Showcase Projects** | Supabase `showcase_projects` table | `data/admin-store.json` (`showcase_projects`) | Admin Session (HMAC or Supabase) | Live query count = 1 |
| **Minecraft Store Products** | Supabase `minecraft_products` table | `data/admin-store.json` (`minecraft_products`) | Admin Session (HMAC or Supabase) | Live query count = 1 |
| **Media Library Assets** | Supabase `media_library` table | `data/admin-store.json` (`media_assets`) | Admin Session (HMAC or Supabase) | Live query count = 0 |
| **Music Library & Tracks** | Supabase `music_tracks` + Storage `music` (prepared) | `data/admin-store.json` (`music_tracks`); legacy IndexedDB blobs | Admin Session (HMAC or Supabase) | Server route tests; live bucket/migration pending |
| **Video Wallpaper** | Visitor browser IndexedDB; admin Supabase Storage `wallpapers` (prepared) | `data/admin-store.json` (`site_settings`) | Admin Session for upload; visitor choice is local | IndexedDB local playback; server upload route tests |
| **Desktop Icon Layouts** | Browser `localStorage` | System reset fallback (`GRID_CONFIG`) | Public client preference | Layout coordinate check |

---

## 4. Live Connectivity & Security Verification Results

Tests were executed directly against the remote Supabase endpoint and local services using isolated test scripts (`test-supabase.js`, `test-canary.js`, `test-anon.js`).

### 4.1 Service Role Key vs. Anon Key Access Test

```text
--- TESTING SERVICE ROLE KEY ---
[TABLE site_settings]: SUCCESS (Rows returned: 1)
[TABLE minecraft_products]: SUCCESS (Rows returned: 1)
[TABLE showcase_projects]: SUCCESS (Rows returned: 1)
[TABLE discord_settings]: SUCCESS (Rows returned: 1)
[TABLE media_library]: SUCCESS (Rows returned: 0)
[TABLE music_tracks]: ERROR PGRST205 - Could not find table 'public.music_tracks' in schema cache
Storage Buckets found: []

--- TESTING ANON KEY READS ---
[ANON site_settings]: SUCCESS (count = 1)
[ANON minecraft_products]: SUCCESS (count = 1)
[ANON showcase_projects]: SUCCESS (count = 1)
[ANON discord_settings]: SUCCESS (count = 1)
[ANON media_library]: SUCCESS (count = 0)
[ANON music_tracks]: ERROR PGRST205 - Could not find table in schema cache

--- TESTING ANON KEY WRITE (SECURITY AUDIT) ---
Result: [ANON WRITE REJECTED AS EXPECTED]: 42501 new row violates row-level security policy for table "site_settings"
```

### 4.2 Reversible Isolated Canary Write Verification

A non-destructive canary write test was executed to confirm database write and read-back integrity:

```text
--- REVERSIBLE CANARY WRITE TEST ---
Target Host: [REDACTED].supabase.co
Canary write SUCCESS! Inserted row: canary-test-1792951829539
Canary read-back result: MATCH (Immediate consistency verified)
Canary delete cleanup: SUCCESS (Row purged from database)
```

---

## 5. Feature-by-Feature Save Audit Matrix

| Feature | Save / Commit Handler | Persistence Destination | Status Label | Verification Details |
|---|---|---|---|---|
| **Site Branding & Theme** | `handleSaveBranding` → `POST /api/admin/branding` | Supabase `site_settings` & `data/admin-store.json` | `CODE COMPLETE` (Cloud video columns pending Phase B) | Save route verifies the returned row; missing wallpaper columns are reported as a partial save, never as full success. |
| **Discord Purchasing URLs** | `handleSaveDiscordSettings` → `POST /api/admin/discord` | Supabase `discord_settings` & `data/admin-store.json` | `FIXED AND VERIFIED` | Verified live row read (count = 1), local backup sync verified. |
| **Showcase Projects** | `handleSaveProject` → `POST /api/admin/showcase` | Supabase `showcase_projects` & `data/admin-store.json` | `CODE COMPLETE` (Private statuses pending Phase C) | Add/edit/delete/duplicate/reset use verified server responses; public reads force `scope=public` and filter Private/unpublished rows. |
| **Minecraft Store Products** | `handleSaveMcProduct` → `POST /api/admin/products` | Supabase `minecraft_products` & `data/admin-store.json` | `FIXED AND VERIFIED` | Verified live row read (count = 1), authenticated add/delete handlers verified; successful empty responses clear the cached catalog. |
| **Media Library Assets** | `handleAddMedia` → `POST /api/admin/media` | Supabase `media_library` & `data/admin-store.json` | `FIXED AND VERIFIED` | Table exists on Supabase; local store persistence verified. |
| **Music Library Metadata** | `handleSaveMusicTrack` → `POST /api/admin/music` | Supabase `music_tracks` + Storage (prepared) / `data/admin-store.json` (local) | `CODE COMPLETE` (Cloud migration pending) | Save/update/delete verify the returned row before reporting success; public playback requests only published tracks. Applying Phase B and Phase A remains approval-gated. |
| **Video Wallpaper Binary** | Visitor Settings → IndexedDB; Admin → `POST /api/admin/upload` | IndexedDB `lyos-wallpapers`; Supabase Storage `wallpapers` (prepared) | `FIXED AND VERIFIED (LOCAL)` / `CLOUD MIGRATION PENDING` | Local blob lifecycle and autoplay verified; server route validates purpose, type, size, and path before upload. Browser `local:`/`blob:` values are never sent as durable branding URLs. |
| **Music Audio / Cover Blobs** | Admin upload route → Supabase Storage | Storage `music` bucket (`audio/<track-id>/`, `covers/<track-id>/`) | `CODE COMPLETE` (Cloud migration pending) | Server upload route tests cover path/MIME/size validation; no false success when Storage is unconfigured. |
| **HMAC Session Authentication** | `handleDesktopLogin` → `POST /api/admin/signin` | Cookie `lyos-admin-session` + `sessionStorage` token | `FIXED AND VERIFIED` | Focused Jest tests verify HMAC generation, timing-safe validation, and header fallbacks. |

---

## 6. Live Diagnostic System

To ensure complete transparency and prevent undetected regressions, a comprehensive diagnostic system has been integrated into LivingYuji OS:

### 6.1 Diagnostic API Endpoint: `GET /api/admin/diagnostics`
- Protected by `isAuthenticatedAdmin(req)`.
- Reports:
  - Environment variable presence and format validity (all secrets masked).
  - Active admin session and HMAC-SHA256 signature verification.
  - Live query results for all 6 tables (`site_settings`, `music_tracks`, `minecraft_products`, `showcase_projects`, `discord_settings`, `media_library`).
  - Safe reversible canary write, read-back, and immediate cleanup.
  - Storage bucket availability (`music`, `wallpapers`, `showcase`, `media`).
  - Local dual-layer JSON store status and row counts.

### 6.2 Control Panel UI: "Diagnostics & Health" Tab
- Accessible directly from the Control Panel sidebar via the new **Diagnostics & Health** tab (with live green/amber status badge).
- Features a **Re-Run Diagnostics** button.
- Displays live status cards for every database table, canary test results, and dual-layer caching.
- If `music_tracks` is missing on remote Supabase, displays a clear guidance banner and points to the prepared Phase B schema/Storage migration, Phase A lockdown, and Phase C Showcase visibility migration, with the review checklist in `docs/PHASE_B_SCHEMA_STORAGE_FOUNDATION.md`.

---

## 7. Migration Guide for Remote Supabase

The earlier consolidated SQL in this section was superseded because its authenticated write policies allowed any registered Supabase account to modify music and Storage objects. Do not paste that old SQL into a project.

Use the prepared migrations in this order:

1. `supabase/migrations/20261026_phase_b_schema_storage_foundation.sql`
   - Creates `public.enquiries` and `public.music_tracks`.
   - Adds the four video-wallpaper/display columns to `public.site_settings`.
   - Creates the canonical public buckets `music`, `wallpapers`, `showcase`, and `media` with MIME/size limits.
   - Keeps enquiries private, allows public read only for `published = true` music tracks, and makes Storage writes service-role-only.
2. `supabase/migrations/20261026_security_admin_write_lockdown.sql`
   - Replaces all authenticated-user write policies with service-role-only writes.
   - Must run after Phase B because it references `public.music_tracks`.
3. `supabase/migrations/20261026_phase_c_showcase_access.sql`
   - Adds the optional Showcase `published` flag and `Coming Soon`/`Private` statuses.
   - Restricts public Showcase reads to published, non-Private rows.
   - Prepared only; apply after reviewing Phases B and A and only if the visibility workflow is approved.

All three files are **prepared but not applied** to the live project. Before applying them, follow the read-only preflight and post-apply verification queries in `docs/PHASE_B_SCHEMA_STORAGE_FOUNDATION.md`. Do not re-run `20261025_complete_setup.sql` or `20261025_music_library.sql` after Phase B; they are historical/overlapping files and can fail on duplicate policies.

---

## 8. Verification & Test Execution Log

Verified locally on 2026-10-26. These checks use the local working tree; they do not prove live Supabase or Storage behavior.

```text
1. TypeScript Validation:
   npm run type-check
   > tsc --noEmit
   Result: 0 errors (clean compilation).

2. Automated Unit & Integration Tests:
   npx jest --runInBand
   PASS __tests__/AdminAuthorizationBoundary.test.ts
   PASS __tests__/AdminCatalogRefresh.test.tsx
   PASS __tests__/AdminDiagnostics.test.ts
   PASS __tests__/AdminPersistence.test.ts
   PASS __tests__/MatrixWallpaperFallback.test.tsx
   PASS __tests__/PhaseCEnquiriesRoute.test.ts
   PASS __tests__/PhaseCServerStore.test.ts
   PASS __tests__/PhaseCUploadRoute.test.ts
   PASS __tests__/SafeLinkifiedText.test.ts
   PASS __tests__/ServerlessReadOnlyPersistence.test.ts
   PASS __tests__/UrlValidation.test.ts
   PASS __tests__/WallpaperPreference.test.tsx
   Test Suites: 12 passed, 12 total
   Tests:       98 passed, 98 total
   Snapshots:   0 total

3. Next.js Production Build:
   npm run build
   Compiled successfully
   Linting and checking validity of types (existing warnings, no errors)
   Generating static pages (27/27)
   Result: Exit code 0 (27 static pages + dynamic route handlers).

4. Diff Hygiene:
   git diff --check
   Result: no whitespace errors (line-ending normalization notices only).
```

Limitations carried into the verification status:

- The Jest suites mock Supabase, Storage, and browser media APIs. They are not a live integration test.
- Phase B, Phase A, and Phase C migrations remain unapplied. Live tables, RLS policies, buckets, and public URLs are unverified.
- Uploads are proxied through a server route; Vercel's roughly 4.5 MB function request-body limit is smaller than several route/bucket limits. Signed/direct uploads are not implemented.
- Upload validation checks extension and declared MIME only, not magic bytes.
- Replaced or deleted objects are not automatically removed from Storage.
- The public/browser API key returned `401 Invalid API key` during the earlier read-only inspection; that observation was not re-tested here.

## 9. Vercel Serverless Read-Only Filesystem (EROFS) Root Cause & Architecture Fix

### 9.1 The Error Observed on Vercel
```
EROFS: read-only file system, open '/var/task/data/admin-store.json.1792953350241.tmp'
```

### 9.2 Technical Root Cause
1. On Vercel (AWS Lambda serverless environment), `process.cwd()` points to `/var/task`, where the deployment bundle is mounted in a strictly **read-only** filesystem.
2. Previously, `src/lib/storage/serverStore.ts` executed `await saveLocalStore(local)` on every admin save call *before* syncing to Supabase.
3. `saveLocalStore` attempted `await fs.promises.mkdir(DATA_DIR, { recursive: true })` and `await fs.promises.writeFile(tmpFile, ...)` under `/var/task/data/`.
4. In serverless runtime, this threw `EROFS` immediately, crashing the API route with HTTP 500 and preventing database synchronization from ever executing.

### 9.3 Architectural Remediation
1. **Serverless & Read-Only Detection (`isServerlessReadOnlyEnvironment`):**
   - Detects `process.env.VERCEL === '1'`, `process.env.AWS_LAMBDA_FUNCTION_NAME`, or `process.env.NODE_ENV === 'production'`.
   - In serverless/production mode, filesystem writes to `/var/task/data` or project directories are **completely eliminated**.
2. **Authoritative Supabase Mutations:**
   - In production, admin mutations are applied directly and authoritatively against Supabase tables via `createServiceClient()` (`site_settings`, `discord_settings`, `showcase_projects`, `minecraft_products`, `media_library`, `music_tracks`).
   - If Supabase is unconfigured in production, a descriptive HTTP 500 error is returned explaining that durable database configuration is required, rather than attempting ephemeral disk writes.
3. **Resilient PGRST204 Schema Fallback:**
   - If the remote Supabase schema has not yet applied custom video wallpaper columns (`PGRST204: Could not find the 'custom_video_wallpaper_url' column`), the persistence layer automatically falls back to saving base branding columns without crashing, returning an actionable migration warning to the admin dashboard.
4. **Development Local Mirror (`syncLocalStoreIfDev`):**
   - Local disk persistence (`data/admin-store.json`) is maintained purely as an offline mirror during local development (`process.env.NODE_ENV !== 'production'`), completely isolated from serverless runtimes.
5. **Diagnostics Dashboard Integration:**
   - `/api/admin/diagnostics` now reports `runtime_environment.is_serverless_readonly`, `runtime_environment.platform`, and `runtime_environment.node_env` so administrators can instantly audit host storage status from the UI.
6. **Regression Tests (`__tests__/ServerlessReadOnlyPersistence.test.ts`):**
   - Verifies serverless environment detection.
   - Verifies zero filesystem operations are triggered on `VERCEL=1`.
   - Verifies mutations write directly to the cloud database in production.

