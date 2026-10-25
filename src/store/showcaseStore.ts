import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ProjectStatus =
  | 'Released'
  | 'In Development'
  | 'Beta'
  | 'Coming Soon'
  | 'Archived'
  | 'Private';

export interface ProjectLinks {
  liveDemo?: string;
  github?: string;
  documentation?: string;
  downloadUrl?: string;
  discordChannelOverride?: string;
  externalSite?: string;
}

export interface ProjectCompatibility {
  mcVersions?: string[];
  serverSoftware?: string[];
  platforms?: string[];
  dependencies?: string[];
}

export interface ShowcaseProject {
  id: string;
  title: string;
  slug: string;
  category: string;
  categoryName: string;
  summary: string;
  description: string;
  coverImage?: string;
  gradientBg: string;
  iconSymbol: string;
  screenshots: string[];
  features: string[];
  technologies: string[];
  status: ProjectStatus;
  featured: boolean;
  isFree: boolean;
  price?: number;
  version?: string;
  changelog?: string;
  compatibility?: ProjectCompatibility;
  installation?: string[];
  links: ProjectLinks;
  createdAt: string;
  updatedAt: string;
}

export interface ShowcaseCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  visible: boolean;
}

export const DEFAULT_CATEGORIES: ShowcaseCategory[] = [
  { id: 'all', name: 'All Projects', icon: '⚡', description: 'Complete catalog of LivingYuji creations', visible: true },
  { id: 'mc-plugins', name: 'Minecraft Plugins', icon: '🔌', description: 'Paper & Purpur gameplay engines', visible: true },
  { id: 'mc-setups', name: 'Minecraft Server Setups', icon: '🏰', description: 'Turnkey network architectures & optimization', visible: true },
  { id: 'mc-resourcepacks', name: 'Resource Packs', icon: '🎨', description: 'Custom 3D models, textures & GUIs', visible: true },
  { id: 'discord-bots', name: 'Discord Development', icon: '💬', description: 'Automation bots, dashboards & moderation', visible: true },
  { id: 'web-apps', name: 'Websites & Web Apps', icon: '🌐', description: 'Operating systems, portals & React apps', visible: true },
  { id: 'dev-tools', name: 'Developer Tools & Automation', icon: '🛠️', description: 'Productivity scripts & system utilities', visible: true },
  { id: 'services', name: 'Services & Commissions', icon: '💼', description: 'Custom development & infrastructure', visible: true },
  { id: 'archived', name: 'Archived Projects', icon: '📦', description: 'Previous releases & experiments', visible: true },
];

