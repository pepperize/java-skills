# Presentation Examples

These engine-independent sketches illustrate boundaries. Adapt them to the installed renderer and Java version; do not install a new engine or component hierarchy solely to reproduce them.

## Complete Typed Page Data

```java
public record AccountPageViewModel(
    PageMetadataViewModel metadata,
    SiteHeaderViewModel header,
    AccountContentViewModel content,
    NavigationViewModel navigation
) {}
```

The existing ViewService makes composition inspectable:

```java
public AccountPageViewModel fetchPage(AccountId accountId, Locale locale) {
    var account = accountRepository.findById(accountId)
        .orElseThrow(() -> new AccountNotFoundException(accountId));
    var metadata = pageMetadataFactory.createForAccount(locale);
    var header = siteHeaderViewModelFactory.create(locale);
    var content = accountContentViewModelFactory.create(account, locale);
    var navigation = navigationViewModelFactory.create(locale);

    return new AccountPageViewModel(metadata, header, content, navigation);
}
```

In a Spring MVC page controller, a framework model map may bind this value as `page`, alongside unavoidable framework entries. Keep that map at the rendering boundary rather than exposing maps throughout application composition. The template receives presentation values, not the repository or `Account` entity.

## Complete Localized Email Outcomes

For a project using a locale-suffix convention, possible resource names are:

```text
templates/email/request-approved.de.html
templates/email/request-approved.en.html
templates/email/request-declined.de.html
templates/email/request-declined.en.html
```

Use the established engine's resource extension and lookup conventions. The application selects the approved/declined outcome and recipient metadata; each file contains the complete body for that outcome and locale. Do not assemble it from translated greeting/body/signature fragments or hide the outcome in a shared template's branching.

If several message families share this lookup, an application-owned template enum and supported locale enum can define a closed selection. Keep a single message simple. Reject unsupported locale/template choices or follow an explicit product fallback; do not quietly send the wrong language.

Render using the configured engine's string-output mechanism without the page layout. Typed data supplies dynamic content. HTML templates use that engine's escaping; plain-text variants keep plain text. Do not temporarily change a shared renderer's layout or locale to render one message.

Tests should render full expected approved/declined bodies in every supported locale, including optional data and format-sensitive whitespace. Use the real engine so missing resources, escaping, and accidental layouts are observable.
