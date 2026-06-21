# Globe.gl Phase 0 Prototype

- **Status:** Working candidate
- **Date:** 2026-06-20
- **Engine:** Globe.gl 2.46.1 with Three.js 0.184.0
- **Dataset:** Natural Earth Populated Places 5.1.2

## Purpose

This prototype tests a lighter visual-globe engine against the same data,
interface, controls, accessibility model, and shareable state used by the
CesiumJS candidate.

The comparison switch is temporary Phase 0 instrumentation. The durable
application should ship one selected globe engine, not both.

## Implemented

- Draggable and zoomable Three.js globe.
- 243 selectable place points with restrained global marker sizing.
- Brighter day texture, atmosphere, selection highlight, and animated ring.
- Pointer, touch, explicit-button, and keyboard controls.
- Search, semantic place list, details, and provenance shared with Cesium.
- Reduced-motion behavior.
- URL-backed engine, camera, and selection state.
- Live switching between the two Phase 0 candidates.
- Responsive desktop and mobile layouts.
- Lazy engine loading and background-tab rendering pause.

## Verification completed

- Dataset build and validation pass.
- TypeScript strict-mode compilation passes.
- Eleven unit tests pass.
- Production Vite build passes.
- Desktop browser verification completed at 1280 × 720.
- Mobile browser verification completed at 390 × 844.
- Search, selection, camera flight, details, URL updates, and both directions
  of engine switching were exercised.
- The development server starts successfully with `npm run dev`.
- No console errors were observed after removing duplicate WebGL mounting in
  React development mode.

## Current build measurements

These measurements come from the production build on 2026-06-20.

| Artifact | Minified | Gzip |
| --- | ---: | ---: |
| Shared application JavaScript | 205.11 KB | 64.70 KB |
| Shared CSS | 34.51 KB | 8.08 KB |
| Globe.gl/Three.js chunk | 1,798.72 KB | 508.59 KB |
| Shared geometry chunk | 18.41 KB | 5.99 KB |
| Day texture | 244.68 KB | JPEG |
| Place GeoJSON | 133.82 KB | 19.17 KB |

Compared with the Cesium candidate:

- Globe.gl engine JavaScript is approximately 53% smaller after gzip.
- Globe.gl does not require Cesium's approximately 8.9 MB static support
  directory.
- The texture adds approximately 245 KB and should be replaced with an
  explicitly sourced production asset before launch.

## Early assessment

### Strengths

- Cleaner visual result for the current point-based storytelling experience.
- Less marker and label congestion.
- Simpler camera and selection styling.
- Roughly half the compressed engine JavaScript of Cesium.
- No worker and widget asset tree for this use case.
- Straightforward integration with the project-owned globe boundary.

### Costs

- It does not provide Cesium's geospatial precision, terrain, imagery-provider
  model, time-dynamic entity system, or 3D Tiles depth.
- Dense or analytical geographic layers will require more project-owned work.
- Globe.gl renders continuously unless explicitly paused and needs careful
  lifecycle management.
- The temporary texture is distributed with the pinned Three.js globe package,
  but its original provenance must be confirmed or replaced before product
  launch.

## Current direction

For the product experience currently demonstrated—an interactive globe with
curated points, stories, routes, and approachable exploration—Globe.gl is the
stronger provisional fit.

Cesium remains the stronger choice if the product direction commits to
terrain, high-precision geospatial analysis, large 3D Tiles datasets, or
advanced time-dynamic mapping.

The final engine decision still needs route and polygon fixtures plus broader
browser and accessibility testing.
