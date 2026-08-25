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

```md
<!-- java-skills:self-review:start -->
## Java Skill Self Review

After making Java code, test, or skill changes, review the diff before the final response.

- Treat relevant Java skills as executable checklists, not background reading.
- Before editing, name the applicable skills and the exact rules that constrain naming, exceptions, logging, validation, testing, and architecture.
- Use `java-domain-clarification` before coding when domain rules, identifiers, persistence shape, scoping, or externally visible behavior are unclear.
- Use `java-solid-review` for design, responsibility, SOLID, code-smell, and refactoring concerns.
- Use `java-readable-code` for naming, guard clauses, `Optional`, factories, utilities, and readability.
- Use `java-testing-style` for all test naming, mocks, unit/integration boundaries, assertions, layout, and verification scope.
- Use `java-application-security` for input validation, regex safety, and other application-security-sensitive code paths.
- Use `java-logging-exceptions`, `java-spring-security`, and `java-flyway-migrations` when changes touch those areas.
- Use `java-clean-architecture` and `java-ddd-architecture` only when this project's instructions explicitly state those architectures.
- Before finalizing, review new or changed helper methods with `java-readable-code`.
- Before finalizing, review thrown/caught exceptions and logging decisions with `java-logging-exceptions`.
- Do not add defensive branches unless the domain/API path can actually produce that state.
- Fix issues found during self-review before finalizing.
- Keep cleanup scoped to the requested change.
<!-- java-skills:self-review:end -->
```
