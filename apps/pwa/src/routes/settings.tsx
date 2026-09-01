import { useState, type ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  FONT_DISPLAY,
  FONT_MONO,
  skyTheme,
  type SkyTheme,
} from "@wattlyzer/theme";
import { updateSettings, usePrefs, useSettings } from "@/lib/settings";
import { useNow } from "@/lib/use-now";
import { useGeolocation, useScheduling } from "@/lib/use-scheduling";
import { useSkyHour } from "@/lib/use-sky-hour";
import {
  SkyAppBar,
  SkyIconBtn,
  SkyScreen,
  SkySwitch,
} from "@/components/sky/primitives";
import { WIcon } from "@/components/sky/icons";
import { azimuthLabel } from "@/components/sky/rows";
import { ShadingModal } from "@/components/sky/shading-modal";
import {
  shadingRowValue,
  shadingSettingsFromSetup,
  shadingSetupFromSettings,
  shadingWindowFromSettings,
} from "@/components/sky/shading";
import {
  solarPanelsEnabled,
  solarSettingsSubtitle,
} from "@/components/sky/solar";
import { SolarPanelsModal, type SolarConfig } from "@/components/sky/solar-modal";
import packageJson from "../../package.json";

export const Route = createFileRoute("/settings")({
  component: SettingsScreen,
});

function SetGroup({
  title,
  subtitle,
  children,
  t,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  t: SkyTheme;
}) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 22,
          fontWeight: 400,
          letterSpacing: "-0.01em",
          color: t.fg,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: 12.5, color: t.fgDim, marginTop: 2, marginBottom: 10 }}>
          {subtitle}
        </div>
      )}
      <div
        style={{
          // Safari can defer or stale-cache backdrop-filter layers in this
          // scroll view. The translucent fill keeps the glass appearance
          // without making the settings content depend on a later repaint.
          background: t.glassBg,
          borderRadius: 18,
          border: `1px solid ${t.glassBd}`,
          overflow: "hidden",
          marginTop: subtitle ? 0 : 10,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function SetRow({
  label,
  value,
  t,
  last,
  onClick,
}: {
  label: string;
  value: string;
  t: SkyTheme;
  last?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        padding: "13px 16px",
        borderBottom: last ? "none" : `1px solid ${t.rule}`,
        fontSize: 14,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <span style={{ color: t.fg, fontWeight: 500, whiteSpace: "nowrap" }}>{label}</span>
      <span
        style={{
          color: t.fgDim,
          fontFamily: FONT_MONO,
          fontSize: 12.5,
          whiteSpace: "nowrap",
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function SetToggleRow({
  label,
  detail,
  on,
  onToggle,
  t,
  last,
}: {
  label: string;
  detail: string;
  on: boolean;
  onToggle: () => void;
  t: SkyTheme;
  last?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        padding: "13px 16px",
        fontSize: 14,
        width: "100%",
        background: "transparent",
        border: "none",
        borderBottom: last ? "none" : `1px solid ${t.rule}`,
        borderRadius: 0,
        cursor: "pointer",
        textAlign: "left",
        color: t.fg,
        fontFamily: "inherit",
      }}
    >
      <div style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ fontWeight: 500, color: t.fg, whiteSpace: "nowrap" }}>{label}</div>
        <div
          style={{
            fontSize: 11.5,
            color: t.fgMute,
            fontFamily: FONT_MONO,
            marginTop: 2,
            // Let long descriptions (e.g. the Dark mode hint) wrap instead of
            // overflowing the minWidth:0 column and running under the switch.
            overflowWrap: "anywhere",
          }}
        >
          {detail}
        </div>
      </div>
      <SkySwitch checked={on} t={t} />
    </button>
  );
}

function LinkRow({
  label,
  t,
  last,
  onClick,
  href,
}: {
  label: string;
  t: SkyTheme;
  last?: boolean;
  onClick?: () => void;
  href?: string;
}) {
  const inner = (
    <>
      <span style={{ color: t.fg, fontWeight: 500, whiteSpace: "nowrap" }}>{label}</span>
      <span style={{ color: t.fgMute, fontSize: 14 }}>›</span>
    </>
  );
  const style = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "13px 16px",
    fontSize: 14,
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: last ? "none" : `1px solid ${t.rule}`,
    cursor: "pointer",
    textAlign: "left" as const,
    color: t.fg,
    fontFamily: "inherit",
    textDecoration: "none",
  };
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={style}>
        {inner}
      </a>
    );
  }
  return (
    <button onClick={onClick} style={style}>
      {inner}
    </button>
  );
}

