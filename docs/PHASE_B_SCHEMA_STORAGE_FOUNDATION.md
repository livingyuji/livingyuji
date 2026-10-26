# Phase B — Database Schema & Supabase Storage Foundation

**Status:** PREPARED ONLY — not applied to the live/production Supabase project.  
**Date:** 2026-10-26  
**Migration:** `supabase/migrations/20261026_phase_b_schema_storage_foundation.sql`

This document describes the additive schema and Storage foundation prepared in Phase B. It records Phase B only: the later Phase C application/upload changes are described in section 3 and in the separate Phase C migration. No production environment variable or deployment setting was changed by this work.

---

## 1. Read-only live inspection

A read-only inspection of the configured Supabase project was performed on 2026-10-26. The database schema was read through the REST OpenAPI document and the Storage bucket list through the Storage API. No writes, migrations, bucket changes, or object operations were performed.

Live findings:

| Area | Live state |
|---|---|
| Public tables exposed by REST | `desktop_layouts`, `discord_settings`, `media_library`, `minecraft_products`, `project_files`, `showcase_categories`, `showcase_projects`, `site_settings` |
| `public.enquiries` | Missing |
| `public.music_tracks` | Missing |
| `public.site_settings` | 10 columns; missing all four video-wallpaper/display columns |
| Storage buckets | `[]` — no buckets returned by the service client |
| Row-level policies | Not exposed by the REST schema endpoint; policy changes must be verified with the SQL queries in section 8 |

Environment observation: the public/browser API key stored in the local environment was rejected by the live REST endpoint (`401 Invalid API key`) during this inspection. Schema inspection succeeded with the server-only service client. Verify the public key and deployment configuration separately before release; it is not changed by this migration.

---

## 2. What the migration adds

### 2.1 `public.enquiries`

