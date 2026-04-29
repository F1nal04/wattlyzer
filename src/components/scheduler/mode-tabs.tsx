"use client";

import { Coins, Scale, Sun } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BestSlotMode } from "@/lib/settings-context";

export function ModeTabs({
  value,
  onValueChange,
}: {
  value: BestSlotMode;
  onValueChange: (value: BestSlotMode) => void;
}) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onValueChange(next as BestSlotMode)}
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="combined">
          <Scale className="size-3.5" />
          <span className="hidden sm:inline">Combined</span>
          <span className="sm:hidden">Both</span>
        </TabsTrigger>
        <TabsTrigger value="solar-only">
          <Sun className="size-3.5" />
          <span className="hidden sm:inline">Solar only</span>
          <span className="sm:hidden">Solar</span>
        </TabsTrigger>
        <TabsTrigger value="price-only">
          <Coins className="size-3.5" />
          <span className="hidden sm:inline">Price only</span>
          <span className="sm:hidden">Price</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
