import type {
  ClaudeProviderConfig,
  ComparisonContext,
  ContextRole,
  ContextSavingsAnalysis,
  FidelityCapacity,
  RulesConfig,
} from "../types.js";
import type { DensityEstimate } from "./density.js";
import { pagesRequiredForPrompt } from "./fidelity-capacity.js";

export function detectContextRole(
  prompt: string,
  classification: ComparisonContext["classification"],
  explicit?: ContextRole,
): ContextRole {
  if (explicit && explicit !== "auto") return explicit;

  const trimmed = prompt.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return "tool_result";
  if (/^Step \d+|^User:|^Assistant:|^Human:/m.test(prompt)) {
    return "conversation_history";
  }
  if (
    classification === "code_heavy" &&
    /system prompt|you are an? /i.test(prompt.slice(0, 200))
  ) {
    return "system";
  }
  if (prompt.length < 2000 && !trimmed.startsWith("{")) return "user_message";
  if (/tool result|stdout|stderr|json output/i.test(prompt.slice(0, 300))) {
    return "tool_result";
  }
  return "system";
}

export function analyzeContextSavings(params: {
  prompt: string;
  context: ComparisonContext;
  density: DensityEstimate;
  fidelityCapacities: FidelityCapacity[];
  providerConfig: ClaudeProviderConfig;
  rules: RulesConfig;
  contextRole?: ContextRole;
}): ContextSavingsAnalysis {
  const {
    prompt,
    context,
    density,
    fidelityCapacities,
    providerConfig,
    rules,
    contextRole: explicitRole,
  } = params;

  const role = detectContextRole(prompt, context.classification, explicitRole);
  const bestImage = context.bestImage;
  const agentPreset = fidelityCapacities.find((c) => c.fidelityTarget === 0.97)
    ?? fidelityCapacities[fidelityCapacities.length - 1];
  const safePreset = fidelityCapacities.find((c) => c.fidelityTarget === 0.98)
    ?? fidelityCapacities[0];

  const effectiveTextTokens = density.effectiveTextTokens;
  const bestVisualTokens = bestImage?.visualTokens ?? effectiveTextTokens;
  const tokenSavingsIfImaged = Math.max(0, effectiveTextTokens - bestVisualTokens);
  const savingsPercent = tokenSavingsIfImaged / Math.max(effectiveTextTokens, 1);

  const pagesRequired = agentPreset
    ? pagesRequiredForPrompt(prompt.length, agentPreset.maxChars)
    : 1;

  const totalVisualIfPaged = agentPreset
    ? agentPreset.visualTokens * pagesRequired
    : bestVisualTokens;

  const pagedSavings = 1 - totalVisualIfPaged / Math.max(effectiveTextTokens, 1);

  const rationale: string[] = [];
  let agentContextRecommendation: ContextSavingsAnalysis["agentContextRecommendation"] =
    "keep_text";

  const ctxThresholds = providerConfig.contextImaging;
  const isLargeDenseContext =
    prompt.length >= (ctxThresholds?.minDenseCharsForContextImage ?? 6000) ||
    effectiveTextTokens >= (ctxThresholds?.minDenseTokensForContextImage ?? 4000);

  // Context-specific decision tree
  if (
    role === "system" &&
    context.reuseCount >= rules.thresholds.minReuseCountForCache &&
    effectiveTextTokens >= rules.thresholds.minTokensForCache &&
    context.cacheBaseline &&
    context.cacheBaseline.savingsVsFullText > 0.1
  ) {
    agentContextRecommendation = "cache_context";
    rationale.push(
      `Static system context reused ${context.reuseCount}x — prompt caching beats imaging (saves ~${Math.round(context.cacheBaseline.savingsVsFullText * 100)}%)`,
    );
  } else if (
    (role === "tool_result" || role === "conversation_history") &&
    isLargeDenseContext &&
    density.density === "dense" &&
    context.fidelityRisk < rules.thresholds.maxFidelityRiskForImage &&
    pagedSavings >= (rules.thresholds.minContextSavingsForImage ?? 0.3)
  ) {
    agentContextRecommendation = "image_context";
    rationale.push(
      `Large dense ${role.replace("_", " ")} (${effectiveTextTokens} effective tokens) — image ${pagesRequired} page(s) saves ~${Math.round(pagedSavings * 100)}% context tokens`,
    );
    if (agentPreset) {
      rationale.push(
        `At 97% fidelity layout (${agentPreset.width}px): ~${agentPreset.maxWords} words/page, ${agentPreset.charsPerVisualToken.toFixed(1)} chars/visual token`,
      );
    }
  } else if (
    role === "conversation_history" &&
    isLargeDenseContext &&
    context.fidelityRisk < rules.thresholds.maxFidelityRiskForHybrid
  ) {
    agentContextRecommendation = "hybrid_context";
    rationale.push(
      `Keep last ${ctxThresholds?.recentTurnsKeepText ?? 2} turns as text; image older history blocks to cut context tokens`,
    );
  } else if (role === "user_message") {
    agentContextRecommendation = "keep_text";
    rationale.push("Current user turn should stay as text for exact intent");
  } else if (
    density.density === "prose" &&
    safePreset &&
    safePreset.savingsVsText < 0
  ) {
    agentContextRecommendation = "keep_text";
    rationale.push(
      `Prose at 98% fidelity (${safePreset.maxWords} words/page) costs more as image than text`,
    );
  } else if (bestImage && savingsPercent >= rules.thresholds.minCostSavingsForImage) {
    agentContextRecommendation = "image_context";
    rationale.push(
      `Best image preset saves ~${Math.round(savingsPercent * 100)}% vs ${density.density} text estimate`,
    );
  } else {
    agentContextRecommendation = "keep_text";
    rationale.push("Context imaging savings do not clear threshold or fidelity risk is too high");
  }

  return {
    role,
    density: density.density,
    effectiveTextTokens,
    proseTokens: density.proseTokens,
    denseTokens: density.denseTokens,
    bestImageVisualTokens: bestVisualTokens,
    tokenSavingsIfImaged,
    savingsPercent,
    pagesRequired,
    totalVisualTokensIfPaged: totalVisualIfPaged,
    pagedSavingsPercent: pagedSavings,
    fidelityCapacities,
    agentContextRecommendation,
    contextRecommendationLabel:
      rules.contextRoleLabels?.[agentContextRecommendation] ??
      agentContextRecommendation,
    rationale,
  };
}
