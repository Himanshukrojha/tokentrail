import sharp from "sharp";

import { layoutPromptPages, type TextLayoutOptions } from "./layout.js";
import { buildPageSvg } from "./svg.js";

export interface RenderedPngBuffer {
  pageIndex: number;
  base64: string;
  mediaType: "image/png";
  width: number;
  height: number;
  charStart: number;
  charEnd: number;
}

export interface RenderBufferOptions extends TextLayoutOptions {
  prompt: string;
}

export async function renderPromptToBuffers(
  options: RenderBufferOptions,
): Promise<RenderedPngBuffer[]> {
  const layout = layoutPromptPages(options.prompt, options);
  const buffers: RenderedPngBuffer[] = [];

  for (const page of layout.pages) {
    const pageHeight = Math.ceil(
      page.lines.length * layout.fontSize * layout.lineHeight + layout.padding * 2,
    );
    const svg = buildPageSvg(page, {
      width: layout.width,
      height: pageHeight,
      fontSize: layout.fontSize,
      lineHeight: layout.lineHeight,
      padding: layout.padding,
    });

    const png = await sharp(Buffer.from(svg)).png().toBuffer();

    buffers.push({
      pageIndex: page.pageIndex,
      base64: png.toString("base64"),
      mediaType: "image/png",
      width: layout.width,
      height: pageHeight,
      charStart: page.charStart,
      charEnd: page.charEnd,
    });
  }

  return buffers;
}
