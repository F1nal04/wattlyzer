import type { MarketData, SolarData, WeatherData } from "@wattlyzer/core";

export const DATA_STALE_TIME_MS = 60 * 60 * 1000;

export type Position = { latitude: number; longitude: number };

export type SolarParams = Position & {
  angle: number;
  azimut: number;
  kwh: number;
};

export interface FetchResponseLike {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

export type FetchLike = (url: string) => Promise<FetchResponseLike>;

export const roundCoordinate = (coord: number) =>
  Math.round(coord * 100) / 100;

export const compassToApiAzimuth = (azimut: number) => (azimut % 360) - 180;

export const utcDate = (date: Date) => date.toISOString().slice(0, 10);

async function fetchJson<T>(
  fetcher: FetchLike,
  url: string,
  label: string,
): Promise<T> {
  const response = await fetcher(url);
  if (!response.ok) {
    throw new Error(`${label} API error: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function createWattlyzerApiClient(fetcher: FetchLike) {
  return {
    getSolarForecast(params: SolarParams) {
      const lat = roundCoordinate(params.latitude);
      const lng = roundCoordinate(params.longitude);
      const apiAzimut = compassToApiAzimuth(params.azimut);
      return fetchJson<SolarData>(
        fetcher,
        `https://api.forecast.solar/estimate/watthours/${lat}/${lng}/${params.angle}/${apiAzimut}/${params.kwh}`,
        "Solar",
      );
    },

    getWeather(position: Position, now: Date) {
      const lat = roundCoordinate(position.latitude);
      const lng = roundCoordinate(position.longitude);
      const date = utcDate(now);
      const lastDate = utcDate(new Date(now.getTime() + 48 * 60 * 60 * 1000));
      return fetchJson<WeatherData>(
        fetcher,
        `https://api.brightsky.dev/weather?lat=${lat}&lon=${lng}&date=${date}&last_date=${lastDate}`,
        "Weather",
      );
    },

    getMarketPrices() {
      return fetchJson<MarketData>(
        fetcher,
        "https://api.awattar.de/v1/marketdata",
        "Market",
      );
    },
  };
}
