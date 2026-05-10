---
name: compress-help
description: Show help for the GEM-THAL compression extension — modes, commands, and examples
---

When the user invokes /compress-help, display the following help text exactly:

---

## GEM-THAL — Compression Mode Help

High-signal response compression for Gemini CLI. Removes filler without sacrificing technical accuracy.

### Modes

| Mode  | Effect |
|-------|--------|
| `lite`  | Drop filler/hedging. Keep articles and full sentences. Professional-tight. |
| `full`  | Drop articles. Fragments OK. Short synonyms. No pleasantries. (default) |
| `ultra` | Abbreviate prose words (DB/fn/req/res/impl/ctx/err). Strip conjunctions. Arrows for causality (X → Y). One word when one word enough. Technical terms never abbreviated. |

### Commands

**Activate:**
- `activate compress` — enable at `full` (default)
- `activate compress lite` — enable at `lite`
- `activate compress ultra` — enable at `ultra`
- `echo "full" > ~/.gemini/.compress-active` — direct flag write

**Switch level (while active):**
- `switch to compress lite`
- `switch to compress ultra`

**Deactivate:**
- `normal mode`
- `stop compress`
- `rm ~/.gemini/.compress-active`

**Check status:**
- `cat ~/.gemini/.compress-active`

### What is never compressed

- Security or data-loss warnings
- Irreversible operations (destructive git commands, deletes, overwrites)
- Sequences where dropping conjunctions creates ambiguity
- Code blocks, commit messages, PR descriptions

### Examples

**full:**
> Input: "Why does my React component re-render?"
> Output: "New object ref each render. Inline prop = new ref = re-render. Wrap in `useMemo`."

**ultra:**
> Input: "Why does my React component re-render?"
> Output: "Inline prop → new ref → re-render. `useMemo`."

**lite:**
> Input: "Why does my React component re-render?"
> Output: "Your component re-renders because you create a new object reference on each render. Wrap the value in `useMemo`."

### Files

| File | Purpose |
|------|---------|
| `~/.gemini/.compress-active` | Flag file — contains `lite`, `full`, or `ultra` |
| `~/.gemini/extensions/gemini-compress/` | Extension root |

### Attribution

Inspired by [caveman](https://github.com/JuliusBrussee/caveman) by Julius Brussee.

---
