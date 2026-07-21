import type { UsageReport } from "@tokentrail/core";

export function formatUsageReport(report: UsageReport): string {
  const lines: string[] = [
    "TokenTrail — Usage Report (actual billed tokens)",
    "===============================================",
    "",
  ];

  if (report.rows.length === 0) {
    lines.push("No usage records found. Record runs with:");
    lines.push("  tokentrail measure record <cursor-agent.json> --task NAME --variant text");
    lines.push("  tokentrail measure record <cursor-agent.json> --task NAME --variant optimized");
    return lines.join("\n");
  }

  for (const row of report.rows) {
    lines.push(`Task: ${row.task}`);
    lines.push("");

    if (row.baseline) {
      lines.push(
        `  Baseline (${row.baseline.variant}): input=${row.baseline.usage.inputTokens} output=${row.baseline.usage.outputTokens} cost=$${row.baseline.cost?.totalUsd.toFixed(4) ?? "?"}`,
      );
    }
    if (row.optimized) {
      lines.push(
        `  Optimized (${row.optimized.variant}): input=${row.optimized.usage.inputTokens} output=${row.optimized.usage.outputTokens} cost=$${row.optimized.cost?.totalUsd.toFixed(4) ?? "?"}`,
      );
    }

    lines.push(
      `  Saved: ${row.inputTokensSaved} input tokens (${Math.round(row.inputTokensSavedPercent * 100)}%)`,
    );
    lines.push(
      `  Cost saved: $${row.costSavedUsd.toFixed(4)} (${Math.round(row.costSavedPercent * 100)}%)`,
    );

    if (row.estimatedVsActualBaseline !== undefined) {
      lines.push(
        `  Estimate delta (baseline): actual - estimated = ${row.estimatedVsActualBaseline}`,
      );
    }
    if (row.estimatedVsActualOptimized !== undefined) {
      lines.push(
        `  Estimate delta (optimized): actual - projected = ${row.estimatedVsActualOptimized}`,
      );
    }

    lines.push("");
  }

  return lines.join("\n");
}
