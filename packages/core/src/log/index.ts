import { createHash, randomUUID } from "node:crypto";
import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";

import { getRunsDir } from "../config/load.js";
import type { CompareResult } from "../types.js";

export function hashPrompt(prompt: string): string {
  return createHash("sha256").update(prompt).digest("hex");
}

export function createRunId(): string {
  return randomUUID();
}

export async function writeRunLog(
  result: CompareResult,
  root?: string,
): Promise<string> {
  const runsDir = getRunsDir(root);
  await mkdir(runsDir, { recursive: true });

  const date = result.timestamp.slice(0, 10);
  const filePath = path.join(runsDir, `${date}.jsonl`);
  await appendFile(filePath, `${JSON.stringify(result)}\n`, "utf8");
  return filePath;
}
