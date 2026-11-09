# java-skills

Reusable Java agent skills for applying company engineering standards across Java and Spring codebases.

## Skills

- `java-readable-code`: readable orchestration, responsibility-based class/factory and dependency names, inspectable composition, and `Optional` usage.
- `java-testing-style`: unit and integration testing conventions, London-style defaults, test layout, naming, and verification scope.
- `java-solid-review`: SOLID and related engineering principles, concrete design findings, and non-trivial implementation self-review with Java examples. Testing guidance stays delegated to `java-testing-style`.
- `java-agent-instructions`: installs or updates project-level `AGENTS.md`/`CLAUDE.md` instructions for Java skill self-review.
- `java-logging-exceptions`: logging and exception placement guidance for domain-relevant failures and technical boundaries.
- `java-application-security`: application security guidance for external-input validation and regex safety.
- `java-domain-clarification`: clarification workflow before domain-sensitive implementation changes.
- `java-clean-architecture`: Clean Architecture guidance for Java projects. This skill is guarded and should only be used when the project's main instruction file explicitly states Clean Architecture.
- `java-ddd-architecture`: DDD guidance for Java projects, including Spring configuration placement and Spring web boundary naming. This skill is guarded and should only be used when the project's main instruction file explicitly states DDD or Domain-Driven Design.
- `java-spring-security`: Spring Security authorization conventions for controller boundaries, capabilities, roles, and object-scoped permissions.
- `java-flyway-migrations`: Flyway migration creation and timestamp-based version naming conventions.
- `java-api-endpoints`: REST resource responsibilities, separate request/output contracts, authoritative persisted output, and HTTP responses, with a worked Spring MVC example.
- `java-request-validation`: framework binding, Bean Validation, input/application ownership, Problem Details, and browser submission contracts.
- `java-templating`: typed page models, contextual output escaping, and complete localized page/email templates using the established engine.
- `java-authentication-security`: credential policy and migration, login protection, sessions, recovery tokens, and MFA decisions using existing authentication infrastructure.

## Java Adaptation And Rule Ownership

Shared engineering guidance is adapted to Java rather than copied from PHP frameworks. Preserve established Spring Data names and `Optional` absence contracts, real transaction/flush behavior, the target framework's binding and error policy, and explicit domain invariants. HTTP and presentation examples do not activate an architecture skill or require new infrastructure.

Each rule has an owning skill: readable code owns naming/local operations; API endpoints own resource contracts; request validation owns binding/input errors; templating owns rendered content; authentication and Spring Security own identity lifecycle and access decisions. Cross-links route to those owners rather than duplicating policy. The agent-instruction installer reads its single canonical block from `java-agent-instructions/assets/java-skill-self-review.md`.

## Verification

Behavioral skill evaluations and their execution instructions are in [evals/README.md](evals/README.md). Installer regression checks run without external services:

```bash
python3 -m unittest discover -s java-agent-instructions/tests -v
```

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

## License

This project is licensed under the Apache License 2.0. You may use, copy, modify, distribute, and adapt this skill collection, including for commercial purposes, subject to the terms of the license.

Attribution is appreciated via a link back to the original repository: https://github.com/pepperize/java-skills.

The skill collection is provided "as is", without warranties or conditions of any kind. As summarized from the Apache License 2.0 disclaimer and limitation of liability, except where required by applicable law or agreed in writing, Pepperize UG is not responsible for harm, damages, or losses arising from use of the skill collection.
