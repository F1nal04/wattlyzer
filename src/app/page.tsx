"use client";

import { Slider } from "@/components/ui/slider";
import { useState, useEffect, Suspense, useCallback } from "react";
import { SolarDataFetcher, MarketDataFetcher } from "@/components/data-fetchers";
import { ErrorBoundary } from "@/components/error-boundary";
import { useScheduling } from "@/hooks/use-scheduling";

export default function Home() {
  const [consumerDuration, setConsumerDuration] = useState(3);
  const [displayText, setDisplayText] = useState("");
  const [position, setPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showRemainingTime, setShowRemainingTime] = useState<boolean>(false);
  
  const {
    schedulingResult,
    apiError,
    solarDataPromise,
    marketDataPromise,
    handleSolarData,
    handleMarketData,
    handleError
  } = useScheduling(position, consumerDuration);

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
          <Suspense fallback={
            <div className="text-center">
              <div className="text-8xl md:text-9xl font-bold text-gray-500 font-sans">
                --:--
              </div>
              <div className="text-xl text-gray-400 mt-2">
                {locationError ? "Location required" : "Loading data..."}
              </div>
            </div>
          }>
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
          
          {schedulingResult ? (
            <div className="text-center">
              <div 
                className="text-8xl md:text-9xl font-bold text-yellow-400 font-sans cursor-pointer hover:text-yellow-300 transition-colors"
                onClick={() => setShowRemainingTime(!showRemainingTime)}
                title={showRemainingTime ? "Click to show time" : "Click to show remaining time"}
              >
                {showRemainingTime 
                  ? formatRemainingTime(schedulingResult.bestTime)
                  : schedulingResult.bestTime.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                }
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
          ) : null}
        </ErrorBoundary>

        {apiError && (
          <div className="text-red-400 text-sm text-center mt-4">
            API Error: {apiError}
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
          href="/privacy"
          className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          Privacy Policy
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