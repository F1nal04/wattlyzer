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
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
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
        <circle cx="12" cy="12" r="8.5" />
        <path d="M14.8 8.7a3.9 3.9 0 1 0 0 6.6" />
        <line x1="8.6" y1="10.9" x2="12.8" y2="10.9" />
        <line x1="8.6" y1="13.1" x2="12.8" y2="13.1" />
      </svg>
    );
  if (name === "scale")
    return (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="3.5" x2="12" y2="21" />
        <line x1="5" y1="6" x2="19" y2="6" />
        <path d="M5 6 L2.6 11 M5 6 L7.4 11 M2.2 11 a2.8 2.8 0 0 0 5.6 0" />
        <path d="M19 6 L16.6 11 M19 6 L21.4 11 M16.2 11 a2.8 2.8 0 0 0 5.6 0" />
        <line x1="8.5" y1="21" x2="15.5" y2="21" />
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
