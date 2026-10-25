-- ====================================================================
-- LivingYuji OS — Complete Database Schema & Migration
-- Date: 2026-10-25
-- Description: Tables for site settings, Discord purchasing links,
--              desktop icon layouts, virtual NTFS project files,
--              Minecraft store products, and media library assets.
-- ====================================================================

-- 1. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    brand_name TEXT NOT NULL DEFAULT 'LivingYuji',
    site_title TEXT NOT NULL DEFAULT 'LivingYuji OS — Windows-Inspired Web Operating System & Portfolio',
    wallpaper TEXT NOT NULL DEFAULT 'matrix',
    accent_color TEXT NOT NULL DEFAULT '#0078D4',
    theme TEXT NOT NULL DEFAULT 'dark',
    custom_logo_url TEXT,
    custom_favicon_url TEXT,
    custom_wallpaper_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default site settings
INSERT INTO public.site_settings (id, brand_name, site_title, wallpaper, accent_color, theme)
VALUES ('default', 'LivingYuji', 'LivingYuji OS — Windows-Inspired Web Operating System & Portfolio', 'matrix', '#0078D4', 'dark')
ON CONFLICT (id) DO NOTHING;

-- 2. DISCORD PURCHASING SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.discord_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    main_server_url TEXT NOT NULL DEFAULT 'https://discord.gg/livingyuji',
    purchase_support_url TEXT NOT NULL DEFAULT 'https://discord.gg/livingyuji',
    minecraft_products_url TEXT NOT NULL DEFAULT 'https://discord.gg/livingyuji',
    web_development_url TEXT NOT NULL DEFAULT 'https://discord.gg/livingyuji',
    discord_bots_url TEXT NOT NULL DEFAULT 'https://discord.gg/livingyuji',
    server_setups_url TEXT NOT NULL DEFAULT 'https://discord.gg/livingyuji',
    resource_packs_url TEXT NOT NULL DEFAULT 'https://discord.gg/livingyuji',
    fallback_url TEXT NOT NULL DEFAULT 'https://discord.gg/livingyuji',
    button_label_store TEXT NOT NULL DEFAULT 'Order via Discord',
    button_label_minecraft TEXT NOT NULL DEFAULT 'Buy on Discord',
    button_label_services TEXT NOT NULL DEFAULT 'Inquire on Discord',
    purchase_instructions TEXT NOT NULL DEFAULT '1. Join the LivingYuji Discord server.
2. Navigate to the #orders or #tickets channel.
3. Mention the product code or name to open an order ticket.
4. LivingYuji or our automated assistant will verify payment & deliver your asset instantly.',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default discord settings
INSERT INTO public.discord_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- 3. DESKTOP ICON LAYOUTS TABLE
CREATE TABLE IF NOT EXISTS public.desktop_layouts (
    id TEXT PRIMARY KEY DEFAULT 'default',
    user_id TEXT,
    positions JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. VIRTUAL NTFS D: DRIVE PROJECT FILES
CREATE TABLE IF NOT EXISTS public.project_files (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    folder_id TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'text',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_project_files_folder ON public.project_files(folder_id);
CREATE INDEX IF NOT EXISTS idx_project_files_category ON public.project_files(category);

-- 5. MINECRAFT STORE & MARKETPLACE PRODUCTS
CREATE TABLE IF NOT EXISTS public.minecraft_products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    category_name TEXT NOT NULL,
    short_desc TEXT NOT NULL,
    full_desc TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_free BOOLEAN NOT NULL DEFAULT true,
    version TEXT NOT NULL DEFAULT '1.0.0',
    mc_versions TEXT[] NOT NULL DEFAULT ARRAY['1.21.4', '1.21.1'],
    server_software TEXT[] NOT NULL DEFAULT ARRAY['Paper', 'Purpur'],
    dependencies TEXT[] NOT NULL DEFAULT ARRAY['None'],
    features TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
    installation_steps TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
    changelog TEXT DEFAULT 'Initial release',
    file_format TEXT NOT NULL DEFAULT '.jar',
    file_size TEXT NOT NULL DEFAULT '512 KB',
    creator TEXT NOT NULL DEFAULT 'LivingYuji',
    download_url TEXT,
    direct_file_path TEXT,
    discord_channel_override TEXT,
    published BOOLEAN NOT NULL DEFAULT true,
    featured BOOLEAN NOT NULL DEFAULT false,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
    downloads_count INTEGER NOT NULL DEFAULT 0,
    icon_symbol TEXT NOT NULL DEFAULT '⚡',
    icon_bg TEXT NOT NULL DEFAULT 'from-blue-600 to-indigo-900',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_minecraft_products_category ON public.minecraft_products(category);
CREATE INDEX IF NOT EXISTS idx_minecraft_products_published ON public.minecraft_products(published);

-- 6. MEDIA & STORAGE ASSETS TABLE
CREATE TABLE IF NOT EXISTS public.media_library (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discord_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.desktop_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minecraft_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all public data
CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public read discord_settings" ON public.discord_settings FOR SELECT USING (true);
CREATE POLICY "Public read desktop_layouts" ON public.desktop_layouts FOR SELECT USING (true);
CREATE POLICY "Public read project_files" ON public.project_files FOR SELECT USING (true);
CREATE POLICY "Public read minecraft_products" ON public.minecraft_products FOR SELECT USING (published = true);
CREATE POLICY "Public read media_library" ON public.media_library FOR SELECT USING (true);

-- Allow authenticated users / service role full write access
CREATE POLICY "Admin write site_settings" ON public.site_settings FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Admin write discord_settings" ON public.discord_settings FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Admin write desktop_layouts" ON public.desktop_layouts FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Admin write project_files" ON public.project_files FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Admin write minecraft_products" ON public.minecraft_products FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Admin write media_library" ON public.media_library FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
