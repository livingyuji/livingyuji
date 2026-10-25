'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Download,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Tag,
  Clock,
  HardDrive,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
  FileCode,
  PackageCheck,
  Plus,
  Trash2,
  Edit3,
  X,
  Lock,
  Unlock,
  ChevronRight,
  ArrowLeft,
  DollarSign,
  FileText,
  Boxes,
  Compass,
} from 'lucide-react';
import { useWindowStore } from '@/store/windowStore';
import { DiscordPurchaseModal } from '@/components/common/DiscordPurchaseModal';

export type MinecraftCategory =
  | 'setups'
  | 'plugins'
  | 'configs'
  | 'resourcepacks'
  | 'skript'
  | 'maps'
  | 'serverconfigs'
  | 'mods'
  | 'weapons'
  | 'tools';

export interface MinecraftProduct {
  id: string;
  name: string;
  category: MinecraftCategory;
  categoryName: string;
  shortDesc: string;
  fullDesc: string;
  price: number; // 0 = free
  isFree: boolean;
  version: string;
  mcVersions: string[];
  serverSoftware: string[];
  dependencies: string[];
  features: string[];
  installationSteps: string[];
  changelog: string;
  fileFormat: string;
  fileSize: string;
  creator: string;
  published: boolean;
  featured: boolean;
  rating: number;
  downloadsCount: number;
  iconBg: string;
  iconSymbol: string;
  downloadUrl?: string;
  createdAt?: string;
  updatedAt: string;
}

const CATEGORY_DEFINITIONS: { id: MinecraftCategory; label: string; icon: string }[] = [
  { id: 'setups', label: 'Minecraft Setups', icon: '🏰' },
  { id: 'plugins', label: 'Plugins', icon: '🔌' },
  { id: 'configs', label: 'Plugin Configurations', icon: '⚙️' },
  { id: 'resourcepacks', label: 'Resource Packs', icon: '🎨' },
  { id: 'skript', label: 'Skript & Scripts', icon: '📜' },
  { id: 'maps', label: 'Maps & Schematics', icon: '🗺️' },
  { id: 'serverconfigs', label: 'Server Configurations', icon: '⚡' },
  { id: 'mods', label: 'Mods', icon: '📦' },
  { id: 'weapons', label: 'Custom Weapons & Abilities', icon: '⚔️' },
  { id: 'tools', label: 'Tools & Other Resources', icon: '🛠️' },
];

