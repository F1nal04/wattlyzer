import { describe, expect, it } from "bun:test";
import {
  SHADING_FIELDS,
  formatShadingHour,
  shadingHourTicks,
  shadingRowValue,
  shadingSetupSummary,
} from "@/components/sky/shading";
import { translatorFor } from "@/lib/i18n";

const en = translatorFor("en");
const de = translatorFor("de");

const shading = (
  morning: [enabled: boolean, hour: number],
  evening: [enabled: boolean, hour: number],
) => ({
  morningShading: morning[0],
  shadingEndTime: morning[1],
  eveningShading: evening[0],
  shadingStartTime: evening[1],
});

describe("formatShadingHour", () => {
  it("zero-pads the hour as HH:00", () => {
    expect(formatShadingHour(5)).toBe("05:00");
    expect(formatShadingHour(10)).toBe("10:00");
    expect(formatShadingHour(17)).toBe("17:00");
  });
});

describe("SHADING_FIELDS", () => {
  it("keeps morning until-hours in the low-sun window", () => {
    expect(SHADING_FIELDS.morning).toMatchObject({ min: 5, max: 12 });
  });

  it("keeps evening from-hours in the late-day window", () => {
    expect(SHADING_FIELDS.evening).toMatchObject({ min: 14, max: 22 });
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
    const off = shading([false, 10], [false, 17]);
    expect(shadingRowValue("morning", off, en)).toBe("Off");
    expect(shadingRowValue("evening", off, en)).toBe("Off");
    expect(shadingRowValue("morning", off, de)).toBe("Aus");
  });

  it("shows until HH:00 for an enabled morning window", () => {
    const on = shading([true, 9], [false, 17]);
    expect(shadingRowValue("morning", on, en)).toBe("until 09:00");
    expect(shadingRowValue("morning", on, de)).toBe("bis 09:00");
  });

  it("shows from HH:00 for an enabled evening window, on the 24h clock", () => {
    const on = shading([false, 10], [true, 18]);
    expect(shadingRowValue("evening", on, en)).toBe("from 18:00");
    expect(shadingRowValue("evening", on, de)).toBe("ab 18:00");
  });
});

describe("shadingSetupSummary", () => {
  it("shows Off when both windows are disabled", () => {
    expect(shadingSetupSummary(shading([false, 10], [false, 17]), en)).toBe("Off");
  });

  it("collapses to the single Off label in German too", () => {
    // Regression guard: the summary used to detect "both off" by comparing
    // the formatted row values against the literal "Off", which silently
    // stopped collapsing as soon as that label was translated.
    expect(shadingSetupSummary(shading([false, 10], [false, 17]), de)).toBe("Aus");
  });

  it("joins morning and evening row values when either window is on", () => {
    expect(shadingSetupSummary(shading([true, 8], [false, 17]), en)).toBe(
      "until 08:00 · Off",
    );
    expect(shadingSetupSummary(shading([true, 8], [true, 19]), en)).toBe(
      "until 08:00 · from 19:00",
    );
    expect(shadingSetupSummary(shading([true, 8], [true, 19]), de)).toBe(
      "bis 08:00 · ab 19:00",
    );
  });
});
