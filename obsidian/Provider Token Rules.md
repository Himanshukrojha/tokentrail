# Provider Token Rules

V0.2: Claude uses **28×28 pixel patches** (not legacy 512×512 tiles).

## Claude visual tokens

Formula ([Anthropic vision docs](https://platform.claude.com/docs/en/build-with-claude/vision)):

```
raw = ceil(width/28) × ceil(height/28)
visualTokens = min(raw, tierMaxVisualTokens)
```

Downscale first if long edge exceeds tier `maxLongEdge`.

### Resolution tiers

| Tier | Models (examples) | Max long edge | Max visual tokens |
| ---- | ----------------- | ------------- | ----------------- |
| Standard | claude-sonnet-4, claude-3-5-sonnet | 1568 px | 1568 |
| High | claude-sonnet-5, claude-opus-4 | 2576 px | 4784 |

### Reference costs

| Image size | Visual tokens |
| ---------- | ------------- |
| 512×512 | 361 |
| 1000×1000 | 1296 |
| 1928×1412 | ~3174 |

Config: `config/providers/claude.json` (version 0.2.0)

## Text tokens

- **Prose:** `gpt-tokenizer` / cl100k_base (~1.3 tokens/word)
- **Dense** (code, JSON, logs): ~**1 character ≈ 1 token** for agent context

`effectiveTextTokens` uses density detection or explicit `--density`.

## Prompt caching

- Cache read discount vs full input tokens
- **Always compare cache before context imaging** for system prompts
- Central baseline for repeated agent sessions

## Context imaging thresholds

From `config/providers/claude.json` → `contextImaging`:

| Threshold | Value | Meaning |
| --------- | ----- | ------- |
| `minDenseCharsForContextImage` | 6000 | Min size for tool result imaging |
| `minDenseTokensForContextImage` | 4000 | Effective token floor |
| `recentTurnsKeepText` | 2 | Recent history stays as text |

## Maintenance

- Version provider configs (`claude.json` v0.2.0)
- Log `providerConfigVersion` in [[Run Logger]]
- Recount with Anthropic `count_tokens` API before production billing decisions
