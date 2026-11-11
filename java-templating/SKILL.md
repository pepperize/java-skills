---
name: java-templating
description: Implement or review Java server-rendered page and email templates, typed presentation models, contextual escaping, and localized authored content using the project's established template engine.
---

# Java Templating

## Preserve The Rendering Stack

Use the established engine, layouts, fragments and localization infrastructure. Do not replace Thymeleaf, FreeMarker, Mustache, or another engine merely to apply this skill. Verify actual escaping and rendering APIs for the installed version instead of copying helpers from another stack.

Keep rendering and route generation in presentation/web collaborators, with engine construction/configuration at the project's wiring boundary. Do not introduce engine types, requests, renderers, or route builders into domain models or repositories. Apply architecture skills only when explicitly activated by project instructions.

## Typed Page Models

Prefer a page-specific immutable `<Concept>PageViewModel` that contains the complete application-provided page data. Structure nested models around semantic concepts such as metadata, header, content, and navigation; type collection elements. Do not replace every HTML element with a ViewModel or flatten structured domain data into loose maps merely because the framework accepts a model map.

When the project uses a page ViewService, it obtains/maps the necessary data and returns the complete page model. The controller adapts request values, calls that service, and renders with the established HTTP status/headers. Keep repository coordination, component composition and domain-to-presentation mapping outside the controller and template.

Keep presentation models free of requests, repositories, entities, vendor objects, HTML markup, and escaping behavior. Records can express data when supported; defensively copy mutable collections when required by the intended immutability contract. Preserve framework-required model entries and explicit project conventions rather than forcing one model object onto existing form binding or security helpers.

Read [presentation examples](references/presentation-examples.md) when introducing a page model or localized email composition. Use `java-readable-code` for justified component factories and inspectable intermediate results.

## Output Handling

Use the selected engine's contextual escaping for dynamic values at output. Keep DTO/storage values unescaped. Treat unescaped/raw markup operations as an explicit trust boundary: use them only for appropriately trusted or sanitized content under the project's content policy. HTML text/attributes, JavaScript, CSS and URLs require their actual context's handling; HTML escaping alone does not validate a URL's scheme.

Do not HTML-escape plain-text emails. Keep rendering format explicit and verify that HTML page layouts do not wrap email bodies accidentally. Avoid mutating shared renderer configuration or locale state during an individual render.

## Translation And Authored Content

Keep short interface messages and parameterized subjects in the existing translation catalog. Use named parameters and locale-aware pluralization supported by that system rather than concatenating translated fragments. Preserve the project's translation API and symbolic versus source-text key convention.

Keep complete source-controlled long-form page translations with their meaningful markup in locale-specific templates/fragments. For database/CMS content, use its existing content model and sanitization policy instead of duplicating content in templates. Prefer purpose-first filenames with locale suffixes, subject to the engine's existing conventions. Keep structural anchors consistent across translations and make fallback behavior explicit.

## Localized Email Bodies

- Render complete authored bodies through the existing template engine rather than assembling paragraphs in Java strings, line lists, or translation entries.
- Keep a complete template for each supported locale and semantically distinct message outcome. Optional-data sections may be conditional, but a reader should not need to follow outcome-selection branches to reconstruct the outgoing message.
- Reuse formatting and structural fragments only where they do not obscure the complete prose. Keep subject, recipients, sender, Reply-To and transport metadata outside the body template.
- Use application-owned template identifiers and typed supported locales for path selection, not request-controlled template strings. Centralize a repeated filename/locale convention only when several real messages need it; do not add a registry or mirror interface for one template.
- Pass purpose-specific typed data, or a purpose-named scalar for a single obvious value. Keep domain entities and transport messages out of body models.
- Preserve intentional whitespace, line endings, optional-section spacing, and final newlines as observable message behavior. Remove obsolete body-only translation entries only after checking callers.

## Verification

Follow `java-testing-style` and use the real configured renderer for changed page/template boundaries. Cover dynamic escaping, nested typed data, supported locales, meaningful structure, configured locale isolation and any required fallback.

For localized email changes, render every applicable locale and outcome through the real engine, deriving coverage from the supported locale set. Compare complete expected bodies when text/formatting is the contract. Keep service tests focused on sending, ordering, headers and failure behavior rather than duplicating renderer tests.

For form changes use `java-request-validation`; preserve the selected JavaScript or traditional HTML flow, safe values on failure, localized accessible feedback, and existing CSRF protection.
