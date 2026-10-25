'use client';

import React from 'react';
import { useWindowStore } from '@/store/windowStore';
import { Send } from 'lucide-react';

const MINECRAFT_SERVICES = [
  'Custom Paper/Purpur plugin development',
  'Plugin feature additions & modifications',
  'Bug fixing & compatibility investigation',
  'Server optimisation and configuration',
  'Custom gameplay mechanics',
  'Skript-based systems',
  'Resource pack integration',
  'Custom items and abilities',
  'Plugin integration & debugging',
  'Version compatibility checks',
  'Server troubleshooting',
];

export function MinecraftApp() {
  const { openWindow } = useWindowStore();

  return (
    <div className="h-full overflow-y-auto window-scroll bg-soft-bg dark:bg-slate-900">
      <div className="max-w-xl mx-auto px-5 py-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🟩</span>
          <div>
            <h1 className="text-xl font-bold text-deep dark:text-white">Minecraft Development</h1>
            <p className="text-sm text-secondary">Paper, Purpur, Skript & Resource Packs</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-border/40">
          <h2 className="text-sm font-semibold text-deep dark:text-white mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-green-500 rounded-full" /> Services
          </h2>
          <div className="grid grid-cols-1 gap-1.5">
            {MINECRAFT_SERVICES.map((s) => (
              <div key={s} className="flex items-center gap-2 text-sm text-secondary py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" /> {s}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-border/40">
          <h2 className="text-sm font-semibold text-deep dark:text-white mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-green-500 rounded-full" /> Supported Platforms
          </h2>
          <div className="flex flex-wrap gap-2">
            {['Paper', 'Purpur', 'Spigot', 'Fabric', 'Velocity', 'BungeeCord', 'Skript'].map((p) => (
              <span key={p} className="text-xs px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full border border-green-200/60 dark:border-green-700/40 font-medium">
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-border/40">
          <h2 className="text-sm font-semibold text-deep dark:text-white mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-green-500 rounded-full" /> Featured Plugins
          </h2>
          {[
            { name: 'ArcaneArsenal', desc: 'Custom weapons & abilities system', ver: '1.21', status: 'Free' },
            { name: 'VantaCombat', desc: 'Advanced combat enhancement', ver: '1.21', status: 'Free' },
            { name: 'WorldManager', desc: 'Multi-world management', ver: '1.20+', status: 'Free' },
            { name: 'AuthSecurity', desc: 'Player authentication & security', ver: '1.20+', status: 'Free' },
          ].map((plugin) => (
            <div key={plugin.name} className="flex items-center justify-between py-2 border-b border-border/30 dark:border-slate-700/30 last:border-0">
              <div>
                <span className="text-sm font-medium text-deep dark:text-white">{plugin.name}</span>
                <span className="ml-2 text-xs text-secondary">{plugin.desc}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full">MC {plugin.ver}</span>
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{plugin.status}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => openWindow('contact')}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-green-500 text-white font-medium text-sm hover:bg-green-600 transition-colors"
        >
          <Send className="w-4 h-4" /> Request Custom Plugin
        </button>
      </div>
    </div>
  );
}
