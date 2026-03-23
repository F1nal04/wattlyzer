import { describe, expect, it } from "vitest";
import type { SettingsData } from "@/lib/settings-context";
import type { MarketData, SolarData } from "@/lib/types";
import {
  calculateMarketPrice,
  calculatePowerGeneration,
  calculateSchedule,
  ceilToUtcHour,
} from "@/lib/schedule";

const baseSettings: SettingsData = {
  azimut: 180,
  angle: 45,
  kwh: 5,
  minKwh: 1200,
  morningShading: false,
  shadingEndTime: 10,
  eveningShading: false,
  shadingStartTime: 17,
  bestSlotMode: "combined",
  ignoreSolarForBestSlot: false,
};

function stubSolarMessage(): SolarData["message"] {
  return {
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
  };
}

function solarWithResult(result: Record<string, number>): SolarData {
  return { result, message: stubSolarMessage() };
}

function flatSolarCurve(
  day: string,
  whPerHour: number,
): Record<string, number> {
  const step = whPerHour / 0.7;
  const out: Record<string, number> = {};
  for (let h = 0; h < 24; h++) {
    const hh = String(h).padStart(2, "0");
    out[`${day}T${hh}:00:00.000Z`] = h * step;
  }
  return out;
}

function solarFromHourlyRates(day: string, rates: number[]): SolarData {
  const out: Record<string, number> = {};
  let cumulative = 0;
  for (let h = 0; h < 24; h++) {
    const hh = String(h).padStart(2, "0");
    out[`${day}T${hh}:00:00.000Z`] = cumulative;
    cumulative += (rates[h] ?? 0) / 0.7;
  }
  return solarWithResult(out);
}

const HOUR_MS = 3600_000;

function marketUtcHourlyFrom(
  anchorUtcHourStart: Date,
  prices: number[],
): MarketData {
  const start = anchorUtcHourStart.getTime();
  const data = prices.map((marketprice, i) => {
    const start_timestamp = start + i * HOUR_MS;
    const end_timestamp = start_timestamp + HOUR_MS;
    return {
      start_timestamp,
      end_timestamp,
      marketprice,
      unit: "EUR/MWh",
    };
  });
  return { object: "list", data, url: "" };
}

function oracleCheapestUtcWindows(
  now: Date,
  market: MarketData,
  consumerDuration: number,
  searchTimespan: number,
) {
  const firstStartMs = ceilToUtcHour(now).getTime();
  const lastSampleMaxMs = now.getTime() + (searchTimespan - 1) * HOUR_MS;
  let bestAvg = Infinity;
  let bestStartMs = -1;
  for (let startMs = firstStartMs; ; startMs += HOUR_MS) {
    const lastSampleMs = startMs + (consumerDuration - 1) * HOUR_MS;
    if (lastSampleMs > lastSampleMaxMs) {
      break;
    }
    let sum = 0;
    for (let i = 0; i < consumerDuration; i++) {
      sum += calculateMarketPrice(market, new Date(startMs + i * HOUR_MS));
    }
    const avg = sum / consumerDuration;
    if (avg < bestAvg) {
      bestAvg = avg;
      bestStartMs = startMs;
    }
  }
  return { bestAvg, bestStartMs };
}

function oracleBestQualifyingSolarUtc(
  solar: SolarData,
  settings: SettingsData,
  now: Date,
  consumerDuration: number,
  searchTimespan: number,
) {
  const firstStartMs = ceilToUtcHour(now).getTime();
  const lastSampleMaxMs = now.getTime() + (searchTimespan - 1) * HOUR_MS;
  let bestAvg = -Infinity;
  let bestStartMs = -1;
  for (let startMs = firstStartMs; ; startMs += HOUR_MS) {
    const lastSampleMs = startMs + (consumerDuration - 1) * HOUR_MS;
    if (lastSampleMs > lastSampleMaxMs) {
      break;
    }
    let totalSolar = 0;
    for (let i = 0; i < consumerDuration; i++) {
      totalSolar += calculatePowerGeneration(
        solar,
        settings,
        new Date(startMs + i * HOUR_MS),
      );
    }
    const avgSolar = totalSolar / consumerDuration;
    if (avgSolar >= settings.minKwh && avgSolar > bestAvg) {
      bestAvg = avgSolar;
      bestStartMs = startMs;
    }
  }
  return { bestAvg, bestStartMs };
}

