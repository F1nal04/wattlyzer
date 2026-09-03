// English catalog — the source of truth. `MessageKey` is derived from this
// object, so every other locale is a `Record<MessageKey, string>` and a
// forgotten translation is a type error, not a runtime fallback.
//
// `{name}` placeholders are substituted with already-formatted values.
// Templates whose slots carry rich content (bold / italic) are rendered
// through `useRich`, which is why the emphasised words live in their own
// keys — German rarely emphasises the same position as English.
export const en = {
  // ── App shell ──────────────────────────────────────────────
  "app.title": "wattlyzer",
  "app.description":
    "Smart energy scheduling tool that optimizes when to run your appliances based on solar production and electricity prices.",

  // ── Common ─────────────────────────────────────────────────
  "common.back": "Back",
  "common.close": "Close",
  "common.done": "Done",
  "common.continue": "Continue",
  "common.skip": "Skip",
  "common.edit": "Edit",
  "common.add": "Add",
  "common.off": "Off",

  // ── Units ──────────────────────────────────────────────────
  // "h" and "min" are the standard abbreviations in both languages;
  // the display clock stays 24h in both because the design depends on it.
  "unit.hours": "{value}h",
  "unit.minutes": "{value}m",
  "unit.kwh": "{value} kWh",
  "unit.kwp": "{value} kWp",
  "unit.degrees": "{value}°",
  "unit.hourOfDay": "{hour}:00",

  // ── Compass (8-point) ──────────────────────────────────────
  "compass.n": "N",
  "compass.ne": "NE",
  "compass.e": "E",
  "compass.se": "SE",
  "compass.s": "S",
  "compass.sw": "SW",
  "compass.w": "W",
  "compass.nw": "NW",

  // ── Home ───────────────────────────────────────────────────
  "home.bestTimeToday": "Best time today",
  "home.bestTimeTomorrow": "Best time tomorrow",
  "home.startsIn": "Starts in",
  "home.now": "now",
  "home.showStartTime": "Show start time",
  "home.showTimeRemaining": "Show time remaining until start",
  "home.runSummary": "{range} · {hours}h run",
  "home.reason.solar": "Catches the most sun",
  "home.reason.price": "Cheapest window",
  "home.runFor": "Run for",
  "home.marketCoverage": "Prices cover {covered}h of the {window}h window",

  // ── Status messages ────────────────────────────────────────
  "status.nothingToSchedule.title": "Nothing to schedule.",
  "status.nothingToSchedule.body":
    "Wattlyzer needs solar panels or a dynamic tariff. Without either, there is no better window to find.",
  "status.locationNeeded.title": "Location needed.",
  "status.locationNeeded.body":
    "Enable location services in your browser so the forecast can match your roof.",
  "status.findingSky.title": "Finding your sky…",
  "status.findingSky.body":
    "Wattlyzer needs your current position to estimate local solar production.",
  "status.windowTooShort.title": "Window too short.",
  "status.windowTooShort.body":
    "The search window ({window}h) must be at least as long as the run ({duration}h). Widen it in Quick controls.",
  "status.loading.title": "Reading sun and prices…",
  "status.loading.solarOnly": "Fetching the solar forecast.",
  "status.loading.solarAndPrices":
    "Fetching the solar forecast and market prices.",
  "status.forecastUnavailable.title": "Forecast unavailable.",
  "status.forecastUnavailable.body":
    "A data request failed ({error}). Try again in a moment.",
  "status.noWindow.title": "No window found.",
  "status.noWindow.body":
    "Market prices don't cover the search window yet. Widen it in Quick controls or check back later.",
  "status.noSunnyWindow.title": "No sunny window.",
  "status.noSunnyWindow.body":
    "No slot reaches the {minimum} kWh solar minimum. Lower it or widen the search window in Quick controls.",

  // ── Scheduling mode ────────────────────────────────────────
  "mode.combined": "Both",
  "mode.solar": "Solar",
  "mode.price": "Price",
  "mode.unavailable": "{mode}, unavailable",
  "mode.hint.noSignals":
    "Turn on solar panels or a dynamic tariff in Settings.",
  "mode.hint.noSolar": "Turn on solar panels in Settings to use Solar or Both.",
  "mode.hint.noTariff":
    "Turn on a dynamic tariff in Settings to use Both or Price.",

  // ── Quick controls ─────────────────────────────────────────
  "quick.title": "Quick controls",
  "quick.mode": "Mode",
  "quick.minSolar": "Min solar",
  "quick.searchWindow": "Search window",
  "quick.window.endOfDay": "EOD",

  // ── Settings ───────────────────────────────────────────────
  "settings.title": "Settings",
  "settings.subtitle": "YOUR SOLAR SETUP",
  "settings.solar.title": "Solar panels",
  "settings.solar.subtitle.on": "Used to estimate production for your roof.",
  "settings.solar.subtitle.priceOnly": "No solar — price-only.",
  "settings.solar.subtitle.off": "No solar.",
  "settings.solar.peakPower": "Peak power",
  "settings.solar.azimuth": "Azimuth",
  "settings.solar.tilt": "Tilt",
  "settings.solar.status": "Status",
  "settings.tariff.title": "Tariff",
  "settings.tariff.dynamic": "Dynamic tariff",
  "settings.tariff.detail": "Hourly spot price (e.g. Tibber, aWATTar)",
  "settings.shading.title": "Shading",
  "settings.shading.subtitle": "Compensate for trees, neighbours, etc.",
  "settings.appearance.title": "Appearance",
  "settings.appearance.darkMode": "Dark mode",
  "settings.appearance.darkModeDetail":
    "Match the sky to now, not the chosen slot",
  "settings.language.title": "Language",
  "settings.language.detail":
    "Follows your browser until you pick one here.",
  "settings.more.title": "More",
  "settings.more.privacy": "Privacy",
  "settings.more.legal": "Legal",
  "settings.more.github": "GitHub",
  "settings.footer": "v{version} · made for the German market",
  "settings.eyebrow.solar": "Settings · Solar",
  "settings.eyebrow.shading": "Settings · Shading",

  // ── Language switcher ──────────────────────────────────────
  "language.label": "Language",
  "language.select": "Switch the app to {language}",

  // ── Solar panels editor ────────────────────────────────────
  "solar.modal.aria": "Solar panels",
  "solar.modal.eyebrow": "Solar",
  "solar.modal.title": "Your {panels}.",
  "solar.modal.titleEm": "panels",
  "solar.modal.have": "I have solar panels",
  "solar.modal.haveOn": "Forecast uses your roof setup",
  "solar.modal.haveOff": "Skip — Wattlyzer uses spot price only",
  "solar.modal.orientation": "Orientation",
  "solar.modal.tilt": "Roof tilt",
  "solar.modal.size": "System size",
  "solar.modal.sizeHint": "PEAK PRODUCTION UNDER FULL SUN",

  // ── Roof shading editor ────────────────────────────────────
  "shading.modal.aria": "Roof shading",
  "shading.modal.eyebrow": "Shading",
  "shading.modal.title": "Roof {shade}.",
  "shading.modal.titleEm": "shade",
  "shading.modal.hint": "WHEN TREES OR BUILDINGS BLOCK THE LOW SUN",
  "shading.morning.title": "Morning shading",
  "shading.morning.subtitle": "Until trees or buildings block the low sun",
  "shading.morning.hourLabel": "Shade ends",
  "shading.evening.title": "Evening shading",
  "shading.evening.subtitle": "From when trees or buildings block the low sun",
  "shading.evening.hourLabel": "Shade starts",
  "shading.until": "until {hour}",
  "shading.from": "from {hour}",
  "shading.summary": "{morning} · {evening}",

  // ── Onboarding ─────────────────────────────────────────────
  "onboarding.welcome.eyebrow": "Wattlyzer",
  "onboarding.welcome.title": "Run when energy is {clean} and {cheap}.",
  "onboarding.welcome.clean": "clean",
  "onboarding.welcome.cheap": "cheap",
  "onboarding.welcome.lede":
    "Let the sun and the spot price decide when your dishwasher, EV, or heat pump kicks on.",
  "onboarding.welcome.cta": "Get started",
  "onboarding.welcome.duration": "TAKES ABOUT A MINUTE",
  "onboarding.how.title": "How {wattlyzer} works.",
  "onboarding.how.titleEm": "Wattlyzer",
  "onboarding.how.lede": "Two things, one window a day.",
  "onboarding.how.step1.title": "We watch the sun and the price",
  "onboarding.how.step1.body":
    "Solar forecast for your roof + the day-ahead spot price, every hour.",
  "onboarding.how.step2.title": "We find the best window",
  "onboarding.how.step2.body":
    "Greenest, cheapest, or both — your call. Updated through the day.",
  "onboarding.setup.title": "Tell us about your {setup}.",
  "onboarding.setup.titleEm": "setup",
  "onboarding.setup.lede": "Two things and we can forecast your day.",
  "onboarding.setup.solarStatus": "{size} kWp · {direction} · {tilt}° tilt",
  "onboarding.setup.noSolarPriceOnly": "No solar — price-only",
  "onboarding.setup.noSolar": "No solar",
  "onboarding.setup.roofShading": "Roof shading",
  "onboarding.setup.darkModeDetail": "Match the sky to the current time",
  "onboarding.setup.consent":
    "I understand that my {location} and {solarData} are sent to a third party for accurate solar forecasts.",
  "onboarding.setup.consentLocation": "location",
  "onboarding.setup.consentSolarData": "solar panel data",
  "onboarding.eyebrow.solar": "Step 03 · Solar",
  "onboarding.eyebrow.shading": "Step 03 · Shading",
  "onboarding.done.eyebrow": "You're all set",
  "onboarding.done.title": "Your first window is {oneTapAway}.",
  "onboarding.done.titleEm": "one tap away",
  "onboarding.done.lede":
    "Allow location access on the next screen so the forecast matches your roof.",
  "onboarding.done.cta": "Open Wattlyzer",

  // ── Install guidance ───────────────────────────────────────
  "install.ios.eyebrow": "iOS · Safari",
  "install.ios.title": "Add to your {em}.",
  "install.ios.titleEm": "home screen",
  "install.ios.lede":
    "Three taps and Wattlyzer lives next to your other apps.",
  "install.ios.step1.title": "Tap the {em} button",
  "install.ios.step1.em": "Share",
  "install.ios.step1.body":
    "At the bottom of Safari — the square with the up-arrow.",
  "install.ios.step2.title": "{em}",
  "install.ios.step2.em": "Add to Home Screen",
  "install.ios.step2.body":
    "Scroll the share sheet if you don't see it right away.",
  "install.ios.step3.title": "Tap {em}",
  "install.ios.step3.em": "Add",
  "install.ios.step3.body":
    "Wattlyzer lands with your other apps. Open it from there for the fullscreen experience.",
  "install.android.eyebrow": "Android · Chrome",
  "install.android.title": "Send it to your {em}.",
  "install.android.titleEm": "launcher",
  "install.android.lede": "Three taps and Wattlyzer sits in your app drawer.",
  "install.android.step1.title": "Tap the {em}",
  "install.android.step1.em": "menu",
  "install.android.step1.body":
    "Three dots in the top-right corner of the address bar.",
  "install.android.step2.title": "Pick {em}",
  "install.android.step2.em": "Install app",
  "install.android.step2.body":
    "Sometimes labelled “Add to Home screen” depending on the version.",
  "install.android.step3.title": "Confirm {em}",
  "install.android.step3.em": "Install",
  "install.android.step3.body":
    "Wattlyzer lands in your app drawer and on the home screen.",

  // ── Not found ──────────────────────────────────────────────
  "notFound.eyebrow": "404",
  "notFound.title": "Nothing under {thisSky}.",
  "notFound.titleEm": "this sky",
  "notFound.body": "The page you're looking for doesn't exist.",
  "notFound.cta": "Back to the forecast",

  // ── Legal ──────────────────────────────────────────────────
  "legal.eyebrow": "Legal · § 5 TMG",
  "legal.title": "Legal notice and {contact}.",
  "legal.titleEm": "contact",
  "legal.lede": "The core company and contact information for Wattlyzer.",
  "legal.operator": "Operator",
  "legal.contact": "Contact",
  "legal.emailLabel": "E-mail",
  "legal.phoneLabel": "Phone",
  "legal.country": "Germany",
  "legal.disclaimer": "Disclaimer",
  "legal.disclaimerBody":
    "This application is provided for informational purposes only. The calculations and results are estimates and should not be used for critical decision making without proper verification.",

  // ── Privacy ────────────────────────────────────────────────
  "privacy.eyebrow": "Privacy",
  "privacy.title": "How Wattlyzer handles your {data}.",
  "privacy.titleEm": "data",
  "privacy.lede":
    "The app is built around local processing and local caching. This page explains what is used and why.",
  "privacy.location.title": "Location data usage",
  "privacy.location.body":
    "Your location is used only to provide solar energy estimates for your area. This information is sent to the solar estimation API so the forecast can reflect local conditions.",
  "privacy.storage.title": "Local storage",
  "privacy.storage.body":
    "Your settings and cached API responses are stored locally in the browser to improve performance and reduce unnecessary API calls.",
  "privacy.sharing.title": "Data sharing",
  "privacy.sharing.body":
    "We do not sell or distribute your personal data. External communication is limited to the solar and market APIs required to generate recommendations.",
  "privacy.retention.title": "Retention",
  "privacy.retention.body":
    "Cached data remains on your device and can be cleared manually. No personal data is retained on Wattlyzer servers.",
} as const;

export type MessageKey = keyof typeof en;
