import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MarketData } from "./types";

const HOUR_MS = 60 * 60 * 1000;

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
  searchTimespanHours: number,
  now: Date = new Date()
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

  const firstRelevantHour = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      0,
      0,
      0
    )
  );
  if (now.getTime() > firstRelevantHour.getTime()) {
    firstRelevantHour.setTime(firstRelevantHour.getTime() + HOUR_MS);
  }

  const lastRequiredSampleMs =
    now.getTime() + (searchTimespanHours - 1) * HOUR_MS;
  const requiredHours =
    firstRelevantHour.getTime() > lastRequiredSampleMs
      ? 0
      : Math.floor(
          (lastRequiredSampleMs - firstRelevantHour.getTime()) / HOUR_MS
        ) + 1;

  const sortedData = [...marketData.data].sort(
    (a, b) => a.start_timestamp - b.start_timestamp
  );
  let coverageEndMs = firstRelevantHour.getTime();

  for (const item of sortedData) {
    if (
      item.start_timestamp <= coverageEndMs &&
      item.end_timestamp > coverageEndMs
    ) {
      coverageEndMs = item.end_timestamp;
    }
  }

  const hoursAvailable = Math.max(
    0,
    Math.floor((coverageEndMs - firstRelevantHour.getTime()) / HOUR_MS)
  );
  const isSufficient = hoursAvailable >= requiredHours;

  return {
    isSufficient,
    hoursAvailable,
    searchTimespanHours,
  };
}
