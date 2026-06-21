# Technical Architecture

## 1. Architectural style

Orivanta uses a static-first, client-heavy architecture with optional edge
services.

```text
Browser
  ├─ Application shell and accessible interface
  ├─ Globe engine
  ├─ Layer runtime
  ├─ URL state and local preferences
  └─ Web Workers and local cache
            │
            ▼
Global CDN / static hosting
  ├─ Versioned application assets
  ├─ Layer manifests
  └─ Small and medium datasets
            │
            ▼ (only when needed)
Edge API
  ├─ Authentication and authorization
  ├─ Saved projects and sharing
  ├─ Data ingestion
  └─ Signed access to large assets
            │
            ▼
Database and object storage
```

The core browsing experience must not depend on the optional API.

## 2. Proposed technology choices

| Area | Initial choice | Reason |
| --- | --- | --- |
| Language | TypeScript | Safer contracts for layers, data, and application state |
| Interface | React | Mature component model and accessibility ecosystem |
| Globe | Globe.gl with Three.js | Lighter delivery and strong fit for visual exploration and storytelling |
| Build | Vite | Fast development and optimized static output |
| Packages | pnpm | Efficient installs and useful supply-chain controls |
| Unit tests | Vitest | Fits the Vite and TypeScript toolchain |
| Browser tests | Playwright | Cross-browser interaction and accessibility testing |
| Hosting | Cloudflare Pages | CDN delivery, HTTPS, previews, and static-first deployment |
| Edge API | Cloudflare Workers, later | Add small services without maintaining servers |
| Structured data | D1 or PostgreSQL, later | Introduced when persistent shared data exists |
| Large assets | R2-compatible object storage, later | Appropriate for uploads, tiles, and large datasets |

No backend selection is final until a backend requirement exists.

## 3. Why a package manager

The production website does not run pnpm. pnpm is development machinery used
to:

- lock exact dependency versions;
- reproduce installations and builds;
- run tests and quality checks;
- build optimized static assets; and
- review and update dependencies deliberately.

The deployment contains generated HTML, CSS, JavaScript, and data assets.

## 4. Application boundaries

The application should be divided by responsibility:

```text
src/
  app/              routing, layout, startup, and error boundaries
  globe/            engine adapter, camera, picking, and rendering
  layers/           layer contract, registry, loaders, and implementations
  features/         search, timeline, sharing, and details
  components/       reusable accessible interface components
  accessibility/    announcements, focus, shortcuts, and alternatives
  data/              schemas, validation, attribution, and transformations
  workers/           expensive parsing and calculations
  state/             URL state, session state, and preferences
  styles/            tokens, global styles, and themes
  observability/     errors, performance measures, and permitted analytics
```

Only the `globe/` boundary should depend directly on the selected globe
engine. The rest of the application communicates through a small adapter. This
keeps engine-specific behavior contained and makes the Phase 0 comparison
honest.

## 5. Globe adapter

The adapter should support:

- initialization and disposal;
- camera position and animated or immediate movement;
- adding, updating, hiding, and removing layers;
- selecting rendered objects;
- pointer and keyboard navigation;
- rendering quality controls;
- resize and visibility handling; and
- normalized events for camera and selection changes.

Avoid exposing raw engine objects across the application.

## 6. Data architecture

### Formats

- GeoJSON for ordinary points, lines, and polygons.
- CZML or a project-owned time model for time-dynamic entities.
- 3D Tiles for very large spatial datasets when required.
- Optimized raster or vector tiles for imagery and dense maps.

### Rules

- Every dataset has a source, license, attribution, update date, and schema.
- Validate external data before it reaches rendering code.
- Version layer manifests and schemas.
- Keep source data separate from optimized delivery artifacts.
- Never depend on a third-party API for the only copy of core content.

### Loading

- Fetch layer manifests first and data only when enabled.
- Split large datasets spatially, temporally, or by zoom level.
- Cache immutable versioned files for a long duration.
- Cancel obsolete requests when filters or views change.
- Parse large files in a worker.

## 7. State architecture

Use three deliberate state categories:

1. **Shareable state:** camera, active layers, filters, time, and selection.
   Encode this in the URL when practical.
2. **Session state:** open panels, temporary searches, and pending actions.
   Keep this in memory.
3. **Preferences:** theme, reduced-data choices, and control settings. Store
   locally with clear reset behavior.

Server state is introduced only for shared or account-owned information.

## 8. Rendering and performance strategy

- Keep the React component tree separate from per-frame globe rendering.
- Never use React state for high-frequency camera animation.
- Cluster or aggregate dense points.
- Adjust pixel ratio and effects for device capability.
- Pause or reduce rendering in background tabs.
- Lazy-load non-default features and datasets.
- Prefer progressive detail over large initial downloads.
- Define performance marks for startup, globe readiness, layer readiness, and
  first interaction.

## 9. Accessibility architecture

The globe canvas is an enhancement, not the sole information channel.

The synchronized accessible interface includes:

- search and filter controls;
- a list or table of visible and selected items;
- semantic detail content;
- explicit camera and zoom controls;
- status announcements for selection and loading;
- focus management between globe, list, and details; and
- an option to disable animated camera travel.

The list and globe share the same layer data and selection model.

## 10. Deployment environments

- **Local:** development server and local test data.
- **Preview:** immutable deployment for every reviewed change.
- **Production:** promoted build with stable caching and monitoring.

Production deployment should:

- build from a clean, locked install;
- run formatting, type, unit, browser, and security checks;
- generate hashed immutable assets;
- publish source maps privately or omit them;
- apply security and cache headers; and
- support quick rollback to a previous static deployment.

## 11. Evolution path

1. Static shell and one local layer.
2. Multiple lazy-loaded layers.
3. Edge proxy for APIs that require secrets or normalization.
4. Authentication and saved views.
5. Database and object storage for user-created data.
6. Background ingestion pipeline for large or frequently updated datasets.

Each step is justified by a product requirement and measured load, not by
anticipating scale prematurely.
