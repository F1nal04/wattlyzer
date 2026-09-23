import { queryOptions } from "@tanstack/react-query";
import {
  createWattlyzerApiClient,
  roundCoordinate,
  utcDate,
  type Position,
  type SolarParams,
} from "@wattlyzer/api-client";

// Purely local-first: the browser calls the upstream APIs directly (both
// send permissive CORS headers) and caches responses for an hour in the
// persisted TanStack Query cache. Stale/gc times are the QueryClient
// defaults in router.tsx.
const api = createWattlyzerApiClient((url) => fetch(url));

export function solarQueryOptions(params: SolarParams) {
  const lat = roundCoordinate(params.latitude);
  const lng = roundCoordinate(params.longitude);
  const { angle, azimut, kwh } = params;
  return queryOptions({
    queryKey: ["solar", lat, lng, angle, azimut, kwh],
    queryFn: () => api.getSolarForecast(params),
  });
}

export function weatherQueryOptions(position: Position, now: Date) {
  const lat = roundCoordinate(position.latitude);
  const lng = roundCoordinate(position.longitude);
  // 48h window so a best slot after midnight still has a record
  const date = utcDate(now);
  return queryOptions({
    queryKey: ["weather", lat, lng, date],
    queryFn: () => api.getWeather(position, now),
  });
}

export function marketQueryOptions() {
  return queryOptions({
    queryKey: ["market"],
    queryFn: () => api.getMarketPrices(),
  });
}
