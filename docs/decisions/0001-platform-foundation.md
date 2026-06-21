# ADR 0001: Provisional Platform Foundation

- **Status:** Proposed
- **Date:** 2026-06-20
- **Review:** End of Phase 0

## Context

Orivanta needs an interactive globe that can grow into a secure, fast,
accessible service. It should support geographic and time-based layers while
remaining inexpensive and simple to deploy initially.

Avoiding a package manager would reduce initial tooling, but manual dependency
management would make testing, optimized builds, reproducibility, and
long-term updates more difficult. The choice of globe engine has a larger
effect on the product than the package-manager choice.

## Proposed decision

Use:

- TypeScript as the application language;
- React for the interface outside the rendering loop;
- Vite for development and optimized static builds;
- pnpm for dependency management;
- CesiumJS as the provisional globe engine;
- Vitest and Playwright for automated testing; and
- Cloudflare Pages for initial static deployment.

Keep CesiumJS behind a project-owned globe adapter.

## Why this direction

- TypeScript supports stable contracts for layers and external data.
- React is well suited to the substantial accessible interface surrounding
  the canvas.
- CesiumJS is designed for geospatial globes, time-varying data, terrain,
  imagery, and large spatial formats.
- Vite produces static output suitable for CDN deployment.
- pnpm offers reproducible dependency management and useful supply-chain
  controls.
- Static deployment minimizes infrastructure, cost, and attack surface.

## Alternatives considered

### No package manager

Good for a small demonstration, but weak for a growing TypeScript application
with automated testing and reproducible builds.

### npm CLI

Widely supported and acceptable when hardened. pnpm is provisionally preferred
for its workflow and dependency controls. Both use the npm package ecosystem,
so this choice does not remove registry risk.

### Globe.gl with Three.js

Likely lighter and fast to prototype for visual storytelling. It remains the
comparison candidate because it may better fit the product if high-precision
geospatial features are not central.

### MapLibre GL JS

Strong for maps and globe projection, especially when vector-map styling is
central. It may be preferable if the product evolves toward a map-first
experience rather than a general 3D globe.

### Framework-managed full-stack application

Not justified before accounts, server rendering, or server-owned data exist.
It would add infrastructure and framework coupling to a product that can begin
as static assets.

## Consequences

### Positive

- Strong path from prototype to a layered geospatial service.
- Static hosting remains possible.
- Application interface and globe rendering have clear boundaries.
- Testing and automated quality checks are practical.

### Negative

- CesiumJS may impose a significant loading and complexity cost.
- React and a build tool add development machinery.
- Dependencies require ongoing review and maintenance.
- Cloudflare-specific backend choices could create future platform coupling
  if adopted carelessly.

## Validation required

Before accepting this decision:

- implement the same representative interaction in CesiumJS and a lighter
  engine;
- compare production bundle size and startup time;
- measure mobile memory and interaction smoothness;
- verify keyboard, list, and reduced-motion integration;
- confirm static hosting and security headers; and
- document whether advanced Cesium capabilities are truly part of the likely
  roadmap.

If Cesium's advantages are not material for the first several product phases,
choose the lighter engine.
