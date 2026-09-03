import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  FONT_DISPLAY,
  FONT_MONO,
  skyTheme,
  type SkyTheme,
} from "@wattlyzer/theme";
import { frostedGlass } from "@/components/sky/glass";
import { WIcon } from "@/components/sky/icons";
import {
  Hills,
  SkyIconBtn,
  SkyScreen,
} from "@/components/sky/primitives";
import { useSkyHour } from "@/lib/use-sky-hour";
import { useI18n } from "@/lib/i18n";

const PAGE_HOUR = 11;

export function TextCard({
  t,
  title,
  children,
}: {
  t: SkyTheme;
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        background: t.glassBg,
        ...frostedGlass(10),
        borderRadius: 18,
        border: `1px solid ${t.glassBd}`,
        padding: "16px 18px",
        marginBottom: 14,
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 600, color: t.fg, marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ fontSize: 13, color: t.fgDim, lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

export function TextPage({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  // A node, not a string + italic pair: the emphasised fragment sits
  // wherever the translation puts it.
  title: ReactNode;
  lede: string;
  children: (t: SkyTheme) => ReactNode;
}) {
  const navigate = useNavigate();
  const themeHour = useSkyHour(PAGE_HOUR);
  const t = skyTheme(themeHour);
  const { t: translate } = useI18n();
  return (
    <SkyScreen
      background={`linear-gradient(180deg, ${t.sky[0]} 0%, ${t.sky[1]} 55%, ${t.sky[2]} 100%)`}
      color={t.fg}
    >
      <Hills t={t} height="26%" opacity={0.55} />
      <div
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top, 0px) + 16px)",
          left: 16,
          zIndex: 5,
        }}
      >
        <SkyIconBtn
          t={t}
          label={translate("common.back")}
          onClick={() => navigate({ to: "/settings" })}
        >
          <WIcon name="back" />
        </SkyIconBtn>
      </div>

      <div
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top, 0px) + 76px)",
          left: 0,
          right: 0,
          bottom: 0,
          overflowY: "auto",
          padding: "20px 28px calc(env(safe-area-inset-bottom, 0px) + 40px)",
          WebkitOverflowScrolling: "touch",
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
        <div
          style={{
            marginTop: 8,
            marginBottom: 22,
            fontSize: 14,
            color: t.fgDim,
            lineHeight: 1.5,
          }}
        >
          {lede}
        </div>
        {children(t)}
      </div>
    </SkyScreen>
  );
}
