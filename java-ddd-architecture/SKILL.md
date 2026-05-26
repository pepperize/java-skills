---
name: java-ddd-architecture
description: Applies project-provided Domain-Driven Design guidance for Java projects, including DDD-specific Spring configuration placement and Spring web boundary naming. Use only when the project's main instruction file such as AGENTS.md, CLAUDE.md, or equivalent explicitly states that the project uses DDD or Domain-Driven Design.
---

# Java DDD Architecture

## Activation Guard

Before applying this skill, check the project's main instruction file such as `AGENTS.md`, `CLAUDE.md`, or equivalent.

Use this skill only when that file explicitly states the project uses DDD or Domain-Driven Design.

If the project does not explicitly state DDD, do not apply this skill.

## Project Guidance

Follow the DDD rules stated in the project's own instruction files and domain documentation.

If those rules are missing or unclear, ask for clarification before changing aggregates, entities, value objects, repositories, domain services, bounded-context language, or domain invariants.

If the project explicitly prefers anemic domain models, keep behavior primarily in services unless there is a strong reason to keep logic on the entity itself.

## Spring Configuration

In DDD projects, treat Spring configuration as infrastructure configuration, not application or domain code.

Classes annotated with `@Configuration` or `@ConfigurationProperties` belong under infrastructure configuration packages unless the project states a different convention.

Use `@Configuration` only for Spring or framework wiring such as third-party clients, security setup, OpenAPI setup, and explicit `@Bean` composition.

Keep configuration classes focused and name them `<Thing>Configuration`.

Use `@ConfigurationProperties` for typed property binding only. Name property holders `<Thing>ConfigurationProperties`, keep them plain, validate required values with `@Validated` plus Bean Validation annotations, and mark optional values with `@Nullable`.

Prefer registering configuration properties through `@ConfigurationPropertiesScan` on the Spring Boot application class instead of also annotating property classes with `@Component`.

If Spring or a third-party auto-configuration already owns a binding and prevents normal `@ConfigurationProperties` usage, document the exception at the class and keep the workaround local to infrastructure configuration.

## Spring Web Boundaries

Package names should expose the architectural side when the side is known. Guest-facing code belongs under frontend packages, and backend or admin code belongs under backend packages.

Do not put frontend or backend controllers and services in a neutral application namespace when the architectural side is known.

Keep application-layer names aligned with existing route and UI vocabulary instead of inventing synonyms.

Avoid ambiguous `Public...` and `Admin...` class prefixes when frontend/backend package boundaries or route vocabulary name the concept more clearly.

Controller method names should mechanically mirror the HTTP route: use the HTTP verb as the method prefix followed by the route resource noun and optional route action.

Keep domain verbs in services or use cases rather than controller method names.
