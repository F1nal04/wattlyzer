import { describe, expect, it } from "bun:test";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_META,
  localeOptions,
  detectLocale,
  isLocale,
  normalizeLocaleTag,
  resolveLocale,
} from "./locale";

describe("LOCALES", () => {
  it("matches the website's locale set, English first as the default", () => {
    expect(LOCALES).toEqual(["en", "de"]);
    expect(DEFAULT_LOCALE).toBe("en");
  });
});

describe("isLocale", () => {
  it("accepts the supported locales", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("de")).toBe(true);
  });

  it("rejects anything else, including regional tags and junk", () => {
    expect(isLocale("de-DE")).toBe(false);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale("")).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(isLocale(42)).toBe(false);
  });
});

describe("normalizeLocaleTag", () => {
  it("reduces a regional tag to its supported base language", () => {
    expect(normalizeLocaleTag("de-DE")).toBe("de");
    expect(normalizeLocaleTag("de-AT")).toBe("de");
    expect(normalizeLocaleTag("de-CH")).toBe("de");
    expect(normalizeLocaleTag("en-GB")).toBe("en");
  });

  it("is case-insensitive", () => {
    expect(normalizeLocaleTag("DE")).toBe("de");
    expect(normalizeLocaleTag("DE-de")).toBe("de");
    expect(normalizeLocaleTag("En-Us")).toBe("en");
  });

  it("tolerates whitespace and underscore-separated tags", () => {
    expect(normalizeLocaleTag("  de-DE  ")).toBe("de");
    expect(normalizeLocaleTag("de_DE")).toBe("de");
  });

  it("returns null for unsupported or malformed tags", () => {
    expect(normalizeLocaleTag("fr-FR")).toBeNull();
    expect(normalizeLocaleTag("")).toBeNull();
    expect(normalizeLocaleTag("-")).toBeNull();
    expect(normalizeLocaleTag(undefined)).toBeNull();
  });

  it("does not match a language that merely starts with a supported code", () => {
    // "den" (Slave) is not German; "eng" is not our "en" tag either.
    expect(normalizeLocaleTag("den")).toBeNull();
    expect(normalizeLocaleTag("enm")).toBeNull();
  });
});

describe("detectLocale", () => {
  it("starts a German browser in German", () => {
    expect(detectLocale(["de-DE", "en-US"])).toBe("de");
    expect(detectLocale(["de"])).toBe("de");
    expect(detectLocale(["de-AT"])).toBe("de");
  });

  it("starts a browser without a German preference in English", () => {
    expect(detectLocale(["en-US", "en"])).toBe("en");
    expect(detectLocale(["fr-FR"])).toBe("en");
  });

  it("honours preference order, so English before German stays English", () => {
    // Standard Accept-Language negotiation: first supported match wins.
    expect(detectLocale(["en-US", "de-DE"])).toBe("en");
    expect(detectLocale(["fr-FR", "de-DE", "en-US"])).toBe("de");
  });

  it("falls back to English for an empty or missing preference list", () => {
    expect(detectLocale([])).toBe("en");
    expect(detectLocale(undefined)).toBe("en");
  });
});

describe("resolveLocale", () => {
  it("uses English for SSR and the first client render, whatever the browser prefers", () => {
    expect(
      resolveLocale({ mounted: false, stored: "de", preferred: ["de-DE"] }),
    ).toBe("en");
  });

  it("prefers a stored manual choice over browser detection once mounted", () => {
    expect(
      resolveLocale({ mounted: true, stored: "en", preferred: ["de-DE"] }),
    ).toBe("en");
    expect(
      resolveLocale({ mounted: true, stored: "de", preferred: ["en-US"] }),
    ).toBe("de");
  });

  it("detects from the browser when no choice was stored", () => {
    expect(
      resolveLocale({ mounted: true, stored: null, preferred: ["de-DE"] }),
    ).toBe("de");
    expect(
      resolveLocale({ mounted: true, stored: null, preferred: ["en-US"] }),
    ).toBe("en");
  });

  it("falls back to English when nothing is stored and nothing is preferred", () => {
    expect(
      resolveLocale({ mounted: true, stored: null, preferred: undefined }),
    ).toBe("en");
  });
});

describe("LOCALE_META", () => {
  it("names each language in that language, not in the reader's", () => {
    // A picker shows "Deutsch" whatever the UI language is, so these are
    // invariant metadata rather than translatable copy.
    expect(LOCALE_META.en).toEqual({ name: "English", short: "EN" });
    expect(LOCALE_META.de).toEqual({ name: "Deutsch", short: "DE" });
  });

  it("covers every supported locale", () => {
    expect(Object.keys(LOCALE_META).sort()).toEqual([...LOCALES].sort());
  });
});

describe("localeOptions", () => {
  it("lists every locale in declaration order, marking the active one", () => {
    expect(localeOptions("en")).toEqual([
      { locale: "en", name: "English", short: "EN", active: true },
      { locale: "de", name: "Deutsch", short: "DE", active: false },
    ]);
  });

  it("moves the active flag with the current locale, keeping the order", () => {
    expect(localeOptions("de").map((o) => o.locale)).toEqual(["en", "de"]);
    expect(localeOptions("de").map((o) => o.active)).toEqual([false, true]);
  });

  it("marks exactly one option active", () => {
    for (const locale of LOCALES) {
      expect(localeOptions(locale).filter((o) => o.active)).toHaveLength(1);
    }
  });
});
