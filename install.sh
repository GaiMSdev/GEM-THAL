#!/bin/bash
# Installation script for GEM-THAL (Gemini Token-Highly-Accelerated-Logic)

set -e

# Support GEMINI_CONFIG_DIR or default to ~/.gemini
GEMINI_DIR="${GEMINI_CONFIG_DIR:-$HOME/.gemini}"
DEST_DIR="$GEMINI_DIR/extensions/gem-thal"

mkdir -p "$DEST_DIR/hooks" "$DEST_DIR/scripts" "$DEST_DIR/skills"

echo "📦 Installing GEM-THAL..."

# Copy logic (assuming execution from source root)
cp gemini-extension.json "$DEST_DIR/"
cp -R hooks/ "$DEST_DIR/hooks/"
cp -R scripts/ "$DEST_DIR/scripts/"
cp -R skills/ "$DEST_DIR/skills/"
cp LICENSE README.md "$DEST_DIR/" || true

echo "✅ Installation complete."
echo "💡 Usage: Type 'activate compress' in your next Gemini CLI session."
