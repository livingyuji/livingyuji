'use client';

import React, { useState, useEffect } from 'react';
import { useWindowStore, Wallpaper } from '@/store/windowStore';
import { useFileSystemStore } from '@/store/fileSystemStore';
import { useDesktopIconStore } from '@/store/desktopIconStore';
import {
  saveVideoWallpaperBlob,
  clearVideoWallpaperBlob,
  saveImageWallpaperBlob,
  clearImageWallpaperBlob,
  resolveWallpaperMediaUrl,
} from '@/lib/storage/wallpaperStorage';
import {
  Laptop,
  Palette,
  User,
  Clock,
  Shield,
  Info,
  Sun,
  Volume2,
  VolumeX,
  RotateCcw,
  Check,
  Move,
  Video,
  Upload,
  Trash2,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';

type SettingsTab =
  | 'system'
  | 'personalization'
  | 'contact'
  | 'time'
  | 'privacy'
  | 'about';

export function SettingsApp() {
  const { settings, updateSettings, resetSettings, openWindow } = useWindowStore();
  const { resetToDefaultFileSystem } = useFileSystemStore();
  const { movementEnabled, setMovementEnabled, resetToDefaultLayout } = useDesktopIconStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>('system');
  const [brightness, setBrightness] = useState<number>(100);
  const [volume, setVolume] = useState<number>(70);
  const [is24Hour, setIs24Hour] = useState<boolean>(false);
  const [videoUrlInput, setVideoUrlInput] = useState<string>(settings.customVideoWallpaperUrl || '');
  const [resolvedPreviewVideoUrl, setResolvedPreviewVideoUrl] = useState<string | null>(null);
  const [resolvedPreviewImageUrl, setResolvedPreviewImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    resolveWallpaperMediaUrl(settings.customVideoWallpaperUrl, 'video').then((url) => {
      if (!isCancelled) setResolvedPreviewVideoUrl(url);
    });
    return () => {
      isCancelled = true;
    };
  }, [settings.customVideoWallpaperUrl]);

  useEffect(() => {
    let isCancelled = false;
    resolveWallpaperMediaUrl(settings.customWallpaperUrl, 'image').then((url) => {
      if (!isCancelled) setResolvedPreviewImageUrl(url);
    });
    return () => {
      isCancelled = true;
    };
  }, [settings.customWallpaperUrl]);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.includes('mp4') && !file.type.includes('webm')) {
      alert('Please upload an MP4 or WebM video file.');
      return;
    }
    try {
      const blobUrl = await saveVideoWallpaperBlob(file);
      setVideoUrlInput(file.name);
      updateSettings({
        wallpaperType: 'video',
        videoWallpaperSource: 'local',
        customVideoWallpaperUrl: blobUrl,
      });
    } catch (err) {
      console.error('Failed to save video wallpaper:', err);
      alert('Failed to store video wallpaper.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }
    try {
      const blobUrl = await saveImageWallpaperBlob(file);
      updateSettings({
        wallpaperType: 'image',
        customWallpaperUrl: blobUrl,
      });
    } catch (err) {
      console.error('Failed to save image wallpaper:', err);
      alert('Failed to store image wallpaper.');
    }
  };

  const wallpapers: { id: Wallpaper; label: string; desc: string; preview: string }[] = [
    {
      id: 'matrix',
      label: 'Cyber Matrix (Reference)',
      desc: 'Dark phosphor green code matrix streams & developer silhouette',
      preview: 'bg-[#0E121A] border-emerald-500',
    },
    {
      id: 'dark',
      label: 'Dark Charcoal',
      desc: 'Minimalist deep dark Windows workstation',
      preview: 'bg-[#181C26] border-slate-600',
    },
    {
      id: 'ocean',
      label: 'Deep Blue',
      desc: 'Azure and cyan gradient with soft ambient light',
      preview: 'bg-gradient-to-tr from-sky-900 to-blue-600 border-sky-400',
    },
    {
      id: 'sunset',
      label: 'Sunset Glow',
      desc: 'Warm violet and amber cyberpunk dusk',
      preview: 'bg-gradient-to-tr from-purple-900 to-amber-600 border-amber-400',
    },
  ];

  return (
    <div className="h-full flex bg-[#161B26] text-slate-100 select-none overflow-hidden font-sans text-xs">
      {/* Left Sidebar (Windows 11 Settings style) */}
      <div className="w-64 border-r border-white/10 bg-[#131622] p-4 flex flex-col gap-1 shrink-0">
        <div className="px-3 py-2 text-base font-bold text-white mb-3 flex items-center gap-2">
          <span>Settings</span>
        </div>

        {/* Navigation List */}
        <button
          onClick={() => setActiveTab('system')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
            activeTab === 'system'
              ? 'bg-[#0078D4]/20 text-[#38BDF8] font-semibold'
              : 'text-slate-300 hover:bg-white/5'
          }`}
        >
          <Laptop size={18} className={activeTab === 'system' ? 'text-[#38BDF8]' : 'text-slate-400'} />
          <span>System</span>
        </button>

        <button
          onClick={() => setActiveTab('personalization')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
            activeTab === 'personalization'
              ? 'bg-[#0078D4]/20 text-[#38BDF8] font-semibold'
              : 'text-slate-300 hover:bg-white/5'
          }`}
        >
          <Palette
            size={18}
            className={activeTab === 'personalization' ? 'text-[#38BDF8]' : 'text-slate-400'}
          />
          <span>Personalization</span>
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
            activeTab === 'contact'
              ? 'bg-[#0078D4]/20 text-[#38BDF8] font-semibold'
              : 'text-slate-300 hover:bg-white/5'
          }`}
        >
          <User size={18} className={activeTab === 'contact' ? 'text-[#38BDF8]' : 'text-slate-400'} />
          <span>Contact</span>
        </button>

        <button
          onClick={() => setActiveTab('time')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
            activeTab === 'time'
              ? 'bg-[#0078D4]/20 text-[#38BDF8] font-semibold'
              : 'text-slate-300 hover:bg-white/5'
          }`}
        >
          <Clock size={18} className={activeTab === 'time' ? 'text-[#38BDF8]' : 'text-slate-400'} />
          <span>Time & Date</span>
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
            activeTab === 'privacy'
              ? 'bg-[#0078D4]/20 text-[#38BDF8] font-semibold'
              : 'text-slate-300 hover:bg-white/5'
          }`}
        >
          <Shield size={18} className={activeTab === 'privacy' ? 'text-[#38BDF8]' : 'text-slate-400'} />
          <span>Privacy & security</span>
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
            activeTab === 'about'
              ? 'bg-[#0078D4]/20 text-[#38BDF8] font-semibold'
              : 'text-slate-300 hover:bg-white/5'
          }`}
        >
          <Info size={18} className={activeTab === 'about' ? 'text-[#38BDF8]' : 'text-slate-400'} />
          <span>About OS</span>
        </button>
      </div>

      {/* Main Settings Content Area */}
      <div className="flex-1 p-8 overflow-y-auto window-scroll bg-[#171B27]">
        {/* TAB 1: SYSTEM (MATCHES SCREENSHOT 5 EXACTLY) */}
        {activeTab === 'system' && (
          <div className="max-w-2xl space-y-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">System</h1>

            {/* Display Section */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-300">Display</h2>

              {/* Brightness Card */}
              <div className="bg-[#1E2433] border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Sun size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white">Brightness</h3>
                    <p className="text-[11px] text-slate-400">Adjust screen brightness</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-60">
                  <input
                    type="range"
                    min={20}
                    max={100}
                    value={brightness}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setBrightness(val);
                      // Apply desktop filter brightness if requested
                      const el = document.getElementById('desktop-root');
                      if (el) el.style.filter = `brightness(${val / 100})`;
                    }}
                    className="w-full h-1.5 bg-slate-700 accent-[#0078D4] rounded-lg cursor-pointer"
                  />
                  <span className="font-mono text-xs font-semibold text-white w-10 text-right">
                    {brightness}%
                  </span>
                </div>
              </div>
            </div>

            {/* Sound Section */}
            <div className="space-y-3 pt-2">
              <h2 className="text-sm font-semibold text-slate-300">Sound</h2>

              {/* Volume Card */}
              <div className="bg-[#1E2433] border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                    <Volume2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white">Volume</h3>
                    <p className="text-[11px] text-slate-400">Adjust system volume</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-60">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 accent-[#0078D4] rounded-lg cursor-pointer"
                  />
                  <span className="font-mono text-xs font-semibold text-white w-10 text-right">
                    {volume}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PERSONALIZATION */}
        {activeTab === 'personalization' && (
          <div className="max-w-2xl space-y-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">Personalization</h1>

            {/* User Profile & Main Photo */}
            <div className="bg-[#1E2433] border border-white/10 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-lg bg-[#0E121A] flex items-center justify-center">
                    <img
                      src={settings.customLogoUrl || '/avatar.png'}
                      alt="Profile Photo"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#1E2433] flex items-center justify-center text-[10px] text-black font-bold">
                    ✓
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white">{settings.brandName || 'LivingYuji'}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                      Active Avatar
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Rendered across Desktop Start Menu, About Me window, and Browser Favicon.
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Video Wallpaper */}
            <div className="bg-[#1E2433] border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Video size={16} />
                  </div>
                  <div>
                    <h2 className="text-xs font-semibold text-white">Live Video Wallpaper</h2>
                    <p className="text-[10px] text-slate-400">Play animated looping background on desktop</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {settings.customVideoWallpaperUrl && settings.wallpaperType !== 'video' && (
                    <button
                      type="button"
                      onClick={() => updateSettings({ wallpaperType: 'video' })}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-semibold hover:bg-purple-500/30 transition-colors"
                    >
                      ▶ Apply Video Wallpaper
                    </button>
                  )}
                  {settings.customVideoWallpaperUrl && (
                    <button
                      type="button"
                      onClick={async () => {
                        await clearVideoWallpaperBlob();
                        updateSettings({
                          wallpaperType: settings.customWallpaperUrl ? 'image' : 'preset',
                          videoWallpaperSource: null,
                          customVideoWallpaperUrl: null,
                        });
                        setVideoUrlInput('');
                      }}
                      className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 size={12} />
                      <span>Clear Video</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Active Video Preview */}
              {settings.customVideoWallpaperUrl && (
                <div className="w-full h-32 rounded-xl overflow-hidden bg-black/60 border border-white/10 relative">
                  <video
                    key={resolvedPreviewVideoUrl || 'loading-video'}
                    autoPlay
                    loop
                    muted={settings.videoWallpaperMuted !== false}
                    playsInline
                    className="w-full h-full object-cover"
                    src={resolvedPreviewVideoUrl || undefined}
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] text-white font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Active Looping Video</span>
                  </div>
                </div>
              )}

              {/* Upload or URL Controls */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shrink-0 shadow-sm">
                    <Upload size={14} />
                    <span>Upload Video File</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="url"
                    value={videoUrlInput}
                    onChange={(e) => {
                      const url = e.target.value;
                      setVideoUrlInput(url);
                      updateSettings({
                        wallpaperType: url ? 'video' : (settings.customWallpaperUrl ? 'image' : 'preset'),
                        videoWallpaperSource: url ? 'url' : null,
                        customVideoWallpaperUrl: url || null,
                      });
                    }}
                    placeholder="Or paste direct video URL (.mp4, .webm)"
                    className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:border-[#0078D4] outline-none font-mono text-[11px]"
                  />
                </div>

                {/* Preset Video Loops */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-medium">Quick Preset Animated Loops:</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const url = 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-code-31910-large.mp4';
                        setVideoUrlInput(url);
                        updateSettings({
                          wallpaperType: 'video',
                          videoWallpaperSource: 'url',
                          customVideoWallpaperUrl: url,
                        });
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-black/30 hover:bg-black/50 border border-white/10 hover:border-emerald-500/50 text-[11px] text-emerald-400 text-left truncate transition-colors"
                    >
                      ⚡ Cyber Rain
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const url = 'https://assets.mixkit.co/videos/preview/mixkit-tunnel-of-futuristic-neon-lights-seamless-loop-41584-large.mp4';
                        setVideoUrlInput(url);
                        updateSettings({
                          wallpaperType: 'video',
                          videoWallpaperSource: 'url',
                          customVideoWallpaperUrl: url,
                        });
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-black/30 hover:bg-black/50 border border-white/10 hover:border-sky-500/50 text-[11px] text-sky-400 text-left truncate transition-colors"
                    >
                      🌐 Digital Matrix
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const url = 'https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-animation-42512-large.mp4';
                        setVideoUrlInput(url);
                        updateSettings({
                          wallpaperType: 'video',
                          videoWallpaperSource: 'url',
                          customVideoWallpaperUrl: url,
                        });
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-black/30 hover:bg-black/50 border border-white/10 hover:border-purple-500/50 text-[11px] text-purple-400 text-left truncate transition-colors"
                    >
                      ✨ Sci-Fi Laser
                    </button>
                  </div>
                </div>

                {/* Video Audio Mute Toggle */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    {settings.videoWallpaperMuted !== false ? (
                      <VolumeX size={14} className="text-slate-400" />
                    ) : (
                      <Volume2 size={14} className="text-emerald-400" />
                    )}
                    <span>Mute Video Audio</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateSettings({
                        videoWallpaperMuted: !(settings.videoWallpaperMuted !== false),
                      })
                    }
                    className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                      settings.videoWallpaperMuted !== false ? 'bg-[#0078D4]' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        settings.videoWallpaperMuted !== false ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Static Image Wallpaper */}
            <div className="bg-[#1E2433] border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                    <ImageIcon size={16} />
                  </div>
                  <div>
                    <h2 className="text-xs font-semibold text-white">Custom Image Wallpaper</h2>
                    <p className="text-[10px] text-slate-400">Upload any photo or high-res graphic</p>
                  </div>
                </div>

                {settings.customWallpaperUrl && (
                  <div className="flex items-center gap-2">
                    {settings.wallpaperType !== 'image' && (
                      <button
                        type="button"
                        onClick={() => updateSettings({ wallpaperType: 'image' })}
                        className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-semibold hover:bg-sky-500/30 transition-colors"
                      >
                        ▶ Apply Image
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        await clearImageWallpaperBlob();
                        updateSettings({
                          wallpaperType: 'preset',
                          customWallpaperUrl: null,
                        });
                      }}
                      className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 size={12} />
                      <span>Clear Custom Image</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-[#0078D4] hover:bg-[#006abc] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shrink-0 shadow-sm">
                  <Upload size={14} />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                <input
                  type="url"
                  value={settings.customWallpaperUrl || ''}
                  onChange={(e) =>
                    updateSettings({
                      wallpaperType: e.target.value ? 'image' : 'preset',
                      customWallpaperUrl: e.target.value || null,
                    })
                  }
                  placeholder="Or paste image URL (https://...)"
                  className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:border-[#0078D4] outline-none font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Preset Themes */}
            <div className="bg-[#1E2433] border border-white/10 rounded-2xl p-5 space-y-4">
              <h2 className="text-xs font-semibold text-white">Preset Desktop Themes</h2>
              <div className="grid grid-cols-2 gap-3">
                {wallpapers.map((wp) => (
                  <button
                    key={wp.id}
                    onClick={() => {
                      updateSettings({
                        wallpaperType: 'preset',
                        wallpaper: wp.id,
                      });
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-2.5 ${
                      settings.wallpaperType === 'preset' && settings.wallpaper === wp.id
                        ? 'border-[#0078D4] bg-[#0078D4]/15 ring-1 ring-[#0078D4]'
                        : 'border-white/10 hover:border-white/20 bg-black/20'
                    }`}
                  >
                    <div className={`w-full h-20 rounded-lg ${wp.preview} border`} />
                    <div>
                      <div className="font-semibold text-white text-xs">{wp.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{wp.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Icon Movement (Windows-style toggle) */}
            <div className="bg-[#1E2433] border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0078D4]/15 border border-[#0078D4]/30 text-sky-400 flex items-center justify-center shrink-0">
                    <Move size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white">Desktop Icon Movement</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {movementEnabled
                        ? 'Enabled — Icons can be freely moved by click-and-hold dragging.'
                        : 'Disabled — Icons remain fixed in their current positions and cannot be dragged.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const next = !movementEnabled;
                    setMovementEnabled(next);
                    updateSettings({ desktopIconMovement: next });
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                    movementEnabled ? 'bg-[#0078D4]' : 'bg-slate-700'
                  }`}
                  role="switch"
                  aria-checked={movementEnabled}
                  title="Toggle desktop icon dragging"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      movementEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                <span>Single click selects • Double-click opens app • Drag threshold: 8px</span>
                <button
                  type="button"
                  onClick={() => resetToDefaultLayout()}
                  className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  Reset icon positions
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONTACT */}
        {activeTab === 'contact' && (
          <div className="max-w-2xl space-y-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">Contact LivingYuji</h1>
            <div className="bg-[#1E2433] border border-white/10 rounded-2xl p-5 space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect directly for Minecraft plugin commissions, server architecture, Discord bot
                setups, and full-stack web engineering.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
                  <span className="font-semibold text-slate-400">Discord</span>
                  <span className="font-mono text-white">LivingYuji</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
                  <span className="font-semibold text-slate-400">GitHub</span>
                  <a
                    href="https://github.com/livingyuji"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:underline"
                  >
                    github.com/livingyuji
                  </a>
                </div>
              </div>

              <button
                onClick={() => openWindow('contact')}
                className="mt-3 px-5 py-2 rounded-xl bg-[#0078D4] text-white font-bold text-xs hover:bg-[#0086F0] transition-colors"
              >
                Open Full Contact Form
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: TIME & DATE */}
        {activeTab === 'time' && (
          <div className="max-w-2xl space-y-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">Time & Date</h1>
            <div className="bg-[#1E2433] border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-white">24-Hour Clock</h3>
                  <p className="text-[11px] text-slate-400">Display taskbar clock in 24-hour mode</p>
                </div>
                <button
                  onClick={() => setIs24Hour(!is24Hour)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    is24Hour ? 'bg-[#0078D4]' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      is24Hour ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PRIVACY & SECURITY */}
        {activeTab === 'privacy' && (
          <div className="max-w-2xl space-y-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">Privacy & security</h1>
            <div className="bg-[#1E2433] border border-white/10 rounded-2xl p-5 space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-white">Browser Storage</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  LivingYuji OS stores your window positions, custom virtual files, and preferences
                  locally in your browser&apos;s LocalStorage. No tracking or telemetry is sent to any
                  external server.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    resetToDefaultFileSystem();
                    resetSettings();
                    alert('LivingYuji OS state has been reset to defaults.');
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 font-semibold text-xs transition-colors flex items-center gap-2"
                >
                  <RotateCcw size={14} />
                  <span>Reset All Local Storage Data</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: ABOUT OS */}
        {activeTab === 'about' && (
          <div className="max-w-2xl space-y-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">About LivingYuji OS</h1>
            <div className="bg-[#1E2433] border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="space-y-2">
                <div className="text-base font-bold text-white">LivingYuji OS Workstation</div>
                <div className="text-xs text-sky-400 font-mono">Version 2.0.26 (Build 22631)</div>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  Engineered with Next.js 14, React 18, TypeScript, Tailwind CSS, Zustand state
                  architecture, and HTML5 Web Audio synthesis.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
                <div>
                  <span className="text-slate-400">Developer:</span>
                  <div className="font-semibold text-white">LivingYuji</div>
                </div>
                <div>
                  <span className="text-slate-400">Environment:</span>
                  <div className="font-semibold text-white">Web Desktop OS</div>
                </div>
                <div>
                  <span className="text-slate-400">File System:</span>
                  <div className="font-semibold text-white">Virtual NTFS</div>
                </div>
                <div>
                  <span className="text-slate-400">Audio Engine:</span>
                  <div className="font-semibold text-white">Web Audio Synthesizer</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
