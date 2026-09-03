import type { MessageKey } from "./en";

// German catalog. Typed as `Record<MessageKey, string>`, so dropping a key
// fails `bun run typecheck` rather than silently falling back to English.
// Tone matches the marketing site: informal "du".
export const de: Record<MessageKey, string> = {
  // ── App shell ──────────────────────────────────────────────
  "app.title": "wattlyzer",
  "app.description":
    "Intelligente Energieplanung: Wattlyzer bestimmt anhand von Solarertrag und Strompreisen, wann deine Geräte laufen sollten.",

  // ── Common ─────────────────────────────────────────────────
  "common.back": "Zurück",
  "common.close": "Schließen",
  "common.done": "Fertig",
  "common.continue": "Weiter",
  "common.skip": "Überspringen",
  "common.edit": "Ändern",
  "common.add": "Hinzufügen",
  "common.off": "Aus",

  // ── Units ──────────────────────────────────────────────────
  "unit.hours": "{value} h",
  "unit.minutes": "{value} min",
  "unit.kwh": "{value} kWh",
  "unit.kwp": "{value} kWp",
  "unit.degrees": "{value}°",
  "unit.hourOfDay": "{hour}:00",

  // ── Compass (8-point) ──────────────────────────────────────
  // German uses O for Osten, so NE/SE become NO/SO.
  "compass.n": "N",
  "compass.ne": "NO",
  "compass.e": "O",
  "compass.se": "SO",
  "compass.s": "S",
  "compass.sw": "SW",
  "compass.w": "W",
  "compass.nw": "NW",

  // ── Home ───────────────────────────────────────────────────
  "home.bestTimeToday": "Beste Zeit heute",
  "home.bestTimeTomorrow": "Beste Zeit morgen",
  "home.startsIn": "Startet in",
  "home.now": "jetzt",
  "home.showStartTime": "Startzeit anzeigen",
  "home.showTimeRemaining": "Verbleibende Zeit bis zum Start anzeigen",
  "home.runSummary": "{range} · {hours} h Laufzeit",
  "home.reason.solar": "Fängt die meiste Sonne",
  "home.reason.price": "Günstigstes Fenster",
  "home.runFor": "Laufzeit",
  "home.marketCoverage": "Preise decken {covered} h von {window} h ab",

  // ── Status messages ────────────────────────────────────────
  "status.nothingToSchedule.title": "Nichts zu planen.",
  "status.nothingToSchedule.body":
    "Wattlyzer braucht eine Solaranlage oder einen dynamischen Tarif. Ohne beides gibt es kein besseres Fenster zu finden.",
  "status.locationNeeded.title": "Standort nötig.",
  "status.locationNeeded.body":
    "Erlaube die Standortfreigabe im Browser, damit die Prognose zu deinem Dach passt.",
  "status.findingSky.title": "Suche deinen Himmel…",
  "status.findingSky.body":
    "Wattlyzer braucht deine aktuelle Position, um den lokalen Solarertrag zu schätzen.",
  "status.windowTooShort.title": "Fenster zu kurz.",
  "status.windowTooShort.body":
    "Das Suchfenster ({window} h) muss mindestens so lang sein wie die Laufzeit ({duration} h). Erweitere es in den Schnelleinstellungen.",
  "status.loading.title": "Lese Sonne und Preise…",
  "status.loading.solarOnly": "Lade die Solarprognose.",
  "status.loading.solarAndPrices": "Lade die Solarprognose und die Marktpreise.",
  "status.forecastUnavailable.title": "Prognose nicht verfügbar.",
  "status.forecastUnavailable.body":
    "Eine Datenabfrage ist fehlgeschlagen ({error}). Versuche es gleich noch einmal.",
  "status.noWindow.title": "Kein Fenster gefunden.",
  "status.noWindow.body":
    "Die Marktpreise decken das Suchfenster noch nicht ab. Erweitere es in den Schnelleinstellungen oder schau später wieder vorbei.",
  "status.noSunnyWindow.title": "Kein sonniges Fenster.",
  "status.noSunnyWindow.body":
    "Kein Zeitfenster erreicht das Solar-Minimum von {minimum} kWh. Senke es oder erweitere das Suchfenster in den Schnelleinstellungen.",

  // ── Scheduling mode ────────────────────────────────────────
  "mode.combined": "Beides",
  "mode.solar": "Solar",
  "mode.price": "Preis",
  "mode.unavailable": "{mode}, nicht verfügbar",
  "mode.hint.noSignals":
    "Aktiviere in den Einstellungen eine Solaranlage oder einen dynamischen Tarif.",
  "mode.hint.noSolar":
    "Aktiviere die Solaranlage in den Einstellungen, um Solar oder Beides zu nutzen.",
  "mode.hint.noTariff":
    "Aktiviere einen dynamischen Tarif in den Einstellungen, um Beides oder Preis zu nutzen.",

  // ── Quick controls ─────────────────────────────────────────
  "quick.title": "Schnelleinstellungen",
  "quick.mode": "Modus",
  "quick.minSolar": "Min. Solar",
  "quick.searchWindow": "Suchfenster",
  "quick.window.endOfDay": "TE",

  // ── Settings ───────────────────────────────────────────────
  "settings.title": "Einstellungen",
  "settings.subtitle": "DEINE SOLARANLAGE",
  "settings.solar.title": "Solaranlage",
  "settings.solar.subtitle.on":
    "Dient der Ertragsschätzung für dein Dach.",
  "settings.solar.subtitle.priceOnly": "Keine Solaranlage — nur Preis.",
  "settings.solar.subtitle.off": "Keine Solaranlage.",
  "settings.solar.peakPower": "Spitzenleistung",
  "settings.solar.azimuth": "Ausrichtung",
  "settings.solar.tilt": "Neigung",
  "settings.solar.status": "Status",
  "settings.tariff.title": "Tarif",
  "settings.tariff.dynamic": "Dynamischer Tarif",
  "settings.tariff.detail": "Stündlicher Spotpreis (z. B. Tibber, aWATTar)",
  "settings.shading.title": "Verschattung",
  "settings.shading.subtitle": "Gleicht Bäume, Nachbargebäude usw. aus.",
  "settings.appearance.title": "Darstellung",
  "settings.appearance.darkMode": "Dunkelmodus",
  "settings.appearance.darkModeDetail":
    "Himmel nach der aktuellen Zeit statt nach dem gewählten Fenster",
  "settings.language.title": "Sprache",
  "settings.language.detail":
    "Folgt deinem Browser, bis du hier eine Sprache wählst.",
  "settings.more.title": "Mehr",
  "settings.more.privacy": "Datenschutz",
  "settings.more.legal": "Impressum",
  "settings.more.github": "GitHub",
  "settings.footer": "v{version} · für den deutschen Markt gemacht",
  "settings.eyebrow.solar": "Einstellungen · Solar",
  "settings.eyebrow.shading": "Einstellungen · Verschattung",

  // ── Language switcher ──────────────────────────────────────
  "language.label": "Sprache",
  "language.en": "English",
  "language.de": "Deutsch",
  "language.enShort": "EN",
  "language.deShort": "DE",
  "language.select": "App auf {language} umstellen",

  // ── Solar panels editor ────────────────────────────────────
  "solar.modal.aria": "Solaranlage",
  "solar.modal.eyebrow": "Solar",
  "solar.modal.title": "Deine {panels}.",
  "solar.modal.titleEm": "Module",
  "solar.modal.have": "Ich habe eine Solaranlage",
  "solar.modal.haveOn": "Die Prognose nutzt deine Dachdaten",
  "solar.modal.haveOff": "Überspringen — Wattlyzer nutzt nur den Spotpreis",
  "solar.modal.orientation": "Ausrichtung",
  "solar.modal.tilt": "Dachneigung",
  "solar.modal.size": "Anlagengröße",
  "solar.modal.sizeHint": "SPITZENERTRAG BEI VOLLER SONNE",

  // ── Roof shading editor ────────────────────────────────────
  "shading.modal.aria": "Dachverschattung",
  "shading.modal.eyebrow": "Verschattung",
  "shading.modal.title": "Schatten aufs {shade}.",
  "shading.modal.titleEm": "Dach",
  "shading.modal.hint": "WENN BÄUME ODER GEBÄUDE DIE TIEFE SONNE BLOCKIEREN",
  "shading.morning.title": "Verschattung morgens",
  "shading.morning.subtitle":
    "Bis Bäume oder Gebäude die tiefe Sonne blockieren",
  "shading.morning.hourLabel": "Schatten endet",
  "shading.evening.title": "Verschattung abends",
  "shading.evening.subtitle":
    "Ab wann Bäume oder Gebäude die tiefe Sonne blockieren",
  "shading.evening.hourLabel": "Schatten beginnt",
  "shading.until": "bis {hour}",
  "shading.from": "ab {hour}",
  "shading.summary": "{morning} · {evening}",

  // ── Onboarding ─────────────────────────────────────────────
  "onboarding.welcome.eyebrow": "Wattlyzer",
  "onboarding.welcome.title": "Läuft, wenn Energie {clean} und {cheap} ist.",
  "onboarding.welcome.clean": "sauber",
  "onboarding.welcome.cheap": "günstig",
  "onboarding.welcome.lede":
    "Lass Sonne und Spotpreis entscheiden, wann Spülmaschine, E-Auto oder Wärmepumpe anspringen.",
  "onboarding.welcome.cta": "Los geht's",
  "onboarding.welcome.duration": "DAUERT ETWA EINE MINUTE",
  "onboarding.how.title": "So funktioniert {wattlyzer}.",
  "onboarding.how.titleEm": "Wattlyzer",
  "onboarding.how.lede": "Zwei Dinge, ein Fenster pro Tag.",
  "onboarding.how.step1.title": "Wir beobachten Sonne und Preis",
  "onboarding.how.step1.body":
    "Solarprognose für dein Dach + der Day-Ahead-Spotpreis, stündlich.",
  "onboarding.how.step2.title": "Wir finden das beste Fenster",
  "onboarding.how.step2.body":
    "Am grünsten, am günstigsten oder beides — du entscheidest. Den ganzen Tag aktualisiert.",
  "onboarding.setup.title": "Erzähl uns von deiner {setup}.",
  "onboarding.setup.titleEm": "Anlage",
  "onboarding.setup.lede":
    "Zwei Angaben und wir können deinen Tag vorhersagen.",
  "onboarding.setup.solarStatus": "{size} kWp · {direction} · {tilt}° Neigung",
  "onboarding.setup.noSolarPriceOnly": "Keine Solaranlage — nur Preis",
  "onboarding.setup.noSolar": "Keine Solaranlage",
  "onboarding.setup.roofShading": "Dachverschattung",
  "onboarding.setup.darkModeDetail": "Himmel nach der aktuellen Zeit",
  "onboarding.setup.consent":
    "Mir ist bewusst, dass mein {location} und meine {solarData} für genaue Solarprognosen an einen Dritten übermittelt werden.",
  "onboarding.setup.consentLocation": "Standort",
  "onboarding.setup.consentSolarData": "Anlagendaten",
  "onboarding.eyebrow.solar": "Schritt 03 · Solar",
  "onboarding.eyebrow.shading": "Schritt 03 · Verschattung",
  "onboarding.done.eyebrow": "Alles bereit",
  "onboarding.done.title": "Dein erstes Fenster ist {oneTapAway}.",
  "onboarding.done.titleEm": "einen Tap entfernt",
  "onboarding.done.lede":
    "Erlaube auf dem nächsten Bildschirm den Standortzugriff, damit die Prognose zu deinem Dach passt.",
  "onboarding.done.cta": "Wattlyzer öffnen",

  // ── Install guidance ───────────────────────────────────────
  "install.ios.eyebrow": "iOS · Safari",
  "install.ios.title": "Auf den {em} legen.",
  "install.ios.titleEm": "Home-Bildschirm",
  "install.ios.lede":
    "Drei Taps und Wattlyzer liegt neben deinen anderen Apps.",
  "install.ios.step1.title": "Tippe auf {em}",
  "install.ios.step1.em": "Teilen",
  "install.ios.step1.body":
    "Unten in Safari — das Quadrat mit dem Pfeil nach oben.",
  "install.ios.step2.title": "{em}",
  "install.ios.step2.em": "Zum Home-Bildschirm",
  "install.ios.step2.body":
    "Scrolle im Teilen-Menü, falls du es nicht sofort siehst.",
  "install.ios.step3.title": "Tippe auf {em}",
  "install.ios.step3.em": "Hinzufügen",
  "install.ios.step3.body":
    "Wattlyzer landet bei deinen anderen Apps. Öffne es von dort für die Vollbild-Ansicht.",
  "install.android.eyebrow": "Android · Chrome",
  "install.android.title": "Ab in deinen {em}.",
  "install.android.titleEm": "Launcher",
  "install.android.lede":
    "Drei Taps und Wattlyzer sitzt in deiner App-Übersicht.",
  "install.android.step1.title": "Öffne das {em}",
  "install.android.step1.em": "Menü",
  "install.android.step1.body":
    "Drei Punkte oben rechts neben der Adressleiste.",
  "install.android.step2.title": "Wähle {em}",
  "install.android.step2.em": "App installieren",
  "install.android.step2.body":
    "Je nach Version manchmal „Zum Startbildschirm zufügen“ genannt.",
  "install.android.step3.title": "Bestätige {em}",
  "install.android.step3.em": "Installieren",
  "install.android.step3.body":
    "Wattlyzer landet in deiner App-Übersicht und auf dem Startbildschirm.",

  // ── Not found ──────────────────────────────────────────────
  "notFound.eyebrow": "404",
  "notFound.title": "Nichts unter {thisSky}.",
  "notFound.titleEm": "diesem Himmel",
  "notFound.body": "Die gesuchte Seite gibt es nicht.",
  "notFound.cta": "Zurück zur Prognose",

  // ── Legal ──────────────────────────────────────────────────
  "legal.eyebrow": "Impressum · § 5 TMG",
  "legal.title": "Impressum und {contact}.",
  "legal.titleEm": "Kontakt",
  "legal.lede": "Die Anbieter- und Kontaktangaben zu Wattlyzer.",
  "legal.operator": "Betreiber",
  "legal.contact": "Kontakt",
  "legal.emailLabel": "E-Mail",
  "legal.phoneLabel": "Telefon",
  "legal.country": "Deutschland",
  "legal.disclaimer": "Haftungsausschluss",
  "legal.disclaimerBody":
    "Diese Anwendung dient ausschließlich zu Informationszwecken. Die Berechnungen und Ergebnisse sind Schätzungen und sollten ohne eigene Prüfung nicht für kritische Entscheidungen genutzt werden.",

  // ── Privacy ────────────────────────────────────────────────
  "privacy.eyebrow": "Datenschutz",
  "privacy.title": "Wie Wattlyzer mit deinen {data} umgeht.",
  "privacy.titleEm": "Daten",
  "privacy.lede":
    "Die App ist auf lokale Verarbeitung und lokales Caching ausgelegt. Diese Seite erklärt, was genutzt wird und warum.",
  "privacy.location.title": "Nutzung von Standortdaten",
  "privacy.location.body":
    "Dein Standort wird ausschließlich für Solarertrags-Schätzungen in deiner Region genutzt. Diese Angabe geht an die Solarprognose-API, damit die Vorhersage die örtlichen Bedingungen abbildet.",
  "privacy.storage.title": "Lokaler Speicher",
  "privacy.storage.body":
    "Deine Einstellungen und zwischengespeicherte API-Antworten liegen lokal im Browser, um die App zu beschleunigen und unnötige API-Aufrufe zu vermeiden.",
  "privacy.sharing.title": "Weitergabe von Daten",
  "privacy.sharing.body":
    "Wir verkaufen oder verbreiten deine persönlichen Daten nicht. Externe Kommunikation beschränkt sich auf die Solar- und Markt-APIs, die für die Empfehlungen nötig sind.",
  "privacy.retention.title": "Speicherdauer",
  "privacy.retention.body":
    "Zwischengespeicherte Daten bleiben auf deinem Gerät und können manuell gelöscht werden. Auf Wattlyzer-Servern werden keine personenbezogenen Daten gespeichert.",
};
