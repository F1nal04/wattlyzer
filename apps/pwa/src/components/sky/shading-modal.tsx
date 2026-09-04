import { useState } from "react";
import { FONT_MONO, type SkyTheme } from "@wattlyzer/theme";
import {
  ModalDisplay,
  ModalField,
  SkyEditSheet,
} from "@/components/sky/edit-sheet";
import { SkySlider } from "@/components/sky/primitives";
import { ObSwitchRow } from "@/components/sky/rows";
import {
  formatShadingHour,
  shadingCopyKeys,
  shadingHourTicks,
  shadingRange,
  type ShadingKind,
  type ShadingSetup,
  type ShadingWindow,
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
  value: ShadingWindow;
  onChange: (next: ShadingWindow) => void;
}) {
  const { t: translate } = useI18n();
  const copy = shadingCopyKeys(kind);
  const range = shadingRange(kind);
  const dim = !value.enabled;
  return (
    <div>
      <ObSwitchRow
        t={t}
        icon={kind === "morning" ? "sun" : "moon"}
        title={translate(copy.title)}
        subtitle={translate(copy.subtitle)}
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
        <ModalField
          t={t}
          label={translate(copy.hourLabel)}
          right={
            <ModalDisplay t={t}>{formatShadingHour(value.hour)}</ModalDisplay>
          }
        >
          <SkySlider
            value={value.hour}
            min={range.min}
            max={range.max}
            step={1}
            t={t}
            labels={shadingHourTicks(range.min, range.max)}
            onChange={(hour) => onChange({ ...value, hour })}
          />
        </ModalField>
      </div>
    </div>
  );
}

export function ShadingModal({
  t,
  value,
  eyebrow,
  onChange,
  onClose,
}: {
  t: SkyTheme;
  value: ShadingSetup;
  eyebrow?: string;
  onChange: (next: ShadingSetup) => void;
  onClose: () => void;
}) {
  const { t: translate } = useI18n();
  const [v, setV] = useState(value);
  const dismiss = () => {
    onChange(v);
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
        {translate("shading.modal.hint")}
      </div>
    </SkyEditSheet>
  );
}
