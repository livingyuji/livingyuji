# LivingYuji OS — Upload, Music Library, Clickable Links & Security Audit

**Document Version:** 1.1.0<br>
**Project:** LivingYuji OS (`b:\Own Plugins\livingyuji-os`)<br>
**Audit Date:** October 25, 2026<br>
**Last local verification:** October 26, 2026<br>
**Status:** Core implementations locally verified; live Supabase/Storage migration and upload behavior remain pending

---

## 1. Executive Summary & Root Cause Diagnoses

### 1.1 Understanding Application Uploads vs. Antigravity Workflow Uploads
A critical distinction emerged during diagnosis:
1. **Antigravity Chat/Workflow Uploads:** Media files attached directly into the Antigravity assistant conversation UI are saved to the local host agent artifact store (`.gemini/antigravity/brain/<conv-id>/.user_uploaded/`). These files are external to the web application runtime unless copied or served.
2. **In-App LivingYuji OS Uploads:** When a user interacts with LivingYuji OS in their browser (via Settings, Paint, Admin Panel, or Text Viewer), uploads run entirely through client-side HTML `<input type="file">` elements and Next.js API endpoints (`/api/...`).

### 1.2 Root Cause: Video Wallpaper Failures
The failure of video wallpapers to play or persist was traced to three interacting defects:
* **Lifecycle Desync on Page Reload:** `saveVideoWallpaperBlob` saved the raw video `Blob` in IndexedDB (`idb-keyval`) under `'lyos_video_wallpaper'`, but stored a sentinel string `'local:lyos_video_wallpaper_blob'` in Zustand's persisted state. When the page reloaded or when settings were modified in `SettingsApp` and `AdminPanelApp`, these components attempted to bind the raw string `'local:lyos_video_wallpaper_blob'` as the `<video src="...">` directly, which failed immediately.
* **Storage Override & Fallback Collision:** `MatrixWallpaper.tsx` read `customVideoWallpaperUrl` and loaded the blob correctly, but whenever a user modified branding in `AdminPanelApp.tsx`, `handleSaveBranding` unconditionally forced `wallpaperType: 'preset'`, overwriting the active video wallpaper state.
* **Image Wallpaper Quota Overflow:** Image wallpapers previously used `FileReader.readAsDataURL()` and wrote full Base64 strings directly into `localStorage`. Any wallpaper image exceeding ~3–4 MB exceeded the 5 MB browser `localStorage` quota (`QuotaExceededError`), corrupting state writes and preventing wallpaper selection from saving.

### 1.3 Root Cause: Administrative Security Flaws
* **Supabase User Privilege Escalation:** In `src/lib/auth/adminAuth.ts` and `src/app/admin/dashboard/page.tsx`, the authentication check was implemented as:
  ```typescript
  const { data, error } = await supabase.auth.getUser();
  if (!error && data.user) isAuthorized = true;
  ```
  Consequently, **any registered user** who logged into the site via standard email or OAuth was immediately granted full administrative privileges, allowing access to the admin dashboard, settings, and APIs.
* **Open Redirect Vulnerability:** In `src/app/api/admin/signin/route.ts`, the `returnTo` query parameter was passed directly to `NextResponse.redirect()` without validation, allowing attackers to construct phishing links redirecting admins to external malicious domains after sign-in.

---

## 2. Architectural Changes & File Manifest

