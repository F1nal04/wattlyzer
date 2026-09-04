import { FONT_DISPLAY, FONT_MONO, FONT_SANS, type SkyTheme } from "@wattlyzer/theme";
import { usePrefs, useSettings } from "@/lib/settings";
import {
  solarModeUnavailableHintKey,
  solarPanelsEnabled,
} from "@/components/sky/solar";
import {
  Display,
  Field,
  SearchWindowChips,
  SkyModeSeg,
  SkySlider,
  useEscapeKey,
} from "@/components/sky/primitives";
import { useI18n } from "@/lib/i18n";

// Sliding-up Quick controls sheet (design "A2"): Mode → Min solar → Search window.
export function QuickSheet({ t, onClose }: { t: SkyTheme; onClose: () => void }) {
  const { settings, updateSettings } = useSettings();
  const { prefs, updatePrefs } = usePrefs();
  const { t: translate, decimal } = useI18n();
  useEscapeKey(onClose);
  const solarEnabled = solarPanelsEnabled(settings.bestSlotMode);
  const modeHintKey = solarModeUnavailableHintKey(
    solarEnabled,
    settings.dynamicTariff,
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={translate("quick.title")}
      style={{ position: "absolute", inset: 0, zIndex: 20, fontFamily: FONT_SANS }}
    >
      {/* scrim over the dimmed home */}
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.28)" }}
      />

      {/* sheet — same theme palette as home */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(180deg, ${t.sky[1]} 0%, ${t.sky[2]} 100%)`,
          color: t.fg,
          borderRadius: "32px 32px 0 0",
          padding: "12px 24px calc(env(safe-area-inset-bottom, 0px) + 36px)",
          boxShadow: "0 -24px 60px rgba(0,0,0,0.35)",
          borderTop: `1px solid ${t.glassBd}`,
          animation: "sky-sheet-up 260ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div
          style={{
            width: 44,
            height: 5,
            borderRadius: 999,
            background:
              t.mode === "dark" ? "rgba(255,255,255,0.3)" : "rgba(26,20,16,0.18)",
            margin: "4px auto 14px",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, letterSpacing: "-0.01em" }}>
            {translate("quick.title")}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              color: t.fg,
              fontWeight: 700,
              padding: 4,
              fontFamily: FONT_SANS,
            }}
          >
            {translate("common.done")}
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Field label={translate("quick.mode")} t={t}>
            <SkyModeSeg
              value={settings.bestSlotMode}
              solarEnabled={solarEnabled}
              dynamicTariff={settings.dynamicTariff}
              onChange={(v) => updateSettings({ bestSlotMode: v })}
              t={t}
            />
            {modeHintKey && (
              <div
                style={{
                  fontSize: 11.5,
                  color: t.fgMute,
                  fontFamily: FONT_MONO,
                  letterSpacing: "0.04em",
                  marginTop: 8,
                }}
              >
                {translate(modeHintKey)}
              </div>
            )}
          </Field>

          <Field
            label={translate("quick.minSolar")}
            right={
              <Display t={t}>
                {translate("unit.kwh", { value: decimal(settings.minKwh / 1000) })}
              </Display>
            }
            t={t}
          >
            <SkySlider
              value={settings.minKwh / 1000}
              min={0.5}
              max={3.0}
              step={0.1}
              t={t}
              labels={[0.5, 1.0, 1.5, 2.0, 2.5, 3.0].map((v) => decimal(v))}
              onChange={(v) => updateSettings({ minKwh: Math.round(v * 1000) })}
            />
          </Field>

          <Field label={translate("quick.searchWindow")} t={t}>
            <SearchWindowChips
              value={prefs.searchWindow}
              t={t}
              onChange={(v) => updatePrefs({ searchWindow: v })}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}
