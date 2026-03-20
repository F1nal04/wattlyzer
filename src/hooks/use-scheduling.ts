"use client";

import { useState } from "react";
import { SettingsData, useSettings } from "@/lib/settings-context";
import { SolarData, MarketData } from "@/lib/types";
import {
  getCachedData,
  setCachedData,
  SOLAR_CACHE_KEY,
  MARKET_CACHE_KEY,
  roundCoordinate,
} from "@/lib/cache";
import { checkMarketDataSufficiency } from "@/lib/utils";
import { calculateSchedule } from "@/lib/schedule";

const solarRequestPromises = new Map<string, Promise<SolarData>>();
let marketRequestPromise: Promise<MarketData> | null = null;

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
    searchTimespan,
    new Date()
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
