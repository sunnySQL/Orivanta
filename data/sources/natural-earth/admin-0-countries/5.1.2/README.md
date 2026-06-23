# Natural Earth Admin 0 Countries 5.1.2

- Dataset: Admin 0 — Countries
- Scale: 1:110m
- Source version: 5.1.2
- Retrieved: 2026-06-23
- License: Public Domain
- Source page: https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-countries/
- Pinned artifact: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_110m_admin_0_countries.geojson
- SHA-256: `6866c877d39cba9c357620878839b336d569f8c662d3cfab4cb1dbe2d39c977f`

`tools/data/build-boundaries.mjs` validates the pinned artifact, keeps polygon
geometry, normalizes the small property set Orivanta needs, and produces the
browser-ready country layer.

Natural Earth depicts de facto boundaries. This dataset is cartographic
context, not an authoritative legal-boundary source.
