# Delivery Roadmap

The roadmap is organized around evidence. Each phase should answer a question
before the project takes on more complexity.

## Phase 0: Foundation spike

**Question:** Can the proposed foundation meet our interaction, accessibility,
performance, and deployment goals?

Build a disposable but disciplined prototype with:

- a full-window globe;
- pointer, touch, and keyboard movement;
- 50 to 500 sample locations;
- selection synchronized with a semantic list;
- a detail panel;
- reduced-motion behavior;
- URL-backed camera and selection state;
- one production build deployed as static files; and
- measurements on desktop and a representative mobile device.

Compare CesiumJS with one lighter candidate, likely Globe.gl/Three.js, using
the same sample interaction.

**Progress:** Both candidates are working. See the
[CesiumJS report](prototypes/CESIUM_PHASE_0.md) and
[Globe.gl report](prototypes/GLOBE_GL_PHASE_0.md). Both now render the same
route and polygon fixtures. Broader browser testing, performance measurements,
and the final scorecard remain.

### Exit criteria

- Globe engine selected and documented.
- Package and build policy confirmed.
- A basic interaction works in current Chrome, Firefox, Safari, and Edge.
- Critical keyboard workflow works without the canvas.
- Initial bundle, loading, memory, and frame-rate measurements recorded.
- Hosting and security-header approach demonstrated.

## Phase 1: Product skeleton

**Question:** Can we create a durable application around the selected globe?

- Scaffold TypeScript, React, Vite, and the selected engine.
- Establish the globe adapter and layer contract.
- Add design tokens and responsive page regions.
- Implement error boundaries and unsupported-device behavior.
- Add formatting, linting, type checking, unit tests, and browser tests.
- Configure preview deployments.
- Add automated dependency and secret scanning.

### Exit criteria

- A contributor can clone, install, test, build, and preview the project from
  documented commands.
- The shell works with a placeholder layer.
- Continuous integration blocks known quality regressions.

## Phase 2: First complete experience

**Question:** Does one focused globe experience provide real user value?

- Choose the first audience and dataset.
- Build search, filters, details, attribution, and sharing.
- Complete the list/table alternative.
- Add loading, empty, error, and offline-aware states.
- Test with keyboard and screen-reader users.
- Run performance tests on lower-powered devices.
- Publish a public alpha.

### Exit criteria

- A user can complete the primary journey without assistance.
- WCAG 2.2 AA audit has no known critical blockers.
- Performance budgets pass on agreed test conditions.
- Dataset provenance and license are documented.

## Phase 3: Layer platform

**Question:** Can the product expand without destabilizing its core?

- Add a second and third layer with different geometry or time behavior.
- Introduce layer manifests and schema validation.
- Add lazy loading, cancellation, and worker-based processing.
- Document the layer-authoring workflow.
- Add visual regression and larger-data performance tests.

### Exit criteria

- A new layer can be added without editing the globe adapter.
- One layer can fail without breaking the application.
- Dense data remains responsive through aggregation or tiling.

## Phase 4: Service capabilities

**Question:** Which shared or persistent capabilities justify a backend?

Potential work, chosen only after user evidence:

- accounts and authentication;
- saved views or collections;
- private and public sharing;
- user data import;
- object storage;
- moderation and abuse controls; and
- usage limits and operational monitoring.

### Exit criteria

- Threat model updated for every server capability.
- Authorization is tested at the API and data layers.
- Data retention, deletion, export, and recovery policies are documented.
- Static public browsing still works independently where possible.

## Phase 5: Sustainable product

Possible directions:

- embeddable globe stories;
- team workspaces;
- publishing tools;
- premium or private layers;
- analysis and export tools;
- educational experiences; or
- organization-specific deployments.

Business features should follow demonstrated value. Payment infrastructure is
not a prerequisite for discovering that value.

## Immediate backlog

1. Use the versioned Natural Earth Populated Places seed layer to exercise the
   foundation prototypes.
2. Agree on the criteria in the
   [Phase 0 comparison scorecard](ENGINE_SCORECARD.md).
3. Scaffold the smallest CesiumJS prototype.
4. Build the equivalent lighter-engine prototype.
5. Test keyboard and reduced-motion flows.
6. Measure bundle size, startup time, memory, and interaction smoothness.
7. Record the globe-engine decision.
8. Scaffold the durable application only after the comparison.
