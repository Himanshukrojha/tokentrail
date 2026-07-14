import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { findProjectRoot } from "../config/load.js";
import { renderPromptToPng } from "../render/png.js";

describe("renderPromptToPng", () => {
  it("writes png pages to disk", async () => {
    const root = findProjectRoot();
    const outDir = path.join(root, "data", "runs", "test-render");

    await rm(outDir, { recursive: true, force: true });
    await mkdir(outDir, { recursive: true });

    const result = await renderPromptToPng({
      prompt: "Hello TokenTrail\nLine two\nLine three",
      outputDir: outDir,
      width: 512,
      fontSize: 16,
      filePrefix: "test",
      maxLinesPerPage: 2,
    });

    expect(result.pageCount).toBe(2);
    expect(result.pages[0]?.path).toContain("test-p001.png");
    expect(result.pages[1]?.path).toContain("test-p002.png");
  });
});
