# Domain Repository Boundaries

Use only after the parent skill's DDD activation guard passes. These sketches illustrate dependency direction; preserve the project's identifiers, package layout, persistence policy, and established contracts.

## Domain Ownership And Ordinary Absence

```java
package example.domain.account;

import java.util.Optional;

public interface AccountRepository {
    Optional<Account> findById(AccountId accountId);
    Account save(Account account);
}
```

`Account`, `AccountId`, and the contract belong to the owning domain module. `Optional.empty()` means the account is absent; storage failure is not absence. Collection queries return empty collections when nothing matches. Include only operations production callers need.

A Spring Data implementation can remain an infrastructure detail. If the project intentionally places Spring Data interfaces in its domain, preserve that explicit exception rather than silently imposing another architecture.

## Remote Retrieval Behind The Same Domain-Facing Boundary

```java
package example.infrastructure.account;

import example.domain.account.Account;
import example.domain.account.AccountId;
import example.domain.account.AccountRepository;
import java.util.Optional;

final class RemoteAccountRepository implements AccountRepository {
    private final AccountClient accountClient;
    private final AccountFromResponseFactory accountFromResponseFactory;

    RemoteAccountRepository(AccountClient accountClient,
                            AccountFromResponseFactory accountFromResponseFactory) {
        this.accountClient = accountClient;
        this.accountFromResponseFactory = accountFromResponseFactory;
    }

    @Override
    public Optional<Account> findById(AccountId accountId) {
        var response = accountClient.findById(accountId.value());
        return response.map(accountFromResponseFactory::create);
    }

    @Override
    public Account save(Account account) {
        var response = accountClient.save(account);
        return accountFromResponseFactory.create(response);
    }
}
```

Here the technical client owns request/response adaptation and exposes a documented optional response on absence. It is not the domain repository contract. Keep its transport DTO and response factory in infrastructure. Propagate technical failures; do not turn every remote exception into an empty `Optional`. Adapt the client write arguments to its actual contract rather than introducing a duplicate entity model without a need.

A file-backed implementation follows the same principle: file paths, decoding, and I/O errors stay in infrastructure; a missing domain object and an unreadable existing source are different outcomes.

## Different Roles Remain Different

A reporting projection may belong to an application query service. A configuration reader may return configuration rather than a domain aggregate. Neither needs to become an entity repository to fit this reference. Do not add speculative write methods or unsupported operations to make implementations share a base interface.

Controllers should not coordinate repository reads and assemble domain rules. Application services consume the appropriate domain contracts and return application results; presentation mapping stays outside domain repositories. For rendered pages, use `java-templating`; for REST input/output boundaries, use `java-api-endpoints`.
