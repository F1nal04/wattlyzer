import { useSyncExternalStore } from "react";
import {
  DEFAULT_LOCALE,
  isLocale,
  resolveLocale,
  type Locale,
} from "@wattlyzer/i18n";
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

const serverSnapshot: LocaleSnapshot = { chosen: null, preferred: [] };

const listeners = new Set<() => void>();
let cached: LocaleSnapshot = serverSnapshot;
let hasLoaded = false;

function load(): LocaleSnapshot {
  return {
    chosen: parseStoredLocale(localStorage.getItem(LOCALE_STORAGE_KEY)),
    preferred: browserPreferences(),
  };
}

export function getLocaleSnapshot(): LocaleSnapshot {
  if (typeof window === "undefined") {
    return serverSnapshot;
  }

  if (!hasLoaded) {
    cached = load();
    hasLoaded = true;
  }

  return cached;
}

export function getLocaleServerSnapshot(): LocaleSnapshot {
  return serverSnapshot;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== LOCALE_STORAGE_KEY) {
      return;
    }
    cached = load();
    emit();
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

// `null` restores automatic browser detection.
export function setLocale(locale: Locale | null) {
  cached = { ...getLocaleSnapshot(), chosen: locale };
  hasLoaded = true;
  localStorage.setItem(LOCALE_STORAGE_KEY, serializeStoredLocale(locale));
  emit();
}

// The active locale. `useMounted` pins it to the default for SSR and the
// first client render so hydration never sees two different languages —
// the same convention `useSkyHour` uses for the palette.
export function useLocale(): Locale {
  const mounted = useMounted();
  const snapshot = useSyncExternalStore(
    subscribe,
    getLocaleSnapshot,
    getLocaleServerSnapshot,
  );

  return resolveLocale({
    mounted,
    stored: snapshot.chosen,
    preferred: snapshot.preferred,
  });
}

// The persisted choice, or `null` while detection is in charge. Drives the
// switcher's selected state without collapsing "auto" into the resolved value.
export function useChosenLocale(): Locale | null {
  const snapshot = useSyncExternalStore(
    subscribe,
    getLocaleSnapshot,
    getLocaleServerSnapshot,
  );
  return snapshot.chosen;
}

export { DEFAULT_LOCALE };
