'use client';

import React, { useCallback, useState } from 'react';
import { useWindowStore } from '@/store/windowStore';
import { useFileSystemStore } from '@/store/fileSystemStore';
import { useDesktopIconStore } from '@/store/desktopIconStore';
import type { AppId } from '@/store/windowStore';

export function DesktopContextMenu() {
  const { contextMenu, setContextMenu, openWindow, updateSettings, settings } = useWindowStore();
  const { createFolder, createFile, resetToDefaultFileSystem } = useFileSystemStore();
  const { resetToDefaultLayout, movementEnabled, setMovementEnabled } = useDesktopIconStore();
  const [activeSubmenu, setActiveSubmenu] = useState<'view' | 'sort' | 'new' | null>(null);

  const handleClose = useCallback(() => {
    setContextMenu(null);
    setActiveSubmenu(null);
  }, [setContextMenu]);

  if (!contextMenu) return null;

  // Clamping to screen boundaries
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 720;
  const menuW = 220;
  const menuH = 260;
  const x = Math.min(contextMenu.x, vw - menuW - 12);
  const y = Math.min(contextMenu.y, vh - menuH - 56);

  const handleCreateNewFolder = () => {
    createFolder('u-desktop', 'C:', 'New Folder');
    handleClose();
  };

  const handleCreateNewTextDoc = () => {
    createFile('u-desktop', 'C:', 'New Text Document.txt', 'text', '', 'txt');
    handleClose();
  };

  return (
    <>
      {/* Invisible backdrop */}
      <div className="fixed inset-0 z-[960]" onClick={handleClose} onContextMenu={(e) => { e.preventDefault(); handleClose(); }} />

      {/* Windows 11 Context Menu */}
      <div
        className="fixed z-[970] bg-[#1E2330]/95 backdrop-blur-2xl rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/10 py-1.5 w-52 select-none text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-100"
        style={{ top: y, left: x }}
        role="menu"
      >
        {contextMenu.target === 'desktop' && (
          <>
            {/* View */}
            <div
              className="relative px-3 py-1.5 hover:bg-white/10 flex items-center justify-between cursor-default transition-colors group"
              onMouseEnter={() => setActiveSubmenu('view')}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-slate-400">👁️</span>
                <span>View</span>
              </div>
              <span className="text-[10px] text-slate-400">&gt;</span>

              {activeSubmenu === 'view' && (
                <div className="absolute left-full top-0 ml-1 w-36 bg-[#1E2330] border border-white/10 rounded-xl shadow-xl py-1">
                  <button
                    onClick={() => { updateSettings({ iconSize: 'large' }); handleClose(); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-xs text-slate-200"
                  >
                    Large icons
                  </button>
                  <button
                    onClick={() => { updateSettings({ iconSize: 'medium' }); handleClose(); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-xs text-slate-200"
                  >
                    Medium icons
                  </button>
                  <button
                    onClick={() => { updateSettings({ iconSize: 'small' }); handleClose(); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-xs text-slate-200"
                  >
                    Small icons
                  </button>
                </div>
              )}
            </div>

            {/* Refresh */}
            <button
              onClick={() => {
                handleClose();
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center gap-2.5 cursor-default transition-colors"
            >
              <span className="text-slate-400">🔄</span>
              <span>Refresh</span>
            </button>

            {/* Reset Desktop Layout */}
            <button
              onClick={() => {
                resetToDefaultLayout();
                handleClose();
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center gap-2.5 cursor-default transition-colors text-amber-300"
            >
              <span>📐</span>
              <span>Reset Desktop Layout</span>
            </button>

            {/* Desktop Icon Movement Toggle */}
            <button
              onClick={() => {
                const next = !movementEnabled;
                setMovementEnabled(next);
                updateSettings({ desktopIconMovement: next });
                handleClose();
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center justify-between cursor-default transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-slate-400">✋</span>
                <span>Icon Movement</span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded ${
                  movementEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                }`}
              >
                {movementEnabled ? 'Enabled' : 'Locked'}
              </span>
            </button>

            <div className="my-1 h-[1px] bg-white/10" />

            {/* New > */}
            <div
              className="relative px-3 py-1.5 hover:bg-white/10 flex items-center justify-between cursor-default transition-colors"
              onMouseEnter={() => setActiveSubmenu('new')}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-slate-400">✨</span>
                <span>New</span>
              </div>
              <span className="text-[10px] text-slate-400">&gt;</span>

              {activeSubmenu === 'new' && (
                <div className="absolute left-full top-0 ml-1 w-44 bg-[#1E2330] border border-white/10 rounded-xl shadow-xl py-1">
                  <button
                    onClick={handleCreateNewFolder}
                    className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-xs text-slate-200 flex items-center gap-2"
                  >
                    <span>📁</span> Folder
                  </button>
                  <button
                    onClick={handleCreateNewTextDoc}
                    className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-xs text-slate-200 flex items-center gap-2"
                  >
                    <span>📄</span> Text Document
                  </button>
                </div>
              )}
            </div>

            <div className="my-1 h-[1px] bg-white/10" />

            {/* Display settings */}
            <button
              onClick={() => {
                openWindow('settings');
                handleClose();
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center gap-2.5 cursor-default transition-colors"
            >
              <span className="text-slate-400">🖥️</span>
              <span>Display settings</span>
            </button>

            {/* Personalize */}
            <button
              onClick={() => {
                openWindow('settings');
                handleClose();
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center gap-2.5 cursor-default transition-colors"
            >
              <span className="text-slate-400">🎨</span>
              <span>Personalize</span>
            </button>

            {/* Open in Terminal */}
            <button
              onClick={() => {
                openWindow('terminal');
                handleClose();
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center gap-2.5 cursor-default transition-colors"
            >
              <span className="text-slate-400">⌨️</span>
              <span>Open in Terminal</span>
            </button>

            <div className="my-1 h-[1px] bg-white/10" />

            {/* Admin Control Panel */}
            <button
              onClick={() => {
                openWindow('admin');
                handleClose();
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center gap-2.5 cursor-default transition-colors text-sky-400 font-medium"
            >
              <span>🛡️</span>
              <span>Admin Control Panel</span>
            </button>
          </>
        )}

        {contextMenu.target === 'icon' && (
          <>
            <button
              onClick={() => {
                if (contextMenu.data) openWindow(contextMenu.data as AppId);
                handleClose();
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-white/10 font-medium flex items-center gap-2"
            >
              <span>🚀</span> Open
            </button>
            <div className="my-1 h-[1px] bg-white/10" />
            <button
              onClick={() => {
                const next = !movementEnabled;
                setMovementEnabled(next);
                updateSettings({ desktopIconMovement: next });
                handleClose();
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span>✋</span>
                <span>Icon Movement</span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded ${
                  movementEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                }`}
              >
                {movementEnabled ? 'Enabled' : 'Locked'}
              </span>
            </button>
            <button
              onClick={() => {
                resetToDefaultLayout();
                handleClose();
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center gap-2 text-amber-300"
            >
              <span>📐</span> Reset Desktop
            </button>
            <div className="my-1 h-[1px] bg-white/10" />
            <button
              onClick={() => {
                openWindow('settings');
                handleClose();
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center gap-2"
            >
              <span>⚙️</span> Properties
            </button>
          </>
        )}
      </div>
    </>
  );
}
