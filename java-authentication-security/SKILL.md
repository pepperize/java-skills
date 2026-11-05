---
name: java-authentication-security
description: Implement or review Java authentication, password storage and migration, login throttling, sessions, logout, recovery/verification tokens, and MFA decisions using established Spring Security or identity-provider infrastructure.
---

# Java Authentication Security

## Existing Authentication Boundary

Inspect the installed Spring Security version, authentication mechanism, identity provider, session/token model, credential policy and error contracts. Reuse maintained framework/provider capabilities rather than implementing replacement authentication filters, password algorithms, or token verification. Do not add local passwords to an OIDC/passkey/provider-managed application merely because this skill covers them.

Keep framework identity and servlet/session mechanisms at security/web boundaries. Adapt actor identity to an application-owned value where application operations need it. Use `java-spring-security` for capabilities and object scope; use `java-logging-exceptions` for security-event handling and secret exclusion.

Read [password policy and migration](references/password-policy.md) when password acceptance, encoding, or legacy credentials change. That reference owns policy choices and Java length/encoder pitfalls; do not mechanically copy a PHP policy or retrofit new-password rules onto login.

## Login And Attack Protection

- Use established authentication providers and password encoders. For account-sensitive credential failures, keep public output consistent for unknown, wrong-password, disabled and otherwise non-authenticating accounts unless an explicit product/security contract provides another safe flow.
- Keep internal reasons available to security events without exposing them through responses. Preserve comparable real-or-dummy credential verification on unknown-account paths using existing framework/provider behavior; do not add a second hash operation when the provider already supplies protection.
- Limit automated attempts with trusted client and account signals. Obtain client addresses through trusted-proxy handling and use approved keyed pseudonymous account keys instead of raw login identifiers. Include unknown identifiers without revealing account existence.
- Use bounded backoff or temporary lockout, recovery paths, and explicit behavior when required limiter state is unavailable; do not silently remove mandatory protection or introduce attacker-triggered permanent account lockout. CAPTCHA is supplementary.
- Apply attack protection to recovery and verification issuance as appropriate. Avoid synchronous notification differences that reveal account existence. Use established async delivery only where the actual contract requires it.

## Recovery And Verification Tokens

For application-owned bearer links, use a cryptographically secure generator such as `SecureRandom`, URL-safe encoding, explicit expiry and purpose, and enough entropy for the threat model; 32 random bytes is this collection's default for new opaque reset tokens. Persist a cryptographic digest rather than the bearer token.

Validate syntax at the input boundary. Check stored purpose, expiry, account state and consumption state in the owning operation. Consume the token atomically with the protected change so concurrent requests cannot both succeed. Bound outstanding tokens and prevent cross-purpose reuse.

Keep tokens out of logs, analytics, and third-party requests; apply appropriate referrer/cache controls to token pages. Generate public links using configured trusted origins rather than arbitrary Host headers. Return generic recovery-request outcomes and rate-limit issuance. After a password reset, invalidate sibling reset tokens and affected authenticated sessions according to the security contract; do not automatically log the account in unless explicitly designed and justified.

## Session And Credential Lifecycle

For server-side browser sessions, preserve framework session-fixation protection, rotate session identity at authentication/privilege boundaries as appropriate, invalidate server-side state on logout, and expire the relevant cookie. Use the existing logout handlers rather than only clearing a browser cookie or a thread-local context.

Configure `Secure`, `HttpOnly`, appropriate `SameSite`, and narrow cookie scope. Enforce documented idle and absolute lifetimes server-side; updating last activity must not extend the immutable authentication time. Spring/servlet idle timeout alone does not establish an absolute timeout.

Make account disablement, password reset/change, and privilege changes revoke or refresh affected access under an explicit freshness policy. A security version or active-session store can support server-side revocation; do not assume cached authorities refresh automatically. Stateless tokens require an explicit expiry/revocation strategy and documented stale-access window. Refresh tokens and provider-managed sessions follow their actual provider contracts rather than invented local session rules.

Keep CSRF protection for browser credentials that are automatically attached, including cookie-authenticated JSON requests. Preserve authenticated/recovery response cache policy and avoid leaking secrets through URLs beyond deliberately designed bearer links.

## MFA And Scope

Use the project's threat model and ADRs to decide required factors and assurance. Do not silently add or omit MFA. When MFA is in scope, use maintained provider/protocol implementations, protect recovery codes, secure enrollment/reset, and define session invalidation after factor changes. Ordinary endpoint work does not authorize rebuilding authentication infrastructure.

## Verification

Use `java-testing-style` for affected real security boundaries. Cover applicable public failure parity, limiter failure/boundaries, credential compatibility/upgrades, session rotation/logout/replay, idle/absolute expiry, cookie policy, token purpose/expiry/single-use/concurrent use, and reset revocation. Use a controllable `Clock`; assert intended orchestration rather than equal milliseconds. Ensure secrets stay out of responses and logs.

## Sources

Check the target version and current policy when implementing security-sensitive behavior:

- [Spring Security password storage](https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html)
- [Spring Security session management](https://docs.spring.io/spring-security/reference/servlet/authentication/session-management.html)
- [OWASP forgot-password guidance](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)
