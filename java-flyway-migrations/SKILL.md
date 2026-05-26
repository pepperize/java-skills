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
