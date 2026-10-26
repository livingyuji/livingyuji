# LivingYuji OS — Supabase Setup & Cloud Migration Guide

This guide documents the exact configuration required to enable multi-device cloud synchronization for LivingYuji OS.

---

## 1. Environment Variables Configuration

Copy `.env.example` to `.env.local` in the project root:

```bash
cp .env.example .env.local
```

Populate the following variables with your Supabase credentials:

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public (Client & Server) | Your Supabase project URL (`https://<project-ref>.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (Client & Server) | Supabase `anon` / `public` API key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Private (Server-only) | Supabase `service_role` key used by `/api/enquiries` and background sync. |
| `ADMIN_ACCESS_PASSPHRASE` | Private (Server-only) | Master passphrase for the desktop Control Panel and `/admin`. |
| `ADMIN_SESSION_SECRET` | Private (Server-only) | 32+ character random secret for signing `lyos-admin-session` HMAC tokens. |

> **Security Warning:** Never commit `.env.local` to version control or expose `SUPABASE_SERVICE_ROLE_KEY` to client-side components.

---

## 2. Database Migrations

> **Phase B status:** the addendum migration below is prepared but **not applied** to the live project. The live project was inspected read-only on 2026-10-26: `public.enquiries`, `public.music_tracks`, the four wallpaper columns, and all Storage buckets were missing. See [PHASE_B_SCHEMA_STORAGE_FOUNDATION.md](./PHASE_B_SCHEMA_STORAGE_FOUNDATION.md) for the inspection record, review checklist, and verification SQL.

Apply migrations manually in the order below using the Supabase SQL Editor. The existing migration files were written for ordered review, not for blindly replaying every file through a fresh CLI history.

### Step 1: Base System Schema
**File:** `supabase/migrations/20261025_livingyuji_os.sql`
- Creates `public.site_settings` (branding, wallpapers, theme defaults).
- Creates `public.discord_settings` (category-specific purchase URLs).
- Creates `public.desktop_layouts` (desktop icon coordinate persistence).
- Creates `public.project_files` (virtual NTFS file hierarchy).
- Creates `public.minecraft_products` (marketplace catalog).
- Creates `public.media_library` and enables Row Level Security (RLS).

### Step 2: Showcase Schema
**File:** `supabase/migrations/20261025_showcase_schema.sql`
- Creates `public.showcase_categories` and `public.showcase_projects`.
- Adds performance indexes on `category_id`, `featured`, `status`, and `created_at`.
- Enables RLS with public read policies; administrator writes are hardened in Step 4 and public Showcase visibility in Step 5.

> **Security note:** the base and showcase migrations contain older authenticated-write policies. Do not expose a new project to untrusted users until Step 4 (Phase A) has removed those policies.

### Step 3: Phase B Schema & Storage Foundation
**File:** `supabase/migrations/20261026_phase_b_schema_storage_foundation.sql`
- Creates `public.enquiries` (private; service-role writes only) and `public.music_tracks`.
- Adds `custom_video_wallpaper_url`, `video_wallpaper_muted`, `wallpaper_mode`, and `wallpaper_opacity` to `public.site_settings`.
- Creates the canonical public Storage buckets `music`, `wallpapers`, `showcase`, and `media`, with MIME and size limits.
- Removes legacy broad Storage policies and adds a service-role write policy.
- Is additive/idempotent and contains no table, row, bucket, or object deletion.

### Step 4: Administrator Write Lockdown (Phase A)
**File:** `supabase/migrations/20261026_security_admin_write_lockdown.sql`
- Replaces authenticated-user write policies with service-role-only writes.
- Must run **after** Phase B because it references `public.music_tracks`.

### Step 5: Showcase Visibility (Phase C)
**File:** `supabase/migrations/20261026_phase_c_showcase_access.sql`
- Adds the optional `published` flag and the `Coming Soon`/`Private` statuses used by the admin editor.
- Tightens the public Showcase read policy so anonymous table reads cannot return Private or unpublished rows, using `published = true AND lower(btrim(status)) <> 'private'` so casing and surrounding whitespace cannot bypass the filter.
- Is prepared only; apply after reviewing Phases B and A and only if the Showcase visibility workflow is approved.

### Historical/overlapping files

`20261025_complete_setup.sql` and `20261025_music_library.sql` contain older, overlapping definitions of `music_tracks`, wallpaper columns, buckets, and policies. Do **not** re-run them after Phase B. Phase B supersedes both for the missing schema and Storage foundation. Applying the historical files in the wrong order can fail on duplicate policy names.

---

## 3. Storage Buckets Setup

The Phase B migration creates these buckets. Verify them under **Storage** after applying it:

| Bucket | Public | Size limit | Allowed MIME types | Purpose |
|---|---:|---:|---|---|
| `music` | Yes | 50 MiB | MP3/MPEG, WAV, OGG, FLAC, PNG, JPEG, WebP | Audio at `audio/<track-id>/...` and covers at `covers/<track-id>/...` |
| `wallpapers` | Yes | 100 MiB | PNG, JPEG, WebP, AVIF, MP4, WebM | Image/video wallpapers |
| `showcase` | Yes | 25 MiB | PNG, JPEG, WebP, AVIF | Project screenshots/media |
| `media` | Yes | 50 MiB | PNG, JPEG, WebP, AVIF, ICO, MP4, WebM, PDF | General public media and brand assets |

The earlier documentation names `music-audio`, `music-covers`, and `minecraft_releases` were not implemented by the application. Music audio and covers share the public `music` bucket but use separate path prefixes. No private product-download bucket is created because the current product store only stores metadata/download URLs.

Storage policy rules prepared by Phase B:

- RLS remains enabled on `storage.objects`.
- No `anon` or `authenticated` INSERT/UPDATE/DELETE policy exists.
- There is no broad public bucket-listing policy. Public visitors render known public URLs; they cannot list bucket contents.
- Uploads, replacements, and deletions are service-role-only and must be performed by a server-only route. Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code.

The server-only upload route (`/api/admin/upload`) implements admin authentication, purpose-specific extension/MIME allowlists, stable music track paths, a sanitized basename, and per-purpose byte limits. The following are still limitations, not implemented features:

- **Vercel request-body ceiling:** Vercel Functions accept roughly 4.5 MB per request. The route/bucket limits are larger (music up to 50 MiB, wallpaper video up to 100 MiB), so uploads above the platform ceiling fail before route validation. Treat the host limit as the effective production limit.
- **No signed/direct uploads:** all bytes are proxied through the authenticated Next.js route. Direct-to-Storage signed uploads are not implemented.
- **No magic-byte validation:** the route checks the filename extension and declared MIME type only. A client can spoof both; content-signature validation remains a follow-up. Bucket-level MIME/size limits are not a substitute for inspecting bytes.
- **No stale-object cleanup:** replacing an object or deleting its database row does not delete the old Storage object. Public URLs for orphaned objects may remain reachable until a reconciliation job is implemented.
- **Local-only verification:** route behavior is covered by mocked Jest tests. Live Supabase tables, Storage policies, bucket uploads, public URLs, playback, and cleanup are unverified until the migrations are applied and exercised in the target environment.

---

## 4. Current State: Offline Fallback Mode

When `.env.local` is not configured, LivingYuji OS automatically runs in **Offline Fallback Mode**:
- Desktop icon positions and virtual files persist in browser `localStorage`/`IndexedDB` on that device.
- Admin showcase, music, product, and branding writes use the local development store (`data/admin-store.json`); contact submissions use an explicitly labeled development console log. Neither is shared across devices.
- Browser IndexedDB remains useful for a visitor's private local wallpaper/music choice, but it is not treated as production catalog storage.
- Cloud synchronization across separate devices is active only after valid Supabase credentials are configured **and** the prepared migrations/buckets have been approved and applied. Credentials alone are not sufficient: the live project still lacks the Phase B tables/columns and buckets, so admin saves and uploads will fail closed until the migration and verification steps are completed.
