import { describe, expect, it } from "bun:test";
import {
  bestSlotModeAfterSolarToggle,
  bestSlotModeAfterTariffToggle,
  bestSlotModeFromSignals,
  isBestSlotModeSelectable,
  NOTHING_TO_SCHEDULE,
  schedulingSignalsAvailable,
  settingsPatchFromSolarConfig,
  solarModeUnavailableHintKey,
  solarPanelsEnabled,
  solarSettingsSubtitleKey,
} from "@/components/sky/solar";
import { translatorFor } from "@/lib/i18n";

const en = translatorFor("en");
const de = translatorFor("de");

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
  it("keeps every mode available while panels and a tariff are on", () => {
    expect(isBestSlotModeSelectable("combined", true, true)).toBe(true);
    expect(isBestSlotModeSelectable("solar-only", true, true)).toBe(true);
    expect(isBestSlotModeSelectable("price-only", true, true)).toBe(true);
  });

  it("blocks Solar and Both while panels are off, and leaves Price available", () => {
    expect(isBestSlotModeSelectable("combined", false, true)).toBe(false);
    expect(isBestSlotModeSelectable("solar-only", false, true)).toBe(false);
    expect(isBestSlotModeSelectable("price-only", false, true)).toBe(true);
  });

  it("blocks Both and Price while the tariff is off, and leaves Solar available", () => {
    expect(isBestSlotModeSelectable("combined", true, false)).toBe(false);
    expect(isBestSlotModeSelectable("solar-only", true, false)).toBe(true);
    expect(isBestSlotModeSelectable("price-only", true, false)).toBe(false);
  });
});

describe("solarSettingsSubtitleKey", () => {
  // Keys, not copy: the helper stays language-free and the screen
  // translates it, so the same branch works in English and German.
  it("keeps the roof-setup copy while panels are on", () => {
    expect(solarSettingsSubtitleKey(true)).toBe("settings.solar.subtitle.on");
    expect(en(solarSettingsSubtitleKey(true))).toBe(
      "Used to estimate production for your roof.",
    );
    expect(de(solarSettingsSubtitleKey(true))).toBe(
      "Dient der Ertragsschätzung für dein Dach.",
    );
  });

  it("states the off / price-only status without opening the sheet", () => {
    expect(solarSettingsSubtitleKey(false)).toBe(
      "settings.solar.subtitle.priceOnly",
    );
    expect(en(solarSettingsSubtitleKey(false))).toBe("No solar — price-only.");
    expect(de(solarSettingsSubtitleKey(false))).toBe(
      "Keine Solaranlage — nur Preis.",
    );
  });

  it("does not claim price-only when the tariff is also off", () => {
    expect(solarSettingsSubtitleKey(false, false)).toBe(
      "settings.solar.subtitle.off",
    );
    expect(en(solarSettingsSubtitleKey(false, false))).toBe("No solar.");
  });
});

describe("solarModeUnavailableHintKey", () => {
  it("is silent while panels are on", () => {
    expect(solarModeUnavailableHintKey(true)).toBeNull();
  });

  it("explains how to restore solar-aware modes while panels are off", () => {
    expect(en(solarModeUnavailableHintKey(false)!)).toBe(
      "Turn on solar panels in Settings to use Solar or Both.",
    );
    expect(de(solarModeUnavailableHintKey(false)!)).toBe(
      "Aktiviere die Solaranlage in den Einstellungen, um Solar oder Beides zu nutzen.",
    );
  });

  it("explains how to restore price-aware modes while the tariff is off", () => {
    expect(en(solarModeUnavailableHintKey(true, false)!)).toBe(
      "Turn on a dynamic tariff in Settings to use Both or Price.",
    );
  });

  it("points at Settings when neither signal is on", () => {
    expect(en(solarModeUnavailableHintKey(false, false)!)).toBe(
      "Turn on solar panels or a dynamic tariff in Settings.",
    );
  });
});

