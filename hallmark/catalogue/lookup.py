#!/usr/bin/env python3
"""Optional offline catalogue retrieval. Source suggestions are not design authority."""

import argparse
from collections import Counter
import csv
import hashlib
import io
import json
from math import log
from pathlib import Path
import re
import sys
import unicodedata

BASE = Path(__file__).resolve().parent
COMMIT = "7f69fed6a2717900085f1bc3b263721f8ba025e2"
FILES = {"style": "styles.csv", "palette": "colors.csv", "typography": "typography.csv"}
STYLE_FIELDS = (
    "Style ID", "Style Category", "Aliases", "Status", "Parent Style ID",
    "Preferred Mode", "Type", "Keywords", "Primary Colors", "Secondary Colors",
    "Effects & Animation", "Best For", "Do Not Use For", "Light Mode ✓",
    "Dark Mode ✓", "Performance", "Accessibility", "Mobile-Friendly", "Complexity",
)
PALETTE_FIELDS = (
    "Product Type", "Primary", "On Primary", "Secondary", "On Secondary",
    "Accent", "On Accent", "Background", "Foreground", "Card", "Card Foreground",
    "Muted", "Muted Foreground", "Border", "Destructive", "On Destructive", "Ring", "Notes",
)
TYPE_FIELDS = (
    "Font Pairing Name", "Category", "Heading Font", "Body Font",
    "Mood/Style Keywords", "Best For", "Notes",
)
OUTPUT = {"style": STYLE_FIELDS, "palette": PALETTE_FIELDS, "typography": TYPE_FIELDS}
SEARCH = {
    "style": ("Style ID", "Style Category", "Aliases", "Keywords", "Best For", "Type"),
    "palette": ("Product Type", "Notes"),
    "typography": TYPE_FIELDS,
}
WARNINGS = [
    "The user brief and existing project tokens outrank catalogue suggestions.",
    "All fields are unverified source claims, including Do Not Use For and Accessibility; "
    "no accessibility certification is provided.",
    "Catalogue references grant no font or other asset license.",
    "Constraints are not enforced. Scores rank lexical matches, not confidence or design quality.",
]


def normalize(text):
    return " ".join(unicodedata.normalize("NFKC", text).casefold().split())


def tokens(text):
    """Unicode letters/numbers; no ASCII-only or minimum-length filter."""
    return re.findall(r"[^\W_]+", normalize(text))


def load_data(domain):
    """Read only fixed local paths; manifest paths are checked, never followed."""
    manifest_path = BASE / "provenance.json"
    if manifest_path.is_symlink() or not manifest_path.is_file():
        raise ValueError("provenance must be a regular local file")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest["schema_version"] != 1 or manifest["commit"] != COMMIT:
        raise ValueError("unsupported provenance schema or commit")
    meta = manifest["datasets"][domain]
    filename = FILES[domain]
    if (meta["file"] != "data/" + filename or
            meta["source_path"] != "src/ui-ux-pro-max/data/" + filename):
        raise ValueError("unexpected dataset path in provenance")
    path = BASE / "data" / filename
    if path.resolve() != path or path.is_symlink() or not path.is_file():
        raise ValueError("dataset must be a regular local file, not a redirected path")
    raw = path.read_bytes()
    if len(raw) != meta["bytes"] or hashlib.sha256(raw).hexdigest() != meta["sha256"]:
        raise ValueError("dataset integrity check failed")
    reader = csv.DictReader(io.StringIO(raw.decode("utf-8")), strict=True)
    required = set(OUTPUT[domain]) | {"No"}
    if domain == "style":
        required.update(("Replacement Domain", "Replacement ID"))
    if not required.issubset(reader.fieldnames or ()):
        raise ValueError("dataset columns are incomplete")
    rows = list(reader)
    if len(rows) != meta["rows"] or not rows:
        raise ValueError("dataset row count is invalid")
    for row in rows:
        if None in row or any(row.get(key) is None for key in required):
            raise ValueError("dataset contains a malformed row")
        if domain == "style":
            if row["Status"] not in ("active", "supplemental", "deprecated"):
                raise ValueError("unknown style status")
            if row["Status"] == "deprecated" and not (
                    row["Replacement Domain"] and row["Replacement ID"]):
                raise ValueError("deprecated style has no redirect")
    return rows, meta


def is_exact(row, query):
    identities = [row["Style ID"], row["Style Category"], *row["Aliases"].split("|")]
    return normalize(query) in {normalize(value) for value in identities if value.strip()}


