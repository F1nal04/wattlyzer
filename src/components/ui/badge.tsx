import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-foreground/5 text-foreground",
        solar:
          "border-transparent bg-solar/15 text-solar-foreground dark:text-solar",
        price:
          "border-transparent bg-price/15 text-price dark:text-price",
        combined:
          "border-transparent bg-combined/15 text-combined dark:text-combined",
        success:
          "border-transparent bg-success/15 text-success dark:text-success",
        warning:
          "border-transparent bg-warning/20 text-warning-foreground dark:bg-warning/25 dark:text-warning",
        destructive:
          "border-transparent bg-destructive/15 text-destructive",
        outline: "border-border text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
