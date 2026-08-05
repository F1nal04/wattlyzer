import { describe, expect, it } from "bun:test";
import { createMountedStore, pickSkyHour, SSR_SKY_HOUR } from "./use-sky-hour";

describe("mounted store", () => {
  it("retains the client mount state for later route mounts", () => {
    const store = createMountedStore();
    let updates = 0;
    const unsubscribe = store.subscribe(() => updates++);

    expect(store.getSnapshot()).toBe(false);
    expect(store.getServerSnapshot()).toBe(false);

    store.markMounted();

    expect(store.getSnapshot()).toBe(true);
    expect(store.getServerSnapshot()).toBe(false);
    expect(updates).toBe(1);

    store.markMounted();
    expect(updates).toBe(1);

    unsubscribe();
  });
});

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
