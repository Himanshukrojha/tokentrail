# API Reference (V0.2)

## `comparePrompt(input)`

```typescript
import { comparePrompt } from "@tokentrail/core";

const result = await comparePrompt({
  prompt: "...",
  reuseCount: 5,
  provider: "claude",
  model: "claude-sonnet-4",
  contextRole: "tool_result",   // agent context role
  contentDensity: "dense",      // prose | dense | auto
  imagePresets: [384, 768, 1024, 1928],
  skipLog: false,
});
```

### Input

| Field | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `prompt` | `string` | required | Raw prompt / context text |
| `reuseCount` | `number` | `1` | Sessions reusing same block |
| `contextRole` | `ContextRole` | `auto` | Agent context classification |
| `contentDensity` | `ContentDensity` | `auto` | Prose vs dense token estimate |
| `provider` | `"claude"` | `"claude"` | V0.2: claude only |
| `model` | `string` | `"claude-sonnet-4"` | Affects resolution tier cap |
| `imagePresets` | `number[]` | `[384,768,1024,1928]` | Image widths in px |
| `skipLog` | `boolean` | `false` | Skip JSONL run log |

### Context roles

| Role | Use when |
| ---- | -------- |
| `system` | Static system prompt / tool definitions |
| `tool_result` | JSON, logs, command output |
| `conversation_history` | Prior user/assistant turns |
| `user_message` | Current user input |
| `auto` | Heuristic detection |

### Output highlights

| Field | Description |
| ----- | ----------- |
| `textTokens` | Prose tokenizer count |
| `effectiveTextTokens` | Density-adjusted count (dense ≈ 1 char/token) |
| `contextSavings` | Agent context imaging analysis |
| `contextSavings.fidelityCapacities` | Words/page at 98% and 97% fidelity |
| `contextSavings.pagedSavingsPercent` | Multi-page dense context savings |
| `recommendation` | Includes `context_image_preferred` |

## Visual token math (Claude)

```
visualTokens = min(
  ceil(w/28) × ceil(h/28),
  tierMaxVisualTokens
)
```

Tiers: standard (1568 cap), high (4784 cap). Images downscaled if long edge exceeds tier limit.

## Recommendation rules (V0.2)

| ID | Label |
| -- | ----- |
| R1 | `caching_preferred` |
| R7 | `context_image_preferred` — large dense agent context |
| R2 | `text_preferred` — code-heavy |
| R3 | `text_preferred` — high fidelity risk |
| R4 | `image_viable` |
| R5 | `hybrid` — layout-heavy |
| R8 | `hybrid` — image old history, keep recent text |
| R6 | `text_preferred` — default |

## Agent context recommendations

Separate from format label, in `contextSavings.agentContextRecommendation`:

- `cache_context` — static repeated blocks
- `image_context` — large dense tool/history blocks
- `hybrid_context` — split recent text + imaged tail
- `keep_text` — user turns, low savings, high risk
