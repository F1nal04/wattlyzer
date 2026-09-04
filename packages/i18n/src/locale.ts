// Locale model shared with the marketing website: English is the default and
// lives at the unprefixed routes, German is the secondary locale under /de/.
export const LOCALES = ["en", "de"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (LOCALES as readonly string[]).includes(value)
  );
}

// Reduce a BCP 47 tag ("de-DE", "DE_at") to the supported base language.
// Only the primary subtag is considered, so "den" never matches "de".
export function normalizeLocaleTag(tag: string | null | undefined): Locale | null {
  if (typeof tag !== "string") {
    return null;
  }

  const primary = tag.trim().toLowerCase().split(/[-_]/)[0];
  return isLocale(primary) ? primary : null;
}

// Accept-Language style negotiation: the first preference we support wins,
// so ["en-US", "de-DE"] stays English.
export function detectLocale(
  preferred: readonly string[] | null | undefined,
): Locale {
  for (const tag of preferred ?? []) {
    const locale = normalizeLocaleTag(tag);
    if (locale) {
      return locale;
    }
  }

  return DEFAULT_LOCALE;
}

// Pure locale decision, mirroring `pickSkyHour` in the PWA:
// - not mounted -> the default locale, because the server cannot know the
//   browser's preferences and hydration must render identical markup
// - a stored manual choice always beats detection
// - otherwise detect from the browser's preferred languages
export function resolveLocale(opts: {
  mounted: boolean;
  stored: Locale | null;
  preferred: readonly string[] | null | undefined;
}): Locale {
  if (!opts.mounted) return DEFAULT_LOCALE;
  if (opts.stored) return opts.stored;
  return detectLocale(opts.preferred);
}

// How each language names itself. A language picker shows "Deutsch"
// regardless of the surrounding UI language, so this is invariant metadata
// and deliberately not part of either app's message catalog.
export const LOCALE_META: Record<Locale, { name: string; short: string }> = {
  en: { name: "English", short: "EN" },
  de: { name: "Deutsch", short: "DE" },
};

export interface LocaleOption {
  locale: Locale;
  name: string;
  short: string;
  active: boolean;
}

// The option list behind any language switcher: the PWA renders buttons
// that write the choice, the website renders links to the localized route.
export function localeOptions(current: Locale): LocaleOption[] {
  return LOCALES.map((locale) => ({
    locale,
    ...LOCALE_META[locale],
    active: locale === current,
  }));
}
