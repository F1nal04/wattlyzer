import type { ReactNode } from "react";
import { FONT_MONO, FONT_SANS, type SkyTheme } from "@wattlyzer/theme";
import { WIcon, type WIconName } from "@/components/sky/icons";
import { SkySwitch } from "@/components/sky/primitives";

// These onboarding rows intentionally use translucent fills without
// backdrop-filter. macOS Safari caches the old sky inside a backdrop layer
// when the user changes the onboarding theme and only refreshes it after a
// later interaction or screenshot.
export function ObSwitchRow({
  t,
  icon,
  title,
  subtitle,
  checked,
  onChange,
}: {
  t: SkyTheme;
  icon: WIconName;
  title: string;
  subtitle?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 16px",
        background: t.glassBg,
        borderRadius: 18,
        border: `1px solid ${t.glassBd}`,
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        fontFamily: FONT_SANS,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          flexShrink: 0,
          background:
            t.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(26,20,16,0.06)",
          border: `1px solid ${t.glassBd}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <WIcon name={icon} size={22} color={t.fg} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: t.fg, marginBottom: 2 }}>
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: 12.5,
              color: t.fgDim,
              fontFamily: FONT_MONO,
              letterSpacing: "0.02em",
              // Wrap long text instead of truncating so nothing is occluded
              // by the trailing control (matches SetToggleRow in settings).
              overflowWrap: "anywhere",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
      <SkySwitch checked={checked} t={t} />
    </button>
  );
}

export function ObCheckRow({
  t,
  checked,
  onChange,
  label,
}: {
  t: SkyTheme;
  checked: boolean;
  onChange: () => void;
  label: ReactNode;
}) {
  const boxBd =
    t.mode === "dark" ? "rgba(255,255,255,0.55)" : "rgba(26,20,16,0.55)";
  return (
    <button
      onClick={onChange}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px 14px",
        background: t.glassBg,
        borderRadius: 14,
        border: `1px solid ${t.glassBd}`,
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        fontFamily: FONT_SANS,
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          flexShrink: 0,
          marginTop: 1,
          background: checked
            ? t.fg
            : t.mode === "dark"
              ? "rgba(0,0,0,0.25)"
              : "rgba(255,255,255,0.55)",
          border: `1.8px solid ${checked ? t.fg : boxBd}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 140ms ease, border-color 140ms ease",
        }}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 6.2 L5 8.7 L9.5 3.5"
              stroke={t.mode === "dark" ? "#1a1410" : "#fff"}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <div
        style={{
          fontSize: 12.5,
          color: t.fg,
          lineHeight: 1.5,
          flex: 1,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </button>
  );
}

export function ObCard({
  t,
  icon,
  title,
  status,
  action,
  onClick,
}: {
  t: SkyTheme;
  icon: WIconName;
  title: string;
  status: string;
  action: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 16px",
        background: t.glassBg,
        borderRadius: 18,
        border: `1px solid ${t.glassBd}`,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          flexShrink: 0,
          background:
            t.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(26,20,16,0.06)",
          border: `1px solid ${t.glassBd}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <WIcon name={icon} size={22} color={t.fg} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: t.fg, marginBottom: 2 }}>
          {title}
        </div>
        <div
          style={{
            fontSize: 12.5,
            color: t.fgDim,
            fontFamily: FONT_MONO,
            letterSpacing: "0.02em",
            // Wrap long text instead of truncating so nothing is occluded
            // by the trailing control (matches SetToggleRow in settings).
            overflowWrap: "anywhere",
          }}
        >
          {status}
        </div>
      </div>
      <button
        style={{
          background: "transparent",
          border: `1px solid ${t.glassBd}`,
          color: t.fg,
          fontSize: 12,
          fontWeight: 600,
          padding: "7px 12px",
          borderRadius: 999,
          fontFamily: FONT_SANS,
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        {action}
      </button>
    </div>
  );
}

export function azimuthLabel(deg: number) {
  // 8-pt compass
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const idx = Math.round((((deg % 360) + 360) % 360) / 45) % 8;
  return dirs[idx];
}
