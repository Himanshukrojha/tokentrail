# Technical Architecture

## Monorepo layout

```
tokentrail/
├── packages/core/          # @tokentrail/core — all logic
├── apps/cli/               # tokentrail CLI
├── apps/vscode/            # Phase 2
├── config/
│   ├── rules.json
│   ├── scoring-weights.json
│   └── providers/claude.json
├── data/
│   ├── benchmarks/         # labeled prompts (sanitized)
│   └── runs/               # gitignored logs
├── docs/
├── obsidian/
└── package.json            # pnpm workspaces
```

## Core package modules

| Module | Responsibility |
| ------ | -------------- |
| `ingest` | Normalize paste, detect encoding, strip BOM |
| `classify` | `prose` / `code_heavy` / `layout_heavy` / `mixed` |
| `estimate/text` | Token count via provider profile |
| `estimate/visual` | WxH → visual tokens per provider docs |
| `estimate/cache` | Effective cost given reuse count |
| `render` | Prompt → PNG at 256/384/512 px |
| `score/readability` | Density, font floor, whitespace |
| `score/fidelity` | Code blocks, identifiers, structured data |
| `compare` | Assemble `ComparisonContext` |
| `recommend` | Apply [[Recommendation Rules]] |
| `log` | [[Run Logger]] |

## Public API

```typescript
import { comparePrompt } from '@tokentrail/core';

const result = await comparePrompt({
  prompt: fs.readFileSync('system.md', 'utf8'),
  reuseCount: 10,
  provider: 'claude',
});
```

## Classifier heuristics (V0)

```
codeBlockRatio = fencedCodeChars / totalChars
layoutSignals = table chars, box-drawing, repeated spaces
IF codeBlockRatio > 0.25 → code_heavy
ELSE IF layoutSignals high → layout_heavy
ELSE IF codeBlockRatio > 0.05 → mixed
ELSE → prose
```

## Provider abstraction

```typescript
interface ProviderProfile {
  name: string;
  textTokenizer: (text: string) => number;
  visualTokens: (width: number, height: number) => number;
  cacheDiscount: (reuseCount: number) => number;
}
```

See [[Provider Token Rules]].

## Extension boundary (Phase 2)

VS Code extension only calls `@tokentrail/core` + renders webview. **No duplicate logic in extension.**
