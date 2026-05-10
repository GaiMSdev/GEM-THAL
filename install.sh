#!/bin/bash
# Installation script for GEM-THAL (Gemini Compress)

set -e

DEST_DIR="$HOME/.gemini/extensions/gemini-compress"
mkdir -p "$DEST_DIR/hooks" "$DEST_DIR/scripts"

echo "📦 Installing GEM-THAL..."

# Copy logic (assuming execution from source root)
cp gemini-extension.json "$DEST_DIR/"
cp hooks/hooks.json "$DEST_DIR/hooks/"
cp scripts/*.js "$DEST_DIR/scripts/"

echo "✅ Installation complete."
echo "💡 Usage: Type 'activate compress' in your next Gemini CLI session."
