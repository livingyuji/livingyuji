import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth/adminAuth';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const PHASE_B_MIGRATION = 'supabase/migrations/20261026_phase_b_schema_storage_foundation.sql';
const MAX_BYTES = 100 * 1024 * 1024;

type UploadPurpose =
  | 'music-audio'
  | 'music-cover'
  | 'wallpaper-video'
  | 'wallpaper-image'
  | 'showcase-image'
  | 'media';

interface PurposeRule {
  bucket: 'music' | 'wallpapers' | 'showcase' | 'media';
  folder: (recordId?: string) => string;
  maxBytes: number;
  types: Record<string, string[]>;
}

const PURPOSE_RULES: Record<UploadPurpose, PurposeRule> = {
  'music-audio': {
    bucket: 'music',
    folder: (recordId) => `audio/${recordId || 'unassigned'}`,
    maxBytes: 50 * 1024 * 1024,
    types: {
      mp3: ['audio/mpeg'],
      wav: ['audio/wav', 'audio/x-wav', 'audio/wave'],
      ogg: ['audio/ogg'],
      flac: ['audio/flac', 'audio/x-flac'],
    },
  },
  'music-cover': {
    bucket: 'music',
    folder: (recordId) => `covers/${recordId || 'unassigned'}`,
    maxBytes: 10 * 1024 * 1024,
    types: {
      png: ['image/png'],
      jpg: ['image/jpeg'],
      jpeg: ['image/jpeg'],
      webp: ['image/webp'],
    },
  },
  'wallpaper-video': {
    bucket: 'wallpapers',
    folder: () => 'videos',
    maxBytes: 100 * 1024 * 1024,
    types: {
      mp4: ['video/mp4'],
      webm: ['video/webm'],
    },
  },
  'wallpaper-image': {
    bucket: 'wallpapers',
    folder: () => 'images',
    maxBytes: 50 * 1024 * 1024,
    types: {
      png: ['image/png'],
      jpg: ['image/jpeg'],
      jpeg: ['image/jpeg'],
      webp: ['image/webp'],
      avif: ['image/avif'],
    },
  },
  'showcase-image': {
    bucket: 'showcase',
    folder: () => 'projects',
    maxBytes: 25 * 1024 * 1024,
    types: {
      png: ['image/png'],
      jpg: ['image/jpeg'],
      jpeg: ['image/jpeg'],
      webp: ['image/webp'],
      avif: ['image/avif'],
    },
  },
  media: {
    bucket: 'media',
    folder: () => 'library',
    maxBytes: 50 * 1024 * 1024,
    types: {
      png: ['image/png'],
      jpg: ['image/jpeg'],
      jpeg: ['image/jpeg'],
      webp: ['image/webp'],
      avif: ['image/avif'],
      ico: ['image/x-icon', 'image/vnd.microsoft.icon'],
      pdf: ['application/pdf'],
      mp4: ['video/mp4'],
      webm: ['video/webm'],
    },
  },
};

function getExtension(name: string): string {
  const index = name.lastIndexOf('.');
  return index >= 0 ? name.slice(index + 1).toLowerCase() : '';
}

function safeFileName(name: string): string {
  const cleaned = name
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
  return cleaned || 'upload';
}

function isUploadPurpose(value: unknown): value is UploadPurpose {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(PURPOSE_RULES, value);
}

function storageErrorMessage(message: string): { status: number; error: string } {
  if (/bucket.*not found|bucket.*does not exist/i.test(message)) {
    return {
      status: 503,
      error: `Storage bucket is not configured. Apply the prepared migration '${PHASE_B_MIGRATION}' before uploading files.`,
    };
  }
  if (/row-level security|permission|unauthorized|jwt/i.test(message)) {
    return {
      status: 503,
      error: `Storage rejected the service-role upload. Verify SUPABASE_SERVICE_ROLE_KEY and the Storage policies in '${PHASE_B_MIGRATION}'.`,
    };
  }
  return { status: 500, error: message || 'Storage upload failed.' };
}

export async function POST(req: NextRequest) {
  const authenticated = await isAuthenticatedAdmin(req);
  if (!authenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Administrator session required.' },
      { status: 401 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const purpose = formData.get('purpose');
    const recordIdValue = formData.get('recordId');

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'A file is required.' }, { status: 400 });
    }
    if (!isUploadPurpose(purpose)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Invalid upload purpose. Expected music-audio, music-cover, wallpaper-video, wallpaper-image, showcase-image, or media.',
        },
        { status: 400 }
      );
    }

    const rule = PURPOSE_RULES[purpose];
    if (file.size <= 0) {
      return NextResponse.json({ success: false, error: 'The uploaded file is empty.' }, { status: 400 });
    }
    if (file.size > rule.maxBytes || file.size > MAX_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `File is too large. Maximum size for this upload type is ${Math.round(rule.maxBytes / (1024 * 1024))} MiB.`,
        },
        { status: 413 }
      );
    }

    const extension = getExtension(file.name);
    const allowedMimes = rule.types[extension];
    if (!allowedMimes) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file extension '.${extension || '(none)'}'. Allowed: ${Object.keys(rule.types).join(', ')}.`,
        },
        { status: 415 }
      );
    }

    const declaredType = (file.type || allowedMimes[0]).toLowerCase();
    if (!allowedMimes.includes(declaredType)) {
      return NextResponse.json(
        {
          success: false,
          error: `File type '${declaredType}' does not match the allowed type for '.${extension}'.`,
        },
        { status: 415 }
      );
    }

    let recordId: string | undefined;
    if (purpose === 'music-audio' || purpose === 'music-cover') {
      recordId = typeof recordIdValue === 'string' ? recordIdValue.trim() : '';
      if (!recordId || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(recordId)) {
        return NextResponse.json(
          { success: false, error: 'A valid stable track ID is required for music uploads.' },
          { status: 400 }
        );
      }
    }

    const supabase = await createServiceClient();
    if (!supabase) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Supabase Storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, then apply the prepared Phase B migration.',
        },
        { status: 503 }
      );
    }

    const storagePath = `${rule.folder(recordId)}/${Date.now()}-${safeFileName(file.name)}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(rule.bucket)
      .upload(storagePath, bytes, {
        contentType: declaredType,
        upsert: false,
        cacheControl: '31536000',
      });

    if (uploadError) {
      const mapped = storageErrorMessage(uploadError.message);
      return NextResponse.json({ success: false, error: mapped.error }, { status: mapped.status });
    }

    const { data: publicData } = supabase.storage.from(rule.bucket).getPublicUrl(uploadData?.path || storagePath);
    const publicUrl = publicData?.publicUrl;

    if (!publicUrl || !/^https?:\/\//i.test(publicUrl)) {
      return NextResponse.json(
        { success: false, error: 'Storage accepted the file but did not return a valid public URL.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bucket: rule.bucket,
      path: uploadData?.path || storagePath,
      url: publicUrl,
      contentType: declaredType,
      size: file.size,
      purpose,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
