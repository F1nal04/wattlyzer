import type { CSSProperties } from "react";

export type WIconName =
  | "cloud"
  | "sunCloud"
  | "cloudRain"
  | "settings"
  | "sliders"
  | "back"
  | "sun"
  | "euro"
  | "scale";

export function WIcon({
  name,
  size = 18,
  color = "currentColor",
}: {
  name: WIconName;
  size?: number;
  color?: string;
}) {
  const cloudPath =
    "M7 17h10a4 4 0 0 0 0.6-7.96A6 6 0 0 0 6 10.5 4 4 0 0 0 7 17z";
  const s: CSSProperties = {
    width: size,
    height: size,
    display: "inline-block",
    verticalAlign: "middle",
  };
  if (name === "cloud")
    return (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d={cloudPath} />
      </svg>
    );
  if (name === "sunCloud")
    return (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="3" />
        <line x1="8" y1="2" x2="8" y2="3.5" />
        <line x1="8" y1="12.5" x2="8" y2="14" />
        <line x1="2" y1="8" x2="3.5" y2="8" />
        <line x1="12.5" y1="8" x2="14" y2="8" />
        <path d={cloudPath} />
      </svg>
    );
  if (name === "cloudRain")
    return (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d={cloudPath} />
        <line x1="9" y1="19" x2="8" y2="22" />
        <line x1="13" y1="19" x2="12" y2="22" />
        <line x1="17" y1="19" x2="16" y2="22" />
      </svg>
    );
  if (name === "settings")
    return (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round">
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r="9" strokeDasharray="2 3" />
      </svg>
    );
  if (name === "sliders")
    return (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round">
        <line x1="4" y1="8" x2="20" y2="8" />
        <circle cx="9" cy="8" r="2.5" fill={color} />
        <line x1="4" y1="16" x2="20" y2="16" />
        <circle cx="15" cy="16" r="2.5" fill={color} />
      </svg>
    );
  if (name === "back")
    return (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15,5 8,12 15,19" />
      </svg>
    );
  if (name === "sun")
    return (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
          const r = (a * Math.PI) / 180;
          return (
            <line
              key={a}
              x1={12 + Math.cos(r) * 7}
              y1={12 + Math.sin(r) * 7}
              x2={12 + Math.cos(r) * 10}
              y2={12 + Math.sin(r) * 10}
            />
          );
        })}
      </svg>
    );
  if (name === "euro")
    return (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 5a7 7 0 1 0 0 14" />
        <line x1="5" y1="10" x2="14" y2="10" />
        <line x1="5" y1="14" x2="14" y2="14" />
      </svg>
    );
  if (name === "scale")
    return (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round">
        <line x1="12" y1="4" x2="12" y2="20" />
        <circle cx="6" cy="10" r="3" />
        <circle cx="18" cy="10" r="3" />
        <line x1="4" y1="20" x2="20" y2="20" />
      </svg>
    );
  return null;
}

export type InstGlyphKind =
  | "share"
  | "plus-square"
  | "dots-vert"
  | "home"
  | "check";

export function InstGlyph({
  kind,
  size = 20,
  color = "currentColor",
}: {
  kind: InstGlyphKind;
  size?: number;
  color?: string;
}) {
  const s: CSSProperties = {
    width: size,
    height: size,
    display: "inline-block",
    verticalAlign: "middle",
  };
  const sw = 1.7;
  if (kind === "share")
    return (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3 V15" />
        <polyline points="8,7 12,3 16,7" />
        <path d="M5 12 V20 H19 V12" />
      </svg>
    );
  if (kind === "plus-square")
    return (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    );
  if (kind === "dots-vert")
    return (
      <svg viewBox="0 0 24 24" style={s} fill={color} stroke="none">
        <circle cx="12" cy="5" r="1.7" />
        <circle cx="12" cy="12" r="1.7" />
        <circle cx="12" cy="19" r="1.7" />
      </svg>
    );
  if (kind === "home")
    return (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 11 L12 4 L20 11" />
        <path d="M6 10 V20 H18 V10" />
      </svg>
    );
  if (kind === "check")
    return (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="5,12 10,17 19,7" />
      </svg>
    );
  return null;
}
