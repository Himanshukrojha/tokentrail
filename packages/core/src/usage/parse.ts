import type { TokenUsage } from "./types.js";

/** Normalize cursor-agent, Anthropic API, or proxy usage shapes. */
export function parseUsagePayload(payload: unknown): TokenUsage | null {
  if (!payload || typeof payload !== "object") return null;

  const obj = payload as Record<string, unknown>;

  const usage =
    (obj.usage as Record<string, unknown> | undefined) ??
    (obj as Record<string, unknown>);

  if (!usage || typeof usage !== "object") return null;

  const input =
    num(usage.inputTokens) ??
    num(usage.input_tokens) ??
    num(usage.prompt_tokens);

  const output =
    num(usage.outputTokens) ??
    num(usage.output_tokens) ??
    num(usage.completion_tokens);

  if (input === undefined && output === undefined) return null;

  return {
    inputTokens: input ?? 0,
    outputTokens: output ?? 0,
    cacheReadTokens:
      num(usage.cacheReadTokens) ??
      num(usage.cache_read_input_tokens) ??
      0,
    cacheWriteTokens:
      num(usage.cacheWriteTokens) ??
      num(usage.cache_creation_input_tokens) ??
      0,
  };
}

function num(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
