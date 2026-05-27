---
name: java-readable-code
description: Use when writing, refactoring, or reviewing Java production code around readability, responsibilities, naming, Optional usage, guard clauses, factories, utilities, or test-only production code.
---

# Java Readable Code

## Default Style

- Prefer small focused classes, explicit responsibilities, intention-revealing names, readable control flow, and minimal incidental complexity.
- Prefer GoF design patterns where they fit naturally.
- Avoid broad utility classes that mix unrelated concerns such as creation, mapping, conversion, logging, and key formatting; extract cohesive collaborators with narrow names instead.
- Avoid passing non-trivial method calls directly as arguments when an intermediate variable would clarify intent. Name semantically important intermediate results.
- Prefer simple, common words that non-native speakers can read without looking them up.

## Guard Clauses

- Do not use `org.springframework.util.Assert` in application, domain, or service code.
- Prefer explicit guard clauses with normal `if` statements and meaningful exceptions.
- At API boundaries, prefer Bean Validation annotations where appropriate.
- Inside business logic, prefer explicit checks over assertion utilities.

## Factories

When a class mainly creates a returned object, prefer the Factory pattern: name the class after the product plus `Factory`, and name the main method `create(...)`.

## Method Names

- Methods should read as actions. Prefer verb phrases such as `createMissingTranslationSkip`, `collectRoutes`, `resolveCountryCode`, or `publishSeoData`.
- Avoid noun/adjective-only method names like `missingTranslation(...)` unless the method is a JavaBean getter, record accessor, enum/value property, or boolean predicate.
- Boolean predicates should still read clearly as questions or states, using `is`, `has`, `can`, `should`, or similar.
- Static factory methods should also use an action-oriented name unless they are established Java conventions such as `of(...)`, `from(...)`, or `valueOf(...)`.

## Static Helpers

- Do not add static helper or factory methods in project-owned Java code by default.
- Static methods hinder testability and should earn their place; tolerate them mainly for third-party APIs, Java conventions, or existing framework contracts.
- For simple records and value objects, prefer direct construction over static factories that only fill one obvious field or wrap a constructor without adding a meaningful invariant.
- If construction logic becomes non-trivial, prefer an injectable factory or collaborator over a project-owned static helper.

## Refactoring API Cleanup

- After changing a method signature or introducing a richer return type, check production call sites before keeping old compatibility methods.
- Do not keep production methods that are only called by tests. Tests should follow the production API, not preserve dead API surface.
- Avoid paired public methods for the same operation, such as `create(...)` and `createWith...(...)`, unless both are required by production or an external contract.
- If compatibility is intentionally kept, identify the production or external caller that still needs it.

## Optional

- Prefer `Optional` as a return type at absence-producing boundaries.
- Avoid `Optional` as a method parameter. Resolve absence at the caller or boundary and pass a concrete domain object, explicit overload, or purpose-named value instead.

## Tests And Production Code

Do not add production code only to make tests easier. Avoid test-only constructors, fallbacks, flags, or branches; tests should construct collaborators explicitly or use proper mocking and injection.
