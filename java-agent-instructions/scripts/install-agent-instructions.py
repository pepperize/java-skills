#!/usr/bin/env python3
"""Install or update Java skill self-review instructions."""

from __future__ import annotations

import argparse
from pathlib import Path

START = "<!-- java-skills:self-review:start -->"
END = "<!-- java-skills:self-review:end -->"

BLOCK = """<!-- java-skills:self-review:start -->
## Java Skill Self Review

After making Java code, test, or skill changes, review the diff before the final response.

- Treat relevant Java skills as executable checklists, not background reading.
- Before editing, name the applicable skills and the exact rules that constrain naming, exceptions, logging, validation, testing, and architecture.
- Use `java-domain-clarification` before coding when domain rules, identifiers, persistence shape, scoping, or externally visible behavior are unclear.
- Use `java-solid-review` for design, responsibility, SOLID, code-smell, and refactoring concerns.
- Use `java-readable-code` for naming, guard clauses, `Optional`, factories, utilities, and readability.
- Use `java-testing-style` for all test naming, mocks, unit/integration boundaries, assertions, layout, and verification scope.
- Use `java-logging-exceptions`, `java-spring-security`, and `java-flyway-migrations` when changes touch those areas.
- Use `java-clean-architecture` and `java-ddd-architecture` only when this project's instructions explicitly state those architectures.
- Before finalizing, review new or changed helper methods with `java-readable-code`.
- Before finalizing, review thrown/caught exceptions and logging decisions with `java-logging-exceptions`.
- Do not add defensive branches unless the domain/API path can actually produce that state.
- Fix issues found during self-review before finalizing.
- Keep cleanup scoped to the requested change.
<!-- java-skills:self-review:end -->
"""


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
    has_start = START in existing
    has_end = END in existing

    if has_start != has_end:
        raise ValueError("Found only one java-skills self-review marker; refusing to update.")

    if has_start:
        before, rest = existing.split(START, 1)
        _, after = rest.split(END, 1)
        return before.rstrip() + "\n\n" + BLOCK + after.lstrip()

    if not existing.strip():
        return BLOCK

    return existing.rstrip() + "\n\n" + BLOCK


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
