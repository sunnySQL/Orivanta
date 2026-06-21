# ADR 0004: Select Globe.gl as the Foundation Engine

- **Status:** Accepted
- **Date:** 2026-06-21
- **Supersedes:** The provisional CesiumJS engine choice in ADR 0001

## Context

Orivanta compared CesiumJS 1.142.0 and Globe.gl 2.46.1 against the same
application shell, Natural Earth point layer, synthetic route, synthetic
polygon, controls, URL state, and accessible list-and-details workflow.

Both engines satisfied the essential static-deployment and accessible
integration gates. The choice therefore depends on which tradeoffs best match
Orivanta's current product direction.

## Decision

Use **Globe.gl with Three.js** as Orivanta's foundation globe engine.

Keep it behind the project-owned `GlobeView` and `GlobeController` boundary.
Do not ship CesiumJS as a dormant alternative.

## Evidence

- Globe.gl produced the cleaner visual and interaction result for the current
  place, route, polygon, and storytelling experience.
- The comparison build's Globe.gl engine chunk was approximately 509 KB gzip,
  versus approximately 1,087 KB gzip for CesiumJS.
- Cesium required an additional approximately 8.9 MB support directory and
  hundreds of deployment files.
- Removing Cesium reduced the production output from approximately 15 MB and
  400 files to 2.4 MB and 9 files.
- Removing Cesium removed 26 packages from the locked dependency graph and
  allowed the Content Security Policy to drop JavaScript `unsafe-eval`.
- Globe.gl was simpler to style, initialize, dispose, and integrate with the
  current application-owned camera and selection model.
- Cesium's advantages—terrain, high-precision geospatial analysis, 3D Tiles,
  and advanced time-dynamic entities—are not requirements for the first
  product phases.

The in-app Chromium renderer crashed while a reproducible timing run was being
collected. No startup or frame-rate values are claimed from that run. Runtime
milestones remain in the application so measurements can be repeated in normal
Chrome, Firefox, Safari, and Edge sessions.

## Consequences

### Positive

- Smaller and simpler production delivery.
- Narrower dependency and browser-security surface.
- Visual behavior better aligned with Orivanta's current direction.
- One rendering stack instead of a permanent comparison architecture.

### Negative

- Terrain, 3D Tiles, and high-precision geospatial features will require
  additional engineering or a future engine review.
- Dense analytical layers, clustering, tiling, and level-of-detail remain
  project-owned concerns.
- The current globe texture must be replaced with a clearly sourced
  production asset.

## Revisit conditions

Reconsider the engine only if validated product requirements make terrain,
photogrammetry, 3D Tiles, or precision geospatial analysis central rather than
optional.
