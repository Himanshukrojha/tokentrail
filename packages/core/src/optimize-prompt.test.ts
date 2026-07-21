import { mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { optimizePrompt } from "./optimize-prompt.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const samples = path.resolve(__dirname, "../../../data/benchmarks/samples");

describe("optimizePrompt", () => {
  const outRoot = path.join(__dirname, "../../../.tmp-optimize-test");

  it("keeps text for small tool result", async () => {
    const outDir = path.join(outRoot, "small-tool");
    await rm(outDir, { recursive: true, force: true });

    const prompt = await readFile(
      path.join(samples, "tool-result-001.json"),
      "utf8",
    );

    const result = await optimizePrompt({
      prompt,
      outDir,
      contextRole: "tool_result",
      contentDensity: "dense",
    });

    expect(result.action).toBe("keep_text");
    expect(result.renderOutput).toBeUndefined();
    expect(result.projectedEffectiveTokens).toBe(result.originalEffectiveTokens);

    const manifest = JSON.parse(
      await readFile(result.manifestPath, "utf8"),
    ) as { action: string };
    expect(manifest.action).toBe("keep_text");
  });

  it("renders PNGs for large dense logs", async () => {
    const outDir = path.join(outRoot, "large-log");
    await rm(outDir, { recursive: true, force: true });
    await mkdir(outDir, { recursive: true });

    const prompt = "ERROR timeout\n".repeat(800);

    const result = await optimizePrompt({
      prompt,
      outDir,
      contextRole: "tool_result",
      contentDensity: "dense",
    });

    expect(["render_image", "hybrid"]).toContain(result.action);
    expect(result.renderOutput?.pageCount).toBeGreaterThan(0);
    expect(result.projectedEffectiveTokens).toBeLessThan(
      result.originalEffectiveTokens,
    );
    expect(result.agentContextPath).toBeDefined();

    const agentText = await readFile(result.agentContextPath!, "utf8");
    expect(agentText).toContain("Attach the PNG page(s)");
  });

  it("hints cache for repeated system prompt", async () => {
    const outDir = path.join(outRoot, "repeated-system");
    await rm(outDir, { recursive: true, force: true });

    const prompt = await readFile(
      path.join(samples, "repeated-system-001.txt"),
      "utf8",
    );

    const result = await optimizePrompt({
      prompt,
      outDir,
      contextRole: "system",
      reuseCount: 10,
    });

    expect(result.action).toBe("cache_hint");
    expect(result.projectedEffectiveTokens).toBeLessThan(
      result.originalEffectiveTokens,
    );
  });
});
