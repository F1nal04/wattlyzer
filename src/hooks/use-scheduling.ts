"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSettings } from "@/lib/settings-context";
import {
  SolarData,
  MarketData,
  SchedulingResult,
  TopSlotsResult,
} from "@/lib/types";
import {
  getCachedData,
  setCachedData,
  SOLAR_CACHE_KEY,
  MARKET_CACHE_KEY,
  roundCoordinate,
} from "@/lib/cache";

export function useScheduling(
  position: { latitude: number; longitude: number } | null,
  consumerDuration: number,
  searchTimespan: number
) {
  const { settings } = useSettings();
  const [solarData, setSolarData] = useState<SolarData | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [schedulingResult, setSchedulingResult] =
    useState<SchedulingResult | null>(null);
  const [topSlotsResult, setTopSlotsResult] = useState<TopSlotsResult | null>(
    null
  );
  const [apiError, setApiError] = useState<string | null>(null);

  // Create promises for render-while-fetch with caching
  const solarDataPromiseRef = useRef<Promise<SolarData> | null>(null);
  const marketDataPromiseRef = useRef<Promise<MarketData> | null>(null);
  const lastSolarKey = useRef<string>("");
  const lastMarketKey = useRef<string>("");

  // Load cached data immediately on component mount
  useEffect(() => {
    if (position && settings) {
      const { latitude, longitude } = position;
      const { angle, kwh, azimut } = settings;
      const roundedLat = roundCoordinate(latitude);
      const roundedLng = roundCoordinate(longitude);
      const solarKey = `${roundedLat},${roundedLng},${angle},${azimut},${kwh}`;
      const cachedSolarData = getCachedData<SolarData>(
        SOLAR_CACHE_KEY,
        solarKey
      );
      if (cachedSolarData) {
        setSolarData(cachedSolarData);
      }
    }

    if (position) {
      const cachedMarketData = getCachedData<MarketData>(
        MARKET_CACHE_KEY,
        "market"
      );
      if (cachedMarketData) {
        setMarketData(cachedMarketData);
      }
    }
  }, [position, settings]);

  const calculatePowerGeneration = useCallback(
    (hoursFromNow: number) => {
      if (!solarData || !settings) {
        return 0;
      }

      const now = new Date();
      const targetTime = new Date(
        now.getTime() + hoursFromNow * 60 * 60 * 1000
      );

      // Convert solar data timestamps to array and sort
      const timestamps = Object.keys(solarData.result)
        .map((ts) => ({
          timestamp: new Date(ts).getTime(),
          dateStr: ts,
          value: solarData.result[ts],
          date: new Date(ts).toDateString(), // For grouping by day
        }))
        .sort((a, b) => a.timestamp - b.timestamp);

      if (timestamps.length === 0) return 0;

      // Find the closest timestamp at or before our target time
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

      // If no data available for this time, return 0
      if (closestBeforeIndex === -1) return 0;

      // Get the hour production by finding the next timestamp and calculating difference
      let nextIndex = closestAfterIndex;
      if (nextIndex === -1) {
        // If no next timestamp, try to find the next hour within same day
        for (let i = closestBeforeIndex + 1; i < timestamps.length; i++) {
          if (timestamps[i].date === timestamps[closestBeforeIndex].date) {
            nextIndex = i;
            break;
          }
        }
      }

      if (nextIndex === -1 || nextIndex <= closestBeforeIndex) {
        // No next data point available, estimate based on typical solar curve
        return 0;
      }

      // Ensure both timestamps are from the same day (solar data resets daily)
      if (timestamps[closestBeforeIndex].date !== timestamps[nextIndex].date) {
        return 0;
      }

      const startValue = timestamps[closestBeforeIndex].value;
      const endValue = timestamps[nextIndex].value;
      const timeDiffHours =
        (timestamps[nextIndex].timestamp -
          timestamps[closestBeforeIndex].timestamp) /
        (1000 * 60 * 60);

      // Calculate hourly rate and return production for 1 hour
      let hourlyProduction = Math.max(
        0,
        (endValue - startValue) / timeDiffHours
      );

      // Apply general 30% reduction for solar estimation accuracy
      hourlyProduction *= 0.7;

      // Morning shading: Apply 50% reduction for estimates before shadingEndTime
      if (
        settings?.morningShading &&
        targetTime.getHours() < settings.shadingEndTime
      ) {
        hourlyProduction *= 0.5;
      }

      return hourlyProduction;
    },
    [solarData, settings]
  );

  const calculateMarketPrice = useCallback(
    (hoursFromNow: number) => {
      if (!marketData || !marketData.data) {
        return 0;
      }

      const now = new Date();
      const targetTime = new Date(
        now.getTime() + hoursFromNow * 60 * 60 * 1000
      );
      const targetTimestamp = targetTime.getTime();

      // Find the market price data that contains the target time
      // Market data timestamps are in milliseconds
      const priceData = marketData.data.find(
        (item) =>
          targetTimestamp >= item.start_timestamp &&
          targetTimestamp < item.end_timestamp
      );

      return priceData ? priceData.marketprice : 0;
    },
    [marketData]
  );

  const solarDataPromise = useMemo(() => {
    if (!position || !settings) return null;

    // If we already have cached data loaded, don't create a promise
    if (solarData) return null;

    const { latitude, longitude } = position;
    const { angle, kwh, azimut } = settings;

    // Create a key with rounded coordinates to match cache
    const roundedLat = roundCoordinate(latitude);
    const roundedLng = roundCoordinate(longitude);
    const key = `${roundedLat},${roundedLng},${angle},${azimut},${kwh}`;

    // Check if we already have a promise for this key
    if (key === lastSolarKey.current && solarDataPromiseRef.current) {
      return solarDataPromiseRef.current;
    }

    // Always check cache first
    const cachedData = getCachedData<SolarData>(SOLAR_CACHE_KEY, key);
    if (cachedData) {
      lastSolarKey.current = key;
      solarDataPromiseRef.current = Promise.resolve(cachedData);
      return solarDataPromiseRef.current;
    }
    lastSolarKey.current = key;

    const apiAzimut = (settings.azimut % 360) - 180;

    const url = `https://api.forecast.solar/estimate/watthours/${latitude}/${longitude}/${angle}/${apiAzimut}/${kwh}`;

    solarDataPromiseRef.current = fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // Cache the fetched data
        setCachedData(SOLAR_CACHE_KEY, key, data);
        return data;
      });

    return solarDataPromiseRef.current;
  }, [position, settings, solarData]);

  const marketDataPromise = useMemo(() => {
    if (!position) return null;

    // If we already have cached data loaded, don't create a promise
    if (marketData) return null;

    const key = "market";

    // Check if we already have a promise for this key
    if (key === lastMarketKey.current && marketDataPromiseRef.current) {
      return marketDataPromiseRef.current;
    }

    // Always check cache first
    const cachedData = getCachedData<MarketData>(MARKET_CACHE_KEY, key);
    if (cachedData) {
      lastMarketKey.current = key;
      marketDataPromiseRef.current = Promise.resolve(cachedData);
      return marketDataPromiseRef.current;
    }
    lastMarketKey.current = key;

    marketDataPromiseRef.current = fetch("https://api.awattar.de/v1/marketdata")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Market API error: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // Cache the fetched data
        setCachedData(MARKET_CACHE_KEY, key, data);
        return data;
      });

    return marketDataPromiseRef.current;
  }, [position, marketData]);

  // Helper function to normalize time to full hour
  const normalizeToFullHour = useCallback(
    (
      bestTime: Date,
      bestResult: {
        avgSolarProduction: number;
        avgPrice: number;
        solarQualifies: boolean;
      },
      allResults: Array<{
        startTime: Date;
        avgSolarProduction: number;
        avgPrice: number;
        solarQualifies: boolean;
      }>
    ) => {
      const now = new Date();
      const currentHour = new Date(bestTime);
      currentHour.setMinutes(0, 0, 0);

      const nextHour = new Date(currentHour);
      nextHour.setHours(nextHour.getHours() + 1);

      // Check if current hour is reachable (not in the past)
      const isCurrentHourReachable = currentHour.getTime() >= now.getTime();

      // Find results for current hour and next hour
      const currentHourResult = allResults.find(
        (r) =>
          r.startTime.getHours() === currentHour.getHours() &&
          r.startTime.getDate() === currentHour.getDate()
      );

      const nextHourResult = allResults.find(
        (r) =>
          r.startTime.getHours() === nextHour.getHours() &&
          r.startTime.getDate() === nextHour.getDate()
      );

      // If current hour is not reachable, only consider next hour
      if (!isCurrentHourReachable) {
        if (nextHourResult) {
          return { time: nextHour, ...nextHourResult };
        }
        // If neither is available, return the original best time
        return { time: bestTime, ...bestResult };
      }

      // If we only have one option, use it (current hour is reachable)
      if (!currentHourResult && !nextHourResult) {
        return { time: currentHour, ...bestResult };
      }

      if (!nextHourResult) {
        return { time: currentHour, ...bestResult };
      }

      if (!currentHourResult) {
        return { time: nextHour, ...nextHourResult };
      }

      // Compare which hour is better based on the reason
      // For solar optimization: prefer higher solar production
      // For price optimization: prefer lower price
      let betterResult;
      let betterTime;

      if (bestResult.solarQualifies) {
        // Solar optimization - prefer higher solar production
        if (
          currentHourResult.avgSolarProduction >=
          nextHourResult.avgSolarProduction
        ) {
          betterResult = currentHourResult;
          betterTime = currentHour;
        } else {
          betterResult = nextHourResult;
          betterTime = nextHour;
        }
      } else {
        // Price optimization - prefer lower price
        if (currentHourResult.avgPrice <= nextHourResult.avgPrice) {
          betterResult = currentHourResult;
          betterTime = currentHour;
        } else {
          betterResult = nextHourResult;
          betterTime = nextHour;
        }
      }

      return {
        time: betterTime,
        avgSolarProduction: betterResult.avgSolarProduction,
        avgPrice: betterResult.avgPrice,
      };
    },
    []
  );

  // Calculate scheduling result and top slots
  useEffect(() => {
    const calculateSchedule = () => {
      if (!solarData || !marketData || !settings) {
        return { schedulingResult: null, topSlotsResult: null };
      }

      const now = new Date();
      const results: Array<{
        startTime: Date;
        avgSolarProduction: number;
        avgPrice: number;
        solarQualifies: boolean;
      }> = [];

      // Check every hour in the search timespan, but ensure we don't go beyond available data
      const maxStartHour = Math.min(
        searchTimespan,
        searchTimespan - consumerDuration + 1
      );

      for (let h = 0; h < maxStartHour; h++) {
        const startTime = new Date(now.getTime() + h * 60 * 60 * 1000);

        // Calculate total solar production and price over the consumer duration
        let totalSolarProduction = 0;
        let totalPrice = 0;
        let validHours = 0;

        for (let i = 0; i < consumerDuration; i++) {
          const hoursFromNow = h + i;

          // Only process if within our search timespan window
          if (hoursFromNow >= 0 && hoursFromNow < searchTimespan) {
            const solarProduction = calculatePowerGeneration(hoursFromNow);
            const price = calculateMarketPrice(hoursFromNow);

            totalSolarProduction += solarProduction;
            totalPrice += price;
            validHours++;
          }
        }

        // Only include slots where we have complete data for the entire duration
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

      // Calculate top 3 slots for solar (highest solar production)
      const topSolarSlots = [...results]
        .sort((a, b) => b.avgSolarProduction - a.avgSolarProduction)
        .slice(0, 3)
        .map((slot) => ({
          startTime: slot.startTime,
          avgSolarProduction: slot.avgSolarProduction,
          avgPrice: slot.avgPrice,
          solarQualifies: slot.solarQualifies,
        }));

      // Calculate top 3 slots for price (lowest price)
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
        topPriceSlots,
      };

      // Calculate the single best scheduling result (existing logic)
      const solarQualifiedSlots = results.filter((r) => r.solarQualifies);

      let schedulingResult: SchedulingResult | null = null;

      if (solarQualifiedSlots.length > 0) {
        // Among solar-qualified slots, pick the one with highest solar production
        const best = solarQualifiedSlots.reduce((best, current) =>
          current.avgSolarProduction > best.avgSolarProduction ? current : best
        );

        // Normalize to full hour - compare current hour vs next hour
        const normalizedTime = normalizeToFullHour(
          best.startTime,
          best,
          results
        );

        schedulingResult = {
          bestTime: normalizedTime.time,
          reason: "solar" as const,
          avgSolarProduction: normalizedTime.avgSolarProduction,
          avgPrice: normalizedTime.avgPrice,
        };
      } else {
        // If no solar-qualified slots, find the cheapest price slot
        const cheapest = results.reduce((best, current) =>
          current.avgPrice < best.avgPrice ? current : best
        );

        // Normalize to full hour - compare current hour vs next hour
        const normalizedTime = normalizeToFullHour(
          cheapest.startTime,
          cheapest,
          results
        );

        schedulingResult = {
          bestTime: normalizedTime.time,
          reason: "price" as const,
          avgSolarProduction: normalizedTime.avgSolarProduction,
          avgPrice: normalizedTime.avgPrice,
        };
      }

      return { schedulingResult, topSlotsResult };
    };

    if (solarData && marketData && settings) {
      const { schedulingResult, topSlotsResult } = calculateSchedule();
      setSchedulingResult(schedulingResult);
      setTopSlotsResult(topSlotsResult);
    } else {
      setSchedulingResult(null);
      setTopSlotsResult(null);
    }
  }, [
    solarData,
    marketData,
    consumerDuration,
    searchTimespan,
    calculatePowerGeneration,
    calculateMarketPrice,
    normalizeToFullHour,
    settings?.minKwh,
    settings,
  ]);

  // Clear error when promises are created
  useEffect(() => {
    if (solarDataPromise) {
      setApiError(null);
    }
  }, [solarDataPromise]);

  // Callbacks for handling data from Suspense components
  const handleSolarData = useCallback((data: SolarData) => {
    setSolarData(data);
  }, []);

  const handleMarketData = useCallback((data: MarketData) => {
    setMarketData(data);
  }, []);

  const handleError = useCallback((error: Error) => {
    setApiError(error.message);
  }, []);

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
  };
}
