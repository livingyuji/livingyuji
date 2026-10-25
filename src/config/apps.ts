import type { AppId } from '@/store/windowStore';

export interface AppDef {
  id: AppId;
  label: string;
  iconType:
    | 'thispc'
    | 'recyclebin'
    | 'music'
    | 'projects'
    | 'resume'
    | 'about'
    | 'contact'
    | 'blog'
    | 'games'
    | 'store'
    | 'minecraftstore'
    | 'memorywall'
    | 'paint'
    | 'browser'
    | 'terminal'
    | 'settings'
    | 'skills'
    | 'minecraft'
    | 'discord'
    | 'setups'
    | 'services'
    | 'admin'
    | 'showcase'
    | 'notes'
    | 'tasks'
    | 'calendar'
    | 'calculator'
    | 'clipboard'
    | 'devstudio'
    | 'sysmonitor'
    | 'appstore';
  category: 'system' | 'portfolio' | 'services' | 'store' | 'entertainment' | 'productivity' | 'developer' | 'utilities';
  description: string;
  keywords: string[];
  desktopCol?: 1 | 2 | 3; // 3-column layout as seen in reference screenshot
  desktopOrder?: number;
  inStartMenu?: boolean;
  version?: string;
  author?: string;
}

export const APPS: AppDef[] = [
  // --- COLUMN 1 (Matches user reference screenshot) ---
  {
    id: 'thispc',
    label: 'This PC',
    iconType: 'thispc',
    category: 'system',
    description: 'Browse virtual drives (C: and D:), files and system folders',
    keywords: ['this pc', 'my computer', 'explorer', 'files', 'drives', 'c:', 'd:'],
    desktopCol: 1,
    desktopOrder: 1,
    inStartMenu: true,
  },
  {
    id: 'recyclebin',
    label: 'Recycle Bin',
    iconType: 'recyclebin',
    category: 'system',
    description: 'Deleted items from the virtual filesystem',
    keywords: ['recycle bin', 'trash', 'deleted', 'restore'],
    desktopCol: 1,
    desktopOrder: 2,
    inStartMenu: true,
  },
  {
    id: 'projects',
    label: 'Developer Lab',
    iconType: 'projects',
    category: 'portfolio',
    description: 'Explore Minecraft plugins, Discord bots, and software projects',
    keywords: ['projects', 'developer lab', 'code', 'arcane', 'vanta', 'portfolio'],
    desktopCol: 1,
    desktopOrder: 3,
    inStartMenu: true,
  },
  {
    id: 'music',
    label: 'Music Lab',
    iconType: 'music',
    category: 'entertainment',
    description: 'Interactive audio player with chill lo-fi and synthwave tracks',
    keywords: ['music', 'songs', 'player', 'audio', 'lofi', 'beats', 'spotify'],
    desktopCol: 1,
    desktopOrder: 4,
    inStartMenu: true,
  },
  {
    id: 'resume',
    label: 'Resume',
    iconType: 'resume',
    category: 'portfolio',
    description: 'LivingYuji developer credentials, experience and resume',
    keywords: ['resume', 'cv', 'skills', 'experience', 'credentials'],
    desktopCol: 1,
    desktopOrder: 5,
    inStartMenu: true,
  },
  {
    id: 'about',
    label: 'Biography',
    iconType: 'about',
    category: 'portfolio',
    description: 'Personal background, vision, and technical journey',
    keywords: ['about', 'biography', 'bio', 'who', 'livingyuji'],
    desktopCol: 1,
    desktopOrder: 6,
    inStartMenu: true,
  },
  {
    id: 'contact',
    label: 'Contact Info',
    iconType: 'contact',
    category: 'portfolio',
    description: 'Send project enquiries and commission requests',
    keywords: ['contact', 'email', 'discord', 'message', 'hire'],
    desktopCol: 1,
    desktopOrder: 7,
    inStartMenu: true,
  },

  // --- COLUMN 2 (Matches user reference screenshot) ---
  {
    id: 'blog',
    label: 'Blog',
    iconType: 'blog',
    category: 'portfolio',
    description: 'Articles, devlogs, Minecraft optimization notes and tutorials',
    keywords: ['blog', 'articles', 'devlog', 'notes', 'posts'],
    desktopCol: 2,
    desktopOrder: 1,
    inStartMenu: true,
  },
  {
    id: 'games',
    label: 'Games',
    iconType: 'games',
    category: 'entertainment',
    description: 'Play retro mini-games (2048, Minesweeper, Cyber Runner)',
    keywords: ['games', 'play', 'minesweeper', '2048', 'arcade'],
    desktopCol: 2,
    desktopOrder: 2,
    inStartMenu: true,
  },
  {
    id: 'store',
    label: 'Store',
    iconType: 'store',
    category: 'store',
    description: 'Digital store for Minecraft plugins, setups, and developer assets',
    keywords: ['store', 'shop', 'buy', 'plugins', 'setups', 'free'],
    desktopCol: 2,
    desktopOrder: 3,
    inStartMenu: true,
  },
  {
    id: 'minecraftstore',
    label: 'Minecraft Store',
    iconType: 'minecraftstore',
    category: 'store',
    description: 'Digital marketplace for Minecraft plugins, setups, resource packs, and configs',
    keywords: ['minecraft store', 'store', 'market', 'plugins', 'setups', 'resource packs', 'paper', 'purpur'],
    desktopCol: 2,
    desktopOrder: 4,
    inStartMenu: true,
  },
  {
    id: 'memorywall',
    label: 'Memory Wall',
    iconType: 'memorywall',
    category: 'portfolio',
    description: 'Guestbook and messages from friends and visitors',
    keywords: ['memory wall', 'guestbook', 'messages', 'testimonials'],
    desktopCol: 2,
    desktopOrder: 5,
    inStartMenu: true,
  },

  // --- COLUMN 3 (Matches user reference screenshot) ---
  {
    id: 'paint',
    label: 'Paint',
    iconType: 'paint',
    category: 'entertainment',
    description: 'Full-featured canvas drawing, sketching and image export tool',
    keywords: ['paint', 'draw', 'sketch', 'art', 'canvas', 'image'],
    desktopCol: 3,
    desktopOrder: 1,
    inStartMenu: true,
  },
  {
    id: 'browser',
    label: 'LivingYuji Browser',
    iconType: 'browser',
    category: 'system',
    description: 'Browse web pages, portals, documentation and web tools',
    keywords: ['browser', 'web', 'internet', 'chrome', 'edge'],
    desktopCol: 3,
    desktopOrder: 2,
    inStartMenu: true,
  },
  {
    id: 'terminal',
    label: 'Terminal',
    iconType: 'terminal',
    category: 'system',
    description: 'Windows Terminal PowerShell CLI with interactive commands',
    keywords: ['terminal', 'powershell', 'cmd', 'cli', 'console'],
    desktopCol: 3,
    desktopOrder: 3,
    inStartMenu: true,
  },
  {
    id: 'showcase',
    label: 'Showcase',
    iconType: 'showcase',
    category: 'portfolio',
    description: 'Complete portfolio showcase of all LivingYuji projects, engines, and systems',
    keywords: ['showcase', 'projects', 'portfolio', 'minecraft', 'plugins', 'bots', 'systems', 'work'],
    desktopCol: 3,
    desktopOrder: 4,
    inStartMenu: true,
  },

  // --- ADDITIONAL SPECIALIZED APPS IN START MENU & FILE ASSOCS ---
  {
    id: 'admin',
    label: 'Control Panel',
    iconType: 'admin',
    category: 'system',
    description: 'LivingYuji OS Master Administrative Dashboard & Database Telemetry',
    keywords: ['admin', 'control panel', 'settings', 'database', 'supabase', 'discord'],
    inStartMenu: true,
  },
  {
    id: 'settings',
    label: 'Settings',
    iconType: 'settings',
    category: 'system',
    description: 'Windows 11 system customization, wallpapers and themes',
    keywords: ['settings', 'preferences', 'wallpaper', 'theme', 'display'],
    inStartMenu: true,
  },
  {
    id: 'skills',
    label: 'Developer Skills',
    iconType: 'skills',
    category: 'portfolio',
    description: 'Tech stack, frameworks, Paper API, and programming skills',
    keywords: ['skills', 'stack', 'java', 'typescript', 'react', 'purpur'],
    inStartMenu: true,
  },
  {
    id: 'minecraft',
    label: 'Minecraft Development',
    iconType: 'minecraft',
    category: 'services',
    description: 'Custom Paper/Purpur plugins, Skript, and server optimization',
    keywords: ['minecraft', 'paper', 'purpur', 'plugin', 'server'],
    inStartMenu: true,
  },
  {
    id: 'discord',
    label: 'Discord Development',
    iconType: 'discord',
    category: 'services',
    description: 'Custom Discord bots, dashboards, security and ticket systems',
    keywords: ['discord', 'bot', 'moderation', 'tickets', 'automation'],
    inStartMenu: true,
  },
  {
    id: 'setups',
    label: 'Custom Setups',
    iconType: 'setups',
    category: 'services',
    description: 'Turnkey Minecraft server configurations and community setups',
    keywords: ['setups', 'survival', 'lifesteal', 'pvp', 'lobby'],
    inStartMenu: true,
  },
  {
    id: 'services',
    label: 'Services & Pricing',
    iconType: 'services',
    category: 'services',
    description: 'Custom software services, packages and quote estimates',
    keywords: ['services', 'pricing', 'hire', 'quote', 'commission'],
    inStartMenu: true,
  },

  // --- PRODUCTIVITY & DEVELOPER APPS ---
  {
    id: 'notes',
    label: 'Notes',
    iconType: 'notes',
    category: 'productivity',
    description: 'Markdown note-taking, checklists, tags, and autosave workspace',
    keywords: ['notes', 'notepad', 'memo', 'markdown', 'write', 'todo'],
    inStartMenu: true,
    version: '1.2.0',
    author: 'LivingYuji',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    iconType: 'tasks',
    category: 'productivity',
    description: 'Personal task manager with priorities, due dates, and categories',
    keywords: ['tasks', 'todo', 'checklist', 'work', 'projects', 'deadline'],
    inStartMenu: true,
    version: '1.1.0',
    author: 'LivingYuji',
  },
  {
    id: 'calendar',
    label: 'Calendar',
    iconType: 'calendar',
    category: 'productivity',
    description: 'Schedule, agenda, and event manager with date and reminder views',
    keywords: ['calendar', 'events', 'schedule', 'date', 'agenda', 'planner'],
    inStartMenu: true,
    version: '1.0.0',
    author: 'LivingYuji',
  },
  {
    id: 'calculator',
    label: 'Calculator',
    iconType: 'calculator',
    category: 'utilities',
    description: 'Standard Windows calculator with calculation history and parenthesis math',
    keywords: ['calculator', 'calc', 'math', 'numbers', 'arithmetic'],
    inStartMenu: true,
    version: '1.0.0',
    author: 'LivingYuji',
  },
  {
    id: 'clipboard',
    label: 'Clipboard',
    iconType: 'clipboard',
    category: 'utilities',
    description: 'Internal clipboard history, snippet pinning, and text management',
    keywords: ['clipboard', 'copy', 'paste', 'history', 'snippets'],
    inStartMenu: true,
    version: '1.0.0',
    author: 'LivingYuji',
  },
  {
    id: 'devstudio',
    label: 'Dev Studio',
    iconType: 'devstudio',
    category: 'developer',
    description: 'Code editor, JSON/YAML formatter, Markdown preview, and diff viewer',
    keywords: ['code', 'editor', 'devstudio', 'developer', 'json', 'yaml', 'ide', 'markdown'],
    inStartMenu: true,
    version: '2.0.0',
    author: 'LivingYuji',
  },
  {
    id: 'sysmonitor',
    label: 'System Monitor',
    iconType: 'sysmonitor',
    category: 'system',
    description: 'Real-time browser diagnostics, storage quotas, window metrics, and telemetry',
    keywords: ['system monitor', 'task manager', 'diagnostics', 'telemetry', 'storage', 'ram', 'performance'],
    inStartMenu: true,
    version: '1.0.0',
    author: 'LivingYuji',
  },
  {
    id: 'appstore',
    label: 'App Store',
    iconType: 'appstore',
    category: 'system',
    description: 'Discover, inspect, and manage LivingYuji OS applications and desktop shortcuts',
    keywords: ['app store', 'store', 'marketplace', 'apps', 'install', 'download', 'catalog'],
    inStartMenu: true,
    version: '1.0.0',
    author: 'LivingYuji',
  },
];

export const getAppById = (id: AppId) => APPS.find((a) => a.id === id);
