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
  type ShadingWindow,
} from "@/components/sky/shading";

function shadingCopy(kind: ShadingKind) {
  if (kind === "morning") {
    return {
      ariaLabel: "Morning shading",
      titleLead: "Morning",
      enableTitle: "Morning shading",
      enableSubtitle: "Until trees or buildings block the low sun",
      hourLabel: "Shade ends",
      icon: "sun" as const,
    };
  }
  return {
    ariaLabel: "Evening shading",
    titleLead: "Evening",
    enableTitle: "Evening shading",
    enableSubtitle: "From when trees or buildings block the low sun",
    hourLabel: "Shade starts",
    icon: "moon" as const,
  };
}

export function ShadingModal({
  t,
  kind,
  value,
  eyebrow = "Shading",
  onSave,
  onClose,
}: {
  t: SkyTheme;
  kind: ShadingKind;
  value: ShadingWindow;
  eyebrow?: string;
  onSave: (next: ShadingWindow) => void;
  onClose: () => void;
}) {
  const [v, setV] = useState(value);
  const copy = shadingCopy(kind);
  const range = shadingRange(kind);
  const dim = !v.enabled;
  return (
    <SkyEditSheet
      t={t}
      ariaLabel={copy.ariaLabel}
      eyebrow={eyebrow}
      title={
        <>
          {copy.titleLead}{" "}
          <span style={{ fontStyle: "italic", fontWeight: 300 }}>shade</span>.
        </>
      }
      onClose={onClose}
      onSave={() => onSave(v)}
    >
      <ObSwitchRow
        t={t}
        icon={copy.icon}
        title={copy.enableTitle}
        subtitle={copy.enableSubtitle}
        checked={v.enabled}
        onChange={() => setV((prev) => ({ ...prev, enabled: !prev.enabled }))}
      />

      <div
        style={{
          marginTop: 22,
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
            {formatShadingHour(v.hour)}
          </div>
        </div>
        <SkySlider
          value={v.hour}
          min={range.min}
          max={range.max}
          step={1}
          t={t}
          labels={shadingHourTicks(range.min, range.max)}
          onChange={(hour) => setV((prev) => ({ ...prev, hour }))}
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
      </div>
    </SkyEditSheet>
  );
}
