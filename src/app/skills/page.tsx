import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Developer Skills',
  description: 'Technologies, languages, frameworks, and developer tools used by LivingYuji.',
};

const CATEGORIES = [
  {
    title: 'Web Development',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'APIs & REST', 'PostgreSQL'],
  },
  {
    title: 'Minecraft Development',
    skills: ['Paper API', 'Purpur', 'Fabric API', 'Java', 'Gradle', 'Maven', 'Resource Packs', 'Skript'],
  },
  {
    title: 'Discord Development',
    skills: ['Discord.js', 'Bot Automation', 'Role & Ticket Systems', 'Moderation Security', 'OAuth2'],
  },
  {
    title: 'Automation & Tools',
    skills: ['Python', 'Git & GitHub', 'Docker', 'Workflow Scripting', 'Supabase'],
  },
];

export default function SkillsPage() {
  return (
    <div className="min-h-screen bg-soft-bg dark:bg-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-primary hover:underline mb-6 block">← Back to OS</Link>
        <h1 className="text-2xl font-bold text-deep dark:text-white mb-2">Developer Skills</h1>
        <p className="text-secondary text-sm mb-6">Technical capabilities, frameworks, and tools across development domains.</p>
        <div className="space-y-4">
          {CATEGORIES.map((cat) => (
            <div key={cat.title} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-border/40">
              <h2 className="text-sm font-semibold text-deep dark:text-white mb-3">{cat.title}</h2>
              <div className="flex flex-wrap gap-2">
                {cat.skills.map((skill) => (
                  <span key={skill} className="text-xs px-2.5 py-1 bg-soft-bg dark:bg-slate-700 text-secondary rounded-lg border border-border/60">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
