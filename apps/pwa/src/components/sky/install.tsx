import type { ReactNode } from "react";
import {
  FONT_DISPLAY,
  FONT_MONO,
  skyTheme,
  type SkyTheme,
} from "@wattlyzer/theme";
import { frostedGlass } from "@/components/sky/glass";
import { InstGlyph, type InstGlyphKind } from "@/components/sky/icons";
import { Hills, SkyScreen } from "@/components/sky/primitives";
import { useSkyHour } from "@/lib/use-sky-hour";
import { useI18n, type MessageKey } from "@/lib/i18n";
import { richParts } from "@/lib/i18n/rich";

const INST_HOUR = 11;

function InstNum({ n, t }: { n: number; t: SkyTheme }) {
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

function InstChip({ glyph, t }: { glyph: InstGlyphKind; t: SkyTheme }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 24,
        height: 24,
        borderRadius: 6,
        background:
          t.mode === "dark" ? "rgba(255,255,255,0.14)" : "rgba(26,20,16,0.06)",
        border: `1px solid ${t.glassBd}`,
        color: t.fg,
        marginLeft: 6,
        verticalAlign: "middle",
      }}
    >
      <InstGlyph kind={glyph} size={14} />
    </span>
  );
}

function InstRow({
  n,
  glyph,
  title,
  body,
  t,
}: {
  n: number;
  glyph: InstGlyphKind;
  title: ReactNode;
  body: string;
  t: SkyTheme;
}) {
  return (
    <div style={{ display: "flex", gap: 14, padding: "14px 0", alignItems: "flex-start" }}>
      <InstNum n={n} t={t} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: t.fg,
            marginBottom: 3,
            lineHeight: 1.6,
          }}
        >
          {title}
          <InstChip glyph={glyph} t={t} />
        </div>
        <div style={{ fontSize: 13, color: t.fgDim, lineHeight: 1.45 }}>{body}</div>
      </div>
    </div>
  );
}

function InstHead({
  t,
  eyebrow,
  title,
  lede,
}: {
  t: SkyTheme;
  eyebrow: string;
  title: ReactNode;
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
          fontFamily: FONT_MONO,
          fontSize: 11,
          letterSpacing: "0.22em",
          color: t.fgMute,
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 32,
          lineHeight: 1.05,
          letterSpacing: "-0.015em",
          color: t.fg,
        }}
      >
        {title}
      </div>
      <div style={{ marginTop: 8, fontSize: 14, color: t.fgDim, lineHeight: 1.5 }}>
        {lede}
      </div>
    </div>
  );
}

type InstStep = {
  glyph: InstGlyphKind;
  // Base key of a step: `<base>.title` is the template, `<base>.em` the bold
  // fragment it substitutes, `<base>.body` the supporting line.
  key: string;
};

function InstPage({
  platform,
  steps,
}: {
  platform: "ios" | "android";
  steps: InstStep[];
}) {
  const themeHour = useSkyHour(INST_HOUR);
  const t = skyTheme(themeHour);
  const { t: translate } = useI18n();
  const key = (suffix: string) => `install.${platform}.${suffix}` as MessageKey;
  return (
    <SkyScreen
      background={`linear-gradient(180deg, ${t.sky[0]} 0%, ${t.sky[1]} 55%, ${t.sky[2]} 100%)`}
      color={t.fg}
    >
      <Hills t={t} height="26%" opacity={0.55} />
      <InstHead
        t={t}
        eyebrow={translate(key("eyebrow"))}
        title={richParts(translate(key("title")), {
          em: (
            <span style={{ fontStyle: "italic", fontWeight: 300 }}>
              {translate(key("titleEm"))}
            </span>
          ),
        })}
        lede={translate(key("lede"))}
      />
      <div
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top, 0px) + 246px)",
          left: 24,
          right: 24,
          background: t.glassBg,
          ...frostedGlass(10),
          borderRadius: 18,
          border: `1px solid ${t.glassBd}`,
          padding: "6px 16px",
        }}
      >
        {steps.map((step, i) => (
          <InstRow
            key={i}
            n={i + 1}
            glyph={step.glyph}
            title={richParts(translate(`${step.key}.title` as MessageKey), {
              em: <b>{translate(`${step.key}.em` as MessageKey)}</b>,
            })}
            body={translate(`${step.key}.body` as MessageKey)}
            t={t}
          />
        ))}
      </div>
    </SkyScreen>
  );
}

export function InstallIOS() {
  return (
    <InstPage
      platform="ios"
      steps={[
        { glyph: "share", key: "install.ios.step1" },
        { glyph: "plus-square", key: "install.ios.step2" },
        { glyph: "check", key: "install.ios.step3" },
      ]}
    />
  );
}

export function InstallAndroid() {
  return (
    <InstPage
      platform="android"
      steps={[
        { glyph: "dots-vert", key: "install.android.step1" },
        { glyph: "plus-square", key: "install.android.step2" },
        { glyph: "home", key: "install.android.step3" },
      ]}
    />
  );
}
