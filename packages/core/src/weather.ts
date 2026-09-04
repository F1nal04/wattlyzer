import { calculatePowerGeneration } from "./schedule";
import type { SchedulingSettings } from "./config";
import type { SolarData, WeatherData } from "./types";

export type WeatherKind =
  | "sunny"
  | "partly"
  | "cloudy"
  | "overcast"
  | "rainy"
  | "snowy"
  | "foggy";

type WeatherRecord = WeatherData["weather"][number];

// Cloud-cover (%) bands for the sky hero
export function cloudCoverToKind(cover: number): WeatherKind {
  if (cover <= 25) return "sunny";
  if (cover <= 50) return "partly";
  if (cover <= 85) return "cloudy";
  return "overcast";
}

/**
 * Precipitation/fog kind from a DWD `condition` label, or null when the sky
 * state should instead be decided by cloud cover. Wet falling precipitation
 * (rain/sleet/hail/thunderstorm) reads as `rainy`; snow as `snowy`; fog as
 * `foggy`. When DWD omits the label, a positive measured precipitation falls
 * back to `rainy` so a passing shower still shows.
 */
export function conditionToKind(
  condition: string | null | undefined,
  precipitation: number | null | undefined,
): WeatherKind | null {
  switch (condition) {
    case "rain":
    case "sleet":
    case "hail":
    case "thunderstorm":
      return "rainy";
    case "snow":
      return "snowy";
    case "fog":
      return "foggy";
  }
  if (precipitation != null && precipitation > 0) return "rainy";
  return null;
}

// The hourly record covering `at`, or null when missing
function weatherRecordAt(
  data: WeatherData | null,
  at: Date,
): WeatherRecord | null {
  if (!data?.weather) return null;
  const hourStart = Math.floor(at.getTime() / 3_600_000) * 3_600_000;
  for (const record of data.weather) {
    if (Date.parse(record.timestamp) === hourStart) {
      return record;
    }
  }
  return null;
}

/**
 * Sky at the given moment. Real DWD data wins when available: a precipitation
 * or fog condition takes precedence over cloud cover (it can rain under a
 * not-fully-overcast sky), otherwise the cloud-cover band decides. With no
 * record, the solar-forecast heuristic fills in.
 */
export function weatherAt(
  weatherData: WeatherData | null,
  solarData: SolarData | null,
  settings: SchedulingSettings,
  at: Date,
): WeatherKind {
  const record = weatherRecordAt(weatherData, at);
  if (record) {
    const precip = conditionToKind(record.condition, record.precipitation);
    if (precip) return precip;
    if (record.cloud_cover !== null) {
      return cloudCoverToKind(record.cloud_cover);
    }
  }
  return forecastWeather(solarData, settings, at);
}

/**
 * Fallback when no weather data is available: classify the day from the
 * forecasted solar peak, relative to the theoretical clear-sky peak of the
 * configured system (kwh kWp · the 0.7 production factor applied in
 * calculatePowerGeneration).
 */
export function forecastWeather(
  solarData: SolarData | null,
  settings: SchedulingSettings,
  now: Date,
): WeatherKind {
  if (!solarData) {
    return "sunny";
  }

  // Peak hourly production across the current local day
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  let peak = 0;
  for (let h = 0; h < 24; h++) {
    const t = new Date(dayStart.getTime() + h * 60 * 60 * 1000);
    // Ignore shading here — weather is about the sky, not the roof
    const production = calculatePowerGeneration(
      solarData,
      { ...settings, morningShading: false, eveningShading: false },
      t,
    );
    peak = Math.max(peak, production);
  }

  const clearSkyPeak = settings.kwh * 1000 * 0.7;
  if (clearSkyPeak <= 0) {
    return "sunny";
  }

  const ratio = peak / clearSkyPeak;
  if (ratio > 0.55) return "sunny";
  if (ratio > 0.3) return "partly";
  if (ratio > 0.12) return "cloudy";
  return "overcast";
}
