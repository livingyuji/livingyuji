'use client';

import React, { useEffect, useState } from 'react';
import { Desktop } from '@/components/desktop/Desktop';
import { MobileOS } from '@/components/mobile/MobileOS';
import { useWindowStore } from '@/store/windowStore';
import { LoadingScreen } from '@/components/common/LoadingScreen';

type DeviceClass = 'desktop' | 'tablet' | 'mobile' | null;

function getDeviceClass(width: number): DeviceClass {
  if (width >= 1024) return 'desktop';
  if (width >= 640) return 'tablet';
  return 'mobile';
}

export function OSShell() {
  const [device, setDevice] = useState<DeviceClass>(null);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const { settings } = useWindowStore();

  useEffect(() => {
    const update = () => setDevice(getDeviceClass(window.innerWidth));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Apply reduced motion
  useEffect(() => {
    if (settings.reducedMotion) {
      document.documentElement.style.setProperty('--motion-reduce', '1');
    } else {
      document.documentElement.style.removeProperty('--motion-reduce');
    }
  }, [settings.reducedMotion]);

  return (
    <>
      {/* Cinematic Matching Loading Screen based on reference */}
      {!loadingComplete && (
        <LoadingScreen onComplete={() => setLoadingComplete(true)} />
      )}

      {/* Underlying Desktop or Mobile OS */}
      {device === 'mobile' ? <MobileOS /> : <Desktop />}
    </>
  );
}
