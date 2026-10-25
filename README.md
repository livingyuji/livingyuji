# LivingYuji OS

**LivingYuji OS** is an interactive desktop and mobile operating-system-style portfolio, developer services showcase, digital product storefront, and administration dashboard.

Inspired by creative web OS environments such as [pouyashahri.com](https://pouyashahri.com/), LivingYuji OS delivers a personal computer and smartphone simulation on the web, paired with search-engine-friendly static routes.

---

## 🌟 Features

### 🖥️ Desktop OS Experience
- **Interactive Window Manager:** Multi-window support with drag-by-titlebar, edge/corner resizing, minimize, maximize, restore, stacking order (z-index), and close controls.
- **Desktop Environment:** Customizable wallpapers (Sky Blue, Ocean, Sunset, Forest, Dark), desktop icons with double-click / tap execution, live taskbar with running app indicators, and live system clock.
- **Searchable Launcher & Context Menu:** Quick app search across categories (Portfolio, Services, Store, System) and right-click desktop actions.
- **Keyboard Shortcuts:** `Alt + Tab` window switching, `Meta` launcher toggle, and `Escape` overlay dismissals.

### 📱 Purpose-Built Mobile OS
- **Phone Shell:** Mobile status bar with live clock and battery simulation, full-screen applications, bottom dock, date widget, and app switcher / recent apps viewer.
- **Responsive Adaptations:** Avoids tiny draggable windows on phones in favor of clean native-feeling navigation with back buttons and smooth app transitions.

### 📦 Applications Included
1. **About Me (`about`):** Professional bio, development areas, collaboration status, and verified social links.
2. **Projects Explorer (`projects`):** Filterable showcase of LivingYuji's Minecraft plugins (ArcaneArsenal, VantaCombat, WorldManager, AuthSecurity, EnhancedCombat), Discord bots (Raven Bots), and web projects with tags and links.
3. **Developer Skills (`skills`):** Organized categories covering Java/Paper API, Discord.js, React/Next.js, Python, and dev tooling.
4. **Minecraft Development (`minecraft`):** Dedicated Paper/Purpur/Fabric service showcase and custom plugin order action.
5. **Discord Development (`discord`):** Custom Discord bots, moderation systems, ticket bots, and OAuth integrations.
6. **Web Development (`webdev`):** Full-stack responsive web apps, APIs, and dashboard development.
7. **Custom Setups (`setups`):** Turnkey Minecraft server configurations (Survival, Lifesteal, PvP, Hub) and Discord community servers.
8. **Digital Store (`store`):** Digital marketplace for free downloads and paid commissions with filterable categories.
9. **Services & Pricing (`services`):** Transparent deliverables and quote requests for development commissions.
10. **Contact (`contact`):** Validated enquiry system with rate limiting, error handling, and Supabase integration.
11. **Resume (`resume`):** Developer credentials, project highlights, and contact information.
12. **Settings (`settings`):** Live wallpaper selector, Light/Dark appearance mode, reduced motion accessibility toggle, sound toggle, and layout resets.
13. **Terminal (`terminal`):** Simulated command line supporting safe commands (`help`, `about`, `projects`, `skills`, `services`, `setups`, `store`, `contact`, `open <app>`, `date`, `clear`).

### 🌐 Shareable Web & Admin Routes
- `/` — Interactive OS Homepage
- `/about` — About page
- `/projects` & `/projects/[slug]` — Project listings and details
- `/skills` — Developer skills
- `/services` — Services and pricing
- `/setups` — Custom setup packages
- `/store` — Digital store
- `/contact` — Enquiry form
- `/resume` — Resume and credentials
- `/privacy` & `/terms` — Policies
- `/admin` & `/admin/dashboard` — Authentication and administrative dashboard
- `/sitemap.xml` & `robots.txt` — SEO ready

---

## 🚀 Running the Project

### Prerequisites
- Node.js 18+ (tested with Node.js 24)
- npm or pnpm

### Development Server
```bash
cd livingyuji-os
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure your environment variables:
```env
# 1. Supabase Cloud Database (Optional - App runs with local fallback if omitted)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# 2. Administrative Security Passphrase (Server-Verified)
ADMIN_ACCESS_PASSPHRASE=your-secure-admin-passphrase-here
ADMIN_SESSION_SECRET=your-random-32-char-hmac-secret-here

# 3. Community & Purchasing Integrations
NEXT_PUBLIC_DISCORD_SERVER_URL=https://discord.gg/livingyuji
```

---

## 🔒 Security & Architecture Notes
- **Local-First Fallback:** If cloud credentials are not supplied, LivingYuji OS gracefully falls back to local in-memory/Zustand storage so that visitors can browse all applications, portfolios, and store products immediately.
- **Server-Verified Administration:** Privileged API routes (`/api/admin/*`) and administrative actions in the Control Panel are strictly protected server-side with HMAC-signed session cookies and cryptographic verification.
- **File System & Uploads:** Supports binary and text file uploads in File Explorer (`This PC`), custom desktop video wallpaper looping (.mp4, .webm), and custom avatars/favicons.
- **Audit Documentation:** Detailed security reviews and architectural remediation reports are preserved in `docs/TECHNICAL_AUDIT.md`, `docs/ADMIN_PANEL_AUDIT.md`, and `docs/SUPABASE_SETUP.md`.
