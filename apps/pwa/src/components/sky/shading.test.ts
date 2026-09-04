import { describe, expect, it } from "bun:test";
import {
  formatShadingHour,
  shadingHourTicks,
  shadingRange,
  shadingRowValue,
  shadingSettingsFromSetup,
  shadingSetupFromSettings,
  shadingSetupSummary,
  shadingWindowFromSettings,
} from "@/components/sky/shading";
import { translatorFor } from "@/lib/i18n";

const en = translatorFor("en");
const de = translatorFor("de");

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
    expect(shadingRowValue("morning", { enabled: false, hour: 10 }, en)).toBe("Off");
    expect(shadingRowValue("evening", { enabled: false, hour: 17 }, en)).toBe("Off");
    expect(shadingRowValue("morning", { enabled: false, hour: 10 }, de)).toBe("Aus");
  });

  it("shows until HH:00 for an enabled morning window", () => {
    expect(shadingRowValue("morning", { enabled: true, hour: 9 }, en)).toBe(
      "until 09:00",
    );
    expect(shadingRowValue("morning", { enabled: true, hour: 9 }, de)).toBe(
      "bis 09:00",
    );
  });

  it("shows from HH:00 for an enabled evening window", () => {
    expect(shadingRowValue("evening", { enabled: true, hour: 18 }, en)).toBe(
      "from 18:00",
    );
    expect(shadingRowValue("evening", { enabled: true, hour: 18 }, de)).toBe(
      "ab 18:00",
    );
  });

  it("keeps the 24h clock in both locales", () => {
    expect(shadingRowValue("evening", { enabled: true, hour: 18 }, de)).toContain(
      "18:00",
    );
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

describe("shadingSetupFromSettings", () => {
  it("reads both windows from settings", () => {
    expect(
      shadingSetupFromSettings({
        morningShading: true,
        shadingEndTime: 8,
        eveningShading: false,
        shadingStartTime: 19,
      }),
    ).toEqual({
      morning: { enabled: true, hour: 8 },
      evening: { enabled: false, hour: 19 },
    });
  });
});

describe("shadingSettingsFromSetup", () => {
  it("writes both windows into the settings slice", () => {
    expect(
      shadingSettingsFromSetup({
        morning: { enabled: true, hour: 8 },
        evening: { enabled: false, hour: 19 },
      }),
    ).toEqual({
      morningShading: true,
      shadingEndTime: 8,
      eveningShading: false,
      shadingStartTime: 19,
    });
  });
});

describe("shadingSetupSummary", () => {
  it("shows Off when both windows are disabled", () => {
    expect(
      shadingSetupSummary(
        {
          morning: { enabled: false, hour: 10 },
          evening: { enabled: false, hour: 17 },
        },
        en,
      ),
    ).toBe("Off");
  });

  it("collapses to the single Off label in German too", () => {
    // Regression guard: the summary used to detect "both off" by comparing
    // the formatted row values against the literal "Off", which silently
    // stopped collapsing as soon as that label was translated.
    expect(
      shadingSetupSummary(
        {
          morning: { enabled: false, hour: 10 },
          evening: { enabled: false, hour: 17 },
        },
        de,
      ),
    ).toBe("Aus");
  });

  it("joins morning and evening row values when either window is on", () => {
    expect(
      shadingSetupSummary(
        {
          morning: { enabled: true, hour: 8 },
          evening: { enabled: false, hour: 17 },
        },
        en,
      ),
    ).toBe("until 08:00 · Off");
    expect(
      shadingSetupSummary(
        {
          morning: { enabled: true, hour: 8 },
          evening: { enabled: true, hour: 19 },
        },
        en,
      ),
    ).toBe("until 08:00 · from 19:00");
    expect(
      shadingSetupSummary(
        {
          morning: { enabled: true, hour: 8 },
          evening: { enabled: true, hour: 19 },
        },
        de,
      ),
    ).toBe("bis 08:00 · ab 19:00");
  });
});
