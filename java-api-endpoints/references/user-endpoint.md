# Worked User Endpoint

This sketch creates a directory user with a display name. It is not registration, login, verification, or notification infrastructure. Reuse the target application's identity type, validation, persistence, mapping and HTTP conventions.

## Flow And Contracts

Use `Controller -> Application Service -> Repository -> optional Client` for resource operations. These roles are required boundaries; they do not require a generic base class or a class for every mapping expression.

| Role | Contract and responsibility |
| --- | --- |
| `UserController` | Receives validated input, calls `UserService`, and handles HTTP status, headers and output. |
| `UserService` | Application service: accepts `CreateUserRequest`, coordinates construction and persistence, and returns `UserDto`. |
| `UserFactory` | Constructs `User` from input when a dedicated construction collaborator is justified. |
| `UserRepository` | Accepts `User` for persistence and returns the authoritative persisted `User`; reads accept identifiers or criteria. |
| `UserDtoFactory` | Constructs public `UserDto` from the repository result. |
| `RemoteUserRepository` | Infrastructure implementation: calls `UserClient` and maps transport responses to `User`. |
| `UserClient` | Handles remote communication using the remote API's request/response types. |

Good: construction and representation changes are coordinated by the application service.

```text
Spring MVC resolves and validates CreateUserRequest
  -> UserController.postUsers(CreateUserRequest)
       -> UserService.create(CreateUserRequest): UserDto
            -> construct User through existing constructor or justified factory
            -> UserRepository.save(User): User
            -> UserDtoFactory.create(User): UserDto
       -> ResponseEntity with 201, canonical member Location, and UserDto
```

Bad: the controller takes over application work and presentation mapping.

```java
public ResponseEntity<UserDto> postUsers(@Valid @RequestBody CreateUserRequest request) {
    var user = new User(request.name());
    var persistedUser = userRepository.save(user);
    var userDto = userDtoFactory.create(persistedUser);

    return ResponseEntity.ok(userDto);
}
```

The bad example also loses the completed-creation HTTP contract. The controller must call `UserService.create` instead.

## Input And Output

In this example `CreateUserRequest` is an application-owned input DTO. Bean Validation metadata expresses its input constraints; it has no servlet, HTTP binding or serialization dependencies. MVC binding annotations stay on controller parameters. Adapt `jakarta` versus `javax` imports to the installed platform; records require a compatible Java version and serializer.

```java
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
    @NotBlank @Size(max = 100) String name
) {}
```

Good: pass the same validated DTO to the application service.

```java
var userDto = userService.create(request);
```

Bad: introduce an identical command only to rename the same representation.

```java
var command = new CreateUserCommand(request.name());
var userDto = userService.create(command);
```

