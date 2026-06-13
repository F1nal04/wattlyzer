import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  FONT_DISPLAY,
  FONT_MONO,
  skyTheme,
  type SkyTheme,
} from "@/lib/sky-theme";
import { updateSettings, useSettings } from "@/lib/settings";
import { useNow } from "@/lib/use-now";
import {
  SkyAppBar,
  SkyIconBtn,
  SkyScreen,
  SkySwitch,
} from "@/components/sky/primitives";
import { WIcon } from "@/components/sky/icons";
import { azimuthLabel } from "@/components/sky/rows";
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
          background: t.glassBg,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
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
            whiteSpace: "nowrap",
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
  const [solarOpen, setSolarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const now = useNow();
  useEffect(() => setMounted(true), []);

  const t = skyTheme(mounted ? now.getHours() : 11);
  const solarEnabled = settings.bestSlotMode !== "price-only";

  const solarConfig: SolarConfig = {
    enabled: solarEnabled,
    azimuth: settings.azimut,
    tilt: settings.angle,
    sizeKw: settings.kwh,
    morningOn: settings.morningShading,
    morningHour: settings.shadingEndTime,
    eveningOn: settings.eveningShading,
    eveningHour: settings.shadingStartTime,
  };

  const saveSolar = (next: SolarConfig) => {
    updateSettings({
      azimut: next.azimuth,
      angle: next.tilt,
      kwh: next.sizeKw,
      morningShading: next.morningOn,
      shadingEndTime: next.morningHour,
      eveningShading: next.eveningOn,
      shadingStartTime: next.eveningHour,
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
      background={`linear-gradient(180deg, ${t.pageBg[0]} 0%, ${t.pageBg[1]} 100%)`}
      color={t.fg}
    >
      <SkyAppBar
        t={t}
        title="Settings"
        subtle="YOUR SOLAR SETUP"
        left={
          <SkyIconBtn t={t} label="Back" onClick={() => navigate({ to: "/" })}>
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
          subtitle="Used to estimate production for your roof."
          t={t}
        >
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
        </SetGroup>

        <SetGroup
          title="Shading"
          subtitle="Compensate for trees, neighbours, etc."
          t={t}
        >
          <SetToggleRow
            label="Morning shading"
            detail={`until ${String(settings.shadingEndTime).padStart(2, "0")}:00`}
            on={settings.morningShading}
            onToggle={() => updateSettings({ morningShading: !settings.morningShading })}
            t={t}
          />
          <SetToggleRow
            label="Evening shading"
            detail={`from ${String(settings.shadingStartTime).padStart(2, "0")}:00`}
            on={settings.eveningShading}
            onToggle={() => updateSettings({ eveningShading: !settings.eveningShading })}
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
            href="https://github.com/F1nal04/wattlyzer-app"
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
    </SkyScreen>
  );
}
