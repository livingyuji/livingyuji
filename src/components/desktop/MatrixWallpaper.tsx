'use client';

import React, { useEffect, useRef } from 'react';
import { useWindowStore } from '@/store/windowStore';

export function MatrixWallpaper() {
  const { settings } = useWindowStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (settings.wallpaper !== 'matrix' && settings.wallpaper !== 'cyber' && settings.wallpaper !== 'default') {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Code characters
    const codeChars = '01{}<>;:/*+=~!@#$%^&()[]var let const import export function return async await plugin void class'.split('');
    const fontSize = 13;
    // Concentrate code columns towards center & right as in screenshot!
    const startX = Math.floor(width * 0.38);
    const endX = Math.floor(width * 0.88);
    const numCols = Math.floor((endX - startX) / (fontSize * 1.2));
    const drops = Array(numCols).fill(0).map(() => Math.floor(Math.random() * -60));

    let animId: number;

    const render = () => {
      // Draw slight dark overlay for trails
      ctx.fillStyle = 'rgba(15, 18, 24, 0.12)';
      ctx.fillRect(startX, 0, endX - startX + 50, height);

      ctx.fillStyle = '#10B981'; // Phosphor matrix green
      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = codeChars[Math.floor(Math.random() * codeChars.length)];
        const x = startX + i * fontSize * 1.2;
        const y = drops[i] * fontSize;

        // Bright green head
        ctx.fillStyle = '#34D399';
        ctx.fillText(char, x, y);

        // Reset drop
        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animId = requestAnimationFrame(render);
    };

    // Draw initial dark background
    ctx.fillStyle = '#0F131C';
    ctx.fillRect(0, 0, width, height);

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [settings.wallpaper]);

  const customWp = settings.customWallpaperUrl;
  const customVideo = settings.customVideoWallpaperUrl;
  const wpMode = settings.wallpaperMode || 'cover';
  const overlayOpacity = typeof settings.wallpaperOpacity === 'number' ? settings.wallpaperOpacity / 100 : 0.85;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Video wallpaper if provided */}
      {customVideo ? (
        <video
          key={customVideo}
          autoPlay
          loop
          muted={settings.videoWallpaperMuted !== false}
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          src={customVideo}
        />
      ) : customWp ? (
        /* Custom image background if provided */
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            backgroundImage: `url(${customWp})`,
            backgroundSize: wpMode === 'tile' ? 'auto' : wpMode,
            backgroundRepeat: wpMode === 'tile' ? 'repeat' : 'no-repeat',
            backgroundPosition: 'center',
          }}
        />
      ) : (
        /* Textured dark background */
        <div className="absolute inset-0 bg-[#0E121A] bg-[radial-gradient(ellipse_at_80%_30%,#182335_0%,#0C0F16_80%)]" />
      )}

      {/* Dark overlay with configurable opacity */}
      {(customWp || customVideo) && (
        <div
          className="absolute inset-0 bg-[#0E121A]"
          style={{ opacity: 1 - overlayOpacity }}
        />
      )}

      {/* Matrix code canvas (rendered if matrix wallpaper or as subtle tech overlay) */}
      {(!customWp && !customVideo && settings.wallpaper === 'matrix') && (
        <canvas ref={canvasRef} className="absolute inset-0 opacity-80" />
      )}

      {/* Cyber Developer Silhouette Graphics on the Right (Matching screenshot) */}
      {!customWp && !customVideo && (
        <div className="absolute bottom-12 right-16 w-[420px] h-[580px] pointer-events-none opacity-90 hidden lg:block">
          <svg viewBox="0 0 400 560" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-[0_0_40px_rgba(16,185,129,0.2)]">
            {/* Subtle tech grid backdrop */}
            <circle cx="260" cy="180" r="140" fill="url(#dev-glow)" />

            {/* Silhouette Head & Shoulders looking up */}
            <path
              d="M200 480C200 420 220 380 250 360C230 350 220 320 220 280C220 220 250 180 290 180C330 180 350 210 350 270C350 310 340 340 320 360C350 380 370 420 370 480H200Z"
              fill="#131B28"
              stroke="#10B981"
              strokeWidth="1.2"
              strokeOpacity="0.4"
            />

            {/* Tactical Vest & Tech Highlights */}
            <path
              d="M230 380L250 480M340 380L320 480M270 360V480M300 360V480"
              stroke="#10B981"
              strokeWidth="1.5"
              strokeOpacity="0.6"
              strokeDasharray="4 4"
            />

            {/* Cyber controller / phone held in hand */}
            <rect x="250" y="420" width="36" height="58" rx="4" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.5" />
            <circle cx="268" cy="450" r="6" fill="#38BDF8" fillOpacity="0.6" />

            <defs>
              <radialGradient id="dev-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(260 180) rotate(90) scale(140)">
                <stop stopColor="#10B981" stopOpacity="0.25" />
                <stop offset="1" stopColor="#10B981" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      )}

      {/* Bottom Right Watermark */}
      <div className="absolute bottom-14 right-5 text-slate-500/70 font-mono text-[11px] select-none tracking-tight">
        {settings.brandName || 'LivingYuji'} OS Professional
      </div>
    </div>
  );
}
