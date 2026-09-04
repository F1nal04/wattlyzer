import type { ReactNode } from "react";
import { FONT_DISPLAY, FONT_MONO, FONT_SANS, type SkyTheme } from "@wattlyzer/theme";
import { frostedGlass } from "@/components/sky/glass";
import { useEscapeKey } from "@/components/sky/primitives";
import { useI18n } from "@/lib/i18n";

export function ModalField({
  t,
  label,
  right,
  children,
}: {
  t: SkyTheme;
  label: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 11.5,
            letterSpacing: "0.16em",
            color: t.fgMute,
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

export function ModalDisplay({ t, children }: { t: SkyTheme; children: ReactNode }) {
  return (
    <div
      style={{
        fontFamily: FONT_SANS,
        fontSize: 16,
        fontWeight: 600,
        color: t.fg,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {children}
    </div>
  );
}

// Shared bottom sheet used by solar-panel and shading editors.
// Close (X, scrim, Escape) dismisses. Solar commits through onChange as
// edits happen; shading still drafts locally and commits on close.
export function SkyEditSheet({
  t,
  ariaLabel,
  eyebrow,
  title,
  onClose,
  children,
}: {
  t: SkyTheme;
  ariaLabel: string;
  eyebrow?: string;
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
}) {
  const { t: translate } = useI18n();
  useEscapeKey(onClose);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      style={{ position: "absolute", inset: 0, zIndex: 30, fontFamily: FONT_SANS }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background:
            t.mode === "dark" ? "rgba(8,6,4,0.62)" : "rgba(26,20,16,0.42)",
          ...frostedGlass(2),
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          top: "calc(env(safe-area-inset-top, 0px) + 40px)",
          background: t.mode === "dark" ? "#1a1410" : "#fff8e7",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          boxShadow: "0 -20px 60px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "sky-sheet-up 260ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 999,
            margin: "10px auto 14px",
            flexShrink: 0,
            background:
              t.mode === "dark" ? "rgba(255,255,255,0.18)" : "rgba(26,20,16,0.18)",
          }}
        />

        <div
          style={{
            padding: "0 22px",
            flexShrink: 0,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            {eyebrow && (
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  color: t.fgMute,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                {eyebrow}
              </div>
            )}
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 26,
                lineHeight: 1.05,
                letterSpacing: "-0.015em",
                color: t.fg,
              }}
            >
              {title}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={translate("common.close")}
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              flexShrink: 0,
              background: "transparent",
              border: `1px solid ${t.glassBd}`,
              color: t.fg,
              cursor: "pointer",
              fontSize: 16,
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_SANS,
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "18px 22px calc(env(safe-area-inset-bottom, 0px) + 28px)",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
