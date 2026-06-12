import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { weatherQueryOptions } from "@/lib/queries";
import { FONT_MONO, skyTheme } from "@/lib/sky-theme";
import { usePrefs, useSettings } from "@/lib/settings";
import { useGeolocation, useScheduling } from "@/lib/use-scheduling";
import { weatherAt } from "@/lib/weather";
import {
  ClockCluster,
  ClockStatus,
  DurationDock,
  SkyHero,
} from "@/components/sky/home";
import {
  Hills,
  SkyAppBar,
  SkyIconBtn,
  SkyScreen,
} from "@/components/sky/primitives";
import { WIcon } from "@/components/sky/icons";
import { QuickSheet } from "@/components/sky/quick-sheet";

export const Route = createFileRoute("/")({
  component: HomeScreen,
});

function useHoursTillEndOfDay() {
  const compute = () => {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    return Math.ceil((endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60));
  };
  const [hours, setHours] = useState(compute);

  useEffect(() => {
    const interval = setInterval(() => {
      setHours((prev) => {
        const next = compute();
        return prev !== next ? next : prev;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return hours;
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function HomeScreen() {
  const mounted = useMounted();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { prefs, updatePrefs } = usePrefs();
  const { position, locationError } = useGeolocation();
  const hoursTillEndOfDay = useHoursTillEndOfDay();
  const [quickOpen, setQuickOpen] = useState(false);

  const searchTimespanHours =
    prefs.searchWindow === "eod"
      ? hoursTillEndOfDay
      : parseInt(prefs.searchWindow, 10);

  const {
    solarData,
    schedulingResult,
    isLoading,
    apiError,
    marketDataSufficiency,
  } = useScheduling(position, prefs.duration, searchTimespanHours);

  useEffect(() => {
    if (mounted && !prefs.onboarded) {
      navigate({ to: "/onboarding" });
    }
  }, [mounted, prefs.onboarded, navigate]);

  // Theme follows the recommended hour; before a result exists, the current hour.
  const now = new Date();
  const themeHour = schedulingResult
    ? schedulingResult.bestTime.getHours()
    : now.getHours();
  const t = skyTheme(themeHour);
  const [c1, c2, c3] = t.sky;

  // Real DWD cloud cover for the hero. Purely cosmetic, so a failed request
  // never surfaces as an error — weatherAt falls back to the solar heuristic.
  const weatherQuery = useQuery({
    ...weatherQueryOptions(position ?? { latitude: 0, longitude: 0 }, now),
    enabled: position !== null,
  });
  // The hero depicts the recommended moment, so the clouds match it too
  const weather = weatherAt(
    weatherQuery.data ?? null,
    solarData,
    settings,
    schedulingResult?.bestTime ?? now,
  );

  const invalidConfig = searchTimespanHours < prefs.duration;
  const showMarketDataWarning =
    settings.bestSlotMode !== "solar-only" &&
    !!position &&
    !invalidConfig &&
    !isLoading &&
    !!schedulingResult &&
    !marketDataSufficiency.isSufficient;
  const noSuitableSolarSlot =
    settings.bestSlotMode === "solar-only" &&
    !!position &&
    !invalidConfig &&
    !!solarData &&
    !schedulingResult &&
    !apiError;

  return (
    <SkyScreen
      background={`linear-gradient(180deg, ${c1} 0%, ${c2} 55%, ${c3} 100%)`}
      color={t.fg}
    >
      {mounted && (
        <div style={{ animation: "sky-fade-in 320ms ease" }}>
          {schedulingResult && (
            <SkyHero
              t={t}
              hour={schedulingResult.bestTime.getHours()}
              weather={weather}
            />
          )}
          <Hills t={t} />

          <SkyAppBar
            t={t}
            left={
              <SkyIconBtn t={t} label="Quick controls" onClick={() => setQuickOpen(true)}>
                <WIcon name="sliders" />
              </SkyIconBtn>
            }
            right={
              <SkyIconBtn
                t={t}
                label="Settings"
                onClick={() => navigate({ to: "/settings" })}
              >
                <WIcon name="settings" />
              </SkyIconBtn>
            }
          />

          {!position && !locationError && (
            <ClockStatus
              t={t}
              title="Finding your sky…"
              body="Wattlyzer needs your current position to estimate local solar production."
            />
          )}
          {!position && locationError && (
            <ClockStatus
              t={t}
              title="Location needed."
              body="Enable location services in your browser so the forecast can match your roof."
            />
          )}
          {position && invalidConfig && (
            <ClockStatus
              t={t}
              title="Window too short."
              body={`The search window (${searchTimespanHours}h) must be at least as long as the run (${prefs.duration}h). Widen it in Quick controls.`}
            />
          )}
          {position && !invalidConfig && isLoading && (
            <ClockStatus
              t={t}
              title="Reading sun and prices…"
              body={
                settings.bestSlotMode === "solar-only"
                  ? "Fetching the solar forecast."
                  : "Fetching the solar forecast and market prices."
              }
            />
          )}
          {position && !invalidConfig && !isLoading && apiError && (
            <ClockStatus
              t={t}
              title="Forecast unavailable."
              body={`A data request failed (${apiError}). Try again in a moment.`}
            />
          )}
          {noSuitableSolarSlot && (
            <ClockStatus
              t={t}
              title="No sunny window."
              body={`No slot reaches the ${(settings.minKwh / 1000).toFixed(1)} kWh solar minimum. Lower it or widen the search window in Quick controls.`}
            />
          )}
          {position && !invalidConfig && schedulingResult && (
            <ClockCluster t={t} result={schedulingResult} duration={prefs.duration} />
          )}

          {showMarketDataWarning && (
            <div
              style={{
                position: "absolute",
                left: 24,
                right: 24,
                bottom: "calc(env(safe-area-inset-bottom, 0px) + 152px)",
                textAlign: "center",
                fontSize: 10.5,
                fontFamily: FONT_MONO,
                letterSpacing: "0.08em",
                color: t.fgMute,
                textTransform: "uppercase",
              }}
            >
              Prices cover {marketDataSufficiency.hoursAvailable}h of the{" "}
              {searchTimespanHours}h window
            </div>
          )}

          <DurationDock
            t={t}
            duration={prefs.duration}
            onChange={(v) => updatePrefs({ duration: v })}
          />

          {quickOpen && <QuickSheet t={t} onClose={() => setQuickOpen(false)} />}
        </div>
      )}
    </SkyScreen>
  );
}
