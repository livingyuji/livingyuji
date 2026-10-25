'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useWindowStore } from '@/store/windowStore';
import { useDesktopIconStore, snapCoordinatesToGrid } from '@/store/desktopIconStore';
import { getAppById } from '@/config/apps';
import { AppIcon } from '@/components/ui/AppIcon';
import type { AppId } from '@/store/windowStore';

interface DesktopIconProps {
  appId: AppId;
}

const DRAG_THRESHOLD = 8; // Pixels pointer must travel before dragging begins

export function DesktopIcon({ appId }: DesktopIconProps) {
  const { openWindow, setContextMenu } = useWindowStore();
  const { positions, setPosition, movementEnabled, selectedIconId, setSelectedIconId } =
    useDesktopIconStore();
  const app = getAppById(appId);

  const isSelected = selectedIconId === appId;
  const pos = positions[appId] || { x: 16, y: 16 };

  const [isDragging, setIsDragging] = useState(false);
  const [visualPos, setVisualPos] = useState(pos);

  // Synchronize visualPos when saved position changes and not dragging
  useEffect(() => {
    if (!isDragging) {
      setVisualPos(positions[appId] || { x: 16, y: 16 });
    }
  }, [positions, appId, isDragging]);

  // Pointer tracking refs
  const pointerDownRef = useRef(false);
  const pointerStartPos = useRef({ x: 0, y: 0 });
  const initialIconPos = useRef({ x: 0, y: 0 });
  const hasExceededThresholdRef = useRef(false);
  const dragJustEndedRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const lastOpenTimeRef = useRef(0);

  const handleOpenApp = useCallback(() => {
    const now = Date.now();
    if (now - lastOpenTimeRef.current < 300) return;
    lastOpenTimeRef.current = now;

    if (appId === 'thispc') {
      openWindow('thispc', { folderId: 'root', title: 'This PC' });
    } else if (appId === 'projects') {
      openWindow('thispc', { folderId: 'd-root', title: 'D: — My Projects' });
    } else if (appId === 'resume') {
      openWindow('resume', { title: 'Resume.txt' });
    } else {
      openWindow(appId);
    }
  }, [appId, openWindow]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Primary mouse button only
      if (e.button !== 0) return;

      // Do not initiate drag from inside inner interactive controls
      if ((e.target as HTMLElement).closest('button, input, a')) return;

      pointerDownRef.current = true;
      hasExceededThresholdRef.current = false;
      pointerStartPos.current = { x: e.clientX, y: e.clientY };
      initialIconPos.current = { x: pos.x, y: pos.y };
      pointerIdRef.current = e.pointerId;

      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (err) {}
    },
    [pos]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!pointerDownRef.current) return;

      const dx = e.clientX - pointerStartPos.current.x;
      const dy = e.clientY - pointerStartPos.current.y;
      const distance = Math.hypot(dx, dy);

      // If movement setting is disabled, dragging is strictly prevented
      if (!movementEnabled) return;

      if (!hasExceededThresholdRef.current) {
        if (distance >= DRAG_THRESHOLD) {
          hasExceededThresholdRef.current = true;
          setIsDragging(true);
          setSelectedIconId(appId);
        } else {
          // Within deadzone jitter threshold — do NOT move icon
          return;
        }
      }

      // Calculate bounded position while actively dragging
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
      const vh = typeof window !== 'undefined' ? window.innerHeight : 720;
      const taskbarHeight = 48;
      const iconWidth = 86;
      const iconHeight = 92;

      const rawX = initialIconPos.current.x + dx;
      const rawY = initialIconPos.current.y + dy;

      const clampedX = Math.max(16, Math.min(rawX, vw - iconWidth - 16));
      const clampedY = Math.max(16, Math.min(rawY, vh - taskbarHeight - iconHeight));

      setVisualPos({ x: clampedX, y: clampedY });
    },
    [movementEnabled, appId, setSelectedIconId]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!pointerDownRef.current) return;
      pointerDownRef.current = false;

      if (pointerIdRef.current !== null) {
        try {
          e.currentTarget.releasePointerCapture(pointerIdRef.current);
        } catch (err) {}
        pointerIdRef.current = null;
      }

      // If a real drag occurred beyond the threshold
      if (hasExceededThresholdRef.current && movementEnabled) {
        setIsDragging(false);
        hasExceededThresholdRef.current = false;

        // Suppress any click / double-click event directly following a drag
        dragJustEndedRef.current = true;
        setTimeout(() => {
          dragJustEndedRef.current = false;
        }, 150);

        // Snap to grid
        const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
        const vh = typeof window !== 'undefined' ? window.innerHeight : 720;
        const taskbarHeight = 48;
        const iconWidth = 86;
        const iconHeight = 92;

        const snapped = snapCoordinatesToGrid(visualPos.x, visualPos.y);
        const finalX = Math.max(16, Math.min(snapped.x, vw - iconWidth - 16));
        const finalY = Math.max(16, Math.min(snapped.y, vh - taskbarHeight - iconHeight));

        // Only save if position actually changed from the start of the drag
        if (finalX !== initialIconPos.current.x || finalY !== initialIconPos.current.y) {
          setPosition(appId, finalX, finalY);
          setVisualPos({ x: finalX, y: finalY });
          useDesktopIconStore.getState().saveCloudLayout();
        } else {
          setVisualPos({ x: initialIconPos.current.x, y: initialIconPos.current.y });
        }
      } else {
        // Normal click release (no movement beyond threshold)
        setIsDragging(false);
        hasExceededThresholdRef.current = false;
        setVisualPos({ x: pos.x, y: pos.y });

        // Select the icon
        setSelectedIconId(appId);

        // Double click detection via e.detail
        if (e.detail === 2) {
          handleOpenApp();
        }
      }
    },
    [movementEnabled, visualPos, appId, pos, setPosition, setSelectedIconId, handleOpenApp]
  );

  const onPointerCancel = useCallback(() => {
    pointerDownRef.current = false;
    setIsDragging(false);
    hasExceededThresholdRef.current = false;
    setVisualPos({ x: pos.x, y: pos.y });
  }, [pos]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (dragJustEndedRef.current) return;
      setSelectedIconId(appId);
    },
    [appId, setSelectedIconId]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (dragJustEndedRef.current) return;
      handleOpenApp();
    },
    [handleOpenApp]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleOpenApp();
      }
    },
    [handleOpenApp]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedIconId(appId);
      setContextMenu({ x: e.clientX, y: e.clientY, target: 'icon', data: appId });
    },
    [appId, setSelectedIconId, setContextMenu]
  );

  if (!app) return null;

  return (
    <div
      data-desktop-icon="true"
      style={{
        position: 'absolute',
        left: visualPos.x,
        top: visualPos.y,
        width: 86,
        zIndex: isDragging ? 60 : isSelected ? 20 : 10,
        touchAction: 'none',
      }}
      className={`group flex flex-col items-center justify-center p-2 rounded-xl select-none outline-none transition-shadow ${
        isDragging
          ? 'shadow-2xl scale-105 opacity-90 cursor-grabbing bg-white/[0.16] ring-1 ring-[#0078D4]'
          : isSelected
          ? 'bg-white/[0.14] ring-1 ring-white/30 backdrop-blur-sm cursor-pointer'
          : 'hover:bg-white/[0.07] hover:ring-1 hover:ring-white/10 cursor-pointer'
      }`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      onContextMenu={handleContextMenu}
      tabIndex={0}
      role="button"
      aria-label={app.label}
      aria-selected={isSelected}
      title={movementEnabled ? `Double-click to open, drag to move ${app.label}` : `Double-click to open ${app.label}`}
    >
      <div className="relative mb-1 transition-transform group-hover:scale-105 duration-100 pointer-events-none select-none">
        <AppIcon type={app.iconType} size="lg" />
      </div>
      <span className="text-[11px] font-normal leading-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] max-w-[78px] text-center truncate tracking-tight select-none pointer-events-none">
        {app.label}
      </span>
    </div>
  );
}

export function DesktopIconGrid() {
  const { positions } = useDesktopIconStore();

  const visibleAppIds = useMemo(() => {
    const defaultIds: AppId[] = [
      // Column 1
      'thispc',
      'recyclebin',
      'projects', // Developer Lab
      'music', // Music Lab
      'resume',
      'about', // Biography
      'contact', // Contact Info
      // Column 2
      'blog',
      'games',
      'store',
      'minecraftstore',
      'memorywall',
      // Column 3
      'paint',
      'browser', // LivingYuji Browser
      'terminal',
      'showcase', // Showcase directly below Terminal
    ];

    // Any dynamically added app shortcuts present in positions
    const additionalIds = Object.keys(positions).filter(
      (id) => !defaultIds.includes(id as AppId) && getAppById(id as AppId)
    ) as AppId[];

    return [...defaultIds, ...additionalIds];
  }, [positions]);

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
      <div className="relative w-full h-full pointer-events-auto">
        {visibleAppIds.map((appId) => (
          <DesktopIcon key={appId} appId={appId} />
        ))}
      </div>
    </div>
  );
}
