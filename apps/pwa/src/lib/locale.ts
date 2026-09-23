import { useSyncExternalStore } from "react";
import {
  DEFAULT_LOCALE,
  isLocale,
  resolveLocale,
  type Locale,
} from "@wattlyzer/i18n";
import { createStore } from "@/lib/settings";
import { useMounted } from "@/lib/use-sky-hour";

export type { Locale } from "@wattlyzer/i18n";

// Own storage key: changing the language must never rewrite
// `wattlyzer_settings` or `wattlyzer_prefs`.
export const LOCALE_STORAGE_KEY = "wattlyzer_locale";

// Only the explicit choice is persisted. `null` means "follow the browser",
// so a user who later switches their browser language is not locked into a
// detection made on their first visit.
export interface LocaleSnapshot {
  chosen: Locale | null;
  preferred: readonly string[];
}

export function parseStoredLocale(raw: string | null): Locale | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { locale?: unknown };
    return isLocale(parsed?.locale) ? parsed.locale : null;
  } catch {
    return null;
  }
}

// Cross-domain links carry an explicit language choice, never inferred detection.
export function localeFromSearch(search: string): Locale | null {
  const lang = new URLSearchParams(search).get("lang");
  return isLocale(lang) ? lang : null;
}

export function serializeStoredLocale(locale: Locale | null): string {
  return JSON.stringify({ locale });
}

function browserPreferences(): readonly string[] {
  if (typeof navigator === "undefined") {
    return [];
  }
  if (navigator.languages?.length) {
    return [...navigator.languages];
  }
  return navigator.language ? [navigator.language] : [];
}

export const localeStore = createStore<LocaleSnapshot>({
  storageKey: LOCALE_STORAGE_KEY,
  defaults: { chosen: null, preferred: [] },
  load: () => ({
    chosen: parseStoredLocale(localStorage.getItem(LOCALE_STORAGE_KEY)),
    preferred: browserPreferences(),
  }),
  // Detection is never written back, only the explicit choice.
  persist: ({ chosen }) => serializeStoredLocale(chosen),
  syncAcrossTabs: true,
});

// `null` restores automatic browser detection.
export function setLocale(locale: Locale | null) {
  localeStore.update({ chosen: locale });
}

// The active locale. `useMounted` pins it to the default for SSR and the
// first client render so hydration never sees two different languages —
// the same convention `useSkyHour` uses for the palette.
export function useLocale(): Locale {
  const mounted = useMounted();
  const { chosen, preferred } = useSyncExternalStore(
    localeStore.subscribe,
    localeStore.getSnapshot,
    localeStore.getServerSnapshot,
  );

  return resolveLocale({ mounted, stored: chosen, preferred });
}

export { DEFAULT_LOCALE };
