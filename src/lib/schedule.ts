import type { SettingsData } from "@/lib/settings-context";
import type {
  MarketData,
  SchedulingResult,
  SlotResult,
  SolarData,
  TopSlotsResult,
} from "@/lib/types";

const HOUR_MS = 60 * 60 * 1000;

function startOfUtcHour(d: Date): Date {
  return new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      d.getUTCHours(),
      0,
      0,
      0,
    ),
  );
}

export function ceilToUtcHour(d: Date): Date {
  const floor = startOfUtcHour(d);
  return d.getTime() > floor.getTime()
    ? new Date(floor.getTime() + HOUR_MS)
    : floor;
}

export function calculatePowerGeneration(
  solarData: SolarData,
  settings: SettingsData,
  targetTime: Date,
) {
  const timestamps = Object.keys(solarData.result)
    .map((ts) => ({
      timestamp: new Date(ts).getTime(),
      value: solarData.result[ts],
      utcDateKey: new Date(ts).toISOString().slice(0, 10),
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  if (timestamps.length === 0) {
    return 0;
  }

  let closestBeforeIndex = -1;
  let closestAfterIndex = -1;

  for (let i = 0; i < timestamps.length; i++) {
    if (timestamps[i].timestamp <= targetTime.getTime()) {
      closestBeforeIndex = i;
    }

    if (
      timestamps[i].timestamp > targetTime.getTime() &&
      closestAfterIndex === -1
    ) {
      closestAfterIndex = i;
      break;
    }
  }

  if (closestBeforeIndex === -1) {
    return 0;
  }

  let nextIndex = closestAfterIndex;
  if (nextIndex === -1) {
    for (let i = closestBeforeIndex + 1; i < timestamps.length; i++) {
      if (
        timestamps[i].utcDateKey === timestamps[closestBeforeIndex].utcDateKey
      ) {
        nextIndex = i;
        break;
      }
    }
  }

  if (nextIndex === -1 || nextIndex <= closestBeforeIndex) {
    return 0;
  }

  if (
    timestamps[closestBeforeIndex].utcDateKey !==
    timestamps[nextIndex].utcDateKey
  ) {
    return 0;
  }

  const startValue = timestamps[closestBeforeIndex].value;
  const endValue = timestamps[nextIndex].value;
  const timeDiffHours =
    (timestamps[nextIndex].timestamp -
      timestamps[closestBeforeIndex].timestamp) /
    (1000 * 60 * 60);

  let hourlyProduction = Math.max(0, (endValue - startValue) / timeDiffHours);
  hourlyProduction *= 0.7;

  if (
    settings.morningShading &&
    targetTime.getUTCHours() < settings.shadingEndTime
  ) {
    hourlyProduction *= 0.5;
  }

  if (
    settings.eveningShading &&
    targetTime.getUTCHours() >= settings.shadingStartTime
  ) {
    hourlyProduction *= 0.5;
  }

  return hourlyProduction;
}

export function calculateMarketPrice(
  marketData: MarketData | null,
  targetTime: Date,
) {
  if (!marketData?.data) {
    return 0;
  }

  const targetTimestamp = targetTime.getTime();

  const priceData = marketData.data.find(
    (item) =>
      targetTimestamp >= item.start_timestamp &&
      targetTimestamp < item.end_timestamp,
  );

  return priceData ? priceData.marketprice : 0;
}

export function calculateSchedule(
  solarData: SolarData | null,
  marketData: MarketData | null,
  settings: SettingsData | undefined,
  consumerDuration: number,
  searchTimespan: number,
  now: Date,
): {
  schedulingResult: SchedulingResult | null;
  topSlotsResult: TopSlotsResult | null;
} {
  if (!solarData || !settings) {
    return { schedulingResult: null, topSlotsResult: null };
  }

  const needsMarketData = settings.bestSlotMode !== "solar-only";

  if (needsMarketData && !marketData) {
    return { schedulingResult: null, topSlotsResult: null };
  }

  const results: SlotResult[] = [];

  // Align with hourly solar keys (…Z) and [start,end) market rows on the UTC grid.
  const firstStartMs = ceilToUtcHour(now).getTime();
  const lastSampleMaxMs = now.getTime() + (searchTimespan - 1) * HOUR_MS;

  for (let startMs = firstStartMs; ; startMs += HOUR_MS) {
    const lastSampleMs = startMs + (consumerDuration - 1) * HOUR_MS;
    if (lastSampleMs > lastSampleMaxMs) {
      break;
    }

    let totalSolarProduction = 0;
    let totalPrice = 0;

    for (let i = 0; i < consumerDuration; i++) {
      const targetTime = new Date(startMs + i * HOUR_MS);
      totalSolarProduction += calculatePowerGeneration(
        solarData,
        settings,
        targetTime,
      );
      totalPrice += calculateMarketPrice(marketData, targetTime);
    }

    const avgSolarProduction = totalSolarProduction / consumerDuration;
    const avgPrice = totalPrice / consumerDuration;
    const solarQualifies = avgSolarProduction >= settings.minKwh;

    results.push({
      startTime: new Date(startMs),
      avgSolarProduction,
      avgPrice,
      solarQualifies,
    });
  }

  if (results.length === 0) {
    return { schedulingResult: null, topSlotsResult: null };
  }

  const topSolarSlots = [...results]
    .sort((a, b) => b.avgSolarProduction - a.avgSolarProduction)
    .slice(0, 3)
    .map((slot) => ({
      startTime: slot.startTime,
      avgSolarProduction: slot.avgSolarProduction,
      avgPrice: slot.avgPrice,
      solarQualifies: slot.solarQualifies,
    }));

  const topPriceSlots = [...results]
    .sort((a, b) => a.avgPrice - b.avgPrice)
    .slice(0, 3)
    .map((slot) => ({
      startTime: slot.startTime,
      avgSolarProduction: slot.avgSolarProduction,
      avgPrice: slot.avgPrice,
      solarQualifies: slot.solarQualifies,
    }));

  const topSlotsResult: TopSlotsResult = {
    topSolarSlots,
    topPriceSlots: needsMarketData ? topPriceSlots : [],
  };

  if (settings.bestSlotMode === "price-only") {
    const cheapest = results.reduce((best, current) =>
      current.avgPrice < best.avgPrice ? current : best,
    );

    return {
      schedulingResult: {
        bestTime: cheapest.startTime,
        reason: "price" as const,
        avgSolarProduction: cheapest.avgSolarProduction,
        avgPrice: cheapest.avgPrice,
      },
      topSlotsResult,
    };
  }

  if (settings.bestSlotMode === "solar-only") {
    const solarQualifiedSlots = results.filter(
      (result) => result.solarQualifies,
    );

    if (solarQualifiedSlots.length === 0) {
      return {
        schedulingResult: null,
        topSlotsResult,
      };
    }

    const sunniest = solarQualifiedSlots.reduce((best, current) =>
      current.avgSolarProduction > best.avgSolarProduction ? current : best,
    );

    return {
      schedulingResult: {
        bestTime: sunniest.startTime,
        reason: "solar" as const,
        avgSolarProduction: sunniest.avgSolarProduction,
      },
      topSlotsResult,
    };
  }

  const solarQualifiedSlots = results.filter((result) => result.solarQualifies);

  if (solarQualifiedSlots.length > 0) {
    const best = solarQualifiedSlots.reduce((best, current) =>
      current.avgSolarProduction > best.avgSolarProduction ? current : best,
    );

    return {
      schedulingResult: {
        bestTime: best.startTime,
        reason: "solar" as const,
        avgSolarProduction: best.avgSolarProduction,
        avgPrice: best.avgPrice,
      },
      topSlotsResult,
    };
  }

  const cheapest = results.reduce((best, current) =>
    current.avgPrice < best.avgPrice ? current : best,
  );

  return {
    schedulingResult: {
      bestTime: cheapest.startTime,
      reason: "price" as const,
      avgSolarProduction: cheapest.avgSolarProduction,
      avgPrice: cheapest.avgPrice,
    },
    topSlotsResult,
  };
}
