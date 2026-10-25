'use client';

import React, { useState } from 'react';
import { Search, Filter, ExternalLink, Github, Package } from 'lucide-react';

type ProjectStatus = 'completed' | 'in-development' | 'maintained' | 'archived';
type ProjectCategory = 'web' | 'discord' | 'minecraft-plugin' | 'resource-pack' | 'server-system' | 'automation' | 'other';

interface Project {
  id: string;
  name: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  technologies: string[];
  featured: boolean;
  githubUrl?: string;
  demoUrl?: string;
  downloadUrl?: string;
  date: string;
  minecraftVersion?: string;
  coverEmoji?: string;
}

const PROJECTS: Project[] = [
  {
    id: 'arcane-arsenal',
    name: 'ArcaneArsenal',
    description: 'Custom Minecraft plugin featuring a complete magical weapons system with unique abilities, custom resource pack integration and advanced combat mechanics.',
    category: 'minecraft-plugin',
    status: 'completed',
    technologies: ['Java', 'Paper API', 'Gradle', 'Resource Pack'],
    featured: true,
    githubUrl: 'https://github.com/livingyuji/ArcaneArsenal',
    date: '2024',
    minecraftVersion: '1.21',
    coverEmoji: '⚔️',
  },
  {
    id: 'vanta-combat',
    name: 'VantaCombat',
    description: 'Advanced combat enhancement plugin for Paper/Fabric servers with custom attack mechanics, hit registration improvements and PvP utilities.',
    category: 'minecraft-plugin',
    status: 'maintained',
    technologies: ['Java', 'Paper API', 'Fabric API', 'Gradle Loom'],
    featured: true,
    githubUrl: 'https://github.com/livingyuji/VantaCombat',
    date: '2024',
    minecraftVersion: '1.21',
    coverEmoji: '⚡',
  },
  {
    id: 'world-manager',
    name: 'WorldManager',
    description: 'Velocity-compatible multi-world management plugin for Paper/Purpur servers. Supports world creation, teleportation and configuration via commands.',
    category: 'minecraft-plugin',
    status: 'completed',
    technologies: ['Java', 'Paper API', 'Velocity', 'Maven'],
    featured: false,
    githubUrl: 'https://github.com/livingyuji/WorldManager',
    date: '2024',
    minecraftVersion: '1.20+',
    coverEmoji: '🌍',
  },
  {
    id: 'raven-bots',
    name: 'Raven Bots',
    description: 'Feature-rich Discord bot system with moderation, ticket management, giveaways, and custom commands for community server management.',
    category: 'discord',
    status: 'maintained',
    technologies: ['Node.js', 'Discord.js', 'TypeScript', 'MongoDB'],
    featured: true,
    date: '2024',
    coverEmoji: '🐦',
  },
  {
    id: 'enhanced-combat',
    name: 'EnhancedCombat',
    description: 'Comprehensive combat improvement plugin adding custom mechanics, balanced gameplay changes and server-specific PvP configurations.',
    category: 'minecraft-plugin',
    status: 'completed',
    technologies: ['Java', 'Paper API', 'Maven'],
    featured: false,
    githubUrl: 'https://github.com/livingyuji/EnhancedCombat',
    date: '2024',
    minecraftVersion: '1.20+',
    coverEmoji: '🗡️',
  },
  {
    id: 'dead-veil-pack',
    name: 'DeadVeil Pack Compat',
    description: 'Minecraft resource pack compatibility layer and conversion tool for maintaining texture consistency across multiple pack formats.',
    category: 'resource-pack',
    status: 'completed',
    technologies: ['Python', 'Resource Pack Format', 'JSON'],
    featured: false,
    date: '2024',
    coverEmoji: '🎨',
  },
  {
    id: 'auth-security',
    name: 'AuthSecurity',
    description: 'Minecraft player authentication and security plugin with configurable protection, IP tracking and account management features.',
    category: 'minecraft-plugin',
    status: 'maintained',
    technologies: ['Java', 'Paper API', 'SQLite', 'Maven'],
    featured: false,
    date: '2024',
    minecraftVersion: '1.20+',
    coverEmoji: '🔐',
  },
  {
    id: 'livingyuji-os',
    name: 'LivingYuji OS',
    description: 'This website — an interactive OS-style portfolio with a desktop window manager, mobile interface, store and admin dashboard. Built with Next.js and TypeScript.',
    category: 'web',
    status: 'in-development',
    technologies: ['Next.js', 'TypeScript', 'React', 'Tailwind CSS', 'Supabase'],
    featured: true,
    date: '2024',
    coverEmoji: '💻',
  },
];

const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  web: 'Web',
  discord: 'Discord',
  'minecraft-plugin': 'MC Plugin',
  'resource-pack': 'Resource Pack',
  'server-system': 'Server System',
  automation: 'Automation',
  other: 'Other',
};

const STATUS_STYLES: Record<ProjectStatus, string> = {
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  maintained: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'in-development': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  archived: 'bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400',
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
  completed: 'Completed',
  maintained: 'Maintained',
  'in-development': 'In Development',
  archived: 'Archived',
};

const CAT_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'web', label: 'Web' },
  { value: 'discord', label: 'Discord' },
  { value: 'minecraft-plugin', label: 'MC Plugins' },
  { value: 'resource-pack', label: 'Resource Packs' },
  { value: 'automation', label: 'Automation' },
  { value: 'other', label: 'Other' },
];

