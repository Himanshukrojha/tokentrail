export interface ProxyConfig {
  port: number;
  host: string;
  upstream: string;
  enabled: boolean;
  recentTurnsKeepText: number;
  reuseCount: number;
  logTransforms: boolean;
}

export function loadProxyConfig(): ProxyConfig {
  return {
    port: Number(process.env.TOKENTRAIL_PROXY_PORT ?? 47821),
    host: process.env.TOKENTRAIL_PROXY_HOST ?? "127.0.0.1",
    upstream: process.env.TOKENTRAIL_UPSTREAM ?? "https://api.anthropic.com",
    enabled: process.env.TOKENTRAIL_PROXY_ENABLED !== "false",
    recentTurnsKeepText: Number(
      process.env.TOKENTRAIL_RECENT_TURNS ?? 2,
    ),
    reuseCount: Number(process.env.TOKENTRAIL_REUSE_COUNT ?? 10),
    logTransforms: process.env.TOKENTRAIL_PROXY_LOG !== "false",
  };
}

export const AGENT_SETUP = {
  claude: {
    name: "Claude Code / Claude CLI",
    env: {
      ANTHROPIC_BASE_URL: "http://127.0.0.1:47821",
    },
    notes: "Works with any tool that respects Anthropic base URL override.",
  },
  cursor: {
    name: "Cursor CLI / Cursor Agent",
    env: {
      ANTHROPIC_BASE_URL: "http://127.0.0.1:47821",
      OPENAI_BASE_URL: "http://127.0.0.1:47821",
    },
    notes:
      "Use when Cursor agent is configured for direct Anthropic/OpenAI-compatible API. If Cursor uses internal routing only, use MCP or manual compare workflow.",
  },
  generic: {
    name: "Any Anthropic-compatible agent",
    env: {
      ANTHROPIC_BASE_URL: "http://127.0.0.1:47821",
    },
    notes: "Set base URL to the TokenTrail proxy; API key still required.",
  },
} as const;
