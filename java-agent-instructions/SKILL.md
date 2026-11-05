---
name: java-agent-instructions
description: Installs or updates project-level agent instructions for Java projects that use these Java skills. Use when adding suggested Java skill self-review instructions to AGENTS.md, CLAUDE.md, or an equivalent agent instruction file.
---

# Java Agent Instructions

## Scope

Use this skill to install a small project-level instruction block that tells agents to self-review Java changes with the relevant Java skills.

Preserve existing project instructions. Do not replace an entire `AGENTS.md`, `CLAUDE.md`, or equivalent file.

## Target File

- If the user names a target file, use that file.
- Otherwise update root `AGENTS.md` when it exists.
- If `AGENTS.md` is absent but root `CLAUDE.md` exists, update `CLAUDE.md`.
- If neither exists, create root `AGENTS.md`.
- If both exist and the user did not choose, update `AGENTS.md` and leave `CLAUDE.md` unchanged.

## Install Workflow

1. Inspect the target instruction file before changing it.
2. Add or update the marked `Java Skill Self Review` block.
3. Keep existing unrelated instructions intact.
4. Do not infer that a project uses Clean Architecture or DDD; only project instructions can state that.
5. Review the diff for the target file before finalizing.

Prefer the bundled script for idempotent installs. Run it from the target repo root, resolving the script path relative to this skill directory:

```bash
python3 /path/to/java-agent-instructions/scripts/install-agent-instructions.py
```

Pass `--file CLAUDE.md` or another path when the user requests a specific target.

## Instruction Block

Before installing or reproducing the block, read [java-skill-self-review.md](assets/java-skill-self-review.md). It is the authoritative template used by the bundled installer; do not maintain another policy catalog or copy of the block in this file or the script.
