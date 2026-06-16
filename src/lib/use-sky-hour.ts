import { useEffect, useState } from "react";
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

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
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
