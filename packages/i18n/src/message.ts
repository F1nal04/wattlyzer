// Minimal `{name}` interpolation. Deliberately not a full ICU implementation:
// the catalogs only ever substitute already-formatted values.
export type MessageValues = Record<string, string | number>;

const PLACEHOLDER = /\{(\w+)\}/g;

export function interpolate(template: string, values?: MessageValues): string {
  if (!values) {
    return template;
  }

  return template.replace(PLACEHOLDER, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
}

// The placeholder names a template expects. Used by the catalog tests to
// prove a translation did not drop or invent a substitution.
export function placeholdersIn(template: string): Set<string> {
  return new Set(
    [...template.matchAll(PLACEHOLDER)].map(([, name]) => name),
  );
}

// A message split into literal text and named slots. Lets a caller fill the
// slots with rich content (bold, italic) while the translation keeps control
// of word order — German rarely emphasises the same position as English.
export type TemplatePart =
  | { type: "text"; value: string }
  | { type: "slot"; name: string };

export function splitTemplate(template: string): TemplatePart[] {
  const parts: TemplatePart[] = [];
  let cursor = 0;

  for (const match of template.matchAll(PLACEHOLDER)) {
    const start = match.index;
    if (start > cursor) {
      parts.push({ type: "text", value: template.slice(cursor, start) });
    }
    parts.push({ type: "slot", name: match[1] });
    cursor = start + match[0].length;
  }

  if (cursor < template.length) {
    parts.push({ type: "text", value: template.slice(cursor) });
  }

  return parts;
}
