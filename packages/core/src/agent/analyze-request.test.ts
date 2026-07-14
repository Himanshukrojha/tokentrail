import { describe, expect, it } from "vitest";

import { analyzeAgentRequest } from "../agent/analyze-request.js";
import { resolveInputPath } from "../paths/resolve.js";
import { findProjectRoot } from "../config/load.js";
import path from "node:path";

describe("resolveInputPath", () => {
  it("resolves sample aliases from repo root", () => {
    const root = findProjectRoot();
    const resolved = resolveInputPath("layout-heavy", root);
    expect(resolved).toBe(
      path.join(root, "data/benchmarks/samples/layout-heavy-001.txt"),
    );
  });
});

describe("analyzeAgentRequest", () => {
  it("returns a plan with per-block actions", async () => {
    const plan = await analyzeAgentRequest({
      messages: [
        { role: "system", content: "System policy ".repeat(300) },
        { role: "user", content: "fix tests" },
        {
          role: "user",
          content: JSON.stringify({ logs: Array.from({ length: 100 }, (_, i) => `line ${i}`) }),
        },
      ],
      reuseCount: 10,
      skipLog: true,
    });

    expect(plan.blockCount).toBe(3);
    expect(plan.messages[2]?.contextRole).toBe("tool_result");
    expect(plan.totals.originalEffectiveTokens).toBeGreaterThan(0);
  });
});
