import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Store — Digital Products',
  description: 'Browse LivingYuji\'s digital store: free and premium Minecraft plugins, resource packs, Discord bots and more.',
};

const PRODUCTS = [
  { slug: 'arcane-arsenal', name: 'ArcaneArsenal Plugin', status: 'free', emoji: '⚔️', desc: 'Custom weapons & abilities system' },
  { slug: 'vanta-combat', name: 'VantaCombat Plugin', status: 'free', emoji: '⚡', desc: 'Advanced combat enhancement' },
  { slug: 'world-manager', name: 'WorldManager Plugin', status: 'free', emoji: '🌍', desc: 'Multi-world management' },
  { slug: 'auth-security', name: 'AuthSecurity Plugin', status: 'free', emoji: '🔐', desc: 'Player authentication & security' },
  { slug: 'custom-plugin', name: 'Custom Plugin Commission', status: 'paid', emoji: '🛠️', desc: 'Request a custom plugin' },
];

const STATUS_STYLES: Record<string, string> = {
  free: 'bg-green-100 text-green-700',
  paid: 'bg-primary/10 text-primary',
};

export default function StorePage() {
  return (
    <div className="min-h-screen bg-soft-bg dark:bg-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-primary hover:underline mb-6 block">← Back to OS</Link>
        <h1 className="text-2xl font-bold text-deep dark:text-white mb-2">Digital Store</h1>
        <p className="text-secondary text-sm mb-6">Free and premium digital products for Minecraft, Discord and web development.</p>
        <div className="space-y-3">
          {PRODUCTS.map((p) => (
            <div
              key={p.slug}
              className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-card border border-border/40"
            >
              <div className="w-10 h-10 bg-soft-bg dark:bg-slate-700 rounded-xl flex items-center justify-center text-xl">
                {p.emoji}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-deep dark:text-white text-sm">{p.name}</div>
                <div className="text-xs text-secondary">{p.desc}</div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[p.status]}`}>
                {p.status === 'free' ? 'Free' : 'Paid'}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-secondary text-center mt-8">
          For full product details and downloads, open the Store app in{' '}
          <Link href="/" className="text-primary hover:underline">LivingYuji OS</Link>.
        </p>
      </div>
    </div>
  );
}
