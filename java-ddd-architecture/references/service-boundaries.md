# Application And Domain Service Boundaries

Use after the parent skill's DDD activation guard passes. This collection prefers anemic domain models with business behavior primarily in domain services. Application services coordinate that behavior; do not change this convention to a rich-entity style during routine implementation.

## Application Service Coordinates The Use Case

A resource application service accepts an application input DTO and returns a separate public output DTO. Reads can accept typed identifiers or query DTOs. Keep resource names such as `UserService` and supported operations such as `create` and `read`. Do not introduce `Manager`, `Processor`, or `Handler` synonyms for the same responsibility.

Good: the application service retrieves domain data, delegates domain behavior, and constructs the output. This read operation has no changes to persist. Collaborators are constructor-injected; their declarations are omitted here.

```java
// example.application.product.ProductService
@Transactional(readOnly = true)
public ProductPriceDto readPrice(ProductId productId) {
    var product = productRepository.findById(productId)
        .orElseThrow(() -> new ProductNotFoundException(productId));
    var pricingContext = pricingContextRepository.findCurrent();
    var price = productPricingService.calculate(product, pricingContext);
    var productPriceDto = productPriceDtoFactory.create(product, price);

    return productPriceDto;
}
```

For writes, the application service owns the transaction, loads the necessary models, invokes domain behavior, persists changed models through repositories, and constructs output from authoritative results. Domain services do not open separate transactions around individual business calculations.

Bad: the application service embeds the pricing algorithm instead of coordinating domain behavior. The rule here is illustrative, not a prescribed pricing policy.

```java
public ProductPriceDto readPrice(ProductId productId) {
    var product = productRepository.findById(productId)
        .orElseThrow(() -> new ProductNotFoundException(productId));
    var pricingContext = pricingContextRepository.findCurrent();
    var amount = product.getBasePrice().amount();
    if (pricingContext.isDiscountEligible()) {
        amount = amount.multiply(pricingContext.discountFactor());
    }
    var price = new Price(amount, product.getBasePrice().currency());

    return productPriceDtoFactory.create(product, price);
}
```

## Domain Service Implements Business Behavior

Domain services take domain models and value objects and return domain results. A domain result can be a model, value object or decision; a state-changing operation may mutate a supplied model under its explicit contract. Do not require a new model merely to make every method return one.

Good: a purpose-named service owns the pricing rule and uses only domain types.

```java
// example.domain.product.ProductPricingService
public class ProductPricingService {
    public Price calculate(Product product, PricingContext pricingContext) {
        var basePrice = product.getBasePrice();
        var amount = basePrice.amount();
        if (pricingContext.isDiscountEligible()) {
            amount = amount.multiply(pricingContext.discountFactor());
        }

        return new Price(amount, basePrice.currency());
    }
}
```

Bad: the domain service accepts application/web data, inspects the security framework and constructs public output.

```java
// example.domain.product.ProductPricingService
public ProductPriceDto calculate(ProductPriceRequest request,
                                 Authentication authentication) {
    checkAuthorities(authentication);
    var response = productClient.fetch(request.productId());

    return new ProductPriceDto(response.id(), response.price());
}
```

Keep client responses in infrastructure and adapt authenticated actor identity at the entry boundary. When a business rule needs actor or tenant information, supply application/domain-owned values and relevant domain data. Coarse capability checks stay at the security boundary; ownership and lifecycle rules stay with the operation that has the relevant state.

## Naming And Failure Ownership

Use application/domain packages to distinguish ownership: `application.user.UserService` and `domain.product.ProductPricingService`. Do not append `ApplicationService` to every existing resource service or assume Spring's `@Service` makes a class an application service. Register services through the existing composition mechanism.

Good: throw a domain exception at the domain rule that detects and owns the failure.

```java
public Price calculate(Product product, PricingContext pricingContext) {
    if (!product.isAvailableForSale()) {
        throw new ProductNotForSaleException(product.getId());
    }

    return calculateAvailableProductPrice(product, pricingContext);
}
```

Bad: replace a domain failure with an HTTP response inside the domain service.

```java
public ResponseEntity<?> calculate(Product product, PricingContext pricingContext) {
    if (!product.isAvailableForSale()) {
        return ResponseEntity.status(409).body("Product is not for sale");
    }

    return ResponseEntity.ok(calculateAvailableProductPrice(product, pricingContext));
}
```

The private calculation helper above performs only the calculation; it does not hide translation or recovery policy. Exceptions are thrown, not returned as DTO alternatives. Let established MVC exception handling map application/domain failures to HTTP. Keep technical failure translation at its owning boundary under `java-logging-exceptions`.
