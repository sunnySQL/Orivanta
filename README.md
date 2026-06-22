# Orivanta

Orivanta is an accessible, high-performance interactive globe for exploring
places, events, routes, and data over space and time.

**See the world in motion.**

The product begins as a static-first web application: the globe and its core
content are delivered through a global CDN and run in the visitor's browser.
Backend services are added only when a feature genuinely requires them.

## Current status

Phase 0 is complete and Orivanta is now in its Phase 1 product-foundation
stage. Globe.gl is the selected foundation engine and runs inside a
polished spatial-intelligence workspace with a versioned Natural Earth layer,
accessible place directory, category filters, keyboard controls, live camera
readouts, configurable overlays, collapsible workspace panels, a full-globe
focus mode, rich place details, random exploration, and shareable URL state.

## Run locally

If pnpm is not installed globally, use npm to run the already-installed local
tooling:

```sh
npm run dev
```

Then open the local URL printed in the terminal. Package installation remains
locked with pnpm; npm is only invoking the project's local development script.

## Product principles

- **Useful for everyone:** the experience must work with keyboards, screen
  readers, touch, reduced motion, zoom, and lower-powered devices.
- **Fast by default:** ship little code, load data on demand, and define
  measurable performance budgets.
- **Secure by design:** minimize dependencies, pin versions, restrict browser
  capabilities, and keep secrets out of the client.
- **Static-first:** use cacheable files and edge delivery before introducing
  servers.
- **Layer-oriented:** new subjects should plug into the globe without changing
  its core.
- **Progressive:** a simple first release should remain the foundation of a
  larger service.

## Selected foundation

- TypeScript
- React for the application interface
- Globe.gl with Three.js as the selected globe engine
- Vite for development and production builds
- pnpm for dependency management
- Vitest and Playwright for testing
- Cloudflare Pages for the initial deployment
- Cloudflare Workers, storage, and a database only when required

The globe-engine comparison is complete and the decision is documented in
[ADR 0004](docs/decisions/0004-select-globe-gl.md).

## Documentation

- [Project blueprint](docs/BLUEPRINT.md)
- [Technical architecture](docs/ARCHITECTURE.md)
- [Delivery roadmap](docs/ROADMAP.md)
- [Security baseline](docs/SECURITY.md)
- [Deep security and map-detail audit](docs/DEEP_SECURITY_AUDIT_2026-06-20.md)
- [Accessibility standard](docs/ACCESSIBILITY.md)
- [Development guide](docs/DEVELOPMENT.md)
- [Globe-engine scorecard](docs/ENGINE_SCORECARD.md)
- [CesiumJS Phase 0 report](docs/prototypes/CESIUM_PHASE_0.md)
- [Globe.gl Phase 0 report](docs/prototypes/GLOBE_GL_PHASE_0.md)
- [Dataset workspace](data/README.md)
- [Architecture decision 0001](docs/decisions/0001-platform-foundation.md)
- [Dataset decision 0002](docs/decisions/0002-foundation-seed-dataset.md)
- [Product-name decision 0003](docs/decisions/0003-orivanta-product-name.md)
- [Globe-engine decision 0004](docs/decisions/0004-select-globe-gl.md)

## Next action

Publish the polished workspace as an immutable Cloudflare Pages staging
preview, verify its production headers and caching, then repeat runtime
measurements in current desktop and mobile browsers.
