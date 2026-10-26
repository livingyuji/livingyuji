import { act, renderHook, waitFor } from '@testing-library/react';
import {
  AdminCatalogAuthState,
  useAuthenticatedCatalogRefresh,
} from '@/lib/admin/useAuthenticatedCatalogRefresh';

type HookProps = {
  authState: AdminCatalogAuthState;
  refreshers: Array<() => void>;
  onUnauthenticated?: () => void;
};

describe('useAuthenticatedCatalogRefresh', () => {
  test('refreshes once when authentication becomes available and clears on logout', async () => {
    const products = jest.fn();
    const media = jest.fn();
    const music = jest.fn();
    const reset = jest.fn();

    const { rerender } = renderHook(
      ({ authState, refreshers, onUnauthenticated }: HookProps) =>
        useAuthenticatedCatalogRefresh(authState, refreshers, onUnauthenticated),
      {
        initialProps: {
          authState: 'checking',
          refreshers: [products, media, music],
          onUnauthenticated: reset,
        } as HookProps,
      }
    );

    expect(products).not.toHaveBeenCalled();
    expect(media).not.toHaveBeenCalled();
    expect(music).not.toHaveBeenCalled();
    expect(reset).not.toHaveBeenCalled();

    rerender({
      authState: 'authenticated',
      refreshers: [products, media, music],
      onUnauthenticated: reset,
    });

    await waitFor(() => {
      expect(products).toHaveBeenCalledTimes(1);
      expect(media).toHaveBeenCalledTimes(1);
      expect(music).toHaveBeenCalledTimes(1);
    });

    // Inline refresher identities change every render. They must not cause a
    // duplicate refresh while the auth state remains authenticated.
    const nextProducts = jest.fn();
    rerender({
      authState: 'authenticated',
      refreshers: [nextProducts, media, music],
      onUnauthenticated: reset,
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(nextProducts).not.toHaveBeenCalled();
    expect(products).toHaveBeenCalledTimes(1);

    rerender({
      authState: 'unauthenticated',
      refreshers: [nextProducts, media, music],
      onUnauthenticated: reset,
    });
    await waitFor(() => expect(reset).toHaveBeenCalledTimes(1));
    expect(nextProducts).not.toHaveBeenCalled();

    rerender({
      authState: 'authenticated',
      refreshers: [nextProducts, media, music],
      onUnauthenticated: reset,
    });
    await waitFor(() => expect(nextProducts).toHaveBeenCalledTimes(1));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
