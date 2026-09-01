import { useState, type ReactNode } from "react";
import { FONT_MONO, FONT_SANS, type SkyTheme } from "@wattlyzer/theme";
import { SkyEditSheet } from "@/components/sky/edit-sheet";
import { SkySlider } from "@/components/sky/primitives";
import { ObSwitchRow, azimuthLabel } from "@/components/sky/rows";

export type SolarConfig = {
  enabled: boolean;
  azimuth: number; // compass degrees, 0=N 90=E 180=S 270=W
  tilt: number; // degrees from horizontal
  sizeKw: number; // kWp
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

// Solar panels modal — panel geometry only. Shading has its own editor.
export function SolarPanelsModal({
  t,
  value,
  eyebrow = "Solar",
  onChange,
  onClose,
}: {
  t: SkyTheme;
  value: SolarConfig;
  eyebrow?: string;
  onChange: (next: SolarConfig) => void;
  onClose: () => void;
}) {
  const [v, setV] = useState(value);
  const set = (patch: Partial<SolarConfig>) =>
    setV((prev) => ({ ...prev, ...patch }));
  const dim = !v.enabled;
  const dismiss = () => {
    onChange(v);
    onClose();
  };
  return (
    <SkyEditSheet
      t={t}
      ariaLabel="Solar panels"
      eyebrow={eyebrow}
      title={
        <>
          Your <span style={{ fontStyle: "italic", fontWeight: 300 }}>panels</span>.
        </>
      }
      onClose={dismiss}
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
      </div>
    </SkyEditSheet>
  );
}
