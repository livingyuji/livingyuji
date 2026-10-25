'use client';

import React, { Suspense } from 'react';
import type { AppId } from '@/store/windowStore';

const ThisPCApp = React.lazy(() => import('./ThisPCApp').then((m) => ({ default: m.ThisPCApp })));
const RecycleBinApp = React.lazy(() => import('./RecycleBinApp').then((m) => ({ default: m.RecycleBinApp })));
const BrowserApp = React.lazy(() => import('./BrowserApp').then((m) => ({ default: m.BrowserApp })));
const PaintApp = React.lazy(() => import('./PaintApp').then((m) => ({ default: m.PaintApp })));
const MusicLabApp = React.lazy(() => import('./MusicLabApp').then((m) => ({ default: m.MusicLabApp })));
const GamesApp = React.lazy(() => import('./GamesApp').then((m) => ({ default: m.GamesApp })));
const StoreApp = React.lazy(() => import('./StoreApp').then((m) => ({ default: m.StoreApp })));
const MinecraftStoreApp = React.lazy(() => import('./MinecraftStoreApp').then((m) => ({ default: m.MinecraftStoreApp })));
const ProjectsApp = React.lazy(() => import('./ProjectsApp').then((m) => ({ default: m.ProjectsApp })));
const SkillsApp = React.lazy(() => import('./SkillsApp').then((m) => ({ default: m.SkillsApp })));
const MinecraftApp = React.lazy(() => import('./MinecraftApp').then((m) => ({ default: m.MinecraftApp })));
const DiscordApp = React.lazy(() => import('./DiscordApp').then((m) => ({ default: m.DiscordApp })));
const WebDevApp = React.lazy(() => import('./WebDevApp').then((m) => ({ default: m.WebDevApp })));
const SetupsApp = React.lazy(() => import('./SetupsApp').then((m) => ({ default: m.SetupsApp })));
const ServicesApp = React.lazy(() => import('./ServicesApp').then((m) => ({ default: m.ServicesApp })));
const ContactApp = React.lazy(() => import('./ContactApp').then((m) => ({ default: m.ContactApp })));
const ResumeApp = React.lazy(() => import('./ResumeApp').then((m) => ({ default: m.ResumeApp })));
const SettingsApp = React.lazy(() => import('./SettingsApp').then((m) => ({ default: m.SettingsApp })));
const TerminalApp = React.lazy(() => import('./TerminalApp').then((m) => ({ default: m.TerminalApp })));
const AboutApp = React.lazy(() => import('./AboutApp').then((m) => ({ default: m.AboutApp })));
const BlogApp = React.lazy(() => import('./BlogApp').then((m) => ({ default: m.BlogApp })));
const MemoryWallApp = React.lazy(() => import('./MemoryWallApp').then((m) => ({ default: m.MemoryWallApp })));
const TextViewerApp = React.lazy(() => import('./TextViewerApp').then((m) => ({ default: m.TextViewerApp })));
const AdminPanelApp = React.lazy(() => import('./AdminPanelApp').then((m) => ({ default: m.AdminPanelApp })));
const ShowcaseApp = React.lazy(() => import('./ShowcaseApp').then((m) => ({ default: m.ShowcaseApp })));
const NotesApp = React.lazy(() => import('./NotesApp').then((m) => ({ default: m.NotesApp })));
const TasksApp = React.lazy(() => import('./TasksApp').then((m) => ({ default: m.TasksApp })));
const CalendarApp = React.lazy(() => import('./CalendarApp').then((m) => ({ default: m.CalendarApp })));
const CalculatorApp = React.lazy(() => import('./CalculatorApp').then((m) => ({ default: m.CalculatorApp })));
const ClipboardApp = React.lazy(() => import('./ClipboardApp').then((m) => ({ default: m.ClipboardApp })));
const DevStudioApp = React.lazy(() => import('./DevStudioApp').then((m) => ({ default: m.DevStudioApp })));
const SystemMonitorApp = React.lazy(() => import('./SystemMonitorApp').then((m) => ({ default: m.SystemMonitorApp })));
const AppStoreApp = React.lazy(() => import('./AppStoreApp').then((m) => ({ default: m.AppStoreApp })));

function AppFallback() {
  return (
    <div className="h-full flex items-center justify-center bg-[#151822]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#38BDF8]/20 border-t-[#38BDF8] rounded-full animate-spin" />
        <span className="text-xs text-slate-400">Loading...</span>
      </div>
    </div>
  );
}

const APP_MAP: Record<AppId, React.ComponentType<any>> = {
  thispc: ThisPCApp,
  recyclebin: RecycleBinApp,
  browser: BrowserApp,
  paint: PaintApp,
  music: MusicLabApp,
  games: GamesApp,
  store: StoreApp,
  minecraftstore: MinecraftStoreApp,
  projects: ProjectsApp,
  skills: SkillsApp,
  minecraft: MinecraftApp,
  discord: DiscordApp,
  webdev: WebDevApp,
  setups: SetupsApp,
  services: ServicesApp,
  contact: ContactApp,
  resume: ResumeApp,
  settings: SettingsApp,
  terminal: TerminalApp,
  about: AboutApp,
  blog: BlogApp,
  memorywall: MemoryWallApp,
  textviewer: TextViewerApp,
  admin: AdminPanelApp,
  showcase: ShowcaseApp,
  notes: NotesApp,
  tasks: TasksApp,
  calendar: CalendarApp,
  calculator: CalculatorApp,
  clipboard: ClipboardApp,
  devstudio: DevStudioApp,
  sysmonitor: SystemMonitorApp,
  appstore: AppStoreApp,
};

interface AppContentProps {
  appId: AppId;
  initialFolderId?: string;
}

export function AppContent({ appId, initialFolderId }: AppContentProps) {
  const Component = APP_MAP[appId];
  if (!Component) {
    return (
      <div className="h-full flex items-center justify-center bg-[#151822]">
        <p className="text-slate-400 text-sm">Application &ldquo;{appId}&rdquo; is initializing...</p>
      </div>
    );
  }
  return (
    <Suspense fallback={<AppFallback />}>
      <Component initialFolderId={initialFolderId} />
    </Suspense>
  );
}
