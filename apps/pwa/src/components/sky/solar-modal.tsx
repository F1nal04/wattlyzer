import type { ReactNode } from "react";
import { FONT_MONO, FONT_SANS, type SkyTheme } from "@wattlyzer/theme";
import { SkyEditSheet } from "@/components/sky/edit-sheet";
import { SkySlider } from "@/components/sky/primitives";
import { ObSwitchRow, azimuthKey } from "@/components/sky/rows";
import { useI18n } from "@/lib/i18n";
import { richParts } from "@/lib/i18n/rich";

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
  eyebrow,
  onChange,
  onClose,
}: {
  t: SkyTheme;
  value: SolarConfig;
  eyebrow?: string;
  onChange: (next: SolarConfig) => void;
  onClose: () => void;
}) {
  const { t: translate, decimal, integer } = useI18n();
  const set = (patch: Partial<SolarConfig>) => onChange({ ...value, ...patch });
  const dim = !value.enabled;
  return (
    <SkyEditSheet
      t={t}
      ariaLabel={translate("solar.modal.aria")}
      eyebrow={eyebrow ?? translate("solar.modal.eyebrow")}
      title={richParts(translate("solar.modal.title"), {
        panels: (
          <span style={{ fontStyle: "italic", fontWeight: 300 }}>
            {translate("solar.modal.titleEm")}
          </span>
        ),
      })}
      onClose={onClose}
    >
      <ObSwitchRow
        t={t}
        icon="sun"
        title={translate("solar.modal.have")}
        subtitle={translate(
          value.enabled ? "solar.modal.haveOn" : "solar.modal.haveOff",
        )}
        checked={value.enabled}
        onChange={() => set({ enabled: !value.enabled })}
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
          label={translate("solar.modal.orientation")}
          right={
            <ModalDisplay t={t}>
              {translate(azimuthKey(value.azimuth))} ·{" "}
              {translate("unit.degrees", { value: integer(value.azimuth) })}
            </ModalDisplay>
          }
        >
          <SkySlider
            value={value.azimuth}
            min={0}
            max={360}
            step={5}
            t={t}
            labels={[0, 90, 180, 270, 360].map((deg) =>
              translate(azimuthKey(deg)),
            )}
            onChange={(next) => set({ azimuth: Math.round(next) })}
          />
        </ModalField>

        <ModalField
          t={t}
          label={translate("solar.modal.tilt")}
          right={
            <ModalDisplay t={t}>
              {translate("unit.degrees", { value: integer(value.tilt) })}
            </ModalDisplay>
          }
        >
          <SkySlider
            value={value.tilt}
            min={0}
            max={60}
            step={1}
            t={t}
            labels={[0, 15, 30, 45, 60].map((deg) =>
              translate("unit.degrees", { value: integer(deg) }),
            )}
            onChange={(next) => set({ tilt: Math.round(next) })}
          />
        </ModalField>

        <ModalField
          t={t}
          label={translate("solar.modal.size")}
          right={
            <ModalDisplay t={t}>
              {translate("unit.kwp", { value: decimal(value.sizeKw) })}
            </ModalDisplay>
          }
        >
          <SkySlider
            value={value.sizeKw}
            min={1}
            max={20}
            step={0.1}
            t={t}
            labels={[1, 5, 10, 15, 20].map((v) => integer(v))}
            onChange={(next) => set({ sizeKw: next })}
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
            {translate("solar.modal.sizeHint")}
          </div>
        </ModalField>
      </div>
    </SkyEditSheet>
  );
}
