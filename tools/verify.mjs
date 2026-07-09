#!/usr/bin/env node
/* verify.mjs — drive the built index.html in headless Chromium and assert health.
 *
 * Usage: node tools/verify.mjs [scenario] [--shots docs/shots]
 * Scenarios: stock (default) — boot TriFable, QA badge, enter a verse, walk.
 *
 * Requires the pre-installed Playwright (global) + Chromium at /opt/pw-browsers.
 */
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const scenario = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'stock';
const shotsDir = join(ROOT, process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : 'docs/shots');
mkdirSync(shotsDir, { recursive: true });

const errors = [];
const warnings = [];

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox', '--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('console', msg => {
  const t = msg.text();
  if (msg.type() === 'error') errors.push(t);
  // three.js deprecation chatter counts as failure — drift guard
  if (/deprecated|THREE\./i.test(t) && msg.type() === 'warning') warnings.push(t);
});
page.on('pageerror', e => errors.push('pageerror: ' + e.message));

const shot = async name => {
  await page.screenshot({ path: join(shotsDir, name + '.png') });
  console.log(`  shot ${name}.png`);
};
const fail = msg => { console.error('FAIL: ' + msg); process.exitCode = 1; };

console.log(`scenario: ${scenario}`);
await page.goto('file://' + join(ROOT, 'index.html'));

if (scenario === 'stock') {
  // init() runs from the boot shim; storyboard stamps body.dataset.qa when done.
  await page.waitForFunction(() => document.body.dataset.qa !== undefined, null, { timeout: 120000 })
    .catch(() => fail('QA badge never stamped (init did not complete)'));
  const qa = await page.evaluate(() => document.body.dataset.qa);
  console.log('  qa badge:', qa);
  if (qa !== 'pass') fail(`Game.selfTest reported "${qa}"`);
  await shot('m0-boot');

  // Verse gate: three cards (verses.js). Click the first → auto-BEGIN → orbit dive.
  const gateUp = await page.evaluate(() => !!document.querySelector('.verseCard'));
  if (gateUp) await page.keyboard.press('1'); // verses.js binds 1/2/3 pre-game
  else await page.locator('#bootgo').click({ force: true, timeout: 15000 })
    .catch(() => fail('no verse card / BEGIN button clickable'));
  await page.waitForTimeout(9000); // cinematic dive
  await shot('m0-ingame');
  const hudLive = await page.evaluate(() => {
    const ui = document.getElementById('ui');
    return ui && getComputedStyle(ui).opacity !== '0';
  });
  if (!hudLive) fail('game HUD not live after entering verse');

  // Walk forward for 2s and confirm the player moved.
  // player is a top-level `let` (global lexical binding, not a window prop) — bare ref resolves it;
  // position is a THREE.Vector3 (there is no player.t/p — that's the terrain angle args, not state).
  const readPlayer = () => page.evaluate(() => (typeof player !== 'undefined' && player)
    ? { x: player.position.x, y: player.position.y, z: player.position.z } : null);
  const p0 = await readPlayer();
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(2000);
  await page.keyboard.up('KeyW');
  const p1 = await readPlayer();
  if (!p0 || !p1) fail('player binding not reachable');
  else if (p0.x === p1.x && p0.y === p1.y && p0.z === p1.z) fail('player did not move on W input');
  else console.log('  player moved:', JSON.stringify(p0), '->', JSON.stringify(p1));
  await shot('m0-walked');
}

const fontNoise = e => /fonts\.g(oogleapis|static)\.com|net::ERR|Failed to load resource/i.test(e);
const realErrors = errors.filter(e => !fontNoise(e));
if (realErrors.length) fail('console errors:\n  ' + realErrors.join('\n  '));
if (warnings.length) fail('deprecation warnings:\n  ' + warnings.join('\n  '));
if (!process.exitCode) console.log('VERIFY PASS');
await browser.close();
