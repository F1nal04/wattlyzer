import { useRef } from "react";
import { FONT_SANS, type SkyTheme } from "@wattlyzer/theme";
import { LOCALES, localeOptions, type Locale } from "@wattlyzer/i18n";
import { setLocale, useLocale } from "@/lib/locale";
import { useI18n } from "@/lib/i18n";

// EN · DE switch, mirroring the marketing site's nav toggle.
// A radiogroup with roving tabindex: one tab stop, arrows move between
// languages, and each option announces its own selected state.
export function LanguageSwitch({ t }: { t: SkyTheme }) {
  const { t: translate } = useI18n();
  const active = useLocale();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const move = (from: Locale, delta: number) => {
    const index = LOCALES.indexOf(from);
    const next = LOCALES[(index + delta + LOCALES.length) % LOCALES.length];
    setLocale(next);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={translate("language.label")}
      style={{
        display: "flex",
        gap: 6,
        padding: 4,
        background:
          t.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(26,20,16,0.05)",
        borderRadius: 12,
        border: `1px solid ${t.glassBd}`,
      }}
    >
      {localeOptions(active).map(({ locale, name, short, active: selected }) => {
        return (
          <button
            key={locale}
            ref={(node) => {
              refs.current[locale] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            // Roving tabindex: only the selected option is in the tab order.
            tabIndex={selected ? 0 : -1}
            aria-label={translate("language.select", { language: name })}
            onClick={() => setLocale(locale)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault();
                move(locale, 1);
              } else if (
                event.key === "ArrowLeft" ||
                event.key === "ArrowUp"
              ) {
                event.preventDefault();
                move(locale, -1);
              }
            }}
            style={{
              border: "none",
              cursor: "pointer",
              padding: "7px 14px",
              borderRadius: 9,
              fontFamily: FONT_SANS,
              fontSize: 12.5,
              fontWeight: 600,
              letterSpacing: "0.04em",
              background: selected
                ? t.mode === "dark"
                  ? "rgba(255,255,255,0.92)"
                  : "#fff"
                : "transparent",
              color: selected ? "#1a1410" : t.fgDim,
              boxShadow: selected ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
            }}
          >
            {short}
          </button>
        );
      })}
    </div>
  );
}
