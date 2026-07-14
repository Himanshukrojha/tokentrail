import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getDefaultHomeDir, resetProjectRootCache } from "@tokentrail/core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface SetupOptions {
  installDir?: string;
  cursorMcp?: boolean;
  shellHint?: boolean;
}

export function detectRepoRoot(): string {
  return path.resolve(__dirname, "../../..");
}

export async function installToHome(
  sourceRoot = detectRepoRoot(),
  targetRoot = getDefaultHomeDir(),
): Promise<string> {
  await mkdir(path.join(targetRoot, "config", "providers"), { recursive: true });
  await mkdir(path.join(targetRoot, "data", "runs"), { recursive: true });
  await mkdir(path.join(targetRoot, "data", "benchmarks", "samples"), { recursive: true });

  const files = [
    "config/rules.json",
    "config/scoring-weights.json",
    "config/fidelity-layouts.json",
    "config/providers/claude.json",
  ];

  for (const file of files) {
    await cp(
      path.join(sourceRoot, file),
      path.join(targetRoot, file),
    );
  }

  await cp(
    path.join(sourceRoot, "data/benchmarks"),
    path.join(targetRoot, "data/benchmarks"),
    { recursive: true },
  );

  return targetRoot;
}

export async function writeCursorMcpConfig(
  repoRoot = detectRepoRoot(),
  homeDir = getDefaultHomeDir(),
): Promise<string> {
  const mcpEntryPath = path.join(repoRoot, "apps/mcp/dist/index.js");
  const cursorDir = path.join(os.homedir(), ".cursor");
  const mcpFile = path.join(cursorDir, "mcp.json");

  await mkdir(cursorDir, { recursive: true });

  let existing: { mcpServers?: Record<string, unknown> } = {};
  try {
    existing = JSON.parse(await readFile(mcpFile, "utf8")) as typeof existing;
  } catch {
    existing = {};
  }

  existing.mcpServers ??= {};
  existing.mcpServers.tokentrail = {
    command: "node",
    args: [mcpEntryPath],
    env: {
      TOKENTRAIL_ROOT: homeDir,
    },
  };

  await writeFile(mcpFile, `${JSON.stringify(existing, null, 2)}\n`, "utf8");
  return mcpFile;
}

export async function runSetup(options: SetupOptions = {}): Promise<void> {
  const repoRoot = options.installDir ?? detectRepoRoot();
  const homeDir = await installToHome(repoRoot);
  process.env.TOKENTRAIL_ROOT = homeDir;
  resetProjectRootCache();

  console.log("TokenTrail setup complete");
  console.log(`  config: ${homeDir}`);
  console.log(`  runs:   ${path.join(homeDir, "data/runs")}`);

  if (options.cursorMcp !== false) {
    const mcpPath = await writeCursorMcpConfig(repoRoot, homeDir);
    console.log(`  cursor: ${mcpPath}`);
    console.log("");
    console.log("Restart Cursor IDE to load TokenTrail MCP tools.");
  }

  console.log("");
  console.log("Global CLI (from repo):");
  console.log("  pnpm link --global --filter @tokentrail/cli");
  console.log("");
  console.log("Then use anywhere:");
  console.log("  tokentrail compare my-prompt.txt");
  console.log("  tokentrail agent analyze agent-request");
  console.log("  tokentrail proxy");
  console.log("");
  console.log("In Cursor Agent chat, ask:");
  console.log('  "Use tokentrail_compare on this tool output"');
}
