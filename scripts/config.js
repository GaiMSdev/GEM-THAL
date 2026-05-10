// Shared flag utilities for gem-thal
const fs = require('fs');
const path = require('path');
const os = require('os');
const GEMINI_DIR = process.env.GEMINI_CONFIG_DIR || path.join(os.homedir(), '.gemini');
const FLAG_PATH = path.join(GEMINI_DIR, '.compress-active');
const VALID_MODES = ['lite', 'full', 'ultra', 'off'];
function readFlag() {
  try {
    const stat = fs.lstatSync(FLAG_PATH);
    if (stat.isSymbolicLink() || stat.size > 32) return null;
    const val = fs.readFileSync(FLAG_PATH, 'utf8').trim();
    return VALID_MODES.includes(val) ? val : null;
  } catch (e) { return null; }
}
function writeFlag(mode) {
  try {
    try { if (fs.lstatSync(FLAG_PATH).isSymbolicLink()) return; } catch (e) {}
    fs.writeFileSync(FLAG_PATH, mode, 'utf8');
  } catch (e) {}
}
function removeFlag() {
  try { fs.unlinkSync(FLAG_PATH); } catch (e) {}
}
module.exports = { readFlag, writeFlag, removeFlag };
