'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useWindowStore } from '@/store/windowStore';
import { loadVideoWallpaperBlob, getActiveVideoBlobUrl } from '@/lib/storage/wallpaperStorage';

export function MatrixWallpaper() {
  const { settings } = useWindowStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string | null>(() => {
    // If it's a remote URL, we can start with it immediately
    const raw = settings.customVideoWallpaperUrl;
    if (raw && !raw.startsWith('local:') && !raw.startsWith('blob:')) {
      return raw;
    }
    return getActiveVideoBlobUrl();
  });
  const [isVideoError, setIsVideoError] = useState(false);

  // Determine wallpaper mode
  const isVideoMode =
    settings.wallpaperType === 'video' ||
    (Boolean(settings.customVideoWallpaperUrl) &&
      settings.wallpaperType !== 'image' &&
      settings.wallpaperType !== 'preset');

  // Load / Re-hydrate local video wallpaper from IndexedDB if necessary
  useEffect(() => {
    if (!isVideoMode) return;

    const raw = settings.customVideoWallpaperUrl;
    if (!raw) {
      setResolvedVideoUrl(null);
      return;
    }

    setIsVideoError(false);

    // If it's a remote URL, use directly
    if (!raw.startsWith('local:') && !raw.startsWith('blob:')) {
      setResolvedVideoUrl(raw);
      return;
    }

    // Otherwise, load stored binary blob from IndexedDB
    let isCancelled = false;
    loadVideoWallpaperBlob().then((result) => {
      if (isCancelled) return;
      if (result && result.url) {
        setResolvedVideoUrl(result.url);
      } else {
        console.warn('No local video wallpaper blob found in IndexedDB.');
        setIsVideoError(true);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [isVideoMode, settings.customVideoWallpaperUrl, settings.videoWallpaperSource]);

  // Robust HTML5 video autoplay & mute synchronization
  const isMuted = settings.videoWallpaperMuted !== false;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !resolvedVideoUrl || !isVideoMode || isVideoError) return;

    // Directly assign DOM properties to satisfy browser autoplay policies
    video.muted = isMuted;
    video.defaultMuted = isMuted;
    video.playsInline = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Video wallpaper autoPlay blocked or interrupted:', err);
        // Fallback retry with strict muting
        video.muted = true;
        video.play().catch(() => {
          // If playback still fails completely, gracefully flag error to fall back to static
          setIsVideoError(true);
        });
      });
    }
  }, [resolvedVideoUrl, isVideoMode, isMuted, isVideoError]);

  // Matrix code canvas animation (shown when matrix theme is active)
  useEffect(() => {
    if (
      settings.wallpaper !== 'matrix' &&
      settings.wallpaper !== 'cyber' &&
      settings.wallpaper !== 'default'
    ) {
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

    const codeChars =
      '01{}<>;:/*+=~!@#$%^&()[]var let const import export function return async await plugin void class'.split(
        ''
      );
    const fontSize = 13;
    const startX = Math.floor(width * 0.38);
    const endX = Math.floor(width * 0.88);
    const numCols = Math.floor((endX - startX) / (fontSize * 1.2));
    const drops = Array(numCols)
      .fill(0)
      .map(() => Math.floor(Math.random() * -60));

    let animId: number;

    const render = () => {
      ctx.fillStyle = 'rgba(15, 18, 24, 0.12)';
      ctx.fillRect(startX, 0, endX - startX + 50, height);

      ctx.fillStyle = '#10B981';
      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = codeChars[Math.floor(Math.random() * codeChars.length)];
        const x = startX + i * fontSize * 1.2;
        const y = drops[i] * fontSize;

        ctx.fillStyle = '#34D399';
        ctx.fillText(char, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animId = requestAnimationFrame(render);
    };

    ctx.fillStyle = '#0F131C';
    ctx.fillRect(0, 0, width, height);
    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [settings.wallpaper]);

  const customWp = settings.customWallpaperUrl;
  const wpMode = settings.wallpaperMode || 'cover';
  const shouldRenderVideo = isVideoMode && Boolean(resolvedVideoUrl) && !isVideoError;
  const shouldRenderImage = !shouldRenderVideo && Boolean(customWp) && settings.wallpaperType !== 'preset';

  // Configurable overlay opacity
  const baseOverlay =
    typeof settings.wallpaperOpacity === 'number'
      ? Math.max(0, Math.min(100, settings.wallpaperOpacity)) / 100
      : 0.85;
  // For video, ensure overlay allows the video to be visibly vibrant (15-30% dark overlay)
  const videoOverlayOpacity = Math.max(0.12, Math.min(0.45, 1 - baseOverlay));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Video wallpaper layer */}
      {shouldRenderVideo ? (
        <video
          ref={videoRef}
          key={resolvedVideoUrl}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-700"
          style={{ objectFit: 'cover' }}
          src={resolvedVideoUrl!}
          onError={() => {
            console.warn('Video wallpaper failed to load or decode:', resolvedVideoUrl);
            setIsVideoError(true);
          }}
        />
      ) : shouldRenderImage ? (
        /* 2. Static custom image wallpaper layer */
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
        /* 3. Default textured cyberpunk background */
        <div className="absolute inset-0 bg-[#0E121A] bg-[radial-gradient(ellipse_at_80%_30%,#182335_0%,#0C0F16_80%)]" />
      )}

      {/* Dark overlay for contrast and icon readability */}
      {shouldRenderVideo ? (
        <div
          className="absolute inset-0 bg-[#0E121A] pointer-events-none"
          style={{ opacity: videoOverlayOpacity }}
        />
      ) : shouldRenderImage ? (
        <div
          className="absolute inset-0 bg-[#0E121A] pointer-events-none"
          style={{ opacity: 1 - baseOverlay }}
        />
      ) : null}

      {/* Matrix code canvas (rendered if matrix theme and no video/image) */}
      {!shouldRenderVideo && !shouldRenderImage && settings.wallpaper === 'matrix' && (
        <canvas ref={canvasRef} className="absolute inset-0 opacity-80 pointer-events-none" />
      )}

      {/* Cyber Developer Silhouette Graphic (when using default preset) */}
      {!shouldRenderVideo && !shouldRenderImage && (
        <div className="absolute bottom-12 right-16 w-[420px] h-[580px] pointer-events-none opacity-90 hidden lg:block">
          <svg
            viewBox="0 0 400 560"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full filter drop-shadow-[0_0_40px_rgba(16,185,129,0.2)]"
          >
            <circle cx="260" cy="180" r="140" fill="url(#dev-glow)" />
            <path
              d="M200 480C200 420 220 380 250 360C230 350 220 320 220 280C220 220 250 180 290 180C330 180 350 210 350 270C350 310 340 340 320 360C350 380 370 420 370 480H200Z"
              fill="#131B28"
              stroke="#10B981"
              strokeWidth="1.2"
              strokeOpacity="0.4"
            />
            <path
              d="M230 380L250 480M340 380L320 480M270 360V480M300 360V480"
              stroke="#10B981"
              strokeWidth="1.5"
              strokeOpacity="0.6"
              strokeDasharray="4 4"
            />
            <rect
              x="250"
              y="420"
              width="36"
              height="58"
              rx="4"
              fill="#0284C7"
              stroke="#38BDF8"
              strokeWidth="1.5"
            />
            <circle cx="268" cy="450" r="6" fill="#38BDF8" fillOpacity="0.6" />
            <defs>
              <radialGradient
                id="dev-glow"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(260 180) rotate(90) scale(140)"
              >
                <stop stopColor="#10B981" stopOpacity="0.25" />
                <stop offset="1" stopColor="#10B981" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      )}

      {/* Bottom Right Watermark */}
      <div className="absolute bottom-14 right-5 text-slate-500/70 font-mono text-[11px] select-none tracking-tight pointer-events-none">
        {settings.brandName || 'LivingYuji'} OS Professional
      </div>
    </div>
  );
}
