---
name: java-clean-architecture
description: Applies Clean Architecture guidance for Java projects. Use only when the project's main instruction file such as AGENTS.md, CLAUDE.md, or equivalent explicitly states that the project uses Clean Architecture, especially when adding use cases, ports, adapters, factories, or refactoring boundaries.
---

# Java Clean Architecture

## Activation Guard

Before applying this skill, check the project's main instruction file such as `AGENTS.md`, `CLAUDE.md`, or equivalent.

Use this skill only when that file explicitly states the project uses Clean Architecture.

If the project does not explicitly state Clean Architecture, do not apply this skill.

## Boundaries

Preserve clear boundaries between use cases, domain/application logic, ports, and adapters.

Keep business rules out of technical adapters. Keep framework, transport, persistence, and client details out of application use cases.

Prefer dependency direction toward the domain or application core. Outer adapters should depend on ports and application models, not the other way around.

## Use Cases

Use cases should orchestrate business flow and delegate technical concerns to ports or cohesive collaborators.

Avoid letting use cases accumulate unrelated creation, conversion, logging, key formatting, or client-specific responsibilities.

When orchestration becomes hard to read, extract cohesive factories, selectors, policies, or publishers with narrow names.

## Adapters And Clients

Around technical clients, prefer this flow where it fits naturally:

`ClientRequestFactory -> client call -> EntityFromResponseFactory`

Keep one-line response mappings inline when a response factory would not add clarity.

## Naming

Prefer names that reveal the architectural role: `UseCase`, `Port`, `Adapter`, `Factory`, `Policy`, `Selector`, or another established project term.

Do not introduce generic support classes when a specific architectural role is available.
