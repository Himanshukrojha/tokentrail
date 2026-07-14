import { mkdir } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import { layoutPromptPages, type TextLayoutOptions } from "./layout.js";
import { buildPageSvg } from "./svg.js";

export interface RenderPngOptions extends TextLayoutOptions {
  prompt: string;
  outputDir: string;
  filePrefix?: string;
}

export interface RenderedPngPage {
  pageIndex: number;
  path: string;
  width: number;
  height: number;
  charStart: number;
  charEnd: number;
}

export interface RenderPngResult {
  outputDir: string;
  width: number;
  pageCount: number;
  pages: RenderedPngPage[];
}

export async function renderPromptToPng(
  options: RenderPngOptions,
): Promise<RenderPngResult> {
  const layout = layoutPromptPages(options.prompt, options);
  await mkdir(options.outputDir, { recursive: true });

  const prefix = options.filePrefix ?? "prompt";
  const pages: RenderedPngPage[] = [];

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

    const filename = `${prefix}-p${String(page.pageIndex + 1).padStart(3, "0")}.png`;
    const filePath = path.join(options.outputDir, filename);

    await sharp(Buffer.from(svg)).png().toFile(filePath);

    pages.push({
      pageIndex: page.pageIndex,
      path: filePath,
      width: layout.width,
      height: pageHeight,
      charStart: page.charStart,
      charEnd: page.charEnd,
    });
  }

  return {
    outputDir: options.outputDir,
    width: layout.width,
    pageCount: pages.length,
    pages,
  };
}

export function resolveRenderLayout(
  recommendation: string,
  contentDensity: string,
): TextLayoutOptions {
  if (
    recommendation === "context_image_preferred" ||
    contentDensity === "dense"
  ) {
    return {
      width: 1928,
      fontSize: 11,
      lineHeight: 1.2,
      padding: 32,
      maxLinesPerPage: 95,
    };
  }

  if (recommendation === "image_viable" || recommendation === "hybrid") {
    return {
      width: 768,
      fontSize: 14,
      lineHeight: 1.4,
      padding: 32,
      maxLinesPerPage: 42,
    };
  }

  return {
    width: 768,
    fontSize: 14,
    lineHeight: 1.4,
    padding: 32,
    maxLinesPerPage: 42,
  };
}
