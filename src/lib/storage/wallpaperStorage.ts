/**
 * Wallpaper Persistence & Storage Engine for LivingYuji OS
 * Reliable IndexedDB storage for both local video and local image wallpapers
 * with automatic Blob URL lifecycle management and zero localStorage quota corruption.
 */

import { saveBinaryFile, getBinaryFile, deleteBinaryFile } from './binaryStorage';

export const VIDEO_WALLPAPER_STORAGE_KEY = 'lyos_video_wallpaper_blob';
export const IMAGE_WALLPAPER_STORAGE_KEY = 'lyos_image_wallpaper_blob';

// In-memory active object URLs
let activeVideoObjectUrl: string | null = null;
let activeImageObjectUrl: string | null = null;

// ====================================================================
// VIDEO WALLPAPER STORAGE
// ====================================================================

/**
 * Stores a local video file in IndexedDB and generates a fresh, active Object URL.
 */
export async function saveVideoWallpaperBlob(file: File | Blob): Promise<string> {
  const mimeType = file.type || 'video/mp4';
  const name = file instanceof File ? file.name : 'custom-video-wallpaper.mp4';

  await saveBinaryFile(VIDEO_WALLPAPER_STORAGE_KEY, name, mimeType, file);

  if (activeVideoObjectUrl) {
    try {
      URL.revokeObjectURL(activeVideoObjectUrl);
    } catch {
      // Ignore if already revoked
    }
  }

  activeVideoObjectUrl = URL.createObjectURL(file);
  return activeVideoObjectUrl;
}

/**
 * Loads the stored video wallpaper from IndexedDB and returns an active Object URL.
 */
export async function loadVideoWallpaperBlob(): Promise<{ blob: Blob; url: string } | null> {
  try {
    const record = await getBinaryFile(VIDEO_WALLPAPER_STORAGE_KEY);
    if (!record || !record.data) return null;

    if (activeVideoObjectUrl) {
      try {
        URL.revokeObjectURL(activeVideoObjectUrl);
      } catch {
        // Ignore
      }
    }

    activeVideoObjectUrl = URL.createObjectURL(record.data);
    return { blob: record.data, url: activeVideoObjectUrl };
  } catch (err) {
    console.warn('Failed to load video wallpaper from IndexedDB:', err);
    return null;
  }
}

/**
 * Deletes the local video wallpaper from IndexedDB and revokes the active Object URL.
 */
export async function clearVideoWallpaperBlob(): Promise<void> {
  if (activeVideoObjectUrl) {
    try {
      URL.revokeObjectURL(activeVideoObjectUrl);
    } catch {
      // Ignore
    }
    activeVideoObjectUrl = null;
  }
  await deleteBinaryFile(VIDEO_WALLPAPER_STORAGE_KEY);
}

/**
 * Returns the currently active in-memory Video Object URL, if any.
 */
export function getActiveVideoBlobUrl(): string | null {
  return activeVideoObjectUrl;
}

// ====================================================================
// IMAGE WALLPAPER STORAGE
// ====================================================================

/**
 * Stores a local image file in IndexedDB and returns an active Object URL,
 * avoiding Base64 conversion and localStorage quota overflow.
 */
export async function saveImageWallpaperBlob(file: File | Blob): Promise<string> {
  const mimeType = file.type || 'image/png';
  const name = file instanceof File ? file.name : 'custom-image-wallpaper.png';

  await saveBinaryFile(IMAGE_WALLPAPER_STORAGE_KEY, name, mimeType, file);

  if (activeImageObjectUrl) {
    try {
      URL.revokeObjectURL(activeImageObjectUrl);
    } catch {
      // Ignore
    }
  }

  activeImageObjectUrl = URL.createObjectURL(file);
  return activeImageObjectUrl;
}

/**
 * Loads the stored custom image wallpaper from IndexedDB and returns an active Object URL.
 */
export async function loadImageWallpaperBlob(): Promise<{ blob: Blob; url: string } | null> {
  try {
    const record = await getBinaryFile(IMAGE_WALLPAPER_STORAGE_KEY);
    if (!record || !record.data) return null;

    if (activeImageObjectUrl) {
      try {
        URL.revokeObjectURL(activeImageObjectUrl);
      } catch {
        // Ignore
      }
    }

    activeImageObjectUrl = URL.createObjectURL(record.data);
    return { blob: record.data, url: activeImageObjectUrl };
  } catch (err) {
    console.warn('Failed to load image wallpaper from IndexedDB:', err);
    return null;
  }
}

/**
 * Deletes the local image wallpaper from IndexedDB and revokes the active Object URL.
 */
export async function clearImageWallpaperBlob(): Promise<void> {
  if (activeImageObjectUrl) {
    try {
      URL.revokeObjectURL(activeImageObjectUrl);
    } catch {
      // Ignore
    }
    activeImageObjectUrl = null;
  }
  await deleteBinaryFile(IMAGE_WALLPAPER_STORAGE_KEY);
}

/**
 * Returns the currently active in-memory Image Object URL, if any.
 */
export function getActiveImageBlobUrl(): string | null {
  return activeImageObjectUrl;
}

/**
 * Uniform resolver for wallpaper media URLs across video and images.
 */
export async function resolveWallpaperMediaUrl(
  rawUrl: string | null | undefined,
  type: 'video' | 'image'
): Promise<string | null> {
  if (!rawUrl) return null;

  // Handle local IndexedDB references
  if (rawUrl.startsWith('local:')) {
    if (type === 'video') {
      const res = await loadVideoWallpaperBlob();
      return res?.url || null;
    } else {
      const res = await loadImageWallpaperBlob();
      return res?.url || null;
    }
  }

  // Handle active blob: URLs
  if (rawUrl.startsWith('blob:')) {
    // If active in memory, return it; otherwise rehydrate from IndexedDB
    if (type === 'video') {
      if (activeVideoObjectUrl) return activeVideoObjectUrl;
      const res = await loadVideoWallpaperBlob();
      return res?.url || null;
    } else {
      if (activeImageObjectUrl) return activeImageObjectUrl;
      const res = await loadImageWallpaperBlob();
      return res?.url || null;
    }
  }

  // Standard remote or static web URL
  return rawUrl;
}
