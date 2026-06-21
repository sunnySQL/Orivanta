# Deep Security and Map-Detail Audit

- **Date:** 2026-06-20
- **Scope:** application source, generated datasets, direct and transitive
  packages, lockfile policy, production bundle, and deployment controls
- **Result:** no evidence of personal-data collection, telemetry, credential
  access, or malicious package behavior; no known dependency vulnerabilities
  were reported by the current advisory database

This is a point-in-time engineering review, not a guarantee that every package
is free of undiscovered malicious code.

## 1. Map detail and zoom ceiling

The current Globe.gl view uses one 1600 × 800 equirectangular JPEG. At the
equator, one source pixel spans approximately 25.05 km. Moving the camera
closer therefore enlarges the same pixels; it cannot reveal streets,
buildings, or new geographic detail.

The current OrbitControls minimum distance is 112 Three.js units around a
globe with an approximate radius of 100 units. That permits a minimum camera
height of roughly 0.12 Earth radii, or 765 km. The explicit zoom buttons stop
slightly earlier at approximately 1,019 km.

Globe.gl supports a slippy-map tile URL function. With an appropriately
licensed raster or vector tile source, theoretical Web Mercator resolution at
the equator is:

| Zoom | Approximate resolution |
| ---: | ---: |
| 12 | 38.22 m/pixel |
| 15 | 4.78 m/pixel |
| 18 | 0.60 m/pixel |
| 19 | 0.30 m/pixel |
| 20 | 0.15 m/pixel |

Those figures describe the map grid, not guaranteed source accuracy. Imagery,
road data, labels, provider limits, licensing, latitude, and capture quality
determine what is actually visible.

Recommended product direction:

1. Keep Globe.gl for planetary exploration and visual storytelling.
2. Load tiled imagery or vector data only as the camera approaches a region.
3. Transition to a MapLibre local map when street labels, routing, search, or
   very close inspection becomes the main task.
4. Prefer Cesium only if terrain, high-precision coordinates, photogrammetry,
   or 3D Tiles become core requirements.

The current Content Security Policy intentionally blocks third-party tile
hosts. Adding one must be an explicit privacy and security decision with a
narrow `img-src`/`connect-src` allowlist. OpenStreetMap data is open, but its
public raster tile service is not an unlimited production CDN.

## 2. Browser data-access review

The application source does not use:

- cookies, local storage, session storage, or IndexedDB;
- analytics, advertising, telemetry, or error-reporting services;
- geolocation, camera, microphone, clipboard, notifications, USB, serial, or
  Bluetooth APIs;
- file pickers, file readers, service workers, WebSockets, or `sendBeacon`;
- account credentials, payment data, or personal-information forms.

The only application data requests load the public catalog, manifest, and
GeoJSON from `/data/`. They now:

- reject paths outside `/data/`;
- reject absolute paths, traversal segments, query strings, fragments, and
  backslashes;
- omit browser credentials;
- require same-origin mode; and
- reject redirects.

The app therefore has no code path that can read arbitrary personal files,
browser passwords, or data from other sites. Browser sandboxing also prevents
such access unless a user explicitly grants a capability, and this app does
not request those capabilities.

## 3. Injection and navigation review

No `dangerouslySetInnerHTML`, application `innerHTML`, `eval`, `new Function`,
or document-writing API is used.

Hardening completed during this audit:

- Globe.gl point labels are created as an `HTMLElement` and populated with
  `textContent`, preventing dataset text from becoming tooltip HTML.
- External source links render only when the URL is valid HTTPS.
- External links retain `target="_blank"` with `rel="noreferrer"`.
- Dataset fetch paths are constrained as described above.

React also escapes place names, descriptions, and manifest text rendered in
the interface.

## 4. Dependency and supply-chain review

The project uses exact direct dependency versions and pnpm 11.5.3 with a
committed lockfile.

Observed results:

- 216 locked package entries passed pnpm's supply-chain verification.
- Every registry resolution in the lockfile has a SHA-512 integrity value.
- No Git, direct-tarball, or other exotic dependency resolution was found.
- No `preinstall`, `install`, or `postinstall` script was found in the 214
  installed package manifests inspected.
- `pnpm audit --audit-level low` reported no known vulnerabilities.
- Common secret patterns found no API tokens, private keys, registry tokens,
  or credentials in project files.
- TypeScript, dataset validation, 11 unit tests, and the production build pass.

The pnpm policy now:

- denies dependency build scripts unless explicitly approved;
- blocks exotic transitive dependency sources;
- delays newly released versions by 24 hours;
- rejects missing release-time metadata and trust downgrades;
- re-verifies lockfile policy instead of blindly trusting it;
- verifies store integrity; and
- prevents `pnpm run` from silently installing changed dependencies.

The npm configuration also disables dependency lifecycle scripts for an
accidental `npm install`. Explicit commands such as `npm run dev` still invoke
the already-installed local project tool.

## 5. Production bundle and network review

The default Globe.gl production path contains:

- the application JavaScript and CSS;
- the local globe engine chunk;
- a local Earth texture; and
- same-origin dataset requests.

No telemetry or data-exfiltration endpoint is configured. URLs embedded in
the default chunks are documentation, XML namespace, font-license, and source
reference strings. The Globe.gl dependency chunk contains a generic
`XMLHttpRequest` loader from an embedded Emscripten/H3 library, but the app
does not configure an external endpoint for it and production CSP limits
connections to the app's own origin.

The in-app audit browser crashed while initializing the WebGL-heavy production
page, so a successful browser network trace was not captured in this pass.
Source review, built-bundle review, and the restrictive production CSP all
independently show no configured third-party runtime request. A final launch
check should still capture a network trace in a normal Chrome or Firefox
session.

## 6. Deployment controls

The production policy includes:

- scripts, network connections, images, fonts, and workers restricted to
  explicitly allowed sources;
- camera, geolocation, microphone, payment, USB, and motion sensors disabled;
- framing denied;
- MIME sniffing disabled;
- strict referrer handling;
- cross-origin opener/resource isolation; and
- an HTML CSP fallback for hosts that do not process the `_headers` file.

The HTML fallback cannot replace every HTTP response header. The selected host
must be verified after deployment, especially for `frame-ancestors`,
Permissions Policy, HSTS, and cross-origin headers.

## 7. Residual risks and next actions

1. **Build tools remain the largest trust boundary.** Vite, TypeScript, test
   tools, and their dependencies execute with the developer account's file
   permissions. Run locked installs, review updates, and avoid unreviewed
   package commands.
2. **Inline styles and WebAssembly evaluation remain permitted.** Re-test and
   remove permissions that are no longer needed as the selected engine and UI
   mature.
3. **External tiles change the privacy model.** Visitors' IP addresses and map
   locations may be visible to a tile provider. Prefer self-hosted tiles or a
   reviewed provider and document the behavior.
4. **Accounts, uploads, payments, or precise user location require a new
   threat model.** They should not be added under this static-app assessment.
5. **License inventory remains a separate release task.** The pnpm license
   command encountered a local package-index error, although this does not
   affect the vulnerability or integrity checks above.

## 8. Audit commands

Key checks used for this review:

```sh
pnpm install --frozen-lockfile
pnpm audit --audit-level low
npm run check
```

Additional source, secret, lifecycle-script, lockfile-resolution, production
bundle, CSP, and browser-API searches were performed with `rg`, `find`, and
targeted bundle inspection.

## 9. Post-audit foundation update

On 2026-06-21, Orivanta selected Globe.gl and removed CesiumJS:

- 26 packages were removed from the locked dependency graph;
- the approximately 8.9 MB Cesium support tree was removed;
- production output dropped to 2.4 MB across 9 files; and
- JavaScript `unsafe-eval` was removed from the Content Security Policy.
