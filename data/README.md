# Project Data

This directory contains source data, browser-ready layer artifacts, schemas,
and deterministic build reports.

## Layout

```text
data/
  catalog.json   application entry point for available layers
  sources/       version-pinned upstream data and provenance notes
  layers/        browser-ready layer manifests and data
  schemas/       project-owned JSON Schemas
  reports/       deterministic build summaries
```

## Seed dataset

The first seed layer is Natural Earth's 1:110m Populated Places (Simple)
dataset, release 5.1.2.

It contains 243 globally distributed city and town points, including national
and selected regional capitals. It is useful for testing:

- globe labels and point rendering;
- search and filtering;
- camera flights and selection;
- synchronized list and detail views;
- clustering and minimum-zoom behavior; and
- global keyboard navigation.

This is foundation test data, not a decision that the finished product will be
about cities.

## Build and validation

The scripts use only Node.js built-ins:

```sh
node tools/data/build-populated-places.mjs
node tools/data/build-catalog.mjs
node tools/data/validate-datasets.mjs
```

The build is deterministic. Running it again against the same source file
should produce identical layer files, manifests, and reports.

## Data requirements

Every production dataset must have:

- a stable identifier and version;
- an upstream source and retrieval date;
- license and attribution information;
- a pinned source artifact or reproducible retrieval method;
- a documented transformation;
- a machine-readable layer manifest;
- validation before use; and
- limitations and known interpretation risks.

Never edit generated files under `data/layers/` or `data/reports/` directly.
Update the source or transformation and rebuild them.
