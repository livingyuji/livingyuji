'use client';

import React, { useState, useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Clock,
  MapPin,
  Tag,
  Check,
  List,
  Grid,
} from 'lucide-react';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  color: string;
  category: string;
  notes?: string;
}

interface CalendarStore {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  deleteEvent: (id: string) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
}

const DEFAULT_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'ArcaneArsenal 2.0 Plugin Launch',
    date: new Date().toISOString().split('T')[0],
    startTime: '16:00',
    endTime: '18:00',
    color: '#0284C7',
    category: 'Release',
    notes: 'Publish compiled jar binaries and documentation to store.',
  },
  {
    id: 'evt-2',
    title: 'LivingYuji Community Discord Stage',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    startTime: '19:00',
    endTime: '20:30',
    color: '#8B5CF6',
    category: 'Community',
    notes: 'Q&A session covering Paper 1.21.3 server optimizations.',
  },
  {
    id: 'evt-3',
    title: 'Server Infrastructure Maintenance',
    date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    startTime: '04:00',
    endTime: '05:30',
    color: '#F59E0B',
    category: 'Operations',
    notes: 'Apply OS patches and database replication backups.',
  },
];

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set) => ({
      events: DEFAULT_EVENTS,
      addEvent: (event) => {
        const id = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        set((state) => ({ events: [...state.events, { ...event, id }] }));
      },
      deleteEvent: (id) => {
        set((state) => ({ events: state.events.filter((e) => e.id !== id) }));
      },
      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        }));
      },
    }),
    {
      name: 'lyos-calendar-storage',
    }
  )
);

