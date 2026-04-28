import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page does not exist or may have been moved.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-10 pb-20 md:px-6 md:pt-14">
      <header className="space-y-3">
        <div className="text-xs font-medium text-muted-foreground">404</div>
        <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
          Page not found
          <br />
          <span className="bg-gradient-price bg-clip-text text-transparent">
            Nothing lives here.
          </span>
        </h1>
        <p className="max-w-xl text-base text-muted-foreground md:text-lg">
          That URL does not match anything on wattlyzer. Check for typos or
          head back to the scheduler.
        </p>
      </header>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild variant="default" size="lg">
          <Link href="/">
            <ArrowLeft className="size-4" aria-hidden />
            Back to scheduler
          </Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href="/settings">Settings</Link>
        </Button>
      </div>
    </div>
  );
}
