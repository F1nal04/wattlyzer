"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSettings } from "@/lib/settings-context";
import { useScheduling } from "@/hooks/use-scheduling";
import {
  clearCacheEntry,
  getCacheInfo,
  MARKET_CACHE_KEY,
  SOLAR_CACHE_KEY,
  roundCoordinate,
} from "@/lib/cache";
import { MarketData, SolarData } from "@/lib/types";
import packageJson from "../../../package.json";

const commitSha = process.env.NEXT_PUBLIC_COMMIT_SHA || "unknown";
const serverSystemInfoSnapshot = {
  userAgent: "Unknown",
  screenSize: "Unknown",
  timezone: "Unknown",
  language: "Unknown",
  online: "Unknown",
  localStorage: "Unknown",
};
let cachedSystemInfoSnapshot = serverSystemInfoSnapshot;

function subscribeToGeolocationSupport() {
  return () => {};
}

function getGeolocationSupportSnapshot() {
  return !!navigator.geolocation;
}

function getGeolocationSupportServerSnapshot() {
  return null;
}

function formatCacheAge(ageMs: number) {
  const minutes = Math.floor(ageMs / 1000 / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ago`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ago`;
  }

  if (minutes > 0) {
    return `${minutes}m ago`;
  }

  return "Just now";
}

function formatDateTime(value: string | number) {
  return new Date(value).toLocaleString();
}

function SectionCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-gray-950/55 p-5 shadow-[0_24px_80px_-48px_rgba(251,191,36,0.45)] backdrop-blur-md md:p-7">
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-[0.28em] text-yellow-300/70">
          {eyebrow}
        </div>
        <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function InfoTile({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-[11px] uppercase tracking-[0.22em] text-yellow-200/70">
        {label}
      </div>
      <div className="mt-2 break-words text-sm leading-6 text-white">{value}</div>
    </div>
  );
}

