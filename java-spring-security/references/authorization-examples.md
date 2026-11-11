# Authorization Good And Bad Examples

These are focused excerpts. Reuse existing constructor injection, MVC advice, identity integration, security configuration and transaction infrastructure. The examples do not introduce new framework wrappers or prescribe an account-registration product.

## One Authority Per Operation

Good: each public handler declares its own resource-operation authority. Creation does not require approval; approval is a separate operation.

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    // Constructor-injected UserService omitted.

    @GetMapping("/{userId}")
    @PreAuthorize("hasAuthority('USER_READ')")
    public UserDto getUser(@PathVariable UserId userId) {
        return userService.read(userId);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('USER_CREATE')")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody CreateUserRequest request) {
        var userDto = userService.create(request);
        var location = ServletUriComponentsBuilder.fromCurrentRequestUri()
            .path("/{userId}")
            .buildAndExpand(userDto.id())
            .toUri();

        return ResponseEntity.created(location).body(userDto);
    }

    @PostMapping("/{userId}/approval")
    @PreAuthorize("hasAuthority('USER_APPROVE')")
    public UserDto approveUser(@PathVariable UserId userId) {
        return userService.approve(userId);
    }
}
```

Use this URI construction only when the current collection URI is the canonical parent, with configured trusted-proxy handling. The authority rule does not change endpoint naming or response contracts; use `java-api-endpoints` for those concerns.

Bad: a role check substitutes for the actual operation.

```java
@PreAuthorize("hasRole('ADMIN')")
public UserDto createUser(CreateUserRequest request) { /* ... */ }
```

Bad: combined generic capabilities obscure the operation being protected.

```java
@PreAuthorize("hasAuthority('USER_WRITE') and hasAuthority('USER_APPROVE')")
public UserDto createUser(CreateUserRequest request) { /* ... */ }
```

Also reject `hasAnyAuthority('USER_WRITE', 'USER_APPROVE')` for this handler. Grant `USER_CREATE` to each role that may create a user through the centralized mapping.

## Method Placement And Role Mapping

Bad: authorization is inherited from a controller class, so the read handler's declaration is incomplete locally.

```java
@PreAuthorize("hasAuthority('USER_READ')")
@RestController
class UserController {
    @GetMapping("/api/users/{userId}")
    public UserDto getUser(@PathVariable UserId userId) { /* ... */ }

