#!/usr/bin/env node
/**
 * RUNES Precision Stats
 * Analyzes session logs to estimate token savings.
 */
const fs = require("fs");
const path = require("path");
const os = require("os");
const core = require("../lib/runes-core");

const HOME = os.homedir();
const TMP_DIRS = [
  process.env.GEMINI_CONFIG_DIR ? path.join(process.env.GEMINI_CONFIG_DIR, "tmp") : path.join(HOME, ".gemini", "tmp"),
  path.join(HOME, ".config", "opencode", "tmp"),
  path.join(HOME, ".claude", "tmp")
];

const SKIP = new Set(["background-processes", "bin"]);

function getLatestSession() {
  let best = null;
  let bestMtime = 0;
  
  for (const tmpDir of TMP_DIRS) {
    if (!fs.existsSync(tmpDir)) continue;
    try {
      for (const dir of fs.readdirSync(tmpDir)) {
        if (SKIP.has(dir)) continue;
        const fullPath = path.join(tmpDir, dir);
        try {
          if (!fs.statSync(fullPath).isDirectory()) continue;
          const chatsDir = path.join(fullPath, "chats");
          if (!fs.existsSync(chatsDir)) continue;
          for (const file of fs.readdirSync(chatsDir)) {
            if (!file.startsWith("session-") || !file.endsWith(".jsonl")) continue;
            const fp = path.join(chatsDir, file);
            const { mtimeMs } = fs.statSync(fp);
            if (mtimeMs > bestMtime) { bestMtime = mtimeMs; best = fp; }
          }
        } catch (e) {}
      }
    } catch (e) {}
  }
  return best;
}

function parseSession(filePath) {
  const acc = { cached: 0, input: 0, output: 0, thoughts: 0, tool: 0, total: 0 };
  let model = "unknown";
  try {
    const content = fs.readFileSync(filePath, "utf8").trim();
    if (!content) return { ...acc, model };
    for (const line of content.split("\n")) {
      try {
        const entry = JSON.parse(line);
        if (!entry.tokens) continue;
        const t = entry.tokens;
        acc.cached   += t.cached_tokens || t.cached || 0;
        acc.input    += t.input_tokens  || t.input  || 0;
        acc.output   += t.output_tokens || t.output || 0;
        acc.thoughts += t.thoughts || 0;
        acc.tool     += t.tool_tokens   || t.tool   || 0;
        acc.total    += t.total_tokens  || t.total  || 0;
        if (entry.model) model = entry.model;
      } catch (e) {}
    }
  } catch (e) {}
  return { ...acc, model };
}

const sessionFile = getLatestSession();
const stats = sessionFile
  ? parseSession(sessionFile)
  : { cached: 0, input: 0, output: 0, thoughts: 0, tool: 0, total: 0, model: "N/A" };

const mode = core.readFlag() || "off";

// Updated compression ratios based on RUNES research
const COMPRESSION = { lite: 0.35, full: 0.75, ultra: 0.88 };
const ratio = COMPRESSION[mode] || 0;
const estSaved = (ratio > 0 && stats.output > 0) 
  ? Math.round(stats.output * (ratio / (1 - ratio)))
  : 0;

console.log("RUNES PRECISION STATS");
console.log("---------------------");
console.log("Model:      " + stats.model);
console.log("Mode:       " + mode.toUpperCase());
if (stats.cached > 0)   console.log("Cached:     " + stats.cached.toLocaleString()   + " tokens");
if (stats.thoughts > 0) console.log("Thoughts:   " + stats.thoughts.toLocaleString() + " tokens");
if (stats.tool > 0)     console.log("Tool:       " + stats.tool.toLocaleString()      + " tokens");
console.log("Input:      " + stats.input.toLocaleString()  + " tokens");
console.log("Output:     " + stats.output.toLocaleString() + " tokens");
if (stats.total > 0)    console.log("Total:      " + (stats.input + stats.output).toLocaleString() + " tokens");
if (estSaved > 0) {
  console.log("Est. Saved: " + estSaved.toLocaleString() + " tokens (" + Math.round(ratio * 100) + "% from compression)");
  console.log("Total Val:  " + (stats.output + estSaved).toLocaleString() + " tokens equivalent");
}
