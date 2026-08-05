import { Link } from "@tanstack/react-router";
import { FONT_DISPLAY, FONT_MONO, FONT_SANS, skyTheme } from "@wattlyzer/theme";
import { Hills, SkyScreen } from "@/components/sky/primitives";
import { useSkyHour } from "@/lib/use-sky-hour";

// Default to a fixed midday hour; useSkyHour keeps SSR/first-render hydration
// safe and follows the current time when "Dark mode" is on.
const PAGE_HOUR = 11;

export function NotFound() {
  const themeHour = useSkyHour(PAGE_HOUR);
  const t = skyTheme(themeHour);
  return (
    <SkyScreen
      background={`linear-gradient(180deg, ${t.sky[0]} 0%, ${t.sky[1]} 55%, ${t.sky[2]} 100%)`}
      color={t.fg}
    >
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
          404
        </div>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 32,
            lineHeight: 1.1,
            letterSpacing: "-0.015em",
            color: t.fg,
          }}
        >
          Nothing under{" "}
          <span style={{ fontStyle: "italic", fontWeight: 300 }}>this sky</span>
          .
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 14,
            color: t.fgDim,
            lineHeight: 1.5,
          }}
        >
          The page you&apos;re looking for doesn&apos;t exist.
        </div>
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
            Back to the forecast
          </Link>
        </div>
      </div>
    </SkyScreen>
  );
}
