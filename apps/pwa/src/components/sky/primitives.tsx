import { useEffect, type CSSProperties, type ReactNode } from "react";
import { FONT_MONO, FONT_SANS, type SkyTheme } from "@wattlyzer/theme";
import { frostedGlass } from "@/components/sky/glass";
import { WIcon } from "@/components/sky/icons";
import { isBestSlotModeSelectable } from "@/components/sky/solar";
import type { BestSlotMode, SearchWindow } from "@/lib/settings";

// Close sheets/modals on Escape
export function useEscapeKey(onEscape: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onEscape]);
}

// Full-viewport screen wrapper. The design canvas was a 360x780 phone frame;
// in the real app the sky fills the viewport and content is capped for desktop.
export function SkyScreen({
  background,
  color,
  children,
}: {
  background: string;
  color: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background,
        fontFamily: FONT_SANS,
        color,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 430,
          height: "100%",
          margin: "0 auto",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function Hills({
  t,
  height = "32%",
  opacity = 0.72,
}: {
  t: SkyTheme;
  height?: string;
  opacity?: number;
}) {
  const c3 = t.sky[2];
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height,
        background: `radial-gradient(ellipse 70% 60% at 20% 100%, ${c3} 50%, transparent 51%),
          radial-gradient(ellipse 80% 70% at 70% 100%, ${c3} 55%, transparent 56%),
          radial-gradient(ellipse 60% 55% at 100% 100%, ${c3} 50%, transparent 51%)`,
        filter: "brightness(0.85) saturate(1.1)",
        opacity,
      }}
    />
  );
}

const invisibleRangeStyle: CSSProperties = {
  WebkitAppearance: "none",
  appearance: "none",
  position: "absolute",
  left: -12,
  right: -12,
  top: 0,
  width: "calc(100% + 24px)",
  height: 34,
  margin: 0,
  background: "transparent",
  outline: "none",
  opacity: 0.001,
  cursor: "pointer",
  zIndex: 2,
};

// Sky-themed slider — flat track, solid disc thumb, mono tick labels.
// An invisible native range input on top handles the interaction.
export function SkySlider({
  value,
  min = 1,
  max = 5,
  step = 1,
  t,
  labels,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  t: SkyTheme;
  labels?: (string | number)[];
  onChange?: (value: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const ticks =
    labels || Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div
      style={{
        position: "relative",
        height: 50,
        display: "flex",
        alignItems: "flex-start",
        paddingTop: 9,
      }}
    >
      {/* track */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 12,
          height: 6,
          borderRadius: 999,
          background:
            t.mode === "dark" ? "rgba(255,255,255,0.18)" : "rgba(26,20,16,0.12)",
        }}
      />
      {/* filled — flat tone, no glow */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 12,
          width: `${pct}%`,
          height: 6,
          borderRadius: 999,
          background: t.mode === "dark" ? "rgba(255,255,255,0.85)" : "#1a1410",
        }}
      />
      {/* thumb — solid disc, no glow */}
      <div
        style={{
          position: "absolute",
          left: `calc(${pct}% - 12px)`,
          top: 3,
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: t.mode === "dark" ? "#fff" : "#1a1410",
          border: t.mode === "dark" ? "none" : "2px solid #1a1410",
          boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
        }}
      />
      {onChange && (
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={invisibleRangeStyle}
        />
      )}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 36,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10,
          fontFamily: FONT_MONO,
          color: t.fgMute,
        }}
      >
        {ticks.map((n, i) => (
          <span key={i}>{n}</span>
        ))}
      </div>
    </div>
  );
}

