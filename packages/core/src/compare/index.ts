import type {
  ComparisonContext,
  ComparisonScores,
  ImageVariantResult,
} from "../types.js";

export function pickBestImageVariant(
  variants: ImageVariantResult[],
): ImageVariantResult | undefined {
  if (variants.length === 0) return undefined;

  return [...variants].sort((a, b) => {
    const scoreA = a.costSavings * 0.6 + a.readability * 0.4;
    const scoreB = b.costSavings * 0.6 + b.readability * 0.4;
    return scoreB - scoreA;
  })[0];
}

export function buildComparisonContext(params: {
  prompt: string;
  classification: ComparisonContext["classification"];
  textTokens: number;
  effectiveTextTokens: number;
  contentDensity: ComparisonContext["contentDensity"];
  fidelityRisk: number;
  codeBlockRatio: number;
  imageVariants: ImageVariantResult[];
  cacheBaseline?: ComparisonContext["cacheBaseline"];
  reuseCount: number;
  contextRole?: ComparisonContext["contextRole"];
  contextSavings?: ComparisonContext["contextSavings"];
}): ComparisonContext {
  return {
    ...params,
    bestImage: pickBestImageVariant(params.imageVariants),
  };
}

export function computeComparisonScores(
  context: ComparisonContext,
): ComparisonScores {
  const bestImage = context.bestImage;
  const cost = bestImage ? clamp(bestImage.costSavings, 0, 1) : 0;
  const readability = bestImage?.readability ?? 0;
  const fidelityRisk = context.fidelityRisk;
  const reusability = context.cacheBaseline
    ? clamp(context.cacheBaseline.savingsVsFullText, 0, 1)
    : clamp(context.reuseCount / 10, 0, 1);

  return {
    cost,
    fidelityRisk,
    readability,
    reusability,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
