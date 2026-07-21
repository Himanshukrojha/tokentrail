import type { UsageRecord, UsageReport, UsageReportRow } from "./types.js";
import { loadUsageRecords } from "./record.js";

function pickLatest(
  records: UsageRecord[],
  task: string,
  variant: UsageRecord["variant"],
): UsageRecord | undefined {
  return [...records]
    .filter((r) => r.task === task && r.variant === variant)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
}

export function buildUsageReport(
  records: UsageRecord[],
  taskFilter?: string,
): UsageReport {
  const tasks = taskFilter
    ? [taskFilter]
    : [...new Set(records.map((r) => r.task))].sort();

  const rows: UsageReportRow[] = [];

  for (const task of tasks) {
    const baseline = pickLatest(records, task, "text");
    const optimized =
      pickLatest(records, task, "optimized") ??
      pickLatest(records, task, "cache");

    if (!baseline && !optimized) continue;

    const baselineInput = baseline?.usage.inputTokens ?? 0;
    const optimizedInput = optimized?.usage.inputTokens ?? baselineInput;
    const inputSaved = baselineInput - optimizedInput;
    const inputSavedPercent =
      baselineInput > 0 ? inputSaved / baselineInput : 0;

    const baselineCost = baseline?.cost?.totalUsd ?? 0;
    const optimizedCost = optimized?.cost?.totalUsd ?? baselineCost;
    const costSaved = baselineCost - optimizedCost;
    const costSavedPercent =
      baselineCost > 0 ? costSaved / baselineCost : 0;

    rows.push({
      task,
      baseline,
      optimized,
      inputTokensSaved: inputSaved,
      inputTokensSavedPercent: inputSavedPercent,
      costSavedUsd: costSaved,
      costSavedPercent,
      estimatedVsActualBaseline:
        baseline?.estimatedInputTokens !== undefined
          ? baselineInput - baseline.estimatedInputTokens
          : undefined,
      estimatedVsActualOptimized:
        optimized?.projectedInputTokens !== undefined
          ? optimizedInput - optimized.projectedInputTokens
          : undefined,
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    rows,
  };
}

export async function generateUsageReport(
  taskFilter?: string,
  root?: string,
): Promise<UsageReport> {
  const records = await loadUsageRecords(root);
  return buildUsageReport(records, taskFilter);
}
