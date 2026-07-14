import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";

import { analyzeAgentRequest } from "./analyze-request.js";
import { comparePrompt } from "../compare-prompt.js";
import { getRunsDir } from "../config/load.js";
import {
  inferMessageContextRole,
  isRecentTurn,
  mapToAction,
} from "./split-request.js";
import { renderPromptToBuffers } from "../render/buffer.js";
import { resolveRenderLayout } from "../render/png.js";
import { detectContentDensity } from "../estimate/density.js";
import { classifyPrompt } from "../classify/index.js";
import type { AgentBlockAction, AgentMessage } from "./types.js";

export interface TransformBlockResult {
  index: number;
  role: string;
  action: AgentBlockAction;
  transformed: boolean;
  originalChars: number;
  originalTokens: number;
  projectedTokens: number;
  pageCount: number;
  rulesFired: string[];
}

export interface TransformMessagesResult {
  messages: AgentMessage[];
  blocks: TransformBlockResult[];
  originalTokens: number;
  projectedTokens: number;
  savingsPercent: number;
}

export interface TransformMessagesOptions {
  messages: AgentMessage[];
  reuseCount?: number;
  model?: string;
  recentTurnsKeepText?: number;
  /** Actions that trigger image conversion */
  imageActions?: AgentBlockAction[];
  enabled?: boolean;
}

const DEFAULT_IMAGE_ACTIONS: AgentBlockAction[] = ["image", "hybrid"];

export async function transformMessagesForProxy(
  options: TransformMessagesOptions,
): Promise<TransformMessagesResult> {
  const {
    messages,
    reuseCount = 1,
    model,
    recentTurnsKeepText = 2,
    imageActions = DEFAULT_IMAGE_ACTIONS,
    enabled = true,
  } = options;

  if (!enabled) {
    const plan = await analyzeAgentRequest({
      messages,
      reuseCount,
      model,
      recentTurnsKeepText,
      skipLog: true,
    });
    return {
      messages,
      blocks: plan.messages.map((b) => ({
        index: b.index,
        role: b.role,
        action: b.action,
        transformed: false,
        originalChars: b.charCount,
        originalTokens: b.effectiveTextTokens,
        projectedTokens: b.projectedTokens,
        pageCount: 0,
        rulesFired: b.rulesFired,
      })),
      originalTokens: plan.totals.originalEffectiveTokens,
      projectedTokens: plan.totals.projectedEffectiveTokens,
      savingsPercent: plan.totals.estimatedSavingsPercent,
    };
  }

  const plan = await analyzeAgentRequest({
    messages,
    reuseCount,
    model,
    recentTurnsKeepText,
    skipLog: true,
  });

  const outputMessages: AgentMessage[] = [];
  const blocks: TransformBlockResult[] = [];

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const blockPlan = plan.messages[i];
    if (!message || !blockPlan) continue;

    const shouldImage =
      imageActions.includes(blockPlan.action) &&
      message.content.length > 0;

    if (!shouldImage) {
      outputMessages.push(message);
      blocks.push({
        index: i,
        role: message.role,
        action: blockPlan.action,
        transformed: false,
        originalChars: message.content.length,
        originalTokens: blockPlan.effectiveTextTokens,
        projectedTokens: blockPlan.projectedTokens,
        pageCount: 0,
        rulesFired: blockPlan.rulesFired,
      });
      continue;
    }

    const { shape, codeBlockRatio } = classifyPrompt(message.content);
    const density = detectContentDensity(message.content, codeBlockRatio);
    const layout = resolveRenderLayout(
      blockPlan.recommendation,
      density.density,
    );

    const pngPages = await renderPromptToBuffers({
      prompt: message.content,
      width: layout.width,
      fontSize: layout.fontSize,
      lineHeight: layout.lineHeight,
      padding: layout.padding,
      maxLinesPerPage: layout.maxLinesPerPage,
    });

    const marker = `[TokenTrail: ${message.role} block #${i} rendered as ${pngPages.length} image page(s). Verify fidelity-sensitive text separately.]`;

    let textContent = marker;
    if (blockPlan.action === "hybrid") {
      const head = message.content.slice(0, 400);
      textContent = `${head}\n\n${marker}`;
    }

    outputMessages.push({
      role: message.role,
      content: textContent,
      _tokentrailImages: pngPages.map((p: { mediaType: "image/png"; base64: string }) => ({
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: p.mediaType,
          data: p.base64,
        },
      })),
    });

    blocks.push({
      index: i,
      role: message.role,
      action: blockPlan.action,
      transformed: true,
      originalChars: message.content.length,
      originalTokens: blockPlan.effectiveTextTokens,
      projectedTokens: blockPlan.projectedTokens,
      pageCount: pngPages.length,
      rulesFired: blockPlan.rulesFired,
    });
  }

  return {
    messages: outputMessages,
    blocks,
    originalTokens: plan.totals.originalEffectiveTokens,
    projectedTokens: plan.totals.projectedEffectiveTokens,
    savingsPercent: plan.totals.estimatedSavingsPercent,
  };
}

export async function logProxyTransform(entry: {
  timestamp: string;
  agent: string;
  model?: string;
  path: string;
  result: TransformMessagesResult;
}): Promise<void> {
  const runsDir = path.join(getRunsDir(), "proxy");
  await mkdir(runsDir, { recursive: true });
  const file = path.join(runsDir, `${entry.timestamp.slice(0, 10)}.jsonl`);
  await appendFile(file, `${JSON.stringify(entry)}\n`, "utf8");
}
