'use client';

import React, { useState, useEffect } from 'react';
import { useWindowStore } from '@/store/windowStore';
import { useDesktopIconStore, GRID_CONFIG } from '@/store/desktopIconStore';
import { useFileSystemStore } from '@/store/fileSystemStore';
import { useDiscordSettingsStore } from '@/store/discordSettingsStore';
import { useShowcaseStore, ShowcaseProject, ProjectStatus } from '@/store/showcaseStore';
import { checkSupabaseConnection } from '@/lib/supabase/client';
import { saveVideoWallpaperBlob, clearVideoWallpaperBlob } from '@/lib/storage/wallpaperStorage';
import {
  Shield,
  Layout,
  Palette,
  FolderTree,
  ShoppingBag,
  MessageSquare,
  Briefcase,
  Image,
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  Save,
  RotateCcw,
  Sliders,
  FileText,
  FileCode,
  Sparkles,
  Copy,
  X,
  Lock,
  KeyRound,
  LogOut,
  AlertTriangle,
  Search,
  Check,
  Globe,
  Tag,
  DollarSign,
  Package,
} from 'lucide-react';

type AdminTab =
  | 'overview'
  | 'showcase'
  | 'appearance'
  | 'desktop'
  | 'projects'
  | 'minecraft'
  | 'discord'
  | 'services'
  | 'media'
  | 'backup';

interface AdminPanelAppProps {
  isStandalonePage?: boolean;
}

