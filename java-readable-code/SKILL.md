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

## Optional

- Prefer `Optional` as a return type at absence-producing boundaries.
- Avoid `Optional` as a method parameter. Resolve absence at the caller or boundary and pass a concrete domain object, explicit overload, or purpose-named value instead.

## Tests And Production Code

Do not add production code only to make tests easier. Avoid test-only constructors, fallbacks, flags, or branches; tests should construct collaborators explicitly or use proper mocking and injection.
