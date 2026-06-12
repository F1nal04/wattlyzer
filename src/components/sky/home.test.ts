import { describe, expect, it } from "bun:test";
import {
  formatClock,
  formatCountdown,
  formatRange,
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

describe("formatCountdown", () => {
  const at = (iso: string) => new Date(iso);

  it("splits the remaining time into hours and minutes", () => {
    // the canonical example: 10:22 now, best time 14:00 → 3h 38m
    expect(
      formatCountdown(at("2025-01-15T14:00:00.000Z"), at("2025-01-15T10:22:00.000Z")),
    ).toEqual({ hours: "3h", minutes: "38m" });
  });

  it("omits the hours part under one hour", () => {
    expect(
      formatCountdown(at("2025-01-15T14:00:00.000Z"), at("2025-01-15T13:35:00.000Z")),
    ).toEqual({ hours: "", minutes: "25m" });
  });

  it("rounds partial minutes up so an imminent start never reads 0m early", () => {
    expect(
      formatCountdown(at("2025-01-15T14:00:00.000Z"), at("2025-01-15T13:59:59.000Z")),
    ).toEqual({ hours: "", minutes: "1m" });
    expect(
      formatCountdown(at("2025-01-15T14:00:00.000Z"), at("2025-01-15T13:58:30.000Z")),
    ).toEqual({ hours: "", minutes: "2m" });
  });

  it("clamps to 0m once the target time is reached or passed", () => {
    expect(
      formatCountdown(at("2025-01-15T14:00:00.000Z"), at("2025-01-15T14:00:00.000Z")),
    ).toEqual({ hours: "", minutes: "0m" });
    expect(
      formatCountdown(at("2025-01-15T14:00:00.000Z"), at("2025-01-15T15:30:00.000Z")),
    ).toEqual({ hours: "", minutes: "0m" });
  });

  it("shows 0m explicitly on exact hour boundaries", () => {
    expect(
      formatCountdown(at("2025-01-15T14:00:00.000Z"), at("2025-01-15T12:00:00.000Z")),
    ).toEqual({ hours: "2h", minutes: "0m" });
  });

  it("handles spans beyond 24 hours", () => {
    expect(
      formatCountdown(at("2025-01-16T15:30:00.000Z"), at("2025-01-15T14:00:00.000Z")),
    ).toEqual({ hours: "25h", minutes: "30m" });
  });
});
