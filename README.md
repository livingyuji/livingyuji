# LivingYuji Retro Portfolio — Full Project

This project recreates the supplied retro/pixel portfolio reference as a **LivingYuji** developer portfolio rather than copying the reference person's identity/content.

## Pages
- `/` — public portfolio
- `/dashboard` — separate dashboard/profile page like the reference
- `/admin/login` — Supabase Auth login
- `/admin` — full content control center

## Admin editing
The control center can change the brand, browser title, hero, navigation, profile, profile image URL, goals, about paragraphs, stats, hobbies, habits, projects, services, staffing, cards, connections, URLs and the complete color theme. The **Advanced JSON** editor exposes the entire content object so new values can be changed without touching the public page code.

## Supabase setup
1. Create a Supabase project.
2. Create an Authentication user for yourself.
3. Copy that user's UUID.
4. In `supabase/schema.sql`, replace `YOUR_ADMIN_USER_UUID` with your UUID.
5. Run the SQL file in Supabase SQL Editor.
6. Create `.env.local` from `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

7. Install and run:

```bash
npm install
npm run dev
```

Then open `/admin/login`.

### Security
Only users listed in `admin_users` can write `site_content`. Do not put a Supabase service-role key in `.env.local` or client code. The anon key is intended for browser use with RLS enabled.

## Media
The public content model accepts image URLs, which works with Supabase Storage public URLs, Cloudinary, Imgur/CDNs, etc. This keeps the starter dependency-light. You can add a Storage uploader later without changing the content schema.

## Netlify
`netlify.toml` is included. Add the two Supabase environment variables in Netlify before deploying.