Matches the exact insert written by `src/app/api/enquiries/route.ts`:

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` | Primary key, default `gen_random_uuid()`; the API intentionally omits it |
| `name` | `TEXT NOT NULL` | Required by the API |
| `email` | `TEXT NOT NULL` | Required and validated by the API |
| `discord` | `TEXT` | Optional; API sends `null` when empty |
| `category` | `TEXT NOT NULL` | Required |
| `title` | `TEXT NOT NULL` | Required |
| `budget` | `TEXT` | Optional; API sends `null` when empty |
| `timeline` | `TEXT` | Optional; API sends `null` when empty |
| `description` | `TEXT NOT NULL` | Required |
| `links` | `TEXT` | Optional free-form links/notes |
| `submitted_at` | `TIMESTAMPTZ NOT NULL` | API supplies the timestamp; default `now()` |
| `status` | `TEXT NOT NULL` | Default `'new'`; the API inserts `'new'` |
| `created_at` | `TIMESTAMPTZ NOT NULL` | Default `now()` |
| `updated_at` | `TIMESTAMPTZ NOT NULL` | Default `now()`; no trigger is added, so a future admin route must update it explicitly |

Indexes: `submitted_at DESC`, `status`, `(status, submitted_at DESC)`, and `lower(email)`.

Privacy model:

- RLS is enabled.
- There is **no** `anon` or `authenticated` policy.
- There is **no** public read policy.
- Only `service_role` is granted table privileges and a management policy.
- `/api/enquiries` writes with `SUPABASE_SERVICE_ROLE_KEY` on the server. The service-role key is never sent to browser code.

### 2.2 `public.music_tracks`

Matches `MusicTrackRecord` and `saveMusicTrack()` in `src/lib/storage/serverStore.ts`, and the canonical definition in `20261025_music_library.sql`:

`id`, `title`, `artist`, `album`, `duration`, `duration_sec`, `genre`, `description`, `tags`, `audio_url`, `cover_url`, `cover_gradient`, `published`, `featured`, `track_order`, `file_format`, `file_size`, `storage_key`, `created_at`, `updated_at`.

Indexes: `published`, `album`, `artist`, `created_at DESC`, and `(published, track_order)` for the public ordering query in `getMusicTracks()`.

Privacy model:

- RLS is enabled.
- Public/anon and authenticated visitors can select only rows where `published = true`.
- Only `service_role` can insert, update, or delete.
- The old `"Admin write music_tracks"` policy from the earlier migrations is removed. It allowed any authenticated Supabase account to write music.

### 2.3 `public.site_settings`

The migration adds the four columns used by `AdminPanelApp.tsx` and `serverStore.ts`:

| Column | Type | Default | Validation |
|---|---|---|---|
| `custom_video_wallpaper_url` | `TEXT` | `NULL` | Nullable. Persist only durable public URLs; the admin save route rejects browser-only `local:`/`blob:` sentinels. A visitor's explicit local choice stays in the browser and is not uploaded automatically. |
| `video_wallpaper_muted` | `BOOLEAN NOT NULL` | `true` | — |
| `wallpaper_mode` | `TEXT NOT NULL` | `'cover'` | New rows/updates: `cover`, `contain`, or `tile` |
| `wallpaper_opacity` | `INTEGER NOT NULL` | `85` | New rows/updates: 0–100; UI slider default is 85 |

Existing non-null values are preserved. Only `NULL`s in an older/partial schema are filled with the application defaults before the columns are made `NOT NULL`. The two `CHECK` constraints are added as `NOT VALID` so an older project with unusual existing values does not block the migration; new writes are still checked.

### 2.4 Storage buckets

The bucket names match `src/app/api/admin/diagnostics/route.ts` and the earlier setup migration:

| Bucket | Public | Size limit | Allowed MIME types | Intended content |
|---|---:|---:|---|---|
| `music` | Yes | 50 MiB | MP3/MPEG, WAV, OGG, FLAC, PNG, JPEG, WebP | Audio at `audio/<track-id>/...`, cover art at `covers/<track-id>/...` |
| `wallpapers` | Yes | 100 MiB | PNG, JPEG, WebP, AVIF, MP4, WebM | Images at `images/...`, videos at `videos/...` |
| `showcase` | Yes | 25 MiB | PNG, JPEG, WebP, AVIF | Project media at `projects/<slug>/...` |
| `media` | Yes | 50 MiB | PNG, JPEG, WebP, AVIF, ICO, MP4, WebM, PDF | General public media at `<category>/...` |

`ON CONFLICT` only fills missing size/MIME restrictions. It does not delete buckets, replace existing non-null restrictions, or change the public flag of an existing bucket. The four names above are the canonical public buckets; the old documentation names `music-audio` and `music-covers` were never used by the application and are not buckets.

SVG is intentionally excluded from public uploads because SVG can contain active content. Use PNG, JPEG, WebP, or AVIF for logos and other public imagery.

### 2.5 Storage policies

- RLS is left enabled on `storage.objects`.
- The legacy broad policies `"Public access to music bucket"`, `"Public access to OS assets"`, `"Admin upload to music bucket"`, and `"Admin upload to OS assets"` are removed.
- A `"Service role write OS assets"` policy allows service-role uploads, replacements, and deletions only in the four public buckets.
- There is **no** anon/authenticated `SELECT`, `INSERT`, `UPDATE`, or `DELETE` policy on `storage.objects`.

Public visitors can render an object through its explicit public URL. They cannot list bucket contents or query object metadata. Server-only routes can use the service role for management. This avoids turning a public-rendering bucket into a browsable file index.

### 2.6 Private product downloads

No `minecraft_releases` bucket is created. The current application has no Storage upload/download code for product binaries; `minecraft_products.download_url` and `direct_file_path` are metadata fields. If private product hosting is added later, create a separate **private** bucket and issue short-lived signed URLs from a server-only route. Do not place those files in the four public buckets.

---

## 3. Upload validation in the prepared Phase C route

The migration configures Storage-level MIME and size limits. The prepared server route `src/app/api/admin/upload/route.ts` implements the following before writing to Storage:

1. Authenticates every request with the existing admin boundary (`isAuthenticatedAdmin`) before reading the file.
2. Uses the service-role client only on the server; never exposes `SUPABASE_SERVICE_ROLE_KEY` to browser code.
3. Validates the extension against an explicit allowlist per purpose/bucket (`.mp3`, `.wav`, `.ogg`, `.flac` for music; `.mp4`, `.webm` for video; images as documented).
4. Validates the declared MIME type against the same allowlist.
5. Enforces a per-purpose byte limit in the route in addition to the bucket limit.
6. Builds the storage path server-side from a fixed purpose prefix, a validated stable track ID for music, a timestamp, and a sanitized base name.
7. Uses the documented prefixes (`audio/<track-id>/`, `covers/<track-id>/`, `videos/`, `images/`, `projects/`) so public URLs cannot be confused with private or unrelated objects.
8. Returns the explicit public URL only after Storage accepts the object and returns an `https` URL.

Still intentionally deferred: magic-byte/content-signature validation, automatic deletion of replaced objects, and asset cleanup when a database row is deleted. The route relies on the extension, declared MIME, and bucket-level policy for now. A client can lie about both the extension and declared MIME, so this is not equivalent to content inspection. Do not claim signature validation until it is implemented.

Additional deployment limitations:

- **Vercel request-body limit:** Vercel Functions have a request-body ceiling of roughly 4.5 MB. The route's per-purpose limits are larger (for example 50 MiB for music and 100 MiB for wallpaper video), so a valid-looking upload can be rejected by the platform before the route reads it. Treat the effective production limit as the smaller of the route limit and the hosting limit. Do not advertise the bucket limits as end-user upload limits.
- **No signed/direct uploads:** every admin upload is proxied through the authenticated Next.js route. This avoids exposing service-role credentials, but it also means uploads are constrained by the function body limit and execution time. Direct-to-Storage signed uploads are not implemented and should not be described as available.
- **Stale Storage cleanup:** replacing an object or deleting its database row does not automatically delete the previous Storage object. Orphaned objects can remain publicly readable at their old URLs and continue consuming quota. A future cleanup job should reconcile Storage prefixes against current rows before deleting anything.
- **Verification scope:** upload validation and route behavior are covered by mocked/local Jest tests. They do not prove that the live Supabase schema, bucket policies, Storage API, or Vercel body limits behave correctly. Live writes, uploads, playback, and cleanup remain unverified until the migrations are applied and exercised in the target environment.

The application now uploads admin-selected audio, cover art, video wallpapers, and showcase/media images through this server route. Browser IndexedDB/local persistence remains available for a visitor's private local choices, but it is not a shared production source of truth. Phase B itself did not change the application; these upload paths were added in Phase C.

---

## 4. Apply order

The Phase B filename intentionally sorts before `20261026_security_admin_write_lockdown.sql`, because the Phase A lockdown references `public.music_tracks`.

For the current live project (which is missing both tables and the wallpaper columns):

1. Run the read-only preflight checks in section 8.
2. Apply `20261026_phase_b_schema_storage_foundation.sql` in the Supabase SQL Editor (or through the CLI).
3. Apply `20261026_security_admin_write_lockdown.sql` (Phase A).
4. Review, then apply `20261026_phase_c_showcase_access.sql` only if the Showcase Private/Coming Soon workflow is approved.
5. Run the post-apply checks in section 8.
6. Test `/api/enquiries`, `/api/admin/music`, the branding save flow, the admin upload route, and the admin diagnostics page.

Do **not** re-run `20261025_complete_setup.sql` or `20261025_music_library.sql` after Phase B. They are historical/overlapping definitions; `complete_setup.sql` creates the same music table and buckets, and `music_library.sql` creates music policies without first dropping them. The Phase B migration supersedes both for the missing pieces and is the only one that should be used for this repair.

For a brand-new project, use:

1. `20261025_livingyuji_os.sql`
2. `20261025_showcase_schema.sql`
3. `20261026_phase_b_schema_storage_foundation.sql`
4. `20261026_security_admin_write_lockdown.sql`

The existing migrations are written for manual/ordered application, not for blindly replaying every file through a fresh CLI migration history.

---

## 5. Review before applying

1. Confirm the target project is the intended one. Do not run this against a different environment.
2. Take a database backup or Supabase snapshot if the project contains data that cannot be regenerated.
3. Confirm `public.enquiries` and `public.music_tracks` are absent, or inspect their existing definitions before applying.
4. Confirm the four bucket names are absent, or confirm their existing public flag and restrictions are acceptable. The migration will not change an existing bucket's public flag.
5. If legacy buckets such as `music-audio`, `music-covers`, or `minecraft_releases` exist, review their public flag and policies manually. They are not used by the application, and this migration intentionally does not delete or alter them.
6. Read the migration from top to bottom. It contains no `DROP TABLE`, `DELETE`, `TRUNCATE`, `DROP SCHEMA`, or Storage object deletion.
7. Do not apply remote migrations from an automated deployment step until the SQL has been reviewed in the Supabase dashboard.

---

## 6. Known follow-ups and assumptions

- **Admin music reads:** `getMusicTracks(isAdmin)` and the other admin/public catalogs now read through the service-role client and apply public/admin filtering in application code, so draft tracks remain visible to a verified admin.
- **Live policy verification:** the current policy definitions could not be read through the available REST/Storage APIs. The migration drops the known legacy policy names, but the post-apply `pg_policies` query in section 8 is the authoritative check.
- **Existing buckets:** the migration fills missing size/MIME settings but deliberately does not change an existing bucket's `public` flag. If a bucket with one of the four canonical names already exists and is private, verify whether that is intentional before relying on public URLs.
- **Upload handlers:** the prepared Phase C route exists and validates extension, declared MIME, purpose, record ID, path, and size. Magic-byte validation, the Vercel function body ceiling, and Storage cleanup for replaced/deleted assets remain follow-ups (section 3). No signed or direct-to-Storage upload flow is implemented.
- **Media URL validation:** persisted branding, media, music, product-download, and Showcase screenshot URLs are checked against a shared allowlist on the server (HTTP/HTTPS or root-relative paths). Video wallpapers also require either a direct media URL or one of the exact approved embed hosts/paths (Streamable `/e/`, YouTube `/embed/`, `player.vimeo.com`). This is URL-shape validation, not a live fetch or malware scan.
- **Product binaries:** no private product-download bucket is created. The current product store persists download URLs/metadata only.
- **Public API key:** the browser/public key in the local environment returned `401 Invalid API key` during the read-only inspection. Verify the deployment key separately; this migration does not alter environment variables.

---

## 7. Honest status

- Migration created locally: **yes**
- Migration applied to live Supabase: **no**
- Storage buckets created remotely: **no**
- Application code changed in Phase B: **no**
- RLS disabled anywhere: **no**
- Records or Storage objects deleted: **no**
- GitHub push or deployment: **no**
- Local static verification on 2026-10-26: **type-check, 12 Jest suites / 98 tests, and `next build` passed**
- Live Supabase/Storage verification: **not performed** - the migrations and buckets are absent, and there is no applied schema to exercise

---

## 8. Verification SQL

These are read-only checks. They are safe to run before and after applying the migration.

### Before applying — missing objects and columns

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('enquiries', 'music_tracks');

select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'site_settings'
order by ordinal_position;

select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
order by id;
```

