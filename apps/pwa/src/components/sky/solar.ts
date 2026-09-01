import type { BestSlotMode } from "@/lib/settings";

export function solarPanelsEnabled(mode: BestSlotMode): boolean {
  return mode !== "price-only";
}

export function isBestSlotModeSelectable(
  option: BestSlotMode,
  solarEnabled: boolean,
): boolean {
  if (solarEnabled) return true;
  return option === "price-only";
}

export function solarSettingsSubtitle(enabled: boolean): string {
  return enabled
    ? "Used to estimate production for your roof."
    : "No solar — price-only.";
}

export function solarModeUnavailableHint(solarEnabled: boolean): string | null {
  return solarEnabled
    ? null
    : "Turn on solar panels in Settings to use Solar or Both.";
}
