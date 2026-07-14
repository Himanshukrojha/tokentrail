# Multi-Surface Architecture

TokenTrail is built **package-first**. Every surface — CLI, agent CLIs, IDE extensions, proxies — calls the same `@tokentrail/core` engine.

## Principle

```
┌─────────────────────────────────────────────────────────┐
│                   @tokentrail/core                       │
│  comparePrompt · renderPromptToPng · runBenchmark        │
│  rules · token math · context savings · logging          │
└─────────────────────────────────────────────────────────┘
         ▲              ▲              ▲              ▲
         │              │              │              │
   apps/cli    apps/benchmark   (future surfaces)  npm consumers
```

**No duplicate logic in surfaces.** Extensions and proxies are thin adapters.

## Surfaces (current + planned)

| Surface | Status | Who uses it | Integration |
| ------- | ------ | ----------- | ----------- |
| **npm package** | ✅ Now | Any Node/TS app | `import { comparePrompt } from '@tokentrail/core'` |
| **tokentrail CLI** | ✅ Now | Developers, scripts | `pnpm compare file.txt` |
| **benchmark runner** | ✅ Now | CI, tuning | `pnpm benchmark` |
| **Claude Code / CLI proxy** | 🔜 Next | Claude CLI users | Intercept `ANTHROPIC_BASE_URL`, image context blocks |
| **Cursor CLI hook** | 🔜 Next | Cursor agent users | Pre-request middleware or MCP tool |
| **VS Code / Cursor extension** | 🔜 Phase 2 | IDE users | Webview panel → core API |
| **Browser extension** | 🔜 Phase 4 | Web prompt tools | Selected text → core API |

## Package API (stable integration point)

```typescript
import {
  comparePrompt,
  renderPromptToPng,
  renderFromRecommendation,
  runBenchmark,
  detectContextRole,
} from "@tokentrail/core";

// 1. Analyze any text block
const result = await comparePrompt({
  prompt: toolOutput,
  contextRole: "tool_result",
  contentDensity: "dense",
  reuseCount: 1,
});

// 2. Render PNG pages when recommended
if (result.recommendation === "context_image_preferred") {
  await renderFromRecommendation({
    prompt: toolOutput,
    outputDir: "./out",
    recommendation: result.recommendation,
    contentDensity: result.contentDensity,
  });
}
```

## How agent CLIs would integrate

Agent CLIs (Claude Code, Cursor CLI, Codex, etc.) send multi-block requests:

```
messages: [
  { role: "system", content: "..." },      ← cache or text
  { role: "user", content: "..." },        ← always text
  { role: "assistant", content: "..." },   ← old → image
  { role: "user", content: tool_result },  ← dense → image
]
```

### Proxy adapter (future `apps/proxy`)

1. Intercept outgoing API request
2. For each content block, call `comparePrompt` with `contextRole`
3. If `context_image_preferred` → `renderFromRecommendation` → replace text with image block
4. Keep recent turns and user message as text
5. Log savings to `data/runs/`

Same core, zero forked logic.

### Extension adapter (future `apps/vscode`)

1. User selects text in editor
2. Extension calls `comparePrompt` via bundled core
3. Webview shows recommendation + PNG preview
4. Optional: "Apply as image context" copies PNG path / base64

### MCP tool adapter (future)

Expose `tokentrail_compare` and `tokentrail_render` as MCP tools so any MCP-capable agent CLI can call TokenTrail without a proxy.

## What each surface owns

| Layer | Owns | Does NOT own |
| ----- | ---- | ------------ |
| **core** | Rules, token math, render, benchmark, logs | HTTP, IDE UI, proxy routing |
| **cli** | Argument parsing, human output | Recommendation logic |
| **proxy** | HTTP middleware, block splitting | Token formulas |
| **extension** | Webview UI, editor selection | Scoring |

## Publishing path

1. **Now:** private monorepo, local `workspace:*`
2. **Soon:** publish `@tokentrail/core` to npm for programmatic use
3. **Later:** `tokentrail` global CLI binary, VS Code marketplace extension

## Config discovery

Core finds `config/` via `findProjectRoot()` — walks up from `cwd` or package location. Surfaces can override by running from repo root or setting config path (future env `TOKENTRAIL_ROOT`).

## Next implementation order

1. ✅ Package + CLI + benchmark + PNG render
2. 🔜 Context block splitter (`splitAgentRequest(blocks)`)
3. 🔜 Local proxy (`apps/proxy`)
4. 🔜 VS Code extension (`apps/vscode`)

See also: `obsidian/Technical Architecture.md`, `obsidian/Context Token Savings.md`
