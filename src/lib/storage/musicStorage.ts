/**
 * Music Storage Engine for LivingYuji OS
 * Persists audio binaries (MP3, WAV, OGG, FLAC) and artwork (PNG, JPG, WebP)
 * reliably in IndexedDB with automated Blob URL lifecycle management.
 */

import { saveBinaryFile, getBinaryFile, deleteBinaryFile } from './binaryStorage';

const activeMusicObjectUrls = new Map<string, string>();

/**
 * Persists an uploaded audio file in browser IndexedDB and returns an active object URL.
 */
export async function saveMusicAudioBlob(id: string, file: File | Blob): Promise<string> {
  const mimeType = file.type || 'audio/mpeg';
  const name = file instanceof File ? file.name : `${id}.mp3`;
  const storageKey = `lyos_music_audio_${id}`;

  await saveBinaryFile(storageKey, name, mimeType, file);

  const existing = activeMusicObjectUrls.get(storageKey);
  if (existing) {
    try {
      URL.revokeObjectURL(existing);
    } catch {
      // Ignore
    }
  }

  const freshUrl = URL.createObjectURL(file);
  activeMusicObjectUrls.set(storageKey, freshUrl);
  return freshUrl;
}

/**
 * Loads an audio file from IndexedDB by track ID and returns an active object URL.
 */
export async function loadMusicAudioBlob(id: string): Promise<{ blob: Blob; url: string } | null> {
  const storageKey = `lyos_music_audio_${id}`;
  try {
    const record = await getBinaryFile(storageKey);
    if (!record || !record.data) return null;

    const existing = activeMusicObjectUrls.get(storageKey);
    if (existing) {
      try {
        URL.revokeObjectURL(existing);
      } catch {
        // Ignore
      }
    }

    const freshUrl = URL.createObjectURL(record.data);
    activeMusicObjectUrls.set(storageKey, freshUrl);
    return { blob: record.data, url: freshUrl };
  } catch (err) {
    console.warn(`Failed to load audio binary for ${id}:`, err);
    return null;
  }
}

/**
 * Persists an uploaded album cover image in IndexedDB.
 */
export async function saveMusicCoverBlob(id: string, file: File | Blob): Promise<string> {
  const mimeType = file.type || 'image/png';
  const name = file instanceof File ? file.name : `${id}-cover.png`;
  const storageKey = `lyos_music_cover_${id}`;

  await saveBinaryFile(storageKey, name, mimeType, file);

  const existing = activeMusicObjectUrls.get(storageKey);
  if (existing) {
    try {
      URL.revokeObjectURL(existing);
    } catch {
      // Ignore
    }
  }

  const freshUrl = URL.createObjectURL(file);
  activeMusicObjectUrls.set(storageKey, freshUrl);
  return freshUrl;
}

/**
 * Loads an album cover image from IndexedDB by track ID.
 */
export async function loadMusicCoverBlob(id: string): Promise<{ blob: Blob; url: string } | null> {
  const storageKey = `lyos_music_cover_${id}`;
  try {
    const record = await getBinaryFile(storageKey);
    if (!record || !record.data) return null;

    const existing = activeMusicObjectUrls.get(storageKey);
    if (existing) {
      try {
        URL.revokeObjectURL(existing);
      } catch {
        // Ignore
      }
    }

    const freshUrl = URL.createObjectURL(record.data);
    activeMusicObjectUrls.set(storageKey, freshUrl);
    return { blob: record.data, url: freshUrl };
  } catch (err) {
    console.warn(`Failed to load cover image for ${id}:`, err);
    return null;
  }
}

/**
 * Deletes audio and cover art records from IndexedDB when a track is deleted.
 */
export async function deleteMusicBlobs(id: string): Promise<void> {
  const audioKey = `lyos_music_audio_${id}`;
  const coverKey = `lyos_music_cover_${id}`;

  const audioUrl = activeMusicObjectUrls.get(audioKey);
  if (audioUrl) {
    try {
      URL.revokeObjectURL(audioUrl);
    } catch {
      // Ignore
    }
    activeMusicObjectUrls.delete(audioKey);
  }

  const coverUrl = activeMusicObjectUrls.get(coverKey);
  if (coverUrl) {
    try {
      URL.revokeObjectURL(coverUrl);
    } catch {
      // Ignore
    }
    activeMusicObjectUrls.delete(coverKey);
  }

  await Promise.all([
    deleteBinaryFile(audioKey).catch(() => {}),
    deleteBinaryFile(coverKey).catch(() => {}),
  ]);
}

/**
 * Resolves a stored music URL reference (local IndexedDB or remote) into a playable URL.
 */
export async function resolveMusicMediaUrl(rawUrl: string | null | undefined, trackId: string, type: 'audio' | 'cover'): Promise<string | null> {
  if (!rawUrl) return null;

  if (rawUrl.startsWith('local:')) {
    if (type === 'audio') {
      const res = await loadMusicAudioBlob(trackId);
      return res?.url || null;
    } else {
      const res = await loadMusicCoverBlob(trackId);
      return res?.url || null;
    }
  }

  if (rawUrl.startsWith('blob:')) {
    const key = `lyos_music_${type}_${trackId}`;
    if (activeMusicObjectUrls.has(key)) {
      return activeMusicObjectUrls.get(key)!;
    }
    if (type === 'audio') {
      const res = await loadMusicAudioBlob(trackId);
      return res?.url || null;
    } else {
      const res = await loadMusicCoverBlob(trackId);
      return res?.url || null;
    }
  }

  return rawUrl;
}
