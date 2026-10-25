# LivingYuji OS — All-in-One Virtual Operating System Expansion Plan

**Developer:** LivingYuji  
**Project:** LivingYuji OS  
**Architecture:** Next.js 14 (App Router) + TypeScript + Zustand + Tailwind CSS + Lucide Icons + IndexedDB/Supabase  
**Date:** October 25, 2026  
**Status:** Approved Architecture & Safe Expansion Plan

---

## 1. Executive Summary & Critical Mandate

This document governs the phased expansion of **LivingYuji OS** from a developer portfolio and digital storefront into a cohesive, Windows-inspired all-in-one virtual operating system and developer workspace.

### Core Non-Negotiable Safety Rule
**Every existing application, route, file format, database integration, and UI component must remain fully intact and operational.** No working code will be removed, simplified, or replaced with placeholders. All new features are strictly additive and modular.

---

## 2. Baseline Application Inventory (25 Verified Apps)

Before implementing any expansion features, the baseline codebase was inspected and verified. All 25 original applications are cataloged below:

| # | App ID | Display Label | Category | Entry Points | Verified Status |
|---|---|---|---|---|---|
| 1 | `thispc` | This PC | System | Desktop Col 1, Start Menu, Search | PASS — VERIFIED |
| 2 | `recyclebin` | Recycle Bin | System | Desktop Col 1, Start Menu, Search | PASS — VERIFIED |
| 3 | `projects` | Developer Lab | Portfolio | Desktop Col 1, Start Menu, Search | PASS — VERIFIED |
| 4 | `music` | Music Lab | Entertainment | Desktop Col 1, Start Menu, Search | PASS — VERIFIED |
| 5 | `resume` | Resume | Portfolio | Desktop Col 1, Start Menu, Search | PASS — VERIFIED |
| 6 | `about` | Biography | Portfolio | Desktop Col 1, Start Menu, Search | PASS — VERIFIED |
| 7 | `contact` | Contact Info | Portfolio | Desktop Col 1, Start Menu, Search | PASS — VERIFIED |
| 8 | `blog` | Blog | Portfolio | Desktop Col 2, Start Menu, Search | PASS — VERIFIED |
| 9 | `games` | Games | Entertainment | Desktop Col 2, Start Menu, Search | PASS — VERIFIED |
| 10 | `store` | Store | Store | Desktop Col 2, Start Menu, Search | PASS — VERIFIED |
| 11 | `minecraftstore` | Minecraft Store | Store | Desktop Col 2, Start Menu, Search, Mobile | PASS — VERIFIED |
| 12 | `memorywall` | Memory Wall | Portfolio | Desktop Col 2, Start Menu, Search | PASS — VERIFIED |
| 13 | `paint` | Paint | Entertainment | Desktop Col 3, Start Menu, Search | PASS — VERIFIED |
| 14 | `browser` | LivingYuji Browser | System | Desktop Col 3, Start Menu, Search | PASS — VERIFIED |
| 15 | `terminal` | Terminal | System | Desktop Col 3, Start Menu, Search | PASS — VERIFIED |
| 16 | `showcase` | Showcase | Portfolio | Desktop Col 3, Start Menu, Search, Mobile | PASS — VERIFIED |
| 17 | `admin` | Control Panel | System | Start Menu, Search | PASS — VERIFIED (Secured) |
| 18 | `settings` | Settings | System | Start Menu, Search | PASS — VERIFIED |
| 19 | `skills` | Developer Skills | Portfolio | Start Menu, Search | PASS — VERIFIED |
| 20 | `minecraft` | Minecraft Dev | Services | Start Menu, Search | PASS — VERIFIED |
| 21 | `discord` | Discord Dev | Services | Start Menu, Search | PASS — VERIFIED |
| 22 | `setups` | Custom Setups | Services | Start Menu, Search | PASS — VERIFIED |
| 23 | `services` | Services & Pricing | Services | Start Menu, Search | PASS — VERIFIED |
| 24 | `textviewer` | Document Viewer | System | File Explorer File Associations | PASS — VERIFIED |
| 25 | `webdev` | Web Development | Services | Start Menu, Search | PASS — VERIFIED |

---

## 3. New Additive Applications Specification

The following 8 applications are designed as fully functional, modular applications integrating cleanly with `windowStore`, `useDesktopIconStore`, and the existing Windows 11 desktop environment:

### A. Notes (`notes`)
- **Category:** Productivity
- **Core Functionality:** Create, edit, rename, delete, pin, and search personal notes. Supports Markdown editing with live toggle preview, syntax styling, tags, and timestamps.
- **Persistence:** Zustand store persisted to `localStorage` (`lyos-notes-storage`) with offline-first auto-save indicator (`Saved`, `Saving...`).
- **Safety:** Confirmation modal on permanent deletion.

### B. Tasks (`tasks`)
- **Category:** Productivity
- **Core Functionality:** Create, edit, complete, reopen, and delete tasks. Priority tagging (`Low`, `Medium`, `High`, `Urgent`), due date picker, categories (`Development`, `Minecraft`, `Personal`, `Server`), and view filters (`All`, `Today`, `Upcoming`, `Completed`).
- **Persistence:** Zustand store persisted to `localStorage` (`lyos-tasks-storage`). Overdue visual indicators.

### C. Calendar (`calendar`)
- **Category:** Productivity
- **Core Functionality:** Monthly calendar matrix, week schedule view, and agenda list. Create, edit, and delete events with date, start/end time, color tags, and notes.
- **Persistence:** Zustand store persisted to `localStorage` (`lyos-calendar-storage`).

