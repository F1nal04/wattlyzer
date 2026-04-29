"use client";

import { useState } from "react";
import { Coins, Scale, Sun, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BestSlotMode } from "@/lib/settings-context";

function formatRemainingTime(targetTime: Date) {
  const now = new Date();
  const diffMs = targetTime.getTime() - now.getTime();

  if (diffMs <= 0) return "now";

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function formatClock(date: Date) {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

type Variant = "solar" | "price" | "combined";

const variantClasses: Record<
  Variant,
  {
    bg: string;
    ring: string;
    glow: string;
    gradientText: string;
    chipIcon: React.ComponentType<{ className?: string }>;
  }
> = {
  solar: {
    bg: "bg-gradient-to-br from-solar/10 via-card to-card",
    ring: "ring-solar/30",
    glow: "from-solar/25 via-transparent to-transparent",
    gradientText: "bg-gradient-solar",
    chipIcon: Sun,
  },
  price: {
    bg: "bg-gradient-to-br from-price/10 via-card to-card",
    ring: "ring-price/30",
    glow: "from-price/25 via-transparent to-transparent",
    gradientText: "bg-gradient-price",
    chipIcon: Coins,
  },
  combined: {
    bg: "bg-gradient-to-br from-combined/10 via-card to-card",
    ring: "ring-combined/30",
    glow: "from-combined/25 via-transparent to-transparent",
    gradientText: "bg-gradient-combined",
    chipIcon: Scale,
  },
};

function modeLabel(mode: BestSlotMode, reason: "solar" | "price") {
  if (mode === "solar-only") return "Solar only mode";
  if (mode === "price-only") return "Price only mode";
  return reason === "solar" ? "Solar optimized" : "Price optimized";
}

export function ResultHero({
  bestTime,
  mode,
  reason,
  avgSolarProduction,
  avgPriceEuroPerKwh,
  meetsSolarMinimum,
  minSolarKwh,
}: {
  bestTime: Date;
  mode: BestSlotMode;
  reason: "solar" | "price";
  avgSolarProduction: number;
  avgPriceEuroPerKwh: string;
  meetsSolarMinimum: boolean;
  minSolarKwh: number;
}) {
  const [showRemaining, setShowRemaining] = useState(false);

  const variant: Variant =
    mode === "solar-only"
      ? "solar"
      : mode === "price-only"
        ? "price"
        : reason === "solar"
          ? "solar"
          : "combined";
  const v = variantClasses[variant];
  const ChipIcon = v.chipIcon;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border shadow-xl ring-1",
        v.bg,
        v.ring
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-gradient-to-br blur-3xl",
          v.glow
        )}
      />

      <div className="relative px-6 pt-6 pb-7 md:px-10 md:pt-10 md:pb-12">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={variant}>
            <ChipIcon className="size-3.5" />
            {modeLabel(mode, reason)}
          </Badge>
          {meetsSolarMinimum ? (
            <Badge variant="success">
              <Zap className="size-3.5" />
              Meets {(minSolarKwh / 1000).toFixed(1)} kWh solar minimum
            </Badge>
          ) : null}
        </div>

        <div className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Best time to run
        </div>

        <button
          type="button"
          onClick={() => setShowRemaining((prev) => !prev)}
          title={showRemaining ? "Show clock time" : "Show remaining time"}
          className="group mt-2 inline-flex items-baseline gap-3 text-left"
        >
          <span
            className={cn(
              "font-display text-7xl font-semibold leading-none tracking-tighter tabular-nums bg-clip-text text-transparent md:text-8xl",
              v.gradientText
            )}
          >
            {showRemaining ? formatRemainingTime(bestTime) : formatClock(bestTime)}
          </span>
        </button>

        <div className="mt-3 text-base text-muted-foreground">
          {formatDate(bestTime)}
        </div>

        <div className="mt-8 flex flex-wrap gap-x-10 gap-y-5 border-t border-border/60 pt-5">
          <Stat
            icon={Sun}
            label="Average solar"
            value={`${avgSolarProduction.toFixed(0)} Wh`}
            tone="solar"
          />
          <Stat
            icon={Coins}
            label="Average price"
            value={avgPriceEuroPerKwh}
            tone="price"
          />
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: "solar" | "price";
}) {
  return (
    <div>
      <div
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider",
          tone === "solar" ? "text-solar" : "text-price"
        )}
      >
        <Icon className="size-3.5" />
        {label}
      </div>
      <div className="mt-1.5 font-display text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </div>
    </div>
  );
}
