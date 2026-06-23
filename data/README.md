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

## Foundation datasets

The foundation uses three pinned Natural Earth 5.1.2 layers:

- 243 globally distributed populated-place points at 1:110m;
- 177 country polygons at 1:110m; and
- 50 U.S. states plus Washington, D.C. at 1:50m.

Together they exercise points, polygon rendering, progressive detail, search,
camera movement, synchronized list/detail views, and keyboard navigation.

These are cartographic foundation layers, not authoritative legal or surveying
data. Higher-detail tiers can be added later without changing the layer
contract.

## Build and validation

The scripts use only Node.js built-ins:

```sh
node tools/data/build-populated-places.mjs
node tools/data/build-boundaries.mjs
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