const INITIAL_PRODUCTS: MinecraftProduct[] = [
  {
    id: 'prod-arcane-arsenal',
    name: 'ArcaneArsenal — Magical Weapons Engine',
    category: 'weapons',
    categoryName: 'Custom Weapons & Abilities',
    shortDesc: '10+ arcane weapons with particle rays, sound design & custom model data integration.',
    fullDesc:
      'ArcaneArsenal is a production-grade custom weapon system built for Paper and Purpur servers. Features 10+ mythical weapons with raycasted particle beams, sound FX, cooldown management, and complete CustomModelData support for resource packs.',
    price: 0,
    isFree: true,
    version: 'v1.4.2',
    mcVersions: ['1.21.4', '1.21.1', '1.20.4'],
    serverSoftware: ['Purpur', 'Paper', 'Folia'],
    dependencies: ['ProtocolLib', 'PlaceholderAPI (Optional)'],
    features: [
      '10+ mythical weapons (Solar Bow, Void Blade, Storm Wand, Arcane Scythe)',
      'Raycast projectile physics and particle trail effects',
      'Configurable mana, cooldowns, and damage multipliers in config.yml',
      'Custom Model Data integration ready for automatic pack transmission',
      'Asynchronous entity calculations ensuring zero TPS drops',
    ],
    installationSteps: [
      'Download ArcaneArsenal-v1.4.2.jar',
      'Place the .jar into your server plugins/ folder',
      'Ensure ProtocolLib is installed for particle packet handling',
      'Restart your server or run /plugman reload ArcaneArsenal',
      'Run /arcane give <player> <weapon> to spawn items',
    ],
    changelog: 'v1.4.2 — Added native Paper 1.21.4 support, Folia concurrency fixes, and memory leak patch.',
    fileFormat: '.jar',
    fileSize: '412 KB',
    creator: 'LivingYuji',
    published: true,
    featured: true,
    rating: 5.0,
    downloadsCount: 1420,
    iconBg: 'from-indigo-600 to-purple-800',
    iconSymbol: '⚔️',
    updatedAt: '2026-10-24',
  },
  {
    id: 'prod-vanta-combat',
    name: 'VantaCombat — High-Tickrate PvP Suite',
    category: 'plugins',
    categoryName: 'Plugins',
    shortDesc: 'Instant hit registration, smooth knockback tuning & anti-combat log system.',
    fullDesc:
      'VantaCombat re-engineers melee and projectile combat for high-stakes PvP servers. Eliminates missed hit-ticks, offers custom knockback profiles, action-bar combat tagging, and graceful combat logging protection.',
    price: 0,
    isFree: true,
    version: 'v2.1.0',
    mcVersions: ['1.21.4', '1.21.1', '1.20.4', '1.19.4'],
    serverSoftware: ['Purpur', 'Paper', 'Velocity'],
    dependencies: ['None (Self-contained)'],
    features: [
      'Zero-delay hit registration pipeline',
      'Custom knockback physics (horizontal, vertical, friction multipliers)',
      'Action-bar combat tagging timer with spawn safe-zone enforcement',
      'Combat log NPC spawner with inventory drops',
      'PvP statistics tracking (/pvp stats)',
    ],
    installationSteps: [
      'Download VantaCombat-v2.1.0.jar',
      'Put in /plugins directory and restart server',
      'Edit config.yml to customize knockback and combat tag duration (default: 15s)',
      'Run /vanta reload to apply configuration changes live',
    ],
    changelog: 'v2.1.0 — 1.21.4 update, added sound feedback on sword-blocking, and improved shield stun.',
    fileFormat: '.jar',
    fileSize: '320 KB',
    creator: 'LivingYuji',
    published: true,
    featured: true,
    rating: 4.9,
    downloadsCount: 980,
    iconBg: 'from-cyan-600 to-blue-800',
    iconSymbol: '⚡',
    updatedAt: '2026-10-22',
  },
  {
    id: 'prod-lifesteal-setup',
    name: 'Lifesteal SMP Ultra — Complete Server Setup',
    category: 'setups',
    categoryName: 'Minecraft Setups',
    shortDesc: 'Turnkey Purpur 1.21 setup: Heart steal, custom economy, ranks & anti-cheat.',
    fullDesc:
      'A complete, turnkey server setup configured from scratch for high-performance Lifesteal SMP. Includes custom heart crafting recipes, revive beacons, coinflip, auction house, LuckPerms permissions, custom tablist, and spark profiling optimization.',
    price: 29.99,
    isFree: false,
    version: 'v3.0.0',
    mcVersions: ['1.21.4', '1.21.1'],
    serverSoftware: ['Purpur 1.21.4'],
    dependencies: ['Java 21 required'],
    features: [
      'Full pre-configured server root (plugins, configs, world spawn, permissions)',
      'Custom heart steal mechanics & revive beacon shrines',
      '12 balanced player ranks with LuckPerms pre-configured',
      'Optimized Purpur flags with 20.0 TPS under 50+ simultaneous players',
      'Complete economy system: ShopGUI+, AuctionHouse, Coinflip, Trade',
    ],
    installationSteps: [
      'Unzip the package to your server host root directory',
      'Set Java version to Java 21',
      'Run start.sh or start.bat to launch the server',
      'Log in and run /lp user <yourname> permission set * true to claim owner rank',
    ],
    changelog: 'v3.0.0 — Massive 1.21.4 rebuild with updated netherite heart recipes and Folia readiness.',
    fileFormat: '.zip',
    fileSize: '185 MB',
    creator: 'LivingYuji',
    published: true,
    featured: true,
    rating: 5.0,
    downloadsCount: 310,
    iconBg: 'from-red-600 to-rose-900',
    iconSymbol: '🏰',
    updatedAt: '2026-10-25',
  },
  {
    id: 'prod-arcane-resourcepack',
    name: 'Arcane 3D Weapons Resource Pack',
    category: 'resourcepacks',
    categoryName: 'Resource Packs',
    shortDesc: '16 hand-crafted 3D weapon models with emissive glow & custom sound FX.',
    fullDesc:
      'High-resolution 3D weapon and equipment model pack for modern Minecraft servers. Perfectly matched with the ArcaneArsenal plugin or usable standalone via CustomModelData.',
    price: 0,
    isFree: true,
    version: 'v1.2.0',
    mcVersions: ['1.21.4', '1.21.1', '1.20.4'],
    serverSoftware: ['All Platforms (Vanilla Client Compatible)'],
    dependencies: ['None (Vanilla compatible)'],
    features: [
      '16 3D models with blockbench geometry and hand-drawn cyber textures',
      'CustomModelData numbers mapped from 10001 to 10016',
      'Custom sound effects for swings, charge-ups, and spell impacts',
      'Emissive textures supported via CIT Resewn or OptiFine',
    ],
    installationSteps: [
      'Download ArcaneWeapons-v1.2.mcpack',
      'Drop into .minecraft/resourcepacks/ folder, or host on your server resource-pack-url',
      'Enable the pack in Options > Resource Packs',
    ],
    changelog: 'v1.2.0 — Added 4 new celestial bow variants and optimized model polygon counts.',
    fileFormat: '.mcpack',
    fileSize: '14.2 MB',
    creator: 'LivingYuji',
    published: true,
    featured: false,
    rating: 4.8,
    downloadsCount: 2200,
    iconBg: 'from-amber-600 to-yellow-800',
    iconSymbol: '🎨',
    updatedAt: '2026-10-20',
  },
  {
    id: 'prod-purpur-tuning',
    name: 'Purpur 1.21 High-Performance Engine Tuning',
    category: 'serverconfigs',
    categoryName: 'Server Configurations',
    shortDesc: 'Engine tuning configs for paper-world, purpur.yml & bukkit.yml to lock 20 TPS.',
    fullDesc:
      'Hand-tuned server configurations tested on 100+ player survival servers. Eliminates entity ticking lag, tunes tick-rates for hoppers and redstone, and optimizes asynchronous chunk saving.',
    price: 0,
    isFree: true,
    version: 'v4.0.0',
    mcVersions: ['1.21.4', '1.21.1', '1.20.x'],
    serverSoftware: ['Purpur', 'Paper'],
    dependencies: ['None'],
    features: [
      'paper-world-defaults.yml, purpur.yml, and server.properties tuned for maximum tickrate',
      'Optimized mob spawn limits and despawn ranges',
      'Hopper transfer rate optimizations without breaking vanilla sorting farms',
      'Aikar startup flags documentation included',
    ],
    installationSteps: [
      'Backup existing configuration files',
      'Copy provided config files into your server root and config/ directories',
      'Restart server with provided Aikar flags',
    ],
    changelog: 'v4.0.0 — Rebuilt for Paper 1.21.4 asynchronous entity-ticking engine.',
    fileFormat: '.zip',
    fileSize: '48 KB',
    creator: 'LivingYuji',
    published: true,
    featured: false,
    rating: 5.0,
    downloadsCount: 1850,
    iconBg: 'from-emerald-600 to-teal-800',
    iconSymbol: '⚡',
    updatedAt: '2026-10-23',
  },
  {
    id: 'prod-cyberpunk-map',
    name: 'Cyberpunk Warzone & Hub Spawn',
    category: 'maps',
    categoryName: 'Maps & Schematics',
    shortDesc: '500x500 custom cyber spawn build with NPC portals, arenas & parkour.',
    fullDesc:
      'Massive, futuristic cyberpunk city spawn build. Features a central spawn rotunda, 8 portal portals, trading marketplace stalls, underground 1v1 PvP arena, and rooftops with parkour trails.',
    price: 14.99,
    isFree: false,
    version: 'v1.0.0',
    mcVersions: ['1.21.4', '1.21.1', '1.20.4'],
    serverSoftware: ['WorldEdit', 'FastAsyncWorldEdit (FAWE)'],
    dependencies: ['FastAsyncWorldEdit recommended for pasting'],
    features: [
      '500x500 block meticulously detailed cyberpunk city build',
      'Ready-to-paste .schem file + full world folder',
      'Includes designated areas for Crates, Leaderboards, NPCs, and Shops',
      'Full underground PvP colosseum with 4 spawn entrances',
    ],
    installationSteps: [
      'Place Cyberpunk_Hub.schem into plugins/FastAsyncWorldEdit/schematics/',
      'Stand at desired paste location (y=64 recommended)',
      'Run //schem load Cyberpunk_Hub and //paste -e',
    ],
    changelog: 'v1.0.0 — Official release with 1.21 block palette updates.',
    fileFormat: '.schem',
    fileSize: '24 MB',
    creator: 'LivingYuji',
    published: true,
    featured: false,
    rating: 4.9,
    downloadsCount: 175,
    iconBg: 'from-pink-600 to-purple-900',
    iconSymbol: '🗺️',
    updatedAt: '2026-10-18',
  },
];

