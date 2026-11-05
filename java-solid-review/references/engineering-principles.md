# Engineering Principles For Java Design Review

Use these questions to explain observed risks and choose proportionate fixes. This is a reference, not a required checklist. Existing SOLID checks remain in the parent skill. Its testing and architecture precedence still applies.

## DRY — Don't Repeat Yourself

Keep business knowledge, mappings, and protocol rules authoritative in one place. Similar syntax alone is insufficient evidence for sharing an abstraction.

```java
// Two endpoints independently decide the same loyalty rule.
var checkoutDiscount = points >= 1_000 ? 10 : 0;
var quoteDiscount = points >= 1_000 ? 10 : 0;

// A shared policy owns the rule once when the meaning is actually shared.
var discount = loyaltyDiscountPolicy.determinePercentage(points);
```

Ask whether a rule change would require synchronized edits. Do not couple independently evolving workflows to remove coincidental duplication.

## KISS — Keep It Simple; YAGNI — You Aren't Gonna Need It

Use the least complex design that clearly satisfies current requirements. Reject registries, strategy hierarchies, configuration, interfaces, or fallback branches with no credible current need.

A fixed CSV export usually needs a `CsvExporter`, not a versioned plugin registry. A concrete dependency is acceptable when no meaningful substitution boundary is needed. A real security boundary, migration contract, or accepted requirement is not speculative merely because local usage is limited.

Challenge proposed refactors as well as existing code. A design can become worse through excessive fragmentation even when every extracted class has one method.

## FCoI — Favour Composition Over Inheritance; LSP — Liskov Substitution Principle

Prefer delegation when inheritance exists only to reuse implementation. Preserve inheritance when it expresses a genuine substitutable hierarchy or framework contract.

```java
// Reuse exposes an unrelated document API and lifecycle.
class SalesReportExporter extends PdfDocument { /* ... */ }
```

Delegation expresses what export needs:

```java
class SalesReportExporter {
    private final PdfRenderer pdfRenderer;

    SalesReportExporter(PdfRenderer pdfRenderer) {
        this.pdfRenderer = pdfRenderer;
    }

    byte[] export(SalesReport report) {
        return pdfRenderer.render(report);
    }
}
```

An implementation must not narrow accepted inputs, weaken results, or reject an ordinary operation promised by its interface. A read-only store implementing `save()` by throwing is a contract problem, not a reason to ban inheritance universally.

## IOSP — Integration Operation Segregation Principle

Distinguish coordination of collaborators and effects from substantial decisions or transformations. A reminder job that loads records, selects overdue orders, formats messages, and sends them in one dense loop hides several independently understandable operations.

```java
var openOrders = orderRepository.findByStatus(OrderStatus.OPEN);
var overdueOrders = selectOverdueOrders(openOrders, today);
reminderService.sendFor(overdueOrders);
```

A focused local selection method may suffice; do not require a new policy class without a reason. Ordinary accessors, value-object operations, and simple expressions do not violate IOSP. Do not move a state-dependent invariant outside its owning operation merely to make orchestration look uniform.

## Single Level Of Abstraction

Keep a workflow readable at workflow level and place detailed parsing, mapping, or construction in a meaningfully named operation. IOSP concerns coordination versus logic; abstraction level also concerns mixing conceptual detail within pure logic.

Extract `createPayload(article)` when manual payload mapping interrupts publishing flow. Do not hide a single obvious call behind a new wrapper. Respect architectural ownership: HTTP serialization stays outside a domain policy even after local extraction.

## SRP — Single Responsibility Principle; SoC — Separation Of Concerns

SRP asks whether one unit combines responsibilities that change independently. SoC asks whether kinds of policy or mechanism are entangled across boundaries.

An `InvoiceIssuer` coordinating an issuance policy, repository, and publisher can own one cohesive responsibility. An issuer embedding SQL, PDF rendering details, and SMTP delivery has several reasons to change. Extract the smallest meaningful persistence or presentation boundary rather than forcing a new layer for each line.

## ISP — Interface Segregation Principle; DIP — Dependency Inversion Principle

Interfaces should expose the capabilities their clients need and their implementations can honor. Split a combined read/write interface when a real read-only implementation cannot fulfill it, not into one interface per method by default.

High-level policy should not construct vendor SDKs or depend on their response shapes. Inject a capability such as `PaymentGateway` when it protects a meaningful boundary. Keep adapter assembly details out of that contract; do not add an API-key parameter merely because one implementation needs configuration.

Keep Spring container lookups at composition boundaries. Many injected dependencies are a responsibility signal, not justification for hiding them in a service locator.

## Principle Of Least Astonishment

Names, types, units, cost, and side effects should match the expectations created by the API and its conventions.

```java
// Surprising: a query archives customers and may return null.
List<Customer> findAll() { /* hidden mutation and nullable result */ }

// Keep the command and the collection query explicit.
void archiveInactive() { /* ... */ }
List<Customer> findAll() { /* empty collection when no matches */ }
```

Use the project's established naming conventions. Do not rename Spring Data queries or JavaBean getters merely because a generic naming preference would suggest another verb.

## Information Hiding Principle

Prevent callers from depending on volatile representation or bypassing an invariant. Public mutable state and leaked persistence/vendor objects deserve scrutiny. Transparent immutable DTOs do not need behavior wrappers merely to hide data.

For records containing collections, consider defensive copies when external mutation would violate the intended immutable contract; a record alone does not make nested objects immutable.

## Tell, Don't Ask; LoD — Law Of Demeter

Keep decisions with the object or policy that owns the information and responsibility. Avoid coupling callers to internal object graphs.

```java
// Several internal relationships become this caller's dependencies.
var country = order.customer().address().country().code();

// Ask for the concept when the order owns shipping information.
var country = order.shippingCountryCode();
```

Do not add forwarding methods for every harmless DTO traversal or fluent builder chain. Do not move a decision onto an entity that lacks required state or conflicts with the project's service-owned domain policy. `order.submit()` and `orderSubmissionPolicy.submit(order)` can each be appropriate under different explicit domain designs.

## Implementation Reflects Design

Important responsibilities and domain decisions should be visible in names, dependencies, and control flow. A documented refund policy should not exist only as anonymous conditionals scattered through controllers.

```java
refundPolicy.ensureRefundable(order, clock.instant());
paymentGateway.refund(order.paymentId());
```

Do not create a class for every noun in a diagram or preserve obsolete documentation through artificial structure. Judge the current intended design and actual dependency direction.

## Choosing A Finding

- Use DRY for duplicated knowledge and OCP for demonstrated recurring variants that repeatedly change central dispatch.
- Use SRP for one unit's independent reasons to change and SoC for entangled policies/mechanisms.
- Use Information Hiding for escaped representation, Tell, Don't Ask for misplaced decisions, and LoD for excessive knowledge of an internal object graph.
- Use Single Level of Abstraction for obscured conceptual level and IOSP for interleaved coordination and substantial logic.
- Prefer one precise finding for one underlying risk. Explain its consequence and smallest fix; use KISS and YAGNI to challenge that fix.
