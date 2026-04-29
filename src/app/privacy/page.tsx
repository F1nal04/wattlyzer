import type { Metadata } from "next";
import {
  Clock3,
  HardDrive,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for wattlyzer - how we handle your data",
  robots: { index: false, follow: false },
};

function PrivacyItem({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="py-6">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Icon className="size-4 text-muted-foreground" />
        {title}
      </div>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">{children}</p>
    </div>
  );
}

export default function Privacy() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-10 pb-20 md:px-6 md:pt-14">
      <header className="space-y-3">
        <div className="text-xs font-medium text-muted-foreground">
          Privacy
        </div>
        <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
          How wattlyzer
          <br />
          <span className="bg-gradient-combined bg-clip-text text-transparent">
            handles your data.
          </span>
        </h1>
        <p className="max-w-xl text-base text-muted-foreground">
          Wattlyzer is built around local processing and local caching. Here is
          exactly what is used and why.
        </p>
      </header>

      <section className="mt-10 divide-y divide-border border-y border-border">
        <PrivacyItem icon={MapPin} title="Location data">
          Your location is used only to provide solar energy estimates for your
          area. It is sent to the solar estimation API so the forecast can
          reflect local conditions.
        </PrivacyItem>
        <PrivacyItem icon={HardDrive} title="Local storage">
          Your settings and cached API responses are stored locally in the
          browser to improve performance and reduce unnecessary API calls.
        </PrivacyItem>
        <PrivacyItem icon={ShieldCheck} title="Data sharing">
          We do not sell or distribute your personal data. External
          communication is limited to the solar and market APIs required for
          recommendations.
        </PrivacyItem>
        <PrivacyItem icon={Clock3} title="Retention">
          Cached data remains on your device and can be cleared manually. No
          personal data is retained on wattlyzer servers.
        </PrivacyItem>
      </section>
    </div>
  );
}
