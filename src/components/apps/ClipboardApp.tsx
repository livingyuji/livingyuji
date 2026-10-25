'use client';

import React, { useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Clipboard as ClipboardIcon,
  Copy,
  Pin,
  Trash2,
  Search,
  Check,
  ShieldAlert,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export interface ClipboardItem {
  id: string;
  text: string;
  pinned: boolean;
  copiedAt: number;
}

interface ClipboardStore {
  items: ClipboardItem[];
  addItem: (text: string) => void;
  togglePin: (id: string) => void;
  deleteItem: (id: string) => void;
  clearUnpinned: () => void;
}

const DEFAULT_CLIPBOARD_ITEMS: ClipboardItem[] = [
  {
    id: 'clip-1',
    text: 'https://github.com/livingyuji/livingyuji-os',
    pinned: true,
    copiedAt: Date.now() - 3600000,
  },
  {
    id: 'clip-2',
    text: 'git clone https://github.com/livingyuji/livingyuji-os.git',
    pinned: true,
    copiedAt: Date.now() - 7200000,
  },
  {
    id: 'clip-3',
    text: 'arcane.spells.cast.lightning',
    pinned: false,
    copiedAt: Date.now() - 1800000,
  },
  {
    id: 'clip-4',
    text: 'LivingYuji#0001',
    pinned: false,
    copiedAt: Date.now() - 900000,
  },
];

export const useClipboardStore = create<ClipboardStore>()(
  persist(
    (set) => ({
      items: DEFAULT_CLIPBOARD_ITEMS,
      addItem: (text) => {
        if (!text.trim()) return;
        set((state) => {
          // Remove duplicate if already present
          const filtered = state.items.filter((i) => i.text !== text);
          const newItem: ClipboardItem = {
            id: `clip-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            text,
            pinned: false,
            copiedAt: Date.now(),
          };
          return { items: [newItem, ...filtered].slice(0, 50) };
        });
      },
      togglePin: (id) => {
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, pinned: !i.pinned } : i)),
        }));
      },
      deleteItem: (id) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
      },
      clearUnpinned: () => {
        set((state) => ({ items: state.items.filter((i) => i.pinned) }));
      },
    }),
    {
      name: 'lyos-clipboard-storage',
    }
  )
);

export function ClipboardApp() {
  const { items, addItem, togglePin, deleteItem, clearUnpinned } = useClipboardStore();

  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [permissionNotice, setPermissionNotice] = useState<string | null>(null);

  const filteredItems = items
    .filter((i) => !search.trim() || (i.text || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (b.copiedAt || 0) - (a.copiedAt || 0);
    });

  const handleCopy = async (item: ClipboardItem) => {
    try {
      await navigator.clipboard.writeText(item.text);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.warn('Clipboard write error:', err);
    }
  };

  const handleImportSystemClipboard = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        setPermissionNotice('Browser clipboard read API is unavailable or restricted in this context.');
        return;
      }
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        addItem(text);
        setPermissionNotice('Successfully captured text from your system clipboard!');
        setTimeout(() => setPermissionNotice(null), 3500);
      } else {
        setPermissionNotice('System clipboard is currently empty.');
        setTimeout(() => setPermissionNotice(null), 3000);
      }
    } catch (err: any) {
      setPermissionNotice(
        'Clipboard access was denied by browser permissions. Click & allow clipboard access when prompted.'
      );
      setTimeout(() => setPermissionNotice(null), 5000);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#11141C] text-slate-200 select-none font-sans text-xs">
      {/* Top Action Bar */}
      <div className="h-10 px-4 bg-[#161B26] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <ClipboardIcon size={14} className="text-sky-400" />
          <span className="font-semibold text-white">Clipboard History</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleImportSystemClipboard}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 text-[11px] font-medium border border-sky-500/30 transition-all active:scale-95"
            title="Import text from operating system clipboard"
          >
            <Copy size={12} />
            <span>Paste from OS</span>
          </button>

          <button
            onClick={clearUnpinned}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-colors"
            title="Clear unpinned items"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Permission Notice Banner */}
      {permissionNotice && (
        <div className="px-4 py-2 bg-sky-500/10 border-b border-sky-500/20 text-[11px] text-sky-300 flex items-center gap-2">
          <ShieldAlert size={13} className="shrink-0 text-sky-400" />
          <span>{permissionNotice}</span>
        </div>
      )}

      {/* Search Header */}
      <div className="p-3 bg-[#131722] border-b border-white/5">
        <div className="relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search clipboard snippets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0E1118] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* Clipboard Snippets List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 window-scroll bg-[#0F131C]">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-3 bg-[#141824] border border-white/5 hover:border-white/15 rounded-xl flex items-start justify-between gap-3 group transition-all"
          >
            <div className="flex-1 min-w-0">
              <pre className="font-mono text-xs text-slate-200 whitespace-pre-wrap break-words select-text leading-relaxed">
                {item.text}
              </pre>
              <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                <span>{new Date(item.copiedAt).toLocaleTimeString()}</span>
                {item.pinned && (
                  <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                    <Pin size={10} />
                    <span>Pinned</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleCopy(item)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 text-[10px] font-medium transition-colors"
                title="Copy to clipboard"
              >
                {copiedId === item.id ? (
                  <>
                    <Check size={11} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={11} />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={() => togglePin(item.id)}
                className={`p-1 rounded-lg border transition-colors ${
                  item.pinned
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-white/5 text-slate-400 hover:text-white border-white/5'
                }`}
                title={item.pinned ? 'Unpin snippet' : 'Pin snippet'}
              >
                <Pin size={12} />
              </button>

              <button
                onClick={() => deleteItem(item.id)}
                className="p-1 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/5 transition-colors"
                title="Delete snippet"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="py-16 text-center text-slate-400 text-xs">
            No clipboard snippets found.
          </div>
        )}
      </div>

      {/* Footer Info Notice */}
      <div className="h-7 px-4 bg-[#121620] border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
        <span>Sandboxed Browser Clipboard Security</span>
        <span>{items.length} snippets stored</span>
      </div>
    </div>
  );
}
