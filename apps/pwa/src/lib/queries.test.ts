import { afterEach, describe, expect, it } from "bun:test";
import {
  compassToApiAzimuth,
  marketQueryOptions,
  roundCoordinate,
  solarQueryOptions,
  utcDate,
  weatherQueryOptions,
} from "@/lib/queries";

const realFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = realFetch;
});

function stubFetch(response: { ok: boolean; status?: number; body?: unknown }) {
  const calls: string[] = [];
  globalThis.fetch = ((url: string | URL) => {
    calls.push(String(url));
    return Promise.resolve({
      ok: response.ok,
      status: response.status ?? 200,
      json: () => Promise.resolve(response.body ?? {}),
    } as Response);
  }) as typeof fetch;
  return calls;
}

// queryFn ignores its QueryFunctionContext, so invoking it bare is fine here
function runQueryFn<T>(opts: { queryFn?: unknown }): Promise<T> {
  return (opts.queryFn as () => Promise<T>)();
}

describe("roundCoordinate", () => {
  it("rounds to 2 decimal places", () => {
    expect(roundCoordinate(52.3905)).toBe(52.39);
    expect(roundCoordinate(52.395)).toBe(52.4);
    expect(roundCoordinate(13.2249)).toBe(13.22);
  });

  it("handles negative coordinates", () => {
    expect(roundCoordinate(-13.2249)).toBe(-13.22);
    expect(roundCoordinate(-13.226)).toBe(-13.23);
  });

  it("keeps already-rounded values unchanged", () => {
    expect(roundCoordinate(52.39)).toBe(52.39);
    expect(roundCoordinate(0)).toBe(0);
  });
});

describe("compassToApiAzimuth", () => {
  it("maps the compass cardinals to the forecast.solar convention", () => {
    expect(compassToApiAzimuth(180)).toBe(0); // South
    expect(compassToApiAzimuth(90)).toBe(-90); // East
    expect(compassToApiAzimuth(270)).toBe(90); // West
    expect(compassToApiAzimuth(0)).toBe(-180); // North
  });

  it("maps intermediate orientations linearly", () => {
    expect(compassToApiAzimuth(135)).toBe(-45); // South-east
    expect(compassToApiAzimuth(225)).toBe(45); // South-west
    expect(compassToApiAzimuth(359)).toBe(179);
  });

  it("treats 360 the same as 0", () => {
    expect(compassToApiAzimuth(360)).toBe(-180);
  });
});

describe("solarQueryOptions", () => {
  const params = {
    latitude: 52.3905,
    longitude: 13.2249,
    angle: 45,
    azimut: 180,
    kwh: 5,
  };

  it("keys the cache on rounded coordinates and raw panel params", () => {
    expect([...solarQueryOptions(params).queryKey]).toEqual([
      "solar",
      52.39,
      13.22,
      45,
      180,
      5,
    ]);
  });

  it("issues a distinct cache key when azimuth, tilt, or size change", () => {
    const base = [...solarQueryOptions(params).queryKey];
    expect([...solarQueryOptions({ ...params, azimut: 90 }).queryKey]).not.toEqual(
      base,
    );
    expect([...solarQueryOptions({ ...params, angle: 30 }).queryKey]).not.toEqual(
      base,
    );
    expect([...solarQueryOptions({ ...params, kwh: 8 }).queryKey]).not.toEqual(
      base,
    );
  });

  it("fetches forecast.solar with rounded coords and converted azimuth", async () => {
    const calls = stubFetch({ ok: true, body: { result: {} } });
    await runQueryFn(solarQueryOptions(params));
    expect(calls).toEqual([
      "https://api.forecast.solar/estimate/watthours/52.39/13.22/45/0/5",
    ]);
  });

  it("throws a labelled error on a non-ok response", async () => {
    stubFetch({ ok: false, status: 429 });
    expect(runQueryFn(solarQueryOptions(params))).rejects.toThrow(
      "Solar API error: 429",
    );
  });
});

describe("weatherQueryOptions", () => {
  const position = { latitude: 52.3905, longitude: 13.2249 };
  const now = new Date("2025-01-15T12:00:00.000Z");

  it("extracts the UTC calendar date", () => {
    expect(utcDate(now)).toBe("2025-01-15");
    expect(utcDate(new Date("2025-01-15T23:59:59.999Z"))).toBe("2025-01-15");
  });

  it("keys the cache on rounded coordinates and the UTC date", () => {
    expect([...weatherQueryOptions(position, now).queryKey]).toEqual([
      "weather",
      52.39,
      13.22,
      "2025-01-15",
    ]);
  });

  it("fetches a 48h BrightSky window from the current UTC date", async () => {
    const calls = stubFetch({ ok: true, body: { weather: [] } });
    await runQueryFn(weatherQueryOptions(position, now));
    expect(calls).toEqual([
      "https://api.brightsky.dev/weather?lat=52.39&lon=13.22&date=2025-01-15&last_date=2025-01-17",
    ]);
  });

  it("throws a labelled error on a non-ok response", async () => {
    stubFetch({ ok: false, status: 503 });
    expect(runQueryFn(weatherQueryOptions(position, now))).rejects.toThrow(
      "Weather API error: 503",
    );
  });
});

describe("marketQueryOptions", () => {
  it("fetches the aWATTar marketdata endpoint", async () => {
    const calls = stubFetch({ ok: true, body: { object: "list", data: [] } });
    await runQueryFn(marketQueryOptions());
    expect(calls).toEqual(["https://api.awattar.de/v1/marketdata"]);
  });

  it("throws a labelled error on a non-ok response", async () => {
    stubFetch({ ok: false, status: 500 });
    expect(runQueryFn(marketQueryOptions())).rejects.toThrow(
      "Market API error: 500",
    );
  });
});
