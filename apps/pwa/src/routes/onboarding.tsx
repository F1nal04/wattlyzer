import { useState, type ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  FONT_DISPLAY,
  FONT_MONO,
  FONT_SANS,
  skyTheme,
  type SkyTheme,
} from "@wattlyzer/theme";
import { updatePrefs, updateSettings, useSettings } from "@/lib/settings";
import {
  Hills,
  SkyIconBtn,
  SkyPrimaryButton,
  SkyScreen,
} from "@/components/sky/primitives";
import { WIcon } from "@/components/sky/icons";
import { ObCard, ObCheckRow, ObSwitchRow, azimuthKey } from "@/components/sky/rows";
import { LanguageSwitch } from "@/components/sky/language";
import { useI18n, type Translate } from "@/lib/i18n";
import { Em, richParts } from "@/lib/i18n/rich";
import { useSkyHour } from "@/lib/use-sky-hour";
import { ShadingModal } from "@/components/sky/shading-modal";
import {
  shadingSetupSummary,
  type ShadingSetup,
} from "@/components/sky/shading";
import {
  bestSlotModeFromSignals,
  NOTHING_TO_SCHEDULE,
  schedulingSignalsAvailable,
} from "@/components/sky/solar";
import { SolarPanelsModal, type SolarConfig } from "@/components/sky/solar-modal";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingScreen,
});

// Onboarding is themed for a friendly midday sky
const ONB_HOUR = 11;
const TOTAL_STEPS = 4;

function headline(t: Translate, key: Parameters<Translate>[0], slot: string, emKey: Parameters<Translate>[0]) {
  return richParts(t(key), { [slot]: <Em>{t(emKey)}</Em> });
}

function ObFrame({
  step,
  onBack,
  onSkip,
  children,
  t,
  hideTopChrome,
}: {
  step: number;
  onBack?: () => void;
  onSkip?: () => void;
  children: ReactNode;
  t: SkyTheme;
  hideTopChrome?: boolean;
}) {
  const { t: translate } = useI18n();
  return (
    <>
      <Hills t={t} height="26%" opacity={0.55} />

      {/* top chrome — back + progress dots + skip */}
      {!hideTopChrome && (
        <div
          style={{
            position: "absolute",
            top: "calc(env(safe-area-inset-top, 0px) + 16px)",
            left: 16,
            right: 16,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 5,
          }}
        >
          <div style={{ width: 44, height: 44, display: "flex", alignItems: "center" }}>
            {onBack && (
              <SkyIconBtn
                t={t}
                label={translate("common.back")}
                onClick={onBack}
                blurBackdrop={false}
              >
                <WIcon name="back" />
              </SkyIconBtn>
            )}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === step ? 18 : 6,
                  height: 6,
                  borderRadius: 999,
                  background:
                    i <= step
                      ? t.fg
                      : t.mode === "dark"
                        ? "rgba(255,255,255,0.28)"
                        : "rgba(26,20,16,0.22)",
                  transition: "width .18s ease",
                }}
              />
            ))}
          </div>
          <div
            style={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            {onSkip && (
              <button
                onClick={onSkip}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  color: t.fgDim,
                  fontWeight: 600,
                  padding: 4,
                  fontFamily: FONT_SANS,
                  letterSpacing: "0.02em",
                }}
              >
                {translate("common.skip")}
              </button>
            )}
          </div>
        </div>
      )}

      {children}
    </>
  );
}

function ObTitle({
  t,
  children,
  lede,
}: {
  t: SkyTheme;
  children: ReactNode;
  lede: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: "calc(env(safe-area-inset-top, 0px) + 96px)",
        left: 28,
        right: 28,
      }}
    >
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 32,
          lineHeight: 1.05,
          letterSpacing: "-0.015em",
          color: t.fg,
        }}
      >
        {children}
      </div>
      <div style={{ marginTop: 8, fontSize: 14, color: t.fgDim, lineHeight: 1.5 }}>
        {lede}
      </div>
    </div>
  );
}

