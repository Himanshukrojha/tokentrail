import { parseUsagePayload, recordUsage } from "@tokentrail/core";

export async function logProxyUsage(params: {
  model?: string;
  agent: string;
  bodyText: string;
  estimatedInputTokens?: number;
  projectedInputTokens?: number;
  transformed: boolean;
}) {
  const payload = JSON.parse(params.bodyText) as unknown;
  const usage = parseUsagePayload(payload);
  if (!usage) return null;

  return recordUsage({
    task: `proxy-${params.agent}`,
    label: params.transformed ? "proxy-optimized" : "proxy-passthrough",
    variant: params.transformed ? "optimized" : "text",
    surface: "proxy",
    model: params.model,
    usage,
    estimatedInputTokens: params.estimatedInputTokens,
    projectedInputTokens: params.projectedInputTokens,
    notes: params.transformed ? "transform applied" : "passthrough",
  });
}
