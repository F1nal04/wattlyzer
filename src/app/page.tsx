"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  Suspense,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  SolarDataFetcher,
  MarketDataFetcher,
} from "@/components/data-fetchers";
import { ErrorBoundary } from "@/components/error-boundary";
import { useScheduling } from "@/hooks/use-scheduling";
import { useSettings } from "@/lib/settings-context";
import { isDebugMode } from "@/lib/utils";

function formatRemainingTime(targetTime: Date) {
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
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

function TypewriterTitle() {
  const [displayText, setDisplayText] = useState("");
  const fullText = "wattlyzer";

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex));
        currentIndex += 1;
      } else {
        clearInterval(typingInterval);
      }
    }, 120);

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <span aria-hidden="true">
      {displayText}
      <span aria-hidden="true" className="motion-safe:animate-blink">
        |
      </span>
    </span>
  );
}

function SectionCard({
  eyebrow,
  title,
  description,
  children,
  className = "",
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[28px] border border-white/10 bg-gray-950/55 p-5 shadow-[0_24px_80px_-48px_rgba(251,191,36,0.45)] backdrop-blur-md md:p-7 ${className}`}
    >
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-[0.28em] text-yellow-300/70">
          {eyebrow}
        </div>
        <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

function FooterLinks({ showDebugLink }: { showDebugLink: boolean }) {
  return (
    <div className="mt-10 pb-safe-bottom">
      <div className="flex flex-nowrap items-center justify-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-black/25 px-2 py-1.5 backdrop-blur-sm">
        <Link
          href="https://github.com/F1nal04/wattlyzer"
          target="_blank"
          rel="noopener noreferrer"
          prefetch={false}
          className="shrink-0 rounded-full px-2 py-1.5 text-xs text-gray-300 whitespace-nowrap transition-colors hover:bg-white/8 hover:text-white sm:px-3 sm:py-2 sm:text-sm"
        >
          GitHub
        </Link>
        <Link
          href="/legal"
          className="shrink-0 rounded-full px-2 py-1.5 text-xs text-gray-300 whitespace-nowrap transition-colors hover:bg-white/8 hover:text-white sm:px-3 sm:py-2 sm:text-sm"
        >
          Legal
        </Link>
        <Link
          href="/privacy"
          className="shrink-0 rounded-full px-2 py-1.5 text-xs text-gray-300 whitespace-nowrap transition-colors hover:bg-white/8 hover:text-white sm:px-3 sm:py-2 sm:text-sm"
        >
          Privacy
        </Link>
        <Link
          href="/settings"
          className="shrink-0 rounded-full px-2 py-1.5 text-xs text-gray-300 whitespace-nowrap transition-colors hover:bg-white/8 hover:text-white sm:px-3 sm:py-2 sm:text-sm"
        >
          Settings
        </Link>
        {showDebugLink && (
          <Link
            href="/debug"
            className="shrink-0 rounded-full px-2 py-1.5 text-xs text-gray-300 whitespace-nowrap transition-colors hover:bg-white/8 hover:text-white sm:px-3 sm:py-2 sm:text-sm"
          >
            Debug
          </Link>
        )}
      </div>
    </div>
  );
}

function ControlBlock({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-gray-400">{description}</p>
      </div>
      {children}
    </div>
  );
}

function StatusPanel({
  title,
  body,
  accent,
}: {
  title: string;
  body: string;
  accent: "red" | "orange" | "gray";
}) {
  const tones = {
    red: "border-red-400/20 bg-red-500/10 text-red-200",
    orange: "border-orange-400/20 bg-orange-500/10 text-orange-200",
    gray: "border-white/10 bg-white/[0.04] text-gray-200",
  };

  return (
    <div className={`rounded-2xl border p-5 ${tones[accent]}`}>
      <div className="text-lg font-semibold">{title}</div>
      <p className="mt-2 text-sm leading-6 text-gray-300">{body}</p>
    </div>
  );
}

function subscribeToDebugMode(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);

  return () => {
    window.removeEventListener("popstate", onStoreChange);
  };
}

function getDebugModeSnapshot() {
  return isDebugMode();
}

function getDebugModeServerSnapshot() {
  return false;
}

function SchedulingPanel({ showDebugLink }: { showDebugLink: boolean }) {
  const { settings, updateSettings } = useSettings();
  const [consumerDuration, setConsumerDuration] = useState(3);
  const [searchTimespan, setSearchTimespan] = useState<string>("24");
  const [position, setPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showRemainingTime, setShowRemainingTime] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [hoursTillEndOfDay, setHoursTillEndOfDay] = useState(() => {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    return Math.ceil((endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60));
  });
  const advancedOptionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("wattlyzer_show_advanced");
    if (saved !== null) {
      setShowAdvancedOptions(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "wattlyzer_show_advanced",
      JSON.stringify(showAdvancedOptions)
    );
  }, [showAdvancedOptions]);

  useEffect(() => {
    if (showAdvancedOptions && advancedOptionsRef.current) {
      setTimeout(() => {
        advancedOptionsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 250);
    }
  }, [showAdvancedOptions]);

  useEffect(() => {
    const updateHours = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const hours = Math.ceil(
        (endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60)
      );

      setHoursTillEndOfDay((prev) => (prev !== hours ? hours : prev));
    };

    const interval = setInterval(updateHours, 60000);
    return () => clearInterval(interval);
  }, []);

  const searchTimespanHours =
    searchTimespan === "eod" ? hoursTillEndOfDay : parseInt(searchTimespan, 10);

  const {
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
    !!position &&
    searchTimespanHours >= consumerDuration &&
    !!marketDataSufficiency &&
    !marketDataSufficiency.isSufficient;

  useEffect(() => {
    if (navigator.geolocation) {
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
    <div className="mx-auto mt-8 max-w-xl space-y-6">
      <SectionCard
        eyebrow="Live Recommendation"
        title="Best time to run"
        description="Tap the big time to switch between clock time and remaining time."
      >
        <div className="space-y-5">
          <ControlBlock
            title="Consumer duration"
            description="How long the appliance needs to run once it starts."
          >
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-center">
              <div className="mb-4 text-2xl font-semibold text-yellow-300">
                {consumerDuration} hours
              </div>
              <Slider
                id="consumer-duration-slider"
                min={1}
                max={5}
                defaultValue={[3]}
                onValueChange={(value) => setConsumerDuration(value[0])}
              />
              <div className="mt-3 flex justify-between text-xs text-gray-300">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>
          </ControlBlock>

          <ErrorBoundary
            fallback={
              <StatusPanel
                title="Failed to load data"
                body="The solar or market request failed. Try again in a moment or clear the cache in settings."
                accent="red"
              />
            }
            onError={handleError}
          >
            <Suspense
              fallback={
                <StatusPanel
                  title={locationError ? "Location required" : "Loading data"}
                  body={
                    locationError
                      ? "Location permission is required to calculate solar production for your roof."
                      : "Fetching solar forecast and market prices."
                  }
                  accent="gray"
                />
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

            <div className="space-y-4">
              {!position && !locationError && (
                <StatusPanel
                  title="Requesting location"
                  body="Wattlyzer needs your current position to estimate local solar production."
                  accent="gray"
                />
              )}

              {!position && locationError && (
                <StatusPanel
                  title="Location access required"
                  body="Enable location services in your browser so the scheduler can load solar estimates for your area."
                  accent="red"
                />
              )}

              {position && searchTimespanHours < consumerDuration && (
                <StatusPanel
                  title="Invalid configuration"
                  body={`Search window (${searchTimespanHours}h) must be longer than consumer duration (${consumerDuration}h).`}
                  accent="orange"
                />
              )}

              {showMarketDataWarning && marketDataSufficiency && (
                <StatusPanel
                  title="Limited market data"
                  body={`Only ${marketDataSufficiency.hoursAvailable} hours of market data are available, but the selected search window is ${marketDataSufficiency.searchTimespanHours} hours.`}
                  accent="orange"
                />
              )}

              {position &&
              searchTimespanHours >= consumerDuration &&
              schedulingResult ? (
                <div className="rounded-2xl border border-white/8 bg-black/20 p-5 text-center">
                  <div
                    className="cursor-pointer text-6xl font-bold tracking-tight text-yellow-300 transition-colors hover:text-yellow-200 md:text-8xl"
                    onClick={() => setShowRemainingTime((prev) => !prev)}
                    title={
                      showRemainingTime
                        ? "Show absolute time"
                        : "Show remaining time"
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
                  <div className="mt-3 text-lg text-gray-300">
                    {schedulingResult.bestTime.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>

                  <div className="mt-5 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white">
                    {schedulingResult.reason === "solar"
                      ? "Solar optimized"
                      : settings.ignoreSolarForBestSlot
                      ? "Price only mode"
                      : "Price optimized"}
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-yellow-200/70">
                        Average Solar
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-white">
                        {(schedulingResult.avgSolarProduction || 0).toFixed(0)} Wh
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-yellow-200/70">
                        Average Price
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-white">
                        {((schedulingResult.avgPrice || 0) / 1000).toFixed(3)} €/kWh
                      </div>
                    </div>
                  </div>

                  {schedulingResult.reason === "solar" && (
                    <div className="mt-4 text-sm font-medium text-yellow-200">
                      Meets {(settings.minKwh / 1000).toFixed(1)} kWh solar minimum
                    </div>
                  )}
                </div>
              ) : null}

              {apiError && (
                <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  API Error: {apiError}
                </div>
              )}
            </div>
          </ErrorBoundary>
          <div
            ref={advancedOptionsRef}
            className="rounded-2xl border border-white/8 bg-white/[0.04] p-4"
          >
            <button
              onClick={() => setShowAdvancedOptions((prev) => !prev)}
              className="flex w-full items-center justify-between gap-4 text-left text-white"
              aria-expanded={showAdvancedOptions}
              aria-controls="advanced-options"
            >
              <div>
                <div className="text-lg font-semibold">Advanced options</div>
                <div className="mt-2 text-sm leading-6 text-gray-400">
                  Search horizon, solar threshold, and price-only mode.
                </div>
              </div>
              <span
                className={`text-lg transition-transform ${
                  showAdvancedOptions ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            <div
              id="advanced-options"
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showAdvancedOptions
                  ? "mt-5 max-h-[760px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="space-y-4">
                <ControlBlock
                  title="Search window"
                  description="How far ahead Wattlyzer should scan for a better slot."
                >
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <Select
                      value={searchTimespan}
                      onValueChange={setSearchTimespan}
                    >
                      <SelectTrigger
                        id="search-timespan-select"
                        className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors"
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
                </ControlBlock>

                <ControlBlock
                  title="Minimum solar requirement"
                  description="Average solar output needed before the scheduler prefers solar over cheap pricing."
                >
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-center">
                    <div className="mb-4 text-2xl font-semibold text-yellow-300">
                      {(settings.minKwh / 1000).toFixed(1)} kWh
                    </div>
                    <Slider
                      id="min-kwh-slider"
                      min={500}
                      max={3000}
                      step={100}
                      value={[settings.minKwh]}
                      onValueChange={(value) =>
                        updateSettings({ minKwh: value[0] })
                      }
                    />
                    <div className="mt-3 flex justify-between text-xs text-gray-300">
                      <span>0.5</span>
                      <span>1.0</span>
                      <span>1.5</span>
                      <span>2.0</span>
                      <span>2.5</span>
                      <span>3.0</span>
                    </div>
                  </div>
                </ControlBlock>

                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-white">
                        Price only mode
                      </div>
                      <div className="mt-2 text-sm leading-6 text-gray-400">
                        Ignore solar production and optimize only for the
                        lowest electricity price.
                      </div>
                    </div>
                    <Switch
                      id="ignore-solar-switch"
                      checked={settings.ignoreSolarForBestSlot}
                      onCheckedChange={(checked) =>
                        updateSettings({ ignoreSolarForBestSlot: checked })
                      }
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      <FooterLinks showDebugLink={showDebugLink} />
    </div>
  );
}

export default function Home() {
  const showDebugLink = useSyncExternalStore(
    subscribeToDebugMode,
    getDebugModeSnapshot,
    getDebugModeServerSnapshot
  );

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.18),transparent_28%),linear-gradient(135deg,#050505_0%,#151515_42%,#3b2b0f_100%)] px-4 py-8 md:px-6 md:py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-16 top-24 h-48 w-48 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute bottom-12 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-amber-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <header className="rounded-[32px] border border-white/12 bg-black/30 p-6 shadow-[0_28px_100px_-56px_rgba(251,191,36,0.6)] backdrop-blur-md md:p-8">
          <div className="flex flex-col items-center text-center">
            <div>
              <h1 className="text-4xl font-bold text-white md:text-6xl">
                <span className="sr-only">
                  wattlyzer - smart appliance scheduling
                </span>
                <TypewriterTitle />
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-300 md:text-base">
                Balance solar production and electricity prices to find the
                smartest run window for today.
              </p>
            </div>
          </div>
        </header>

        <SchedulingPanel showDebugLink={showDebugLink} />
      </div>
    </div>
  );
}
