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
  const requiredEndTime = now + searchTimespanHours * 60 * 60 * 1000;

  // Find the latest end timestamp in the market data
  const latestEndTimestamp = Math.max(
    ...marketData.data.map((item) => item.end_timestamp)
  );

  // Calculate how many hours of data we have available from now
  const hoursAvailable = Math.max(
    0,
    (latestEndTimestamp - now) / (1000 * 60 * 60)
  );

  // Check if market data covers the entire search span
  const isSufficient = latestEndTimestamp >= requiredEndTime;

  return {
    isSufficient,
    hoursAvailable: Math.floor(hoursAvailable),
    searchTimespanHours,
  };
}
