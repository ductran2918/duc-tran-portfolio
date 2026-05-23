# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

No build step. JSX is transpiled in-browser by Babel loaded from unpkg CDN.

## Deploying

Push to `main` on `ductran2918/duc-tran-portfolio` — GitHub Pages auto-deploys from the root of `main`.
Live site: https://ductran2918.github.io/duc-tran-portfolio/

## Architecture

The site has no bundler. Three `.jsx` files are loaded as `type="text/babel"` script tags in `index.html` in this exact order:

1. `tweaks-panel.jsx` — reusable tweak controls + `useTweaks` hook
2. `portfolio.jsx` — all content data + section components
3. `app.jsx` — root `<App>`, command palette, status bar, hotkeys

Because there's no module system, each file publishes its exports via `Object.assign(window, {...})` at the bottom. Files loaded later can reference symbols from files loaded earlier through `window` globals (e.g., `app.jsx` reads `SITE`, `PROJECTS`, `FONT_PAIRS`, `ACCENTS`, `useNow`, `useCursor`, `useHotkey`, `fmtTime` — all set by `portfolio.jsx`).

## Content editing

All site content is in `portfolio.jsx` near the top:

- `SITE` — name, role, location, timezone offset, email, social links
- `WORK` — employment history rows
- `PROJECTS` — case study cards with blurb, metrics, stack, body paragraphs, impact bullets

The `About` component's sidebar rows (`AboutRow`) are hardcoded inline in the component body (not derived from `SITE`) — search for `AboutRow` to find them.

## Tweaks system

`window.TWEAK_DEFAULTS` in `index.html` (between `/*EDITMODE-BEGIN*/` and `/*EDITMODE-END*/`) stores the persisted UI state: `dark`, `accent`, `fontPair`, `density`, `hero`, `card`, `texture`. `useTweaks()` in `tweaks-panel.jsx` reads this on load and persists changes via a `postMessage` protocol (`__edit_mode_set_keys`) — the host rewrites the `EDITMODE` block on disk when running inside a design tool. When editing in a plain browser, changes to tweaks survive the session but don't persist to disk.

## Design tokens

All colors and spacing are CSS custom properties on `:root` (light) and `html[data-theme="dark"]` in `index.html`. `App` in `app.jsx` applies tweaks by writing directly to `html.style.setProperty('--font-sans', ...)`, `html.dataset.theme`, `html.dataset.tex`, `html.dataset.density`. The accent color and font pair are runtime-variable; don't hardcode them in new components — always use `var(--accent)`, `var(--font-sans)`, `var(--font-mono)`, `var(--font-display)`.

## Known stale references to update when relevant

- `app.jsx:352` — console welcome log still references old email `duc@ductran.work`
- `app.jsx:28` — command palette "View source on GitHub" opens `about:blank` instead of the real repo URL (`https://github.com/ductran2918/duc-tran-portfolio`)
- `app.jsx:280` — footer `last shipped` date is hardcoded as `2026-05-23`
