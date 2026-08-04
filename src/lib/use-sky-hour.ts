import { useEffect, useSyncExternalStore } from "react";
import { useNow } from "./use-now";
import { useSettings } from "./settings";

// Fixed hour for SSR + the first client render. React never patches hydration
// attribute mismatches, so the palette must match the server until the client
// has mounted (see AGENTS.md "Critical conventions").
export const SSR_SKY_HOUR = 11;

// Pure decision: which local hour should feed `skyTheme`.
// - not mounted -> fixed SSR hour (hydration safety) wins over everything
// - dark mode on -> the current local hour
// - otherwise -> the page's preferred hour, falling back to the current hour
export function pickSkyHour(opts: {
  mounted: boolean;
  currentTimeSky: boolean;
  preferredHour: number | undefined;
  currentHour: number;
}): number {
  if (!opts.mounted) return SSR_SKY_HOUR;
  if (opts.currentTimeSky) return opts.currentHour;
  return opts.preferredHour ?? opts.currentHour;
}

// The mount state belongs to the hydrated app, not to an individual route.
// Keeping it in a shared external store means the first client render still
// matches SSR, while routes mounted later immediately use the live palette.
export function createMountedStore() {
  let mounted = false;
  const listeners = new Set<() => void>();

  return {
    getSnapshot: () => mounted,
    getServerSnapshot: () => false,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    markMounted: () => {
      if (mounted) return;
      mounted = true;
      listeners.forEach((listener) => listener());
    },
  };
}

const appMountedStore = createMountedStore();

export function useMounted() {
  const mounted = useSyncExternalStore(
    appMountedStore.subscribe,
    appMountedStore.getSnapshot,
    appMountedStore.getServerSnapshot,
  );
  useEffect(appMountedStore.markMounted, []);
  return mounted;
}

// Local hour the sky palette should derive from. Centralizes the
// hydration-safety convention and the "Dark mode" (currentTimeSky) behavior.
// `forceCurrentTime` lets a caller treat dark mode as on without changing the
// stored setting (used by onboarding steps 0/1).
export function useSkyHour(
  preferredHour?: number,
  forceCurrentTime = false,
): number {
  const mounted = useMounted();
  const now = useNow();
  const { settings } = useSettings();
  return pickSkyHour({
    mounted,
    currentTimeSky: forceCurrentTime || settings.currentTimeSky,
    preferredHour,
    currentHour: now.getHours(),
  });
}
