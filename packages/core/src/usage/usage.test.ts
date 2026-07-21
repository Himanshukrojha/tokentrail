import { describe, expect, it } from "vitest";

import { computeUsageCost } from "./cost.js";
import { parseUsagePayload } from "./parse.js";
import { buildUsageReport } from "./report.js";
import type { UsageRecord } from "./types.js";

describe("parseUsagePayload", () => {
  it("parses cursor-agent usage", () => {
    const usage = parseUsagePayload({
      usage: {
        inputTokens: 16939,
        outputTokens: 1691,
        cacheReadTokens: 63233,
        cacheWriteTokens: 0,
      },
    });
    expect(usage?.inputTokens).toBe(16939);
  });

  it("parses anthropic api usage", () => {
    const usage = parseUsagePayload({
      usage: {
        input_tokens: 100,
        output_tokens: 50,
        cache_read_input_tokens: 200,
      },
    });
    expect(usage?.inputTokens).toBe(100);
    expect(usage?.cacheReadTokens).toBe(200);
  });
});

describe("computeUsageCost", () => {
  it("computes usd from token counts", () => {
    const cost = computeUsageCost(
      {
        inputTokens: 1_000_000,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
      },
      "claude-sonnet-4",
      {
        version: "0.1.0",
        currency: "USD",
        models: {
          "claude-sonnet-4": {
            inputPerMTok: 3,
            outputPerMTok: 15,
            cacheReadPerMTok: 0.3,
            cacheWritePerMTok: 3.75,
          },
        },
      },
    );
    expect(cost.totalUsd).toBeCloseTo(3, 2);
  });
});

describe("buildUsageReport", () => {
  it("compares baseline vs optimized", () => {
    const records: UsageRecord[] = [
      {
        id: "1",
        timestamp: "2026-07-17T10:00:00.000Z",
        task: "large-log",
        label: "text",
        variant: "text",
        surface: "cursor-agent",
        usage: {
          inputTokens: 16939,
          outputTokens: 100,
          cacheReadTokens: 0,
          cacheWriteTokens: 0,
        },
        cost: {
          inputUsd: 0.05,
          outputUsd: 0.001,
          cacheReadUsd: 0,
          cacheWriteUsd: 0,
          totalUsd: 0.051,
        },
      },
      {
        id: "2",
        timestamp: "2026-07-17T11:00:00.000Z",
        task: "large-log",
        label: "optimized",
        variant: "optimized",
        surface: "cursor-agent",
        usage: {
          inputTokens: 9000,
          outputTokens: 100,
          cacheReadTokens: 0,
          cacheWriteTokens: 0,
        },
        projectedInputTokens: 3136,
        cost: {
          inputUsd: 0.027,
          outputUsd: 0.001,
          cacheReadUsd: 0,
          cacheWriteUsd: 0,
          totalUsd: 0.028,
        },
      },
    ];

    const report = buildUsageReport(records, "large-log");
    expect(report.rows[0]?.inputTokensSaved).toBe(7939);
    expect(report.rows[0]?.costSavedUsd).toBeCloseTo(0.023, 2);
  });
});
