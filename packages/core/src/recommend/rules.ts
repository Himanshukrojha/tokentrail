import type {
  ComparisonContext,
  RecommendationLabel,
  RecommendationResult,
  RulesConfig,
} from "../types.js";
import { computeComparisonScores } from "../compare/index.js";

export function applyRecommendationRules(
  context: ComparisonContext,
  rules: RulesConfig,
): RecommendationResult {
  const { thresholds, labels } = rules;
  const rulesFired: string[] = [];
  const rationale: string[] = [];

  const bestImage = context.bestImage;
  const cache = context.cacheBaseline;
  const ctx = context.contextSavings;
  const effectiveTokens = context.effectiveTextTokens;

  // R1: Caching wins for large repeated prompts
  if (
    context.reuseCount >= thresholds.minReuseCountForCache &&
    effectiveTokens >= thresholds.minTokensForCache &&
    cache &&
    cache.savingsVsFullText > 0.1
  ) {
    rulesFired.push("R1");
    rationale.push(
      `Prompt reused ${context.reuseCount}x at ${effectiveTokens} effective tokens; cache saves ~${pct(cache.savingsVsFullText)} (R1)`,
    );
    return finalize("caching_preferred", rules, rulesFired, rationale, context);
  }

  // R7: Agent context — large dense tool/history blocks → image context
  if (
    ctx &&
    ctx.agentContextRecommendation === "image_context" &&
    ctx.pagedSavingsPercent >= (thresholds.minContextSavingsForImage ?? 0.3) &&
    context.fidelityRisk < thresholds.maxFidelityRiskForImage
  ) {
    rulesFired.push("R7");
    rationale.push(
      `Agent ${ctx.role.replace("_", " ")} block: image ${ctx.pagesRequired} page(s) saves ~${pct(ctx.pagedSavingsPercent)} context tokens (R7)`,
    );
    if (ctx.rationale[0]) rationale.push(ctx.rationale[0]);
    return finalize("context_image_preferred", rules, rulesFired, rationale, context);
  }

  // R2: Code-heavy prompts stay as text
  if (
    context.classification === "code_heavy" ||
    context.codeBlockRatio > thresholds.codeBlockRatioGate
  ) {
    rulesFired.push("R2");
    rationale.push(
      `Code blocks are ${pct(context.codeBlockRatio)} of prompt; image OCR risk is high (R2)`,
    );
    return finalize("text_preferred", rules, rulesFired, rationale, context);
  }

  // R3: High fidelity risk → text
  if (context.fidelityRisk >= thresholds.hardFidelityGate) {
    rulesFired.push("R3");
    rationale.push(
      `Fidelity risk ${context.fidelityRisk.toFixed(2)} exceeds gate ${thresholds.hardFidelityGate} (R3)`,
    );
    return finalize("text_preferred", rules, rulesFired, rationale, context);
  }

  // R4: Image viable when cheaper and readable
  if (
    bestImage &&
    effectiveTokens >= thresholds.minTokensForImage &&
    bestImage.costSavings >= thresholds.minCostSavingsForImage &&
    bestImage.readability >= thresholds.minReadabilityForImage &&
    context.fidelityRisk < thresholds.maxFidelityRiskForImage
  ) {
    rulesFired.push("R4");
    rationale.push(
      `${bestImage.width}px variant saves ~${pct(bestImage.costSavings)} effective tokens with readability ${bestImage.readability.toFixed(2)} (R4)`,
    );
    return finalize("image_viable", rules, rulesFired, rationale, context);
  }

  // R5: Hybrid for layout-heavy with moderate risk
  if (
    context.classification === "layout_heavy" &&
    bestImage &&
    bestImage.readability >= thresholds.minReadabilityForHybrid &&
    context.fidelityRisk < thresholds.maxFidelityRiskForHybrid
  ) {
    rulesFired.push("R5");
    rationale.push(
      `Layout-heavy prompt; keep instructions as text and move structured blocks to ${bestImage.width}px image (R5)`,
    );
    return finalize("hybrid", rules, rulesFired, rationale, context);
  }

  // R8: Hybrid context — image old history, keep recent turns as text
  if (ctx && ctx.agentContextRecommendation === "hybrid_context") {
    rulesFired.push("R8");
    rationale.push(...ctx.rationale);
    return finalize("hybrid", rules, rulesFired, rationale, context);
  }

  // R6: Safe default
  rulesFired.push("R6");
  if (effectiveTokens < thresholds.minTokensForImage) {
    rationale.push(
      `Prompt is under ${thresholds.minTokensForImage} effective tokens; image conversion overhead not worth it (R6)`,
    );
  } else if (bestImage) {
    rationale.push(
      `No format beat text on cost+fidelity tradeoff (savings ${pct(bestImage.costSavings)}, readability ${bestImage.readability.toFixed(2)}) (R6)`,
    );
  } else {
    rationale.push("Defaulting to text for maximum instruction fidelity (R6)");
  }

  return finalize("text_preferred", rules, rulesFired, rationale, context);
}

function finalize(
  recommendation: RecommendationLabel,
  rules: RulesConfig,
  rulesFired: string[],
  rationale: string[],
  context: ComparisonContext,
): RecommendationResult {
  return {
    recommendation,
    recommendationLabel: rules.labels[recommendation],
    rulesFired,
    rationale,
    scores: computeComparisonScores(context),
  };
}

function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}
