'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface Skill {
  name: string;
  level?: 'beginner' | 'intermediate' | 'proficient';
}

interface SkillCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  skills: Skill[];
}

const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'web',
    label: 'Web Development',
    icon: '🌐',
    color: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200/60 dark:border-cyan-700/40',
    description: 'Building modern, responsive web applications and APIs.',
    skills: [
      { name: 'Frontend Development' },
      { name: 'Backend Development' },
      { name: 'Responsive Websites' },
      { name: 'Web Applications' },
      { name: 'APIs & Integrations' },
      { name: 'Dashboards & Portfolios' },
    ],
  },
  {
    id: 'discord',
    label: 'Discord Development',
    icon: '💬',
    color: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200/60 dark:border-indigo-700/40',
    description: 'Building Discord bots, automation, and management systems.',
    skills: [
      { name: 'Discord Bots' },
      { name: 'Bot Commands & Interactions' },
      { name: 'Moderation & Security' },
      { name: 'Tickets, Giveaways & Automation' },
      { name: 'Discord Bot Dashboards' },
      { name: 'Database Integration' },
    ],
  },
  {
    id: 'minecraft',
    label: 'Minecraft Development',
    icon: '🟩',
    color: 'bg-green-50 dark:bg-green-900/20 border-green-200/60 dark:border-green-700/40',
    description: 'Creating plugins, server systems and custom gameplay mechanics.',
    skills: [
      { name: 'Paper & Purpur Plugins' },
      { name: 'Server Configuration' },
      { name: 'Skript-based Systems' },
      { name: 'Custom Gameplay Mechanics' },
      { name: 'Plugin Integration & Debugging' },
      { name: 'Minecraft Server Setup' },
    ],
  },
  {
    id: 'resourcepacks',
    label: 'Resource Packs & Digital Assets',
    icon: '🎨',
    color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200/60 dark:border-purple-700/40',
    description: 'Custom textures, resource packs and visual asset work.',
    skills: [
      { name: 'Custom Minecraft Resource Packs' },
      { name: 'Texture Modifications' },
      { name: 'Custom Item Visuals' },
      { name: 'Pack Compatibility & Validation' },
      { name: 'Asset Organisation' },
    ],
  },
  {
    id: 'automation',
    label: 'Automation & AI',
    icon: '⚡',
    color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200/60 dark:border-yellow-700/40',
    description: 'Automation tools, API integrations and AI-powered utilities.',
    skills: [
      { name: 'Automation Tools' },
      { name: 'API Integrations' },
      { name: 'AI-powered Application Concepts' },
      { name: 'Productivity Utilities' },
      { name: 'Workflow Automation' },
    ],
  },
  {
    id: 'tools',
    label: 'Programming & Tools',
    icon: '🛠️',
    color: 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/40',
    description: 'Languages, frameworks, databases and developer tools.',
    skills: [
      { name: 'Java' },
      { name: 'TypeScript / JavaScript' },
      { name: 'Python' },
      { name: 'Node.js' },
      { name: 'Next.js / React' },
      { name: 'Tailwind CSS' },
      { name: 'PostgreSQL' },
      { name: 'Supabase' },
      { name: 'Git & GitHub' },
      { name: 'Docker' },
      { name: 'Gradle & Maven' },
    ],
  },
];

export function SkillsApp() {
  const [selected, setSelected] = useState<string | null>(null);

  const selectedCat = SKILL_CATEGORIES.find((c) => c.id === selected);

  return (
    <div className="h-full flex bg-soft-bg dark:bg-slate-900">
      {/* Sidebar */}
      <div className="w-56 shrink-0 border-r border-border/40 dark:border-slate-700/40 overflow-y-auto window-scroll bg-white/50 dark:bg-slate-800/50">
        <div className="p-3">
          <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider px-2 mb-2">Categories</h2>
          {SKILL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelected(cat.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-all duration-150 mb-1 ${
                selected === cat.id
                  ? 'bg-primary/10 text-primary dark:text-primary font-medium'
                  : 'text-deep dark:text-slate-300 hover:bg-soft-bg dark:hover:bg-slate-700'
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span className="leading-tight">{cat.label}</span>
              {selected === cat.id && <ChevronRight className="w-3 h-3 ml-auto" />}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto window-scroll">
        {selectedCat ? (
          <div className="p-6 space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl">{selectedCat.icon}</span>
                <h1 className="text-xl font-bold text-deep dark:text-white">{selectedCat.label}</h1>
              </div>
              <p className="text-sm text-secondary ml-12">{selectedCat.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {selectedCat.skills.map((skill) => (
                <div
                  key={skill.name}
                  className={`${selectedCat.color} border rounded-xl px-4 py-3 text-sm text-deep dark:text-white font-medium`}
                >
                  {skill.name}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <h1 className="text-xl font-bold text-deep dark:text-white mb-2">Developer Skills</h1>
            <p className="text-sm text-secondary mb-6">
              Select a category from the sidebar to explore skills and technologies.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {SKILL_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelected(cat.id)}
                  className={`${cat.color} border rounded-2xl p-4 text-left hover:shadow-card transition-all duration-150`}
                >
                  <div className="text-2xl mb-2">{cat.icon}</div>
                  <h3 className="text-sm font-semibold text-deep dark:text-white">{cat.label}</h3>
                  <p className="text-xs text-secondary mt-1">{cat.skills.length} skills</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
