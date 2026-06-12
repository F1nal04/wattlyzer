import { calculatePowerGeneration } from "@/lib/schedule";
import type { SettingsData } from "@/lib/settings";
import type { SolarData, WeatherData } from "@/lib/types";

export type WeatherKind = "sunny" | "partly" | "cloudy" | "overcast";

// Cloud-cover (%) bands for the sky hero
export function cloudCoverToKind(cover: number): WeatherKind {
  if (cover <= 25) return "sunny";
  if (cover <= 50) return "partly";
  if (cover <= 85) return "cloudy";
  return "overcast";
}

// Cloud cover of the hourly record covering `at`, or null when missing
export function cloudCoverAt(
  data: WeatherData | null,
  at: Date,
): number | null {
  if (!data?.weather) return null;
  const hourStart = Math.floor(at.getTime() / 3_600_000) * 3_600_000;
  for (const record of data.weather) {
    if (Date.parse(record.timestamp) === hourStart) {
      return record.cloud_cover;
    }
  }
  return null;
}

/**
 * Sky at the given moment: real DWD cloud cover when available, otherwise
 * the solar-forecast heuristic.
 */
export function weatherAt(
  weatherData: WeatherData | null,
  solarData: SolarData | null,
  settings: SettingsData,
  at: Date,
): WeatherKind {
  const cover = cloudCoverAt(weatherData, at);
  if (cover !== null) {
    return cloudCoverToKind(cover);
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
  settings: SettingsData,
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
