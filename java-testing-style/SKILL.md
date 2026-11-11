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
- Do not add tests for unchanged existing behavior solely because an acceptance criterion mentions it. Test the regression risk introduced by the change at the boundary where the new composition occurs, and rely on existing collaborator contracts unless those contracts or their integration changed.

## Test Subjects, Class Names, And Boundaries

- Name test classes exactly `<ProductionClassName>Test` for unit tests and `<ProductionClassName>IT` for integration tests. The prefix must identify the production class under test; do not substitute a feature, workflow, or scenario name or append one before the suffix. Put scenarios in test method names or nested classes.
- In request/response applications, place integration tests at controller and repository boundaries. Test intermediate layers, including application services, use cases, and orchestration classes, with unit tests and mocked collaborators.
- Exercise request-level transaction behavior, including rollback across multiple repositories, through controller integration tests. Exercise queries, ORM mappings, cascades, constraints, and optimistic locking through repository integration tests.
- A service coordinating database changes does not justify a service integration test. Choose the test boundary from the production responsibility before choosing Spring or Testcontainers; using infrastructure does not justify the boundary.

## Unit Tests

- Default to London-style unit tests for application services, use cases, orchestration classes, ports, and clients.
- Prefer `@ExtendWith(MockitoExtension.class)`, `@Mock` fields for shared collaborators, and `@InjectMocks` for the SUT as the standard unit-test setup. These annotations bring clarity by making collaborators and the subject under test immediately identifiable without manual wiring.
- Prefer mocking all collaborators, including simple configuration holders, to keep the SUT declarative with `@InjectMocks`.
- Reserve explicit SUT construction, such as a `getSut()` helper, for the uncommon case where an unmocked collaborator needs to be injected. Do not use it as the default when annotations can express the setup.
- Avoid `@BeforeEach` methods that only wire dependencies into the SUT.
- Use real collaborators only when they are intentionally part of the behavior under test and do not turn the test into a boundary integration test.
- Prefer explicit assertions and interaction verifications over indirect failure-by-missing-stub setups.
- In interaction-based tests, verify the end of the signal path at the relevant boundary; verify intermediate interactions only when they are the behavior under test.
- Prefer direct value verification such as `verify(client).send(expectedRequest)` when the argument has meaningful value equality and the expected value is easy to construct. Use `ArgumentCaptor` or `argThat` only when direct equality is unavailable, partial matching is clearer, or the captured argument supports multiple observations.
- Do not mix state/assertion-style and interaction-style verification for the same behavior in one unit test.

## Test Layout

- When `@Nested` classes identify the method under test, use UpperCamelCase class names such as `Init` or `Read`, never method-style lowercase names such as `init` or `read`.
- When test data represents the same concept as a production value, use the same domain-oriented variable name unless the test needs to distinguish expected, actual, or multiple variants.
- Prefer code locality over front-loaded variable blocks. Create inputs, expected values, and intermediates near the `when(...)`, act step, or assertion that uses them.
- Do not split setup into a front-loaded data block followed by a separate stubbing block. Keep setup in execution order.
- Use empty lines only between major blocks such as Arrange/Act/Assert or Given/When/Then.
- For repeated interactions such as loop iterations, order setup in the same sequence as the code under test.

### Identify And Declare The Subject Under Test

- Name the primary object whose behavior is being tested `sut`, in both unit and integration tests.
- Apply this whether the object is constructed directly, injected by Spring, or created with `@InjectMocks`.
- Give collaborators descriptive names that identify their responsibilities. Domain fixtures and expected or actual results are not the SUT.
- Declare `@Mock` and `@Spy` collaborators before the `@InjectMocks` field, so dependencies appear before the subject under test.

Bad: the subject has a generic name and appears before its collaborators.

```java
@InjectMocks
private OrderService service;

@Mock
private OrderRepository orderRepository;
```

Good: collaborators appear first and the subject is named `sut`.

```java
@Mock
private OrderRepository orderRepository;

@InjectMocks
private OrderService sut;
```

The same naming rule applies to Spring-injected subjects in integration tests.

Bad:

```java
@Autowired
private OrderRepository repository;
```

Good:

```java
@Autowired
private OrderRepository sut;
```

### Test Data Construction

