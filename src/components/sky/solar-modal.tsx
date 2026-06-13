import { useState, type ReactNode } from "react";
import {
  FONT_DISPLAY,
  FONT_MONO,
  FONT_SANS,
  type SkyTheme,
} from "@/lib/sky-theme";
import { SkySlider, SkySwitch, useEscapeKey } from "@/components/sky/primitives";
import { ObSwitchRow, azimuthLabel } from "@/components/sky/rows";

export type SolarConfig = {
  enabled: boolean;
  azimuth: number; // compass degrees, 0=N 90=E 180=S 270=W
  tilt: number; // degrees from horizontal
  sizeKw: number; // kWp
  morningOn: boolean;
  morningHour: number; // shading until
  eveningOn: boolean;
  eveningHour: number; // shading from
};

function ModalField({
  t,
  label,
  right,
  children,
}: {
  t: SkyTheme;
  label: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 11.5,
            letterSpacing: "0.16em",
            color: t.fgMute,
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function ModalDisplay({ t, children }: { t: SkyTheme; children: ReactNode }) {
  return (
    <div
      style={{
        fontFamily: FONT_SANS,
        fontSize: 16,
        fontWeight: 600,
        color: t.fg,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {children}
    </div>
  );
}

// Shading item — toggle + hour slider
function ShadingItem({
  t,
  kind,
  enabled,
  hour,
  onToggle,
  onHour,
}: {
  t: SkyTheme;
  kind: "morning" | "evening";
  enabled: boolean;
  hour: number;
  onToggle: () => void;
  onHour: (h: number) => void;
}) {
  const isMorning = kind === "morning";
  const label = isMorning ? "Morning shade" : "Evening shade";
  const sub = isMorning ? "Until" : "From";
  const Arrow = () => (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke={t.fg}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3.5" />
      {isMorning ? (
        <>
          <path d="M3 18h18" />
          <polyline points="8,9 12,5 16,9" />
        </>
      ) : (
        <>
          <path d="M3 18h18" />
          <polyline points="8,12 12,16 16,12" />
        </>
      )}
    </svg>
  );
  const min = isMorning ? 5 : 14;
  const max = isMorning ? 12 : 22;
  // Labels are spread evenly, so only label hours that actually divide the
  // range evenly — otherwise the labels sit at the wrong slider positions
  const tickStep = (max - min) / 4;
  const ticks = Number.isInteger(tickStep)
    ? Array.from({ length: 5 }, (_, i) => `${min + i * tickStep}:00`)
    : [`${min}:00`, `${max}:00`];

  const fmt = (h: number) => `${String(Math.floor(h)).padStart(2, "0")}:00`;

  const dim = !enabled;
  return (
    <div
      style={{
        padding: 0,
        overflow: "hidden",
        background: t.glassBg,
        borderRadius: 16,
        border: `1px solid ${t.glassBd}`,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          width: "100%",
          padding: "14px 14px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontFamily: FONT_SANS,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            flexShrink: 0,
            background:
              t.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(26,20,16,0.05)",
            border: `1px solid ${t.glassBd}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Arrow />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: t.fg }}>{label}</div>
          <div
            style={{
              fontSize: 11.5,
              color: t.fgMute,
              fontFamily: FONT_MONO,
              letterSpacing: "0.06em",
              marginTop: 2,
              textTransform: "uppercase",
            }}
          >
            {enabled ? `${sub} ${fmt(hour)}` : "Off"}
          </div>
        </div>
        <SkySwitch checked={enabled} t={t} />
      </button>
      <div
        style={{
          padding: "0 14px 14px",
          opacity: dim ? 0.35 : 1,
          pointerEvents: dim ? "none" : "auto",
          transition: "opacity 160ms ease",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 6,
          }}
        >
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10.5,
              letterSpacing: "0.14em",
              color: t.fgMute,
              textTransform: "uppercase",
            }}
          >
            {isMorning ? "Shade ends" : "Shade starts"}
          </div>
          <div
            style={{
              fontFamily: FONT_SANS,
              fontSize: 14,
              fontWeight: 600,
              color: t.fg,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {fmt(hour)}
          </div>
        </div>
        <SkySlider value={hour} min={min} max={max} step={1} t={t} labels={ticks} onChange={onHour} />
      </div>
    </div>
  );
}

// Solar panels modal — bottom sheet with fixed header, scrollable body,
// fixed Cancel/Save actions.
export function SolarPanelsModal({
  t,
  value,
  eyebrow = "Solar",
  onSave,
  onClose,
}: {
  t: SkyTheme;
  value: SolarConfig;
  eyebrow?: string;
  onSave: (next: SolarConfig) => void;
  onClose: () => void;
}) {
  const [v, setV] = useState(value);
  const set = (patch: Partial<SolarConfig>) =>
    setV((prev) => ({ ...prev, ...patch }));
  const dim = !v.enabled;
  useEscapeKey(onClose);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Solar panels"
      style={{ position: "absolute", inset: 0, zIndex: 30, fontFamily: FONT_SANS }}
    >
      {/* scrim */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background:
            t.mode === "dark" ? "rgba(8,6,4,0.62)" : "rgba(26,20,16,0.42)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
        }}
      />

      {/* sheet */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          top: "calc(env(safe-area-inset-top, 0px) + 40px)",
          background: t.mode === "dark" ? "#1a1410" : "#fff8e7",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          boxShadow: "0 -20px 60px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "sky-sheet-up 260ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* grabber */}
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 999,
            margin: "10px auto 14px",
            flexShrink: 0,
            background:
              t.mode === "dark" ? "rgba(255,255,255,0.18)" : "rgba(26,20,16,0.18)",
          }}
        />

        {/* header — fixed */}
        <div
          style={{
            padding: "0 22px",
            flexShrink: 0,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 11,
                letterSpacing: "0.22em",
                color: t.fgMute,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              {eyebrow}
            </div>
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 26,
                lineHeight: 1.05,
                letterSpacing: "-0.015em",
                color: t.fg,
              }}
            >
              Your <span style={{ fontStyle: "italic", fontWeight: 300 }}>panels</span>.
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              flexShrink: 0,
              background: "transparent",
              border: `1px solid ${t.glassBd}`,
              color: t.fg,
              cursor: "pointer",
              fontSize: 16,
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_SANS,
            }}
          >
            ×
          </button>
        </div>

        {/* scrollable body */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "18px 22px 8px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <ObSwitchRow
            t={t}
            icon="sun"
            title="I have solar panels"
            subtitle={
              v.enabled
                ? "Forecast uses your roof setup"
                : "Skip — Wattlyzer uses spot price only"
            }
            checked={v.enabled}
            onChange={() => set({ enabled: !v.enabled })}
          />

          {/* fields, dimmed when no solar */}
          <div
            style={{
              marginTop: 22,
              opacity: dim ? 0.4 : 1,
              pointerEvents: dim ? "none" : "auto",
              transition: "opacity 180ms ease",
              display: "flex",
              flexDirection: "column",
              gap: 26,
            }}
          >
            <ModalField
              t={t}
              label="Orientation"
              right={
                <ModalDisplay t={t}>
                  {azimuthLabel(v.azimuth)} · {Math.round(v.azimuth)}°
                </ModalDisplay>
              }
            >
              <SkySlider
                value={v.azimuth}
                min={0}
                max={360}
                step={5}
                t={t}
                labels={["N", "E", "S", "W", "N"]}
                onChange={(value) => set({ azimuth: Math.round(value) })}
              />
            </ModalField>

            <ModalField t={t} label="Roof tilt" right={<ModalDisplay t={t}>{v.tilt}°</ModalDisplay>}>
              <SkySlider
                value={v.tilt}
                min={0}
                max={60}
                step={1}
                t={t}
                labels={["0°", "15°", "30°", "45°", "60°"]}
                onChange={(value) => set({ tilt: Math.round(value) })}
              />
            </ModalField>

            <ModalField
              t={t}
              label="System size"
              right={<ModalDisplay t={t}>{v.sizeKw.toFixed(1)} kWp</ModalDisplay>}
            >
              <SkySlider
                value={v.sizeKw}
                min={1}
                max={20}
                step={0.1}
                t={t}
                labels={["1", "5", "10", "15", "20"]}
                onChange={(value) => set({ sizeKw: value })}
              />
              <div
                style={{
                  fontSize: 11.5,
                  color: t.fgMute,
                  fontFamily: FONT_MONO,
                  letterSpacing: "0.06em",
                  marginTop: 8,
                }}
              >
                PEAK PRODUCTION UNDER FULL SUN
              </div>
            </ModalField>

            <ModalField t={t} label="Shading">
              <ShadingItem
                t={t}
                kind="morning"
                enabled={v.morningOn}
                hour={v.morningHour}
                onToggle={() => set({ morningOn: !v.morningOn })}
                onHour={(h) => set({ morningHour: h })}
              />
              <div style={{ height: 14 }} />
              <ShadingItem
                t={t}
                kind="evening"
                enabled={v.eveningOn}
                hour={v.eveningHour}
                onToggle={() => set({ eveningOn: !v.eveningOn })}
                onHour={(h) => set({ eveningHour: h })}
              />
              <div
                style={{
                  fontSize: 11.5,
                  color: t.fgMute,
                  fontFamily: FONT_MONO,
                  letterSpacing: "0.06em",
                  marginTop: 14,
                }}
              >
                WHEN TREES OR BUILDINGS BLOCK THE LOW SUN
              </div>
            </ModalField>
          </div>
        </div>

        {/* actions — fixed */}
        <div
          style={{
            padding: "14px 22px calc(env(safe-area-inset-bottom, 0px) + 22px)",
            flexShrink: 0,
            borderTop: `1px solid ${t.glassBd}`,
            background: t.mode === "dark" ? "#1a1410" : "#fff8e7",
            display: "flex",
            gap: 10,
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "15px 18px",
              background: "transparent",
              color: t.fg,
              border: `1px solid ${t.glassBd}`,
              borderRadius: 16,
              cursor: "pointer",
              fontFamily: FONT_SANS,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(v)}
            style={{
              flex: 2,
              padding: "15px 18px",
              border: t.mode === "dark" ? "none" : "1.5px solid #1a1410",
              background: t.mode === "dark" ? "#fff" : "#1a1410",
              color: t.mode === "dark" ? "#1a1410" : "#fff8e7",
              borderRadius: 16,
              cursor: "pointer",
              fontFamily: FONT_SANS,
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "0.01em",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