function subscribeToSystemInfo(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange);
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);

  return () => {
    window.removeEventListener("resize", onStoreChange);
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

function getSystemInfoSnapshot() {
  const nextSnapshot = {
    userAgent: navigator.userAgent,
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    online: navigator.onLine ? "Online" : "Offline",
    localStorage: typeof Storage !== "undefined" ? "Available" : "Not available",
  };

  const isUnchanged =
    cachedSystemInfoSnapshot.userAgent === nextSnapshot.userAgent &&
    cachedSystemInfoSnapshot.screenSize === nextSnapshot.screenSize &&
    cachedSystemInfoSnapshot.timezone === nextSnapshot.timezone &&
    cachedSystemInfoSnapshot.language === nextSnapshot.language &&
    cachedSystemInfoSnapshot.online === nextSnapshot.online &&
    cachedSystemInfoSnapshot.localStorage === nextSnapshot.localStorage;

  if (isUnchanged) {
    return cachedSystemInfoSnapshot;
  }

  cachedSystemInfoSnapshot = nextSnapshot;
  return cachedSystemInfoSnapshot;
}

function getSystemInfoServerSnapshot() {
  return serverSystemInfoSnapshot;
}

export default function Debug() {
  const { settings } = useSettings();
  const [position, setPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const hasGeolocationSupport = useSyncExternalStore(
    subscribeToGeolocationSupport,
    getGeolocationSupportSnapshot,
    getGeolocationSupportServerSnapshot
  );
  const systemInfo = useSyncExternalStore(
    subscribeToSystemInfo,
    getSystemInfoSnapshot,
    getSystemInfoServerSnapshot
  );

  const { solarData, marketData, schedulingResult, topSlotsResult, apiError } =
    useScheduling(position, 3, 24);

  useEffect(() => {
    if (!hasGeolocationSupport) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (nextPosition) => {
        setPosition({
          latitude: nextPosition.coords.latitude,
          longitude: nextPosition.coords.longitude,
        });
      },
      (error) => {
        setLocationError(error.message);
      }
    );
  }, [hasGeolocationSupport]);

  const cacheInfo =
    position && settings
      ? (() => {
          const { latitude, longitude } = position;
          const { angle, azimut, kwh } = settings;
          const roundedLat = roundCoordinate(latitude);
          const roundedLng = roundCoordinate(longitude);
          const solarKey = `${roundedLat},${roundedLng},${angle},${azimut},${kwh}`;

          return {
            solar: getCacheInfo<SolarData>(SOLAR_CACHE_KEY, solarKey),
            market: getCacheInfo<MarketData>(MARKET_CACHE_KEY, "market"),
            solarKey,
          };
        })()
      : null;

  const solarRows = solarData ? Object.entries(solarData.result) : [];
  const marketRows = marketData?.data ?? [];

  const handleClearCache = (cacheKey: string) => {
    clearCacheEntry(cacheKey);
    window.location.reload();
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.18),transparent_28%),linear-gradient(135deg,#050505_0%,#151515_42%,#3b2b0f_100%)] px-4 py-8 md:px-6 md:py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-16 top-24 h-48 w-48 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute bottom-12 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-amber-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <header className="rounded-[32px] border border-white/12 bg-black/30 p-6 shadow-[0_28px_100px_-56px_rgba(251,191,36,0.6)] backdrop-blur-md md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-yellow-200">
                Diagnostics
              </div>
              <h1 className="mt-4 text-4xl font-bold text-white md:text-5xl">
                Inspect the scheduler state.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300 md:text-base">
                Cached data, current settings, API status, and calculated top
                slots are all visible here in a more structured layout.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/6 px-5 py-3 text-center text-sm font-medium text-white whitespace-nowrap transition-colors hover:border-yellow-300/35 hover:bg-yellow-300/10 hover:text-yellow-100"
            >
              Back to Wattlyzer
            </Link>
          </div>
        </header>

        <div className="mt-8 grid gap-6">
          <SectionCard
            eyebrow="Runtime"
            title="Build and environment"
            description="Basic versioning and runtime context for the current browser session."
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <InfoTile label="Version" value={packageJson.version} />
              <InfoTile label="Commit" value={commitSha} />
              <InfoTile label="Timezone" value={systemInfo.timezone} />
              <InfoTile label="Status" value={systemInfo.online} />
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Configuration"
            title="Current settings"
            description="The exact values used by the solar and scheduling logic."
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <InfoTile label="Azimut (Compass)" value={`${settings.azimut}°`} />
              <InfoTile label="Azimut (API)" value={`${(settings.azimut % 360) - 180}°`} />
              <InfoTile label="Tilt Angle" value={`${settings.angle}°`} />
              <InfoTile label="System Size" value={`${settings.kwh} kW`} />
              <InfoTile
                label="Solar Minimum"
                value={`${settings.minKwh} Wh (${(settings.minKwh / 1000).toFixed(1)} kWh)`}
              />
              <InfoTile
                label="Morning Shading"
                value={settings.morningShading ? "Enabled" : "Disabled"}
              />
              <InfoTile
                label="Morning Clears"
                value={`${settings.shadingEndTime}:00`}
              />
              <InfoTile
                label="Evening Shading"
                value={settings.eveningShading ? "Enabled" : "Disabled"}
              />
              <InfoTile
                label="Evening Starts"
                value={`${settings.shadingStartTime}:00`}
              />
              <InfoTile
                label="Best Slot Mode"
                value={
                  settings.bestSlotMode === "price-only"
                    ? "Price only"
                    : settings.bestSlotMode === "solar-only"
                    ? "Solar only"
                    : "Combined"
                }
              />
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Location"
            title="Geolocation and cache keys"
            description="Coordinates used for the solar estimate and the derived cache key."
          >
            {position ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <InfoTile
                    label="Latitude"
                    value={position.latitude.toFixed(6)}
                  />
                  <InfoTile
                    label="Longitude"
                    value={position.longitude.toFixed(6)}
                  />
                  <InfoTile
                    label="Rounded Latitude"
                    value={roundCoordinate(position.latitude)}
                  />
                  <InfoTile
                    label="Rounded Longitude"
                    value={roundCoordinate(position.longitude)}
                  />
                </div>
                {cacheInfo ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-yellow-200/70">
                      Solar Cache Key
                    </div>
                    <code className="mt-2 block break-all text-xs leading-6 text-gray-300">
                      {cacheInfo.solarKey}
                    </code>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
                {locationError ||
                  (hasGeolocationSupport === false
                    ? "Geolocation is not supported by this browser."
                    : "Getting location...")}
              </div>
            )}
          </SectionCard>

          <div className="grid gap-6 xl:grid-cols-2">
            <SectionCard
              eyebrow="Cache"
              title="Cache status"
              description="Whether solar and market API responses are currently available in local storage."
            >
              {cacheInfo ? (
                <div className="grid gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-3">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-yellow-200/70">
                          Solar Cache
                        </div>
                        <div className="text-sm leading-6 text-white">
                          {cacheInfo.solar.exists
                            ? cacheInfo.solar.data
                              ? "Cached"
                              : "Expired or invalid"
                            : "Not cached"}
                        </div>
                        <div className="text-sm leading-6 text-gray-400">
                          {cacheInfo.solar.timestamp
                            ? `${formatCacheAge(cacheInfo.solar.age || 0)}${
                                cacheInfo.solar.isExpired ? " (expired)" : ""
                              }`
                            : "No timestamp available"}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleClearCache(SOLAR_CACHE_KEY)}
                        className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-yellow-300/35 hover:bg-yellow-300/10 hover:text-yellow-100"
                      >
                        Clear solar cache
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-3">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-yellow-200/70">
                          Market Cache
                        </div>
                        <div className="text-sm leading-6 text-white">
                          {cacheInfo.market.exists
                            ? cacheInfo.market.data
                              ? "Cached"
                              : "Expired or invalid"
                            : "Not cached"}
                        </div>
                        <div className="text-sm leading-6 text-gray-400">
                          {cacheInfo.market.timestamp
                            ? `${formatCacheAge(cacheInfo.market.age || 0)}${
                                cacheInfo.market.isExpired ? " (expired)" : ""
                              }`
                            : "No timestamp available"}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleClearCache(MARKET_CACHE_KEY)}
                        className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-yellow-300/35 hover:bg-yellow-300/10 hover:text-yellow-100"
                      >
                        Clear market cache
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-gray-300">
                  No cache information available.
                </div>
              )}
            </SectionCard>

            <SectionCard
              eyebrow="API"
              title="Loaded data"
              description="Whether the current solar and market requests have resolved and if any API error was captured."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoTile
                  label="Solar Data"
                  value={
                    solarData
                      ? `${Object.keys(solarData.result).length} data points`
                      : "Not loaded"
                  }
                />
                <InfoTile
                  label="Market Data"
                  value={
                    settings.bestSlotMode === "solar-only"
                      ? "Ignored in solar-only mode"
                      : marketData
                      ? `${marketData.data?.length || 0} price points`
                      : "Not loaded"
                  }
                />
              </div>

              {apiError ? (
                <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
                  API Error: {apiError}
                </div>
              ) : null}

              <Accordion
                type="multiple"
                className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] px-4"
              >
                <AccordionItem value="solar-data" className="border-white/10">
                  <AccordionTrigger className="text-white hover:no-underline">
                    <div>
                      <div className="text-sm font-semibold">Solar data table</div>
                      <div className="mt-1 text-xs text-gray-400">
                        {solarData
                          ? cacheInfo?.solar.exists
                            ? `${solarRows.length} loaded rows`
                            : `${solarRows.length} rows loaded in memory only`
                          : "No solar data loaded"}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {solarData ? (
                      <Table className="text-gray-200">
                        <TableHeader>
                          <TableRow className="border-white/10 hover:bg-white/[0.03]">
                            <TableHead className="text-gray-300">Timestamp</TableHead>
                            <TableHead className="text-right text-gray-300">
                              Production (Wh)
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {solarRows.map(([timestamp, production]) => (
                            <TableRow
                              key={timestamp}
                              className="border-white/10 hover:bg-white/[0.03]"
                            >
                              <TableCell>{formatDateTime(timestamp)}</TableCell>
                              <TableCell className="text-right">
                                {production.toFixed(0)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-gray-300">
                        Solar data is not loaded yet.
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="market-data" className="border-white/10">
                  <AccordionTrigger className="text-white hover:no-underline">
                    <div>
                      <div className="text-sm font-semibold">Market data table</div>
                      <div className="mt-1 text-xs text-gray-400">
                        {settings.bestSlotMode === "solar-only"
                          ? "Ignored in solar-only mode"
                          : marketData
                          ? cacheInfo?.market.exists
                            ? `${marketRows.length} loaded rows`
                            : `${marketRows.length} rows loaded in memory only`
                          : "No market data loaded"}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {settings.bestSlotMode === "solar-only" ? (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-gray-300">
                        Market data is skipped while solar-only mode is active.
                      </div>
                    ) : marketData ? (
                      <Table className="text-gray-200">
                        <TableHeader>
                          <TableRow className="border-white/10 hover:bg-white/[0.03]">
                            <TableHead className="text-gray-300">Start</TableHead>
                            <TableHead className="text-gray-300">End</TableHead>
                            <TableHead className="text-right text-gray-300">
                              Price
                            </TableHead>
                            <TableHead className="text-gray-300">Unit</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {marketRows.map((entry) => (
                            <TableRow
                              key={entry.start_timestamp}
                              className="border-white/10 hover:bg-white/[0.03]"
                            >
                              <TableCell>
                                {formatDateTime(entry.start_timestamp)}
                              </TableCell>
                              <TableCell>
                                {formatDateTime(entry.end_timestamp)}
                              </TableCell>
                              <TableCell className="text-right">
                                {entry.marketprice.toFixed(3)}
                              </TableCell>
                              <TableCell>{entry.unit}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-gray-300">
                        Market data is not loaded yet.
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </SectionCard>
          </div>

          <SectionCard
            eyebrow="Ranking"
            title="Top scheduling slots"
            description="The best solar-heavy windows, the cheapest windows, and the final recommendation for the current debug run."
          >
            {topSlotsResult ? (
              <div className="grid gap-6 xl:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-yellow-300">
                    Best solar production slots
                  </h3>
                  {topSlotsResult.topSolarSlots.map((slot, index) => (
                    <div
                      key={`solar-${index}`}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                    >
                      <div className="text-sm font-semibold text-white">
                        #{index + 1} {slot.startTime.toLocaleString()}
                      </div>
                      <div className="mt-2 text-sm leading-6 text-gray-300">
                        Solar: {slot.avgSolarProduction.toFixed(0)} Wh
                        <br />
                        Price: {(slot.avgPrice / 1000).toFixed(3)} €/kWh
                        <br />
                        Qualifies: {slot.solarQualifies ? "Yes" : "No"}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-green-300">
                    Best price slots
                  </h3>
                  {topSlotsResult.topPriceSlots.length > 0 ? (
                    topSlotsResult.topPriceSlots.map((slot, index) => (
                      <div
                        key={`price-${index}`}
                        className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                      >
                        <div className="text-sm font-semibold text-white">
                          #{index + 1} {slot.startTime.toLocaleString()}
                        </div>
                        <div className="mt-2 text-sm leading-6 text-gray-300">
                          Solar: {slot.avgSolarProduction.toFixed(0)} Wh
                          <br />
                          Price: {(slot.avgPrice / 1000).toFixed(3)} €/kWh
                          <br />
                          Qualifies: {slot.solarQualifies ? "Yes" : "No"}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-gray-300">
                      Price ranking is skipped in solar-only mode.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-gray-300">
                {settings.bestSlotMode === "solar-only"
                  ? `No slot reaches the ${(settings.minKwh / 1000).toFixed(1)} kWh solar minimum in the current search window.`
                  : "No scheduling data available."}
              </div>
            )}

            {schedulingResult ? (
              <div className="mt-6 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-5">
                <div className="text-[11px] uppercase tracking-[0.22em] text-blue-200/70">
                  Current Recommendation
                </div>
                <div className="mt-2 text-lg font-semibold text-white">
                  {schedulingResult.bestTime.toLocaleString()}
                </div>
                <div className="mt-2 text-sm leading-6 text-gray-300">
                  Reason:{" "}
                  {settings.bestSlotMode === "solar-only"
                    ? "Solar only"
                    : settings.bestSlotMode === "price-only"
                    ? "Price only"
                    : schedulingResult.reason === "solar"
                    ? "Solar"
                    : "Price"}
                  <br />
                  Solar: {(schedulingResult.avgSolarProduction || 0).toFixed(0)} Wh
                  <br />
                  Price:{" "}
                  {settings.bestSlotMode === "solar-only"
                    ? "Ignored"
                    : `${((schedulingResult.avgPrice || 0) / 1000).toFixed(3)} €/kWh`}
                </div>
              </div>
            ) : null}
          </SectionCard>

          <SectionCard
            eyebrow="Client"
            title="Browser information"
            description="Useful runtime details when debugging layout, storage, or browser-specific behavior."
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <InfoTile label="Screen Size" value={systemInfo.screenSize} />
              <InfoTile label="Language" value={systemInfo.language} />
              <InfoTile label="Local Storage" value={systemInfo.localStorage} />
              <div className="sm:col-span-2 xl:col-span-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-yellow-200/70">
                  User Agent
                </div>
                <div className="mt-2 break-all text-sm leading-6 text-gray-300">
                  {systemInfo.userAgent}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
