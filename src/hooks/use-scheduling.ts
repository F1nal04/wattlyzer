"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSettings } from "@/lib/settings-context";
import { SolarData, MarketData, SchedulingResult } from "@/lib/types";
import { getCachedData, setCachedData, SOLAR_CACHE_KEY, MARKET_CACHE_KEY, roundCoordinate } from "@/lib/cache";

export function useScheduling(position: { latitude: number; longitude: number } | null, consumerDuration: number) {
  const { settings } = useSettings();
  const [solarData, setSolarData] = useState<SolarData | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [schedulingResult, setSchedulingResult] = useState<SchedulingResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Create promises for render-while-fetch with caching
  const solarDataPromiseRef = useRef<Promise<SolarData> | null>(null);
  const marketDataPromiseRef = useRef<Promise<MarketData> | null>(null);
  const lastSolarKey = useRef<string>('');
  const lastMarketKey = useRef<string>('');

  // Load cached data immediately on component mount
  useEffect(() => {
    if (position && settings) {
      const { latitude, longitude } = position;
      const { angle, kwh, azimut } = settings;
      const roundedLat = roundCoordinate(latitude);
      const roundedLng = roundCoordinate(longitude);
      const solarKey = `${roundedLat},${roundedLng},${angle},${azimut},${kwh}`;
      const cachedSolarData = getCachedData<SolarData>(SOLAR_CACHE_KEY, solarKey);
      if (cachedSolarData) {
        setSolarData(cachedSolarData);
      }
    }
    
    if (position) {
      const cachedMarketData = getCachedData<MarketData>(MARKET_CACHE_KEY, 'market');
      if (cachedMarketData) {
        setMarketData(cachedMarketData);
      }
    }
  }, [position, settings]);

  const calculatePowerGeneration = useCallback((hoursFromNow: number) => {
    if (!solarData) return 0;

    const now = new Date();
    const targetTime = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000);

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
    const hourlyProduction = Math.max(
      0,
      (endValue - startValue) / timeDiffHours
    );

    return hourlyProduction;
  }, [solarData]);

  const calculateMarketPrice = useCallback((hoursFromNow: number) => {
    if (!marketData || !marketData.data) return 0;

    const now = new Date();
    const targetTime = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000);
    const targetTimestamp = targetTime.getTime();

    // Find the market price data that contains the target time
    // Market data timestamps are in milliseconds
    const priceData = marketData.data.find(
      (item) =>
        targetTimestamp >= item.start_timestamp &&
        targetTimestamp < item.end_timestamp
    );

    return priceData ? priceData.marketprice : 0;
  }, [marketData]);

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
    
    let apiAzimut;
    if (azimut === 0 || azimut === 360) {
      apiAzimut = -180;
    } else if (azimut <= 180) {
      apiAzimut = azimut - 180;
    } else {
      apiAzimut = azimut - 180;
    }
    
    const url = `https://api.forecast.solar/estimate/watthours/${latitude}/${longitude}/${angle}/${apiAzimut}/${kwh}`;
    
    solarDataPromiseRef.current = fetch(url).then(response => {
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    }).then(data => {
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
    
    const key = 'market';
    
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
    
    marketDataPromiseRef.current = fetch("https://api.awattar.de/v1/marketdata").then(response => {
      if (!response.ok) {
        throw new Error(`Market API error: ${response.status}`);
      }
      return response.json();
    }).then(data => {
      // Cache the fetched data
      setCachedData(MARKET_CACHE_KEY, key, data);
      return data;
    });
    
    return marketDataPromiseRef.current;
  }, [position, marketData]);

  // Calculate scheduling result
  useEffect(() => {
    const calculateSchedule = () => {
      if (!solarData || !marketData) return null;

      const now = new Date();
      const results: Array<{
        startTime: Date;
        avgSolarProduction: number;
        avgPrice: number;
        solarQualifies: boolean;
      }> = [];

      // Check every hour in the next 24 hours, but ensure we don't go beyond available data
      const maxStartHour = Math.min(24, 24 - consumerDuration + 1);

      for (let h = 0; h < maxStartHour; h++) {
        const startTime = new Date(now.getTime() + h * 60 * 60 * 1000);

        // Calculate total solar production and price over the consumer duration
        let totalSolarProduction = 0;
        let totalPrice = 0;
        let validHours = 0;

        for (let i = 0; i < consumerDuration; i++) {
          const hoursFromNow = h + i;

          // Only process if within our 24-hour window
          if (hoursFromNow >= 0 && hoursFromNow < 24) {
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
          const solarQualifies = avgSolarProduction >= 1200; // 1.2kWh = 1200Wh

          results.push({
            startTime,
            avgSolarProduction,
            avgPrice,
            solarQualifies,
          });
        }
      }

      if (results.length === 0) return null;

      // First priority: Find slots with solar production >= 1.2kWh average
      const solarQualifiedSlots = results.filter((r) => r.solarQualifies);

      if (solarQualifiedSlots.length > 0) {
        // Among solar-qualified slots, pick the one with highest solar production
        const best = solarQualifiedSlots.reduce((best, current) =>
          current.avgSolarProduction > best.avgSolarProduction ? current : best
        );

        return {
          bestTime: best.startTime,
          reason: "solar" as const,
          avgSolarProduction: best.avgSolarProduction,
          avgPrice: best.avgPrice,
        };
      }

      // If no solar-qualified slots, find the cheapest price slot
      const cheapest = results.reduce((best, current) =>
        current.avgPrice < best.avgPrice ? current : best
      );

      return {
        bestTime: cheapest.startTime,
        reason: "price" as const,
        avgSolarProduction: cheapest.avgSolarProduction,
        avgPrice: cheapest.avgPrice,
      };
    };

    if (solarData && marketData) {
      const result = calculateSchedule();
      setSchedulingResult(result);
    }
  }, [solarData, marketData, consumerDuration, calculatePowerGeneration, calculateMarketPrice]);

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
    apiError,
    solarDataPromise,
    marketDataPromise,
    handleSolarData,
    handleMarketData,
    handleError,
    setApiError
  };
}