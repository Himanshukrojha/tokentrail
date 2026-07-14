import type { CacheBaseline, ClaudeProviderConfig } from "../types.js";

export function estimateCacheBaseline(
  textTokens: number,
  reuseCount: number,
  config: ClaudeProviderConfig,
): CacheBaseline | undefined {
  if (reuseCount < 2) return undefined;

  const discount = config.cache.readDiscount;
  const writeCost = textTokens * config.cache.writeMultiplier;
  const readCost = textTokens * (1 - discount);

  const totalCost = writeCost + readCost * (reuseCount - 1);
  const effectiveCostPerRequest = totalCost / reuseCount;
  const fullTextCost = textTokens;
  const savingsVsFullText = 1 - effectiveCostPerRequest / fullTextCost;

  return {
    reuseCount,
    effectiveCostPerRequest,
    savingsVsFullText,
    discountApplied: discount,
  };
}
