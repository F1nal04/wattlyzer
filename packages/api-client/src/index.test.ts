import { describe, expect, it } from "bun:test";
import {
  compassToApiAzimuth,
  createWattlyzerApiClient,
  roundCoordinate,
} from "./index";

describe("API client", () => {
  it("builds a rounded solar request", async () => {
    let requestedUrl = "";
    const client = createWattlyzerApiClient(async (url) => {
      requestedUrl = url;
      return { ok: true, status: 200, json: async () => ({ result: {} }) };
    });

    await client.getSolarForecast({
      latitude: 52.52008,
      longitude: 13.40495,
      angle: 35,
      azimut: 180,
      kwh: 8,
    });

    expect(requestedUrl).toBe(
      "https://api.forecast.solar/estimate/watthours/52.52/13.4/35/0/8",
    );
    expect(roundCoordinate(-1.236)).toBe(-1.24);
    expect(compassToApiAzimuth(360)).toBe(-180);
  });

  it("labels upstream HTTP errors", async () => {
    const client = createWattlyzerApiClient(async () => ({
      ok: false,
      status: 429,
      json: async () => ({}),
    }));

    expect(client.getMarketPrices()).rejects.toThrow("Market API error: 429");
  });
});
