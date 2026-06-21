# CesiumJS Phase 0 Prototype

- **Status:** Working candidate
- **Date:** 2026-06-20
- **Engine:** CesiumJS 1.142.0
- **Dataset:** Natural Earth Populated Places 5.1.2

## Purpose

This prototype tests whether CesiumJS can support Orivanta's static-first,
accessible globe foundation before the engine decision is accepted.

It is one half of the Phase 0 comparison. A lighter Globe.gl/Three.js candidate
still needs to implement the same representative interaction.

## Implemented

- Self-hosted Natural Earth II globe imagery with no API key.
- 243 versioned and validated place points.
- Pointer, touch, wheel, explicit-button, and keyboard globe controls.
- Search across names, countries, regions, codes, and place types.
- A semantic place list synchronized with globe selection.
- A textual detail panel with coordinates, population estimates, provenance,
  and attribution.
- Reduced-motion camera behavior.
- URL-backed camera and selection state.
- Reload restoration from a shared URL.
- A useful non-canvas experience when the 3D view fails.
- Responsive desktop and mobile layouts.
- Lazy loading for the globe engine.
- Static Cloudflare-compatible security and cache headers.

## Verification completed

- Dataset build and validation pass.
- TypeScript strict-mode compilation passes.
- Seven unit tests pass.
- Production Vite build passes.
- Desktop browser verification completed at 1280 × 720.
- Mobile browser verification completed at 390 × 844.
- Search, selection, detail display, close behavior, URL restoration, and
  keyboard camera movement were exercised in the production preview.
- No new console errors were observed after the Strict Mode initialization
  race was corrected.

## Current build measurements

These measurements come from the production build on 2026-06-20.

| Artifact | Minified | Gzip |
| --- | ---: | ---: |
| Application JavaScript | 203.82 KB | 64.26 KB |
| Application and Cesium CSS | 33.79 KB | 7.94 KB |
| Lazy Cesium globe chunk | 4,069.74 KB | 1,093.29 KB |
| Place GeoJSON | 133.82 KB | 19.17 KB |
| Layer manifest | 2.05 KB | 1.05 KB |
| Data catalog | 0.40 KB | 0.26 KB |

Additional deployment facts:

- Total static output: approximately 13 MB.
- Self-hosted Cesium static directory: approximately 8.9 MB on disk.
- Cesium static directory: 389 files and approximately 7.09 MB of file
  contents.
- The application shell and accessible place browser can render before the
  1.09 MB gzip Cesium chunk finishes loading.

## Early assessment

### Strengths

- Cesium provides a capable real globe, camera, entity model, imagery stack,
  local assets, and clear future paths to time, terrain, and 3D Tiles.
- The engine can remain behind a project-owned component boundary.
- The full experience deploys as static files without Cesium ion or another
  paid runtime service.
- The accessible list and details architecture works independently of the
  canvas.

### Costs

- The lazy engine chunk is large at roughly 1.09 MB gzip before advanced
  features are added.
- Cesium ships hundreds of worker, texture, widget, and support files even for
  this narrow prototype.
- React Strict Mode exposed an asynchronous disposal race that required
  explicit handling.
- Globe-engine behavior needs careful separation from React state to avoid
  unnecessary recreation.

## Remaining Phase 0 work

1. Implement the equivalent Globe.gl/Three.js candidate.
2. Add the shared route and polygon fixtures required by the scorecard.
3. Collect comparable startup, memory, and frame-rate measurements.
4. Test current Firefox, Safari, and Edge in addition to the in-app Chromium
   environment.
5. Run structured screen-reader and forced-colors checks.
6. Complete the engine scorecard and decide whether Cesium's advanced
   capabilities justify its delivery cost.
