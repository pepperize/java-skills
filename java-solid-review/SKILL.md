---
name: java-solid-review
description: Reviews and guides Java code for SOLID principles, responsibility boundaries, code smells, and pragmatic OO design. Use when reviewing, refactoring, or designing Java classes, services, ports, adapters, factories, policies, or collaborators for maintainability and testability.
---

# Java SOLID Review

## Scope

Use this skill as a design-review lens for Java production code.

- Treat SOLID and object-oriented design rules as heuristics, not automatic mandates.
- Prefer maintainable, testable, intention-revealing code over pattern-heavy code.
- Do not introduce abstractions for hypothetical future needs.
- Apply project conventions and more specific Java skills first when they are relevant.

## Skill Precedence

- For tests, use `java-testing-style`. This skill must not override its rules for test naming, mocking style, unit versus integration boundaries, assertions, layout, or verification scope.
- For readable Java naming, guard clauses, `Optional`, factories, utilities, and test-only production code, use `java-readable-code`.
- For domain-sensitive behavior, identifiers, persistence shape, or invariants, use `java-domain-clarification` before proposing or coding changes when rules are unclear.
- Use `java-clean-architecture` only when the project instructions explicitly state Clean Architecture.
- Use `java-ddd-architecture` only when the project instructions explicitly state DDD or Domain-Driven Design.

## Review Workflow

1. Identify the production behavior and the reason this code needs to change.
2. Locate the primary responsibility of each affected class or method.
3. Check for SOLID violations that create real change, testability, or comprehension risk.
4. Prefer the smallest refactor that removes the risk without changing behavior.
5. Verify with the narrowest credible test scope, following `java-testing-style`.

## SOLID Checks

### Single Responsibility

- A class should have one clear reason to change.
- Split classes that mix orchestration, mapping, persistence, formatting, logging decisions, validation, and business policy.
- Keep related behavior together when splitting would only scatter one cohesive concept.

### Open/Closed

- Add extension points only when variation is real or already emerging.
- Prefer explicit conditionals for simple stable rules.
- Prefer policies, strategies, factories, or polymorphism when conditionals are repeated, growing, or changing independently.

### Liskov Substitution

- Implementations of the same interface must honor the same contract.
- Avoid implementations that throw unsupported-operation exceptions for ordinary interface methods.
- Do not require callers to inspect concrete implementation types to use an abstraction safely.

### Interface Segregation

- Keep ports and interfaces focused on what their callers actually need.
- Split interfaces when implementations are forced to stub, ignore, or reject unrelated methods.
- Avoid broad `Manager`, `Service`, `Client`, or `Repository` APIs that mix unrelated capabilities.

### Dependency Inversion

- Business and application logic should depend on stable abstractions when concrete infrastructure would make behavior hard to test or change.
- Do not add interfaces only to satisfy a principle; a single concrete collaborator can be acceptable when it is stable, local, and easy to test.
- Keep framework, transport, persistence, and third-party details out of domain and application behavior where the project architecture expects that separation.

## Code Smell Signals

Investigate these as risks, not proof of defects:

- Long methods that hide multiple decisions or phases.
- Large classes with unrelated responsibilities.
- Long parameter lists that carry a repeated concept.
- Primitive obsession around identifiers, money, permissions, status, or other domain concepts.
- Repeated conditional logic over the same type, status, or capability.
- Feature envy where a method mostly manipulates another object's data.
- Shotgun surgery where one behavior change requires edits across many unrelated files.
- Speculative abstractions, unused extension points, or "just in case" code.

## Refactoring Rules

- Preserve externally visible behavior unless the user explicitly asked to change it.
- Refactor in small steps and keep tests green.
- Prefer named cohesive collaborators over broad utility classes.
- Prefer composition over inheritance unless inheritance is required by framework contracts or a true substitutable type hierarchy.
- Use design patterns only when they simplify a current problem and match existing project language.
- Wait for evidence before extracting shared abstractions; duplication is often cheaper than the wrong abstraction.

## Review Output

When reviewing code, report findings in severity order with file and line references.

For each finding, include:

- The concrete risk.
- The affected responsibility or SOLID principle.
- The smallest practical fix.
- The test impact, expressed according to `java-testing-style`.
