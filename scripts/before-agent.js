#!/usr/bin/env node
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

  // /runes-stats -- Intercept and block to save tokens
  if (prompt === "/runes-stats" || prompt === "/runes stats") {
    const report = core.getStatsReport();
    process.stdout.write(JSON.stringify({
      decision: "block",
      reason: report,
      systemMessage: "🟢 [RUNES:STATS_EMITTED]"
    }));
    process.exit(0);
  }

  const mode = core.readFlag() || "off";

  // Deactivate logic
  const deactivate = /\b(stop|disable|deactivate|turn off)\b.*\b(compress|runes)\b/i.test(prompt) || /\bnormal mode\b/i.test(prompt);
  if (deactivate) {
    core.removeFlag();
    process.stdout.write(JSON.stringify({ systemMessage: "⚪️ [RUNES: OFF]" }));
    process.exit(0);
  }

  // Mode activation logic
  const activateMatch = prompt.match(/\b(activate|enable|turn on|start|switch to)\b.*\b(compress|runes)\s*(lite|full|ultra|hybrid)?\b/i) ||
                        prompt.match(/\b(compress|runes)\s*(lite|full|ultra|hybrid)?\b.*\b(on|activate|enable)\b/i) ||
                        prompt.match(/\b(lite|full|ultra|hybrid)\b.*\b(compress|runes)\b.*\bmode\b/i);
  if (activateMatch) {
    let newMode = activateMatch[3] || activateMatch[2] || "full";
    if (!core.VALID_MODES.includes(newMode)) newMode = "full";
    core.writeFlag(newMode);
  }

  const activeMode = core.readFlag() || "off";
  if (activeMode === "off") process.exit(0);

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
