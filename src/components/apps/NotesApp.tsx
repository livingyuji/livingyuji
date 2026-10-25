'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  FileText,
  Plus,
  Trash2,
  Pin,
  Search,
  Tag,
  Check,
  Eye,
  Edit3,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

interface NotesStore {
  notes: NoteItem[];
  activeNoteId: string | null;
  addNote: (title?: string, content?: string) => string;
  updateNote: (id: string, updates: Partial<Pick<NoteItem, 'title' | 'content' | 'pinned' | 'tags'>>) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;
  setActiveNoteId: (id: string | null) => void;
}

const DEFAULT_NOTES: NoteItem[] = [
  {
    id: 'note-welcome',
    title: 'Welcome to LivingYuji Notes',
    content: `# Welcome to LivingYuji OS Notes! 📝\n\nThis application is your personal productivity workspace with full **Markdown** support, tag categorization, auto-saving, and pin management.\n\n### Key Features:\n- **Markdown Preview:** Click the *Preview* toggle in the top-right corner to see formatted headings, bold text, lists, and code blocks.\n- **Pin Important Notes:** Click the pin icon to keep priority notes anchored at the top.\n- **Tags & Search:** Filter your notes by tag or search across both titles and contents instantly.\n- **Local Persistence:** Everything is automatically saved offline to local storage.\n\n\`\`\`javascript\n// Happy coding!\nconsole.log("LivingYuji OS is ready.");\n\`\`\``,
    pinned: true,
    tags: ['Welcome', 'Guide'],
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: 'note-minecraft-todo',
    title: 'ArcaneArsenal 2.0 Roadmap',
    content: `## ArcaneArsenal 2.0 Plugin Notes\n\n- [x] Refactor spell cooldown system using Paper API\n- [x] Implement particle emitter thread pooling\n- [ ] Add sound dampening for stealth spells\n- [ ] Validate Purpur 1.21.3 packet handling\n- [ ] Update README with permission nodes\n\n*Target release date: November 2026.*`,
    pinned: false,
    tags: ['Minecraft', 'Plugins'],
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 1800000,
  },
];

export const useNotesStore = create<NotesStore>()(
  persist(
    (set, get) => ({
      notes: DEFAULT_NOTES,
      activeNoteId: 'note-welcome',

      addNote: (title = 'Untitled Note', content = '') => {
        const id = `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const newNote: NoteItem = {
          id,
          title,
          content,
          pinned: false,
          tags: ['General'],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          notes: [newNote, ...state.notes],
          activeNoteId: id,
        }));
        return id;
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, ...updates, updatedAt: Date.now() } : note
          ),
        }));
      },

      deleteNote: (id) => {
        set((state) => {
          const filtered = state.notes.filter((n) => n.id !== id);
          const nextActive = state.activeNoteId === id ? (filtered[0]?.id || null) : state.activeNoteId;
          return { notes: filtered, activeNoteId: nextActive };
        });
      },

      togglePin: (id) => {
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
        }));
      },

      setActiveNoteId: (id) => {
        set({ activeNoteId: id });
      },
    }),
    {
      name: 'lyos-notes-storage',
    }
  )
);

// Lightweight Markdown Renderer (Headers, Bold, Italic, Code, Lists, Blockquotes)
function SimpleMarkdownViewer({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <div className="space-y-2 text-slate-200 text-xs leading-relaxed select-text font-sans">
      {lines.map((line, idx) => {
        if (line.startsWith('# ')) {
          return <h1 key={idx} className="text-lg font-bold text-sky-400 mt-4 mb-2 pb-1 border-b border-white/10">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={idx} className="text-base font-semibold text-slate-100 mt-3 mb-1.5">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={idx} className="text-sm font-semibold text-sky-300 mt-2 mb-1">{line.slice(4)}</h3>;
        }
        if (line.startsWith('> ')) {
          return <blockquote key={idx} className="border-l-2 border-sky-500/50 pl-3 italic text-slate-300 my-1">{line.slice(2)}</blockquote>;
        }
        if (line.startsWith('- [x] ')) {
          return (
            <div key={idx} className="flex items-center gap-2 text-emerald-400 line-through opacity-80 my-0.5">
              <Check size={12} className="shrink-0" />
              <span>{line.slice(6)}</span>
            </div>
          );
        }
        if (line.startsWith('- [ ] ')) {
          return (
            <div key={idx} className="flex items-center gap-2 text-slate-300 my-0.5">
              <div className="w-3 h-3 border border-slate-500 rounded-sm shrink-0" />
              <span>{line.slice(6)}</span>
            </div>
          );
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 text-slate-300 my-0.5 ml-2">
              <span className="text-sky-400">•</span>
              <span>{line.slice(2)}</span>
            </div>
          );
        }
        if (line.startsWith('```')) {
          return (
            <div key={idx} className="font-mono text-[11px] bg-[#0F131C] px-3 py-1 text-sky-300 rounded-md border border-white/5 my-1">
              {line}
            </div>
          );
        }
        if (line.trim() === '') {
          return <div key={idx} className="h-2" />;
        }
        return <p key={idx} className="my-1">{line}</p>;
      })}
    </div>
  );
}

