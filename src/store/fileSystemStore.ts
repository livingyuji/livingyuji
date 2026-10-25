import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface VFile {
  id: string;
  name: string;
  parentId: string; // folder id or 'C:' or 'D:' or 'trash'
  drive: 'C:' | 'D:';
  type: 'folder' | 'file' | 'image' | 'audio' | 'text' | 'code' | 'app';
  extension?: string;
  size?: number; // bytes
  createdAt: string;
  modifiedAt: string;
  content?: string; // text content or data URI or app launch id
  associatedApp?: string; // e.g. 'paint', 'music', 'projects', 'store'
  originalParentId?: string; // for recycle bin restore
}

interface FileSystemState {
  files: VFile[];
  clipboard: { action: 'copy' | 'cut'; fileId: string } | null;

  createFolder: (parentId: string, drive: 'C:' | 'D:', name?: string) => string;
  createFile: (parentId: string, drive: 'C:' | 'D:', name: string, type: VFile['type'], content?: string, extension?: string) => string;
  deleteItem: (id: string) => void;
  restoreItem: (id: string) => void;
  permanentlyDeleteItem: (id: string) => void;
  emptyRecycleBin: () => void;
  renameItem: (id: string, newName: string) => void;
  copyItem: (id: string) => void;
  cutItem: (id: string) => void;
  pasteItem: (targetFolderId: string) => void;
  updateFileContent: (id: string, content: string) => void;
  uploadFile: (parentId: string, drive: 'C:' | 'D:', fileData: { name: string; size: number; content?: string }) => string;
  resetToDefaultFileSystem: () => void;
}

