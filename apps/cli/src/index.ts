#!/usr/bin/env node
import { readFile } from "node:fs/promises";

import {
  analyzeAgentRequest,
  comparePrompt,
  resolveInputPath,
} from "@tokentrail/core";
import { Command } from "commander";
import path from "node:path";

import { formatHuman } from "./format-output.js";
import { runSetup } from "./setup.js";

const program = new Command();

program
  .name("tokentrail")
  .description("Rules-first prompt format optimizer — CLI, proxy, Cursor MCP")
  .version("0.4.0");

program
  .command("setup")
  .description("Install config to ~/.tokentrail and register Cursor MCP")
  .option("--no-cursor", "Skip writing ~/.cursor/mcp.json")
  .action(async (options) => {
    await runSetup({ cursorMcp: options.cursor !== false });
  });

program
  .command("compare")
  .description("Compare text, image, and cached formats for a prompt")
  .argument("<file>", "Path, alias (layout-heavy), stdin (-), or raw text with --text")
  .option("-r, --reuse <count>", "Expected reuse count for cache baseline", "1")
  .option("-m, --model <model>", "Model id", "claude-sonnet-4")
  .option("-p, --provider <provider>", "Provider", "claude")
  .option(
    "--context-role <role>",
    "Agent context role: system|tool_result|conversation_history|user_message|auto",
    "auto",
  )
  .option(
    "--density <density>",
    "Content density: prose|dense|auto",
    "auto",
  )
  .option("--text", "Treat argument as inline prompt text instead of file path")
  .option("--json", "Output raw JSON only")
  .option("--render-out <dir>", "Write PNG page(s) to directory")
  .option("--render-width <px>", "Override PNG render width")
  .option("--no-log", "Skip writing run log")
  .action(async (file: string, options) => {
    const prompt = options.text
      ? file
      : file === "-"
        ? await readStdin()
        : await readFile(resolveInputPath(file), "utf8");

    const renderOut = options.renderOut
      ? path.isAbsolute(options.renderOut)
        ? options.renderOut
        : path.resolve(process.cwd(), options.renderOut)
      : undefined;

    const result = await comparePrompt({
      prompt,
      reuseCount: Number(options.reuse),
      model: options.model,
      provider: options.provider,
      contextRole: options.contextRole,
      contentDensity: options.density,
      renderOut,
      renderWidth: options.renderWidth ? Number(options.renderWidth) : undefined,
      skipLog: options.log === false,
    });

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatHuman(result));
    }
  });

const agentCmd = program
  .command("agent")
  .description("Analyze multi-message agent requests");

agentCmd
  .command("analyze")
  .description("Plan text/cache/image actions per message block")
  .argument("<file>", "JSON file with { messages, reuseCount? }")
  .option("--json", "Output raw JSON only")
  .option("-r, --reuse <count>", "Reuse count for system/cache blocks", "1")
  .action(async (file: string, options) => {
    const raw = await readFile(resolveInputPath(file), "utf8");
    const payload = JSON.parse(raw) as {
      messages: Array<{ role: string; content: string }>;
      reuseCount?: number;
    };

    const plan = await analyzeAgentRequest({
      messages: payload.messages,
      reuseCount: Number(options.reuse ?? payload.reuseCount ?? 1),
      skipLog: true,
    });

    if (options.json) {
      console.log(JSON.stringify(plan, null, 2));
      return;
    }

    console.log("TokenTrail — Agent Request Plan");
    console.log("==============================");
    console.log(
      `Projected savings: ${Math.round(plan.totals.estimatedSavingsPercent * 100)}% (${plan.totals.originalEffectiveTokens} → ${plan.totals.projectedEffectiveTokens} tokens)`,
    );
    console.log("");

    for (const block of plan.messages) {
      console.log(
        `#${block.index} ${block.role} [${block.contextRole}] → ${block.action} (${block.recommendation})`,
      );
      console.log(
        `    tokens: ${block.effectiveTextTokens} → ${block.projectedTokens} | rules: ${block.rulesFired.join(",")}`,
      );
    }
  });

program
  .command("proxy")
  .description("Start HTTP proxy for Claude CLI (ANTHROPIC_BASE_URL)")
  .action(async () => {
    const { startProxyServer } = await import("@tokentrail/proxy");
    startProxyServer();
  });

program
  .command("benchmark")
  .description("Run labeled benchmark corpus")
  .action(async () => {
    const { runBenchmark } = await import("@tokentrail/core");
    const report = await runBenchmark();
    console.log(`Agreement: ${report.agreed}/${report.total} (${report.agreementPercent}%)`);
    for (const row of report.results) {
      const mark = row.agreed ? "✓" : "✗";
      console.log(`${mark} ${row.id} human=${row.humanLabel} engine=${row.engineLabel}`);
    }
  });

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

program.parse();
