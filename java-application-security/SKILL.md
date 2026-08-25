---
name: java-application-security
description: Applies company Java application security guidance. Use when adding, changing, or reviewing validation of external input, regex validation, request parameters, URLs, S3 keys, file paths, identifiers, or persisted data that may affect security or availability.
---

# Java Application Security

## Regex Safety

Regex is acceptable for validation, but do not use patterns with nested, ambiguous, or repeated repetitions that can cause excessive backtracking or stack overflow for large inputs.

Treat regexes over external input as security-sensitive, including request URLs, query parameters, selectors, S3 keys, file paths, identifiers, and persisted data read back into validation paths.

When a regex contains repeated groups inside repeated groups, review it for ReDoS or stack-overflow risk before committing. If the safe regex becomes hard to reason about, prefer deterministic validation: normalize, split into bounded parts, enforce lengths/counts, and validate characters with simple loops.

When replacing or changing a regex flagged by static analysis, add a focused large-invalid-input test.