const DEFAULT_FILES: VFile[] = [
  // C: Drive Structure (System & User)
  { id: 'c-root', name: 'Local Disk (C:)', parentId: '', drive: 'C:', type: 'folder', createdAt: '2026-10-25', modifiedAt: '2026-10-25' },
  { id: 'c-users', name: 'Users', parentId: 'c-root', drive: 'C:', type: 'folder', createdAt: '2026-10-25', modifiedAt: '2026-10-25' },
  { id: 'c-user-livingyuji', name: 'LivingYuji', parentId: 'c-users', drive: 'C:', type: 'folder', createdAt: '2026-10-25', modifiedAt: '2026-10-25' },
  
  // User Folders
  { id: 'u-desktop', name: 'Desktop', parentId: 'c-user-livingyuji', drive: 'C:', type: 'folder', createdAt: '2026-10-25', modifiedAt: '2026-10-25' },
  { id: 'u-documents', name: 'Documents', parentId: 'c-user-livingyuji', drive: 'C:', type: 'folder', createdAt: '2026-10-25', modifiedAt: '2026-10-25' },
  { id: 'u-downloads', name: 'Downloads', parentId: 'c-user-livingyuji', drive: 'C:', type: 'folder', createdAt: '2026-10-25', modifiedAt: '2026-10-25' },
  { id: 'u-pictures', name: 'Pictures', parentId: 'c-user-livingyuji', drive: 'C:', type: 'folder', createdAt: '2026-10-25', modifiedAt: '2026-10-25' },
  { id: 'u-music', name: 'Music', parentId: 'c-user-livingyuji', drive: 'C:', type: 'folder', createdAt: '2026-10-25', modifiedAt: '2026-10-25' },
  
  // Documents Content
  {
    id: 'doc-about',
    name: 'About_LivingYuji.txt',
    parentId: 'u-documents',
    drive: 'C:',
    type: 'text',
    extension: 'txt',
    size: 512,
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
    content: `LivingYuji — Independent Developer & Creator\nSpecializing in:\n- Minecraft Plugin Development (Paper, Purpur, Fabric)\n- Discord Bot Development & Community Automation\n- Modern Responsive Full-Stack Web Development\n- Turnkey Server Setups & Architecture\n\nVisit: https://livingyuji.com\nDiscord: LivingYuji\nGitHub: https://github.com/livingyuji`,
  },
  {
    id: 'doc-services',
    name: 'Services_and_Pricing.txt',
    parentId: 'u-documents',
    drive: 'C:',
    type: 'text',
    extension: 'txt',
    size: 420,
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
    content: `Custom Development Services:\n1. Custom Paper/Purpur Plugin Development\n2. Discord Bot System Architecture\n3. Full-Stack Web Application Development\n4. Minecraft Server Setup (Survival, Lifesteal, PvP)\n\nQuotes available via the Contact form or Services app.`,
  },
  
  // Pictures Content
  {
    id: 'pic-wallpaper',
    name: 'Matrix_Cyber_Wallpaper.png',
    parentId: 'u-pictures',
    drive: 'C:',
    type: 'image',
    extension: 'png',
    size: 1024 * 128,
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
    associatedApp: 'paint',
  },
  {
    id: 'pic-logo',
    name: 'LivingYuji_Monogram.png',
    parentId: 'u-pictures',
    drive: 'C:',
    type: 'image',
    extension: 'png',
    size: 1024 * 64,
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
    associatedApp: 'paint',
  },

  // Downloads Content
  {
    id: 'dl-arcane',
    name: 'ArcaneArsenal-v1.21.jar',
    parentId: 'u-downloads',
    drive: 'C:',
    type: 'file',
    extension: 'jar',
    size: 1024 * 512,
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
    associatedApp: 'store',
  },
  {
    id: 'dl-vantacombat',
    name: 'VantaCombat-v1.0.jar',
    parentId: 'u-downloads',
    drive: 'C:',
    type: 'file',
    extension: 'jar',
    size: 1024 * 410,
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
    associatedApp: 'store',
  },

  // D: Drive Structure (My Projects)
  { id: 'd-root', name: 'D: — My Projects', parentId: '', drive: 'D:', type: 'folder', createdAt: '2026-10-25', modifiedAt: '2026-10-25' },
  { id: 'd-web-dev', name: 'Web Development', parentId: 'd-root', drive: 'D:', type: 'folder', createdAt: '2026-10-25', modifiedAt: '2026-10-25' },
  { id: 'd-mc-dev', name: 'Minecraft Development', parentId: 'd-root', drive: 'D:', type: 'folder', createdAt: '2026-10-25', modifiedAt: '2026-10-25' },
  { id: 'd-discord-dev', name: 'Discord Development', parentId: 'd-root', drive: 'D:', type: 'folder', createdAt: '2026-10-25', modifiedAt: '2026-10-25' },
  { id: 'd-dev-tools', name: 'Developer Tools', parentId: 'd-root', drive: 'D:', type: 'folder', createdAt: '2026-10-25', modifiedAt: '2026-10-25' },
  { id: 'd-automation', name: 'Automation & Scripts', parentId: 'd-root', drive: 'D:', type: 'folder', createdAt: '2026-10-25', modifiedAt: '2026-10-25' },
  { id: 'd-ui-exp', name: 'UI & Experiments', parentId: 'd-root', drive: 'D:', type: 'folder', createdAt: '2026-10-25', modifiedAt: '2026-10-25' },
  { id: 'd-released', name: 'Released Projects', parentId: 'd-root', drive: 'D:', type: 'folder', createdAt: '2026-10-25', modifiedAt: '2026-10-25' },
  { id: 'd-docs', name: 'Project Documentation', parentId: 'd-root', drive: 'D:', type: 'folder', createdAt: '2026-10-25', modifiedAt: '2026-10-25' },

  // Root Files in D: — My Projects
  {
    id: 'd-resume-txt',
    name: 'Resume.txt',
    parentId: 'd-root',
    drive: 'D:',
    type: 'text',
    extension: 'txt',
    size: 1024 * 12,
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
    content: `LIVINGYUJI RESUME

Verified professional profile

A public, evidence-led resume covering LivingYuji's multidisciplinary practice, selected live work, official releases, and current areas of expertise.

PROFESSIONAL PROFILE
LivingYuji works across conceptual development, creative production, front-end architecture, digital strategy, and experience design. His practice is centered on turning complex ideas into coherent systems: products that can be used, stories that can be followed, and public information that can be verified. He is based in India, and develops independent work across technology, Minecraft, and web platforms.

CURRENT PRACTICE
Independent multidisciplinary practice based in India. Current work includes LivingYuji OS, an interactive web application and official identity hub; concept-led software releases published under his own artist and developer name; content architecture; technical SEO; structured data; and admin-managed publishing systems.

CORE EXPERTISE
- Full-Stack Architecture & Desktop OS Fidelity (React, Next.js, TypeScript, Tailwind)
- Minecraft Systems Engineering (Java, PaperMC, Purpur, Velocity, Packet Events)
- Discord Bot & Automation Infrastructure (Node.js, Discord.js, REST APIs)
- High-Throughput Databases (PostgreSQL, Supabase, Redis)
- UI/UX Engineering, Responsive Interaction & Micro-Animations

SELECTED WORK & ARCHITECTURAL SYSTEMS
- LivingYuji OS — Virtual Windows 11 browser operating system, portfolio and media workspace.
- ArcaneArsenal — Production-grade custom weapon engine with 10+ mythical items, raycasted particle effects, and CustomModelData integration.
- VantaCombat — High tick-rate PvP engine featuring instant hit registration, custom knockback curves, and combat tagging.
- Raven Everywhere — Enterprise Discord bot ecosystem managing moderation, tickets, role sync, and real-time announcements.
- Minecraft Turnkey Setups — High-concurrency network architectures engineered for 100+ concurrent players at 20.0 TPS.

EXPERIENCE & ROLES
- Lead Software Architect & Creator — LivingYuji Systems (2021 – Present)
- Minecraft Plugin & Systems Specialist — Independent Commissions (2022 – Present)
- Community Systems & Bot Engineer — Various Discord Communities (2023 – Present)

VERIFICATION & LINKS
- Official Website: https://livingyuji.com
- Discord Community: discord.gg/livingyuji
- GitHub Repository: github.com/livingyuji
- Digital Store: Official LivingYuji Marketplace
- Contact: Official LivingYuji Desk`,
  },
  {
    id: 'd-portfolio-txt',
    name: 'Portfolio.txt',
    parentId: 'd-root',
    drive: 'D:',
    type: 'text',
    extension: 'txt',
    size: 1024 * 8,
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
    content: `Project Name: LivingYuji OS Developer Portfolio Highlights
Category: Portfolio Showcase
Status: Active
Description: Flagship projects spanning browser operating systems, magical combat plugins, and community bots.
Key Features:
- LivingYuji OS: Full web desktop with window manager and synthesizers
- ArcaneArsenal: 10+ mythical weapons with raycasted particle physics
- VantaCombat: High-tickrate hit registration and combat tag engine
- Raven Everywhere: Multi-server Discord bot with moderation and web dashboard
Technologies: Next.js 14, React 18, TypeScript, Paper 1.21, Discord.js, Web Audio API
My Role: Creator & Architecture Lead
Links: https://github.com/livingyuji
Notes: Real functional code verified across all target environments.`,
  },

  // Files inside Web Development
  {
    id: 'p-web-livingyujios',
    name: 'LivingYuji OS.txt',
    parentId: 'd-web-dev',
    drive: 'D:',
    type: 'text',
    extension: 'txt',
    size: 1024 * 14,
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
    content: `Project Name: LivingYuji OS — Web Operating System
Category: Web Systems & Developer Portfolio
Status: Released & Active
Description: A high-fidelity browser-based Windows 11 desktop operating system and digital storefront built with Next.js 14, React 18, and TypeScript.
Key Features:
- Window Manager: Z-index stacking, dragging physics, boundary snapping, minimize/maximize
- Action Center & Quick Settings: Wi-Fi, Bluetooth, Airplane mode, Night light, brightness & volume
- Audio Workstation: Realtime Web Audio chill synthesizer chord progressions
- Arcade Hub: Playable Minesweeper, Snake, and 2048 with score tracking
- Virtual NTFS Filesystem: Drives C:, D: (My Projects), and E: (Music Lab) with real file upload/download
- Start Menu & Taskbar: Active window indicators, search index, and system tray
Technologies: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Zustand 5, Web Audio API
My Role: Full-Stack Architect & UI Designer
Links: https://livingyuji.com | GitHub: https://github.com/livingyuji/livingyuji-os
Notes: Zero placeholder buttons. Built with real browser APIs and persistent local/cloud storage.`,
  },
  {
    id: 'p-web-projects',
    name: 'Web Development Projects.txt',
    parentId: 'd-web-dev',
    drive: 'D:',
    type: 'text',
    extension: 'txt',
    size: 1024 * 9,
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
    content: `Project Name: Full-Stack Web Development Projects
Category: Client Web Portals & Applications
Status: Released
Description: Overview of bespoke websites, customer portals, and web applications developed by LivingYuji.
Key Features:
- Modern headless architectures with sub-100ms loading speeds
- Interactive dashboard UIs with real-time state synchronization
- Responsive desktop and mobile layouts with accessible semantic HTML
- Secure payment integration and automated product delivery
Technologies: React, Next.js, Node.js, PostgreSQL, Tailwind CSS, Vercel
My Role: Lead Full-Stack Developer
Links: https://livingyuji.com/services
Notes: Available for custom contract web development and dashboard engineering.`,
  },
  {
    id: 'p-web-experiments',
    name: 'Portfolio & UI Experiments.txt',
    parentId: 'd-web-dev',
    drive: 'D:',
    type: 'text',
    extension: 'txt',
    size: 1024 * 6,
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
    content: `Project Name: Portfolio & UI Experiments
Category: UI/UX & Experimental Frontend
Status: Active Development
Description: Advanced graphical and procedural experiments inside the browser.
Key Features:
- Realtime HTML5 Canvas phosphor green matrix code rain
- Dynamic desktop silhouette backdrop with cyber lighting shaders
- Window resizing constraints and smooth spring animations
Technologies: Canvas 2D API, CSS Mica/Acrylic Blur, WebGL Shaders
My Role: UI/UX Research & Implementation
Links: https://livingyuji.com
Notes: Continually iterated for desktop performance and 60fps rendering.`,
  },
  {
    id: 'p-web-apps',
    name: 'Web Applications.txt',
    parentId: 'd-web-dev',
    drive: 'D:',
    type: 'text',
    extension: 'txt',
    size: 1024 * 7,
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
    content: `Project Name: Custom Web Applications Suite
Category: SaaS & Interactive Tools
Status: Released
Description: Specialized browser utilities including canvas drawing tools, file managers, and terminal emulators.
Key Features:
- Paint App: Multi-color brush, line tools, fill bucket, and PNG export
- Terminal CLI: Shell emulator with filesystem commands (ls, cat, cd, clear)
- Browser Gateway: Hybrid web viewer with fallback navigation
Technologies: HTML5 Canvas, Blob API, TypeScript, Zustand
My Role: Frontend Systems Engineer
Links: Available directly inside LivingYuji OS
Notes: Designed with native application responsiveness.`,
  },
  {
    id: 'p-web-services',
    name: 'Services & Custom Development.txt',
    parentId: 'd-web-dev',
    drive: 'D:',
    type: 'text',
    extension: 'txt',
    size: 1024 * 5,
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
    content: `Project Name: Development Services & Custom Orders
Category: Professional Services
Status: Open for Commissions
Description: Custom engineering offerings for server owners, creators, and businesses.
Key Features:
- Custom Paper/Purpur plugin development with source code delivery
- Discord bot creation with server moderation and automated ticketing
- Turnkey Minecraft server setups (Lifesteal, Survival, Practice)
- Custom React & Next.js website engineering
Technologies: Java 21, TypeScript, Next.js, PaperMC API, Discord.js
My Role: Solo Developer & Consultant
Links: Contact via Discord: LivingYuji or Services app
Notes: Pricing and turnaround times scoped per project requirements.`,
  },

  // Files inside Minecraft Development
  {
    id: 'p-mc-plugins',
    name: 'Minecraft Plugins.txt',
    parentId: 'd-mc-dev',
    drive: 'D:',
    type: 'text',
    extension: 'txt',
    size: 1024 * 10,
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
    content: `Project Name: Minecraft Plugins Portfolio
Category: Java Server Plugins
Status: Released & Maintained
Description: Custom Spigot, Paper, Purpur, and Folia plugins built for modern Minecraft 1.21+.
Key Features:
- High tickrate efficiency with asynchronous calculations
- CustomModelData resource pack integration
- Configurable YAML presets with live reload (/reload commands)
- ProtocolLib packet handling for client-side visual particles
Technologies: Java 21, PaperMC API, Purpur API, ProtocolLib, NMS
My Role: Lead Plugin Engineer
Links: Available in Minecraft Store app inside LivingYuji OS
Notes: Tested under 50+ concurrent players without tick drops.`,
  },
  {
    id: 'p-mc-arcane',
    name: 'ArcaneArsenal.txt',
    parentId: 'd-mc-dev',
    drive: 'D:',
    type: 'text',
    extension: 'txt',
    size: 1024 * 11,
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
    content: `Project Name: ArcaneArsenal — Magical Weapons Engine
Category: Custom Combat Plugin
Status: Released (v1.4.2)
Description: 10+ mythical weapons with particle rays, sound design, custom cooldowns, and CustomModelData integration.
Key Features:
- Solar Bow, Void Blade, Storm Wand, Arcane Scythe, Frostbrand
- Raycasted projectile physics with custom hitboxes
- Cooldown and mana system with action-bar display
- Full CustomModelData mapping (10001 - 10016)
Technologies: Java 21, Paper 1.21.4, ProtocolLib, Folia-ready
My Role: Creator & Developer
Links: Download available in Minecraft Store
Notes: Compatible with all 1.21.x Paper, Purpur, and Folia servers.`,
  },
  {
    id: 'p-mc-vanta',
    name: 'VantaCombat.txt',
    parentId: 'd-mc-dev',
    drive: 'D:',
    type: 'text',
    extension: 'txt',
    size: 1024 * 8,
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
    content: `Project Name: VantaCombat — High-Tickrate PvP Suite
Category: Server Combat Enhancement
Status: Released (v2.1.0)
Description: Melee hit registration tuning, knockback physics profiles, and combat logging protection.
Key Features:
- Zero-delay melee attack registration
- Configurable horizontal and vertical knockback multipliers
- Combat tag timer with safe-zone enforcement
- Combat log NPC spawner to prevent combat disconnect abuse
Technologies: Java 21, Paper API, Spigot API
My Role: Developer
Links: Minecraft Store
Notes: Designed specifically for competitive PvP and Practice servers.`,
  },
  {
    id: 'p-mc-resourcepacks',
    name: 'Minecraft Resource Packs.txt',
    parentId: 'd-mc-dev',
    drive: 'D:',
    type: 'text',
    extension: 'txt',
    size: 1024 * 7,
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
    content: `Project Name: Minecraft 3D Resource Packs
Category: 3D Models & Textures
Status: Released
Description: Hand-crafted 3D weapon and item models formatted for modern Minecraft CustomModelData.
Key Features:
- 16 custom textured 3D models engineered in Blockbench
- Emissive texture maps for CIT Resewn / OptiFine
- Vanilla client compatibility (no client mods required)
Technologies: Blockbench, JSON Model Format, PNG Textures
My Role: 3D Artist & Texture Designer
Links: Minecraft Store
Notes: Distributed as .mcpack and .zip archives.`,
  },
  {
    id: 'p-mc-setups',
    name: 'Minecraft Server Setups.txt',
    parentId: 'd-mc-dev',
    drive: 'D:',
    type: 'text',
    extension: 'txt',
    size: 1024 * 9,
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
    content: `Project Name: Turnkey Minecraft Server Setups
Category: Server Architecture & Setups
Status: Active Offerings
Description: Complete pre-configured Purpur 1.21 server roots with optimized engine configs, balanced economy, and permissions.
Key Features:
- Lifesteal SMP Ultra: Heart steal, revive beacons, coinflip, auction house
- Practice PvP: Duels, arena generation, kit editors, ELO ranks
- Survival Economy: Custom shops, land claim, ranks, anti-cheat
Technologies: Purpur 1.21.4, LuckPerms, Vault, FastAsyncWorldEdit, Spark
My Role: Server Architect & System Administrator
Links: Minecraft Store & Services
Notes: Tested for 20.0 TPS with Aikar flags.`,
  },
  {
    id: 'p-mc-powers',
    name: 'Custom Weapons & Powers.txt',
    parentId: 'd-mc-dev',
    drive: 'D:',
    type: 'text',
    extension: 'txt',
    size: 1024 * 8,
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
    content: `Project Name: Custom Weapons & Ability Systems
Category: Gameplay Mechanics
Status: Released
Description: Modular ability scripting allowing server owners to create spells, dash attacks, and ultimate abilities.
Key Features:
- Event-driven ability execution (Right-click, Shift-click, Hit entity)
- Particle animations: Spiral beams, shockwaves, nova explosions
- Configurable sound effects from the Minecraft registry
Technologies: Java 21, PaperMC API
My Role: Developer
Links: LivingYuji OS Store
Notes: Zero NMS dependency ensures cross-version compatibility.`,
  },
  {
    id: 'p-mc-overview',
    name: 'Minecraft Projects Overview.txt',
    parentId: 'd-mc-dev',
    drive: 'D:',
    type: 'text',
    extension: 'txt',
    size: 1024 * 8,
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
    content: `Project Name: LivingYuji Minecraft Development Overview
Category: Architecture & Development Summary
Status: Active
Description: Detailed overview of all Minecraft engineering projects, philosophies, and code standards.
Key Features:
- Non-blocking asynchronous threading for databases and WebSockets
- Clean separation between core logic and Spigot/Paper event wrappers
- Strict memory profiling with Spark and Java flight recorder
Technologies: Java 21, Paper, Purpur, Gradle, Git, Velocity
My Role: Lead Systems Engineer
Links: https://github.com/livingyuji
Notes: Dedicated to high performance and seamless gameplay experiences.`,
  },

  // Files inside Discord Development
  {
    id: 'p-discord-raven',
    name: 'Raven Everywhere.txt',
    parentId: 'd-discord-dev',
    drive: 'D:',
    type: 'text',
    extension: 'txt',
    size: 1024 * 10,
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
    content: `Project Name: Raven Everywhere — Discord Bot System
Category: Discord Bot & Community Automation
Status: Released & Active
Description: Multi-guild Discord bot system with slash commands, moderation logging, automated verification, and web management dashboard.
Key Features:
- Slash Commands: Full Discord API v10 slash command suite
- Automated Moderation: Spam filter, anti-raid, link blocker, and timeout management
- Server Economy & Levels: XP tracking, role rewards, voice activity points
- Minecraft Account Linking: In-game verification syncing ranks to Discord roles
Technologies: Discord.js v14, Node.js, TypeScript, PostgreSQL, REST API
My Role: Creator & Backend Developer
Links: Discord Server: LivingYuji
Notes: Actively serving community servers with 99.9% uptime.`,
  },
  {
    id: 'p-discord-arch',
    name: 'Discord Bot Architecture.txt',
    parentId: 'd-discord-dev',
    drive: 'D:',
    type: 'text',
    extension: 'txt',
    size: 1024 * 7,
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
    content: `Project Name: Discord Bot Development Framework
Category: Bot Engineering & Integration
Status: Active Framework
Description: Modular event-driven architecture for rapid deployment of custom community Discord bots.
Key Features:
- Auto-reconnecting gateway client with shard clustering
- PostgreSQL database syncing with connection pooling
- Webhook notification relays for Minecraft deaths, store purchases, and server alerts
Technologies: TypeScript, Discord.js, Prisma ORM, Redis
My Role: Framework Architect
Links: LivingYuji OS Services
Notes: Available for custom commission bot development.`,
  },

  // D: Projects Files
  {
    id: 'p-arcane',
    name: 'ArcaneArsenal_Source',
    parentId: 'd-plugins',
    drive: 'D:',
    type: 'folder',
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
  },
  {
    id: 'p-arcane-readme',
    name: 'README.md',
    parentId: 'p-arcane',
    drive: 'D:',
    type: 'text',
    extension: 'md',
    size: 1200,
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
    content: `# ArcaneArsenal\nMagical weapons and custom ability system for Paper 1.21.\nFeatures:\n- 10+ custom magical weapons\n- Custom model data integration\n- Particle effects and sound design\n- High-performance event handlers`,
  },
  {
    id: 'p-vanta',
    name: 'VantaCombat_Source',
    parentId: 'd-plugins',
    drive: 'D:',
    type: 'folder',
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
  },
  {
    id: 'p-vanta-readme',
    name: 'CONFIG.yml',
    parentId: 'p-vanta',
    drive: 'D:',
    type: 'code',
    extension: 'yml',
    size: 840,
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
    content: `# VantaCombat Configuration\ncombat-tag-duration: 15\nknockback-multiplier: 1.0\nenable-hit-particles: true\npvp-utilities:\n  shield-stun: true\n  sword-block-sound: true`,
  },
  {
    id: 'p-worldmanager',
    name: 'WorldManager_Velocity',
    parentId: 'd-plugins',
    drive: 'D:',
    type: 'folder',
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
  },
  {
    id: 'm-chill-lofi',
    name: 'Cyber_Drift_Lofi.mp3',
    parentId: 'd-media',
    drive: 'D:',
    type: 'audio',
    extension: 'mp3',
    size: 1024 * 1024 * 3,
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
    associatedApp: 'music',
  },
  {
    id: 'm-synth-night',
    name: 'Neon_Midnight_Synth.mp3',
    parentId: 'd-media',
    drive: 'D:',
    type: 'audio',
    extension: 'mp3',
    size: 1024 * 1024 * 4,
    createdAt: '2026-10-25',
    modifiedAt: '2026-10-25',
    associatedApp: 'music',
  },
];

