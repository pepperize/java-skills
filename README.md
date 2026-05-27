# java-skills

Reusable Java agent skills for applying company engineering standards across Java and Spring codebases.

## Skills

- `java-readable-code`: readable Java code, focused responsibilities, factory naming, `Optional` usage, and avoiding hard-to-read nested method calls.
- `java-testing-style`: unit and integration testing conventions, London-style defaults, test layout, naming, and verification scope.
- `java-logging-exceptions`: logging and exception placement guidance for domain-relevant failures and technical boundaries.
- `java-domain-clarification`: clarification workflow before domain-sensitive implementation changes.
- `java-clean-architecture`: Clean Architecture guidance for Java projects. This skill is guarded and should only be used when the project's main instruction file explicitly states Clean Architecture.
- `java-ddd-architecture`: DDD guidance for Java projects, including Spring configuration placement and Spring web boundary naming. This skill is guarded and should only be used when the project's main instruction file explicitly states DDD or Domain-Driven Design.
- `java-spring-security`: Spring Security authorization conventions for controller boundaries, capabilities, roles, and object-scoped permissions.
- `java-flyway-migrations`: Flyway migration creation and timestamp-based version naming conventions.

## Architecture Skill Activation

Architecture skills are intentionally conditional. They should not be activated just because a task mentions architecture, refactoring, or design.

Use `java-clean-architecture` only when `AGENTS.md`, `CLAUDE.md`, or the project's equivalent main instruction file explicitly states that the project uses Clean Architecture.

Use `java-ddd-architecture` only when the main instruction file explicitly states that the project uses DDD or Domain-Driven Design.

## Local Installation

Install or refresh links into the local agent skills directory.

Linux:

```bash
./scripts/install-local-skills.sh
```

macOS:

```bash
./scripts/install-local-skills-macos.sh
```

Windows PowerShell:

```powershell
.\scripts\install-local-skills-windows.ps1
```

Set `AGENTS_SKILLS_DIR` to install somewhere other than `$HOME/.agents/skills`.
