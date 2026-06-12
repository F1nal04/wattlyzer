import { useSyncExternalStore } from "react";

export type BestSlotMode = "combined" | "solar-only" | "price-only";

export interface SettingsData {
  azimut: number; // Stored in compass format (0-360)
  angle: number;
  kwh: number;
  minKwh: number; // Minimum kWh requirement in Wh (500-3000)
  morningShading: boolean; // Enable morning shading compensation
  shadingEndTime: number; // Hour when shading ends (0-23)
  eveningShading: boolean; // Enable evening shading compensation
  shadingStartTime: number; // Hour when evening shading starts (0-23)
  bestSlotMode: BestSlotMode; // UI mode for choosing how the best timeslot should be ranked
  ignoreSolarForBestSlot: boolean; // Ignore solar production when calculating best timeslot
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
  bestSlotMode: "combined",
  ignoreSolarForBestSlot: false,
};

const SETTINGS_STORAGE_KEY = "wattlyzer_settings";
const settingsServerSnapshot = defaultSettings;
let cachedSettings = defaultSettings;
let hasLoadedSettings = false;
const listeners = new Set<() => void>();

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

function getSettingsSnapshot(): SettingsData {
  if (typeof window === "undefined") {
    return settingsServerSnapshot;
  }

  if (!hasLoadedSettings) {
    cachedSettings = loadSavedSettings();
    hasLoadedSettings = true;
  }

  return cachedSettings;
}

function getSettingsServerSnapshot(): SettingsData {
  return settingsServerSnapshot;
}

function emitSettingsChange() {
  listeners.forEach((listener) => listener());
}

function subscribeToSettings(listener: () => void) {
  listeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== SETTINGS_STORAGE_KEY) {
      return;
    }

    const nextSettings = loadSavedSettings();
    if (nextSettings !== cachedSettings) {
      cachedSettings = nextSettings;
      emitSettingsChange();
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

export function updateSettings(newSettings: Partial<SettingsData>) {
  const currentSettings = getSettingsSnapshot();
  const updatedSettings = { ...currentSettings, ...newSettings };

  if (newSettings.bestSlotMode !== undefined) {
    updatedSettings.ignoreSolarForBestSlot =
      newSettings.bestSlotMode === "price-only";
  } else if (newSettings.ignoreSolarForBestSlot !== undefined) {
    updatedSettings.bestSlotMode = newSettings.ignoreSolarForBestSlot
      ? "price-only"
      : "combined";
  }

  cachedSettings = updatedSettings;
  hasLoadedSettings = true;
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
  emitSettingsChange();
}

export function useSettings() {
  const settings = useSyncExternalStore(
    subscribeToSettings,
    getSettingsSnapshot,
    getSettingsServerSnapshot,
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
let cachedPrefs = defaultPrefs;
let hasLoadedPrefs = false;
const prefListeners = new Set<() => void>();

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

function getPrefsSnapshot(): PrefsData {
  if (typeof window === "undefined") {
    return defaultPrefs;
  }

  if (!hasLoadedPrefs) {
    cachedPrefs = loadSavedPrefs();
    hasLoadedPrefs = true;
  }

  return cachedPrefs;
}

function subscribeToPrefs(listener: () => void) {
  prefListeners.add(listener);
  return () => {
    prefListeners.delete(listener);
  };
}

export function updatePrefs(newPrefs: Partial<PrefsData>) {
  cachedPrefs = { ...getPrefsSnapshot(), ...newPrefs };
  hasLoadedPrefs = true;
  localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(cachedPrefs));
  prefListeners.forEach((listener) => listener());
}

export function usePrefs() {
  const prefs = useSyncExternalStore(
    subscribeToPrefs,
    getPrefsSnapshot,
    () => defaultPrefs,
  );

  return { prefs, updatePrefs };
}
