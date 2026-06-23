---
name: java-ddd-architecture
description: Use for Java projects whose AGENTS.md, CLAUDE.md, or equivalent explicitly states DDD or Domain-Driven Design, especially domain/application/infrastructure boundaries, Spring configuration placement, and web boundary naming.
---

# Java DDD Architecture

## Activation Guard

Before applying this skill, check the project's main instruction file such as `AGENTS.md`, `CLAUDE.md`, or equivalent. Use it only when that file explicitly states the project uses DDD or Domain-Driven Design.

## Project Guidance

Follow the DDD rules in the project's own instruction files and domain docs.

- Preserve clear boundaries and responsibilities between domain concepts, application services, and infrastructure concerns.
- Ask for clarification before changing aggregates, entities, value objects, repositories, domain services, bounded-context language, or domain invariants when rules are missing or unclear.
- Prefer anemic domain models with behavior primarily in services unless there is a strong reason to keep logic on the entity itself.

## Spring Configuration

In DDD projects, treat Spring configuration as infrastructure, not application or domain code.

- Put `@Configuration` and `@ConfigurationProperties` classes under infrastructure configuration packages unless the project states a different convention.
- Use `@Configuration` only for framework wiring such as third-party clients, security, OpenAPI, and explicit `@Bean` composition; keep classes focused and name them `<Thing>Configuration`.
- Use `@ConfigurationProperties` only for typed property binding. Name holders `<Thing>ConfigurationProperties`, keep them plain, validate required values with `@Validated` plus Bean Validation annotations, and mark optional values with `@Nullable`.
- Prefer `@ConfigurationPropertiesScan` on the Spring Boot application class instead of also annotating property classes with `@Component`.
- If Spring or third-party auto-configuration owns a binding, document the exception at the class and keep the workaround local to infrastructure configuration.

## Spring Web Boundaries

- Package names should expose the architectural side when known: end-user-facing code under frontend packages, backend/admin code under backend packages.
- Do not put side-specific controllers or services in a neutral application namespace when the side is known.
- Keep application-layer names aligned with existing route and UI vocabulary instead of inventing synonyms.
- Avoid ambiguous `Public...` and `Admin...` class prefixes when package boundaries or route vocabulary name the concept more clearly.
- Controller method names should mechanically mirror the HTTP route: HTTP verb prefix plus resource noun and optional route action.
- Keep domain verbs in services or use cases rather than controller method names.

## API Boundary Validation

Treat HTTP request shape as a web adapter concern, not a domain concern.

Validate transport-level input at the controller or API boundary: required query/path/body parameters, mutually required parameters, syntax, Bean Validation constraints, endpoint-specific unsupported enum values, and HTTP status mapping.

Translate web DTOs, query parameters, and OpenAPI-generated models into application commands or purpose-named method calls before invoking application services. Do not pass nullable parameter combinations into application services to represent different HTTP request modes.

Only promote validation into the domain or application layer when it expresses a domain invariant in the bounded context's language and must hold for every caller, not just for one HTTP endpoint.

Do not create domain concepts or domain exceptions for malformed HTTP requests unless the same rule is genuinely part of the ubiquitous language.
