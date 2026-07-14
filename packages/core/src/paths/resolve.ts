import { existsSync } from "node:fs";
import path from "node:path";

import { findProjectRoot, getDefaultHomeDir } from "../config/load.js";

const SAMPLE_ALIASES: Record<string, string> = {
  "code-heavy": "data/benchmarks/samples/code-heavy-001.txt",
  "layout-heavy": "data/benchmarks/samples/layout-heavy-001.txt",
  "repeated-system": "data/benchmarks/samples/repeated-system-001.txt",
  "tool-result": "data/benchmarks/samples/tool-result-001.json",
  "agent-request": "data/benchmarks/samples/agent-request-001.json",
};

/**
 * Resolve a user-supplied file path from cwd, repo root, or sample aliases.
 */
export function resolveInputPath(
  file: string,
  startDir = process.cwd(),
): string {
  if (file === "-") return file;

  const root = findProjectRoot(startDir);
  const candidates: string[] = [];

  if (path.isAbsolute(file)) {
    candidates.push(file);
  } else {
    candidates.push(path.resolve(startDir, file));
    candidates.push(path.join(root, file));
  }

  const alias = SAMPLE_ALIASES[file] ?? SAMPLE_ALIASES[file.replace(/\.(txt|json|md)$/, "")];
  if (alias) {
    candidates.push(path.join(root, alias));
    candidates.push(path.join(getDefaultHomeDir(), alias));
  }

  const homeSamples = path.join(getDefaultHomeDir(), "data", "benchmarks", "samples");
  candidates.push(path.join(homeSamples, file));
  if (!file.endsWith(".txt") && !file.endsWith(".json")) {
    candidates.push(path.join(root, "data", "benchmarks", "samples", `${file}.txt`));
    candidates.push(path.join(root, "data", "benchmarks", "samples", `${file}-001.txt`));
    candidates.push(path.join(homeSamples, `${file}.txt`));
    candidates.push(path.join(homeSamples, `${file}-001.txt`));
    candidates.push(path.join(homeSamples, `${file}-001.json`));
  }

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  const hints = [
    `data/benchmarks/samples/${file}`,
    ...Object.keys(SAMPLE_ALIASES).map((k) => `alias:${k}`),
  ];

  throw new Error(
    `File not found: ${file}\nTry one of:\n${hints.map((h) => `  - ${h}`).join("\n")}`,
  );
}
