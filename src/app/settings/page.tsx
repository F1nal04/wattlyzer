"use client";

import {
  BatteryCharging,
  CloudSun,
  Compass,
  PanelsTopLeft,
  Ruler,
  Sun,
  Sunrise,
  Sunset,
  Trash2,
} from "lucide-react";
import { useState, type ComponentType, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { clearCache } from "@/lib/cache";
import { useSettings } from "@/lib/settings-context";
import { cn } from "@/lib/utils";

function getDirectionLabel(azimut: number) {
  const n = ((azimut % 360) + 360) % 360;
  if (n >= 337.5 || n < 22.5) return "North";
  if (n < 67.5) return "NE";
  if (n < 112.5) return "East";
  if (n < 157.5) return "SE";
  if (n < 202.5) return "South";
  if (n < 247.5) return "SW";
  if (n < 292.5) return "West";
  return "NW";
}

type AccentTone = "solar" | "price" | "combined";

const accentGradient: Record<AccentTone, string> = {
  solar: "bg-gradient-solar",
  price: "bg-gradient-price",
  combined: "bg-gradient-combined",
};

function SectionHeader({
  title,
  description,
  icon: Icon,
  tone = "solar",
}: {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  tone?: AccentTone;
}) {
  return (
    <div className="flex items-start gap-4 border-b border-border pb-5">
      <div
        className={cn(
          "relative flex size-10 shrink-0 items-center justify-center rounded-xl text-background shadow-sm",
          accentGradient[tone]
        )}
      >
        <Icon className="size-4" />
        <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-foreground/10" />
      </div>
      <div>
        <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
          {title}
        </h2>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function SliderSetting({
  id,
  label,
  valueLabel,
  description,
  icon: Icon,
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
  icon: ComponentType<{ className?: string }>;
  value: number;
  min: number;
  max: number;
  step?: number;
  onValueChange: (value: number[]) => void;
  marks: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium">
          <Icon className="size-4 text-muted-foreground" />
          {label}
        </label>
        <div className="font-display text-xl font-semibold leading-none tracking-tight tabular-nums">
          {valueLabel}
        </div>
      </div>
      <div className="text-sm text-muted-foreground">{description}</div>
      <div>
        <Slider
          id={id}
          min={min}
          max={max}
          step={step}
          value={[value]}
          onValueChange={onValueChange}
        />
        <div className="mt-2.5 flex justify-between text-xs text-muted-foreground tabular-nums">
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
  icon: Icon,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={id} className="flex-1 cursor-pointer">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon className="size-4 text-muted-foreground" />
          {title}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function SummaryStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <div className="mt-1 font-display text-lg font-semibold tracking-tight tabular-nums">
        {value}
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
    <div className="mx-auto max-w-2xl px-4 pt-10 pb-20 md:px-6 md:pt-14">
      <header className="space-y-3">
        <div className="text-xs font-medium text-muted-foreground">
          Settings
        </div>
        <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
          Shape the solar model
          <br />
          <span className="bg-gradient-solar bg-clip-text text-transparent">
            to match your roof.
          </span>
        </h1>
        <p className="max-w-xl text-base text-muted-foreground md:text-lg">
          Persistent hardware, shading, and maintenance preferences. Per-run
          parameters live on the scheduler.
        </p>
      </header>

      <div className="mt-8 grid grid-cols-2 gap-6 border-y border-border py-6 md:grid-cols-4">
        <SummaryStat
          label="Direction"
          value={`${directionLabel} ${settings.azimut}°`}
          icon={Compass}
        />
        <SummaryStat label="Tilt" value={`${settings.angle}°`} icon={Ruler} />
        <SummaryStat
          label="System"
          value={`${settings.kwh} kW`}
          icon={BatteryCharging}
        />
        <SummaryStat
          label="Shading"
          value={
            settings.morningShading || settings.eveningShading
              ? `${settings.morningShading ? "AM" : ""}${
                  settings.morningShading && settings.eveningShading
                    ? " + "
                    : ""
                }${settings.eveningShading ? "PM" : ""}`
              : "None"
          }
          icon={CloudSun}
        />
      </div>

      <section className="mt-12">
        <SectionHeader
          icon={PanelsTopLeft}
          tone="solar"
          title="Core panel geometry"
          description="These values drive the solar forecast directly. Align them with the physical panel installation."
        />
        <div className="divide-y divide-border">
          <div className="py-6">
            <SliderSetting
              id="azimut-slider"
              label="Azimut"
              valueLabel={`${settings.azimut}°`}
              icon={Compass}
              description={
                <>
                  Compass direction your panels face.{" "}
                  <span className="text-foreground/70">
                    0° N · 90° E · 180° S · 270° W.
                  </span>
                </>
              }
              value={settings.azimut}
              min={0}
              max={360}
              onValueChange={(v) => updateSettings({ azimut: v[0] })}
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
          </div>
          <div className="py-6">
            <SliderSetting
              id="angle-slider"
              label="Tilt angle"
              valueLabel={`${settings.angle}°`}
              icon={Ruler}
              description="Panel angle from horizontal. Flat roofs sit near 0°; steep roofs go higher."
              value={settings.angle}
              min={0}
              max={90}
              onValueChange={(v) => updateSettings({ angle: v[0] })}
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
          </div>
          <div className="py-6">
            <SliderSetting
              id="kwh-slider"
              label="System size"
              valueLabel={`${settings.kwh} kW`}
              icon={BatteryCharging}
              description="Total peak capacity of the installed solar system."
              value={settings.kwh}
              min={1}
              max={10}
              onValueChange={(v) => updateSettings({ kwh: v[0] })}
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
          </div>
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader
          icon={CloudSun}
          tone="combined"
          title="Morning &amp; evening shading"
          description="Use shading only when the forecast is consistently too optimistic because sunlight is blocked at the same time every day."
        />
        <div className="divide-y divide-border">
          <div className="py-6">
            <ToggleSetting
              id="morning-shading-switch"
              title="Morning shading"
              description="Use this when trees or structures block the panels after sunrise."
              checked={settings.morningShading}
              onCheckedChange={(checked) =>
                updateSettings({ morningShading: checked })
              }
              icon={Sunrise}
            />
          </div>
          {settings.morningShading ? (
            <div className="py-6">
              <SliderSetting
                id="shading-end-time-slider"
                label="Morning shading clears at"
                valueLabel={`${settings.shadingEndTime}:00`}
                icon={Sun}
                description="Solar output is reduced before this hour."
                value={settings.shadingEndTime}
                min={6}
                max={12}
                onValueChange={(v) => updateSettings({ shadingEndTime: v[0] })}
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
          ) : null}
          <div className="py-6">
            <ToggleSetting
              id="evening-shading-switch"
              title="Evening shading"
              description="Use this when late-day sun is blocked by the same obstacles on most days."
              checked={settings.eveningShading}
              onCheckedChange={(checked) =>
                updateSettings({ eveningShading: checked })
              }
              icon={Sunset}
            />
          </div>
          {settings.eveningShading ? (
            <div className="py-6">
              <SliderSetting
                id="shading-start-time-slider"
                label="Evening shading begins at"
                valueLabel={`${settings.shadingStartTime}:00`}
                icon={Sun}
                description="Solar output is reduced from this hour onward."
                value={settings.shadingStartTime}
                min={12}
                max={21}
                onValueChange={(v) =>
                  updateSettings({ shadingStartTime: v[0] })
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
          ) : null}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader
          icon={Trash2}
          tone="price"
          title="Cache &amp; recovery"
          description="Cached responses make the app faster. Clear them only when forecast or price data looks stale."
        />
        <div className="flex flex-wrap items-start justify-between gap-4 py-6">
          <div className="flex-1 min-w-[220px]">
            <div className="text-sm font-medium">Clear cached data</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Removes stored solar and market responses so the next load pulls
              fresh data.
            </p>
            {cacheCleared ? (
              <p className="mt-2 text-sm font-medium text-success">
                Cache cleared successfully.
              </p>
            ) : null}
          </div>
          <Button
            onClick={handleClearCache}
            disabled={cacheCleared}
            variant="destructive"
          >
            <Trash2 className="size-4" />
            {cacheCleared ? "Cleared" : "Clear cache"}
          </Button>
        </div>
      </section>
    </div>
  );
}
