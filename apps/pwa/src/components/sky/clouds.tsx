import { useId } from "react";
import type { SkyTheme } from "@/lib/sky-theme";
import type { WeatherKind } from "@/lib/weather";

// Smooth vector cloud — one continuous silhouette path (no stacked blobs),
// vertical gradient for volume and a soft blurred highlight on top.
const CLOUD_PATH =
  "M46 96 C24 96 10 82 14 66 C2 54 12 34 32 34 C36 16 62 6 80 18 C92 2 124 2 136 18 C156 8 180 18 182 38 C200 42 208 62 196 76 C204 90 190 100 172 96 Z";

function Cloud({
  left,
  top,
  scale = 1,
  opacity = 0.95,
  tint = "#ffffff",
  shade = "rgba(255,255,255,0.55)",
  flip = false,
  drift = 0,
}: {
  left: number | string;
  top: number | string;
  scale?: number;
  opacity?: number;
  tint?: string;
  shade?: string;
  flip?: boolean;
  /** Drift animation phase — 0 disables, 1..n staggers timing */
  drift?: number;
}) {
  const id = useId();
  const w = 190 * scale,
    h = 95 * scale;
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: w,
        height: h,
        opacity,
        animation: drift
          ? `sky-cloud-drift ${26 + drift * 7}s ease-in-out ${drift * -9}s infinite alternate`
          : undefined,
      }}
    >
      <svg
        viewBox="0 0 212 104"
        width={w}
        height={h}
        style={{
          display: "block",
          overflow: "visible",
          transform: flip ? "scaleX(-1)" : undefined,
          filter: "drop-shadow(0 8px 16px rgba(20,16,30,0.16))",
        }}
      >
        <defs>
          <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tint} />
            <stop offset="62%" stopColor={tint} />
            <stop offset="100%" stopColor={shade} />
          </linearGradient>
          <filter id={`${id}-soft`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <clipPath id={`${id}-clip`}>
            <path d={CLOUD_PATH} />
          </clipPath>
        </defs>
        <path d={CLOUD_PATH} fill={`url(#${id}-body)`} />
        {/* soft top highlight, clipped to the silhouette */}
        <g clipPath={`url(#${id}-clip)`}>
          <ellipse
            cx="92"
            cy="26"
            rx="74"
            ry="26"
            fill="rgba(255,255,255,0.85)"
            filter={`url(#${id}-soft)`}
          />
        </g>
      </svg>
    </div>
  );
}

export function SkySunCloud({
  t,
  sunLeft,
  sunTop,
  sunSize = 120,
}: {
  t: SkyTheme;
  sunLeft: number | string;
  sunTop: number | string;
  sunSize?: number;
}) {
  return (
    <>
      {/* dimmed sun behind */}
      <div
        style={{
          position: "absolute",
          left: sunLeft,
          top: sunTop,
          width: sunSize,
          height: sunSize,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${t.sunCore} 0%, ${t.sunMid} 45%, ${t.sunOuter} 75%, rgba(255,154,60,0) 100%)`,
          boxShadow: `0 0 60px 14px ${t.sunMid}66`,
          opacity: 0.92,
        }}
      />
      {/* drifting cloud overlapping the lower-right of the sun */}
      <Cloud
        left="calc(40% - 30px)"
        top="14%"
        scale={1.05}
        drift={1}
        tint={t.mode === "dark" ? "rgba(245,240,250,0.92)" : "#ffffff"}
        shade={t.mode === "dark" ? "rgba(180,180,200,0.55)" : "rgba(214,210,222,0.85)"}
      />
    </>
  );
}

// Vertical rain streaks under the cloud band. Left/top come from the index
// (never Math.random) so SSR and hydration agree, and the fall is pure CSS so
// the React Compiler can still memoize the component.
function SkyRain({ t }: { t: SkyTheme }) {
  const color =
    t.mode === "dark" ? "rgba(206,220,245,0.55)" : "rgba(96,128,184,0.5)";
  return (
    <>
      {Array.from({ length: 18 }, (_, i) => {
        const left = 6 + (i * 88) / 17; // spread 6% → 94%
        const top = 15 + ((i * 7) % 10); // scattered 15% → 24%
        const dur = 0.85 + (i % 4) * 0.12;
        const delay = -((i * 0.17) % 1.2); // negative → start mid-fall
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${left}%`,
              top: `${top}%`,
              width: 2,
              height: 16,
              borderRadius: 2,
              background: `linear-gradient(to bottom, transparent, ${color} 35%, ${color} 65%, transparent)`,
              transform: "rotate(8deg)",
              animation: `sky-rain-fall ${dur}s linear ${delay}s infinite`,
            }}
          />
        );
      })}
    </>
  );
}

// Drifting snow flakes — slower than rain, with a gentle sideways sway baked
// into the keyframes. Same index-derived, CSS-only approach as SkyRain.
function SkySnow({ t }: { t: SkyTheme }) {
  const color =
    t.mode === "dark" ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.95)";
  return (
    <>
      {Array.from({ length: 16 }, (_, i) => {
        const left = 6 + (i * 88) / 15;
        const top = 14 + ((i * 5) % 11);
        const size = 5 + (i % 3);
        const dur = 3.2 + (i % 5) * 0.5;
        const delay = -((i * 0.4) % 3);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 6px ${color}`,
              animation: `sky-snow-fall ${dur}s linear ${delay}s infinite`,
            }}
          />
        );
      })}
    </>
  );
}

export function SkyClouds({ kind, t }: { kind: WeatherKind; t: SkyTheme }) {
  // rainy/snowy/foggy share a darker, moodier cloud base; overcast keeps the
  // lighter "heavy" grey; cloudy uses the bright white clouds.
  const dark = kind === "rainy" || kind === "snowy" || kind === "foggy";
  const heavy = dark || kind === "overcast";
  const tint = dark
    ? t.mode === "dark"
      ? "rgba(176,180,198,0.92)"
      : "#c7ccd8"
    : heavy
      ? t.mode === "dark"
        ? "rgba(210,212,225,0.85)"
        : "#eceef3"
      : t.mode === "dark"
        ? "rgba(240,238,250,0.94)"
        : "#ffffff";
  const shade = dark
    ? t.mode === "dark"
      ? "rgba(120,124,144,0.85)"
      : "rgba(128,134,152,0.95)"
    : heavy
      ? t.mode === "dark"
        ? "rgba(150,152,170,0.7)"
        : "rgba(176,180,196,0.9)"
      : t.mode === "dark"
        ? "rgba(195,195,215,0.6)"
        : "rgba(214,210,222,0.85)";
  return (
    <>
      <Cloud left="4%" top="9%" scale={1.2} drift={1} opacity={heavy ? 0.96 : 0.94} tint={tint} shade={shade} />
      <Cloud left="52%" top="4%" scale={0.8} drift={2} flip opacity={heavy ? 0.9 : 0.8} tint={tint} shade={shade} />
      <Cloud left="30%" top="21%" scale={1.0} drift={3} opacity={heavy ? 0.92 : 0.85} tint={tint} shade={shade} />
      {heavy && (
        <Cloud left="64%" top="19%" scale={1.05} drift={4} flip opacity={0.9} tint={tint} shade={shade} />
      )}
      {kind === "rainy" && <SkyRain t={t} />}
      {kind === "snowy" && <SkySnow t={t} />}
    </>
  );
}
