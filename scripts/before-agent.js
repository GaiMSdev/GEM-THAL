#!/usr/bin/env node
const { readFlag, writeFlag, removeFlag } = require("./config");

let input = "";
process.stdin.on("data", c => { input += c; });
process.stdin.on("end", () => {
  let statusCircle = "🟢"; // Default: Success
  let errorMsg = "";

  let parsed = {};
  try { 
    if (input) parsed = JSON.parse(input); 
  } catch (e) {
    statusCircle = "🔴";
    errorMsg = " [JSON_ERR]";
  }
  
  const prompt = (parsed.prompt || '').trim().toLowerCase();

  // Deactivate logic
  const deactivate = /\b(stop|disable|deactivate|turn off)\b.*\bcompress\b/i.test(prompt) || /\bnormal mode\b/i.test(prompt);
  if (deactivate) {
    removeFlag();
    process.stdout.write(JSON.stringify({ systemMessage: "⚪️ [GEM-THAL: OFF]" }));
    process.exit(0);
  }

  // Mode activation logic
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
  if (mode === "lite") {
    reinforcement = "COMPRESS LITE: Drop filler/hedging. Keep articles + full sentences. Professional-tight.";
  } else if (mode === "ultra") {
    reinforcement = "COMPRESS ULTRA: MetaGlyph allowed (∈ → ∀ ∃ ∴). Abbreviate prose (DB/fn/req/res/impl/ctx/err). Strip conjunctions. Arrows for causality. Chain-of-Draft: reason silently, then answer.";
  } else {
    reinforcement = "COMPRESS FULL: Drop articles. Fragments OK. No pleasantries. High-signal.";
  }

  const statusLine = statusCircle + " [GEM-THAL:" + mode.toUpperCase() + errorMsg + "]";
  
  process.stdout.write(JSON.stringify({
    systemMessage: statusLine,
    hookSpecificOutput: { additionalContext: reinforcement + " Deactivate: \"normal mode\"." }
  }));
});
