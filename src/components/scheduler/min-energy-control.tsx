"use client";

import { Zap } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export function MinEnergyControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="space-y-4 py-1">
      <div className="flex items-baseline justify-between gap-4">
        <label
          htmlFor="min-kwh-slider"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <Zap className="size-4 text-muted-foreground" />
          Solar minimum
        </label>
        <div className="font-display text-2xl font-semibold leading-none tracking-tight tabular-nums">
          {(value / 1000).toFixed(1)}
          <span className="ml-1 text-base font-normal text-muted-foreground">
            kWh
          </span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Average solar output needed before solar wins over cheap pricing.
      </p>
      <div>
        <Slider
          id="min-kwh-slider"
          min={500}
          max={3000}
          step={100}
          value={[value]}
          onValueChange={(v) => onChange(v[0])}
        />
        <div className="mt-2.5 flex justify-between text-xs text-muted-foreground tabular-nums">
          <span>0.5</span>
          <span>1.0</span>
          <span>1.5</span>
          <span>2.0</span>
          <span>2.5</span>
          <span>3.0</span>
        </div>
      </div>
    </div>
  );
}
