/**
 * IndexedDB storage engine for LivingYuji OS Virtual Filesystem.
 * Stores binary file payloads (images, audio, jars, zips, pdfs, etc.)
 * reliably without localStorage quota limits or base64 serialization corruption.
 */

const DB_NAME = 'livingyuji_os_storage';
const DB_VERSION = 1;
const STORE_NAME = 'binary_files';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this environment.'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB.'));
  });
}

export interface StoredBinaryFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  data: Blob;
  updatedAt: number;
}

/**
 * Persists a binary file (Blob or ArrayBuffer) in IndexedDB
 */
export async function saveBinaryFile(
  id: string,
  name: string,
  mimeType: string,
  data: Blob | ArrayBuffer
): Promise<void> {
  const db = await openDatabase();
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType || 'application/octet-stream' });

  const record: StoredBinaryFile = {
    id,
    name,
    mimeType: mimeType || 'application/octet-stream',
    size: blob.size,
    data: blob,
    updatedAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(record);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error || new Error(`Failed to save binary file "${name}".`));
  });
}

/**
 * Retrieves a stored binary file from IndexedDB
 */
export async function getBinaryFile(id: string): Promise<StoredBinaryFile | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error || new Error(`Failed to load binary file "${id}".`));
    });
  } catch (err) {
    console.warn(`IndexedDB read error for ${id}:`, err);
    return null;
  }
}

/**
 * Deletes a binary file from IndexedDB
 */
export async function deleteBinaryFile(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error || new Error(`Failed to delete binary file "${id}".`));
    });
  } catch (err) {
    console.warn(`IndexedDB delete error for ${id}:`, err);
  }
}
