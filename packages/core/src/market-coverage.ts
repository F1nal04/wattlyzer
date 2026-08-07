import type { MarketData } from "./types";

const HOUR_MS = 60 * 60 * 1000;

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

  // Mirror calculateSchedule: the window counts from the first full hour
  const requiredHours = Math.max(0, searchTimespanHours);

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
