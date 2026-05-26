---
name: java-spring-security
description: Applies company Spring Security authorization conventions for Java projects. Use when adding, changing, or reviewing Spring Security access control, authorities, roles, controller authorization, service authorization, or object-scoped permission checks.
---

# Java Spring Security

## Authorization Boundary

Use Spring Security method authorization with `@PreAuthorize` at the controller boundary for backend or admin access control.

Do not duplicate controller authorization on application services.

Keep services free of Spring Security annotations unless the service itself is exposed as a separate security boundary.

## Authorities And Roles

Prefer direct capability authorities with `hasAuthority('SOME_CAPABILITY')`.

Use plain authority names such as `ADMIN_DASHBOARD_VIEW` or `INSTALLATION_CONTENT_PAGE_MANAGE`.

Do not use `hasRole(...)` or `hasAnyRole(...)` for authorization decisions.

Roles should grant capabilities. Authorization should check capabilities.

Map roles to their granted authorities during authentication.

## Object-Scoped Permissions

Use `hasPermission(...)` only for object-scoped decisions where the target id or domain object matters.

Examples include checking whether a user may view or modify a specific account, tenant, property, or managed resource.
