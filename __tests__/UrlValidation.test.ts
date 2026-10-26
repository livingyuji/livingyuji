import {
  assertSafeMediaUrl,
  assertSafeVideoWallpaperUrl,
  detectIframeVideoSource,
  isApprovedIframeUrl,
  isSafeMediaUrl,
  parseHttpUrl,
} from '@/lib/validation/urls';

describe('Media and iframe URL validation', () => {
  test('accepts HTTP(S) and root-relative media paths', () => {
    expect(isSafeMediaUrl('https://cdn.example.com/video.mp4')).toBe(true);
    expect(isSafeMediaUrl('http://localhost:3000/audio.mp3')).toBe(true);
    expect(isSafeMediaUrl('/wallpapers/cyber.png')).toBe(true);
    expect(isSafeMediaUrl('  https://cdn.example.com/image.png  ')).toBe(true);
  });

  test.each([
    'javascript:alert(1)',
    'data:image/svg+xml;base64,AAAA',
    'file:///C:/secret.png',
    'blob:https://example.com/1234',
    'local:wallpaper-file',
    '//evil.example/image.png',
    '/\\evil.example/image.png',
    'https://exa mple.com/image.png',
    'https://',
    'not a url',
    'https://user:password@example.com/image.png',
    'https://example.com/\nnext',
  ])('rejects unsafe or malformed media URL %p', (value) => {
    expect(isSafeMediaUrl(value)).toBe(false);
    expect(parseHttpUrl(value)).toBeNull();
    expect(() => assertSafeMediaUrl(value, 'media_url')).toThrow();
  });

  test('allows only the approved embed providers and paths', () => {
    expect(isApprovedIframeUrl('https://streamable.com/e/c51sit?autoplay=1')).toBe(true);
    expect(isApprovedIframeUrl('https://www.streamable.com/e/c51sit')).toBe(true);
    expect(isApprovedIframeUrl('https://www.youtube.com/embed/abc123')).toBe(true);
    expect(isApprovedIframeUrl('https://www.youtube-nocookie.com/embed/abc123')).toBe(true);
    expect(isApprovedIframeUrl('https://player.vimeo.com/video/123456')).toBe(true);
    expect(isApprovedIframeUrl('https://player.vimeo.com/video/123456?h=abc')).toBe(true);

    expect(isApprovedIframeUrl('https://youtube.com/watch?v=abc123')).toBe(false);
    expect(isApprovedIframeUrl('https://streamable.com/c51sit')).toBe(false);
    expect(isApprovedIframeUrl('https://streamable.com/e/')).toBe(false);
    expect(isApprovedIframeUrl('https://www.youtube.com/embed/')).toBe(false);
    expect(isApprovedIframeUrl('https://player.vimeo.com/channels/staffpicks')).toBe(false);
    expect(isApprovedIframeUrl('https://player.vimeo.com.evil.example/video/123')).toBe(false);
    expect(isApprovedIframeUrl('https://evil.example/embed/abc123')).toBe(false);
    expect(isApprovedIframeUrl('https://streamable.com:8443/e/c51sit')).toBe(false);
  });

  test('detects iframe sources with the same allowlist', () => {
    expect(detectIframeVideoSource('https://streamable.com/e/c51sit')).toBe('iframe');
    expect(detectIframeVideoSource('https://www.youtube.com/embed/abc123')).toBe('iframe');
    expect(detectIframeVideoSource('https://youtube.com/watch?v=abc123')).toBe('url');
    expect(detectIframeVideoSource('https://cdn.example.com/video.mp4')).toBe('url');
    expect(detectIframeVideoSource(null)).toBe('url');
  });

  test('video-wallpaper validation rejects unapproved embed-shaped URLs', () => {
    expect(() =>
      assertSafeVideoWallpaperUrl('https://streamable.com/e/c51sit', 'video_wallpaper_url')
    ).not.toThrow();
    expect(() =>
      assertSafeVideoWallpaperUrl('https://cdn.example.com/wallpaper.mp4', 'video_wallpaper_url')
    ).not.toThrow();
    expect(() =>
      assertSafeVideoWallpaperUrl('/videos/wallpaper.mp4', 'video_wallpaper_url')
    ).not.toThrow();

    expect(() =>
      assertSafeVideoWallpaperUrl('https://vimeo.com/123456', 'video_wallpaper_url')
    ).toThrow(/unapproved iframe provider/i);
    expect(() =>
      assertSafeVideoWallpaperUrl('https://evil.example/e/unapproved', 'video_wallpaper_url')
    ).toThrow(/unapproved iframe provider/i);
  });
});
