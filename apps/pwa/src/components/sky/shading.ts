import type { MessageKey, Translate } from "@/lib/i18n";

export type ShadingKind = "morning" | "evening";

export type ShadingWindow = {
  enabled: boolean;
  hour: number;
};

export type ShadingSetup = {
  morning: ShadingWindow;
  evening: ShadingWindow;
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

export function shadingRowValue(
  kind: ShadingKind,
  window: ShadingWindow,
  t: Translate,
): string {
  if (!window.enabled) {
    return t("common.off");
  }
  const hour = formatShadingHour(window.hour);
  return t(kind === "morning" ? "shading.until" : "shading.from", { hour });
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

export function shadingSetupFromSettings(
  settings: ShadingSettingsSlice,
): ShadingSetup {
  return {
    morning: shadingWindowFromSettings("morning", settings),
    evening: shadingWindowFromSettings("evening", settings),
  };
}

export function shadingSettingsFromSetup(
  setup: ShadingSetup,
): ShadingSettingsSlice {
  return {
    morningShading: setup.morning.enabled,
    shadingEndTime: setup.morning.hour,
    eveningShading: setup.evening.enabled,
    shadingStartTime: setup.evening.hour,
  };
}

export function shadingSetupSummary(
  setup: ShadingSetup,
  t: Translate,
): string {
  // Branch on the flags, never on the rendered labels: "Off" is "Aus" in
  // German and a string comparison would stop collapsing the summary.
  if (!setup.morning.enabled && !setup.evening.enabled) {
    return t("common.off");
  }
  return t("shading.summary", {
    morning: shadingRowValue("morning", setup.morning, t),
    evening: shadingRowValue("evening", setup.evening, t),
  });
}

// Copy keys for one shading window. Returned as keys so the pure helper
// stays language-free and the component translates at the render edge.
export function shadingCopyKeys(kind: ShadingKind): {
  title: MessageKey;
  subtitle: MessageKey;
  hourLabel: MessageKey;
} {
  if (kind === "morning") {
    return {
      title: "shading.morning.title",
      subtitle: "shading.morning.subtitle",
      hourLabel: "shading.morning.hourLabel",
    };
  }
  return {
    title: "shading.evening.title",
    subtitle: "shading.evening.subtitle",
    hourLabel: "shading.evening.hourLabel",
  };
}
