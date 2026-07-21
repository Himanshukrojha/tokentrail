import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { comparePrompt } from "./compare-prompt.js";
import { renderFromRecommendation } from "./render/index.js";
import type {
  CompareInput,
  CompareResult,
  RecommendationLabel,
  RenderOutput,
} from "./types.js";

export type OptimizeAction =
  | "keep_text"
  | "render_image"
  | "cache_hint"
  | "hybrid";

export interface OptimizeInput extends Omit<CompareInput, "renderOut"> {
  /** Output directory (created if missing). Default: ./tokentrail-out */
  outDir?: string;
  /** Render PNGs even when recommendation is text_preferred */
  forceRender?: boolean;
  /** Skip writing agent-context.txt */
  skipAgentContext?: boolean;
}

export interface OptimizeResult {
  outDir: string;
  manifestPath: string;
  agentContextPath?: string;
  action: OptimizeAction;
  compare: CompareResult;
  renderOutput?: RenderOutput;
  originalEffectiveTokens: number;
  projectedEffectiveTokens: number;
  estimatedSavingsPercent: number;
  agentInstructions: string;
}

function resolveAction(recommendation: RecommendationLabel): OptimizeAction {
  switch (recommendation) {
    case "caching_preferred":
      return "cache_hint";
    case "context_image_preferred":
    case "image_viable":
      return "render_image";
    case "hybrid":
      return "hybrid";
    default:
      return "keep_text";
  }
}

function shouldRender(
  action: OptimizeAction,
  forceRender: boolean,
): boolean {
  if (forceRender) return true;
  return action === "render_image" || action === "hybrid";
}

function projectedTokens(
  compare: CompareResult,
  action: OptimizeAction,
  renderOutput?: RenderOutput,
): number {
  switch (action) {
    case "cache_hint":
      return Math.round(
        compare.cacheBaseline?.effectiveCostPerRequest ??
          compare.effectiveTextTokens,
      );
    case "render_image":
    case "hybrid":
      return (
        compare.contextSavings.totalVisualTokensIfPaged ??
        compare.contextSavings.bestImageVisualTokens
      );
    default:
      return compare.effectiveTextTokens;
  }
}

function buildAgentContext(
  action: OptimizeAction,
  compare: CompareResult,
  outDir: string,
  renderOutput?: RenderOutput,
  sourceLabel?: string,
): string {
  const src = sourceLabel ?? "source content";
  const savings = Math.round(
    (1 -
      projectedTokens(compare, action, renderOutput) /
        Math.max(compare.effectiveTextTokens, 1)) *
      100,
  );

  const lines: string[] = [
    "TokenTrail optimized context",
    "===========================",
    `Action: ${action}`,
    `Recommendation: ${compare.recommendation} (${compare.recommendationLabel})`,
    `Original effective tokens: ${compare.effectiveTextTokens}`,
    `Projected effective tokens: ${projectedTokens(compare, action, renderOutput)}`,
    `Estimated savings: ~${Math.max(0, savings)}%`,
    "",
  ];

  if (action === "keep_text") {
    lines.push(
      "Use the original text as-is. Image conversion is not recommended for this block.",
      sourceLabel ? `Source: ${sourceLabel}` : "",
    );
    return lines.filter(Boolean).join("\n");
  }

  if (action === "cache_hint") {
    lines.push(
      "Keep as text but enable prompt caching for this block.",
      `Reuse count baseline: ${compare.cacheBaseline?.reuseCount ?? 1}`,
      `Effective cost per request after cache: ~${compare.cacheBaseline?.effectiveCostPerRequest ?? compare.effectiveTextTokens} tokens`,
      "",
      "Do not duplicate this block in every request — reference a cached system/tool definition.",
    );
    return lines.join("\n");
  }

  if (renderOutput && renderOutput.pages.length > 0) {
    lines.push(
      "Attach the PNG page(s) below as vision input instead of pasting the full text.",
      "Do not read the original text file unless fidelity-critical details are missing.",
      "",
      "PNG pages:",
    );
    for (const page of renderOutput.pages) {
      lines.push(`  - ${page.path}`);
    }
    lines.push("");

    if (action === "hybrid") {
      lines.push(
        "Hybrid: keep short instructions as text; use images for the dense body.",
        "",
      );
    }

    lines.push(
      "Suggested agent prompt:",
      `"The attached image(s) contain ${src}. Summarize the content in 3 bullet points. Do not read any text files."`,
    );
    return lines.join("\n");
  }

  lines.push("No PNG pages were generated.");
  return lines.join("\n");
}

export async function optimizePrompt(
  input: OptimizeInput,
): Promise<OptimizeResult> {
  const outDir = path.resolve(
    input.outDir ?? path.join(process.cwd(), "tokentrail-out"),
  );
  const pagesDir = path.join(outDir, "pages");

  const compare = await comparePrompt({
    ...input,
    renderOut: undefined,
    skipLog: input.skipLog ?? true,
  });

  const action = resolveAction(compare.recommendation);
  let renderOutput: RenderOutput | undefined;

  if (shouldRender(action, input.forceRender ?? false)) {
    await mkdir(pagesDir, { recursive: true });
    const rendered = await renderFromRecommendation({
      prompt: input.prompt,
      outputDir: pagesDir,
      recommendation: compare.recommendation,
      contentDensity: compare.contentDensity,
      width: input.renderWidth,
      filePrefix: "tokentrail",
    });
    renderOutput = rendered;
  }

  const originalEffectiveTokens = compare.effectiveTextTokens;
  const projectedEffectiveTokens = projectedTokens(
    compare,
    action,
    renderOutput,
  );
  const estimatedSavingsPercent =
    1 - projectedEffectiveTokens / Math.max(originalEffectiveTokens, 1);

  const agentInstructions = buildAgentContext(
    action,
    compare,
    outDir,
    renderOutput,
    input.outDir ? path.basename(outDir) : undefined,
  );

  await mkdir(outDir, { recursive: true });

  const manifestPath = path.join(outDir, "manifest.json");
  const manifest = {
    version: "0.1.0",
    timestamp: compare.timestamp,
    runId: compare.runId,
    action,
    recommendation: compare.recommendation,
    recommendationLabel: compare.recommendationLabel,
    classification: compare.classification,
    contentDensity: compare.contentDensity,
    contextRole: compare.contextSavings.role,
    originalEffectiveTokens,
    projectedEffectiveTokens,
    estimatedSavingsPercent,
    rulesFired: compare.rulesFired,
    rationale: compare.rationale,
    renderOutput,
    cacheBaseline: compare.cacheBaseline,
    contextSavings: {
      savingsPercent: compare.contextSavings.savingsPercent,
      pagedSavingsPercent: compare.contextSavings.pagedSavingsPercent,
      pagesRequired: compare.contextSavings.pagesRequired,
      totalVisualTokensIfPaged:
        compare.contextSavings.totalVisualTokensIfPaged,
    },
  };

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  let agentContextPath: string | undefined;
  if (!input.skipAgentContext) {
    agentContextPath = path.join(outDir, "agent-context.txt");
    await writeFile(agentContextPath, `${agentInstructions}\n`, "utf8");
  }

  return {
    outDir,
    manifestPath,
    agentContextPath,
    action,
    compare,
    renderOutput,
    originalEffectiveTokens,
    projectedEffectiveTokens,
    estimatedSavingsPercent,
    agentInstructions,
  };
}
