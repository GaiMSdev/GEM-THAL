#!/usr/bin/env node
/**
 * RUNES — Session Start Hook
 * Injects initial compression rules without terminal title clutter.
 */
const core = require("../lib/runes-core");

const mode = core.readFlag() || "off";
if (mode === "off") process.exit(0);

const instructions = core.getPromptInstructions(mode);
const common = "" + 
"\n\n## Boundaries" +
"\n- Code blocks, commit messages, and PR descriptions: write normally (0% compression)." +
"\n- Technical terms and API names: never abbreviated." +
"\n- Security or data-loss warnings: full prose for clarity." +
"\n\nDeactivate: \"normal mode\".";

process.stdout.write(JSON.stringify({
  systemMessage: "",
  hookSpecificOutput: {
    additionalContext: instructions + common
  }
}));
