#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const os = require("os");
const { readFlag } = require("./config");

const GEMINI_DIR = process.env.GEMINI_CONFIG_DIR || path.join(os.homedir(), ".gemini");
const TMP_DIR = path.join(GEMINI_DIR, "tmp");
const SKIP = new Set(["background-processes", "bin"]);

// Search ALL project dirs for the most recently modified session-*.jsonl
function getLatestSession() {
  let best = null;
  let bestMtime = 0;
  try {
    for (const dir of fs.readdirSync(TMP_DIR)) {
      if (SKIP.has(dir)) continue;
      const chatsDir = path.join(TMP_DIR, dir, "chats");
      try {
        for (const file of fs.readdirSync(chatsDir)) {
          if (!file.startsWith("session-") || !file.endsWith(".jsonl")) continue;
          const fp = path.join(chatsDir, file);
          const { mtimeMs } = fs.statSync(fp);
          if (mtimeMs > bestMtime) { bestMtime = mtimeMs; best = fp; }
        }
      } catch (e) {}
    }
  } catch (e) {}
  return best;
}

function parseSession(filePath) {
  const acc = { cached: 0, input: 0, output: 0, thoughts: 0, tool: 0, total: 0 };
  let model = "unknown";
  try {
    for (const line of fs.readFileSync(filePath, "utf8").trim().split("\n")) {
      try {
        const entry = JSON.parse(line);
        if (!entry.tokens) continue;
        const t = entry.tokens;
        acc.cached   += t.cached   || 0;
        acc.input    += t.input    || 0;
        acc.output   += t.output   || 0;
        acc.thoughts += t.thoughts || 0;
        acc.tool     += t.tool     || 0;
        acc.total    += t.total    || 0;
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
const mode = readFlag() || "off";

const COMPRESSION = { lite: 0.30, full: 0.75, ultra: 0.87 };
const ratio = COMPRESSION[mode] || 0;
const estSaved = Math.round(stats.output * (ratio / (1 - ratio)));

console.log("GEM-THAL PRECISION STATS");
console.log("------------------------");
console.log("Model:      " + stats.model);
console.log("Mode:       " + mode.toUpperCase());
if (stats.cached > 0)   console.log("Cached:     " + stats.cached.toLocaleString()   + " tokens");
if (stats.thoughts > 0) console.log("Thoughts:   " + stats.thoughts.toLocaleString() + " tokens");
if (stats.tool > 0)     console.log("Tool:       " + stats.tool.toLocaleString()      + " tokens");
console.log("Input:      " + stats.input.toLocaleString()  + " tokens");
console.log("Output:     " + stats.output.toLocaleString() + " tokens");
if (stats.total > 0)    console.log("Total:      " + stats.total.toLocaleString()     + " tokens");
if (ratio > 0) {
  console.log("Est. Saved: " + estSaved.toLocaleString() + " tokens (" + Math.round(ratio * 100) + "% from compression)");
  console.log("Total Val:  " + (stats.output + estSaved).toLocaleString() + " tokens equivalent");
}
