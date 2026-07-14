export function ingestPrompt(raw: string): string {
  const normalized = raw.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    throw new Error("Prompt is empty after normalization");
  }
  return normalized;
}

export function getPromptStats(prompt: string) {
  const lines = prompt.split("\n");
  return {
    charCount: prompt.length,
    lineCount: lines.length,
    avgLineLength:
      lines.reduce((sum, line) => sum + line.length, 0) / lines.length,
  };
}
