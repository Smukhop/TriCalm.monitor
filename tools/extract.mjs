#!/usr/bin/env node
/* extract.mjs — one-time extraction of the TriFable donor HTML into split sources.
 *
 * Pulls: vendored THREE r160 + postprocessing addons → src/vendor/,
 *        every <script type="text/plain" id="src-*"> pseudo-module → src/surface/,
 *        the window.__HARNESS__ manifest → src/surface/harness.js,
 *        the HTML head/CSS/DOM skeleton + boot shim → src/shell.html (with
 *        %VENDOR% / %MODULES% / %ORDER% placeholders for build.mjs).
 *
 * Usage: node tools/extract.mjs <path-to-trifable-donor.html>
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const donorPath = process.argv[2];
if (!donorPath) { console.error('usage: node tools/extract.mjs <trifable.html>'); process.exit(1); }
const html = readFileSync(donorPath, 'utf8');

const out = (rel, content) => {
  const p = join(ROOT, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
  console.log(`  wrote ${rel} (${(content.length / 1024).toFixed(1)} KB)`);
};

/* ---- scan all pseudo-module blocks ---- */
const blocks = new Map(); // id -> content
{
  const openRe = /<script type="text\/plain" id="src-([^"]+)">/g;
  let m;
  while ((m = openRe.exec(html))) {
    const id = m[1];
    const start = m.index + m[0].length;
    const end = html.indexOf('</script>', start);
    if (end < 0) throw new Error(`unterminated block src-${id}`);
    blocks.set(id, html.slice(start, end));
  }
}
console.log(`found ${blocks.size} pseudo-module blocks:`, [...blocks.keys()].join(', '));

/* ---- vendor ---- */
out('src/vendor/three-r160.js', blocks.get('three'));
out('src/vendor/postprocessing.js', blocks.get('addons'));

/* ---- surface modules (everything else, in donor ORDER) ---- */
const orderMatch = html.match(/const ORDER = (\[[^\]]*\]);/);
if (!orderMatch) throw new Error('boot-shim ORDER array not found');
const ORDER = JSON.parse(orderMatch[1]);
for (const id of ORDER) {
  if (!blocks.has(id)) { console.warn(`  ! ORDER lists ${id} but no block found`); continue; }
  out(`src/surface/${id}`, blocks.get(id));
}

/* ---- __HARNESS__ manifest → pseudo-module ---- */
{
  const hStart = html.indexOf('<script>window.__HARNESS__');
  if (hStart < 0) throw new Error('__HARNESS__ script not found');
  const cStart = hStart + '<script>'.length;
  const cEnd = html.indexOf('</script>', cStart);
  out('src/surface/harness.js', html.slice(cStart, cEnd) + '\n');
}

/* ---- shell.html: head/DOM up to the runtime marker + templated tail ---- */
{
  const marker = '<!-- ===== TriFable MiniVerse · inlined offline runtime (single-file) ===== -->';
  const cut = html.indexOf(marker);
  if (cut < 0) throw new Error('runtime marker comment not found');
  const head = html.slice(0, cut);

  // Boot shim: donor's, verbatim, with ORDER templated. build.mjs fills placeholders.
  const shim = `<script type="module">
(async () => {
  const stat = () => document.getElementById('bootstat');
  const get  = id => { const e=document.getElementById('src-'+id); return e?e.textContent:null; };
  try {
    const threeURL  = URL.createObjectURL(new Blob([get('three')], {type:'text/javascript'}));
    const addonsSrc = get('addons').split('./three.module.js').join(threeURL);
    const addonsURL = URL.createObjectURL(new Blob([addonsSrc], {type:'text/javascript'}));
    const THREE = await import(threeURL);
    const A     = await import(addonsURL);
    Object.assign(window, { THREE, EffectComposer:A.EffectComposer, RenderPass:A.RenderPass,
      UnrealBloomPass:A.UnrealBloomPass, OutputPass:A.OutputPass, ShaderPass:A.ShaderPass });
    const ORDER = %ORDER%;
    for (const id of ORDER) {
      const code = get(id);
      if (code == null) { console.warn('[env] optional pack absent: '+id); continue; }
      const s = document.createElement('script');
      s.textContent = '//# sourceURL='+id+'\\n'+code;
      document.body.appendChild(s);
    }
    if (typeof window.__PLATFORM_BOOT__ === 'function') { await window.__PLATFORM_BOOT__(); }
    else { if (typeof window.init !== 'function') throw new Error('init() not defined');
           await window.init(); window.loop(); }
  } catch (e) { console.error(e); const s=stat(); if (s) s.textContent='Boot error — see console: '+e.message; }
})();
</script>`;

  const shell = head + marker + '\n%VENDOR%\n%MODULES%\n' + shim + '\n\n</body>\n</html>\n';
  out('src/shell.html', shell);
}

/* ---- starter manifest: stock TriFable order (harness first — pure data) ---- */
{
  const manifest = {
    modules: ['harness.js', ...ORDER].map(id => ({ id, path: `surface/${id}` })),
  };
  out('src/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
}
console.log('extraction complete.');