describe("NOTHING_TO_SCHEDULE", () => {
  it("says plainly that Wattlyzer cannot pick a window, in both languages", () => {
    expect(en(NOTHING_TO_SCHEDULE.title)).toBe("Nothing to schedule.");
    expect(en(NOTHING_TO_SCHEDULE.body)).toBe(
      "Wattlyzer needs solar panels or a dynamic tariff. Without either, there is no better window to find.",
    );
    expect(de(NOTHING_TO_SCHEDULE.title)).toBe("Nichts zu planen.");
    expect(de(NOTHING_TO_SCHEDULE.body)).toBe(
      "Wattlyzer braucht eine Solaranlage oder einen dynamischen Tarif. Ohne beides gibt es kein besseres Fenster zu finden.",
    );
  });
});

describe("schedulingSignalsAvailable", () => {
  it("is true when solar, tariff, or both are on", () => {
    expect(schedulingSignalsAvailable(true, true)).toBe(true);
    expect(schedulingSignalsAvailable(true, false)).toBe(true);
    expect(schedulingSignalsAvailable(false, true)).toBe(true);
  });

  it("is false when solar panels and dynamic tariff are both off", () => {
    expect(schedulingSignalsAvailable(false, false)).toBe(false);
  });
});

describe("bestSlotModeFromSignals", () => {
  it("maps the valid one-source and combined setups", () => {
    expect(bestSlotModeFromSignals(true, true)).toBe("combined");
    expect(bestSlotModeFromSignals(true, false)).toBe("solar-only");
    expect(bestSlotModeFromSignals(false, true)).toBe("price-only");
  });

  it("does not invent a ranking when both signals are off", () => {
    expect(bestSlotModeFromSignals(false, false)).toBeNull();
  });
});

describe("bestSlotModeAfterSolarToggle", () => {
  it("forces price-only when panels turn off and a tariff remains", () => {
    expect(bestSlotModeAfterSolarToggle(false, "combined", true)).toBe(
      "price-only",
    );
    expect(bestSlotModeAfterSolarToggle(false, "solar-only", true)).toBe(
      "price-only",
    );
  });

  it("still stores price-only when panels turn off with no tariff (empty product)", () => {
    expect(bestSlotModeAfterSolarToggle(false, "solar-only", false)).toBe(
      "price-only",
    );
  });

  it("restores combined when panels turn on from price-only with a tariff", () => {
    expect(bestSlotModeAfterSolarToggle(true, "price-only", true)).toBe(
      "combined",
    );
  });

  it("restores solar-only when panels turn on from the empty-product state", () => {
    expect(bestSlotModeAfterSolarToggle(true, "price-only", false)).toBe(
      "solar-only",
    );
  });

  it("keeps an already solar-aware mode when panels stay on", () => {
    expect(bestSlotModeAfterSolarToggle(true, "solar-only", true)).toBe(
      "solar-only",
    );
    expect(bestSlotModeAfterSolarToggle(true, "combined", true)).toBe(
      "combined",
    );
  });
});

describe("settingsPatchFromSolarConfig", () => {
  const panels = { azimuth: 180, tilt: 45, sizeKw: 5 };

  it("writes price-only as soon as panels turn off from Both or Solar", () => {
    expect(
      settingsPatchFromSolarConfig(
        { ...panels, enabled: false },
        "combined",
        true,
      ).bestSlotMode,
    ).toBe("price-only");
    expect(
      settingsPatchFromSolarConfig(
        { ...panels, enabled: false },
        "solar-only",
        true,
      ).bestSlotMode,
    ).toBe("price-only");
  });

  it("carries roof geometry through with the mode change", () => {
    expect(
      settingsPatchFromSolarConfig(
        { enabled: false, azimuth: 90, tilt: 30, sizeKw: 8.5 },
        "combined",
        true,
      ),
    ).toEqual({
      azimut: 90,
      angle: 30,
      kwh: 8.5,
      bestSlotMode: "price-only",
    });
  });
});

describe("bestSlotModeAfterTariffToggle", () => {
  it("keeps price-only when panels are off and a tariff turns on", () => {
    expect(bestSlotModeAfterTariffToggle(true, false)).toBe("price-only");
  });

  it("stores price-only when the tariff turns off with panels already off", () => {
    expect(bestSlotModeAfterTariffToggle(false, false)).toBe("price-only");
  });

  it("switches to solar-only when the tariff turns off with panels on", () => {
    expect(bestSlotModeAfterTariffToggle(false, true)).toBe("solar-only");
  });

  it("restores combined when a tariff turns on with panels on", () => {
    expect(bestSlotModeAfterTariffToggle(true, true)).toBe("combined");
  });
});