A separate application input is required when the web contract actually differs, such as an OpenAPI-generated request with transport-specific types. Map it at the web boundary. See [DTO ownership](../../java-request-validation/SKILL.md#dtos-and-binding); do not duplicate every DTO preemptively. Domain invariants remain separate from request-shape validation.

An output-only DTO exposes selected fields. Add email or other account data only when the actual public contract permits them.

```java
public record UserDto(Long id, String name) {}
```

## Service And Persistence

Good: keep application orchestration and transaction ownership in `UserService`. This excerpt assumes an existing `User` constructor, `getId()`/`getName()` accessors, repository `save(User): User`, and injected `UserDtoFactory.create(User): UserDto`. Retain the project's existing creation/mapping collaborators rather than introducing them solely for this excerpt.

```java
import org.springframework.transaction.annotation.Transactional;

public class UserService {
    private final UserRepository userRepository;
    private final UserDtoFactory userDtoFactory;

    public UserService(UserRepository userRepository, UserDtoFactory userDtoFactory) {
        this.userRepository = userRepository;
        this.userDtoFactory = userDtoFactory;
    }

    @Transactional
    public UserDto create(CreateUserRequest request) {
        var user = new User(request.name());
        var persistedUser = userRepository.save(user);

        var userDto = userDtoFactory.create(persistedUser);

        return userDto;
    }
}
```

The DTO factory explicitly selects `getId()` and `getName()`. Map from the returned entity, which may differ from the supplied one under merge semantics. The actual persistence strategy must make the response fields available; exercise it in an integration test. Do not assume an arbitrary generated field is available simply because `save` returned.

Spring infrastructure must register and proxy this service for `@Transactional` to apply. Reuse component scanning or existing configuration; do not activate DDD/Clean Architecture or move framework configuration merely because the example shows a service. Transaction completion may fail after the method body returns, before the proxy returns to its caller. Place conflict translation at a boundary that can actually observe the relevant failure and identify the constraint; do not wrap the entire service in `catch (RuntimeException)` or query a failed persistence context.

Bad: expose HTTP input/output and the entity through the application service.

```java
public ResponseEntity<User> create(HttpServletRequest request) {
    var user = new User(request.getParameter("name"));
    var persistedUser = userRepository.save(user);

    return ResponseEntity.ok(persistedUser);
}
```

The application service returns the public DTO, not an entity or an HTTP response. Failures are thrown according to the owning operation's contract and mapped by existing MVC exception handling. Do not catch a broad exception merely to return a success-shaped error DTO.

## Controller And HTTP Response

Good: Spring resolves input; the controller invokes the application service and builds the HTTP response.

```java
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserDto> postUsers(@Valid @RequestBody CreateUserRequest request) {
        var userDto = userService.create(request);
        var location = ServletUriComponentsBuilder.fromCurrentRequestUri()
            .path("/{userId}")
            .buildAndExpand(userDto.id())
            .toUri();

        return ResponseEntity.created(location).body(userDto);
    }
}
```

Use this URI construction only when the current collection URI is the canonical parent. An aliased route or different public member path needs the application's existing canonical URL mechanism. Verify context/base paths and configure forwarded headers only for trusted proxies; never trust arbitrary client-supplied host/forwarding headers to define public URLs.

Binding and validation run before the service call through installed MVC infrastructure, not a DTO-building servlet filter. Read [Spring MVC request processing](../../java-request-validation/SKILL.md#spring-mvc-request-processing) for the good/bad security and binding examples. Existing advice translates application failures; credentials, CSRF and authorization follow the actual endpoint's policy. The example does not declare all user creation public.

## Rendered Page And HTML Action Are Different Contracts

An HTML GET may use `RegistrationViewService.fetchPage(...)` and a complete page ViewModel. A traditional HTML POST may use `RegistrationService.register(...)`, redisplay safe input on validation errors, and redirect with `303` after success. Neither requires REST resource naming or `201` just because the UI creates something. Conversely, a rendered form calling `POST /api/users` uses the REST contract for that request.

## Remote Repository And Client

For remote domain data, keep `Service -> Repository -> Client`. This boundary does not require DDD activation; DDD additionally specifies domain ownership of contracts and infrastructure ownership of implementations.

Good: the repository returns the domain model, not the client's transport response. The client below has an established `Optional<VendorUserResponse>` absence contract.

```java
// Entity-facing repository contract
public interface UserRepository {
    Optional<User> findById(UserId userId);
}

// Infrastructure implementation excerpt
@Override
public Optional<User> findById(UserId userId) {
    var response = userClient.findById(userId.value());
    var user = response.map(userFromResponseFactory::create);

    return user;
}
```

Keep `UserClient`, `VendorUserResponse` and `UserFromResponseFactory` in infrastructure. The response factory constructs `User`; the application service separately constructs its output DTO. Preserve technical failures; `Optional.empty()` represents ordinary absence only. Database-backed repositories use JPA/Spring Data infrastructure instead, without a remote client or an extra factory around ordinary ORM hydration.

Bad: leak the remote response through the repository contract.

```java
public interface UserRepository {
    VendorUserResponse findById(UserId userId);
}
```

Bad: bypass the domain-facing repository in the application service.

```java
public UserDto read(UserId userId) {
    var response = userClient.findById(userId.value());
    return userDtoFactory.create(response);
}
```

Use `UserRepository.findById` and map its `User` result instead. For DDD ownership and ordinary absence, read [repository boundaries](../../java-ddd-architecture/references/repository-boundaries.md) only after the DDD activation guard passes.

## Domain Behavior

When DDD is selected, the application service coordinates domain services rather than implementing their business rules. Read [service boundaries](../../java-ddd-architecture/references/service-boundaries.md) for good/bad pricing examples. Do not add a domain service to a simple creation flow that has no domain operation to delegate.