function SettingsScreen() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { prefs } = usePrefs();
  const now = useNow();
  const { position } = useGeolocation();
  const [solarOpen, setSolarOpen] = useState(false);
  const [shadingOpen, setShadingOpen] = useState(false);
  const searchTimespanHours =
    prefs.searchWindow === "eod"
      ? Math.ceil(
          (new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23,
            59,
            59,
            999,
          ).getTime() -
            now.getTime()) /
            (1000 * 60 * 60),
        )
      : parseInt(prefs.searchWindow, 10);
  const { schedulingResult } = useScheduling(
    position,
    prefs.duration,
    searchTimespanHours,
    now,
  );
  // Same hour as home: the recommended slot, or now until a slot exists.
  // Dark mode then switches every page onto the current local hour.
  const themeHour = useSkyHour(
    schedulingResult ? schedulingResult.bestTime.getHours() : now.getHours(),
  );
  const t = skyTheme(themeHour);
  const solarEnabled = solarPanelsEnabled(settings.bestSlotMode);

  const solarConfig: SolarConfig = {
    enabled: solarEnabled,
    azimuth: settings.azimut,
    tilt: settings.angle,
    sizeKw: settings.kwh,
  };

  const saveSolar = (next: SolarConfig) => {
    updateSettings({
      azimut: next.azimuth,
      angle: next.tilt,
      kwh: next.sizeKw,
      // Toggling panels off forces price-only; toggling back on restores a
      // solar-aware mode (otherwise there is no way to re-enable solar here)
      ...(next.enabled
        ? settings.bestSlotMode === "price-only"
          ? { bestSlotMode: "combined" as const }
          : {}
        : { bestSlotMode: "price-only" as const }),
    });
    setSolarOpen(false);
  };

  return (
    <SkyScreen
      background={`linear-gradient(180deg, ${t.sky[0]} 0%, ${t.sky[1]} 55%, ${t.sky[2]} 100%)`}
      color={t.fg}
    >
      <SkyAppBar
        t={t}
        title="Settings"
        subtle="YOUR SOLAR SETUP"
        left={
          <SkyIconBtn
            t={t}
            label="Back"
            onClick={() => navigate({ to: "/" })}
            blurBackdrop={false}
          >
            <WIcon name="back" />
          </SkyIconBtn>
        }
      />

      <div
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top, 0px) + 76px)",
          left: 24,
          right: 24,
          bottom: 0,
          overflowY: "auto",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 32px)",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <SetGroup
          title="Solar panels"
          subtitle={solarSettingsSubtitle(solarEnabled)}
          t={t}
        >
          {solarEnabled ? (
            <>
              <SetRow
                label="Peak power"
                value={`${settings.kwh.toFixed(1)} kWp`}
                t={t}
                onClick={() => setSolarOpen(true)}
              />
              <SetRow
                label="Azimuth"
                value={`${Math.round(settings.azimut)}° ${azimuthLabel(settings.azimut)}`}
                t={t}
                onClick={() => setSolarOpen(true)}
              />
              <SetRow
                label="Tilt"
                value={`${Math.round(settings.angle)}°`}
                t={t}
                last
                onClick={() => setSolarOpen(true)}
              />
            </>
          ) : (
            <SetRow
              label="Status"
              value="Off"
              t={t}
              last
              onClick={() => setSolarOpen(true)}
            />
          )}
        </SetGroup>

        <SetGroup
          title="Shading"
          subtitle="Compensate for trees, neighbours, etc."
          t={t}
        >
          <SetRow
            label="Morning shading"
            value={shadingRowValue(
              "morning",
              shadingWindowFromSettings("morning", settings),
            )}
            t={t}
            onClick={() => setShadingOpen(true)}
          />
          <SetRow
            label="Evening shading"
            value={shadingRowValue(
              "evening",
              shadingWindowFromSettings("evening", settings),
            )}
            t={t}
            last
            onClick={() => setShadingOpen(true)}
          />
        </SetGroup>

        <SetGroup title="Appearance" t={t}>
          <SetToggleRow
            label="Dark mode"
            detail="Match the sky to now, not the chosen slot"
            on={settings.currentTimeSky}
            onToggle={() =>
              updateSettings({ currentTimeSky: !settings.currentTimeSky })
            }
            t={t}
            last
          />
        </SetGroup>

        <SetGroup title="More" t={t}>
          <LinkRow label="Privacy" t={t} onClick={() => navigate({ to: "/privacy" })} />
          <LinkRow label="Legal" t={t} onClick={() => navigate({ to: "/legal" })} />
          <LinkRow
            label="GitHub"
            t={t}
            last
            href="https://github.com/F1nal04/wattlyzer"
          />
        </SetGroup>

        <div
          style={{
            marginTop: 18,
            fontSize: 11,
            color: t.fgMute,
            fontFamily: FONT_MONO,
            letterSpacing: "0.06em",
            textAlign: "center",
          }}
        >
          v{packageJson.version} · made for the German market
        </div>
      </div>

      {solarOpen && (
        <SolarPanelsModal
          t={t}
          value={solarConfig}
          eyebrow="Settings · Solar"
          onSave={saveSolar}
          onClose={() => setSolarOpen(false)}
        />
      )}
      {shadingOpen && (
        <ShadingModal
          t={t}
          value={shadingSetupFromSettings(settings)}
          eyebrow="Settings · Shading"
          onSave={(setup) => {
            updateSettings(shadingSettingsFromSetup(setup));
            setShadingOpen(false);
          }}
          onClose={() => setShadingOpen(false)}
        />
      )}
    </SkyScreen>
  );
}