export function NotesApp() {
  const { notes, activeNoteId, addNote, updateNote, deleteNote, togglePin, setActiveNoteId } =
    useNotesStore();

  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  // All distinct tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => n.tags?.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [notes]);

  // Filtered notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => {
        const matchesSearch =
          !search.trim() ||
          n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.content.toLowerCase().includes(search.toLowerCase());
        const matchesTag = !selectedTag || n.tags?.includes(selectedTag);
        return matchesSearch && matchesTag;
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.updatedAt - a.updatedAt;
      });
  }, [notes, search, selectedTag]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeNote) return;
    setSaveStatus('saving');
    updateNote(activeNote.id, { title: e.target.value });
    setTimeout(() => setSaveStatus('saved'), 400);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!activeNote) return;
    setSaveStatus('saving');
    updateNote(activeNote.id, { content: e.target.value });
    setTimeout(() => setSaveStatus('saved'), 400);
  };

  const handleAddTag = () => {
    if (!activeNote || !newTagInput.trim()) return;
    const tag = newTagInput.trim();
    if (!activeNote.tags.includes(tag)) {
      updateNote(activeNote.id, { tags: [...activeNote.tags, tag] });
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!activeNote) return;
    updateNote(activeNote.id, { tags: activeNote.tags.filter((t) => t !== tagToRemove) });
  };

  const wordCount = useMemo(() => {
    if (!activeNote?.content) return 0;
    return activeNote.content.trim().split(/\s+/).filter(Boolean).length;
  }, [activeNote?.content]);

  return (
    <div className="h-full flex flex-col bg-[#11141C] text-slate-200 select-none font-sans text-xs">
      {/* Top Application Toolbar */}
      <div className="h-10 px-4 bg-[#161B26] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => addNote()}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 font-medium transition-colors border border-sky-500/30 active:scale-95"
            title="Create new note"
          >
            <Plus size={13} />
            <span>New Note</span>
          </button>

          {activeNote && (
            <button
              onClick={() => togglePin(activeNote.id)}
              className={`p-1.5 rounded-lg border transition-colors ${
                activeNote.pinned
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-white/5 text-slate-400 hover:text-white border-white/5'
              }`}
              title={activeNote.pinned ? 'Unpin note' : 'Pin note to top'}
            >
              <Pin size={13} />
            </button>
          )}

          {activeNote && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/5 transition-colors"
              title="Delete current note"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {activeNote && (
            <div className="flex items-center gap-1 bg-[#121622] p-0.5 rounded-lg border border-white/5">
              <button
                onClick={() => setIsPreview(false)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  !isPreview ? 'bg-[#0078D4] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Edit3 size={11} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setIsPreview(true)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  isPreview ? 'bg-[#0078D4] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye size={11} />
                <span>Preview</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pl-2 border-l border-white/10">
            {saveStatus === 'saved' ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <Check size={11} />
                <span>Saved</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-sky-400 animate-pulse">
                <Clock size={11} />
                <span>Saving...</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Split Body: Sidebar & Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Search, Tag Filters, Notes List) */}
        <div className="w-64 bg-[#141822] border-r border-white/10 flex flex-col shrink-0 overflow-hidden">
          {/* Search Box */}
          <div className="p-3 border-b border-white/5">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0E1118] border border-white/10 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-400 outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          </div>

          {/* Tag Quick Filters */}
          {allTags.length > 0 && (
            <div className="px-3 py-2 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 transition-colors ${
                  selectedTag === null ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              {allTags.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 transition-colors ${
                    selectedTag === t ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  #{t}
                </button>
              ))}
            </div>
          )}

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 window-scroll">
            {filteredNotes.map((note) => {
              const isActive = note.id === activeNote?.id;
              return (
                <div
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all border ${
                    isActive
                      ? 'bg-sky-500/15 border-sky-500/40 text-white shadow-sm'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold truncate text-xs text-white flex-1 pr-1">
                      {note.title || 'Untitled Note'}
                    </span>
                    {note.pinned && <Pin size={11} className="text-amber-400 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">
                    {note.content ? note.content.replace(/[#*`_]/g, '') : 'No content'}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5 text-[9px] text-slate-400">
                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                    {note.tags?.[0] && (
                      <span className="px-1.5 py-0.2 bg-white/5 rounded text-sky-400">
                        #{note.tags[0]}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredNotes.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs">
                No notes found.
              </div>
            )}
          </div>
        </div>

        {/* Right Editor Area */}
        {activeNote ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0F131C]">
            {/* Title & Tags Header */}
            <div className="p-4 border-b border-white/5 bg-[#121620] space-y-2.5 shrink-0">
              <input
                type="text"
                value={activeNote.title}
                onChange={handleTitleChange}
                placeholder="Note Title..."
                className="w-full bg-transparent text-base font-bold text-white outline-none placeholder-slate-400"
              />

              {/* Tags Editor */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {activeNote.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px]"
                  >
                    <span>#{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-400 transition-colors ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="+ Add tag..."
                    className="bg-[#181D29] border border-white/10 rounded-full px-2.5 py-0.5 text-[10px] text-white placeholder-slate-400 outline-none focus:border-sky-500 w-24"
                  />
                </div>
              </div>
            </div>

            {/* Content Body: Markdown Editor or Preview */}
            <div className="flex-1 overflow-y-auto p-5 window-scroll">
              {isPreview ? (
                <SimpleMarkdownViewer content={activeNote.content} />
              ) : (
                <textarea
                  value={activeNote.content}
                  onChange={handleContentChange}
                  placeholder="Type your notes in Markdown here..."
                  className="w-full h-full bg-transparent resize-none outline-none font-mono text-xs text-slate-200 leading-relaxed placeholder-slate-400 select-text"
                />
              )}
            </div>

            {/* Bottom Status Bar */}
            <div className="h-7 px-4 bg-[#121620] border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
              <div className="flex items-center gap-3">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{activeNote.content?.length || 0} characters</span>
              </div>
              <div>
                <span>Last modified: {new Date(activeNote.updatedAt).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
            <FileText size={32} className="opacity-40" />
            <span>Select or create a note to begin.</span>
          </div>
        )}
      </div>

      {/* Confirmation Modal on Delete */}
      {showDeleteConfirm && activeNote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-80 bg-[#1A1F2C] border border-white/10 rounded-2xl p-5 shadow-2xl text-center space-y-3 animate-in zoom-in-95 duration-100">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 size={18} />
            </div>
            <h3 className="font-bold text-white text-sm">Delete Note?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to delete &ldquo;{activeNote.title}&rdquo;? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteNote(activeNote.id);
                  setShowDeleteConfirm(false);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors shadow-lg shadow-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
