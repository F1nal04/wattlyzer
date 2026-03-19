import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for wattlyzer - how we handle your data",
};

function PrivacyCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="mt-3 text-sm leading-7 text-gray-300">{children}</div>
    </section>
  );
}

export default function Privacy() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.18),transparent_28%),linear-gradient(135deg,#050505_0%,#151515_42%,#3b2b0f_100%)] px-4 py-8 md:px-6 md:py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-16 top-24 h-48 w-48 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute bottom-12 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-amber-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl">
        <header className="rounded-[32px] border border-white/12 bg-black/30 p-6 shadow-[0_28px_100px_-56px_rgba(251,191,36,0.6)] backdrop-blur-md md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-yellow-200">
                Privacy
              </div>
              <h1 className="mt-4 text-4xl font-bold text-white md:text-5xl">
                How Wattlyzer handles your data.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300 md:text-base">
                The app is built around local processing and local caching. This
                page explains what is used and why.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/6 px-5 py-3 text-center text-sm font-medium text-white whitespace-nowrap transition-colors hover:border-yellow-300/35 hover:bg-yellow-300/10 hover:text-yellow-100"
            >
              Back to Wattlyzer
            </Link>
          </div>
        </header>

        <section className="mt-8 rounded-[28px] border border-white/10 bg-gray-950/55 p-5 shadow-[0_24px_80px_-48px_rgba(251,191,36,0.45)] backdrop-blur-md md:p-7">
          <div className="mb-6">
            <div className="text-[11px] uppercase tracking-[0.28em] text-yellow-300/70">
              Privacy Overview
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
              Local-first data handling
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
              The app only requests what it needs for solar and price
              estimation, and most persistence stays in the browser.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <PrivacyCard title="Location data usage">
              Your location is used only to provide solar energy estimates for
              your area. This information is sent to the solar estimation API
              so the forecast can reflect local conditions.
            </PrivacyCard>

            <PrivacyCard title="Local storage">
              Your settings and cached API responses are stored locally in the
              browser to improve performance and reduce unnecessary API calls.
            </PrivacyCard>

            <PrivacyCard title="Data sharing">
              We do not sell or distribute your personal data. External
              communication is limited to the solar and market APIs required to
              generate recommendations.
            </PrivacyCard>

            <PrivacyCard title="Retention">
              Cached data remains on your device and can be cleared manually.
              No personal data is retained on Wattlyzer servers.
            </PrivacyCard>
          </div>
        </section>
      </div>
    </div>
  );
}
