const fs = require('fs');
const path = require('path');
const os = require('os');

const HOME = os.homedir();
const VALID_MODES = ['lite', 'full', 'ultra', 'off'];

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
  if (mode === 'lite') return "COMPRESS LITE: Drop filler. Keep detail.";
  if (mode === 'ultra') return "COMPRESS ULTRA: Use MetaGlyphs. Extreme brevity. <R>Key:Value</R> packets.";
  return "COMPRESS FULL: Drop articles. Fragments OK.";
}

function getStatusLine(mode, errorMsg = "", context = {}) {
  const badgeName = "RUNES";
  if (errorMsg) return "🔴 [" + badgeName + ":CRITICAL_ERR" + errorMsg + "] -> AI REPAIRING...";
  if (context.isSensitive && mode !== 'lite') return "🟡 [" + badgeName + ":SENSITIVE] -> AI MITIGATING...";
  return "🟢 [" + badgeName + ":" + mode.toUpperCase() + "]";
}

module.exports = { readFlag, writeFlag, getPromptInstructions, getStatusLine, VALID_MODES };
