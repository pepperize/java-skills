---
name: java-testing-style
description: Use when adding or changing Java tests, fixing failing tests, doing TDD, choosing unit versus integration coverage, or selecting Maven/Gradle verification scope.
---

# Java Testing Style

## Default Heuristics

- Prefer FIRST: Fast, Isolated, Repeatable, Self-Verifying, and Timely.
- Prefer OTAO: one test covers one behavior and ideally has one reason to fail. Multiple assertions are fine when they verify that same behavior.
- Name unit tests `given{SomeCondition}_should{ExpectedResult}`.
- Name the observed value `actual`.
- Use JUnit Jupiter assertions from `org.junit.jupiter.api.Assertions`; do not introduce AssertJ unless the project requires it or the user asks for it.
- Keep assertions simple and readable.

## Unit Tests

- Default to London-style unit tests for application services, use cases, orchestration classes, ports, and clients.
- Prefer mocking all collaborators, including simple configuration holders, when that keeps the SUT declarative with `@InjectMocks`.
- Avoid `@BeforeEach` methods that only wire dependencies into the SUT.
- Use real collaborators only when they are intentionally part of the behavior under test and do not turn the test into a boundary integration test.
- Prefer explicit assertions and interaction verifications over indirect failure-by-missing-stub setups.
- In interaction-based tests, verify the end of the signal path at the relevant boundary; verify intermediate interactions only when they are the behavior under test.
- Do not mix state/assertion-style and interaction-style verification for the same behavior in one unit test.

## Test Layout

- Prefer code locality over front-loaded variable blocks. Create inputs, expected values, and intermediates near the `when(...)`, act step, or assertion that uses them.
- Do not split setup into a front-loaded data block followed by a separate stubbing block. Keep setup in execution order.
- Use empty lines only between major blocks such as Arrange/Act/Assert or Given/When/Then.
- For repeated interactions such as loop iterations, order setup in the same sequence as the code under test.

## Parameterized Tests

- Prefer a parameterized test when multiple tests exercise the same behavior, vary only input data, and assert the same outcome or violation path.
- For Bean Validation tests, group invalid values for the same property into one parameterized test, such as `givenInvalidRegionCode_shouldFailValidation`.
- Use the simplest source that expresses the cases: `@NullSource`, `@EmptySource`, `@NullAndEmptySource`, `@ValueSource`, or `@CsvSource` before `@MethodSource`.
- Prefer `@NullAndEmptySource` when null and empty values exercise the same behavior; use separate `@NullSource` and `@EmptySource` only when those cases need different setup or expectations.
- Do not fold cases into a parameterized test when setup becomes less readable, such as null map values requiring mutable map construction.
- Name the test after the shared behavior, not every individual case.

## Integration Tests

- Place integration tests at technical boundaries where framework or infrastructure behavior is the risk: Spring controllers, authentication, authorization, binding, serialization, repositories, and external clients with stable realistic infrastructure such as Testcontainers or Localstack.
- Use unit tests instead for external systems that cannot be exercised stably and realistically.
- Keep lightweight unit tests in `src/test/java`.
- Put integration tests in `src/test-integration/java` or `src/test-it/java`, name classes with an `IT` suffix, and avoid `MvcTest` or `IntegrationTest` suffixes.
- Tests using `@SpringBootTest`, `@DataJpaTest`, `MockMvc`, Testcontainers, real repositories, or other framework/infrastructure boundaries belong in `src/test-integration/java` or `src/test-it/java`.

## Persistent Test Data

- Arrange persistent state through the narrowest existing API that owns the responsibility for that state.
- Prefer existing services or use cases when setup must satisfy business rules, side effects, or cross-aggregate invariants.
- Prefer repositories when the test only needs already-valid persisted entities and repository behavior is not the subject under test.
- Use test data builders, fixture factories, or project-local test helpers for object construction; keep persistence, business behavior, and object construction in separate helpers.
- Do not embed SQL statements in Java test code, including `JdbcTemplate` calls, native queries, multiline SQL strings, or `@Sql(statements = ...)`.
- When SQL is genuinely necessary for database-boundary setup, put it in dedicated `.sql` files under test resources and reference those files, for example with `@Sql(scripts = ...)`.
- Keep schema changes in migrations, not Java tests or inline test setup.

## Verification

Run the narrowest command that credibly verifies the change before broadening.

For database, configuration, migration, dependency, template, or resource changes that can affect application boot, include project-documented startup verification in the final verification scope, not just unit tests.

- Mapper, factory, and small service changes: focused unit tests first.
- Use case and adapter orchestration changes: affected unit test classes.
- Controller, security, and event-listener changes: relevant integration tests.
- Persistence, object storage, file parsing, and infrastructure boundaries: boundary integration tests plus focused unit tests around helper collaborators when present.

## Verification Scope Review

Before broadening test scope:

- Run the narrowest affected test classes first.
- Do not run broad suites when known environment-dependent tests are unrelated to the change.
- If a focused test failure exposes a wrong assumption, fix the production assumption first instead of adding test-only branches.
