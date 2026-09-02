import { describe, expect, it } from "bun:test";
import { updatePrefs, updateSettings } from "@/lib/settings";

// ── Browser shims ───────────────────────────────────────────────
// The store reads `window` and `localStorage` lazily (first snapshot
// access), so installing the shims in the module body — after imports
// but before any test runs — is early enough.
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
});

const savedSettings = () =>
  JSON.parse(backing.get("wattlyzer_settings") ?? "null");
const savedPrefs = () => JSON.parse(backing.get("wattlyzer_prefs") ?? "null");

// NOTE: the store caches in module state after first load, so these tests
// are order-dependent within this file: the legacy payload must be seeded
// before the first updateSettings call, the corrupt prefs payload before
// the first updatePrefs call.

describe("settings store", () => {
  it("migrates legacy payloads (betaCalculations, ignoreSolarForBestSlot) on first load", () => {
    backing.set(
      "wattlyzer_settings",
      JSON.stringify({
        azimut: 90,
        betaCalculations: true,
        ignoreSolarForBestSlot: true,
        // no bestSlotMode — pre-mode legacy shape
      }),
    );

    updateSettings({}); // triggers first load + re-persist

    const saved = savedSettings();
    expect(saved.bestSlotMode).toBe("price-only"); // derived from ignoreSolarForBestSlot
    expect(saved.ignoreSolarForBestSlot).toBe(true);
    expect(saved.morningShading).toBe(true); // carried over from betaCalculations
    expect(saved.azimut).toBe(90); // stored value kept
    expect(saved.angle).toBe(45); // missing fields filled from defaults
    expect(saved.kwh).toBe(5);
    expect(saved.dynamicTariff).toBe(true); // missing field filled from defaults
    expect("betaCalculations" in saved).toBe(false); // legacy key not re-persisted
  });

  it("keeps ignoreSolarForBestSlot in sync when bestSlotMode changes", () => {
    updateSettings({ bestSlotMode: "solar-only" });
    expect(savedSettings().ignoreSolarForBestSlot).toBe(false);

    updateSettings({ bestSlotMode: "price-only" });
    expect(savedSettings().ignoreSolarForBestSlot).toBe(true);
  });

  it("keeps bestSlotMode in sync when ignoreSolarForBestSlot changes", () => {
    updateSettings({ ignoreSolarForBestSlot: false });
    expect(savedSettings().bestSlotMode).toBe("combined");

    updateSettings({ ignoreSolarForBestSlot: true });
    expect(savedSettings().bestSlotMode).toBe("price-only");
  });

  it("merges partial updates without losing other fields", () => {
    updateSettings({ kwh: 9.5 });
    const saved = savedSettings();
    expect(saved.kwh).toBe(9.5);
    expect(saved.azimut).toBe(90); // from the earlier migration test
    expect(saved.morningShading).toBe(true);
  });

  it("persists dynamicTariff independently of bestSlotMode", () => {
    updateSettings({ dynamicTariff: false, bestSlotMode: "solar-only" });
    expect(savedSettings().dynamicTariff).toBe(false);
    expect(savedSettings().bestSlotMode).toBe("solar-only");

    updateSettings({ bestSlotMode: "price-only" });
    expect(savedSettings().dynamicTariff).toBe(false);
    expect(savedSettings().bestSlotMode).toBe("price-only");
  });
});

describe("prefs store", () => {
  it("falls back to defaults when the stored payload is corrupt", () => {
    backing.set("wattlyzer_prefs", "not-json{{");

    updatePrefs({ duration: 5 }); // first load hits the corrupt payload

    expect(savedPrefs()).toEqual({
      duration: 5,
      searchWindow: "24",
      onboarded: false,
    });
  });

  it("merges partial updates over the cached state", () => {
    updatePrefs({ onboarded: true });
    expect(savedPrefs()).toEqual({
      duration: 5, // kept from the previous update
      searchWindow: "24",
      onboarded: true,
    });

    updatePrefs({ searchWindow: "eod" });
    expect(savedPrefs().searchWindow).toBe("eod");
    expect(savedPrefs().onboarded).toBe(true);
  });
});
