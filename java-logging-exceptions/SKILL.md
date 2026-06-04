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
- Name extracted log-formatting methods with verb phrases such as `format...`, `encode...`, or `create...`.

## Exceptions

Throw exceptions where the problem originates.

Avoid helper or factory methods that throw internally when the caller is the place that understands the failed invariant or boundary condition.

## Exception Boundaries

- Do not catch broad `RuntimeException` in orchestration code just to log and convert it into an empty `Optional`, empty collection, or generic failure result.
- Only catch exceptions when the collaborator documents or clearly owns a recoverable failure case that the caller can handle meaningfully.
- If a method only filters or maps already-loaded data, "no matches" should be a normal empty result, not an exception path.
- Do not branch on human-readable exception or HTTP error message text for control flow. Classify external API failures using stable contract signals such as HTTP status, documented machine-readable error codes, typed exceptions, or structured response fields. If a status code has multiple business meanings, clarify or improve the upstream contract instead of matching message text.
