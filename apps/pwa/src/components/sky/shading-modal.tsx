import { useState } from "react";
import { FONT_MONO, FONT_SANS, type SkyTheme } from "@wattlyzer/theme";
import { SkyEditSheet } from "@/components/sky/edit-sheet";
import { SkySlider } from "@/components/sky/primitives";
import { ObSwitchRow } from "@/components/sky/rows";
import {
  formatShadingHour,
  shadingHourTicks,
  shadingRange,
  type ShadingKind,
  type ShadingSetup,
  type ShadingWindow,
} from "@/components/sky/shading";

function shadingCopy(kind: ShadingKind) {
  if (kind === "morning") {
    return {
      enableTitle: "Morning shading",
      enableSubtitle: "Until trees or buildings block the low sun",
      hourLabel: "Shade ends",
      icon: "sun" as const,
    };
  }
  return {
    enableTitle: "Evening shading",
    enableSubtitle: "From when trees or buildings block the low sun",
    hourLabel: "Shade starts",
    icon: "moon" as const,
  };
}

function ShadingWindowEditor({
  t,
  kind,
  value,
  onChange,
}: {
  t: SkyTheme;
  kind: ShadingKind;
  value: ShadingWindow;
  onChange: (next: ShadingWindow) => void;
}) {
  const copy = shadingCopy(kind);
  const range = shadingRange(kind);
  const dim = !value.enabled;
  return (
    <div>
      <ObSwitchRow
        t={t}
        icon={copy.icon}
        title={copy.enableTitle}
        subtitle={copy.enableSubtitle}
        checked={value.enabled}
        onChange={() => onChange({ ...value, enabled: !value.enabled })}
      />
      <div
        style={{
          marginTop: 16,
          opacity: dim ? 0.4 : 1,
          pointerEvents: dim ? "none" : "auto",
          transition: "opacity 180ms ease",
        }}
      >
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
            {copy.hourLabel}
          </div>
          <div
            style={{
              fontFamily: FONT_SANS,
              fontSize: 16,
              fontWeight: 600,
              color: t.fg,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatShadingHour(value.hour)}
          </div>
        </div>
        <SkySlider
          value={value.hour}
          min={range.min}
          max={range.max}
          step={1}
          t={t}
          labels={shadingHourTicks(range.min, range.max)}
          onChange={(hour) => onChange({ ...value, hour })}
        />
      </div>
    </div>
  );
}

export function ShadingModal({
  t,
  value,
  eyebrow = "Shading",
  onChange,
  onClose,
}: {
  t: SkyTheme;
  value: ShadingSetup;
  eyebrow?: string;
  onChange: (next: ShadingSetup) => void;
  onClose: () => void;
}) {
  const [v, setV] = useState(value);
  const dismiss = () => {
    onChange(v);
    onClose();
  };
  return (
    <SkyEditSheet
      t={t}
      ariaLabel="Roof shading"
      eyebrow={eyebrow}
      title={
        <>
          Roof <span style={{ fontStyle: "italic", fontWeight: 300 }}>shade</span>.
        </>
      }
      onClose={dismiss}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        <ShadingWindowEditor
          t={t}
          kind="morning"
          value={v.morning}
          onChange={(morning) => setV((prev) => ({ ...prev, morning }))}
        />
        <ShadingWindowEditor
          t={t}
          kind="evening"
          value={v.evening}
          onChange={(evening) => setV((prev) => ({ ...prev, evening }))}
        />
      </div>
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
    </SkyEditSheet>
  );
}
