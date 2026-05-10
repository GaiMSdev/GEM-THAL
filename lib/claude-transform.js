/**
 * RUNES — Claude Code Transformation Hook
 * This replaces the core Caveman logic with the advanced RUNES algorithm.
 */
const core = require("./runes-core");

module.exports = async function transformSystemPrompt(systemPrompt) {
  const mode = core.readFlag() || "off";
  
  if (mode === "off") return systemPrompt;

  const runesInstructions = core.getPromptInstructions(mode);
  
  // Append RUNES instructions to the system prompt
  // In Claude Code, we can either prefix or suffix. Suffixing ensures it has high priority.
  return `${systemPrompt}\n\n[RUNES ACTIVE]\n${runesInstructions}\nDeactivate: "normal mode".`;
};
