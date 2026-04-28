import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, CircleOff } from "lucide-react";
import { FooterLinks } from "@/components/footer-links";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page does not exist or may have been moved.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.18),transparent_28%),linear-gradient(135deg,#050505_0%,#151515_42%,#3b2b0f_100%)] px-4 py-8 md:px-6 md:py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-16 top-24 h-48 w-48 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute bottom-12 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-amber-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-2xl">
        <header className="rounded-[32px] border border-white/12 bg-black/30 p-6 shadow-[0_28px_100px_-56px_rgba(251,191,36,0.6)] backdrop-blur-md md:p-8">
          <div className="flex flex-col gap-6 text-center md:text-left">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-yellow-200">
                <CircleOff className="size-3.5" aria-hidden />
                404
              </div>
              <h1 className="mt-4 text-4xl font-bold text-white md:text-5xl">
                Page not found
              </h1>
              <p className="mt-3 text-sm leading-6 text-gray-300 md:text-base">
                That path does not match anything on Wattlyzer. Check the URL
                or head back to the scheduler.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/6 px-5 py-3 text-center text-sm font-medium text-white whitespace-nowrap transition-colors hover:border-yellow-300/35 hover:bg-yellow-300/10 hover:text-yellow-100"
              >
                <ArrowLeft className="mr-2 size-4" />
                Back to Wattlyzer
              </Link>
            </div>
          </div>
        </header>

        <div className="mt-8">
          <FooterLinks />
        </div>
      </div>
    </div>
  );
}
