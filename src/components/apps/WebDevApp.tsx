'use client';

import React from 'react';
import { useWindowStore } from '@/store/windowStore';
import { Send } from 'lucide-react';

const WEB_SERVICES = [
  'Frontend development (React, Next.js)',
  'Backend development (Node.js, APIs)',
  'Responsive websites for all devices',
  'Web applications & dashboards',
  'REST API development & integration',
  'Database design & management',
  'Authentication & authorisation',
  'Admin dashboards & CMS',
  'Portfolio & personal sites',
  'E-commerce & digital storefronts',
];

export function WebDevApp() {
  const { openWindow } = useWindowStore();

  return (
    <div className="h-full overflow-y-auto window-scroll bg-soft-bg dark:bg-slate-900">
      <div className="max-w-xl mx-auto px-5 py-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🌐</span>
          <div>
            <h1 className="text-xl font-bold text-deep dark:text-white">Web Development</h1>
            <p className="text-sm text-secondary">Full-stack web applications & APIs</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-border/40">
          <h2 className="text-sm font-semibold text-deep dark:text-white mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-cyan-500 rounded-full" /> Services
          </h2>
          <div className="grid grid-cols-1 gap-1.5">
            {WEB_SERVICES.map((s) => (
              <div key={s} className="flex items-center gap-2 text-sm text-secondary py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" /> {s}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-border/40">
          <h2 className="text-sm font-semibold text-deep dark:text-white mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-cyan-500 rounded-full" /> Stack
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Frontend', techs: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'] },
              { label: 'Backend', techs: ['Node.js', 'Next.js API', 'REST APIs'] },
              { label: 'Database', techs: ['PostgreSQL', 'Supabase', 'SQLite'] },
              { label: 'Tools', techs: ['Git', 'GitHub', 'Vercel', 'Docker'] },
            ].map((group) => (
              <div key={group.label} className="bg-soft-bg dark:bg-slate-700 rounded-xl p-3">
                <div className="text-xs font-semibold text-deep dark:text-white mb-2">{group.label}</div>
                <div className="flex flex-wrap gap-1">
                  {group.techs.map((t) => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 bg-white dark:bg-slate-600 text-secondary rounded border border-border/60">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-border/40">
          <h2 className="text-sm font-semibold text-deep dark:text-white mb-2 flex items-center gap-2">
            <span className="w-1 h-4 bg-cyan-500 rounded-full" /> Featured Work
          </h2>
          <div className="p-3 bg-soft-bg dark:bg-slate-700 rounded-xl">
            <div className="font-medium text-sm text-deep dark:text-white">💻 LivingYuji OS</div>
            <p className="text-xs text-secondary mt-1">Interactive OS-style portfolio with desktop window manager, mobile interface, digital store and admin dashboard. Built with Next.js, TypeScript and Supabase.</p>
          </div>
        </div>

        <button
          onClick={() => openWindow('contact')}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-cyan-500 text-white font-medium text-sm hover:bg-cyan-600 transition-colors"
        >
          <Send className="w-4 h-4" /> Request Web Project
        </button>
      </div>
    </div>
  );
}
