#!/usr/bin/env python3
"""Install or update Java skill self-review instructions."""

from __future__ import annotations

import argparse
from pathlib import Path

START = "<!-- java-skills:self-review:start -->"
END = "<!-- java-skills:self-review:end -->"

TEMPLATE = Path(__file__).resolve().parent.parent / "assets" / "java-skill-self-review.md"
BLOCK = TEMPLATE.read_text(encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Install Java skill self-review instructions into AGENTS.md or CLAUDE.md."
    )
    parser.add_argument(
        "--file",
        help="Instruction file to update. Defaults to AGENTS.md, existing CLAUDE.md, or new AGENTS.md.",
    )
    return parser.parse_args()


def resolve_target(requested_file: str | None) -> Path:
    if requested_file:
        return Path(requested_file)

    agents = Path("AGENTS.md")
    claude = Path("CLAUDE.md")

    if agents.exists():
        return agents

    if claude.exists():
        return claude

    return agents


def update_content(existing: str) -> str:
    start_count = existing.count(START)
    end_count = existing.count(END)

    if start_count != end_count or start_count > 1:
        raise ValueError("Malformed or duplicate java-skills self-review markers; refusing to update.")

    if start_count:
        start = existing.index(START)
        end = existing.index(END) + len(END)
        if end <= start:
            raise ValueError("Reversed java-skills self-review markers; refusing to update.")
        return existing[:start] + BLOCK.rstrip("\n") + existing[end:]

    if not existing.strip():
        return BLOCK

    return existing.rstrip("\n") + "\n\n" + BLOCK


def main() -> None:
    args = parse_args()
    target = resolve_target(args.file)

    existing = target.read_text(encoding="utf-8") if target.exists() else ""
    updated = update_content(existing)

    target.write_text(updated, encoding="utf-8")
    action = "Updated" if existing else "Created"
    print(f"{action}: {target}")


if __name__ == "__main__":
    main()
