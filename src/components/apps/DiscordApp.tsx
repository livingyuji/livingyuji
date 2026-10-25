'use client';

import React from 'react';
import { useWindowStore } from '@/store/windowStore';
import { Send } from 'lucide-react';

const DISCORD_SERVICES = [
  'Custom Discord bots (commands, events, automation)',
  'Moderation & anti-spam systems',
  'Server security & verification',
  'Ticket and support systems',
  'Giveaway and event systems',
  'Welcome and onboarding automation',
  'Reaction/button roles',
  'API integrations',
  'Discord OAuth web integrations',
  'Web dashboard development',
  'Bot maintenance and bug fixing',
];

export function DiscordApp() {
  const { openWindow } = useWindowStore();

  return (
    <div className="h-full overflow-y-auto window-scroll bg-soft-bg dark:bg-slate-900">
      <div className="max-w-xl mx-auto px-5 py-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">💬</span>
          <div>
            <h1 className="text-xl font-bold text-deep dark:text-white">Discord Development</h1>
            <p className="text-sm text-secondary">Bots, Automation & Server Management</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-border/40">
          <h2 className="text-sm font-semibold text-deep dark:text-white mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-indigo-500 rounded-full" /> Services
          </h2>
          <div className="grid grid-cols-1 gap-1.5">
            {DISCORD_SERVICES.map((s) => (
              <div key={s} className="flex items-center gap-2 text-sm text-secondary py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" /> {s}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-border/40">
          <h2 className="text-sm font-semibold text-deep dark:text-white mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-indigo-500 rounded-full" /> Technologies
          </h2>
          <div className="flex flex-wrap gap-2">
            {['Discord.js', 'Node.js', 'TypeScript', 'Python', 'Discord API', 'MongoDB', 'PostgreSQL', 'REST APIs'].map((t) => (
              <span key={t} className="text-xs px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-full border border-indigo-200/60 dark:border-indigo-700/40 font-medium">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-border/40">
          <h2 className="text-sm font-semibold text-deep dark:text-white mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-indigo-500 rounded-full" /> Featured Work
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-soft-bg dark:bg-slate-700 rounded-xl">
              <div className="font-medium text-sm text-deep dark:text-white">🐦 Raven Bots</div>
              <p className="text-xs text-secondary mt-1">Feature-rich Discord bot system with moderation, ticket management, giveaways and custom commands.</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {['Discord.js', 'Node.js', 'TypeScript', 'MongoDB'].map((t) => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 bg-white dark:bg-slate-600 text-secondary rounded border border-border/60">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => openWindow('contact')}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-500 text-white font-medium text-sm hover:bg-indigo-600 transition-colors"
        >
          <Send className="w-4 h-4" /> Request Discord Bot
        </button>
      </div>
    </div>
  );
}
