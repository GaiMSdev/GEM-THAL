#!/usr/bin/env python3
"""
BM004: Gemini direct API A/B for baseline, terse, runes-full, runes-hybrid.

Requires GEMINI_API_KEY or GOOGLE_API_KEY. This intentionally avoids Gemini CLI
sessions so results are not contaminated by extension hooks or chat history.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request


MODES = {
    "baseline": "",
    "terse": "Answer concisely.",
    "runes_full": "COMPRESS FULL: Drop articles. Fragments OK.",
    "runes_hybrid": (
        "COMPRESS HYBRID: Combined technique. Broken-English + abbrev. "
        "Use 'Me' + subject/verb fragment. Dense logic via ->. Maximize token-savings."
    ),
}

PROMPTS = [
    "Explain why a React component re-renders when passed a new inline object prop. Include the fix.",
    "Summarize this incident: auth service returned 401 for expired refresh tokens after clock skew. State cause, impact, fix.",
    "Review this change: cache user permissions for 10 minutes in Redis. Mention two risks and one test.",
    "Give a migration plan from SQLite to Postgres for a small SaaS app with minimal downtime.",
    "Explain how to debug a Node.js memory leak in production without taking the service down.",
    "Write release notes for a bugfix that preserves file paths while compressing prose descriptions.",
]


def request_json(url: str, payload: dict, timeout: int) -> dict:
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as res:
            return json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Gemini API HTTP {e.code}: {detail}") from e


def generate(api_key: str, model: str, mode: str, prompt: str, timeout: int) -> dict:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.0},
    }
    instruction = MODES[mode]
    if instruction:
        payload["systemInstruction"] = {"parts": [{"text": instruction}]}
    data = request_json(url, payload, timeout)
    usage = data.get("usageMetadata", {})
    text = ""
    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError):
        pass
    return {
        "mode": mode,
        "prompt": prompt,
        "output_text": text,
        "output_chars": len(text),
        "prompt_tokens": usage.get("promptTokenCount", 0),
        "output_tokens": usage.get("candidatesTokenCount", 0),
        "total_tokens": usage.get("totalTokenCount", 0),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default=os.environ.get("GEMINI_MODEL", "gemini-2.5-flash"))
    parser.add_argument("--repeat", type=int, default=1)
    parser.add_argument("--timeout", type=int, default=60)
    parser.add_argument("--json", action="store_true", help="Emit raw JSON results.")
    args = parser.parse_args()

    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print("BLOCKED: set GEMINI_API_KEY or GOOGLE_API_KEY to run BM004.", file=sys.stderr)
        return 2

    rows = []
    for _ in range(args.repeat):
        for prompt in PROMPTS:
            for mode in MODES:
                rows.append(generate(api_key, args.model, mode, prompt, args.timeout))
                time.sleep(0.2)

    totals = {}
    for row in rows:
        bucket = totals.setdefault(row["mode"], {"output": 0, "total": 0, "chars": 0, "n": 0})
        bucket["output"] += row["output_tokens"]
        bucket["total"] += row["total_tokens"]
        bucket["chars"] += row["output_chars"]
        bucket["n"] += 1

    baseline = max(totals["baseline"]["output"], 1)
    terse = max(totals["terse"]["output"], 1)
    summary = []
    for mode, data in totals.items():
        summary.append({
            "mode": mode,
            "calls": data["n"],
            "output_tokens": data["output"],
            "total_tokens": data["total"],
            "output_savings_vs_baseline_pct": round((baseline - data["output"]) / baseline * 100, 1),
            "output_delta_vs_terse_pct": round((terse - data["output"]) / terse * 100, 1),
            "output_chars": data["chars"],
        })

    result = {"model": args.model, "summary": summary, "rows": rows}
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(f"BM004 Gemini HYBRID A/B — model={args.model}")
        print("| mode | calls | output_tokens | total_tokens | vs baseline | vs terse |")
        print("|---|---:|---:|---:|---:|---:|")
        for item in summary:
            print(
                f"| {item['mode']} | {item['calls']} | {item['output_tokens']} | "
                f"{item['total_tokens']} | {item['output_savings_vs_baseline_pct']}% | "
                f"{item['output_delta_vs_terse_pct']}% |"
            )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
