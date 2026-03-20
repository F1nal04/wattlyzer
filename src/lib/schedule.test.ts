import { describe, expect, it } from "vitest";
import type { SettingsData } from "@/lib/settings-context";
import type { MarketData, SlotResult, SolarData } from "@/lib/types";
import {
  calculateMarketPrice,
  calculatePowerGeneration,
  calculateSchedule,
  normalizeToFullHour,
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

/** Cumulative Wh samples each UTC hour on `day` so interpolated hourly rate × 0.7 ≈ `whPerHour`. */
function flatSolarCurve(day: string, whPerHour: number): Record<string, number> {
  const step = whPerHour / 0.7;
  const out: Record<string, number> = {};
  for (let h = 0; h < 24; h++) {
    const hh = String(h).padStart(2, "0");
    out[`${day}T${hh}:00:00.000Z`] = h * step;
  }
  return out;
}

/** Cumulative Wh at each UTC hour; segment (h→h+1) yields ~rates[h] Wh/h after 0.7 yield. */
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

/** Lowest average price over any valid start offset (same rules as calculateSchedule windows). */
function oracleCheapestAvgPrice(
  prices: number[],
  consumerDuration: number,
  searchTimespan: number
) {
  const maxStartHour = Math.min(
    searchTimespan,
    searchTimespan - consumerDuration + 1
  );
  let bestAvg = Infinity;
  let bestH = -1;
  for (let h = 0; h < maxStartHour; h++) {
    let sum = 0;
    let valid = 0;
    for (let i = 0; i < consumerDuration; i++) {
      const idx = h + i;
      if (idx >= 0 && idx < searchTimespan) {
        sum += prices[idx] ?? 0;
        valid++;
      }
    }
    if (valid !== consumerDuration) continue;
    const avg = sum / valid;
    if (avg < bestAvg) {
      bestAvg = avg;
      bestH = h;
    }
  }
  return { bestAvg, bestH };
}

/** Sunniest qualifying slot (combined / solar-only solar branch), before full-hour normalization. */
function oracleBestQualifyingSolar(
  solar: SolarData,
  settings: SettingsData,
  market: MarketData | null,
  now: Date,
  consumerDuration: number,
  searchTimespan: number
) {
  const maxStartHour = Math.min(
    searchTimespan,
    searchTimespan - consumerDuration + 1
  );
  let bestAvg = -Infinity;
  let bestH = -1;
  for (let h = 0; h < maxStartHour; h++) {
    let totalSolar = 0;
    let valid = 0;
    for (let i = 0; i < consumerDuration; i++) {
      const hoursFromNow = h + i;
      if (hoursFromNow >= 0 && hoursFromNow < searchTimespan) {
        totalSolar += calculatePowerGeneration(
          solar,
          settings,
          hoursFromNow,
          now
        );
        valid++;
      }
    }
    if (valid !== consumerDuration) continue;
    const avgSolar = totalSolar / valid;
    if (avgSolar >= settings.minKwh && avgSolar > bestAvg) {
      bestAvg = avgSolar;
      bestH = h;
    }
  }
  return { bestAvg, bestH };
}

/** One market interval per hour from `now`, in order of hoursFromNow 0..n-1 */
function marketHourlyFromNow(
  now: Date,
  prices: number[]
): MarketData {
  const start = now.getTime();
  const data = prices.map((marketprice, i) => {
    const start_timestamp = start + i * 60 * 60 * 1000;
    const end_timestamp = start_timestamp + 60 * 60 * 1000;
    return {
      start_timestamp,
      end_timestamp,
      marketprice,
      unit: "EUR/MWh",
    };
  });
  return { object: "list", data, url: "" };
}

describe("calculateMarketPrice", () => {
  it("returns price for the hour bucket containing now + hoursFromNow", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const market = marketHourlyFromNow(now, [10, 20, 30]);
    expect(calculateMarketPrice(market, 0, now)).toBe(10);
    expect(calculateMarketPrice(market, 1, now)).toBe(20);
    expect(calculateMarketPrice(market, 2, now)).toBe(30);
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
    expect(calculateMarketPrice(market, 0, now)).toBe(0);
  });

  it("returns 0 for null or missing data", () => {
    const now = new Date();
    expect(calculateMarketPrice(null, 0, now)).toBe(0);
    expect(calculateMarketPrice({ object: "list", data: [], url: "" }, 0, now)).toBe(
      0
    );
  });
});

