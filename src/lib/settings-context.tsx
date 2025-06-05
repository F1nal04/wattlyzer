"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SettingsData {
  azimut: number; // Stored in compass format (0-360)
  angle: number;
  kwh: number;
}

interface SettingsContextType {
  settings: SettingsData;
  updateSettings: (newSettings: Partial<SettingsData>) => void;
  getApiAzimut: () => number; // Convert to API format (-180 to 180)
}

const defaultSettings: SettingsData = {
  azimut: 180, // 180° = South in compass format
  angle: 45,
  kwh: 5,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);

  useEffect(() => {
    // Load settings from localStorage on mount
    const savedSettings = localStorage.getItem("wattlyzer-settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error("Failed to parse saved settings:", error);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<SettingsData>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem("wattlyzer-settings", JSON.stringify(updatedSettings));
  };

  // Convert compass azimut (0-360) to API format (-180 to 180)
  const getApiAzimut = () => {
    const compass = settings.azimut;
    // API expects: -180=North, -90=East, 0=South, 90=West, 180=North
    // Compass shows: 0=North, 90=East, 180=South, 270=West, 360=North
    
    // Conversion mapping:
    // Compass 0° (North) -> API -180°
    // Compass 90° (East) -> API -90°
    // Compass 180° (South) -> API 0°
    // Compass 270° (West) -> API 90°
    // Compass 360° (North) -> API -180°
    
    if (compass === 0 || compass === 360) {
      return -180; // North
    } else if (compass <= 180) {
      return compass - 180; // 90->-90, 180->0
    } else {
      return compass - 180; // 270->90, but this gives us the correct West direction
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, getApiAzimut }}>
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