- Prefer direct object construction or instantiate existing project dummies inside each test. Follow the project's established dummy and test-data conventions.
- Keep scenario-specific property changes and persistence calls visible in the test. Repeating a few straightforward constructors and setters is acceptable.
- Do not introduce a test data factory, builder, or setup helper merely to wrap constructors and setters or remove a few repeated setup lines. Extract construction only when its complexity provides a concrete readability benefit.
- Factory naming and dependency-injection guidance does not require extracting test setup into collaborators. A restriction on static helpers is not a reason to introduce an instance factory.

### Keep Scenario Setup Inside Each Test

- Each test must explicitly arrange its own domain objects, persisted records, and scenario-specific stubs.
- Do not create those fixtures in `@BeforeEach`, `@BeforeAll`, superclass setup, or test-instance field initializers. Do not pass them implicitly through mutable test fields.
- When a builder, factory, or setup helper is justified by construction complexity, call it explicitly from each test and return the fixtures as local variables. Keep scenario-specific changes and persistence in the test.
- Reserve lifecycle methods for infrastructure lifecycle and cleanup, such as starting or resetting external resources.
- Being recreated before every test does not make a fixture self-contained. Execution independence and explicit scenario setup are separate requirements.

Bad: the test depends on an article prepared elsewhere.

```java
private WireArticle wireArticle;

@BeforeEach
void createWireArticle() {
    wireArticle = new WireArticle("wire-42");
    wireArticle.setName("Test wire");
}

@Test
void givenNewWireArticle_shouldReloadName() {
    sut.save(wireArticle);
    flushAndClear();

    var actual = sut.findById(wireArticle.getId()).orElseThrow();
    assertEquals("Test wire", actual.getName());
}
```

Good: the test constructs its fixture locally and explicitly persists it.

```java
@Test
void givenNewWireArticle_shouldReloadName() {
    var wireArticle = new WireArticle("wire-42");
    wireArticle.setName("Test wire");

    sut.save(wireArticle);
    flushAndClear();

    var actual = sut.findById(wireArticle.getId()).orElseThrow();
    assertEquals("Test wire", actual.getName());
}
```

## Exception Assertions

- When using `assertThrows` or `assertThrowsExactly` for an unchecked exception, keep the assertion lambda focused on exactly one invocation that may throw: the operation under test.
- Evaluate unrelated constructors, factories, collection creation, accessors, argument-building calls, and chained calls before the assertion.
- Keep extracted inputs close to the assertion so the exception source remains obvious.
- Keep a constructor or factory inside the lambda only when that construction is itself the operation under test.
- Do not hide multiple invocations in a helper merely to satisfy static analysis.

```java
var locales = List.of(german);

var actual = assertThrows(RuntimeException.class, () -> sut.load(locales));
```

## Parameterized Tests

- Prefer a parameterized test when multiple tests exercise the same behavior, vary only input data, and assert the same outcome or violation path.
- For Bean Validation tests, group invalid values for the same property into one parameterized test, such as `givenInvalidRegionCode_shouldFailValidation`.
- Use the simplest source that expresses the cases: `@NullSource`, `@EmptySource`, `@NullAndEmptySource`, `@ValueSource`, or `@CsvSource` before `@MethodSource`.
- Prefer `@NullAndEmptySource` when null and empty values exercise the same behavior; use separate `@NullSource` and `@EmptySource` only when those cases need different setup or expectations.
- Do not fold cases into a parameterized test when setup becomes less readable, such as null map values requiring mutable map construction.
- Name the test after the shared behavior, not every individual case.

## Integration Tests

- Place integration tests at technical boundaries where framework or infrastructure behavior is the risk. For request/response applications, use controller ITs for HTTP, authentication, authorization, binding, serialization, and request-level transaction behavior, and repository ITs for persistence. External client adapters may have ITs with stable realistic infrastructure such as Testcontainers or Localstack; this does not extend integration testing to intermediate service layers.
- Use unit tests instead for external systems that cannot be exercised stably and realistically.
- Keep lightweight unit tests in `src/test/java`.
- Put integration tests in `src/test-integration/java` or `src/test-it/java`, name classes exactly `<ProductionClassName>IT`, and avoid `MvcTest` or `IntegrationTest` suffixes.
- Tests using `@SpringBootTest`, `@DataJpaTest`, `MockMvc`, Testcontainers, real repositories, or other framework/infrastructure boundaries belong in `src/test-integration/java` or `src/test-it/java`. This placement rule does not authorize integration tests for intermediate layers.

