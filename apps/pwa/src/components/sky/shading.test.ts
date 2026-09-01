import { describe, expect, it } from "bun:test";
import {
  formatShadingHour,
  shadingHourTicks,
  shadingRange,
  shadingRowValue,
  shadingSettingsPatch,
  shadingWindowFromSettings,
} from "@/components/sky/shading";

describe("formatShadingHour", () => {
  it("zero-pads the hour as HH:00", () => {
    expect(formatShadingHour(5)).toBe("05:00");
    expect(formatShadingHour(10)).toBe("10:00");
    expect(formatShadingHour(17)).toBe("17:00");
  });
});

describe("shadingRange", () => {
  it("keeps morning until-hours in the low-sun window", () => {
    expect(shadingRange("morning")).toEqual({ min: 5, max: 12 });
  });

  it("keeps evening from-hours in the late-day window", () => {
    expect(shadingRange("evening")).toEqual({ min: 14, max: 22 });
  });
});

describe("shadingHourTicks", () => {
  it("uses only the ends when the range does not divide into 4 integer steps", () => {
    expect(shadingHourTicks(5, 12)).toEqual(["5:00", "12:00"]);
  });

  it("labels evenly spaced hours when the range divides cleanly", () => {
    expect(shadingHourTicks(14, 22)).toEqual([
      "14:00",
      "16:00",
      "18:00",
      "20:00",
      "22:00",
    ]);
  });
});

describe("shadingRowValue", () => {
  it("shows Off when the window is disabled", () => {
    expect(shadingRowValue("morning", { enabled: false, hour: 10 })).toBe("Off");
    expect(shadingRowValue("evening", { enabled: false, hour: 17 })).toBe("Off");
  });

  it("shows until HH:00 for an enabled morning window", () => {
    expect(shadingRowValue("morning", { enabled: true, hour: 9 })).toBe(
      "until 09:00",
    );
  });

  it("shows from HH:00 for an enabled evening window", () => {
    expect(shadingRowValue("evening", { enabled: true, hour: 18 })).toBe(
      "from 18:00",
    );
  });
});

describe("shadingSettingsPatch", () => {
  it("maps a morning window onto morningShading and shadingEndTime", () => {
    expect(shadingSettingsPatch("morning", { enabled: true, hour: 9 })).toEqual({
      morningShading: true,
      shadingEndTime: 9,
    });
  });

  it("maps an evening window onto eveningShading and shadingStartTime", () => {
    expect(
      shadingSettingsPatch("evening", { enabled: false, hour: 18 }),
    ).toEqual({
      eveningShading: false,
      shadingStartTime: 18,
    });
  });
});

describe("shadingWindowFromSettings", () => {
  const settings = {
    morningShading: true,
    shadingEndTime: 8,
    eveningShading: false,
    shadingStartTime: 19,
  };

  it("reads the morning until-hour from settings", () => {
    expect(shadingWindowFromSettings("morning", settings)).toEqual({
      enabled: true,
      hour: 8,
    });
  });

  it("reads the evening from-hour from settings", () => {
    expect(shadingWindowFromSettings("evening", settings)).toEqual({
      enabled: false,
      hour: 19,
    });
  });
});
