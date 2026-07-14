#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import {
  analyzeAgentRequest,
  comparePrompt,
  renderPromptToBuffers,
  resolveRenderLayout,
  detectContentDensity,
  classifyPrompt,
} from "@tokentrail/core";

const CompareSchema = z.object({
  prompt: z.string().describe("Prompt or context text to analyze"),
  reuse_count: z.number().optional().default(1),
  context_role: z
    .enum(["auto", "system", "tool_result", "conversation_history", "user_message"])
    .optional()
    .default("auto"),
  density: z.enum(["auto", "prose", "dense"]).optional().default("auto"),
  model: z.string().optional().default("claude-sonnet-4"),
});

const AgentPlanSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.string(),
        content: z.string(),
      }),
    )
    .describe("Agent messages array"),
  reuse_count: z.number().optional().default(10),
  model: z.string().optional().default("claude-sonnet-4"),
});

const RenderSchema = z.object({
  prompt: z.string(),
  recommendation: z.string().optional().default("context_image_preferred"),
  density: z.enum(["auto", "prose", "dense"]).optional().default("dense"),
});

const server = new Server(
  {
    name: "tokentrail",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "tokentrail_compare",
      description:
        "Analyze a prompt/context block and recommend text vs image vs cache format with token savings.",
      inputSchema: {
        type: "object",
        properties: {
          prompt: { type: "string", description: "Text to analyze" },
          reuse_count: { type: "number", description: "Reuse count for cache baseline" },
          context_role: {
            type: "string",
            enum: ["auto", "system", "tool_result", "conversation_history", "user_message"],
          },
          density: { type: "string", enum: ["auto", "prose", "dense"] },
          model: { type: "string" },
        },
        required: ["prompt"],
      },
    },
    {
      name: "tokentrail_agent_plan",
      description:
        "Analyze a full agent request (messages array) and return per-block keep_text/cache/image/hybrid plan.",
      inputSchema: {
        type: "object",
        properties: {
          messages: {
            type: "array",
            items: {
              type: "object",
              properties: {
                role: { type: "string" },
                content: { type: "string" },
              },
              required: ["role", "content"],
            },
          },
          reuse_count: { type: "number" },
          model: { type: "string" },
        },
        required: ["messages"],
      },
    },
    {
      name: "tokentrail_render",
      description:
        "Render prompt text to PNG page(s) as base64 for multimodal context. Returns image data for attachment.",
      inputSchema: {
        type: "object",
        properties: {
          prompt: { type: "string" },
          recommendation: { type: "string" },
          density: { type: "string", enum: ["auto", "prose", "dense"] },
        },
        required: ["prompt"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (request.params.name === "tokentrail_compare") {
      const input = CompareSchema.parse(request.params.arguments ?? {});
      const result = await comparePrompt({
        prompt: input.prompt,
        reuseCount: input.reuse_count,
        contextRole: input.context_role,
        contentDensity: input.density,
        model: input.model,
        skipLog: true,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                recommendation: result.recommendation,
                recommendation_label: result.recommendationLabel,
                effective_text_tokens: result.effectiveTextTokens,
                context_savings: result.contextSavings,
                rules_fired: result.rulesFired,
                rationale: result.rationale,
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    if (request.params.name === "tokentrail_agent_plan") {
      const input = AgentPlanSchema.parse(request.params.arguments ?? {});
      const plan = await analyzeAgentRequest({
        messages: input.messages,
        reuseCount: input.reuse_count,
        model: input.model,
        skipLog: true,
      });

      return {
        content: [{ type: "text", text: JSON.stringify(plan, null, 2) }],
      };
    }

    if (request.params.name === "tokentrail_render") {
      const input = RenderSchema.parse(request.params.arguments ?? {});
      const { shape, codeBlockRatio } = classifyPrompt(input.prompt);
      const density = detectContentDensity(input.prompt, codeBlockRatio, input.density);
      const layout = resolveRenderLayout(input.recommendation, density.density);
      const pages = await renderPromptToBuffers({
        prompt: input.prompt,
        width: layout.width!,
        fontSize: layout.fontSize,
        lineHeight: layout.lineHeight,
        padding: layout.padding,
        maxLinesPerPage: layout.maxLinesPerPage,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                page_count: pages.length,
                pages: pages.map((p) => ({
                  page_index: p.pageIndex,
                  width: p.width,
                  height: p.height,
                  base64_png: p.base64,
                })),
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${request.params.name}`);
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `TokenTrail error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
