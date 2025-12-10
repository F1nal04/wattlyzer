import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MarketData } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Check if debug features should be enabled
 * @returns true if debug features should be shown
 */
export function isDebugMode(): boolean {
  // Server-side rendering check
  if (typeof window === "undefined") {
    return false;
  }

  // Check if we're on a dev/development subdomain
  const hostname = window.location.hostname;
  const isDevSubdomain =
    hostname.includes("dev") || hostname.includes("development");

  // Check for debug search parameter
  const searchParams = new URLSearchParams(window.location.search);
  const hasDebugParam = searchParams.get("debug") === "true";

  // Also check NODE_ENV for local development
  const isLocalDev = process.env.NODE_ENV === "development";

  return isDevSubdomain || hasDebugParam || isLocalDev;
}

/**
 * Check if market data is sufficient for the given search timespan
 * @param marketData - The market data to check
 * @param searchTimespanHours - The search timespan in hours
 * @returns An object with isSufficient flag and hoursAvailable
 */
export function checkMarketDataSufficiency(
  marketData: MarketData | null,
  searchTimespanHours: number
): {
  isSufficient: boolean;
  hoursAvailable: number;
  searchTimespanHours: number;
} {
  if (!marketData || !marketData.data || marketData.data.length === 0) {
    return {
      isSufficient: false,
      hoursAvailable: 0,
      searchTimespanHours,
    };
  }

  const now = new Date().getTime();

  // Count how many hourly data points are available from now onwards
  // Market data is in hourly slots, so we count complete hour coverage
  const availableDataPoints = marketData.data.filter(
    (item) => item.end_timestamp > now
  );

  const hoursAvailable = availableDataPoints.length;

  // Check if we have enough hourly data points to cover the search span
  // We need at least searchTimespanHours complete hours of data
  const isSufficient = hoursAvailable >= searchTimespanHours;

  return {
    isSufficient,
    hoursAvailable,
    searchTimespanHours,
  };
}
