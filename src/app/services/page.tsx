import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Services & Pricing',
  description: 'LivingYuji development services: Minecraft plugins, Discord bots, web development, custom setups and more.',
};

const SERVICES = [
  { title: 'Website Development', emoji: '🌐', desc: 'Custom websites, web apps and dashboards.' },
  { title: 'Discord Bot Development', emoji: '💬', desc: 'Custom bots, automation and dashboards.' },
  { title: 'Minecraft Plugin Development', emoji: '🟩', desc: 'Paper, Purpur and Fabric plugins.' },
  { title: 'Resource Pack Development', emoji: '🎨', desc: 'Custom textures and item models.' },
  { title: 'Custom Minecraft Setup', emoji: '🔧', desc: 'Server configuration and plugin installation.' },
  { title: 'Discord Server Setup', emoji: '🛡️', desc: 'Channels, roles, bots and moderation.' },
  { title: 'Bug Fixing & Maintenance', emoji: '🐛', desc: 'Debugging and ongoing support.' },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-soft-bg dark:bg-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-primary hover:underline mb-6 block">← Back to OS</Link>
        <h1 className="text-2xl font-bold text-deep dark:text-white mb-2">Services</h1>
        <p className="text-secondary text-sm mb-6">All services are priced by scope. Request a quote via the contact form.</p>
        <div className="space-y-3">
          {SERVICES.map((s) => (
            <div key={s.title} className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-card border border-border/40">
              <div className="text-2xl">{s.emoji}</div>
              <div className="flex-1">
                <div className="font-semibold text-deep dark:text-white text-sm">{s.title}</div>
                <div className="text-xs text-secondary">{s.desc}</div>
              </div>
              <Link href="/contact" className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors">
                Enquire
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