describe("ceilToUtcHour", () => {
  it("returns same instant when already on UTC hour", () => {
    const d = new Date("2025-01-15T12:00:00.000Z");
    expect(ceilToUtcHour(d).getTime()).toBe(d.getTime());
  });

  it("returns next UTC hour when past the boundary", () => {
    const d = new Date("2025-01-15T12:00:01.000Z");
    expect(ceilToUtcHour(d).toISOString()).toBe("2025-01-15T13:00:00.000Z");
  });
});

describe("calculateMarketPrice", () => {
  it("returns price for the UTC hour bucket containing targetTime", () => {
    const anchor = new Date("2025-01-15T12:00:00.000Z");
    const market = marketUtcHourlyFrom(anchor, [10, 20, 30]);
    expect(
      calculateMarketPrice(market, new Date("2025-01-15T12:30:00.000Z")),
    ).toBe(10);
    expect(
      calculateMarketPrice(market, new Date("2025-01-15T13:00:00.000Z")),
    ).toBe(20);
    expect(
      calculateMarketPrice(market, new Date("2025-01-15T14:59:59.999Z")),
    ).toBe(30);
  });

  it("returns 0 when no interval matches", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const market: MarketData = {
      object: "list",
      url: "",
      data: [
        {
          start_timestamp: now.getTime() - 7200_000,
          end_timestamp: now.getTime() - 3600_000,
          marketprice: 99,
          unit: "EUR/MWh",
        },
      ],
    };
    expect(calculateMarketPrice(market, now)).toBe(0);
  });

  it("returns 0 for null or missing data", () => {
    expect(calculateMarketPrice(null, new Date())).toBe(0);
    expect(
      calculateMarketPrice({ object: "list", data: [], url: "" }, new Date()),
    ).toBe(0);
  });
});

describe("calculatePowerGeneration", () => {
  it("returns 0 for empty solar series", () => {
    const t = new Date("2025-01-15T12:00:00.000Z");
    expect(calculatePowerGeneration(solarWithResult({}), baseSettings, t)).toBe(
      0,
    );
  });

  it("interpolates between same-day samples and applies 0.7 yield factor", () => {
    const solar = solarWithResult({
      "2025-01-15T11:00:00.000Z": 0,
      "2025-01-15T13:00:00.000Z": 2000,
    });
    const t = new Date("2025-01-15T12:00:00.000Z");
    // (2000 - 0) / 2h * 0.7 = 700 Wh/h
    expect(calculatePowerGeneration(solar, baseSettings, t)).toBeCloseTo(
      700,
      5,
    );
  });

  it("applies morning shading when enabled and hour is before shadingEndTime", () => {
    const solar = solarWithResult({
      "2025-01-15T07:00:00.000Z": 0,
      "2025-01-15T09:00:00.000Z": 2000,
    });
    const t = new Date("2025-01-15T08:00:00.000Z");
    const shaded: SettingsData = {
      ...baseSettings,
      morningShading: true,
      shadingEndTime: 10,
    };
    const unshaded = calculatePowerGeneration(
      solar,
      { ...baseSettings, morningShading: false },
      t,
    );
    const shadedVal = calculatePowerGeneration(solar, shaded, t);
    expect(shadedVal).toBeCloseTo(unshaded * 0.5, 5);
  });

  it("does not interpolate across a UTC day boundary", () => {
    const solar = solarWithResult({
      "2025-01-15T23:00:00.000Z": 0,
      "2025-01-16T00:00:00.000Z": 1000,
    });
    const t = new Date("2025-01-15T23:30:00.000Z");
    expect(calculatePowerGeneration(solar, baseSettings, t)).toBe(0);
  });

  it("uses UTC hours for shading boundaries", () => {
    const solar = solarWithResult({
      "2025-01-15T07:00:00.000Z": 0,
      "2025-01-15T09:00:00.000Z": 2000,
      "2025-01-15T16:00:00.000Z": 2000,
      "2025-01-15T18:00:00.000Z": 4000,
    });
    const morningSettings: SettingsData = {
      ...baseSettings,
      morningShading: true,
      shadingEndTime: 9,
    };
    const eveningSettings: SettingsData = {
      ...baseSettings,
      eveningShading: true,
      shadingStartTime: 17,
    };

    const morningBase = calculatePowerGeneration(
      solar,
      baseSettings,
      new Date("2025-01-15T08:00:00.000Z"),
    );
    const morningShaded = calculatePowerGeneration(
      solar,
      morningSettings,
      new Date("2025-01-15T08:00:00.000Z"),
    );
    const eveningBase = calculatePowerGeneration(
      solar,
      baseSettings,
      new Date("2025-01-15T17:00:00.000Z"),
    );
    const eveningShaded = calculatePowerGeneration(
      solar,
      eveningSettings,
      new Date("2025-01-15T17:00:00.000Z"),
    );

    expect(morningShaded).toBeCloseTo(morningBase * 0.5, 5);
    expect(eveningShaded).toBeCloseTo(eveningBase * 0.5, 5);
  });
});

