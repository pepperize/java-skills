---
name: java-spring-security
description: Applies company Spring Security authorization conventions for Java projects. Use when adding, changing, or reviewing Spring Security access control, authorities, roles, controller authorization, service authorization, or object-scoped permission checks.
---

# Java Spring Security

## Authorization Boundary

Use Spring Security method authorization with `@PreAuthorize` at the controller boundary for backend or admin access control.

Do not duplicate controller authorization on application services.

Keep services free of Spring Security annotations unless the service itself is exposed as a separate security boundary.

Keep each protected handler's complete capability requirement visible at the method. Do not accidentally make write handlers require read capabilities through shared controller structure. Preserve an explicit project policy for composed/class-level authorization and verify its effective semantics rather than copying another framework's attribute rules.

Ensure method security is actually enabled and invoked through the framework's security interception. Reuse Spring Security configuration; do not build a parallel attribute evaluator or assume annotations alone secure a route.

## Authorities And Roles

Prefer direct capability authorities with `hasAuthority('SOME_CAPABILITY')`.

Use plain authority names such as `ADMIN_DASHBOARD_VIEW` or `INSTALLATION_CONTENT_PAGE_MANAGE`.

Do not use `hasRole(...)` or `hasAnyRole(...)` for authorization decisions.

Roles should grant capabilities. Authorization should check capabilities.

Map roles to their granted authorities during authentication.

Keep the mapping centralized and capability names stable. Read and write are independent unless an explicit domain rule grants one with the other. Do not add role inheritance without a real requirement.

## Object-Scoped Permissions

Use `hasPermission(...)` only for object-scoped decisions where the target id or domain object matters.

Examples include checking whether a user may view or modify a specific account, tenant, property, or managed resource.

Keep ownership, tenant scope, and lifecycle invariants in application/domain policies with the relevant data. A `hasPermission(...)` evaluator may delegate to that policy; it must not replace it with role checks or trust a request-controlled owner ID. Do not encode object identifiers into authority strings.

## Protected Request Composition

Compose authentication, authorization, and browser protections through the existing `SecurityFilterChain`. Preserve CSRF protection for browser requests authenticated with automatically attached credentials, including JSON submissions. JSON alone is not a reason to disable CSRF; stateless bearer-only APIs follow their documented threat model.

Keep unauthenticated outcomes distinct from authenticated denial: follow the established login redirect or HTTP 401 contract, and use HTTP 403 for insufficient capability. Security configuration and handler-resolution failures must not open a protected route.

## Privilege Freshness

Make grants/revocations effective according to an explicit freshness contract. For server-side account sessions, prefer the next request through reloaded authorities or an account security-version/revocation check. Authorities cached at login do not refresh automatically. For stateless tokens, document expiry, revocation, and any resulting stale-permission window instead of promising immediate invalidation.

Enforce rules such as retaining an active administrator transactionally in the operation that changes privileges. Invalidate or refresh affected sessions as required by `java-authentication-security` and record successful/rejected changes under `java-logging-exceptions`.

## Verification

Use `java-testing-style` for real security-filter and method-security integration coverage. When route/security composition changes, inventory affected mappings and filter chains, identifying intentional public routes and covering anonymous access, denied capabilities, allowed access, CSRF where applicable, and object/tenant scope. Verify denial before protected work runs. Do not infer security solely from annotation presence or bypass the filters in the test setup.

Reference: [Spring Security method authorization](https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html). Check the target project's installed version before using version-specific configuration APIs.
