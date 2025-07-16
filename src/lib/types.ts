export type SolarData = {
  result: Record<string, number>;
  message: {
    code: number;
    type: string;
    text: string;
    pid: string;
    info: {
      latitude: number;
      longitude: number;
      distance: number;
      place: string;
      timezone: string;
      time: string;
      time_utc: string;
    };
    ratelimit: {
      zone: string;
      period: number;
      limit: number;
      remaining: number;
    };
  };
};

export type MarketData = {
  object: string;
  data: Array<{
    start_timestamp: number;
    end_timestamp: number;
    marketprice: number;
    unit: string;
  }>;
  url: string;
};

export type SchedulingResult = {
  bestTime: Date;
  reason: "solar" | "price";
  avgSolarProduction?: number;
  avgPrice?: number;
};

export type SlotResult = {
  startTime: Date;
  avgSolarProduction: number;
  avgPrice: number;
  solarQualifies: boolean;
};

export type TopSlotsResult = {
  topSolarSlots: SlotResult[];
  topPriceSlots: SlotResult[];
};
