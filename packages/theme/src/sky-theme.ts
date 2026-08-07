// Sky theme — ported from the Claude Design "A · Sky" prototype.
// Returns sky gradient + readable foreground colors for a given local hour.

export const FONT_SANS = '"DM Sans", system-ui, sans-serif';
export const FONT_DISPLAY = '"Fraunces", Georgia, serif';
export const FONT_MONO = '"JetBrains Mono", ui-monospace, monospace';

export type SkyTheme = {
  name: "night" | "dawn" | "midday" | "sunset" | "dusk";
  sky: [string, string, string];
  /** "light" = dark text on light sky, "dark" = light text on dark sky */
  mode: "light" | "dark";
  fg: string;
  fgDim: string;
  fgMute: string;
  accent: string;
  saves: string;
  glassBg: string;
  glassBd: string;
  rule: string;
  sunCore: string;
  sunMid: string;
  sunOuter: string;
  chipBg: string;
  chipBd: string;
  pageBg: [string, string];
};

export function skyTheme(h: number): SkyTheme {
  if (h < 5)
    return {
      name: "night",
      sky: ["#0f1430", "#1d2148", "#3a2c52"],
      mode: "dark",
      fg: "#fff7e0",
      fgDim: "rgba(255,247,224,0.72)",
      fgMute: "rgba(255,247,224,0.5)",
      accent: "#ffd86b",
      saves: "#7ee5a4",
      glassBg: "rgba(255,255,255,0.10)",
      glassBd: "rgba(255,255,255,0.18)",
      rule: "rgba(255,247,224,0.16)",
      sunCore: "#fff7d6",
      sunMid: "#ffd86b",
      sunOuter: "#ff9a3c",
      chipBg: "rgba(255,255,255,0.14)",
      chipBd: "rgba(255,255,255,0.22)",
      pageBg: ["#0f1430", "#1d2148"],
    };
  if (h < 8)
    return {
      name: "dawn",
      sky: ["#fcd9a7", "#f8b88a", "#e88c80"],
      mode: "light",
      fg: "#2a1410",
      fgDim: "rgba(42,20,16,0.7)",
      fgMute: "rgba(42,20,16,0.5)",
      accent: "#c2410c",
      saves: "#0f7a3a",
      glassBg: "rgba(255,255,255,0.55)",
      glassBd: "rgba(255,255,255,0.72)",
      rule: "rgba(42,20,16,0.12)",
      sunCore: "#fff7d6",
      sunMid: "#ffd86b",
      sunOuter: "#ff9a3c",
      chipBg: "rgba(255,255,255,0.55)",
      chipBd: "rgba(255,255,255,0.72)",
      pageBg: ["#fcd9a7", "#fff5e0"],
    };
  if (h < 16)
    return {
      name: "midday",
      sky: ["#bde4ff", "#fef0c7", "#fcd28a"],
      mode: "light",
      fg: "#1a1410",
      fgDim: "rgba(26,20,16,0.7)",
      fgMute: "rgba(26,20,16,0.5)",
      accent: "#c2410c",
      saves: "#0f7a3a",
      glassBg: "rgba(255,255,255,0.55)",
      glassBd: "rgba(255,255,255,0.72)",
      rule: "rgba(26,20,16,0.1)",
      sunCore: "#fff7d6",
      sunMid: "#ffd86b",
      sunOuter: "#ff9a3c",
      chipBg: "rgba(255,255,255,0.55)",
      chipBd: "rgba(255,255,255,0.72)",
      pageBg: ["#e8f3ff", "#fff5e0"],
    };
  if (h < 19)
    return {
      name: "sunset",
      sky: ["#f9c180", "#e87a5e", "#7a3e6a"],
      mode: "dark",
      fg: "#fff5e6",
      fgDim: "rgba(255,245,230,0.78)",
      fgMute: "rgba(255,245,230,0.55)",
      accent: "#fed9a8",
      saves: "#7ee5a4",
      glassBg: "rgba(255,255,255,0.18)",
      glassBd: "rgba(255,255,255,0.32)",
      rule: "rgba(255,245,230,0.18)",
      sunCore: "#fff7d6",
      sunMid: "#ffd86b",
      sunOuter: "#ff9a3c",
      chipBg: "rgba(255,255,255,0.20)",
      chipBd: "rgba(255,255,255,0.32)",
      pageBg: ["#7a3e6a", "#3a2148"],
    };
  return {
    name: "dusk",
    sky: ["#2b2649", "#5b3a6a", "#8d4a6e"],
    mode: "dark",
    fg: "#fff5e6",
    fgDim: "rgba(255,245,230,0.74)",
    fgMute: "rgba(255,245,230,0.5)",
    accent: "#ffd86b",
    saves: "#7ee5a4",
    glassBg: "rgba(255,255,255,0.12)",
    glassBd: "rgba(255,255,255,0.22)",
    rule: "rgba(255,245,230,0.16)",
    sunCore: "#fff7d6",
    sunMid: "#ffd86b",
    sunOuter: "#ff9a3c",
    chipBg: "rgba(255,255,255,0.14)",
    chipBd: "rgba(255,255,255,0.24)",
    pageBg: ["#2b2649", "#1a1330"],
  };
}
