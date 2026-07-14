import type { CompareResult } from "@tokentrail/core";

export function formatHuman(result: CompareResult): string {
  const lines: string[] = [
    "TokenTrail — Prompt Format Comparison",
    "=====================================",
    "",
    `Recommendation: ${result.recommendationLabel} (${result.recommendation})`,
    `Classification: ${result.classification}`,
    `Text tokens:    ${result.textTokens} (prose) / ${result.effectiveTextTokens} effective (${result.contentDensity})`,
    `Provider/model: ${result.provider} / ${result.model}`,
    `Rules fired:    ${result.rulesFired.join(", ")}`,
    `Latency:        ${result.latencyMs}ms`,
    "",
    "Rationale:",
    ...result.rationale.map((r) => `  • ${r}`),
    "",
    "Context savings (agent workflows):",
    `  • Role: ${result.contextSavings.role}`,
    `  • Context recommendation: ${result.contextSavings.contextRecommendationLabel}`,
    `  • Savings if imaged: ${Math.round(result.contextSavings.savingsPercent * 100)}% (${result.contextSavings.tokenSavingsIfImaged} tokens)`,
    `  • Paged (${result.contextSavings.pagesRequired} pages): ${Math.round(result.contextSavings.pagedSavingsPercent * 100)}% context token savings`,
    "",
    "Fidelity capacity:",
  ];

  for (const cap of result.contextSavings.fidelityCapacities) {
    lines.push(
      `  • ${cap.label}: ~${cap.maxWords} words/page | ${cap.visualTokens} visual tokens | ${cap.charsPerVisualToken.toFixed(1)} chars/visual | text savings ${Math.round(cap.savingsVsText * 100)}%`,
    );
  }

  lines.push("", "Image variants:");

  for (const variant of result.imageVariants) {
    lines.push(
      `  • ${variant.width}x${variant.height}px → ${variant.visualTokens} visual tokens | readability ${variant.readability.toFixed(2)} | savings ${Math.round(variant.costSavings * 100)}%`,
    );
  }

  if (result.cacheBaseline) {
    lines.push(
      "",
      "Cache baseline:",
      `  • Reuse count: ${result.cacheBaseline.reuseCount}`,
      `  • Effective cost/request: ${Math.round(result.cacheBaseline.effectiveCostPerRequest)} tokens`,
      `  • Savings vs full text: ${Math.round(result.cacheBaseline.savingsVsFullText * 100)}%`,
    );
  }

  if (result.contextSavings.rationale.length > 0) {
    lines.push("", "Context rationale:");
    for (const r of result.contextSavings.rationale) {
      lines.push(`  • ${r}`);
    }
  }

  if (result.renderOutput) {
    lines.push(
      "",
      "Rendered PNGs:",
      `  • Directory: ${result.renderOutput.outputDir}`,
      `  • Pages: ${result.renderOutput.pageCount} @ ${result.renderOutput.width}px`,
    );
    for (const page of result.renderOutput.pages) {
      lines.push(`  • ${page.path} (${page.width}x${page.height})`);
    }
  }

  lines.push("", `Run ID: ${result.runId}`);

  return lines.join("\n");
}
