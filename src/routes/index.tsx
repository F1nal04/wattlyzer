import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { weatherQueryOptions } from "@/lib/queries";
import { FONT_MONO, skyTheme } from "@/lib/sky-theme";
import { usePrefs, useSettings } from "@/lib/settings";
import { useGeolocation, useScheduling } from "@/lib/use-scheduling";
import { useNow } from "@/lib/use-now";
import { useMounted, useSkyHour } from "@/lib/use-sky-hour";
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

function HomeScreen() {
  // Gates the render tree + onboarding redirect below. `useSkyHour` keeps its
  // own internal mount guard for the palette; both flip in the same commit.
  const mounted = useMounted();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { prefs, updatePrefs } = usePrefs();
  const { position, locationError } = useGeolocation();
  const hoursTillEndOfDay = useHoursTillEndOfDay();
  const now = useNow();
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
  } = useScheduling(position, prefs.duration, searchTimespanHours, now);

  useEffect(() => {
    if (mounted && !prefs.onboarded) {
      navigate({ to: "/onboarding" });
    }
  }, [mounted, prefs.onboarded, navigate]);

  // Theme follows the recommended slot's hour, or — when "Dark mode" is on —
  // the current hour. useSkyHour also pins the palette to a fixed hour until
  // mounted so SSR and the first client render agree (hydration safety).
  const themeHour = useSkyHour(
    schedulingResult ? schedulingResult.bestTime.getHours() : now.getHours(),
  );
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

  // Mutually exclusive status messages, picked in precedence order. The
  // success case (ClockCluster) is rendered separately below and can coexist
  // with the loading message while a stale result is still on screen.
  function pickClockStatus(): { title: string; body: string } | null {
    if (!position) {
      return locationError
        ? {
            title: "Location needed.",
            body: "Enable location services in your browser so the forecast can match your roof.",
          }
        : {
            title: "Finding your sky…",
            body: "Wattlyzer needs your current position to estimate local solar production.",
          };
    }

    if (invalidConfig) {
      return {
        title: "Window too short.",
        body: `The search window (${searchTimespanHours}h) must be at least as long as the run (${prefs.duration}h). Widen it in Quick controls.`,
      };
    }

    if (isLoading) {
      return {
        title: "Reading sun and prices…",
        body:
          settings.bestSlotMode === "solar-only"
            ? "Fetching the solar forecast."
            : "Fetching the solar forecast and market prices.",
      };
    }

    if (schedulingResult) {
      return null;
    }

    if (apiError) {
      return {
        title: "Forecast unavailable.",
        body: `A data request failed (${apiError}). Try again in a moment.`,
      };
    }

    if (settings.bestSlotMode !== "solar-only") {
      return {
        title: "No window found.",
        body: "Market prices don't cover the search window yet. Widen it in Quick controls or check back later.",
      };
    }

    if (solarData) {
      return {
        title: "No sunny window.",
        body: `No slot reaches the ${(settings.minKwh / 1000).toFixed(1)} kWh solar minimum. Lower it or widen the search window in Quick controls.`,
      };
    }

    return null;
  }

  const clockStatus = pickClockStatus();

  // Hoisted so the compiler memoizes each element on its own narrow deps
  // (hour/weather primitives, theme) instead of recreating them — and thus
  // re-rendering the whole subtree — whenever the schedule object changes.
  const heroHour = schedulingResult?.bestTime.getHours();
  const hero =
    heroHour === undefined ? null : (
      <SkyHero t={t} hour={heroHour} weather={weather} />
    );
  const hills = <Hills t={t} />;
  const cluster =
    position && !invalidConfig && schedulingResult ? (
      <ClockCluster t={t} result={schedulingResult} duration={prefs.duration} />
    ) : null;
  const dock = (
    <DurationDock
      t={t}
      duration={prefs.duration}
      onChange={(v) => updatePrefs({ duration: v })}
    />
  );
  const appBar = (
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
  );

  return (
    <SkyScreen
      background={`linear-gradient(180deg, ${c1} 0%, ${c2} 55%, ${c3} 100%)`}
      color={t.fg}
    >
      {mounted && (
        <div style={{ animation: "sky-fade-in 320ms ease" }}>
          {hero}
          {hills}
          {appBar}

          {clockStatus && (
            <ClockStatus t={t} title={clockStatus.title} body={clockStatus.body} />
          )}
          {cluster}

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

          {dock}

          {quickOpen && <QuickSheet t={t} onClose={() => setQuickOpen(false)} />}
        </div>
      )}
    </SkyScreen>
  );
}
