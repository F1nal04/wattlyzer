"use client";

import { useState } from "react";
import { SettingsData, useSettings } from "@/lib/settings-context";
import {
  SolarData,
  MarketData,
  SlotResult,
  TopSlotsResult,
} from "@/lib/types";
import {
  getCachedData,
  setCachedData,
  SOLAR_CACHE_KEY,
  MARKET_CACHE_KEY,
  roundCoordinate,
} from "@/lib/cache";
import { checkMarketDataSufficiency } from "@/lib/utils";

const solarRequestPromises = new Map<string, Promise<SolarData>>();
let marketRequestPromise: Promise<MarketData> | null = null;

function calculatePowerGeneration(
  solarData: SolarData,
  settings: SettingsData,
  hoursFromNow: number
) {
  const now = new Date();
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

    if (timestamps[i].timestamp > targetTime.getTime() && closestAfterIndex === -1) {
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

  if (settings.morningShading && targetTime.getHours() < settings.shadingEndTime) {
    hourlyProduction *= 0.5;
  }

  if (settings.eveningShading && targetTime.getHours() >= settings.shadingStartTime) {
    hourlyProduction *= 0.5;
  }

  return hourlyProduction;
}

function calculateMarketPrice(marketData: MarketData | null, hoursFromNow: number) {
  if (!marketData?.data) {
    return 0;
  }

  const now = new Date();
  const targetTime = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000);
  const targetTimestamp = targetTime.getTime();

  const priceData = marketData.data.find(
    (item) =>
      targetTimestamp >= item.start_timestamp &&
      targetTimestamp < item.end_timestamp
  );

  return priceData ? priceData.marketprice : 0;
}

function normalizeToFullHour(
  bestTime: Date,
  bestResult: SlotResult,
  allResults: SlotResult[],
  rankingMetric: "solar" | "price"
) {
  const now = new Date();
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
    if (currentHourResult.avgSolarProduction >= nextHourResult.avgSolarProduction) {
      return { time: currentHour, ...currentHourResult };
    }

    return { time: nextHour, ...nextHourResult };
  }

  if (currentHourResult.avgPrice <= nextHourResult.avgPrice) {
    return { time: currentHour, ...currentHourResult };
  }

  return { time: nextHour, ...nextHourResult };
}

function getSolarDataPromise(
  position: { latitude: number; longitude: number },
  settings: SettingsData
) {
  const { latitude, longitude } = position;
  const { angle, kwh, azimut } = settings;
  const roundedLat = roundCoordinate(latitude);
  const roundedLng = roundCoordinate(longitude);
  const key = `${roundedLat},${roundedLng},${angle},${azimut},${kwh}`;

  const cachedData = getCachedData<SolarData>(SOLAR_CACHE_KEY, key);
  if (cachedData) {
    return Promise.resolve(cachedData);
  }

  const existingPromise = solarRequestPromises.get(key);
  if (existingPromise) {
    return existingPromise;
  }

  const apiAzimut = (azimut % 360) - 180;
  const url = `https://api.forecast.solar/estimate/watthours/${latitude}/${longitude}/${angle}/${apiAzimut}/${kwh}`;

  const promise = fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      setCachedData(SOLAR_CACHE_KEY, key, data);
      return data;
    })
    .catch((error) => {
      solarRequestPromises.delete(key);
      throw error;
    });

  solarRequestPromises.set(key, promise);

  return promise;
}

function getMarketDataPromise() {
  const cachedData = getCachedData<MarketData>(MARKET_CACHE_KEY, "market");
  if (cachedData) {
    return Promise.resolve(cachedData);
  }

  if (marketRequestPromise) {
    return marketRequestPromise;
  }

  marketRequestPromise = fetch("https://api.awattar.de/v1/marketdata")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Market API error: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      setCachedData(MARKET_CACHE_KEY, "market", data);
      return data;
    })
    .catch((error) => {
      marketRequestPromise = null;
      throw error;
    });

  return marketRequestPromise;
}

function calculateSchedule(
  solarData: SolarData | null,
  marketData: MarketData | null,
  settings: SettingsData | undefined,
  consumerDuration: number,
  searchTimespan: number
) {
  if (!solarData || !settings) {
    return { schedulingResult: null, topSlotsResult: null };
  }

  const needsMarketData = settings.bestSlotMode !== "solar-only";

  if (needsMarketData && !marketData) {
    return { schedulingResult: null, topSlotsResult: null };
  }

  const now = new Date();
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
          hoursFromNow
        );
        const price = calculateMarketPrice(marketData, hoursFromNow);

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
      "price"
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
    const sunniest = results.reduce((best, current) =>
      current.avgSolarProduction > best.avgSolarProduction ? current : best
    );
    const normalizedTime = normalizeToFullHour(
      sunniest.startTime,
      sunniest,
      results,
      "solar"
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
      "solar"
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
    "price"
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

function getSolarKey(
  position: { latitude: number; longitude: number } | null,
  settings: SettingsData | undefined
) {
  if (!position || !settings) {
    return null;
  }

  const { latitude, longitude } = position;
  const { angle, kwh, azimut } = settings;
  const roundedLat = roundCoordinate(latitude);
  const roundedLng = roundCoordinate(longitude);

  return `${roundedLat},${roundedLng},${angle},${azimut},${kwh}`;
}

type SolarDataState = {
  key: string;
  data: SolarData;
};

export function useScheduling(
  position: { latitude: number; longitude: number } | null,
  consumerDuration: number,
  searchTimespan: number
) {
  const { settings } = useSettings();
  const [solarDataState, setSolarDataState] = useState<SolarDataState | null>(
    null
  );
  const [marketDataState, setMarketDataState] = useState<MarketData | null>(
    null
  );
  const [apiError, setApiError] = useState<string | null>(null);
  const solarKey = getSolarKey(position, settings);
  const cachedSolarData = solarKey
    ? getCachedData<SolarData>(SOLAR_CACHE_KEY, solarKey)
    : null;
  const solarData =
    solarDataState?.key === solarKey ? solarDataState.data : cachedSolarData;
  const cachedMarketData = position
    ? getCachedData<MarketData>(MARKET_CACHE_KEY, "market")
    : null;
  const marketData = position ? marketDataState ?? cachedMarketData : null;
  const shouldFetchMarketData = settings.bestSlotMode !== "solar-only";

  const solarDataPromise =
    position && settings && !solarData
      ? getSolarDataPromise(position, settings)
      : null;
  const marketDataPromise =
    position && shouldFetchMarketData && !marketData ? getMarketDataPromise() : null;
  const { schedulingResult, topSlotsResult } = calculateSchedule(
    solarData,
    marketData,
    settings,
    consumerDuration,
    searchTimespan
  );
  const marketDataSufficiency = checkMarketDataSufficiency(
    marketData,
    searchTimespan
  );

  // Callbacks for handling data from Suspense components
  const handleSolarData = (data: SolarData) => {
    if (!solarKey) {
      return;
    }

    setSolarDataState({ key: solarKey, data });
    setApiError(null);
  };

  const handleMarketData = (data: MarketData) => {
    setMarketDataState(data);
    setApiError(null);
  };

  const handleError = (error: Error) => {
    setApiError(error.message);
  };

  return {
    solarData,
    marketData,
    schedulingResult,
    topSlotsResult,
    apiError,
    solarDataPromise,
    marketDataPromise,
    handleSolarData,
    handleMarketData,
    handleError,
    setApiError,
    marketDataSufficiency,
  };
}
