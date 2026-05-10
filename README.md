# GEM-THAL

High-signal compression for Gemini CLI.

GEM-THAL is a Gemini CLI extension that injects compression rules into every model turn via hooks. Activate once — mode persists in a flag file at `~/.gemini/.compress-active` until you say "normal mode". Three levels of semantic compression, from light filler-removal to MetaGlyph data packets.

## Modes

| Mode | Description | Compression |
|------|-------------|-------------|
| `lite` | Drop filler. Keep all detail. | ~35% |
| `full` | Drop articles. Fragments OK. | ~75% |
| `ultra` | MetaGlyphs + `<R>Key:Value</R>` data packets. | ~88% |

## MetaGlyphs (ultra mode)

Ultra mode uses a fixed symbol vocabulary to replace verbose constructs:

| Symbol | Meaning |
|--------|---------|
| `⌬` | module |
| `⑂` | branch / fork |
| `⨕` | transform |
| `→` | causality / leads to |
| `∴` | therefore |
| `∵` | because |
| `®` | requirement |
| `⚙` | implementation |
| `[!]` | error |
| `[✓]` | success |

## Skills

| Skill | Trigger | Description |
|-------|---------|-------------|
| `runes` | `/runes [lite\|full\|ultra]` | Activate, switch, or deactivate compression mode. |
| `runes-commit` | `/runes-commit` | Generate a Conventional Commits message from staged diff. No noise — subject + optional "why" body only. |
| `runes-review` | `/runes-review` | Review staged diff. One finding per line, severity-tagged (`CRITICAL` / `WARN` / `NOTE`). Max 10. No praise. |
| `runes-stats` | `/runes-stats` | Show real token usage and estimated savings for the session. |

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
