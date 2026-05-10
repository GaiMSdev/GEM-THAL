#!/usr/bin/env node
/**
 * RUNES — Session Start Hook
 * Sets the terminal title and injects initial compression rules.
 */
const core = require("../lib/runes-core");

const mode = core.readFlag() || "off";
if (mode === "off") process.exit(0);

const instructions = core.getPromptInstructions(mode);
const common = `

## Boundaries
- Code blocks, commit messages, and PR descriptions: write normally (0% compression).
- Technical terms and API names: never abbreviated.
- Security or data-loss warnings: full prose for clarity.

Deactivate: "normal mode".`;

const title = `\x1b]0;[RUNES:${mode.toUpperCase()}]\x07`;

process.stdout.write(JSON.stringify({
  systemMessage: title,
  hookSpecificOutput: {
    additionalContext: instructions + common
  }
}));
