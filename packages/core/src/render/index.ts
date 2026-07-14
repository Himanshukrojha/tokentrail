import {
  estimateImageHeight,
  estimateVisualTokens,
} from "../estimate/visual.js";
import type { ClaudeProviderConfig, ImageVariantResult } from "../types.js";
import { scoreReadability } from "../score/readability.js";
import { layoutPromptPages } from "./layout.js";
import { renderPromptToPng, resolveRenderLayout } from "./png.js";

export type { RenderPngOptions, RenderPngResult, RenderedPngPage } from "./png.js";
export { layoutPromptPages, wrapLine } from "./layout.js";
export { buildPageSvg } from "./svg.js";
export { renderPromptToPng, resolveRenderLayout } from "./png.js";
export { renderPromptToBuffers } from "./buffer.js";
export type { RenderedPngBuffer, RenderBufferOptions } from "./buffer.js";

const DEFAULT_PRESETS = [384, 768, 1024, 1928];

export interface RenderOptions {
  presets?: number[];
  textTokens: number;
  effectiveTextTokens: number;
  providerConfig: ClaudeProviderConfig;
  model: string;
}

export function renderImageVariants(
  prompt: string,
  options: RenderOptions,
): ImageVariantResult[] {
  const presets = options.presets ?? DEFAULT_PRESETS;

  return presets.map((width) => {
    const height = estimateImageHeight(prompt, width);
    const visualTokens = estimateVisualTokens(
      width,
      height,
      options.providerConfig,
      options.model,
    );
    const readability = scoreReadability(prompt, width, height);
    const basis = options.effectiveTextTokens;
    const costSavings = 1 - visualTokens / Math.max(basis, 1);

    return {
      width,
      height,
      visualTokens,
      readability,
      costSavings,
      estimatedTextTokens: options.textTokens,
      effectiveTextTokens: basis,
    };
  });
}

export interface RenderFromRecommendationOptions {
  prompt: string;
  outputDir: string;
  recommendation: string;
  contentDensity: string;
  width?: number;
  filePrefix?: string;
}

export async function renderFromRecommendation(
  options: RenderFromRecommendationOptions,
) {
  const layout = resolveRenderLayout(
    options.recommendation,
    options.contentDensity,
  );

  return renderPromptToPng({
    prompt: options.prompt,
    outputDir: options.outputDir,
    filePrefix: options.filePrefix,
    width: options.width ?? layout.width,
    fontSize: layout.fontSize,
    lineHeight: layout.lineHeight,
    padding: layout.padding,
    maxLinesPerPage: layout.maxLinesPerPage,
  });
}

/** Estimate page count without writing files */
export function estimatePageCount(
  prompt: string,
  recommendation: string,
  contentDensity: string,
): number {
  const layout = resolveRenderLayout(recommendation, contentDensity);
  return layoutPromptPages(prompt, layout).pages.length;
}