// Mode segmented control, theme-aware
export function SkyModeSeg({
  value,
  onChange,
  t,
  solarEnabled = true,
}: {
  value: BestSlotMode;
  onChange?: (value: BestSlotMode) => void;
  t: SkyTheme;
  solarEnabled?: boolean;
}) {
  const opts = [
    { v: "combined", label: "Both", icon: "scale" },
    { v: "solar-only", label: "Solar", icon: "sun" },
    { v: "price-only", label: "Price", icon: "euro" },
  ] as const;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 4,
        padding: 4,
        background:
          t.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(26,20,16,0.05)",
        borderRadius: 14,
        border: `1px solid ${t.glassBd}`,
      }}
    >
      {opts.map((o) => {
        const active = value === o.v;
        const selectable = isBestSlotModeSelectable(o.v, solarEnabled);
        return (
          <button
            key={o.v}
            type="button"
            disabled={!selectable}
            aria-disabled={!selectable}
            aria-label={selectable ? undefined : `${o.label}, unavailable`}
            onClick={() => selectable && onChange && onChange(o.v)}
            style={{
              border: "none",
              cursor: selectable ? "pointer" : "not-allowed",
              padding: "9px 6px",
              borderRadius: 10,
              fontFamily: FONT_SANS,
              fontSize: 12,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              opacity: selectable ? 1 : 0.4,
              background: active
                ? t.mode === "dark"
                  ? "rgba(255,255,255,0.92)"
                  : "#fff"
                : "transparent",
              color: active ? "#1a1410" : t.fgDim,
              boxShadow: active ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
            }}
          >
            <WIcon name={o.icon} size={14} />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// Search window chips, theme-aware — centered, glass background, visible border
export function SearchWindowChips({
  value,
  onChange,
  t,
}: {
  value: SearchWindow;
  onChange?: (value: SearchWindow) => void;
  t: SkyTheme;
}) {
  const opts = [
    { v: "3", label: "3h" },
    { v: "6", label: "6h" },
    { v: "12", label: "12h" },
    { v: "24", label: "24h" },
    { v: "eod", label: "EOD" },
  ] as const;
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      {opts.map((c) => {
        const active = c.v === value;
        return (
          <button
            key={c.v}
            onClick={() => onChange && onChange(c.v)}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              border: `1px solid ${
                active
                  ? "transparent"
                  : t.mode === "dark"
                    ? "rgba(255,255,255,0.55)"
                    : "rgba(26,20,16,0.45)"
              }`,
              background: active
                ? t.mode === "dark"
                  ? "#fff"
                  : "#1a1410"
                : t.mode === "dark"
                  ? "rgba(255,255,255,0.10)"
                  : "rgba(255,255,255,0.45)",
              color: active
                ? t.mode === "dark"
                  ? "#1a1410"
                  : "#fff8e7"
                : t.fg,
              fontFamily: FONT_SANS,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

// App bar + icon button (theme-aware)
export function SkyAppBar({
  left,
  right,
  title,
  subtle,
  t,
}: {
  left?: ReactNode;
  right?: ReactNode;
  title?: string;
  subtle?: string;
  t: SkyTheme;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: "calc(env(safe-area-inset-top, 0px) + 16px)",
        left: 16,
        right: 16,
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 5,
      }}
    >
      <div>{left}</div>
      {title && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 14,
            fontWeight: 600,
            color: t.fg,
            fontFamily: FONT_SANS,
            pointerEvents: "none",
          }}
        >
          {title}
          {subtle && (
            <div
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: t.fgMute,
                fontFamily: FONT_MONO,
                letterSpacing: "0.1em",
                marginTop: 1,
              }}
            >
              {subtle}
            </div>
          )}
        </div>
      )}
      <div>{right}</div>
    </div>
  );
}

export function SkyIconBtn({
  children,
  onClick,
  label,
  t,
  blurBackdrop = true,
}: {
  children: ReactNode;
  onClick?: () => void;
  label?: string;
  t: SkyTheme;
  blurBackdrop?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: 38,
        height: 38,
        borderRadius: 999,
        background: t.glassBg,
        border: `1px solid ${t.glassBd}`,
        ...(blurBackdrop ? frostedGlass(10) : undefined),
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: t.fg,
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  right,
  children,
  t,
}: {
  label: string;
  right?: ReactNode;
  children: ReactNode;
  t: SkyTheme;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontFamily: FONT_MONO,
            color: t.fgMute,
            letterSpacing: "0.12em",
          }}
        >
          {label.toUpperCase()}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

export function Display({ children, t }: { children: ReactNode; t: SkyTheme }) {
  return (
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
      {children}
    </div>
  );
}

export function SkySwitch({ checked, t }: { checked: boolean; t: SkyTheme }) {
  const onBg = t.fg;
  const offBg =
    t.mode === "dark" ? "rgba(255,255,255,0.18)" : "rgba(26,20,16,0.18)";
  return (
    <div
      style={{
        width: 46,
        height: 28,
        borderRadius: 999,
        flexShrink: 0,
        background: checked ? onBg : offBg,
        position: "relative",
        transition: "background 180ms ease",
        border: `1px solid ${t.glassBd}`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 20 : 2,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 180ms ease",
          boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
        }}
      />
    </div>
  );
}

export function SkyPrimaryButton({
  children,
  onClick,
  t,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  t: SkyTheme;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "16px 22px",
        border: t.mode === "dark" ? "none" : "1.5px solid #1a1410",
        background: t.mode === "dark" ? "#fff" : "#1a1410",
        color: t.mode === "dark" ? "#1a1410" : "#fff8e7",
        borderRadius: 16,
        cursor: disabled ? "default" : "pointer",
        fontFamily: FONT_SANS,
        fontSize: 15,
        fontWeight: 600,
        letterSpacing: "0.01em",
        opacity: disabled ? 0.45 : 1,
        transition: "opacity 180ms ease",
      }}
    >
      {children}
    </button>
  );
}