describe("calculateSchedule", () => {
  it("returns null when solar or settings missing", () => {
    const now = new Date();
    expect(
      calculateSchedule(null, null, baseSettings, 2, 6, now).schedulingResult,
    ).toBeNull();
    expect(
      calculateSchedule(solarWithResult({}), null, undefined, 2, 6, now)
        .schedulingResult,
    ).toBeNull();
  });

  it("returns null when market data is required but missing", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const solar = solarWithResult(flatSolarCurve("2025-01-15", 2000));
    const settings: SettingsData = {
      ...baseSettings,
      bestSlotMode: "combined",
    };
    expect(
      calculateSchedule(solar, null, settings, 2, 6, now).schedulingResult,
    ).toBeNull();
  });

  it("solar-only: returns null scheduling when no slot meets minKwh but still returns top slots", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const solar = solarWithResult(flatSolarCurve("2025-01-15", 100));
    const settings: SettingsData = {
      ...baseSettings,
      bestSlotMode: "solar-only",
      minKwh: 99999,
    };
    const { schedulingResult, topSlotsResult } = calculateSchedule(
      solar,
      null,
      settings,
      2,
      4,
      now,
    );
    expect(schedulingResult).toBeNull();
    expect(topSlotsResult?.topSolarSlots.length).toBeGreaterThan(0);
    expect(topSlotsResult?.topPriceSlots).toEqual([]);
  });

  it("solar-only: with duration 3, prefers a sustained plateau over a single strong hour", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const solar = solarFromHourlyRates("2025-01-15", [
      200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 4500, 0,
      2800, 2800, 2800, 200, 200, 200, 200, 200, 200, 200,
    ]);
    const { schedulingResult } = calculateSchedule(
      solar,
      null,
      { ...baseSettings, bestSlotMode: "solar-only", minKwh: 1000 },
      3,
      6,
      now,
    );
    expect(schedulingResult?.reason).toBe("solar");
    expect(schedulingResult?.bestTime.toISOString()).toBe(
      "2025-01-15T14:00:00.000Z",
    );
    expect(schedulingResult?.avgSolarProduction).toBeCloseTo(2800, 5);
  });

  it("solar-only: chooses the peak production window over an earlier qualifying plateau", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const day = "2025-01-15";
    const rates = Array.from({ length: 24 }, (_, h) =>
      h >= 12 && h <= 14 ? 1300 : h >= 15 && h <= 17 ? 5200 : 1200,
    );
    const solar = solarFromHourlyRates(day, rates);
    const settings: SettingsData = {
      ...baseSettings,
      bestSlotMode: "solar-only",
      minKwh: 1200,
    };
    const duration = 2;
    const searchTimespan = 10;
    const oracle = oracleBestQualifyingSolarUtc(
      solar,
      settings,
      now,
      duration,
      searchTimespan,
    );
    expect(oracle.bestStartMs).toBe(
      new Date("2025-01-15T15:00:00.000Z").getTime(),
    );

    const { schedulingResult } = calculateSchedule(
      solar,
      null,
      settings,
      duration,
      searchTimespan,
      now,
    );
    expect(schedulingResult?.reason).toBe("solar");
    expect(schedulingResult?.avgSolarProduction).toBeCloseTo(oracle.bestAvg, 0);
  });

  it("price-only: picks the UTC hour window with the lowest average price", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const solar = solarWithResult(flatSolarCurve("2025-01-15", 500));
    const prices = [200, 100, 300, 50];
    const market = marketUtcHourlyFrom(now, prices);
    const settings: SettingsData = {
      ...baseSettings,
      bestSlotMode: "price-only",
      minKwh: 99999,
    };
    const { schedulingResult } = calculateSchedule(
      solar,
      market,
      settings,
      2,
      4,
      now,
    );
    expect(schedulingResult?.reason).toBe("price");
    expect(schedulingResult?.bestTime.getTime()).toBe(now.getTime());
    expect(schedulingResult?.avgPrice).toBeCloseTo(150, 5);
  });

  it("price-only: with duration 2, prefers two moderately cheap hours over a window containing one extreme cheap hour", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const solar = solarWithResult(flatSolarCurve("2025-01-15", 500));
    const market = marketUtcHourlyFrom(now, [5, 200, 60, 60, 200]);
    const { schedulingResult } = calculateSchedule(
      solar,
      market,
      { ...baseSettings, bestSlotMode: "price-only", minKwh: 99999 },
      2,
      5,
      now,
    );
    expect(schedulingResult?.reason).toBe("price");
    expect(schedulingResult?.bestTime.toISOString()).toBe(
      "2025-01-15T14:00:00.000Z",
    );
    expect(schedulingResult?.avgPrice).toBeCloseTo(60, 5);
  });

  it("price-only: with duration 2, prefers a window anchored by one extreme cheap hour when its average is still best", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const solar = solarWithResult(flatSolarCurve("2025-01-15", 500));
    const market = marketUtcHourlyFrom(now, [1, 21, 15, 15, 50]);
    const { schedulingResult } = calculateSchedule(
      solar,
      market,
      { ...baseSettings, bestSlotMode: "price-only", minKwh: 99999 },
      2,
      5,
      now,
    );
    expect(schedulingResult?.reason).toBe("price");
    expect(schedulingResult?.bestTime.toISOString()).toBe(
      "2025-01-15T12:00:00.000Z",
    );
    expect(schedulingResult?.avgPrice).toBeCloseTo(11, 5);
  });

  it("price-only: breaks ties by keeping the earliest slot", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const solar = solarWithResult(flatSolarCurve("2025-01-15", 500));
    const market = marketUtcHourlyFrom(now, [20, 20, 20, 20]);
    const { schedulingResult } = calculateSchedule(
      solar,
      market,
      { ...baseSettings, bestSlotMode: "price-only", minKwh: 99999 },
      2,
      4,
      now,
    );
    expect(schedulingResult?.bestTime.toISOString()).toBe(
      "2025-01-15T12:00:00.000Z",
    );
    expect(schedulingResult?.avgPrice).toBeCloseTo(20, 5);
  });

  it("price-only: ignores windows with missing market rows instead of treating them as zero-priced", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const solar = solarWithResult(flatSolarCurve("2025-01-15", 500));
    const market = marketUtcHourlyFrom(now, [100, 200, 300, 400]);
    market.data.splice(1, 1);

    const { schedulingResult, topSlotsResult } = calculateSchedule(
      solar,
      market,
      { ...baseSettings, bestSlotMode: "price-only", minKwh: 99999 },
      2,
      4,
      now,
    );

    expect(schedulingResult?.reason).toBe("price");
    expect(schedulingResult?.bestTime.toISOString()).toBe(
      "2025-01-15T14:00:00.000Z",
    );
    expect(schedulingResult?.avgPrice).toBeCloseTo(350, 5);
    expect(topSlotsResult?.topPriceSlots).toHaveLength(1);
  });

  it("price-only: picks the lowest average over the full run, not the window that starts at the cheapest hour", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const prices = [1, 200, 200, 200, 1, 1, 50, 50];
    const market = marketUtcHourlyFrom(now, prices);
    const settings: SettingsData = {
      ...baseSettings,
      bestSlotMode: "price-only",
      minKwh: 99999,
    };
    const duration = 3;
    const searchTimespan = prices.length;
    const oracle = oracleCheapestUtcWindows(
      now,
      market,
      duration,
      searchTimespan,
    );
    expect(oracle.bestStartMs).toBe(now.getTime() + 4 * HOUR_MS);
    expect(oracle.bestAvg).toBeCloseTo((1 + 1 + 50) / 3, 5);

    const solar = solarWithResult(flatSolarCurve("2025-01-15", 500));
    const { schedulingResult, topSlotsResult } = calculateSchedule(
      solar,
      market,
      settings,
      duration,
      searchTimespan,
      now,
    );
    expect(schedulingResult?.reason).toBe("price");
    expect(schedulingResult?.avgPrice).toBeCloseTo(oracle.bestAvg, 5);
    expect(schedulingResult?.bestTime.getTime()).toBe(oracle.bestStartMs);
    expect(topSlotsResult?.topPriceSlots[0]?.avgPrice).toBeCloseTo(
      oracle.bestAvg,
      5,
    );
  });

  it("combined: uses solar when the threshold is met", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const solar = solarWithResult(flatSolarCurve("2025-01-15", 2000));
    const market = marketUtcHourlyFrom(now, [500, 500, 500, 500, 500, 500]);
    const settings: SettingsData = {
      ...baseSettings,
      bestSlotMode: "combined",
      minKwh: 1000,
    };
    const { schedulingResult } = calculateSchedule(
      solar,
      market,
      settings,
      2,
      6,
      now,
    );
    expect(schedulingResult?.reason).toBe("solar");
    expect(schedulingResult?.avgSolarProduction).toBeGreaterThanOrEqual(1000);
  });

  it("combined: prefers the best qualifying average, not the window containing a single large solar spike", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const solar = solarFromHourlyRates("2025-01-15", [
      200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 6000, 0,
      3200, 3200, 200, 200, 200, 200, 200, 200, 200, 200,
    ]);
    const market = marketUtcHourlyFrom(now, [100, 100, 100, 100, 100]);
    const { schedulingResult } = calculateSchedule(
      solar,
      market,
      { ...baseSettings, bestSlotMode: "combined", minKwh: 1000 },
      2,
      5,
      now,
    );
    expect(schedulingResult?.reason).toBe("solar");
    expect(schedulingResult?.bestTime.toISOString()).toBe(
      "2025-01-15T14:00:00.000Z",
    );
    expect(schedulingResult?.avgSolarProduction).toBeCloseTo(3200, 5);
  });

  it("combined: prefers a spike window when it still has the highest qualifying average", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const solar = solarFromHourlyRates("2025-01-15", [
      200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 6000, 2000,
      3200, 3200, 200, 200, 200, 200, 200, 200, 200, 200,
    ]);
    const market = marketUtcHourlyFrom(now, [100, 100, 100, 100, 100]);
    const { schedulingResult } = calculateSchedule(
      solar,
      market,
      { ...baseSettings, bestSlotMode: "combined", minKwh: 1000 },
      2,
      5,
      now,
    );
    expect(schedulingResult?.reason).toBe("solar");
    expect(schedulingResult?.bestTime.toISOString()).toBe(
      "2025-01-15T12:00:00.000Z",
    );
    expect(schedulingResult?.avgSolarProduction).toBeCloseTo(4000, 5);
  });

  it("combined: falls back to price when solar never qualifies", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const solar = solarWithResult(flatSolarCurve("2025-01-15", 100));
    const market = marketUtcHourlyFrom(now, [80, 200, 200, 200]);
    const settings: SettingsData = {
      ...baseSettings,
      bestSlotMode: "combined",
      minKwh: 5000,
    };
    const { schedulingResult } = calculateSchedule(
      solar,
      market,
      settings,
      2,
      4,
      now,
    );
    expect(schedulingResult?.reason).toBe("price");
    expect(schedulingResult?.avgPrice).toBeCloseTo(140, 5);
  });

  it("combined: uses complete price windows when later market rows are missing", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const solar = solarWithResult(flatSolarCurve("2025-01-15", 100));
    const market = marketUtcHourlyFrom(now, [80, 120, 20, 20]);
    market.data.pop();

    const { schedulingResult, topSlotsResult } = calculateSchedule(
      solar,
      market,
      { ...baseSettings, bestSlotMode: "combined", minKwh: 5000 },
      2,
      4,
      now,
    );

    expect(schedulingResult?.reason).toBe("price");
    expect(schedulingResult?.bestTime.toISOString()).toBe(
      "2025-01-15T13:00:00.000Z",
    );
    expect(schedulingResult?.avgPrice).toBeCloseTo(70, 5);
    expect(topSlotsResult?.topPriceSlots).toHaveLength(2);
  });

  it("combined: keeps solar recommendation when price data is missing for that slot", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const solar = solarFromHourlyRates("2025-01-15", [
      200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 1500, 1500,
      2000, 3000, 200, 200, 200, 200, 200, 200, 200, 200,
    ]);
    const market = marketUtcHourlyFrom(now, [100, 100, 100, 100]);
    market.data.pop();

    const { schedulingResult } = calculateSchedule(
      solar,
      market,
      { ...baseSettings, bestSlotMode: "combined", minKwh: 1500 },
      2,
      4,
      now,
    );

    expect(schedulingResult?.reason).toBe("solar");
    expect(schedulingResult?.bestTime.toISOString()).toBe(
      "2025-01-15T14:00:00.000Z",
    );
    expect(schedulingResult?.avgPrice).toBeUndefined();
  });

  it("combined: ignores cheaper non-qualifying windows when a qualifying solar window exists", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const solar = solarFromHourlyRates("2025-01-15", [
      200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 500, 500,
      1600, 1600, 200, 200, 200, 200, 200, 200, 200, 200,
    ]);
    const market = marketUtcHourlyFrom(now, [1, 1, 500, 500, 500]);
    const { schedulingResult } = calculateSchedule(
      solar,
      market,
      { ...baseSettings, bestSlotMode: "combined", minKwh: 1500 },
      2,
      5,
      now,
    );
    expect(schedulingResult?.reason).toBe("solar");
    expect(schedulingResult?.bestTime.toISOString()).toBe(
      "2025-01-15T14:00:00.000Z",
    );
    expect(schedulingResult?.avgPrice).toBeCloseTo(500, 5);
  });

  it("combined: among qualifying slots, chooses the sunniest window, not an earlier weaker one", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const day = "2025-01-15";
    const rates = Array.from({ length: 24 }, (_, h) =>
      h >= 12 && h <= 15 ? 1600 : h >= 16 && h <= 18 ? 4800 : 1400,
    );
    const solar = solarFromHourlyRates(day, rates);
    const market = marketUtcHourlyFrom(
      now,
      Array.from({ length: 12 }, () => 80),
    );
    const settings: SettingsData = {
      ...baseSettings,
      bestSlotMode: "combined",
      minKwh: 1200,
    };
    const duration = 2;
    const searchTimespan = 10;
    const oracle = oracleBestQualifyingSolarUtc(
      solar,
      settings,
      now,
      duration,
      searchTimespan,
    );
    expect(oracle.bestStartMs).toBe(
      new Date("2025-01-15T16:00:00.000Z").getTime(),
    );
    expect(oracle.bestAvg).toBeCloseTo(4800, 0);

    const { schedulingResult, topSlotsResult } = calculateSchedule(
      solar,
      market,
      settings,
      duration,
      searchTimespan,
      now,
    );
    expect(schedulingResult?.reason).toBe("solar");
    expect(schedulingResult?.avgSolarProduction).toBeCloseTo(oracle.bestAvg, 0);
    const globalMaxSolar = topSlotsResult!.topSolarSlots[0]!.avgSolarProduction;
    expect(globalMaxSolar).toBeCloseTo(oracle.bestAvg, 0);
    expect(schedulingResult?.avgSolarProduction).toBeCloseTo(globalMaxSolar, 0);
  });

  it("combined: breaks equal qualifying solar ties by keeping the earliest slot", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const solar = solarFromHourlyRates("2025-01-15", [
      200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 2000, 2000,
      2000, 2000, 200, 200, 200, 200, 200, 200, 200, 200,
    ]);
    const market = marketUtcHourlyFrom(now, [50, 50, 50, 50, 50]);
    const { schedulingResult } = calculateSchedule(
      solar,
      market,
      { ...baseSettings, bestSlotMode: "combined", minKwh: 1500 },
      2,
      5,
      now,
    );
    expect(schedulingResult?.reason).toBe("solar");
    expect(schedulingResult?.bestTime.toISOString()).toBe(
      "2025-01-15T12:00:00.000Z",
    );
    expect(schedulingResult?.avgSolarProduction).toBeCloseTo(2000, 5);
  });

  it("topSolarSlots is ordered by avg solar descending across all candidate windows", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const solar = solarFromHourlyRates(
      "2025-01-15",
      Array.from({ length: 24 }, (_, h) =>
        h === 14 || h === 15 ? 6000 : 1000,
      ),
    );
    const market = marketUtcHourlyFrom(now, [1, 2, 3, 4, 5, 6, 7, 8]);
    const { topSlotsResult } = calculateSchedule(
      solar,
      market,
      { ...baseSettings, bestSlotMode: "combined", minKwh: 500 },
      2,
      8,
      now,
    );
    const tops = topSlotsResult!.topSolarSlots;
    expect(tops.length).toBe(3);
    expect(tops[0]!.avgSolarProduction).toBeGreaterThanOrEqual(
      tops[1]!.avgSolarProduction,
    );
    expect(tops[1]!.avgSolarProduction).toBeGreaterThanOrEqual(
      tops[2]!.avgSolarProduction,
    );
    expect(tops[0]!.startTime.getUTCHours()).toBe(14);
  });

  it("topPriceSlots is ordered by avg price ascending across all candidate windows", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const solar = solarWithResult(flatSolarCurve("2025-01-15", 500));
    const market = marketUtcHourlyFrom(now, [100, 20, 60, 40, 10]);
    const { topSlotsResult } = calculateSchedule(
      solar,
      market,
      { ...baseSettings, bestSlotMode: "price-only", minKwh: 99999 },
      1,
      5,
      now,
    );
    const tops = topSlotsResult!.topPriceSlots;
    expect(tops.length).toBe(3);
    expect(tops[0]!.avgPrice!).toBeLessThanOrEqual(tops[1]!.avgPrice!);
    expect(tops[1]!.avgPrice!).toBeLessThanOrEqual(tops[2]!.avgPrice!);
    expect(tops[0]!.avgPrice!).toBe(10);
  });

  it("first candidate starts at the next UTC hour when now is not on the hour", () => {
    const now = new Date("2025-01-15T12:23:00.000Z");
    const solar = solarWithResult(flatSolarCurve("2025-01-15", 2000));
    const market = marketUtcHourlyFrom(
      new Date("2025-01-15T12:00:00.000Z"),
      [1, 2, 3, 4, 5, 6, 7, 8],
    );
    const { schedulingResult } = calculateSchedule(
      solar,
      market,
      { ...baseSettings, bestSlotMode: "price-only", minKwh: 99999 },
      1,
      4,
      now,
    );
    expect(schedulingResult?.bestTime.toISOString()).toBe(
      "2025-01-15T13:00:00.000Z",
    );
  });

  it("returns null when the search window is shorter than the consumer duration", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const solar = solarWithResult(flatSolarCurve("2025-01-15", 2000));
    const market = marketUtcHourlyFrom(now, [10, 20]);
    const result = calculateSchedule(
      solar,
      market,
      { ...baseSettings, bestSlotMode: "combined" },
      3,
      2,
      now,
    );
    expect(result.schedulingResult).toBeNull();
    expect(result.topSlotsResult).toBeNull();
  });
});
