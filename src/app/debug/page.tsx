"use client";

import Link from "next/link";
import { useSettings } from "@/lib/settings-context";
import { useScheduling } from "@/hooks/use-scheduling";
import {
  getCachedData,
  SOLAR_CACHE_KEY,
  MARKET_CACHE_KEY,
  roundCoordinate,
} from "@/lib/cache";
import { useState, useEffect } from "react";
import { SolarData, MarketData } from "@/lib/types";

export default function Debug() {
  const { settings, getApiAzimut } = useSettings();
  const [position, setPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [cacheInfo, setCacheInfo] = useState<{
    solar: SolarData | null;
    market: MarketData | null;
    solarKey: string;
  } | null>(null);

  const { solarData, marketData, schedulingResult, apiError } = useScheduling(
    position,
    3
  );

  // Get user location
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
          setLocationError(error.message);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  }, []);

  // Check cache status
  useEffect(() => {
    if (position && settings) {
      const { latitude, longitude } = position;
      const { angle, kwh, azimut } = settings;
      const roundedLat = roundCoordinate(latitude);
      const roundedLng = roundCoordinate(longitude);
      const solarKey = `${roundedLat},${roundedLng},${angle},${azimut},${kwh}`;

      const solarCache = getCachedData<SolarData>(SOLAR_CACHE_KEY, solarKey);
      const marketCache = getCachedData<MarketData>(MARKET_CACHE_KEY, "market");

      setCacheInfo({
        solar: solarCache,
        market: marketCache,
        solarKey,
      });
    }
  }, [position, settings]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-black via-gray-800 to-yellow-800 flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-4xl mx-auto bg-gray-900/50 rounded-lg p-6 md:p-8 backdrop-blur-sm">
        <h1 className="text-4xl font-bold text-white text-center mb-8 font-sans">
          Debug Information
        </h1>

        <div className="space-y-6 text-gray-300">
          {/* Settings Information */}
          <section className="bg-gray-800/50 rounded-lg p-4">
            <h2 className="text-2xl font-semibold text-white mb-4">Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Azimut (Compass):</strong> {settings.azimut}°
              </div>
              <div>
                <strong>Azimut (API):</strong> {getApiAzimut()}°
              </div>
              <div>
                <strong>Angle:</strong> {settings.angle}°
              </div>
              <div>
                <strong>kWh:</strong> {settings.kwh}
              </div>
              <div>
                <strong>Min kWh:</strong> {settings.minKwh} Wh (
                {(settings.minKwh / 1000).toFixed(1)} kWh)
              </div>
              <div>
                <strong>Beta Calculations:</strong>{" "}
                {settings.betaCalculations ? "Enabled" : "Disabled"}
              </div>
            </div>
          </section>

          {/* Location Information */}
          <section className="bg-gray-800/50 rounded-lg p-4">
            <h2 className="text-2xl font-semibold text-white mb-4">Location</h2>
            {position ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Latitude:</strong> {position.latitude.toFixed(6)}
                </div>
                <div>
                  <strong>Longitude:</strong> {position.longitude.toFixed(6)}
                </div>
                <div>
                  <strong>Rounded Lat:</strong>{" "}
                  {roundCoordinate(position.latitude)}
                </div>
                <div>
                  <strong>Rounded Lng:</strong>{" "}
                  {roundCoordinate(position.longitude)}
                </div>
              </div>
            ) : (
              <div className="text-red-400">
                {locationError || "Getting location..."}
              </div>
            )}
          </section>

          {/* Cache Information */}
          <section className="bg-gray-800/50 rounded-lg p-4">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Cache Status
            </h2>
            {cacheInfo ? (
              <div className="space-y-4">
                <div>
                  <strong>Solar Cache Key:</strong>
                  <code className="block bg-gray-700 p-2 rounded mt-1 text-xs">
                    {cacheInfo.solarKey}
                  </code>
                </div>
                <div>
                  <strong>Solar Cache:</strong>{" "}
                  {cacheInfo.solar ? "✅ Cached" : "❌ Not cached"}
                </div>
                <div>
                  <strong>Market Cache:</strong>{" "}
                  {cacheInfo.market ? "✅ Cached" : "❌ Not cached"}
                </div>
              </div>
            ) : (
              <div className="text-gray-400">
                No cache information available
              </div>
            )}
          </section>

          {/* API Data */}
          <section className="bg-gray-800/50 rounded-lg p-4">
            <h2 className="text-2xl font-semibold text-white mb-4">API Data</h2>
            <div className="space-y-4">
              <div>
                <strong>Solar Data:</strong>{" "}
                {solarData ? "✅ Loaded" : "❌ Not loaded"}
                {solarData && (
                  <div className="text-xs text-gray-400 mt-1">
                    {Object.keys(solarData.result).length} data points
                  </div>
                )}
              </div>
              <div>
                <strong>Market Data:</strong>{" "}
                {marketData ? "✅ Loaded" : "❌ Not loaded"}
                {marketData && (
                  <div className="text-xs text-gray-400 mt-1">
                    {marketData.data?.length || 0} price points
                  </div>
                )}
              </div>
              {apiError && (
                <div className="text-red-400">
                  <strong>API Error:</strong> {apiError}
                </div>
              )}
            </div>
          </section>

          {/* Scheduling Result */}
          <section className="bg-gray-800/50 rounded-lg p-4">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Scheduling Result
            </h2>
            {schedulingResult ? (
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Best Time:</strong>{" "}
                  {schedulingResult.bestTime.toLocaleString()}
                </div>
                <div>
                  <strong>Reason:</strong>{" "}
                  {schedulingResult.reason === "solar"
                    ? "☀️ Solar Optimized"
                    : "💰 Price Optimized"}
                </div>
                <div>
                  <strong>Avg Solar Production:</strong>{" "}
                  {(schedulingResult.avgSolarProduction || 0).toFixed(0)} Wh
                </div>
                <div>
                  <strong>Avg Price:</strong>{" "}
                  {((schedulingResult.avgPrice || 0) / 1000).toFixed(3)} €/kWh
                </div>
              </div>
            ) : (
              <div className="text-gray-400">
                No scheduling result available
              </div>
            )}
          </section>

          {/* System Information */}
          <section className="bg-gray-800/50 rounded-lg p-4">
            <h2 className="text-2xl font-semibold text-white mb-4">
              System Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>User Agent:</strong>
                <div className="text-xs text-gray-400 mt-1 break-all">
                  {navigator.userAgent}
                </div>
              </div>
              <div>
                <strong>Screen Size:</strong> {window.innerWidth}x
                {window.innerHeight}
              </div>
              <div>
                <strong>Timezone:</strong>{" "}
                {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </div>
              <div>
                <strong>Language:</strong> {navigator.language}
              </div>
              <div>
                <strong>Online:</strong>{" "}
                {navigator.onLine ? "✅ Online" : "❌ Offline"}
              </div>
              <div>
                <strong>Local Storage:</strong>{" "}
                {typeof Storage !== "undefined"
                  ? "✅ Available"
                  : "❌ Not available"}
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
          >
            ← Back to Wattlyzer
          </Link>
        </div>
      </div>
    </div>
  );
}
