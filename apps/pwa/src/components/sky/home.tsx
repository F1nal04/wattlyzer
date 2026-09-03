import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  FONT_DISPLAY,
  FONT_MONO,
  FONT_SANS,
  type SkyTheme,
} from "@wattlyzer/theme";
import type { SchedulingResult } from "@wattlyzer/core";
import type { WeatherKind } from "@wattlyzer/core";
import { SkyClouds, SkySunCloud } from "@/components/sky/clouds";
import { frostedGlass } from "@/components/sky/glass";
import { SkySlider } from "@/components/sky/primitives";

const pad2 = (n: number) => String(n).padStart(2, "0");

export function formatClock(d: Date) {
  return { hours: pad2(d.getHours()), minutes: pad2(d.getMinutes()) };
}

export function formatRange(start: Date, durationHours: number) {
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
  const f = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  return `${f(start)} – ${f(end)}`;
}

export function isSameLocalDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export interface Countdown {
  hours: number;
  minutes: number;
}

// Time remaining until `target`, e.g. { hours: 3, minutes: 38 }. Numbers,
// not formatted strings: the unit suffix is localized at the render edge.
// Minutes are rounded up so "in 1 second" still reads as 1m, not 0m.
export function countdownParts(target: Date, now: Date): Countdown {
  const totalMinutes = Math.max(
    0,
    Math.ceil((target.getTime() - now.getTime()) / 60_000),
  );
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
}

export function hasStarted(countdown: Countdown): boolean {
  return countdown.hours === 0 && countdown.minutes === 0;
}

