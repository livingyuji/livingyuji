/**
 * Video Wallpaper Persistence Engine for LivingYuji OS
 * Reliable IndexedDB storage for local video files with automatic Blob URL lifecycle management.
 */

import { saveBinaryFile, getBinaryFile, deleteBinaryFile } from './binaryStorage';

export const VIDEO_WALLPAPER_STORAGE_KEY = 'lyos_video_wallpaper_blob';

// Cache active object URL in memory to prevent memory leaks and redundant recreations
let activeObjectUrl: string | null = null;

/**
 * Stores a local video file in IndexedDB and generates a fresh, active Object URL.
 */
export async function saveVideoWallpaperBlob(file: File | Blob): Promise<string> {
  const mimeType = file.type || 'video/mp4';
  const name = file instanceof File ? file.name : 'custom-video-wallpaper.mp4';

  await saveBinaryFile(VIDEO_WALLPAPER_STORAGE_KEY, name, mimeType, file);

  if (activeObjectUrl) {
    try {
      URL.revokeObjectURL(activeObjectUrl);
    } catch {
      // Ignore if already revoked
    }
  }

  activeObjectUrl = URL.createObjectURL(file);
  return activeObjectUrl;
}

/**
 * Loads the stored video wallpaper from IndexedDB and returns an active Object URL.
 */
export async function loadVideoWallpaperBlob(): Promise<{ blob: Blob; url: string } | null> {
  try {
    const record = await getBinaryFile(VIDEO_WALLPAPER_STORAGE_KEY);
    if (!record || !record.data) return null;

    if (activeObjectUrl) {
      try {
        URL.revokeObjectURL(activeObjectUrl);
      } catch {
        // Ignore
      }
    }

    activeObjectUrl = URL.createObjectURL(record.data);
    return { blob: record.data, url: activeObjectUrl };
  } catch (err) {
    console.warn('Failed to load video wallpaper from IndexedDB:', err);
    return null;
  }
}

/**
 * Deletes the local video wallpaper from IndexedDB and revokes the active Object URL.
 */
export async function clearVideoWallpaperBlob(): Promise<void> {
  if (activeObjectUrl) {
    try {
      URL.revokeObjectURL(activeObjectUrl);
    } catch {
      // Ignore
    }
    activeObjectUrl = null;
  }
  await deleteBinaryFile(VIDEO_WALLPAPER_STORAGE_KEY);
}

/**
 * Returns the currently active in-memory Object URL, if any.
 */
export function getActiveVideoBlobUrl(): string | null {
  return activeObjectUrl;
}
