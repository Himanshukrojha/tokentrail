import { randomUUID } from "node:crypto";
import { appendFile, mkdir, readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { getRunsDir } from "../config/load.js";
import { computeUsageCost, loadPricingConfig } from "./cost.js";
import { parseUsagePayload } from "./parse.js";
import type {
  TokenUsage,
  UsageRecord,
  UsageSurface,
  UsageVariant,
} from "./types.js";

export function getUsageDir(root?: string): string {
  return path.join(getRunsDir(root), "usage");
}

export interface RecordUsageInput {
  task: string;
  label: string;
  variant: UsageVariant;
  surface?: UsageSurface;
  model?: string;
  usage: TokenUsage;
  estimatedInputTokens?: number;
  projectedInputTokens?: number;
  notes?: string;
  sourceFile?: string;
  skipCost?: boolean;
}

export async function recordUsage(
  input: RecordUsageInput,
  root?: string,
): Promise<UsageRecord> {
  const usageDir = getUsageDir(root);
  await mkdir(usageDir, { recursive: true });

  let cost = undefined;
  if (!input.skipCost) {
    const pricing = await loadPricingConfig(root);
    cost = computeUsageCost(input.usage, input.model, pricing);
  }

  const record: UsageRecord = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    task: input.task,
    label: input.label,
    variant: input.variant,
    surface: input.surface ?? "manual",
    model: input.model,
    usage: input.usage,
    cost,
    estimatedInputTokens: input.estimatedInputTokens,
    projectedInputTokens: input.projectedInputTokens,
    notes: input.notes,
    sourceFile: input.sourceFile,
  };

  const date = record.timestamp.slice(0, 10);
  const filePath = path.join(usageDir, `${date}.jsonl`);
  await appendFile(filePath, `${JSON.stringify(record)}\n`, "utf8");
  return record;
}

export async function recordUsageFromJsonFile(
  filePath: string,
  options: Omit<RecordUsageInput, "usage">,
  root?: string,
): Promise<UsageRecord> {
  const raw = await readFile(filePath, "utf8");
  const payload = JSON.parse(raw) as unknown;
  const usage = parseUsagePayload(payload);
  if (!usage) {
    throw new Error(
      `No usage block found in ${filePath}. Expected .usage with inputTokens or input_tokens.`,
    );
  }

  return recordUsage(
    {
      ...options,
      usage,
      sourceFile: filePath,
    },
    root,
  );
}

export async function loadUsageRecords(root?: string): Promise<UsageRecord[]> {
  const usageDir = getUsageDir(root);
  let files: string[] = [];
  try {
    files = (await readdir(usageDir)).filter((f) => f.endsWith(".jsonl"));
  } catch {
    return [];
  }

  const records: UsageRecord[] = [];
  for (const file of files.sort()) {
    const content = await readFile(path.join(usageDir, file), "utf8");
    for (const line of content.split("\n")) {
      if (!line.trim()) continue;
      records.push(JSON.parse(line) as UsageRecord);
    }
  }
  return records;
}