export function ProjectsApp() {
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Project | null>(null);

  const filtered = PROJECTS.filter((p) => {
    const matchQuery =
      !query.trim() ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase()) ||
      p.technologies.some((t) => t.toLowerCase().includes(query.toLowerCase()));
    const matchCat = catFilter === 'all' || p.category === catFilter;
    return matchQuery && matchCat;
  });

  const featured = filtered.filter((p) => p.featured);
  const rest = filtered.filter((p) => !p.featured);

  if (selected) {
    return (
      <div className="h-full flex flex-col bg-soft-bg dark:bg-slate-900">
        {/* Back header */}
        <div className="bg-white/80 dark:bg-slate-800/80 border-b border-border/40 dark:border-slate-700/40 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSelected(null)}
            className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
            aria-label="Back to projects"
          >
            ← Projects
          </button>
          <span className="text-secondary">/</span>
          <span className="text-sm font-medium text-deep dark:text-white">{selected.name}</span>
        </div>

        {/* Project detail */}
        <div className="flex-1 overflow-y-auto window-scroll p-6">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-3xl shadow-card border border-border/40">
                {selected.coverEmoji || '📁'}
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-deep dark:text-white">{selected.name}</h1>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    {CATEGORY_LABELS[selected.category]}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[selected.status]}`}>
                    {STATUS_LABELS[selected.status]}
                  </span>
                  {selected.minecraftVersion && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium">
                      MC {selected.minecraftVersion}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-border/40">
              <h2 className="text-sm font-semibold text-deep dark:text-white mb-2">Description</h2>
              <p className="text-sm text-secondary leading-relaxed">{selected.description}</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-border/40">
              <h2 className="text-sm font-semibold text-deep dark:text-white mb-3">Technologies</h2>
              <div className="flex flex-wrap gap-2">
                {selected.technologies.map((tech) => (
                  <span key={tech} className="text-xs px-2.5 py-1 bg-soft-bg dark:bg-slate-700 text-secondary rounded-lg border border-border/60 dark:border-slate-600">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Links */}
            {(selected.githubUrl || selected.demoUrl || selected.downloadUrl) && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-border/40">
                <h2 className="text-sm font-semibold text-deep dark:text-white mb-3">Links</h2>
                <div className="flex flex-wrap gap-2">
                  {selected.githubUrl && (
                    <a
                      href={selected.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-soft-bg dark:bg-slate-700 text-sm text-deep dark:text-white border border-border/60 hover:border-primary/40 transition-colors"
                    >
                      <Github className="w-4 h-4" /> GitHub
                    </a>
                  )}
                  {selected.demoUrl && (
                    <a
                      href={selected.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-soft-bg dark:bg-slate-700 text-sm text-deep dark:text-white border border-border/60 hover:border-primary/40 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" /> Demo
                    </a>
                  )}
                  {selected.downloadUrl && (
                    <a
                      href={selected.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-white text-sm transition-colors hover:bg-primary/90"
                    >
                      <Package className="w-4 h-4" /> Download
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-soft-bg dark:bg-slate-900">
      {/* Toolbar */}
      <div className="bg-white/80 dark:bg-slate-800/80 border-b border-border/40 dark:border-slate-700/40 px-4 py-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
          <input
            type="text"
            placeholder="Search projects…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-soft-bg dark:bg-slate-700 rounded-xl text-sm text-deep dark:text-white placeholder-secondary border border-border/60 dark:border-slate-600 outline-none focus:border-primary/40 transition-colors"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {CAT_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setCatFilter(f.value)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                catFilter === f.value
                  ? 'bg-primary text-white'
                  : 'bg-soft-bg dark:bg-slate-700 text-secondary hover:text-deep dark:hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Project list */}
      <div className="flex-1 overflow-y-auto window-scroll p-4 space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-secondary text-sm">
            <div className="text-3xl mb-2">📂</div>
            No projects found
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">Featured</h2>
                <div className="grid grid-cols-1 gap-2">
                  {featured.map((p) => (
                    <ProjectCard key={p.id} project={p} onSelect={setSelected} />
                  ))}
                </div>
              </div>
            )}
            {rest.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
                  {featured.length > 0 ? 'Other Projects' : 'Projects'}
                </h2>
                <div className="grid grid-cols-1 gap-2">
                  {rest.map((p) => (
                    <ProjectCard key={p.id} project={p} onSelect={setSelected} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project, onSelect }: { project: Project; onSelect: (p: Project) => void }) {
  return (
    <button
      onClick={() => onSelect(project)}
      className="w-full bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-card border border-border/40 dark:border-slate-700/40 text-left hover:border-primary/30 hover:shadow-window transition-all duration-150 flex items-start gap-3"
    >
      <div className="w-10 h-10 rounded-xl bg-soft-bg dark:bg-slate-700 flex items-center justify-center text-xl shrink-0">
        {project.coverEmoji || '📁'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-deep dark:text-white">{project.name}</span>
          {project.featured && (
            <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-medium">Featured</span>
          )}
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_STYLES[project.status]}`}>
            {STATUS_LABELS[project.status]}
          </span>
        </div>
        <p className="text-xs text-secondary mt-1 line-clamp-2">{project.description}</p>
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {project.technologies.slice(0, 4).map((t) => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 bg-soft-bg dark:bg-slate-700 text-secondary rounded-md border border-border/40">
              {t}
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span className="text-[10px] text-secondary">+{project.technologies.length - 4} more</span>
          )}
        </div>
      </div>
    </button>
  );
}
