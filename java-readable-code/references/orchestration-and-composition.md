# Orchestration And Inspectable Composition

## Extract An Operation, Not Its Individual Checks

Before: the workflow coordinates field handling and construction details.

This example assumes `reportFactory.create(...)` has a read-only input contract and does not mutate the supplied list. Verify that contract before replacing the mutable local result with an unmodifiable one.

```java
public Report createReport(ReportInput input) {
    var records = recordRepository.findByPeriod(input.period());
    var selected = new ArrayList<Record>();
    for (var record : records) {
        if (record.isPublished() && record.region().equals(input.region())) {
            selected.add(record);
        }
    }
    return reportFactory.create(selected);
}
```

After: a local operation names the complete selection rule without adding a new class.

```java
public Report createReport(ReportInput input) {
    var records = recordRepository.findByPeriod(input.period());
    var publishedRecords = selectPublishedRecords(records, input.region());

    return reportFactory.create(publishedRecords);
}

private List<Record> selectPublishedRecords(List<Record> records, Region region) {
    return records.stream()
        .filter(record -> record.isPublished() && record.region().equals(region))
        .toList();
}
```

The extracted operation returns the unmodifiable `Stream.toList()` result directly, without another defensive copy. Its elements are not made immutable. If an existing consumer explicitly requires a mutable list, preserve that contract during extraction; changing the consumer to work on its own copy is a separate contract change.

Extract a policy collaborator only when the rule has an independent responsibility or real reuse. Do not turn every filter expression into its own method or class. Use collection APIs available in the target Java version.

## Name Important Intermediate Results

Avoid hiding repository and factory results inside aggregate construction:

```java
return new AccountPageViewModel(
    headerViewModelFactory.create(locale),
    accountViewService.fetchContent(accountId),
    navigationViewModelFactory.create(locale)
);
```

Prefer inspectable steps:

```java
var header = headerViewModelFactory.create(locale);
var content = accountViewService.fetchContent(accountId);
var navigation = navigationViewModelFactory.create(locale);

return new AccountPageViewModel(header, content, navigation);
```

Do not extract literals or already-available variables merely to satisfy this example.

## Name A Collaborator By Its Responsibility

A `DtoConstraintGenerator` that interprets metadata and constructs a constraint object is better named `DtoConstraintsFactory.create(...)`. The reflection is its mechanism, not its role. A `PublicUrlGenerator` that generates URL strings remains a generator; a renderer remains a renderer. A repository does not become a factory merely because it returns an object.

When a small construction operation belongs to one owner, keep it as a purpose-named private method. Preserve established Java factories and framework naming contracts rather than applying suffixes mechanically.
