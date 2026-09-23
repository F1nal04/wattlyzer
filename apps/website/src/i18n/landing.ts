import { createTranslator } from "@wattlyzer/i18n";

// Landing page copy. English is the source of truth for the key union, so a
// missing German string fails `astro check` instead of rendering English.
// Headlines split into `title` + `titleEm` (the emphasised tail); paragraphs
// with an inline link split into `before` + `after` around it.
export const en = {
  "meta.title": "Wattlyzer · Run it when the sky says so.",
  "meta.description":
    "Wattlyzer reads the sun, the spot price, and your roof — then tells you the one best window today to start the dishwasher, the heat pump, the wall box.",
  "nav.how": "How it works",
  "nav.privacy": "Privacy",
  "nav.faq": "FAQ",
  "nav.install": "Install PWA",
  "nav.menu": "Menu",
  "nav.close": "Close",
  "hero.eyebrow": "FOR GERMAN SOLAR HOMES",
  "hero.title": "Run it",
  "hero.titleEm": "when the sky says so.",
  "hero.sub":
    "Wattlyzer reads the sun, the spot price, and your roof — then tells you the one best window today to start the dishwasher, the heat pump, the wall box.",
  "hero.ctaSub": "Free · no account",
  "how.eyebrow": "HOW IT WORKS",
  "how.title": "Three signals,",
  "how.titleEm": "one window.",
  "how.sub": "No dashboards. No graphs to read. Just the hour you should press start.",
  "step1.title": "We read the sky.",
  "step1.body": "Hour-by-hour solar forecast for your roof — pitch, azimuth, kWp and shading included.",
  "step2.title": "We read the price.",
  "step2.body": "Dynamic spot tariffs (Tibber, aWATTar, Octopus) pulled fresh four times an hour.",
  "step3.title": "We pick the hour.",
  "step3.body": "One window. Sunniest, cheapest, or balanced — your call. Slide for duration, done.",
  "privacy.eyebrow": "PRIVACY",
  "privacy.title": "Runs on your phone.",
  "privacy.titleEm": "Stays on your phone.",
  "privacy.sub":
    "Wattlyzer is a Progressive Web App. Forecasts and prices are fetched directly from public APIs. Your roof setup never leaves the device. No account, no tracker, no analytics SDK.",
  "bullet1.title": "No account",
  "bullet1.body": "Configure your roof, you're done. There is nothing to log into.",
  "bullet2.title": "No tracking",
  "bullet2.body": "No analytics, no pixels, no cookies. Open the network tab and check.",
  "bullet3.title": "Local first",
  "bullet3.body": "Tariffs and forecasts cached on-device.",
  "bullet4.title": "Open source",
  "bullet4.before": "Source on ",
  "bullet4.after": ", Apache 2.0 licensed. Read it, fork it, host it yourself.",
  "faq.eyebrow": "FAQ",
  "faq.title": "Common questions.",
  "faq1.q": "Which tariffs are supported?",
  "faq1.a":
    "Any dynamic electricity tariff that exposes hourly spot prices. Fixed-rate contracts cannot be optimized — there is nothing to compare.",
  "faq2.q": "Do I need a smart meter?",
  "faq2.a":
    "No. Wattlyzer recommends a window — you start the appliance. We never touch your meter or your inverter.",
  "faq3.q": "How accurate is the solar forecast?",
  "faq3.a":
    "We use the forecast.solar API with your roof's location, tilt, azimuth, and installed kWp. Accuracy depends on local weather conditions.",
  "faq4.q": "Is it really free?",
  "faq4.before": "Yes. No tier, no upsell. If you want to support the project, star it on ",
  "faq4.after": " or send a postcard.",
  "faq5.q": "Why a PWA and not the App Store?",
  "faq5.a":
    "Because the App Store would slow shipping, take a cut, and demand an account system we do not need. The PWA installs in two taps from Safari or Chrome.",
  "footer.tagline": "Made in Berlin for German rooftops.",
  "footer.privacy": "Privacy",
  "footer.legal": "Legal notice",
  "footer.copy": "© 2026 Wattlyzer. Apache 2.0 licensed.",
} as const;

export type LandingKey = keyof typeof en;

