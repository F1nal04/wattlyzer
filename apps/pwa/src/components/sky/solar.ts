import type { BestSlotMode } from "@/lib/settings";
import type { MessageKey } from "@/lib/i18n";

export const NOTHING_TO_SCHEDULE = {
  title: "status.nothingToSchedule.title",
  body: "status.nothingToSchedule.body",
} as const satisfies Record<string, MessageKey>;

export function solarPanelsEnabled(mode: BestSlotMode): boolean {
  return mode !== "price-only";
}

export function schedulingSignalsAvailable(
  solarEnabled: boolean,
  dynamicTariff: boolean,
): boolean {
  return solarEnabled || dynamicTariff;
}

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

export function settingsPatchFromSolarConfig(
  next: {
    enabled: boolean;
    azimuth: number;
    tilt: number;
    sizeKw: number;
  },
  currentMode: BestSlotMode,
  dynamicTariff: boolean,
) {
  return {
    azimut: next.azimuth,
    angle: next.tilt,
    kwh: next.sizeKw,
    bestSlotMode: bestSlotModeAfterSolarToggle(
      next.enabled,
      currentMode,
      dynamicTariff,
    ),
  };
}

export function bestSlotModeAfterTariffToggle(
  dynamicTariff: boolean,
  solarEnabled: boolean,
): BestSlotMode {
  return bestSlotModeFromSignals(solarEnabled, dynamicTariff) ?? "price-only";
}

export function isBestSlotModeSelectable(
  option: BestSlotMode,
  solarEnabled: boolean,
  dynamicTariff = true,
): boolean {
  if (option === "combined") return solarEnabled && dynamicTariff;
  if (option === "solar-only") return solarEnabled;
  return dynamicTariff;
}

export function solarSettingsSubtitleKey(
  enabled: boolean,
  dynamicTariff = true,
): MessageKey {
  if (enabled) return "settings.solar.subtitle.on";
  if (!dynamicTariff) return "settings.solar.subtitle.off";
  return "settings.solar.subtitle.priceOnly";
}

export function solarModeUnavailableHintKey(
  solarEnabled: boolean,
  dynamicTariff = true,
): MessageKey | null {
  if (!schedulingSignalsAvailable(solarEnabled, dynamicTariff)) {
    return "mode.hint.noSignals";
  }
  if (!solarEnabled) {
    return "mode.hint.noSolar";
  }
  if (!dynamicTariff) {
    return "mode.hint.noTariff";
  }
  return null;
}
