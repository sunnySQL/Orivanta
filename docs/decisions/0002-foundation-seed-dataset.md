# ADR 0002: Foundation Seed Dataset

- **Status:** Accepted
- **Date:** 2026-06-20

## Context

The Phase 0 globe-engine comparison needs representative global point data.
The seed must be legally reusable, small enough to inspect, varied enough to
exercise the interface, and stable enough for repeatable measurements.

The seed dataset is test infrastructure. It does not define the final subject
or audience for Orivanta.

## Decision

Use Natural Earth's 1:110m Populated Places (Simple), release 5.1.2.

Commit the version-pinned source GeoJSON and its checksum. Transform it into a
project-owned GeoJSON contract containing only the fields required by the
foundation experience.

Publish it through:

- a data catalog;
- a layer manifest;
- browser-ready GeoJSON;
- JSON Schemas;
- a deterministic build report; and
- dependency-free Node.js build and validation scripts.

## Why this dataset

- Natural Earth publishes the data in the public domain.
- The 243 points provide global distribution without creating a large initial
  payload.
- Capitals and major cities are recognizable during interaction testing.
- Labels, population estimates, ranking, and minimum zoom support realistic
  search, filtering, detail, and visibility behavior.
- A versioned official release is available in GeoJSON.

## Data interpretation policy

- Preserve Natural Earth's classifications instead of silently correcting or
  supplementing them.
- State in generated descriptions that classifications come from release
  5.1.2.
- Represent unavailable ISO country codes as `null`, not guessed values.
- Describe population values as estimates and never as current census counts.
- Display voluntary attribution even though the public-domain terms do not
  require it.

## Consequences

### Positive

- Both globe prototypes can use identical, inspectable data.
- The first layer exercises the intended catalog and manifest architecture.
- Builds are deterministic and validate source and output checksums.
- No API, key, account, or runtime third-party request is required.

### Negative

- The dataset is not a complete list of cities.
- Administrative labels and political representation may be disputed or
  outdated.
- Point-only data does not exercise routes, polygons, imagery, or time.
- Additional synthetic or public-domain fixtures are still needed for the
  complete engine scorecard.

## Review condition

Replace or supplement this seed when Phase 0 needs line, polygon, temporal, or
large-data behavior. Choose the first product dataset separately through user
and product discovery.
