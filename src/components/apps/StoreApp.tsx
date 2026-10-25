'use client';

import React, { useState } from 'react';
import {
  Home,
  LayoutGrid,
  Gamepad2,
  Library,
  Search,
  Check,
  ExternalLink,
  Sparkles,
  Layers,
  BarChart3,
  Bot,
  Zap,
} from 'lucide-react';
import { useWindowStore } from '@/store/windowStore';
import { DiscordPurchaseModal } from '@/components/common/DiscordPurchaseModal';

type StoreTab = 'home' | 'apps' | 'gaming' | 'library';

interface ServiceItem {
  id: string;
  categoryTag: string;
  title: string;
  subtitle: string;
  price: string;
  iconBg: string;
  icon: React.ReactNode;
}

const SERVICES: ServiceItem[] = [
  {
    id: 'web-build',
    categoryTag: 'WEB SYSTEM',
    title: 'Website / Web App Build',
    subtitle: 'Fast, polished, scalable React & Next.js systems with desktop OS fidelity',
    price: 'Starting at $500',
    iconBg: 'bg-sky-500/20 text-sky-400 border border-sky-500/30',
    icon: <Layers size={22} />,
  },
  {
    id: 'server-setup',
    categoryTag: 'INFRASTRUCTURE',
    title: 'Minecraft Server Setup',
    subtitle: 'High tickrate Purpur / Velocity networks, custom permissions & anti-cheat',
    price: 'Starting at $300',
    iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    icon: <BarChart3 size={22} />,
  },
  {
    id: 'custom-plugins',
    categoryTag: 'JAVA ENGINE',
    title: 'Custom Plugin Development',
    subtitle: 'Custom weapons, combat mechanics, event listeners & database syncing',
    price: 'Starting at $400',
    iconBg: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    icon: <Sparkles size={22} />,
  },
  {
    id: 'discord-bots',
    categoryTag: 'AUTOMATION',
    title: 'Discord Bot & Community System',
    subtitle: 'Full automation bots with slash commands, moderation & web dashboards',
    price: 'Starting at $250',
    iconBg: 'bg-pink-500/20 text-pink-400 border border-pink-500/30',
    icon: <Bot size={22} />,
  },
];

const DIGITAL_APPS = [
  {
    id: 'arcane-arsenal',
    title: 'ArcaneArsenal Plugin',
    desc: '10+ magical weapons, particle effects, sound design and custom model data',
    version: 'v1.21.1',
    status: 'Free Download',
    downloads: '1.4k',
    rating: '5.0',
    iconBg: 'bg-indigo-600',
    icon: '⚔️',
  },
  {
    id: 'vanta-combat',
    title: 'VantaCombat PvP Engine',
    desc: 'High performance hit registration, knockback tuning and combat tagging',
    version: 'v1.0.0',
    status: 'Free Download',
    downloads: '980',
    rating: '4.9',
    iconBg: 'bg-cyan-600',
    icon: '⚡',
  },
  {
    id: 'auth-security',
    title: 'AuthSecurity Proxy',
    desc: 'IP rate limiting, account verification and VPN block system for Velocity',
    version: 'v2.4',
    status: 'Free Download',
    downloads: '2.1k',
    rating: '4.8',
    iconBg: 'bg-emerald-600',
    icon: '🔐',
  },
];

