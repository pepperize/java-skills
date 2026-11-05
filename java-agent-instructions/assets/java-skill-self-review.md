<!-- java-skills:self-review:start -->
## Java Skill Self Review

After making Java code, test, or skill changes, review staged and unstaged diffs and task-created untracked files before the final response. Use `git status --short` to include files omitted by `git diff`.

These are decision and review reminders. Read the relevant skill and linked owner sections for complete rules rather than maintaining another policy catalog here.

- Before editing, identify the applicable Java skills and the rules that constrain the actual change.
- Use `java-domain-clarification` before coding when domain rules, identifiers, persistence shape, scoping, or externally visible behavior are unclear.
- Use `java-readable-code` for responsibility-based class/factory naming, dependency names, meaningful local operations, inspectable composition, `Optional`, and method naming. Review new or renamed classes and changed responsibilities as well as methods; update affected callers, tests, and docs.
- Use `java-solid-review` for explicit design/code reviews and self-review of non-trivial implementations/refactors. Report only material findings with the applicable principle; do not manufacture violations or print a principle checklist.
- Use `java-api-endpoints` for REST resource responsibilities, independent request/output contracts, persisted public output and HTTP responses. Keep rendered-page and traditional HTML-action contracts distinct.
- Use `java-request-validation` for binding, DTO ownership, input constraints, error mapping and browser submissions. Avoid duplicate request-shape checks while preserving domain invariants and meaningful transport/application boundaries.
- Use `java-templating` for typed page models, contextual escaping and localized authored page/email content with real-renderer coverage.
- Use `java-testing-style` for naming, mocks, assertions, explicit scenario setup, unit/integration boundaries and the narrowest credible verification, including changed security composition.
- Use `java-application-security` for external-input/regex safety and contextual output handling; keep stored values unescaped.
- Use `java-authentication-security` for credential policy/migration, login, sessions, recovery, throttling and MFA decisions, and `java-spring-security` for authorities, roles and object-scoped access.
- Use `java-logging-exceptions` for owned throws, narrow catches, proven conflict translation, security events and safe logs; use `java-flyway-migrations` for Flyway changes.
- Use `java-clean-architecture` and `java-ddd-architecture` only when this project's main instructions explicitly select those architectures.
- Check defensive branches against reachable domain/API states, fix material issues before finalizing, and keep cleanup scoped to the requested change.
<!-- java-skills:self-review:end -->
