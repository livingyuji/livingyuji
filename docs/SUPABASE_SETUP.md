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

Apply the migrations in the following order using the Supabase SQL Editor or Supabase CLI:

### Step 1: Base System Schema
**File:** `supabase/migrations/20261025_livingyuji_os.sql`
- Creates `public.site_settings` (branding, wallpapers, theme defaults).
- Creates `public.discord_settings` (category-specific purchase URLs).
- Creates `public.desktop_icons` (user desktop icon coordinate persistence).
- Creates `public.project_files` (virtual NTFS file hierarchy).
- Creates `public.minecraft_products` (marketplace catalog).
- Enables Row Level Security (RLS) with public read access and admin-only write policies.

### Step 2: Showcase Schema
**File:** `supabase/migrations/20261025_showcase_schema.sql`
- Creates `public.showcase_categories` (domains: Minecraft, Discord, Web, CLI).
- Creates `public.showcase_projects` (portfolio items, tech stack, screenshots, changelogs).
- Creates performance indexes on `category_id`, `featured`, and `status`.
- Enables Row Level Security (RLS) with public read access and admin write policies.

---

## 3. Storage Buckets Setup

In the Supabase Dashboard, create the following storage buckets under **Storage**:

1. **`media`** (Public)
   - For custom wallpapers, branding logos, and favicon uploads.
   - Max file size: `5 MB`.
   - Allowed MIME types: `image/png`, `image/jpeg`, `image/svg+xml`, `image/webp`, `image/x-icon`.

2. **`minecraft_releases`** (Private)
   - For compiled `.jar` plugin binaries, resource packs (`.zip`/`.mcpack`), and server setup templates.
   - Managed via Supabase Storage policies requiring authenticated admin or verified purchase tokens.

---

## 4. Current State: Offline Fallback Mode

When `.env.local` is not configured, LivingYuji OS automatically runs in **Offline Fallback Mode**:
- Desktop icon positions, virtual files, and showcase changes persist reliably in browser `localStorage` and `IndexedDB`.
- Changes remain intact across page reloads and browser restarts on that specific machine.
- Cloud synchronization across separate devices is active only after valid Supabase credentials are configured.
