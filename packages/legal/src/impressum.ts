import { createTranslator, type Locale } from "@wattlyzer/i18n";
export type { Locale } from "@wattlyzer/i18n";

// Operator details required by § 5 TMG. The PWA and the marketing site are
// two faces of the same product, so this is the single source both render —
// they previously drifted and published two different contact addresses.
export const IMPRESSUM = {
  name: "Leon Bojanowski",
  street: "Marienstraße 3b",
  city: "14532 Stahnsdorf",
  email: "leongaborbojanowski@proton.me",
} as const;

export const en = {
  operator: "Operator",
  contact: "Contact",
  country: "Germany",
  informational: "Informational use only",
  informationalBody:
    "Wattlyzer provides estimates and recommendation support, not guaranteed outcomes or professional advice. All calculations are presented as estimates and are not suitable for critical decisions without independent verification.",
} as const;

export type ImpressumKey = keyof typeof en;

export const de: Record<ImpressumKey, string> = {
  operator: "Betreiber",
  contact: "Kontakt",
  country: "Deutschland",
  informational: "Nur zur Information",
  informationalBody:
    "Wattlyzer liefert Schätzungen und Empfehlungsunterstützung, keine garantierten Ergebnisse oder professionelle Beratung. Alle Berechnungen sind Schätzwerte und nicht für kritische Entscheidungen ohne unabhängige Überprüfung geeignet.",
};

export const { messages, translate, translatorFor } =
  createTranslator<ImpressumKey>({ en, de });

// The operator block as the lines both apps render, one per line. Only the
// country is translated — a name and a street address read the same either way.
export function impressumAddressLines(locale: Locale): string[] {
  return [
    IMPRESSUM.name,
    IMPRESSUM.street,
    IMPRESSUM.city,
    translate(locale, "country"),
  ];
}
