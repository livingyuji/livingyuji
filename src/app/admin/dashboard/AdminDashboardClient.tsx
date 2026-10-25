'use client';

import React from 'react';
import Link from 'next/link';
import { AdminPanelApp } from '@/components/apps/AdminPanelApp';
import { ArrowLeft, Monitor, LogOut } from 'lucide-react';

export function AdminDashboardClient() {
  const handleSignOut = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      window.location.href = '/admin?message=logged_out';
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0F131D] text-slate-100 overflow-hidden">
      {/* Top Header Bar */}
      <div className="h-12 px-6 bg-[#161B27] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-slate-200 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to LivingYuji OS</span>
          </Link>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-xs">LivingYuji Administration Console</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
              Authenticated Session
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
          >
            <Monitor size={14} />
            <span>Launch Desktop</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-medium transition-colors border border-red-500/20"
            title="Terminate administrator session"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Admin Panel Workspace */}
      <div className="flex-1 overflow-hidden">
        <AdminPanelApp isStandalonePage={true} />
      </div>
    </div>
  );
}
