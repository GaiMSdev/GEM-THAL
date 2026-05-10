#!/usr/bin/env node
const { readFlag, writeFlag, removeFlag } = require("./config");
const { execSync } = require("child_process");

let input = "";
process.stdin.on("data", c => { input += c; });
process.stdin.on("end", () => {
  // Bug #2 fix: parse prompt from JSON stdin, not raw string
  let parsed = {};
  try { parsed = JSON.parse(input); } catch (e) {}
  const prompt = (parsed.prompt || '').trim().toLowerCase();

  // Bug #4 fix: title reset OSC on deactivation
  const deactivate = /\b(stop|disable|deactivate|turn off)\b.*\bcompress\b/i.test(prompt) || /\bnormal mode\b/i.test(prompt);
  if (deactivate) {
    removeFlag();
    try { execSync('"$MAESTRI_CLI" note write "GEM-THAL-Status" "GEM-THAL: OFF"', { shell: true }); } catch (e) {}
    process.stdout.write(JSON.stringify({ systemMessage: "\x1b]0;\x07" }));
    process.exit(0);
  }

  // Bug #3 fix: wenyan excluded from valid modes
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

  // Maestri sticky status note
  try { execSync('"$MAESTRI_CLI" note write "GEM-THAL-Status" "GEM-THAL: ' + mode.toUpperCase() + '"', { shell: true }); } catch (e) {}

  let reinforcement = "";
  if (mode === "lite") {
    reinforcement = "COMPRESS LITE: Drop filler/hedging. Keep articles + full sentences. Professional-tight.";
  } else if (mode === "ultra") {
    reinforcement = "COMPRESS ULTRA: MetaGlyph allowed (∈ → ∀ ∃ ∴). Abbreviate prose (DB/fn/req/res/impl/ctx/err). Strip conjunctions. Arrows for causality. Chain-of-Draft: reason silently, then answer.";
  } else {
    reinforcement = "COMPRESS FULL: Drop articles. Fragments OK. No pleasantries. High-signal.";
  }

  const title = "\x1b]0;[GEM-THAL:" + mode.toUpperCase() + "]\x07";
  // Bug #1 fix: systemMessage at top level, not inside hookSpecificOutput
  process.stdout.write(JSON.stringify({
    systemMessage: title,
    hookSpecificOutput: { additionalContext: reinforcement + " Deactivate: \"normal mode\"." }
  }));
});
