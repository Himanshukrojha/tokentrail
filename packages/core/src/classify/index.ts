import type { PromptShape } from "../types.js";

const FENCED_CODE_RE = /```[\s\S]*?```/g;
const TABLE_RE = /(\|[^\n]+\|)|([┌┐└┘├┤┬┴┼─│])/g;
const BOX_DRAWING_RE = /[┌┐└┘├┤┬┴┼─│]/g;

export interface ClassificationResult {
  shape: PromptShape;
  codeBlockRatio: number;
  layoutScore: number;
}

export function classifyPrompt(prompt: string): ClassificationResult {
  const fencedMatches = prompt.match(FENCED_CODE_RE) ?? [];
  const fencedChars = fencedMatches.join("").length;
  const codeBlockRatio = fencedChars / Math.max(prompt.length, 1);

  const tableMatches = prompt.match(TABLE_RE) ?? [];
  const boxMatches = prompt.match(BOX_DRAWING_RE) ?? [];
  const layoutScore =
    (tableMatches.length * 20 + boxMatches.length * 10) /
    Math.max(prompt.length, 1);

  let shape: PromptShape;

  if (codeBlockRatio > 0.25) {
    shape = "code_heavy";
  } else if (layoutScore > 0.02) {
    shape = "layout_heavy";
  } else if (codeBlockRatio > 0.05) {
    shape = "mixed";
  } else {
    shape = "prose";
  }

  return { shape, codeBlockRatio, layoutScore };
}
