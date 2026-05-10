#!/usr/bin/env node
const { readFlag, writeFlag, removeFlag } = require("./config");
let input = "";
process.stdin.on("data", c => { input += c; });
process.stdin.on("end", () => {
  // Issue #2 fix: parse prompt from JSON stdin, not raw string
  let parsed = {};
  try { parsed = JSON.parse(input); } catch (e) {}
  const prompt = (parsed.prompt || '').trim().toLowerCase();

  // Issue #4 fix: emit title reset OSC on deactivation
  const deactivate = /\b(stop|disable|deactivate|turn off)\b.*\bcompress\b/i.test(prompt) || /\bnormal mode\b/i.test(prompt);
  if (deactivate) {
    removeFlag();
    process.stdout.write(JSON.stringify({ systemMessage: "\x1b]0;\x07" }));
    process.exit(0);
  }

  // Issue #3 fix: wenyan removed from activation patterns
  const activateMatch = prompt.match(/\b(activate|enable|turn on|start|switch to)\b.*\bcompress\s*(lite|full|ultra)?\b/i) ||
                        prompt.match(/\bcompress\s*(lite|full|ultra)?\b.*\b(on|activate|enable)\b/i) ||
                        prompt.match(/\b(lite|full|ultra)\b.*\bcompress\b.*\bmode\b/i);
  if (activateMatch) {
    let mode = activateMatch[2] || activateMatch[1] || "full";
    if (!["lite", "full", "ultra"].includes(mode)) mode = "full";
    writeFlag(mode);
  }

  const mode = readFlag();
  if (!mode || mode === "off") process.exit(0);

  let reinforcement = "";
  if (mode === "lite") reinforcement = "COMPRESS LITE: Drop filler/hedging. Keep articles + full sentences. Professional-tight.";
  else if (mode === "ultra") reinforcement = "COMPRESS ULTRA: Abbreviate prose (DB/auth/fn/req/res). Strip conjunctions. Arrows for causality. Minimalist grunts.";
  else reinforcement = "COMPRESS FULL: Drop articles. Fragments OK. No pleasantries. High-signal.";

  // Issue #1 fix: systemMessage at top level, not inside hookSpecificOutput
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { additionalContext: reinforcement + " Deactivate: \"normal mode\"." }
  }));
});
