import { useSyncExternalStore } from "react";
import type {
  BestSlotMode,
  SchedulingSettings,
} from "@wattlyzer/core";

export type { BestSlotMode } from "@wattlyzer/core";

interface StoreOptions<T> {
  storageKey: string;
  defaults: T;
  load: () => T;
  // Apply derived fields before persisting (e.g. keep two flags in sync)
  transform?: (next: T, patch: Partial<T>) => T;
  // Reflect cross-tab writes to storageKey back into the store
  syncAcrossTabs?: boolean;
}

interface Store<T> {
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  subscribe: (listener: () => void) => () => void;
  update: (patch: Partial<T>) => void;
}

function createStore<T extends object>(options: StoreOptions<T>): Store<T> {
  const { storageKey, defaults, load, transform, syncAcrossTabs } = options;
  const listeners = new Set<() => void>();
  let cached = defaults;
  let hasLoaded = false;

  function getSnapshot(): T {
    if (typeof window === "undefined") {
      return defaults;
    }

    if (!hasLoaded) {
      cached = load();
      hasLoaded = true;
    }

    return cached;
  }

  function emit() {
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) {
        return;
      }

      const next = load();
      if (next !== cached) {
        cached = next;
        emit();
      }
    };

    if (syncAcrossTabs) {
      window.addEventListener("storage", handleStorage);
    }

    return () => {
      listeners.delete(listener);
      if (syncAcrossTabs) {
        window.removeEventListener("storage", handleStorage);
      }
    };
  }

  function update(patch: Partial<T>) {
    const next = { ...getSnapshot(), ...patch };
    cached = transform ? transform(next, patch) : next;
    hasLoaded = true;
    localStorage.setItem(storageKey, JSON.stringify(cached));
    emit();
  }

  return {
    getSnapshot,
    getServerSnapshot: () => defaults,
    subscribe,
    update,
  };
}

export interface SettingsData {
  azimut: number; // Stored in compass format (0-360)
  angle: number;
  kwh: number;
  minKwh: number; // Minimum kWh requirement in Wh (500-3000)
  morningShading: boolean; // Enable morning shading compensation
  shadingEndTime: number; // Hour when shading ends (0-23)
  eveningShading: boolean; // Enable evening shading compensation
  shadingStartTime: number; // Hour when evening shading starts (0-23)
  solarPanels: boolean; // The roof has panels. Independent of bestSlotMode:
                        // ranking by price only is a scheduling choice, not
                        // a statement that the panels are gone.
  bestSlotMode: BestSlotMode; // UI mode for choosing how the best timeslot should be ranked
  ignoreSolarForBestSlot: boolean; // Ignore solar production when calculating best timeslot
  dynamicTariff: boolean; // Hourly spot price is available (e.g. Tibber, aWATTar)
  currentTimeSky: boolean; // UI "Dark mode": derive the sky palette from the
                           // current local hour instead of the recommended slot
}

export function toSchedulingSettings(
  settings: SettingsData,
): SchedulingSettings {
  return {
    kwh: settings.kwh,
    minKwh: settings.minKwh,
    morningShading: settings.morningShading,
    shadingEndTime: settings.shadingEndTime,
    eveningShading: settings.eveningShading,
    shadingStartTime: settings.shadingStartTime,
    bestSlotMode: settings.bestSlotMode,
  };
}

const defaultSettings: SettingsData = {
  azimut: 180, // 180° = South in compass format
  angle: 45,
  kwh: 5,
  minKwh: 1200, // 1.2 kWh = 1200 Wh
  morningShading: false,
  shadingEndTime: 10,
  eveningShading: false,
  shadingStartTime: 17,
  solarPanels: true,
  bestSlotMode: "combined",
  ignoreSolarForBestSlot: false,
  dynamicTariff: true,
  currentTimeSky: false,
};

const SETTINGS_STORAGE_KEY = "wattlyzer_settings";

function loadSavedSettings(): SettingsData {
  if (typeof window === "undefined") {
    return defaultSettings;
  }

  const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!savedSettings) {
    return defaultSettings;
  }

  try {
    const parsed = JSON.parse(savedSettings) as Partial<SettingsData> & {
      betaCalculations?: boolean;
    };
    const { betaCalculations, ...rest } = parsed;
    const bestSlotMode =
      parsed.bestSlotMode ??
      (parsed.ignoreSolarForBestSlot ? "price-only" : "combined");

    return {
      ...defaultSettings,
      ...rest,
      bestSlotMode,
      // Before solarPanels existed, panel presence was read off the mode.
      // A stored flag wins; otherwise keep showing what the old UI showed.
      solarPanels: parsed.solarPanels ?? bestSlotMode !== "price-only",
      ignoreSolarForBestSlot: bestSlotMode === "price-only",
      ...(betaCalculations !== undefined
        ? { morningShading: betaCalculations }
        : {}),
    };
  } catch (error) {
    console.error("Failed to parse saved settings:", error);
    return defaultSettings;
  }
}

const settingsStore = createStore<SettingsData>({
  storageKey: SETTINGS_STORAGE_KEY,
  defaults: defaultSettings,
  load: loadSavedSettings,
  syncAcrossTabs: true,
  transform: (next, patch) => {
    if (patch.bestSlotMode !== undefined) {
      next.ignoreSolarForBestSlot = patch.bestSlotMode === "price-only";
    } else if (patch.ignoreSolarForBestSlot !== undefined) {
      next.bestSlotMode = patch.ignoreSolarForBestSlot
        ? "price-only"
        : "combined";
    }
    return next;
  },
});

export function updateSettings(newSettings: Partial<SettingsData>) {
  settingsStore.update(newSettings);
}

export function useSettings() {
  const settings = useSyncExternalStore(
    settingsStore.subscribe,
    settingsStore.getSnapshot,
    settingsStore.getServerSnapshot,
  );

  return { settings, updateSettings };
}

// ─────────────────────────────────────────────────────────────
// Per-use preferences (duration, search window) + onboarding flag
// ─────────────────────────────────────────────────────────────

export type SearchWindow = "3" | "6" | "12" | "24" | "eod";

export interface PrefsData {
  duration: number; // consumer duration in hours (1-5)
  searchWindow: SearchWindow;
  onboarded: boolean;
}

const defaultPrefs: PrefsData = {
  duration: 3,
  searchWindow: "24",
  onboarded: false,
};

const PREFS_STORAGE_KEY = "wattlyzer_prefs";

function loadSavedPrefs(): PrefsData {
  if (typeof window === "undefined") {
    return defaultPrefs;
  }

  const saved = localStorage.getItem(PREFS_STORAGE_KEY);
  if (!saved) {
    return defaultPrefs;
  }

  try {
    return { ...defaultPrefs, ...(JSON.parse(saved) as Partial<PrefsData>) };
  } catch {
    return defaultPrefs;
  }
}

const prefsStore = createStore<PrefsData>({
  storageKey: PREFS_STORAGE_KEY,
  defaults: defaultPrefs,
  load: loadSavedPrefs,
});

export function updatePrefs(newPrefs: Partial<PrefsData>) {
  prefsStore.update(newPrefs);
}

export function usePrefs() {
  const prefs = useSyncExternalStore(
    prefsStore.subscribe,
    prefsStore.getSnapshot,
    prefsStore.getServerSnapshot,
  );

  return { prefs, updatePrefs };
}
