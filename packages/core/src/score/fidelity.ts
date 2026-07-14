import type { PromptShape } from "../types.js";

const EXACT_IDENTIFIER_RE =
  /(?:\/[\w./-]+)|(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})|(?:`[^`]+`)|(?:\b[A-Z][A-Z0-9_]{2,}\b)/g;

export function scoreFidelityRisk(
  prompt: string,
  shape: PromptShape,
  codeBlockRatio: number,
): number {
  let risk = 0;

  if (shape === "code_heavy") risk += 0.45;
  else if (shape === "mixed") risk += 0.2;

  risk += Math.min(codeBlockRatio * 1.2, 0.4);

  const exactMatches = prompt.match(EXACT_IDENTIFIER_RE) ?? [];
  const exactDensity = exactMatches.length / Math.max(prompt.split("\n").length, 1);
  if (exactDensity > 2) risk += 0.25;
  else if (exactDensity > 1) risk += 0.15;

  if (prompt.includes("{") && prompt.includes("}")) risk += 0.05;
  if (prompt.includes("```json")) risk += 0.1;

  return clamp(risk, 0, 1);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
