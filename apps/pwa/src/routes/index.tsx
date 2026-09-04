import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { weatherQueryOptions } from "@/lib/queries";
import { FONT_MONO, skyTheme } from "@wattlyzer/theme";
import { usePrefs, useSettings } from "@/lib/settings";
import { useGeolocation, useScheduling } from "@/lib/use-scheduling";
import { useNow } from "@/lib/use-now";
import { useMounted, useSkyHour } from "@/lib/use-sky-hour";
import { hoursUntilEndOfLocalDay, weatherAt } from "@wattlyzer/core";
import {
  ClockCluster,
  ClockStatus,
  DurationDock,
  SkyHero,
} from "@/components/sky/home";
import {
  NOTHING_TO_SCHEDULE,
  schedulingSignalsAvailable,
  solarPanelsEnabled,
} from "@/components/sky/solar";
import { useI18n } from "@/lib/i18n";
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

function HomeScreen() {
  // Gates the render tree + onboarding redirect below. `useSkyHour` keeps its
  // own internal mount guard for the palette; both flip in the same commit.
  const mounted = useMounted();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { prefs, updatePrefs } = usePrefs();
  const { position, locationError } = useGeolocation();
  const now = useNow();
  const { t: translate, decimal } = useI18n();
  const [quickOpen, setQuickOpen] = useState(false);

  const searchTimespanHours =
    prefs.searchWindow === "eod"
      ? hoursUntilEndOfLocalDay(now)
      : parseInt(prefs.searchWindow, 10);

  const {
    solarData,
    schedulingResult,
    isLoading,
    apiError,
    marketDataSufficiency,
  } = useScheduling(
    position,
    prefs.duration,
    searchTimespanHours,
    now,
    settings,
  );

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
  const solarEnabled = solarPanelsEnabled(settings.bestSlotMode);
  const canSchedule = schedulingSignalsAvailable(
    solarEnabled,
    settings.dynamicTariff,
  );
  const showMarketDataWarning =
    canSchedule &&
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
    if (!canSchedule) {
      return {
        title: translate(NOTHING_TO_SCHEDULE.title),
        body: translate(NOTHING_TO_SCHEDULE.body),
      };
    }

    if (!position) {
      return locationError
        ? {
            title: translate("status.locationNeeded.title"),
            body: translate("status.locationNeeded.body"),
          }
        : {
            title: translate("status.findingSky.title"),
            body: translate("status.findingSky.body"),
          };
    }

    if (invalidConfig) {
      return {
        title: translate("status.windowTooShort.title"),
        body: translate("status.windowTooShort.body", {
          window: searchTimespanHours,
          duration: prefs.duration,
        }),
      };
    }

    if (isLoading) {
      return {
        title: translate("status.loading.title"),
        body: translate(
          settings.bestSlotMode === "solar-only"
            ? "status.loading.solarOnly"
            : "status.loading.solarAndPrices",
        ),
      };
    }

    if (schedulingResult) {
      return null;
    }

    if (apiError) {
      return {
        title: translate("status.forecastUnavailable.title"),
        body: translate("status.forecastUnavailable.body", {
          error: apiError,
        }),
      };
    }

    if (settings.bestSlotMode !== "solar-only") {
      return {
        title: translate("status.noWindow.title"),
        body: translate("status.noWindow.body"),
      };
    }

    if (solarData) {
      return {
        title: translate("status.noSunnyWindow.title"),
        body: translate("status.noSunnyWindow.body", {
          minimum: decimal(settings.minKwh / 1000),
        }),
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
    canSchedule && position && !invalidConfig && schedulingResult ? (
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
        <SkyIconBtn
          t={t}
          label={translate("quick.title")}
          onClick={() => setQuickOpen(true)}
        >
          <WIcon name="sliders" />
        </SkyIconBtn>
      }
      right={
        <SkyIconBtn
          t={t}
          label={translate("settings.title")}
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
        <>
          <div style={{ animation: "sky-fade-in 320ms ease" }}>
            {hero}
            {hills}

            {clockStatus && (
              <ClockStatus t={t} title={clockStatus.title} body={clockStatus.body} />
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
                {translate("home.marketCoverage", {
                  covered: marketDataSufficiency.hoursAvailable,
                  window: searchTimespanHours,
                })}
              </div>
            )}
          </div>

          {appBar}
          {cluster}
          {dock}
          {quickOpen && <QuickSheet t={t} onClose={() => setQuickOpen(false)} />}
        </>
      )}
    </SkyScreen>
  );
}
