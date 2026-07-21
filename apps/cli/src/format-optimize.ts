import type { OptimizeResult } from "@tokentrail/core";

export function formatOptimizeHuman(result: OptimizeResult): string {
  const savings = Math.round(result.estimatedSavingsPercent * 100);
  const lines: string[] = [
    "TokenTrail — Optimize",
    "====================",
    "",
    `Action: ${result.action}`,
    `Recommendation: ${result.compare.recommendationLabel} (${result.compare.recommendation})`,
    `Tokens: ${result.originalEffectiveTokens} → ${result.projectedEffectiveTokens} (${savings}% savings)`,
    `Output: ${result.outDir}`,
    "",
    "Files:",
    `  • ${result.manifestPath}`,
  ];

  if (result.agentContextPath) {
    lines.push(`  • ${result.agentContextPath}`);
  }

  if (result.renderOutput) {
    lines.push(`  • pages/ (${result.renderOutput.pageCount} PNG @ ${result.renderOutput.width}px)`);
    for (const page of result.renderOutput.pages) {
      lines.push(`      ${page.path}`);
    }
  }

  lines.push(
    "",
    "Next step (no MCP — attach PNGs in Cursor Agent):",
    "  1. Open agent-context.txt",
    "  2. Drag PNG pages into cursor-agent (do not paste file paths)",
    "  3. Use the suggested prompt from agent-context.txt",
    "",
    "Measure with:",
    "  cursor-agent -p --output-format json ... | jq '.usage'",
  );

  return lines.join("\n");
}
