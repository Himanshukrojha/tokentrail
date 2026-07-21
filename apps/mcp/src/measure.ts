import { parseUsagePayload, recordUsage } from "@tokentrail/core";
import type { UsageSurface, UsageVariant } from "@tokentrail/core";

export async function recordUsageFromMcp(args: {
  usage?: unknown;
  usage_json?: string;
  task: string;
  variant: UsageVariant;
  surface?: UsageSurface;
  label?: string;
  estimated?: number;
  projected?: number;
}) {
  let payload: unknown = args.usage;
  if (args.usage_json) {
    payload = JSON.parse(args.usage_json) as unknown;
  }

  const usage = parseUsagePayload(payload);
  if (!usage) {
    throw new Error("usage or usage_json with inputTokens/input_tokens is required");
  }

  return recordUsage({
    task: args.task,
    label: args.label ?? `${args.task}-${args.variant}`,
    variant: args.variant,
    surface: args.surface ?? "cursor-ide",
    usage,
    estimatedInputTokens: args.estimated,
    projectedInputTokens: args.projected,
    notes: "recorded via MCP",
  });
}
