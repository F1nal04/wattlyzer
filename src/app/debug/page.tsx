"use client";

import Link from "next/link";
import { useSettings } from "@/lib/settings-context";
import { useScheduling } from "@/hooks/use-scheduling";
import {
  getCacheInfo,
  SOLAR_CACHE_KEY,
  MARKET_CACHE_KEY,
  roundCoordinate,
} from "@/lib/cache";
import { useState, useEffect } from "react";
import { SolarData, MarketData } from "@/lib/types";
import packageJson from "../../../package.json";

export default function Debug() {
  const { settings, getApiAzimut } = useSettings();

  // Helper function to format cache age
  const formatCacheAge = (ageMs: number): string => {
    const minutes = Math.floor(ageMs / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ago`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return "Just now";
    }
  };
  const [position, setPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [cacheInfo, setCacheInfo] = useState<{
    solar: {
      data: SolarData | null;
      timestamp: number | null;
      age: number | null;
      isExpired: boolean;
      exists: boolean;
    };
    market: {
      data: MarketData | null;
      timestamp: number | null;
      age: number | null;
      isExpired: boolean;
      exists: boolean;
    };
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

      const solarCacheInfo = getCacheInfo<SolarData>(SOLAR_CACHE_KEY, solarKey);
      const marketCacheInfo = getCacheInfo<MarketData>(
        MARKET_CACHE_KEY,
        "market"
      );

      setCacheInfo({
        solar: solarCacheInfo,
        market: marketCacheInfo,
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
          {/* App Version */}
          <section className="bg-gray-800/50 rounded-lg p-4">
            <h2 className="text-2xl font-semibold text-white mb-4">
              App Version
            </h2>
            <div className="text-lg">
              <strong>Version:</strong> {packageJson.version}
            </div>
          </section>

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
                <strong>Morning Shading:</strong>{" "}
                {settings.morningShading ? "Enabled" : "Disabled"}
              </div>
              <div>
                <strong>Shading End Time:</strong> {settings.shadingEndTime}:00
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
                  {cacheInfo.solar.exists ? (
                    <span>
                      {cacheInfo.solar.data
                        ? "✅ Cached"
                        : "❌ Expired/Invalid"}
                      {cacheInfo.solar.timestamp && (
                        <div className="text-xs text-gray-400 mt-1">
                          Cached:{" "}
                          {new Date(cacheInfo.solar.timestamp).toLocaleString()}
                          <br />
                          Age: {formatCacheAge(cacheInfo.solar.age || 0)}
                          {cacheInfo.solar.isExpired && " (expired)"}
                        </div>
                      )}
                    </span>
                  ) : (
                    "❌ Not cached"
                  )}
                </div>
                <div>
                  <strong>Market Cache:</strong>{" "}
                  {cacheInfo.market.exists ? (
                    <span>
                      {cacheInfo.market.data
                        ? "✅ Cached"
                        : "❌ Expired/Invalid"}
                      {cacheInfo.market.timestamp && (
                        <div className="text-xs text-gray-400 mt-1">
                          Cached:{" "}
                          {new Date(
                            cacheInfo.market.timestamp
                          ).toLocaleString()}
                          <br />
                          Age: {formatCacheAge(cacheInfo.market.age || 0)}
                          {cacheInfo.market.isExpired && " (expired)"}
                        </div>
                      )}
                    </span>
                  ) : (
                    "❌ Not cached"
                  )}
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
                  {typeof navigator !== "undefined"
                    ? navigator.userAgent
                    : "Unknown"}
                </div>
              </div>
              <div>
                <strong>Screen Size:</strong>{" "}
                {typeof window !== "undefined"
                  ? `${window.innerWidth}x${window.innerHeight}`
                  : "Unknown"}
              </div>
              <div>
                <strong>Timezone:</strong>{" "}
                {typeof Intl !== "undefined"
                  ? Intl.DateTimeFormat().resolvedOptions().timeZone
                  : "Unknown"}
              </div>
              <div>
                <strong>Language:</strong>{" "}
                {typeof navigator !== "undefined"
                  ? navigator.language
                  : "Unknown"}
              </div>
              <div>
                <strong>Online:</strong>{" "}
                {typeof navigator !== "undefined" &&
                navigator.onLine !== undefined
                  ? navigator.onLine
                    ? "✅ Online"
                    : "❌ Offline"
                  : "Unknown"}
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
