---
name: runes
description: Activate, switch, or deactivate RUNES compression mode (lite/full/ultra)
---

When user invokes /runes, manage compression mode.

## Logic

- \`/runes\` → read flag:
  - Missing or \`off\` → activate at \`full\`.
  - Active → deactivate.
- \`/runes [lite|full|ultra]\` → update to mode.
- \`/runes-stats\` → show real token usage and savings.

Use the shared core logic to read/write flags.

For full documentation: /runes-help

## Related skills

- `/runes-commit` → generate a Conventional Commits message from staged diff.
