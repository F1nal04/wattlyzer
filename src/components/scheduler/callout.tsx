"use client";

import { AlertCircle, AlertTriangle, Loader2, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type CalloutTone = "info" | "warning" | "danger" | "loading" | "neutral";

const toneStyles: Record<CalloutTone, { stripe: string; icon: string }> = {
  info: { stripe: "bg-price", icon: "text-price" },
  warning: { stripe: "bg-warning", icon: "text-warning" },
  danger: { stripe: "bg-destructive", icon: "text-destructive" },
  loading: { stripe: "bg-muted-foreground/50", icon: "text-muted-foreground" },
  neutral: { stripe: "bg-muted-foreground/50", icon: "text-muted-foreground" },
};

const toneIcons: Record<
  CalloutTone,
  React.ComponentType<{ className?: string }>
> = {
  info: Sparkles,
  warning: AlertTriangle,
  danger: AlertCircle,
  loading: Loader2,
  neutral: Sparkles,
};

export function Callout({
  tone = "info",
  title,
  children,
}: {
  tone?: CalloutTone;
  title: string;
  children?: ReactNode;
}) {
  const styles = toneStyles[tone];
  const Icon = toneIcons[tone];
  return (
    <div className="relative flex gap-3 py-4 pl-5 pr-2 text-sm">
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-4 bottom-4 w-0.5 rounded-full",
          styles.stripe
        )}
      />
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          styles.icon,
          tone === "loading" && "animate-spin"
        )}
      />
      <div className="space-y-1">
        <div className="font-medium text-foreground">{title}</div>
        {children ? (
          <div className="leading-6 text-muted-foreground">{children}</div>
        ) : null}
      </div>
    </div>
  );
}
