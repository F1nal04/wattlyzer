import { queryOptions } from "@tanstack/react-query";
import type { MarketData, SolarData } from "@/lib/types";

// Purely local-first: the browser calls the upstream APIs directly (both
// send permissive CORS headers) and caches responses for an hour in the
// persisted TanStack Query cache.
export const DATA_STALE_TIME_MS = 60 * 60 * 1000;

// Round to 2 decimal places (~1km precision) for consistent cache keys
export const roundCoordinate = (coord: number) =>
  Math.round(coord * 100) / 100;

// Settings store azimuth in compass degrees (0 = North, 180 = South);
// forecast.solar expects -180..180 with 0 = South.
export const compassToApiAzimuth = (azimut: number) => (azimut % 360) - 180;

export type Position = { latitude: number; longitude: number };

export type SolarParams = {
  latitude: number;
  longitude: number;
  angle: number;
  azimut: number;
  kwh: number;
};

async function fetchJson<T>(url: string, label: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${label} API error: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function solarQueryOptions(params: SolarParams) {
  const lat = roundCoordinate(params.latitude);
  const lng = roundCoordinate(params.longitude);
  const { angle, azimut, kwh } = params;
  const apiAzimut = compassToApiAzimuth(azimut);
  return queryOptions({
    queryKey: ["solar", lat, lng, angle, azimut, kwh],
    queryFn: () =>
      fetchJson<SolarData>(
        `https://api.forecast.solar/estimate/watthours/${lat}/${lng}/${angle}/${apiAzimut}/${kwh}`,
        "Solar",
      ),
    staleTime: DATA_STALE_TIME_MS,
    gcTime: DATA_STALE_TIME_MS,
  });
}

export function marketQueryOptions() {
  return queryOptions({
    queryKey: ["market"],
    queryFn: () =>
      fetchJson<MarketData>("https://api.awattar.de/v1/marketdata", "Market"),
    staleTime: DATA_STALE_TIME_MS,
    gcTime: DATA_STALE_TIME_MS,
  });
}
