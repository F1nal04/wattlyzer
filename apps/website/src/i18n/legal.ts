import { createTranslator } from "@wattlyzer/i18n";

// Page chrome only. The impressum itself lives in `@wattlyzer/legal` so the
// PWA renders the exact same operator, contact and disclaimer text.
//
// English is the source of truth for the key union, so a missing German
// string fails `astro check` rather than silently rendering English — which
// is how this page ended up with an English "Legal notice." headline.
export const en = {
  "meta.title": "Wattlyzer · Legal notice",
  "meta.description": "Legal notice for Wattlyzer — information according to § 5 TMG.",
  "back": "← wattlyzer.de",
  "eyebrow": "§ 5 TMG",
  // The headline renders as `title` followed by an emphasised `titleEm`.
  "title": "Legal",
  "titleEm": "notice.",
  "subtitle": "Information according to § 5 TMG",
  "foot": "© 2026 Wattlyzer · Legal notice",
} as const;

export type LegalKey = keyof typeof en;

export const de: Record<LegalKey, string> = {
  "meta.title": "Wattlyzer · Impressum",
  "meta.description": "Angaben gemäß § 5 TMG — Impressum für Wattlyzer.",
  "back": "← wattlyzer.de",
  "eyebrow": "§ 5 TMG",
  "title": "Das",
  "titleEm": "Impressum.",
  "subtitle": "Angaben gemäß § 5 TMG",
  "foot": "© 2026 Wattlyzer · Impressum",
};

export const { messages, translate, translatorFor } = createTranslator<LegalKey>({
  en,
  de,
});
