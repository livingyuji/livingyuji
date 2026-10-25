# LivingYuji OS — Production Deployment Guide

This guide covers deployment procedures, production environment variables, security configurations, and verification steps for **LivingYuji OS**.

---

## 1. Production Architecture Overview

LivingYuji OS is built with **Next.js 14 (App Router)** and runs in two complementary modes:
1. **Self-Hosted / Offline-First Mode (Default):** The OS virtual filesystem, state stores, binary file storage (IndexedDB), and developer applications run directly in the client browser with zero external cloud dependencies.
2. **Cloud-Synchronized Mode:** When configured with Supabase credentials, multi-device cloud synchronization, persistent user-owned files, and cross-device desktop layouts become active.

---

## 2. Environment Variables Configuration

Configure the following environment variables in your production environment (e.g., Vercel Project Settings, Docker `.env`, or Coolify):

```bash
# ==========================================
# 1. ADMINISTRATIVE SECURITY (MANDATORY)
# ==========================================
ADMIN_ACCESS_PASSPHRASE="your-custom-high-entropy-master-passphrase"
ADMIN_SESSION_SECRET="64-character-random-hex-string-for-hmac-signing"

# ==========================================
# 2. SUPABASE CLOUD (OPTIONAL — FOR MULTI-DEVICE SYNC)
# ==========================================
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsIn..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsIn..."

# ==========================================
# 3. PUBLIC METADATA & BRANDING
# ==========================================
NEXT_PUBLIC_SITE_URL="https://livingyuji.com"
```

> [!IMPORTANT]
> Never set `NEXT_PUBLIC_` prefixes on `ADMIN_ACCESS_PASSPHRASE`, `ADMIN_SESSION_SECRET`, or `SUPABASE_SERVICE_ROLE_KEY`. Those keys must remain server-side only.

---

## 3. Deployment Targets

### Option A: Vercel (Recommended for Edge Performance)
1. Push the repository to GitHub.
2. Import project in Vercel.
3. Configure the **Build & Development Settings**:
   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
4. Add the Environment Variables from Section 2 in the Vercel dashboard.
5. Deploy.

### Option B: Node.js / Docker on VPS
To run as a persistent Node.js service using Docker:
```dockerfile
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
```

---

## 4. Pre-Deployment Verification Checklist

Before pushing to production, verify:
- [x] `npm run type-check` (`tsc --noEmit`) passes with 0 errors.
- [x] `npm run lint` (`next lint`) passes with 0 errors.
- [x] `npm run build` compiles all 27+ routes cleanly with 0 webpack errors.
- [x] Next.js edge middleware correctly protects `/admin/dashboard*`.
- [x] No secrets leaked in `.next/static` client bundles.
- [x] All 25 original applications and 8 new expansion applications load properly.

---

## 5. Administrative Endpoints & Supabase Cloud Tables

LivingYuji OS provides dedicated, server-verified endpoints for complete website and storefront control:

| Endpoint | Method | Required Cookie | Supabase Cloud Table |
|---|---|---|---|
| `/api/admin/branding` | `GET`, `POST` | `lyos-admin-session` | `public.site_settings` |
| `/api/admin/products` | `GET`, `POST`, `DELETE` | `lyos-admin-session` | `public.minecraft_products` |
| `/api/admin/showcase` | `GET`, `POST`, `DELETE` | `lyos-admin-session` | `public.showcase_projects` |
| `/api/admin/media` | `GET`, `POST` | `lyos-admin-session` | Media Asset Registry |

### 5.1 Verification Commands
```bash
# Verify TypeScript typing
npm run type-check

# Verify build compilation
npm run build

# Test live admin endpoints
node scratch/test_endpoints_live.js
```

