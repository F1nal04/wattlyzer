"use client";

import { Clock3 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function WindowSelect({
  value,
  onChange,
  hoursTillEndOfDay,
}: {
  value: string;
  onChange: (next: string) => void;
  hoursTillEndOfDay: number;
}) {
  return (
    <div className="space-y-3 py-1">
      <label
        htmlFor="search-timespan-select"
        className="flex items-center gap-2 text-sm font-medium"
      >
        <Clock3 className="size-4 text-muted-foreground" />
        Search window
      </label>
      <p className="text-sm text-muted-foreground">
        How far ahead wattlyzer should scan for a better slot.
      </p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="search-timespan-select">
          <SelectValue placeholder="Select timespan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="3">Next 3 hours</SelectItem>
          <SelectItem value="6">Next 6 hours</SelectItem>
          <SelectItem value="12">Next 12 hours</SelectItem>
          <SelectItem value="24">Next 24 hours</SelectItem>
          <SelectItem value="eod">Till end of day ({hoursTillEndOfDay}h)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
