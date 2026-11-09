---
name: java-api-endpoints
description: Implement, refactor, or review Java REST resource endpoints, their request/output contracts, service and repository responsibilities, and HTTP responses. Rendered pages and traditional HTML actions retain their own contracts.
---

# Java API Endpoints

## Scope And Existing Contracts

Inspect the project's Java/Spring versions, endpoint contract, architecture, serializer, persistence and error handling before editing. Preserve published compatibility and explicit project choices; do not install another framework or migrate unrelated endpoints to apply this skill.

Classify the endpoint as a REST resource operation, rendered page, traditional HTML form action, or another capability action. POST, JSON, or JavaScript submission alone does not establish resource creation. A rendered form calling REST still follows the REST contract at its submission endpoint.

When implementing a resource endpoint, read the [worked User endpoint](references/user-endpoint.md). It shows a preferred flow, not a mandatory class count, authentication product, or architecture activation.

## Responsibilities And Naming

- For ordinary resource operations, prefer Controller -> Service -> Repository. Controllers consume typed validated input, invoke application work, and handle HTTP adaptation through existing infrastructure. Keep persistence coordination and business rules out of controllers.
- Keep resource vocabulary consistent: `UserController`, `UserService`, `CreateUserRequest`, and an output-only `UserDto` or established `UserResponse`. For new or intentionally redesigned routes, prefer plural resource nouns such as `POST /api/users` and `GET /api/users/{userId}`. Use `/registrations` only when registration itself is the resource.
- Follow existing Java controller naming, including the verb/resource convention in active `java-ddd-architecture`. Name supported resource service operations `create`, `read`, `update`, and `delete` where these accurately describe them; preserve meaningful domain operations and explicit project conventions. Do not force a business workflow into generic CRUD or generate unused operations.
- Separate request and output contracts. Explicitly select public output fields; do not serialize an entity wholesale, echo submitted input, or leak credentials or infrastructure types.
- Services coordinate construction, business-state decisions, persistence, and application output mapping. Use focused factories under `java-readable-code` when justified. A mapper or constructor already owned by the project does not require a new factory layer merely to match the example.
- Domain repositories consume/return their domain model and hide technical transport types. Preserve established projection/query-service contracts when the operation is a read model rather than aggregate retrieval.
- Use `java-request-validation` for binding, validation and input DTO ownership. Map transport DTOs to application input when contracts differ; do not require redundant copies of an intentionally shared application-owned type.

## HTTP Response Contract

For a REST POST that completes resource creation, this collection prefers all three: `201 Created`, a `Location` header identifying the canonical created member, and its public representation including the identifier and server-assigned public values. Requiring the body is a collection convention, not an HTTP-standard requirement. Honor explicitly required compatibility contracts and identify departures during review.

Build output from authoritative persisted values, not the submitted request or a fixed pending marker. Account for database-generated values actually needed in the response; `save()` or `saveAndFlush()` does not necessarily refresh trigger-generated fields. Do not add a refresh or flush unless the persistence contract requires it.

Keep status, headers, URL generation, serialization, and error mapping in the web boundary. Use existing Spring mechanisms such as `ResponseEntity`, configured JSON serialization, and centralized exception handling rather than requiring a custom responder for every endpoint. Canonical URLs must respect configured base paths and trusted proxy handling.

Pending verification is a resource lifecycle state and does not alone make completed creation asynchronous. Use `202 Accepted` for an explicitly asynchronous processing contract. Capability actions and traditional HTML submissions keep their own documented success responses; successful HTML actions commonly use `303 See Other` for Post/Redirect/Get.

## Persistence And Architecture

Activate `java-ddd-architecture` or `java-clean-architecture` only when project instructions select them. Preserve their dependency rules and explicit mapping policy. Do not introduce final record entities, duplicate persistence models, generic repositories, or extra architecture layers to copy another language's example.

Use established Spring Data operation names and the project's transaction boundary. `saveAndFlush` flushes; it is not a universal create operation or a promise of outer transaction commit. Use `java-logging-exceptions` for conflict classification, cause preservation, and failures raised at commit. Keep race-sensitive uniqueness protected by the database rather than a preflight validator alone.

## Verification

Under `java-testing-style`, exercise changed real binding, validation, serialization, persistence and error boundaries. Cover invalid input stopping before business work, authoritative persisted output, expected status and canonical URL, secret exclusion, and conflicts without masking unrelated technical failures. Check configured base paths when URL generation changes. Reuse existing collaborator tests unless their contracts or integration changed.

Reference: [Spring MVC response entities](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/responseentity.html) and [Spring Data JPA transactionality](https://docs.spring.io/spring-data/jpa/reference/jpa/transactions.html). Use documentation matching the target project's installed version.