export function StoreApp() {
  const { openWindow } = useWindowStore();
  const [activeTab, setActiveTab] = useState<StoreTab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderedServices, setOrderedServices] = useState<Set<string>>(new Set());
  const [selectedProductForDiscord, setSelectedProductForDiscord] = useState<{
    id: string;
    name: string;
    category?: string;
    price: number | string;
  } | null>(null);

  const handleGetService = (service: ServiceItem) => {
    setSelectedProductForDiscord({
      id: service.id,
      name: service.title,
      category: service.categoryTag,
      price: service.price,
    });
  };

  return (
    <div className="h-full flex bg-[#161B26] text-white select-none overflow-hidden font-sans">
      {/* Left Narrow Vertical Icon Dock (Microsoft Store style) */}
      <div className="w-16 bg-[#11141D] border-r border-white/5 flex flex-col items-center py-4 gap-6 shrink-0">
        <button
          onClick={() => setActiveTab('home')}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeTab === 'home'
              ? 'bg-[#0078D4] text-white shadow-lg shadow-sky-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Home"
        >
          <Home size={20} />
        </button>

        <button
          onClick={() => setActiveTab('apps')}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeTab === 'apps'
              ? 'bg-[#0078D4] text-white shadow-lg shadow-sky-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Apps & Plugins"
        >
          <LayoutGrid size={20} />
        </button>

        <button
          onClick={() => setActiveTab('gaming')}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeTab === 'gaming'
              ? 'bg-[#0078D4] text-white shadow-lg shadow-sky-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Gaming"
        >
          <Gamepad2 size={20} />
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeTab === 'library'
              ? 'bg-[#0078D4] text-white shadow-lg shadow-sky-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Library"
        >
          <Library size={20} />
        </button>
      </div>

      {/* Main Store Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header & Search Bar */}
        <div className="h-16 px-8 border-b border-white/10 bg-[#161B26] flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">LivingYuji Store</h1>
            <p className="text-[11px] text-slate-400">Professional services & digital tools</p>
          </div>

          <div className="relative w-80">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search apps, games, services"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1F2536] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>
        </div>

        {/* Store Content Scrolling View */}
        <div className="flex-1 overflow-y-auto window-scroll p-8 space-y-8 bg-gradient-to-b from-[#181E2C] to-[#121620]">
          {activeTab === 'home' && (
            <>
              {/* Blue Hero Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 p-8 shadow-2xl relative overflow-hidden border border-sky-400/30 flex flex-col justify-between min-h-[220px]">
                {/* Background Decor */}
                <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />

                <div className="space-y-3 z-10 max-w-lg">
                  <span className="px-3 py-1 rounded-full bg-white/20 text-white font-bold text-[10px] tracking-wider uppercase">
                    WEB SYSTEM
                  </span>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
                    Website / Web App Build
                  </h2>
                  <p className="text-xs text-blue-100 leading-relaxed">
                    Fast, polished, scalable React & Next.js systems engineered with custom desktop
                    fidelity, instant loading, and interactive workflows.
                  </p>
                </div>

                <div className="pt-4 z-10">
                  <button
                    onClick={() =>
                      setSelectedProductForDiscord({
                        id: 'custom-web-build',
                        name: 'Website / Web App Build',
                        category: 'WEB SYSTEM',
                        price: '$500+',
                      })
                    }
                    className="px-5 py-2.5 rounded-full bg-white text-slate-900 font-bold text-xs shadow-lg hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all"
                  >
                    Start a build
                  </button>
                </div>
              </div>

              {/* Top Professional Services Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Top professional services
                  </h3>
                  <button
                    onClick={() => openWindow('contact')}
                    className="text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
                  >
                    See all
                  </button>
                </div>

                {/* Services Grid matching screenshot */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {SERVICES.map((srv) => (
                    <div
                      key={srv.id}
                      className="bg-[#1C2232] border border-white/10 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-sky-500/40 hover:bg-[#20273A] transition-all shadow-md group"
                    >
                      <div className="space-y-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${srv.iconBg} shadow-inner group-hover:scale-105 transition-transform`}
                        >
                          {srv.icon}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                            {srv.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {srv.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300">{srv.price}</span>
                        <button
                          onClick={() => handleGetService(srv)}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                            orderedServices.has(srv.id)
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-white/10 hover:bg-white text-white hover:text-black'
                          }`}
                        >
                          {orderedServices.has(srv.id) ? 'Requested' : 'Get'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'apps' && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-white">Featured Digital Products & Plugins</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {DIGITAL_APPS.map((app) => (
                  <div
                    key={app.id}
                    className="bg-[#1C2232] border border-white/10 rounded-2xl p-5 flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${app.iconBg} text-white shadow-md`}
                      >
                        {app.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-white">{app.title}</h4>
                        <div className="text-[10px] text-emerald-400 font-semibold">{app.version}</div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{app.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="text-xs text-slate-400">★ {app.rating} ({app.downloads})</span>
                      <button
                        onClick={() => openWindow('thispc')}
                        className="px-4 py-1.5 rounded-full bg-[#0078D4] hover:bg-[#0086F0] text-white font-bold text-xs shadow-md transition-all"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'gaming' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Gaming Center</h3>
              <p className="text-xs text-slate-400">
                Launch games and server utilities built for LivingYuji OS.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => openWindow('games')}
                  className="p-5 rounded-2xl bg-gradient-to-r from-emerald-800 to-green-950 border border-emerald-500/40 cursor-pointer hover:scale-[1.01] transition-all"
                >
                  <h4 className="text-lg font-bold text-white">LivingYuji Arcade</h4>
                  <p className="text-xs text-slate-200 mt-1">Play Minesweeper, Snake, and 2048.</p>
                </div>
                <div
                  onClick={() => openWindow('projects')}
                  className="p-5 rounded-2xl bg-gradient-to-r from-purple-800 to-indigo-950 border border-purple-500/40 cursor-pointer hover:scale-[1.01] transition-all"
                >
                  <h4 className="text-lg font-bold text-white">Minecraft Weapon Packs</h4>
                  <p className="text-xs text-slate-200 mt-1">Custom 3D models and resource packs.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'library' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Your Software Library</h3>
              <div className="bg-[#1C2232] border border-white/10 rounded-2xl p-6 text-center space-y-3">
                <div className="text-3xl">📦</div>
                <h4 className="text-sm font-bold text-white">Installed Applications</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  All 12 LivingYuji OS applications, virtual NTFS drives, and synthesized audio
                  workstations are ready in your desktop environment.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Discord Purchase Modal */}
      <DiscordPurchaseModal
        isOpen={Boolean(selectedProductForDiscord)}
        onClose={() => setSelectedProductForDiscord(null)}
        product={selectedProductForDiscord}
      />
    </div>
  );
}
