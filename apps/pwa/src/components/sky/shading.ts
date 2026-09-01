export type ShadingKind = "morning" | "evening";

export type ShadingWindow = {
  enabled: boolean;
  hour: number;
};

export type ShadingSettingsSlice = {
  morningShading: boolean;
  shadingEndTime: number;
  eveningShading: boolean;
  shadingStartTime: number;
};

const RANGES: Record<ShadingKind, { min: number; max: number }> = {
  morning: { min: 5, max: 12 },
  evening: { min: 14, max: 22 },
};

export function shadingRange(kind: ShadingKind): { min: number; max: number } {
  return RANGES[kind];
}

export function formatShadingHour(hour: number): string {
  return `${String(Math.floor(hour)).padStart(2, "0")}:00`;
}

export function shadingHourTicks(min: number, max: number): string[] {
  const tickStep = (max - min) / 4;
  if (Number.isInteger(tickStep)) {
    return Array.from({ length: 5 }, (_, i) => `${min + i * tickStep}:00`);
  }
  return [`${min}:00`, `${max}:00`];
}

export function shadingRowValue(kind: ShadingKind, window: ShadingWindow): string {
  if (!window.enabled) {
    return "Off";
  }
  const hour = formatShadingHour(window.hour);
  return kind === "morning" ? `until ${hour}` : `from ${hour}`;
}

export function shadingSettingsPatch(
  kind: ShadingKind,
  window: ShadingWindow,
): Partial<ShadingSettingsSlice> {
  if (kind === "morning") {
    return {
      morningShading: window.enabled,
      shadingEndTime: window.hour,
    };
  }
  return {
    eveningShading: window.enabled,
    shadingStartTime: window.hour,
  };
}

export function shadingWindowFromSettings(
  kind: ShadingKind,
  settings: ShadingSettingsSlice,
): ShadingWindow {
  if (kind === "morning") {
    return { enabled: settings.morningShading, hour: settings.shadingEndTime };
  }
  return { enabled: settings.eveningShading, hour: settings.shadingStartTime };
}
