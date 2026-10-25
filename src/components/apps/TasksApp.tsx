'use client';

import React, { useState, useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Tag,
  Filter,
  Layers,
  Clock,
  Sparkles,
} from 'lucide-react';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  priority: TaskPriority;
  category: string;
  dueDate?: string; // YYYY-MM-DD
  createdAt: number;
  completedAt?: number;
}

interface TasksStore {
  tasks: TaskItem[];
  addTask: (title: string, priority?: TaskPriority, category?: string, dueDate?: string) => void;
  toggleComplete: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<TaskItem>) => void;
}

const DEFAULT_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Release ArcaneArsenal 2.0 on Minecraft Store',
    completed: false,
    priority: 'urgent',
    category: 'Minecraft',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'task-2',
    title: 'Audit Supabase Row Level Security policies',
    completed: true,
    priority: 'high',
    category: 'Security',
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: Date.now() - 86400000,
    completedAt: Date.now() - 1800000,
  },
  {
    id: 'task-3',
    title: 'Implement VantaCombat custom damage modifiers',
    completed: false,
    priority: 'medium',
    category: 'Development',
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    createdAt: Date.now() - 7200000,
  },
  {
    id: 'task-4',
    title: 'Update Discord bot slash command documentation',
    completed: false,
    priority: 'low',
    category: 'Documentation',
    createdAt: Date.now() - 86400000 * 2,
  },
];

export const useTasksStore = create<TasksStore>()(
  persist(
    (set, get) => ({
      tasks: DEFAULT_TASKS,

      addTask: (title, priority = 'medium', category = 'Development', dueDate) => {
        const newTask: TaskItem = {
          id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: title.trim(),
          completed: false,
          priority,
          category,
          dueDate,
          createdAt: Date.now(),
        };
        set((state) => ({ tasks: [newTask, ...state.tasks] }));
      },

      toggleComplete: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  completed: !t.completed,
                  completedAt: !t.completed ? Date.now() : undefined,
                }
              : t
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },
    }),
    {
      name: 'lyos-tasks-storage',
    }
  )
);

type FilterView = 'all' | 'today' | 'upcoming' | 'completed';

