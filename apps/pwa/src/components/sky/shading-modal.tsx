import { useState } from "react";
import { FONT_MONO, type SkyTheme } from "@wattlyzer/theme";
import { SkyEditSheet } from "@/components/sky/edit-sheet";
import { Display, Field, SkySlider } from "@/components/sky/primitives";
import { ObSwitchRow } from "@/components/sky/rows";
import {
  SHADING_FIELDS,
  formatShadingHour,
  shadingHourTicks,
  type ShadingKind,
  type ShadingSettingsSlice,
} from "@/components/sky/shading";
import { useI18n } from "@/lib/i18n";
import { Em, richParts } from "@/lib/i18n/rich";

function ShadingWindowEditor({
  t,
  kind,
  value,
  onChange,
}: {
  t: SkyTheme;
  kind: ShadingKind;
  value: ShadingSettingsSlice;
  onChange: (patch: Partial<ShadingSettingsSlice>) => void;
}) {
  const { t: translate } = useI18n();
  const fields = SHADING_FIELDS[kind];
  const enabled = value[fields.enabled];
  const hour = value[fields.hour];
  return (
    <div>
      <ObSwitchRow
        t={t}
        icon={kind === "morning" ? "sun" : "moon"}
        title={translate(`shading.${kind}.title`)}
        subtitle={translate(`shading.${kind}.subtitle`)}
        checked={enabled}
        onChange={() => onChange({ [fields.enabled]: !enabled })}
      />
      <div
        style={{
          marginTop: 16,
          opacity: enabled ? 1 : 0.4,
          pointerEvents: enabled ? "auto" : "none",
          transition: "opacity 180ms ease",
        }}
      >
        <Field
          t={t}
          label={translate(`shading.${kind}.hourLabel`)}
          right={<Display t={t}>{formatShadingHour(hour)}</Display>}
        >
          <SkySlider
            value={hour}
            min={fields.min}
            max={fields.max}
            step={1}
            t={t}
            labels={shadingHourTicks(fields.min, fields.max)}
            onChange={(next) => onChange({ [fields.hour]: next })}
          />
        </Field>
      </div>
    </div>
  );
}

// Drafts locally and commits the accumulated patch on close.
export function ShadingModal({
  t,
  value,
  eyebrow,
  onChange,
  onClose,
}: {
  t: SkyTheme;
  value: ShadingSettingsSlice;
  eyebrow?: string;
  onChange: (patch: Partial<ShadingSettingsSlice>) => void;
  onClose: () => void;
}) {
  const { t: translate } = useI18n();
  const [patch, setPatch] = useState<Partial<ShadingSettingsSlice>>({});
  const draft = { ...value, ...patch };
  const edit = (next: Partial<ShadingSettingsSlice>) =>
    setPatch((prev) => ({ ...prev, ...next }));
  const dismiss = () => {
    onChange(patch);
    onClose();
  };
  return (
    <SkyEditSheet
      t={t}
      ariaLabel={translate("shading.modal.aria")}
      eyebrow={eyebrow ?? translate("shading.modal.eyebrow")}
      title={richParts(translate("shading.modal.title"), {
        shade: (
          <Em>
            {translate("shading.modal.titleEm")}
          </Em>
        ),
      })}
      onClose={dismiss}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        <ShadingWindowEditor t={t} kind="morning" value={draft} onChange={edit} />
        <ShadingWindowEditor t={t} kind="evening" value={draft} onChange={edit} />
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
        {translate("shading.modal.hint")}
      </div>
    </SkyEditSheet>
  );
}
