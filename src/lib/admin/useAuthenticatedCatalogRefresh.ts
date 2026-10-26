import { useEffect, useRef } from 'react';

export type AdminCatalogAuthState = 'checking' | 'authenticated' | 'unauthenticated';

/**
 * Refreshes admin-only catalogs once whenever authentication becomes
 * available. Refresher identity changes do not rerun the effect, which avoids
 * request loops caused by inline callback definitions. A logout clears the
 * previously loaded admin catalog.
 */
export function useAuthenticatedCatalogRefresh(
  authState: AdminCatalogAuthState,
  refreshers: ReadonlyArray<() => void | Promise<void>>,
  onUnauthenticated?: () => void
): void {
  const refreshersRef = useRef(refreshers);
  const resetRef = useRef(onUnauthenticated);
  const lastHandledAuthStateRef = useRef<AdminCatalogAuthState | null>(null);

  useEffect(() => {
    refreshersRef.current = refreshers;
    resetRef.current = onUnauthenticated;
  });

  useEffect(() => {
    // The ref guard also collapses React Strict Mode's intentional double
    // effect invocation, so a single auth transition issues one refresh batch.
    if (lastHandledAuthStateRef.current === authState) return;
    lastHandledAuthStateRef.current = authState;

    if (authState === 'authenticated') {
      for (const refresh of refreshersRef.current) {
        void refresh();
      }
      return;
    }

    if (authState === 'unauthenticated') {
      resetRef.current?.();
    }
  }, [authState]);
}