export const de: Record<LandingKey, string> = {
  "meta.title": "Wattlyzer · Lass es laufen, wenn der Himmel es sagt.",
  "meta.description":
    "Wattlyzer liest die Sonne, den Spotpreis und dein Dach — und nennt dir das eine beste Fenster heute, um Spülmaschine, Wärmepumpe oder Wallbox zu starten.",
  "nav.how": "So funktioniert's",
  "nav.privacy": "Datenschutz",
  "nav.faq": "FAQ",
  "nav.install": "PWA installieren",
  "nav.menu": "Menü",
  "nav.close": "Schließen",
  "hero.eyebrow": "FÜR DEUTSCHE SOLARHAUSHALTE",
  "hero.title": "Lass es laufen,",
  "hero.titleEm": "wenn der Himmel es sagt.",
  "hero.sub":
    "Wattlyzer liest die Sonne, den Spotpreis und dein Dach — und nennt dir das eine beste Fenster heute, um Spülmaschine, Wärmepumpe oder Wallbox zu starten.",
  "hero.ctaSub": "Kostenlos · ohne Konto",
  "how.eyebrow": "SO FUNKTIONIERT'S",
  "how.title": "Drei Signale,",
  "how.titleEm": "ein Fenster.",
  "how.sub": "Kein Dashboard. Keine Diagramme. Nur die Stunde, in der du Start drückst.",
  "step1.title": "Wir lesen den Himmel.",
  "step1.body": "Stündliche Solarprognose für dein Dach — Neigung, Ausrichtung, kWp und Verschattung inklusive.",
  "step2.title": "Wir lesen den Preis.",
  "step2.body": "Dynamische Spot-Tarife (Tibber, aWATTar, Octopus) — viermal pro Stunde frisch geholt.",
  "step3.title": "Wir wählen die Stunde.",
  "step3.body": "Ein Fenster. Sonnigster, günstigster oder ausgewogener Modus — du entscheidest. Laufzeit-Slider, fertig.",
  "privacy.eyebrow": "DATENSCHUTZ",
  "privacy.title": "Läuft auf deinem Gerät.",
  "privacy.titleEm": "Bleibt auf deinem Gerät.",
  "privacy.sub":
    "Wattlyzer ist eine Progressive Web App. Wetter und Preise kommen direkt aus öffentlichen APIs. Deine Dachkonfiguration verlässt das Gerät nicht. Kein Konto, kein Tracker, kein Analytics-SDK.",
  "bullet1.title": "Kein Konto",
  "bullet1.body": "Dach konfigurieren, fertig. Es gibt nichts, wo du dich einloggen müsstest.",
  "bullet2.title": "Kein Tracking",
  "bullet2.body": "Keine Analytics, keine Pixel, keine Cookies. Network-Tab öffnen und nachsehen.",
  "bullet3.title": "Local first",
  "bullet3.body": "Tarife und Prognosen lokal gecached.",
  "bullet4.title": "Open source",
  "bullet4.before": "Quellcode auf ",
  "bullet4.after": ", Apache-2.0-Lizenz. Lesen, forken, selbst hosten — alles erlaubt.",
  "faq.eyebrow": "FAQ",
  "faq.title": "Häufige Fragen.",
  "faq1.q": "Welche Tarife werden unterstützt?",
  "faq1.a":
    "Jeder dynamische Stromtarif, der stündliche Spotpreise bereitstellt. Festpreisverträge lassen sich nicht optimieren — es gibt nichts zu vergleichen.",
  "faq2.q": "Brauche ich ein Smart Meter?",
  "faq2.a":
    "Nein. Wattlyzer empfiehlt nur ein Fenster — du startest das Gerät selbst. Wir greifen weder auf Zähler noch auf Wechselrichter zu.",
  "faq3.q": "Wie genau ist die Solarprognose?",
  "faq3.a":
    "Wir nutzen die forecast.solar API mit Standort, Neigung, Ausrichtung und installierter kWp deines Dachs. Die Genauigkeit hängt von den lokalen Wetterbedingungen ab.",
  "faq4.q": "Ist es wirklich kostenlos?",
  "faq4.before": "Ja. Keine Tarife, keine Upsells. Wenn du das Projekt unterstützen willst — Stern auf ",
  "faq4.after": " oder eine Postkarte.",
  "faq5.q": "Warum eine PWA und kein App Store?",
  "faq5.a":
    "Weil der App Store das Ausliefern verlangsamt, eine Provision nimmt und einen Account-Zwang bedeutet, den wir nicht brauchen. Die PWA installiert sich in zwei Taps aus Safari oder Chrome.",
  "footer.tagline": "Made in Berlin, für deutsche Dächer.",
  "footer.privacy": "Datenschutz",
  "footer.legal": "Impressum",
  "footer.copy": "© 2026 Wattlyzer. Apache-2.0-Lizenz.",
};

export const { translatorFor } = createTranslator<LandingKey>({ en, de });
