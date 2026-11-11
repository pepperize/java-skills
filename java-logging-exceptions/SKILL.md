---
name: java-logging-exceptions
description: Applies company Java logging and exception placement guidance. Use when adding or reviewing logging, exception handling, helper methods, factories, or domain-relevant error paths.
---

# Java Logging And Exceptions

## Logging

Do not hide domain-relevant logging in helper methods such as `getXOrWarn(...)`.

Log where the problem is detected so the log points to the real origin.

## Log Safety Review

Before finalizing logging changes:

- Keep log calls where the failure or skip decision is made.
- Extract collaborators only for formatting, encoding, mapping, or classification, not to hide domain-relevant logging.
- Treat external data, exception values, validation paths, and rejected values as unsafe before logging.
- Encode unsafe log values at the last formatting boundary before they are passed to the logger.
- Do not pass raw dynamic values into logger placeholders or concatenated log messages when the value may come from requests, persisted data, external systems, files, config, generated URLs, S3 keys, exception messages, or validation failures. Validate inputs at the boundary where feasible, but also encode unsafe log values at the final logging boundary with an approved cleanser such as `Encode.forJava(...)` or a project-approved `encode...ForLog` helper. Keep the original value for domain, storage, and API behavior; only encode the value passed to `log.*`. Keep `Throwable` arguments unencoded and last.
- When adding a reusable log encoder, cover CR, LF, CRLF, tabs, quotes, and script-like payloads in focused unit tests.
- Name extracted log-formatting methods with verb phrases such as `format...`, `encode...`, or `create...`.

## Exceptions

Throw exceptions where the problem originates.

A focused helper may throw a specific exception for a failure it detects and owns. Keep HTTP mapping and policy logging at their owning boundary. Avoid moving a throw into a helper that lacks the information or responsibility to understand the failed condition. Use a result object when accumulated errors or partial values are part of the contract; exceptions are not mandatory for every failure.

Do not add application exceptions only to translate malformed HTTP requests into HTTP responses. Throw or map API-boundary client errors in the controller or API adapter.

## Exception Policy Ownership

Catching and translating a collaborator's exception is a policy decision. Keep exception translation and recovery policy visible in the operation that owns its meaning and outcome.

Do not extract a private delegating helper merely to hide a `try/catch` from orchestration. A method named `load...`, `create...`, or `generate...` must not conceal the caller's failure policy. A helper may throw for a condition it directly detects and owns; that permission does not automatically extend to translating failures raised by a delegated operation. Dedicated infrastructure adapters may translate technical failures into their documented boundary contracts.

Bad: a retrieval helper hides report-generation failure policy.

```java
public Report generate() {
    var rows = loadRows();
    return reportRenderer.render(rows);
}

private List<ReportRow> loadRows() {
    try {
        return reportSource.fetchRows();
    } catch (SourceUnavailableException e) {
        throw new ReportGenerationException(e);
    }
}
```

Good: the report operation owns the translation and keeps the successful flow together.

```java
public Report generate() {
    try {
        var rows = reportSource.fetchRows();
        return reportRenderer.render(rows);
    } catch (SourceUnavailableException e) {
        throw new ReportGenerationException(e);
    }
}
```

Prefer a cohesive successful flow inside the `try`, keeping declarations with their initialization. Catch specific exceptions whose meaning is valid for the operations covered. In this example, rendering does not throw `SourceUnavailableException`. Narrow the `try` when another enclosed operation can throw the same exception with a different meaning or requires different handling; do not split the flow mechanically just to minimize the number of statements inside a `try`.

### Preserve Existing Failure Policy

When extending an operation, preserve its existing failure-policy ownership and exception contract. Keep the successful flow cohesive and translate new failures locally when their meaning belongs to that operation. Do not spread that policy into global handlers or delegating helpers. Shared framework handling and explicitly chosen boundary contracts remain valid.

Bad: adding a publishing step spreads the operation's failure policy into a global handler.

```java
public Result execute(Command command) {
    try {
        var result = processor.process(command);
        publisher.publish(result);
        return result;
    } catch (ProcessingException exception) {
        throw new OperationFailedException("Processing failed", exception);
    }
}

// GlobalExceptionHandler
@ExceptionHandler(PublishingException.class)
ResponseEntity<?> handlePublishingFailure(PublishingException exception) {
    // Constructs the operation-specific error response.
}
```

Good: the operation translates the new failure into its established contract.

```java
public Result execute(Command command) {
    try {
        var result = processor.process(command);
        publisher.publish(result);
        return result;
    } catch (ProcessingException exception) {
        throw new OperationFailedException("Processing failed", exception);
    } catch (PublishingException exception) {
        throw new OperationFailedException("Publishing failed", exception);
    }
}
```

The global handler continues rendering `OperationFailedException`; it does not need to know the operation's individual steps. Reuse the project's existing exception contract rather than introducing `OperationFailedException` solely to copy this example. Preserve the original cause in local translations.

## Exception Boundaries

- Do not catch broad `RuntimeException` in orchestration code just to log and convert it into an empty `Optional`, empty collection, or generic failure result.
- Only catch exceptions when the collaborator documents or clearly owns a failure case that the caller can meaningfully recover from or translate at its owning boundary.
- Scope each catch by failure meaning, not by statement count. Keep constraint validation and downstream dispatch outside a catch that could misclassify their failures as malformed request construction. Do not classify arbitrary `IllegalArgumentException`, `NullPointerException`, or other programming defects as client errors.
- If a method only filters or maps already-loaded data, "no matches" should be a normal empty result, not an exception path.
- Do not branch on human-readable exception or HTTP error message text for control flow. Classify external API failures using stable contract signals such as HTTP status, documented machine-readable error codes, typed exceptions, or structured response fields. If a status code has multiple business meanings, clarify or improve the upstream contract instead of matching message text.

## Required Exception Self-Review

Before finalizing changes to exception handling or helper extraction:

- Inspect every added or changed `catch`, and every extracted helper containing a `catch`.
- Identify where the failure originates and which operation owns its translation or recovery policy.
- When extending an operation, verify that new failure translation stays with its existing owner and uses its established exception contract; inspect added global handlers for operation-specific policy.
- If a private helper merely delegates and translates the caller's failures, move the catch to the owning operation. Renaming the helper does not resolve misplaced policy.
- Check that the catch classifies failures correctly for every enclosed operation while preserving a cohesive successful flow where possible.

## Persistence Conflicts

Translate a proven conflict at the boundary that understands its meaning, preserving the Java cause. For example, an established repository conflict contract may become `UserAlreadyExistsException` in the application and then HTTP 409 in the web adapter. Reuse existing exception contracts; do not introduce a generic exception hierarchy solely to reproduce this example.

Do not translate every integrity failure into an already-exists outcome. Establish the relevant constraint using stable driver/framework metadata or the project's classifier. Account for failures raised at flush or transaction commit; `save()` returning does not prove that the write committed. Do not query a failed transaction or copy a recovery lookup from another ORM. Keep unrelated storage failures technical.

## Security Events

Record authentication, session revocation, authorization denial, password reset, and privilege-change outcomes at the boundary that knows the result when those flows are in scope. Use stable event names and reason codes with appropriate actor/target IDs and capability names. Rate-limit or aggregate repetitive attack-driven events.

Never log credentials, password hashes, recovery/verification bearer tokens, session IDs, CSRF tokens, or authorization headers. Avoid raw login identifiers and client addresses in correlation fields; use approved keyed pseudonymous identifiers when needed. Apply the log encoding rules above to remaining dynamic fields. Use `java-authentication-security` for authentication lifecycle requirements.
