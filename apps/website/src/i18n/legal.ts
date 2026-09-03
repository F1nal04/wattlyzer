import { createTranslator } from "@wattlyzer/i18n";

// English is the source of truth for the key union, exactly like the PWA's
// catalog, so a missing German string fails `astro check` rather than
// silently rendering English — which is how the German page ended up with
// an English "Legal notice." headline.
export const en = {
  "meta.title": "Wattlyzer · Legal notice",
  "meta.description": "Legal notice for Wattlyzer — information according to § 5 TMG.",
  "back": "← wattlyzer.de",
  "eyebrow": "§ 5 TMG",
  // The headline renders as `title` followed by an emphasised `titleEm`.
  "title": "Legal",
  "titleEm": "notice.",
  "subtitle": "Information according to § 5 TMG",
  "operator": "Operator",
  "contact": "Contact",
  "country": "Germany",
  "informational": "Informational use only",
  "informationalBody":
    "Wattlyzer provides estimates and recommendation support, not guaranteed outcomes or professional advice. All calculations are presented as estimates and are not suitable for critical decisions without independent verification.",
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
  "operator": "Betreiber",
  "contact": "Kontakt",
  "country": "Deutschland",
  "informational": "Nur zur Information",
  "informationalBody":
    "Wattlyzer liefert Schätzungen und Empfehlungsunterstützung, keine garantierten Ergebnisse oder professionelle Beratung. Alle Berechnungen sind Schätzwerte und nicht für kritische Entscheidungen ohne unabhängige Überprüfung geeignet.",
  "foot": "© 2026 Wattlyzer · Impressum",
};

export const { messages, translate, translatorFor } = createTranslator<LegalKey>({
  en,
  de,
});
