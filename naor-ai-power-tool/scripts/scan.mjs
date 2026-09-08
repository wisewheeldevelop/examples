/**
 * Lists human-readable string literals in the generated public/naor documents,
 * so any authored copy still shipping to the page is visible at a glance.
 *   node scripts/scan.mjs
 */
import { readFile, readdir } from "node:fs/promises";

const dir = new URL("../public/naor/", import.meta.url);

const NOISE =
  /^(#[0-9a-fA-F]{3,8}|rgba?\(|https?:|[a-z-]+$|[\d.,\s+-]+$|utf-8|use strict|width=device-width)/;

for (const file of (await readdir(dir)).filter((f) => f.endsWith(".html"))) {
  const doc = await readFile(new URL(file, dir), "utf8");
  const strings = new Set();
  for (const m of doc.matchAll(/"([^"\n]{3,70})"/g)) strings.add(m[1]);
  for (const m of doc.matchAll(/'([^'\n]{3,70})'/g)) strings.add(m[1]);

  const words = [...strings].filter(
    (s) => /[A-Za-z]{3}/.test(s) && !NOISE.test(s) && /[A-Z]|\s/.test(s),
  );

  console.log(`\n=== ${file} (${words.length}) ===`);
  for (const s of words) console.log("  ", JSON.stringify(s));
}
