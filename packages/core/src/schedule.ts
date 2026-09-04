import type {
  ScheduleEvaluation,
  ScheduleRequest,
  SchedulingSettings,
} from "./config";
import type {
  MarketData,
  SlotResult,
  SolarData,
  TopSlotsResult,
} from "./types";

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

/**
 * Hours the "end of day" search window should cover: whole scheduling hours
 * from the first schedulable hour up to the next local midnight.
 *
 * Counted from `ceilToUtcHour(now)` — the same anchor `calculateSchedule`
 * enumerates from — not from `now`. Measuring from `now` counts the partial
 * current hour twice and lets the window reach into the next day.
 */
export function hoursUntilEndOfLocalDay(now: Date): number {
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(
    0,
    Math.floor((midnight.getTime() - ceilToUtcHour(now).getTime()) / HOUR_MS),
  );
}

export function calculatePowerGeneration(
  solarData: SolarData | null,
  settings: SchedulingSettings,
  targetTime: Date,
) {
  if (!solarData) {
    return 0;
  }

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

  // For sub-hour brackets (sunrise/sunset samples) credit only the actual
  // delta instead of extrapolating the short interval to a full hour
  let hourlyProduction = Math.max(
    0,
    (endValue - startValue) / Math.max(timeDiffHours, 1),
  );
  hourlyProduction *= 0.7;

  // Shading settings are wall-clock hours ("until 10:00"), so compare in
  // the user's local time, not UTC
  if (
    settings.morningShading &&
    targetTime.getHours() < settings.shadingEndTime
  ) {
    hourlyProduction *= 0.5;
  }

  if (
    settings.eveningShading &&
    targetTime.getHours() >= settings.shadingStartTime
  ) {
    hourlyProduction *= 0.5;
  }

  return hourlyProduction;
}

function findMarketPrice(
  marketData: MarketData | null,
  targetTime: Date,
): number | null {
  if (!marketData?.data) {
    return null;
  }

  const targetTimestamp = targetTime.getTime();
  const priceData = marketData.data.find(
    (item) =>
      targetTimestamp >= item.start_timestamp &&
      targetTimestamp < item.end_timestamp,
  );

  return priceData ? priceData.marketprice : null;
}

export function calculateMarketPrice(
  marketData: MarketData | null,
  targetTime: Date,
) {
  return findMarketPrice(marketData, targetTime) ?? 0;
}

function hasAvgPrice(
  slot: SlotResult,
): slot is SlotResult & { avgPrice: number } {
  return slot.avgPrice !== null;
}

function cheapestSlot(
  slots: SlotResult[],
): (SlotResult & { avgPrice: number }) | null {
  return slots
    .filter(hasAvgPrice)
    .reduce<(SlotResult & { avgPrice: number }) | null>(
      (best, current) =>
        !best || current.avgPrice < best.avgPrice ? current : best,
      null,
    );
}

export function calculateSchedule({
  solarData,
  marketData,
  settings,
  consumerDuration,
  searchTimespan,
  now,
}: ScheduleRequest): ScheduleEvaluation {
  if (!settings) {
    return { schedulingResult: null, topSlotsResult: null };
  }

  const needsMarketData = settings.bestSlotMode !== "solar-only";

  // Only the signal a mode cannot answer without. price-only must not be held
  // hostage by forecast.solar (no panels, and a 12 requests/hour/IP free
  // tier), and combined needs just the solar half — with aWATTar down it
  // falls back to the sunniest qualifying slot instead of refusing to answer.
  const requiredSignal =
    settings.bestSlotMode === "price-only" ? marketData : solarData;

  if (!requiredSignal) {
    return { schedulingResult: null, topSlotsResult: null };
  }

  const results: SlotResult[] = [];

  // Align with hourly solar keys (…Z) and [start,end) market rows on the UTC grid.
  // The window counts from the first schedulable hour so a window equal to the
  // run duration always yields exactly one slot (instead of zero mid-hour).
  const firstStartMs = ceilToUtcHour(now).getTime();
  const lastSampleMaxMs = firstStartMs + (searchTimespan - 1) * HOUR_MS;

  for (let startMs = firstStartMs; ; startMs += HOUR_MS) {
    const lastSampleMs = startMs + (consumerDuration - 1) * HOUR_MS;
    if (lastSampleMs > lastSampleMaxMs) {
      break;
    }

    let totalSolarProduction = 0;
    let totalPrice = 0;
    let hasCompleteMarketCoverage = true;

    for (let i = 0; i < consumerDuration; i++) {
      const targetTime = new Date(startMs + i * HOUR_MS);
      totalSolarProduction += calculatePowerGeneration(
        solarData,
        settings,
        targetTime,
      );

      if (needsMarketData) {
        const price = findMarketPrice(marketData, targetTime);
        if (price === null) {
          hasCompleteMarketCoverage = false;
          continue;
        }
        totalPrice += price;
      }
    }

    const avgSolarProduction = totalSolarProduction / consumerDuration;
    const solarQualifies = avgSolarProduction >= settings.minKwh;

    results.push({
      startTime: new Date(startMs),
      avgSolarProduction,
      avgPrice: hasCompleteMarketCoverage
        ? totalPrice / consumerDuration
        : null,
      solarQualifies,
    });
  }

  if (results.length === 0) {
    return { schedulingResult: null, topSlotsResult: null };
  }

  const topSolarSlots = [...results]
    .sort((a, b) => b.avgSolarProduction - a.avgSolarProduction)
    .slice(0, 3);

  const topPriceSlots = results
    .filter(hasAvgPrice)
    .sort((a, b) => a.avgPrice - b.avgPrice)
    .slice(0, 3);

  const topSlotsResult: TopSlotsResult = {
    topSolarSlots,
    topPriceSlots: needsMarketData ? topPriceSlots : [],
  };

  if (settings.bestSlotMode === "price-only") {
    const cheapest = cheapestSlot(results);

    if (!cheapest) {
      return {
        schedulingResult: null,
        topSlotsResult,
      };
    }

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
        avgPrice: best.avgPrice ?? undefined,
      },
      topSlotsResult,
    };
  }

  const cheapest = cheapestSlot(results);

  if (!cheapest) {
    return {
      schedulingResult: null,
      topSlotsResult,
    };
  }

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
