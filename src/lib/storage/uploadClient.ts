export type AdminUploadPurpose =
  | 'music-audio'
  | 'music-cover'
  | 'wallpaper-video'
  | 'wallpaper-image'
  | 'showcase-image'
  | 'media';

export interface AdminUploadResult {
  success: true;
  bucket: string;
  path: string;
  url: string;
  contentType: string;
  size: number;
  purpose: AdminUploadPurpose;
}

/**
 * Uploads an administrator-selected file to Supabase Storage through the
 * server-only route. Browser blob URLs and IndexedDB entries are deliberately
 * not accepted as durable production URLs.
 */
export async function uploadAdminFile(
  file: File,
  purpose: AdminUploadPurpose,
  recordId?: string
): Promise<AdminUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('purpose', purpose);
  if (recordId) formData.append('recordId', recordId);

  const headers = new Headers();
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('lyos_admin_token') : null;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('x-admin-token', token);
  }

  const response = await fetch('/api/admin/upload', {
    method: 'POST',
    headers,
    body: formData,
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.success) {
    throw new Error(data?.error || `Upload failed (${response.status}).`);
  }

  return data as AdminUploadResult;
}
