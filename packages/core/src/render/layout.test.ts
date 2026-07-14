import { describe, expect, it } from "vitest";

import { layoutPromptPages, wrapLine } from "../render/layout.js";
import { buildPageSvg } from "../render/svg.js";

describe("wrapLine", () => {
  it("splits long lines", () => {
    expect(wrapLine("abcdefghij", 4)).toEqual(["abcd", "efgh", "ij"]);
  });
});

describe("layoutPromptPages", () => {
  it("paginates when maxLinesPerPage is set", () => {
    const layout = layoutPromptPages("a\nb\nc\nd\ne", {
      width: 512,
      fontSize: 16,
      maxLinesPerPage: 2,
    });
    expect(layout.pages).toHaveLength(3);
    expect(layout.pages[0]?.lines).toHaveLength(2);
  });
});

describe("buildPageSvg", () => {
  it("escapes xml entities", () => {
    const svg = buildPageSvg(
      { pageIndex: 0, lines: ["<tag> & \"quote\""], charStart: 0, charEnd: 10 },
      { width: 512, height: 200, fontSize: 14, lineHeight: 1.4, padding: 32 },
    );
    expect(svg).toContain("&lt;tag&gt; &amp; &quot;quote&quot;");
  });
});
