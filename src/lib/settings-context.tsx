"use client";

import React, { createContext, useContext, useSyncExternalStore } from "react";

export interface SettingsData {
  azimut: number; // Stored in compass format (0-360)
  angle: number;
  kwh: number;
  minKwh: number; // Minimum kWh requirement in Wh (500-3000)
  morningShading: boolean; // Enable morning shading compensation
  shadingEndTime: number; // Hour when shading ends (0-23)
  eveningShading: boolean; // Enable evening shading compensation
  shadingStartTime: number; // Hour when evening shading starts (0-23)
  ignoreSolarForBestSlot: boolean; // Ignore solar production when calculating best timeslot
}

interface SettingsContextType {
  settings: SettingsData;
  updateSettings: (newSettings: Partial<SettingsData>) => void;
}

const defaultSettings: SettingsData = {
  azimut: 180, // 180° = South in compass format
  angle: 45,
  kwh: 5,
  minKwh: 1200, // 1.2 kWh = 1200 Wh
  morningShading: false, // Morning shading compensation disabled by default
  shadingEndTime: 10, // Shading ends at 10:00 AM by default
  eveningShading: false, // Evening shading compensation disabled by default
  shadingStartTime: 17, // Shading starts at 17:00 by default
  ignoreSolarForBestSlot: false, // Don't ignore solar by default
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

const SETTINGS_STORAGE_KEY = "wattlyzer_settings";
const settingsServerSnapshot = defaultSettings;
let cachedSettings = defaultSettings;
let hasLoadedSettings = false;
const listeners = new Set<() => void>();

function loadSavedSettings() {
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

    return {
      ...defaultSettings,
      ...rest,
      ...(betaCalculations !== undefined
        ? { morningShading: betaCalculations }
        : {}),
    };
  } catch (error) {
    console.error("Failed to parse saved settings:", error);
    return defaultSettings;
  }
}

function getSettingsSnapshot() {
  if (typeof window === "undefined") {
    return settingsServerSnapshot;
  }

  if (!hasLoadedSettings) {
    cachedSettings = loadSavedSettings();
    hasLoadedSettings = true;
  }

  return cachedSettings;
}

function getSettingsServerSnapshot() {
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

function updateSettingsStore(newSettings: Partial<SettingsData>) {
  const currentSettings = getSettingsSnapshot();
  const updatedSettings = { ...currentSettings, ...newSettings };
  cachedSettings = updatedSettings;
  hasLoadedSettings = true;
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
  emitSettingsChange();
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const settings = useSyncExternalStore(
    subscribeToSettings,
    getSettingsSnapshot,
    getSettingsServerSnapshot
  );

  const updateSettings = (newSettings: Partial<SettingsData>) => {
    updateSettingsStore(newSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
