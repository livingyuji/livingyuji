'use client';

import React, { useState } from 'react';

interface Article {
  id: string;
  title: string;
  date: string;
  readTime: string;
  category: string;
  summary: string;
  content: string;
}

const ARTICLES: Article[] = [
  {
    id: 'mc-opt-121',
    title: 'Optimizing Minecraft Paper 1.21 Server Tick Loops',
    date: 'Oct 20, 2026',
    readTime: '6 min read',
    category: 'Minecraft Architecture',
    summary: 'Deep dive into asynchronous chunk loading, entity tracking bottlenecks, and custom event dispatching in high-population Paper servers.',
    content: `When scaling Paper/Purpur Minecraft servers to hundreds of simultaneous players, tick loop optimization becomes the primary constraint.\n\n1. Asynchronous Chunk Handling\nUsing Folia or optimizing Paper's thread pool ensures world ticks do not block main game loops.\n\n2. Entity Tracking Optimization\nAdjusting entity-activation-range and tracking-ranges drastically reduces unneeded network packets sent to clients.\n\n3. Event Optimization in Java Plugins\nAvoid synchronous I/O or heavy database calls inside PlayerMoveEvent or BlockBreakEvent. Always delegate persistence to dedicated worker threads.`,
  },
  {
    id: 'discord-bots-cluster',
    title: 'Scaling Discord Bots with Microservices and Sharding',
    date: 'Oct 14, 2026',
    readTime: '5 min read',
    category: 'Discord Development',
    summary: 'Best practices for Discord.js bots managing thousands of Discord guilds with Redis caching and cluster workers.',
    content: `Discord bots that handle tickets, moderation, and giveaways must remain responsive under heavy gateway traffic.\n\n1. Distributed Sharding\nRun Discord client shards across multiple worker processes with IPC message routing.\n\n2. Redis Cache Layer\nCache guild roles and user permissions to avoid hitting Discord rate limits.\n\n3. Command Interactivity\nUse Discord modal dialogs and select menus for seamless interactive workflows without chat spam.`,
  },
  {
    id: 'web-os-engineering',
    title: 'Building a Virtual Operating System in Modern React',
    date: 'Oct 02, 2026',
    readTime: '8 min read',
    category: 'Frontend Engineering',
    summary: 'How LivingYuji OS implements virtual window management, custom drag constraints, and a virtual filesystem in Next.js.',
    content: `Simulating a desktop operating system inside the browser requires careful state management and viewport isolation.\n\n- Window Manager: Z-index stacking orders, boundary clamps, and active window states.\n- Virtual File System: Structured hierarchical tree with support for virtual C: and D: drives, cut/copy/paste, and Recycle Bin.\n- Performance: Hardware-accelerated transitions and clean event teardown.`,
  },
];

export function BlogApp() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  if (selectedArticle) {
    return (
      <div className="h-full flex flex-col bg-[#141822] text-slate-100 text-xs">
        <div className="h-10 px-4 bg-[#1B202D] border-b border-white/10 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setSelectedArticle(null)}
            className="text-xs text-[#38BDF8] hover:underline flex items-center gap-1 font-medium"
          >
            ← Back to Articles
          </button>
          <span className="text-slate-500">/</span>
          <span className="text-slate-300 truncate">{selectedArticle.title}</span>
        </div>

        <div className="flex-1 p-6 overflow-y-auto window-scroll bg-[#12151F] select-text">
          <div className="max-w-2xl mx-auto space-y-4">
            <div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#38BDF8]/20 text-[#38BDF8] font-semibold">
                {selectedArticle.category}
              </span>
              <h1 className="text-xl font-bold text-white mt-2 leading-tight">{selectedArticle.title}</h1>
              <div className="text-[11px] text-slate-400 mt-1">
                {selectedArticle.date} • {selectedArticle.readTime}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-slate-300 leading-relaxed space-y-3 whitespace-pre-line text-[13px]">
              {selectedArticle.content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#141822] text-slate-100 select-none text-xs">
      <div className="h-11 px-5 bg-[#1B202D] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">📝</span>
          <h1 className="font-semibold text-white text-sm">LivingYuji Dev Blog</h1>
        </div>
        <span className="text-[11px] text-slate-400">Technical insights & devlogs</span>
      </div>

      <div className="flex-1 p-6 overflow-y-auto window-scroll bg-[#12151F]">
        <div className="max-w-2xl mx-auto space-y-3">
          {ARTICLES.map((art) => (
            <div
              key={art.id}
              onClick={() => setSelectedArticle(art)}
              className="p-5 bg-[#1B212E] hover:bg-[#202738] border border-white/5 rounded-2xl cursor-default transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] font-medium">
                  {art.category}
                </span>
                <span className="text-[10px] text-slate-400">{art.date}</span>
              </div>
              <h2 className="text-sm font-bold text-white group-hover:text-[#38BDF8] transition-colors">
                {art.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                {art.summary}
              </p>
              <div className="mt-3 text-[11px] text-slate-500 font-medium">
                {art.readTime} →
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
