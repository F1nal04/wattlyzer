"use client";

import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, Suspense, useCallback, useMemo } from "react";
import {
  SolarDataFetcher,
  MarketDataFetcher,
} from "@/components/data-fetchers";
import { ErrorBoundary } from "@/components/error-boundary";
import { useScheduling } from "@/hooks/use-scheduling";
import { useSettings } from "@/lib/settings-context";
import { isDebugMode } from "@/lib/utils";
import Link from "next/link";

export default function Home() {
  const { settings } = useSettings();
  const [consumerDuration, setConsumerDuration] = useState(3);
  const [searchTimespan, setSearchTimespan] = useState<string>("24");
  const [displayText, setDisplayText] = useState("");
  const [position, setPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showRemainingTime, setShowRemainingTime] = useState<boolean>(false);
  const [showDebugLink, setShowDebugLink] = useState<boolean>(false);

  // Calculate hours till end of day
  const hoursTillEndOfDay = useMemo(() => {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    return Math.ceil((endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60));
  }, []);

  // Convert search timespan to number
  const searchTimespanHours = useMemo(() => {
    if (searchTimespan === "eod") {
      return hoursTillEndOfDay;
    }
    return parseInt(searchTimespan);
  }, [searchTimespan, hoursTillEndOfDay]);

  const {
    schedulingResult,
    apiError,
    solarDataPromise,
    marketDataPromise,
    handleSolarData,
    handleMarketData,
    handleError,
  } = useScheduling(position, consumerDuration, searchTimespanHours);

  const fullText = "wattlyzer";

  // Function to calculate remaining time in hours and minutes
  const formatRemainingTime = useCallback((targetTime: Date) => {
    const now = new Date();
    const diffMs = targetTime.getTime() - now.getTime();

    if (diffMs <= 0) {
      return "now";
    }

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  }, []);

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

  // Check if debug mode should be enabled
  useEffect(() => {
    setShowDebugLink(isDebugMode());

    // Listen for URL changes to update debug mode
    const handleUrlChange = () => {
      setShowDebugLink(isDebugMode());
    };

    window.addEventListener("popstate", handleUrlChange);

    return () => {
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, []);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-black via-gray-800 to-yellow-700 flex flex-col items-center justify-center px-4 relative">
      {/* Title with typewriter effect */}
      <div className="mb-16">
        <h1 className="text-6xl md:text-8xl font-bold text-white text-center font-sans">
          <span className="sr-only">wattlyzer - energy optimization tool</span>
          <span aria-hidden="true">
            {displayText}
            <span aria-hidden="true" className="cursor-blink">
              |
            </span>
          </span>
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

        <div className="text-center">
          <label
            htmlFor="search-timespan-select"
            className="block text-2xl font-semibold text-white mb-4"
          >
            Search Window
          </label>
          <div className="flex justify-center">
            <Select value={searchTimespan} onValueChange={setSearchTimespan}>
              <SelectTrigger
                id="search-timespan-select"
                className="w-[200px] bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors"
              >
                <SelectValue placeholder="Select timespan" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 text-white border-white/20">
                <SelectItem value="3">Next 3 hours</SelectItem>
                <SelectItem value="6">Next 6 hours</SelectItem>
                <SelectItem value="12">Next 12 hours</SelectItem>
                <SelectItem value="24">Next 24 hours</SelectItem>
                <SelectItem value="eod">
                  Till end of day ({hoursTillEndOfDay}h)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-gray-400 mt-2">
            Find the best time within this window
          </div>
        </div>

        <ErrorBoundary
          fallback={
            <div className="text-center">
              <div className="text-8xl md:text-9xl font-bold text-red-400 font-sans">
                --:--
              </div>
              <div className="text-xl text-red-400 mt-2">
                Failed to load data
              </div>
            </div>
          }
          onError={handleError}
        >
          <Suspense
            fallback={
              <div className="text-center">
                <div className="text-8xl md:text-9xl font-bold text-gray-500 font-sans">
                  --:--
                </div>
                <div className="text-xl text-gray-400 mt-2">
                  {locationError ? "Location required" : "Loading data..."}
                </div>
              </div>
            }
          >
            {solarDataPromise ? (
              <SolarDataFetcher
                promise={solarDataPromise}
                onData={handleSolarData}
              />
            ) : null}
            {marketDataPromise ? (
              <MarketDataFetcher
                promise={marketDataPromise}
                onData={handleMarketData}
              />
            ) : null}
          </Suspense>

          {!position && !locationError && (
            <div className="text-center">
              <div className="text-8xl md:text-9xl font-bold text-gray-500 font-sans">
                --:--
              </div>
              <div className="text-xl text-gray-400 mt-2">
                Requesting location...
              </div>
            </div>
          )}

          {!position && locationError && (
            <div className="text-center">
              <div className="text-8xl md:text-9xl font-bold text-red-400 font-sans">
                --:--
              </div>
              <div className="text-xl text-red-400 mt-2">
                Location access required
              </div>
              <div className="text-sm text-gray-400 mt-2">
                Please enable location services to get solar estimates
              </div>
            </div>
          )}

          {position && searchTimespanHours < consumerDuration && (
            <div className="text-center">
              <div className="text-8xl md:text-9xl font-bold text-orange-400 font-sans">
                ⚠️
              </div>
              <div className="text-xl text-orange-400 mt-2">
                Invalid Configuration
              </div>
              <div className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                Search window ({searchTimespanHours}h) must be longer than
                consumer duration ({consumerDuration}h)
              </div>
            </div>
          )}

          {position &&
          searchTimespanHours >= consumerDuration &&
          schedulingResult ? (
            <div className="text-center">
              <div
                className="text-8xl md:text-9xl font-bold text-yellow-400 font-sans cursor-pointer hover:text-yellow-300 transition-colors"
                onClick={() => setShowRemainingTime(!showRemainingTime)}
                title={
                  showRemainingTime
                    ? "Click to show time"
                    : "Click to show remaining time"
                }
              >
                {showRemainingTime
                  ? formatRemainingTime(schedulingResult.bestTime)
                  : schedulingResult.bestTime.toLocaleTimeString("en-US", {
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
                    Avg Price:{" "}
                    {((schedulingResult.avgPrice || 0) / 1000).toFixed(3)} €/kWh
                  </div>
                  {schedulingResult.reason === "solar" && (
                    <div className="text-yellow-300">
                      ✓ Meets {(settings.minKwh / 1000).toFixed(1)}kWh minimum
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </ErrorBoundary>

        {apiError && (
          <div className="text-red-400 text-sm text-center mt-4">
            API Error: {apiError}
          </div>
        )}
      </div>

      {/* Footer links */}
      <div className="fixed bottom-0 left-0 right-0 pb-safe-bottom">
        <div className="flex justify-center space-x-4 px-2 py-4 bg-gradient-to-t from-black/50 to-transparent">
          <Link
            href="https://github.com/F1nal04/wattlyzer"
            target="_blank"
            rel="noopener noreferrer"
            prefetch={false}
            className="text-sm text-gray-300 hover:text-white transition-colors py-3 px-4 rounded-lg hover:bg-gray-800/50 min-w-[64px] text-center touch-manipulation"
          >
            GitHub
          </Link>
          <Link
            href="/legal"
            className="text-sm text-gray-300 hover:text-white transition-colors py-3 px-4 rounded-lg hover:bg-gray-800/50 min-w-[64px] text-center touch-manipulation"
          >
            Legal
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-gray-300 hover:text-white transition-colors py-3 px-4 rounded-lg hover:bg-gray-800/50 min-w-[64px] text-center touch-manipulation"
          >
            Privacy
          </Link>
          <Link
            href="/settings"
            className="text-sm text-gray-300 hover:text-white transition-colors py-3 px-4 rounded-lg hover:bg-gray-800/50 min-w-[64px] text-center touch-manipulation"
          >
            Settings
          </Link>
          {showDebugLink && (
            <Link
              href="/debug"
              className="text-sm text-gray-300 hover:text-white transition-colors py-3 px-4 rounded-lg hover:bg-gray-800/50 min-w-[64px] text-center touch-manipulation"
            >
              Debug
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
