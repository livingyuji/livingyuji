# LivingYuji OS — Complete Admin Panel Audit & Full Website Control Report

**Date:** 2026-10-25  
**Auditor:** Senior Full-Stack Engineer & Systems Architect  
**Project:** LivingYuji OS (`/admin/dashboard` & `AdminPanelApp.tsx`)  
**Database:** Supabase Cloud (`https://<project-ref>.supabase.co`)  

---

## 1. Executive Summary

LivingYuji OS features an administrative control architecture accessible via the desktop Start Menu (`Control Panel`), desktop shortcuts, and the standalone URL `/admin/dashboard`. The authentication layer is secured by server-verified HMAC-SHA256 cookies, timing-safe passphrase hashing, and IP rate limiting.

However, several critical control modules in the Admin Panel were either UI-only stubs, redirected out of the panel, or persisted exclusively to browser `localStorage` rather than persisting directly to Supabase cloud tables. 

This audit documents the exact status of every administrative section, identifies gaps against production requirements, and defines the remediation implementation plan.

---

## 2. Administrative Sections Status Matrix

| Module | UI Implementation | Data Source / Storage | Server-Side Auth | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication & Gatekeeping** | Dedicated login modal & `/admin/login` | HMAC-SHA256 cookie (`lyos-admin-session`) | Verified via `/api/admin/session` | `PASS` |
| **System Overview & Metrics** | Metrics cards, uptime, drive status | Client store & Supabase ping | Verified | `PARTIAL` |
| **Website Branding & Appearance** | Preset wallpapers & accent colors | Client Zustand store only | None (client-side only) | `PARTIAL` |
| **Favicon & Icon Management** | Missing | None | None | `FAIL` |
| **Minecraft Store Management** | Redirect button to Minecraft Store app | `localStorage` (`livingyuji_mc_products`) | None in Admin Panel | `UI ONLY` |
| **Other Stores (App Store)** | No admin interface | Hardcoded catalog | None | `UI ONLY` |
| **Showcase & Portfolio Projects** | CRUD forms, modal, categories | `localStorage` (`livingyuji_showcase_projects_v1`)| None (client-side only) | `PARTIAL` |
| **Discord Purchasing Configuration** | Server invite & channel override inputs | Supabase `discord_settings` + Zustand | Verified | `PASS` |
| **Services & Freelance Management**| Pricing & commission slots UI | Client state | None | `PARTIAL` |
| **Projects (D:) & File System** | File editor, folder browser | `useFileSystemStore` + IndexedDB | Client / Local | `PASS` |
| **Media Library** | Tab in union but missing in UI | None | None | `FAIL` |
| **Database Backup & Reset** | JSON export / import file | Local state | Verified | `PASS` |

---

## 3. Detailed Component & Section Analysis

### 3.1 Website Branding & Appearance
- **Current Behavior:** Users can toggle between preset wallpapers (`matrix`, `cyber`, `forest`, `sunset`, `ocean`, `dark`, `default`) and 6 accent colors. Modifications update `windowStore` in memory and `localStorage`.
- **Gaps Identified:**
  1. No connection to the live Supabase `site_settings` table.
  2. No Main Logo manager (no ability to enter custom logo URL, preview light/dark variants, or restore default LivingYuji emblem).
  3. No Favicon manager with live preview and cache-busting query strings (`?v=...`).
  4. No custom wallpaper upload or image URL input with background sizing modes (`cover`, `contain`, `tile`) and overlay opacity slider.
- **Required Fix:**
  - Create `/api/admin/branding` with `GET` and `POST` handlers protected by `isAuthenticatedAdmin(req)`.
  - Upgrade Appearance tab with Logo Manager, Favicon Manager, and Custom Wallpaper controls.
  - Wire `site_settings` into layout headers, desktop wallpapers, and Start Menu branding.

