#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let inputRaw = "";
process.stdin.on("data", c => { inputRaw += c; });
process.stdin.on("end", () => {
  try {
    const input = JSON.parse(inputRaw);
    const { tool_name, tool_input, tool_response, cwd } = input;
    if (tool_response && tool_response.error) return process.exit(0);
    const writeTools = ["write_file", "replace", "sed"];
    if (!writeTools.includes(tool_name)) return process.exit(0);
    const filePath = tool_input.file_path;
    if (!filePath) return process.exit(0);
    const absPath = path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath);
    const isMarkdown = absPath.endsWith('.md');
    const isMemoryFile = absPath.includes('GEMINI.md') || absPath.includes('CLAUDE.md') || absPath.includes('MEMORY.md') || absPath.includes('AGENT');
    if (isMarkdown && isMemoryFile) {
      const compressScript = path.join(__dirname, "runes-compress.py");
      if (fs.existsSync(compressScript)) {
        try {
          execSync("python3 " + '"' + compressScript + '" "' + absPath + '"', { stdio: 'ignore' });
          process.stdout.write(JSON.stringify({
            systemMessage: "🟢 [RUNES:AUTO-COMPRESSED] " + path.basename(absPath)
          }));
        } catch (e) {}
      }
    }
  } catch (e) {}
});
