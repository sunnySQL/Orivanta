# Security Baseline

Security is a product property, not a final deployment task. This document
defines the minimum baseline and should evolve with the threat model.

## 1. Initial threat model

The static-first application must consider:

- compromised or malicious dependencies;
- cross-site scripting through application or dataset content;
- malicious external data;
- leaked API keys or deployment credentials;
- dependency confusion or lockfile tampering;
- unsafe third-party scripts and analytics;
- denial of service through very large datasets or expensive rendering;
- misleading data attribution or poisoned content; and
- privacy leakage through URLs, logs, analytics, or browser storage.

Accounts, uploads, and collaboration add substantially more threats and require
a separate review before implementation.

## 2. Dependency policy

- Use as few runtime dependencies as practical.
- Install packages only from the configured registry.
- Commit the pnpm lockfile.
- Use exact direct dependency versions unless a reviewed policy says
  otherwise.
- Require review for new dependencies and major updates.
- Do not permit dependency lifecycle scripts by default.
- Prefer packages with clear ownership, active maintenance, source code,
  licensing, and security practices.
- Delay newly released dependency versions before adoption.
- Run dependency, license, and known-vulnerability checks in continuous
  integration.
- Never merge automated dependency updates solely because tests pass.

The lockfile improves reproducibility; it does not prove that a package is
safe.

## 3. Browser security

Production should send, at minimum:

- a restrictive Content Security Policy;
- `X-Content-Type-Options: nosniff`;
- a strict `Referrer-Policy`;
- a restrictive `Permissions-Policy`;
- clickjacking protection through CSP `frame-ancestors`;
- HTTPS with an appropriate Strict-Transport-Security policy; and
- cross-origin policies where they do not break required imagery or tile
  sources.

Avoid inline scripts and styles so the Content Security Policy can remain
strict. Third-party origins must be individually justified.

## 4. Data handling

- Treat every external dataset as untrusted input.
- Validate manifests and records against schemas.
- Render user-controlled text as text, never as raw HTML.
- Limit file size, record count, coordinate ranges, and parsing time.
- Sanitize allowed rich content with a reviewed sanitizer.
- Preserve source, license, attribution, and version metadata.
- Route secret-bearing upstream API requests through a controlled server.

## 5. Secrets

- Browser code is public; it cannot contain secrets.
- Keep local secrets in ignored environment files.
- Use narrowly scoped deployment credentials.
- Rotate credentials after suspected exposure.
- Scan repository changes for common secret patterns.
- Document which environment variables exist without storing their values.

## 6. Service security, when introduced

Before adding accounts or persistence:

- document trust boundaries and data flows;
- use a maintained identity provider or carefully reviewed authentication
  solution;
- enforce authorization on every server operation;
- validate all request input;
- add rate limits and abuse controls;
- protect state-changing requests appropriately;
- log security-relevant events without logging sensitive data;
- define backup, restore, retention, export, and deletion behavior; and
- test horizontal and vertical privilege boundaries.

## 7. Privacy

- Collect no personal data without a product need.
- Prefer aggregate, privacy-respecting operational metrics.
- Do not include sensitive state in shareable URLs.
- Explain local storage and analytics behavior.
- Provide a way to clear saved local preferences.
- Add a formal privacy policy before collecting account or behavioral data.

## 8. Reporting and response

Before public launch, create:

- a private vulnerability-reporting channel;
- a `SECURITY.md` reporting policy at the repository root if the repository
  becomes public;
- named owners for triage and release decisions;
- a dependency-compromise response checklist; and
- a rollback procedure tested against the hosting platform.

## 9. Release security checklist

- Clean locked install used.
- Type, test, and browser checks pass.
- Dependency and secret scans reviewed.
- No unexpected external network requests.
- Production security headers verified.
- Source maps handled according to policy.
- Dataset licenses and attributions present.
- Rollback target identified.