def rank(rows, domain, query):
    """BM25 (k1=1.5, b=.75), exact style identity first, source-order ties.

    Any positive lexical overlap is a candidate, not a relevance guarantee.
    Deprecated styles participate only on exact identity, and then only as redirects.
    """
    candidates = [(i, row) for i, row in enumerate(rows, 1)
                  if domain != "style" or row["Status"] != "deprecated" or is_exact(row, query)]
    documents = [Counter(tokens(" ".join(row[key] for key in SEARCH[domain])))
                 for _, row in candidates]
    frequencies = Counter(token for doc in documents for token in doc)
    average = sum(sum(doc.values()) for doc in documents) / (len(documents) or 1) or 1
    query_tokens = sorted(set(tokens(query)))
    ranked = []
    for (source_row, row), doc in zip(candidates, documents):
        exact = domain == "style" and is_exact(row, query)
        matched = [token for token in query_tokens if token in doc]
        score = 0.0
        for token in matched:
            df = frequencies[token]
            idf = log(1 + (len(documents) - df + 0.5) / (df + 0.5))
            tf = doc[token]
            score += idf * tf * 2.5 / (tf + 1.5 * (0.25 + 0.75 * sum(doc.values()) / average))
        if exact or score > 0:
            ranked.append((exact, score, source_row, row, matched))
    # Python's stable sort preserves source order for equal exactness and scores.
    return sorted(ranked, key=lambda item: (item[0], item[1]), reverse=True)


def lookup(domain, query, limit):
    rows, meta = load_data(domain)
    ranked = rank(rows, domain, query)
    results = []
    for exact, score, source_row, row, matched in ranked[:limit]:
        status = row["Status"] if domain == "style" else "active"
        result = {
            "source": {"row": source_row, "no": row["No"],
                       "id": row["Style ID"] if domain == "style" else row["No"],
                       "commit": COMMIT, "path": meta["source_path"]},
            "status": status,
            "match": "exact" if exact else "lexical",
            "match_tokens": matched,
            "ranking_score": round(score, 8),
            "claims_verified": False,
            "fields": {key: row[key] for key in OUTPUT[domain]},
        }
        if status == "deprecated":
            result["redirect"] = {"domain": row["Replacement Domain"], "id": row["Replacement ID"]}
        results.append(result)
    status = "ok" if results else "no_match"
    if results and results[0]["status"] == "deprecated":
        status = "deprecated_redirect"
    return {
        "schema": "hallmark.catalogue.v1", "domain": domain, "query": query,
        "source": {"commit": COMMIT, "path": meta["source_path"], "sha256": meta["sha256"]},
        "status": status, "no_match": not results, "fallback_used": False,
        "constraints_enforced": False, "limit": limit,
        "truncated": len(ranked) > limit, "total_matches": len(ranked),
        "warnings": WARNINGS, "results": results,
    }


def query_arg(value):
    if not value.strip() or len(value) > 500:
        raise argparse.ArgumentTypeError("query must contain 1..500 characters and not be blank")
    return value


def limit_arg(value):
    try:
        number = int(value)
    except ValueError:
        raise argparse.ArgumentTypeError("limit must be an integer from 1 to 10") from None
    if not 1 <= number <= 10:
        raise argparse.ArgumentTypeError("limit must be an integer from 1 to 10")
    return number


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Optional offline catalogue lookup (Python 3 standard library). "
                    "No writes, network, environment reads, or generated code. "
                    "Success: JSON on stdout; errors: stderr. No constraints are enforced.",
        epilog="Examples: python3 lookup.py style 'Minimalism (Frame)' --limit 2; "
               "python3 lookup.py palette 'SaaS (General)'; "
               "python3 lookup.py typography 'editorial'. "
               "Fixed adjacent data and provenance.json are required. "
               "Exit codes: 0 success (including no match), 2 invalid input, 1 data error. "
               "No fuzzy fallback or continuation: narrow the query when truncated.",
        allow_abbrev=False,
    )
    parser.add_argument("domain", choices=tuple(FILES))
    parser.add_argument("query", type=query_arg, help="lexical query, 1..500 characters; quote spaces")
    parser.add_argument("--limit", type=limit_arg, default=3, help="maximum candidates, 1..10 (default: 3)")
    args = parser.parse_args(argv)
    try:
        result = lookup(args.domain, args.query, args.limit)
    except (OSError, ValueError, KeyError, TypeError, csv.Error) as exc:
        print("catalogue data error: " + str(exc) + "; restore the pinned data/provenance bundle.",
              file=sys.stderr)
        return 1
    print(json.dumps(result, ensure_ascii=True, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
