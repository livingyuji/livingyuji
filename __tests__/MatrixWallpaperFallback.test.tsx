import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { MatrixWallpaper } from '@/components/desktop/MatrixWallpaper';
import { useWindowStore } from '@/store/windowStore';

jest.mock('@/lib/storage/wallpaperStorage', () => ({
  loadVideoWallpaperBlob: jest.fn(async () => null),
  getActiveVideoBlobUrl: jest.fn(() => null),
  getActiveImageBlobUrl: jest.fn(() => null),
  resolveWallpaperMediaUrl: jest.fn(async (url: string) => url),
}));

class MockImage {
  static instances: MockImage[] = [];
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor() {
    MockImage.instances.push(this);
  }

  set src(_value: string) {
    // The preloader does not need to load anything. Tests trigger onerror.
  }
}

describe('MatrixWallpaper fallback behavior', () => {
  const originalImage = window.Image;
  const originalPlay = window.HTMLMediaElement.prototype.play;
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    localStorage.clear();
    useWindowStore.getState().resetSettings();
    MockImage.instances = [];
    (window as unknown as { Image: typeof MockImage }).Image = MockImage;
    window.HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  afterAll(() => {
    window.Image = originalImage;
    window.HTMLMediaElement.prototype.play = originalPlay;
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: originalMatchMedia,
    });
  });

  test('falls back from a broken image to the configured iframe video', async () => {
    useWindowStore.getState().updateSettings({
      wallpaper: 'dark',
      wallpaperType: 'image',
      customWallpaperUrl: 'https://cdn.example.com/broken-wallpaper.png',
      customVideoWallpaperUrl: 'https://streamable.com/e/verified-fallback',
      videoWallpaperSource: 'iframe',
    });

    const { container } = render(React.createElement(MatrixWallpaper));

    await waitFor(() => expect(MockImage.instances).toHaveLength(1));
    act(() => {
      MockImage.instances[0].onerror?.();
    });

    await waitFor(() => {
      const iframe = container.querySelector('iframe');
      expect(iframe).not.toBeNull();
      expect(iframe?.getAttribute('src')).toBe('https://streamable.com/e/verified-fallback');
      expect(iframe?.style.opacity).toBe('0');
    });

    const iframe = container.querySelector('iframe') as HTMLIFrameElement;
    fireEvent.load(iframe);
    expect(iframe.style.opacity).toBe('1');

    act(() => {
      useWindowStore.getState().updateSettings({
        customVideoWallpaperUrl: 'https://streamable.com/e/second-fallback',
      });
    });

    await waitFor(() => {
      const updatedIframe = container.querySelector('iframe');
      expect(updatedIframe?.getAttribute('src')).toBe('https://streamable.com/e/second-fallback');
      expect(updatedIframe?.style.opacity).toBe('0');
    });
  });

  test('falls back from a broken image to the built-in Streamable embed', async () => {
    useWindowStore.getState().updateSettings({
      wallpaper: 'dark',
      wallpaperType: 'image',
      customWallpaperUrl: 'https://cdn.example.com/missing.png',
      customVideoWallpaperUrl: null,
      videoWallpaperSource: null,
    });

    const { container } = render(React.createElement(MatrixWallpaper));

    await waitFor(() => expect(MockImage.instances).toHaveLength(1));
    act(() => {
      MockImage.instances[0].onerror?.();
    });

    await waitFor(() => {
      const iframe = container.querySelector('iframe');
      expect(iframe?.getAttribute('src')).toContain('streamable.com/e/');
    });
  });

  test('clears a video error when the video URL or source changes', async () => {
    useWindowStore.getState().updateSettings({
      wallpaper: 'dark',
      wallpaperType: 'video',
      customWallpaperUrl: null,
      customVideoWallpaperUrl: 'https://cdn.example.com/broken-video.mp4',
      videoWallpaperSource: 'url',
    });

    const { container } = render(React.createElement(MatrixWallpaper));

    await waitFor(() => expect(container.querySelector('video')).not.toBeNull());
    const video = container.querySelector('video') as HTMLVideoElement;
    fireEvent.error(video);

    await waitFor(() => expect(container.querySelector('video')).toBeNull());

    act(() => {
      useWindowStore.getState().updateSettings({
        customVideoWallpaperUrl: 'https://cdn.example.com/recovered-video.mp4',
        videoWallpaperSource: 'url',
      });
    });

    await waitFor(() => {
      const recovered = container.querySelector('video');
      expect(recovered?.getAttribute('src')).toBe('https://cdn.example.com/recovered-video.mp4');
    });
  });
});
