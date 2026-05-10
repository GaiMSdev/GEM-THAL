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
  if (mode === 'lite') return "COMPRESS LITE: Drop filler. Keep detail.";
  if (mode === 'ultra') return "COMPRESS ULTRA: Use MetaGlyphs. Extreme brevity. <R>Key:Value</R> packets.";
  if (mode === 'wenyan') return `[GEM-THAL: WENYAN] COMPRESS WENYAN ACTIVE
- Classical Chinese literary style (文言) for compression.
- Use wenyan particles: 之, 其, 者, 也, 矣, 乎, 焉, 哉, 兮, 耳.
- Omit subjects where contextually obvious (pro-drop).
- Verb precedes object (classical Chinese syntax: VO).
- Replace multi-word phrases with classical idioms (成语) where possible.
- Strip all modern filler, articles, conjunctions, pleasantries.
- Technical terms preserved as-is (code, API, paths, URLs — NEVER compress).
- Goal: 60-80% character reduction via classical Chinese literary compression.
- Auto-clarity: revert to full prose for security, destructive ops, legal.`;
  return "COMPRESS FULL: Drop articles. Fragments OK.";
}

/**
 * Milestone Logic: Proactive stats notification
 */
function getStatsMilestone() {
  const statsPath = path.join(path.dirname(getFlagPath()), '.runes-stats-milestone');
  try {
    let turns = 0;
    if (fs.existsSync(statsPath)) turns = parseInt(fs.readFileSync(statsPath, 'utf8')) || 0;
    turns++;
    fs.writeFileSync(statsPath, String(turns));
    
    // Notify user every 25 turns
    if (turns % 25 === 0) return " [SAVINGS MILESTONE: Check /runes-stats]";
  } catch (e) {}
  return "";
}

function getStatusLine(mode, errorMsg = "", context = {}) {
  const badgeName = "RUNES";
  if (errorMsg) return `🔴 [${badgeName}:ERR${errorMsg}] -> AI FIXING...`;
  if (context.isSensitive && mode !== 'lite') return `🟡 [${badgeName}:SENSITIVE] -> AI MITIGATING...`;
  
  const milestone = getStatsMilestone();
  const circle = mode === 'ultra' ? '🔴' : '🟢';
  
  return `${circle} [${badgeName}:${mode.toUpperCase()}]${milestone}`;
}

module.exports = { readFlag, writeFlag, getPromptInstructions, getStatusLine, VALID_MODES };
