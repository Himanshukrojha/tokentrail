export function scoreReadability(
  prompt: string,
  width: number,
  height: number,
): number {
  const area = width * height;
  const density = prompt.length / Math.max(area, 1);

  const lines = prompt.split("\n").length;
  const avgLineLen =
    prompt.length / Math.max(lines, 1);

  let score = 1;

  // Penalize high character density on small canvases
  if (density > 0.004) score -= 0.35;
  else if (density > 0.002) score -= 0.15;

  // Penalize very long average lines (hard to wrap legibly)
  if (avgLineLen > 120) score -= 0.2;
  else if (avgLineLen > 80) score -= 0.1;

  // Penalize tiny widths for long prompts
  if (width <= 256 && prompt.length > 2000) score -= 0.25;

  // Reward whitespace / structure
  const whitespaceRatio =
    (prompt.match(/\s/g)?.length ?? 0) / Math.max(prompt.length, 1);
  if (whitespaceRatio > 0.15) score += 0.05;

  return clamp(score, 0, 1);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
