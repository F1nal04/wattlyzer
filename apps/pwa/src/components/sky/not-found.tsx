import { Link } from "@tanstack/react-router";
import { FONT_SANS, skyTheme } from "@wattlyzer/theme";
import { Hills, SkyPageHead, SkyScreen } from "@/components/sky/primitives";
import { useSkyHour } from "@/lib/use-sky-hour";
import { useI18n } from "@/lib/i18n";
import { Em, richParts } from "@/lib/i18n/rich";

// Default to a fixed midday hour; useSkyHour keeps SSR/first-render hydration
// safe and follows the current time when "Dark mode" is on.
const PAGE_HOUR = 11;

export function NotFound() {
  const themeHour = useSkyHour(PAGE_HOUR);
  const t = skyTheme(themeHour);
  const { t: translate } = useI18n();
  return (
    <SkyScreen t={t}>
      <Hills t={t} height="26%" opacity={0.55} />
      <div
        style={{
          position: "absolute",
          left: 28,
          right: 28,
          top: "50%",
          transform: "translateY(-50%)",
          textAlign: "center",
        }}
      >
        <SkyPageHead
          t={t}
          eyebrow={translate("notFound.eyebrow")}
          title={richParts(translate("notFound.title"), {
            thisSky: <Em>{translate("notFound.titleEm")}</Em>,
          })}
          lede={translate("notFound.body")}
        />
        <div style={{ marginTop: 26 }}>
          <Link
            to="/"
            style={{
              display: "inline-block",
              padding: "14px 26px",
              background: t.mode === "dark" ? "#fff" : "#1a1410",
              color: t.mode === "dark" ? "#1a1410" : "#fff8e7",
              border: t.mode === "dark" ? "none" : "1.5px solid #1a1410",
              borderRadius: 16,
              fontFamily: FONT_SANS,
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {translate("notFound.cta")}
          </Link>
        </div>
      </div>
    </SkyScreen>
  );
}
