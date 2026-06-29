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
- Do not repeat information already carried by the class name, receiver, or return type unless it distinguishes variants or avoids ambiguity at call sites. Prefer `DataFactory.create()` over `DataFactory.createData()`.
- Avoid noun/adjective-only method names like `missingTranslation(...)` unless the method is a JavaBean getter, record accessor, enum/value property, or boolean predicate.
- Boolean predicates should still read clearly as questions or states, using `is`, `has`, `can`, `should`, or similar.
- Static factory methods should also use an action-oriented name unless they are established Java conventions such as `of(...)`, `from(...)`, or `valueOf(...)`.
- Before accepting new or renamed methods, classify each one as an accessor/property, boolean predicate, action/operation, or factory/construction helper. Accessors and record components should use noun or state names such as `status()`, `totalCount()`, `successCount()`, or `failureCount()`. Boolean predicates should read as predicates, such as `isSuccess()` or `hasFailures()`. Action, operation, and factory helper methods must use verb phrases. Avoid past-tense or adjective helper names such as `succeeded(...)`, `failed(...)`, `missingTranslation(...)`, or `partialSuccess(...)` when the method creates, transforms, or returns a result; prefer names such as `createSuccessResult(...)`, `createFailureResult(...)`, `resolveStatus()`, or `collectFailures(...)`.

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

## Numeric Types And Counts

Prefer the type that matches the semantic model across the call chain, not the narrowest type used by the first caller.

For counts, totals, and accumulated result metrics:

- Prefer `long` when values come from APIs that naturally return `long`, such as `Stream.count()`.
- Prefer widening the small model consistently over adding local narrowing conversions like `Math.toIntExact(...)`.
- Do not keep `int` only because current inputs come from `List.size()`; `int` values widen to `long` cleanly at call sites.
- If a count is aggregated, merged, reported, or stored in an exception/result object, choose one count type across the related model.

For local variables initialized from a simple, obvious source such as `List.size()`, prefer `var` when
the value is only passed to a wider count API and does not participate in accumulation, merging,
overflow-sensitive arithmetic, or persistence/DTO shape. Do not spell `long` solely to widen a
`List.size()` result at the local declaration if that creates reader surprise; let Java widen at the
call boundary.

```java
var count = seoDataList.size();
return resultFactory.createSuccess(count);

var failureCount = 0L;
failureCount += batch.stream().filter(...).count();
```

Keep `int` only when there is a concrete constraint:

- Java collection indexing or array indexing.
- An external API, DTO, database schema, or OpenAPI contract requires `int`.
- The value is explicitly bounded by a domain invariant that should be represented as `int`.

When changing a count type, update the cohesive model together instead of moving conversions downstream.

## Optional

- Prefer `Optional` as a return type at absence-producing boundaries.
- Avoid `Optional` as a method parameter. Resolve absence at the caller or boundary and pass a concrete domain object, explicit overload, or purpose-named value instead.

## Collections And Optional

- Do not return `Optional<List<T>>`, `Optional<Set<T>>`, or `Optional<Map<K, V>>` when an empty collection fully represents "nothing found".
- Collection-returning methods should return an empty collection for "no items".
- Use `Optional<Collection>` only when absence of the collection itself has a real, named meaning that is different from an empty collection.
- Do not use `Optional.empty()` to smuggle failure through collection-producing code. If failure is real and expected, model it explicitly; if it is unexpected, let the exception point to the real defect.

## Tests And Production Code

Do not add production code only to make tests easier. Avoid test-only constructors, fallbacks, flags, or branches; tests should construct collaborators explicitly or use proper mocking and injection.

## Required Pre-Final Self-Review

Before finalizing Java code changes:

- Review every newly added or renamed method.
- Classify each as accessor/property, boolean predicate, action/operation, or factory/construction helper.
- Accessors may use noun names. Predicates should use `is`, `has`, `can`, `should`, or similar.
- Action, operation, formatting, mapping, and helper methods must use verb phrases.
- Remove helper methods that only hide one obvious call unless they enforce a real invariant or improve a repeated concept.
- Check any new defensive branch against known domain/API assumptions. If the user or project states the value cannot occur, do not add handling for it without asking.
