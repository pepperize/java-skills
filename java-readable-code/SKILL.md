---
name: java-readable-code
description: Applies company Java readability and clean code conventions. Use when writing, refactoring, or reviewing Java production code, especially when method calls, responsibilities, naming, Optional usage, or utility classes affect readability.
---

# Java Readable Code

## Default Style

Prefer small focused classes, explicit responsibilities, and readable control flow.

Prefer GoF design patterns where they fit naturally.

Favor Clean Code principles: small focused classes, explicit responsibilities, intention-revealing names, readable control flow, and minimal incidental complexity.

Avoid broad utility classes that mix unrelated concerns such as creation, mapping, conversion, logging, and key formatting. If extraction is needed, extract cohesive collaborators with narrow names and responsibilities.

Avoid passing non-trivial method calls directly as arguments to other method calls when an intermediate variable would make the code easier to read. Name semantically important intermediate results.

Prefer simple, common words that non-native speakers can read without looking them up.

## Guard Clauses

Do not use `org.springframework.util.Assert` in application, domain, or service code.

Prefer explicit guard clauses with normal `if` statements and meaningful exceptions.

At API boundaries, prefer Bean Validation annotations where appropriate.

Inside business logic, prefer explicit checks over assertion utilities.

## Factories

When a class mainly creates a returned object, prefer the Factory pattern.

Name the class after the product plus `Factory`.

Name the main method `create(...)`.

## Optional

Prefer `Optional` as a return type at absence-producing boundaries.

Avoid `Optional` as a method parameter. Resolve absence at the caller or boundary and pass a concrete domain object, explicit overload, or purpose-named value instead.

## Tests And Production Code

Do not add production code only to make tests easier.

Avoid test-only constructors, fallbacks, flags, or branches in production code. Tests should construct required collaborators explicitly or use proper mocking and injection.
