import { readFile } from "node:fs/promises";
import path from "node:path";

import { findProjectRoot } from "../config/load.js";
import { detectContentDensity } from "./density.js";
import { estimateTextTokens } from "./text.js";
import {
  estimateLayoutHeight,
  estimateVisualTokens,
} from "./visual.js";
import type { ClaudeProviderConfig, FidelityCapacity } from "../types.js";

export interface FidelityLayoutConfig {
  version: string;
  layouts: Array<{
    id: string;
    fidelityTarget: number;
    label: string;
    width: number;
    fontSize: number;
    lineHeight: number;
    charsPerLine: number;
    lines: number;
    padding: number;
  }>;
}

export async function loadFidelityLayouts(
  root = findProjectRoot(),
): Promise<FidelityLayoutConfig> {
  const raw = await readFile(
    path.join(root, "config", "fidelity-layouts.json"),
    "utf8",
  );
  return JSON.parse(raw) as FidelityLayoutConfig;
}

export function estimateFidelityCapacities(
  prompt: string,
  layouts: FidelityLayoutConfig["layouts"],
  providerConfig: ClaudeProviderConfig,
  model: string,
  codeBlockRatio: number,
): FidelityCapacity[] {
  return layouts.map((layout) => {
    const height = estimateLayoutHeight(
      layout.lines,
      layout.fontSize,
      layout.lineHeight,
      layout.padding,
    );
    const maxChars = layout.charsPerLine * layout.lines;
    const maxWords = Math.round(maxChars / 5.2);
    const visualTokens = estimateVisualTokens(
      layout.width,
      height,
      providerConfig,
      model,
    );

    const density = detectContentDensity(prompt, codeBlockRatio);
    const textTokensProse = estimateTextTokens(
      "word ".repeat(maxWords).trim().slice(0, maxChars),
    );
    const textTokensDense = maxChars;
    const textTokensEquivalent =
      density.density === "dense" ? textTokensDense : textTokensProse;

    const savingsVsText = 1 - visualTokens / Math.max(textTokensEquivalent, 1);

    return {
      fidelityTarget: layout.fidelityTarget as 0.98 | 0.97,
      layoutId: layout.id,
      label: layout.label,
      maxWords,
      maxChars,
      width: layout.width,
      height,
      fontSize: layout.fontSize,
      charsPerLine: layout.charsPerLine,
      lines: layout.lines,
      visualTokens,
      textTokensEquivalent,
      savingsVsText,
      charsPerVisualToken: maxChars / Math.max(visualTokens, 1),
    };
  });
}

export function pagesRequiredForPrompt(
  promptLength: number,
  capacityChars: number,
): number {
  return Math.max(1, Math.ceil(promptLength / Math.max(capacityChars, 1)));
}
