# Naor AI Power Tool

A single-page site for **NAOR·BRAIN AI**, built on [ThreeUI](https://threeui.com)
renderers and rebranded end to end. React + TypeScript + Vite.

| Section | Renderer |
| --- | --- |
| Hero | `BestsellersBookShowcase` — Codex, Claude Code and Cursor as field volumes |
| Agents | Forked character deck — Naor Agent 01–04, filmstrip / wave |
| Manifesto | Forked kinetic heading — `NAOR BRAIN AI / POWER TOOL` |
| Image Gen | `Gallery` — a 3D wall of generated plates |
| Library | `BookshelfScene` — a tactile shelf of volumes |

## Run it

```bash
npm install
npm run dev
```

`predev` and `prebuild` run `npm run assets` first, so the generated documents
are always present and current. To regenerate them by hand:

```bash
npm run assets
```

## How the rebranding works

The renderers ship with their own authored copy. Reaching it takes three
different approaches, because the components expose it three different ways:

1. **Hero** — a *same-origin* iframe. Its copy is rewritten on the loaded DOM at
   runtime (`useHeroBrand` in [`src/App.tsx`](src/App.tsx)), so the packaged
   3.5 MB asset stays byte-exact.
2. **Agents and manifesto** — `sandbox="allow-scripts"` iframes *without*
   `allow-same-origin`, so their DOM is unreachable from the page. Their source
   documents are instead forked ahead of time by
   [`scripts/build-naor-assets.mjs`](scripts/build-naor-assets.mjs) into
   `public/naor/`.
3. **Gallery and bookshelf** — text is drawn into WebGL canvas textures inside a
   bundled renderer, so it cannot be rewritten without regenerating the assets.

The asset script fails the build if any upstream string it rewrites has changed,
or if any authored name survives into the output — so upgrading
`@designcodeio/threeui` can never silently reintroduce the original copy.

Nothing under `node_modules` is ever modified.

## Licensing

Upstream components are MIT. See [NOTICE.md](NOTICE.md).
