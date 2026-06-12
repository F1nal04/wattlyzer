import type { SkyTheme } from "@/lib/sky-theme";

export function Cloud({
  left,
  top,
  scale = 1,
  opacity = 0.95,
  tint = "#ffffff",
  shade = "rgba(255,255,255,0.55)",
}: {
  left: number | string;
  top: number | string;
  scale?: number;
  opacity?: number;
  tint?: string;
  shade?: string;
}) {
  // Composed from overlapping circles via radial-gradients on a single box.
  // Soft top highlight + slightly darker bottom for volume.
  const w = 180 * scale,
    h = 90 * scale;
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: w,
        height: h,
        opacity,
        filter: "drop-shadow(0 6px 14px rgba(20,16,30,0.18))",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
          radial-gradient(ellipse 30% 70% at 18% 70%, ${shade} 0%, ${tint} 55%, rgba(255,255,255,0) 60%),
          radial-gradient(ellipse 28% 90% at 38% 45%, ${tint} 0%, ${tint} 55%, rgba(255,255,255,0) 60%),
          radial-gradient(ellipse 22% 80% at 58% 35%, ${tint} 0%, ${tint} 55%, rgba(255,255,255,0) 60%),
          radial-gradient(ellipse 26% 80% at 76% 50%, ${tint} 0%, ${tint} 55%, rgba(255,255,255,0) 60%),
          radial-gradient(ellipse 20% 65% at 88% 70%, ${shade} 0%, ${tint} 55%, rgba(255,255,255,0) 60%)
        `,
        }}
      />
      {/* highlight ribbon */}
      <div
        style={{
          position: "absolute",
          left: "20%",
          right: "20%",
          top: "18%",
          height: "18%",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0))",
          borderRadius: "50%",
          filter: "blur(6px)",
          opacity: 0.7,
        }}
      />
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
        tint={t.mode === "dark" ? "rgba(245,240,250,0.92)" : "#ffffff"}
        shade={t.mode === "dark" ? "rgba(180,180,200,0.55)" : "rgba(220,215,225,0.7)"}
      />
    </>
  );
}

export function SkyClouds({ heavy, t }: { heavy: boolean; t: SkyTheme }) {
  // Layered puffs at varied scales — heavier overcast = more clouds, dimmer
  const tint = heavy
    ? t.mode === "dark"
      ? "rgba(210,212,225,0.82)"
      : "#e9eaf0"
    : t.mode === "dark"
      ? "rgba(240,238,250,0.92)"
      : "#ffffff";
  const shade = heavy
    ? t.mode === "dark"
      ? "rgba(150,152,170,0.6)"
      : "rgba(180,182,195,0.7)"
    : t.mode === "dark"
      ? "rgba(195,195,215,0.55)"
      : "rgba(220,215,225,0.7)";
  return (
    <>
      <Cloud left="6%" top="11%" scale={1.15} opacity={heavy ? 0.95 : 0.92} tint={tint} shade={shade} />
      <Cloud left="48%" top="6%" scale={0.85} opacity={heavy ? 0.92 : 0.85} tint={tint} shade={shade} />
      <Cloud left="28%" top="22%" scale={1.0} opacity={heavy ? 0.9 : 0.78} tint={tint} shade={shade} />
      {heavy && (
        <Cloud left="62%" top="20%" scale={1.1} opacity={0.88} tint={tint} shade={shade} />
      )}
    </>
  );
}
