// Cache utilities
type CachedData<T> = {
  data: T;
  timestamp: number;
  key: string;
};

const CACHE_DURATION_MS = 1 * 60 * 60 * 1000; // 1 hour
export const SOLAR_CACHE_KEY = "wattlyzer_solar_cache";
export const MARKET_CACHE_KEY = "wattlyzer_market_cache";

// Helper function to round coordinates for consistent cache keys
export const roundCoordinate = (coord: number) => Math.round(coord * 100) / 100; // Round to 2 decimal places (~1km precision)

export function getCachedData<T>(cacheKey: string, dataKey: string): T | null {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const parsedCache: CachedData<T> = JSON.parse(cached);
    const now = Date.now();
    const age = now - parsedCache.timestamp;

    // Check if cache is expired
    if (age > CACHE_DURATION_MS) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    // Check if key matches (for solar data with different parameters)
    if (parsedCache.key !== dataKey) {
      return null;
    }

    return parsedCache.data;
  } catch {
    return null;
  }
}

export function setCachedData<T>(
  cacheKey: string,
  dataKey: string,
  data: T
): void {
  try {
    const cacheData: CachedData<T> = {
      data,
      timestamp: Date.now(),
      key: dataKey,
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch {
    // Ignore localStorage errors
  }
}

export function clearCache(): void {
  try {
    localStorage.removeItem(SOLAR_CACHE_KEY);
    localStorage.removeItem(MARKET_CACHE_KEY);
  } catch {
    // Ignore localStorage errors
  }
}
