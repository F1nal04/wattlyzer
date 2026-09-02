import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  marketQueryOptions,
  solarQueryOptions,
  type Position,
} from "@/lib/queries";
import {
  calculateSchedule,
  checkMarketDataSufficiency,
} from "@wattlyzer/core";
import {
  toSchedulingSettings,
  type SettingsData,
} from "@/lib/settings";
import {
  schedulingSignalsAvailable,
  solarPanelsEnabled,
} from "@/components/sky/solar";

export function useGeolocation() {
  const [position, setPosition] = useState<Position | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported by browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (nextPosition) => {
        setPosition({
          latitude: nextPosition.coords.latitude,
          longitude: nextPosition.coords.longitude,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied by user");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information unavailable");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out");
            break;
          default:
            setLocationError("Unknown location error");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  }, []);

  return { position, locationError };
}

export function useScheduling(
  position: Position | null,
  consumerDuration: number,
  searchTimespan: number,
  now: Date,
  settings: SettingsData,
) {
  const needsMarketData = settings.bestSlotMode !== "solar-only";
  const canSchedule = schedulingSignalsAvailable(
    solarPanelsEnabled(settings.bestSlotMode),
    settings.dynamicTariff,
  );
  const queriesEnabled = position !== null && canSchedule;

  const solarQuery = useQuery({
    ...solarQueryOptions({
      latitude: position?.latitude ?? 0,
      longitude: position?.longitude ?? 0,
      angle: settings.angle,
      azimut: settings.azimut,
      kwh: settings.kwh,
    }),
    enabled: queriesEnabled,
  });

  const marketQuery = useQuery({
    ...marketQueryOptions(),
    enabled: queriesEnabled && needsMarketData,
  });

  const solarData = solarQuery.data ?? null;
  const marketData = needsMarketData ? (marketQuery.data ?? null) : null;

  const { schedulingResult, topSlotsResult } = useMemo(
    () =>
      canSchedule
        ? calculateSchedule({
            solarData,
            marketData,
            settings: toSchedulingSettings(settings),
            consumerDuration,
            searchTimespan,
            now,
          })
        : { schedulingResult: null, topSlotsResult: null },
    [
      canSchedule,
      solarData,
      marketData,
      settings,
      consumerDuration,
      searchTimespan,
      now,
    ],
  );

  const marketDataSufficiency = checkMarketDataSufficiency(
    marketData,
    searchTimespan,
    now,
  );

  const isLoading =
    queriesEnabled &&
    (solarQuery.isPending || (needsMarketData && marketQuery.isPending));
  const apiError =
    canSchedule
      ? (solarQuery.error?.message ??
        (needsMarketData ? marketQuery.error?.message : undefined) ??
        null)
      : null;

  return {
    solarData,
    marketData,
    schedulingResult,
    topSlotsResult,
    isLoading,
    apiError,
    marketDataSufficiency,
  };
}
