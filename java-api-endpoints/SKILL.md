---
name: java-api-endpoints
description: Implement, refactor, or review Java REST resource endpoints, their request/output contracts, service and repository responsibilities, and HTTP responses. Rendered pages and traditional HTML actions retain their own contracts.
---

# Java API Endpoints

## Scope And Existing Contracts

Inspect the project's Java/Spring versions, endpoint contract, architecture, serializer, persistence and error handling before editing. Preserve published compatibility and explicit project choices; do not install another framework or migrate unrelated endpoints to apply this skill.

Classify the endpoint as a REST resource operation, rendered page, traditional HTML form action, or another capability action. POST, JSON, or JavaScript submission alone does not establish resource creation. A rendered form calling REST still follows the REST contract at its submission endpoint.

When implementing a resource endpoint, read the [worked User endpoint](references/user-endpoint.md), including its good/bad boundary examples. It applies this collection's resource flow without activating an architecture skill or adding authentication workflows.

## Responsibilities And Naming

- For resource operations, use Controller -> Application Service -> Repository -> optional Client. This skill owns that flow and its DTO/entity boundaries. Controllers call application services; do not query repositories, call their clients, or map entities in controllers.
- Keep resource vocabulary consistent: `UserController`, `UserService`, `CreateUserRequest`, and an output-only `UserDto` or established `UserResponse`. For new or intentionally redesigned routes, prefer plural resource nouns such as `POST /api/users` and `GET /api/users/{userId}`. Use `/registrations` only when registration itself is the resource.
- Follow existing Java controller naming, including the verb/resource convention in active `java-ddd-architecture`. Name supported resource service operations `create`, `read`, `update`, and `delete` where these accurately describe them; preserve meaningful domain operations and explicit project conventions. Do not force a business workflow into generic CRUD or generate unused operations.
- Separate request and output contracts. Explicitly select public output fields; do not serialize an entity wholesale, echo submitted input, or leak credentials or infrastructure types.
- Resource services such as `UserService` are application services: accept an input DTO, coordinate domain services, construction and repository access, and return a separate public output DTO. Keep servlet requests, Spring Security context APIs, `ResponseEntity`, status codes and serialization out of their contracts. Do not return entities for the controller to map. Application services own the use-case transaction boundary; use Spring transactions where the operation requires them.
- Use focused factories under `java-readable-code` when justified. A mapper or constructor already owned by the project does not require a new factory layer merely to match the example. Factories construct representations; they are collaborators, not extra mandatory layers in the chain.
- Repositories accept domain models for persistence and return domain models for model results; lookups accept identifiers or criteria. Request/output DTOs and client transport responses do not cross this boundary. Preserve established projection/query-service contracts when the operation is a read model rather than aggregate retrieval.
- A repository implementation may call a technical Client for remote data. The client owns communication; the repository maps the transport response to the domain model inside infrastructure. Application services must not bypass that repository by calling its client. Database-backed repositories use persistence infrastructure instead of a remote client. An email sender is a separate capability, not a repository.
- Use `java-request-validation` for binding, validation and input DTO ownership. Map transport DTOs to application input when contracts differ; do not require redundant copies of an intentionally shared application-owned type.
- Use `java-ddd-architecture` for application/domain-service ownership when DDD is selected. Keep `UserService` for the resource application service and purpose-based names such as `ProductPricingService` for domain behavior; do not rename every service to `...ApplicationService`. Spring's `@Service` annotation does not distinguish these responsibilities.
- Throw exceptions according to the owning operation's failure contract; do not return exception objects as output DTOs. Existing MVC exception handling maps application failures to HTTP under `java-logging-exceptions` and `java-request-validation`.

## HTTP Response Contract

For a REST POST that completes resource creation, this collection prefers all three: `201 Created`, a `Location` header identifying the canonical created member, and its public representation including the identifier and server-assigned public values. Requiring the body is a collection convention, not an HTTP-standard requirement. Honor explicitly required compatibility contracts and identify departures during review.

Build output from authoritative persisted values, not the submitted request or a fixed pending marker. Account for database-generated values actually needed in the response; `save()` or `saveAndFlush()` does not necessarily refresh trigger-generated fields. Do not add a refresh or flush unless the persistence contract requires it.

Keep status, headers, URL generation, serialization, and error mapping in the web boundary. Use existing Spring mechanisms such as `ResponseEntity`, configured JSON serialization, and centralized exception handling rather than requiring a custom responder for every endpoint. Canonical URLs must respect configured base paths and trusted proxy handling.

Pending verification is a resource lifecycle state and does not alone make completed creation asynchronous. Use `202 Accepted` for an explicitly asynchronous processing contract. Capability actions and traditional HTML submissions keep their own documented success responses; successful HTML actions commonly use `303 See Other` for Post/Redirect/Get.

## Persistence And Architecture

Activate `java-ddd-architecture` or `java-clean-architecture` only when project instructions select them. Preserve their dependency rules and explicit mapping policy. Choose entity types compatible with the project's JPA provider and persistence contract. Add separate persistence models, repository abstractions, or architecture layers only when the project's requirements justify them.

Use established Spring Data operation names and the project's transaction boundary. `saveAndFlush` flushes; it is not a universal create operation or a promise of outer transaction commit. Use `java-logging-exceptions` for conflict classification, cause preservation, and failures raised at commit. Keep race-sensitive uniqueness protected by the database rather than a preflight validator alone.

## Verification

Under `java-testing-style`, exercise changed real binding, validation, serialization, persistence and error boundaries. Cover invalid input stopping before business work, authoritative persisted output, expected status and canonical URL, secret exclusion, and conflicts without masking unrelated technical failures. Check configured base paths when URL generation changes. Reuse existing collaborator tests unless their contracts or integration changed.

Trace the roles before finalizing: controller -> application service -> repository -> optional client. Verify that the service returns the public DTO, repositories hide client transport types, and entity/output construction stays with the appropriate factories or existing constructors/mappers. For domain behavior, verify the application/domain-service split without adding a domain service to every CRUD operation.

Reference: [Spring MVC response entities](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/responseentity.html) and [Spring Data JPA transactionality](https://docs.spring.io/spring-data/jpa/reference/jpa/transactions.html). Use documentation matching the target project's installed version.
