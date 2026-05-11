# runes-shrink

MCP proxy that compresses tool/resource descriptions before the model sees them.
Reduces input tokens 10-40% on tool-heavy sessions. Zero dependencies, pure Node.

## How it works

Sits between Gemini CLI and any MCP server. Intercepts `tools/list`, `prompts/list`,
`resources/list` responses and compresses `description` fields using the same
boundaries as runes-compress: code, URLs, paths, identifiers preserved exactly.

Tool call results are NOT touched — only metadata descriptions.

## Setup

Wrap any MCP server by prepending the shrink proxy in your Gemini CLI config:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "node",
      "args": [
        "/Users/robert/.gemini/extensions/gem-thal/mcp-shrink/index.js",
        "npx", "@modelcontextprotocol/server-filesystem", "/your/path"
      ]
    }
  }
}
```

Instead of the direct server:
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "/your/path"]
    }
  }
}
```

## Debug

```bash
RUNES_SHRINK_DEBUG=1 node index.js <upstream> [...args]
```

Logs `arrayName.toolName.field: before→after chars` to stderr.

## Extra fields

```bash
RUNES_SHRINK_FIELDS=description,title node index.js <upstream>
```

Default: `description` only.
