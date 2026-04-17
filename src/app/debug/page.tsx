"use client";

import {
  BarChart3,
  Database,
  Laptop,
  MapPinned,
  MonitorCog,
  SlidersHorizontal,
  Trash2,
  Wifi,
} from "lucide-react";
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  if (days > 0) return `${days}d ${hours % 24}h ago`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

function formatDateTime(value: string | number) {
  return new Date(value).toLocaleString();
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
  const next = {
    userAgent: navigator.userAgent,
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    online: navigator.onLine ? "Online" : "Offline",
    localStorage:
      typeof Storage !== "undefined" ? "Available" : "Not available",
  };
  const same =
    cachedSystemInfoSnapshot.userAgent === next.userAgent &&
    cachedSystemInfoSnapshot.screenSize === next.screenSize &&
    cachedSystemInfoSnapshot.timezone === next.timezone &&
    cachedSystemInfoSnapshot.language === next.language &&
    cachedSystemInfoSnapshot.online === next.online &&
    cachedSystemInfoSnapshot.localStorage === next.localStorage;
  if (same) return cachedSystemInfoSnapshot;
  cachedSystemInfoSnapshot = next;
  return cachedSystemInfoSnapshot;
}
function getSystemInfoServerSnapshot() {
  return serverSystemInfoSnapshot;
}

function Section({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <section className="mt-12">
      <div className="flex items-start gap-3 border-b border-border pb-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-background shadow-sm">
          <Icon className="size-4" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="pt-1">{children}</div>
    </section>
  );
}

function DataRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border py-3 last:border-b-0">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="font-mono text-sm text-foreground break-all text-right">
        {value}
      </div>
    </div>
  );
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
    if (!hasGeolocationSupport) return;
    navigator.geolocation.getCurrentPosition(
      (p) =>
        setPosition({
          latitude: p.coords.latitude,
          longitude: p.coords.longitude,
        }),
      (err) => setLocationError(err.message)
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

  const formatAvgPrice = (avgPrice: number | null | undefined) =>
    avgPrice == null ? "Unavailable" : `${(avgPrice / 1000).toFixed(3)} €/kWh`;

  const handleClearCache = (cacheKey: string) => {
    clearCacheEntry(cacheKey);
    window.location.reload();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 pb-20 md:px-6 md:pt-14">
      <header className="space-y-3">
        <div className="text-xs font-medium text-muted-foreground">
          Diagnostics
        </div>
        <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
          Inspect the
          <br />
          <span className="bg-gradient-price bg-clip-text text-transparent">
            scheduler state.
          </span>
        </h1>
        <p className="max-w-xl text-base text-muted-foreground">
          Cached data, current settings, API status, and calculated top slots
          in a structured spec-sheet layout.
        </p>
      </header>

      <Section
        icon={MonitorCog}
        title="Build &amp; environment"
        description="Runtime context for the current browser session."
      >
        <DataRow label="Version" value={packageJson.version} />
        <DataRow label="Commit" value={commitSha} />
        <DataRow label="Timezone" value={systemInfo.timezone} />
        <DataRow label="Status" value={systemInfo.online} />
      </Section>

      <Section
        icon={SlidersHorizontal}
        title="Current settings"
        description="The exact values used by the solar and scheduling logic."
      >
        <DataRow label="Azimut (Compass)" value={`${settings.azimut}°`} />
        <DataRow
          label="Azimut (API)"
          value={`${(settings.azimut % 360) - 180}°`}
        />
        <DataRow label="Tilt Angle" value={`${settings.angle}°`} />
        <DataRow label="System Size" value={`${settings.kwh} kW`} />
        <DataRow
          label="Solar Minimum"
          value={`${settings.minKwh} Wh (${(settings.minKwh / 1000).toFixed(1)} kWh)`}
        />
        <DataRow
          label="Morning Shading"
          value={settings.morningShading ? "Enabled" : "Disabled"}
        />
        <DataRow label="Morning Clears" value={`${settings.shadingEndTime}:00`} />
        <DataRow
          label="Evening Shading"
          value={settings.eveningShading ? "Enabled" : "Disabled"}
        />
        <DataRow
          label="Evening Starts"
          value={`${settings.shadingStartTime}:00`}
        />
        <DataRow
          label="Best Slot Mode"
          value={
            settings.bestSlotMode === "price-only"
              ? "Price only"
              : settings.bestSlotMode === "solar-only"
                ? "Solar only"
                : "Combined"
          }
        />
      </Section>

      <Section
        icon={MapPinned}
        title="Geolocation &amp; cache keys"
        description="Coordinates used for the solar estimate and the derived cache key."
      >
        {position ? (
          <>
            <DataRow label="Latitude" value={position.latitude.toFixed(6)} />
            <DataRow label="Longitude" value={position.longitude.toFixed(6)} />
            <DataRow
              label="Rounded Latitude"
              value={roundCoordinate(position.latitude)}
            />
            <DataRow
              label="Rounded Longitude"
              value={roundCoordinate(position.longitude)}
            />
            {cacheInfo ? (
              <DataRow label="Solar Cache Key" value={cacheInfo.solarKey} />
            ) : null}
          </>
        ) : (
          <div className="py-6 text-sm text-destructive">
            {locationError ||
              (hasGeolocationSupport === false
                ? "Geolocation is not supported by this browser."
                : "Getting location…")}
          </div>
        )}
      </Section>

      <Section
        icon={Database}
        title="Cache status"
        description="Whether solar and market API responses are currently in local storage."
      >
        {cacheInfo ? (
          <div className="divide-y divide-border">
            <div className="flex flex-wrap items-center justify-between gap-3 py-5">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  Solar cache
                  <Badge
                    variant={
                      cacheInfo.solar.exists
                        ? cacheInfo.solar.isExpired
                          ? "warning"
                          : "solar"
                        : "outline"
                    }
                  >
                    {cacheInfo.solar.exists
                      ? cacheInfo.solar.isExpired
                        ? "Expired"
                        : "Cached"
                      : "Empty"}
                  </Badge>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {cacheInfo.solar.timestamp
                    ? formatCacheAge(cacheInfo.solar.age || 0)
                    : "No timestamp available"}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleClearCache(SOLAR_CACHE_KEY)}
              >
                <Trash2 className="size-3.5" />
                Clear
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 py-5">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  Market cache
                  <Badge
                    variant={
                      cacheInfo.market.exists
                        ? cacheInfo.market.isExpired
                          ? "warning"
                          : "price"
                        : "outline"
                    }
                  >
                    {cacheInfo.market.exists
                      ? cacheInfo.market.isExpired
                        ? "Expired"
                        : "Cached"
                      : "Empty"}
                  </Badge>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {cacheInfo.market.timestamp
                    ? formatCacheAge(cacheInfo.market.age || 0)
                    : "No timestamp available"}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleClearCache(MARKET_CACHE_KEY)}
              >
                <Trash2 className="size-3.5" />
                Clear
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-sm text-muted-foreground">
            No cache information available.
          </div>
        )}
      </Section>

      <Section
        icon={Wifi}
        title="API data"
        description="Whether the current solar and market requests have resolved."
      >
        <DataRow
          label="Solar data"
          value={
            solarData
              ? `${Object.keys(solarData.result).length} points`
              : "Not loaded"
          }
        />
        <DataRow
          label="Market data"
          value={
            settings.bestSlotMode === "solar-only"
              ? "Ignored in solar-only mode"
              : marketData
                ? `${marketData.data?.length || 0} price points`
                : "Not loaded"
          }
        />

        {apiError ? (
          <div className="relative flex gap-3 py-4 pl-5 text-sm">
            <span
              aria-hidden
              className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full bg-destructive"
            />
            <div className="space-y-1">
              <div className="font-medium">API error</div>
              <div className="leading-6 text-muted-foreground">{apiError}</div>
            </div>
          </div>
        ) : null}

        <Accordion type="multiple" className="mt-2">
          <AccordionItem value="solar-data">
            <AccordionTrigger>
              <div>
                <div className="text-sm font-semibold">Solar data table</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {solarData ? `${solarRows.length} rows` : "Not loaded"}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {solarData ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead className="text-right">
                        Production (Wh)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {solarRows.map(([timestamp, production]) => (
                      <TableRow key={timestamp}>
                        <TableCell className="font-mono text-xs">
                          {formatDateTime(timestamp)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {production.toFixed(0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-3 text-sm text-muted-foreground">
                  Solar data is not loaded yet.
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="market-data">
            <AccordionTrigger>
              <div>
                <div className="text-sm font-semibold">Market data table</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {settings.bestSlotMode === "solar-only"
                    ? "Ignored in solar-only mode"
                    : marketData
                      ? `${marketRows.length} rows`
                      : "Not loaded"}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {settings.bestSlotMode === "solar-only" ? (
                <div className="py-3 text-sm text-muted-foreground">
                  Market data is skipped while solar-only mode is active.
                </div>
              ) : marketData ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Start</TableHead>
                      <TableHead>End</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead>Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {marketRows.map((entry) => (
                      <TableRow key={entry.start_timestamp}>
                        <TableCell className="font-mono text-xs">
                          {formatDateTime(entry.start_timestamp)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {formatDateTime(entry.end_timestamp)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {entry.marketprice.toFixed(3)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {entry.unit}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-3 text-sm text-muted-foreground">
                  Market data is not loaded yet.
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Section>

      <Section
        icon={BarChart3}
        title="Top scheduling slots"
        description="Top solar-heavy windows, top cheapest windows, and the final recommendation."
      >
        {topSlotsResult ? (
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <Badge variant="solar">Best solar</Badge>
              <div className="mt-4 divide-y divide-border">
                {topSlotsResult.topSolarSlots.map((slot, i) => (
                  <div key={`solar-${i}`} className="py-4">
                    <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      #{i + 1}
                    </div>
                    <div className="mt-1 font-mono text-sm">
                      {slot.startTime.toLocaleString()}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-muted-foreground">
                      Solar: {slot.avgSolarProduction.toFixed(0)} Wh · Price:{" "}
                      {formatAvgPrice(slot.avgPrice)} ·{" "}
                      {slot.solarQualifies ? "Qualifies" : "Does not qualify"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Badge variant="price">Best price</Badge>
              <div className="mt-4 divide-y divide-border">
                {topSlotsResult.topPriceSlots.length > 0 ? (
                  topSlotsResult.topPriceSlots.map((slot, i) => (
                    <div key={`price-${i}`} className="py-4">
                      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        #{i + 1}
                      </div>
                      <div className="mt-1 font-mono text-sm">
                        {slot.startTime.toLocaleString()}
                      </div>
                      <div className="mt-2 text-sm leading-6 text-muted-foreground">
                        Solar: {slot.avgSolarProduction.toFixed(0)} Wh · Price:{" "}
                        {formatAvgPrice(slot.avgPrice)} ·{" "}
                        {slot.solarQualifies ? "Qualifies" : "Does not qualify"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-sm text-muted-foreground">
                    Price ranking is skipped in solar-only mode.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-sm text-muted-foreground">
            {settings.bestSlotMode === "solar-only"
              ? `No slot reaches the ${(settings.minKwh / 1000).toFixed(1)} kWh solar minimum.`
              : "No scheduling data available."}
          </div>
        )}

        {schedulingResult ? (
          <div className="mt-8 border-t border-border pt-6">
            <div className="text-xs font-medium uppercase tracking-wider text-combined">
              Current recommendation
            </div>
            <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
              {schedulingResult.bestTime.toLocaleString()}
            </div>
            <div className="mt-2 text-sm leading-6 text-muted-foreground">
              Reason:{" "}
              {settings.bestSlotMode === "solar-only"
                ? "Solar only"
                : settings.bestSlotMode === "price-only"
                  ? "Price only"
                  : schedulingResult.reason === "solar"
                    ? "Solar"
                    : "Price"}
              {" · "}
              Solar: {(schedulingResult.avgSolarProduction || 0).toFixed(0)} Wh
              {" · "}
              Price:{" "}
              {settings.bestSlotMode === "solar-only"
                ? "Ignored"
                : formatAvgPrice(schedulingResult.avgPrice)}
            </div>
          </div>
        ) : null}
      </Section>

      <Section
        icon={Laptop}
        title="Browser information"
        description="Useful runtime details when debugging layout, storage, or browser behavior."
      >
        <DataRow label="Screen size" value={systemInfo.screenSize} />
        <DataRow label="Language" value={systemInfo.language} />
        <DataRow label="Local storage" value={systemInfo.localStorage} />
        <DataRow
          label="User agent"
          value={
            <span className="text-xs break-all">{systemInfo.userAgent}</span>
          }
        />
      </Section>
    </div>
  );
}