## Security Integration Coverage

When authentication, authorization, or protected-route composition changes, exercise the affected real filter chain and method-security boundary. Cover relevant allowed/denied capabilities, anonymous outcomes, CSRF for cookie-authenticated browser writes, tenant/object scope, and public-route allowlists. If composition changes, inventory the affected route mappings and matching security chains; annotation presence alone is insufficient.

For authentication lifecycle changes, use `java-authentication-security` and the project's credential policy. Select applicable scenarios: wrong/unknown/disabled accounts with equal public failure output, limiter boundaries, session rotation and revocation, idle/absolute expiry, cookie attributes, expiring single-use recovery tokens, concurrent token consumption, and credential upgrades preserving legacy compatibility. Use a controllable `Clock` for time boundaries. Verify intended real-or-dummy verification without brittle wall-clock comparisons.

For request binding and API response changes, use `java-request-validation` and `java-api-endpoints`. Exercise the real binder, validator metadata, serializer, and error handler: invalid input must not invoke business work; outputs must omit secrets and use authoritative persisted values. Reuse existing collaborator coverage unless the changed composition introduces a new risk.

## Persistent Test Data

- Arrange persistent state through the narrowest existing API that owns the responsibility for that state.
- Prefer existing services or use cases when setup must satisfy business rules, side effects, or cross-aggregate invariants.
- Prefer repositories when the test only needs already-valid persisted entities and repository behavior is not the subject under test.
- Construct fixtures locally as described under Test Data Construction, using mapped entity instances when persistence requires them. That requirement alone does not justify a factory or copying properties from a dummy into an entity. Keep construction and persistence as explicit steps in the test; separate helper methods are not required.
- Do not embed SQL statements in Java test code, including `JdbcTemplate` calls, native queries, multiline SQL strings, or `@Sql(statements = ...)`.
- When SQL is genuinely necessary for database-boundary setup, put it in dedicated `.sql` files under test resources and reference those files, for example with `@Sql(scripts = ...)`.
- Keep schema changes in migrations, not Java tests or inline test setup.

## Verification

Run the narrowest command that credibly verifies the change before broadening.

For database, configuration, migration, dependency, template, or resource changes that can affect application boot, include project-documented startup verification in the final verification scope, not just unit tests.

- Mapper, factory, and small service changes: focused unit tests first.
- Use case and adapter orchestration changes: affected unit test classes.
- Controller and security changes: affected controller integration tests through the real HTTP/security boundary.
- Persistence changes: affected repository integration tests. Verify cross-repository request transaction behavior through the affected controller IT.
- External client and storage adapter changes: affected technical-boundary integration tests where infrastructure is stable and realistic.
- Event-listener orchestration, file-parsing logic, and helper collaborators: focused unit tests; add boundary integration coverage only for changed framework wiring or infrastructure behavior at the owning technical boundary.

## Verification Scope Review

Before broadening test scope:

- Run the narrowest affected test classes first.
- Do not run broad suites when known environment-dependent tests are unrelated to the change.
- If a focused test failure exposes a wrong assumption, fix the production assumption first instead of adding test-only branches.

## Required Pre-Final Test Review

- Check every added or changed test class: its name must be exactly the production class name plus `Test` or `IT`. In request/response applications, controller and repository boundaries receive ITs; intermediate services, use cases, and orchestration receive unit tests. Move misplaced coverage to the owning boundary rather than merely renaming the test.
- Identify the primary object under test and verify its field or local variable is named `sut`. Verify `@Mock` and `@Spy` collaborators are declared before `@InjectMocks`.
- Inspect lifecycle methods, superclass setup, and test fields for hidden scenario setup. Move domain fixtures, persisted prerequisites, and scenario-specific stubs into the tests that use them.
- Inspect new test data factories, builders, and setup helpers. Inline those that only wrap simple construction or setters; instantiate existing dummies in the tests that use them and keep scenario-specific changes visible.
- Inspect every added or changed unchecked-exception assertion. Keep its lambda limited to the direct operation under test, with potentially throwing setup calls evaluated beforehand.
