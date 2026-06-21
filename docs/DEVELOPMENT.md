# Development Guide

This guide describes the intended workflow. Commands will be finalized when
the application is scaffolded in Phase 1.

## 1. Prerequisites

- Git
- a current maintained Node.js release
- pnpm managed through Corepack or installed from its official distribution
- current versions of Chrome, Firefox, and Safari for local testing

Do not install project tooling globally unless it is specifically documented.

## 2. Expected commands

The scaffold should expose a small, stable command surface:

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm test
pnpm test:e2e
pnpm lint
pnpm typecheck
pnpm check
```

If the `pnpm` command is unavailable but dependencies are already installed,
the same project scripts can be started through npm:

```sh
npm run dev
npm run build
npm run check
```

Do not run `npm install`; pnpm and `pnpm-lock.yaml` remain the dependency
installation source of truth.

`pnpm check` should run the required local quality gates without modifying
files.

## 3. Working agreements

- Keep changes focused and reviewable.
- Update documentation when behavior or architecture changes.
- Add tests for meaningful logic and critical journeys.
- Treat warnings as work to understand, not background noise.
- Do not commit generated builds, local secrets, or unlicensed data.
- Preserve attribution when transforming datasets.
- Measure before adding performance complexity.
- Record significant decisions in `docs/decisions/`.

## 4. Dependency changes

Before adding a package:

1. Confirm the capability cannot be implemented clearly with the platform or
   an existing dependency.
2. Review ownership, maintenance, license, release history, source, and
   transitive dependencies.
3. Prefer a narrow package over a broad framework for a narrow job.
4. Document why the dependency is needed in the change.
5. Review lifecycle scripts before approving them.
6. Measure its production bundle impact when it runs in the browser.

Dependency upgrades should be deliberate and reviewed after a release-age
delay.

## 5. Code conventions

- Use TypeScript strict mode.
- Validate data at system boundaries; do not rely on type assertions.
- Keep rendering-engine types inside `src/globe/`.
- Prefer pure transformations for geographic data.
- Clean up event listeners, engine objects, workers, and network requests.
- Avoid high-frequency React state updates from camera movement.
- Give interactive components semantic HTML before adding ARIA.
- Keep source files cohesive rather than merely small.

Formatting and lint rules will be automated rather than documented as a style
essay.

## 6. Testing pyramid

- **Unit tests:** schemas, transformations, URL state, filters, and layer
  contracts.
- **Component tests:** accessible controls and important interface states.
- **Browser tests:** startup, globe/list synchronization, keyboard flow,
  sharing, reduced motion, and failures.
- **Manual tests:** interaction quality, screen readers, touch, visual
  clarity, and lower-powered hardware.

Do not test CesiumJS or browser behavior that the project does not own. Test
our adapter and user-visible outcomes.

## 7. Data workflow

Each dataset should include:

- a source URL or source record;
- license and attribution;
- retrieval or publication date;
- an untouched source copy when redistribution permits;
- a reproducible transformation process;
- a validated delivery artifact; and
- notes about omissions, uncertainty, and update cadence.

Large generated artifacts may live outside Git once object storage is
introduced.

## 8. Decision records

Use a short architecture decision record when a choice:

- constrains future implementation;
- changes security, privacy, or accessibility posture;
- adds important infrastructure or dependencies; or
- reverses a previous decision.

Each record should include context, decision, alternatives, consequences, and
review conditions.

## 9. Before the scaffold exists

During Phase 0, prototypes may live under a temporary `spikes/` directory.
They should not quietly become production architecture. Keep findings,
measurements, and decisions; delete or archive disposable code after the
durable application is scaffolded.
