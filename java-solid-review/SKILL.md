---
name: java-solid-review
description: Reviews and guides Java code for SOLID principles, responsibility boundaries, code smells, and pragmatic OO design. Use when reviewing, refactoring, or designing Java classes, services, ports, adapters, factories, policies, or collaborators for maintainability and testability.
---

# Java SOLID Review

## Scope
- Treat SOLID and object-oriented design rules as heuristics, not automatic mandates.
- Prefer maintainable, testable, intention-revealing, simple local designs over pattern-heavy code or hypothetical abstractions and optimizations.
- Apply project conventions and more specific Java skills first when they are relevant.

## Skill Precedence
- For tests, use `java-testing-style`. This skill must not override its rules for test naming, mocking style, unit versus integration boundaries, assertions, layout, or verification scope.
- For readable Java naming, guard clauses, `Optional`, factories, utilities, and test-only production code, use `java-readable-code`.
- For domain-sensitive behavior, identifiers, persistence shape, or invariants, use `java-domain-clarification` before proposing or coding changes when rules are unclear.
- Use `java-clean-architecture` and `java-ddd-architecture` only when project instructions explicitly state those architectures; do not move code across such boundaries as incidental cleanup.

## Review Workflow
1. Identify production behavior, required change, root cause, responsibilities, contracts, and boundaries before editing non-trivial code.
2. Locate the primary responsibility of each affected class or method.
3. Check for SOLID violations, hidden assumptions, or mixed concerns that create real change, testability, or comprehension risk.
4. Prefer the simplest local or vertical-slice refactor that removes the risk without changing behavior.
5. Verify with the narrowest credible test scope, following `java-testing-style`.

## SOLID Checks

### Single Responsibility

- A class should have one clear reason to change.
- Split classes that mix orchestration, mapping, transport, persistence, transactionality, caching, tracing, logging decisions, validation, and business policy.
- Keep related behavior together when splitting would only scatter one cohesive concept.
- Keep each method at one clear level of abstraction: either orchestrate steps or perform focused logic; avoid mixing framework calls, data manipulation, dependency traversal, and dense decisions.

### Open/Closed

- Add extension points only when variation is real or already emerging.
- Prefer explicit conditionals for simple stable rules.
- Prefer policies, strategies, factories, or polymorphism when conditionals are repeated, growing, or changing independently.

### Liskov Substitution

- Implementations of the same interface must honor the same contract: do not narrow accepted inputs, add unexpected exception paths, or weaken postconditions.
- Do not require callers to inspect concrete implementation types or handle unsupported ordinary operations.
- Judge inheritance by behavior, not shared structure; prefer composition unless inheritance is required by framework contracts or a true substitutable hierarchy.

### Interface Segregation

- Keep ports and interfaces focused on what their callers actually need.
- Split interfaces when implementations are forced to stub, ignore, or reject unrelated methods.
- Treat module, component, and port boundaries as contracts; expose caller-needed behavior and semantics, not implementation structure.
- Interface methods should express what callers need, not how one implementation happens to fulfill it. Do not add parameters, return shapes, methods, or exceptions to an interface solely because one implementation needs collaborator data or technical context. Prefer moving that dependency into the implementation, composing with another port or collaborator, or introducing a purpose-named application input only when the caller truly owns that choice.

### Dependency Inversion

- Business and application logic should depend on stable abstractions when concrete infrastructure would make behavior hard to test or change.
- Prefer constructor injection for required collaborators.
- Avoid hidden construction, dependency lookup, or global access in business logic when it makes behavior harder to test or change.
- Keep Spring or IoC container APIs at wiring boundaries; if a constructor has many required collaborators, review SRP before hiding dependencies.
- Do not add interfaces only to satisfy a principle; a concrete collaborator can be acceptable when it is stable, local, and easy to test.
- Keep framework, transport, persistence, and third-party details out of domain and application behavior where the project architecture expects that separation.

## Code Smell Signals

Investigate these as risks, not proof of defects:

- Long methods that hide multiple decisions or phases.
- Large classes with unrelated responsibilities.
- Long parameter lists that carry a repeated concept.
- Duplicated business knowledge, mappings, protocol rules, or decisions.
- Primitive obsession around identifiers, money, permissions, status, or other domain concepts.
- Repeated conditional logic over the same type, status, or capability.
- Feature envy, collaborator chains, or methods that mix orchestration with calculation, transformation, validation, or business branching.
- Public methods that hide state changes, expose internals, require callers to ask for state before acting, or behave differently than their names imply.
- Shotgun surgery where one behavior change requires edits across many unrelated files.
- Speculative abstractions, unused extension points, premature configurability, or "just in case" code.
- Low-level performance tuning without a measured bottleneck or stated requirement.
- Comments that explain what code does instead of why a decision exists.

## Refactoring Rules

- Preserve externally visible behavior unless the user explicitly asked to change it.
- Refactor in small steps, keep tests green, and do larger structural refactors only with enough automated safety net; if coverage is missing, add characterization or focused tests according to `java-testing-style`.
- Prefer rename, extract method, extract class or collaborator, and move method before larger redesigns.
- Prefer named cohesive collaborators over broad utility classes.
- Use design patterns only when they simplify a current problem and match existing project language.
- Remove duplicated knowledge, not merely similar-looking code.
- Wait for evidence before extracting shared abstractions; if the requirement is unclear or speculative, defer the abstraction.
- Prefer executable vertical slices over horizontal infrastructure-only expansion unless the user explicitly requested foundation work.
- Treat static-analysis warnings and metrics as evidence for investigation, not automatic design conclusions.
- Do not optimize for performance without evidence; check algorithms, data access, and boundaries before low-level tuning.
- Leave touched code slightly clearer than found, but keep cleanup local to the requested change.

## Review Output

When reviewing code, report findings in severity order with file and line references. Use findings to expose unclear responsibilities, hidden assumptions, and requirement ambiguity, not just style issues. For each finding, include:

- The concrete risk.
- The affected responsibility or SOLID principle.
- The smallest practical fix.
- The test impact, expressed according to `java-testing-style`.
