import type { Locale } from "./locale";

// Intl formatters are comparatively expensive to construct and the PWA
// re-renders them on every slider drag, so cache one per locale + shape.
const decimalFormatters = new Map<string, Intl.NumberFormat>();

function decimalFormatter(locale: Locale, fractionDigits: number) {
  const key = `${locale}:${fractionDigits}`;
  let formatter = decimalFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
    decimalFormatters.set(key, formatter);
  }
  return formatter;
}

// Locale-aware replacement for `value.toFixed(digits)`: "1.2" in English,
// "1,2" in German. Trailing zeros are kept so slider ticks stay aligned.
export function formatDecimal(
  locale: Locale,
  value: number,
  fractionDigits = 1,
): string {
  return decimalFormatter(locale, fractionDigits).format(value);
}

export function formatInteger(locale: Locale, value: number): string {
  return decimalFormatter(locale, 0).format(Math.round(value));
}
