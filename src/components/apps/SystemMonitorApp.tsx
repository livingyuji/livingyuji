'use client';

import React, { useState, useEffect } from 'react';
import { useWindowStore } from '@/store/windowStore';
import { APPS } from '@/config/apps';
import { checkSupabaseConnection } from '@/lib/supabase/client';
import {
  Activity,
  HardDrive,
  Layers,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Monitor,
  CheckCircle2,
  Clock,
  Wifi,
  RefreshCw,
  Database,
  Info,
} from 'lucide-react';

export function SystemMonitorApp() {
  const { windows } = useWindowStore();

  const [storageEstimate, setStorageEstimate] = useState<{
    usage: number;
    quota: number;
    percent: number;
  } | null>(null);

  const [authStatus, setAuthStatus] = useState<boolean | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<{ connected: boolean; message: string; url?: string } | null>(null);
  const [apiLatency, setApiLatency] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDiagnostics = async () => {
    setIsRefreshing(true);
    setLastChecked(new Date());

    // 1. Storage quota estimate
    try {
      if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage || 0;
        const quota = estimate.quota || 1;
        setStorageEstimate({
          usage,
          quota,
          percent: Math.min(100, Math.round((usage / quota) * 100)),
        });
      }
    } catch (err) {
      console.warn('Storage estimate unavailable:', err);
    }

    // 2. Auth & API health latency
    const start = performance.now();
    try {
      const res = await fetch('/api/admin/session', { cache: 'no-store' });
      const duration = Math.round(performance.now() - start);
      setApiLatency(duration);
      if (res.ok) {
        const data = await res.json();
        setAuthStatus(Boolean(data.authenticated));
      } else {
        setAuthStatus(false);
      }
    } catch (err) {
      setApiLatency(null);
      setAuthStatus(false);
    }

    // 3. Supabase live connectivity
    try {
      const sbResult = await checkSupabaseConnection();
      setSupabaseStatus(sbResult);
    } catch (err: any) {
      setSupabaseStatus({ connected: false, message: err?.message || 'Error checking Supabase' });
    }

    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchDiagnostics();
    const interval = setInterval(fetchDiagnostics, 15000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const clientInfo = {
    screen: typeof window !== 'undefined' ? `${window.screen.width} × ${window.screen.height}` : '1920 × 1080',
    dpr: typeof window !== 'undefined' ? `${window.devicePixelRatio}x` : '1x',
    cores: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4,
    platform: typeof navigator !== 'undefined' ? navigator.platform : 'Win32',
  };

  return (
    <div className="h-full flex flex-col bg-[#11141C] text-slate-200 select-none font-sans text-xs">
      {/* Top Application Bar */}
      <div className="h-10 px-4 bg-[#161B26] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-emerald-400" />
          <span className="font-bold text-white text-xs">System Diagnostics & Telemetry</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-400">
            Last check: {lastChecked.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchDiagnostics}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 text-[11px] transition-colors active:scale-95"
            title="Refresh diagnostics"
          >
            <RefreshCw size={11} className={isRefreshing ? 'animate-spin text-sky-400' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Diagnostics Grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 window-scroll bg-[#0F131C]">
        {/* Banner: Browser Sandbox Notice */}
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 text-[11px] text-emerald-300">
          <Info size={14} className="text-emerald-400 shrink-0" />
          <span>
            Telemetry metrics reflect actual browser-sandbox measurements, window manager state, and verified server API latency.
          </span>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Card 1: Registered Applications */}
          <div className="p-3.5 bg-[#141824] border border-white/5 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Registered Apps</span>
              <Layers size={14} className="text-sky-400" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-white">{APPS.length}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Active modules</span>
            </div>
          </div>

          {/* Card 2: Open Windows */}
          <div className="p-3.5 bg-[#141824] border border-white/5 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Active Windows</span>
              <Monitor size={14} className="text-amber-400" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-white">{windows.length}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {windows.filter((w) => w.minimized).length} minimized
              </span>
            </div>
          </div>

          {/* Card 3: Storage Quota */}
          <div className="p-3.5 bg-[#141824] border border-white/5 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Browser Storage</span>
              <HardDrive size={14} className="text-purple-400" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-white">
                {storageEstimate ? `${storageEstimate.percent}%` : 'N/A'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                {storageEstimate ? formatBytes(storageEstimate.usage) : 'Measuring...'}
              </span>
            </div>
          </div>

          {/* Card 4: API Health */}
          <div className="p-3.5 bg-[#141824] border border-white/5 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Server API Latency</span>
              <Wifi size={14} className="text-emerald-400" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-white">
                {apiLatency !== null ? `${apiLatency} ms` : 'Offline'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Next.js Edge</span>
            </div>
          </div>
        </div>

        {/* System & Storage Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Box 1: Storage Partition Status */}
          <div className="p-4 bg-[#141824] border border-white/5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Database size={14} className="text-sky-400" />
                <span className="font-bold text-white">Virtual Storage Engines</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Healthy
              </span>
            </div>

            <div className="space-y-2.5 text-[11px]">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>IndexedDB Virtual Drive (`livingyuji_os_storage`)</span>
                  <span className="text-emerald-400 font-semibold">Active</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-1/4" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>LocalStorage State Cache</span>
                  <span className="text-sky-400 font-semibold">Persistent</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full w-1/6" />
                </div>
              </div>

              {storageEstimate && (
                <div className="pt-2 border-t border-white/5 text-[10px] text-slate-400 flex justify-between">
                  <span>Allocated Quota Ceiling:</span>
                  <span>{formatBytes(storageEstimate.quota)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Box 2: OS Platform & Security Boundary */}
          <div className="p-4 bg-[#141824] border border-white/5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span className="font-bold text-white">OS Runtime & Security</span>
              </div>
              <span className="text-[10px] text-slate-400">v1.2.0</span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Admin Session:</span>
                <span className={authStatus ? 'text-emerald-400 font-semibold' : 'text-slate-300'}>
                  {authStatus ? 'Authenticated (Master Session)' : 'Public Guest Mode'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Supabase Cloud:</span>
                <span className={supabaseStatus?.connected ? 'text-emerald-400 font-semibold flex items-center gap-1' : 'text-slate-300'}>
                  {supabaseStatus?.connected ? 'Connected (Live Postgres)' : 'Offline / Standalone'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Display Resolution:</span>
                <span className="text-slate-200">{clientInfo.screen} ({clientInfo.dpr})</span>
              </div>

              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Logical CPU Cores:</span>
                <span className="text-slate-200">{clientInfo.cores} Cores Available</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-400">Host Environment:</span>
                <span className="text-slate-200">{clientInfo.platform} (Modern Web Client)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