function HeroSun({ t, size, top }: { t: SkyTheme; size: number; top: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top,
        transform: "translateX(-50%)",
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${t.sunCore} 0%, ${t.sunMid} 45%, ${t.sunOuter} 75%, rgba(255,154,60,0) 100%)`,
        boxShadow: `0 0 120px 30px ${t.sunMid}88`,
      }}
    />
  );
}

function CircleNum({ n, t }: { n: number; t: SkyTheme }) {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 999,
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: t.mode === "dark" ? "rgba(255,255,255,0.92)" : "#1a1410",
        color: t.mode === "dark" ? "#1a1410" : "#fff8e7",
        fontFamily: FONT_DISPLAY,
        fontSize: 20,
        fontWeight: 500,
        letterSpacing: "-0.02em",
      }}
    >
      {n}
    </div>
  );
}

function BottomCta({
  children,
  dimmed,
}: {
  children: ReactNode;
  dimmed?: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: 24,
        right: 24,
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 40px)",
        opacity: dimmed ? 0.45 : 1,
        pointerEvents: dimmed ? "none" : "auto",
        transition: "opacity 180ms ease",
      }}
    >
      {children}
    </div>
  );
}

function ObWelcome({ t, onNext }: { t: SkyTheme; onNext: () => void }) {
  const { t: translate } = useI18n();
  return (
    <ObFrame step={0} t={t} hideTopChrome>
      <HeroSun t={t} size={200} top={130} />

      {/* Language switch up front: detection can be wrong, and everything
          that follows is copy the user has to read. */}
      <div
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top, 0px) + 20px)",
          right: 20,
          zIndex: 5,
        }}
      >
        <LanguageSwitch t={t} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 32,
          right: 32,
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 184px)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 12,
            letterSpacing: "0.32em",
            color: t.fgMute,
            marginBottom: 14,
            textTransform: "uppercase",
          }}
        >
          {translate("onboarding.welcome.eyebrow")}
        </div>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 400,
            fontSize: 40,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: t.fg,
          }}
        >
          {richParts(translate("onboarding.welcome.title"), {
            clean: <Em>{translate("onboarding.welcome.clean")}</Em>,
            cheap: <Em>{translate("onboarding.welcome.cheap")}</Em>,
          })}
        </div>
        <div style={{ marginTop: 14, fontSize: 14.5, color: t.fgDim, lineHeight: 1.5 }}>
          {translate("onboarding.welcome.lede")}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 24,
          right: 24,
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 72px)",
        }}
      >
        <SkyPrimaryButton t={t} onClick={onNext}>
          {translate("onboarding.welcome.cta")}
        </SkyPrimaryButton>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 36px)",
          textAlign: "center",
          fontSize: 12,
          color: t.fgMute,
          fontFamily: FONT_MONO,
          letterSpacing: "0.1em",
        }}
      >
        {translate("onboarding.welcome.duration")}
      </div>
    </ObFrame>
  );
}

function ObHow({
  t,
  onNext,
  onBack,
  onSkip,
}: {
  t: SkyTheme;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const { t: translate } = useI18n();
  const steps = [
    {
      title: translate("onboarding.how.step1.title"),
      body: translate("onboarding.how.step1.body"),
    },
    {
      title: translate("onboarding.how.step2.title"),
      body: translate("onboarding.how.step2.body"),
    },
  ];
  return (
    <ObFrame step={1} t={t} onBack={onBack} onSkip={onSkip}>
      <ObTitle t={t} lede={translate("onboarding.how.lede")}>
        {headline(
          translate,
          "onboarding.how.title",
          "wattlyzer",
          "onboarding.how.titleEm",
        )}
      </ObTitle>

      <div
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top, 0px) + 216px)",
          left: 24,
          right: 24,
          // Keep onboarding glass filter-free: Safari can cache the previous
          // sky inside backdrop-filter when the palette changes live.
          background: t.glassBg,
          borderRadius: 18,
          border: `1px solid ${t.glassBd}`,
          padding: "6px 16px",
        }}
      >
        {steps.map((s, i) => (
          <div
            key={i}
            style={{ display: "flex", gap: 14, padding: "14px 0", alignItems: "flex-start" }}
          >
            <CircleNum n={i + 1} t={t} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: t.fg,
                  marginBottom: 3,
                  lineHeight: 1.3,
                }}
              >
                {s.title}
              </div>
              <div style={{ fontSize: 13, color: t.fgDim, lineHeight: 1.45 }}>{s.body}</div>
            </div>
          </div>
        ))}
      </div>

      <BottomCta>
        <SkyPrimaryButton t={t} onClick={onNext}>
          {translate("common.continue")}
        </SkyPrimaryButton>
      </BottomCta>
    </ObFrame>
  );
}

function ObSetup({
  t,
  solar,
  setSolar,
  shading,
  setShading,
  dynamicTariff,
  setDynamicTariff,
  onNext,
  onBack,
  onSkip,
}: {
  t: SkyTheme;
  solar: SolarConfig;
  setSolar: (next: SolarConfig) => void;
  shading: ShadingSetup;
  setShading: (next: ShadingSetup) => void;
  dynamicTariff: boolean;
  setDynamicTariff: (next: boolean) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const [consentShare, setConsentShare] = useState(false);
  const [solarOpen, setSolarOpen] = useState(false);
  const [shadingOpen, setShadingOpen] = useState(false);
  const { settings } = useSettings();
  const { t: translate, decimal, integer } = useI18n();
  const nothingToSchedule = !schedulingSignalsAvailable(
    solar.enabled,
    dynamicTariff,
  );
  const canContinue = consentShare && !nothingToSchedule;
  const solarStatus = solar.enabled
    ? translate("onboarding.setup.solarStatus", {
        size: decimal(solar.sizeKw),
        direction: translate(azimuthKey(solar.azimuth)),
        tilt: integer(solar.tilt),
      })
    : translate(
        dynamicTariff
          ? "onboarding.setup.noSolarPriceOnly"
          : "onboarding.setup.noSolar",
      );

  return (
    <ObFrame step={2} t={t} onBack={onBack} onSkip={onSkip}>
      <ObTitle t={t} lede={translate("onboarding.setup.lede")}>
        {headline(
          translate,
          "onboarding.setup.title",
          "setup",
          "onboarding.setup.titleEm",
        )}
      </ObTitle>

      <div
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top, 0px) + 214px)",
          left: 24,
          right: 24,
          bottom: nothingToSchedule
            ? "calc(env(safe-area-inset-bottom, 0px) + 196px)"
            : "calc(env(safe-area-inset-bottom, 0px) + 116px)",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <ObCard
          t={t}
          icon="sun"
          title={translate("solar.modal.aria")}
          status={solarStatus}
          action={translate(solar.enabled ? "common.edit" : "common.add")}
          onClick={() => setSolarOpen(true)}
        />
        {solar.enabled && (
          <ObCard
            t={t}
            icon="sunCloud"
            title={translate("onboarding.setup.roofShading")}
            status={shadingSetupSummary(shading, translate)}
            action={translate("common.edit")}
            onClick={() => setShadingOpen(true)}
          />
        )}
        <ObSwitchRow
          t={t}
          icon="euro"
          title={translate("settings.tariff.dynamic")}
          subtitle={translate("settings.tariff.detail")}
          checked={dynamicTariff}
          onChange={() => setDynamicTariff(!dynamicTariff)}
        />
        <ObSwitchRow
          t={t}
          icon="moon"
          title={translate("settings.appearance.darkMode")}
          subtitle={translate("onboarding.setup.darkModeDetail")}
          checked={settings.currentTimeSky}
          onChange={() =>
            updateSettings({ currentTimeSky: !settings.currentTimeSky })
          }
        />
        <ObCheckRow
          t={t}
          checked={consentShare}
          onChange={() => setConsentShare((v) => !v)}
          label={richParts(translate("onboarding.setup.consent"), {
            location: (
              <span style={{ color: t.fg, fontWeight: 600 }}>
                {translate("onboarding.setup.consentLocation")}
              </span>
            ),
            solarData: (
              <span style={{ color: t.fg, fontWeight: 600 }}>
                {translate("onboarding.setup.consentSolarData")}
              </span>
            ),
          })}
        />
      </div>

      {nothingToSchedule && (
        <div
          style={{
            position: "absolute",
            left: 28,
            right: 28,
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 108px)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 22,
              lineHeight: 1.15,
              letterSpacing: "-0.015em",
              color: t.fg,
            }}
          >
            {translate(NOTHING_TO_SCHEDULE.title)}
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              color: t.fgDim,
              lineHeight: 1.45,
            }}
          >
            {translate(NOTHING_TO_SCHEDULE.body)}
          </div>
        </div>
      )}

      <BottomCta dimmed={!canContinue}>
        <SkyPrimaryButton t={t} onClick={onNext} disabled={!canContinue}>
          {translate("common.continue")}
        </SkyPrimaryButton>
      </BottomCta>

      {solarOpen && (
        <SolarPanelsModal
          t={t}
          value={solar}
          eyebrow={translate("onboarding.eyebrow.solar")}
          onChange={setSolar}
          onClose={() => setSolarOpen(false)}
        />
      )}
      {shadingOpen && (
        <ShadingModal
          t={t}
          value={shading}
          eyebrow={translate("onboarding.eyebrow.shading")}
          onChange={setShading}
          onClose={() => setShadingOpen(false)}
        />
      )}
    </ObFrame>
  );
}

function ObDone({
  t,
  onNext,
  onBack,
}: {
  t: SkyTheme;
  onNext: () => void;
  onBack: () => void;
}) {
  const { t: translate } = useI18n();
  return (
    <ObFrame step={3} t={t} hideTopChrome>
      <HeroSun t={t} size={220} top={110} />

      <div
        style={{
          position: "absolute",
          left: 28,
          right: 28,
          top: "calc(env(safe-area-inset-top, 0px) + 348px)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 11.5,
            letterSpacing: "0.28em",
            color: t.fgMute,
            marginBottom: 10,
            textTransform: "uppercase",
          }}
        >
          {translate("onboarding.done.eyebrow")}
        </div>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 36,
            lineHeight: 1.05,
            letterSpacing: "-0.015em",
            color: t.fg,
          }}
        >
          {headline(
            translate,
            "onboarding.done.title",
            "oneTapAway",
            "onboarding.done.titleEm",
          )}
        </div>
        <div style={{ marginTop: 12, fontSize: 14.5, color: t.fgDim, lineHeight: 1.5 }}>
          {translate("onboarding.done.lede")}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 24,
          right: 24,
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 80px)",
        }}
      >
        <SkyPrimaryButton t={t} onClick={onNext}>
          {translate("onboarding.done.cta")}
        </SkyPrimaryButton>
      </div>
      <div
        style={{
          position: "absolute",
          left: 24,
          right: 24,
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 36px)",
        }}
      >
        <button
          onClick={onBack}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            color: t.fgDim,
            fontWeight: 500,
            padding: 6,
            fontFamily: FONT_SANS,
          }}
        >
          {translate("common.back")}
        </button>
      </div>
    </ObFrame>
  );
}

function OnboardingScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  // Steps 0 (Welcome) and 1 (How) preview the current-time sky regardless of
  // the stored setting; steps 2/3 follow the actual "Dark mode" toggle.
  const themeHour = useSkyHour(ONB_HOUR, step <= 1);
  const t = skyTheme(themeHour);
  const [dynamicTariff, setDynamicTariff] = useState(true);
  const [solar, setSolar] = useState<SolarConfig>({
    enabled: true,
    azimuth: 180,
    tilt: 45,
    sizeKw: 5,
  });
  const [shading, setShading] = useState<ShadingSetup>({
    morning: { enabled: false, hour: 10 },
    evening: { enabled: false, hour: 17 },
  });

  const finish = (save: boolean) => {
    if (save) {
      const bestSlotMode = bestSlotModeFromSignals(
        solar.enabled,
        dynamicTariff,
      );
      if (bestSlotMode) {
        updateSettings({
          azimut: solar.azimuth,
          angle: solar.tilt,
          kwh: solar.sizeKw,
          morningShading: shading.morning.enabled,
          shadingEndTime: shading.morning.hour,
          eveningShading: shading.evening.enabled,
          shadingStartTime: shading.evening.hour,
          bestSlotMode,
          dynamicTariff,
        });
      }
    }
    updatePrefs({ onboarded: true });
    navigate({ to: "/" });
  };

  const skip = () => finish(false);
  const back = () => setStep((s) => Math.max(0, s - 1));
  const next = () => setStep((s) => s + 1);

  return (
    <SkyScreen
      background={`linear-gradient(180deg, ${t.sky[0]} 0%, ${t.sky[1]} 55%, ${t.sky[2]} 100%)`}
      color={t.fg}
    >
      {step === 0 && <ObWelcome t={t} onNext={next} />}
      {step === 1 && <ObHow t={t} onNext={next} onBack={back} onSkip={skip} />}
      {step === 2 && (
        <ObSetup
          t={t}
          solar={solar}
          setSolar={setSolar}
          shading={shading}
          setShading={setShading}
          dynamicTariff={dynamicTariff}
          setDynamicTariff={setDynamicTariff}
          onNext={next}
          onBack={back}
          onSkip={skip}
        />
      )}
      {step === 3 && <ObDone t={t} onNext={() => finish(true)} onBack={back} />}
    </SkyScreen>
  );
}
