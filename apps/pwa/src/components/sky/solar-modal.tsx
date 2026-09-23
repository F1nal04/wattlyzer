import { FONT_MONO, type SkyTheme } from "@wattlyzer/theme";
import { SkyEditSheet } from "@/components/sky/edit-sheet";
import { Display, Field, SkySlider } from "@/components/sky/primitives";
import { ObSwitchRow, azimuthKey } from "@/components/sky/rows";
import type { SolarSettings } from "@/components/sky/solar";
import { useI18n } from "@/lib/i18n";
import { Em, richParts } from "@/lib/i18n/rich";

// Solar panels modal — panel geometry only. Shading has its own editor.
export function SolarPanelsModal({
  t,
  value,
  eyebrow,
  onChange,
  onClose,
}: {
  t: SkyTheme;
  value: SolarSettings;
  eyebrow?: string;
  onChange: (next: SolarSettings) => void;
  onClose: () => void;
}) {
  const { t: translate, decimal, integer } = useI18n();
  const set = (patch: Partial<SolarSettings>) =>
    onChange({
      solarPanels: value.solarPanels,
      azimut: value.azimut,
      angle: value.angle,
      kwh: value.kwh,
      ...patch,
    });
  const dim = !value.solarPanels;
  return (
    <SkyEditSheet
      t={t}
      ariaLabel={translate("solar.modal.aria")}
      eyebrow={eyebrow ?? translate("solar.modal.eyebrow")}
      title={richParts(translate("solar.modal.title"), {
        panels: (
          <Em>
            {translate("solar.modal.titleEm")}
          </Em>
        ),
      })}
      onClose={onClose}
    >
      <ObSwitchRow
        t={t}
        icon="sun"
        title={translate("solar.modal.have")}
        subtitle={translate(
          value.solarPanels ? "solar.modal.haveOn" : "solar.modal.haveOff",
        )}
        checked={value.solarPanels}
        onChange={() => set({ solarPanels: !value.solarPanels })}
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
        <Field
          t={t}
          label={translate("solar.modal.orientation")}
          right={
            <Display t={t}>
              {translate(azimuthKey(value.azimut))} ·{" "}
              {translate("unit.degrees", { value: integer(value.azimut) })}
            </Display>
          }
        >
          <SkySlider
            value={value.azimut}
            min={0}
            max={360}
            step={5}
            t={t}
            labels={[0, 90, 180, 270, 360].map((deg) =>
              translate(azimuthKey(deg)),
            )}
            onChange={(next) => set({ azimut: Math.round(next) })}
          />
        </Field>

        <Field
          t={t}
          label={translate("solar.modal.tilt")}
          right={
            <Display t={t}>
              {translate("unit.degrees", { value: integer(value.angle) })}
            </Display>
          }
        >
          <SkySlider
            value={value.angle}
            min={0}
            max={60}
            step={1}
            t={t}
            labels={[0, 15, 30, 45, 60].map((deg) =>
              translate("unit.degrees", { value: integer(deg) }),
            )}
            onChange={(next) => set({ angle: Math.round(next) })}
          />
        </Field>

        <Field
          t={t}
          label={translate("solar.modal.size")}
          right={
            <Display t={t}>
              {translate("unit.kwp", { value: decimal(value.kwh) })}
            </Display>
          }
        >
          <SkySlider
            value={value.kwh}
            min={1}
            max={20}
            step={0.1}
            t={t}
            labels={[1, 5, 10, 15, 20].map((v) => integer(v))}
            onChange={(next) => set({ kwh: next })}
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
        </Field>
      </div>
    </SkyEditSheet>
  );
}
