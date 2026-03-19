import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Legal Notice",
  description: "Legal notice and contact information for wattlyzer",
};

function InfoCard({
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

export default function Legal() {
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
                Legal
              </div>
              <h1 className="mt-4 text-4xl font-bold text-white md:text-5xl">
                Legal notice and contact details.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300 md:text-base">
                The core company and contact information for Wattlyzer in a
                format that stays readable on both desktop and mobile.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/6 px-5 py-3 text-sm font-medium text-white transition-colors hover:border-yellow-300/35 hover:bg-yellow-300/10 hover:text-yellow-100"
            >
              Back to Scheduler
            </Link>
          </div>
        </header>

        <div className="mt-8 space-y-6">
          <section className="rounded-[28px] border border-white/10 bg-gray-950/55 p-5 shadow-[0_24px_80px_-48px_rgba(251,191,36,0.45)] backdrop-blur-md md:p-7">
            <div className="mb-6">
              <div className="text-[11px] uppercase tracking-[0.28em] text-yellow-300/70">
                Required Information
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
                Information according to § 5 TMG
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard title="Operator">
                Leon Bojanowski
                <br />
                Marienstraße 3b
                <br />
                14532 Stahnsdorf
                <br />
                Germany
              </InfoCard>

              <InfoCard title="Contact">
                E-Mail: leongaborbojanowski04@gmail.com
                <br />
                Phone: +49 160 3020390
              </InfoCard>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-gray-950/55 p-5 shadow-[0_24px_80px_-48px_rgba(251,191,36,0.45)] backdrop-blur-md md:p-7">
            <div className="mb-6">
              <div className="text-[11px] uppercase tracking-[0.28em] text-yellow-300/70">
                Disclaimer
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
                Informational use only
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
                The app provides estimates and recommendation support, not
                guaranteed outcomes or professional advice.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm leading-7 text-gray-300">
              This application is provided for informational purposes only. The
              calculations and results are estimates and should not be used for
              critical decision making without proper verification.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
