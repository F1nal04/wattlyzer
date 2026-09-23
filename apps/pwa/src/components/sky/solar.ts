import type { BestSlotMode, SettingsData } from "@/lib/settings";
import type { MessageKey } from "@/lib/i18n";

export const NOTHING_TO_SCHEDULE = {
  title: "status.nothingToSchedule.title",
  body: "status.nothingToSchedule.body",
} as const satisfies Record<string, MessageKey>;

// What the solar-panels sheet edits: presence plus roof geometry.
export type SolarSettings = Pick<
  SettingsData,
  "solarPanels" | "azimut" | "angle" | "kwh"
>;

export function bestSlotModeFromSignals(
  solarEnabled: boolean,
  dynamicTariff: boolean,
): BestSlotMode | null {
  if (!solarEnabled && !dynamicTariff) return null;
  if (!solarEnabled) return "price-only";
  if (!dynamicTariff) return "solar-only";
  return "combined";
}

export function bestSlotModeAfterSolarToggle(
  enabled: boolean,
  currentMode: BestSlotMode,
  dynamicTariff: boolean,
): BestSlotMode {
  if (!enabled) return "price-only";
  if (currentMode !== "price-only") return currentMode;
  return dynamicTariff ? "combined" : "solar-only";
}

export function settingsPatchFromSolar(
  next: SolarSettings,
  current: Pick<SettingsData, "solarPanels" | "bestSlotMode" | "dynamicTariff">,
) {
  return {
    ...next,
    // The modal commits on every slider drag, so most calls here change only
    // the roof geometry. Re-ranking is the panel switch's job alone.
    bestSlotMode:
      next.solarPanels === current.solarPanels
        ? current.bestSlotMode
        : bestSlotModeAfterSolarToggle(
            next.solarPanels,
            current.bestSlotMode,
            current.dynamicTariff,
          ),
  };
}

export function isBestSlotModeSelectable(
  option: BestSlotMode,
  solarEnabled: boolean,
  dynamicTariff: boolean,
): boolean {
  if (option === "combined") return solarEnabled && dynamicTariff;
  if (option === "solar-only") return solarEnabled;
  return dynamicTariff;
}

export function solarSettingsSubtitleKey(
  enabled: boolean,
  dynamicTariff: boolean,
): MessageKey {
  if (enabled) return "settings.solar.subtitle.on";
  if (!dynamicTariff) return "settings.solar.subtitle.off";
  return "settings.solar.subtitle.priceOnly";
}

export function solarModeUnavailableHintKey(
  solarEnabled: boolean,
  dynamicTariff: boolean,
): MessageKey | null {
  if (!solarEnabled && !dynamicTariff) return "mode.hint.noSignals";
  if (!solarEnabled) return "mode.hint.noSolar";
  if (!dynamicTariff) return "mode.hint.noTariff";
  return null;
}