// Weather-aware hero — sun arcs over the day (apex at noon, centered),
// moon arcs the reverse way at night, clouds replace the sun when the
// forecast says so.
export function SkyHero({
  t,
  hour,
  weather,
}: {
  t: SkyTheme;
  hour: number;
  weather: WeatherKind;
}) {
  const sunArcT = Math.max(0, Math.min(1, (hour - 6) / 12));
  const sunX = 0.12 + sunArcT * 0.76; // 0.12 → 0.5 → 0.88
  const sunY = 1 - Math.sin(Math.PI * sunArcT);
  const showSun = hour >= 6 && hour <= 20;
  const sunSize = 120;
  const sunTopPx = 110 + sunY * 50;
  // Moon arc — reversed: rises at dusk (right), peaks centered at midnight,
  // sets at dawn (left). Mirror of the sun path.
  const moonH = hour < 6 ? hour + 24 : hour; // 21..29
  const moonArcT = Math.max(0, Math.min(1, (moonH - 21) / 8));
  const moonX = 0.88 - moonArcT * 0.76;
  const moonY = 1 - Math.sin(Math.PI * moonArcT);
  const moonSize = 76;
  const moonTopPx = 132 + moonY * 50;

  return (
    <>
      {showSun && weather === "sunny" && (
        <div
          style={{
            position: "absolute",
            left: `calc(${sunX * 100}% - ${sunSize / 2}px)`,
            top: sunTopPx,
            width: sunSize,
            height: sunSize,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${t.sunCore} 0%, ${t.sunMid} 45%, ${t.sunOuter} 75%, rgba(255,154,60,0) 100%)`,
            boxShadow: `0 0 80px 20px ${t.sunMid}88`,
          }}
        />
      )}
      {showSun && weather === "partly" && (
        <SkySunCloud
          t={t}
          sunLeft={`calc(${sunX * 100}% - ${sunSize / 2}px)`}
          sunTop={sunTopPx}
          sunSize={sunSize}
        />
      )}
      {showSun &&
        (weather === "cloudy" ||
          weather === "overcast" ||
          weather === "rainy" ||
          weather === "snowy" ||
          weather === "foggy") && <SkyClouds kind={weather} t={t} />}
      {!showSun && (
        <div
          style={{
            position: "absolute",
            left: `calc(${moonX * 100}% - ${moonSize / 2}px)`,
            top: moonTopPx,
            width: moonSize,
            height: moonSize,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 35%, #fff7e0 0%, #d8d0b2 70%, #aaa088 100%)",
            boxShadow: "0 0 60px 10px rgba(255,247,224,0.3)",
          }}
        />
      )}
    </>
  );
}

// Centered clock cluster — label, big Fraunces time, range, reason chip
export function ClockCluster({
  t,
  result,
  duration,
}: {
  t: SkyTheme;
  result: SchedulingResult;
  duration: number;
}) {
  const [showCountdown, setShowCountdown] = useState(false);
  const [now, setNow] = useState(() => new Date());

  // Tick so the countdown and the today/tomorrow label never go stale
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const clock = formatClock(result.bestTime);
  const countdown = formatCountdown(result.bestTime, now);
  const started = showCountdown && countdown.hours === "" && countdown.minutes === "0m";
  const dayLabel = isSameLocalDay(result.bestTime, now)
    ? "Best time today"
    : "Best time tomorrow";

  // Shrink-to-fit guard: the font size never changes between clock and
  // countdown — only if the text physically can't fit (e.g. "23h 59m" on a
  // narrow phone) is it scaled down just enough.
  const textRef = useRef<HTMLSpanElement>(null);
  const [fit, setFit] = useState(1);
  useLayoutEffect(() => {
    const measure = () => {
      const el = textRef.current;
      const box = el?.parentElement;
      if (!el || !box) return;
      const avail = box.clientWidth - 12;
      setFit(el.scrollWidth > avail ? avail / el.scrollWidth : 1);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [showCountdown, countdown.hours, countdown.minutes]);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: "50%",
        transform: "translateY(-50%)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 13,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: t.fgDim,
          fontWeight: 500,
          marginBottom: 14,
        }}
      >
        {showCountdown ? (started ? dayLabel : "Starts in") : dayLabel}
      </div>
      <button
        type="button"
        onClick={() => setShowCountdown((v) => !v)}
        aria-label={
          showCountdown
            ? "Show start time"
            : "Show time remaining until start"
        }
        style={{
          display: "block",
          width: "100%",
          padding: 0,
          margin: 0,
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "center",
          fontFamily: FONT_DISPLAY,
          fontWeight: 400,
          fontSize: 124,
          lineHeight: 0.9,
          whiteSpace: "nowrap",
          letterSpacing: "-0.04em",
          color: t.fg,
          fontVariantNumeric: "tabular-nums",
          textShadow: t.mode === "dark" ? "0 2px 24px rgba(0,0,0,0.35)" : "none",
        }}
      >
        <span
          ref={textRef}
          style={{
            display: "inline-block",
            transform: fit < 1 ? `scale(${fit})` : undefined,
            transformOrigin: "center",
          }}
        >
        {showCountdown ? (
          started ? (
            <span style={{ fontStyle: "italic", fontWeight: 300 }}>now</span>
          ) : (
            <>
              {countdown.hours && <>{countdown.hours}{"\u2009"}</>}
              <span style={{ fontStyle: "italic", fontWeight: 300, opacity: 0.7 }}>
                {countdown.minutes}
              </span>
            </>
          )
        ) : (
          <>
            {clock.hours}
            <span style={{ fontStyle: "italic", fontWeight: 300, opacity: 0.7 }}>
              :{clock.minutes}
            </span>
          </>
        )}
        </span>
      </button>
      <div style={{ marginTop: 14, fontSize: 16, color: t.fgDim, fontWeight: 500 }}>
        {formatRange(result.bestTime, duration)} · {duration}h run
      </div>
      <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            borderRadius: 999,
            background: t.chipBg,
            ...frostedGlass(8),
            fontSize: 14,
            fontWeight: 600,
            color: t.fg,
            border: `1px solid ${t.chipBd}`,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: result.reason === "solar" ? t.sunMid : t.saves,
            }}
          />
          {result.reason === "solar" ? "Catches the most sun" : "Cheapest window"}
        </div>
      </div>
    </div>
  );
}

// Status message in place of the clock cluster (loading / errors / warnings)
export function ClockStatus({
  t,
  title,
  body,
}: {
  t: SkyTheme;
  title: string;
  body?: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: 36,
        right: 36,
        top: "50%",
        transform: "translateY(-50%)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 12,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: t.fgMute,
          fontWeight: 500,
          fontFamily: FONT_MONO,
          marginBottom: 16,
        }}
      >
        Best time today
      </div>
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 30,
          lineHeight: 1.15,
          letterSpacing: "-0.015em",
          color: t.fg,
        }}
      >
        {title}
      </div>
      {body && (
        <div
          style={{
            marginTop: 12,
            fontSize: 14,
            color: t.fgDim,
            lineHeight: 1.55,
          }}
        >
          {body}
        </div>
      )}
    </div>
  );
}

// Bottom glass dock with the duration slider
export function DurationDock({
  t,
  duration,
  onChange,
}: {
  t: SkyTheme;
  duration: number;
  onChange: (value: number) => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: 24,
        right: 24,
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 32px)",
        padding: "20px 22px",
        background: t.glassBg,
        ...frostedGlass(14),
        borderRadius: 28,
        border: `1px solid ${t.glassBd}`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 12,
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: t.fgDim,
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          Run for
        </div>
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: 16,
            fontWeight: 600,
            color: t.fg,
            whiteSpace: "nowrap",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {duration}h
        </div>
      </div>
      <SkySlider
        value={duration}
        min={1}
        max={5}
        t={t}
        labels={["1h", "2h", "3h", "4h", "5h"]}
        onChange={onChange}
      />
    </div>
  );
}
