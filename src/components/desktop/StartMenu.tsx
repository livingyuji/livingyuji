'use client';

import React, { useState } from 'react';
import { useWindowStore } from '@/store/windowStore';
import { APPS } from '@/config/apps';
import { AppIcon } from '@/components/ui/AppIcon';
import type { AppId } from '@/store/windowStore';

export function StartMenu() {
  const { startMenuOpen, setStartMenuOpen, openWindow, resetSettings, settings } = useWindowStore();
  const [search, setSearch] = useState('');
  const [powerOpen, setPowerOpen] = useState(false);

  if (!startMenuOpen) return null;

  const filteredApps = APPS.filter(
    (app) =>
      app.label.toLowerCase().includes(search.toLowerCase()) ||
      app.keywords.some((k) => k.includes(search.toLowerCase()))
  );

  const handleAppLaunch = (appId: AppId) => {
    openWindow(appId);
    setStartMenuOpen(false);
  };

  return (
    <>
      {/* Backdrop to dismiss */}
      <div
        className="fixed inset-0 z-[850]"
        onClick={() => {
          setStartMenuOpen(false);
          setPowerOpen(false);
        }}
      />

      {/* Windows 11 Centered / Left Start Menu Floating Card */}
      <div
        className="fixed bottom-14 left-4 w-[540px] max-w-[calc(100vw-32px)] h-[580px] max-h-[calc(100vh-80px)] bg-[#1A1F2B]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden z-[860] animate-in fade-in zoom-in-95 duration-100 select-none text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="p-6 pb-4">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="7" cy="7" r="4.5" />
              <path d="M10.5 10.5L14 14" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search for apps, settings, and documents"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#121620] border border-white/10 rounded-full pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-400 outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* Pinned Applications Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4 window-scroll">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Pinned</span>
            <button
              onClick={() => setSearch('')}
              className="text-[11px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              All apps &gt;
            </button>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {filteredApps.map((app) => (
              <button
                key={app.id}
                onClick={() => handleAppLaunch(app.id)}
                className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white/10 active:scale-95 transition-all text-center group"
                title={app.description}
              >
                <div className="mb-1.5 transition-transform group-hover:scale-105 duration-100">
                  <AppIcon type={app.iconType} size="md" />
                </div>
                <span className="text-[11px] text-slate-200 group-hover:text-white truncate max-w-[68px] leading-tight">
                  {app.label}
                </span>
              </button>
            ))}
          </div>

          {/* Recommended Section */}
          <div className="pt-2 border-t border-white/5">
            <span className="text-xs font-semibold text-slate-300 mb-2 block">Recommended</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAppLaunch('thispc')}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 text-left transition-colors"
              >
                <AppIcon type="thispc" size="sm" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-slate-200 truncate">Local Disk (C:)</div>
                  <div className="text-[10px] text-slate-400">Virtual System Drive</div>
                </div>
              </button>
              <button
                onClick={() => handleAppLaunch('music')}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 text-left transition-colors"
              >
                <AppIcon type="music" size="sm" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-slate-200 truncate">Cyber_Drift_Lofi.mp3</div>
                  <div className="text-[10px] text-slate-400">Recently played</div>
                </div>
              </button>
              <button
                onClick={() => handleAppLaunch('projects')}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 text-left transition-colors"
              >
                <AppIcon type="projects" size="sm" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-slate-200 truncate">ArcaneArsenal Plugin</div>
                  <div className="text-[10px] text-slate-400">Minecraft Paper 1.21</div>
                </div>
              </button>
              <button
                onClick={() => handleAppLaunch('store')}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 text-left transition-colors"
              >
                <AppIcon type="store" size="sm" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-slate-200 truncate">LivingYuji Store</div>
                  <div className="text-[10px] text-slate-400">Plugins & Custom Setups</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer: User profile & Power */}
        <div className="h-14 px-6 bg-[#131620]/95 border-t border-white/5 flex items-center justify-between relative">
          {/* User profile */}
          <div className="flex items-center gap-3">
            {settings.customLogoUrl ? (
              <img
                src={settings.customLogoUrl}
                alt="Logo"
                className="w-8 h-8 rounded-full object-cover border border-white/20 bg-black/40"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0078D4] to-[#38BDF8] flex items-center justify-center font-bold text-xs text-white shadow-sm">
                {(settings.brandName || 'LivingYuji').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-xs font-medium text-white">{settings.brandName || 'LivingYuji'}</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Online
              </div>
            </div>
          </div>

          {/* Power button */}
          <div className="relative">
            <button
              onClick={() => setPowerOpen(!powerOpen)}
              className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              title="Power"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 2V8" strokeLinecap="round" />
                <path d="M4.5 4.5C2.8 5.8 2 8 2.5 10.2C3 12.4 4.8 14 7 14.3C9.2 14.5 11.4 13.5 12.6 11.6C13.8 9.7 13.6 7.2 12.2 5.5" strokeLinecap="round" />
              </svg>
            </button>

            {/* Power Menu Popover */}
            {powerOpen && (
              <div className="absolute bottom-11 right-0 w-44 bg-[#1e2330] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 text-xs">
                <button
                  onClick={() => {
                    setPowerOpen(false);
                    setStartMenuOpen(false);
                    resetSettings();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-slate-200 flex items-center gap-2"
                >
                  <span>🔄</span> Reset Desktop
                </button>
                <button
                  onClick={() => {
                    setPowerOpen(false);
                    setStartMenuOpen(false);
                    useWindowStore.getState().closeAllWindows();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-slate-200 flex items-center gap-2"
                >
                  <span>🚪</span> Close All Windows
                </button>
                <button
                  onClick={() => {
                    setPowerOpen(false);
                    setStartMenuOpen(false);
                    openWindow('about');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-slate-200 flex items-center gap-2"
                >
                  <span>ℹ️</span> About LivingYuji OS
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
