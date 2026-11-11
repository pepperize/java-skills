---
name: java-readable-code
description: Use when writing, refactoring, or reviewing Java production code around readability, orchestration, responsibility-based class and dependency naming, Optional usage, guard clauses, factories, or test-only production code.
---

# Java Readable Code

## Default Style

- Prefer small focused classes, explicit responsibilities, intention-revealing names, readable control flow, and minimal incidental complexity.
- Prefer GoF design patterns where they fit naturally.
- Avoid broad utility classes that mix unrelated concerns such as creation, mapping, conversion, logging, and key formatting; extract cohesive collaborators with narrow names instead.
- Avoid passing non-trivial method calls directly as arguments when an intermediate variable would clarify intent. Name semantically important intermediate results.
- Prefer simple, common words that non-native speakers can read without looking them up.

## Orchestration And Local Operations

Keep orchestration at one level of abstraction. Extract a complete meaningful operation, including its related checks, branching, and construction, instead of adding small predicates that leave the caller coordinating the same details.

Prefer a private method when an operation belongs to one owner. Introduce a collaborator when an independent responsibility, actual reuse, complexity, or composition benefit justifies it. Returning an object does not by itself require a factory class. Leave ordinary expressions inline when extraction would only add indirection.

Do not extract helpers to hide exception translation or recovery policy from the operation that owns it. Apply the exception policy ownership rules and good/bad examples in `java-logging-exceptions` before extracting a `try/catch` from orchestration.

For before/after Java examples, read [orchestration and composition](references/orchestration-and-composition.md) when refactoring complex orchestration or result construction. Local extraction must preserve input contracts and exception ownership under `java-request-validation` and `java-logging-exceptions`.

## Dependency Names

Name injected fields and constructor parameters after the declared type in lower camel case, retaining role suffixes: `userRepository`, `userDtoFactory`, `publicUrlGenerator`. Avoid plural resource names for single collaborators; use plurals for collections. When several dependencies share a type, use qualifiers that explain their roles, such as `billingClient` and `shippingClient`. Preserve framework-required and explicit project names.

## Debuggable Composition

Assign meaningful repository, service, and factory results to named locals before constructing an aggregate result so intermediate values are inspectable in an IDE or debugger. This develops the default intermediate-variable rule; it does not require extracting literals, existing variables, or every simple expression.

## Guard Clauses

- Do not use `org.springframework.util.Assert` in application, domain, or service code.
- Prefer explicit guard clauses with normal `if` statements and meaningful exceptions.
- Inside business logic, prefer explicit checks over assertion utilities.

## Validation Placement

At API boundaries, prefer Bean Validation annotations for request-shape constraints such as nullness, blank strings, size, simple patterns, enum values, nested DTO validation, and other request binding concerns.

Do not introduce predicate or specification classes merely to wrap simple Bean Validation rules, one-off null/blank/range checks, or controller-specific request syntax.

Consider a named predicate, specification, policy, or validator only when the validation is non-trivial and at least one of these is true:

- The rule must be applied outside the controller/API boundary, such as generated data, persisted data, infrastructure keys, filenames, external-system data, or reused application flows.
- The rule is not readable or maintainable as annotations alone.
- The rule has a stable domain or technical name that makes the caller clearer.
- The rule is security-sensitive and benefits from isolated focused tests.

Keep predicate and specification classes side-effect free. They should answer the validation question and leave exception choice, HTTP mapping, logging, and recovery decisions to the caller that owns that boundary.

Use `java-request-validation` for binding, DTO ownership, and error responses. Avoid repeating request-shape validation after a validated boundary; preserve domain invariants that must hold for every caller. Do not introduce checks or abstractions for hypothetical entry points.

## Factories

Identify the primary responsibility before choosing a class name. When that responsibility is constructing an object or object graph, name a justified collaborator after its product plus `Factory`, with a main `create(...)` operation. Reflection, cloning, or metadata interpretation are implementation details; they do not turn object construction into a `Generator` responsibility.

