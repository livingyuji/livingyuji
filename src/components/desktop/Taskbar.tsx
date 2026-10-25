'use client';

import React, { useEffect, useState } from 'react';
import { useWindowStore } from '@/store/windowStore';
import { getAppById } from '@/config/apps';
import { AppIcon } from '@/components/ui/AppIcon';
import type { AppId } from '@/store/windowStore';

function SystemClock({ onClick }: { onClick?: () => void }) {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
      );
      setDateStr(
        now.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      onClick={onClick}
      className="flex flex-col items-end justify-center px-2 py-0.5 leading-none select-none hover:bg-white/10 rounded cursor-pointer transition-colors"
      title="Open Notifications & Action Center"
    >
      <span suppressHydrationWarning className="text-xs font-normal text-slate-100 tabular-nums">{timeStr}</span>
      <span suppressHydrationWarning className="text-[11px] text-slate-400 mt-1 tabular-nums">{dateStr}</span>
    </div>
  );
}

export function Taskbar() {
  const {
    windows,
    openWindow,
    focusWindow,
    restoreWindow,
    minimizeWindow,
    startMenuOpen,
    setStartMenuOpen,
    quickSettingsOpen,
    setQuickSettingsOpen,
    toggleShowDesktop,
  } = useWindowStore();

  // Pinned taskbar apps (matching screenshot + browser + terminal)
  const pinnedAppIds: AppId[] = ['browser', 'thispc', 'music', 'settings', 'terminal'];

  // Add any other running apps that are not pinned
  const runningAppIds = windows.map((w) => w.appId);
  const allTaskbarAppIds = [...new Set([...pinnedAppIds, ...runningAppIds])];

  const handleAppClick = (appId: AppId) => {
    const win = windows.find((w) => w.appId === appId);
    if (!win) {
      openWindow(appId);
    } else if (win.minimized) {
      restoreWindow(win.id);
    } else if (win.active) {
      minimizeWindow(win.id);
    } else {
      focusWindow(win.id);
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-[48px] bg-[#101218]/85 backdrop-blur-2xl border-t border-white/[0.08] flex items-center justify-between px-2 select-none z-[900]"
    >
      {/* Left / Center Section: Start, Search, Task View, Apps */}
      <div className="flex items-center gap-1 h-full">
        {/* Windows 11 / LivingYuji Start Button */}
        <button
          onClick={() => setStartMenuOpen(!startMenuOpen)}
          className={`w-10 h-10 flex items-center justify-center rounded-md transition-all duration-100 ${
            startMenuOpen ? 'bg-white/15' : 'hover:bg-white/10 active:scale-95'
          }`}
          aria-label="Start menu"
          title="Start"
        >
          {/* Windows 11 4-tile blue squares logo */}
          <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
            <div className="bg-[#0078D4] rounded-[1px]" />
            <div className="bg-[#0078D4] rounded-[1px]" />
            <div className="bg-[#0078D4] rounded-[1px]" />
            <div className="bg-[#0078D4] rounded-[1px]" />
          </div>
        </button>

        {/* Search button */}
        <button
          onClick={() => setStartMenuOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 active:scale-95 transition-all text-slate-300 hover:text-white"
          aria-label="Search"
          title="Type here to search"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5L14 14" strokeLinecap="round" />
          </svg>
        </button>

        {/* Task View / Desktop icon */}
        <button
          onClick={() => toggleShowDesktop()}
          className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 active:scale-95 transition-all text-slate-300 hover:text-white"
          aria-label="Task view"
          title="Task view"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="2" y="2" width="7" height="12" rx="1" />
            <rect x="11" y="4" width="3" height="8" rx="0.5" fill="currentColor" fillOpacity="0.4" />
          </svg>
        </button>

        {/* Divider */}
        <div className="w-[1px] h-5 bg-white/10 mx-1" />

        {/* Taskbar App Icons */}
        {allTaskbarAppIds.map((appId) => {
          const appDef = getAppById(appId);
          if (!appDef) return null;
          const win = windows.find((w) => w.appId === appId);
          const isRunning = !!win;
          const isActive = win?.active && !win.minimized;

          return (
            <button
              key={appId}
              onClick={() => handleAppClick(appId)}
              className={`group relative w-10 h-10 flex items-center justify-center rounded-md transition-all duration-100 ${
                isActive
                  ? 'bg-white/15'
                  : isRunning
                  ? 'bg-white/[0.07] hover:bg-white/10'
                  : 'hover:bg-white/10 active:scale-95'
              }`}
              title={appDef.label}
              aria-label={appDef.label}
            >
              <div className="transition-transform group-hover:scale-105 duration-100">
                <AppIcon type={appDef.iconType} size="sm" />
              </div>

              {/* Running Pill Indicator (Blue bar at bottom) */}
              {isRunning && (
                <div
                  className={`absolute bottom-0.5 rounded-full transition-all duration-150 ${
                    isActive ? 'w-4 h-[3px] bg-[#38BDF8]' : 'w-2 h-[3px] bg-slate-400'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Right Section: System Tray (Exact match to reference screenshot) */}
      <div className="flex items-center gap-1 h-full">
        {/* Yellow notification dot */}
        <button
          onClick={() => setQuickSettingsOpen(!quickSettingsOpen)}
          className="w-2.5 h-2.5 rounded-full bg-amber-400 mx-1 shadow-[0_0_8px_rgba(251,191,36,0.6)] hover:scale-125 transition-transform"
          title="Notifications"
        />

        {/* Show hidden icons chevron ^ */}
        <button
          onClick={() => setQuickSettingsOpen(!quickSettingsOpen)}
          className="w-6 h-8 flex items-center justify-center rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          title="Show hidden icons"
        >
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 5L5 1L9 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* System Quick Status Pill: Network + Sound + Battery (Windows 11 grouped tray) */}
        <button
          onClick={() => setQuickSettingsOpen(!quickSettingsOpen)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
            quickSettingsOpen ? 'bg-white/20' : 'hover:bg-white/10'
          }`}
          title="Internet, Sound, Battery"
        >
          {/* Cellular / Network bars (green, as in screenshot) */}
          <div className="flex items-end gap-[1.5px] h-3 px-0.5">
            <div className="w-1 h-1.5 bg-emerald-400 rounded-sm" />
            <div className="w-1 h-2 bg-emerald-400 rounded-sm" />
            <div className="w-1 h-2.5 bg-emerald-400 rounded-sm" />
            <div className="w-1 h-3 bg-emerald-400 rounded-sm" />
          </div>

          {/* Speaker / Volume icon */}
          <div className="flex items-center text-slate-300">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 5H5L9 2V14L5 11H2V5Z" fill="currentColor" fillOpacity="0.4" />
              <path d="M12 5C13 6 13.5 7 13.5 8C13.5 9 13 10 12 11" strokeLinecap="round" />
            </svg>
          </div>

          {/* Battery icon (green bar, as in screenshot) */}
          <div className="flex items-center">
            <div className="w-5 h-2.5 border border-slate-300 rounded-[2px] p-[1px] flex items-center">
              <div className="w-full h-full bg-emerald-400 rounded-[1px]" />
            </div>
            <div className="w-[1.5px] h-1 bg-slate-300 rounded-r-sm" />
          </div>
        </button>

        {/* Clock & Date */}
        <SystemClock onClick={() => setQuickSettingsOpen(!quickSettingsOpen)} />

        {/* Show Desktop sliver line on far right (Windows 11 standard) */}
        <button
          onClick={toggleShowDesktop}
          className="w-1.5 h-full hover:bg-white/20 transition-colors ml-1 border-l border-white/10"
          title="Show Desktop"
          aria-label="Show Desktop"
        />
      </div>
    </div>
  );
}
