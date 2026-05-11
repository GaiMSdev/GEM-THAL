import re
import sys
import os

def compress_text(text):
    # 1. Protect code blocks
    blocks = []
    def save_block(m):
        blocks.append(m.group(0))
        return f"__BLOCK_{len(blocks)-1}__"
    
    # Save fenced code blocks and inline code
    text = re.sub(r'```[\s\S]*?```', save_block, text)
    text = re.sub(r'`[^`]*?`', save_block, text)

    # 2. Apply RUNES ULTRA compression on prose
    # Remove articles
    text = re.sub(r'\b(a|an|the)\b\s+', '', text, flags=re.IGNORECASE)
    # Remove filler words
    filler = r'\b(just|really|basically|actually|simply|essentially|generally|however|furthermore|additionally)\b'
    text = re.sub(filler, '', text, flags=re.IGNORECASE)
    # Remove pleasantries/hedging
    hedging = r'\b(sure|certainly|of course|happy to|i\'d recommend|it might be worth|you could consider)\b'
    text = re.sub(hedging, '', text, flags=re.IGNORECASE)
    
    # 3. Short synonyms / prose abbreviation logic
    # (Simplified for regex-only version)
    replacements = {
        r'\bconfiguration\b': 'cfg',
        r'\bdatabase\b': 'DB',
        r'\bauthentication\b': 'auth',
        r'\brequest\b': 'req',
        r'\bresponse\b': 'res',
        r'\bfunction\b': 'fn',
        r'\bimplementation\b': 'impl',
        r'\bcontext\b': 'ctx',
        r'\berror\b': 'err',
        r'\bmessage\b': 'msg',
        r'\bpackage\b': 'pkg',
        r'\benvironment\b': 'env',
        r'\binitialization\b': 'init',
        r'\breference\b': 'ref',
        r'\bvariable\b': 'var'
    }
    for old, new in replacements.items():
        text = re.sub(old, new, text, flags=re.IGNORECASE)

    # 4. Clean up whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    # Handle line breaks (rough approximation for markdown)
    text = text.replace(' #', '\n#').replace(' * ', '\n- ')

    # 5. Restore blocks
    for i, block in enumerate(blocks):
        text = text.replace(f"__BLOCK_{i}__", block)
    
    return text

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 runes-compress.py <file>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        sys.exit(1)
    
    with open(file_path, 'r') as f:
        original = f.read()
    
    compressed = compress_text(original)
    
    # Save backup
    backup_path = file_path + ".original.md"
    with open(backup_path, 'w') as f:
        f.write(original)
    
    # Save compressed
    with open(file_path, 'w') as f:
        f.write(compressed)
    
    orig_size = len(original)
    comp_size = len(compressed)
    savings = (1 - (comp_size / orig_size)) * 100 if orig_size > 0 else 0
    
    print(f"RUNES-COMPRESS COMPLETE")
    print(f"File: {file_path}")
    print(f"Backup: {backup_path}")
    print(f"Original size: {orig_size} chars")
    print(f"Compressed size: {comp_size} chars")
    print(f"Savings: {savings:.1f}%")
