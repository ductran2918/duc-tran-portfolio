# Spec: Mobile Responsive Portfolio

## Objective
Make the portfolio automatically adapt to narrow mobile viewports while preserving the current desktop design.

The current desktop layout is liked and should remain visually unchanged at desktop widths. The mobile experience should avoid horizontal overflow, keep content readable, and keep all navigation and interactive controls reachable without requiring pinch-zoom or sideways scrolling.

## Current Root Cause
The page has the correct viewport meta tag, but most layout decisions are inline desktop styles with no narrow-viewport alternative.

Observed at `390px x 844px` on `http://localhost:8000/`:
- `document.documentElement.scrollWidth` is `605px`, wider than the `390px` viewport.
- The sticky top bar keeps all desktop nav/actions in one row, pushing `contact`, `search`, and theme controls beyond the right edge.
- Content sections keep desktop grid assumptions on mobile:
  - `About`: `1fr 1fr`
  - `Work`: `140px 1.4fr 1fr`
  - `ProjectBody`: `1.5fr 1fr`
  - `ProjectsGrid`: `1fr 1fr`
  - `Contact`: `1fr 1fr`
- Some nested rows keep fixed label columns (`100px` / `110px`) even when the available content column is too narrow.
- `body { overflow-x: hidden; }` hides some symptoms but does not make the layout responsive.

## Tech Stack
- Static HTML with React 18 UMD scripts.
- JSX transpiled in-browser by Babel from CDN.
- No bundler, build step, package scripts, or module system.
- Shared globals are attached through `Object.assign(window, ...)`.

## Commands
Dev server:

```bash
python3 -m http.server 8000
```

Mobile verification target:

```text
http://localhost:8000/
```

## Project Structure
- `index.html` stores design tokens, global CSS, viewport metadata, and script loading order.
- `portfolio.jsx` stores content data and main section components.
- `app.jsx` stores the app shell, top bar, command palette, status bar, tweaks panel wiring, and hotkeys.
- `tweaks-panel.jsx` stores the tweak-control UI and should not need changes for this feature.
- `specs/mobile-responsive.md` stores this feature spec.

## Proposed Design Approach
Add a mobile-only responsive layer without changing desktop styles:

- Use a narrow breakpoint around `720px` for structural changes.
- Keep current desktop inline style values as the default path.
- Add a small viewport hook/helper so React components can select mobile style values only below the breakpoint.
- Stack desktop two-column grids into one column on mobile.
- Convert work-history rows from three-column desktop rows into compact stacked rows on mobile.
- Make project details stack content above metadata/preview on mobile.
- Make project metric cards wrap or use fewer columns on mobile.
- Make contact/about label rows use narrower labels or stacked labels on mobile.
- Hide the top section links (`about`, `work`, `projects`, `contact`) on mobile so brand, search, and theme remain reachable without overflow.
- Keep command palette width already constrained by `92vw`.

## Code Style
Preserve the current local style:

```jsx
const isNarrow = useMediaQuery("(max-width: 720px)");

<div style={{
  display: "grid",
  gridTemplateColumns: isNarrow ? "1fr" : "1fr 1fr",
  gap: isNarrow ? 28 : 60,
}}>
```

Conventions:
- Keep edits scoped to `app.jsx`, `portfolio.jsx`, and possibly minimal global CSS in `index.html`.
- Use existing CSS custom properties: `var(--accent)`, `var(--fg)`, `var(--muted)`, `var(--hair)`, `var(--font-*)`.
- Do not introduce dependencies or a build tool.
- Do not change content copy unless required to prevent overflow.

## Testing Strategy
Manual/browser verification is the primary test strategy because this repo has no test runner.

Verify:
- Desktop viewport around `1440px x 900px`: no intentional visual changes to the liked design.
- Tablet-ish viewport around `768px x 1024px`: no horizontal overflow.
- Mobile viewport around `390px x 844px`: no horizontal overflow and all sections readable.
- Narrow mobile viewport around `320px x 568px`: no horizontal overflow and controls remain reachable.

Use browser checks:
- `document.documentElement.scrollWidth <= window.innerWidth`
- Scan visible layout for clipped controls, unreadable columns, and overlapping text.

## Boundaries
- Always: Preserve desktop defaults above the mobile breakpoint.
- Always: Prefer responsive values in existing components over a redesign.
- Always: Verify mobile overflow with an actual browser viewport.
- Ask first: Changing the visual identity, desktop layout, content hierarchy, or project copy.
- Ask first: Adding dependencies, introducing a bundler, or deleting files.
- Never: Delete files without explicit confirmation for that exact deletion.
- Never: Implement feature code before this spec is approved.

## Success Criteria
- At `390px` width, the document scroll width is no wider than the viewport.
- At `320px` width, the document scroll width is no wider than the viewport.
- The sticky top bar does not push controls off-screen on mobile.
- About, Work, Projects, and Contact sections are readable as single-column or compact stacked layouts on mobile.
- Project cards and expanded project bodies do not overflow on mobile.
- Desktop layout at widths above the breakpoint remains visually equivalent to the current design.

## Decisions
- Use `720px` as the breakpoint for mobile layout behavior.
- Hide the top section links on mobile; keep brand, search, and theme controls visible.
