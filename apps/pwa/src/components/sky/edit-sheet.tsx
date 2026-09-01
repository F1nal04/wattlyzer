import type { ReactNode } from "react";
import { FONT_DISPLAY, FONT_MONO, FONT_SANS, type SkyTheme } from "@wattlyzer/theme";
import { frostedGlass } from "@/components/sky/glass";
import { useEscapeKey } from "@/components/sky/primitives";

// Shared bottom sheet used by solar-panel and shading editors.
export function SkyEditSheet({
  t,
  ariaLabel,
  eyebrow,
  title,
  onClose,
  onSave,
  children,
}: {
  t: SkyTheme;
  ariaLabel: string;
  eyebrow?: string;
  title: ReactNode;
  onClose: () => void;
  onSave: () => void;
  children: ReactNode;
}) {
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
            aria-label="Close"
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
            padding: "18px 22px 8px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {children}
        </div>

        <div
          style={{
            padding: "14px 22px calc(env(safe-area-inset-bottom, 0px) + 22px)",
            flexShrink: 0,
            borderTop: `1px solid ${t.glassBd}`,
            background: t.mode === "dark" ? "#1a1410" : "#fff8e7",
            display: "flex",
            gap: 10,
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "15px 18px",
              background: "transparent",
              color: t.fg,
              border: `1px solid ${t.glassBd}`,
              borderRadius: 16,
              cursor: "pointer",
              fontFamily: FONT_SANS,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            style={{
              flex: 2,
              padding: "15px 18px",
              border: t.mode === "dark" ? "none" : "1.5px solid #1a1410",
              background: t.mode === "dark" ? "#fff" : "#1a1410",
              color: t.mode === "dark" ? "#1a1410" : "#fff8e7",
              borderRadius: 16,
              cursor: "pointer",
              fontFamily: FONT_SANS,
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "0.01em",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
