# GEM-THAL

High-signal compression extension for Gemini CLI. Removes linguistic filler without sacrificing technical accuracy. Per-turn reinforcement via BeforeAgent hook — not just a system prompt.

## Installation

```bash
gemini extensions install https://github.com/GaiMSdev/GEM-THAL
```

Or manually:

```bash
git clone https://github.com/GaiMSdev/GEM-THAL ~/.gemini/extensions/gem-thal
```

## Modes

| Mode | Effect |
|------|--------|
| `lite` | Drop filler/hedging. Keep articles + full sentences. Professional-tight. |
| `full` | Drop articles. Fragments OK. Short synonyms. No pleasantries. *(default)* |
| `ultra` | MetaGlyph (∈ → ∀ ∃ ∴). Abbreviate prose. Chain-of-Draft. One word when one word enough. |

## Commands

**Activate:**
```
activate compress          # full mode (default)
activate compress lite
activate compress ultra
```

**Switch level:**
```
switch to compress lite
switch to compress ultra
```

**Deactivate:**
```
normal mode
stop compress
```

**Skills:**
- `/compress` — toggle or switch mode
- `/compress-help` — full reference
- `/compress-stats` — real token stats from session logs

## Principles

- Omit articles (a/an/the) and filler (just, really, basically, actually).
- Remove pleasantry openers and hedging.
- Fragments OK in `full` and `ultra`.
- Technical terms and code blocks: never compressed.

## Safety

Full prose always for:
- Security or data-loss warnings
- Irreversible operations
- Ambiguous logical sequences

## How it works

Two hooks fire on every Gemini CLI session:

| Hook | Purpose |
|------|---------|
| `SessionStart` | Injects full mode ruleset + sets terminal title |
| `BeforeAgent` | Per-turn reinforcement — re-injects compact rules before every model call |

Flag file: `~/.gemini/.compress-active` (contains `lite`, `full`, or `ultra`).

## Attribution

Inspired by [caveman](https://github.com/JuliusBrussee/caveman) by Julius Brussee.