export function CalendarApp() {
  const { events, addEvent, deleteEvent } = useCalendarStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Event Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(selectedDateStr);
  const [newStartTime, setNewStartTime] = useState('10:00');
  const [newEndTime, setNewEndTime] = useState('11:00');
  const [newCategory, setNewCategory] = useState('Development');
  const [newColor, setNewColor] = useState('#0284C7');
  const [newNotes, setNewNotes] = useState('');

  // Month navigation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Prev month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = month === 0 ? 12 : month;
      const y = month === 0 ? year - 1 : year;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: true });
    }

    // Next month padding to fill 35 or 42 cells
    const remaining = 35 - days.length > 0 ? 35 - days.length : 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = month + 2 > 12 ? 1 : month + 2;
      const y = month + 2 > 12 ? year + 1 : year;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: false });
    }

    return days;
  }, [year, month]);

  const selectedDateEvents = useMemo(() => {
    return events.filter((e) => e.date === selectedDateStr);
  }, [events, selectedDateStr]);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addEvent({
      title: newTitle.trim(),
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      category: newCategory,
      color: newColor,
      notes: newNotes,
    });
    setNewTitle('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const todayDateStr = new Date().toISOString().split('T')[0];

  return (
    <div className="h-full flex flex-col bg-[#11141C] text-slate-200 select-none font-sans text-xs">
      {/* Top Header Bar */}
      <div className="h-11 px-4 bg-[#161B26] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <CalendarIcon size={16} className="text-sky-400" />
            <span className="font-bold text-sm text-white">
              {monthNames[month]} {year}
            </span>
          </div>

          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={prevMonth}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={goToToday}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-medium text-slate-300 hover:text-white transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center gap-1 bg-[#121622] p-0.5 rounded-lg border border-white/5">
            <button
              onClick={() => setViewMode('month')}
              className={`p-1 rounded transition-colors ${
                viewMode === 'month' ? 'bg-[#0078D4] text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Month Grid View"
            >
              <Grid size={13} />
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`p-1 rounded transition-colors ${
                viewMode === 'agenda' ? 'bg-[#0078D4] text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Agenda List View"
            >
              <List size={13} />
            </button>
          </div>

          <button
            onClick={() => {
              setNewDate(selectedDateStr);
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-medium text-xs transition-all shadow-sm"
          >
            <Plus size={13} />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Calendar View Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0F131C] p-3">
          {viewMode === 'month' ? (
            <div className="flex-1 flex flex-col border border-white/10 rounded-xl overflow-hidden bg-[#131722]">
              {/* Day Headers (Sun - Sat) */}
              <div className="grid grid-cols-7 border-b border-white/10 bg-[#161B26] text-center py-2 text-[11px] font-semibold text-slate-400">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Day Cells Grid */}
              <div className="flex-1 grid grid-cols-7 grid-rows-5 divide-x divide-y divide-white/5 overflow-hidden">
                {calendarDays.slice(0, 35).map((d, idx) => {
                  const dayEvents = events.filter((e) => e.date === d.dateStr);
                  const isToday = d.dateStr === todayDateStr;
                  const isSelected = d.dateStr === selectedDateStr;

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDateStr(d.dateStr)}
                      className={`p-1.5 flex flex-col justify-between cursor-pointer transition-colors overflow-hidden ${
                        isSelected
                          ? 'bg-sky-500/15 ring-1 ring-sky-500/50'
                          : 'hover:bg-white/[0.03]'
                      } ${!d.isCurrentMonth ? 'opacity-30' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full ${
                            isToday ? 'bg-sky-500 text-white' : 'text-slate-200'
                          }`}
                        >
                          {d.dayNum}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className="text-[9px] bg-white/10 px-1 rounded text-slate-300">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 mt-1 overflow-y-auto no-scrollbar max-h-14">
                        {dayEvents.map((evt) => (
                          <div
                            key={evt.id}
                            className="px-1.5 py-0.5 rounded text-[10px] truncate text-white font-medium"
                            style={{ backgroundColor: `${evt.color}33`, borderLeft: `2px solid ${evt.color}` }}
                            title={`${evt.startTime} - ${evt.title}`}
                          >
                            {evt.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Agenda List View */
            <div className="flex-1 overflow-y-auto space-y-2.5 p-2 window-scroll">
              {events
                .slice()
                .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
                .map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 bg-[#131722] border border-white/5 rounded-xl flex items-center justify-between hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-10 rounded-full shrink-0"
                        style={{ backgroundColor: evt.color }}
                      />
                      <div>
                        <h4 className="font-semibold text-white text-xs">{evt.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <CalendarIcon size={11} />
                            <span>{evt.date}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            <span>{evt.startTime} - {evt.endTime}</span>
                          </span>
                          <span className="px-1.5 py-0.2 bg-white/5 rounded text-[10px] text-sky-400">
                            #{evt.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteEvent(evt.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-white/5 transition-colors"
                      title="Delete event"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Right Sidebar: Selected Day Details */}
        <div className="w-64 bg-[#141822] border-r border-white/10 p-4 flex flex-col gap-3 shrink-0">
          <div className="pb-3 border-b border-white/5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Selected Date
            </span>
            <h3 className="font-bold text-sm text-white">{selectedDateStr}</h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 window-scroll">
            {selectedDateEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-xs">{evt.title}</span>
                  <button
                    onClick={() => deleteEvent(evt.id)}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <Clock size={11} />
                  <span>{evt.startTime} - {evt.endTime}</span>
                </div>
                {evt.notes && (
                  <p className="text-[10px] text-slate-400 leading-snug pt-1 border-t border-white/5">
                    {evt.notes}
                  </p>
                )}
              </div>
            ))}

            {selectedDateEvents.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs">
                No events on this day.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateEvent}
            className="w-96 bg-[#1A1F2C] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-3 animate-in zoom-in-95 duration-100"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-bold text-white text-sm">Create New Event</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Event Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Plugin Release"
                className="w-full bg-[#121620] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-[#121620] border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-[#121620] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-sky-500"
                >
                  <option value="Development">Development</option>
                  <option value="Minecraft">Minecraft</option>
                  <option value="Release">Release</option>
                  <option value="Community">Community</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Start Time</label>
                <input
                  type="time"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="w-full bg-[#121620] border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">End Time</label>
                <input
                  type="time"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="w-full bg-[#121620] border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Notes</label>
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Additional event details..."
                rows={2}
                className="w-full bg-[#121620] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-sky-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs shadow-md"
              >
                Save Event
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
