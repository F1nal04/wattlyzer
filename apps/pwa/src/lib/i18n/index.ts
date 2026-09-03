import {
  formatDecimal,
  formatInteger,
  interpolate,
  type Locale,
  type MessageValues,
} from "@wattlyzer/i18n";
import { useLocale } from "@/lib/locale";
import { de } from "./de";
import { en, type MessageKey } from "./en";

export type { MessageKey } from "./en";
export type { Locale } from "@wattlyzer/i18n";

export const messages = { en, de } as const;

export type Translate = (key: MessageKey, values?: MessageValues) => string;

export function translate(
  locale: Locale,
  key: MessageKey,
  values?: MessageValues,
): string {
  return interpolate(messages[locale][key], values);
}

// Bound translator for a locale. Created once per locale so components that
// only take a `Translate` (and the pure helpers in `solar.ts` / `shading.ts`)
// stay independent of React.
const translators = new Map<Locale, Translate>();

export function translatorFor(locale: Locale): Translate {
  let translate_ = translators.get(locale);
  if (!translate_) {
    translate_ = (key, values) => translate(locale, key, values);
    translators.set(locale, translate_);
  }
  return translate_;
}

export interface I18n {
  locale: Locale;
  t: Translate;
  // Locale-aware number formatting, so 1.2 kWh reads "1,2 kWh" in German.
  decimal: (value: number, fractionDigits?: number) => string;
  integer: (value: number) => string;
}

export function useT(): Translate {
  return translatorFor(useLocale());
}

export function useI18n(): I18n {
  const locale = useLocale();
  return {
    locale,
    t: translatorFor(locale),
    decimal: (value, fractionDigits) =>
      formatDecimal(locale, value, fractionDigits),
    integer: (value) => formatInteger(locale, value),
  };
}