export const INITIAL_PROJECTS: ShowcaseProject[] = [
  {
    id: 'proj-livingyuji-os',
    title: 'LivingYuji OS',
    slug: 'livingyuji-os',
    category: 'web-apps',
    categoryName: 'Websites & Web Apps',
    summary: 'Full-featured browser-based Windows desktop operating system, portfolio and media workspace.',
    description:
      'LivingYuji OS is an interactive web desktop operating system built with Next.js 14, React 18, and TypeScript. Features a window manager with drag, resize, maximize/minimize, a virtual NTFS filesystem with C: and D: drives, text viewer, Paint canvas, digital stores, matrix background synthesizers, and seamless Discord purchasing coordination.',
    gradientBg: 'from-blue-600 via-sky-700 to-indigo-900',
    iconSymbol: '💻',
    screenshots: [
      '/screenshots/desktop.png',
      '/screenshots/browser.png',
      '/screenshots/store.png',
    ],
    features: [
      'Interactive Windows 11 window manager with boundary clamping & Z-index stacking',
      'Virtual NTFS File System supporting C: and D: — My Projects drives',
      'Built-in Document Viewer & text editor with read-only member protection',
      'Discord purchasing system replacing simulated checkouts',
      'Admin control console with Supabase cloud synchronisation & local fallback',
      'Matrix rain phosphor canvas & synthesizer workstation',
    ],
    technologies: ['Next.js 14', 'React 18', 'TypeScript', 'Tailwind CSS', 'Zustand', 'Supabase'],
    status: 'Released',
    featured: true,
    isFree: true,
    version: 'v2.5',
    changelog: 'Added Showcase application, refined desktop icon movement with 8px deadzone, and rebuilt Biography and Document Viewer.',
    compatibility: {
      platforms: ['Web Browsers', 'Windows', 'macOS', 'Linux', 'iOS', 'Android'],
    },
    links: {
      liveDemo: 'https://livingyuji.com',
      github: 'https://github.com/livingyuji/livingyuji-os',
      documentation: 'D:/Project Documentation/LivingYuji OS.txt',
    },
    createdAt: '2024-03-10',
    updatedAt: '2026-10-25',
  },
  {
    id: 'proj-arcane-arsenal',
    title: 'ArcaneArsenal — Magical Weapons Engine',
    slug: 'arcane-arsenal',
    category: 'mc-plugins',
    categoryName: 'Minecraft Plugins',
    summary: 'Production-grade custom weapon framework with 10+ arcane items, particle raycasting & sound FX.',
    description:
      'ArcaneArsenal is a high-performance custom weapon system built for Paper and Purpur servers. Features 10+ mythical weapons with raycasted particle beams, sound FX, cooldown management, and complete CustomModelData support for resource packs. Built to run with zero lag on high player-count servers.',
    gradientBg: 'from-purple-700 via-indigo-800 to-slate-900',
    iconSymbol: '⚔️',
    screenshots: [],
    features: [
      '10+ unique weapons (Voidwalker Scythe, Sunfire Blade, Tempest Bow, etc.)',
      'Zero-lag asynchronous particle raycasting math',
      'Full CustomModelData compatibility for 3D resource packs',
      'YAML configuration for damage, cooldowns, sound pitches, and visual rays',
      'Paper & Purpur 1.21.4 native compatibility',
    ],
    technologies: ['Java 21', 'PaperMC API', 'Purpur API', 'CustomModelData', 'YAML'],
    status: 'Released',
    featured: true,
    isFree: true,
    version: 'v1.4.2',
    changelog: 'Updated for Paper 1.21.4; added particle raycast optimizations and custom sound pitches.',
    compatibility: {
      mcVersions: ['1.21.4', '1.21.1', '1.20.4'],
      serverSoftware: ['Paper', 'Purpur'],
      dependencies: ['None (Standalone)'],
    },
    installation: [
      '1. Download ArcaneArsenal-v1.4.2.jar',
      '2. Place into your server /plugins/ directory',
      '3. Restart server or run /reload confirm',
      '4. Configure weapon stats in /plugins/ArcaneArsenal/config.yml',
    ],
    links: {
      github: 'https://github.com/livingyuji/ArcaneArsenal',
      downloadUrl: '/downloads/ArcaneArsenal-v1.4.2.jar',
      documentation: 'D:/Minecraft Development/ArcaneArsenal.txt',
    },
    createdAt: '2024-06-15',
    updatedAt: '2026-10-20',
  },
  {
    id: 'proj-vanta-combat',
    title: 'VantaCombat — PvP Hitreg & Mechanics',
    slug: 'vanta-combat',
    category: 'mc-plugins',
    categoryName: 'Minecraft Plugins',
    summary: 'High tick-rate PvP engine featuring instant hit registration, knockback tuning, and combat tagging.',
    description:
      'VantaCombat is an ultra-low latency combat mechanics engine engineered for competitive Minecraft servers. Completely re-tunes hit registration delays, horizontal/vertical knockback friction, shield mechanics, and combat tagging to deliver flawless 1.8-style or enhanced modern PvP.',
    gradientBg: 'from-emerald-700 via-teal-800 to-slate-950',
    iconSymbol: '⚡',
    screenshots: [],
    features: [
      'Zero-delay packet-level hit detection and reach verification',
      'Fully customizable knockback curves (horizontal, vertical, friction, combo multiplier)',
      'Combat tagging system with customizable logout penalty',
      'Ender pearl cooldowns and anti-glitch teleport checks',
    ],
    technologies: ['Java 21', 'ProtocolLib', 'PacketEvents', 'PaperMC'],
    status: 'Released',
    featured: true,
    isFree: true,
    version: 'v1.0.0',
    changelog: 'Initial public release for Paper and Purpur 1.21.x.',
    compatibility: {
      mcVersions: ['1.21.4', '1.21.1'],
      serverSoftware: ['Paper', 'Purpur'],
      dependencies: ['ProtocolLib (Optional)'],
    },
    links: {
      github: 'https://github.com/livingyuji/VantaCombat',
      downloadUrl: '/downloads/VantaCombat-v1.0.0.jar',
      documentation: 'D:/Minecraft Development/VantaCombat.txt',
    },
    createdAt: '2024-09-01',
    updatedAt: '2026-10-18',
  },
  {
    id: 'proj-raven-everywhere',
    title: 'Raven Everywhere — Discord Infrastructure',
    slug: 'raven-everywhere',
    category: 'discord-bots',
    categoryName: 'Discord Development',
    summary: 'Enterprise-grade Discord automation bot with ticket dispatching, moderation logs & role syncing.',
    description:
      'Raven Everywhere is an all-in-one Discord community infrastructure bot. Features a ticket dispatching system with transcript archives, automated moderation, announcement scheduling, role synchronization with Minecraft/web accounts, and direct webhook notifications for store purchases.',
    gradientBg: 'from-indigo-700 via-purple-900 to-slate-950',
    iconSymbol: '💬',
    screenshots: [],
    features: [
      'Threaded ticket system with HTML transcript generation and staff ratings',
      'Automated anti-raid security, account age filtering, and link screening',
      'Minecraft UUID role synchronization via REST API webhook',
      'Real-time purchase and commission alert routing',
    ],
    technologies: ['Node.js', 'Discord.js v14', 'PostgreSQL', 'TypeScript', 'REST APIs'],
    status: 'Released',
    featured: true,
    isFree: false,
    price: 49.99,
    version: 'v2.2',
    changelog: 'Added ticket transcripts export and multi-server role synchronization.',
    compatibility: {
      platforms: ['Discord API v10', 'Linux / Docker VPS'],
    },
    links: {
      discordChannelOverride: 'https://discord.gg/livingyuji',
      documentation: 'D:/Discord Development/Raven Everywhere.txt',
    },
    createdAt: '2024-04-12',
    updatedAt: '2026-10-22',
  },
  {
    id: 'proj-purpur-velocity-setup',
    title: 'Purpur & Velocity Turnkey Network Setup',
    slug: 'purpur-velocity-setup',
    category: 'mc-setups',
    categoryName: 'Minecraft Server Setups',
    summary: 'Enterprise Minecraft proxy and backend network engineered for 100+ players at solid 20.0 TPS.',
    description:
      'A complete, battle-tested Minecraft server network setup including Velocity proxy, Purpur game servers, LuckPerms MySQL sync, custom Redis packet routing, pre-configured tablist, and anti-DDoS proxy filters. Tuned for maximum tick efficiency and zero TPS drops under heavy loads.',
    gradientBg: 'from-amber-700 via-orange-800 to-slate-950',
    iconSymbol: '🏰',
    screenshots: [],
    features: [
      'Velocity proxy with modern forwarding and multi-backend routing',
      'Pre-tuned purpur.yml, paper-world-defaults.yml, and server.properties for 20.0 TPS',
      'Complete LuckPerms rank hierarchy with inheritance and MySQL backend sync',
      'Optimized anti-cheat profile with low false-positive heuristics',
    ],
    technologies: ['Velocity Proxy', 'Purpur Server', 'LuckPerms', 'Redis', 'MySQL', 'Linux'],
    status: 'Released',
    featured: false,
    isFree: false,
    price: 299.0,
    version: 'v3.0',
    changelog: 'Updated for 1.21.4 with enhanced Velocity packet pipeline.',
    compatibility: {
      mcVersions: ['1.21.4', '1.21.1', '1.20.x'],
      serverSoftware: ['Velocity', 'Purpur', 'Paper'],
    },
    links: {
      discordChannelOverride: 'https://discord.gg/livingyuji',
      documentation: 'D:/Minecraft Development/Minecraft Server Setups.txt',
    },
    createdAt: '2024-08-10',
    updatedAt: '2026-10-15',
  },
  {
    id: 'proj-arcane-resourcepack',
    title: 'Arcane 3D Weapons & GUI Pack',
    slug: 'arcane-resourcepack',
    category: 'mc-resourcepacks',
    categoryName: 'Resource Packs',
    summary: 'High-detail 3D weapon models, glowing textures, and dark HUD interface matching ArcaneArsenal.',
    description:
      'A custom Minecraft resource pack featuring 10+ 3D weapon models engineered in Blockbench, custom particle textures, dark sleek inventory GUIs, and CustomModelData mappings designed to plug directly into the ArcaneArsenal plugin.',
    gradientBg: 'from-pink-700 via-rose-800 to-slate-950',
    iconSymbol: '🎨',
    screenshots: [],
    features: [
      '10+ custom 3D item models with dynamic perspective scaling',
      'Dark modern inventory HUD and hotbar replacement',
      'Custom Model Data IDs 10001 through 10012 pre-configured',
      'Optimized lightweight 16x/32x texture maps for high client FPS',
    ],
    technologies: ['Blockbench', 'JSON Model Format', 'Photoshop', 'OptiFine / CIT'],
    status: 'Released',
    featured: false,
    isFree: true,
    version: 'v1.2',
    changelog: 'Added Voidwalker Scythe 3D model and revised hotbar icons.',
    compatibility: {
      mcVersions: ['1.21.4', '1.21.1', '1.20.x'],
    },
    links: {
      downloadUrl: '/downloads/ArcanePack-v1.2.zip',
      documentation: 'D:/Minecraft Development/Minecraft Resource Packs.txt',
    },
    createdAt: '2024-07-20',
    updatedAt: '2026-10-12',
  },
  {
    id: 'proj-livingyuji-cli',
    title: 'LivingYuji Virtual Terminal CLI Tools',
    slug: 'livingyuji-cli',
    category: 'dev-tools',
    categoryName: 'Developer Tools & Automation',
    summary: 'Command-line execution environment for virtual NTFS navigation, system telemetry & diagnostics.',
    description:
      'A virtual terminal emulator built directly into LivingYuji OS providing an interactive command line interface. Includes filesystem utilities (`dir`, `cd`, `cat`, `mkdir`), system diagnostics (`sysinfo`, `theme`), and developer shortcuts.',
    gradientBg: 'from-slate-700 via-slate-800 to-black',
    iconSymbol: '🖥️',
    screenshots: [],
    features: [
      'Interactive command parser supporting standard Windows & Unix syntax',
      'Virtual C: and D: drive navigation and file inspection',
      'Custom theme and wallpaper switcher CLI commands',
      'Z-index window integration and history navigation (Up/Down arrow)',
    ],
    technologies: ['TypeScript', 'Zustand', 'React', 'Shell Emulation'],
    status: 'Released',
    featured: false,
    isFree: true,
    version: 'v1.0',
    links: {
      documentation: 'D:/Developer Tools/Automation & Scripts.txt',
    },
    createdAt: '2024-05-18',
    updatedAt: '2026-10-25',
  },
  {
    id: 'proj-custom-dev-services',
    title: 'LivingYuji Custom Development Services',
    slug: 'custom-dev-services',
    category: 'services',
    categoryName: 'Services & Commissions',
    summary: 'Bespoke web applications, high-performance Minecraft combat plugins, and Discord bots.',
    description:
      'Direct freelance engineering services covering bespoke Next.js systems, PaperMC plugin mechanics, turnkey network setups, and Discord automation. All projects are delivered with comprehensive documentation, clean source code, and dedicated Discord support.',
    gradientBg: 'from-cyan-700 via-blue-800 to-slate-950',
    iconSymbol: '💼',
    screenshots: [],
    features: [
      'Custom Next.js & React full-stack desktop web development',
      'Paper/Purpur Minecraft combat plugins and weapon systems',
      'Turnkey server infrastructure with 20.0 TPS optimization',
      'Automated Discord bot ecosystems with ticket integration',
    ],
    technologies: ['Java', 'TypeScript', 'Next.js', 'PaperMC', 'Discord.js', 'PostgreSQL'],
    status: 'Released',
    featured: true,
    isFree: false,
    price: 250.0,
    links: {
      discordChannelOverride: 'https://discord.gg/livingyuji',
      documentation: 'D:/Web Development/Services & Custom Development.txt',
    },
    createdAt: '2024-01-15',
    updatedAt: '2026-10-25',
  },
];

