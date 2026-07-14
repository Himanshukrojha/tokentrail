import { describe, expect, it } from "vitest";

import { comparePrompt } from "../compare-prompt.js";
import { estimateVisualTokens } from "../estimate/visual.js";
import { loadClaudeProviderConfig } from "../config/load.js";

describe("comparePrompt", () => {
  it("prefers text for code-heavy prompts", async () => {
    const prompt = [
      "You are a coding agent.",
      "```typescript",
      "export function build(a: string, b: number) {",
      "  return `${a}:${b}`;",
      "}",
      "```",
      "Always preserve exact paths like /src/api/handler.ts",
    ].join("\n");

    const result = await comparePrompt({ prompt, skipLog: true });
    expect(result.classification).toBe("code_heavy");
    expect(result.recommendation).toBe("text_preferred");
    expect(result.rulesFired).toContain("R2");
    expect(result.contextSavings).toBeDefined();
  });

  it("prefers caching for large repeated prompts", async () => {
    const prompt = "System instruction block.\n".repeat(400);

    const result = await comparePrompt({
      prompt,
      reuseCount: 10,
      skipLog: true,
    });

    expect(result.effectiveTextTokens).toBeGreaterThan(1024);
    expect(result.recommendation).toBe("caching_preferred");
    expect(result.rulesFired).toContain("R1");
  });

  it("returns image variants for default agent presets", async () => {
    const prompt = "A".repeat(3000);
    const result = await comparePrompt({ prompt, skipLog: true });
    expect(result.imageVariants).toHaveLength(4);
    expect(result.imageVariants.map((v) => v.width)).toEqual([384, 768, 1024, 1928]);
  });

  it("includes fidelity capacity at 98% and 97% zones", async () => {
    const prompt = "Sample agent context.\n".repeat(50);
    const result = await comparePrompt({ prompt, skipLog: true });
    const targets = result.contextSavings.fidelityCapacities.map((c) => c.fidelityTarget);
    expect(targets).toContain(0.98);
    expect(targets).toContain(0.97);
  });

  it("recommends context image for large dense tool results", async () => {
    const payload = JSON.stringify(
      { logs: Array.from({ length: 200 }, (_, i) => `line-${i}: ${"x".repeat(40)}`) },
      null,
      2,
    );

    const result = await comparePrompt({
      prompt: payload,
      contextRole: "tool_result",
      contentDensity: "dense",
      skipLog: true,
    });

    expect(result.contentDensity).toBe("dense");
    expect(result.contextSavings.role).toBe("tool_result");
    expect(result.contextSavings.pagedSavingsPercent).toBeGreaterThan(0.3);
    expect(["context_image_preferred", "image_viable"]).toContain(result.recommendation);
  });
});

describe("estimateVisualTokens (28x28 patches)", () => {
  it("uses patch math for Claude", async () => {
    const config = await loadClaudeProviderConfig();
    expect(estimateVisualTokens(1000, 1000, config, "claude-sonnet-4")).toBe(1296);
    expect(estimateVisualTokens(512, 512, config, "claude-sonnet-4")).toBe(361);
  });
});
