import { readFile } from "node:fs/promises";
import path from "node:path";

import { findProjectRoot } from "../config/load.js";
import { comparePrompt } from "../compare-prompt.js";
import type { RecommendationLabel } from "../types.js";

export interface BenchmarkEntry {
  id: string;
  category: string;
  promptFile: string;
  reuseCount?: number;
  humanLabel: RecommendationLabel;
  contextRole?: string;
  contentDensity?: string;
  notes?: string;
}

export interface BenchmarkCaseResult {
  id: string;
  category: string;
  humanLabel: RecommendationLabel;
  engineLabel: RecommendationLabel;
  agreed: boolean;
  rulesFired: string[];
  effectiveTextTokens: number;
  notes?: string;
}

export interface BenchmarkReport {
  total: number;
  agreed: number;
  agreementPercent: number;
  byCategory: Record<string, { total: number; agreed: number }>;
  results: BenchmarkCaseResult[];
}

const LABEL_ALIASES: Partial<Record<RecommendationLabel, RecommendationLabel[]>> = {
  image_viable: ["image_viable", "context_image_preferred", "hybrid"],
  hybrid: ["hybrid", "image_viable", "context_image_preferred"],
  context_image_preferred: ["context_image_preferred", "image_viable"],
};

function labelsAgree(
  human: RecommendationLabel,
  engine: RecommendationLabel,
): boolean {
  if (human === engine) return true;
  const aliases = LABEL_ALIASES[human];
  return aliases?.includes(engine) ?? false;
}

export async function loadBenchmarkEntries(
  root = findProjectRoot(),
): Promise<BenchmarkEntry[]> {
  const file = path.join(root, "data", "benchmarks", "prompts.jsonl");
  const raw = await readFile(file, "utf8");

  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as BenchmarkEntry);
}

export async function runBenchmark(
  root = findProjectRoot(),
): Promise<BenchmarkReport> {
  const entries = await loadBenchmarkEntries(root);
  const results: BenchmarkCaseResult[] = [];

  for (const entry of entries) {
    const promptPath = path.join(root, "data", "benchmarks", entry.promptFile);
    const prompt = await readFile(promptPath, "utf8");

    const result = await comparePrompt({
      prompt,
      reuseCount: entry.reuseCount ?? 1,
      contextRole: entry.contextRole as never,
      contentDensity: entry.contentDensity as never,
      skipLog: true,
    });

    const agreed = labelsAgree(entry.humanLabel, result.recommendation);

    results.push({
      id: entry.id,
      category: entry.category,
      humanLabel: entry.humanLabel,
      engineLabel: result.recommendation,
      agreed,
      rulesFired: result.rulesFired,
      effectiveTextTokens: result.effectiveTextTokens,
      notes: entry.notes,
    });
  }

  const agreed = results.filter((r) => r.agreed).length;
  const byCategory: BenchmarkReport["byCategory"] = {};

  for (const row of results) {
    const bucket = byCategory[row.category] ?? { total: 0, agreed: 0 };
    bucket.total += 1;
    if (row.agreed) bucket.agreed += 1;
    byCategory[row.category] = bucket;
  }

  return {
    total: results.length,
    agreed,
    agreementPercent: Math.round((agreed / Math.max(results.length, 1)) * 100),
    byCategory,
    results,
  };
}
