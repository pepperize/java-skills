---
name: java-flyway-migrations
description: Applies company Flyway migration conventions for Java projects. Use when adding, reviewing, or deciding whether to create database migrations, especially Flyway SQL migration files and migration version naming.
---

# Java Flyway Migrations

## Creation Rule

Do not add database migrations unless they are explicitly needed by the requested change or explicitly requested by the user.

If a schema change is implied but not clearly required, ask before adding a migration.

## Version Naming

When adding Flyway migrations, use timestamp-based versions.

Use names like:

`V20260414_1829__foo_bar.sql`

Do not use sequential versions like:

`V1__foo_bar.sql`

## Scope

Keep each migration focused on the schema or data transition required for the change.

Avoid bundling unrelated cleanup or opportunistic schema edits into the same migration.

## Applied Migration Integrity

Do not edit already-applied migrations to change schema behavior. Add a new timestamped migration instead.

After adding or changing Flyway migrations, verify a real application startup or an equivalent Spring context path that runs Flyway validation and migration. Use the project-documented startup command when one exists.

If Flyway reports a checksum mismatch, do not blindly repair. First inspect the live schema. Repair is acceptable only when the schema already matches the current migration files and the issue is local metadata drift.
