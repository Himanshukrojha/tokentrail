import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { findProjectRoot } from "../config/load.js";
import type { TokenUsage, UsageCost } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface PricingConfig {
  version: string;
  currency: string;
  models: Record<
    string,
    {
      inputPerMTok: number;
      outputPerMTok: number;
      cacheReadPerMTok: number;
      cacheWritePerMTok: number;
    }
  >;
}

export async function loadPricingConfig(
  root?: string,
): Promise<PricingConfig> {
  const resolvedRoot = root ?? findProjectRoot();
  const candidates = [
    path.join(resolvedRoot, "config", "pricing.json"),
    path.resolve(__dirname, "../../../config/pricing.json"),
  ];

  for (const file of candidates) {
    try {
      const raw = await readFile(file, "utf8");
      return JSON.parse(raw) as PricingConfig;
    } catch {
      continue;
    }
  }

  throw new Error(
    "pricing.json not found. Run: tokentrail setup (copies config/pricing.json)",
  );
}

export function computeUsageCost(
  usage: TokenUsage,
  model: string | undefined,
  pricing: PricingConfig,
): UsageCost {
  const rates =
    pricing.models[model ?? ""] ??
    pricing.models.default ??
    Object.values(pricing.models)[0];

  if (!rates) {
    return {
      inputUsd: 0,
      outputUsd: 0,
      cacheReadUsd: 0,
      cacheWriteUsd: 0,
      totalUsd: 0,
    };
  }

  const inputUsd = (usage.inputTokens / 1_000_000) * rates.inputPerMTok;
  const outputUsd = (usage.outputTokens / 1_000_000) * rates.outputPerMTok;
  const cacheReadUsd =
    (usage.cacheReadTokens / 1_000_000) * rates.cacheReadPerMTok;
  const cacheWriteUsd =
    (usage.cacheWriteTokens / 1_000_000) * rates.cacheWritePerMTok;

  return {
    inputUsd,
    outputUsd,
    cacheReadUsd,
    cacheWriteUsd,
    totalUsd: inputUsd + outputUsd + cacheReadUsd + cacheWriteUsd,
  };
}
