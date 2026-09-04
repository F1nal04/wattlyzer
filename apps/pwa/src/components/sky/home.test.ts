import { describe, expect, it } from "bun:test";
import {
  countdownParts,
  formatClock,
  formatRange,
  hasStarted,
  isSameLocalDay,
} from "@/components/sky/home";

// Tests run with TZ=UTC (see package.json scripts), so local time == UTC.

describe("formatClock", () => {
  it("zero-pads hours and minutes", () => {
    expect(formatClock(new Date("2025-01-15T09:05:00.000Z"))).toEqual({
      hours: "09",
      minutes: "05",
    });
    expect(formatClock(new Date("2025-01-15T14:00:00.000Z"))).toEqual({
      hours: "14",
      minutes: "00",
    });
  });
});

describe("formatRange", () => {
  it("formats start and end of the run window", () => {
    expect(formatRange(new Date("2025-01-15T14:00:00.000Z"), 3)).toBe(
      "14:00 – 17:00",
    );
  });

  it("wraps across midnight", () => {
    expect(formatRange(new Date("2025-01-15T23:00:00.000Z"), 3)).toBe(
      "23:00 – 02:00",
    );
  });
});

describe("countdownParts", () => {
  const at = (iso: string) => new Date(iso);

  // Numbers, not "3h"/"38m": the unit suffix differs per locale ("38 min"
  // in German) and `hasStarted` must not depend on a formatted string.
  it("splits the remaining time into hours and minutes", () => {
    // the canonical example: 10:22 now, best time 14:00 → 3h 38m
    expect(
      countdownParts(at("2025-01-15T14:00:00.000Z"), at("2025-01-15T10:22:00.000Z")),
    ).toEqual({ hours: 3, minutes: 38 });
  });

  it("reports zero hours under one hour", () => {
    expect(
      countdownParts(at("2025-01-15T14:00:00.000Z"), at("2025-01-15T13:35:00.000Z")),
    ).toEqual({ hours: 0, minutes: 25 });
  });

  it("rounds partial minutes up so an imminent start never reads 0m early", () => {
    expect(
      countdownParts(at("2025-01-15T14:00:00.000Z"), at("2025-01-15T13:59:59.000Z")),
    ).toEqual({ hours: 0, minutes: 1 });
    expect(
      countdownParts(at("2025-01-15T14:00:00.000Z"), at("2025-01-15T13:58:30.000Z")),
    ).toEqual({ hours: 0, minutes: 2 });
  });

  it("clamps to zero once the target time is reached or passed", () => {
    expect(
      countdownParts(at("2025-01-15T14:00:00.000Z"), at("2025-01-15T14:00:00.000Z")),
    ).toEqual({ hours: 0, minutes: 0 });
    expect(
      countdownParts(at("2025-01-15T14:00:00.000Z"), at("2025-01-15T15:30:00.000Z")),
    ).toEqual({ hours: 0, minutes: 0 });
  });

  it("keeps zero minutes on exact hour boundaries", () => {
    expect(
      countdownParts(at("2025-01-15T14:00:00.000Z"), at("2025-01-15T12:00:00.000Z")),
    ).toEqual({ hours: 2, minutes: 0 });
  });

  it("handles spans beyond 24 hours", () => {
    expect(
      countdownParts(at("2025-01-16T15:30:00.000Z"), at("2025-01-15T14:00:00.000Z")),
    ).toEqual({ hours: 25, minutes: 30 });
  });
});

describe("hasStarted", () => {
  it("is true only once nothing is left to wait for", () => {
    expect(hasStarted({ hours: 0, minutes: 0 })).toBe(true);
  });

  it("is false while any time remains, including the last minute", () => {
    expect(hasStarted({ hours: 0, minutes: 1 })).toBe(false);
    expect(hasStarted({ hours: 2, minutes: 0 })).toBe(false);
    expect(hasStarted({ hours: 25, minutes: 30 })).toBe(false);
  });
});

describe("isSameLocalDay", () => {
  const at = (iso: string) => new Date(iso);

  it("is true for two times on the same day", () => {
    expect(
      isSameLocalDay(at("2026-06-12T00:00:00.000Z"), at("2026-06-12T23:59:00.000Z")),
    ).toBe(true);
  });

  it("is false across midnight — the 16:39 / tomorrow-10:00 case", () => {
    expect(
      isSameLocalDay(at("2026-06-13T10:00:00.000Z"), at("2026-06-12T16:39:00.000Z")),
    ).toBe(false);
  });

  it("compares full dates, not just the day-of-month", () => {
    // same day number in a different month / year
    expect(
      isSameLocalDay(at("2026-07-12T10:00:00.000Z"), at("2026-06-12T10:00:00.000Z")),
    ).toBe(false);
    expect(
      isSameLocalDay(at("2027-06-12T10:00:00.000Z"), at("2026-06-12T10:00:00.000Z")),
    ).toBe(false);
  });

  it("handles year boundaries", () => {
    expect(
      isSameLocalDay(at("2027-01-01T00:30:00.000Z"), at("2026-12-31T23:30:00.000Z")),
    ).toBe(false);
  });
});
