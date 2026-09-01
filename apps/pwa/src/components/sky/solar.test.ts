import { describe, expect, it } from "bun:test";
import {
  isBestSlotModeSelectable,
  solarModeUnavailableHint,
  solarPanelsEnabled,
  solarSettingsSubtitle,
} from "@/components/sky/solar";

describe("solarPanelsEnabled", () => {
  it("treats price-only as panels off", () => {
    expect(solarPanelsEnabled("price-only")).toBe(false);
  });

  it("treats solar-aware modes as panels on", () => {
    expect(solarPanelsEnabled("combined")).toBe(true);
    expect(solarPanelsEnabled("solar-only")).toBe(true);
  });
});

describe("isBestSlotModeSelectable", () => {
  it("keeps every mode available while panels are on", () => {
    expect(isBestSlotModeSelectable("combined", true)).toBe(true);
    expect(isBestSlotModeSelectable("solar-only", true)).toBe(true);
    expect(isBestSlotModeSelectable("price-only", true)).toBe(true);
  });

  it("blocks Solar and Both while panels are off, and leaves Price available", () => {
    expect(isBestSlotModeSelectable("combined", false)).toBe(false);
    expect(isBestSlotModeSelectable("solar-only", false)).toBe(false);
    expect(isBestSlotModeSelectable("price-only", false)).toBe(true);
  });
});

describe("solarSettingsSubtitle", () => {
  it("keeps the roof-setup copy while panels are on", () => {
    expect(solarSettingsSubtitle(true)).toBe(
      "Used to estimate production for your roof.",
    );
  });

  it("states the off / price-only status without opening the sheet", () => {
    expect(solarSettingsSubtitle(false)).toBe("No solar — price-only.");
  });
});

describe("solarModeUnavailableHint", () => {
  it("is silent while panels are on", () => {
    expect(solarModeUnavailableHint(true)).toBeNull();
  });

  it("explains how to restore solar-aware modes while panels are off", () => {
    expect(solarModeUnavailableHint(false)).toBe(
      "Turn on solar panels in Settings to use Solar or Both.",
    );
  });
});
