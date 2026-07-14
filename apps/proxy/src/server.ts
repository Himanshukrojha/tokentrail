import http from "node:http";
import { Readable } from "node:stream";

import { AGENT_SETUP, loadProxyConfig } from "./config.js";
import { transformAnthropicRequest, stats } from "./transform.js";
import type { AnthropicMessagesRequest } from "./anthropic.js";

async function readBody(req: http.IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}

function forwardHeaders(
  req: http.IncomingMessage,
  extra: Record<string, string> = {},
): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  for (const [key, value] of Object.entries(req.headers)) {
    if (!value || key === "host" || key === "content-length") continue;
    headers[key] = Array.isArray(value) ? value.join(", ") : value;
  }
  return headers;
}

function json(res: http.ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(data, null, 2));
}

function detectAgent(req: http.IncomingMessage): string {
  const ua = req.headers["user-agent"] ?? "";
  if (/claude/i.test(ua)) return "claude";
  if (/cursor/i.test(ua)) return "cursor";
  return "generic";
}

async function proxyRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  config: ReturnType<typeof loadProxyConfig>,
) {
  const url = new URL(req.url ?? "/", `http://${config.host}:${config.port}`);
  const targetUrl = `${config.upstream}${url.pathname}${url.search}`;
  const agent = detectAgent(req);

  let bodyText = "";
  if (req.method === "POST" || req.method === "PUT") {
    bodyText = await readBody(req);
  }

  let outboundBody = bodyText;

  if (
    config.enabled &&
    req.method === "POST" &&
    url.pathname === "/v1/messages" &&
    bodyText
  ) {
    try {
      const parsed = JSON.parse(bodyText) as AnthropicMessagesRequest;
      const { body, transform } = await transformAnthropicRequest(
        parsed,
        config,
        agent,
      );
      outboundBody = JSON.stringify(body);

      const transformedBlocks = transform.blocks.filter((b) => b.transformed);
      if (transformedBlocks.length > 0) {
        console.log(
          `[tokentrail] ${agent} transformed ${transformedBlocks.length} block(s) | est. savings ${Math.round(transform.savingsPercent * 100)}%`,
        );
      }
    } catch (error) {
      console.error("[tokentrail] transform failed, passing through:", error);
    }
  }

  const headers = forwardHeaders(req, {
    "content-type": req.headers["content-type"] ?? "application/json",
    ...(outboundBody ? { "content-length": String(Buffer.byteLength(outboundBody)) } : {}),
  });

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: outboundBody || undefined,
  });

  res.writeHead(upstream.status, Object.fromEntries(upstream.headers.entries()));
  if (upstream.body) {
    Readable.fromWeb(upstream.body as never).pipe(res);
  } else {
    res.end();
  }
}

export function startProxyServer() {
  const config = loadProxyConfig();

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? "/", `http://${config.host}:${config.port}`);

      if (url.pathname === "/tokentrail/health") {
        json(res, 200, { ok: true, service: "tokentrail-proxy", enabled: config.enabled });
        return;
      }

      if (url.pathname === "/tokentrail/stats") {
        json(res, 200, stats);
        return;
      }

      if (url.pathname === "/tokentrail/setup") {
        json(res, 200, AGENT_SETUP);
        return;
      }

      await proxyRequest(req, res, config);
    } catch (error) {
      console.error("[tokentrail] proxy error:", error);
      json(res, 500, { error: String(error) });
    }
  });

  server.listen(config.port, config.host, () => {
    console.log("TokenTrail proxy running");
    console.log(`  listen: http://${config.host}:${config.port}`);
    console.log(`  upstream: ${config.upstream}`);
    console.log(`  transforms: ${config.enabled ? "on" : "off"}`);
    console.log("");
    console.log("Claude CLI / Claude Code:");
    console.log(`  ANTHROPIC_BASE_URL=http://${config.host}:${config.port} claude`);
    console.log("");
    console.log("Cursor CLI (when using compatible API routing):");
    console.log(`  ANTHROPIC_BASE_URL=http://${config.host}:${config.port} cursor agent`);
    console.log("");
    console.log("Dashboard:");
    console.log(`  http://${config.host}:${config.port}/tokentrail/stats`);
  });

  return server;
}
