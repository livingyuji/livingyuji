'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useShowcaseStore, ShowcaseProject, ProjectStatus } from '@/store/showcaseStore';
import { useWindowStore } from '@/store/windowStore';
import { DiscordPurchaseModal } from '@/components/common/DiscordPurchaseModal';
import {
  Search,
  LayoutGrid,
  List,
  FolderKanban,
  Image as ImageIcon,
  Calendar,
  ExternalLink,
  Download,
  Github,
  BookOpen,
  Sparkles,
  ArrowLeft,
  Tag,
  CheckCircle2,
  Clock,
  Layers,
  Cpu,
  Shield,
  MessageSquare,
  Boxes,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  Filter,
  Check,
} from 'lucide-react';

export function ShowcaseApp() {
  const {
    projects,
    categories,
    activeCategoryId,
    setActiveCategoryId,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filterStatus,
    setFilterStatus,
    filterPrice,
    setFilterPrice,
    selectedProjectId,
    setSelectedProjectId,
  } = useShowcaseStore();

  const { openWindow } = useWindowStore();

  // Cloud Projects Hydration from Supabase
  useEffect(() => {
    fetch('/api/admin/showcase')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.projects) && data.projects.length > 0) {
          const mapped = data.projects.map((p: any) => ({
            ...p,
            title: p.title || p.name || 'Untitled Project',
            summary: p.summary || p.short_description || (p.description ? p.description.slice(0, 100) : '') || '',
            description: p.description || '',
            status: p.status || 'Active',
            category: p.category_id || p.category || 'web-apps',
            categoryName: p.category_name || (p.category_id === 'mc-plugins' ? 'Minecraft Plugins' : 'Websites & Web Apps'),
            gradientBg: p.gradient_bg || p.gradientBg || 'from-blue-600 to-indigo-900',
            iconSymbol: p.icon_symbol || p.iconSymbol || '⚡',
            isFree: p.is_free !== undefined ? p.is_free : true,
            price: Number(p.price) || 0,
            technologies: Array.isArray(p.technologies) ? p.technologies : [],
            links: p.links || {
              github: p.github_url || '',
              liveUrl: p.live_url || '',
              downloadUrl: p.download_url || '',
            },
            createdAt: p.createdAt || p.created_at || new Date().toISOString(),
            updatedAt: p.updatedAt || p.updated_at || p.createdAt || p.created_at || new Date().toISOString(),
          }));
          useShowcaseStore.setState({ projects: mapped });
        }
      })
      .catch(() => {});
  }, []);

  // Discord Purchase Modal State
  const [selectedProductForDiscord, setSelectedProductForDiscord] = useState<{
    id: string;
    name: string;
    category?: string;
    price: number | string;
  } | null>(null);

  // Active detail project
  const activeDetailProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [selectedProjectId, projects]);

  // Filtered & Sorted Projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => p.status !== 'Private') // Hide private projects from public visitors
      .filter((p) => {
        if (activeCategoryId === 'all') return true;
        return p.category === activeCategoryId;
      })
      .filter((p) => {
        if (filterStatus === 'all') return true;
        return p.status === filterStatus;
      })
      .filter((p) => {
        if (filterPrice === 'free') return p.isFree;
        if (filterPrice === 'paid') return !p.isFree;
        return true;
      })
      .filter((p) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          (p.title || '').toLowerCase().includes(q) ||
          (p.summary || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.categoryName || '').toLowerCase().includes(q) ||
          (Array.isArray(p.technologies) && p.technologies.some((t: string) => (t || '').toLowerCase().includes(q))) ||
          (p.compatibility?.mcVersions && Array.isArray(p.compatibility.mcVersions) && p.compatibility.mcVersions.some((v: string) => (v || '').toLowerCase().includes(q)))
        );
      })
      .sort((a, b) => {
        const aUpdated = a.updatedAt || a.createdAt || '';
        const bUpdated = b.updatedAt || b.createdAt || '';
        const aCreated = a.createdAt || '';
        const bCreated = b.createdAt || '';
        const aTitle = a.title || '';
        const bTitle = b.title || '';
        const aStatus = a.status || '';
        const bStatus = b.status || '';

        if (sortBy === 'featured') {
          if (a.featured !== b.featured) return a.featured ? -1 : 1;
          return bUpdated.localeCompare(aUpdated);
        }
        if (sortBy === 'newest') {
          return bCreated.localeCompare(aCreated);
        }
        if (sortBy === 'name') {
          return aTitle.localeCompare(bTitle);
        }
        if (sortBy === 'status') {
          return aStatus.localeCompare(bStatus);
        }
        return 0;
      });
  }, [projects, activeCategoryId, filterStatus, filterPrice, searchQuery, sortBy]);

  // Featured Spotlight Projects
  const featuredProjects = useMemo(() => {
    return projects.filter((p) => p.featured && p.status !== 'Private').slice(0, 3);
  }, [projects]);

  // Handle Free Download
  const handleDownload = (project: ShowcaseProject) => {
    if (project.links?.downloadUrl) {
      const a = document.createElement('a');
      a.href = project.links.downloadUrl;
      a.download = `${project.slug}-${project.version || 'v1.0'}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Generate real documentation file download
      const content = `# LivingYuji Showcase Package: ${project.title}
Version: ${project.version || 'v1.0'}
Category: ${project.categoryName}
Status: ${project.status}
Updated: ${project.updatedAt}

${project.description}

Key Features:
${project.features.map((f) => `- ${f}`).join('\n')}

Technologies: ${project.technologies.join(', ')}
${project.links.github ? `GitHub: ${project.links.github}` : ''}
Discord: https://discord.gg/livingyuji
Official Site: https://livingyuji.com
`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.slug}-specifications.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'Released':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'In Development':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Beta':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'Coming Soon':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Archived':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default:
        return 'bg-white/10 text-slate-300 border-white/10';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0B0E17] text-slate-100 select-none overflow-hidden font-sans text-xs">
      {/* 1. TOP NAVIGATION & FILTER BAR */}
      <div className="h-14 px-5 bg-[#121622] border-b border-white/10 flex items-center justify-between gap-4 shrink-0 select-none">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0078D4] to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-white text-sm tracking-tight">LivingYuji Showcase</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold">
                {filteredProjects.length} Projects
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Master Portfolio, Game Engines & Systems Library</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-72 hidden sm:block">
          <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, technologies, Minecraft versions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A1F2C] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#0078D4] transition-colors"
          />
        </div>

        {/* View Mode & Controls */}
        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#1A1F2C] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none hidden md:block"
          >
            <option value="featured">Featured First</option>
            <option value="newest">Newest Releases</option>
            <option value="name">Name (A-Z)</option>
            <option value="status">By Status</option>
          </select>

          {/* Pricing Filter */}
          <select
            value={filterPrice}
            onChange={(e) => setFilterPrice(e.target.value as any)}
            className="bg-[#1A1F2C] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none hidden lg:block"
          >
            <option value="all">All Pricing</option>
            <option value="free">Free Items</option>
            <option value="paid">Commercial / Services</option>
          </select>

          {/* View Mode Switcher Pill */}
          <div className="flex items-center bg-[#1A1F2C] border border-white/10 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-[#0078D4] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-[#0078D4] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setViewMode('category')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'category' ? 'bg-[#0078D4] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Category Grouped View"
            >
              <FolderKanban size={14} />
            </button>
            <button
              onClick={() => setViewMode('gallery')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'gallery' ? 'bg-[#0078D4] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Visual Gallery View"
            >
              <ImageIcon size={14} />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'timeline' ? 'bg-[#0078D4] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Release Timeline View"
            >
              <Calendar size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE WITH SIDEBAR */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR CATEGORY NAVIGATION */}
        <div className="w-56 bg-[#10141F] border-r border-white/10 flex flex-col shrink-0 select-none">
          <div className="p-3 border-b border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Categories
          </div>

          <div className="p-2 space-y-1 overflow-y-auto flex-1 window-scroll">
            {categories
              .filter((c) => c.visible)
              .map((cat) => {
                const isActive = activeCategoryId === cat.id;
                const count =
                  cat.id === 'all'
                    ? projects.filter((p) => p.status !== 'Private').length
                    : projects.filter((p) => p.category === cat.id && p.status !== 'Private').length;

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategoryId(cat.id);
                      if (selectedProjectId) setSelectedProjectId(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-[#0078D4] text-white font-bold shadow-md shadow-sky-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>{cat.icon}</span>
                      <span className="truncate text-xs">{cat.name}</span>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                        isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
          </div>

          {/* Quick Help Card */}
          <div className="p-3 border-t border-white/10 bg-black/20 space-y-1.5">
            <div className="text-[10px] font-bold text-slate-300">Need Custom Engineering?</div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Commissions open for Paper plugins, Next.js web systems & bots.
            </p>
            <button
              onClick={() => openWindow('contact')}
              className="w-full mt-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold text-[10px] transition-colors"
            >
              Request Quote
            </button>
          </div>
        </div>

        {/* MAIN DISPLAY AREA */}
        <div className="flex-1 overflow-y-auto window-scroll p-6 space-y-6">
          {/* A. DETAIL VIEW (IF PROJECT SELECTED) */}
          {activeDetailProject ? (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
              {/* Back Button */}
              <button
                onClick={() => setSelectedProjectId(null)}
                className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Back to All Showcase Projects</span>
              </button>

              {/* Project Hero Card */}
              <div className="p-6 rounded-2xl bg-[#141824] border border-white/10 space-y-4 shadow-xl relative overflow-hidden">
                <div className={`absolute -right-16 -top-16 w-60 h-60 bg-gradient-to-br ${activeDetailProject.gradientBg} opacity-20 blur-3xl pointer-events-none`} />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${activeDetailProject.gradientBg} flex items-center justify-center text-3xl shadow-lg border border-white/20`}>
                      {activeDetailProject.iconSymbol}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(activeDetailProject.status)}`}>
                          {activeDetailProject.status}
                        </span>
                        {activeDetailProject.version && (
                          <span className="text-[10px] font-mono text-slate-400">
                            {activeDetailProject.version}
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300">
                          {activeDetailProject.categoryName}
                        </span>
                      </div>
                      <h2 className="text-xl font-extrabold text-white tracking-tight mt-1">
                        {activeDetailProject.title}
                      </h2>
                    </div>
                  </div>

                  {/* Price & Primary Action */}
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-emerald-400">
                        {activeDetailProject.isFree
                          ? 'Free Release'
                          : `$${activeDetailProject.price?.toFixed(2)} USD`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {activeDetailProject.isFree ? 'Open Source / Free' : 'Commercial License'}
                      </div>
                    </div>

                    {!activeDetailProject.isFree ? (
                      <button
                        onClick={() =>
                          setSelectedProductForDiscord({
                            id: activeDetailProject.id,
                            name: activeDetailProject.title,
                            category: activeDetailProject.categoryName,
                            price: activeDetailProject.price || 50,
                          })
                        }
                        className="px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-[#5865F2]/25 transition-all hover:scale-[1.02]"
                      >
                        <MessageSquare size={14} />
                        <span>Buy on Discord</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDownload(activeDetailProject)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                      >
                        <Download size={14} />
                        <span>Download</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {activeDetailProject.description}
                </p>

                {/* External Action Links (Only shown when populated) */}
                <div className="pt-2 flex flex-wrap gap-2.5">
                  {activeDetailProject.links.liveDemo && (
                    <a
                      href={activeDetailProject.links.liveDemo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span>Live Demo</span>
                      <ExternalLink size={12} />
                    </a>
                  )}

                  {activeDetailProject.links.github && (
                    <a
                      href={activeDetailProject.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Github size={13} />
                      <span>Source Repository</span>
                    </a>
                  )}

                  {activeDetailProject.links.documentation && (
                    <button
                      onClick={() => openWindow('textviewer')}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <BookOpen size={13} />
                      <span>Documentation</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Two Column Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Features & Technologies */}
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-[#141824] border border-white/10 space-y-3">
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>Key Features & Mechanics</span>
                    </h3>
                    <ul className="space-y-2">
                      {activeDetailProject.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                          <span className="text-[#0078D4] font-bold">✓</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Technologies */}
                  <div className="p-5 rounded-2xl bg-[#141824] border border-white/10 space-y-3">
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Cpu size={14} className="text-sky-400" />
                      <span>Technology Stack</span>
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {activeDetailProject.technologies.map((t) => (
                        <span key={t} className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-slate-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Compatibility & Changelog */}
                <div className="space-y-4">
                  {activeDetailProject.compatibility && (
                    <div className="p-5 rounded-2xl bg-[#141824] border border-white/10 space-y-3">
                      <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <Layers size={14} className="text-purple-400" />
                        <span>System Compatibility</span>
                      </h3>

                      <div className="space-y-2 text-xs divide-y divide-white/5">
                        {activeDetailProject.compatibility.mcVersions && (
                          <div className="pt-2 first:pt-0 flex justify-between">
                            <span className="text-slate-400">Minecraft Versions</span>
                            <span className="font-mono text-white font-medium">
                              {activeDetailProject.compatibility.mcVersions.join(', ')}
                            </span>
                          </div>
                        )}
                        {activeDetailProject.compatibility.serverSoftware && (
                          <div className="pt-2 flex justify-between">
                            <span className="text-slate-400">Server Software</span>
                            <span className="font-mono text-white font-medium">
                              {activeDetailProject.compatibility.serverSoftware.join(', ')}
                            </span>
                          </div>
                        )}
                        {activeDetailProject.compatibility.platforms && (
                          <div className="pt-2 flex justify-between">
                            <span className="text-slate-400">Supported Platforms</span>
                            <span className="font-mono text-white font-medium">
                              {activeDetailProject.compatibility.platforms.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Installation Instructions */}
                  {activeDetailProject.installation && activeDetailProject.installation.length > 0 && (
                    <div className="p-5 rounded-2xl bg-[#141824] border border-white/10 space-y-3">
                      <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <FileText size={14} className="text-amber-400" />
                        <span>Quick Setup Guide</span>
                      </h3>
                      <ol className="space-y-1.5 text-xs text-slate-300">
                        {activeDetailProject.installation.map((step, idx) => (
                          <li key={idx} className="font-mono text-[11px]">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Changelog */}
                  {activeDetailProject.changelog && (
                    <div className="p-5 rounded-2xl bg-[#141824] border border-white/10 space-y-2">
                      <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
                        Release Changelog
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed font-mono text-[11px] bg-black/30 p-3 rounded-xl border border-white/5">
                        {activeDetailProject.changelog}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* B. FEATURED SPOTLIGHT HERO (ONLY WHEN IN ALL/OVERVIEW MODE AND NO ACTIVE SEARCH) */}
              {activeCategoryId === 'all' && !searchQuery && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Sparkles size={14} className="text-amber-400" />
                      <span>Featured Flagship Projects</span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {featuredProjects.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProjectId(p.id)}
                        className={`p-5 rounded-2xl bg-gradient-to-br ${p.gradientBg} border border-white/20 shadow-xl cursor-pointer transition-all hover:scale-[1.01] hover:border-white/40 flex flex-col justify-between gap-4 relative overflow-hidden group`}
                      >
                        <div className="space-y-2.5 z-10">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl">{p.iconSymbol}</span>
                            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-bold text-[10px]">
                              {p.categoryName}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-extrabold text-white text-base tracking-tight group-hover:text-sky-200 transition-colors">
                              {p.title}
                            </h3>
                            <p className="text-xs text-slate-200 mt-1 line-clamp-2 leading-relaxed">
                              {p.summary}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/15 flex items-center justify-between z-10">
                          <span className="text-[11px] font-mono text-sky-200">
                            {p.isFree ? 'Free' : `$${p.price?.toFixed(2)}`}
                          </span>
                          <span className="text-xs font-bold text-white flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            <span>Inspect</span>
                            <ChevronRight size={14} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* C. ACTIVE VIEW MODES */}

              {/* 1. GRID VIEW */}
              {viewMode === 'grid' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Showing {filteredProjects.length} projects</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProjects.map((project) => (
                      <div
                        key={project.id}
                        onClick={() => setSelectedProjectId(project.id)}
                        className="p-5 rounded-2xl bg-[#141824] border border-white/10 hover:border-[#0078D4]/50 transition-all cursor-pointer flex flex-col justify-between gap-4 shadow-lg hover:shadow-2xl group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${project.gradientBg} flex items-center justify-center text-2xl shadow-md border border-white/10`}>
                              {project.iconSymbol}
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(project.status)}`}>
                              {project.status}
                            </span>
                          </div>

                          <div>
                            <div className="text-[10px] text-sky-400 uppercase font-bold tracking-wider">
                              {project.categoryName}
                            </div>
                            <h3 className="font-bold text-white text-sm mt-0.5 group-hover:text-sky-300 transition-colors">
                              {project.title}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {project.summary}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 pt-2 border-t border-white/5">
                          <div className="flex flex-wrap gap-1">
                            {project.technologies.slice(0, 3).map((t) => (
                              <span key={t} className="px-2 py-0.5 rounded bg-black/40 text-[10px] font-mono text-slate-300 border border-white/5">
                                {t}
                              </span>
                            ))}
                            {project.technologies.length > 3 && (
                              <span className="text-[10px] text-slate-500 font-mono self-center">
                                +{project.technologies.length - 3}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="font-bold text-emerald-400 font-mono">
                              {project.isFree ? 'Free' : `$${project.price?.toFixed(2)}`}
                            </span>
                            <span className="text-slate-400 group-hover:text-white font-medium flex items-center gap-1 transition-colors">
                              <span>Details</span>
                              <ChevronRight size={13} />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. LIST VIEW */}
              {viewMode === 'list' && (
                <div className="bg-[#141824] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-black/30 text-[10px] uppercase tracking-wider text-slate-400">
                        <th className="py-3 px-4">Project</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Version</th>
                        <th className="py-3 px-4">Pricing</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {filteredProjects.map((p) => (
                        <tr
                          key={p.id}
                          onClick={() => setSelectedProjectId(p.id)}
                          className="hover:bg-white/5 cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-4 flex items-center gap-3">
                            <span className="text-lg">{p.iconSymbol}</span>
                            <div>
                              <div className="font-bold text-white hover:text-sky-300 transition-colors">
                                {p.title}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate max-w-xs">{p.summary}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-400">{p.categoryName}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(p.status)}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{p.version || '—'}</td>
                          <td className="py-3 px-4 font-bold text-emerald-400 font-mono">
                            {p.isFree ? 'Free' : `$${p.price?.toFixed(2)}`}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold">
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 3. CATEGORY VIEW */}
              {viewMode === 'category' && (
                <div className="space-y-8">
                  {categories
                    .filter((c) => c.id !== 'all' && c.visible)
                    .map((cat) => {
                      const catProjects = filteredProjects.filter((p) => p.category === cat.id);
                      if (catProjects.length === 0) return null;

                      return (
                        <div key={cat.id} className="space-y-3">
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{cat.icon}</span>
                              <h3 className="font-bold text-white text-sm">{cat.name}</h3>
                              <span className="text-[10px] text-slate-400">({catProjects.length})</span>
                            </div>
                            <span className="text-[11px] text-slate-500">{cat.description}</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {catProjects.map((p) => (
                              <div
                                key={p.id}
                                onClick={() => setSelectedProjectId(p.id)}
                                className="p-4 rounded-xl bg-[#141824] border border-white/10 hover:border-sky-500/40 transition-all cursor-pointer flex flex-col justify-between gap-3"
                              >
                                <div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xl">{p.iconSymbol}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${getStatusBadge(p.status)}`}>
                                      {p.status}
                                    </span>
                                  </div>
                                  <h4 className="font-bold text-white text-xs mt-2">{p.title}</h4>
                                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{p.summary}</p>
                                </div>

                                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                                  <span className="text-emerald-400 font-bold font-mono">
                                    {p.isFree ? 'Free' : `$${p.price?.toFixed(2)}`}
                                  </span>
                                  <span className="text-sky-400 font-semibold text-[11px]">View Specs →</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* 4. GALLERY VIEW (LARGE CARDS FOCUS) */}
              {viewMode === 'gallery' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredProjects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProjectId(p.id)}
                      className="rounded-2xl bg-[#141824] border border-white/10 overflow-hidden shadow-xl hover:border-sky-500/50 transition-all cursor-pointer group"
                    >
                      {/* Visual Banner Header */}
                      <div className={`h-40 bg-gradient-to-tr ${p.gradientBg} p-5 flex flex-col justify-between relative`}>
                        <div className="flex items-center justify-between z-10">
                          <span className="text-4xl drop-shadow-md">{p.iconSymbol}</span>
                          <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white font-bold text-xs border border-white/20">
                            {p.categoryName}
                          </span>
                        </div>
                        <div className="z-10">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(p.status)}`}>
                            {p.status}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        <div>
                          <h3 className="font-extrabold text-white text-base group-hover:text-sky-300 transition-colors">
                            {p.title}
                          </h3>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{p.summary}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          <span className="font-bold text-emerald-400 font-mono text-sm">
                            {p.isFree ? 'Free Release' : `$${p.price?.toFixed(2)} USD`}
                          </span>
                          <button className="px-3.5 py-1.5 rounded-xl bg-[#0078D4] hover:bg-[#0086F0] text-white text-xs font-bold">
                            Inspect Project
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 5. TIMELINE VIEW */}
              {viewMode === 'timeline' && (
                <div className="space-y-6 max-w-2xl mx-auto py-4">
                  <div className="border-l-2 border-[#0078D4]/40 ml-4 pl-6 space-y-8 relative">
                    {filteredProjects.map((p) => (
                      <div key={p.id} className="relative space-y-2 group">
                        {/* Timeline Node */}
                        <div className="w-3.5 h-3.5 rounded-full bg-[#0078D4] absolute -left-[31px] top-1.5 ring-4 ring-[#0B0E17] group-hover:scale-125 transition-transform" />

                        <div className="text-[10px] font-mono text-sky-400 font-bold">
                          {p.createdAt} • {p.categoryName}
                        </div>

                        <div
                          onClick={() => setSelectedProjectId(p.id)}
                          className="p-4 rounded-xl bg-[#141824] border border-white/10 hover:border-sky-500/40 cursor-pointer transition-all shadow-md"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-white text-sm group-hover:text-sky-300 transition-colors">
                              {p.title}
                            </h4>
                            <span className="text-xs font-bold text-emerald-400 font-mono">
                              {p.isFree ? 'Free' : `$${p.price?.toFixed(2)}`}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">{p.summary}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 3. BOTTOM FOOTER BAR */}
      <div className="h-9 px-5 bg-[#0D111A] border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span>LivingYuji Showcase Architecture</span>
          <span>•</span>
          <span className="text-slate-500 font-mono">All rights reserved</span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://discord.gg/livingyuji"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Official Discord
          </a>
          <a
            href="https://github.com/livingyuji"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
          <button
            onClick={() => openWindow('contact')}
            className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
          >
            Contact Desk
          </button>
        </div>
      </div>

      {/* DISCORD PURCHASE MODAL */}
      <DiscordPurchaseModal
        isOpen={Boolean(selectedProductForDiscord)}
        onClose={() => setSelectedProductForDiscord(null)}
        product={selectedProductForDiscord}
      />
    </div>
  );
}
