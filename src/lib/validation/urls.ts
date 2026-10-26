/**
 * Shared URL validation for persisted media and approved video-wallpaper
 * embeds. Keep this module free of browser/server-specific APIs so the same
 * rules apply in admin UI code, API routes, and storage helpers.
 */

const UNSAFE_URL_CHARACTERS = /[\u0000-\u001F\u007F\\]/;

const APPROVED_IFRAME_HOSTS = new Set([
  'streamable.com',
  'www.streamable.com',
  'youtube.com',
  'www.youtube.com',
  'www.youtube-nocookie.com',
  'youtube-nocookie.com',
  'player.vimeo.com',
]);

const KNOWN_IFRAME_PROVIDER_HOSTS = new Set([
  ...APPROVED_IFRAME_HOSTS,
  'm.youtube.com',
  'youtu.be',
  'vimeo.com',
  'www.vimeo.com',
]);

export interface MediaUrlValidationOptions {
  allowEmpty?: boolean;
}

export class InvalidMediaUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMediaUrlError';
  }
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Parses an absolute HTTP(S) URL. Credentials, control characters, and
 * backslashes are rejected because they can be interpreted inconsistently by
 * browsers, proxies, and Storage/CDN layers.
 */
export function parseHttpUrl(value: unknown): URL | null {
  const candidate = stringValue(value);
  if (!candidate || UNSAFE_URL_CHARACTERS.test(candidate)) return null;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    if (!parsed.hostname) return null;
    if (parsed.username || parsed.password) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function isRootRelativeMediaPath(value: unknown): boolean {
  const candidate = stringValue(value);
  return (
    candidate.startsWith('/') &&
    !candidate.startsWith('//') &&
    !UNSAFE_URL_CHARACTERS.test(candidate)
  );
}

/**
 * Accepts only absolute HTTP(S) URLs or root-relative paths on this origin.
 * Protocol-relative paths (`//host`), browser-only URLs, and arbitrary schemes
 * are not durable media locations.
 */
export function isSafeMediaUrl(value: unknown): boolean {
  const candidate = stringValue(value);
  if (!candidate) return false;
  return isRootRelativeMediaPath(candidate) || parseHttpUrl(candidate) !== null;
}

/**
 * Returns true only for explicitly approved embed providers and paths.
 * Streamable: /e/<id>; YouTube: /embed/<id>; Vimeo: player.vimeo.com/video/<digits>.
 */
export function isApprovedIframeUrl(value: unknown): boolean {
  const parsed = parseHttpUrl(value);
  if (!parsed) return false;
  if (parsed.port) return false;

  const host = parsed.hostname.toLowerCase();
  if (host === 'streamable.com' || host === 'www.streamable.com') {
    return /^\/e\/[A-Za-z0-9_-]+\/?$/.test(parsed.pathname);
  }
  if (
    host === 'youtube.com' ||
    host === 'www.youtube.com' ||
    host === 'www.youtube-nocookie.com' ||
    host === 'youtube-nocookie.com'
  ) {
    return /^\/embed\/[A-Za-z0-9_-]+\/?$/.test(parsed.pathname);
  }
  if (host === 'player.vimeo.com') {
    return /^\/video\/[0-9]+\/?$/.test(parsed.pathname);
  }

  return false;
}

export function detectIframeVideoSource(value: unknown): 'iframe' | 'url' {
  return isApprovedIframeUrl(value) ? 'iframe' : 'url';
}

function hasIframeEmbedShape(value: string): boolean {
  const parsed = parseHttpUrl(value);
  if (!parsed) return false;
  if (KNOWN_IFRAME_PROVIDER_HOSTS.has(parsed.hostname.toLowerCase())) return true;
  return /^\/embed\//i.test(parsed.pathname) || /^\/e\//i.test(parsed.pathname);
}

export function assertSafeMediaUrl(
  value: unknown,
  field: string,
  options: MediaUrlValidationOptions = {}
): void {
  if (value === undefined || value === null) return;

  if (typeof value !== 'string') {
    throw new InvalidMediaUrlError(`${field} must be a URL string.`);
  }

  const candidate = value.trim();
  if (!candidate) {
    if (options.allowEmpty !== false) return;
    throw new InvalidMediaUrlError(`${field} is required.`);
  }

  const lower = candidate.toLowerCase();
  if (lower.startsWith('blob:') || lower.startsWith('local:')) {
    throw new InvalidMediaUrlError(
      `${field} contains a browser-only URL. Upload the file to Supabase Storage before saving so the value is durable and shareable.`
    );
  }

  if (!isSafeMediaUrl(candidate)) {
    throw new InvalidMediaUrlError(
      `${field} must be an absolute http(s) URL or a root-relative media path.`
    );
  }
}

/**
 * Video wallpapers may use a direct media URL or an approved iframe embed.
 * Reject known provider URLs and embed-shaped paths that are not on the
 * explicit allowlist, so a URL cannot silently become an unapproved iframe.
 */
export function assertSafeVideoWallpaperUrl(
  value: unknown,
  field = 'custom_video_wallpaper_url',
  options: MediaUrlValidationOptions = {}
): void {
  assertSafeMediaUrl(value, field, options);

  const candidate = stringValue(value);
  if (!candidate) return;
  if (hasIframeEmbedShape(candidate) && !isApprovedIframeUrl(candidate)) {
    throw new InvalidMediaUrlError(
      `${field} uses an unapproved iframe provider or embed path. Use an approved Streamable, YouTube, or Vimeo embed URL, or a direct HTTP(S) media URL.`
    );
  }
}