export function MinecraftStoreApp() {
  const { openWindow } = useWindowStore();

  const [products, setProducts] = useState<MinecraftProduct[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('livingyuji_mc_products');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn('Failed to parse saved MC products');
        }
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [activeTab, setActiveTab] = useState<'store' | 'purchases' | 'admin'>('store');
  const [selectedCategory, setSelectedCategory] = useState<MinecraftCategory | 'all'>('all');
  const [selectedProduct, setSelectedProduct] = useState<MinecraftProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPrice, setFilterPrice] = useState<'all' | 'free' | 'paid'>('all');
  const [filterVersion, setFilterVersion] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price-asc' | 'price-desc' | 'name'>(
    'featured'
  );

  // Purchases list (defaults to empty set for unauthenticated visitors)
  const [purchasedProductIds, setPurchasedProductIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('livingyuji_mc_purchases');
      if (saved) {
        try {
          return new Set(JSON.parse(saved));
        } catch (e) {}
      }
    }
    return new Set<string>();
  });

  // Server-verified Admin authorization state
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [downloadModalInfo, setDownloadModalInfo] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    url?: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/admin/session')
      .then((r) => r.json())
      .then((data) => {
        if (isMounted) setIsAdminUnlocked(Boolean(data.authenticated));
      })
      .catch(() => {
        if (isMounted) setIsAdminUnlocked(false);
      });

    // Hydrate products from Supabase cloud catalog
    fetch('/api/admin/products')
      .then((r) => r.json())
      .then((data) => {
        if (isMounted && data && data.success && Array.isArray(data.products) && data.products.length > 0) {
          const mapped: MinecraftProduct[] = data.products.map((p: any) => ({
            ...p,
            categoryName: p.category_name || p.categoryName || p.category,
            shortDesc: p.short_desc || p.shortDesc || '',
            fullDesc: p.full_desc || p.fullDesc || '',
            isFree: p.is_free !== undefined ? p.is_free : p.isFree,
            mcVersions: p.mc_versions || p.mcVersions || ['1.21.4'],
            serverSoftware: p.server_software || p.serverSoftware || ['Paper'],
            installationSteps: p.installation_steps || p.installationSteps || [],
            fileFormat: p.file_format || p.fileFormat || '.jar',
            fileSize: p.file_size || p.fileSize || '1 MB',
            downloadsCount: p.downloads_count || p.downloadsCount || 0,
            iconBg: p.icon_bg || p.iconBg || 'from-blue-600 to-indigo-900',
            iconSymbol: p.icon_symbol || p.iconSymbol || '⚡',
            downloadUrl: p.download_url || p.downloadUrl,
            createdAt: p.created_at || p.createdAt || p.updated_at || p.updatedAt || '2026-10-25',
            updatedAt: p.updated_at || p.updatedAt || '2026-10-25',
          }));
          setProducts(mapped);
          if (typeof window !== 'undefined') {
            localStorage.setItem('livingyuji_mc_products', JSON.stringify(mapped));
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);
  const [adminProductForm, setAdminProductForm] = useState({
    name: '',
    category: 'plugins' as MinecraftCategory,
    shortDesc: '',
    fullDesc: '',
    price: 0,
    isFree: true,
    version: '1.0.0',
    mcVersions: '1.21.4, 1.21.1',
    serverSoftware: 'Paper, Purpur',
    dependencies: 'None',
    features: 'Feature 1\nFeature 2\nFeature 3',
    installationSteps: 'Step 1\nStep 2\nStep 3',
    fileFormat: '.jar',
    changelog: 'Initial public release',
    featured: false,
    published: true,
  });

  // Checkout modal state
  const [checkoutProduct, setCheckoutProduct] = useState<MinecraftProduct | null>(null);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  // Sync products to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('livingyuji_mc_products', JSON.stringify(products));
    }
  }, [products]);

  // Sync purchases to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'livingyuji_mc_purchases',
        JSON.stringify(Array.from(purchasedProductIds))
      );
    }
  }, [purchasedProductIds]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => p.published)
      .filter((p) => selectedCategory === 'all' || p.category === selectedCategory)
      .filter((p) => {
        if (filterPrice === 'free') return p.isFree;
        if (filterPrice === 'paid') return !p.isFree;
        return true;
      })
      .filter((p) => {
        if (filterVersion === 'all') return true;
        return Array.isArray(p.mcVersions) && p.mcVersions.includes(filterVersion);
      })
      .filter((p) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          (p.name || '').toLowerCase().includes(q) ||
          (p.shortDesc || '').toLowerCase().includes(q) ||
          (p.creator || '').toLowerCase().includes(q) ||
          (p.categoryName || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        if (sortBy === 'newest') {
          const aTime = a.updatedAt || a.createdAt || '';
          const bTime = b.updatedAt || b.createdAt || '';
          return bTime.localeCompare(aTime);
        }
        if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
        if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
        return 0;
      });
  }, [products, selectedCategory, filterPrice, filterVersion, searchQuery, sortBy]);

  // Genuine Asset Download Handler (Eliminating synthetic text files disguised as .jar)
  const handleDownloadProduct = (product: MinecraftProduct) => {
    // 1. Paid Product Verification
    if (!product.isFree && !purchasedProductIds.has(product.id)) {
      setCheckoutProduct(product);
      setCheckoutComplete(false);
      return;
    }

    // 2. Verified real external URL (e.g. GitHub release / CDN)
    if (product.downloadUrl && product.downloadUrl.startsWith('http')) {
      window.open(product.downloadUrl, '_blank', 'noopener,noreferrer');
      setPurchasedProductIds((prev) => new Set(prev).add(product.id));
      return;
    }

    // 3. Official Delivery Gate (Discord release / verified asset)
    setDownloadModalInfo({
      isOpen: true,
      title: `${product.name} — Asset Delivery`,
      message: `The official compiled binary package (${product.fileFormat}) for ${product.name} (${product.version}) is distributed through the verified LivingYuji release system. To obtain this release directly from LivingYuji, open a ticket on our Discord server with reference code [REL-${product.id.slice(0, 8).toUpperCase()}].`,
      url: 'https://discord.gg/livingyuji',
    });
  };

  // Handle Paid Product Purchase
  const handlePurchase = (product: MinecraftProduct) => {
    setCheckoutProduct(product);
    setCheckoutComplete(false);
  };

  const confirmPurchase = () => {
    if (!checkoutProduct) return;
    setPurchasedProductIds((prev) => new Set(prev).add(checkoutProduct.id));
    setCheckoutComplete(true);
    setTimeout(() => {
      setCheckoutProduct(null);
      setCheckoutComplete(false);
    }, 2000);
  };

  // Admin: Create product
  const handleAdminCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminProductForm.name.trim()) return;

    const catDef =
      CATEGORY_DEFINITIONS.find((c) => c.id === adminProductForm.category) ||
      CATEGORY_DEFINITIONS[0];

    const newProduct: MinecraftProduct = {
      id: `prod-custom-${Date.now()}`,
      name: adminProductForm.name,
      category: adminProductForm.category,
      categoryName: catDef.label,
      shortDesc: adminProductForm.shortDesc,
      fullDesc: adminProductForm.fullDesc,
      price: adminProductForm.isFree ? 0 : Number(adminProductForm.price),
      isFree: adminProductForm.isFree,
      version: adminProductForm.version,
      mcVersions: adminProductForm.mcVersions.split(',').map((v) => v.trim()),
      serverSoftware: adminProductForm.serverSoftware.split(',').map((s) => s.trim()),
      dependencies: adminProductForm.dependencies.split(',').map((d) => d.trim()),
      features: adminProductForm.features.split('\n').filter(Boolean),
      installationSteps: adminProductForm.installationSteps.split('\n').filter(Boolean),
      changelog: adminProductForm.changelog,
      fileFormat: adminProductForm.fileFormat,
      fileSize: '512 KB',
      creator: 'LivingYuji',
      published: adminProductForm.published,
      featured: adminProductForm.featured,
      rating: 5.0,
      downloadsCount: 0,
      iconBg: 'from-emerald-600 to-green-900',
      iconSymbol: catDef.icon,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setProducts((prev) => [newProduct, ...prev]);
    alert(`Product "${newProduct.name}" created successfully!`);
    setActiveTab('store');
  };

  const deleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (selectedProduct?.id === id) setSelectedProduct(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#121620] text-slate-100 select-none overflow-hidden font-sans text-xs">
      {/* 1. TOP HEADER & NAVIGATION */}
      <div className="h-16 px-6 bg-[#181D2A] border-b border-white/10 flex items-center justify-between gap-4 shrink-0">
        {/* Brand & Tabs */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-900 border border-emerald-400/30 flex items-center justify-center text-xl shadow-md">
              ⛏️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">Minecraft Store</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider">
                  Official
                </span>
              </div>
              <p className="text-[11px] text-slate-400">LivingYuji Digital Marketplace</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-[#12151F] p-1 rounded-xl border border-white/5">
            <button
              onClick={() => {
                setActiveTab('store');
                setSelectedProduct(null);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'store'
                  ? 'bg-[#0078D4] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Marketplace
            </button>
            <button
              onClick={() => {
                setActiveTab('purchases');
                setSelectedProduct(null);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'purchases'
                  ? 'bg-[#0078D4] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              My Purchases ({purchasedProductIds.size})
            </button>
            {isAdminUnlocked && (
              <button
                onClick={() => {
                  setActiveTab('admin');
                  setSelectedProduct(null);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'admin'
                    ? 'bg-[#0078D4] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Admin Dashboard
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        {activeTab === 'store' && !selectedProduct && (
          <div className="relative w-72">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search plugins, setups, resource packs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1F2536] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>
        )}
      </div>

      {/* 2. MAIN STORE BODY */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* ======================================================== */}
        {/* TAB 1: MARKETPLACE */}
        {/* ======================================================== */}
        {activeTab === 'store' && (
          <>
            {selectedProduct ? (
              /* DETAIL VIEW */
              <div className="flex-1 overflow-y-auto window-scroll p-8 bg-gradient-to-b from-[#181E2C] to-[#121620]">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs mb-6 transition-colors"
                >
                  <ArrowLeft size={15} />
                  <span>Back to Marketplace</span>
                </button>

                <div className="max-w-4xl mx-auto space-y-8">
                  {/* Hero Header */}
                  <div className="bg-[#1C2232] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
                    <div className="flex items-center gap-5">
                      <div
                        className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${selectedProduct.iconBg} border border-white/20 flex items-center justify-center text-4xl shadow-lg shrink-0`}
                      >
                        {selectedProduct.iconSymbol}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/10 text-emerald-400">
                            {selectedProduct.categoryName}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {selectedProduct.version}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight mt-1">
                          {selectedProduct.name}
                        </h2>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                          <span>
                            By <strong className="text-white">{selectedProduct.creator}</strong>
                          </span>
                          <span>•</span>
                          <span>Updated {selectedProduct.updatedAt}</span>
                          <span>•</span>
                          <span className="text-amber-400 font-semibold">
                            ★ {selectedProduct.rating} ({selectedProduct.downloadsCount} downloads)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="text-2xl font-extrabold text-white">
                        {selectedProduct.isFree ? (
                          <span className="text-emerald-400">Free</span>
                        ) : (
                          `$${selectedProduct.price.toFixed(2)}`
                        )}
                      </div>

                      {selectedProduct.isFree || purchasedProductIds.has(selectedProduct.id) ? (
                        <button
                          onClick={() => handleDownloadProduct(selectedProduct)}
                          className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-2 transition-all"
                        >
                          <Download size={16} />
                          <span>
                            {purchasedProductIds.has(selectedProduct.id)
                              ? 'Download Update'
                              : 'Download Free'}
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePurchase(selectedProduct)}
                          className="px-6 py-2.5 rounded-xl bg-[#0078D4] hover:bg-[#0086F0] text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all"
                        >
                          <ShoppingBag size={16} />
                          <span>Buy Now (${selectedProduct.price.toFixed(2)})</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Compatibility Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-[#1C2232] border border-white/10 rounded-xl p-3 flex items-center gap-2.5">
                      <Cpu size={18} className="text-sky-400" />
                      <div>
                        <div className="text-[10px] text-slate-400">Minecraft Version</div>
                        <div className="font-semibold text-white">
                          {selectedProduct.mcVersions.join(', ')}
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#1C2232] border border-white/10 rounded-xl p-3 flex items-center gap-2.5">
                      <Layers size={18} className="text-emerald-400" />
                      <div>
                        <div className="text-[10px] text-slate-400">Supported Software</div>
                        <div className="font-semibold text-white">
                          {selectedProduct.serverSoftware.join(', ')}
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#1C2232] border border-white/10 rounded-xl p-3 flex items-center gap-2.5">
                      <HardDrive size={18} className="text-amber-400" />
                      <div>
                        <div className="text-[10px] text-slate-400">File Package</div>
                        <div className="font-semibold text-white">
                          {selectedProduct.fileFormat} ({selectedProduct.fileSize})
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#1C2232] border border-white/10 rounded-xl p-3 flex items-center gap-2.5">
                      <ShieldCheck size={18} className="text-purple-400" />
                      <div>
                        <div className="text-[10px] text-slate-400">Compatibility Status</div>
                        <div className="font-semibold text-emerald-400">Verified Compatible</div>
                      </div>
                    </div>
                  </div>

                  {/* Description & Features */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                      <div className="bg-[#1C2232] border border-white/10 rounded-2xl p-6 space-y-4">
                        <h3 className="text-sm font-bold text-white">Product Description</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {selectedProduct.fullDesc}
                        </p>

                        <div className="pt-2">
                          <h4 className="text-xs font-bold text-white mb-2">Key Features</h4>
                          <ul className="space-y-1.5">
                            {selectedProduct.features.map((feat, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                                <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Installation Instructions */}
                      <div className="bg-[#1C2232] border border-white/10 rounded-2xl p-6 space-y-3">
                        <h3 className="text-sm font-bold text-white">Installation Guide</h3>
                        <ol className="space-y-2 list-decimal list-inside text-xs text-slate-300">
                          {selectedProduct.installationSteps.map((step, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>

                    {/* Right Specs Column */}
                    <div className="space-y-4">
                      <div className="bg-[#1C2232] border border-white/10 rounded-2xl p-5 space-y-3">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                          Dependencies
                        </h3>
                        <div className="space-y-1.5 text-xs text-slate-300">
                          {selectedProduct.dependencies.map((dep, idx) => (
                            <div key={idx} className="p-2 rounded-lg bg-black/20 border border-white/5">
                              {dep}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-[#1C2232] border border-white/10 rounded-2xl p-5 space-y-2 text-xs">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                          Changelog
                        </h3>
                        <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                          {selectedProduct.changelog}
                        </p>
                      </div>

                      <div className="bg-[#1C2232] border border-white/10 rounded-2xl p-5 space-y-2 text-xs text-slate-400">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                          License
                        </h3>
                        <p className="text-[11px] leading-relaxed">
                          LivingYuji Commercial & Open Development License. Safe for use on commercial
                          networks and community servers.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* PRODUCT CATALOGUE VIEW */
              <div className="flex-1 flex overflow-hidden">
                {/* Left Categories Sidebar */}
                <div className="w-64 bg-[#141824] border-r border-white/10 p-3 overflow-y-auto window-scroll flex flex-col gap-1 shrink-0">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Categories
                  </div>

                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-[#0078D4]/20 text-[#38BDF8] font-bold'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span>🌟</span>
                      <span>All Products</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{products.length}</span>
                  </button>

                  {CATEGORY_DEFINITIONS.map((cat) => {
                    const count = products.filter((p) => p.category === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                          selectedCategory === cat.id
                            ? 'bg-[#0078D4]/20 text-[#38BDF8] font-bold'
                            : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate pr-2">
                          <span>{cat.icon}</span>
                          <span className="truncate">{cat.label}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 shrink-0">{count}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Main Catalogue Area */}
                <div className="flex-1 flex flex-col overflow-hidden bg-[#161B26]">
                  {/* Filter & Sort Bar */}
                  <div className="h-12 px-6 bg-[#1A202E] border-b border-white/5 flex items-center justify-between gap-4 shrink-0">
                    <div className="flex items-center gap-3">
                      {/* Free / Paid Filter */}
                      <div className="flex items-center bg-[#12151F] p-0.5 rounded-lg border border-white/5 text-[11px]">
                        <button
                          onClick={() => setFilterPrice('all')}
                          className={`px-2.5 py-1 rounded-md transition-colors ${
                            filterPrice === 'all' ? 'bg-[#0078D4] text-white' : 'text-slate-400'
                          }`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setFilterPrice('free')}
                          className={`px-2.5 py-1 rounded-md transition-colors ${
                            filterPrice === 'free' ? 'bg-[#0078D4] text-white' : 'text-slate-400'
                          }`}
                        >
                          Free
                        </button>
                        <button
                          onClick={() => setFilterPrice('paid')}
                          className={`px-2.5 py-1 rounded-md transition-colors ${
                            filterPrice === 'paid' ? 'bg-[#0078D4] text-white' : 'text-slate-400'
                          }`}
                        >
                          Paid
                        </button>
                      </div>

                      {/* MC Version Filter */}
                      <select
                        value={filterVersion}
                        onChange={(e) => setFilterVersion(e.target.value)}
                        className="bg-[#12151F] border border-white/10 rounded-lg px-2.5 py-1 text-slate-300 text-xs focus:outline-none"
                      >
                        <option value="all">All MC Versions</option>
                        <option value="1.21.4">1.21.4 (Latest)</option>
                        <option value="1.21.1">1.21.1</option>
                        <option value="1.20.4">1.20.4</option>
                        <option value="1.19.4">1.19.4</option>
                      </select>
                    </div>

                    {/* Sorting */}
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>Sort by:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-[#12151F] border border-white/10 rounded-lg px-2.5 py-1 text-slate-300 text-xs focus:outline-none"
                      >
                        <option value="featured">Featured First</option>
                        <option value="newest">Newest Releases</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="name">Name (A-Z)</option>
                      </select>
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div className="flex-1 p-6 overflow-y-auto window-scroll">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredProducts.map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => setSelectedProduct(prod)}
                          className="bg-[#1C2232] border border-white/10 hover:border-sky-500/50 rounded-2xl p-5 flex flex-col justify-between gap-4 cursor-pointer hover:bg-[#20273A] transition-all shadow-md group relative"
                        >
                          {/* Card Header */}
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div
                                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${prod.iconBg} border border-white/20 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform`}
                              >
                                {prod.iconSymbol}
                              </div>
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-emerald-400">
                                {prod.categoryName}
                              </span>
                            </div>

                            <div>
                              <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                                {prod.name}
                              </h3>
                              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                {prod.shortDesc}
                              </p>
                            </div>
                          </div>

                          {/* Version Tag */}
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                            <span className="bg-black/30 px-2 py-0.5 rounded border border-white/5">
                              MC {prod.mcVersions[0]}
                            </span>
                            <span>•</span>
                            <span>{prod.serverSoftware[0]}</span>
                          </div>

                          {/* Price & Action Row */}
                          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                            <div className="font-bold text-sm">
                              {prod.isFree ? (
                                <span className="text-emerald-400">Free</span>
                              ) : (
                                <span className="text-white">${prod.price.toFixed(2)}</span>
                              )}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (prod.isFree || purchasedProductIds.has(prod.id)) {
                                  handleDownloadProduct(prod);
                                } else {
                                  handlePurchase(prod);
                                }
                              }}
                              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                                prod.isFree || purchasedProductIds.has(prod.id)
                                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md'
                                  : 'bg-[#0078D4] hover:bg-[#0086F0] text-white shadow-md'
                              }`}
                            >
                              {purchasedProductIds.has(prod.id)
                                ? 'Download'
                                : prod.isFree
                                ? 'Get Free'
                                : 'Buy'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {filteredProducts.length === 0 && (
                      <div className="text-center py-16 space-y-2">
                        <div className="text-3xl">🔍</div>
                        <h4 className="text-sm font-bold text-white">No products found</h4>
                        <p className="text-xs text-slate-400">
                          Try adjusting your category, version, or search query.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MY PURCHASES & DOWNLOADS */}
        {/* ======================================================== */}
        {activeTab === 'purchases' && (
          <div className="flex-1 p-8 overflow-y-auto window-scroll bg-[#161B26]">
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">My Purchases & Downloads</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Access your purchased Minecraft licenses, updates, and free downloads.
                </p>
              </div>

              <div className="space-y-3">
                {products
                  .filter((p) => purchasedProductIds.has(p.id))
                  .map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#1C2232] border border-white/10 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.iconBg} border border-white/20 flex items-center justify-center text-2xl shadow-inner shrink-0`}
                        >
                          {item.iconSymbol}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{item.name}</h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span>License: Verified</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-semibold">{item.version}</span>
                            <span>•</span>
                            <span>{item.fileFormat}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDownloadProduct(item)}
                        className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-2 transition-all"
                      >
                        <Download size={15} />
                        <span>Download</span>
                      </button>
                    </div>
                  ))}

                {purchasedProductIds.size === 0 && (
                  <div className="text-center py-16 bg-[#1C2232] border border-white/10 rounded-2xl p-8 space-y-3">
                    <div className="text-3xl">📦</div>
                    <h3 className="text-sm font-bold text-white">No downloads yet</h3>
                    <p className="text-xs text-slate-400">
                      Explore the marketplace to download free plugins and server configurations!
                    </p>
                    <button
                      onClick={() => setActiveTab('store')}
                      className="px-4 py-2 rounded-xl bg-[#0078D4] text-white font-bold text-xs"
                    >
                      Browse Marketplace
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: ADMIN DASHBOARD — UPLOAD & MANAGE */}
        {/* ======================================================== */}
        {activeTab === 'admin' && (
          <div className="flex-1 p-8 overflow-y-auto window-scroll bg-[#151924]">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Admin Management Dashboard</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Upload new Minecraft products, manage pricing, file formats, and publishing status.
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                  <ShieldCheck size={16} />
                  <span>Administrator Authorized: LivingYuji</span>
                </div>
              </div>

              {/* Upload Product Form */}
              <div className="bg-[#1C2232] border border-white/10 rounded-2xl p-6 space-y-5 shadow-lg">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus size={16} className="text-sky-400" />
                  <span>Upload & Publish New Minecraft Product</span>
                </h3>

                <form onSubmit={handleAdminCreateProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">Product Name</label>
                      <input
                        type="text"
                        required
                        value={adminProductForm.name}
                        onChange={(e) =>
                          setAdminProductForm({ ...adminProductForm, name: e.target.value })
                        }
                        placeholder="e.g. ArcaneRanks Custom Permission Suite"
                        className="w-full bg-[#141822] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">Category</label>
                      <select
                        value={adminProductForm.category}
                        onChange={(e) =>
                          setAdminProductForm({
                            ...adminProductForm,
                            category: e.target.value as MinecraftCategory,
                          })
                        }
                        className="w-full bg-[#141822] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                      >
                        {CATEGORY_DEFINITIONS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.icon} {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Short Description */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      Short Description (Card Summary)
                    </label>
                    <input
                      type="text"
                      required
                      value={adminProductForm.shortDesc}
                      onChange={(e) =>
                        setAdminProductForm({ ...adminProductForm, shortDesc: e.target.value })
                      }
                      placeholder="High-performance plugin with GUI editor..."
                      className="w-full bg-[#141822] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* Full Description */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      Full Description & Technical Architecture
                    </label>
                    <textarea
                      rows={3}
                      value={adminProductForm.fullDesc}
                      onChange={(e) =>
                        setAdminProductForm({ ...adminProductForm, fullDesc: e.target.value })
                      }
                      placeholder="Comprehensive details regarding commands, event architecture, and server optimization..."
                      className="w-full bg-[#141822] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 resize-none"
                    />
                  </div>

                  {/* Price & Free toggle */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-black/20 border border-white/5 items-center">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isFree"
                        checked={adminProductForm.isFree}
                        onChange={(e) =>
                          setAdminProductForm({ ...adminProductForm, isFree: e.target.checked })
                        }
                        className="rounded accent-[#0078D4]"
                      />
                      <label htmlFor="isFree" className="text-xs font-semibold text-emerald-400">
                        Free Download
                      </label>
                    </div>

                    {!adminProductForm.isFree && (
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300">Price ($USD)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={adminProductForm.price}
                          onChange={(e) =>
                            setAdminProductForm({
                              ...adminProductForm,
                              price: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full bg-[#141822] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">File Format</label>
                      <select
                        value={adminProductForm.fileFormat}
                        onChange={(e) =>
                          setAdminProductForm({ ...adminProductForm, fileFormat: e.target.value })
                        }
                        className="w-full bg-[#141822] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                      >
                        <option value=".jar">.jar (Server Plugin)</option>
                        <option value=".zip">.zip (Server Setup / Archive)</option>
                        <option value=".mcpack">.mcpack (Resource Pack)</option>
                        <option value=".schem">.schem (WorldEdit Schematic)</option>
                        <option value=".yml">.yml (Configuration)</option>
                        <option value=".sk">.sk (Skript File)</option>
                      </select>
                    </div>
                  </div>

                  {/* MC Versions and Software */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">
                        Supported MC Versions (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={adminProductForm.mcVersions}
                        onChange={(e) =>
                          setAdminProductForm({ ...adminProductForm, mcVersions: e.target.value })
                        }
                        placeholder="1.21.4, 1.21.1, 1.20.4"
                        className="w-full bg-[#141822] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">
                        Server Software (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={adminProductForm.serverSoftware}
                        onChange={(e) =>
                          setAdminProductForm({ ...adminProductForm, serverSoftware: e.target.value })
                        }
                        placeholder="Paper, Purpur, Velocity, Fabric"
                        className="w-full bg-[#141822] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
                    >
                      Publish Product
                    </button>
                  </div>
                </form>
              </div>

              {/* Manage Existing Products Table */}
              <div className="bg-[#1C2232] border border-white/10 rounded-2xl p-6 space-y-4 shadow-lg">
                <h3 className="text-sm font-bold text-white">Active Products ({products.length})</h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400">
                        <th className="pb-2.5 font-semibold">Product</th>
                        <th className="pb-2.5 font-semibold">Category</th>
                        <th className="pb-2.5 font-semibold">Price</th>
                        <th className="pb-2.5 font-semibold">Format</th>
                        <th className="pb-2.5 font-semibold">Status</th>
                        <th className="pb-2.5 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {products.map((item) => (
                        <tr key={item.id} className="hover:bg-white/5">
                          <td className="py-3 font-semibold text-white max-w-[200px] truncate">
                            {item.name}
                          </td>
                          <td className="py-3 text-slate-300">{item.categoryName}</td>
                          <td className="py-3 font-mono">
                            {item.isFree ? (
                              <span className="text-emerald-400 font-bold">Free</span>
                            ) : (
                              `$${item.price.toFixed(2)}`
                            )}
                          </td>
                          <td className="py-3 font-mono text-slate-400">{item.fileFormat}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">
                              Published
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => deleteProduct(item.id)}
                              className="p-1 rounded text-red-400 hover:bg-red-500/20 transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DISCORD PURCHASE MODAL */}
      <DiscordPurchaseModal
        isOpen={Boolean(checkoutProduct)}
        onClose={() => setCheckoutProduct(null)}
        product={checkoutProduct}
      />

      {/* GENUINE DELIVERY / DISCORD TICKET INFO MODAL */}
      {downloadModalInfo?.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none">
          <div className="bg-[#1C2232] border border-white/15 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-100">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PackageCheck size={16} className="text-emerald-400" />
                <span>{downloadModalInfo.title}</span>
              </h3>
              <button
                onClick={() => setDownloadModalInfo(null)}
                className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {downloadModalInfo.message}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setDownloadModalInfo(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-300 hover:text-white font-medium"
              >
                Close
              </button>
              {downloadModalInfo.url && (
                <a
                  href={downloadModalInfo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setDownloadModalInfo(null)}
                  className="px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-xs text-white font-bold flex items-center gap-1.5 shadow-md"
                >
                  <ExternalLink size={13} />
                  <span>Join Discord</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
