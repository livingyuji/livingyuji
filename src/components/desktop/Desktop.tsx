'use client';

import React, { useCallback, useEffect } from 'react';
import { useWindowStore } from '@/store/windowStore';
import { useDesktopIconStore } from '@/store/desktopIconStore';
import { WindowFrame } from '@/components/desktop/WindowFrame';
import { Taskbar } from '@/components/desktop/Taskbar';
import { StartMenu } from '@/components/desktop/StartMenu';
import { ActionCenter } from '@/components/desktop/ActionCenter';
import { DesktopIconGrid } from '@/components/desktop/DesktopIcon';
import { DesktopContextMenu } from '@/components/desktop/DesktopContextMenu';
import { AppContent } from '@/components/apps/AppContent';
import { MatrixWallpaper } from '@/components/desktop/MatrixWallpaper';
import { AppIcon } from '@/components/ui/AppIcon';
import { getAppById } from '@/config/apps';

export function Desktop() {
  const {
    windows,
    startMenuOpen,
    setStartMenuOpen,
    quickSettingsOpen,
    setQuickSettingsOpen,
    setContextMenu,
    focusWindow,
    altTabActive,
    altTabIndex,
    setAltTabActive,
    setAltTabIndex,
  } = useWindowStore();

  // Desktop right-click context menu
  const handleDesktopContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('.win-controls-btn, .group, button')) return;
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, target: 'desktop' });
    },
    [setContextMenu]
  );

  // Desktop click — dismiss Start menu, Action Center, context menu, and deselect icons
  const { setSelectedIconId, fetchCloudLayout } = useDesktopIconStore();

  useEffect(() => {
    fetchCloudLayout();
  }, [fetchCloudLayout]);

  const handleDesktopClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('.win-controls-btn, button, input')) return;
      setStartMenuOpen(false);
      setQuickSettingsOpen(false);
      setContextMenu(null);

      // Deselect desktop icons when clicking empty desktop area
      if (!(e.target as HTMLElement).closest('[data-desktop-icon]')) {
        setSelectedIconId(null);
      }
    },
    [setStartMenuOpen, setQuickSettingsOpen, setContextMenu, setSelectedIconId]
  );

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+Tab window switcher
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        const visibleWindows = windows.filter((w) => !w.minimized);
        if (!visibleWindows.length) return;
        setAltTabActive(true);
        const nextIdx = (altTabIndex + 1) % visibleWindows.length;
        setAltTabIndex(nextIdx);
        focusWindow(visibleWindows[nextIdx].id);
        return;
      }

      // Windows / Meta key: toggle Start menu
      if (e.key === 'Meta' && !e.shiftKey && !e.altKey && !e.ctrlKey) {
        e.preventDefault();
        setStartMenuOpen(!startMenuOpen);
        return;
      }

      // Escape key: dismiss Start menu, Action Center, and context menu
      if (e.key === 'Escape') {
        setStartMenuOpen(false);
        setQuickSettingsOpen(false);
        setContextMenu(null);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt' && altTabActive) {
        setAltTabActive(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    windows,
    altTabActive,
    altTabIndex,
    startMenuOpen,
    focusWindow,
    setAltTabActive,
    setAltTabIndex,
    setStartMenuOpen,
    setContextMenu,
  ]);

  return (
    <div
      id="desktop-root"
      className="fixed inset-0 overflow-hidden select-none bg-[#0E121A] transition-all duration-300"
      onContextMenu={handleDesktopContextMenu}
      onClick={handleDesktopClick}
    >
      {/* Dynamic Matrix / Cyber Background (Matches reference screenshot) */}
      <MatrixWallpaper />

      {/* Desktop 2-column App Icons */}
      <DesktopIconGrid />

      {/* Active Windows */}
      {windows.map((win) => (
        <WindowFrame key={win.id} window={win}>
          <AppContent appId={win.appId} initialFolderId={win.initialFolderId} />
        </WindowFrame>
      ))}

      {/* Windows 11 Taskbar */}
      <Taskbar />

      {/* Windows 11 Start Menu */}
      <StartMenu />

      {/* Windows 11 Action Center & Notification Flyout */}
      <ActionCenter />

      {/* Right-Click Context Menu */}
      <DesktopContextMenu />

      {/* Alt+Tab Window Switcher Overlay */}
      {altTabActive && (
        <div className="fixed inset-0 z-[980] flex items-center justify-center pointer-events-none">
          <div className="bg-[#121620]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 flex gap-3 shadow-2xl">
            {windows
              .filter((w) => !w.minimized)
              .map((w, idx) => {
                const appDef = getAppById(w.appId);
                const isSelected = idx === altTabIndex;
                return (
                  <div
                    key={w.id}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                      isSelected ? 'bg-white/15 ring-1 ring-white/20 scale-105' : 'opacity-70'
                    }`}
                  >
                    <AppIcon type={appDef?.iconType || 'thispc'} size="md" />
                    <span className="text-xs text-white max-w-[90px] truncate">{w.title}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
