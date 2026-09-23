import { FONT_SANS, skyTheme } from "@wattlyzer/theme";
import { frostedGlass } from "@/components/sky/glass";
import { SkyPrimaryButton } from "@/components/sky/primitives";
import { useI18n } from "@/lib/i18n";
import { useDeployedUpdate } from "@/lib/update";
import { useMounted, useSkyHour } from "@/lib/use-sky-hour";

// Offers a reload when a newer build is deployed. Never reloads on its own:
// the user may be mid-edit, and a reload is theirs to choose.
export function UpdatePrompt() {
  const mounted = useMounted();
  const t = skyTheme(useSkyHour());
  const { t: translate } = useI18n();
  const { available, dismiss } = useDeployedUpdate();
  if (!mounted || !available) return null;

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: "calc(16px + env(safe-area-inset-bottom))",
        maxWidth: 430,
        margin: "0 auto",
        padding: "0 16px",
        boxSizing: "border-box",
        zIndex: 40,
      }}
    >
      <div
        style={{
          background: t.glassBg,
          ...frostedGlass(14),
          border: `1px solid ${t.glassBd}`,
          borderRadius: 20,
          padding: 16,
          fontFamily: FONT_SANS,
          color: t.fg,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>
          {translate("update.available")}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={dismiss}
            style={{
              flex: 1,
              padding: "16px 12px",
              border: "none",
              background: "none",
              color: t.fgDim,
              cursor: "pointer",
              fontFamily: FONT_SANS,
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            {translate("update.dismiss")}
          </button>
          <div style={{ flex: 2 }}>
            <SkyPrimaryButton t={t} onClick={() => window.location.reload()}>
              {translate("update.reload")}
            </SkyPrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
