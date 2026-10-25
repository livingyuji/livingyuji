-- ====================================================================
-- LivingYuji OS — Showcase Application Database Schema & Migration
-- Date: 2026-10-25
-- Description: Tables for showcase projects, categories, screenshots,
--              compatibility matrices, and live metrics.
-- ====================================================================

-- 1. SHOWCASE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.showcase_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Sparkles',
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default showcase categories
INSERT INTO public.showcase_categories (id, name, icon, description, sort_order)
VALUES
    ('all', 'All Works', 'Sparkles', 'Everything designed, programmed, and maintained by LivingYuji', 0),
    ('mc-plugins', 'Minecraft Plugins', 'Box', 'High-performance Spigot, Paper, Purpur & Folia plugins', 1),
    ('mc-setups', 'Server Setups', 'Server', 'Turnkey networks, proxy configs, and production server cores', 2),
    ('mc-packs', 'Resource Packs', 'Palette', 'High-fidelity custom 3D models, GUI packs, and item cosmetics', 3),
    ('discord-dev', 'Discord Development', 'Bot', 'Custom Discord bots, slash frameworks, ticket systems & bridges', 4),
    ('web-apps', 'Websites & Web Apps', 'Globe', 'Modern web applications, interactive web OSs & responsive systems', 5),
    ('tools-cli', 'Developer Tools & CLI', 'Terminal', 'High-throughput CLI tools, automation scripts & developer packages', 6),
    ('services', 'Custom Services', 'Wrench', 'End-to-end commissioned development, architectural audits & contracts', 7)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;

-- 2. SHOWCASE PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.showcase_projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category_id TEXT NOT NULL REFERENCES public.showcase_categories(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    description TEXT NOT NULL,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    technologies JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'Released' CHECK (status IN ('Released', 'In Development', 'Beta', 'Maintained', 'Archived')),
    featured BOOLEAN NOT NULL DEFAULT false,
    is_free BOOLEAN NOT NULL DEFAULT true,
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    version TEXT NOT NULL DEFAULT 'v1.0.0',
    gradient_bg TEXT NOT NULL DEFAULT 'from-blue-600 to-indigo-900',
    icon_symbol TEXT NOT NULL DEFAULT '⚡',
    links JSONB NOT NULL DEFAULT '{}'::jsonb,
    compatibility JSONB NOT NULL DEFAULT '{}'::jsonb,
    screenshots JSONB NOT NULL DEFAULT '[]'::jsonb,
    changelog JSONB NOT NULL DEFAULT '[]'::jsonb,
    install_guide TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_showcase_projects_category ON public.showcase_projects(category_id);
CREATE INDEX IF NOT EXISTS idx_showcase_projects_featured ON public.showcase_projects(featured);
CREATE INDEX IF NOT EXISTS idx_showcase_projects_status ON public.showcase_projects(status);
CREATE INDEX IF NOT EXISTS idx_showcase_projects_created_at ON public.showcase_projects(created_at DESC);

-- Enable RLS
ALTER TABLE public.showcase_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showcase_projects ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public Read Access for Showcase Categories"
    ON public.showcase_categories FOR SELECT USING (true);

CREATE POLICY "Public Read Access for Showcase Projects"
    ON public.showcase_projects FOR SELECT USING (true);

-- Allow authenticated or service role write access
CREATE POLICY "Admin Full Access for Showcase Categories"
    ON public.showcase_categories FOR ALL
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Admin Full Access for Showcase Projects"
    ON public.showcase_projects FOR ALL
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
