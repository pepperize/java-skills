---
name: java-logging-exceptions
description: Applies company Java logging and exception placement guidance. Use when adding or reviewing logging, exception handling, helper methods, factories, or domain-relevant error paths.
---

# Java Logging And Exceptions

## Logging

Do not hide domain-relevant logging in helper methods such as `getXOrWarn(...)`.

Log where the problem is detected so the log points to the real origin.

## Exceptions

Throw exceptions where the problem originates.

Avoid helper or factory methods that throw internally when the caller is the place that understands the failed invariant or boundary condition.
