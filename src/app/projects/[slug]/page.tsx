import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const PROJECTS: Record<string, { name: string; type: string; description: string; status: string; technologies: string[]; emoji: string; githubUrl?: string; minecraftVersion?: string }> = {
  'arcane-arsenal': {
    name: 'ArcaneArsenal',
    type: 'Minecraft Plugin',
    description: 'Custom Minecraft plugin featuring a complete magical weapons system with unique abilities, custom resource pack integration and advanced combat mechanics.',
    status: 'Completed',
    technologies: ['Java', 'Paper API', 'Gradle', 'Resource Pack'],
    emoji: '⚔️',
    githubUrl: 'https://github.com/livingyuji/ArcaneArsenal',
    minecraftVersion: '1.21',
  },
  'vanta-combat': {
    name: 'VantaCombat',
    type: 'Minecraft Plugin',
    description: 'Advanced combat enhancement plugin for Paper and Fabric servers with custom attack mechanics, hit registration improvements and PvP utilities.',
    status: 'Maintained',
    technologies: ['Java', 'Paper API', 'Fabric API', 'Gradle Loom'],
    emoji: '⚡',
    githubUrl: 'https://github.com/livingyuji/VantaCombat',
    minecraftVersion: '1.21',
  },
  'world-manager': {
    name: 'WorldManager',
    type: 'Minecraft Plugin',
    description: 'Velocity-compatible multi-world management plugin for Paper/Purpur servers.',
    status: 'Completed',
    technologies: ['Java', 'Paper API', 'Velocity', 'Maven'],
    emoji: '🌍',
    githubUrl: 'https://github.com/livingyuji/WorldManager',
    minecraftVersion: '1.20+',
  },
  'raven-bots': {
    name: 'Raven Bots',
    type: 'Discord Bot',
    description: 'Feature-rich Discord bot system with moderation, ticket management, giveaways and custom commands.',
    status: 'Maintained',
    technologies: ['Node.js', 'Discord.js', 'TypeScript', 'MongoDB'],
    emoji: '🐦',
  },
  'enhanced-combat': {
    name: 'EnhancedCombat',
    type: 'Minecraft Plugin',
    description: 'Comprehensive combat improvement plugin adding custom mechanics, balanced gameplay changes and server-specific PvP configurations.',
    status: 'Completed',
    technologies: ['Java', 'Paper API', 'Maven'],
    emoji: '🗡️',
    minecraftVersion: '1.20+',
  },
  'auth-security': {
    name: 'AuthSecurity',
    type: 'Minecraft Plugin',
    description: 'Minecraft player authentication and security plugin with configurable protection and account management.',
    status: 'Maintained',
    technologies: ['Java', 'Paper API', 'SQLite', 'Maven'],
    emoji: '🔐',
    minecraftVersion: '1.20+',
  },
  'livingyuji-os': {
    name: 'LivingYuji OS',
    type: 'Web Application',
    description: 'Interactive OS-style portfolio with a desktop window manager, mobile interface, digital store and admin dashboard.',
    status: 'In Development',
    technologies: ['Next.js', 'TypeScript', 'React', 'Tailwind CSS', 'Supabase'],
    emoji: '💻',
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = PROJECTS[params.slug];
  if (!project) return { title: 'Project Not Found' };
  return {
    title: project.name,
    description: project.description,
  };
}

export async function generateStaticParams() {
  return Object.keys(PROJECTS).map((slug) => ({ slug }));
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = PROJECTS[params.slug];
  if (!project) notFound();

  return (
    <div className="min-h-screen bg-soft-bg dark:bg-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/projects" className="text-sm text-primary hover:underline mb-6 block">← Projects</Link>
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-3xl shadow-card border border-border/40">
            {project.emoji}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-deep dark:text-white">{project.name}</h1>
            <div className="flex gap-2 mt-1.5 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{project.type}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-secondary font-medium">{project.status}</span>
              {project.minecraftVersion && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 font-medium">MC {project.minecraftVersion}</span>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-border/40">
            <h2 className="font-semibold text-deep dark:text-white mb-2 text-sm">Description</h2>
            <p className="text-secondary text-sm leading-relaxed">{project.description}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-border/40">
            <h2 className="font-semibold text-deep dark:text-white mb-3 text-sm">Technologies</h2>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((t) => (
                <span key={t} className="text-xs px-2.5 py-1 bg-soft-bg dark:bg-slate-700 text-secondary rounded-lg border border-border/60">
                  {t}
                </span>
              ))}
            </div>
          </div>
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center px-4 py-3 rounded-2xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 transition-colors"
            >
              View on GitHub
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
