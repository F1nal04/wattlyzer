"use client";

import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { useSettings } from "@/lib/settings-context";

export default function Home() {
  const { settings } = useSettings();
  const [consumerDuration, setConsumerDuration] = useState(3);
  const [displayText, setDisplayText] = useState("");
  const [position, setPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [, setLocationError] = useState<string | null>(null);
  const [solarData, setSolarData] = useState<{
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
  } | null>(null);
  const [marketData, setMarketData] = useState<{
    object: string;
    data: Array<{
      start_timestamp: number;
      end_timestamp: number;
      marketprice: number;
      unit: string;
    }>;
    url: string;
  } | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [schedulingResult, setSchedulingResult] = useState<{
    bestTime: Date;
    reason: "solar" | "price";
    avgSolarProduction?: number;
    avgPrice?: number;
  } | null>(null);
  const fullText = "wattlyzer";

  const calculatePowerGeneration = (hoursFromNow: number) => {
    if (!solarData) return 0;

    const now = new Date();
    const targetTime = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000);

    // Convert solar data timestamps to array and sort
    const timestamps = Object.keys(solarData.result)
      .map((ts) => ({
        timestamp: new Date(ts).getTime(),
        dateStr: ts,
        value: solarData.result[ts],
        date: new Date(ts).toDateString(), // For grouping by day
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    if (timestamps.length === 0) return 0;

    // Find the closest timestamp at or before our target time
    let closestBeforeIndex = -1;
    let closestAfterIndex = -1;

    for (let i = 0; i < timestamps.length; i++) {
      if (timestamps[i].timestamp <= targetTime.getTime()) {
        closestBeforeIndex = i;
      }
      if (
        timestamps[i].timestamp > targetTime.getTime() &&
        closestAfterIndex === -1
      ) {
        closestAfterIndex = i;
        break;
      }
    }

    // If no data available for this time, return 0
    if (closestBeforeIndex === -1) return 0;

    // Get the hour production by finding the next timestamp and calculating difference
    let nextIndex = closestAfterIndex;
    if (nextIndex === -1) {
      // If no next timestamp, try to find the next hour within same day
      for (let i = closestBeforeIndex + 1; i < timestamps.length; i++) {
        if (timestamps[i].date === timestamps[closestBeforeIndex].date) {
          nextIndex = i;
          break;
        }
      }
    }

    if (nextIndex === -1 || nextIndex <= closestBeforeIndex) {
      // No next data point available, estimate based on typical solar curve
      return 0;
    }

    // Ensure both timestamps are from the same day (solar data resets daily)
    if (timestamps[closestBeforeIndex].date !== timestamps[nextIndex].date) {
      return 0;
    }

    const startValue = timestamps[closestBeforeIndex].value;
    const endValue = timestamps[nextIndex].value;
    const timeDiffHours =
      (timestamps[nextIndex].timestamp -
        timestamps[closestBeforeIndex].timestamp) /
      (1000 * 60 * 60);

    // Calculate hourly rate and return production for 1 hour
    const hourlyProduction = Math.max(
      0,
      (endValue - startValue) / timeDiffHours
    );

    return hourlyProduction;
  };

  const calculateMarketPrice = (hoursFromNow: number) => {
    if (!marketData || !marketData.data) return 0;

    const now = new Date();
    const targetTime = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000);
    const targetTimestamp = targetTime.getTime();

    // Find the market price data that contains the target time
    // Market data timestamps are in milliseconds
    const priceData = marketData.data.find(
      (item) =>
        targetTimestamp >= item.start_timestamp &&
        targetTimestamp < item.end_timestamp
    );

    return priceData ? priceData.marketprice : 0;
  };

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 150);

    return () => clearInterval(typingInterval);
  }, []);

  useEffect(() => {
    if (position && settings) {
      const fetchSolarData = async () => {
        setApiLoading(true);
        setApiError(null);

        try {
          const { latitude, longitude } = position;
          const { angle, kwh, azimut } = settings;

          // Convert compass azimut (0-360) to API format (-180 to 180)
          let apiAzimut;
          if (azimut === 0 || azimut === 360) {
            apiAzimut = -180; // North
          } else if (azimut <= 180) {
            apiAzimut = azimut - 180; // 90->-90, 180->0
          } else {
            apiAzimut = azimut - 180; // 270->90
          }

          const url = `https://api.forecast.solar/estimate/watthours/${latitude}/${longitude}/${angle}/${apiAzimut}/${kwh}`;

          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }

          const data = await response.json();
          setSolarData(data);
        } catch (error) {
          setApiError(
            error instanceof Error
              ? error.message
              : "Failed to fetch solar data"
          );
        } finally {
          setApiLoading(false);
        }
      };

      const fetchMarketData = async () => {
        try {
          const response = await fetch("https://api.awattar.de/v1/marketdata");
          if (!response.ok) {
            throw new Error(`Market API error: ${response.status}`);
          }

          const data = await response.json();
          setMarketData(data);
        } catch (error) {
          setApiError(
            error instanceof Error
              ? error.message
              : "Failed to fetch market data"
          );
        }
      };

      fetchSolarData();
      fetchMarketData();
    }
  }, [position, settings]);

  useEffect(() => {
    const calculateSchedule = () => {
      if (!solarData || !marketData) return null;

      const now = new Date();
      const results: Array<{
        startTime: Date;
        avgSolarProduction: number;
        avgPrice: number;
        solarQualifies: boolean;
      }> = [];

      // Check every hour in the next 24 hours, but ensure we don't go beyond available data
      const maxStartHour = Math.min(24, 24 - consumerDuration + 1);

      for (let h = 0; h < maxStartHour; h++) {
        const startTime = new Date(now.getTime() + h * 60 * 60 * 1000);

        // Calculate total solar production and price over the consumer duration
        let totalSolarProduction = 0;
        let totalPrice = 0;
        let validHours = 0;

        for (let i = 0; i < consumerDuration; i++) {
          const hoursFromNow = h + i;

          // Only process if within our 24-hour window
          if (hoursFromNow >= 0 && hoursFromNow < 24) {
            const solarProduction = calculatePowerGeneration(hoursFromNow);
            const price = calculateMarketPrice(hoursFromNow);

            totalSolarProduction += solarProduction;
            totalPrice += price;
            validHours++;
          }
        }

        // Only include slots where we have complete data for the entire duration
        if (validHours === consumerDuration) {
          const avgSolarProduction = totalSolarProduction / validHours;
          const avgPrice = totalPrice / validHours;
          const solarQualifies = avgSolarProduction >= 1200; // 1.2kWh = 1200Wh

          results.push({
            startTime,
            avgSolarProduction,
            avgPrice,
            solarQualifies,
          });
        }
      }

      if (results.length === 0) return null;

      // First priority: Find slots with solar production >= 1.2kWh average
      const solarQualifiedSlots = results.filter((r) => r.solarQualifies);

      if (solarQualifiedSlots.length > 0) {
        // Among solar-qualified slots, pick the one with highest solar production
        const best = solarQualifiedSlots.reduce((best, current) =>
          current.avgSolarProduction > best.avgSolarProduction ? current : best
        );

        return {
          bestTime: best.startTime,
          reason: "solar" as const,
          avgSolarProduction: best.avgSolarProduction,
          avgPrice: best.avgPrice,
        };
      }

      // If no solar-qualified slots, find the cheapest price slot
      const cheapest = results.reduce((best, current) =>
        current.avgPrice < best.avgPrice ? current : best
      );

      return {
        bestTime: cheapest.startTime,
        reason: "price" as const,
        avgSolarProduction: cheapest.avgSolarProduction,
        avgPrice: cheapest.avgPrice,
      };
    };

    if (solarData && marketData) {
      const result = calculateSchedule();
      setSchedulingResult(result);
    }
  }, [solarData, marketData, consumerDuration]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPosition({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationError("Location access denied by user");
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError("Location information unavailable");
              break;
            case error.TIMEOUT:
              setLocationError("Location request timed out");
              break;
            default:
              setLocationError("Unknown location error");
              break;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    } else {
      setLocationError("Geolocation not supported by browser");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-800 to-yellow-700 flex flex-col items-center justify-center px-4">
      {/* Title with typewriter effect */}
      <div className="mb-16">
        <h1 className="text-6xl md:text-8xl font-bold text-white text-center font-sans">
          {displayText}
          <span className="cursor-blink">|</span>
        </h1>
      </div>

      {/* Energy consumer scheduling section */}
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <label
            htmlFor="consumer-duration-slider"
            className="block text-2xl font-semibold text-white mb-4"
          >
            Consumer Duration: {consumerDuration} hours
          </label>
          <Slider
            id="consumer-duration-slider"
            min={1}
            max={5}
            defaultValue={[3]}
            onValueChange={(value) => setConsumerDuration(value[0])}
          />
          <div className="flex justify-between text-sm text-gray-300 mt-2">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
        </div>

        {schedulingResult && !apiLoading ? (
          <div className="text-center">
            <div className="text-8xl md:text-9xl font-bold text-yellow-400 font-sans">
              {schedulingResult.bestTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </div>
            <div className="text-xl text-gray-300 mt-2">
              {schedulingResult.bestTime.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>

            <div className="mt-4 space-y-2">
              <div
                className={`px-4 py-2 rounded-full inline-block ${
                  schedulingResult.reason === "solar"
                    ? "bg-yellow-500/20 text-yellow-300"
                    : "bg-blue-500/20 text-blue-300"
                }`}
              >
                {schedulingResult.reason === "solar"
                  ? "☀️ Solar Optimized"
                  : "💰 Price Optimized"}
              </div>

              <div className="text-sm text-gray-400 space-y-1">
                <div>
                  Avg Solar:{" "}
                  {(schedulingResult.avgSolarProduction || 0).toFixed(0)} Wh
                </div>
                <div>
                  Avg Price: {(schedulingResult.avgPrice || 0).toFixed(1)} €/MWh
                </div>
                {schedulingResult.reason === "solar" && (
                  <div className="text-yellow-300">✓ Meets 1.2kWh minimum</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-8xl md:text-9xl font-bold text-gray-500 font-sans">
              --:--
            </div>
            <div className="text-xl text-gray-400 mt-2">
              {apiLoading
                ? "Calculating optimal schedule..."
                : "Waiting for data..."}
            </div>
          </div>
        )}

        {apiError && (
          <div className="text-red-400 text-sm text-center mt-4">
            Error: {apiError}
          </div>
        )}
      </div>

      {/* Footer links */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-6">
        <a
          href="https://github.com/F1nal04/wattlyzer"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          GitHub
        </a>
        <a
          href="/legal"
          className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          Legal Notice
        </a>
        <a
          href="/settings"
          className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          Settings
        </a>
      </div>
    </div>
  );
}
