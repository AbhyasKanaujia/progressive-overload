import { useIsFocused } from '@react-navigation/native';
import { useEffect, useRef } from 'react';

/**
 * Re-runs `reload` every time the screen regains focus, skipping the very
 * first focus (the screen's own initial mount/load already covers that).
 * Needed because Expo Router can reuse a screen instance across navigations
 * (e.g. router.replace back to an already-mounted route), so a one-shot
 * useEffect keyed on an id won't see data changed elsewhere.
 */
export function useReloadOnFocus(reload: () => void | Promise<void>) {
  const isFocused = useIsFocused();
  const hasFocusedBefore = useRef(false);

  useEffect(() => {
    if (!isFocused) return;
    if (!hasFocusedBefore.current) {
      hasFocusedBefore.current = true;
      return;
    }
    reload();
  }, [isFocused, reload]);
}
