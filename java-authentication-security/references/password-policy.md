# Password Policy And Legacy Migration

Preserve the project's explicit credential and regulatory policy; identify conflicts with these defaults rather than silently changing accepted credentials. Registration, change and reset establish a new password; login verifies an existing credential under its historical contract.

## New Policy Decisions

When a project needs a new baseline, use current authoritative guidance. NIST SP 800-63B-4 calls for at least 15 characters for password-only authentication, permits an eight-character minimum as part of MFA, and recommends permitting at least 64 characters. It counts Unicode code points, rejects composition/periodic-change rules, and requires a compromised/common-password blocklist. These choices do not automatically determine the application's required assurance level.

Java `String.length()` and typical string-size constraints count UTF-16 code units, not Unicode code points. Do not claim a code-point policy is enforced by a plain `@Size` without verifying that distinction. Define a bounded maximum and encoded-byte capacity that accommodate the advertised character policy; test supplementary characters.

Permit password-manager paste/autofill. Do not silently trim, case-fold or truncate passwords. Make any Unicode normalization policy explicit and consistent across enrollment and verification. NIST recommends NFC when accepting Unicode; introducing it into existing verification without a migration plan can break credentials. Preserve historical verification and do not describe a no-normalization policy as a NIST requirement.

Apply syntax/length policy at the actual input boundary without repeating it in every service. A blocklist/provider check remains with the operation that can execute it correctly; avoid sending plaintext passwords to an external service. Domain and credential-state decisions retain their own owner.

## Encoding And Upgrades

Use the project's Spring Security `PasswordEncoder`/provider integration rather than custom cryptography. Select an adaptive encoder compatible with the required complete input, benchmark its work factor on production-like hardware, and plan algorithm upgrades. Do not blindly copy example cost parameters or assume the default encoder satisfies every Unicode/byte-limit policy.

Bcrypt has a 72-byte input limit; installed encoders may reject oversized input rather than silently truncate it. Verify the actual encoder and preserve legacy behavior intentionally. Do not narrow advertised Unicode support to fit a hidden byte cap or manually invent a pre-hashing workaround.

Use the established encoding identifier/version format and provider-supported upgrade mechanism, such as `upgradeEncoding` with the configured password-update integration where available. Calling a check alone does not persist an upgraded hash. Keep sufficient storage capacity for the chosen versioned hash formats.

For legacy credentials, do not apply a new registration minimum, normalization, or byte limit before verifying an old password. If a legacy truncating scheme accepted inputs beyond its significant prefix, successful verification does not authenticate the suffix: require a deliberate password change/reset rather than automatically binding an unverified suffix into a new full-input hash.

## Focused Coverage

Exercise documented minimum/maximum code-point and byte boundaries, whitespace, supplementary Unicode, complete-input significance, wrong passwords, legacy encoder IDs, and allowed/blocked hash upgrades through real encoders. For legacy truncation, test passwords differing only beyond the historical significant prefix. New acceptance must not imply unsafe automatic migration.

Reference: [NIST SP 800-63B-4 password requirements](https://pages.nist.gov/800-63-4/sp800-63b.html#passwordver). Verify current guidance and installed encoder behavior rather than treating this reference as an exhaustive compliance standard.