export function AdminPanelApp({ isStandalonePage = false }: AdminPanelAppProps) {
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'unauthenticated'>(
    isStandalonePage ? 'authenticated' : 'checking'
  );
  const [passphraseInput, setPassphraseInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const { settings, updateSettings, openWindow } = useWindowStore();
  const { positions, resetToDefaultLayout, movementEnabled, setMovementEnabled } = useDesktopIconStore();
  const { files, createFile, deleteItem, updateFileContent } = useFileSystemStore();
  const discordStore = useDiscordSettingsStore();
  const showcaseStore = useShowcaseStore();

  useEffect(() => {
    if (isStandalonePage) return;
    let isMounted = true;
    fetch('/api/admin/session')
      .then((r) => r.json())
      .then((data) => {
        if (isMounted) {
          setAuthState(data.authenticated ? 'authenticated' : 'unauthenticated');
        }
      })
      .catch(() => {
        if (isMounted) setAuthState('unauthenticated');
      });
    return () => {
      isMounted = false;
    };
  }, [isStandalonePage]);

  const handleDesktopLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphraseInput.trim()) return;
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const res = await fetch('/api/admin/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passphrase: passphraseInput }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setLoginError(data.error || 'Authentication rejected. Incorrect passphrase.');
        return;
      }
      setAuthState('authenticated');
      showToast('Administrator session verified.');
    } catch {
      setLoginError('Server connection error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      setAuthState('unauthenticated');
      setPassphraseInput('');
      showToast('Signed out of administrator console.');
      if (isStandalonePage) {
        window.location.href = '/admin?message=logged_out';
      }
    }
  };

  // Showcase Project Form State
  const [editingProject, setEditingProject] = useState<ShowcaseProject | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectForm, setProjectForm] = useState<Partial<ShowcaseProject>>({
    title: '',
    category: 'mc-plugins',
    categoryName: 'Minecraft Plugins',
    summary: '',
    description: '',
    features: ['Feature 1', 'Feature 2'],
    technologies: ['Java', 'PaperMC'],
    status: 'Released',
    featured: false,
    isFree: true,
    price: 0,
    version: 'v1.0.0',
    gradientBg: 'from-blue-600 to-indigo-900',
    iconSymbol: '⚡',
    links: {},
  });

  // Supabase Status State
  const [supabaseStatus, setSupabaseStatus] = useState<{
    loading: boolean;
    connected: boolean;
    message: string;
    url?: string;
  }>({
    loading: true,
    connected: false,
    message: 'Checking Supabase connection...',
  });

  // Local state for discord settings form
  const [discordForm, setDiscordForm] = useState({
    mainServerUrl: discordStore.mainServerUrl,
    purchaseSupportUrl: discordStore.purchaseSupportUrl,
    minecraftProductsUrl: discordStore.minecraftProductsUrl,
    webDevelopmentUrl: discordStore.webDevelopmentUrl,
    discordBotsUrl: discordStore.discordBotsUrl,
    serverSetupsUrl: discordStore.serverSetupsUrl,
    resourcePacksUrl: discordStore.resourcePacksUrl,
    fallbackUrl: discordStore.fallbackUrl,
    buttonLabelMinecraft: discordStore.buttonLabelMinecraft,
    buttonLabelStore: discordStore.buttonLabelStore,
    buttonLabelServices: discordStore.buttonLabelServices,
    purchaseInstructions: discordStore.purchaseInstructions,
  });

  // Project file editing state
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [fileContentEdit, setFileContentEdit] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New project file state
  const [newFileName, setNewFileName] = useState('');
  const [newFileFolder, setNewFileFolder] = useState('d-web');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTestSupabase = async () => {
    setSupabaseStatus((s) => ({ ...s, loading: true }));
    const result = await checkSupabaseConnection();
    setSupabaseStatus({
      loading: false,
      connected: result.connected,
      message: result.message,
      url: result.url,
    });
  };

  useEffect(() => {
    handleTestSupabase();
  }, []);

  const handleSaveDiscordSettings = (e: React.FormEvent) => {
    e.preventDefault();
    discordStore.updateSettings(discordForm);
    showToast('Discord settings updated successfully!');
  };

  // Selected file sync
  useEffect(() => {
    if (selectedFileId) {
      const f = files.find((file) => file.id === selectedFileId);
      if (f) setFileContentEdit(f.content || '');
    }
  }, [selectedFileId, files]);

  const handleSaveFileContent = () => {
    if (!selectedFileId) return;
    updateFileContent(selectedFileId, fileContentEdit);
    showToast('Project file updated in virtual D: drive!');
  };

  const handleCreateNewProjectFile = () => {
    if (!newFileName.trim()) return;
    const finalName = newFileName.endsWith('.txt') ? newFileName : `${newFileName}.txt`;
    createFile(newFileFolder, 'D:', finalName, 'text', `# ${newFileName}\nProject details here...`, 'txt');
    setNewFileName('');
    showToast(`Created ${finalName} in D: drive!`);
  };

  // -------------------------------------------------------------
  // BRANDING & APPEARANCE STATE
  // -------------------------------------------------------------
  const [brandingForm, setBrandingForm] = useState({
    brandName: settings.brandName || 'LivingYuji',
    siteTitle: settings.siteTitle || 'LivingYuji OS — Windows-Inspired Web Operating System & Portfolio',
    wallpaper: settings.wallpaper || 'matrix',
    accentColor: settings.accentColor || '#0078D4',
    theme: settings.theme || 'dark',
    customLogoUrl: settings.customLogoUrl || '/avatar.png',
    customFaviconUrl: settings.customFaviconUrl || '/favicon.png',
    customWallpaperUrl: settings.customWallpaperUrl || '',
    customVideoWallpaperUrl: settings.customVideoWallpaperUrl || '',
    videoWallpaperMuted: settings.videoWallpaperMuted !== false,
    wallpaperMode: settings.wallpaperMode || 'cover',
    wallpaperOpacity: typeof settings.wallpaperOpacity === 'number' ? settings.wallpaperOpacity : 85,
  });
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const [logoPreviewTheme, setLogoPreviewTheme] = useState<'dark' | 'light'>('dark');

  // Load cloud branding
  useEffect(() => {
    fetch('/api/admin/branding')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.settings) {
          setBrandingForm((prev) => ({
            ...prev,
            brandName: d.settings.brand_name || 'LivingYuji',
            siteTitle: d.settings.site_title || 'LivingYuji OS — Windows-Inspired Web Operating System & Portfolio',
            wallpaper: d.settings.wallpaper || 'matrix',
            accentColor: d.settings.accent_color || '#0078D4',
            theme: d.settings.theme || 'dark',
            customLogoUrl: d.settings.custom_logo_url || prev.customLogoUrl,
            customFaviconUrl: d.settings.custom_favicon_url || prev.customFaviconUrl,
            customWallpaperUrl: d.settings.custom_wallpaper_url || prev.customWallpaperUrl,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveBranding = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingBranding(true);

    // 1. Immediately apply to local store (instant feedback, zero error)
    updateSettings({
      brandName: brandingForm.brandName,
      siteTitle: brandingForm.siteTitle,
      wallpaper: brandingForm.wallpaper as any,
      accentColor: brandingForm.accentColor,
      theme: brandingForm.theme as any,
      customLogoUrl: brandingForm.customLogoUrl || null,
      customFaviconUrl: brandingForm.customFaviconUrl || null,
      customWallpaperUrl: brandingForm.customWallpaperUrl || null,
      customVideoWallpaperUrl: brandingForm.customVideoWallpaperUrl || null,
      videoWallpaperMuted: brandingForm.videoWallpaperMuted !== false,
      wallpaperMode: brandingForm.wallpaperMode as any,
      wallpaperOpacity: brandingForm.wallpaperOpacity,
    });

    try {
      const res = await fetch('/api/admin/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: brandingForm.brandName,
          site_title: brandingForm.siteTitle,
          wallpaper: brandingForm.wallpaper,
          accent_color: brandingForm.accentColor,
          theme: brandingForm.theme,
          custom_logo_url: brandingForm.customLogoUrl || null,
          custom_favicon_url: brandingForm.customFaviconUrl || null,
          custom_wallpaper_url: brandingForm.customWallpaperUrl || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        showToast('Settings applied locally (Sign in with passphrase to sync to cloud)');
        return;
      }
      showToast('Settings saved & published to cloud!');
    } catch {
      showToast('Settings applied locally (offline mode)');
    } finally {
      setIsSavingBranding(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      showToast('Please select a valid video file (.mp4 or .webm)');
      return;
    }

    try {
      showToast('Saving video wallpaper to persistent storage...');
      const activeUrl = await saveVideoWallpaperBlob(file);
      setBrandingForm((prev) => ({
        ...prev,
        customVideoWallpaperUrl: activeUrl,
      }));
      updateSettings({
        wallpaperType: 'video',
        videoWallpaperSource: 'local',
        customVideoWallpaperUrl: activeUrl,
      });
      showToast(`Video wallpaper "${file.name}" saved & applied!`);
    } catch (err) {
      console.error('Failed to save video wallpaper:', err);
      showToast('Failed to save video file to storage.');
    }
  };

  // -------------------------------------------------------------
  // MINECRAFT PRODUCTS STATE & CRUD
  // -------------------------------------------------------------
  const [mcProducts, setMcProducts] = useState<any[]>([]);
  const [isLoadingMc, setIsLoadingMc] = useState(false);
  const [editingMcProduct, setEditingMcProduct] = useState<any | null>(null);
  const [isCreatingMcProduct, setIsCreatingMcProduct] = useState(false);
  const [mcSearchQuery, setMcSearchQuery] = useState('');
  const [mcCategoryFilter, setMcCategoryFilter] = useState('all');
  const [mcProductForm, setMcProductForm] = useState<any>({
    name: '',
    category: 'plugins',
    category_name: 'Plugins',
    short_desc: '',
    full_desc: '',
    price: 0,
    is_free: true,
    version: 'v1.0.0',
    mc_versions: ['1.21.4', '1.21.1'],
    server_software: ['Purpur', 'Paper'],
    dependencies: [],
    features: ['Feature 1', 'Feature 2'],
    installation_steps: ['Download file', 'Place in plugins/ directory', 'Restart server'],
    changelog: '',
    file_format: '.jar',
    file_size: '1.5 MB',
    creator: 'LivingYuji',
    published: true,
    featured: false,
    download_url: '',
    icon_bg: 'from-blue-600 to-indigo-900',
    icon_symbol: '⚡',
  });

  const fetchMcProducts = async () => {
    setIsLoadingMc(true);
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setMcProducts(data.products);
      }
    } catch (e) {
      console.error('Failed to fetch MC products', e);
    } finally {
      setIsLoadingMc(false);
    }
  };

  useEffect(() => {
    fetchMcProducts();
  }, []);

  const handleSaveMcProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mcProductForm.name?.trim()) {
      showToast('Product name is required.');
      return;
    }
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mcProductForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || 'Failed to save product.');
        return;
      }
      showToast(`Saved product "${mcProductForm.name}"!`);
      setIsCreatingMcProduct(false);
      setEditingMcProduct(null);
      fetchMcProducts();
    } catch {
      showToast('Error saving product.');
    }
  };

  const handleDeleteMcProduct = async (id: string, name: string) => {
    if (!confirm(`Delete product "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || 'Failed to delete product.');
        return;
      }
      showToast(`Deleted ${name}`);
      fetchMcProducts();
    } catch {
      showToast('Error deleting product.');
    }
  };

  // -------------------------------------------------------------
  // MEDIA LIBRARY STATE & ACTIONS
  // -------------------------------------------------------------
  const [mediaAssets, setMediaAssets] = useState<any[]>([]);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaForm, setMediaForm] = useState({ name: '', url: '', type: 'image' });

  const fetchMediaAssets = async () => {
    try {
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      if (data.success && Array.isArray(data.assets)) {
        setMediaAssets(data.assets);
      }
    } catch (e) {
      console.error('Failed to fetch media assets', e);
    }
  };

  useEffect(() => {
    fetchMediaAssets();
  }, []);

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaForm.name.trim() || !mediaForm.url.trim()) return;
    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mediaForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Media asset registered successfully!');
        setIsMediaModalOpen(false);
        setMediaForm({ name: '', url: '', type: 'image' });
        fetchMediaAssets();
      }
    } catch {
      showToast('Failed to register media asset.');
    }
  };

  // Export full OS config backup
  const handleExportBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      brand: 'LivingYuji',
      osVersion: 'LivingYuji OS 2.5',
      settings,
      desktopPositions: positions,
      discordSettings: {
        mainServerUrl: discordStore.mainServerUrl,
        purchaseSupportUrl: discordStore.purchaseSupportUrl,
        minecraftProductsUrl: discordStore.minecraftProductsUrl,
        buttonLabels: {
          minecraft: discordStore.buttonLabelMinecraft,
          store: discordStore.buttonLabelStore,
          services: discordStore.buttonLabelServices,
        },
      },
      fileCount: files.length,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `livingyuji-os-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup JSON downloaded successfully!');
  };

  // Default 3-column reference layout verification
  const isDefaultLayoutActive =
    positions['thispc']?.x === 16 &&
    positions['paint']?.x === 200 &&
    positions['terminal']?.x === 200 &&
    positions['terminal']?.y === 208;

  const projectFolders = files.filter((f) => f.drive === 'D:' && f.type === 'folder');
  const projectFiles = files.filter((f) => f.drive === 'D:' && f.type === 'text');

  if (authState === 'checking') {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#11141E] text-slate-400 select-none font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
          <span className="text-xs">Verifying administrator authorization...</span>
        </div>
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#0D1017] p-6 select-none font-sans text-slate-100">
        <div className="max-w-md w-full bg-[#161B27] border border-white/10 rounded-2xl p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-md">
              <Lock size={22} />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">Administrator Access Required</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              LivingYuji Control Panel manages website settings, virtual storage, and published products. Enter your master passphrase to unlock.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
              <AlertTriangle size={15} className="shrink-0 text-red-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleDesktopLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <KeyRound size={13} className="text-amber-400" />
                <span>Master Passphrase</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passphraseInput}
                  onChange={(e) => setPassphraseInput(e.target.value)}
                  placeholder="Enter administrator passphrase"
                  autoFocus
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F131D] border border-white/10 focus:border-[#0078D4] text-xs text-white placeholder-slate-500 outline-none pr-10"
                />
                <Lock size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn || !passphraseInput.trim()}
              className="w-full py-2.5 rounded-xl bg-[#0078D4] hover:bg-[#0086F0] disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Shield size={14} />
              )}
              <span>Authenticate & Unlock</span>
            </button>
          </form>

          <div className="pt-2 border-t border-white/5 text-center text-[10px] text-slate-400">
            Passphrase is authenticated server-side via <code className="text-slate-300 font-mono">ADMIN_ACCESS_PASSPHRASE</code>.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-[#11141E] text-slate-100 select-none overflow-hidden font-sans text-xs">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[9999] bg-[#0078D4] text-white px-4 py-2.5 rounded-xl shadow-2xl font-medium animate-in fade-in slide-in-from-top-2 duration-200 flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Admin Sidebar */}
      <div className="w-56 bg-[#161B27] border-r border-white/10 flex flex-col shrink-0">
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#0078D4]/20 border border-[#0078D4]/40 flex items-center justify-center text-[#0078D4]">
            <Shield size={18} />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm">Control Panel</h2>
            <p className="text-[10px] text-slate-400">LivingYuji Administration</p>
          </div>
        </div>

        <nav className="p-2 space-y-1 overflow-y-auto flex-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-[#0078D4] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Database size={15} />
            <span>Overview & Health</span>
          </button>

          <button
            onClick={() => setActiveTab('showcase')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition-all ${
              activeTab === 'showcase'
                ? 'bg-[#0078D4] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles size={15} className="text-amber-400" />
              <span>Showcase Management</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 font-mono">
              {showcaseStore.projects.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition-all ${
              activeTab === 'appearance'
                ? 'bg-[#0078D4] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Palette size={15} />
            <span>Appearance & Theme</span>
          </button>

          <button
            onClick={() => setActiveTab('desktop')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition-all ${
              activeTab === 'desktop'
                ? 'bg-[#0078D4] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layout size={15} />
            <span>Desktop & Grid Layout</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition-all ${
              activeTab === 'projects'
                ? 'bg-[#0078D4] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FolderTree size={15} />
            <span>D: Drive Projects ({projectFiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('minecraft')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition-all ${
              activeTab === 'minecraft'
                ? 'bg-[#0078D4] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShoppingBag size={15} />
            <span>Minecraft Store</span>
          </button>

          <button
            onClick={() => setActiveTab('discord')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition-all ${
              activeTab === 'discord'
                ? 'bg-[#0078D4] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare size={15} />
            <span>Discord & Purchasing</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition-all ${
              activeTab === 'services'
                ? 'bg-[#0078D4] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Briefcase size={15} />
            <span>Services & Quotes</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition-all ${
              activeTab === 'media'
                ? 'bg-[#0078D4] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Image size={15} />
            <span>Media Library</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition-all ${
              activeTab === 'backup'
                ? 'bg-[#0078D4] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Download size={15} />
            <span>Backup & Export</span>
          </button>
        </nav>

        {/* Sign Out Button */}
        <div className="p-2 border-t border-white/10">
          <button
            onClick={handleSignOut}
            className="w-full py-1.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-medium text-xs flex items-center justify-center gap-2 transition-colors border border-red-500/20"
            title="Terminate administrator session"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Bottom system status pill */}
        <div className="p-3 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                supabaseStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-[10px] text-slate-300 font-medium">
              {supabaseStatus.connected ? 'Supabase Live' : 'Offline Persistence'}
            </span>
          </div>
        </div>
      </div>

      {/* Right Admin Content Workspace */}
      <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6">
        {/* TAB 1: OVERVIEW & SYSTEM HEALTH */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">System & Database Status</h1>
              <p className="text-slate-400 text-xs mt-0.5">
                LivingYuji OS runtime health, Supabase backend telemetry & quick administrative shortcuts.
              </p>
            </div>

            {/* Supabase Diagnostic Card */}
            <div className="p-5 rounded-2xl bg-[#171C28] border border-white/10 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      supabaseStatus.connected
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}
                  >
                    {supabaseStatus.connected ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      {supabaseStatus.connected ? 'Supabase Database Connected' : 'Local Storage Fallback Mode'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {supabaseStatus.connected
                        ? `Endpoint: ${supabaseStatus.url}`
                        : 'Operating securely via browser IndexedDB & localStorage persistence.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleTestSupabase}
                  disabled={supabaseStatus.loading}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw size={13} className={supabaseStatus.loading ? 'animate-spin' : ''} />
                  <span>Test Connection</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-black/30 border border-white/5 font-mono text-[11px] text-slate-300">
                {supabaseStatus.message}
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#171C28] border border-white/10 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  D: Projects Files
                </div>
                <div className="text-2xl font-extrabold text-white">{projectFiles.length}</div>
                <div className="text-[10px] text-emerald-400">8 Organized Directories</div>
              </div>

              <div className="p-4 rounded-xl bg-[#171C28] border border-white/10 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Desktop Icons
                </div>
                <div className="text-2xl font-extrabold text-white">{Object.keys(positions).length}</div>
                <div className="text-[10px] text-sky-400">
                  {isDefaultLayoutActive ? 'Reference 3-Column Layout: Active' : 'Custom Drag Layout'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#171C28] border border-white/10 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Discord Purchasing
                </div>
                <div className="text-2xl font-extrabold text-white">Active</div>
                <div className="text-[10px] text-purple-400">Tickets & Direct Fulfillment</div>
              </div>

              <div className="p-4 rounded-xl bg-[#171C28] border border-white/10 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  OS Environment
                </div>
                <div className="text-2xl font-extrabold text-white">Windows 11</div>
                <div className="text-[10px] text-emerald-400">Client-Side Runtime</div>
              </div>
            </div>

            {/* Quick Launch Buttons */}
            <div className="space-y-2">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
                Administrative Quick Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => openWindow('thispc', { folderId: 'd-drive' })}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium flex items-center gap-2 transition-colors"
                >
                  <FolderTree size={14} className="text-sky-400" />
                  <span>Open D: — My Projects</span>
                </button>
                <button
                  onClick={() => openWindow('terminal')}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium flex items-center gap-2 transition-colors"
                >
                  <FileCode size={14} className="text-emerald-400" />
                  <span>Launch LivingYuji Terminal</span>
                </button>
                <button
                  onClick={() => {
                    resetToDefaultLayout();
                    showToast('Desktop layout reset: Terminal at Row 3, Col 1.');
                  }}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-amber-300 font-medium flex items-center gap-2 transition-colors"
                >
                  <RotateCcw size={14} />
                  <span>Reset Desktop Layout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SHOWCASE MANAGEMENT */}
        {activeTab === 'showcase' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-400" />
                  <span>Showcase Management</span>
                </h1>
                <p className="text-slate-400 text-xs mt-0.5">
                  Publish, edit, duplicate, and organize all LivingYuji portfolio projects, game engines, and services.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => openWindow('showcase')}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink size={13} />
                  <span>Launch Showcase</span>
                </button>
                <button
                  onClick={() => {
                    setProjectForm({
                      id: `proj-${Date.now()}`,
                      title: '',
                      slug: '',
                      category: 'mc-plugins',
                      categoryName: 'Minecraft Plugins',
                      summary: '',
                      description: '',
                      features: ['Custom feature 1', 'Custom feature 2'],
                      technologies: ['Java', 'PaperMC'],
                      status: 'Released',
                      featured: false,
                      isFree: true,
                      price: 0,
                      version: 'v1.0.0',
                      gradientBg: 'from-blue-600 to-indigo-900',
                      iconSymbol: '⚡',
                      links: {},
                      createdAt: new Date().toISOString().split('T')[0],
                      updatedAt: new Date().toISOString().split('T')[0],
                      screenshots: [],
                    });
                    setIsCreatingProject(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0078D4] hover:bg-[#0086F0] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20"
                >
                  <Plus size={14} />
                  <span>New Project</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-[#171C28] border border-white/10 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Projects</div>
                <div className="text-xl font-bold text-white">{showcaseStore.projects.length}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#171C28] border border-white/10 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Featured</div>
                <div className="text-xl font-bold text-amber-400">
                  {showcaseStore.projects.filter((p) => p.featured).length}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#171C28] border border-white/10 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Categories</div>
                <div className="text-xl font-bold text-sky-400">{showcaseStore.categories.length}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#171C28] border border-white/10 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Public Releases</div>
                <div className="text-xl font-bold text-emerald-400">
                  {showcaseStore.projects.filter((p) => p.status === 'Released').length}
                </div>
              </div>
            </div>

            {/* Projects Table */}
            <div className="bg-[#171C28] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-300">
                  Project Catalog
                </h3>
                <button
                  onClick={() => {
                    showcaseStore.resetToDefaultProjects();
                    showToast('Reset showcase to official default projects.');
                  }}
                  className="text-amber-400 hover:text-amber-300 text-[11px] font-medium transition-colors"
                >
                  Reset Defaults
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/30 text-[10px] uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-4">Project</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Featured</th>
                      <th className="py-3 px-4">Pricing</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {showcaseStore.projects.map((p) => (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-2.5">
                          <span className="text-base">{p.iconSymbol}</span>
                          <div>
                            <div className="font-bold text-white">{p.title}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{p.version || 'v1.0'}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-400">{p.categoryName}</td>
                        <td className="py-3 px-4">
                          <select
                            value={p.status}
                            onChange={(e) => {
                              showcaseStore.updateProject(p.id, { status: e.target.value as any });
                              showToast(`Status updated to ${e.target.value}`);
                            }}
                            className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none"
                          >
                            <option value="Released">Released</option>
                            <option value="In Development">In Development</option>
                            <option value="Beta">Beta</option>
                            <option value="Coming Soon">Coming Soon</option>
                            <option value="Archived">Archived</option>
                            <option value="Private">Private</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => {
                              showcaseStore.toggleFeatured(p.id);
                              showToast(`Toggled featured status for ${p.title}`);
                            }}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.featured
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-white/5 text-slate-500'
                            }`}
                          >
                            {p.featured ? '★ Featured' : 'Standard'}
                          </button>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          {p.isFree ? 'Free' : `$${p.price?.toFixed(2)}`}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingProject(p);
                                setProjectForm(p);
                              }}
                              className="p-1.5 rounded-lg text-sky-400 hover:bg-sky-500/20 transition-colors"
                              title="Edit Project"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => {
                                showcaseStore.duplicateProject(p.id);
                                showToast(`Duplicated ${p.title}`);
                              }}
                              className="p-1.5 rounded-lg text-slate-300 hover:bg-white/10 transition-colors"
                              title="Duplicate Entry"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`Delete project "${p.title}"?`)) {
                                  try {
                                    await fetch(`/api/admin/showcase?id=${encodeURIComponent(p.id)}`, { method: 'DELETE' });
                                  } catch (err) {}
                                  showcaseStore.deleteProject(p.id);
                                  showToast(`Deleted ${p.title}`);
                                }
                              }}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                              title="Delete Project"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CREATE / EDIT PROJECT MODAL */}
            {(isCreatingProject || editingProject) && (
              <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#181D29] border border-white/15 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto window-scroll">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="font-bold text-white text-sm">
                      {isCreatingProject ? 'Create New Showcase Project' : `Edit: ${editingProject?.title}`}
                    </h3>
                    <button
                      onClick={() => {
                        setIsCreatingProject(false);
                        setEditingProject(null);
                      }}
                      className="text-slate-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">Project Title</label>
                        <input
                          type="text"
                          value={projectForm.title || ''}
                          onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
                          placeholder="e.g. ArcaneArsenal"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">Category</label>
                        <select
                          value={projectForm.category || 'mc-plugins'}
                          onChange={(e) => {
                            const cat = showcaseStore.categories.find((c) => c.id === e.target.value);
                            setProjectForm({
                              ...projectForm,
                              category: e.target.value,
                              categoryName: cat?.name || 'General',
                            });
                          }}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                        >
                          {showcaseStore.categories
                            .filter((c) => c.id !== 'all')
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Short Summary</label>
                      <input
                        type="text"
                        value={projectForm.summary || ''}
                        onChange={(e) => setProjectForm({ ...projectForm, summary: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                        placeholder="Brief 1-sentence description"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Full Description</label>
                      <textarea
                        rows={3}
                        value={projectForm.description || ''}
                        onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none"
                        placeholder="Comprehensive project overview and architecture..."
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">Status</label>
                        <select
                          value={projectForm.status || 'Released'}
                          onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value as any })}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                        >
                          <option value="Released">Released</option>
                          <option value="In Development">In Development</option>
                          <option value="Beta">Beta</option>
                          <option value="Coming Soon">Coming Soon</option>
                          <option value="Archived">Archived</option>
                          <option value="Private">Private</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">Pricing Model</label>
                        <select
                          value={projectForm.isFree ? 'free' : 'paid'}
                          onChange={(e) => setProjectForm({ ...projectForm, isFree: e.target.value === 'free' })}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                        >
                          <option value="free">Free / Open Source</option>
                          <option value="paid">Commercial (Paid)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">Price (USD)</label>
                        <input
                          type="number"
                          disabled={projectForm.isFree}
                          value={projectForm.price || 0}
                          onChange={(e) => setProjectForm({ ...projectForm, price: Number(e.target.value) })}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white outline-none disabled:opacity-40"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">Version</label>
                        <input
                          type="text"
                          value={projectForm.version || 'v1.0.0'}
                          onChange={(e) => setProjectForm({ ...projectForm, version: e.target.value })}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">Technologies (comma separated)</label>
                        <input
                          type="text"
                          value={projectForm.technologies ? projectForm.technologies.join(', ') : ''}
                          onChange={(e) =>
                            setProjectForm({
                              ...projectForm,
                              technologies: e.target.value.split(',').map((t) => t.trim()),
                            })
                          }
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                          placeholder="Java, Next.js, TypeScript"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">GitHub URL</label>
                        <input
                          type="text"
                          value={projectForm.links?.github || ''}
                          onChange={(e) =>
                            setProjectForm({
                              ...projectForm,
                              links: { ...projectForm.links, github: e.target.value },
                            })
                          }
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                          placeholder="https://github.com/..."
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">Live Demo URL</label>
                        <input
                          type="text"
                          value={projectForm.links?.liveDemo || ''}
                          onChange={(e) =>
                            setProjectForm({
                              ...projectForm,
                              links: { ...projectForm.links, liveDemo: e.target.value },
                            })
                          }
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                    <button
                      onClick={() => {
                        setIsCreatingProject(false);
                        setEditingProject(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (!projectForm.title?.trim()) {
                          alert('Project title is required.');
                          return;
                        }
                        if (isCreatingProject) {
                          const newProj: ShowcaseProject = {
                            id: `proj-${Date.now()}`,
                            title: projectForm.title,
                            slug: projectForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                            category: projectForm.category || 'mc-plugins',
                            categoryName: projectForm.categoryName || 'Minecraft Plugins',
                            summary: projectForm.summary || '',
                            description: projectForm.description || '',
                            gradientBg: projectForm.gradientBg || 'from-blue-600 to-indigo-900',
                            iconSymbol: projectForm.iconSymbol || '⚡',
                            screenshots: [],
                            features: projectForm.features || ['Feature 1'],
                            technologies: projectForm.technologies || ['Java'],
                            status: (projectForm.status as ProjectStatus) || 'Released',
                            featured: Boolean(projectForm.featured),
                            isFree: Boolean(projectForm.isFree),
                            price: projectForm.price || 0,
                            version: projectForm.version || 'v1.0.0',
                            links: projectForm.links || {},
                            createdAt: new Date().toISOString().split('T')[0],
                            updatedAt: new Date().toISOString().split('T')[0],
                          };
                          try {
                            await fetch('/api/admin/showcase', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                ...newProj,
                                category_id: newProj.category || 'web-apps',
                              }),
                            });
                          } catch (err) {}
                          showcaseStore.addProject(newProj);
                          showToast(`Created project "${newProj.title}" and saved to cloud!`);
                        } else if (editingProject) {
                          try {
                            await fetch('/api/admin/showcase', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                ...projectForm,
                                id: editingProject.id,
                                category_id: projectForm.category || 'web-apps',
                              }),
                            });
                          } catch (err) {}
                          showcaseStore.updateProject(editingProject.id, projectForm);
                          showToast(`Saved changes to "${projectForm.title}" in cloud!`);
                        }
                        setIsCreatingProject(false);
                        setEditingProject(null);
                      }}
                      className="px-5 py-2 rounded-xl bg-[#0078D4] hover:bg-[#0086F0] text-white font-bold text-xs shadow-lg"
                    >
                      Save Project to Cloud
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: APPEARANCE & THEME */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Palette size={18} className="text-sky-400" />
                  <span>Website Branding & Appearance</span>
                </h1>
                <p className="text-slate-400 text-xs mt-0.5">
                  Customize main logo, favicon, background wallpapers, themes, and publish changes to Supabase cloud.
                </p>
              </div>

              <button
                onClick={() => handleSaveBranding()}
                disabled={isSavingBranding}
                className="px-4 py-2 rounded-xl bg-[#0078D4] hover:bg-[#0086F0] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20"
              >
                {isSavingBranding ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                <span>Save & Publish to Cloud</span>
              </button>
            </div>

            {/* 1. Website Branding & Identity */}
            <div className="p-5 rounded-2xl bg-[#171C28] border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Globe size={16} className="text-emerald-400" />
                <span>Brand Identity & SEO Title</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300">Brand Name</label>
                  <input
                    type="text"
                    value={brandingForm.brandName}
                    onChange={(e) => setBrandingForm({ ...brandingForm, brandName: e.target.value })}
                    placeholder="e.g. LivingYuji"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:border-[#0078D4] outline-none"
                  />
                  <p className="text-[10px] text-slate-500">Displayed in taskbar, watermark, and welcome screens.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300">Browser Window Title</label>
                  <input
                    type="text"
                    value={brandingForm.siteTitle}
                    onChange={(e) => setBrandingForm({ ...brandingForm, siteTitle: e.target.value })}
                    placeholder="e.g. LivingYuji OS — Virtual Desktop & Portfolio"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:border-[#0078D4] outline-none"
                  />
                  <p className="text-[10px] text-slate-500">Synchronized directly with browser document.title.</p>
                </div>
              </div>
            </div>

            {/* 2. Main Logo Manager */}
            <div className="p-5 rounded-2xl bg-[#171C28] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Image size={16} className="text-sky-400" />
                  <span>Main Logo Manager</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setBrandingForm({ ...brandingForm, customLogoUrl: '' });
                    showToast('Reset to default LivingYuji logo emblem');
                  }}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  <span>Restore Default Logo</span>
                </button>
              </div>

              {/* Logo Previews */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0E121A] border border-white/10 flex flex-col items-center justify-center min-h-[110px]">
                  <span className="text-[10px] text-slate-500 mb-2 font-mono">Dark Theme Contrast Preview</span>
                  {brandingForm.customLogoUrl ? (
                    <img
                      src={brandingForm.customLogoUrl}
                      alt="Custom Logo Preview"
                      className="max-h-12 max-w-[180px] object-contain drop-shadow"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-sm">
                      <span className="text-emerald-400 font-mono">⚡</span>
                      <span>{brandingForm.brandName || 'LivingYuji'}</span>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-[#F4F9FD] border border-slate-300 flex flex-col items-center justify-center min-h-[110px]">
                  <span className="text-[10px] text-slate-500 mb-2 font-mono">Light Theme Contrast Preview</span>
                  {brandingForm.customLogoUrl ? (
                    <img
                      src={brandingForm.customLogoUrl}
                      alt="Custom Logo Preview"
                      className="max-h-12 max-w-[180px] object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-sm">
                      <span className="text-emerald-400 font-mono">⚡</span>
                      <span>{brandingForm.brandName || 'LivingYuji'}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">Custom Logo / Avatar Image URL</label>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="url"
                    value={brandingForm.customLogoUrl}
                    onChange={(e) => setBrandingForm({ ...brandingForm, customLogoUrl: e.target.value })}
                    placeholder="/avatar.png or https://example.com/logo.svg"
                    className="flex-1 min-w-[200px] px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:border-[#0078D4] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setBrandingForm({ ...brandingForm, customLogoUrl: '/avatar.png' });
                      updateSettings({ customLogoUrl: '/avatar.png' });
                      showToast('Set main photo to LivingYuji render (/avatar.png)');
                    }}
                    className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium"
                  >
                    ★ Use Minecraft Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBrandingForm({ ...brandingForm, customLogoUrl: '/icons/logo.svg' });
                      showToast('Set to built-in logo SVG asset');
                    }}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium"
                  >
                    Use Emblem SVG
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">Supports PNG, SVG, JPG, WebP. Used in About Me, Start Menu, and header.</p>
              </div>
            </div>

            {/* 3. Favicon & Browser Icons Manager */}
            <div className="p-5 rounded-2xl bg-[#171C28] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Sparkles size={16} className="text-amber-400" />
                  <span>Favicon & Browser Icon Manager</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setBrandingForm({ ...brandingForm, customFaviconUrl: '' });
                    showToast('Restored default browser favicon');
                  }}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  <span>Restore Default Favicon</span>
                </button>
              </div>

              {/* Browser Tab Simulation */}
              <div className="p-3 rounded-xl bg-black/50 border border-white/10 max-w-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#202533] border border-white/10">
                  {brandingForm.customFaviconUrl ? (
                    <img
                      src={brandingForm.customFaviconUrl}
                      alt="Favicon"
                      className="w-4 h-4 object-contain rounded"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                      Y
                    </div>
                  )}
                  <span className="text-[11px] text-white font-medium truncate max-w-[200px]">
                    {brandingForm.siteTitle || 'LivingYuji OS'}
                  </span>
                  <X size={10} className="text-slate-500 ml-auto" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">Custom Favicon URL (ICO, PNG, or SVG)</label>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="url"
                    value={brandingForm.customFaviconUrl}
                    onChange={(e) => setBrandingForm({ ...brandingForm, customFaviconUrl: e.target.value })}
                    placeholder="/favicon.png or https://.../favicon.ico"
                    className="flex-1 min-w-[200px] px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:border-[#0078D4] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setBrandingForm({ ...brandingForm, customFaviconUrl: '/favicon.png' });
                      updateSettings({ customFaviconUrl: '/favicon.png' });
                      showToast('Set favicon to LivingYuji render (/favicon.png)');
                    }}
                    className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium"
                  >
                    ★ Use Minecraft Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBrandingForm({ ...brandingForm, customFaviconUrl: '/favicon.ico' });
                      showToast('Set to /favicon.ico');
                    }}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium"
                  >
                    Default ICO
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  Auto-injects cache-busting <code className="text-sky-300 font-mono">?v=timestamp</code> query params to bypass stale browser caches.
                </p>
              </div>
            </div>

            {/* 4. Desktop Wallpaper & Custom Background */}
            <div className="p-5 rounded-2xl bg-[#171C28] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Layout size={16} className="text-purple-400" />
                  <span>Desktop Backgrounds & Wallpapers</span>
                </div>
                {brandingForm.customWallpaperUrl && (
                  <button
                    type="button"
                    onClick={() => setBrandingForm({ ...brandingForm, customWallpaperUrl: '' })}
                    className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    <span>Clear Custom Image</span>
                  </button>
                )}
              </div>

              {/* Preset Wallpapers */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-2">Preset Themes</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['matrix', 'cyber', 'forest', 'sunset', 'ocean', 'dark', 'default'] as const).map(
                    (wp) => (
                      <button
                        key={wp}
                        type="button"
                        onClick={() => {
                          setBrandingForm({ ...brandingForm, wallpaper: wp });
                          updateSettings({
                            wallpaper: wp,
                            wallpaperType: 'preset',
                          });
                          showToast(`Wallpaper changed to preset: ${wp}`);
                        }}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between h-20 capitalize font-medium transition-all ${
                          (settings.wallpaperType === 'preset' || (!settings.wallpaperType && !settings.customVideoWallpaperUrl && !settings.customWallpaperUrl)) &&
                          settings.wallpaper === wp
                            ? 'border-[#0078D4] bg-[#0078D4]/20 text-white shadow-lg'
                            : 'border-white/10 bg-black/30 text-slate-300 hover:border-white/30'
                        }`}
                      >
                        <span className="text-base">
                          {wp === 'matrix' ? '🟩' : wp === 'cyber' ? '🟪' : wp === 'forest' ? '🌲' : '🌌'}
                        </span>
                        <span>{wp}</span>
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Custom Image Wallpaper URL */}
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <label className="text-[11px] font-semibold text-slate-300">Custom Wallpaper Image URL</label>
                <input
                  type="url"
                  value={brandingForm.customWallpaperUrl}
                  onChange={(e) => setBrandingForm({ ...brandingForm, customWallpaperUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/... or /wallpapers/custom.jpg"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:border-[#0078D4] outline-none"
                />
              </div>

              {/* Wallpaper Display Mode & Opacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300">Wallpaper Display Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['cover', 'contain', 'tile'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setBrandingForm({ ...brandingForm, wallpaperMode: mode })}
                        className={`py-1.5 rounded-lg border text-xs capitalize font-medium transition-all ${
                          brandingForm.wallpaperMode === mode
                            ? 'border-[#0078D4] bg-[#0078D4]/20 text-white'
                            : 'border-white/10 bg-black/20 text-slate-400 hover:text-white'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-300">
                    <span>Dark Overlay Intensity</span>
                    <span className="font-mono text-sky-400">{brandingForm.wallpaperOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={brandingForm.wallpaperOpacity}
                    onChange={(e) =>
                      setBrandingForm({ ...brandingForm, wallpaperOpacity: parseInt(e.target.value) || 85 })
                    }
                    className="w-full accent-[#0078D4] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 5. Desktop Video Wallpaper (MP4 / WebM Upload & Presets) */}
            <div className="p-5 rounded-2xl bg-[#171C28] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <span className="text-base">🎬</span>
                  <span>Desktop Video Wallpaper</span>
                </div>
                {brandingForm.customVideoWallpaperUrl && (
                  <div className="flex items-center gap-2">
                    {settings.wallpaperType !== 'video' && (
                      <button
                        type="button"
                        onClick={() => {
                          updateSettings({ wallpaperType: 'video' });
                          showToast('Switched to Video Wallpaper mode');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-medium hover:bg-purple-500/30"
                      >
                        ▶ Activate Video
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        await clearVideoWallpaperBlob();
                        setBrandingForm({ ...brandingForm, customVideoWallpaperUrl: '' });
                        updateSettings({
                          wallpaperType: brandingForm.customWallpaperUrl ? 'image' : 'preset',
                          videoWallpaperSource: null,
                          customVideoWallpaperUrl: null,
                        });
                        showToast('Video wallpaper removed');
                      }}
                      className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      <span>Clear Video Wallpaper</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Video Preview if active */}
              {brandingForm.customVideoWallpaperUrl && (
                <div className="w-full h-36 rounded-xl overflow-hidden bg-black/60 border border-white/10 relative">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    src={brandingForm.customVideoWallpaperUrl}
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] text-white font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Active Video Wallpaper</span>
                  </div>
                </div>
              )}

              {/* Upload Video or Enter URL */}
              <div className="space-y-3 pt-1">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors shrink-0">
                    <Upload size={14} />
                    <span>Upload Video (.mp4, .webm)</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="relative flex-1">
                    <input
                      type="url"
                      value={brandingForm.customVideoWallpaperUrl}
                      onChange={(e) => {
                        const url = e.target.value;
                        setBrandingForm({ ...brandingForm, customVideoWallpaperUrl: url });
                        updateSettings({
                          wallpaperType: url ? 'video' : (brandingForm.customWallpaperUrl ? 'image' : 'preset'),
                          videoWallpaperSource: url ? 'url' : null,
                          customVideoWallpaperUrl: url || null,
                        });
                      }}
                      placeholder="Or enter direct video link (.mp4 or .webm)"
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:border-[#0078D4] outline-none font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* Preset Video Loops */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Preset Animated Loops</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      {
                        name: 'Cyberpunk Rain',
                        url: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-flying-cars-and-rain-41551-large.mp4',
                      },
                      {
                        name: 'Digital Matrix',
                        url: 'https://assets.mixkit.co/videos/preview/mixkit-matrix-style-green-code-running-down-a-screen-41549-large.mp4',
                      },
                      {
                        name: 'Sci-Fi Grid',
                        url: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-and-data-31911-large.mp4',
                      },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setBrandingForm({ ...brandingForm, customVideoWallpaperUrl: preset.url });
                          updateSettings({
                            wallpaperType: 'video',
                            videoWallpaperSource: 'url',
                            customVideoWallpaperUrl: preset.url,
                          });
                          showToast(`Applied "${preset.name}" video wallpaper!`);
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          brandingForm.customVideoWallpaperUrl === preset.url
                            ? 'border-purple-400 bg-purple-500/20 text-purple-200'
                            : 'border-white/10 bg-black/30 text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        ▶ {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mute Audio Option */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-300">
                  <span>Mute Video Wallpaper Audio</span>
                  <input
                    type="checkbox"
                    checked={brandingForm.videoWallpaperMuted !== false}
                    onChange={(e) => {
                      const muted = e.target.checked;
                      setBrandingForm({ ...brandingForm, videoWallpaperMuted: muted });
                      updateSettings({ videoWallpaperMuted: muted });
                    }}
                    className="rounded accent-purple-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 6. Global Appearance & Accent Color */}
            <div className="p-5 rounded-2xl bg-[#171C28] border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Sliders size={16} className="text-amber-400" />
                <span>Global Theme & Accent Color</span>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-semibold text-slate-300 block">System Accent Color</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { name: 'Windows Blue', color: '#0078D4' },
                    { name: 'Emerald', color: '#10B981' },
                    { name: 'Cyber Purple', color: '#8B5CF6' },
                    { name: 'Amber Gold', color: '#F59E0B' },
                    { name: 'Rose Red', color: '#F43F5E' },
                    { name: 'Sky Cyan', color: '#06B6D4' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => {
                        setBrandingForm({ ...brandingForm, accentColor: c.color });
                        updateSettings({ accentColor: c.color });
                        showToast(`Accent color updated to ${c.name}`);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                        brandingForm.accentColor === c.color
                          ? 'border-white text-white bg-white/10 shadow-md'
                          : 'border-white/10 text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-xs">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DESKTOP & GRID LAYOUT */}
        {activeTab === 'desktop' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Desktop Icons & Arrangement</h1>
                <p className="text-slate-400 text-xs mt-0.5">
                  Inspect coordinates, drag behavior, and enforce Terminal placement.
                </p>
              </div>
              <button
                onClick={() => {
                  resetToDefaultLayout();
                  showToast('Desktop layout reset to default (Terminal at Row 3, Col 1).');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-2 hover:bg-amber-500/30 transition-colors"
              >
                <RotateCcw size={14} />
                <span>Reset to Standard Windows Grid</span>
              </button>
            </div>

            {/* Desktop Icon Movement Toggle */}
            <div className="p-4 rounded-xl bg-[#171C28] border border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                  <Layout size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Desktop Icon Movement Setting</h3>
                  <p className="text-[11px] text-slate-400">
                    {movementEnabled
                      ? 'Enabled — Desktop icons can be dragged by clicking and holding beyond 8px threshold.'
                      : 'Disabled — Desktop icons remain locked in place and cannot be moved.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const next = !movementEnabled;
                  setMovementEnabled(next);
                  updateSettings({ desktopIconMovement: next });
                  showToast(`Icon movement ${next ? 'enabled' : 'disabled (locked)'}`);
                }}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                  movementEnabled ? 'bg-[#0078D4]' : 'bg-slate-700'
                }`}
                role="switch"
                aria-checked={movementEnabled}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    movementEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Official 3-Column Layout Status Badge */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                isDefaultLayoutActive
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-xl">{isDefaultLayoutActive ? '✅' : '⚠️'}</div>
                <div>
                  <div className="font-bold text-white">Desktop 3-Column Layout Configuration</div>
                  <div className="text-[11px] text-slate-300">
                    Official Reference Layout: Column 1 (7 icons), Column 2 (5 icons), Column 3 (Paint, Browser, Terminal).
                  </div>
                </div>
              </div>
              <div className="font-mono text-xs px-2.5 py-1 rounded bg-black/40">
                {isDefaultLayoutActive ? 'Standard Home Layout' : 'Custom Dragged Layout'}
              </div>
            </div>

            {/* Positions Table */}
            <div className="bg-[#171C28] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
              <div className="p-4 border-b border-white/10 font-bold text-white text-sm">
                Active Desktop Icon Coordinates
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-slate-400 bg-black/20">
                    <th className="py-2.5 px-4">Application ID</th>
                    <th className="py-2.5 px-4">Position X</th>
                    <th className="py-2.5 px-4">Position Y</th>
                    <th className="py-2.5 px-4">Grid Row & Col</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {Object.entries(positions).map(([appId, pos]) => {
                    const col = Math.round((pos.x - GRID_CONFIG.startX) / GRID_CONFIG.cellWidth) + 1;
                    const row = Math.round((pos.y - GRID_CONFIG.startY) / GRID_CONFIG.cellHeight) + 1;
                    const isTerminal = appId === 'terminal';
                    return (
                      <tr
                        key={appId}
                        className={`hover:bg-white/5 ${isTerminal ? 'bg-[#0078D4]/10 font-bold text-sky-300' : ''}`}
                      >
                        <td className="py-2.5 px-4 flex items-center gap-2">
                          <span>{isTerminal ? '⌨️' : '📁'}</span>
                          <span className="font-mono">{appId}</span>
                        </td>
                        <td className="py-2.5 px-4 font-mono">{pos.x}px</td>
                        <td className="py-2.5 px-4 font-mono">{pos.y}px</td>
                        <td className="py-2.5 px-4 font-mono">
                          Row {row}, Col {col} {isTerminal && '(Strict Row 3, Col 1)'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: D: DRIVE MY PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">D: — My Projects Manager</h1>
                <p className="text-slate-400 text-xs mt-0.5">
                  Browse, inspect, edit and create structured .txt project documentation files.
                </p>
              </div>
              <button
                onClick={() => openWindow('thispc', { folderId: 'd-drive' })}
                className="px-4 py-2 rounded-xl bg-[#0078D4] hover:bg-[#0086F0] text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                <FolderTree size={14} />
                <span>Open in File Explorer</span>
              </button>
            </div>

            {/* Create new file form */}
            <div className="p-4 rounded-2xl bg-[#171C28] border border-white/10 flex flex-wrap gap-3 items-center">
              <input
                type="text"
                placeholder="New Project File Name (e.g., NovaAI.txt)"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#0078D4]"
              />
              <select
                value={newFileFolder}
                onChange={(e) => setNewFileFolder(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                {projectFolders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleCreateNewProjectFile}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Create File</span>
              </button>
            </div>

            {/* Split View: File List & Content Editor */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#171C28] border border-white/10 rounded-2xl overflow-hidden p-3 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                  Select Project File
                </div>
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {projectFiles.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => setSelectedFileId(file.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between gap-2 transition-colors ${
                        selectedFileId === file.id
                          ? 'bg-[#0078D4] text-white font-medium shadow-md'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText size={14} />
                        <span className="truncate">{file.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {file.size || '1 KB'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor Workspace */}
              <div className="md:col-span-2 bg-[#171C28] border border-white/10 rounded-2xl p-4 flex flex-col space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="font-bold text-white flex items-center gap-2">
                    <Edit3 size={15} className="text-sky-400" />
                    <span>
                      {selectedFileId
                        ? files.find((f) => f.id === selectedFileId)?.name
                        : 'Select a file to edit'}
                    </span>
                  </div>
                  {selectedFileId && (
                    <button
                      onClick={handleSaveFileContent}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Save size={13} />
                      <span>Save Content</span>
                    </button>
                  )}
                </div>

                <textarea
                  value={fileContentEdit}
                  onChange={(e) => setFileContentEdit(e.target.value)}
                  placeholder="Select a project file on the left to inspect or modify its markdown/plain-text specifications..."
                  className="flex-1 min-h-[300px] bg-black/40 border border-white/10 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-[#0078D4] leading-relaxed resize-y"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: MINECRAFT STORE & PRODUCTS */}
        {activeTab === 'minecraft' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <ShoppingBag size={18} className="text-emerald-400" />
                  <span>Minecraft Marketplace Manager</span>
                </h1>
                <p className="text-slate-400 text-xs mt-0.5">
                  Publish plugins, setups, resource packs, schematics, and digital files directly to Supabase cloud.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openWindow('minecraftstore')}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink size={13} />
                  <span>Launch Store App</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMcProductForm({
                      id: `prod-${Date.now()}`,
                      name: '',
                      category: 'plugins',
                      category_name: 'Plugins',
                      short_desc: '',
                      full_desc: '',
                      price: 0,
                      is_free: true,
                      version: 'v1.0.0',
                      mc_versions: ['1.21.4', '1.21.1'],
                      server_software: ['Purpur', 'Paper'],
                      dependencies: [],
                      features: ['Custom feature 1', 'Optimized performance'],
                      installation_steps: ['Download file', 'Place in server directory', 'Restart server'],
                      changelog: 'v1.0.0 — Initial release.',
                      file_format: '.jar',
                      file_size: '1.5 MB',
                      creator: 'LivingYuji',
                      published: true,
                      featured: false,
                      download_url: '',
                      icon_bg: 'from-blue-600 to-indigo-900',
                      icon_symbol: '⚡',
                    });
                    setIsCreatingMcProduct(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0078D4] hover:bg-[#0086F0] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20"
                >
                  <Plus size={14} />
                  <span>New Product</span>
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-[#171C28] border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Cloud Products</div>
                <div className="text-xl font-bold text-white mt-1 font-mono">{mcProducts.length}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#171C28] border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Free Resources</div>
                <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">
                  {mcProducts.filter((p) => p.is_free).length}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#171C28] border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Premium / Paid</div>
                <div className="text-xl font-bold text-sky-400 mt-1 font-mono">
                  {mcProducts.filter((p) => !p.is_free).length}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#171C28] border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Downloads</div>
                <div className="text-xl font-bold text-amber-400 mt-1 font-mono">
                  {mcProducts.reduce((acc, p) => acc + (p.downloads_count || 0), 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-[#171C28] border border-white/10">
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={mcSearchQuery}
                  onChange={(e) => setMcSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0078D4]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                <select
                  value={mcCategoryFilter}
                  onChange={(e) => setMcCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="plugins">Plugins</option>
                  <option value="setups">Server Setups</option>
                  <option value="configs">Configs</option>
                  <option value="resourcepacks">Resource Packs</option>
                  <option value="skript">Skript</option>
                  <option value="maps">Maps & Schematics</option>
                  <option value="serverconfigs">Server Configs</option>
                  <option value="mods">Mods</option>
                  <option value="weapons">Custom Weapons</option>
                  <option value="tools">Tools</option>
                </select>

                <button
                  type="button"
                  onClick={() => fetchMcProducts()}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                  title="Refresh Cloud Products"
                >
                  <RefreshCw size={14} className={isLoadingMc ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="rounded-2xl bg-[#171C28] border border-white/10 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/30 border-b border-white/10 text-slate-400 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Version</th>
                      <th className="py-3 px-4">Pricing</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {mcProducts
                      .filter((p) => {
                        const matchesSearch =
                          !mcSearchQuery ||
                          p.name?.toLowerCase().includes(mcSearchQuery.toLowerCase()) ||
                          p.short_desc?.toLowerCase().includes(mcSearchQuery.toLowerCase());
                        const matchesCat = mcCategoryFilter === 'all' || p.category === mcCategoryFilter;
                        return matchesSearch && matchesCat;
                      })
                      .map((prod) => (
                        <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                                  prod.icon_bg || 'from-blue-600 to-indigo-900'
                                } flex items-center justify-center text-sm shadow`}
                              >
                                {prod.icon_symbol || '⚡'}
                              </div>
                              <div>
                                <div className="font-bold text-white text-xs">{prod.name}</div>
                                <div className="text-[10px] text-slate-400 line-clamp-1 max-w-xs">
                                  {prod.short_desc}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300 capitalize">
                              {prod.category_name || prod.category}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[11px] font-mono text-slate-300">{prod.version || 'v1.0.0'}</span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold">
                            {prod.is_free ? (
                              <span className="text-emerald-400">Free</span>
                            ) : (
                              <span className="text-sky-400">${Number(prod.price).toFixed(2)}</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                prod.published
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-slate-700/40 text-slate-400 border border-slate-600'
                              }`}
                            >
                              {prod.published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMcProduct(prod);
                                  setMcProductForm(prod);
                                }}
                                className="p-1.5 rounded-lg text-sky-400 hover:bg-sky-500/20 transition-colors"
                                title="Edit Product"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMcProduct(prod.id, prod.name)}
                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                                title="Delete Product"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {mcProducts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          No digital products found in Supabase cloud catalog.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CREATE / EDIT PRODUCT MODAL */}
            {(isCreatingMcProduct || editingMcProduct) && (
              <div className="fixed inset-0 z-[9990] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="w-full max-w-2xl bg-[#171C28] border border-white/10 rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <ShoppingBag size={18} className="text-emerald-400" />
                      <span>{isCreatingMcProduct ? 'Create New Product' : `Edit: ${editingMcProduct?.name}`}</span>
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingMcProduct(false);
                        setEditingMcProduct(null);
                      }}
                      className="text-slate-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveMcProduct} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300">Product Name *</label>
                        <input
                          type="text"
                          required
                          value={mcProductForm.name}
                          onChange={(e) => setMcProductForm({ ...mcProductForm, name: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-[#0078D4]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300">Category *</label>
                        <select
                          value={mcProductForm.category}
                          onChange={(e) => {
                            const cat = e.target.value;
                            const catNames: Record<string, string> = {
                              plugins: 'Minecraft Plugins',
                              setups: 'Server Setups',
                              configs: 'Plugin Configurations',
                              resourcepacks: 'Resource Packs',
                              skript: 'Skript & Scripts',
                              maps: 'Maps & Schematics',
                              serverconfigs: 'Server Configurations',
                              mods: 'Mods',
                              weapons: 'Custom Weapons & Abilities',
                              tools: 'Tools & Other Resources',
                            };
                            setMcProductForm({
                              ...mcProductForm,
                              category: cat,
                              category_name: catNames[cat] || cat,
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-[#0078D4]"
                        >
                          <option value="plugins">Plugins</option>
                          <option value="setups">Minecraft Setups</option>
                          <option value="configs">Plugin Configurations</option>
                          <option value="resourcepacks">Resource Packs</option>
                          <option value="skript">Skript & Scripts</option>
                          <option value="maps">Maps & Schematics</option>
                          <option value="serverconfigs">Server Configurations</option>
                          <option value="mods">Mods</option>
                          <option value="weapons">Custom Weapons & Abilities</option>
                          <option value="tools">Tools & Other Resources</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">Short Summary Tagline</label>
                      <input
                        type="text"
                        value={mcProductForm.short_desc}
                        onChange={(e) => setMcProductForm({ ...mcProductForm, short_desc: e.target.value })}
                        placeholder="Single-sentence summary displayed on cards..."
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-[#0078D4]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">Full Description</label>
                      <textarea
                        rows={3}
                        value={mcProductForm.full_desc}
                        onChange={(e) => setMcProductForm({ ...mcProductForm, full_desc: e.target.value })}
                        placeholder="Comprehensive feature overview, mechanics, and usage instructions..."
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-[#0078D4]"
                      />
                    </div>

                    {/* Pricing */}
                    <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                          <DollarSign size={14} className="text-emerald-400" />
                          <span>Pricing & Digital Delivery Mode</span>
                        </span>
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                          <input
                            type="checkbox"
                            checked={mcProductForm.is_free}
                            onChange={(e) =>
                              setMcProductForm({
                                ...mcProductForm,
                                is_free: e.target.checked,
                                price: e.target.checked ? 0 : mcProductForm.price || 5,
                              })
                            }
                            className="rounded accent-[#0078D4]"
                          />
                          <span>100% Free Download</span>
                        </label>
                      </div>

                      {!mcProductForm.is_free && (
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400">Price ($ USD)</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={mcProductForm.price}
                              onChange={(e) =>
                                setMcProductForm({ ...mcProductForm, price: parseFloat(e.target.value) || 0 })
                              }
                              className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white font-mono outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400">Target Currency</label>
                            <input
                              type="text"
                              value="USD ($)"
                              disabled
                              className="w-full px-3 py-1.5 rounded-lg bg-black/30 border border-white/5 text-xs text-slate-400 font-mono"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Technical & Versions */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300">Version String</label>
                        <input
                          type="text"
                          value={mcProductForm.version}
                          onChange={(e) => setMcProductForm({ ...mcProductForm, version: e.target.value })}
                          placeholder="e.g. v1.4.2"
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300">File Package Format</label>
                        <select
                          value={mcProductForm.file_format}
                          onChange={(e) => setMcProductForm({ ...mcProductForm, file_format: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none font-mono"
                        >
                          <option value=".jar">.jar (Plugin / Mod)</option>
                          <option value=".zip">.zip (Server Setup / Configs)</option>
                          <option value=".mcpack">.mcpack (Bedrock / Resource Pack)</option>
                          <option value=".schem">.schem (WorldEdit Schematic)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300">Package Size</label>
                        <input
                          type="text"
                          value={mcProductForm.file_size}
                          onChange={(e) => setMcProductForm({ ...mcProductForm, file_size: e.target.value })}
                          placeholder="e.g. 2.8 MB"
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none font-mono"
                        />
                      </div>
                    </div>

                    {/* Download URL */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">Direct Download Package URL</label>
                      <input
                        type="url"
                        value={mcProductForm.download_url || ''}
                        onChange={(e) => setMcProductForm({ ...mcProductForm, download_url: e.target.value })}
                        placeholder="https://github.com/.../release.jar or direct CDN download link"
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none font-mono"
                      />
                    </div>

                    {/* Version Changelog */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">Release Changelog Notes</label>
                      <textarea
                        rows={2}
                        value={mcProductForm.changelog || ''}
                        onChange={(e) => setMcProductForm({ ...mcProductForm, changelog: e.target.value })}
                        placeholder="v1.4.2 — Added Paper 1.21.4 support, optimized entity tracking..."
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none font-mono text-[11px]"
                      />
                    </div>

                    {/* Toggles */}
                    <div className="flex items-center gap-6 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={mcProductForm.published !== false}
                          onChange={(e) => setMcProductForm({ ...mcProductForm, published: e.target.checked })}
                          className="rounded accent-[#0078D4]"
                        />
                        <span>Published (Visible in Store)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={mcProductForm.featured === true}
                          onChange={(e) => setMcProductForm({ ...mcProductForm, featured: e.target.checked })}
                          className="rounded accent-amber-500"
                        />
                        <span>★ Featured Release</span>
                      </label>
                    </div>

                    {/* Modal Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingMcProduct(false);
                          setEditingMcProduct(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-[#0078D4] hover:bg-[#0086F0] text-white font-bold text-xs shadow-lg shadow-sky-500/20"
                      >
                        Save Product to Cloud
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: DISCORD & PURCHASING */}
        {activeTab === 'discord' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Discord Purchase System Configuration
              </h1>
              <p className="text-slate-400 text-xs mt-0.5">
                Configure destination Discord server invites, channel overrides, button labels, and buyer instructions.
              </p>
            </div>

            <form onSubmit={handleSaveDiscordSettings} className="space-y-5">
              <div className="p-5 rounded-2xl bg-[#171C28] border border-white/10 space-y-4 shadow-lg">
                <h3 className="font-bold text-white text-sm">Discord URLs & Channel Destinations</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">Main Discord Server URL</label>
                    <input
                      type="text"
                      value={discordForm.mainServerUrl}
                      onChange={(e) => setDiscordForm({ ...discordForm, mainServerUrl: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#0078D4]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">Purchase / Ticket Link</label>
                    <input
                      type="text"
                      value={discordForm.purchaseSupportUrl}
                      onChange={(e) => setDiscordForm({ ...discordForm, purchaseSupportUrl: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#0078D4]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">Minecraft Products Channel Link</label>
                    <input
                      type="text"
                      value={discordForm.minecraftProductsUrl}
                      onChange={(e) => setDiscordForm({ ...discordForm, minecraftProductsUrl: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#0078D4]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">Web Development Channel Link</label>
                    <input
                      type="text"
                      value={discordForm.webDevelopmentUrl}
                      onChange={(e) => setDiscordForm({ ...discordForm, webDevelopmentUrl: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#0078D4]"
                    />
                  </div>
                </div>
              </div>

              {/* Button Labels & Buyer Instructions */}
              <div className="p-5 rounded-2xl bg-[#171C28] border border-white/10 space-y-4 shadow-lg">
                <h3 className="font-bold text-white text-sm">Button Text & Purchase Instructions</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">Minecraft Store Button</label>
                    <input
                      type="text"
                      value={discordForm.buttonLabelMinecraft}
                      onChange={(e) => setDiscordForm({ ...discordForm, buttonLabelMinecraft: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#0078D4]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">LivingYuji Store Button</label>
                    <input
                      type="text"
                      value={discordForm.buttonLabelStore}
                      onChange={(e) => setDiscordForm({ ...discordForm, buttonLabelStore: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#0078D4]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">Services & Quotes Button</label>
                    <input
                      type="text"
                      value={discordForm.buttonLabelServices}
                      onChange={(e) => setDiscordForm({ ...discordForm, buttonLabelServices: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#0078D4]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Step-by-Step Purchase Instructions</label>
                  <textarea
                    rows={4}
                    value={discordForm.purchaseInstructions}
                    onChange={(e) => setDiscordForm({ ...discordForm, purchaseInstructions: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-xs leading-relaxed focus:outline-none focus:border-[#0078D4]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs shadow-lg shadow-[#5865F2]/20 flex items-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <Save size={15} />
                  <span>Save Discord Configuration</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 7: SERVICES */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Services & Development Offerings</h1>
                <p className="text-slate-400 text-xs mt-0.5">
                  Manage freelance service categories, price baselines and Discord order routing.
                </p>
              </div>
              <button
                onClick={() => openWindow('services')}
                className="px-4 py-2 rounded-xl bg-[#0078D4] hover:bg-[#0086F0] text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                <Briefcase size={14} />
                <span>Open Services App</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Website Development', price: '$500+', turnaround: '5-14 days' },
                { title: 'Discord Bot Architecture', price: '$250+', turnaround: '3-7 days' },
                { title: 'Minecraft Custom Plugins', price: '$400+', turnaround: '5-10 days' },
                { title: 'Purpur / Velocity Setup', price: '$300+', turnaround: '2-5 days' },
              ].map((s) => (
                <div key={s.title} className="p-4 rounded-xl bg-[#171C28] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">{s.title}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                      Active
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">Baseline: {s.price} | Turnaround: {s.turnaround}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: MEDIA LIBRARY */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Image size={18} className="text-purple-400" />
                  <span>Media Assets & Content Library</span>
                </h1>
                <p className="text-slate-400 text-xs mt-0.5">
                  Manage static brand assets, project screenshots, wallpapers, and digital product covers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#0078D4] hover:bg-[#0086F0] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20"
                >
                  <Plus size={14} />
                  <span>Register Asset</span>
                </button>
              </div>
            </div>

            {/* Assets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {mediaAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-4 rounded-2xl bg-[#171C28] border border-white/10 space-y-3 flex flex-col justify-between hover:border-white/20 transition-all shadow-lg group"
                >
                  <div className="space-y-2">
                    {/* Media Thumbnail / Preview */}
                    <div className="w-full h-32 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden relative">
                      {asset.type === 'image' || asset.url.endsWith('.png') || asset.url.endsWith('.jpg') || asset.url.endsWith('.svg') ? (
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="max-h-full max-w-full object-contain p-2 group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                          <Image size={24} />
                        </div>
                      )}
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/10 text-[9px] font-mono text-slate-300 uppercase">
                        {asset.type}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-xs truncate" title={asset.name}>
                        {asset.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono truncate" title={asset.url}>
                        {asset.url}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{asset.size || 'Static'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator !== 'undefined') {
                          navigator.clipboard.writeText(asset.url);
                          showToast(`Copied URL: ${asset.url}`);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-sky-400 flex items-center gap-1 transition-colors"
                    >
                      <Copy size={11} />
                      <span>Copy URL</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* REGISTER ASSET MODAL */}
            {isMediaModalOpen && (
              <div className="fixed inset-0 z-[9990] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-[#171C28] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Image size={18} className="text-purple-400" />
                      <span>Register Media Asset</span>
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsMediaModalOpen(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <form onSubmit={handleAddMedia} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">Asset File Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. hero-banner.png"
                        value={mediaForm.name}
                        onChange={(e) => setMediaForm({ ...mediaForm, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-[#0078D4]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">Public Asset URL *</label>
                      <input
                        type="text"
                        required
                        placeholder="https://... or /wallpapers/custom.png"
                        value={mediaForm.url}
                        onChange={(e) => setMediaForm({ ...mediaForm, url: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-[#0078D4] font-mono text-[11px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">Asset Type</label>
                      <select
                        value={mediaForm.type}
                        onChange={(e) => setMediaForm({ ...mediaForm, type: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-[#0078D4]"
                      >
                        <option value="image">Image (PNG / JPG / WebP)</option>
                        <option value="icon">Icon / Emblem (SVG / ICO)</option>
                        <option value="document">Document / PDF</option>
                        <option value="video">Video (MP4 / WebM)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setIsMediaModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-[#0078D4] hover:bg-[#0086F0] text-white font-bold text-xs shadow-lg shadow-sky-500/20"
                      >
                        Register Asset
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 8: BACKUP & RESTORE */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">System Backup & Export</h1>
              <p className="text-slate-400 text-xs mt-0.5">
                Download snapshot of website state, icon arrangements, and project files.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#171C28] border border-white/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0078D4]/20 text-[#0078D4] border border-[#0078D4]/40 flex items-center justify-center">
                  <Download size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Export Full State JSON</h3>
                  <p className="text-[11px] text-slate-400">
                    Includes all user desktop icon positions, active theme settings, Discord configurations, and metadata.
                  </p>
                </div>
              </div>

              <button
                onClick={handleExportBackup}
                className="px-5 py-2.5 rounded-xl bg-[#0078D4] hover:bg-[#0086F0] text-white font-bold text-xs shadow-lg flex items-center gap-2"
              >
                <Download size={15} />
                <span>Download Backup File</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
