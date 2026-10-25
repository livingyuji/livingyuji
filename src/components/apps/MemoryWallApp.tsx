'use client';

import React, { useState, useEffect } from 'react';

interface Note {
  id: string;
  author: string;
  date: string;
  emoji: string;
  message: string;
}

const DEFAULT_NOTES: Note[] = [
  { id: 'n1', author: 'Alex_Dev', date: 'Oct 24, 2026', emoji: '🔥', message: 'The ArcaneArsenal plugin runs silky smooth on our server. Super clean work!' },
  { id: 'n2', author: 'Elena R.', date: 'Oct 22, 2026', emoji: '✨', message: 'Incredible desktop OS portfolio! The attention to detail and Windows feel is awesome.' },
  { id: 'n3', author: 'Kaelen', date: 'Oct 19, 2026', emoji: '🚀', message: 'VantaCombat hit registration is leagues ahead of standard spigot mechanics. 10/10.' },
  { id: 'n4', author: 'SyntaxError', date: 'Oct 15, 2026', emoji: '💡', message: 'Love the Paint and Music Lab apps inside the browser. Keep inspiring!' },
];

export function MemoryWallApp() {
  const [notes, setNotes] = useState<Note[]>(DEFAULT_NOTES);
  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💬');

  useEffect(() => {
    const saved = localStorage.getItem('lyos-memory-wall');
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !message.trim()) return;

    const newNote: Note = {
      id: `n-${Date.now()}`,
      author: author.trim(),
      date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      emoji: selectedEmoji,
      message: message.trim(),
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    localStorage.setItem('lyos-memory-wall', JSON.stringify(updated));
    setAuthor('');
    setMessage('');
  };

  return (
    <div className="h-full flex flex-col bg-[#141822] text-slate-100 select-none text-xs">
      {/* Top Header */}
      <div className="h-11 px-5 bg-[#1B202D] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">💌</span>
          <h1 className="font-semibold text-white text-sm">Memory Wall</h1>
        </div>
        <span className="text-[11px] text-slate-400">Visitor thoughts & shoutouts</span>
      </div>

      {/* Main Body */}
      <div className="flex-1 p-6 overflow-y-auto window-scroll bg-[#12151F] space-y-6">
        {/* Post Form */}
        <div className="max-w-xl mx-auto bg-[#1A202D] p-4 rounded-2xl border border-white/10 shadow-lg">
          <h2 className="text-xs font-semibold text-white mb-2">Leave a message on the wall</h2>
          <form onSubmit={handlePost} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Your name or handle"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="flex-1 bg-[#121620] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#38BDF8]"
                maxLength={40}
                required
              />
              <div className="flex items-center gap-1 bg-[#121620] px-2 rounded-xl border border-white/10">
                {['🔥', '✨', '🚀', '💬', '❤️'].map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setSelectedEmoji(em)}
                    className={`text-base p-1 rounded hover:scale-125 transition-transform ${
                      selectedEmoji === em ? 'bg-white/20' : ''
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              placeholder="Write your note, feedback or friendly message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-[#121620] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-[#38BDF8] resize-none"
              rows={3}
              maxLength={240}
              required
            />

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500">{message.length}/240</span>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#0078D4] hover:bg-[#0086F0] text-white rounded-xl font-medium transition-colors"
              >
                Post Note
              </button>
            </div>
          </form>
        </div>

        {/* Notes Grid */}
        <div className="max-w-xl mx-auto grid grid-cols-2 gap-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-4 bg-[#1B212E] border border-white/5 rounded-2xl flex flex-col justify-between shadow-sm select-text"
            >
              <p className="text-xs text-slate-200 leading-relaxed italic">
                &ldquo;{note.message}&rdquo;
              </p>
              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 font-medium text-slate-300">
                  <span>{note.emoji}</span>
                  <span>{note.author}</span>
                </div>
                <span className="text-slate-500 text-[10px]">{note.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
