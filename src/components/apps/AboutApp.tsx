'use client';

import React, { useState } from 'react';
import { useWindowStore } from '@/store/windowStore';
import {
  User,
  BookOpen,
  Briefcase,
  FolderGit2,
  Calendar,
  FileCheck2,
  MapPin,
  Send,
  Sparkles,
  ExternalLink,
  Code2,
  Cpu,
  Layers,
  Terminal as TerminalIcon,
} from 'lucide-react';

type BioTab = 'overview' | 'fullstory' | 'practice' | 'projects' | 'timeline' | 'facts';

export function AboutApp() {
  const { openWindow, settings } = useWindowStore();
  const [activeTab, setActiveTab] = useState<BioTab>('overview');

  const tabs: { id: BioTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <User size={13} /> },
    { id: 'fullstory', label: 'Full story', icon: <BookOpen size={13} /> },
    { id: 'practice', label: 'Practice', icon: <Briefcase size={13} /> },
    { id: 'projects', label: 'Projects', icon: <FolderGit2 size={13} /> }, // IN PLACE OF MUSIC, ADD PROJECTS!
    { id: 'timeline', label: 'Timeline', icon: <Calendar size={13} /> },
    { id: 'facts', label: 'Facts', icon: <FileCheck2 size={13} /> },
  ];

  return (
    <div className="h-full flex flex-col bg-[#0D111A] text-slate-100 select-none overflow-hidden font-sans text-xs">
      {/* 1. TOP HERO PROFILE CARD (MATCHES SCREENSHOT 1 EXACTLY) */}
      <div className="p-6 pb-4 bg-[#121622] border-b border-white/10 shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Avatar & Location */}
          <div className="flex items-center gap-5">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/15 bg-black/40 shadow-xl flex items-center justify-center relative">
                <img
                  src={settings.customLogoUrl || '/avatar.png'}
                  alt="LivingYuji"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initial avatar if image fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400">
                <MapPin size={11} className="text-[#38BDF8]" />
                <span>India</span>
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider uppercase text-emerald-400">
                <span>OFFICIAL BIOGRAPHY</span>
                <span>•</span>
                <span>CANONICAL IDENTITY RECORD</span>
              </div>

              <h1 className="text-2xl font-extrabold text-white tracking-tight">LivingYuji</h1>

              <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                Full-Stack Systems Architect, Minecraft Engine Developer, and Multidisciplinary Digital Creator.
              </p>

              {/* Tag Badges */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-slate-300 font-medium">
                  Full-Stack Developer
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-slate-300 font-medium">
                  Minecraft Engine Architect
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-slate-300 font-medium">
                  Creative Systems Producer
                </span>
              </div>
            </div>
          </div>

          {/* Contact Button */}
          <div className="shrink-0 self-start md:self-center">
            <button
              onClick={() => openWindow('contact')}
              className="px-5 py-2.5 rounded-xl bg-[#0078D4] hover:bg-[#0086F0] text-white font-bold text-xs shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send size={13} />
              <span>Contact</span>
            </button>
          </div>
        </div>

        {/* 2. TAB NAVIGATION ROW (MATCHES SCREENSHOT 1 WITH PROJECTS IN PLACE OF MUSIC) */}
        <div className="max-w-4xl mx-auto mt-6 flex items-center gap-1 border-b border-white/10 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 border-b-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'border-[#0078D4] text-white font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-white/20'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. BODY WORKSPACE */}
      <div className="flex-1 overflow-y-auto p-6 window-scroll">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* LEFT 2/3 COLUMN: CONTENT */}
          <div className="md:col-span-2 space-y-6">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#38BDF8] tracking-wide uppercase">
                  <Sparkles size={14} />
                  <span>Canonical Profile</span>
                </div>

                <h2 className="text-xl font-extrabold text-white tracking-tight leading-snug">
                  Ideas become systems, stories, and interactive worlds.
                </h2>

                <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
                  <p>
                    LivingYuji is an independent multidisciplinary software engineer and systems architect
                    whose work spans high-performance Minecraft combat engines, creative digital production,
                    browser-based operating systems, and full-stack software architectures.
                  </p>
                  <p>
                    Working across disciplines rather than within a single fixed category, LivingYuji has built
                    a creative identity centered on the relationship between systems thinking, real-time gaming
                    mechanics, low-latency client-server synchronization, and interactive desktop web environments.
                  </p>
                  <p>
                    Over more than five years of production-grade engineering, LivingYuji has cultivated expertise
                    through self-directed study, open-source architectures, and sustained project-based learning.
                    This foundation has become central to his approach: allowing him to combine technical precision
                    with conceptual depth and to treat digital creation not simply as a functional discipline, but as a
                    medium for building responsive, unforgettable experiences and software systems.
                  </p>
                </div>
              </div>
            )}

            {/* FULL STORY TAB */}
            {activeTab === 'fullstory' && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#38BDF8] tracking-wide uppercase">
                  <BookOpen size={14} />
                  <span>The Complete Journey</span>
                </div>

                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  From Low-Level Minecraft Protocols to Web Operating Systems
                </h2>

                <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
                  <p>
                    The journey began with game modding and server performance tuning. Dismantling the PaperMC and
                    Spigot internals revealed how tick cycles, asynchronous packet queues, and custom byte protocols
                    could be pushed to handle hundreds of concurrent players at a rock-solid 20.0 TPS.
                  </p>
                  <p>
                    As these Java game systems expanded, so did the need for robust telemetry and web dashboards.
                    LivingYuji transitioned into Next.js, React, and TypeScript, designing full desktop-grade
                    interfaces inside the browser—culminating in LivingYuji OS, an operating system that bridges
                    digital portfolio, media lab, and productivity workstation.
                  </p>
                  <p>
                    Today, LivingYuji operates as a solo engineering powerhouse, delivering custom weapon engines,
                    Discord bot ecosystems, and desktop web applications for clients and communities worldwide.
                  </p>
                </div>
              </div>
            )}

            {/* PRACTICE TAB */}
            {activeTab === 'practice' && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#38BDF8] tracking-wide uppercase">
                  <Briefcase size={14} />
                  <span>Disciplines & Practice</span>
                </div>

                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Core Engineering Practices
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      icon: <Cpu className="text-emerald-400" size={18} />,
                      title: 'Minecraft Java Engines',
                      desc: 'PaperMC, Purpur, custom NMS packets, raycasted abilities, and CustomModelData resource pack integration.',
                    },
                    {
                      icon: <Layers className="text-sky-400" size={18} />,
                      title: 'Web OS Architecture',
                      desc: 'React 18, Next.js 14, Zustand state management, custom window managers, and zero-compromise UX.',
                    },
                    {
                      icon: <TerminalIcon className="text-purple-400" size={18} />,
                      title: 'Automation & Bot Systems',
                      desc: 'Discord.js, REST API endpoints, real-time ticket dispatching, role sync, and server moderation.',
                    },
                    {
                      icon: <Code2 className="text-amber-400" size={18} />,
                      title: 'High-Throughput Databases',
                      desc: 'PostgreSQL, Supabase, IndexedDB, and persistent browser storage with offline fallback safety.',
                    },
                  ].map((p) => (
                    <div
                      key={p.title}
                      className="p-4 rounded-xl bg-[#141824] border border-white/10 space-y-2 hover:border-[#0078D4]/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center">
                          {p.icon}
                        </div>
                        <h4 className="font-bold text-white text-xs">{p.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROJECTS TAB (EXACT REQUIREMENT: IN PLACE OF MUSIC, ADD PROJECTS!) */}
            {activeTab === 'projects' && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#38BDF8] tracking-wide uppercase">
                  <FolderGit2 size={14} />
                  <span>Featured Software Releases</span>
                </div>

                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Architectural Portfolio & Systems
                </h2>

                <div className="space-y-3">
                  {[
                    {
                      name: 'LivingYuji OS',
                      cat: 'Web Desktop Operating System',
                      desc: 'Interactive Windows-inspired browser environment with window manager, NTFS virtual filesystem, and store.',
                      tech: 'Next.js 14 • React • TypeScript • Tailwind • Zustand',
                      appId: 'thispc',
                    },
                    {
                      name: 'ArcaneArsenal',
                      cat: 'Minecraft Combat Engine',
                      desc: 'Production-grade custom weapons system with 10+ mythical weapons, particle raycasting, and sound FX.',
                      tech: 'Java 21 • PaperMC • Purpur API • CustomModelData',
                      appId: 'minecraftstore',
                    },
                    {
                      name: 'VantaCombat',
                      cat: 'PvP & Hit-Registration Engine',
                      desc: 'High tick-rate PvP framework featuring custom knockback curves, hit-delay optimization, and combat tagging.',
                      tech: 'Java • ProtocolLib • PacketEvents',
                      appId: 'minecraftstore',
                    },
                    {
                      name: 'Raven Everywhere',
                      cat: 'Discord Bot Infrastructure',
                      desc: 'Multi-guild automation bot with ticket management, role sync, moderation logs, and web dashboard integration.',
                      tech: 'Node.js • Discord.js v14 • REST APIs',
                      appId: 'discord',
                    },
                  ].map((proj) => (
                    <div
                      key={proj.name}
                      className="p-4 rounded-xl bg-[#141824] border border-white/10 flex items-start justify-between gap-4 hover:border-[#0078D4]/40 transition-colors"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{proj.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-semibold border border-sky-500/20">
                            {proj.cat}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{proj.desc}</p>
                        <div className="text-[10px] text-slate-500 font-mono">{proj.tech}</div>
                      </div>

                      <button
                        onClick={() => openWindow(proj.appId as any)}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center gap-1.5 shrink-0 transition-colors"
                      >
                        <span>Open</span>
                        <ExternalLink size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TIMELINE TAB */}
            {activeTab === 'timeline' && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#38BDF8] tracking-wide uppercase">
                  <Calendar size={14} />
                  <span>Career & Development Milestones</span>
                </div>

                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Engineering Chronology
                </h2>

                <div className="space-y-4 relative pl-4 border-l border-white/10">
                  {[
                    { year: '2026', title: 'LivingYuji OS 2.5', desc: 'Released complete Windows web operating system with virtual NTFS filesystem, store, and Supabase integration.' },
                    { year: '2025', title: 'ArcaneArsenal & VantaCombat Engines', desc: 'Engineered next-gen Minecraft combat plugins deployed across production community networks.' },
                    { year: '2024', title: 'Discord Bot Infrastructure', desc: 'Architected automated community moderation and payment dispatch systems.' },
                    { year: '2022', title: 'PaperMC & Purpur Specialization', desc: 'Deep dive into asynchronous server performance, custom packets, and tickrate optimization.' },
                  ].map((m) => (
                    <div key={m.year} className="relative space-y-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0078D4] absolute -left-[21px] top-1 ring-4 ring-[#0D111A]" />
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{m.title}</span>
                        <span className="text-[10px] text-sky-400 font-mono">({m.year})</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{m.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FACTS TAB */}
            {activeTab === 'facts' && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#38BDF8] tracking-wide uppercase">
                  <FileCheck2 size={14} />
                  <span>Verified Identity Records</span>
                </div>

                <h2 className="text-xl font-extrabold text-white tracking-tight">Technical Telemetry</h2>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Primary Languages', value: 'Java, TypeScript, Python, SQL' },
                    { label: 'Architecture Pattern', value: 'Component-Driven, Event-Based' },
                    { label: 'Tickrate Stability', value: '20.0 TPS Maintained at Scale' },
                    { label: 'Web Engine', value: 'Next.js 14 App Router & React 18' },
                    { label: 'Network Proxy', value: 'Velocity & PaperMC Protocols' },
                    { label: 'Security & Auth', value: 'Supabase RLS & Strict Policies' },
                  ].map((f) => (
                    <div key={f.label} className="p-3.5 rounded-xl bg-[#141824] border border-white/10 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">{f.label}</div>
                      <div className="text-xs font-bold text-white">{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 1/3 COLUMN: OFFICIAL IDENTITY CARD (MATCHES SCREENSHOT 1) */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#141824] border border-white/10 space-y-4 shadow-lg">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Official Identity
              </h3>

              <div className="space-y-3 divide-y divide-white/5 text-[11px]">
                <div className="pt-2 first:pt-0">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Full Name</div>
                  <div className="font-bold text-white mt-0.5">LivingYuji</div>
                </div>

                <div className="pt-2">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Since</div>
                  <div className="font-bold text-white mt-0.5">2021</div>
                </div>

                <div className="pt-2">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Birthplace</div>
                  <div className="font-bold text-white mt-0.5">Canonical Record</div>
                </div>

                <div className="pt-2">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Based In</div>
                  <div className="font-bold text-white mt-0.5">India</div>
                </div>

                <div className="pt-2">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Primary Roles</div>
                  <div className="font-bold text-slate-200 mt-0.5 leading-snug">
                    Full-Stack Engineer, Minecraft Plugin Architect, Bot Developer
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Commission Status</div>
                  <div className="text-emerald-400 font-bold mt-0.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Open for Custom Projects</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM STATUS FOOTER (MATCHES SCREENSHOT 1) */}
      <div className="h-8 px-6 bg-[#0E121A] border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
        <span>Source: Admin Structured Content - Version 2026-10-25</span>
        <span>Synced 25/10/2026</span>
      </div>
    </div>
  );
}
