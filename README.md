# GEM-THAL

High-signal compression for Gemini CLI.

GEM-THAL is a Gemini CLI extension that injects compression rules into every model turn via hooks. Activate once — mode persists in a flag file at `~/.gemini/.compress-active` until you say "normal mode". Four levels of compression, from light filler-removal to maximum-density prose.

## Modes

| Mode | Description | Output reduction |
|------|-------------|-----------------|
| `lite` | Drop filler, hedging, pleasantries. Full sentences. | ~30% |
| `full` | Drop articles. Fragments OK. Short synonyms. (default) | ~75% |
| `ultra` | Abbreviated prose. Causality arrows. Strip conjunctions. | ~68% |
| `wenyan` | Classical Chinese literary compression. Technical identifiers preserved. | — |

## Skills

| Skill | Trigger | Description |
|-------|---------|-------------|
| `runes` | `/runes [lite\|full\|ultra]` | Activate, switch, or deactivate compression mode. |
| `runes-commit` | `/runes-commit` | Generate a Conventional Commits message from staged diff. No noise — subject + optional "why" body only. |
| `runes-review` | `/runes-review` | Review staged diff. One finding per line, severity-tagged (`CRITICAL` / `WARN` / `NOTE`). Max 10. No praise. |
| `runes-stats` | `/runes-stats` | Show real token usage and estimated savings for the session. |

## Input compression (runes-shrink)

`runes-shrink` is an MCP proxy that compresses tool and resource descriptions before
the model sees them — reducing tool description char-count ~3–5% on typical corpora; savings compound across many tools.

Wrap any MCP server in your Gemini CLI config:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "node",
      "args": [
        "/Users/robert/.gemini/extensions/gem-thal/mcp-shrink/index.js",
        "npx", "@modelcontextprotocol/server-filesystem", "/your/path"
      ]
    }
  }
}
```

Code, URLs, paths, and identifiers are never touched. Only prose descriptions are compressed.
Debug: `RUNES_SHRINK_DEBUG=1`. Extra fields: `RUNES_SHRINK_FIELDS=description,title`.

## Installation

```bash
git clone https://github.com/raakanin/gem-thal ~/.gemini/extensions/gem-thal
```

Gemini CLI loads extensions from `~/.gemini/extensions/` automatically.

## Commands

```
/runes              # toggle full mode on/off
/runes lite         # activate lite mode
/runes full         # activate full mode
/runes ultra        # activate ultra mode
/runes-commit       # generate commit message from staged diff
/runes-review       # review staged diff
/runes-stats        # show token savings
normal mode         # deactivate compression
```

## Auto-safety

Code blocks, commit messages, and PR descriptions are always written normally (0% compression). Technical terms and API names are never abbreviated. Security warnings and data-loss operations always use full prose regardless of active mode.

## Inspired by

[caveman](https://github.com/JuliusBrussee/caveman) by Julius Brussee.
