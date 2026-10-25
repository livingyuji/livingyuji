'use client';

import React, { useState, useMemo } from 'react';
import { useFileSystemStore } from '@/store/fileSystemStore';
import {
  Code,
  FileCode,
  FolderTree,
  Play,
  Save,
  Check,
  AlertCircle,
  FilePlus,
  Eye,
  GitCompare,
  Download,
  Upload,
  Settings,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Layers,
  FileJson,
  FileText,
} from 'lucide-react';

interface OpenTab {
  id: string;
  name: string;
  language: string;
  content: string;
  modified: boolean;
  virtualFileId?: string;
}

const STARTER_TEMPLATES: Record<string, { name: string; lang: string; content: string }> = {
  minecraftPlugin: {
    name: 'paper-plugin.yml',
    lang: 'yaml',
    content: `name: ArcaneArsenal
version: '2.0.0'
main: com.livingyuji.arcane.ArcaneArsenal
api-version: '1.21'
author: LivingYuji
description: Premium spellcraft and combat mechanics plugin for Paper and Purpur.
permissions:
  arcane.use:
    description: Allows casting basic spells
    default: true
  arcane.admin:
    description: Full administrative control
    default: op`,
  },
  discordBot: {
    name: 'bot.config.json',
    lang: 'json',
    content: `{
  "clientId": "123456789012345678",
  "prefix": "/",
  "guildId": "987654321098765432",
  "features": {
    "tickets": true,
    "moderation": true,
    "minecraftSync": true,
    "autoRoles": ["Member", "Player"]
  },
  "presence": {
    "status": "online",
    "activity": "LivingYuji OS Virtual Desktop"
  }
}`,
  },
  webPage: {
    name: 'index.html',
    lang: 'html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>LivingYuji OS Web Sandbox</title>
  <style>
    body { font-family: sans-serif; background: #0E121A; color: #E2E8F0; padding: 2rem; }
    h1 { color: #38BDF8; }
  </style>
</head>
<body>
  <h1>Welcome to LivingYuji Studio</h1>
  <p>Rendered dynamically inside the virtual operating system.</p>
</body>
</html>`,
  },
};

export function DevStudioApp() {
  const { files, uploadFile, updateFileContent } = useFileSystemStore();

  const [tabs, setTabs] = useState<OpenTab[]>([
    {
      id: 'tab-plugin',
      name: STARTER_TEMPLATES.minecraftPlugin.name,
      language: STARTER_TEMPLATES.minecraftPlugin.lang,
      content: STARTER_TEMPLATES.minecraftPlugin.content,
      modified: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-plugin');
  const [activeMode, setActiveMode] = useState<'editor' | 'preview' | 'diff'>('editor');
  const [formatNotice, setFormatNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const handleContentChange = (newVal: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTab.id ? { ...t, content: newVal, modified: true } : t))
    );
  };

  const handleSave = () => {
    if (!activeTab) return;
    // Mark tab unmodified
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTab.id ? { ...t, modified: false } : t))
    );

    // If attached to a virtual file, update filesystem store
    if (activeTab.virtualFileId) {
      updateFileContent(activeTab.virtualFileId, activeTab.content);
    } else {
      // Save new file to virtual filesystem in D:/Projects
      const newFileId = uploadFile('d-root', 'D:', {
        name: activeTab.name,
        size: activeTab.content.length,
        content: activeTab.content,
      });
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTab.id ? { ...t, virtualFileId: newFileId } : t))
      );
    }

    setFormatNotice({ type: 'success', message: `Saved "${activeTab.name}" to virtual drive D:/` });
    setTimeout(() => setFormatNotice(null), 3000);
  };

  const handleFormatJson = () => {
    if (!activeTab) return;
    try {
      const parsed = JSON.parse(activeTab.content);
      const formatted = JSON.stringify(parsed, null, 2);
      handleContentChange(formatted);
      setFormatNotice({ type: 'success', message: 'Valid JSON formatted successfully!' });
      setTimeout(() => setFormatNotice(null), 3000);
    } catch (err: any) {
      setFormatNotice({ type: 'error', message: `JSON Syntax Error: ${err.message}` });
      setTimeout(() => setFormatNotice(null), 4000);
    }
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length <= 1) return;
    const nextTabs = tabs.filter((t) => t.id !== id);
    setTabs(nextTabs);
    if (activeTabId === id) {
      setActiveTabId(nextTabs[0].id);
    }
  };

  const handleLoadTemplate = (key: keyof typeof STARTER_TEMPLATES) => {
    const tmpl = STARTER_TEMPLATES[key];
    const newId = `tab-${Date.now()}`;
    setTabs((prev) => [
      ...prev,
      {
        id: newId,
        name: tmpl.name,
        language: tmpl.lang,
        content: tmpl.content,
        modified: false,
      },
    ]);
    setActiveTabId(newId);
  };

  // Virtual files list for explorer tree
  const virtualTextFiles = useMemo(() => {
    return files.filter(
      (f) =>
        f.type === 'text' ||
        ['.txt', '.md', '.json', '.yml', '.yaml', '.sk'].some((ext) => f.name.endsWith(ext))
    );
  }, [files]);

  const handleOpenVirtualFile = (fileId: string) => {
    const vFile = files.find((f) => f.id === fileId);
    if (!vFile) return;

    // Check if already open
    const existing = tabs.find((t) => t.virtualFileId === vFile.id);
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }

    const ext = vFile.extension || 'txt';
    const lang = ext === 'json' ? 'json' : ext === 'yml' || ext === 'yaml' ? 'yaml' : 'markdown';
    const newTab: OpenTab = {
      id: `tab-vfile-${vFile.id}`,
      name: vFile.name,
      language: lang,
      content: vFile.content || '',
      modified: false,
      virtualFileId: vFile.id,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const lines = useMemo(() => {
    if (!activeTab?.content) return [''];
    return activeTab.content.split('\n');
  }, [activeTab?.content]);

  return (
    <div className="h-full flex flex-col bg-[#0F131C] text-slate-200 select-none font-sans text-xs">
      {/* Top Application Toolbar */}
      <div className="h-10 px-4 bg-[#141824] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <Code size={15} className="text-sky-400" />
            <span className="font-bold text-white text-xs">Developer Studio</span>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 font-medium border border-sky-500/30 transition-colors active:scale-95"
            title="Save to Virtual Filesystem (Ctrl+S)"
          >
            <Save size={12} />
            <span>Save</span>
          </button>

          {activeTab?.language === 'json' && (
            <button
              onClick={handleFormatJson}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-medium border border-white/5 transition-colors"
              title="Prettify & validate JSON"
            >
              <FileJson size={12} />
              <span>Format JSON</span>
            </button>
          )}

          {/* Template Dropdown */}
          <div className="flex items-center gap-1 bg-[#121622] px-2 py-0.5 rounded-lg border border-white/5">
            <span className="text-[10px] text-slate-400">Templates:</span>
            <button
              onClick={() => handleLoadTemplate('minecraftPlugin')}
              className="text-[10px] text-sky-400 hover:underline"
            >
              Paper
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => handleLoadTemplate('discordBot')}
              className="text-[10px] text-sky-400 hover:underline"
            >
              Discord
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => handleLoadTemplate('webPage')}
              className="text-[10px] text-sky-400 hover:underline"
            >
              HTML
            </button>
          </div>
        </div>

        {/* View Mode Switcher (Editor / Preview / Diff) */}
        <div className="flex items-center gap-2">
          {formatNotice && (
            <span
              className={`text-[11px] font-medium flex items-center gap-1 ${
                formatNotice.type === 'success' ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {formatNotice.type === 'success' ? <Check size={12} /> : <AlertCircle size={12} />}
              <span>{formatNotice.message}</span>
            </span>
          )}

          <div className="flex items-center gap-1 bg-[#121622] p-0.5 rounded-lg border border-white/5">
            <button
              onClick={() => setActiveMode('editor')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                activeMode === 'editor' ? 'bg-[#0078D4] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveMode('preview')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                activeMode === 'preview' ? 'bg-[#0078D4] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Area (Sidebar + Tabs & Editor) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Virtual File Tree */}
        <div className="w-52 bg-[#121520] border-r border-white/10 flex flex-col shrink-0 overflow-hidden">
          <div className="p-3 border-b border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Virtual Files
            </span>
            <span className="text-[9px] text-sky-400">NTFS D:/</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 window-scroll">
            {virtualTextFiles.map((vf) => (
              <div
                key={vf.id}
                onClick={() => handleOpenVirtualFile(vf.id)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer text-slate-300 hover:text-white transition-colors"
                title={vf.name}
              >
                <FileCode size={13} className="text-sky-400 shrink-0" />
                <span className="text-[11px] truncate flex-1">{vf.name}</span>
              </div>
            ))}

            {virtualTextFiles.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-[11px]">
                No text files in virtual disk.
              </div>
            )}
          </div>
        </div>

        {/* Right Editor & Tabs Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0B0E14]">
          {/* File Tabs Bar */}
          <div className="h-8 bg-[#121622] border-b border-white/10 flex items-center px-2 gap-1 overflow-x-auto no-scrollbar shrink-0">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-t-lg border-t-2 text-[11px] cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-[#0B0E14] border-sky-400 text-white font-medium'
                      : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileCode size={12} className={isActive ? 'text-sky-400' : 'text-slate-500'} />
                  <span className="truncate max-w-[120px]">{tab.name}</span>
                  {tab.modified && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
                  {tabs.length > 1 && (
                    <button
                      onClick={(e) => handleCloseTab(tab.id, e)}
                      className="hover:text-red-400 transition-colors ml-1 text-slate-500"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Active Mode Body */}
          {activeMode === 'editor' ? (
            /* Syntax/Code Editor with Line Numbers */
            <div className="flex-1 flex overflow-hidden font-mono text-xs select-text">
              {/* Line Numbers Column */}
              <div className="w-11 bg-[#090C12] text-slate-600 text-right pr-3 py-3 select-none shrink-0 border-r border-white/5 space-y-1">
                {lines.map((_, i) => (
                  <div key={i} className="leading-5 h-5 text-[11px]">
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Code TextArea */}
              <textarea
                value={activeTab.content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="// Start writing code here..."
                spellCheck={false}
                className="flex-1 p-3 bg-transparent text-slate-100 resize-none outline-none leading-5 font-mono text-xs select-text window-scroll"
              />
            </div>
          ) : (
            /* HTML or Markdown Live Preview */
            <div className="flex-1 p-6 overflow-y-auto bg-[#0F131C] window-scroll">
              {activeTab.language === 'html' ? (
                <div className="w-full h-full bg-white rounded-xl overflow-hidden shadow-2xl">
                  <iframe
                    srcDoc={activeTab.content}
                    sandbox="allow-scripts"
                    title="Web Sandbox"
                    className="w-full h-full border-none"
                  />
                </div>
              ) : (
                <div className="space-y-3 font-sans text-xs text-slate-200 select-text max-w-2xl">
                  <h3 className="text-base font-bold text-sky-400 pb-2 border-b border-white/10">
                    {activeTab.name} Preview
                  </h3>
                  <pre className="bg-[#141824] p-4 rounded-xl font-mono text-xs text-sky-300 border border-white/5 whitespace-pre-wrap">
                    {activeTab.content}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Bottom Diagnostics Status Bar */}
          <div className="h-6 px-4 bg-[#121622] border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
            <div className="flex items-center gap-3">
              <span>Lines: {lines.length}</span>
              <span>•</span>
              <span>Chars: {activeTab.content.length}</span>
              <span>•</span>
              <span className="uppercase text-sky-400">{activeTab.language}</span>
            </div>
            <div>
              <span>UTF-8 • LF • LivingYuji DevStudio Engine</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
