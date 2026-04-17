"use client";

import { Timer } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export function DurationControl({
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
          htmlFor="consumer-duration-slider"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <Timer className="size-4 text-muted-foreground" />
          Run duration
        </label>
        <div className="font-display text-2xl font-semibold leading-none tracking-tight tabular-nums">
          {value}
          <span className="ml-1 text-base font-normal text-muted-foreground">
            h
          </span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        How long the appliance needs to run once started.
      </p>
      <div>
        <Slider
          id="consumer-duration-slider"
          min={1}
          max={5}
          value={[value]}
          onValueChange={(v) => onChange(v[0])}
        />
        <div className="mt-2.5 flex justify-between text-xs text-muted-foreground tabular-nums">
          <span>1h</span>
          <span>2h</span>
          <span>3h</span>
          <span>4h</span>
          <span>5h</span>
        </div>
      </div>
    </div>
  );
}
