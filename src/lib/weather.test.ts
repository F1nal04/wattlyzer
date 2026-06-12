import { describe, expect, it } from "bun:test";
import type { SettingsData } from "@/lib/settings";
import type { SolarData } from "@/lib/types";
import { forecastWeather } from "@/lib/weather";

const baseSettings: SettingsData = {
  azimut: 180,
  angle: 45,
  kwh: 5, // clear-sky peak = 5 * 1000 * 0.7 = 3500 Wh/h
  minKwh: 1200,
  morningShading: false,
  shadingEndTime: 10,
  eveningShading: false,
  shadingStartTime: 17,
  bestSlotMode: "combined",
  ignoreSolarForBestSlot: false,
};

// Cumulative watthours series producing `rates[h]` Wh in hour h after the
// 0.7 yield factor applied by calculatePowerGeneration (tests run in UTC,
// so the local day used by forecastWeather is the UTC day).
function solarFromHourlyRates(day: string, rates: number[]): SolarData {
  const result: Record<string, number> = {};
  let cumulative = 0;
  for (let h = 0; h < 24; h++) {
    const hh = String(h).padStart(2, "0");
    result[`${day}T${hh}:00:00.000Z`] = cumulative;
    cumulative += (rates[h] ?? 0) / 0.7;
  }
  return {
    result,
    message: {
      code: 0,
      type: "test",
      text: "",
      pid: "",
      info: {
        latitude: 0,
        longitude: 0,
        distance: 0,
        place: "",
        timezone: "UTC",
        time: "",
        time_utc: "",
      },
      ratelimit: { zone: "", period: 0, limit: 0, remaining: 0 },
    },
  };
}

function dayWithPeak(peakWh: number): SolarData {
  const rates = Array.from({ length: 24 }, (_, h) =>
    h >= 10 && h <= 13 ? peakWh : 100,
  );
  return solarFromHourlyRates("2025-01-15", rates);
}

const noon = new Date("2025-01-15T12:00:00.000Z");

describe("forecastWeather", () => {
  it("classifies by the day's peak relative to the system's clear-sky peak", () => {
    // ratios vs the 3500 Wh/h clear-sky peak: 0.8, 0.4, 0.2, 0.057
    expect(forecastWeather(dayWithPeak(2800), baseSettings, noon)).toBe(
      "sunny",
    );
    expect(forecastWeather(dayWithPeak(1400), baseSettings, noon)).toBe(
      "partly",
    );
    expect(forecastWeather(dayWithPeak(700), baseSettings, noon)).toBe(
      "cloudy",
    );
    expect(forecastWeather(dayWithPeak(200), baseSettings, noon)).toBe(
      "overcast",
    );
  });

  it("uses strict thresholds at 0.55 / 0.3 / 0.12", () => {
    // just either side of each boundary (avoiding exact-equality float traps)
    expect(forecastWeather(dayWithPeak(1930), baseSettings, noon)).toBe(
      "sunny",
    ); // 0.5514
    expect(forecastWeather(dayWithPeak(1920), baseSettings, noon)).toBe(
      "partly",
    ); // 0.5486
    expect(forecastWeather(dayWithPeak(1055), baseSettings, noon)).toBe(
      "partly",
    ); // 0.3014
    expect(forecastWeather(dayWithPeak(1045), baseSettings, noon)).toBe(
      "cloudy",
    ); // 0.2986
    expect(forecastWeather(dayWithPeak(425), baseSettings, noon)).toBe(
      "cloudy",
    ); // 0.1214
    expect(forecastWeather(dayWithPeak(415), baseSettings, noon)).toBe(
      "overcast",
    ); // 0.1186
  });

  it("scales the clear-sky reference with system size", () => {
    // 1400 Wh/h is "partly" on a 5 kWp system but a full-blast clear sky on 2 kWp
    const small: SettingsData = { ...baseSettings, kwh: 2 }; // peak = 1400
    expect(forecastWeather(dayWithPeak(1400), small, noon)).toBe("sunny");
  });

  it("ignores roof shading — weather is about the sky, not the roof", () => {
    // peak sits inside the morning-shading window; classification must not change
    const morningPeak = solarFromHourlyRates(
      "2025-01-15",
      Array.from({ length: 24 }, (_, h) => (h === 8 ? 2800 : 100)),
    );
    const shaded: SettingsData = {
      ...baseSettings,
      morningShading: true,
      shadingEndTime: 10,
    };
    expect(forecastWeather(morningPeak, shaded, noon)).toBe("sunny");
  });

  it("only looks at the current local day", () => {
    // sunny peak on the day AFTER `now` must not influence today's classification
    const today = Array.from({ length: 24 }, () => 200);
    const tomorrow = Array.from({ length: 24 }, (_, h) =>
      h >= 10 && h <= 13 ? 2800 : 200,
    );
    const result: Record<string, number> = {
      ...solarFromHourlyRates("2025-01-15", today).result,
    };
    const tomorrowData = solarFromHourlyRates("2025-01-16", tomorrow).result;
    for (const [k, v] of Object.entries(tomorrowData)) {
      result[k] = v;
    }
    const solar = { ...solarFromHourlyRates("2025-01-15", today), result };
    expect(forecastWeather(solar, baseSettings, noon)).toBe("overcast");
  });

  it("defaults to sunny without data or with a zero-size system", () => {
    expect(forecastWeather(null, baseSettings, noon)).toBe("sunny");
    const zeroSystem: SettingsData = { ...baseSettings, kwh: 0 };
    expect(forecastWeather(dayWithPeak(2800), zeroSystem, noon)).toBe("sunny");
  });
});
