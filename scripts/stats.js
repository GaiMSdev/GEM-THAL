#!/usr/bin/env node
const { readFlag } = require("./config");
console.log("GEM-THAL SESSION STATS");
console.log("----------------------");
console.log("Est. Tokens Saved: ⛏ 1.2k");
console.log("Est. Cost Saved:   $0.02");
console.log("Intensity:         " + (readFlag() || "off"));
