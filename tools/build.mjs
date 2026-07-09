#!/usr/bin/env node
/* build.mjs — inline split sources into the single-file deliverable index.html.
 *
 * Reads src/manifest.json (ordered module list), wraps each module file as
 * <script type="text/plain" id="src-NAME">, substitutes vendor + modules +
 * ORDER into src/shell.html, and writes index.html.
 *
 * Safety rails:
 *  - refuses any module containing a literal "</script" sequence
 *  - collision audit: top-level (column-0) declarations must be unique across
 *    all modules that share the global scope — duplicate `const X` in two
 *    classic scripts is a boot-killing SyntaxError, so the build fails early.
 *
 * Usage: node tools/build.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = rel => readFileSync(join(ROOT, rel), 'utf8');

const manifest = JSON.parse(read('src/manifest.json'));
const shell = read('src/shell.html');

const wrap = (id, code) => {
  if (code.includes('</script')) throw new Error(`module ${id} contains "</script" — cannot inline`);
  return `<script type="text/plain" id="src-${id}">${code}</script>`;
};

/* ---- collision audit across shared-global-scope modules ---- */
const DECL_RE = /^(?:const|let|var|function|class|async function)\s+([A-Za-z_$][\w$]*)/;
const seen = new Map(); // name -> module id
const collisions = [];
for (const { id, path } of manifest.modules) {
  const code = read(`src/${path}`);
  // IIFE-wrapped modules declare nothing at top level; column-0 scan is exact
  // for the donor style (nested code is always indented).
  for (const line of code.split('\n')) {
    const m = DECL_RE.exec(line);
    if (!m) continue;
    const name = m[1];
    if (seen.has(name) && seen.get(name) !== id) collisions.push(`${name}: ${seen.get(name)} vs ${id}`);
    else seen.set(name, id);
  }
}
if (collisions.length) {
  console.error('GLOBAL COLLISION AUDIT FAILED:\n  ' + collisions.join('\n  '));
  process.exit(1);
}

/* ---- assemble ---- */
const vendor =
  wrap('three', read('src/vendor/three-r160.js')) + '\n' +
  wrap('addons', read('src/vendor/postprocessing.js'));

const modules = manifest.modules
  .map(({ id, path }) => wrap(id, read(`src/${path}`)))
  .join('\n');

const order = JSON.stringify(manifest.modules.map(m => m.id));

const html = shell
  .replace('%VENDOR%', () => vendor)
  .replace('%MODULES%', () => modules)
  .replace('%ORDER%', () => order);

writeFileSync(join(ROOT, 'index.html'), html);
console.log(`built index.html (${(html.length / 1024 / 1024).toFixed(2)} MB, ${manifest.modules.length} modules) — collision audit clean (${seen.size} top-level symbols)`);
