---
name: java-request-validation
description: Implement or review Java HTTP binding, request DTO validation, validation ownership, Problem Details, and browser submission error contracts using the project's existing framework infrastructure.
---

# Java Request Validation

## Inspect And Reuse The Input Boundary

Inspect the installed Java/Spring version, serializers, binding/coercion settings, validation provider, controller signatures, error handlers, and submission contract. Reuse them. Preserve published unknown-field, media-type, error-collection, normalization, and compatibility behavior unless changing it is requested. Do not introduce a reflection hydrator, DTO registry, servlet filter, or custom argument resolver when framework binding already satisfies the requirement.

## Validation Ownership

- Validate external request shape at the entry boundary: required values, nullability, types, lengths, formats, supported values, and input-only cross-field rules. For MVC JSON bodies, prefer typed `@RequestBody` plus Bean Validation with `@Valid` or the project's validation groups.
- Do not repeat already-validated request syntax in services or repositories. Other actual entry points such as imports, jobs, and CLI adapters validate their external data at their own boundary. Do not add service checks for hypothetical callers.
- Preserve domain invariants required for every caller. Uniqueness, ownership, permissions and lifecycle transitions need the operation's current state and, where appropriate, transactional/database enforcement; DTO validation alone is insufficient.
- Treat hydration/binding, constraint execution, and HTTP error mapping as different responsibilities without requiring a separate class for every phase. Use cohesive local operations under `java-readable-code` and narrow exception ownership under `java-logging-exceptions`.

## DTOs And Binding

Define required/optional fields, raw types, nested objects, collections and extra-field policy. Where absence and explicit null differ, represent presence intentionally; a plain nullable Java field or primitive alone cannot preserve that distinction. Verify the real parser's number, enum, boolean, and scalar coercion behavior instead of assuming DTO types reject all invalid JSON.

Prefer immutable input DTOs where the installed Java/framework supports them. Apply constraints to input contracts; use built-in constraints before a custom side-effect-free validator. Presence constraints and format constraints are distinct. Cascade nested object validation and validate collection elements where needed; `@Valid` does not construct nested objects, require non-null input, or define element types by itself.

Preserve submitted values unless a documented normalization contract says otherwise. Do not silently trim or cast invalid input to make validation pass. Keep DTO/storage values unescaped and handle encoding at output under `java-application-security`.

Keep transport DTOs out of application/domain APIs when architecture requires that separation. Map to an application command when contracts differ. Reuse an intentionally application-owned, transport-independent input type when the contracts actually coincide; neither a different class name nor hypothetical reuse justifies copying every field. Honor explicit project rules about validation metadata on shared input models.

In Spring MVC, reuse existing exception handling for binding and validation. On versions supporting built-in method validation, both `MethodArgumentNotValidException` and `HandlerMethodValidationException` may need handling. Check whether class-level `@Validated` selects AOP method validation in the installed version. Do not prescribe a second validation pass or change controller interception mechanically.

Read [error contracts](references/error-contracts.md) when parsing, error mapping or field locations change. Keep unexpected programming/configuration failures as server errors rather than treating every exception as invalid input.

## Regex And Browser Contracts

Prefer a single authoritative field-format rule and built-in presence/length constraints. Avoid independently maintained backend/browser copies when a safe shared representation exists, but do not force all character rules into an unreadable regex. Java and JavaScript engines differ; verify real matching semantics, Unicode, length, whitespace and trailing-line-break cases. A deterministic validator is appropriate when it is clearer. Use `java-application-security` for execution safety; annotation declaration order does not guarantee length checks execute before a regex.

Browser validation is a usability aid; the server remains authoritative. Preserve the project's JavaScript or traditional HTML submission flow rather than imposing either as a universal default. Keep CSRF/authentication protections, entered safe values on failure, and accessibility/localization behavior.

For JavaScript clients, handle non-success HTTP responses explicitly and select actionable feedback using stable problem types/codes and documented locations. Avoid parsing diagnostic prose for control flow. Keep client-owned message catalogs where established; do not replace a deliberately server-localized HTML form contract. Never render raw server diagnostics as HTML. Traditional HTML actions may use `BindingResult` and redisplay safe values, invoking business work only after successful validation, then following their documented redirect flow.

## Verification

Follow `java-testing-style`. Exercise real binding, metadata, error advice and serialization for changed boundaries: valid input; missing/null/wrong types; malformed versus wrong-shaped JSON; nested collections; multiple errors where supported; and downstream work not running on invalid input. Include raw invalid requests bypassing browser checks.

For changed browser flows, verify local feedback, preserved safe input, stable-code mapping, unknown-error handling, and success navigation only after confirmed success. For cross-engine format sharing, run common acceptance/rejection cases in both actual engines rather than comparing pattern text alone. Keep credentials out of redisplay, responses, and logs.

Reference: [Spring MVC validation](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-validation.html). Use version-matched documentation; this skill does not require upgrading Spring.
