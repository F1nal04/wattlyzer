import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { richParts } from "@/lib/i18n/rich";

const render = (nodes: ReturnType<typeof richParts>) =>
  renderToStaticMarkup(<>{nodes}</>);

describe("richParts", () => {
  it("keeps literal text and fills slots with the given nodes", () => {
    expect(
      render(richParts("Your {panels}.", { panels: <em>panels</em> })),
    ).toBe("Your <em>panels</em>.");
  });

  it("follows the translation's word order, not the English one", () => {
    // The German title emphasises a different word in a different position.
    expect(
      render(
        richParts("Läuft, wenn Energie {clean} und {cheap} ist.", {
          clean: <em>sauber</em>,
          cheap: <em>günstig</em>,
        }),
      ),
    ).toBe("Läuft, wenn Energie <em>sauber</em> und <em>günstig</em> ist.");
  });

  it("renders a slot that opens the sentence", () => {
    expect(render(richParts("{em} zum Home-Bildschirm", { em: <b>Add</b> }))).toBe(
      "<b>Add</b> zum Home-Bildschirm",
    );
  });

  it("drops a slot with no matching node instead of rendering the braces", () => {
    expect(render(richParts("Tap {missing} now", {}))).toBe("Tap  now");
  });

  it("renders a plain message unchanged", () => {
    expect(render(richParts("Settings", {}))).toBe("Settings");
  });
});
