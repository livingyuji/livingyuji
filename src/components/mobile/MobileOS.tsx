'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { APPS } from '@/config/apps';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppContent } from '@/components/apps/AppContent';
import { useWindowStore } from '@/store/windowStore';
import type { AppId } from '@/store/windowStore';
import { ArrowLeft, Home, Grid3X3 } from 'lucide-react';

interface MobileApp {
  id: string;
  appId: AppId;
  title: string;
}

function StatusBar() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-between px-5 py-2 text-white select-none safe-top" style={{ height: 44 }}>
      <span className="text-xs font-semibold tabular-nums">{time}</span>
      <div className="flex items-center gap-2">
        <div className="flex items-end gap-0.5 h-3">
          <div className="w-1 h-1.5 bg-emerald-400 rounded-sm" />
          <div className="w-1 h-2 bg-emerald-400 rounded-sm" />
          <div className="w-1 h-2.5 bg-emerald-400 rounded-sm" />
          <div className="w-1 h-3 bg-emerald-400 rounded-sm" />
        </div>
        <div className="w-5 h-2.5 border border-slate-300 rounded-[2px] p-[1px] flex items-center">
          <div className="w-full h-full bg-emerald-400 rounded-[1px]" />
        </div>
      </div>
    </div>
  );
}

function DateWidget() {
  const [dateStr, setDateStr] = useState('');
  const [dayStr, setDayStr] = useState('');

  useEffect(() => {
    const now = new Date();
    setDateStr(now.toLocaleDateString([], { month: 'long', day: 'numeric' }));
    setDayStr(now.toLocaleDateString([], { weekday: 'long' }));
  }, []);

  return (
    <div className="text-center py-6 select-none">
      <div className="text-4xl font-light text-white tracking-tight">
        {dateStr.split(' ')[1]}
      </div>
      <div className="text-xs text-slate-400 mt-1 font-medium">
        {dayStr}, {dateStr.split(' ')[0]}
      </div>
    </div>
  );
}

const MOBILE_APP_GRID: AppId[] = [
  'thispc',
  'showcase',
  'store',
  'minecraftstore',
  'notes',
  'tasks',
  'calendar',
  'calculator',
  'clipboard',
  'devstudio',
  'sysmonitor',
  'appstore',
  'games',
  'music',
  'paint',
  'projects',
  'skills',
  'minecraft',
  'discord',
  'blog',
  'memorywall',
  'about',
  'contact',
  'resume',
  'terminal',
  'settings',
];

const DOCK_APPS: AppId[] = ['browser', 'thispc', 'music', 'store', 'settings'];

export function MobileOS() {
  const [openApp, setOpenApp] = useState<MobileApp | null>(null);
  const [recentApps, setRecentApps] = useState<MobileApp[]>([]);
  const [showRecents, setShowRecents] = useState(false);

  const openMobileApp = useCallback((appId: AppId) => {
    const app = APPS.find((a) => a.id === appId);
    if (!app) return;
    const mobileApp: MobileApp = { id: `${appId}-${Date.now()}`, appId, title: app.label };
    setOpenApp(mobileApp);
    setRecentApps((prev) => {
      const filtered = prev.filter((a) => a.appId !== appId);
      return [mobileApp, ...filtered].slice(0, 6);
    });
    setShowRecents(false);
  }, []);

  const goHome = useCallback(() => {
    setOpenApp(null);
    setShowRecents(false);
  }, []);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      if (showRecents) setShowRecents(false);
      else if (openApp) setOpenApp(null);
    };

    if (openApp || showRecents) {
      window.history.pushState({ mobile: true }, '');
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [openApp, showRecents]);

  // Fullscreen Mobile Application Screen
  if (openApp && !showRecents) {
    return (
      <div className="fixed inset-0 bg-[#0E121A] flex flex-col overflow-hidden animate-in fade-in duration-100">
        {/* App Header */}
        <div className="bg-[#161B26] border-b border-white/10 flex items-center gap-3 px-4 safe-top py-2.5">
          <button
            onClick={goHome}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-200"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xs font-semibold text-white">{openApp.title}</h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <AppContent appId={openApp.appId} />
        </div>

        {/* Bottom Navigation */}
        <div className="h-12 bg-[#121620] border-t border-white/10 flex items-center justify-around px-6 safe-bottom">
          <button onClick={goHome} className="p-2 text-slate-400 hover:text-white" aria-label="Home">
            <Home className="w-5 h-5" />
          </button>
          <button onClick={() => setShowRecents(true)} className="p-2 text-slate-400 hover:text-white" aria-label="Recent apps">
            <Grid3X3 className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Recents Screen
  if (showRecents) {
    return (
      <div className="fixed inset-0 bg-[#0E121A] flex flex-col">
        <StatusBar />
        <div className="flex-1 overflow-y-auto px-4 py-6 window-scroll">
          <h2 className="text-base font-bold text-white mb-4">Running Applications</h2>
          {recentApps.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs">No recent apps running</div>
          ) : (
            <div className="space-y-3">
              {recentApps.map((app) => {
                const appDef = APPS.find((a) => a.id === app.appId);
                return (
                  <div
                    key={app.id}
                    className="bg-[#1A202D] rounded-2xl p-4 flex items-center gap-3 border border-white/5 shadow-md"
                  >
                    <AppIcon type={appDef?.iconType || 'thispc'} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-white truncate">{app.title}</div>
                    </div>
                    <button
                      onClick={() => openMobileApp(app.appId)}
                      className="px-3 py-1.5 text-xs bg-[#0078D4] text-white rounded-xl font-medium"
                    >
                      Switch
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="h-12 bg-[#121620] border-t border-white/10 flex items-center justify-around px-6 safe-bottom">
          <button onClick={goHome} className="p-2 text-slate-400 hover:text-white" aria-label="Home">
            <Home className="w-5 h-5" />
          </button>
          <button onClick={() => setShowRecents(false)} className="p-2 text-[#38BDF8]" aria-label="Close recents">
            <Grid3X3 className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Mobile Home Screen
  return (
    <div className="fixed inset-0 bg-[#0E121A] bg-[radial-gradient(ellipse_at_top,#172338_0%,#0C0F16_80%)] flex flex-col overflow-hidden">
      <StatusBar />
      <DateWidget />

      {/* Grid of Apps */}
      <div className="flex-1 px-4 overflow-y-auto window-scroll">
        <div className="grid grid-cols-4 gap-4 py-2">
          {MOBILE_APP_GRID.map((appId) => {
            const app = APPS.find((a) => a.id === appId);
            if (!app) return null;
            return (
              <button
                key={appId}
                onClick={() => openMobileApp(appId)}
                className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
                aria-label={`Open ${app.label}`}
              >
                <div className="p-1 rounded-2xl">
                  <AppIcon type={app.iconType} size="lg" />
                </div>
                <span className="text-[11px] text-white text-center leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] truncate max-w-[70px]">
                  {app.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Phone Dock */}
      <div className="px-4 pb-3 safe-bottom">
        <div className="bg-white/[0.08] backdrop-blur-2xl border border-white/10 rounded-3xl px-4 py-3 flex items-center justify-around shadow-xl">
          {DOCK_APPS.map((appId) => {
            const app = APPS.find((a) => a.id === appId);
            if (!app) return null;
            return (
              <button
                key={appId}
                onClick={() => openMobileApp(appId)}
                className="flex flex-col items-center active:scale-95 transition-transform"
                aria-label={app.label}
              >
                <AppIcon type={app.iconType} size="md" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
