# Accessibility Standard

Orivanta targets WCAG 2.2 AA and treats accessibility as a core architecture
constraint.

Automated testing is useful but cannot establish accessibility on its own.

## 1. Equivalent access

Every essential fact or action exposed through the globe must also be
available through ordinary semantic interface elements.

The primary alternative is a synchronized list or table that supports:

- browsing visible items;
- searching and filtering;
- selecting an item;
- opening its details;
- understanding its location in text; and
- moving the globe to it as an optional enhancement.

The canvas is not placed into a screen reader's reading order as hundreds of
individually focusable objects.

## 2. Keyboard model

The product must provide:

- predictable Tab order through controls, results, and details;
- visible focus indicators;
- buttons for directional movement and zoom;
- documented optional shortcuts for globe navigation;
- Escape behavior for dialogs and temporary panels;
- no keyboard traps; and
- focus restoration after panels and dialogs close.

Shortcuts must not conflict with typing or assistive technology.

## 3. Screen-reader behavior

- Use semantic headings, landmarks, controls, lists, and tables.
- Give controls stable accessible names.
- Announce important selection, loading, error, and result-count changes.
- Avoid announcing high-frequency camera movement.
- Express coordinates in understandable text when useful.
- Keep the detail panel's reading order independent of its visual placement.

## 4. Motion and visual effects

- Respect `prefers-reduced-motion`.
- Replace cinematic camera flights with immediate or brief transitions when
  reduced motion is requested.
- Avoid flashing content.
- Provide pause controls for automatic rotation or time playback.
- Do not require parallax or motion to understand state.

## 5. Visual design

- Meet text and non-text contrast requirements.
- Do not use color as the only representation of a category or state.
- Support 200% browser zoom and text resizing without lost functionality.
- Use large touch targets and adequate spacing.
- Support light, dark, forced-colors, and increased-contrast environments.
- Make labels and selections legible over varied globe imagery.

## 6. Input and device diversity

Core workflows should work with:

- keyboard only;
- mouse or trackpad;
- touch;
- switch-style sequential navigation;
- screen magnification;
- screen readers; and
- devices without reliable WebGL.

When full 3D rendering is unavailable, preserve search, lists, details, and
other useful content.

## 7. Content accessibility

- Use plain language for controls and errors.
- Describe maps, charts, and spatial relationships in accompanying text.
- Provide units and avoid unexplained abbreviations.
- Include source and update information for data.
- Ensure time controls expose their current value and range.
- Give routes and regions meaningful names instead of relying only on shape.

## 8. Test strategy

Each release should include:

- semantic and keyboard review during development;
- automated axe checks on representative pages and states;
- Playwright tests for critical keyboard journeys;
- zoom, reflow, reduced-motion, forced-colors, and touch checks;
- current major browser testing;
- manual testing with at least VoiceOver and NVDA before major public
  releases; and
- periodic testing with people who use assistive technology.

The Phase 1 foundation automates the initial and selected-place axe scans plus
the search, filtering, selection, sharing, layer controls, responsive layouts,
and keyboard-globe journeys in Chromium. These checks are a regression
baseline, not a substitute for the manual testing listed above.

## 9. Definition of done

A feature is not complete when:

- its essential action requires a pointer;
- information exists only as pixels in the globe;
- focus is lost or obscured;
- animation cannot be reduced or paused;
- errors are represented only through color; or
- the accessible alternative has stale or materially different data.
