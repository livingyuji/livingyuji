'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useWindowStore } from '@/store/windowStore';
import { useFileSystemStore } from '@/store/fileSystemStore';
import type { AppId } from '@/store/windowStore';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
}

export function TerminalApp() {
  const { openWindow } = useWindowStore();
  const { files } = useFileSystemStore();
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'system', content: 'Windows PowerShell' },
    { type: 'system', content: 'Copyright (C) Microsoft Corporation. All rights reserved.' },
    { type: 'system', content: 'LivingYuji OS Virtual Shell [Version 10.0.22631.3007]' },
    { type: 'system', content: 'Type "help" to display available commands.' },
    { type: 'system', content: '' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);

  const runCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    const parts = trimmed.split(' ');
    const command = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');

    if (trimmed) {
      setHistory((prev) => [trimmed, ...prev.slice(0, 50)]);
    }

    const newLines: TerminalLine[] = [
      { type: 'input', content: `PS C:\\Users\\LivingYuji> ${cmdStr}` },
    ];

    if (!command) {
      setLines((prev) => [...prev, ...newLines]);
      return;
    }

    switch (command) {
      case 'cls':
      case 'clear':
        setLines([]);
        return;

      case 'help':
        newLines.push({
          type: 'output',
          content: [
            'Available PowerShell commands:',
            '  help               Show this command list',
            '  dir, ls            List items in current virtual directory',
            '  open <app>         Open an application (e.g. open paint, open store)',
            '  about              Display LivingYuji bio and developer credentials',
            '  projects           List Minecraft plugins and software projects',
            '  skills             View developer technical capabilities',
            '  services           Display commercial setup & development services',
            '  store              Show digital products and plugins available',
            '  music              Launch Music Lab audio player',
            '  paint              Launch Paint drawing canvas',
            '  games              Launch Games Arcade',
            '  date               Display current date and time',
            '  cls, clear         Clear screen',
          ].join('\n'),
        });
        break;

      case 'dir':
      case 'ls': {
        const desktopFiles = files.filter((f) => f.parentId === 'u-desktop' || f.parentId === 'c-user-livingyuji');
        const listStr = [
          '    Directory: C:\\Users\\LivingYuji',
          '',
          'Mode                 LastWriteTime         Length Name',
          '----                 -------------         ------ ----',
          ...desktopFiles.map((f) => `d-----        ${f.modifiedAt}           ${f.size || 4096} ${f.name}`),
        ].join('\n');
        newLines.push({ type: 'output', content: listStr });
        break;
      }

      case 'open':
      case 'start': {
        const appKey = arg.toLowerCase().replace(/\s+/g, '') as AppId;
        const validApps: Record<string, AppId> = {
          thispc: 'thispc',
          explorer: 'thispc',
          paint: 'paint',
          music: 'music',
          games: 'games',
          store: 'store',
          projects: 'projects',
          skills: 'skills',
          minecraft: 'minecraft',
          discord: 'discord',
          setups: 'setups',
          services: 'services',
          contact: 'contact',
          resume: 'resume',
          settings: 'settings',
          browser: 'browser',
          blog: 'blog',
          memorywall: 'memorywall',
        };

        if (validApps[appKey]) {
          openWindow(validApps[appKey]);
          newLines.push({ type: 'output', content: `Launched: ${validApps[appKey]}` });
        } else {
          newLines.push({
            type: 'error',
            content: `App not found: "${arg}". Try: paint, store, projects, music, games, browser, thispc, settings.`,
          });
        }
        break;
      }

      case 'about':
        newLines.push({
          type: 'output',
          content: 'LivingYuji — Independent Developer specializing in Minecraft plugins, Discord bots, and full-stack web applications. GitHub: github.com/livingyuji',
        });
        break;

      case 'projects':
        newLines.push({
          type: 'output',
          content: [
            'Minecraft Plugins:',
            '  - ArcaneArsenal (Magical weapons & custom resource pack for Paper 1.21)',
            '  - VantaCombat (PvP mechanics & hit registration enhancements for Paper/Fabric)',
            '  - WorldManager (Multi-world management for Paper & Velocity proxies)',
            '  - AuthSecurity (Player security & authentication system)',
            '',
            'Discord Bots:',
            '  - Raven Bots (Tickets, moderation, automation and dashboard)',
            '',
            'Type "open projects" to launch the Projects Explorer GUI.',
          ].join('\n'),
        });
        break;

      case 'date':
        newLines.push({ type: 'output', content: new Date().toString() });
        break;

      default:
        newLines.push({
          type: 'error',
          content: `${command} : The term '${command}' is not recognized as the name of a cmdlet, function, or operable program. Check spelling and try 'help'.`,
        });
        break;
    }

    newLines.push({ type: 'output', content: '' });
    setLines((prev) => [...prev, ...newLines]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      runCommand(input);
      setInput('');
      setHistIdx(-1);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(next);
      setInput(history[next] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setInput(next === -1 ? '' : history[next] || '');
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0C0F17] text-[#CCCCCC] font-mono text-xs select-text">
      {/* Output Stream */}
      <div className="flex-1 p-4 overflow-y-auto window-scroll space-y-1">
        {lines.map((l, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap leading-relaxed ${
              l.type === 'input'
                ? 'text-white font-semibold'
                : l.type === 'error'
                ? 'text-[#F87171]'
                : l.type === 'system'
                ? 'text-slate-400'
                : 'text-[#E2E8F0]'
            }`}
          >
            {l.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Prompt */}
      <div className="h-10 px-4 border-t border-white/10 bg-[#10141F] flex items-center gap-2 shrink-0">
        <span className="text-[#38BDF8] font-bold shrink-0">PS C:\Users\LivingYuji&gt;</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-white outline-none caret-[#38BDF8]"
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </div>
  );
}
