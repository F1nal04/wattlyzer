import type { ReactNode } from "react";
import {
  FONT_DISPLAY,
  FONT_MONO,
  skyTheme,
  type SkyTheme,
} from "@wattlyzer/theme";
import { InstGlyph, type InstGlyphKind } from "@/components/sky/icons";
import { Hills, SkyScreen } from "@/components/sky/primitives";
import { useSkyHour } from "@/lib/use-sky-hour";

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
  italic,
  lede,
}: {
  t: SkyTheme;
  eyebrow: string;
  title: string;
  italic: string;
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
        {title} <span style={{ fontStyle: "italic", fontWeight: 300 }}>{italic}</span>.
      </div>
      <div style={{ marginTop: 8, fontSize: 14, color: t.fgDim, lineHeight: 1.5 }}>
        {lede}
      </div>
    </div>
  );
}

type InstStep = {
  glyph: InstGlyphKind;
  title: ReactNode;
  body: string;
};

function InstPage({
  eyebrow,
  title,
  italic,
  lede,
  steps,
}: {
  eyebrow: string;
  title: string;
  italic: string;
  lede: string;
  steps: InstStep[];
}) {
  const themeHour = useSkyHour(INST_HOUR);
  const t = skyTheme(themeHour);
  return (
    <SkyScreen
      background={`linear-gradient(180deg, ${t.sky[0]} 0%, ${t.sky[1]} 55%, ${t.sky[2]} 100%)`}
      color={t.fg}
    >
      <Hills t={t} height="26%" opacity={0.55} />
      <InstHead t={t} eyebrow={eyebrow} title={title} italic={italic} lede={lede} />
      <div
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top, 0px) + 246px)",
          left: 24,
          right: 24,
          background: t.glassBg,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderRadius: 18,
          border: `1px solid ${t.glassBd}`,
          padding: "6px 16px",
        }}
      >
        {steps.map((s, i) => (
          <InstRow key={i} n={i + 1} glyph={s.glyph} title={s.title} body={s.body} t={t} />
        ))}
      </div>
    </SkyScreen>
  );
}

export function InstallIOS() {
  return (
    <InstPage
      eyebrow="iOS · Safari"
      title="Add to your"
      italic="home screen"
      lede="Three taps and Wattlyzer lives next to your other apps."
      steps={[
        {
          glyph: "share",
          title: (
            <>
              Tap the <b>Share</b> button
            </>
          ),
          body: "At the bottom of Safari — the square with the up-arrow.",
        },
        {
          glyph: "plus-square",
          title: <b>Add to Home Screen</b>,
          body: "Scroll the share sheet if you don't see it right away.",
        },
        {
          glyph: "check",
          title: (
            <>
              Tap <b>Add</b>
            </>
          ),
          body: "Wattlyzer lands with your other apps. Open it from there for the fullscreen experience.",
        },
      ]}
    />
  );
}

export function InstallAndroid() {
  return (
    <InstPage
      eyebrow="Android · Chrome"
      title="Send it to your"
      italic="launcher"
      lede="Three taps and Wattlyzer sits in your app drawer."
      steps={[
        {
          glyph: "dots-vert",
          title: (
            <>
              Tap the <b>menu</b>
            </>
          ),
          body: "Three dots in the top-right corner of the address bar.",
        },
        {
          glyph: "plus-square",
          title: (
            <>
              Pick <b>Install app</b>
            </>
          ),
          body: "Sometimes labelled “Add to Home screen” depending on the version.",
        },
        {
          glyph: "home",
          title: (
            <>
              Confirm <b>Install</b>
            </>
          ),
          body: "Wattlyzer lands in your app drawer and on the home screen.",
        },
      ]}
    />
  );
}
