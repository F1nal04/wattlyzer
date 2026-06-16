import { describe, expect, it } from "bun:test";
import type { SettingsData } from "@/lib/settings";
import type { SolarData, WeatherData } from "@/lib/types";
import {
  cloudCoverAt,
  cloudCoverToKind,
  conditionToKind,
  forecastWeather,
  weatherAt,
} from "@/lib/weather";

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
  currentTimeSky: false,
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

function brightSky(records: Array<[string, number | null]>): WeatherData {
  return {
    weather: records.map(([timestamp, cloud_cover]) => ({
      timestamp,
      cloud_cover,
    })),
  };
}

// Full BrightSky records including the condition + precipitation fields used
// by the rain/snow/fog classification.
function brightSkyFull(
  records: Array<{
    timestamp: string;
    cloud_cover: number | null;
    condition: string | null;
    precipitation: number | null;
  }>,
): WeatherData {
  return { weather: records };
}

describe("cloudCoverToKind", () => {
  it("maps cloud-cover bands at the 25 / 50 / 85 boundaries", () => {
    expect(cloudCoverToKind(0)).toBe("sunny");
    expect(cloudCoverToKind(25)).toBe("sunny");
    expect(cloudCoverToKind(26)).toBe("partly");
    expect(cloudCoverToKind(50)).toBe("partly");
    expect(cloudCoverToKind(51)).toBe("cloudy");
    expect(cloudCoverToKind(85)).toBe("cloudy");
    expect(cloudCoverToKind(86)).toBe("overcast");
    expect(cloudCoverToKind(100)).toBe("overcast");
  });
});

describe("conditionToKind", () => {
  it("maps wet, falling precipitation to rainy", () => {
    expect(conditionToKind("rain", 0)).toBe("rainy");
    expect(conditionToKind("sleet", 0)).toBe("rainy");
    expect(conditionToKind("hail", 0)).toBe("rainy");
    expect(conditionToKind("thunderstorm", 0)).toBe("rainy");
  });

  it("maps snow to snowy and fog to foggy", () => {
    expect(conditionToKind("snow", 0)).toBe("snowy");
    expect(conditionToKind("fog", 0)).toBe("foggy");
  });

  it("returns null for dry / unknown / absent labels so cloud cover decides", () => {
    expect(conditionToKind("dry", 0)).toBe(null);
    expect(conditionToKind("future-dwd-code", 0)).toBe(null);
    expect(conditionToKind(null, 0)).toBe(null);
    expect(conditionToKind(undefined, undefined)).toBe(null);
  });

  it("treats measured precipitation as rain when the label is missing", () => {
    expect(conditionToKind(null, 0.4)).toBe("rainy");
    expect(conditionToKind(undefined, 2)).toBe("rainy");
    expect(conditionToKind(null, 0)).toBe(null);
  });
});

describe("cloudCoverAt", () => {
  it("picks the hourly record covering the given moment", () => {
    const data = brightSky([
      ["2025-01-15T11:00:00+00:00", 10],
      ["2025-01-15T12:00:00+00:00", 95],
      ["2025-01-15T13:00:00+00:00", 20],
    ]);
    // 12:42 falls inside the 12:00 record, not the nearest (13:00)
    expect(cloudCoverAt(data, new Date("2025-01-15T12:42:00.000Z"))).toBe(95);
  });

  it("matches timestamps with non-UTC offsets", () => {
    // 13:00+01:00 is 12:00 UTC
    const data = brightSky([["2025-01-15T13:00:00+01:00", 60]]);
    expect(cloudCoverAt(data, new Date("2025-01-15T12:30:00.000Z"))).toBe(60);
  });

  it("returns null without data or a record for that hour", () => {
    expect(cloudCoverAt(null, noon)).toBe(null);
    const otherHour = brightSky([["2025-01-15T09:00:00+00:00", 50]]);
    expect(cloudCoverAt(otherHour, noon)).toBe(null);
  });
});

describe("weatherAt", () => {
  it("uses real cloud cover when a record covers the moment", () => {
    const data = brightSky([["2025-01-15T12:00:00+00:00", 100]]);
    // The solar forecast says sunny — measured cloud cover must win
    expect(weatherAt(data, dayWithPeak(2800), baseSettings, noon)).toBe(
      "overcast",
    );
  });

  it("falls back to the solar heuristic without weather data", () => {
    expect(weatherAt(null, dayWithPeak(2800), baseSettings, noon)).toBe(
      "sunny",
    );
    expect(weatherAt(null, dayWithPeak(200), baseSettings, noon)).toBe(
      "overcast",
    );
  });

  it("falls back when the hour is missing or its cloud cover is null", () => {
    const wrongHour = brightSky([["2025-01-15T09:00:00+00:00", 100]]);
    expect(weatherAt(wrongHour, dayWithPeak(2800), baseSettings, noon)).toBe(
      "sunny",
    );
    // overcast fallback proves the heuristic is consulted — a broken null
    // check would coerce null cover to 0% and report sunny
    const nullCover = brightSky([["2025-01-15T12:00:00+00:00", null]]);
    expect(weatherAt(nullCover, dayWithPeak(200), baseSettings, noon)).toBe(
      "overcast",
    );
  });

  it("lets the precipitation condition win over the cloud-cover band", () => {
    // clear-ish sky (40%) but it's raining — rain must take precedence
    const data = brightSkyFull([
      {
        timestamp: "2025-01-15T12:00:00+00:00",
        cloud_cover: 40,
        condition: "rain",
        precipitation: 1.2,
      },
    ]);
    expect(weatherAt(data, dayWithPeak(2800), baseSettings, noon)).toBe("rainy");
  });

  it("classifies snow and fog from the condition", () => {
    const snowy = brightSkyFull([
      {
        timestamp: "2025-01-15T12:00:00+00:00",
        cloud_cover: 90,
        condition: "snow",
        precipitation: 0.5,
      },
    ]);
    const foggy = brightSkyFull([
      {
        timestamp: "2025-01-15T12:00:00+00:00",
        cloud_cover: 90,
        condition: "fog",
        precipitation: 0,
      },
    ]);
    expect(weatherAt(snowy, dayWithPeak(2800), baseSettings, noon)).toBe(
      "snowy",
    );
    expect(weatherAt(foggy, dayWithPeak(2800), baseSettings, noon)).toBe(
      "foggy",
    );
  });

  it("falls back to the cloud-cover band when the condition is dry", () => {
    const data = brightSkyFull([
      {
        timestamp: "2025-01-15T12:00:00+00:00",
        cloud_cover: 90,
        condition: "dry",
        precipitation: 0,
      },
    ]);
    expect(weatherAt(data, dayWithPeak(2800), baseSettings, noon)).toBe(
      "overcast",
    );
  });

  it("uses measured precipitation when the condition label is missing", () => {
    const data = brightSkyFull([
      {
        timestamp: "2025-01-15T12:00:00+00:00",
        cloud_cover: 10,
        condition: null,
        precipitation: 0.3,
      },
    ]);
    expect(weatherAt(data, dayWithPeak(2800), baseSettings, noon)).toBe("rainy");
  });
});
