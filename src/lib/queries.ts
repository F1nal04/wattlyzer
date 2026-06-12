import { queryOptions } from "@tanstack/react-query";
import type { MarketData, SolarData } from "@/lib/types";

// Matches the upstream cache window: solar + market proxies revalidate
// server-side, the client treats data younger than 15 minutes as fresh.
export const DATA_STALE_TIME_MS = 15 * 60 * 1000;

// Round to 2 decimal places (~1km precision) for consistent cache keys
export const roundCoordinate = (coord: number) =>
  Math.round(coord * 100) / 100;

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
  return queryOptions({
    queryKey: ["solar", lat, lng, angle, azimut, kwh],
    queryFn: () =>
      fetchJson<SolarData>(
        `/api/solar?lat=${lat}&lng=${lng}&angle=${angle}&azimut=${azimut}&kwh=${kwh}`,
        "Solar",
      ),
    staleTime: DATA_STALE_TIME_MS,
    gcTime: DATA_STALE_TIME_MS,
  });
}

export function marketQueryOptions() {
  return queryOptions({
    queryKey: ["market"],
    queryFn: () => fetchJson<MarketData>("/api/market", "Market"),
    staleTime: DATA_STALE_TIME_MS,
    gcTime: DATA_STALE_TIME_MS,
  });
}
