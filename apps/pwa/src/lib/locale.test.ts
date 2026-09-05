import { describe, expect, it } from "bun:test";
import {
  LOCALE_STORAGE_KEY,
  localeFromSearch,
  parseStoredLocale,
  serializeStoredLocale,
} from "@/lib/locale";

// ── Browser shims ───────────────────────────────────────────────
// Same lazy-load contract as the settings store: the shims only have to
// exist before the first snapshot read, i.e. before the first test runs.
const backing = new Map<string, string>();
const localStorageShim = {
  getItem: (key: string) => backing.get(key) ?? null,
  setItem: (key: string, value: string) => void backing.set(key, value),
  removeItem: (key: string) => void backing.delete(key),
  clear: () => backing.clear(),
};
Object.assign(globalThis, {
  localStorage: localStorageShim,
  window: {
    localStorage: localStorageShim,
    addEventListener: () => {},
    removeEventListener: () => {},
  },
  navigator: { languages: ["de-DE", "en-US"] },
});

describe("parseStoredLocale", () => {
  it("reads back a persisted manual choice", () => {
    expect(parseStoredLocale('{"locale":"de"}')).toBe("de");
    expect(parseStoredLocale('{"locale":"en"}')).toBe("en");
  });

  it("reports no choice when nothing was ever stored", () => {
    expect(parseStoredLocale(null)).toBeNull();
  });

  it("reports no choice for an explicit auto payload", () => {
    expect(parseStoredLocale('{"locale":null}')).toBeNull();
  });

  it("ignores an unsupported or malformed stored locale", () => {
    expect(parseStoredLocale('{"locale":"fr"}')).toBeNull();
    expect(parseStoredLocale('{"locale":"de-DE"}')).toBeNull();
    expect(parseStoredLocale('{"locale":42}')).toBeNull();
    expect(parseStoredLocale("{}")).toBeNull();
  });

  it("survives a corrupt payload instead of throwing", () => {
    expect(parseStoredLocale("not-json{{")).toBeNull();
  });
});

describe("serializeStoredLocale", () => {
  it("round-trips through parseStoredLocale", () => {
    expect(parseStoredLocale(serializeStoredLocale("de"))).toBe("de");
    expect(parseStoredLocale(serializeStoredLocale("en"))).toBe("en");
    expect(parseStoredLocale(serializeStoredLocale(null))).toBeNull();
  });
});

describe("locale store", () => {
  it("persists a manual choice under its own key", async () => {
    const { setLocale } = await import("@/lib/locale");

    setLocale("de");

    expect(backing.get(LOCALE_STORAGE_KEY)).toBe('{"locale":"de"}');
  });

  it("does not touch the settings or prefs payloads", async () => {
    const { setLocale } = await import("@/lib/locale");
    backing.set("wattlyzer_settings", '{"kwh":7}');
    backing.set("wattlyzer_prefs", '{"duration":4}');

    setLocale("en");

    expect(backing.get("wattlyzer_settings")).toBe('{"kwh":7}');
    expect(backing.get("wattlyzer_prefs")).toBe('{"duration":4}');
  });

  it("exposes the stored choice and the browser preference separately", async () => {
    const { getLocaleSnapshot, setLocale } = await import("@/lib/locale");

    setLocale("en");

    const snapshot = getLocaleSnapshot();
    // The manual choice overrides, but the browser preference is still
    // reported so `resolveLocale` can fall back to it once cleared.
    expect(snapshot.chosen).toBe("en");
    expect(snapshot.preferred).toEqual(["de-DE", "en-US"]);
  });

  it("clears back to automatic detection", async () => {
    const { getLocaleSnapshot, setLocale } = await import("@/lib/locale");

    setLocale("en");
    setLocale(null);

    expect(getLocaleSnapshot().chosen).toBeNull();
    expect(backing.get(LOCALE_STORAGE_KEY)).toBe('{"locale":null}');
  });

  it("reports the default locale to the server renderer", async () => {
    const { getLocaleServerSnapshot } = await import("@/lib/locale");

    expect(getLocaleServerSnapshot()).toEqual({ chosen: null, preferred: [] });
  });
});

describe("cross-domain language choice", () => {
  it("accepts supported explicit languages", () => {
    expect(localeFromSearch("?lang=de")).toBe("de");
    expect(localeFromSearch("?lang=en&source=website")).toBe("en");
  });
  it("ignores absent and unsupported languages", () => {
    for (const search of ["", "?lang=", "?lang=fr", "?lang=de-DE"]) {
      expect(localeFromSearch(search)).toBeNull();
    }
  });
});
