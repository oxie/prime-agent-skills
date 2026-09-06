#!/usr/bin/env python3
"""Activate the Git-synced global Prime Agent instructions safely."""

from pathlib import Path
import os
import sys


def main() -> int:
    repo = Path(__file__).resolve().parent
    source = repo / "config" / "AGENTS.md"
    target = Path.home() / ".prime" / "agent" / "AGENTS.md"

    if not source.is_file():
        print(f"missing activation source: {source}", file=sys.stderr)
        return 1

    target.parent.mkdir(parents=True, exist_ok=True)
    if target.is_symlink():
        if target.resolve() == source.resolve():
            print(f"already active: {target} -> {source}")
            return 0
        print(f"refusing to replace existing symlink: {target}", file=sys.stderr)
        return 2
    if target.exists():
        print(
            f"refusing to overwrite existing global instructions: {target}\n"
            f"merge {source} manually instead",
            file=sys.stderr,
        )
        return 2

    relative_source = os.path.relpath(source, target.parent)
    target.symlink_to(relative_source)
    if target.resolve() != source.resolve():
        print("activation symlink verification failed", file=sys.stderr)
        return 1
    print(f"activated: {target} -> {relative_source}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