describe("calculatePowerGeneration", () => {
  it("returns 0 for empty solar series", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    expect(
      calculatePowerGeneration(solarWithResult({}), baseSettings, 0, now)
    ).toBe(0);
  });

  it("interpolates between same-day samples and applies 0.7 yield factor", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const solar = solarWithResult({
      "2025-01-15T11:00:00.000Z": 0,
      "2025-01-15T13:00:00.000Z": 2000,
    });
    // (2000 - 0) / 2h * 0.7 = 700 Wh/h
    expect(calculatePowerGeneration(solar, baseSettings, 0, now)).toBeCloseTo(
      700,
      5
    );
  });

  it("applies morning shading when enabled and hour is before shadingEndTime", () => {
    const now = new Date("2025-01-15T08:00:00.000Z");
    const solar = solarWithResult({
      "2025-01-15T07:00:00.000Z": 0,
      "2025-01-15T09:00:00.000Z": 2000,
    });
    const shaded: SettingsData = {
      ...baseSettings,
      morningShading: true,
      shadingEndTime: 10,
    };
    const unshaded = calculatePowerGeneration(
      solar,
      { ...baseSettings, morningShading: false },
      0,
      now
    );
    const shadedVal = calculatePowerGeneration(solar, shaded, 0, now);
    expect(shadedVal).toBeCloseTo(unshaded * 0.5, 5);
  });
});

describe("normalizeToFullHour", () => {
  it("picks next hour when current hour start is already in the past", () => {
    const now = new Date("2025-01-15T12:30:00.000Z");
    const bestTime = new Date("2025-01-15T12:15:00.000Z");
    const bestResult: SlotResult = {
      startTime: bestTime,
      avgSolarProduction: 100,
      avgPrice: 50,
      solarQualifies: true,
    };
    const at12: SlotResult = {
      startTime: new Date("2025-01-15T12:00:00.000Z"),
      avgSolarProduction: 80,
      avgPrice: 40,
      solarQualifies: true,
    };
    const at13: SlotResult = {
      startTime: new Date("2025-01-15T13:00:00.000Z"),
      avgSolarProduction: 200,
      avgPrice: 60,
      solarQualifies: true,
    };
    const out = normalizeToFullHour(
      bestTime,
      bestResult,
      [bestResult, at12, at13],
      "solar",
      now
    );
    expect(out.time.getTime()).toBe(at13.startTime.getTime());
    expect(out.avgSolarProduction).toBe(200);
  });

  it("compares current and next hour by price when metric is price", () => {
    const now = new Date("2025-01-15T11:00:00.000Z");
    const bestTime = new Date("2025-01-15T14:30:00.000Z");
    const bestResult: SlotResult = {
      startTime: bestTime,
      avgSolarProduction: 0,
      avgPrice: 999,
      solarQualifies: false,
    };
    const at14: SlotResult = {
      startTime: new Date("2025-01-15T14:00:00.000Z"),
      avgSolarProduction: 0,
      avgPrice: 100,
      solarQualifies: false,
    };
    const at15: SlotResult = {
      startTime: new Date("2025-01-15T15:00:00.000Z"),
      avgSolarProduction: 0,
      avgPrice: 50,
      solarQualifies: false,
    };
    const out = normalizeToFullHour(
      bestTime,
      bestResult,
      [bestResult, at14, at15],
      "price",
      now
    );
    expect(out.time.getTime()).toBe(at15.startTime.getTime());
    expect(out.avgPrice).toBe(50);
  });
});