This naming rule does not require a new class for every construction operation. Retrieval, validation, rendering, and scalar generation retain their own roles even when they return objects. Preserve framework contracts, explicit project terminology, and established Java factories such as `of(...)` and `from(...)`.

For REST resource work, follow [java-api-endpoints](../java-api-endpoints/SKILL.md#responsibilities-and-naming) for Controller -> Application Service -> Repository -> optional Client, request/output contracts and HTTP responses. Read its [worked flow and good/bad examples](../java-api-endpoints/references/user-endpoint.md#flow-and-contracts) when implementing or refactoring these collaborators. Follow existing Spring Data repository operation names, including `findById`, and declare only operations production callers need.

## Hydrators

When a collaborator fills an existing target object with values from one or more source objects, name it `<TargetType>Hydrator`. Use `hydrate(target, sources...)`, with the target first. Mutate and return the same target instance. Object creation belongs to the caller or a factory.

```java
erpProduct = erpProductHydrator.hydrate(erpProduct, product, billOfMaterials);
```

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

## Immutability And Collection Ownership

Prefer immutable data where domain and framework contracts allow, and unmodifiable collections at return and collaborator boundaries. Allow mutable local collections while building a result. Consumers treat supplied collections as read-only unless mutation is an explicit part of the contract; a consumer that needs its own modified version makes a local copy.

Unmodifiable collections do not make their elements immutable. An unmodifiable view of a mutable backing collection is not an independent snapshot; choose the ownership and snapshot semantics the contract requires.

Avoid redundant defensive copies when ownership already guarantees the required behavior. Return an appropriate unmodifiable result directly rather than copying it again at every layer. For large collections or measured hot paths, choose an explicit ownership strategy that limits copying; do not assume streams or immutability are inherently faster or slower.

During refactoring, inspect consumers before changing collection mutability. Preserve established mutation contracts unless changing them is part of the requested work; an immutability preference alone does not authorize a behavior change.

## Collections And Optional

- Do not return `Optional<List<T>>`, `Optional<Set<T>>`, or `Optional<Map<K, V>>` when an empty collection fully represents "nothing found".
- Collection-returning methods should return an empty collection for "no items".
- Use `Optional<Collection>` only when absence of the collection itself has a real, named meaning that is different from an empty collection.
- Do not use `Optional.empty()` to smuggle failure through collection-producing code. If failure is real and expected, model it explicitly; if it is unexpected, let the exception point to the real defect.

## Tests And Production Code

Do not add production code only to make tests easier. Avoid test-only constructors, fallbacks, flags, or branches; tests should construct collaborators explicitly or use proper mocking and injection.

## Required Pre-Final Self-Review

Before finalizing Java code changes:

- Review staged and unstaged diffs and task-created untracked Java files using `git status --short`; diffs alone omit new files.
- For every new or renamed class, or class whose responsibility changed, check its primary responsibility, returned product, and name. Correct affected callers, tests, and documentation. Review injected dependency names and meaningful intermediate values.
- Review every newly added or renamed method.
- Classify each as accessor/property, boolean predicate, action/operation, or factory/construction helper.
- Accessors may use noun names. Predicates should use `is`, `has`, `can`, `should`, or similar.
- Action, operation, formatting, mapping, and helper methods must use verb phrases.
- Remove helper methods that only hide one obvious call unless they enforce a real invariant or improve a repeated concept.
- For every added or changed `catch` and extracted helper containing a `catch`, apply the required exception self-review in `java-logging-exceptions`; exception policy ownership takes precedence over making orchestration shorter.
- Check any new defensive branch against known domain/API assumptions. If the user or project states the value cannot occur, do not add handling for it without asking.
- For non-trivial implementations and refactors, apply the implementation self-review in `java-solid-review` and fix material issues within scope.
