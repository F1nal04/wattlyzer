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
export const roundCoordinate = (coord: number) => Math.round(coord * 100) / 100; /**
 * Retrieves cached data from localStorage if it exists, is not expired, and matches the provided key.
 *
 * @param cacheKey - The localStorage key under which the cached data is stored
 * @param dataKey - The key used to validate the cached entry
 * @returns The cached data if valid and not expired; otherwise, null
 */

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

/**
 * Stores data in localStorage under the specified cache key with an associated data key and timestamp.
 *
 * Overwrites any existing cache entry for the given cache key. Silently ignores storage errors.
 */
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

/**
 * Removes both solar and market cache entries from localStorage.
 *
 * Silently ignores any errors that occur during removal.
 */
export function clearCache(): void {
  try {
    localStorage.removeItem(SOLAR_CACHE_KEY);
    localStorage.removeItem(MARKET_CACHE_KEY);
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Retrieves metadata and status information about a cached entry in localStorage.
 *
 * Returns an object containing the cached data (if valid), the timestamp when it was cached, the cache age in milliseconds, whether the cache is expired, and whether the cache entry exists.
 *
 * @param cacheKey - The localStorage key under which the cache entry is stored
 * @param dataKey - The key used to validate the cached entry
 * @returns An object with the cached data (or null), timestamp, age, expiration status, and existence flag
 */
export function getCacheInfo<T>(
  cacheKey: string,
  dataKey: string
): {
  data: T | null;
  timestamp: number | null;
  age: number | null;
  isExpired: boolean;
  exists: boolean;
} {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) {
      return {
        data: null,
        timestamp: null,
        age: null,
        isExpired: false,
        exists: false,
      };
    }

    const parsedCache: CachedData<T> = JSON.parse(cached);
    const now = Date.now();
    const age = now - parsedCache.timestamp;
    const isExpired = age > CACHE_DURATION_MS;
    const keyMatches = parsedCache.key === dataKey;

    return {
      data: keyMatches && !isExpired ? parsedCache.data : null,
      timestamp: parsedCache.timestamp,
      age,
      isExpired,
      exists: true,
    };
  } catch {
    return {
      data: null,
      timestamp: null,
      age: null,
      isExpired: false,
      exists: false,
    };
  }
}
