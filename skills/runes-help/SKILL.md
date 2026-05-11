---
name: runes-help
description: Show help for the RUNES compression extension — modes, commands, and examples
---

When the user invokes /runes-help, display the following help text exactly:

---

## RUNES — Token Compression Help

Industry-leading semantic compression. High-signal output without accuracy loss.

### Modes

| Mode | Effect | Compression |
|------|--------|-------------|
| `lite` | Drop filler. Keep detail. | ~35% |
| `full` | Drop articles. Fragments OK. | ~75% |
| `ultra`| Prose abbrev + → causality. NOT→DO contrastive. | **~75%** |

### Commands

- `activate runes [mode]` — enable (default: full)
- `switch to runes [mode]` — change mode
- `normal mode` — deactivate
- `/runes-stats` — show session token savings
- `/runes-help` — show this help

### Smart Status (Indicators)

- 🟢 **Green:** System OK. Active.
- 🟡 **Yellow:** AI Warning. Sensitive task detected.
- 🔴 **Red:** AI Error. Self-healing in progress.

### Boundaries (0% Compression)

- Code blocks, Git commits, PR descriptions.
- Security or data-loss warnings.
- Technical API names and terms.

### Attribution
Inspired by [caveman](https://github.com/JuliusBrussee/caveman) by Julius Brussee.

---
