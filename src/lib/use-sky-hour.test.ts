import { describe, expect, it } from "bun:test";
import { pickSkyHour, SSR_SKY_HOUR } from "./use-sky-hour";

describe("pickSkyHour", () => {
  it("returns the fixed SSR hour until mounted, ignoring everything else", () => {
    expect(
      pickSkyHour({
        mounted: false,
        currentTimeSky: true,
        preferredHour: 14,
        currentHour: 2,
      }),
    ).toBe(SSR_SKY_HOUR);
  });

  it("follows the current hour when dark mode is on", () => {
    expect(
      pickSkyHour({
        mounted: true,
        currentTimeSky: true,
        preferredHour: 14,
        currentHour: 2,
      }),
    ).toBe(2);
  });

  it("uses the preferred hour when dark mode is off", () => {
    expect(
      pickSkyHour({
        mounted: true,
        currentTimeSky: false,
        preferredHour: 14,
        currentHour: 2,
      }),
    ).toBe(14);
  });

  it("falls back to the current hour when dark mode is off and no preferred hour is given", () => {
    expect(
      pickSkyHour({
        mounted: true,
        currentTimeSky: false,
        preferredHour: undefined,
        currentHour: 2,
      }),
    ).toBe(2);
  });
});
