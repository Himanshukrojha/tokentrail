import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { ClaudeProviderConfig, RulesConfig } from "../types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let cachedRoot: string | null = null;

export function getDefaultHomeDir(): string {
  return path.join(os.homedir(), ".tokentrail");
}

function hasConfig(dir: string): boolean {
  return existsSync(path.join(dir, "config", "rules.json"));
}

/** Resolve TokenTrail root: env → ~/.tokentrail → repo walk-up. */
export function findProjectRoot(startDir = process.cwd()): string {
  if (cachedRoot) return cachedRoot;

  if (process.env.TOKENTRAIL_ROOT && hasConfig(process.env.TOKENTRAIL_ROOT)) {
    cachedRoot = process.env.TOKENTRAIL_ROOT;
    return cachedRoot;
  }

  const homeDir = getDefaultHomeDir();
  if (hasConfig(homeDir)) {
    cachedRoot = homeDir;
    return cachedRoot;
  }

  const candidates = [
    startDir,
    path.resolve(__dirname, "../../.."),
    path.resolve(__dirname, "../../../.."),
    path.resolve(__dirname, "../../../../.."),
  ];

  for (const dir of candidates) {
    let current = dir;
    for (let i = 0; i < 8; i++) {
      if (hasConfig(current)) {
        cachedRoot = current;
        return current;
      }
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
  }

  throw new Error(
    "TokenTrail config not found. Run: tokentrail setup\n" +
      "Or set TOKENTRAIL_ROOT to a directory containing config/rules.json",
  );
}

export function resetProjectRootCache(): void {
  cachedRoot = null;
}

export function getRunsDir(root?: string): string {
  return path.join(findProjectRoot(root), "data", "runs");
}

export async function loadRulesConfig(
  root = findProjectRoot(),
): Promise<RulesConfig> {
  const raw = await readFile(path.join(root, "config", "rules.json"), "utf8");
  return JSON.parse(raw) as RulesConfig;
}

export async function loadClaudeProviderConfig(
  root = findProjectRoot(),
): Promise<ClaudeProviderConfig> {
  const raw = await readFile(
    path.join(root, "config", "providers", "claude.json"),
    "utf8",
  );
  return JSON.parse(raw) as ClaudeProviderConfig;
}
