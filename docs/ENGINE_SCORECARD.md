# Globe-Engine Scorecard

This scorecard prevents the engine decision from being based only on which
prototype looks most impressive.

The Phase 0 spike compares:

- **CesiumJS:** the provisional geospatial-platform choice; and
- **Globe.gl/Three.js:** the provisional lighter visual-globe choice.

MapLibre GL JS should be added if the first product direction becomes
map-first or vector-style-first.

**Fixture status:** The shared points, synthetic Atlantic route, and synthetic
Western Mediterranean polygon are implemented in both candidates.

## 1. Shared prototype

Each candidate must implement the same small experience:

- full-window globe in a responsive application shell;
- 500 representative points;
- one route and one polygon;
- pointer, touch, and keyboard camera controls;
- selection synchronized with a semantic list;
- a detail panel;
- search;
- animated and reduced-motion camera transitions;
- shareable camera and selection state;
- simulated layer-loading failure; and
- a static production deployment.

Use the same data, imagery quality, device, browser, and network conditions
where possible.

## 2. Decision gates

A candidate is disqualified if it cannot reasonably provide:

- the essential keyboard and non-canvas workflow;
- a static production deployment without a paid runtime dependency;
- acceptable licensing for the intended product;
- cleanup of resources during navigation and layer changes;
- stable operation in current major browsers; or
- a project-owned adapter boundary.

## 3. Scored criteria

Score each category from 1 to 5 and record evidence. Weighting reflects the
current product vision and can be changed before testing begins.

| Category | Weight | Evidence |
| --- | ---: | --- |
| Accessible integration | 20% | Keyboard model, list synchronization, focus, motion |
| Performance | 20% | Startup, frame rate, memory, data-loading behavior |
| Layer extensibility | 15% | Points, routes, polygons, imagery, time, large data |
| Interaction quality | 10% | Camera, picking, touch, animation, visual clarity |
| Bundle and delivery cost | 10% | Compressed size, requests, caching, worker support |
| Engineering simplicity | 10% | API clarity, cleanup, debugging, adapter complexity |
| Long-term capability | 10% | Terrain, time, precision, tiles, ecosystem maturity |
| Licensing and portability | 5% | Core license, attribution, provider independence |

The score informs the decision; it does not replace engineering judgment.

## 4. Measurement record

Record at least:

| Measurement | CesiumJS | Globe.gl/Three.js |
| --- | --- | --- |
| Lazy engine JavaScript, gzip | 1,087.11 KB | 508.85 KB |
| Shared application JavaScript, gzip | 65.34 KB | 65.34 KB |
| Engine-specific static support assets | ~8.9 MB directory | 244.68 KB texture |
| Total initial transfer | TBD | TBD |
| Time to useful interface | TBD | TBD |
| Time to interactive globe | TBD | TBD |
| Mobile peak memory | TBD | TBD |
| Idle frame rate | TBD | TBD |
| Frame rate with 500 points | TBD | TBD |
| Time to display sample layer | TBD | TBD |
| Engine-specific direct dependencies | 1 | 3 |
| Prototype implementation time | TBD | TBD |

Describe the test device, operating system, browser, network profile, build
mode, and measurement method beside the results.

## 5. Qualitative questions

- Does the engine encourage us to bypass the accessible application model?
- How much engine-specific knowledge leaks through the adapter?
- Can layers be loaded, hidden, and destroyed without memory growth?
- Can we self-host essential assets and avoid mandatory commercial services?
- How naturally does the engine represent time?
- How much custom work is required for clustering or level-of-detail?
- Does it behave well when WebGL capability is limited?
- How easy is it to diagnose rendering and data problems?
- Are documentation and maintenance activity adequate for a long-lived
  product?

## 6. Decision output

At the end of the spike:

1. Complete the evidence and scores.
2. Write a short recommendation with the most important tradeoff.
3. Update ADR 0001 from `Proposed` to `Accepted`, or create a superseding ADR.
4. Preserve measurements and screenshots.
5. Scaffold the durable application with the selected engine.

Do not merge both engines into the production architecture as a hedge. The
adapter preserves options without making the application carry two rendering
stacks.
