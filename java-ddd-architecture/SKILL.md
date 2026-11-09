---
name: java-ddd-architecture
description: Use for Java projects whose main instructions explicitly select DDD or Domain-Driven Design, especially domain repository contracts, dependency direction, identity boundaries, Spring configuration, and web adaptation.
---

# Java DDD Architecture

## Activation Guard

Before applying this skill, check the project's main instruction file such as `AGENTS.md`, `CLAUDE.md`, or equivalent. Use it only when that file explicitly states the project uses DDD or Domain-Driven Design.

For an active architecture/design review, also use `java-solid-review` for material cross-cutting design risks. Its general heuristics must not override project-specific DDD decisions.

## Project Guidance

Follow the DDD rules in the project's own instruction files and domain docs.

- Preserve clear boundaries and responsibilities between domain concepts, application services, and infrastructure concerns.
- Ask for clarification before changing aggregates, entities, value objects, repositories, domain services, bounded-context language, or domain invariants when rules are missing or unclear.
- Prefer anemic domain models with behavior primarily in services unless there is a strong reason to keep logic on the entity itself.

## Repository Contracts

When adding or refactoring a domain repository, read [repository boundaries](references/repository-boundaries.md).

- Keep the domain repository interface and returned domain model in the module that owns the concept, with implementations in infrastructure. Adapt this placement to explicit project architecture.
- Keep framework, transport, and persistence APIs out of domain repository signatures. A remote technical client may live behind a repository; its response DTO is mapped inside infrastructure before crossing the domain-facing boundary.
- Hide storage details for domain retrieval whether the source is a database, file, memory, or remote service. Use domain vocabulary for the contract and mechanism-specific names for implementations when useful.
- Application operations depend on the appropriate domain contracts; controllers delegate to application services rather than coordinating persistence.
- Expose only caller-needed operations. Keep established Spring Data names such as `findById`, ordinary absence as `Optional`, and empty collections for no matches. Distinguish absence from storage or decoding failures.
- Do not force aggregate repositories onto projection queries, configuration readers, transport clients, or other collaborators with genuinely different responsibilities. Respect established query services and CQRS boundaries.
- Do not add a duplicate persistence model solely to remove ORM metadata when the project permits mapped domain entities. Honor an explicit alternative mapping policy; ORM operations remain outside domain behavior.

Before finalizing, check dependency direction and ownership of returned types, not just package names. A domain contract must not return an application/web DTO or a vendor response.

## Security Boundaries

Keep servlet requests, Spring Security authentication/context APIs, session objects, and authorization engine mechanisms outside the domain. When application operations need actor identity, adapt it to an application-owned value such as `CurrentUser` at the entry boundary rather than passing the request or security context through the call chain.

Use `java-spring-security` for coarse capabilities and object-scoped decisions. Keep ownership, tenant scope, lifecycle, and privilege-change invariants with the operation that has the relevant domain data and transaction. Do not encode resource IDs into capability names or duplicate coarse controller checks inside services.

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

Use `java-api-endpoints` for REST resource input/output contracts and creation responses; use `java-templating` for rendered-page composition. Preserve the project's frontend/backend package vocabulary instead of copying another stack's namespace layout. URL generation and rendering belong to presentation/web collaborators, not domain repositories or models.

## API Boundary Validation

Treat HTTP request shape as a web adapter concern, not a domain concern.

Validate transport-level input at the controller or API boundary: required query/path/body parameters, mutually required parameters, syntax, Bean Validation constraints, endpoint-specific unsupported enum values, and HTTP status mapping.

Translate web DTOs, query parameters, and OpenAPI-generated models into application commands or purpose-named method calls before invoking application services. Do not pass nullable parameter combinations into application services to represent different HTTP request modes.

Only promote validation into the domain or application layer when it expresses a domain invariant in the bounded context's language and must hold for every caller, not just for one HTTP endpoint.

Do not create domain concepts or domain exceptions for malformed HTTP requests unless the same rule is genuinely part of the ubiquitous language.

Use `java-request-validation` for binding and validation execution. Do not repeat validated request-shape checks downstream. Preserve domain invariants for all callers and map transport DTOs to application input when the contracts differ; sharing is appropriate only for an intentionally application-owned input type with no HTTP dependencies.