export const useFileSystemStore = create<FileSystemState>()(
  persist(
    (set, get) => ({
      files: DEFAULT_FILES,
      clipboard: null,

      createFolder: (parentId, drive, customName) => {
        const id = `folder-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const existingNames = get().files.filter((f) => f.parentId === parentId).map((f) => f.name);
        let name = customName || 'New Folder';
        let counter = 1;
        while (existingNames.includes(name)) {
          name = `New Folder (${counter++})`;
        }
        const now = new Date().toISOString().split('T')[0];
        const newFolder: VFile = {
          id,
          name,
          parentId,
          drive,
          type: 'folder',
          createdAt: now,
          modifiedAt: now,
        };
        set((state) => ({ files: [...state.files, newFolder] }));
        return id;
      },

      createFile: (parentId, drive, name, type, content = '', extension) => {
        const id = `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const now = new Date().toISOString().split('T')[0];
        const newFile: VFile = {
          id,
          name,
          parentId,
          drive,
          type,
          content,
          extension: extension || name.split('.').pop() || 'txt',
          size: content.length,
          createdAt: now,
          modifiedAt: now,
        };
        set((state) => ({ files: [...state.files, newFile] }));
        return id;
      },

      deleteItem: (id) => {
        set((state) => ({
          files: state.files.map((f) =>
            f.id === id
              ? { ...f, originalParentId: f.parentId, parentId: 'trash' }
              : f
          ),
        }));
      },

      restoreItem: (id) => {
        set((state) => ({
          files: state.files.map((f) => {
            if (f.id === id) {
              const targetParent = f.originalParentId || (f.drive === 'D:' ? 'd-root' : 'u-desktop');
              return { ...f, parentId: targetParent, originalParentId: undefined };
            }
            return f;
          }),
        }));
      },

      permanentlyDeleteItem: (id) => {
        set((state) => ({
          files: state.files.filter((f) => f.id !== id),
        }));
      },

      emptyRecycleBin: () => {
        set((state) => ({
          files: state.files.filter((f) => f.parentId !== 'trash'),
        }));
      },

      renameItem: (id, newName) => {
        if (!newName.trim()) return;
        set((state) => ({
          files: state.files.map((f) =>
            f.id === id
              ? { ...f, name: newName.trim(), modifiedAt: new Date().toISOString().split('T')[0] }
              : f
          ),
        }));
      },

      copyItem: (id) => {
        set({ clipboard: { action: 'copy', fileId: id } });
      },

      cutItem: (id) => {
        set({ clipboard: { action: 'cut', fileId: id } });
      },

      pasteItem: (targetFolderId) => {
        const { clipboard, files } = get();
        if (!clipboard) return;
        const srcFile = files.find((f) => f.id === clipboard.fileId);
        if (!srcFile) return;

        const targetFolder = files.find((f) => f.id === targetFolderId);
        const targetDrive = targetFolder ? targetFolder.drive : srcFile.drive;

        if (clipboard.action === 'cut') {
          set((state) => ({
            files: state.files.map((f) =>
              f.id === srcFile.id ? { ...f, parentId: targetFolderId, drive: targetDrive } : f
            ),
            clipboard: null,
          }));
        } else {
          // Copy
          const newId = `copy-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          const copyName = srcFile.name.includes('.')
            ? `${srcFile.name.substring(0, srcFile.name.lastIndexOf('.'))} - Copy.${srcFile.extension}`
            : `${srcFile.name} - Copy`;
          const now = new Date().toISOString().split('T')[0];
          const newFile: VFile = {
            ...srcFile,
            id: newId,
            name: copyName,
            parentId: targetFolderId,
            drive: targetDrive,
            createdAt: now,
            modifiedAt: now,
          };
          set((state) => ({ files: [...state.files, newFile] }));
        }
      },

      updateFileContent: (id, content) => {
        const now = new Date().toISOString().split('T')[0];
        set((state) => ({
          files: state.files.map((f) =>
            f.id === id ? { ...f, content, size: content.length, modifiedAt: now } : f
          ),
        }));
      },

      uploadFile: (parentId, drive, fileData) => {
        const id = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const now = new Date().toISOString().split('T')[0];
        const ext = fileData.name.includes('.') ? fileData.name.split('.').pop() || 'bin' : 'bin';
        const type: VFile['type'] = ['txt', 'md', 'json', 'yml', 'yaml', 'sk'].includes(ext)
          ? 'text'
          : ['png', 'jpg', 'jpeg', 'svg', 'gif'].includes(ext)
          ? 'image'
          : ['mp3', 'wav', 'ogg'].includes(ext)
          ? 'audio'
          : 'file';

        const newFile: VFile = {
          id,
          name: fileData.name,
          parentId,
          drive,
          type,
          extension: ext,
          size: fileData.size,
          createdAt: now,
          modifiedAt: now,
          content: fileData.content,
        };

        set((state) => ({ files: [...state.files, newFile] }));
        return id;
      },

      resetToDefaultFileSystem: () => {
        set({ files: DEFAULT_FILES, clipboard: null });
      },
    }),
    {
      name: 'lyos-filesystem',
    }
  )
);
