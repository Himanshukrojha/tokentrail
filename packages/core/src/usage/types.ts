export type UsageVariant = "text" | "optimized" | "cache" | "unknown";
export type UsageSurface = "cursor-agent" | "cursor-ide" | "claude-cli" | "proxy" | "manual";

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
}

export interface UsageCost {
  inputUsd: number;
  outputUsd: number;
  cacheReadUsd: number;
  cacheWriteUsd: number;
  totalUsd: number;
}

export interface UsageRecord {
  id: string;
  timestamp: string;
  task: string;
  label: string;
  variant: UsageVariant;
  surface: UsageSurface;
  model?: string;
  usage: TokenUsage;
  cost?: UsageCost;
  estimatedInputTokens?: number;
  projectedInputTokens?: number;
  notes?: string;
  sourceFile?: string;
}

export interface UsageReportRow {
  task: string;
  baseline?: UsageRecord;
  optimized?: UsageRecord;
  inputTokensSaved: number;
  inputTokensSavedPercent: number;
  costSavedUsd: number;
  costSavedPercent: number;
  estimatedVsActualBaseline?: number;
  estimatedVsActualOptimized?: number;
}

export interface UsageReport {
  generatedAt: string;
  rows: UsageReportRow[];
}
