import type { BestSlotMode } from "@/lib/settings";

export const NOTHING_TO_SCHEDULE = {
  title: "Nothing to schedule.",
  body: "Wattlyzer needs solar panels or a dynamic tariff. Without either, there is no better window to find.",
} as const;

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

export function bestSlotModeAfterTariffToggle(
  dynamicTariff: boolean,
  solarEnabled: boolean,
): BestSlotMode {
  return bestSlotModeFromSignals(solarEnabled, dynamicTariff) ?? "price-only";
}

export function isBestSlotModeSelectable(
  option: BestSlotMode,
  solarEnabled: boolean,
): boolean {
  if (solarEnabled) return true;
  return option === "price-only";
}

export function solarSettingsSubtitle(
  enabled: boolean,
  dynamicTariff = true,
): string {
  if (enabled) return "Used to estimate production for your roof.";
  if (!dynamicTariff) return "No solar.";
  return "No solar — price-only.";
}

export function solarModeUnavailableHint(
  solarEnabled: boolean,
  dynamicTariff = true,
): string | null {
  if (!schedulingSignalsAvailable(solarEnabled, dynamicTariff)) {
    return "Turn on solar panels or a dynamic tariff in Settings.";
  }
  return solarEnabled
    ? null
    : "Turn on solar panels in Settings to use Solar or Both.";
}
