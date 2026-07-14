import type {
  AgentMessage,
  AnthropicContentBlock,
  AnthropicImageBlock,
} from "@tokentrail/core";

/** Anthropic Messages API message shape (simplified). */
export interface AnthropicMessage {
  role: string;
  content: string | AnthropicContentBlock[];
}

export interface AnthropicMessagesRequest {
  model: string;
  messages: AnthropicMessage[];
  system?: string | AnthropicContentBlock[];
  max_tokens?: number;
  [key: string]: unknown;
}

export function extractTextFromContent(
  content: string | AnthropicContentBlock[],
): string {
  if (typeof content === "string") return content;
  return content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("\n");
}

export function toAgentMessages(messages: AnthropicMessage[]): AgentMessage[] {
  return messages.map((m) => ({
    role: m.role,
    content: extractTextFromContent(m.content),
  }));
}

export function buildAnthropicContent(
  message: AgentMessage,
): string | AnthropicContentBlock[] {
  const images = message._tokentrailImages ?? [];
  if (images.length === 0) {
    return message.content;
  }

  const blocks: AnthropicContentBlock[] = [];
  if (message.content.trim()) {
    blocks.push({ type: "text", text: message.content });
  }
  blocks.push(...images);
  return blocks;
}

export function rebuildAnthropicMessages(
  messages: AgentMessage[],
): AnthropicMessage[] {
  return messages.map((m) => ({
    role: m.role,
    content: buildAnthropicContent(m),
  }));
}

export function stripInternalFields(
  request: AnthropicMessagesRequest,
): AnthropicMessagesRequest {
  const { ...rest } = request;
  return rest;
}
