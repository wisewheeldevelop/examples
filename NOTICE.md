# Third-party notices

This site renders components from **@designcodeio/threeui** (ThreeUI Community),
which is distributed under the MIT License. The upstream copyright notice and
licence text are retained in `node_modules/@designcodeio/threeui/LICENSE` and in
`THIRD_PARTY_NOTICES.md` inside that package.

Three authored documents shipped with that package are served from `public/naor/`
with their copy rebranded for Naor AI. They are generated — never hand-edited — by:

    node scripts/build-naor-assets.mjs

That script reads the originals from `node_modules` and fails loudly if any
upstream string it rewrites has changed, so a package upgrade cannot silently
reintroduce the original copy. Re-run it after upgrading the package.
