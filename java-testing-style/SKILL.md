---
name: java-testing-style
description: Applies company Java testing conventions and verification heuristics. Use when adding or changing Java tests, fixing failing tests, doing TDD, choosing unit versus integration coverage, or selecting Maven/Gradle verification scope.
---

# Java Testing Style

## Default Heuristics

Prefer FIRST: Fast, Isolated, Repeatable, Self-Verifying, and Timely.

Prefer OTAO: one test should cover one behavior and ideally have one reason to fail.

Multiple assertions are acceptable only when they verify the same single behavior.

Name unit test methods with:

`given{SomeCondition}_should{ExpectedResult}`

Prefer naming the observed value `actual`.

Prefer JUnit Jupiter assertions over AssertJ.

Use `org.junit.jupiter.api.Assertions` for assertions in tests. Do not introduce AssertJ unless the project already requires it or the user explicitly asks for it.

## Unit Tests

Default to London-style unit tests for application services, use cases, orchestration classes, and collaborators with ports or clients.

Prefer mocking collaborators when that keeps the SUT declarative with `@InjectMocks`.

In London-style unit tests, prefer mocking all collaborators, including simple configuration holders, when that keeps the SUT declarative with `@InjectMocks`.

Avoid `@BeforeEach` setup methods that only exist to wire dependencies into the SUT.

Use real collaborators in a unit test only when that collaborator is part of the behavior intentionally under test and does not turn the test into a boundary integration test.

Prefer explicit assertions and interaction verifications over indirect failure-by-missing-stub setups.

In interaction-based tests, verify the end of the signal path at the relevant boundary. Verify intermediate interactions only when they are themselves the behavior under test.

Do not mix state/assertion-style verification and interaction-style verification for the same behavior in one unit test.

## Test Layout

Prefer code locality over front-loaded variable blocks. Create inputs, expected values, and intermediate objects near the `when(...)`, act step, or assertion that uses them.

Do not split setup into a front-loaded data block followed by a separate stubbing block. Keep setup in the same order as the execution flow.

Use empty lines only to separate major blocks such as Arrange/Act/Assert or Given/When/Then.

When arranging repeated interactions such as loop iterations, order setup in the same sequence as the code under test.

## Integration Tests

Place integration tests at technical boundaries where framework or infrastructure behavior is the risk.

Good candidates include Spring controllers for routing, authentication, authorization, request binding, and response serialization.

Repositories and external boundaries should use realistic stable infrastructure when available, such as Testcontainers or Localstack.

Do not force integration tests for external systems that cannot be exercised in a stable, realistic way. Use unit tests there instead.

Keep lightweight unit tests in `src/test/java`.

Place integration tests in `src/test-integration/java`.

Name integration test classes with an `IT` suffix so Failsafe-style builds can select them consistently.

Avoid `MvcTest` or `IntegrationTest` suffixes for integration test classes unless the project already uses that convention.

Tests using `@SpringBootTest`, `@DataJpaTest`, `MockMvc`, Testcontainers, real repositories, or other framework and infrastructure boundaries belong in `src/test-integration/java`.

## Verification

Run the narrowest command that credibly verifies the change before broadening to larger suites.

For mapper, factory, and small service changes, run focused unit tests first.

For use case and adapter orchestration changes, run the affected unit test classes.

For controller, security, and event-listener changes, run relevant integration tests.

For persistence, object storage, file parsing, and infrastructure boundaries, run boundary integration tests plus focused unit tests around helper collaborators when present.
