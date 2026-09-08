/**
 * Generates the Naor-branded copies of the authored ThreeUI documents this site
 * renders in sandboxed iframes.
 *
 * Those iframes are sandbox="allow-scripts" with no allow-same-origin, so their
 * DOM cannot be reached from the page — the copy has to be rewritten in the
 * document itself, before it is served. The upstream package stays untouched;
 * output lands in public/naor/.
 *
 * Re-run after upgrading @designcodeio/threeui:
 *   node scripts/build-naor-assets.mjs
 */
import { copyFile, mkdir, writeFile } from "node:fs/promises";

const SRC = "../node_modules/@designcodeio/threeui/lib-dist/shaders/";
const OUT = new URL("../public/naor/", import.meta.url);

/**
 * The hero component loads this by root-absolute URL, so the packaged copy has
 * to be served from public/. It is copied byte-exact — the hero's own copy is
 * rebranded at runtime on its same-origin DOM instead (see useHeroBrand).
 */
const HERO_ASSET = "bestsellers-book-showcase.html";
const HERO_FROM = new URL(
  "../node_modules/@designcodeio/threeui/lib-dist/assets/landing-pages/" + HERO_ASSET,
  import.meta.url,
);
const HERO_TO = new URL("../public/landing-pages/" + HERO_ASSET, import.meta.url);

/**
 * Applies each [from, to] in order. A miss throws, so an upstream rewording can
 * never silently leave their copy on the page. Entries marked optional may miss
 * because they occur in only one of the documents.
 */
function rewrite(doc, edits, label) {
  let out = doc;
  for (const [from, to, optional] of edits) {
    const before = out;
    out = out.split(from).join(to);
    if (out === before && !optional) {
      throw new Error(`[${label}] replacement no longer matches: ${JSON.stringify(from).slice(0, 90)}`);
    }
  }
  return out;
}

/** Cast list. The card badge is derived from the trailing digits of the name. */
const AGENTS = [
  ["Sophie Lee", "Naor Agent 01"],
  ["Marcus Thorne", "Naor Agent 02"],
  ["Julian Hong", "Naor Agent 03"],
  ["Elena Rossi", "Naor Agent 04"],
];

/**
 * Longest role first: "Senior Brand Strategist" must win over "Brand Strategist".
 * Each document carries only one of those two wordings, so both are optional —
 * the leftover scan is what actually guarantees neither survives.
 */
const ROLES = [
  ["Senior Brand Strategist", "Strategy · Voice", true],
  ["Experience Designer", "Vision · Design"],
  ["Lead Web Engineer", "Code · Deploy"],
  ["Brand Strategist", "Strategy · Voice", true],
  ["CGI Artist", "Render · CGI"],
];

const CAST = [...AGENTS, ...ROLES];

/**
 * Copy the manifesto's own script paints around the headline.
 *
 * `w` is the width fitText condenses a line into, centred on a fixed x that is
 * also the centre of the orbiting tile ring. The authored widths span the full
 * ring, which deliberately lets the outer glyphs weave behind the tiles — fine
 * for their copy, but it hides the first letter of a brand name, so both lines
 * are narrowed to sit inside the ring and stay legible through the whole loop.
 */
const MANIFESTO_COPY = [
  [
    "{ s:'NEW GRAINIENT',    top:930,  w:1370, fill:'#d0d0d0' }",
    "{ s:'NAOR BRAIN AI',    top:930,  w:1080, fill:'#d0d0d0' }",
  ],
  [
    "{ s:'COLLECTION ADDED', top:1114, w:1775, fill:'#ffffff' }",
    "{ s:'POWER TOOL',       top:1114, w:830,  fill:'#ffffff' }",
  ],
  [
    "<title>New Grainient Collection Added — motion</title>",
    "<title>Naor Brain AI — Power Tool</title>",
  ],
  // Both headline lines share one x anchor, which sits on the ring's centre.
  // Nudging it right pulls the shorter second line clear of the tiles that
  // orbit across the ring's left edge.
  ["d2sx(1481)", "d2sx(1560)"],
  ["VOID BLUE   /   GRADIENT STRIPS   /   RED AURA", "CLAUDE CODE   /   CODEX   /   CURSOR"],
  ["GRAINIENT.SUPPLY", "NAOR.AI"],
  ["(50+) Gradients", "(04) Naor Agents"],
  ["Gradients &", "Naor AI &"],
  ["AI-Generated", "Agent-Driven"],
  ["Backgrounds", "Workflows"],
  ["Added,", "On Call,"],
];

/** Any of these surviving into the output is a build failure. */
const FORBIDDEN = [
  ...AGENTS.map(([from]) => from),
  ...ROLES.map(([from]) => from),
  "Grainient",
  "GRAINIENT",
  "VOID BLUE",
  "Character Filmstrip",
  "Character Wave",
];

async function build(name, importPath, edits) {
  const doc = (await import(importPath)).default;
  const out = rewrite(doc, edits, name);

  const leftovers = FORBIDDEN.filter((s) => out.includes(s));
  if (leftovers.length) {
    throw new Error(`[${name}] authored copy survived: ${leftovers.join(", ")}`);
  }

  await writeFile(new URL(name, OUT), out, "utf8");
  console.log(`${name.padEnd(24)} ${String(out.length).padStart(7)} bytes  clean`);
}

await mkdir(OUT, { recursive: true });
await mkdir(new URL("../public/landing-pages/", import.meta.url), { recursive: true });
await copyFile(HERO_FROM, HERO_TO);
console.log(`${HERO_ASSET.padEnd(24)} copied`);

await build("agents-filmstrip.html", SRC + "character-carousel/sources/character-filmstrip.html.js", [
  ...CAST,
  // Bind the card badge to the agent number instead of its position in the deck,
  // so a repeated agent keeps its own number.
  ['${String(index + 1).padStart(2, "0")}', "${profile.name.slice(-2)}"],
  ["Interactive editorial character filmstrip", "Naor AI agent roster"],
  ["<title>Character Filmstrip</title>", "<title>Naor AI — Agent Roster</title>"],
  ['<h1 class="sr-only">Character Filmstrip</h1>', '<h1 class="sr-only">Naor AI agent roster</h1>'],
  [
    "Move, scroll, or use the arrow keys to browse the portraits.",
    "Move, scroll, or use the arrow keys to browse the Naor agents.",
  ],
]);

await build("agents-wave.html", SRC + "character-carousel/sources/character-wave.html.js", [
  ...CAST,
  ["Interactive character card wave", "Naor AI agent wave"],
  ["<title>Character Wave</title>", "<title>Naor AI — Agent Wave</title>"],
  ['<h1 class="sr-only">Character Wave</h1>', '<h1 class="sr-only">Naor AI agent wave</h1>'],
  ["to explore the cards.", "to explore the Naor agents."],
]);

await build(
  "manifesto.html",
  SRC + "neuform-isolated/sources/gallery-heading.html.js",
  MANIFESTO_COPY,
);
