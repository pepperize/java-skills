# Worked User Endpoint

This sketch creates a directory user with a display name. It is not registration, login, verification, or notification infrastructure. Reuse the target application's identity type, validation, persistence, mapping and HTTP conventions.

## Flow

```text
UserController.postUsers(CreateUserRequest)
  -> map transport request to CreateUserCommand when contracts differ
  -> UserService.create(CreateUserCommand): UserDto
       -> construct User through existing constructor or justified factory
       -> UserRepository.save(User): User
       -> map persisted User to public UserDto
  -> ResponseEntity with 201, canonical member Location, and UserDto
```

Use the request directly as service input only when it is intentionally application-owned and transport independent. The command below illustrates an actual HTTP-to-application boundary, including validation metadata placement; it is not a rule requiring two copies in every project.

## Input And Output

The following request belongs to the web boundary. Adapt `jakarta` versus `javax` imports to the installed platform; records require a compatible Java version and serializer.

```java
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
    @NotBlank @Size(max = 100) String name
) {}
```

An application command has no HTTP dependency. Its invariants follow the actual domain; HTTP validation does not justify removing domain protection required for other real callers.

```java
public record CreateUserCommand(String name) {}
```

An output-only DTO exposes selected fields. Add email or other account data only when the actual public contract permits them.

```java
public record UserDto(Long id, String name) {}
```

## Service And Persistence

This service excerpt assumes an existing `User` constructor, `getId()`/`getName()` accessors, repository `save(User): User`, and injected `UserDtoFactory.create(User): UserDto`. Retain the project's existing creation/mapping collaborators rather than introducing them solely for this excerpt.

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
    public UserDto create(CreateUserCommand command) {
        var user = new User(command.name());
        var persistedUser = userRepository.save(user);

        return userDtoFactory.create(persistedUser);
    }
}
```

The DTO factory explicitly selects `getId()` and `getName()`. Map from the returned entity, which may differ from the supplied one under merge semantics. The actual persistence strategy must make the response fields available; exercise it in an integration test. Do not assume an arbitrary generated field is available simply because `save` returned.

Spring infrastructure must register and proxy this service for `@Transactional` to apply. Reuse component scanning or existing configuration; do not activate DDD/Clean Architecture or move framework configuration merely because the example shows a service. Transaction completion may fail after the method body returns, before the proxy returns to its caller. Place conflict translation at a boundary that can actually observe the relevant failure and identify the constraint; do not wrap the entire service in `catch (RuntimeException)` or query a failed persistence context.

## Controller And HTTP Response

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
        var command = new CreateUserCommand(request.name());
        var userDto = userService.create(command);
        var location = ServletUriComponentsBuilder.fromCurrentRequestUri()
            .path("/{userId}")
            .buildAndExpand(userDto.id())
            .toUri();

        return ResponseEntity.created(location).body(userDto);
    }
}
```

Use this URI construction only when the current collection URI is the canonical parent. An aliased route or different public member path needs the application's existing canonical URL mechanism. Verify context/base paths and configure forwarded headers only for trusted proxies; never trust arbitrary client-supplied host/forwarding headers to define public URLs.

Binding and validation run before the service call through installed MVC infrastructure. Existing advice translates application failures; credentials, CSRF and authorization follow the actual endpoint's policy. The example does not declare all user creation public.

## Rendered Page And HTML Action Are Different Contracts

An HTML GET may use `RegistrationViewService.fetchPage(...)` and a complete page ViewModel. A traditional HTML POST may use `RegistrationService.register(...)`, redisplay safe input on validation errors, and redirect with `303` after success. Neither requires REST resource naming or `201` just because the UI creates something. Conversely, a rendered form calling `POST /api/users` uses the REST contract for that request.
