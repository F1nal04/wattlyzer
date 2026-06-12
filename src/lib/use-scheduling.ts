import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  marketQueryOptions,
  solarQueryOptions,
  type Position,
} from "@/lib/queries";
import { calculateSchedule } from "@/lib/schedule";
import { useSettings } from "@/lib/settings";
import { checkMarketDataSufficiency } from "@/lib/utils";

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
) {
  const { settings } = useSettings();
  const needsMarketData = settings.bestSlotMode !== "solar-only";

  const solarQuery = useQuery({
    ...solarQueryOptions({
      latitude: position?.latitude ?? 0,
      longitude: position?.longitude ?? 0,
      angle: settings.angle,
      azimut: settings.azimut,
      kwh: settings.kwh,
    }),
    enabled: position !== null,
  });

  const marketQuery = useQuery({
    ...marketQueryOptions(),
    enabled: position !== null && needsMarketData,
  });

  const solarData = solarQuery.data ?? null;
  const marketData = needsMarketData ? (marketQuery.data ?? null) : null;

  const { schedulingResult, topSlotsResult } = calculateSchedule(
    solarData,
    marketData,
    settings,
    consumerDuration,
    searchTimespan,
    now,
  );

  const marketDataSufficiency = checkMarketDataSufficiency(
    marketData,
    searchTimespan,
    now,
  );

  const isLoading =
    position !== null &&
    (solarQuery.isPending || (needsMarketData && marketQuery.isPending));
  const apiError =
    solarQuery.error?.message ??
    (needsMarketData ? marketQuery.error?.message : undefined) ??
    null;

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
