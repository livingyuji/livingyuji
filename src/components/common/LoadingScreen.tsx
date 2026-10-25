'use client';

import React, { useEffect, useState } from 'react';
import { useWindowStore } from '@/store/windowStore';

interface LoadingScreenProps {
  onComplete?: () => void;
  minDurationMs?: number;
  maxTimeoutMs?: number;
}

export function LoadingScreen({
  onComplete,
  minDurationMs = 1100,
  maxTimeoutMs = 3000,
}: LoadingScreenProps) {
  const { settings } = useWindowStore();
  const [mounted, setMounted] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  useEffect(() => {
    setMounted(true);
    const startTime = Date.now();

    // Check when page resources and document are ready
    const handleReady = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDurationMs - elapsed);

      setTimeout(() => {
        setIsFadingOut(true);
        // Remove from DOM after fade-out transition completes (650ms)
        setTimeout(() => {
          setIsRemoved(true);
          if (onComplete) onComplete();
        }, 650);
      }, remaining);
    };

    if (typeof document !== 'undefined' && document.readyState === 'complete') {
      handleReady();
    } else if (typeof window !== 'undefined') {
      window.addEventListener('load', handleReady, { once: true });
    }

    // Safety watchdog timer: never leave the user stuck on loading screen
    const watchdogTimer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        setIsRemoved(true);
        if (onComplete) onComplete();
      }, 650);
    }, maxTimeoutMs);

    return () => {
      clearTimeout(watchdogTimer);
      if (typeof window !== 'undefined') {
        window.removeEventListener('load', handleReady);
      }
    };
  }, [minDurationMs, maxTimeoutMs, onComplete]);

  if (isRemoved) return null;

  const brandName = settings?.brandName || 'LivingYuji';

  return (
    <aside
      role="status"
      aria-live="polite"
      aria-label="Loading LivingYuji OS"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-[#000000] text-white select-none overflow-hidden transition-opacity duration-700 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top spacer for optical vertical balancing */}
      <div className="w-full h-12 md:h-16" aria-hidden="true" />

      {/* Center Hero Block — Perfectly matching reference image */}
      <div
        className={`flex flex-col items-center text-center transition-all duration-700 ease-out ${
          mounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Windows-style 4-Square Grid Logo */}
        <div
          className="grid grid-cols-2 gap-2 sm:gap-2.5 mb-6 sm:mb-7 filter drop-shadow-[0_4px_24px_rgba(255,255,255,0.06)]"
          aria-hidden="true"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-[#FFFFFF] rounded-[7px] sm:rounded-[8px] transition-transform duration-300 hover:scale-105" />
          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-[#FFFFFF] rounded-[7px] sm:rounded-[8px] transition-transform duration-300 hover:scale-105" />
          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-[#FFFFFF] rounded-[7px] sm:rounded-[8px] transition-transform duration-300 hover:scale-105" />
          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-[#FFFFFF] rounded-[7px] sm:rounded-[8px] transition-transform duration-300 hover:scale-105" />
        </div>

        {/* Primary Identity Name */}
        <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-normal font-sans mb-2 antialiased">
          {brandName}
        </h1>

        {/* Subtitle with wide letter-spacing */}
        <p className="text-[10px] sm:text-[11px] font-medium tracking-[0.28em] text-[#8A909E] uppercase font-sans mb-12 sm:mb-14 antialiased">
          System Builder &mdash; Creative Technologist
        </p>

        {/* Minimalist Circular Ring Spinner matching reference */}
        <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center">
          {/* Subtle background track */}
          <div className="absolute inset-0 rounded-full border-[2.5px] border-white/10" />
          {/* Smooth rotating leading arc */}
          <div className="absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-white motion-safe:animate-spin" />
        </div>
      </div>

      {/* Footer Branding Line matching reference image */}
      <footer className="w-full pb-8 sm:pb-10 text-center px-4">
        <p className="text-[9.5px] sm:text-[10.5px] tracking-[0.25em] text-[#717684] uppercase font-sans antialiased">
          Powered by {brandName}&apos;s Creative Mind
        </p>
      </footer>
    </aside>
  );
}