    @PostMapping("/api/users")
    @PreAuthorize("hasAuthority('USER_CREATE')")
    public UserDto createUser(CreateUserRequest request) { /* ... */ }
}
```

Good: remove the class annotation and put `USER_READ` on `getUser` and `USER_CREATE` on `createUser`, as in the first example. In the bad example, Spring's method-level `USER_CREATE` overrides the class-level `USER_READ`; it does not require both. Correct placement without inventing an additional read requirement.

Good centralized mapping, owned by infrastructure:

```text
USER_MANAGER -> USER_READ, USER_CREATE, USER_UPDATE, USER_DELETE
USER_AUDITOR -> USER_READ
USER_APPROVER -> USER_READ, USER_APPROVE
```

Bad: each controller or service invents a role-to-operation mapping.

```java
if (currentUser.hasRole("ADMIN") || currentUser.hasRole("SUPERVISOR")) {
    return userService.create(request);
}
```

Do not repeat the controller's `USER_CREATE` annotation on `UserService.create`. A distinct non-HTTP entry point must define its own security boundary rather than assume controller protection covers every caller.

## Framework Processing And Route Classification

Good: enable method interception in the existing configuration; let Spring Security handle authentication and request authorization and MVC handle DTO conversion/validation.

```java
@Configuration
@EnableMethodSecurity
class SecurityConfiguration {
    // Existing SecurityFilterChain beans and identity integration.
}
```

Bad: manually implement these mechanisms in a handler or construct a parallel annotation evaluator.

```java
public UserDto createUser(HttpServletRequest request) {
    checkBearerToken(request);
    checkRole(request, "ADMIN");
    var input = parseAndValidateUser(request);

    return userService.create(input);
}
```

Good: declare an authenticated-only handler explicitly; permit public routes intentionally in the filter chain and define catch-all request authorization. Keep Spring Security logout configured by Spring Security.

```java
@PreAuthorize("isAuthenticated()")
@GetMapping("/profile")
public ProfileDto getProfile() {
    return profileService.read();
}
```

Bad: rely on a private-looking URL or assume a missing annotation means public.

```java
@GetMapping("/private/profile")
public ProfileDto getProfile() {
    return profileService.read();
}
```

A filter chain can still protect the bad example, but the controller declaration fails this collection's authenticated-only rule. Verify effective filter-chain coverage as well as declarations. Public password-reset confirmation validates its token; it must not require an existing login. An explicit public allowance does not bypass CSRF or validate the reset token by itself.

## Object Scope And Actor Identity

Good: check `USER_UPDATE` at the controller and pass an application-owned actor identity to the operation. Here `AuthenticatedUser` is the existing security principal, and `CurrentUserFactory` is the existing entry-boundary adapter.

```java
@PreAuthorize("hasAuthority('USER_UPDATE')")
@PutMapping("/api/users/{userId}")
public UserDto updateUser(@PathVariable UserId userId,
                          @Valid @RequestBody UpdateUserRequest request,
                          @AuthenticationPrincipal AuthenticatedUser principal) {
    var currentUser = currentUserFactory.create(principal);
    var userDto = userService.update(userId, request, currentUser);

    return userDto;
}
```

```java
// Application service: relevant domain state and the write share a transaction.
@Transactional
public UserDto update(UserId userId, UpdateUserRequest request, CurrentUser currentUser) {
    var user = userRepository.findById(userId)
        .orElseThrow(() -> new UserNotFoundException(userId));
    userChangePolicy.checkAllowed(currentUser, user);
    userChangeService.update(user, request.displayName());
    var persistedUser = userRepository.save(user);
    var userDto = userDtoFactory.create(persistedUser);

    return userDto;
}
```

The application policy checks actor scope using trusted identity and loaded state. The domain service receives the domain model and business values, not the HTTP request or `Authentication`. Failed scope/lifecycle rules raise the owning policy's meaningful failure, mapped by existing web error handling.

Bad: encode an object into an authority, bypass scope for a role, or add object predicates to the single-operation declaration.

```java
@PreAuthorize("hasAuthority('USER_123_UPDATE')")
public UserDto updateUser(...) { /* ... */ }

@PreAuthorize("hasAuthority('USER_UPDATE') and hasPermission(#userId, 'User', 'update')")
public UserDto updateUser(...) { /* ... */ }

// Inside business work: an ADMIN role is not a substitute for object rules.
if (authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"))) {
    return updateWithoutTenantCheck(user);
}
```

## Freshness, Browser Protection And Outcomes

Good: after a role grant/revocation commits, the next request reloads authorities or checks a changed account security version. Apply the same next-request guarantee to existing tokens through online revocation, introspection or version checks. Record privilege changes and preserve the transactional last-active-administrator invariant.

Bad: leave session authorities cached until logout or accept an old JWT for its remaining hour merely because a replacement token has been issued. Expiry alone cannot enforce next-request revocation. Invalidating a session without an authority refresh strategy also does not implement grants for continuing sessions.

Good: a cookie-authenticated state-changing request requires authentication, the operation authority and valid CSRF protection. Unauthenticated access follows the configured login redirect/401 contract; authenticated authority denial produces 403 before application work runs.

Bad: disable CSRF because the request body is JSON, return HTTP 200 for an access denial, or test authority checks with filters disabled. Test a missing-authority request with otherwise valid credentials/input/CSRF so it fails for authorization rather than an unrelated boundary.
