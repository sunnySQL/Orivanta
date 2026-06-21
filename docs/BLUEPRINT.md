# Project Blueprint

## 1. Product vision

Create a globe-based environment where anyone can explore meaningful
information geographically and over time.

The globe is not the whole product. It is one view into a broader experience
that also includes search, filters, lists, timelines, stories, and accessible
textual alternatives.

## 2. Product thesis

Geographic information becomes easier to understand when people can:

1. See where something happened.
2. Move naturally between global and local context.
3. Compare multiple layers without visual overload.
4. Access the same information without depending on a 3D canvas.

The initial release should prove this interaction model with one excellent
dataset instead of collecting many shallow features.

## 3. Target users

The first release is designed for:

- curious people exploring geographic stories or data;
- educators and students presenting spatial subjects;
- researchers and enthusiasts comparing locations or events; and
- keyboard, screen-reader, touch, and motion-sensitive users who are poorly
  served by many existing globe experiences.

Future audiences may include publishers, nonprofit organizations, data teams,
and creators building their own globe layers.

## 4. Core experience

A visitor can:

- rotate, pan, and zoom the globe with pointer, touch, or keyboard controls;
- search for a location or item;
- select a marker, route, region, or event;
- read an accessible detail panel;
- switch layers on and off;
- move through time when a layer contains temporal data;
- use a synchronized list or table instead of the globe; and
- share a URL that restores the current view and selection.

## 5. Minimum viable product

The MVP contains:

- one polished, documented dataset;
- a controllable 3D globe;
- markers or regions with selectable details;
- smooth camera movement with a reduced-motion alternative;
- search and basic filters;
- a keyboard-operable synchronized list;
- responsive layouts for phone, tablet, and desktop;
- shareable application state in the URL;
- loading, empty, error, and unsupported-device states;
- privacy-respecting operational analytics; and
- automated checks for critical interactions and accessibility.

## 6. Explicit non-goals for the MVP

The first release will not include:

- user accounts;
- payments or subscriptions;
- user uploads;
- real-time collaboration;
- a general-purpose layer editor;
- a native mobile application;
- a custom mapping engine; or
- many live data feeds.

These exclusions protect the quality and delivery speed of the core
interaction.

## 7. Layer model

Every subject should be represented as a layer with a consistent contract.

A layer defines:

- metadata: identifier, title, description, attribution, and version;
- geometry: points, lines, polygons, imagery, terrain, or 3D tiles;
- presentation: styles, labels, clustering, and visibility rules;
- interaction: selection, hover, details, filters, and camera behavior;
- time: optional start, end, and playback behavior;
- accessibility: text labels, descriptions, list representation, and reading
  order; and
- performance: loading strategy, size, and rendering limits.

This contract is the primary expansion mechanism for the product.

## 8. Quality goals

### Performance

- Useful interface visible within 2 seconds on a representative mid-range
  mobile device and connection.
- Main-thread interactions remain responsive while data loads.
- Initial compressed JavaScript budget: 350 KB, excluding the selected globe
  engine. The engine receives a separate measured budget during Phase 0.
- Load only the default layer at startup.
- Large parsing and transformation work moves to Web Workers.

These are starting budgets, not promises made without measurement.

### Reliability

- A failure in one optional layer must not prevent the shell or other layers
  from working.
- Static content should remain usable during API or backend outages.
- Releases must be reproducible from a committed lockfile.

### Accessibility

- Target WCAG 2.2 AA.
- All core tasks must be possible without operating the globe directly.
- Keyboard and screen-reader support are release requirements.
- Respect reduced motion, increased contrast, browser zoom, and text scaling.

### Security and privacy

- No secrets in browser code or repository history.
- No unreviewed third-party scripts at runtime.
- Restrictive Content Security Policy and browser security headers.
- Collect the minimum analytics necessary to operate the service.

## 9. Business and service expansion

The static-first product can later gain:

- saved views and collections;
- private or shared workspaces;
- user-authored layers;
- imports and exports;
- embedded globes for other websites;
- organization accounts;
- premium datasets or analysis tools; and
- collaboration and publishing workflows.

These capabilities should be separate services around the stable globe
application rather than reasons to rewrite it.

## 10. Measures of success

The prototype succeeds when:

- users can operate and understand it without instruction;
- the keyboard/list experience provides the same essential information as the
  visual globe;
- a new sample layer can be added without editing globe internals;
- the experience remains responsive on a mid-range mobile device;
- the production build is deployable as static assets; and
- security and accessibility checks run automatically.

Product metrics will be defined after the first subject and audience are
chosen. Until then, engineering activity is not a substitute for user value.

## 11. Open product decisions

- What is the first subject or dataset?
- Is the primary mode exploratory, narrative, analytical, or a blend?
- Who is the first narrow audience we want to delight?
- Which capabilities are valuable enough to justify accounts later?
- How should the Orivanta identity evolve as the first audience becomes clear?
