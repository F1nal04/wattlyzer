import { createTranslator } from "@wattlyzer/i18n";

export const en = {
  install: "Install PWA",
  open: "Open the app",
} as const;

export const de: Record<keyof typeof en, string> = {
  install: "PWA installieren",
  open: "App öffnen",
};

export const { translatorFor } = createTranslator<keyof typeof en>({ en, de });
