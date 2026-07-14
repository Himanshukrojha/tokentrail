import type { ClaudeProviderConfig } from "../types.js";

export interface ScaledDimensions {
  width: number;
  height: number;
  scaled: boolean;
  scaleFactor: number;
}

export function getResolutionTier(
  model: string,
  config: ClaudeProviderConfig,
): ClaudeProviderConfig["resolutionTiers"]["standard"] & { tier: "standard" | "high" } {
  const modelConfig = config.models[model] ?? Object.values(config.models)[0];
  if (!modelConfig) {
    throw new Error(`No model config found for ${model}`);
  }

  const tier = modelConfig.resolutionTier;
  return { tier, ...config.resolutionTiers[tier] };
}

/** Downscale dimensions to fit provider long-edge cap before patch counting. */
export function scaleToProviderLimits(
  width: number,
  height: number,
  config: ClaudeProviderConfig,
  model: string,
): ScaledDimensions {
  const tier = getResolutionTier(model, config);
  const longEdge = Math.max(width, height);

  if (longEdge <= tier.maxLongEdge) {
    return { width, height, scaled: false, scaleFactor: 1 };
  }

  const scaleFactor = tier.maxLongEdge / longEdge;
  return {
    width: Math.ceil(width * scaleFactor),
    height: Math.ceil(height * scaleFactor),
    scaled: true,
    scaleFactor,
  };
}

/**
 * Claude visual tokens: ceil(w/28) × ceil(h/28), capped by tier max.
 * @see https://platform.claude.com/docs/en/build-with-claude/vision
 */
export function estimateVisualTokens(
  width: number,
  height: number,
  config: ClaudeProviderConfig,
  model: string,
): number {
  const patchSize = config.patchSize;
  const tier = getResolutionTier(model, config);
  const scaled = scaleToProviderLimits(width, height, config, model);

  const rawTokens =
    Math.ceil(scaled.width / patchSize) * Math.ceil(scaled.height / patchSize);

  return Math.min(rawTokens, tier.maxVisualTokens);
}

export function estimateImageHeight(
  prompt: string,
  width: number,
  fontSize = 14,
  lineHeight = 1.4,
  padding = 32,
): number {
  const avgCharWidth = fontSize * 0.55;
  const charsPerLine = Math.max(1, Math.floor((width - padding) / avgCharWidth));
  const lines = prompt.split("\n");
  let totalLines = 0;

  for (const line of lines) {
    totalLines += Math.max(1, Math.ceil(line.length / charsPerLine));
  }

  return Math.ceil(totalLines * fontSize * lineHeight + padding);
}

export function estimateLayoutHeight(
  lines: number,
  fontSize: number,
  lineHeight: number,
  padding = 32,
): number {
  return Math.ceil(lines * fontSize * lineHeight + padding);
}
