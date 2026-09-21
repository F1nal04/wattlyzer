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

// BrightSky (api.brightsky.dev) hourly DWD weather — only the fields we read.
// `condition` is DWD's categorical sky state (dry/fog/rain/sleet/snow/hail/
// thunderstorm) and `precipitation` is the hour's rainfall in mm; both drive
// the rain/snow/fog hero visuals.
export type WeatherData = {
  weather: Array<{
    timestamp: string;
    cloud_cover: number | null;
    condition?: string | null;
    precipitation?: number | null;
  }>;
};

export type MarketData = {
  object: string;
  data: Array<{
    start_timestamp: number;
    end_timestamp: number;
    /** EUR/MWh — aWATTar sends `unit: "Eur/MWh"`. ct/kWh is this / 10,
     *  and only `marketPriceToCentsPerKwh` may do that division. */
    marketprice: number;
    unit: string;
  }>;
  url: string;
};

export type SchedulingResult = {
  bestTime: Date;
  reason: "solar" | "price";
  /** Average Wh generated per hour over the slot, after the fixed 0.7
   *  factor — the same scale as `settings.minKwh` (e.g. 1200 = 1.2 kWh).
   *  Meaningless in `price-only` mode, which never waits for forecast.solar. */
  avgSolarProduction?: number;
  /** Mean raw aWATTar `marketprice` over the slot, so EUR/MWh. Convert with
   *  `marketPriceToCentsPerKwh`. Undefined without complete market coverage. */
  avgPrice?: number;
};

export type SlotResult = {
  startTime: Date;
  avgSolarProduction: number;
  avgPrice: number | null;
  solarQualifies: boolean;
};

export type TopSlotsResult = {
  topSolarSlots: SlotResult[];
  topPriceSlots: SlotResult[];
};
