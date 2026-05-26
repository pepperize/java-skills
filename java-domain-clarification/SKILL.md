---
name: java-domain-clarification
description: Guides clarification before coding domain-sensitive Java changes. Use when a request affects domain rules, externally visible behavior, identifiers, persistence shape, cross-context scoping, consistency between related outputs, or behavior where domain invariants are not explicit enough to code safely.
---

# Java Domain Clarification

## Before Coding

Check whether the domain invariants are explicit enough to implement safely.

If not, ask concise clarifying questions before starting implementation.

Do this especially when a change affects externally visible behavior, identifiers, persistence shape, cross-context data scoping, or consistency between related outputs.

## Clarify Ambiguous Terms

When a term, parameter, or concept is reused across different meanings, clarify what it means for the affected type or workflow.

Ask for examples when names suggest one concept but are used for another.

## Clarify Scoping

Clarify whether a tenant, user group, context, configuration, or request value is only used for presentation and metadata, or whether it should restrict behavior and returned data.

Ask for at least one cross-context example when scoping is involved.

## Clarify Consistency

Clarify whether related records, views, outputs, or state transitions must correspond one-to-one.

If one output can be returned only when a matching output or state exists elsewhere, add tests that cover that consistency.

## Questions

Prefer a small set of concrete questions over a broad request for more information.

Ask for representative examples that include inputs, expected outputs, and the relevant context boundaries.