interface ShowcaseState {
  projects: ShowcaseProject[];
  categories: ShowcaseCategory[];
  activeCategoryId: string;
  viewMode: 'grid' | 'list' | 'category' | 'gallery' | 'timeline';
  searchQuery: string;
  sortBy: 'newest' | 'name' | 'featured' | 'status';
  filterStatus: string;
  filterPrice: 'all' | 'free' | 'paid';
  selectedProjectId: string | null;

  // Actions
  setActiveCategoryId: (catId: string) => void;
  setViewMode: (mode: 'grid' | 'list' | 'category' | 'gallery' | 'timeline') => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'newest' | 'name' | 'featured' | 'status') => void;
  setFilterStatus: (status: string) => void;
  setFilterPrice: (price: 'all' | 'free' | 'paid') => void;
  setSelectedProjectId: (id: string | null) => void;

  // Admin CRUD
  addProject: (project: ShowcaseProject) => void;
  updateProject: (id: string, updates: Partial<ShowcaseProject>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  toggleFeatured: (id: string) => void;
  addCategory: (category: ShowcaseCategory) => void;
  updateCategory: (id: string, updates: Partial<ShowcaseCategory>) => void;
  deleteCategory: (id: string) => void;
  resetToDefaultProjects: () => void;
}

export const useShowcaseStore = create<ShowcaseState>()(
  persist(
    (set, get) => ({
      projects: INITIAL_PROJECTS,
      categories: DEFAULT_CATEGORIES,
      activeCategoryId: 'all',
      viewMode: 'grid',
      searchQuery: '',
      sortBy: 'featured',
      filterStatus: 'all',
      filterPrice: 'all',
      selectedProjectId: null,

      setActiveCategoryId: (catId) => set({ activeCategoryId: catId }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setFilterStatus: (status) => set({ filterStatus: status }),
      setFilterPrice: (price) => set({ filterPrice: price }),
      setSelectedProjectId: (id) => set({ selectedProjectId: id }),

      addProject: (newProject) => {
        set((state) => ({ projects: [newProject, ...state.projects] }));
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : p
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId,
        }));
      },

      duplicateProject: (id) => {
        const p = get().projects.find((proj) => proj.id === id);
        if (!p) return;
        const copy: ShowcaseProject = {
          ...p,
          id: `proj-${Date.now()}`,
          title: `${p.title} (Copy)`,
          slug: `${p.slug}-copy`,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        };
        set((state) => ({ projects: [copy, ...state.projects] }));
      },

      toggleFeatured: (id) => {
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p)),
        }));
      },

      addCategory: (category) => {
        set((state) => ({ categories: [...state.categories, category] }));
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
      },

      resetToDefaultProjects: () => {
        set({ projects: INITIAL_PROJECTS, categories: DEFAULT_CATEGORIES });
      },
    }),
    {
      name: 'livingyuji_showcase_projects_v1',
    }
  )
);
