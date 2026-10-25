'use client';

import React, { useRef, useCallback } from 'react';
import { useWindowStore, WindowState } from '@/store/windowStore';
import { AppIcon } from '@/components/ui/AppIcon';
import { getAppById } from '@/config/apps';
import { AppErrorBoundary } from '@/components/common/AppErrorBoundary';

interface WindowFrameProps {
  window: WindowState;
  children: React.ReactNode;
}

export function WindowFrame({ window: win, children }: WindowFrameProps) {
  const { closeWindow, minimizeWindow, toggleMaximize, focusWindow, moveWindow, resizeWindow } =
    useWindowStore();

  const appDef = getAppById(win.appId);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    dragging: boolean;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  }>({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });

  const resizeState = useRef<{
    resizing: boolean;
    handle: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
  }>({ resizing: false, handle: '', startX: 0, startY: 0, origX: 0, origY: 0, origW: 0, origH: 0 });

  // Drag handlers
  const onTitleBarMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (win.maximized) return;
      if ((e.target as HTMLElement).closest('.win-controls-btn')) return;
      e.preventDefault();
      focusWindow(win.id);
      dragState.current = {
        dragging: true,
        startX: e.clientX,
        startY: e.clientY,
        origX: win.x,
        origY: win.y,
      };

      const onMouseMove = (ev: MouseEvent) => {
        if (!dragState.current.dragging) return;
        const dx = ev.clientX - dragState.current.startX;
        const dy = ev.clientY - dragState.current.startY;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const taskbarH = 50;
        const newX = Math.max(0, Math.min(dragState.current.origX + dx, vw - win.width));
        const newY = Math.max(0, Math.min(dragState.current.origY + dy, vh - taskbarH - 36));
        moveWindow(win.id, newX, newY);
      };

      const onMouseUp = () => {
        dragState.current.dragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [win, focusWindow, moveWindow]
  );

  const onTitleBarDoubleClick = useCallback(() => {
    toggleMaximize(win.id);
  }, [win.id, toggleMaximize]);

  // Resize handlers
  const onResizeMouseDown = useCallback(
    (e: React.MouseEvent, handle: string) => {
      if (win.maximized) return;
      e.preventDefault();
      e.stopPropagation();
      focusWindow(win.id);
      resizeState.current = {
        resizing: true,
        handle,
        startX: e.clientX,
        startY: e.clientY,
        origX: win.x,
        origY: win.y,
        origW: win.width,
        origH: win.height,
      };

      const minW = 400;
      const minH = 260;

      const onMouseMove = (ev: MouseEvent) => {
        if (!resizeState.current.resizing) return;
        const { handle, startX, startY, origX, origY, origW, origH } = resizeState.current;
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        let newX = origX;
        let newY = origY;
        let newW = origW;
        let newH = origH;

        if (handle.includes('e')) newW = Math.max(minW, origW + dx);
        if (handle.includes('s')) newH = Math.max(minH, origH + dy);
        if (handle.includes('w')) {
          newW = Math.max(minW, origW - dx);
          newX = origX + (origW - newW);
        }
        if (handle.includes('n')) {
          newH = Math.max(minH, origH - dy);
          newY = origY + (origH - newH);
        }

        resizeWindow(win.id, newW, newH, newX, newY);
      };

      const onMouseUp = () => {
        resizeState.current.resizing = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [win, focusWindow, resizeWindow]
  );

  const style: React.CSSProperties = win.maximized
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 50,
        width: '100%',
        height: 'calc(100vh - 50px)',
        zIndex: win.zIndex,
        borderRadius: 0,
      }
    : {
        position: 'fixed',
        top: win.y,
        left: win.x,
        width: win.width,
        height: win.height,
        zIndex: win.zIndex,
      };

  if (win.minimized) return null;

  return (
    <div
      ref={frameRef}
      style={style}
      className={`fixed flex flex-col overflow-hidden select-none transition-shadow duration-150 ${
        win.maximized ? 'rounded-none border-0' : 'rounded-xl'
      } ${
        win.active
          ? 'border border-[#0078D4] shadow-[0_20px_60px_rgba(0,0,0,0.65),0_0_15px_rgba(0,120,212,0.25)]'
          : 'border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.45)] opacity-95'
      } bg-[#1C212B]/95 backdrop-blur-2xl text-slate-100`}
      onMouseDown={() => !win.active && focusWindow(win.id)}
      role="dialog"
      aria-label={win.title}
    >
      {/* Windows 11 Title Bar */}
      <div
        className={`flex items-center justify-between h-9 px-3 shrink-0 cursor-move border-b select-none transition-colors ${
          win.active
            ? 'bg-[#1e2532]/95 border-white/10 text-white'
            : 'bg-[#181d27]/90 border-white/5 text-slate-400'
        }`}
        onMouseDown={onTitleBarMouseDown}
        onDoubleClick={onTitleBarDoubleClick}
      >
        {/* Left: App icon & Title */}
        <div className="flex items-center gap-2 min-w-0 mr-2 pointer-events-none">
          <AppIcon type={appDef?.iconType || 'thispc'} size="sm" />
          <span className="text-xs font-normal truncate tracking-tight">{win.title}</span>
        </div>

        {/* Right: Windows 11 Standard Window Controls */}
        <div className="flex items-center h-full -mr-3" role="group" aria-label="Window controls">
          {/* Minimize: — */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              minimizeWindow(win.id);
            }}
            className="win-controls-btn w-11 h-full flex items-center justify-center hover:bg-white/10 active:bg-white/15 transition-colors text-slate-300 hover:text-white"
            aria-label="Minimize"
            title="Minimize"
          >
            <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
              <rect width="10" height="1" />
            </svg>
          </button>

          {/* Maximize / Restore: ▢ */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMaximize(win.id);
            }}
            className="win-controls-btn w-11 h-full flex items-center justify-center hover:bg-white/10 active:bg-white/15 transition-colors text-slate-300 hover:text-white"
            aria-label={win.maximized ? 'Restore Down' : 'Maximize'}
            title={win.maximized ? 'Restore Down' : 'Maximize'}
          >
            {win.maximized ? (
              // Restore 2 overlapping squares
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M2.5 7.5H1.5V1.5H7.5V2.5" />
                <rect x="2.5" y="2.5" width="6" height="6" />
              </svg>
            ) : (
              // Maximize 1 square
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="0.5" y="0.5" width="9" height="9" />
              </svg>
            )}
          </button>

          {/* Close: ✕ (Windows Red on hover) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(win.id);
            }}
            className="win-controls-btn w-11 h-full flex items-center justify-center hover:bg-[#E81123] active:bg-[#BF0F1D] hover:text-white transition-colors text-slate-300"
            aria-label="Close"
            title="Close"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M1 1L9 9M9 1L1 9" />
            </svg>
          </button>
        </div>
      </div>

      {/* App Content with In-Window Error Boundary */}
      <div className="flex-1 overflow-hidden relative select-text">
        <AppErrorBoundary appId={win.appId}>{children}</AppErrorBoundary>
      </div>

      {/* Resize handles (only when not maximized) */}
      {!win.maximized && (
        <>
          <div className="resize-handle resize-handle-n" onMouseDown={(e) => onResizeMouseDown(e, 'n')} />
          <div className="resize-handle resize-handle-s" onMouseDown={(e) => onResizeMouseDown(e, 's')} />
          <div className="resize-handle resize-handle-e" onMouseDown={(e) => onResizeMouseDown(e, 'e')} />
          <div className="resize-handle resize-handle-w" onMouseDown={(e) => onResizeMouseDown(e, 'w')} />
          <div className="resize-handle resize-handle-ne" onMouseDown={(e) => onResizeMouseDown(e, 'ne')} />
          <div className="resize-handle resize-handle-nw" onMouseDown={(e) => onResizeMouseDown(e, 'nw')} />
          <div className="resize-handle resize-handle-se" onMouseDown={(e) => onResizeMouseDown(e, 'se')} />
          <div className="resize-handle resize-handle-sw" onMouseDown={(e) => onResizeMouseDown(e, 'sw')} />
        </>
      )}
    </div>
  );
}
