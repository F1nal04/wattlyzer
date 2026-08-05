import type {
  MarketData,
  SchedulingResult,
  SolarData,
  TopSlotsResult,
} from "./types";

export type BestSlotMode = "combined" | "solar-only" | "price-only";

/** Platform-neutral inputs used by scheduling and weather calculations. */
export interface SchedulingSettings {
  kwh: number;
  minKwh: number;
  morningShading: boolean;
  shadingEndTime: number;
  eveningShading: boolean;
  shadingStartTime: number;
  bestSlotMode: BestSlotMode;
}

export interface ScheduleRequest {
  solarData: SolarData | null;
  marketData: MarketData | null;
  settings: SchedulingSettings | undefined;
  consumerDuration: number;
  searchTimespan: number;
  now: Date;
}

export interface ScheduleEvaluation {
  schedulingResult: SchedulingResult | null;
  topSlotsResult: TopSlotsResult | null;
}
