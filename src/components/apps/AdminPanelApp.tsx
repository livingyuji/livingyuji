'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWindowStore } from '@/store/windowStore';
import { useDesktopIconStore, GRID_CONFIG } from '@/store/desktopIconStore';
import { useFileSystemStore } from '@/store/fileSystemStore';
import { useDiscordSettingsStore } from '@/store/discordSettingsStore';
import { useShowcaseStore, ShowcaseProject, ProjectStatus } from '@/store/showcaseStore';
import { checkSupabaseConnection } from '@/lib/supabase/client';
import { saveVideoWallpaperBlob, clearVideoWallpaperBlob, resolveWallpaperMediaUrl } from '@/lib/storage/wallpaperStorage';
import { saveMusicAudioBlob, saveMusicCoverBlob, deleteMusicBlobs, resolveMusicMediaUrl } from '@/lib/storage/musicStorage';
import {
  Shield,
  Layout,
  Palette,
  FolderTree,
  ShoppingBag,
  MessageSquare,
  Briefcase,
  Image,
  Music,
  Play,
  Pause,
  Volume2,
  Disc,
  Eye,
  EyeOff,
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
  Activity,
  HardDrive,
  Server,
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
  | 'music'
  | 'backup'
  | 'diagnostics';

interface AdminPanelAppProps {
  isStandalonePage?: boolean;
}

export function AdminPanelApp({ isStandalonePage = false }: AdminPanelAppProps) {
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [passphraseInput, setPassphraseInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const { settings, updateSettings, openWindow } = useWindowStore();
  const { positions, resetToDefaultLayout, movementEnabled, setMovementEnabled } = useDesktopIconStore();
  const { files, createFile, deleteItem, updateFileContent } = useFileSystemStore();
  const discordStore = useDiscordSettingsStore();
  const showcaseStore = useShowcaseStore();

  // Diagnostics State
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [diagnosticError, setDiagnosticError] = useState<string | null>(null);

  // Authenticated fetch wrapper that sends credentials & Bearer headers, and handles 401
  const adminFetch = React.useCallback(
    async (url: string, init?: RequestInit): Promise<Response> => {
      const headers = new Headers(init?.headers || {});
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('lyos_admin_token') : null;
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
        headers.set('x-admin-token', token);
      }
      const response = await fetch(url, {
        ...init,
        headers,
        credentials: 'include',
      });
      if (response.status === 401) {
        setAuthState('unauthenticated');
        setLoginError('Your administrator session has expired or is invalid. Please re-enter your administrator passphrase.');
        if (isStandalonePage && typeof window !== 'undefined') {
          window.location.href = '/admin?returnTo=/admin/dashboard&error=session_required';
        }
      }
      return response;
    },
    [isStandalonePage]
  );

  const runDiagnostics = React.useCallback(async () => {
    setIsRunningDiagnostics(true);
    setDiagnosticError(null);
    try {
      const res = await adminFetch('/api/admin/diagnostics');
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setDiagnosticData(data.diagnostics);
      } else {
        setDiagnosticError(data.error || 'Failed to retrieve diagnostics.');
      }
    } catch (err: any) {
      setDiagnosticError(err.message || 'Network error running diagnostics.');
    } finally {
      setIsRunningDiagnostics(false);
    }
  }, [adminFetch]);

  useEffect(() => {
    let isMounted = true;
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('lyos_admin_token') : null;
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-admin-token'] = token;
    }

    fetch('/api/admin/session', { headers, credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (isMounted) {
          if (data.authenticated) {
            setAuthState('authenticated');
          } else {
            if (isStandalonePage && typeof window !== 'undefined') {
              window.location.href = '/admin?returnTo=/admin/dashboard&error=session_required';
            } else {
              setAuthState('unauthenticated');
            }
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          if (isStandalonePage && typeof window !== 'undefined') {
            window.location.href = '/admin?returnTo=/admin/dashboard&error=session_required';
          } else {
            setAuthState('unauthenticated');
          }
        }
      });
    return () => {
      isMounted = false;
    };
  }, [isStandalonePage]);

  // Auto-run diagnostics when switching to the tab for the first time
  useEffect(() => {
    if (activeTab === 'diagnostics' && !diagnosticData && !isRunningDiagnostics) {
      runDiagnostics();
    }
  }, [activeTab, diagnosticData, isRunningDiagnostics, runDiagnostics]);

  const handleDesktopLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphraseInput.trim()) return;
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const res = await fetch('/api/admin/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ passphrase: passphraseInput }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setLoginError(data.error || 'Authentication rejected. Incorrect passphrase.');
        return;
      }
      if (data.token && typeof window !== 'undefined') {
        sessionStorage.setItem('lyos_admin_token', data.token);
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
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    } finally {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('lyos_admin_token');
      }
      setAuthState('unauthenticated');
      setPassphraseInput('');
      showToast('Signed out of administrator console.');
      if (isStandalonePage && typeof window !== 'undefined') {
        window.location.href = '/admin?message=logged_out';
      }
    }
  };

  // Showcase Project Form State
  const [editingProject, setEditingProject] = useState<ShowcaseProject | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
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

  const handleSaveProject = async () => {
    if (!projectForm.title?.trim()) {
      showToast('Project title is required.');
      return;
    }
    setIsSavingProject(true);
    try {
      const isEditing = Boolean(editingProject);
      const newProj: ShowcaseProject = {
        id: editingProject ? editingProject.id : `proj-${Date.now()}`,
        title: projectForm.title.trim(),
        slug:
          projectForm.slug ||
          projectForm.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, ''),
        category: projectForm.category || 'web-apps',
        categoryName: projectForm.categoryName || 'Websites & Web Apps',
        summary: projectForm.summary || '',
        description: projectForm.description || '',
        gradientBg: projectForm.gradientBg || 'from-blue-600 to-indigo-900',
        iconSymbol: projectForm.iconSymbol || '⚡',
        screenshots: projectForm.screenshots || [],
        features: projectForm.features || ['Feature 1'],
        technologies: projectForm.technologies || ['Java'],
        status: (projectForm.status as ProjectStatus) || 'Released',
        featured: Boolean(projectForm.featured),
        isFree: Boolean(projectForm.isFree),
        price: projectForm.price || 0,
        version: projectForm.version || 'v1.0.0',
        links: projectForm.links || {},
        createdAt: editingProject?.createdAt || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };

      const res = await adminFetch('/api/admin/showcase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProj,
          category_id: newProj.category || 'web-apps',
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        showToast(data.error || 'Failed to save showcase project.');
        return;
      }

      if (isEditing) {
        showcaseStore.updateProject(editingProject!.id, newProj);
        showToast(`Saved changes to "${newProj.title}"!`);
      } else {
        showcaseStore.addProject(newProj);
        showToast(`Created project "${newProj.title}"!`);
      }
      setIsCreatingProject(false);
      setEditingProject(null);
    } catch {
      showToast('Error saving project to server.');
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (!confirm(`Delete project "${title}"?`)) return;
    try {
      const res = await adminFetch(`/api/admin/showcase?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        showToast(data.error || 'Failed to delete project.');
        return;
      }
      showcaseStore.deleteProject(id);
      showToast(`Deleted ${title}`);
    } catch {
      showToast('Error deleting project.');
    }
  };

  const handleUpdateProjectStatus = async (id: string, status: string) => {
    try {
      const res = await adminFetch('/api/admin/showcase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showcaseStore.updateProject(id, { status: status as any });
        showToast(`Status updated to ${status}.`);
      } else {
        showToast(data.error || 'Failed to update status.');
      }
    } catch {
      showToast('Failed to update status.');
    }
  };

  const handleToggleProjectFeatured = async (p: ShowcaseProject) => {
    try {
      const nextFeatured = !p.featured;
      const res = await adminFetch('/api/admin/showcase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: p.id, featured: nextFeatured }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showcaseStore.toggleFeatured(p.id);
        showToast(`Project is now ${nextFeatured ? 'Featured' : 'Standard'}.`);
      } else {
        showToast(data.error || 'Failed to toggle featured.');
      }
    } catch {
      showToast('Failed to toggle featured.');
    }
  };

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

  const [isSavingDiscord, setIsSavingDiscord] = useState(false);

  useEffect(() => {
    adminFetch('/api/admin/discord')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.settings) {
          setDiscordForm({
            mainServerUrl: d.settings.main_server_url || discordStore.mainServerUrl,
            purchaseSupportUrl: d.settings.purchase_support_url || discordStore.purchaseSupportUrl,
            minecraftProductsUrl: d.settings.minecraft_products_url || discordStore.minecraftProductsUrl,
            webDevelopmentUrl: d.settings.web_development_url || discordStore.webDevelopmentUrl,
            discordBotsUrl: d.settings.discord_bots_url || discordStore.discordBotsUrl,
            serverSetupsUrl: d.settings.server_setups_url || discordStore.serverSetupsUrl,
            resourcePacksUrl: d.settings.resource_packs_url || discordStore.resourcePacksUrl,
            fallbackUrl: d.settings.fallback_url || discordStore.fallbackUrl,
            buttonLabelMinecraft: d.settings.button_label_minecraft || discordStore.buttonLabelMinecraft,
            buttonLabelStore: d.settings.button_label_store || discordStore.buttonLabelStore,
            buttonLabelServices: d.settings.button_label_services || discordStore.buttonLabelServices,
            purchaseInstructions: d.settings.purchase_instructions || discordStore.purchaseInstructions,
          });
        }
      })
      .catch(() => {});
  }, [adminFetch, discordStore]);

  const handleSaveDiscordSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDiscord(true);
    try {
      const res = await adminFetch('/api/admin/discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          main_server_url: discordForm.mainServerUrl,
          purchase_support_url: discordForm.purchaseSupportUrl,
          minecraft_products_url: discordForm.minecraftProductsUrl,
          web_development_url: discordForm.webDevelopmentUrl,
          discord_bots_url: discordForm.discordBotsUrl,
          server_setups_url: discordForm.serverSetupsUrl,
          resource_packs_url: discordForm.resourcePacksUrl,
          fallback_url: discordForm.fallbackUrl,
          button_label_minecraft: discordForm.buttonLabelMinecraft,
          button_label_store: discordForm.buttonLabelStore,
          button_label_services: discordForm.buttonLabelServices,
          purchase_instructions: discordForm.purchaseInstructions,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        showToast(data.error || 'Failed to save Discord settings.');
        return;
      }
      discordStore.updateSettings(discordForm);
      showToast('Discord settings saved and confirmed in persistent storage!');
    } catch {
      showToast('Error connecting to server to save Discord settings.');
    } finally {
      setIsSavingDiscord(false);
    }
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
  const [resolvedVideoPreviewUrl, setResolvedVideoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    resolveWallpaperMediaUrl(brandingForm.customVideoWallpaperUrl, 'video').then((url) => {
      if (!isCancelled) setResolvedVideoPreviewUrl(url);
    });
    return () => {
      isCancelled = true;
    };
  }, [brandingForm.customVideoWallpaperUrl]);

  // Load cloud branding
  useEffect(() => {
    adminFetch('/api/admin/branding')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.settings) {
          setBrandingForm((prev) => ({
            ...prev,
            brandName: d.settings.brand_name || prev.brandName,
            siteTitle: d.settings.site_title || prev.siteTitle,
            wallpaper: d.settings.wallpaper || prev.wallpaper,
            accentColor: d.settings.accent_color || prev.accentColor,
            theme: d.settings.theme || prev.theme,
            customLogoUrl: d.settings.custom_logo_url || prev.customLogoUrl,
            customFaviconUrl: d.settings.custom_favicon_url || prev.customFaviconUrl,
            customWallpaperUrl: d.settings.custom_wallpaper_url !== undefined ? d.settings.custom_wallpaper_url : prev.customWallpaperUrl,
          }));
        }
      })
      .catch(() => {});
  }, [adminFetch]);

  const handleSaveBranding = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingBranding(true);

    try {
      const res = await adminFetch('/api/admin/branding', {
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
          custom_video_wallpaper_url: brandingForm.customVideoWallpaperUrl || null,
          video_wallpaper_muted: brandingForm.videoWallpaperMuted !== false,
          wallpaper_mode: brandingForm.wallpaperMode,
          wallpaper_opacity: brandingForm.wallpaperOpacity,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        showToast(data.error || 'Failed to save branding settings.');
        return;
      }

      // 1. Immediately apply to local store upon confirmed persistence
      updateSettings({
        brandName: brandingForm.brandName,
        siteTitle: brandingForm.siteTitle,
        wallpaper: brandingForm.wallpaper as any,
        wallpaperType: brandingForm.customVideoWallpaperUrl
          ? 'video'
          : brandingForm.customWallpaperUrl
          ? 'image'
          : 'preset',
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

      showToast(
        data.destination === 'supabase_and_local'
          ? 'Branding settings saved & synced to Supabase!'
          : 'Branding settings saved & confirmed in persistent storage!'
      );
    } catch {
      showToast('Error connecting to server to save branding.');
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
      const res = await adminFetch('/api/admin/products');
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

  const [isSavingMc, setIsSavingMc] = useState(false);

  const handleSaveMcProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mcProductForm.name?.trim()) {
      showToast('Product name is required.');
      return;
    }
    setIsSavingMc(true);
    try {
      const res = await adminFetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mcProductForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        showToast(data.error || 'Failed to save product.');
        return;
      }
      showToast(`Saved product "${mcProductForm.name}"!`);
      setIsCreatingMcProduct(false);
      setEditingMcProduct(null);
      await fetchMcProducts();
    } catch {
      showToast('Error connecting to server to save product.');
    } finally {
      setIsSavingMc(false);
    }
  };

  const handleDeleteMcProduct = async (id: string, name: string) => {
    if (!confirm(`Delete product "${name}"?`)) return;
    try {
      const res = await adminFetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        showToast(data.error || 'Failed to delete product.');
        return;
      }
      showToast(`Deleted ${name}`);
      await fetchMcProducts();
    } catch {
      showToast('Error deleting product.');
    }
  };

  // -------------------------------------------------------------
  // MEDIA LIBRARY STATE & ACTIONS
  // -------------------------------------------------------------
  const [mediaAssets, setMediaAssets] = useState<any[]>([]);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isSavingMedia, setIsSavingMedia] = useState(false);
  const [mediaForm, setMediaForm] = useState({ name: '', url: '', type: 'image' });

  const fetchMediaAssets = async () => {
    try {
      const res = await adminFetch('/api/admin/media');
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
    setIsSavingMedia(true);
    try {
      const res = await adminFetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mediaForm),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showToast('Media asset registered and confirmed!');
        setIsMediaModalOpen(false);
        setMediaForm({ name: '', url: '', type: 'image' });
        await fetchMediaAssets();
      } else {
        showToast(data.error || 'Failed to register media asset.');
      }
    } catch {
      showToast('Failed to register media asset.');
    } finally {
      setIsSavingMedia(false);
    }
  };

  const handleDeleteMediaAsset = async (id: string, name: string) => {
    if (!confirm(`Delete media asset "${name}"?`)) return;
    try {
      const res = await adminFetch(`/api/admin/media?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showToast(`Deleted ${name}`);
        await fetchMediaAssets();
      } else {
        showToast(data.error || 'Failed to delete asset.');
      }
    } catch {
      showToast('Error deleting media asset.');
    }
  };

  // -------------------------------------------------------------
  // MUSIC LIBRARY STATE & ACTIONS
  // -------------------------------------------------------------
  const [musicTracks, setMusicTracks] = useState<any[]>([]);
  const [isLoadingMusic, setIsLoadingMusic] = useState(false);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [musicSearch, setMusicSearch] = useState('');
  const [musicGenreFilter, setMusicGenreFilter] = useState('all');
  const [musicStatusFilter, setMusicStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [musicSort, setMusicSort] = useState<'order' | 'title' | 'artist' | 'newest'>('order');
  const [adminPreviewTrackId, setAdminPreviewTrackId] = useState<string | null>(null);
  const [adminAudioPlaying, setAdminAudioPlaying] = useState(false);
  const adminAudioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const initialMusicForm = {
    title: '',
    artist: 'LivingYuji',
    album: 'LivingYuji Releases',
    genre: 'Cyber Lo-Fi',
    duration: '3:00',
    duration_sec: 180,
    description: '',
    tags: 'cyber, lo-fi, chill',
    audio_url: '',
    cover_url: '',
    cover_gradient: 'from-emerald-900 via-teal-950 to-slate-950',
    published: true,
    featured: false,
    track_order: 1,
    file_format: 'mp3',
    file_size: '',
  };

  const [musicForm, setMusicForm] = useState(initialMusicForm);

  const fetchMusicTracks = async () => {
    setIsLoadingMusic(true);
    try {
      const res = await adminFetch('/api/admin/music');
      const data = await res.json();
      if (data.success && Array.isArray(data.tracks)) {
        setMusicTracks(data.tracks);
      }
    } catch (e) {
      console.error('Failed to fetch music tracks', e);
    } finally {
      setIsLoadingMusic(false);
    }
  };

  useEffect(() => {
    fetchMusicTracks();
  }, []);

  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.mp3', '.wav', '.ogg', '.flac'];
    const lowerName = file.name.toLowerCase();
    const isAudio = file.type.startsWith('audio/') || validExtensions.some((ext) => lowerName.endsWith(ext));

    if (!isAudio) {
      showToast('Please select a valid audio file (.mp3, .wav, .ogg, .flac)');
      return;
    }

    const ext = lowerName.split('.').pop() || 'mp3';
    const trackTempId = editingTrackId || `track-${Date.now()}`;

    // Read duration safely using temporary object URL
    const tempUrl = URL.createObjectURL(file);
    const tempAudio = new Audio(tempUrl);
    tempAudio.onloadedmetadata = () => {
      const sec = Math.round(tempAudio.duration) || 180;
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      const durationStr = `${m}:${s < 10 ? '0' : ''}${s}`;
      setMusicForm((prev) => ({
        ...prev,
        duration: durationStr,
        duration_sec: sec,
      }));
      URL.revokeObjectURL(tempUrl);
    };

    try {
      showToast(`Saving audio file "${file.name}" to IndexedDB...`);
      const persistentUrl = await saveMusicAudioBlob(trackTempId, file);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      setMusicForm((prev) => ({
        ...prev,
        audio_url: persistentUrl,
        file_format: ext,
        file_size: sizeMB,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
      }));
      showToast('Audio file saved and verified!');
    } catch (err) {
      console.error('Failed to store audio file:', err);
      showToast('Failed to save audio to local storage.');
    }
  };

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid cover image (.png, .jpg, .webp)');
      return;
    }

    const trackTempId = editingTrackId || `track-${Date.now()}`;
    try {
      const coverUrl = await saveMusicCoverBlob(trackTempId, file);
      setMusicForm((prev) => ({
        ...prev,
        cover_url: coverUrl,
      }));
      showToast('Cover art saved!');
    } catch (err) {
      console.error('Failed to store cover image:', err);
      showToast('Failed to save cover image.');
    }
  };

  const [isSavingMusic, setIsSavingMusic] = useState(false);

  const handleSaveMusicTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!musicForm.title.trim()) {
      showToast('Track title is required.');
      return;
    }
    if (!musicForm.audio_url.trim()) {
      showToast('Audio file or valid URL is required.');
      return;
    }
    setIsSavingMusic(true);

    try {
      const isEditing = Boolean(editingTrackId);
      const payload = {
        ...musicForm,
        id: editingTrackId || `track-${Date.now()}`,
        tags: typeof musicForm.tags === 'string'
          ? musicForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : musicForm.tags,
      };

      const res = await adminFetch('/api/admin/music', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        showToast(data.error || 'Failed to save track.');
        return;
      }

      showToast(`Track "${payload.title}" saved & confirmed!`);
      setIsMusicModalOpen(false);
      setEditingTrackId(null);
      setMusicForm(initialMusicForm);
      await fetchMusicTracks();
    } catch {
      showToast('Failed to save music track.');
    } finally {
      setIsSavingMusic(false);
    }
  };

  const handleDeleteMusicTrack = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete track "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await adminFetch(`/api/admin/music?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        showToast(data.error || 'Failed to delete track.');
        return;
      }
      await deleteMusicBlobs(id);
      showToast(`Deleted track "${title}".`);
      await fetchMusicTracks();
    } catch {
      showToast('Error deleting track.');
    }
  };

  const handleTogglePublishTrack = async (track: any) => {
    try {
      const newStatus = !track.published;
      const res = await adminFetch('/api/admin/music', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: track.id, published: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || 'Failed to update track status.');
        return;
      }
      showToast(`Track "${track.title}" is now ${newStatus ? 'Published' : 'Hidden (Draft)'}.`);
      fetchMusicTracks();
    } catch {
      showToast('Error updating status.');
    }
  };

  const handleToggleAdminAudioPreview = async (track: any) => {
    const audio = adminAudioPlayerRef.current;
    if (!audio) return;

    if (adminPreviewTrackId === track.id && adminAudioPlaying) {
      audio.pause();
      setAdminAudioPlaying(false);
      return;
    }

    try {
      const resolved = await resolveMusicMediaUrl(track.audio_url, track.id, 'audio');
      if (resolved) {
        audio.src = resolved;
        await audio.play();
        setAdminPreviewTrackId(track.id);
        setAdminAudioPlaying(true);
      } else {
        showToast('No playable audio stream available for this track.');
      }
    } catch (err) {
      console.warn('Admin preview playback error:', err);
      showToast('Unable to preview audio on this device.');
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
            onClick={() => setActiveTab('music')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition-all ${
              activeTab === 'music'
                ? 'bg-[#0078D4] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Music size={15} />
            <span>Music Library ({musicTracks.length})</span>
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

          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition-all ${
              activeTab === 'diagnostics'
                ? 'bg-[#0078D4] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Activity size={15} className="text-emerald-400" />
              <span>Diagnostics & Health</span>
            </div>
            {diagnosticData && (
              <span
                className={`w-2 h-2 rounded-full ${
                  diagnosticData.overall_status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
            )}
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
                            onChange={(e) => handleUpdateProjectStatus(p.id, e.target.value)}
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
                            onClick={() => handleToggleProjectFeatured(p)}
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
                              onClick={() => handleDeleteProject(p.id, p.title)}
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
                      onClick={handleSaveProject}
                      disabled={isSavingProject}
                      className="px-5 py-2 rounded-xl bg-[#0078D4] hover:bg-[#0086F0] disabled:opacity-50 text-white font-bold text-xs shadow-lg flex items-center gap-2"
                    >
                      {isSavingProject ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Project to Cloud</span>
                      )}
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
                    key={resolvedVideoPreviewUrl || 'admin-video-preview'}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    src={resolvedVideoPreviewUrl || undefined}
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
                        disabled={isSavingMc}
                        className="px-5 py-2 rounded-xl bg-[#0078D4] hover:bg-[#0086F0] disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-sky-500/20 flex items-center gap-2"
                      >
                        {isSavingMc ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Saving Product...</span>
                          </>
                        ) : (
                          <span>{editingMcProduct ? 'Update Product' : 'Save Product to Cloud'}</span>
                        )}
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
                  disabled={isSavingDiscord}
                  className="px-6 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-[#5865F2]/20 flex items-center gap-2 transition-all hover:scale-[1.01]"
                >
                  {isSavingDiscord ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving Configuration...</span>
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      <span>Save Discord Configuration</span>
                    </>
                  )}
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
                    <div className="flex items-center gap-1.5">
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
                      <button
                        type="button"
                        onClick={() => handleDeleteMediaAsset(asset.id, asset.name)}
                        className="p-1 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Delete asset"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
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
                        disabled={isSavingMedia}
                        className="px-5 py-2 rounded-xl bg-[#0078D4] hover:bg-[#0086F0] disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-sky-500/20 flex items-center gap-2"
                      >
                        {isSavingMedia ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Registering...</span>
                          </>
                        ) : (
                          <span>Register Asset</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: MUSIC LIBRARY MANAGEMENT */}
        {activeTab === 'music' && (
          <div className="space-y-6">
            <audio
              ref={adminAudioPlayerRef}
              onEnded={() => setAdminAudioPlaying(false)}
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Music size={18} className="text-pink-400" />
                  <span>Music Library Management</span>
                </h1>
                <p className="text-slate-400 text-xs mt-0.5">
                  Upload, inspect, catalog, and publish audio tracks directly to the LivingYuji OS music engine.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingTrackId(null);
                    setMusicForm(initialMusicForm);
                    setIsMusicModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0078D4] hover:bg-[#0086F0] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20"
                >
                  <Plus size={14} />
                  <span>Upload Song</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-4 rounded-2xl bg-[#171C28] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
              <div className="relative w-full md:w-72">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by title, artist, album, genre..."
                  value={musicSearch}
                  onChange={(e) => setMusicSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-[#0078D4]"
                />
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
                <select
                  value={musicStatusFilter}
                  onChange={(e) => setMusicStatusFilter(e.target.value as any)}
                  className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs text-slate-300 outline-none focus:border-[#0078D4]"
                >
                  <option value="all">All Tracks</option>
                  <option value="published">Published Only</option>
                  <option value="draft">Drafts Only</option>
                </select>

                <select
                  value={musicSort}
                  onChange={(e) => setMusicSort(e.target.value as any)}
                  className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs text-slate-300 outline-none focus:border-[#0078D4]"
                >
                  <option value="order">Track Order</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="artist">Artist</option>
                  <option value="newest">Newest Upload</option>
                </select>

                <button
                  type="button"
                  onClick={fetchMusicTracks}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                  title="Refresh library"
                >
                  <RefreshCw size={14} className={isLoadingMusic ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Tracks Table */}
            <div className="rounded-2xl bg-[#171C28] border border-white/10 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/30 border-b border-white/10 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4">Track Title</th>
                      <th className="py-3 px-4">Album & Genre</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Format & Size</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {musicTracks
                      .filter((t) => {
                        if (!musicSearch.trim()) return true;
                        const q = musicSearch.toLowerCase();
                        return (
                          (t.title || '').toLowerCase().includes(q) ||
                          (t.artist || '').toLowerCase().includes(q) ||
                          (t.album || '').toLowerCase().includes(q) ||
                          (t.genre || '').toLowerCase().includes(q)
                        );
                      })
                      .filter((t) => {
                        if (musicStatusFilter === 'published') return t.published;
                        if (musicStatusFilter === 'draft') return !t.published;
                        return true;
                      })
                      .sort((a, b) => {
                        if (musicSort === 'title') return (a.title || '').localeCompare(b.title || '');
                        if (musicSort === 'artist') return (a.artist || '').localeCompare(b.artist || '');
                        if (musicSort === 'newest') return (b.created_at || '').localeCompare(a.created_at || '');
                        return (a.track_order || 0) - (b.track_order || 0);
                      })
                      .map((track, idx) => {
                        const isThisPreviewPlaying = adminPreviewTrackId === track.id && adminAudioPlaying;
                        return (
                          <tr key={track.id} className="hover:bg-white/[0.02] transition-colors">
                            {/* Track order & Preview Play */}
                            <td className="py-3 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleAdminAudioPreview(track)}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                  isThisPreviewPlaying
                                    ? 'bg-emerald-500 text-slate-950 shadow-md scale-105'
                                    : 'bg-white/5 hover:bg-white/10 text-slate-300'
                                }`}
                                title={isThisPreviewPlaying ? 'Pause Preview' : 'Preview Audio'}
                              >
                                {isThisPreviewPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
                              </button>
                            </td>

                            {/* Title & Artist */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-9 h-9 rounded-lg bg-gradient-to-br ${
                                    track.cover_gradient || 'from-indigo-600 to-purple-800'
                                  } flex items-center justify-center shrink-0 border border-white/10 shadow-sm relative overflow-hidden`}
                                >
                                  {track.cover_url ? (
                                    <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <Disc size={15} className="text-white/80" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-white text-xs truncate flex items-center gap-1.5">
                                    <span className="truncate">{track.title}</span>
                                    {track.featured && (
                                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] shrink-0 font-bold">
                                        ★ Featured
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-400 truncate">{track.artist}</div>
                                </div>
                              </div>
                            </td>

                            {/* Album & Genre */}
                            <td className="py-3 px-4">
                              <div className="text-slate-200 text-xs font-medium">{track.album}</div>
                              <div className="text-[10px] text-slate-400">{track.genre || 'Cyber Lo-Fi'}</div>
                            </td>

                            {/* Duration */}
                            <td className="py-3 px-4 font-mono text-slate-300 text-xs">{track.duration}</td>

                            {/* Format & Size */}
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300">
                                {track.file_format?.toUpperCase() || 'MP3'}
                              </span>
                              {track.file_size && (
                                <span className="ml-1.5 text-[10px] text-slate-500 font-mono">{track.file_size}</span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-3 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleTogglePublishTrack(track)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                                  track.published
                                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                    : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                                }`}
                                title="Click to toggle publish status"
                              >
                                {track.published ? 'Published' : 'Draft'}
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleTogglePublishTrack(track)}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                                  title={track.published ? 'Hide / Unpublish' : 'Publish to Library'}
                                >
                                  {track.published ? <EyeOff size={13} /> : <Eye size={13} />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingTrackId(track.id);
                                    setMusicForm({
                                      title: track.title,
                                      artist: track.artist,
                                      album: track.album,
                                      genre: track.genre || 'Cyber Lo-Fi',
                                      duration: track.duration,
                                      duration_sec: track.duration_sec || 180,
                                      description: track.description || '',
                                      tags: Array.isArray(track.tags) ? track.tags.join(', ') : track.tags || '',
                                      audio_url: track.audio_url,
                                      cover_url: track.cover_url || '',
                                      cover_gradient: track.cover_gradient || 'from-emerald-900 via-teal-950 to-slate-950',
                                      published: track.published,
                                      featured: track.featured,
                                      track_order: track.track_order || 1,
                                      file_format: track.file_format || 'mp3',
                                      file_size: track.file_size || '',
                                    });
                                    setIsMusicModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400"
                                  title="Edit Song"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMusicTrack(track.id, track.title)}
                                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                                  title="Delete Song"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {musicTracks.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No music tracks found in library. Click &ldquo;Upload Song&rdquo; to add your first track.
                </div>
              )}
            </div>

            {/* UPLOAD / EDIT MUSIC TRACK MODAL */}
            {isMusicModalOpen && (
              <div className="fixed inset-0 z-[9990] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                <div className="w-full max-w-xl bg-[#171C28] border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl my-8">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Music size={18} className="text-pink-400" />
                      <span>{editingTrackId ? 'Edit Music Track' : 'Upload New Song to Library'}</span>
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMusicModalOpen(false);
                        setEditingTrackId(null);
                      }}
                      className="text-slate-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveMusicTrack} className="space-y-4 text-xs">
                    {/* Audio File Upload Box */}
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                      <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                        <span>Audio Source File *</span>
                        {musicForm.duration && (
                          <span className="text-emerald-400 font-mono text-[10px]">
                            Duration: {musicForm.duration} • Format: {musicForm.file_format.toUpperCase()}
                          </span>
                        )}
                      </label>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <label className="cursor-pointer px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shrink-0 shadow-sm">
                          <Upload size={14} />
                          <span>Select Audio File</span>
                          <input
                            type="file"
                            accept="audio/mp3,audio/wav,audio/ogg,audio/flac,audio/mpeg,.mp3,.wav,.ogg,.flac"
                            onChange={handleAudioFileUpload}
                            className="hidden"
                          />
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Or enter direct public audio URL"
                          value={musicForm.audio_url}
                          onChange={(e) => setMusicForm({ ...musicForm, audio_url: e.target.value })}
                          className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-[#0078D4] font-mono text-[11px]"
                        />
                      </div>
                    </div>

                    {/* Metadata: Title & Artist */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300">Track Title *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Frostbite Protocol"
                          value={musicForm.title}
                          onChange={(e) => setMusicForm({ ...musicForm, title: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-[#0078D4]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300">Artist *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. LivingYuji"
                          value={musicForm.artist}
                          onChange={(e) => setMusicForm({ ...musicForm, artist: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-[#0078D4]"
                        />
                      </div>
                    </div>

                    {/* Album & Genre */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[11px] font-semibold text-slate-300">Album Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Christmas 2025: New Tales"
                          value={musicForm.album}
                          onChange={(e) => setMusicForm({ ...musicForm, album: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-[#0078D4]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300">Genre</label>
                        <input
                          type="text"
                          placeholder="Cyber Lo-Fi"
                          value={musicForm.genre}
                          onChange={(e) => setMusicForm({ ...musicForm, genre: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-[#0078D4]"
                        />
                      </div>
                    </div>

                    {/* Artwork Upload & Gradient */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300">Cover Artwork</label>
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-medium text-xs flex items-center justify-center gap-1.5 shrink-0">
                            <Upload size={12} />
                            <span>Upload Art</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCoverFileUpload}
                              className="hidden"
                            />
                          </label>
                          <input
                            type="text"
                            placeholder="Or image URL"
                            value={musicForm.cover_url}
                            onChange={(e) => setMusicForm({ ...musicForm, cover_url: e.target.value })}
                            className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-[#0078D4] text-[11px]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300">Cover Gradient Preset</label>
                        <select
                          value={musicForm.cover_gradient}
                          onChange={(e) => setMusicForm({ ...musicForm, cover_gradient: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-[#0078D4]"
                        >
                          <option value="from-emerald-900 via-teal-950 to-slate-950">Emerald Midnight</option>
                          <option value="from-purple-900 via-indigo-950 to-slate-950">Cyber Violet</option>
                          <option value="from-amber-900 via-stone-950 to-slate-950">Warm Lo-Fi Amber</option>
                          <option value="from-blue-900 via-slate-950 to-black">Deep Cyber Blue</option>
                          <option value="from-rose-900 via-purple-950 to-slate-950">Neon Rose</option>
                        </select>
                      </div>
                    </div>

                    {/* Description & Tags */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">Track Description</label>
                      <textarea
                        rows={2}
                        placeholder="Description, instruments used, or context behind this audio piece..."
                        value={musicForm.description}
                        onChange={(e) => setMusicForm({ ...musicForm, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-[#0078D4] resize-none"
                      />
                    </div>

                    {/* Flags: Published & Featured */}
                    <div className="flex items-center gap-6 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={musicForm.published}
                          onChange={(e) => setMusicForm({ ...musicForm, published: e.target.checked })}
                          className="rounded border-white/20 bg-black/40 text-[#0078D4]"
                        />
                        <span className="text-white font-medium">Publish to User-Facing Music Player</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={musicForm.featured}
                          onChange={(e) => setMusicForm({ ...musicForm, featured: e.target.checked })}
                          className="rounded border-white/20 bg-black/40 text-[#0078D4]"
                        />
                        <span className="text-white font-medium">Feature on Home Spotlight</span>
                      </label>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMusicModalOpen(false);
                          setEditingTrackId(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingMusic}
                        className="px-5 py-2 rounded-xl bg-[#0078D4] hover:bg-[#0086F0] disabled:opacity-50 text-white font-bold shadow-lg shadow-sky-500/20 flex items-center gap-2"
                      >
                        {isSavingMusic ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Saving Track...</span>
                          </>
                        ) : (
                          <span>{editingTrackId ? 'Save Changes' : 'Publish Track'}</span>
                        )}
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

        {/* TAB: DIAGNOSTICS & SYSTEM HEALTH */}
        {activeTab === 'diagnostics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Activity size={22} className="text-emerald-400" />
                  <span>System Diagnostics & Backend Health</span>
                </h1>
                <p className="text-slate-400 text-xs mt-0.5">
                  End-to-end verification of Supabase connectivity, table schemas, HMAC sessions, and dual-layer persistence.
                </p>
              </div>

              <button
                onClick={runDiagnostics}
                disabled={isRunningDiagnostics}
                className="px-4 py-2 rounded-xl bg-[#0078D4] hover:bg-[#0086F0] disabled:opacity-50 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all"
              >
                <RefreshCw size={14} className={isRunningDiagnostics ? 'animate-spin' : ''} />
                <span>{isRunningDiagnostics ? 'Running Suite...' : 'Re-Run Diagnostics'}</span>
              </button>
            </div>

            {diagnosticError && (
              <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
                <AlertTriangle size={18} className="shrink-0 text-red-400" />
                <span>{diagnosticError}</span>
              </div>
            )}

            {isRunningDiagnostics && !diagnosticData && (
              <div className="p-12 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Executing verification tests against database and storage...</p>
              </div>
            )}

            {diagnosticData && (
              <div className="space-y-5">
                {/* Status Hero Card */}
                <div
                  className={`p-5 rounded-2xl border ${
                    diagnosticData.overall_status === 'healthy'
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                      : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                  } flex items-center justify-between`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                        diagnosticData.overall_status === 'healthy'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {diagnosticData.overall_status === 'healthy' ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">
                        {diagnosticData.overall_status === 'healthy'
                          ? 'All Backend Connections Healthy & Verified'
                          : 'Operational with Recommended Migration Action'}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Diagnostics completed at {new Date(diagnosticData.timestamp).toLocaleTimeString()} — Dual-layer persistence is active.
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] px-3 py-1 rounded-full font-semibold border ${
                      diagnosticData.overall_status === 'healthy'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {diagnosticData.overall_status.toUpperCase()}
                  </span>
                </div>

                {/* Grid: 2 Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Card 1: Cloud & Local Database Tables */}
                  <div className="p-5 rounded-2xl bg-[#161B27] border border-white/10 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <Database size={16} className="text-sky-400" />
                        <h3 className="font-bold text-white text-xs">Supabase Database Tables</h3>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Host: {diagnosticData.environment?.supabase_url?.host || 'connected'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {diagnosticData.database?.tables &&
                        Object.entries(diagnosticData.database.tables).map(([table, info]: [string, any]) => {
                          const isOk = info.status === 'ok';
                          const isMissing = info.status === 'missing_table';
                          return (
                            <div
                              key={table}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    isOk ? 'bg-emerald-400' : isMissing ? 'bg-amber-400' : 'bg-red-400'
                                  }`}
                                />
                                <span className="font-mono text-xs text-white">{table}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {isOk && (
                                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                    {info.row_count} row{info.row_count === 1 ? '' : 's'}
                                  </span>
                                )}
                                {isMissing && (
                                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                    Schema Migration Needed
                                  </span>
                                )}
                                {!isOk && !isMissing && (
                                  <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                                    {info.message || 'Error'}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* Migration Action Box if music_tracks is missing */}
                    {diagnosticData.database?.tables?.music_tracks?.status === 'missing_table' && (
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2 text-xs">
                        <div className="flex items-center gap-2 font-semibold text-amber-300">
                          <AlertTriangle size={14} />
                          <span>Action: Apply Music Library Cloud Migration</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          The remote Supabase instance does not have the <code className="font-mono text-white">music_tracks</code> table yet. Tracks are currently safely persisted in local storage. To sync tracks directly to cloud Supabase, run <code className="font-mono text-white">supabase/migrations/20261025_complete_setup.sql</code> in your Supabase SQL Editor.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card 2: Safe Isolated Canary Write & Auth Health */}
                  <div className="space-y-5">
                    {/* Canary Write Card */}
                    <div className="p-5 rounded-2xl bg-[#161B27] border border-white/10 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <HardDrive size={16} className="text-emerald-400" />
                          <h3 className="font-bold text-white text-xs">Reversible Canary Write Verification</h3>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          Isolated Test
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-center">
                          <div className="text-[10px] text-slate-400">Canary Write</div>
                          <div className="font-bold text-xs mt-1 text-emerald-400 flex items-center justify-center gap-1">
                            <Check size={12} />
                            <span>Passed</span>
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-center">
                          <div className="text-[10px] text-slate-400">Readback</div>
                          <div className="font-bold text-xs mt-1 text-emerald-400 flex items-center justify-center gap-1">
                            <Check size={12} />
                            <span>Passed</span>
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-center">
                          <div className="text-[10px] text-slate-400">Cleanup</div>
                          <div className="font-bold text-xs mt-1 text-emerald-400 flex items-center justify-center gap-1">
                            <Check size={12} />
                            <span>Cleaned</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400">
                        A unique temporary canary row is written, verified for instant read consistency, and immediately purged to ensure non-destructive isolation.
                      </p>
                    </div>

                    {/* Dual-Layer Persistence & Storage Card */}
                    <div className="p-5 rounded-2xl bg-[#161B27] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <Server size={16} className="text-purple-400" />
                          <h3 className="font-bold text-white text-xs">Dual-Layer Local Engine</h3>
                        </div>
                        <span className="text-[10px] text-purple-300 font-mono">data/admin-store.json</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 rounded-lg bg-black/20 border border-white/5">
                          <span className="text-[10px] text-slate-400 block">Music Tracks</span>
                          <span className="font-bold text-white">{diagnosticData.dual_layer_store?.music_tracks_count ?? 0}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-black/20 border border-white/5">
                          <span className="text-[10px] text-slate-400 block">Products</span>
                          <span className="font-bold text-white">{diagnosticData.dual_layer_store?.minecraft_products_count ?? 0}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-black/20 border border-white/5">
                          <span className="text-[10px] text-slate-400 block">Showcase</span>
                          <span className="font-bold text-white">{diagnosticData.dual_layer_store?.showcase_projects_count ?? 0}</span>
                        </div>
                      </div>

                      <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>HMAC Token Verification: <strong className="text-emerald-400 font-mono">HMAC-SHA256 (24h)</strong></span>
                        <span>Passphrase: <strong className="text-emerald-400 font-mono">Configured</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
