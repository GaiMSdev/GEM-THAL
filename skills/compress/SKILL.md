---
name: compress
description: Activate, switch, or deactivate GEM-THAL compression mode (lite/full/ultra)
---

When user invokes /compress, manage compression mode.

## Flag file

`~/.gemini/.compress-active` contains: `lite`, `full`, `ultra`, or `off` (missing = off).

## Logic

- `/compress` → read flag:
  - Missing or `off` → activate at `full`: `echo "full" > ~/.gemini/.compress-active`, confirm "Compress mode on (full)."
  - Active → deactivate: `rm ~/.gemini/.compress-active`, confirm "Compress mode off."
- `/compress lite` → `echo "lite" > ~/.gemini/.compress-active`, confirm "Compress mode: lite."
- `/compress full` → `echo "full" > ~/.gemini/.compress-active`, confirm "Compress mode: full."
- `/compress ultra` → `echo "ultra" > ~/.gemini/.compress-active`, confirm "Compress mode: ultra."

Use shell commands to read/write the flag file. Do not use other tools.

For full documentation: /compress-help
