import { readFile } from "node:fs/promises";
import path from "node:path";

import { optimizePrompt, resolveInputPath } from "@tokentrail/core";

export async function runOptimizeFromMcp(args: {
  file_path?: string;
  prompt?: string;
  out_dir?: string;
  context_role?: string;
  density?: string;
  reuse_count?: number;
}) {
  let prompt = args.prompt;
  if (args.file_path) {
    const resolved = resolveInputPath(args.file_path);
    prompt = await readFile(resolved, "utf8");
  }

  if (!prompt) {
    throw new Error("file_path or prompt is required");
  }

  const outDir = args.out_dir
    ? path.isAbsolute(args.out_dir)
      ? args.out_dir
      : path.resolve(process.cwd(), args.out_dir)
    : path.resolve(process.cwd(), "tokentrail-out");

  const result = await optimizePrompt({
    prompt,
    outDir,
    contextRole: args.context_role as never,
    contentDensity: args.density as never,
    reuseCount: args.reuse_count,
    skipLog: true,
  });

  return {
    action: result.action,
    out_dir: result.outDir,
    manifest_path: result.manifestPath,
    agent_context_path: result.agentContextPath,
    original_effective_tokens: result.originalEffectiveTokens,
    projected_effective_tokens: result.projectedEffectiveTokens,
    estimated_savings_percent: result.estimatedSavingsPercent,
    png_pages: result.renderOutput?.pages.map((p) => p.path) ?? [],
    recommendation: result.compare.recommendation,
    next_step:
      "Attach PNG pages in Cursor (drag, do not paste paths). Then record usage with tokentrail_measure_record.",
  };
}