### 3.2 Minecraft Store Management
- **Current Behavior:** The tab in `AdminPanelApp.tsx` contains only an informational banner and a button that opens `minecraftstore` in the window manager. Products in `MinecraftStoreApp` persist only in `localStorage`.
- **Gaps Identified:**
  1. Supabase table `minecraft_products` is created but has 0 records and no admin sync API.
  2. Digital product pricing options (Free vs. Fixed Price, Currency, Discount/Sale price) cannot be managed from the central Admin Panel.
  3. Versioning, MC target versions (`1.21.4`, etc.), server software (`Paper`, `Purpur`), and installation instructions are not editable in Admin Panel.
  4. Digital file downloads (file URLs or attached binaries) cannot be uploaded or replaced from the panel.
- **Required Fix:**
  - Create `/api/admin/products` endpoint supporting `GET`, `POST`, `PUT`, `DELETE` with HMAC server verification.
  - Add full-featured product CRUD interface directly inside `AdminPanelApp.tsx` (Minecraft Store tab).
  - Seed initial catalog to Supabase `minecraft_products` so changes persist to cloud.

### 3.3 Other Stores & App Store
- **Current Behavior:** `AppStoreApp.tsx` exists as a desktop app with categories, ratings, and install actions, but has no admin control surface.
- **Required Fix:**
  - Add App Store management controls inside Admin Panel to toggle app visibility, featured tags, and view installation counts.

### 3.4 Showcase & Project Management
- **Current Behavior:** `AdminPanelApp` has project form state (`projectForm`, `isCreatingProject`) that updates `showcaseStore`. However, `showcaseStore` only persists to `localStorage`.
- **Gaps Identified:**
  - Supabase `showcase_projects` table exists but was not written to by `AdminPanelApp`.
- **Required Fix:**
  - Create `/api/admin/showcase` with HMAC server verification.
  - Synchronize projects between Supabase and `showcaseStore`.
  - Seed initial showcase projects to Supabase.

### 3.5 Media Library
- **Current Behavior:** `'media'` is listed in the `AdminTab` type union, but no tab button exists in the sidebar, and no tab panel is rendered in the body.
- **Required Fix:**
  - Add Media tab button with `Image` icon.
  - Implement full media asset management interface: browse uploaded assets, copy URLs, preview images/videos/icons, and upload new media files.

### 3.6 Security & Admin API Endpoints
- **Current Behavior:** `/api/admin/signin`, `/api/admin/session`, and `/api/admin/logout` are implemented with HMAC-SHA256 cookie validation.
- **Gaps Identified:**
  - Data write operations previously had no dedicated API endpoints verifying admin credentials.
- **Required Fix:**
  - Build server-side route handlers:
    - `/api/admin/branding/route.ts`
    - `/api/admin/products/route.ts`
    - `/api/admin/showcase/route.ts`
    - `/api/admin/media/route.ts`
  - Every POST/PUT/DELETE must invoke `isAuthenticatedAdmin(req)` and return `401 Unauthorized` for invalid or missing sessions.

---

## 4. Upgrade Roadmap

1. **Phase 2 — Server-Side Admin APIs:**
   - Implement `/api/admin/branding`, `/api/admin/products`, `/api/admin/showcase`, and `/api/admin/media`.
2. **Phase 3 — Database Seeding & Migration:**
   - Seed `minecraft_products` and `showcase_projects` from initial catalogs to Supabase.
3. **Phase 4 — Admin Panel UI Enhancements:**
   - Expand `Appearance` tab with Logo, Favicon, and Custom Wallpaper managers.
   - Replace `Minecraft` tab with complete product CRUD and digital file manager.
   - Implement `Media Library` tab with upload, preview, and copy-link capabilities.
   - Connect `Showcase` tab to `/api/admin/showcase`.
4. **Phase 5 — Shell & Desktop Integration:**
   - Reflect `custom_logo_url`, `custom_favicon_url`, and `custom_wallpaper_url` in Desktop and Taskbar.
5. **Phase 6 — Testing & Build Verification:**
   - Type-check with `tsc --noEmit`.
   - Run production build `npm run build`.
