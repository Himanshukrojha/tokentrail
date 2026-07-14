import { classifyPrompt } from "./classify/index.js";
import {
  loadClaudeProviderConfig,
  loadRulesConfig,
} from "./config/load.js";
import {
  buildComparisonContext,
  computeComparisonScores,
} from "./compare/index.js";
import {
  analyzeContextSavings,
  detectContentDensity,
  estimateCacheBaseline,
  estimateTextTokens,
  estimateFidelityCapacities,
  loadFidelityLayouts,
} from "./estimate/index.js";
import { ingestPrompt } from "./ingest/index.js";
import { createRunId, hashPrompt, writeRunLog } from "./log/index.js";
import { applyRecommendationRules } from "./recommend/index.js";
import { renderFromRecommendation, renderImageVariants } from "./render/index.js";
import { scoreFidelityRisk } from "./score/fidelity.js";
import type { CompareInput, CompareResult } from "./types.js";

const DEFAULT_MODEL = "claude-sonnet-4";

export async function comparePrompt(input: CompareInput): Promise<CompareResult> {
  const started = performance.now();
  const prompt = ingestPrompt(input.prompt);
  const provider = input.provider ?? "claude";
  const model = input.model ?? DEFAULT_MODEL;
  const reuseCount = input.reuseCount ?? 1;

  if (provider !== "claude") {
    throw new Error(`Provider "${provider}" is not supported in V0`);
  }

  const [rules, providerConfig, fidelityLayouts] = await Promise.all([
    loadRulesConfig(),
    loadClaudeProviderConfig(),
    loadFidelityLayouts(),
  ]);

  const { shape, codeBlockRatio } = classifyPrompt(prompt);
  const textTokens = estimateTextTokens(prompt);
  const density = detectContentDensity(
    prompt,
    codeBlockRatio,
    input.contentDensity,
  );
  const fidelityRisk = scoreFidelityRisk(prompt, shape, codeBlockRatio);

  const imageVariants = renderImageVariants(prompt, {
    presets: input.imagePresets,
    textTokens,
    effectiveTextTokens: density.effectiveTextTokens,
    providerConfig,
    model,
  });

  const cacheBaseline = estimateCacheBaseline(
    density.effectiveTextTokens,
    reuseCount,
    providerConfig,
  );

  const fidelityCapacities = estimateFidelityCapacities(
    prompt,
    fidelityLayouts.layouts,
    providerConfig,
    model,
    codeBlockRatio,
  );

  const context = buildComparisonContext({
    prompt,
    classification: shape,
    textTokens,
    effectiveTextTokens: density.effectiveTextTokens,
    contentDensity: density.density,
    fidelityRisk,
    codeBlockRatio,
    imageVariants,
    cacheBaseline,
    reuseCount,
    contextRole: input.contextRole,
  });

  const contextSavings = analyzeContextSavings({
    prompt,
    context,
    density,
    fidelityCapacities,
    providerConfig,
    rules,
    contextRole: input.contextRole,
  });

  context.contextSavings = contextSavings;

  const recommendation = applyRecommendationRules(context, rules);
  const timestamp = new Date().toISOString();

  let renderOutput;
  if (input.renderOut) {
    renderOutput = await renderFromRecommendation({
      prompt,
      outputDir: input.renderOut,
      recommendation: recommendation.recommendation,
      contentDensity: density.density,
      width: input.renderWidth,
      filePrefix: "tokentrail",
    });
  }

  const result: CompareResult = {
    runId: createRunId(),
    timestamp,
    inputHash: hashPrompt(prompt),
    promptLength: prompt.length,
    classification: shape,
    textTokens,
    effectiveTextTokens: density.effectiveTextTokens,
    contentDensity: density.density,
    imageVariants,
    cacheBaseline,
    contextSavings,
    renderOutput,
    scores: recommendation.scores ?? computeComparisonScores(context),
    recommendation: recommendation.recommendation,
    recommendationLabel: recommendation.recommendationLabel,
    rulesFired: recommendation.rulesFired,
    ruleVersion: rules.version,
    rationale: recommendation.rationale,
    provider,
    model,
    latencyMs: Math.round(performance.now() - started),
  };

  if (!input.skipLog) {
    await writeRunLog(result);
  }

  return result;
}
