import type { Translate } from "@/lib/i18n";

export type ShadingKind = "morning" | "evening";

export type ShadingSettingsSlice = {
  morningShading: boolean;
  shadingEndTime: number;
  eveningShading: boolean;
  shadingStartTime: number;
};

// Which settings fields each window edits, and the hours its slider spans.
export const SHADING_FIELDS = {
  morning: { enabled: "morningShading", hour: "shadingEndTime", min: 5, max: 12 },
  evening: { enabled: "eveningShading", hour: "shadingStartTime", min: 14, max: 22 },
} as const satisfies Record<
  ShadingKind,
  { enabled: keyof ShadingSettingsSlice; hour: keyof ShadingSettingsSlice; min: number; max: number }
>;

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
  settings: ShadingSettingsSlice,
  t: Translate,
): string {
  const fields = SHADING_FIELDS[kind];
  if (!settings[fields.enabled]) {
    return t("common.off");
  }
  const hour = formatShadingHour(settings[fields.hour]);
  return t(kind === "morning" ? "shading.until" : "shading.from", { hour });
}

export function shadingSetupSummary(
  settings: ShadingSettingsSlice,
  t: Translate,
): string {
  // Branch on the flags, never on the rendered labels: "Off" is "Aus" in
  // German and a string comparison would stop collapsing the summary.
  if (!settings.morningShading && !settings.eveningShading) {
    return t("common.off");
  }
  return t("shading.summary", {
    morning: shadingRowValue("morning", settings, t),
    evening: shadingRowValue("evening", settings, t),
  });
}