export function TasksApp() {
  const { tasks, addTask, toggleComplete, deleteTask } = useTasksStore();

  const [activeFilter, setActiveFilter] = useState<FilterView>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newCategory, setNewCategory] = useState('Development');
  const [newDueDate, setNewDueDate] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Distinct Categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => t.category && set.add(t.category));
    return Array.from(set);
  }, [tasks]);

  // Counts for filters
  const counts = useMemo(() => {
    return {
      all: tasks.filter((t) => !t.completed).length,
      today: tasks.filter((t) => !t.completed && t.dueDate === todayStr).length,
      upcoming: tasks.filter((t) => !t.completed && t.dueDate && t.dueDate > todayStr).length,
      completed: tasks.filter((t) => t.completed).length,
    };
  }, [tasks, todayStr]);

  // Filtered task items
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Category filter
      if (selectedCategory && t.category !== selectedCategory) return false;

      // View filter
      if (activeFilter === 'completed') return t.completed;
      if (t.completed && activeFilter !== 'all') return false;

      if (activeFilter === 'today') return t.dueDate === todayStr;
      if (activeFilter === 'upcoming') return Boolean(t.dueDate && t.dueDate > todayStr);

      return true;
    });
  }, [tasks, activeFilter, selectedCategory, todayStr]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask(newTitle, newPriority, newCategory, newDueDate || undefined);
    setNewTitle('');
    setNewDueDate('');
  };

  const priorityStyles: Record<TaskPriority, { label: string; badge: string }> = {
    urgent: { label: 'Urgent', badge: 'bg-red-500/20 text-red-400 border-red-500/30' },
    high: { label: 'High', badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    medium: { label: 'Medium', badge: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
    low: { label: 'Low', badge: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  };

  return (
    <div className="h-full flex flex-col bg-[#11141C] text-slate-200 select-none font-sans text-xs">
      {/* Top Bar with Filter Summary */}
      <div className="h-10 px-4 bg-[#161B26] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <Layers size={14} className="text-sky-400" />
          <span className="font-semibold text-white">Tasks & Checklists</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>{counts.all} pending</span>
          <span>•</span>
          <span className="text-emerald-400">{counts.completed} completed</span>
        </div>
      </div>

      {/* Main Split Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Filter Views & Categories */}
        <div className="w-56 bg-[#141822] border-r border-white/10 p-3 flex flex-col gap-4 shrink-0">
          {/* Main Navigation Views */}
          <div className="space-y-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                activeFilter === 'all'
                  ? 'bg-sky-500/20 text-sky-400 font-semibold border border-sky-500/30'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Circle size={14} className="text-sky-400" />
                <span>All Tasks</span>
              </div>
              <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full">{counts.all}</span>
            </button>

            <button
              onClick={() => setActiveFilter('today')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                activeFilter === 'today'
                  ? 'bg-sky-500/20 text-sky-400 font-semibold border border-sky-500/30'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-amber-400" />
                <span>Today</span>
              </div>
              <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full">{counts.today}</span>
            </button>

            <button
              onClick={() => setActiveFilter('upcoming')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                activeFilter === 'upcoming'
                  ? 'bg-sky-500/20 text-sky-400 font-semibold border border-sky-500/30'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-purple-400" />
                <span>Upcoming</span>
              </div>
              <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full">{counts.upcoming}</span>
            </button>

            <button
              onClick={() => setActiveFilter('completed')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                activeFilter === 'completed'
                  ? 'bg-sky-500/20 text-sky-400 font-semibold border border-sky-500/30'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Completed</span>
              </div>
              <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full">{counts.completed}</span>
            </button>
          </div>

          {/* Categories Section */}
          <div className="pt-2 border-t border-white/5 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1">
              Categories
            </span>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-[11px] transition-colors ${
                selectedCategory === null ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>• All Categories</span>
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(selectedCategory === c ? null : c)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-[11px] transition-colors ${
                  selectedCategory === c ? 'bg-sky-500/15 text-sky-300 font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tag size={11} className="text-sky-400" />
                <span>{c}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Main Task List & Quick Add Bar */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0F131C]">
          {/* Quick Add Form Bar */}
          <form onSubmit={handleCreateTask} className="p-3 bg-[#131722] border-b border-white/5 flex items-center gap-2 shrink-0">
            <input
              type="text"
              placeholder="+ Add a new task (press Enter to save)..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 bg-[#0E1118] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-sky-500 transition-colors"
            />

            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
              className="bg-[#0E1118] border border-white/10 rounded-lg px-2.5 py-2 text-xs text-slate-300 outline-none focus:border-sky-500"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>

            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="bg-[#0E1118] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-300 outline-none focus:border-sky-500"
            />

            <button
              type="submit"
              className="px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-medium text-xs transition-all shadow-sm"
            >
              Add
            </button>
          </form>

          {/* Tasks List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 window-scroll">
            {filteredTasks.map((task) => {
              const isOverdue = !task.completed && task.dueDate && task.dueDate < todayStr;

              return (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    task.completed
                      ? 'bg-white/[0.01] border-white/5 opacity-60'
                      : isOverdue
                      ? 'bg-red-500/[0.05] border-red-500/20'
                      : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                    <button
                      onClick={() => toggleComplete(task.id)}
                      className="shrink-0 text-slate-400 hover:text-sky-400 transition-colors"
                    >
                      {task.completed ? (
                        <CheckCircle2 size={18} className="text-emerald-400" />
                      ) : (
                        <Circle size={18} className="hover:text-sky-400" />
                      )}
                    </button>

                    <div className="flex flex-col min-w-0">
                      <span
                        className={`text-xs font-medium truncate ${
                          task.completed ? 'line-through text-slate-400' : 'text-slate-100'
                        }`}
                      >
                        {task.title}
                      </span>

                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                        {task.category && (
                          <span className="px-1.5 py-0.2 bg-white/5 rounded text-sky-400">
                            #{task.category}
                          </span>
                        )}

                        {task.dueDate && (
                          <span
                            className={`flex items-center gap-1 ${
                              isOverdue ? 'text-red-400 font-semibold' : 'text-slate-400'
                            }`}
                          >
                            <Calendar size={10} />
                            <span>{task.dueDate}</span>
                            {isOverdue && <span>(Overdue)</span>}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider border ${
                        priorityStyles[task.priority].badge
                      }`}
                    >
                      {priorityStyles[task.priority].label}
                    </span>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1 text-slate-400 hover:text-red-400 transition-colors rounded hover:bg-white/5"
                      title="Delete task"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredTasks.length === 0 && (
              <div className="py-16 text-center text-slate-400 text-xs">
                No tasks in this view. Add one above!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
