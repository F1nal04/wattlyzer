import { describe, expect, it } from "vitest";
import { checkMarketDataSufficiency } from "@/lib/utils";
import type { MarketData } from "@/lib/types";

const HOUR_MS = 60 * 60 * 1000;

function marketUtcHourlyFrom(
  anchorUtcHourStart: Date,
  hours: number
): MarketData {
  return {
    object: "list",
    url: "",
    data: Array.from({ length: hours }, (_, index) => {
      const start_timestamp = anchorUtcHourStart.getTime() + index * HOUR_MS;
      return {
        start_timestamp,
        end_timestamp: start_timestamp + HOUR_MS,
        marketprice: index,
        unit: "EUR/MWh",
      };
    }),
  };
}

describe("checkMarketDataSufficiency", () => {
  it("does not warn early when the current hour is already partially elapsed", () => {
    const now = new Date("2025-01-15T12:30:00.000Z");
    const market = marketUtcHourlyFrom(
      new Date("2025-01-15T12:00:00.000Z"),
      24
    );

    const result = checkMarketDataSufficiency(market, 24, now);

    expect(result.hoursAvailable).toBe(23);
    expect(result.isSufficient).toBe(true);
  });

  it("flags insufficient data when the next-hour coverage is actually too short", () => {
    const now = new Date("2025-01-15T12:30:00.000Z");
    const market = marketUtcHourlyFrom(
      new Date("2025-01-15T12:00:00.000Z"),
      23
    );

    const result = checkMarketDataSufficiency(market, 24, now);

    expect(result.hoursAvailable).toBe(22);
    expect(result.isSufficient).toBe(false);
  });

  it("treats gaps in future hourly data as insufficient coverage", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const market = marketUtcHourlyFrom(
      new Date("2025-01-15T12:00:00.000Z"),
      4
    );

    market.data.splice(2, 1);

    const result = checkMarketDataSufficiency(market, 4, now);

    expect(result.hoursAvailable).toBe(2);
    expect(result.isSufficient).toBe(false);
  });
});
