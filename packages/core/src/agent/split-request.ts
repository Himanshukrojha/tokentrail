import type { AgentMessage } from "./types.js";
import type { ContextRole } from "../types.js";

export function inferMessageContextRole(
  message: AgentMessage,
  index: number,
  total: number,
): ContextRole {
  const content = message.content.trim();
  const role = message.role.toLowerCase();

  if (role === "system") return "system";

  if (role === "user") {
    if (content.startsWith("{") || content.startsWith("[")) return "tool_result";
    if (/tool result|stdout|stderr|^ERROR/mi.test(content.slice(0, 400))) {
      return "tool_result";
    }
    if (index === total - 1) return "user_message";
  }

  if (role === "assistant" || (role === "user" && index < total - 1)) {
    return "conversation_history";
  }

  return "auto";
}

export function isRecentTurn(
  index: number,
  total: number,
  recentTurnsKeepText: number,
): boolean {
  const recentMessageCount = recentTurnsKeepText * 2;
  return index >= total - recentMessageCount;
}

export function mapToAction(
  recommendation: string,
  contextRecommendation: string,
  keepAsText: boolean,
): "keep_text" | "cache" | "image" | "hybrid" {
  if (keepAsText) return "keep_text";

  if (
    recommendation === "caching_preferred" ||
    contextRecommendation === "cache_context"
  ) {
    return "cache";
  }

  if (
    recommendation === "context_image_preferred" ||
    recommendation === "image_viable" ||
    contextRecommendation === "image_context"
  ) {
    return "image";
  }

  if (
    recommendation === "hybrid" ||
    contextRecommendation === "hybrid_context"
  ) {
    return "hybrid";
  }

  return "keep_text";
}

export function projectTokens(
  effectiveTokens: number,
  action: "keep_text" | "cache" | "image" | "hybrid",
  visualTokens: number,
  cacheEffective?: number,
): number {
  switch (action) {
    case "cache":
      return cacheEffective ?? Math.round(effectiveTokens * 0.2);
    case "image":
      return visualTokens;
    case "hybrid":
      return Math.round(effectiveTokens * 0.4 + visualTokens * 0.6);
    default:
      return effectiveTokens;
  }
}
