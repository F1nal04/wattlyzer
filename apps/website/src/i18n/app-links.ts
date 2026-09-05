import { createTranslator } from "@wattlyzer/i18n";

export const en = {
  install: "Install PWA",
} as const;

export const de: Record<keyof typeof en, string> = {
  install: "PWA installieren",
};

export const { translatorFor } = createTranslator<keyof typeof en>({ en, de });
