"use client";

import { Suspense, useEffect, useState } from "react";
import {
  SolarDataFetcher,
  MarketDataFetcher,
} from "@/components/data-fetchers";
import { ErrorBoundary } from "@/components/error-boundary";
import { useScheduling } from "@/hooks/use-scheduling";
import { useSettings, type BestSlotMode } from "@/lib/settings-context";
import { Callout } from "@/components/scheduler/callout";
import { DurationControl } from "@/components/scheduler/duration-control";
import { MinEnergyControl } from "@/components/scheduler/min-energy-control";
import { ModeTabs } from "@/components/scheduler/mode-tabs";
import { WindowSelect } from "@/components/scheduler/window-select";
import { ResultHero } from "@/components/scheduler/result-hero";

function SchedulerBody() {
  const { settings, updateSettings } = useSettings();
  const [consumerDuration, setConsumerDuration] = useState(3);
  const [searchTimespan, setSearchTimespan] = useState<string>("24");
  const [position, setPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [hoursTillEndOfDay, setHoursTillEndOfDay] = useState(() => {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    return Math.ceil((endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60));
  });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const hours = Math.ceil(
        (endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60)
      );
      setHoursTillEndOfDay((prev) => (prev !== hours ? hours : prev));
    };
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported by browser");
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
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information unavailable");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out");
            break;
          default:
            setLocationError("Unknown location error");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const searchTimespanHours =
    searchTimespan === "eod" ? hoursTillEndOfDay : parseInt(searchTimespan, 10);

  const {
    solarData,
    schedulingResult,
    apiError,
    solarDataPromise,
    marketDataPromise,
    handleSolarData,
    handleMarketData,
    handleError,
    marketDataSufficiency,
  } = useScheduling(position, consumerDuration, searchTimespanHours);

  const showMarketDataWarning =
    settings.bestSlotMode !== "solar-only" &&
    !!position &&
    searchTimespanHours >= consumerDuration &&
    !!marketDataSufficiency &&
    !marketDataSufficiency.isSufficient;

  const showNoSuitableSolarSlot =
    settings.bestSlotMode === "solar-only" &&
    !!position &&
    searchTimespanHours >= consumerDuration &&
    !!solarData &&
    !schedulingResult &&
    !apiError;

  const averagePriceLabel =
    settings.bestSlotMode === "solar-only"
      ? "—"
      : schedulingResult?.avgPrice == null
        ? "Unavailable"
        : `${(schedulingResult.avgPrice / 1000).toFixed(3)} €/kWh`;

  return (
    <div className="mx-auto max-w-2xl px-4 pt-10 pb-20 md:px-6 md:pt-14">
      {/* Intro */}
      <section className="space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-gradient-brand" />
          </span>
          Live scheduler
        </div>
        <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
          When should you run your
          <br />
          <span className="bg-gradient-brand bg-clip-text text-transparent">
            next appliance?
          </span>
        </h1>
        <p className="max-w-xl text-base text-muted-foreground md:text-lg">
          Wattlyzer balances solar forecast and hourly electricity prices to find
          the best run window for your home.
        </p>
      </section>

      {/* Result */}
      <section className="mt-10">
        <ErrorBoundary
          fallback={
            <Callout tone="danger" title="Failed to load data">
              A required data request failed. Try again in a moment or clear
              the cache from settings.
            </Callout>
          }
          onError={handleError}
        >
          <Suspense
            fallback={
              <Callout
                tone="loading"
                title={locationError ? "Location required" : "Loading data"}
              >
                {locationError
                  ? "Location permission is required to calculate solar production for your roof."
                  : settings.bestSlotMode === "solar-only"
                    ? "Fetching solar forecast."
                    : "Fetching solar forecast and market prices."}
              </Callout>
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

          {!position && !locationError ? (
            <Callout tone="loading" title="Requesting location">
              Wattlyzer needs your current position to estimate local solar
              production.
            </Callout>
          ) : null}

          {!position && locationError ? (
            <Callout tone="danger" title="Location access required">
              Enable location services in your browser so the scheduler can load
              solar estimates for your area.
            </Callout>
          ) : null}

          {position && searchTimespanHours < consumerDuration ? (
            <Callout tone="warning" title="Invalid configuration">
              Search window ({searchTimespanHours}h) must be longer than run
              duration ({consumerDuration}h).
            </Callout>
          ) : null}

          {showMarketDataWarning && marketDataSufficiency ? (
            <Callout tone="warning" title="Limited market data">
              Only {marketDataSufficiency.hoursAvailable} hours of market data
              are available, but the selected search window is{" "}
              {marketDataSufficiency.searchTimespanHours} hours.
            </Callout>
          ) : null}

          {showNoSuitableSolarSlot ? (
            <Callout tone="warning" title="No suitable solar window">
              No slot in the selected search window reaches the{" "}
              {(settings.minKwh / 1000).toFixed(1)} kWh solar minimum. Try
              lowering the threshold or expanding the search window.
            </Callout>
          ) : null}

          {position &&
          searchTimespanHours >= consumerDuration &&
          schedulingResult ? (
            <ResultHero
              bestTime={schedulingResult.bestTime}
              mode={settings.bestSlotMode}
              reason={schedulingResult.reason}
              avgSolarProduction={schedulingResult.avgSolarProduction || 0}
              avgPriceEuroPerKwh={averagePriceLabel}
              meetsSolarMinimum={
                settings.bestSlotMode !== "price-only" &&
                schedulingResult.reason === "solar"
              }
              minSolarKwh={settings.minKwh}
            />
          ) : null}

          {apiError ? (
            <Callout tone="danger" title="API error">
              {apiError}
            </Callout>
          ) : null}
        </ErrorBoundary>
      </section>

      {/* Controls */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between border-b border-border pb-3">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            This run
          </h2>
          <span className="text-xs text-muted-foreground">
            Per-run parameters
          </span>
        </div>

        <div className="divide-y divide-border">
          <div className="py-6">
            <DurationControl
              value={consumerDuration}
              onChange={setConsumerDuration}
            />
          </div>
          <div className="py-6">
            <MinEnergyControl
              value={settings.minKwh}
              onChange={(next) => updateSettings({ minKwh: next })}
            />
          </div>
          <div className="py-6">
            <WindowSelect
              value={searchTimespan}
              onChange={setSearchTimespan}
              hoursTillEndOfDay={hoursTillEndOfDay}
            />
          </div>
          <div className="space-y-3 py-6">
            <div className="text-sm font-medium">Scheduling mode</div>
            <p className="text-sm text-muted-foreground">
              Balance both signals, prefer solar, or optimize for the cheapest
              price.
            </p>
            <ModeTabs
              value={settings.bestSlotMode}
              onValueChange={(mode: BestSlotMode) =>
                updateSettings({ bestSlotMode: mode })
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  return <SchedulerBody />;
}
