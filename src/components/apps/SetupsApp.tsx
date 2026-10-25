'use client';

import React, { useState } from 'react';
import { useWindowStore } from '@/store/windowStore';
import { Send } from 'lucide-react';

type SetupCategory = 'minecraft' | 'discord';

const MINECRAFT_SETUPS = [
  {
    id: 'survival-setup',
    name: 'Survival Server Setup',
    description: 'Complete survival server configuration with economy, land claiming, anti-cheat and essential plugins.',
    deliverables: ['Server installation', 'Plugin configuration', 'Economy setup', 'Permissions & ranks', 'Basic anti-cheat'],
    requirements: ['Hosting access or server panel', 'Minecraft version preference', 'Plugin preferences'],
  },
  {
    id: 'lifesteal-setup',
    name: 'Lifesteal Server Setup',
    description: 'Lifesteal gamemode server with heart mechanics, revival system, custom items and balanced configuration.',
    deliverables: ['Lifesteal plugin setup', 'Heart system', 'Revival mechanics', 'Custom items', 'Server configuration'],
    requirements: ['Hosting access', 'Player capacity estimate'],
  },
  {
    id: 'pvp-setup',
    name: 'Practice / PvP Server Setup',
    description: 'Competitive PvP server with kit management, ranked system, practice arenas and statistics tracking.',
    deliverables: ['Kit plugin setup', 'Arena configuration', 'Stats tracking', 'Queue system', 'Anti-cheat'],
    requirements: ['Hosting access', 'Arena designs (optional)'],
  },
  {
    id: 'hub-setup',
    name: 'Lobby & Hub Setup',
    description: 'Professional server lobby or hub with navigation, NPCs, announcements and portal configuration.',
    deliverables: ['Lobby plugin setup', 'NPC configuration', 'Portals & navigation', 'Announcements', 'Scoreboard'],
    requirements: ['Hosting access', 'World file (optional)'],
  },
  {
    id: 'full-network',
    name: 'Full Minecraft Network Setup',
    description: 'Multi-server Minecraft network using Velocity or BungeeCord proxy with multiple gamemodes.',
    deliverables: ['Proxy setup', 'Multiple server instances', 'Cross-server features', 'Full configuration'],
    requirements: ['Multiple hosting instances or panel', 'Java version preference'],
  },
];

const DISCORD_SETUPS = [
  {
    id: 'community-setup',
    name: 'Community Server Setup',
    description: 'Full Discord community server setup with channels, roles, permissions and moderation bots.',
    deliverables: ['Channel structure', 'Role hierarchy', 'Permission setup', 'Moderation bots', 'Welcome system'],
    requirements: ['Server admin access', 'Community size estimate'],
  },
  {
    id: 'gaming-setup',
    name: 'Gaming Community Setup',
    description: 'Gaming-focused Discord server with game-specific channels, role assignment, leaderboard bots and event systems.',
    deliverables: ['Gaming channels', 'Game roles', 'Bot configuration', 'Event announcements'],
    requirements: ['Server admin access', 'Games list'],
  },
  {
    id: 'support-setup',
    name: 'Support & Ticket System',
    description: 'Professional Discord support server with ticket system, department routing, staff roles and logging.',
    deliverables: ['Ticket bot setup', 'Department channels', 'Staff roles', 'Logging system'],
    requirements: ['Server admin access', 'Support departments list'],
  },
];

export function SetupsApp() {
  const { openWindow } = useWindowStore();
  const [category, setCategory] = useState<SetupCategory>('minecraft');

  const setups = category === 'minecraft' ? MINECRAFT_SETUPS : DISCORD_SETUPS;

  return (
    <div className="h-full flex flex-col bg-soft-bg dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 border-b border-border/40 px-4 py-3">
        <h1 className="text-sm font-semibold text-deep dark:text-white mb-3">Custom Setups</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setCategory('minecraft')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              category === 'minecraft'
                ? 'bg-green-500 text-white'
                : 'bg-soft-bg dark:bg-slate-700 text-secondary hover:text-deep'
            }`}
          >
            🟩 Minecraft
          </button>
          <button
            onClick={() => setCategory('discord')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              category === 'discord'
                ? 'bg-indigo-500 text-white'
                : 'bg-soft-bg dark:bg-slate-700 text-secondary hover:text-deep'
            }`}
          >
            💬 Discord
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto window-scroll p-4 space-y-3">
        {setups.map((setup) => (
          <div
            key={setup.id}
            className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-border/40"
          >
            <h2 className="text-sm font-semibold text-deep dark:text-white">{setup.name}</h2>
            <p className="text-xs text-secondary mt-1.5 leading-relaxed">{setup.description}</p>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-medium text-deep dark:text-white mb-1.5">Includes:</div>
                <ul className="space-y-1">
                  {setup.deliverables.map((d) => (
                    <li key={d} className="text-[10px] text-secondary flex items-start gap-1">
                      <span className="text-green-500 mt-0.5">✓</span> {d}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-medium text-deep dark:text-white mb-1.5">You&apos;ll need:</div>
                <ul className="space-y-1">
                  {setup.requirements.map((r) => (
                    <li key={r} className="text-[10px] text-secondary flex items-start gap-1">
                      <span className="text-primary mt-0.5">→</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/40 dark:border-slate-700/40 flex items-center justify-between">
              <span className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-full font-medium">Custom Quote</span>
              <button
                onClick={() => openWindow('contact')}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80"
              >
                <Send className="w-3.5 h-3.5" /> Request Setup
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
