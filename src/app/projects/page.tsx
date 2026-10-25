import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Browse LivingYuji\'s projects: Minecraft plugins, Discord bots, web applications and more.',
};

const PROJECTS = [
  { slug: 'arcane-arsenal', name: 'ArcaneArsenal', type: 'Minecraft Plugin', status: 'Completed', emoji: '⚔️' },
  { slug: 'vanta-combat', name: 'VantaCombat', type: 'Minecraft Plugin', status: 'Maintained', emoji: '⚡' },
  { slug: 'world-manager', name: 'WorldManager', type: 'Minecraft Plugin', status: 'Completed', emoji: '🌍' },
  { slug: 'raven-bots', name: 'Raven Bots', type: 'Discord Bot', status: 'Maintained', emoji: '🐦' },
  { slug: 'enhanced-combat', name: 'EnhancedCombat', type: 'Minecraft Plugin', status: 'Completed', emoji: '🗡️' },
  { slug: 'auth-security', name: 'AuthSecurity', type: 'Minecraft Plugin', status: 'Maintained', emoji: '🔐' },
  { slug: 'livingyuji-os', name: 'LivingYuji OS', type: 'Web Application', status: 'In Development', emoji: '💻' },
];

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-soft-bg dark:bg-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-primary hover:underline mb-6 block">← Back to OS</Link>
        <h1 className="text-2xl font-bold text-deep dark:text-white mb-2">Projects</h1>
        <p className="text-secondary text-sm mb-6">A selection of my work across Minecraft, Discord and web development.</p>
        <div className="space-y-3">
          {PROJECTS.map((p) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-card border border-border/40 hover:border-primary/30 transition-all"
            >
              <div className="w-10 h-10 bg-soft-bg dark:bg-slate-700 rounded-xl flex items-center justify-center text-xl">
                {p.emoji}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-deep dark:text-white text-sm">{p.name}</div>
                <div className="text-xs text-secondary">{p.type}</div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{p.status}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
