import {
  logProxyTransform,
  transformMessagesForProxy,
} from "@tokentrail/core";

import type { ProxyConfig } from "./config.js";
import {
  rebuildAnthropicMessages,
  toAgentMessages,
  type AnthropicMessagesRequest,
} from "./anthropic.js";

export interface TransformStats {
  requestCount: number;
  transformedCount: number;
  totalOriginalTokens: number;
  totalProjectedTokens: number;
}

export const stats: TransformStats = {
  requestCount: 0,
  transformedCount: 0,
  totalOriginalTokens: 0,
  totalProjectedTokens: 0,
};

export async function transformAnthropicRequest(
  body: AnthropicMessagesRequest,
  config: ProxyConfig,
  agentHint = "unknown",
): Promise<{ body: AnthropicMessagesRequest; transform: Awaited<ReturnType<typeof transformMessagesForProxy>> }> {
  const agentMessages = toAgentMessages(body.messages);
  const transform = await transformMessagesForProxy({
    messages: agentMessages,
    reuseCount: config.reuseCount,
    model: body.model,
    recentTurnsKeepText: config.recentTurnsKeepText,
    enabled: config.enabled,
  });

  const rebuilt = rebuildAnthropicMessages(transform.messages);

  stats.requestCount += 1;
  stats.totalOriginalTokens += transform.originalTokens;
  stats.totalProjectedTokens += transform.projectedTokens;
  if (transform.blocks.some((b) => b.transformed)) {
    stats.transformedCount += 1;
  }

  if (config.logTransforms) {
    await logProxyTransform({
      timestamp: new Date().toISOString(),
      agent: agentHint,
      model: body.model,
      path: "/v1/messages",
      result: transform,
    });
  }

  return {
    body: {
      ...body,
      messages: rebuilt,
    },
    transform,
  };
}
