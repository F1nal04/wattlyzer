import { Fragment, type ReactNode } from "react";
import { splitTemplate } from "@wattlyzer/i18n";

// Renders a message whose `{slot}` placeholders carry rich content (the
// italic display words, the bold button names in the install guides).
// Keeping the slots in the message means a translation can put the emphasis
// wherever its grammar needs it instead of following the English order.
export function richParts(
  template: string,
  nodes: Record<string, ReactNode>,
): ReactNode[] {
  return splitTemplate(template).map((part, index) =>
    part.type === "text" ? (
      <Fragment key={index}>{part.value}</Fragment>
    ) : (
      <Fragment key={index}>{nodes[part.name]}</Fragment>
    ),
  );
}

// The display italic used inside translated headlines, normally as the node
// filling a `{slot}` above.
export function Em({
  children,
  opacity,
}: {
  children: ReactNode;
  opacity?: number;
}) {
  return (
    <span style={{ fontStyle: "italic", fontWeight: 300, opacity }}>
      {children}
    </span>
  );
}
