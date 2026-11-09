---
name: java-application-security
description: Apply Java external-input and output-context security guidance when changing validation, regexes, URLs, paths, identifiers, persisted external data, or escaping/encoding boundaries that affect security or availability.
---

# Java Application Security

## Input And Output Boundaries

Treat external input as untrusted even when browser checks succeed. Use `java-request-validation` for entry-boundary binding and validation; keep current-state business decisions and domain invariants with their owning operation.

Do not silently trim, coerce, sanitize, or replace input merely to make invalid values pass. Preserve documented normalization contracts and apply them explicitly at their owning boundary. Never silently rewrite passwords or pre-escape values for storage; credential normalization changes require the explicit policy and migration rules in `java-authentication-security`.

Validate for the input contract and encode for the actual output context. Valid input still requires contextual handling for HTML, attributes, JavaScript, CSS, URLs, and logs. Keep original domain/storage values separate from output encoding. Use the established template engine's escaping under `java-templating` and the final log-format boundary under `java-logging-exceptions`.

## Regex Safety

Regex is acceptable for validation, but do not use patterns with nested, ambiguous, or repeated repetitions that can cause excessive backtracking or stack overflow for large inputs.

Treat regexes over external input as security-sensitive, including request URLs, query parameters, selectors, S3 keys, file paths, identifiers, and persisted data read back into validation paths.

When a regex contains repeated groups inside repeated groups, review it for ReDoS or stack-overflow risk before committing. If the safe regex becomes hard to reason about, prefer deterministic validation: normalize, split into bounded parts, enforce lengths/counts, and validate characters with simple loops.

When replacing or changing a regex flagged by static analysis, add a focused large-invalid-input test.

Prefer one clearly owned format rule over independently maintained copies. Do not assume Java and browser regex engines accept identical syntax or count Unicode length identically. Verify shared valid/invalid examples through both real validators when their contracts are intended to match. Do not force a compound regex when built-in constraints or deterministic validation are clearer.
