# RUNES — Industry-Leading Token Compression

Industry-leading semantic compression for Gemini CLI, Claude Code, and OpenCode. Surpasses standard linguistic stripping (like Caveman) by using MetaGlyphs and semantic structuring.

## Hybrid Architecture
One shared core, isolated environments. RUNES automatically detects your CLI and maintains separate state flags:
- **Gemini CLI:** `~/.gemini/.compress-active`
- **OpenCode:** `~/.config/opencode/.runes-active`
- **Claude Code:** `~/.claude/.caveman-active`

## Modes

| Mode | Effect | Compression |
|------|--------|-------------|
| `lite` | Drop filler. Keep detail. | ~35% |
| `full` | Drop articles. Fragments OK. | ~75% |
| `ultra` | MetaGlyphs (⌬, ⑂, →). Data Packets. | **~88%** |

## Smart Status & Auto-Fix
- 🟢 **Green:** System functional. Active in LITE, FULL, or ULTRA.
- 🟡 **Yellow:** Warning. Detected sensitive task. AI will mitigate (suggest LITE).
- 🔴 **Red:** Broken. AI will autonomously attempt self-healing.

## Commands
```bash
activate runes [lite|full|ultra]
switch to runes [mode]
normal mode (deactivate)
/runes-stats (show savings)
/runes-help (show documentation)
```

## Attribution
Inspired by [caveman](https://github.com/JuliusBrussee/caveman) by Julius Brussee.
