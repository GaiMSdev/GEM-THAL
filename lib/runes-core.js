const fs = require('fs');
const path = require('path');
const os = require('os');

const HOME = os.homedir();
const VALID_MODES = ['lite', 'full', 'ultra', 'wenyan', 'off'];

function getFlagPath() {
  if (process.env.GEMINI_CONFIG_DIR) return path.join(process.env.GEMINI_CONFIG_DIR, '.compress-active');
  if (process.cwd().includes('.config/opencode') || process.env.OPENCODE_CONFIG_DIR) return path.join(HOME, '.config', 'opencode', '.runes-active');
  if (process.cwd().includes('.claude')) return path.join(HOME, '.claude', '.caveman-active');
  return path.join(HOME, '.gemini', '.compress-active');
}

function readFlag() {
  const p = getFlagPath();
  try {
    if (!fs.existsSync(p)) return null;
    const val = fs.readFileSync(p, 'utf8').trim();
    return VALID_MODES.includes(val) ? val : null;
  } catch (e) { return null; }
}

function writeFlag(mode) {
  const p = getFlagPath();
  try {
    const dir = path.dirname(p);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(p, mode, 'utf8');
  } catch (e) {}
}

const METAGLYPHS = {
  module: "⌬", branch: "⑂", transform: "⨕", error: "[!]", success: "[✓]",
  causality: "→", therefore: "∴", because: "∵", requirement: "®", implementation: "⚙"
};

function getPromptInstructions(mode) {
  if (mode === 'lite') return "[RUNES: LITE] COMPRESS LITE: Drop filler/hedging. Keep articles + full sentences. Professional-tight.";
  if (mode === 'ultra') return "[RUNES: ULTRA] COMPRESS ULTRA: MetaGlyph ONLY: ∈ → ∀ ∃ ∴ !. Abbreviate prose (DB/fn/req/res/impl/ctx/err). Strip conjunctions. CoD. Arrows for causality. NEVER invent symbols.";
  if (mode === 'wenyan') return "[RUNES: WENYAN] COMPRESS WENYAN: Classical Chinese (文言) compression. Use 之/其/者/也/矣 particles. Classical VO syntax. Pro-drop subjects. Replace phrases with 成语 idioms. Technical terms preserved as-is.";
  return "[RUNES: FULL] COMPRESS FULL: Drop articles. Fragments OK. No pleasantries. High-signal.";
}

function getStatusLine(mode, errorMsg = "", context = {}) {
  const badgeName = "RUNES";
  if (errorMsg) return "🔴 [" + badgeName + ":CRITICAL_ERR" + errorMsg + "] -> AI REPAIRING...";
  if (context.isSensitive && mode !== 'lite') return "🟡 [" + badgeName + ":SENSITIVE] -> AI MITIGATING...";
  return "🟢 [" + badgeName + ":" + mode.toUpperCase() + "]";
}

module.exports = { readFlag, writeFlag, getPromptInstructions, getStatusLine, VALID_MODES };
