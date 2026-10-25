import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Custom Setups',
  description: 'Custom Minecraft and Discord setup packages by LivingYuji.',
};

const SETUPS = [
  { name: 'Survival Server Setup', platform: 'Minecraft', desc: 'Economy, ranks, anti-cheat, claiming and optimization.' },
  { name: 'Lifesteal Server Setup', platform: 'Minecraft', desc: 'Heart mechanics, custom items, revival systems.' },
  { name: 'PvP & Practice Setup', platform: 'Minecraft', desc: 'Arenas, kit systems, statistics, and queues.' },
  { name: 'Hub & Lobby Setup', platform: 'Minecraft', desc: 'Portals, menus, NPCs, announcements, and cosmetic integration.' },
  { name: 'Discord Community Setup', platform: 'Discord', desc: 'Complete channel structure, roles, verification, and bots.' },
  { name: 'Support & Ticket Server', platform: 'Discord', desc: 'Ticketing bots, transcript logging, and staff routing.' },
];

export default function SetupsPage() {
  return (
    <div className="min-h-screen bg-soft-bg dark:bg-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-primary hover:underline mb-6 block">← Back to OS</Link>
        <h1 className="text-2xl font-bold text-deep dark:text-white mb-2">Custom Setups</h1>
        <p className="text-secondary text-sm mb-6">Turnkey server systems and Discord configurations.</p>
        <div className="space-y-3">
          {SETUPS.map((s) => (
            <div key={s.name} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-border/40">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-deep dark:text-white">{s.name}</h2>
                  <span className="text-[10px] text-primary font-medium">{s.platform}</span>
                </div>
                <Link href="/contact" className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                  Request
                </Link>
              </div>
              <p className="text-xs text-secondary mt-2">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
