'use client';

import React, { useState, useEffect } from 'react';
import { useWindowStore, AppId } from '@/store/windowStore';
import {
  Wifi,
  WifiOff,
  Bluetooth,
  Plane,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  X,
  Bell,
  Sparkles,
} from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  appId?: AppId;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Press Kit',
    body: 'Access approved biographies, official profile links, contact details, and eleven publication-ready portraits.',
    time: '11:58 AM',
    appId: 'resume',
  },
  {
    id: 'n2',
    title: 'LivingYuji OS Journal',
    body: 'Read original articles on conceptual music, digital systems, creative production, and identity.',
    time: '11:57 AM',
    appId: 'blog',
  },
  {
    id: 'n3',
    title: 'Music Lab',
    body: 'Explore three verified releases with official artwork, tracks, and audio playback.',
    time: '11:58 AM',
    appId: 'music',
  },
  {
    id: 'n4',
    title: 'Developer Lab',
    body: 'Minecraft plugins, Discord bots, and systems architecture are ready for review.',
    time: '11:55 AM',
    appId: 'projects',
  },
  {
    id: 'n5',
    title: 'LivingYuji Store',
    body: 'Full-stack web apps, server commissions, and custom plugins are currently open.',
    time: '11:50 AM',
    appId: 'store',
  },
];

