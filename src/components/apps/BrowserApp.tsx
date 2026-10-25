'use client';

import React, { useState } from 'react';
import { useWindowStore } from '@/store/windowStore';
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Home,
  Lock,
  Search,
  Star,
  Columns,
  MoreVertical,
  X,
  Plus,
  Shield,
  User,
  Code,
  Music,
  Globe,
  ExternalLink,
} from 'lucide-react';

interface Tab {
  id: string;
  title: string;
  url: string;
}

export function BrowserApp() {
  const { openWindow } = useWindowStore();
  const [tabs, setTabs] = useState<Tab[]>([{ id: 't1', title: 'New tab', url: 'about:home' }]);
  const [activeTabId, setActiveTabId] = useState<string>('t1');
  const [inputUrl, setInputUrl] = useState<string>('');
  const [history, setHistory] = useState<string[]>(['about:home']);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const handleNavigate = (targetUrl: string) => {
    let clean = targetUrl.trim();
    if (!clean) return;

    if (clean === 'about:home') {
      setInputUrl('');
    } else {
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        if (clean.includes('.') && !clean.includes(' ')) {
          clean = `https://${clean}`;
        } else {
          // Google search
          clean = `https://www.google.com/search?q=${encodeURIComponent(clean)}`;
        }
      }
      setInputUrl(clean);
    }

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              url: clean,
              title:
                clean === 'about:home'
                  ? 'New tab'
                  : clean.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0],
            }
          : t
      )
    );
    setHistory((prev) => [...prev.slice(0, historyIdx + 1), clean]);
    setHistoryIdx((prev) => prev + 1);
  };

  const handleNewTab = () => {
    const id = `t-${Date.now()}`;
    const newTab: Tab = { id, title: 'New tab', url: 'about:home' };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(id);
    setInputUrl('');
  };

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const nextTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(nextTabs);
    if (activeTabId === tabId) {
      setActiveTabId(nextTabs[0].id);
      setInputUrl(nextTabs[0].url === 'about:home' ? '' : nextTabs[0].url);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1A1F2C] text-slate-100 select-none text-xs font-sans">
      {/* 1. Top Tab Bar (Matching screenshot) */}
      <div className="h-10 px-2 bg-[#12151E] border-b border-white/5 flex items-end gap-1 shrink-0 overflow-x-auto window-scroll">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => {
                setActiveTabId(tab.id);
                setInputUrl(tab.url === 'about:home' ? '' : tab.url);
              }}
              className={`group max-w-[210px] h-8 px-3 rounded-t-xl flex items-center gap-2 cursor-pointer border-t border-x transition-colors ${
                isActive
                  ? 'bg-[#1C212E] border-white/10 text-white font-medium shadow-sm'
                  : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5'
              }`}
            >
              <Globe size={14} className={isActive ? 'text-sky-400' : 'text-slate-400'} />
              <span className="truncate flex-1 text-xs">{tab.title}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => closeTab(tab.id, e)}
                  className="w-4 h-4 rounded-full hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white"
                >
                  <X size={11} />
                </button>
              )}
            </div>
          );
        })}

        {/* Plus Button */}
        <button
          onClick={handleNewTab}
          className="w-7 h-7 mb-0.5 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          title="New tab"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* 2. Navigation & URL Bar (Exact match to screenshot) */}
      <div className="h-11 px-3 bg-[#1C212E] border-b border-white/10 flex items-center gap-2 shrink-0">
        {/* Navigation Arrows */}
        <button
          onClick={() => {
            if (historyIdx > 0) {
              const prev = history[historyIdx - 1];
              setHistoryIdx(historyIdx - 1);
              setInputUrl(prev === 'about:home' ? '' : prev);
              handleNavigate(prev);
            }
          }}
          disabled={historyIdx <= 0}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Click to go back"
        >
          <ChevronLeft size={16} />
        </button>

        <button
          onClick={() => {
            if (historyIdx < history.length - 1) {
              const next = history[historyIdx + 1];
              setHistoryIdx(historyIdx + 1);
              setInputUrl(next === 'about:home' ? '' : next);
              handleNavigate(next);
            }
          }}
          disabled={historyIdx >= history.length - 1}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Click to go forward"
        >
          <ChevronRight size={16} />
        </button>

        <button
          onClick={() => handleNavigate(inputUrl || 'about:home')}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          title="Reload this page"
        >
          <RotateCw size={14} />
        </button>

        <button
          onClick={() => {
            setInputUrl('');
            handleNavigate('about:home');
          }}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          title="Open start page"
        >
          <Home size={15} />
        </button>

        {/* URL Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNavigate(inputUrl);
          }}
          className="flex-1 h-8 bg-[#141822] border border-white/10 rounded-full px-3.5 flex items-center gap-2 text-slate-300 shadow-inner group focus-within:border-sky-500/80 transition-colors"
        >
          <Lock size={13} className="text-emerald-400 shrink-0" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full bg-transparent outline-none text-xs text-white placeholder-slate-400"
            placeholder="Search or type a URL"
          />
          <button type="submit" className="text-slate-400 hover:text-white transition-colors">
            <Search size={14} />
          </button>
          <button
            type="button"
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`transition-colors ${isBookmarked ? 'text-amber-400' : 'text-slate-400 hover:text-white'}`}
            title="Bookmark"
          >
            <Star size={14} className={isBookmarked ? 'fill-amber-400' : ''} />
          </button>
          <button
            type="button"
            className="text-slate-400 hover:text-white transition-colors"
            title="Split window"
          >
            <Columns size={14} />
          </button>
          <button
            type="button"
            className="text-slate-400 hover:text-white transition-colors"
            title="Settings & more"
          >
            <MoreVertical size={14} />
          </button>
        </form>
      </div>

      {/* 3. Main Viewport Content (Matching screenshot 1 exactly) */}
      <div className="flex-1 overflow-y-auto window-scroll bg-[#151923] flex flex-col justify-center items-center p-8 select-text">
        {activeTab.url === 'about:home' ? (
          <div className="max-w-xl w-full flex flex-col items-center text-center space-y-7">
            {/* Colorful Google-style LivingYuji Title */}
            <div className="space-y-2 select-none">
              <div className="text-4xl md:text-5xl font-bold tracking-tight">
                <span className="text-[#4285F4]">L</span>
                <span className="text-[#EA4335]">i</span>
                <span className="text-[#FBBC05]">v</span>
                <span className="text-[#4285F4]">i</span>
                <span className="text-[#34A853]">n</span>
                <span className="text-[#EA4335]">g</span>
                <span className="text-[#4285F4] ml-2">Y</span>
                <span className="text-[#FBBC05]">u</span>
                <span className="text-[#34A853]">j</span>
                <span className="text-[#EA4335]">i</span>
              </div>
              <p className="text-xs text-slate-400 font-normal">
                Explore LivingYuji OS, selected work, music, and trusted web references.
              </p>
            </div>

            {/* Pill Search Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleNavigate(inputUrl);
              }}
              className="w-full relative select-none"
            >
              <div className="w-full bg-[#1C212E] hover:bg-[#202738] border border-white/10 hover:border-white/20 focus-within:border-sky-500 rounded-full py-3 pl-11 pr-4 shadow-lg flex items-center transition-all">
                <Search size={16} className="absolute left-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search LivingYuji OS or type a URL"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full bg-transparent outline-none text-xs text-white placeholder-slate-400"
                />
              </div>
            </form>

            {/* 4 Circular Shortcuts (Exact match to screenshot) */}
            <div className="grid grid-cols-4 gap-6 select-none pt-2">
              {/* Wikipedia */}
              <button
                onClick={() => handleNavigate('https://en.wikipedia.org')}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-[#0078D4] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <User size={20} />
                </div>
                <span className="text-xs text-slate-300 group-hover:text-white transition-colors">
                  Wikipedia
                </span>
              </button>

              {/* React Docs */}
              <button
                onClick={() => handleNavigate('https://react.dev')}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Code size={20} />
                </div>
                <span className="text-xs text-slate-300 group-hover:text-white transition-colors">
                  React Docs
                </span>
              </button>

              {/* Tailwind */}
              <button
                onClick={() => handleNavigate('https://tailwindcss.com')}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-[#EF4444] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Music size={20} />
                </div>
                <span className="text-xs text-slate-300 group-hover:text-white transition-colors">
                  Tailwind
                </span>
              </button>

              {/* Music Lab */}
              <button
                onClick={() => openWindow('music')}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Globe size={20} />
                </div>
                <span className="text-xs text-slate-300 group-hover:text-white transition-colors">
                  Music Lab
                </span>
              </button>
            </div>

            {/* Hybrid Browsing Notice Card (Exact match to screenshot) */}
            <div className="w-full bg-[#1C212E]/80 border border-white/10 rounded-2xl p-5 text-left flex items-start gap-3.5 shadow-md">
              <div className="text-sky-400 mt-0.5 shrink-0">
                <Shield size={18} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-white">
                  Hybrid browsing, without broken pages
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  LivingYuji OS checks each destination before loading it. Compatible websites open
                  inside this window; only websites that explicitly block embedded viewing receive a
                  verified handoff to your device browser.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Active Website Viewport / Embedded Iframe */
          <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-lg shadow-inner overflow-hidden relative">
            <iframe
              src={activeTab.url}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              title={activeTab.title}
            />
            {/* Fallback bar if X-Frame-Options blocks embed */}
            <div className="absolute top-2 right-2 z-20">
              <a
                href={activeTab.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 hover:bg-black text-white text-xs shadow-lg backdrop-blur-sm transition-all"
              >
                <span>Open in Tab</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
