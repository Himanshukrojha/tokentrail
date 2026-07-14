import type { TextLayoutResult, TextPage } from "./layout.js";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildPageSvg(
  page: TextPage,
  layout: Pick<
    TextLayoutResult,
    "width" | "height" | "fontSize" | "lineHeight" | "padding"
  >,
): string {
  const linePx = layout.fontSize * layout.lineHeight;
  const textY = layout.padding + layout.fontSize;

  const tspans = page.lines
    .map((line, index) => {
      if (index === 0) {
        return `<tspan x="${layout.padding}" y="${textY}">${escapeXml(line || " ")}</tspan>`;
      }
      return `<tspan x="${layout.padding}" dy="${linePx}">${escapeXml(line || " ")}</tspan>`;
    })
    .join("\n    ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <text font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
        font-size="${layout.fontSize}"
        fill="#111111"
        xml:space="preserve">
    ${tspans}
  </text>
</svg>`;
}