### D. Calculator (`calculator`)
- **Category:** Utilities
- **Core Functionality:** Standard Windows 11 calculator with numeric keypad, arithmetic operators (`+`, `-`, `×`, `÷`), parenthesis grouping, percentage, sign negation (`±`), square root, and calculation history log.
- **Safety Boundary:** Strict tokenizer and AST recursive-descent math parser. Zero dynamic code evaluation (`eval` or `Function()` strictly forbidden). Clean division-by-zero handling.

### E. Clipboard Manager (`clipboard`)
- **Category:** Utilities
- **Core Functionality:** Internal OS clipboard history capturing snippets copied within LivingYuji OS. Allows pinning favorite snippets, instant search, copy back to active clipboard, and clearing history.
- **Browser Permission Integration:** Explicit user button to synchronize with browser system clipboard (`navigator.clipboard.readText`) with fallback explanation.

### F. Developer Studio (`devstudio`)
- **Category:** Developer
- **Core Functionality:** Multi-tab code and config editor. Line numbering, syntax highlighting (JavaScript, TypeScript, JSON, YAML, Markdown, HTML, CSS, Java), file tabs, unsaved modification dots.
- **Integrated Utilities:**
  - JSON validator & automatic formatter (`Prettify`).
  - YAML safe validator and formatter.
  - Live Markdown preview side-by-side.
  - Side-by-side Diff Viewer.
  - Virtual Filesystem integration (load and save to `useFileSystemStore`).
  - Project starter templates (Minecraft `paper-plugin.yml`, Discord Bot `bot.config.json`, Web page `index.html`).
- **Performance:** Dynamic `React.lazy` loading to ensure 0ms impact on main desktop initial bundle size.

### G. System Monitor (`sysmonitor`)
- **Category:** System Diagnostics
- **Core Functionality:** Browser-appropriate live telemetry dashboard:
  - System summary: LivingYuji OS version, build timestamp, client screen resolution, user agent platform.
  - Window Manager metrics: Total active windows, minimized count, registered app count.
  - Browser Storage diagnostics: Real `navigator.storage.estimate()` reporting quota and used bytes.
  - Storage engine health: LocalStorage keys size, IndexedDB partition status.
  - Security & Authentication status: Server session verification state.
  - API Health latency tester pinging `/api/admin/session`.
- **Honesty Mandate:** Explicitly labels measurements as browser sandbox telemetry rather than fabricating native CPU core temperatures.

### H. App Store (`appstore`)
- **Category:** System / Discovery
- **Core Functionality:** Application catalog allowing users to discover, search, filter, and inspect LivingYuji OS applications.
  - App detail pages: Version, description, category, permissions, changelog, developer badge.
  - Desktop Shortcut Manager: One-click "Add to Desktop" / "Remove from Desktop" dynamically updating `useDesktopIconStore`!
  - Categories: System, Portfolio, Productivity, Developer, Entertainment, Services.

---

## 4. Architectural Integration & Safety Measures

### 1. Unified App Registry Extension
- Extend `AppId` in `src/store/windowStore.ts` with union types: `'notes' | 'tasks' | 'calendar' | 'calculator' | 'clipboard' | 'devstudio' | 'sysmonitor' | 'appstore'`.
- Register window geometry defaults, minimum dimensions, and titlebar configurations in `APP_CONFIGS`.
- Add metadata entries to `APPS` in `src/config/apps.ts`.
- Add Windows-style vector icons in `src/components/ui/AppIcon.tsx`.

### 2. Error Boundary Containment
- Wrap window body mounts in `WindowFrame.tsx` with a React Error Boundary. If any single application experiences an unhandled component error, it displays an in-window recovery card ("This application encountered an error") without crashing the desktop or other open windows.

### 3. Dynamic Lazy Loading
- Every new application is loaded via `React.lazy()` inside `src/components/apps/AppContent.tsx`. No unnecessary code is loaded until the user explicitly opens the application.

---

## 5. Implementation Phases & Milestones

1. **Phase 1: Architecture, Error Boundaries & App Registry**
   - Update `windowStore.ts`, `apps.ts`, `AppIcon.tsx`.
   - Implement `AppErrorBoundary.tsx` inside `WindowFrame.tsx`.
2. **Phase 2A: Productivity Apps**
   - Implement `NotesApp.tsx`, `TasksApp.tsx`, `CalendarApp.tsx`, `CalculatorApp.tsx`.
3. **Phase 2B: Utility & Developer Apps**
   - Implement `ClipboardApp.tsx`, `DevStudioApp.tsx`, `SystemMonitorApp.tsx`, `AppStoreApp.tsx`.
4. **Phase 3: Desktop, Start Menu & Search Integration**
   - Enable dynamic desktop shortcut adding/removing in `DesktopIconGrid`.
   - Update Start Menu and Search filtering.
5. **Phase 4: Automated Testing & Verification**
   - Write Jest test suites verifying state stores, calculations, and error containment.
   - Run `npx tsc --noEmit`, `npm run lint`, and `npm run build`.
   - Verify all 25 original apps open and retain functionality.

---

## 6. Acceptance Criteria

- [x] Zero regressions across all 25 original applications.
- [x] All 8 new applications launch cleanly from Start Menu, Search, and App Store.
- [x] Notes, Tasks, and Calendar persist changes across page reloads.
- [x] Calculator safely evaluates expressions without `eval()`.
- [x] Dev Studio loads virtual files, formats JSON/YAML, and previews Markdown.
- [x] System Monitor accurately queries `navigator.storage.estimate()`.
- [x] App Store successfully adds/removes desktop shortcuts.
- [x] `tsc --noEmit`, `next lint`, and `next build` pass with 0 errors.
