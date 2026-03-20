import type { SettingsData } from "@/lib/settings-context";
import type {
  MarketData,
  SchedulingResult,
  SlotResult,
  SolarData,
  TopSlotsResult,
} from "@/lib/types";

export function calculatePowerGeneration(
  solarData: SolarData,
  settings: SettingsData,
  hoursFromNow: number,
  now: Date
) {
  const targetTime = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000);

  const timestamps = Object.keys(solarData.result)
    .map((ts) => ({
      timestamp: new Date(ts).getTime(),
      value: solarData.result[ts],
      date: new Date(ts).toDateString(),
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
      if (timestamps[i].date === timestamps[closestBeforeIndex].date) {
        nextIndex = i;
        break;
      }
    }
  }

  if (nextIndex === -1 || nextIndex <= closestBeforeIndex) {
    return 0;
  }

  if (timestamps[closestBeforeIndex].date !== timestamps[nextIndex].date) {
    return 0;
  }

  const startValue = timestamps[closestBeforeIndex].value;
  const endValue = timestamps[nextIndex].value;
  const timeDiffHours =
    (timestamps[nextIndex].timestamp - timestamps[closestBeforeIndex].timestamp) /
    (1000 * 60 * 60);

  let hourlyProduction = Math.max(0, (endValue - startValue) / timeDiffHours);
  hourlyProduction *= 0.7;

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

export function calculateMarketPrice(
  marketData: MarketData | null,
  hoursFromNow: number,
  now: Date
) {
  if (!marketData?.data) {
    return 0;
  }

  const targetTime = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000);
  const targetTimestamp = targetTime.getTime();

  const priceData = marketData.data.find(
    (item) =>
      targetTimestamp >= item.start_timestamp &&
      targetTimestamp < item.end_timestamp
  );

  return priceData ? priceData.marketprice : 0;
}

export function normalizeToFullHour(
  bestTime: Date,
  bestResult: SlotResult,
  allResults: SlotResult[],
  rankingMetric: "solar" | "price",
  now: Date
) {
  const currentHour = new Date(bestTime);
  currentHour.setMinutes(0, 0, 0);

  const nextHour = new Date(currentHour);
  nextHour.setHours(nextHour.getHours() + 1);

  const isCurrentHourReachable = currentHour.getTime() >= now.getTime();

  const currentHourResult = allResults.find(
    (result) =>
      result.startTime.getHours() === currentHour.getHours() &&
      result.startTime.getDate() === currentHour.getDate()
  );

  const nextHourResult = allResults.find(
    (result) =>
      result.startTime.getHours() === nextHour.getHours() &&
      result.startTime.getDate() === nextHour.getDate()
  );

  if (!isCurrentHourReachable) {
    if (nextHourResult) {
      return { time: nextHour, ...nextHourResult };
    }

    return { time: bestTime, ...bestResult };
  }

  if (!currentHourResult && !nextHourResult) {
    return { time: currentHour, ...bestResult };
  }

  if (!nextHourResult) {
    return { time: currentHour, ...bestResult };
  }

  if (!currentHourResult) {
    return { time: nextHour, ...nextHourResult };
  }

  if (rankingMetric === "solar") {
    if (
      currentHourResult.avgSolarProduction >= nextHourResult.avgSolarProduction
    ) {
      return { time: currentHour, ...currentHourResult };
    }

    return { time: nextHour, ...nextHourResult };
  }

  if (currentHourResult.avgPrice <= nextHourResult.avgPrice) {
    return { time: currentHour, ...currentHourResult };
  }

  return { time: nextHour, ...nextHourResult };
}

export function calculateSchedule(
  solarData: SolarData | null,
  marketData: MarketData | null,
  settings: SettingsData | undefined,
  consumerDuration: number,
  searchTimespan: number,
  now: Date
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

  const maxStartHour = Math.min(
    searchTimespan,
    searchTimespan - consumerDuration + 1
  );

  for (let h = 0; h < maxStartHour; h++) {
    const startTime = new Date(now.getTime() + h * 60 * 60 * 1000);
    let totalSolarProduction = 0;
    let totalPrice = 0;
    let validHours = 0;

    for (let i = 0; i < consumerDuration; i++) {
      const hoursFromNow = h + i;

      if (hoursFromNow >= 0 && hoursFromNow < searchTimespan) {
        const solarProduction = calculatePowerGeneration(
          solarData,
          settings,
          hoursFromNow,
          now
        );
        const price = calculateMarketPrice(marketData, hoursFromNow, now);

        totalSolarProduction += solarProduction;
        totalPrice += price;
        validHours++;
      }
    }

    if (validHours === consumerDuration) {
      const avgSolarProduction = totalSolarProduction / validHours;
      const avgPrice = totalPrice / validHours;
      const solarQualifies = avgSolarProduction >= settings.minKwh;

      results.push({
        startTime,
        avgSolarProduction,
        avgPrice,
        solarQualifies,
      });
    }
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
      current.avgPrice < best.avgPrice ? current : best
    );
    const normalizedTime = normalizeToFullHour(
      cheapest.startTime,
      cheapest,
      results,
      "price",
      now
    );

    return {
      schedulingResult: {
        bestTime: normalizedTime.time,
        reason: "price" as const,
        avgSolarProduction: normalizedTime.avgSolarProduction,
        avgPrice: normalizedTime.avgPrice,
      },
      topSlotsResult,
    };
  }

  if (settings.bestSlotMode === "solar-only") {
    const solarQualifiedSlots = results.filter((result) => result.solarQualifies);

    if (solarQualifiedSlots.length === 0) {
      return {
        schedulingResult: null,
        topSlotsResult,
      };
    }

    const sunniest = solarQualifiedSlots.reduce((best, current) =>
      current.avgSolarProduction > best.avgSolarProduction ? current : best
    );
    const normalizedTime = normalizeToFullHour(
      sunniest.startTime,
      sunniest,
      results,
      "solar",
      now
    );

    return {
      schedulingResult: {
        bestTime: normalizedTime.time,
        reason: "solar" as const,
        avgSolarProduction: normalizedTime.avgSolarProduction,
      },
      topSlotsResult,
    };
  }

  const solarQualifiedSlots = results.filter((result) => result.solarQualifies);

  if (solarQualifiedSlots.length > 0) {
    const best = solarQualifiedSlots.reduce((best, current) =>
      current.avgSolarProduction > best.avgSolarProduction ? current : best
    );
    const normalizedSolarTime = normalizeToFullHour(
      best.startTime,
      best,
      results,
      "solar",
      now
    );

    return {
      schedulingResult: {
        bestTime: normalizedSolarTime.time,
        reason: "solar" as const,
        avgSolarProduction: normalizedSolarTime.avgSolarProduction,
        avgPrice: normalizedSolarTime.avgPrice,
      },
      topSlotsResult,
    };
  }

  const cheapest = results.reduce((best, current) =>
    current.avgPrice < best.avgPrice ? current : best
  );
  const normalizedTime = normalizeToFullHour(
    cheapest.startTime,
    cheapest,
    results,
    "price",
    now
  );

  return {
    schedulingResult: {
      bestTime: normalizedTime.time,
      reason: "price" as const,
      avgSolarProduction: normalizedTime.avgSolarProduction,
      avgPrice: normalizedTime.avgPrice,
    },
    topSlotsResult,
  };
}
