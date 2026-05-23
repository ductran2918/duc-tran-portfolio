# duc-tran-portfolio

Personal portfolio. Static site — no build step.

## Local
Open `index.html` in a browser. Or:
```
python3 -m http.server 8000
```

## Files
- `index.html` — entry point, design tokens, font imports
- `portfolio.jsx` — data + sections (edit content here)
- `app.jsx` — command palette, status bar, tweaks wiring, hotkeys
- `tweaks-panel.jsx` — tweaks panel component

JSX is transpiled in-browser by Babel — fine for a personal site, no toolchain needed.

## Editing content
Everything you'll want to change lives near the top of `portfolio.jsx`:
- `SITE` — name, role, email, social
- `WORK` — work history rows
- `PROJECTS` — case studies (title, blurb, metrics, stack, impact)

## Editing design
- Colors, type, spacing → CSS custom properties in `index.html` `:root`
- Default tweak values → `window.TWEAK_DEFAULTS` in `index.html`

## Deploy (GitHub Pages)
1. Push this folder to a public repo on GitHub.
2. Repo → Settings → Pages → Source: `Deploy from a branch` → Branch: `main` / root → Save.
3. Wait ~1 min. Site lives at `https://<your-username>.github.io/<repo-name>/`.

For a custom domain, add a `CNAME` file with the domain and point DNS at GitHub Pages.
