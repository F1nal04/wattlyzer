"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { clearCache } from "@/lib/cache";
import { useSettings } from "@/lib/settings-context";

function getDirectionLabel(azimut: number) {
  const normalized = ((azimut % 360) + 360) % 360;

  if (normalized >= 337.5 || normalized < 22.5) {
    return "North";
  }
  if (normalized < 67.5) {
    return "North-East";
  }
  if (normalized < 112.5) {
    return "East";
  }
  if (normalized < 157.5) {
    return "South-East";
  }
  if (normalized < 202.5) {
    return "South";
  }
  if (normalized < 247.5) {
    return "South-West";
  }
  if (normalized < 292.5) {
    return "West";
  }
  return "North-West";
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4 backdrop-blur-sm">
      <div className="text-[11px] uppercase tracking-[0.24em] text-yellow-200/70">
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

function SectionCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-gray-950/55 p-5 shadow-[0_24px_80px_-48px_rgba(251,191,36,0.45)] backdrop-blur-md md:p-7">
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-[0.28em] text-yellow-300/70">
          {eyebrow}
        </div>
        <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
          {description}
        </p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function SliderSetting({
  id,
  label,
  valueLabel,
  description,
  value,
  min,
  max,
  step,
  onValueChange,
  marks,
}: {
  id: string;
  label: string;
  valueLabel: string;
  description: ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  onValueChange: (value: number[]) => void;
  marks: ReactNode;
}) {
  return (
    <div className="grid gap-5 rounded-2xl border border-white/8 bg-white/[0.04] p-4 md:grid-cols-[minmax(0,0.95fr)_minmax(280px,1.05fr)] md:items-center">
      <div>
        <label
          htmlFor={id}
          className="block text-lg font-semibold text-white md:text-xl"
        >
          {label}
        </label>
        <div className="mt-2 text-sm leading-6 text-gray-400">{description}</div>
      </div>

      <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-center">
        <div className="mb-4 text-2xl font-semibold text-yellow-300">
          {valueLabel}
        </div>
        <Slider
          id={id}
          min={min}
          max={max}
          step={step}
          value={[value]}
          onValueChange={onValueChange}
        />
        <div className="mt-3 flex justify-between text-xs text-gray-300">
          {marks}
        </div>
      </div>
    </div>
  );
}

function ToggleSetting({
  id,
  title,
  description,
  checked,
  onCheckedChange,
  accent,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <label
            htmlFor={id}
            className="block text-lg font-semibold text-white md:text-xl"
          >
            {title}
          </label>
          <p className="mt-2 text-sm leading-6 text-gray-400">{description}</p>
        </div>

        <div className="flex items-center gap-4 self-start md:self-center">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
              checked
                ? `${accent} border-current/30`
                : "border-white/10 text-gray-500"
            }`}
          >
            {checked ? "Active" : "Off"}
          </span>
          <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleClearCache = () => {
    clearCache();
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  };

  const directionLabel = getDirectionLabel(settings.azimut);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.18),transparent_28%),linear-gradient(135deg,#050505_0%,#151515_42%,#3b2b0f_100%)] px-4 py-8 md:px-6 md:py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-16 top-24 h-48 w-48 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute bottom-12 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-amber-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <header className="rounded-[32px] border border-white/12 bg-black/30 p-6 shadow-[0_28px_100px_-56px_rgba(251,191,36,0.6)] backdrop-blur-md md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-yellow-200">
                System Settings
              </div>
              <h1 className="mt-4 text-4xl font-bold text-white md:text-5xl">
                Shape the solar model to match your roof.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300 md:text-base">
                Hardware lives here. Daily recommendation tuning stays on the
                main page.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/6 px-5 py-3 text-sm font-medium text-white transition-colors hover:border-yellow-300/35 hover:bg-yellow-300/10 hover:text-yellow-100"
            >
              Back to Wattlyzer
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryItem label="Direction" value={`${directionLabel} (${settings.azimut}°)`} />
            <SummaryItem label="Tilt" value={`${settings.angle}°`} />
            <SummaryItem label="System Size" value={`${settings.kwh} kW`} />
            <SummaryItem
              label="Shading"
              value={
                settings.morningShading || settings.eveningShading
                  ? `${settings.morningShading ? "AM" : ""}${
                      settings.morningShading && settings.eveningShading
                        ? " + "
                        : ""
                    }${settings.eveningShading ? "PM" : ""} active`
                  : "None"
              }
            />
          </div>
        </header>

        <div className="mt-8 space-y-6">
          <SectionCard
            eyebrow="Panel Setup"
            title="Core panel geometry"
            description="These values drive the solar forecast request directly. Keep them aligned with the physical panel installation rather than with short-term weather or electricity prices."
          >
            <SliderSetting
              id="azimut-slider"
              label="Azimut"
              valueLabel={`${settings.azimut}°`}
              description={
                <>
                  Compass direction your panels face.
                  <span className="mt-2 block text-yellow-200/80">
                    0° north, 90° east, 180° south, 270° west.
                  </span>
                </>
              }
              value={settings.azimut}
              min={0}
              max={360}
              onValueChange={(value) => updateSettings({ azimut: value[0] })}
              marks={
                <>
                  <span>N 0°</span>
                  <span>E 90°</span>
                  <span>S 180°</span>
                  <span>W 270°</span>
                  <span>N 360°</span>
                </>
              }
            />

            <SliderSetting
              id="angle-slider"
              label="Tilt Angle"
              valueLabel={`${settings.angle}°`}
              description="Panel angle from horizontal. Flat roofs sit near 0°, wall-mounted or steep roofs move higher."
              value={settings.angle}
              min={0}
              max={90}
              onValueChange={(value) => updateSettings({ angle: value[0] })}
              marks={
                <>
                  <span>0°</span>
                  <span>22.5°</span>
                  <span>45°</span>
                  <span>67.5°</span>
                  <span>90°</span>
                </>
              }
            />

            <SliderSetting
              id="kwh-slider"
              label="System Size"
              valueLabel={`${settings.kwh} kW`}
              description="Total peak capacity of the installed solar system."
              value={settings.kwh}
              min={1}
              max={10}
              onValueChange={(value) => updateSettings({ kwh: value[0] })}
              marks={
                <>
                  <span>1</span>
                  <span>3</span>
                  <span>5</span>
                  <span>7</span>
                  <span>10</span>
                </>
              }
            />
          </SectionCard>

          <SectionCard
            eyebrow="Shading Profile"
            title="Morning and evening losses"
            description="Use shading only when the forecast is consistently too optimistic because sunlight is blocked at the same time every day. The current model applies a fixed 50% reduction within the shaded window."
          >
            <ToggleSetting
              id="morning-shading-switch"
              title="Morning shading"
              description="Use this when trees, neighboring houses, or roof structures block the panels after sunrise."
              checked={settings.morningShading}
              onCheckedChange={(checked) =>
                updateSettings({ morningShading: checked })
              }
              accent="text-amber-200"
            />

            {settings.morningShading && (
              <div className="rounded-2xl border border-amber-300/15 bg-amber-300/6 p-4 md:ml-8">
                <SliderSetting
                  id="shading-end-time-slider"
                  label="Morning shading clears"
                  valueLabel={`${settings.shadingEndTime}:00`}
                  description="Solar output is reduced before this hour."
                  value={settings.shadingEndTime}
                  min={6}
                  max={12}
                  onValueChange={(value) =>
                    updateSettings({ shadingEndTime: value[0] })
                  }
                  marks={
                    <>
                      <span>6:00</span>
                      <span>8:00</span>
                      <span>10:00</span>
                      <span>12:00</span>
                    </>
                  }
                />
              </div>
            )}

            <ToggleSetting
              id="evening-shading-switch"
              title="Evening shading"
              description="Use this when late-day sun is blocked by the same obstacles on most days."
              checked={settings.eveningShading}
              onCheckedChange={(checked) =>
                updateSettings({ eveningShading: checked })
              }
              accent="text-orange-200"
            />

            {settings.eveningShading && (
              <div className="rounded-2xl border border-orange-300/15 bg-orange-300/6 p-4 md:ml-8">
                <SliderSetting
                  id="shading-start-time-slider"
                  label="Evening shading begins"
                  valueLabel={`${settings.shadingStartTime}:00`}
                  description="Solar output is reduced from this hour onward."
                  value={settings.shadingStartTime}
                  min={12}
                  max={21}
                  onValueChange={(value) =>
                    updateSettings({ shadingStartTime: value[0] })
                  }
                  marks={
                    <>
                      <span>12:00</span>
                      <span>15:00</span>
                      <span>18:00</span>
                      <span>21:00</span>
                    </>
                  }
                />
              </div>
            )}
          </SectionCard>

          <SectionCard
            eyebrow="Maintenance"
            title="Cache and recovery"
            description="Cached API results make the app faster. Clear them only when the forecast or price data looks stale or inconsistent."
          >
            <div className="grid gap-5 rounded-2xl border border-red-400/15 bg-red-500/5 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div>
                <h3 className="text-lg font-semibold text-white">Clear cached data</h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
                  Removes stored solar and market responses so the next load
                  pulls fresh data from the APIs.
                </p>
                {cacheCleared && (
                  <p className="mt-3 text-sm font-medium text-green-400">
                    Cache cleared successfully.
                  </p>
                )}
              </div>

              <button
                onClick={handleClearCache}
                className="inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={cacheCleared}
              >
                {cacheCleared ? "Cache Cleared" : "Clear Cache"}
              </button>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
