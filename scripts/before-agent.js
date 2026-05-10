#!/usr/bin/env node
/**
 * RUNES — High-signal compression for Gemini CLI
 * This hook runs before every model call (BeforeAgent).
 */
const path = require("path");
// Dynamically resolve core path to ensure compatibility with all CLIs
const core = require("../lib/runes-core");

let input = "";
process.stdin.on("data", c => { input += c; });
process.stdin.on("end", () => {
  let errorMsg = "";

  let parsed = {};
  try { 
    if (input) parsed = JSON.parse(input); 
  } catch (e) {
    errorMsg = " [JSON_ERR]";
  }
  
  const prompt = (parsed.prompt || '').trim().toLowerCase();
  const mode = core.readFlag() || "off";

  // Mode change detection
  const activateMatch = prompt.match(/\b(activate|enable|turn on|start|switch to)\b.*\b(compress|runes)\s*(lite|full|ultra|wenyan)?\b/i) ||
                        prompt.match(/\b(compress|runes)\s*(lite|full|ultra|wenyan)?\b.*\b(on|activate|enable)\b/i) ||
                        prompt.match(/\b(lite|full|ultra|wenyan)\b.*\b(compress|runes)\b.*\bmode\b/i);
  
  const deactivate = /\b(stop|disable|deactivate|turn off)\b.*\b(compress|runes)\b/i.test(prompt) || /\bnormal mode\b/i.test(prompt);

  if (deactivate) {
    core.removeFlag();
    process.stdout.write(JSON.stringify({ systemMessage: "⚪️ [RUNES: OFF]" }));
    process.exit(0);
  }

  if (activateMatch) {
    let newMode = activateMatch[3] || activateMatch[2] || "full";
    if (!core.VALID_MODES.includes(newMode)) newMode = "full";
    core.writeFlag(newMode);
    // Continue with the newly set mode
  }

  const activeMode = core.readFlag() || "off";
  if (activeMode === "off") process.exit(0);

  // Smart Context Detection
  const context = {
    isSensitive: /\b(delete|rm -rf|password|secret|security|auth|private|remove|wipe)\b/i.test(prompt),
    isComplex: /\b(refactor|architect|design|fix bug|analyze)\b/i.test(prompt)
  };

  const statusLine = core.getStatusLine(activeMode, errorMsg, context);
  const reinforcement = core.getPromptInstructions(activeMode);

  process.stdout.write(JSON.stringify({
    systemMessage: statusLine,
    hookSpecificOutput: { 
      additionalContext: reinforcement + " Deactivate: \"normal mode\"."
    }
  }));
});