export function ActionCenter() {
  const { quickSettingsOpen, setQuickSettingsOpen, openWindow } = useWindowStore();

  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const [airplaneEnabled, setAirplaneEnabled] = useState(false);
  const [nightLightEnabled, setNightLightEnabled] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [volume, setVolume] = useState(70);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Toggle airplane mode side effects
  const toggleAirplane = () => {
    if (!airplaneEnabled) {
      setAirplaneEnabled(true);
      setWifiEnabled(false);
      setBluetoothEnabled(false);
    } else {
      setAirplaneEnabled(false);
      setWifiEnabled(true);
    }
  };

  // Toggle night light filter on desktop
  const toggleNightLight = () => {
    const next = !nightLightEnabled;
    setNightLightEnabled(next);
    const el = document.getElementById('desktop-root');
    if (el) {
      el.style.filter = next
        ? `brightness(${brightness / 100}) sepia(0.28) hue-rotate(-15deg)`
        : `brightness(${brightness / 100})`;
    }
  };

  // Update brightness
  const handleBrightnessChange = (val: number) => {
    setBrightness(val);
    const el = document.getElementById('desktop-root');
    if (el) {
      el.style.filter = nightLightEnabled
        ? `brightness(${val / 100}) sepia(0.28) hue-rotate(-15deg)`
        : `brightness(${val / 100})`;
    }
  };

  // Date formatted exactly as in screenshot: Sunday, October 25
  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const handleNotificationClick = (item: NotificationItem) => {
    if (item.appId) {
      openWindow(item.appId);
      setQuickSettingsOpen(false);
    }
  };

  const removeNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  if (!quickSettingsOpen) return null;

  return (
    <div
      className="fixed bottom-14 right-3 w-[370px] max-h-[calc(100vh-70px)] bg-[#1A202C]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-[950] flex flex-col overflow-hidden text-white select-none font-sans animate-in fade-in slide-in-from-bottom-2 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. Header with Title and Red Close Button */}
      <div className="p-4 pb-2 flex items-center justify-between border-b border-white/5">
        <h2 className="text-sm font-semibold text-white tracking-tight">Notifications</h2>
        <button
          onClick={() => setQuickSettingsOpen(false)}
          className="w-5 h-5 rounded bg-red-600/90 hover:bg-red-500 flex items-center justify-center text-white text-xs shadow-sm transition-colors"
          title="Close Action Center"
        >
          <X size={12} strokeWidth={2.5} />
        </button>
      </div>

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto window-scroll p-4 space-y-4">
        {/* 2. Quick Action Tiles (4-column grid matching screenshot) */}
        <div className="grid grid-cols-4 gap-2">
          {/* Wi-Fi */}
          <button
            onClick={() => {
              if (airplaneEnabled) setAirplaneEnabled(false);
              setWifiEnabled(!wifiEnabled);
            }}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-center transition-all ${
              wifiEnabled
                ? 'bg-[#0078D4] text-white shadow-md'
                : 'bg-white/10 text-white/70 hover:bg-white/15'
            }`}
          >
            {wifiEnabled ? <Wifi size={18} /> : <WifiOff size={18} />}
            <span className="text-[11px] font-medium mt-1 truncate max-w-full">Wi-Fi</span>
          </button>

          {/* Bluetooth */}
          <button
            onClick={() => {
              if (airplaneEnabled) setAirplaneEnabled(false);
              setBluetoothEnabled(!bluetoothEnabled);
            }}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-center transition-all ${
              bluetoothEnabled
                ? 'bg-[#0078D4] text-white shadow-md'
                : 'bg-white/10 text-white/70 hover:bg-white/15'
            }`}
          >
            <Bluetooth size={18} />
            <span className="text-[11px] font-medium mt-1 truncate max-w-full">Bluetooth</span>
          </button>

          {/* Airplane */}
          <button
            onClick={toggleAirplane}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-center transition-all ${
              airplaneEnabled
                ? 'bg-[#0078D4] text-white shadow-md'
                : 'bg-white/10 text-white/70 hover:bg-white/15'
            }`}
          >
            <Plane size={18} />
            <span className="text-[11px] font-medium mt-1 truncate max-w-full">Airplane</span>
          </button>

          {/* Night light */}
          <button
            onClick={toggleNightLight}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-center transition-all ${
              nightLightEnabled
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white/10 text-white/70 hover:bg-white/15'
            }`}
          >
            <Moon size={18} />
            <span className="text-[11px] font-medium mt-1 truncate max-w-full leading-tight">
              Night light
            </span>
          </button>
        </div>

        {/* 3. Brightness & Volume Sliders */}
        <div className="space-y-3 pt-1">
          {/* Brightness */}
          <div className="flex items-center gap-3">
            <div className="w-5 flex justify-center text-amber-400">
              <Sun size={17} />
            </div>
            <input
              type="range"
              min={20}
              max={100}
              value={brightness}
              onChange={(e) => handleBrightnessChange(Number(e.target.value))}
              className="flex-1 h-1.5 bg-slate-700 accent-[#0078D4] rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-300 w-9 text-right">{brightness}%</span>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3">
            <div className="w-5 flex justify-center text-slate-300">
              {volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 h-1.5 bg-slate-700 accent-[#0078D4] rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-300 w-9 text-right">{volume}%</span>
          </div>
        </div>

        {/* 4. Date & Calendar Section (Matches screenshot) */}
        <div className="pt-3 border-t border-white/10">
          <h3 className="text-base font-bold text-white tracking-tight">{todayDateStr}</h3>
          <p className="text-xs text-slate-400 mt-0.5">No new events</p>
        </div>

        {/* 5. Notifications Section */}
        <div className="pt-3 border-t border-white/10 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">
              {notifications.length > 0 ? `${notifications.length} notifications` : 'No notifications'}
            </span>
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-sky-400 hover:text-sky-300 transition-colors font-medium cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Notifications Card List */}
          <div className="space-y-2">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className="bg-[#121620]/80 hover:bg-[#151B28] border border-white/5 hover:border-white/15 rounded-xl p-3 cursor-pointer transition-all group relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                    {item.title}
                  </h4>
                  <button
                    onClick={(e) => removeNotification(item.id, e)}
                    className="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                    title="Dismiss"
                  >
                    <X size={12} />
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed mt-1">{item.body}</p>
                <div className="text-[10px] text-slate-500 mt-2">{item.time}</div>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="py-6 text-center text-slate-400 text-xs">
                All notifications caught up!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
