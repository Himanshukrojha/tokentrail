import { comparePrompt } from "../compare-prompt.js";
import { loadClaudeProviderConfig } from "../config/load.js";
import {
  inferMessageContextRole,
  isRecentTurn,
  mapToAction,
  projectTokens,
} from "./split-request.js";
import type {
  AgentBlockAnalysis,
  AgentOptimizationPlan,
  AnalyzeAgentRequestInput,
} from "./types.js";

export async function analyzeAgentRequest(
  input: AnalyzeAgentRequestInput,
): Promise<AgentOptimizationPlan> {
  const providerConfig = await loadClaudeProviderConfig();
  const recentKeep = input.recentTurnsKeepText
    ?? providerConfig.contextImaging?.recentTurnsKeepText
    ?? 2;

  const messages = input.messages;
  const blocks: AgentBlockAnalysis[] = [];

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    if (!message) continue;

    const contextRole = inferMessageContextRole(message, i, messages.length);
    const recent = isRecentTurn(i, messages.length, recentKeep);

    const result = await comparePrompt({
      prompt: message.content,
      reuseCount: input.reuseCount ?? 1,
      model: input.model,
      provider: input.provider ?? "claude",
      contextRole,
      skipLog: input.skipLog ?? true,
    });

    const bestVisual = result.imageVariants.at(-1)?.visualTokens
      ?? result.effectiveTextTokens;
    const cacheEffective = result.cacheBaseline?.effectiveCostPerRequest;

    const action = mapToAction(
      result.recommendation,
      result.contextSavings.agentContextRecommendation,
      recent && contextRole === "user_message",
    );

    const projectedTokens = projectTokens(
      result.effectiveTextTokens,
      action,
      bestVisual,
      cacheEffective,
    );

    blocks.push({
      index: i,
      role: message.role,
      contextRole,
      charCount: message.content.length,
      effectiveTextTokens: result.effectiveTextTokens,
      recommendation: result.recommendation,
      agentContextRecommendation:
        result.contextSavings.agentContextRecommendation,
      action,
      rulesFired: result.rulesFired,
      rationale: result.rationale,
      projectedTokens,
    });
  }

  const originalEffectiveTokens = blocks.reduce(
    (sum, b) => sum + b.effectiveTextTokens,
    0,
  );
  const projectedEffectiveTokens = blocks.reduce(
    (sum, b) => sum + b.projectedTokens,
    0,
  );

  return {
    blockCount: blocks.length,
    messages: blocks,
    totals: {
      originalEffectiveTokens,
      projectedEffectiveTokens,
      estimatedSavingsPercent:
        1 - projectedEffectiveTokens / Math.max(originalEffectiveTokens, 1),
    },
  };
}
