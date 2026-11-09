# Request Error Contracts

Reuse the application's existing HTTP error handling. In compatible Spring versions, `ProblemDetail`, `ErrorResponse` and `ResponseEntityExceptionHandler` support Problem Details without a parallel response framework. Preserve an established published envelope and status policy when work is limited to validation.

## Status And Responsibility

| Failure | Guidance |
| --- | --- |
| Malformed JSON or request syntax | Follow established HTTP 400 handling. |
| Valid syntax violating shape or constraints | Preserve the endpoint's 400/422 contract. Spring MVC commonly uses 400; do not change it just to copy another stack. |
| Conflict with current resource state | Follow the application conflict flow, commonly 409; do not implement uniqueness as a DTO-only check. |
| Unauthenticated / unauthorized | Follow existing authentication and authorization handlers; these are separate from field validation. |
| Unexpected infrastructure/programming failure | Preserve a server error with safe diagnostics. |

Valid JSON of the wrong top-level shape is distinct from malformed JSON even if the application intentionally returns the same status. Unsupported media types follow established 415 handling.

## Public Problem Details

Use stable application-owned problem types and codes when clients need machine decisions. An `errors` extension is an application convention, not a schema required by RFC 9457.

```json
{
  "type": "https://example.com/problems/invalid-request",
  "title": "Invalid request",
  "status": 400,
  "errors": [{"pointer": "/addresses/0/postalCode", "code": "INVALID_POSTAL_CODE"}]
}
```

Use the actual HTTP status in the body and the appropriate problem content type. Keep diagnostic text safe; omit rejected secrets, raw exception messages, stack traces, and framework class names. Do not parse `title`, `detail`, or localized validator prose for application behavior.

## Locations

Keep locations aligned with original submitted field names, including serializer renaming and collection indexes. Bean property paths are not automatically JSON Pointers. Preserve structural segments instead of blindly replacing dots and brackets.

For a JSON Pointer, escape each token by replacing `~` with `~0`, then `/` with `~1`. For example, field `a/b~c` becomes `/a~1b~0c`. The example uses the plain-string pointer form; the root is the empty string. If the published contract uses URI-fragment pointers instead, preserve its `#` prefix and percent encoding rules rather than mixing the two forms.

Define missing-field locations consistently as intended locations, since absent members cannot resolve. Cross-field errors may use the root or relevant field according to the contract. Query, path and header errors need explicit source/location metadata; do not invent body pointers for them.

Test nested lists, renamed fields, `~` and `/`, root/missing fields, safe output, and multiple applicable violations when changing the mapper. Preserve the established accumulation/fail-fast behavior; unsafe binding may prevent exhaustive field validation.

## Sources

- [Spring MVC error responses](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-ann-rest-exceptions.html)
- [RFC 9457 — Problem Details](https://www.rfc-editor.org/rfc/rfc9457.html)
- [RFC 6901 — JSON Pointer](https://www.rfc-editor.org/rfc/rfc6901.html)
