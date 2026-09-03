import type { Locale } from "./locale";
import { interpolate, type MessageValues } from "./message";

// A message catalog: every key of the source locale mapped to a template.
export type Catalog<K extends string> = Record<K, string>;

export type Translate<K extends string> = (
  key: K,
  values?: MessageValues,
) => string;

export interface Translator<K extends string> {
  messages: Record<Locale, Catalog<K>>;
  translate: (locale: Locale, key: K, values?: MessageValues) => string;
  translatorFor: (locale: Locale) => Translate<K>;
}

// Builds a translator over one catalog per locale. Generic over the key
// union so each app keeps its own `MessageKey` derived from its English
// catalog — the package supplies the mechanics, not the copy.
export function createTranslator<K extends string>(
  messages: Record<Locale, Catalog<K>>,
): Translator<K> {
  const translate = (locale: Locale, key: K, values?: MessageValues) =>
    interpolate(messages[locale][key], values);

  // One bound translator per locale. Components take this as a prop or hook
  // value, so a fresh closure per call would break memoization and effect
  // dependency checks.
  const bound = new Map<Locale, Translate<K>>();

  const translatorFor = (locale: Locale): Translate<K> => {
    let translator = bound.get(locale);
    if (!translator) {
      translator = (key, values) => translate(locale, key, values);
      bound.set(locale, translator);
    }
    return translator;
  };

  return { messages, translate, translatorFor };
}
