# GEM-THAL (Gemini Compress)

High-signal compression extension for Gemini CLI. Increases information density by removing linguistic filler without sacrificing technical accuracy.

## Installation

1. Create extension directory:
   ```bash
   mkdir -p ~/.gemini/extensions/gemini-compress
   ```

2. Copy files to directory.

3. Restart Gemini CLI.

## Usage

- **Activate**: Type "activate compress" in Gemini CLI.
- **Deactivate**: Type "stop compress" or "normal mode".

## Principles

GEM-THAL enforces a direct, professional, and concise communication style:
- Omit articles (a/an/the) and filler words (just, really, basically, etc.).
- Remove pleasantry openers.
- Use fragments where appropriate.
- Maintain exact technical terms and code.

## Safety
Automatically reverts to full prose for:
- Security/data-loss warnings.
- Irreversible operations.
- Ambiguous logical sequences.

## Attribution
Inspired by [caveman](https://github.com/JuliusBrussee/caveman) by Julius Brussee.