### After applying — tables, columns, indexes, policies

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('enquiries', 'music_tracks')
order by table_name;

select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'site_settings'
  and column_name in (
    'custom_video_wallpaper_url',
    'video_wallpaper_muted',
    'wallpaper_mode',
    'wallpaper_opacity'
  )
order by column_name;

select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname in ('public', 'storage')
  and (
    tablename in ('enquiries', 'music_tracks')
    or (schemaname = 'storage' and tablename = 'objects')
  )
order by schemaname, tablename, policyname;

select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id in ('music', 'wallpapers', 'showcase', 'media')
order by id;
```

After applying the Phase C Showcase migration, also verify:

```sql
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'showcase_projects'
  and column_name = 'published';

select policyname, roles, cmd, qual
from pg_policies
where schemaname = 'public'
  and tablename = 'showcase_projects'
order by policyname;
```

Expected policy properties:

- `enquiries`: only the service-role management policy; no public/anon/authenticated policy.
- `music_tracks`: one public select policy limited to `published = true`; one service-role write policy; no authenticated write policy.
- `showcase_projects` after Phase C: the original unrestricted public read policy is gone; the replacement public read policy uses `published = true AND lower(btrim(status)) <> 'private'` (case-insensitive and whitespace-insensitive).
- `storage.objects`: only the service-role write policy for the four public buckets; no broad public select policy.