describe("calculateSchedule", () => {
  it("returns null when solar or settings missing", () => {
    const now = new Date();
    expect(
      calculateSchedule(null, null, baseSettings, 2, 6, now).schedulingResult
    ).toBeNull();
    expect(
      calculateSchedule(solarWithResult({}), null, undefined, 2, 6, now)
        .schedulingResult
    ).toBeNull();
  });

  it("returns null when market data is required but missing", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const solar = solarWithResult(flatSolarCurve("2025-01-15", 2000));
    const settings: SettingsData = { ...baseSettings, bestSlotMode: "combined" };
    expect(
      calculateSchedule(solar, null, settings, 2, 6, now).schedulingResult
    ).toBeNull();
  });

  it("price-only mode picks the start window with lowest average price", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const solar = solarWithResult(flatSolarCurve("2025-01-15", 500));
    const prices = [200, 100, 300, 50];
    const market = marketHourlyFromNow(now, prices);
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
      now
    );
    expect(schedulingResult?.reason).toBe("price");
    // h=0 avg (200+100)/2=150, h=1 (100+300)/2=200, h=2 (300+50)/2=175 → cheapest h=0
    expect(schedulingResult?.bestTime.getTime()).toBe(now.getTime());
    expect(schedulingResult?.avgPrice).toBeCloseTo(150, 5);
  });

  it("combined mode uses solar when threshold is met", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const solar = solarWithResult(flatSolarCurve("2025-01-15", 2000));
    const market = marketHourlyFromNow(now, [500, 500, 500, 500, 500, 500]);
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
      now
    );
    expect(schedulingResult?.reason).toBe("solar");
    expect(schedulingResult?.avgSolarProduction).toBeGreaterThanOrEqual(1000);
  });

  it("combined mode falls back to price when solar never qualifies", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const solar = solarWithResult(flatSolarCurve("2025-01-15", 100));
    const market = marketHourlyFromNow(now, [80, 200, 200, 200]);
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
      now
    );
    expect(schedulingResult?.reason).toBe("price");
    expect(schedulingResult?.avgPrice).toBeCloseTo(140, 5);
  });

  it("solar-only returns null scheduling when no slot meets minKwh but still returns top slots", () => {
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
      now
    );
    expect(schedulingResult).toBeNull();
    expect(topSlotsResult?.topSolarSlots.length).toBeGreaterThan(0);
    expect(topSlotsResult?.topPriceSlots).toEqual([]);
  });

  it("price-only: picks lowest average over the full run, not the window that merely starts at the cheapest hour", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    // Hour 0 is 1 EUR/MWh but the 3h average is ruined by the next two hours.
    // A later window has a lower triple average (cheap tail).
    const prices = [1, 200, 200, 200, 1, 1, 50, 50];
    const market = marketHourlyFromNow(now, prices);
    const settings: SettingsData = {
      ...baseSettings,
      bestSlotMode: "price-only",
      minKwh: 99999,
    };
    const duration = 3;
    const searchTimespan = prices.length;
    const oracle = oracleCheapestAvgPrice(prices, duration, searchTimespan);
    expect(oracle.bestH).toBe(4);
    expect(oracle.bestAvg).toBeCloseTo((1 + 1 + 50) / 3, 5);

    const solar = solarWithResult(flatSolarCurve("2025-01-15", 500));
    const { schedulingResult, topSlotsResult } = calculateSchedule(
      solar,
      market,
      settings,
      duration,
      searchTimespan,
      now
    );
    expect(schedulingResult?.reason).toBe("price");
    expect(schedulingResult?.avgPrice).toBeCloseTo(oracle.bestAvg, 5);
    expect(schedulingResult?.bestTime.getTime()).toBe(
      now.getTime() + oracle.bestH * 3600_000
    );
    expect(topSlotsResult?.topPriceSlots[0]?.avgPrice).toBeCloseTo(
      oracle.bestAvg,
      5
    );
  });

  it("combined: among qualifying slots, chooses the sunniest window, not an earlier weaker one", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const day = "2025-01-15";
    const rates = Array.from({ length: 24 }, (_, h) =>
      h >= 12 && h <= 15 ? 1600 : h >= 16 && h <= 18 ? 4800 : 1400
    );
    const solar = solarFromHourlyRates(day, rates);
    const market = marketHourlyFromNow(
      now,
      Array.from({ length: 12 }, () => 80)
    );
    const settings: SettingsData = {
      ...baseSettings,
      bestSlotMode: "combined",
      minKwh: 1200,
    };
    const duration = 2;
    const searchTimespan = 10;
    const oracle = oracleBestQualifyingSolar(
      solar,
      settings,
      market,
      now,
      duration,
      searchTimespan
    );
    expect(oracle.bestH).toBe(4);
    expect(oracle.bestAvg).toBeCloseTo(4800, 0);

    const { schedulingResult, topSlotsResult } = calculateSchedule(
      solar,
      market,
      settings,
      duration,
      searchTimespan,
      now
    );
    expect(schedulingResult?.reason).toBe("solar");
    expect(schedulingResult?.avgSolarProduction).toBeCloseTo(oracle.bestAvg, 0);
    const globalMaxSolar = topSlotsResult!.topSolarSlots[0]!.avgSolarProduction;
    expect(globalMaxSolar).toBeCloseTo(oracle.bestAvg, 0);
    expect(schedulingResult?.avgSolarProduction).toBeCloseTo(globalMaxSolar, 0);
  });

  it("solar-only: same — peak production window wins over an earlier qualifying plateau", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const day = "2025-01-15";
    const rates = Array.from({ length: 24 }, (_, h) =>
      h >= 12 && h <= 14 ? 1300 : h >= 15 && h <= 17 ? 5200 : 1200
    );
    const solar = solarFromHourlyRates(day, rates);
    const settings: SettingsData = {
      ...baseSettings,
      bestSlotMode: "solar-only",
      minKwh: 1200,
    };
    const duration = 2;
    const searchTimespan = 10;
    const oracle = oracleBestQualifyingSolar(
      solar,
      settings,
      null,
      now,
      duration,
      searchTimespan
    );
    expect(oracle.bestH).toBe(3);

    const { schedulingResult } = calculateSchedule(
      solar,
      null,
      settings,
      duration,
      searchTimespan,
      now
    );
    expect(schedulingResult?.reason).toBe("solar");
    expect(schedulingResult?.avgSolarProduction).toBeCloseTo(oracle.bestAvg, 0);
  });

  it("topSolarSlots is ordered by avg solar descending across all candidate windows", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const solar = solarFromHourlyRates(
      "2025-01-15",
      Array.from({ length: 24 }, (_, h) => (h === 14 || h === 15 ? 6000 : 1000))
    );
    const market = marketHourlyFromNow(now, [1, 2, 3, 4, 5, 6, 7, 8]);
    const { topSlotsResult } = calculateSchedule(
      solar,
      market,
      { ...baseSettings, bestSlotMode: "combined", minKwh: 500 },
      2,
      8,
      now
    );
    const tops = topSlotsResult!.topSolarSlots;
    expect(tops.length).toBe(3);
    expect(tops[0]!.avgSolarProduction).toBeGreaterThanOrEqual(
      tops[1]!.avgSolarProduction
    );
    expect(tops[1]!.avgSolarProduction).toBeGreaterThanOrEqual(
      tops[2]!.avgSolarProduction
    );
    // Only one window averages the two spike hours (14–15 from midnight index — need mapping)
    // From now=12UTC, hoursFromNow 2 and 3 hit UTC 14 and 15 → start offset h=2.
    expect(tops[0]!.startTime.getUTCHours()).toBe(14);
  });
});
