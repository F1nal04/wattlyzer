import {
  createTranslator,
  formatDecimal,
  formatInteger,
  type Locale,
  type Translate as TranslateFor,
} from "@wattlyzer/i18n";
import { useLocale } from "@/lib/locale";
import { de } from "./de";
import { en, type MessageKey } from "./en";

export type { MessageKey } from "./en";
export type { Locale } from "@wattlyzer/i18n";

// The catalogs are the app's; the mechanics come from the shared package,
// which the website uses for its own catalogs too.
const translator = createTranslator<MessageKey>({ en, de });

export const messages = translator.messages;
export const translate = translator.translate;
export const translatorFor = translator.translatorFor;

export type Translate = TranslateFor<MessageKey>;

export interface I18n {
  locale: Locale;
  t: Translate;
  // Locale-aware number formatting, so 1.2 kWh reads "1,2 kWh" in German.
  decimal: (value: number, fractionDigits?: number) => string;
  integer: (value: number) => string;
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
