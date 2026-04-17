import type { Metadata } from "next";
import { Building2, Mail, Phone } from "lucide-react";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Legal Notice",
  description: "Legal notice and contact information for wattlyzer",
  robots: { index: false, follow: false },
};

function InfoBlock({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3.5" />
        {title}
      </div>
      <div className="mt-2 text-sm leading-7 text-foreground">{children}</div>
    </div>
  );
}

export default function Legal() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-10 pb-20 md:px-6 md:pt-14">
      <header className="space-y-3">
        <div className="text-xs font-medium text-muted-foreground">Legal</div>
        <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
          Legal notice
          <br />
          <span className="bg-gradient-price bg-clip-text text-transparent">
            and contact details.
          </span>
        </h1>
        <p className="max-w-xl text-base text-muted-foreground">
          Core company and contact information required by § 5 TMG, plus a
          short disclaimer.
        </p>
      </header>

      <section className="mt-10 space-y-2">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Information according to § 5 TMG
        </h2>
        <div className="grid gap-8 border-t border-border pt-6 sm:grid-cols-2">
          <InfoBlock icon={Building2} title="Operator">
            Leon Bojanowski
            <br />
            Marienstraße 3b
            <br />
            14532 Stahnsdorf
            <br />
            Germany
          </InfoBlock>
          <InfoBlock icon={Mail} title="Contact">
            leongaborbojanowski04@gmail.com
            <br />
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Phone className="size-3.5" />
              +49 160 3020390
            </span>
          </InfoBlock>
        </div>
      </section>

      <section className="mt-12 space-y-3">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Informational use only
        </h2>
        <p className="max-w-xl text-sm leading-7 text-muted-foreground">
          This application is provided for informational purposes only. The
          calculations and results are estimates and should not be used for
          critical decision making without proper verification.
        </p>
      </section>
    </div>
  );
}