### 2.1 File Storage Architecture (`src/lib/storage/`)
* [wallpaperStorage.ts](file:///b:/Own%20Plugins/livingyuji-os/src/lib/storage/wallpaperStorage.ts):
  - Upgraded IndexedDB store to handle both **video** (`saveVideoWallpaperBlob`, `loadVideoWallpaperBlob`) and **image** wallpapers (`saveImageWallpaperBlob`, `loadImageWallpaperBlob`, `clearImageWallpaperBlob`).
  - Added `resolveWallpaperMediaUrl()` which transparently resolves `'local:lyos_*'` sentinel strings into active Blob URLs, ensuring memory safety with `URL.revokeObjectURL()`.
* [musicStorage.ts](file:///b:/Own%20Plugins/livingyuji-os/src/lib/storage/musicStorage.ts):
  - Created persistent local IndexedDB store for music audio binaries (`.mp3`, `.wav`, `.ogg`, `.flac`) and album cover art (`.png`, `.jpg`, `.webp`).
  - Implements automatic object URL tracking, deduplication, and cleanup to prevent browser memory leaks.

### 2.2 Store & Desktop Wallpaper Engine
* [windowStore.ts](file:///b:/Own%20Plugins/livingyuji-os/src/store/windowStore.ts):
  - Uses the Streamable coding-video background as the default fallback while tracking explicit visitor wallpaper choices with `wallpaperUserOverride`.
  - Excludes transient `local:lyos_image_wallpaper_blob`/video sentinels from server persistence and upgrades legacy stores without replacing explicit presets, custom images, or local videos.
* [MatrixWallpaper.tsx](file:///b:/Own%20Plugins/livingyuji-os/src/components/desktop/MatrixWallpaper.tsx):
  - Enhanced background rendering pipeline to resolve both custom video and custom image wallpapers via `resolveWallpaperMediaUrl()`.
  - Added robust HTML5 `<video>` autoplay with `autoPlay`, `muted`, `loop`, `playsInline`, and error recovery fallback.
  - Added explicit image-load error tracking: a broken personal/server image falls through to the configured video or the approved Streamable fallback, then to the static preset.
  - Resets video/iframe loading and error state when the wallpaper source or URL changes, and only creates iframes for the shared approved Streamable/YouTube/Vimeo allowlist.
* [SettingsApp.tsx](file:///b:/Own%20Plugins/livingyuji-os/src/components/apps/SettingsApp.tsx):
  - Converted image wallpaper uploads from Base64 to IndexedDB binary blobs (`saveImageWallpaperBlob`).
  - Integrated dynamic video and image wallpaper previews resolving local blobs asynchronously.

### 2.3 Music Library Administration & Player Integration
* [20261025_music_library.sql](file:///b:/Own%20Plugins/livingyuji-os/supabase/migrations/20261025_music_library.sql):
  - Historical PostgreSQL migration that first defined the `music_tracks` table and public-read policy. The current canonical Storage/schema repair is `20261026_phase_b_schema_storage_foundation.sql` (prepared, not applied).
  - Music audio and cover art share the public `music` bucket under separate `audio/<track-id>/...` and `covers/<track-id>/...` path prefixes. The old `music-audio` and `music-covers` bucket names were never used by the application.
* [route.ts (Admin Music API)](file:///b:/Own%20Plugins/livingyuji-os/src/app/api/admin/music/route.ts):
  - Secured REST API endpoint (`GET`, `POST`, `PUT`, `DELETE`) protected by `isAuthenticatedAdmin()`.
  - Serves published tracks to regular users and full catalog to administrators.
  - Handles track creation, metadata updates, and cascading deletion.
* [AdminPanelApp.tsx](file:///b:/Own%20Plugins/livingyuji-os/src/components/apps/AdminPanelApp.tsx):
  - Added dedicated **Music Library** admin tab.
  - Tracks table with search, genre, and status (Published/Draft) filtering.
  - Track upload modal with automatic client-side audio duration detector using HTML5 `Audio()` metadata inspection.
  - Audio and cover art file uploaders use the authenticated server route to Supabase Storage (`audio/<track-id>/...` and `covers/<track-id>/...`); local IndexedDB is no longer the durable admin path.
  - Inline audio preview player, track editing modal, delete modal with confirmation, and instant publish toggles.
  - Fixed branding tab to preserve `wallpaperType: 'video'`; browser-only wallpaper sentinels are omitted from cloud saves.
* [MusicLabApp.tsx](file:///b:/Own%20Plugins/livingyuji-os/src/components/apps/MusicLabApp.tsx):
  - Hydrates published tracks through the public-scoped `/api/admin/music?scope=public` read and never requests drafts for public playback.
  - Integrated real HTML5 `<audio>` playback engine with synchronized play/pause, scrub slider, volume, and mute controls.
  - Seamless fallback to Web Audio synthesizer ambient loops when playing procedural tracks or when audio files are offline.

### 2.4 Clickable Links & Text Viewer
* [SafeLinkifiedText.tsx](file:///b:/Own%20Plugins/livingyuji-os/src/components/common/SafeLinkifiedText.tsx):
  - High-performance, XSS-safe text linkifier.
  - Detects `https://`, `http://`, `www.`, and standard domain patterns (`github.com/`, `discord.gg/`).
  - Automatically cleans trailing punctuation (commas, periods, brackets).
  - Enforces safe URL schemes (strictly rejects `javascript:`, `data:`, `vbscript:`).
  - Renders external links with `target="_blank"` and `rel="noopener noreferrer"`.
  - Supports keyword search highlighting without using `dangerouslySetInnerHTML`.
* [TextViewerApp.tsx](file:///b:/Own%20Plugins/livingyuji-os/src/components/apps/TextViewerApp.tsx):
  - Integrated `SafeLinkifiedText` into document body rendering, turning plain URLs in `.txt`, `.md`, and log files into clickable links.
* [SafeLinkifiedText.test.ts](file:///b:/Own%20Plugins/livingyuji-os/__tests__/SafeLinkifiedText.test.ts):
  - Comprehensive Jest test suite covering URL extraction, punctuation stripping, search highlighting, and malicious scheme rejection.

### 2.5 Security Remediation
* [adminAuth.ts](file:///b:/Own%20Plugins/livingyuji-os/src/lib/auth/adminAuth.ts):
  - Hardened administrative authorization. Supabase users must possess `user.app_metadata.role === 'admin'` or match `process.env.ADMIN_EMAIL`.
* [page.tsx (Dashboard)](file:///b:/Own%20Plugins/livingyuji-os/src/app/admin/dashboard/page.tsx):
  - Enforced the same strict role/email verification on the server-rendered dashboard.
* [route.ts (Admin Sign-In)](file:///b:/Own%20Plugins/livingyuji-os/src/app/api/admin/signin/route.ts):
  - Implemented `sanitizeReturnTo()` which rejects absolute external URLs, protocol-relative URLs (`//evil.com`), and backslashes, preventing open redirect attacks.
* [.env.example](file:///b:/Own%20Plugins/livingyuji-os/.env.example):
  - Documented `ADMIN_EMAIL=admin@livingyuji.com` without exposing production credentials.

---

## 3. Automated Verification & Quality Results

| Verification Test | Command | Result | Notes |
| :--- | :--- | :--- | :--- |
| **TypeScript Type Check** | `npm run type-check` | **PASSED (0 Errors)** | Re-run on 2026-10-26 across the current working tree. |
| **Unit Test Suite** | `npx jest --runInBand` | **PASSED (12/12 Suites, 98 Tests)** | Includes URL allowlist, admin catalog refresh, wallpaper fallback, persistence isolation, and Showcase visibility regressions. Mocked/local only. |
| **Next.js Production Build** | `npm run build` | **PASSED (Exit Code 0)** | 27 static/server-rendered pages built on 2026-10-26. Existing ESLint warnings remain; the build reported no lint errors. |
| **Whitespace Check** | `git diff --check` | **PASSED (no whitespace errors)** | Git only reported line-ending normalization notices. |
| **Live Supabase/Storage Verification** | Manual apply + upload/playback | **NOT RUN** | Migrations and buckets are not applied; no live upload, public URL, policy, or cleanup behavior is claimed as verified. |

---

## 4. Configuration & Deployment Instructions

### 4.1 Supabase Database & Storage Migration
The current repair is prepared in:
```bash
supabase/migrations/20261026_phase_b_schema_storage_foundation.sql
supabase/migrations/20261026_security_admin_write_lockdown.sql
supabase/migrations/20261026_phase_c_showcase_access.sql
```

Apply Phase B first, then Phase A, then Phase C if approved. See `docs/PHASE_B_SCHEMA_STORAGE_FOUNDATION.md` for the read-only preflight checklist and verification SQL.

Phase B:
1. Creates `public.music_tracks` with indexes on `published`, `album`, `artist`, `created_at`, and `(published, track_order)`.
2. Creates the canonical Storage buckets `music`, `wallpapers`, `showcase`, and `media` with MIME/size limits. Music audio and covers use path prefixes inside `music`; there are no separate `music-audio`/`music-covers` buckets.
3. Keeps public visitors limited to published tracks and explicit public object URLs; writes are service-role-only.

`20261025_complete_setup.sql` and `20261025_music_library.sql` are historical/overlapping definitions and must not be replayed after Phase B.

### 4.1.1 Upload limitations to account for before release

- **Vercel body ceiling:** Vercel Functions limit request bodies to roughly 4.5 MB. Route and bucket limits are larger (up to 50 MiB for music and 100 MiB for wallpaper video), so production uploads near those advertised limits will fail at the platform boundary. Do not describe the bucket limits as guaranteed upload limits.
- **No signed direct uploads:** uploads are proxied through the authenticated `/api/admin/upload` route. Direct-to-Storage signed uploads are not implemented.
- **Declared type only:** the route validates extension and declared MIME, not magic bytes. A malicious file can declare an allowed MIME/extension. Magic-byte validation remains unimplemented.
- **Stale objects:** replacing a file or deleting its database row does not remove the old Storage object. Old public URLs may remain reachable until a reconciliation/cleanup job is implemented.
- **Environment gap:** local Jest tests mock Supabase/Storage. They do not substitute for applying the migrations and testing real bucket policies, uploads, playback, and deletion behavior.

### 4.2 Configuring Admin Privileges
To grant an account admin privileges, choose either:
1. **Option A (Environment Variable):** Set `ADMIN_EMAIL=your-email@domain.com` in your `.env.local` file.
2. **Option B (Supabase Custom Claims):** Set `app_metadata: { role: 'admin' }` on the user in your Supabase Auth dashboard.

---

## 5. Status Checklist

| Feature / Area | Status | Verification & Operational Notes |
| :--- | :--- | :--- |
| **Video Wallpaper Upload & Autoplay** | `FIXED AND LOCALLY TESTED` | Visitor-uploaded video remains in IndexedDB; admin video uploads use the prepared Supabase Storage route. Local autoplay/fallback tests pass. Live Storage upload and playback are not verified. |
| **Image Wallpaper Storage** | `FIXED AND LOCALLY TESTED` | Migrated from Base64 `localStorage` to IndexedDB; eliminated `QuotaExceededError` crashes. Broken-image fallback is covered by local tests. |
| **Music Library Admin Section** | `CODE PREPARED - MIGRATION NOT APPLIED` | Full CRUD interface, audio duration detector, server upload route, preview player; live Storage buckets are still absent. |
| **MusicLab Audio Engine** | `FIXED AND LOCALLY TESTED` | Public read requests are scoped to published tracks; native HTML5 `<audio>` playback with Web Audio synth fallback. Live streaming from Storage not verified. |
| **Safe Linkification Engine** | `FIXED AND LOCALLY TESTED` | `SafeLinkifiedText` unit-tested; strips trailing punctuation; rejects `javascript:` schemes; integrated in `TextViewerApp`. |
| **Supabase Privilege Escalation** | `FIXED AND LOCALLY TESTED` | Unprivileged registered users can no longer access admin routes or APIs without admin role/email. |
| **Open Redirect Vulnerability** | `FIXED AND LOCALLY TESTED` | Redirect parameter is strictly sanitized to relative paths. |
| **Supabase Cloud Sync for Music** | `PREPARED - NOT APPLIED` | Phase B schema/Storage migration, Phase A lockdown, and Phase C Showcase migration are prepared locally; the live project still needs the approved manual apply and verification. |
| **Antigravity Chat File Uploads** | `FIXED AND LOCALLY TESTED` | Documented workflow difference; application-level uploads operate autonomously in browser. |

---
*LivingYuji OS implementation was locally type-checked, tested, and built. Live Supabase schema, Storage policies, uploads, playback, and cleanup remain unverified until the prepared migrations are applied and exercised.*
