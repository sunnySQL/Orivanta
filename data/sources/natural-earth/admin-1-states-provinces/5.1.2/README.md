# Natural Earth Admin 1 States and Provinces 5.1.2

- Dataset: Admin 1 — States, Provinces
- Scale: 1:50m
- Source version: 5.1.2
- Retrieved: 2026-06-23
- License: Public Domain
- Source page: https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-1-states-provinces/
- Pinned artifact: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_50m_admin_1_states_provinces.geojson
- SHA-256: `69a0e06e640b2d505858ae1cb63034e4677f3000b35a98e16312932b98c426b9`

`tools/data/build-boundaries.mjs` validates the pinned artifact, selects the
United States features, keeps polygon geometry, and produces the browser-ready
state layer.

This 1:50m layer is intended for regional visualization. Authoritative or
high-detail U.S. boundary work should use a pinned U.S. Census Bureau source.
