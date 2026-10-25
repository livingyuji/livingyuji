'use client';

import React, { useState, useMemo } from 'react';
import { useWindowStore, AppId } from '@/store/windowStore';
import { useDesktopIconStore, GRID_CONFIG, snapCoordinatesToGrid } from '@/store/desktopIconStore';
import { APPS, AppDef, getAppById } from '@/config/apps';
import { AppIcon } from '@/components/ui/AppIcon';
import {
  ShoppingBag,
  Search,
  Check,
  Plus,
  Trash2,
  Star,
  Download,
  Info,
  ShieldCheck,
  Tag,
  ExternalLink,
  Sparkles,
  Layers,
  Monitor,
} from 'lucide-react';

export function AppStoreApp() {
  const { openWindow } = useWindowStore();
  const { positions, setPosition, resetToDefaultLayout } = useDesktopIconStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAppId, setSelectedAppId] = useState<AppId | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Apps' },
    { id: 'productivity', label: 'Productivity' },
    { id: 'developer', label: 'Developer Tools' },
    { id: 'system', label: 'System & Utilities' },
    { id: 'portfolio', label: 'LivingYuji Lab' },
    { id: 'store', label: 'Marketplaces' },
    { id: 'entertainment', label: 'Media & Games' },
  ];

  const filteredApps = useMemo(() => {
    return APPS.filter((app) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        (selectedCategory === 'developer' && (app.category === 'developer' || app.category === 'services')) ||
        (selectedCategory === 'system' && (app.category === 'system' || app.category === 'utilities')) ||
        app.category === selectedCategory;

      const matchesSearch =
        !search.trim() ||
        app.label.toLowerCase().includes(search.toLowerCase()) ||
        app.description.toLowerCase().includes(search.toLowerCase()) ||
        app.keywords.some((k) => k.toLowerCase().includes(search.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, search]);

  const activeApp = selectedAppId ? getAppById(selectedAppId) : null;
  const isInstalledOnDesktop = (appId: string) => Boolean(positions[appId]);

  const handleToggleDesktopShortcut = (app: AppDef) => {
    if (isInstalledOnDesktop(app.id)) {
      // Remove from desktop positions
      const newPositions = { ...positions };
      delete newPositions[app.id];
      useDesktopIconStore.setState({ positions: newPositions });
      setActionNotice(`Removed "${app.label}" shortcut from Desktop`);
    } else {
      // Find an empty grid slot
      const occupied = new Set(
        Object.values(positions).map((pos) => `${pos.x},${pos.y}`)
      );
      const { startX, startY, cellWidth, cellHeight } = GRID_CONFIG;
      let targetX = startX + 3 * cellWidth; // Start looking in column 4 (x = 292)
      let targetY = startY;

      while (occupied.has(`${targetX},${targetY}`)) {
        targetY += cellHeight;
        if (targetY > 600) {
          targetX += cellWidth;
          targetY = startY;
        }
      }

      setPosition(app.id, targetX, targetY);
      setActionNotice(`Added "${app.label}" shortcut to Desktop at (${targetX}, ${targetY})`);
    }

    setTimeout(() => setActionNotice(null), 3000);
  };

  return (
    <div className="h-full flex flex-col bg-[#11141C] text-slate-200 select-none font-sans text-xs">
      {/* Top Marketplace Header */}
      <div className="h-11 px-4 bg-[#161B26] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingBag size={16} className="text-sky-400" />
          <span className="font-bold text-white text-sm">LivingYuji App Store</span>
        </div>

        <div className="flex items-center gap-3">
          {actionNotice && (
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in">
              <Check size={12} />
              <span>{actionNotice}</span>
            </span>
          )}

          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search store catalog..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#0E1118] border border-white/10 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white placeholder-slate-400 outline-none focus:border-sky-500 w-52 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Split Layout: Categories & Catalog */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Categories Navigation */}
        <div className="w-52 bg-[#141822] border-r border-white/10 p-3 flex flex-col gap-1 shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 block">
            Categories
          </span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSelectedAppId(null);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors text-xs ${
                selectedCategory === cat.id
                  ? 'bg-sky-500/20 text-sky-400 font-semibold border border-sky-500/30'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}

          {/* Reset Desktop Layout Utility Button */}
          <div className="mt-auto pt-3 border-t border-white/5">
            <button
              onClick={() => {
                resetToDefaultLayout();
                setActionNotice('Reset desktop icon layout to default Windows 3-column reference.');
                setTimeout(() => setActionNotice(null), 3000);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[10px] transition-colors"
            >
              <Monitor size={12} />
              <span>Restore Desktop Icons</span>
            </button>
          </div>
        </div>

        {/* Right Content Area: Grid or Detail View */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#0F131C] window-scroll">
          {activeApp ? (
            /* App Detail View */
            <div className="max-w-2xl space-y-5 animate-in fade-in duration-150">
              <button
                onClick={() => setSelectedAppId(null)}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] mb-2"
              >
                ← Back to catalog
              </button>

              <div className="flex items-start gap-4 p-5 bg-[#141824] border border-white/10 rounded-2xl">
                <div className="p-3 bg-white/5 rounded-2xl shrink-0">
                  <AppIcon type={activeApp.iconType} size="xl" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">{activeApp.label}</h2>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase font-semibold">
                      {activeApp.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {activeApp.description}
                  </p>
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => openWindow(activeApp.id)}
                      className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs shadow-md transition-all active:scale-95"
                    >
                      Open Application
                    </button>

                    <button
                      onClick={() => handleToggleDesktopShortcut(activeApp)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                        isInstalledOnDesktop(activeApp.id)
                          ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                          : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10'
                      }`}
                    >
                      {isInstalledOnDesktop(activeApp.id) ? (
                        <>
                          <Trash2 size={13} />
                          <span>Remove Shortcut</span>
                        </>
                      ) : (
                        <>
                          <Plus size={13} />
                          <span>Add to Desktop</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Detail Specifications */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 bg-[#141824] border border-white/5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Developer</span>
                  <span className="font-semibold text-white">{activeApp.author || 'LivingYuji'}</span>
                </div>
                <div className="p-3.5 bg-[#141824] border border-white/5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Version</span>
                  <span className="font-semibold text-white">{activeApp.version || '1.0.0'}</span>
                </div>
                <div className="p-3.5 bg-[#141824] border border-white/5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Security Sandboxing</span>
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck size={12} /> Verified Safe
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Applications Catalog Grid */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  {filteredApps.length} Applications Available
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredApps.map((app) => {
                  const onDesktop = isInstalledOnDesktop(app.id);

                  return (
                    <div
                      key={app.id}
                      onClick={() => setSelectedAppId(app.id)}
                      className="p-4 bg-[#141824] border border-white/5 hover:border-sky-500/40 rounded-2xl flex flex-col justify-between cursor-pointer transition-all hover:bg-white/[0.04] group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white/5 rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                          <AppIcon type={app.iconType} size="md" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-white text-xs truncate">{app.label}</h3>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-slate-400 uppercase">
                              {app.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                            {app.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5 text-[10px]">
                        <span className="text-sky-400 font-medium group-hover:underline">
                          View Details →
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleDesktopShortcut(app);
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
                            onDesktop
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                          }`}
                          title={onDesktop ? 'Shortcut on Desktop' : 'Pin to Desktop'}
                        >
                          {onDesktop ? (
                            <>
                              <Check size={10} />
                              <span>On Desktop</span>
                            </>
                          ) : (
                            <>
                              <Plus size={10} />
                              <span>Add Shortcut</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
