---
name: java-spring-security
description: Applies company Spring Security authorization conventions for Java projects. Use when adding, changing, or reviewing Spring Security access control, authorities, roles, controller authorization, service authorization, or object-scoped permission checks.
---

# Java Spring Security

## Authorization Model

Use RBAC for coarse application authorization: roles grant authorities, and protected controller methods check authorities. Use the existing Spring Security infrastructure; do not build a custom role graph, RBAC engine, authorization filter or annotation evaluator.

When implementing or reviewing authorization, read [good/bad authorization examples](references/authorization-examples.md). These examples apply the rules below to controller declarations, route composition, object scope and privilege freshness.

## Authorization Boundary

- Declare each protected operation's complete authority directly on its public controller method using `@PreAuthorize`. Do not put authorization annotations on controller classes or rely on inherited class declarations.
- Each authority-protected handler checks exactly one authority identifying its resource and operation: `<RESOURCE>_<OPERATION>`. For example, `UserController.createUser` checks `hasAuthority('USER_CREATE')`; a separate approval handler checks `USER_APPROVE`.
- Do not combine generic read/write/approval authorities with `and`, `or` or `hasAnyAuthority` to approximate an operation. Name the actual operation and grant its authority through centralized role mapping.
- Do not authorize operations with `hasRole(...)` or `hasAnyRole(...)`.
- Do not duplicate the controller's coarse authority check in its application service. Keep application/domain services free of controller authorization annotations. A service that is an explicitly defined independent security boundary owns its own entry-point authorization; this is not permission to repeat controller checks.

Good:

```java
@PreAuthorize("hasAuthority('USER_CREATE')")
public UserDto createUser(@Valid @RequestBody CreateUserRequest request) {
    return userService.create(request);
}
```

Bad:

```java
@PreAuthorize("hasAuthority('USER_WRITE') and hasAuthority('USER_APPROVE')")
public UserDto createUser(@Valid @RequestBody CreateUserRequest request) {
    return userService.create(request);
}
```

The authority names the operation, not the handler's HTTP verb. A handler named `postUsers` that creates a user also requires `USER_CREATE`. This rule does not rename controller methods or change the active architecture's naming convention.

## Authorities And Roles

- Keep authority vocabulary application-owned, stable and based on resource operations. Use uppercase underscore names such as `USER_READ`, `USER_CREATE`, `USER_UPDATE`, `USER_DELETE` and `USER_APPROVE`.
- Keep role-to-authority mapping in one infrastructure-owned configuration or identity-provider integration. Map authenticated roles to granted authorities before authorization. Do not scatter role-to-capability decisions through controllers or services.
- Read, create, update, delete and approve are independent capabilities. A write operation must not acquire a read requirement merely because it shares a controller with a read handler.
- If the domain requires linked grants, encode and test that relationship in the central authorization model. Do not introduce role inheritance without an explicit domain requirement.
- Use Spring's authority checks directly. Do not introduce a custom permission annotation or evaluator solely to wrap `hasAuthority`.

## Spring Security Composition

Authentication and request-level authorization use the configured servlet `SecurityFilterChain`. Controller `@PreAuthorize` uses method-security interception. Enable method security with `@EnableMethodSecurity` in the existing security configuration and verify actual interception; annotations alone do not secure a handler.

Spring MVC binds/deserializes and validates controller DTO arguments after the servlet filters. Read [Spring MVC request processing](../java-request-validation/SKILL.md#spring-mvc-request-processing) when composing security with input handling. Do not introduce a DTO-building security filter or manually parse credentials in a controller.

Spring supports class-level `@PreAuthorize`, but this collection requires method-local declarations. When correcting existing code, account for Spring's actual semantics: a method-level `@PreAuthorize` overrides the class-level declaration of that annotation; they do not implicitly form an AND. Do not repeat `@PreAuthorize` on the same method.

## Route Classification And Browser Protection

Inventory public, authenticated-only, authority-protected and framework-managed endpoints together with their matching filter chains.

- Explicitly allow public routes in security configuration. Keep public token-capability routes, such as password-reset confirmation, accessible without a login while enforcing their actual token contract.
- Authenticated-only controller handlers declare `@PreAuthorize("isAuthenticated()")`; they do not invent a resource authority merely to require login.
- Authority-protected controller handlers declare their single resource-operation authority directly on the method.
- Keep framework-managed endpoints, such as Spring Security logout, in their framework configuration. Do not add a controller solely to give such an endpoint an annotation.
- Define catch-all request authorization in the filter chain. An absent method annotation does not establish public access. Unclassified routes and security configuration/handler-resolution failures must not open access.
- Preserve CSRF protection for state-changing browser requests authenticated with automatically attached credentials, including JSON submissions. JSON alone is not a reason to disable CSRF; stateless bearer-only APIs follow their documented threat model.
- Preserve the established login redirect or HTTP 401 contract for unauthenticated access. Use HTTP 403 when an authenticated identity lacks the required authority. Do not convert denials into successful responses.

## Object-Scoped Rules And DDD Placement

The controller authority permits invoking the operation. Enforce ownership, tenant/account scope, lifecycle transitions and other state-dependent rules in application/domain policies or services where the relevant objects and transaction are available. Do not replace these rules with an administrator role check, encode object IDs into authority strings, or add object checks to the coarse `@PreAuthorize` expression.

Keep servlet requests, Spring Security `Authentication`/context APIs and authorization engines outside application/domain service contracts. Adapt authenticated identity to an application-owned value such as `CurrentUser` at the entry boundary when an operation needs actor identity. For DDD package ownership, follow [security boundaries](../java-ddd-architecture/SKILL.md#security-boundaries) only when that architecture is selected.

## Privilege Freshness

Role grants and revocations must take effect on the next request.

- For server-side account sessions, reload granted authorities or check an account security version/revocation state on each request. Invalidate or refresh affected sessions when privileges change; authorities cached at login are insufficient.
- For self-contained tokens, use online revocation, introspection or a security-version check sufficient to enforce next-request freshness. Expiry alone does not satisfy this requirement. Do not claim that issuing a new token revokes an existing one.
- Enforce invariants such as retaining at least one active administrator transactionally in the application/domain operation that changes privileges.
- Record successful and rejected privilege changes under `java-logging-exceptions`; apply session lifecycle behavior under `java-authentication-security`.

## Required Pre-Final Review

Use `java-testing-style` for real security-filter and method-security integration coverage. Before finalizing authorization changes, verify that:

- each protected public controller handler declares exactly one correct resource-operation authority directly on the method;
- authenticated-only and public routes are intentional, and framework-managed endpoints retain their framework protection;
- controller classes have no authorization annotations, role checks and combined generic authorities are absent, and services do not duplicate controller checks;
- authority vocabulary is application-owned and role-to-authority mappings remain centralized;
- enabled method security and the actual filter chain deny missing authority before protected application work runs;
- route inventory covers public, authenticated-only and authority-protected access, matching filter chains, expected 401/redirect versus 403 outcomes, and CSRF;
- write operations do not accidentally require read capabilities;
- object/tenant scope is enforced with relevant domain state rather than request-controlled ownership assertions;
- grants and revocations are effective on the next request for both sessions and tokens, and privilege invariants remain protected; and
- security configuration failures fail closed.

Do not infer security solely from annotation presence or bypass filters in security integration tests. See the [good/bad examples](references/authorization-examples.md) for concrete review cases.

References: [Spring Security method authorization](https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html), [request authorization](https://docs.spring.io/spring-security/reference/servlet/authorization/authorize-http-requests.html), and [CSRF protection](https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html). Check the target project's installed version before using version-specific APIs.
