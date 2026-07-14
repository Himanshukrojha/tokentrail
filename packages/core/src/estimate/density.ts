import { estimateTextTokens } from "./text.js";

export type ContentDensity = "prose" | "dense" | "auto";

export interface DensityEstimate {
  density: ContentDensity;
  proseTokens: number;
  denseTokens: number;
  effectiveTextTokens: number;
  charsPerTextToken: number;
}

const JSON_LIKE_RE = /^\s*[\[{]/;
const LOG_LIKE_RE = /^\d{4}-\d{2}-\d{2}|ERROR|WARN|INFO|DEBUG/m;

export function detectContentDensity(
  prompt: string,
  codeBlockRatio: number,
  explicit?: ContentDensity,
): DensityEstimate {
  const proseTokens = estimateTextTokens(prompt);
  const denseTokens = prompt.length;
  const trimmed = prompt.trim();

  let density: ContentDensity = explicit ?? "auto";

  if (density === "auto") {
    const jsonLike = JSON_LIKE_RE.test(trimmed) || (trimmed.includes("{") && trimmed.includes('":'));
    const logLike = LOG_LIKE_RE.test(prompt);
    const highCode = codeBlockRatio > 0.15;
    const highSymbol = (prompt.match(/[{}[\]":,;]/g)?.length ?? 0) / Math.max(prompt.length, 1) > 0.08;

    if (jsonLike || logLike || highCode || highSymbol) {
      density = "dense";
    } else {
      density = "prose";
    }
  }

  const effectiveTextTokens =
    density === "dense"
      ? denseTokens
      : density === "prose"
        ? proseTokens
        : Math.round((proseTokens + denseTokens) / 2);

  return {
    density,
    proseTokens,
    denseTokens,
    effectiveTextTokens,
    charsPerTextToken: prompt.length / Math.max(effectiveTextTokens, 1),
  };
}
