#!/usr/bin/env node
const { readFlag } = require("./config");
const mode = readFlag();
if (!mode || mode === "off") process.exit(0);
const rules = {
    lite: "COMPRESS LITE ACTIVE\n- Drop filler words (just, really, basically, actually).\n- Remove pleasantry openers and hedging.\n- Keep standard grammar, articles, and full sentences.\n- Goal: Professional-tight.",
    full: "COMPRESS FULL ACTIVE\n- Omit articles (a/an/the) and filler words.\n- No pleasantry openers.\n- Use fragments. Short synonyms preferred.\n- Pattern: [subject] [verb] [reason]. [next step].\n- Goal: High-signal.",
    ultra: "COMPRESS ULTRA ACTIVE\n- Abbreviate prose (DB, auth, config, req, res, fn, impl, ctx, err, msg, val, bool, pkg).\n- Strip conjunctions. Use arrows (->) for causality.\n- One word when one word enough.\n- Goal: Brutal minimalist compression."
};
const common = "\n\n## Exceptions — full prose for\n- Security or data-loss warnings\n- Irreversible operations\n- Ambiguous logical sequences\n\n## Boundaries\n- Technical terms (ShortcutOwner, API names, code) never abbreviated.\n- Code blocks, commit messages: write normally.\n\nDeactivate: \"normal mode\".";

const title = `\x1b]0;[GEM-THAL:${mode.toUpperCase()}]\x07`;

process.stdout.write(JSON.stringify({
  systemMessage: title,
  hookSpecificOutput: {
    additionalContext: (rules[mode] || rules.full) + common
  }
}));