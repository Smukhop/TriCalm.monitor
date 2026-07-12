# TriFable ⁘ LOQI v14.7 — Adaptive Quality · Grounded Landfall · MiniPlanet Sky (Rev A)

**Entry:** `TriFable_LOQI_Unified_v14_7_Adaptive_Quality_Grounded_Landfall.html`
**Base:** v14.6 Rev B (Round MiniPlanets · Realm Atlas), single standalone HTML, embedded Three.js r160 + three-mesh-bvh 0.9.10, one renderer, three scene roots.

---

## 1. Critical fix — "clicking to go into the planet doesn't load"

**Root cause (affected Shinobi, Sayajin AND GrandLine equally):** `DESTINATION_APPROACH`
preloads the destination surface while the approach cinematic plays. When the city
finished building *faster* than the 1.85 s cinematic, the already-resolved promise made
the landing continuation run **while the FSM was still inside its own transition**, so
`FSM.to('CITY_LANDFALL')` returned `REENTRANT {ok:false}` and was silently dropped —
the game hung in `SURFACE_LOADING` forever. Direct entry of the *current* realm never
preloads, which is why that path appeared to work.

**Fix:** new `TF14.FSM.toWhenIdle(state)` waits for the in-flight transition to settle
before transitioning; the landfall continuation and its error path both use it, and the
preload promise now carries a rejection guard so a failed preload can no longer become
an unhandled rejection. Verified end-to-end: `shinobi → saiyan → pirate → shinobi`
route travel all land in `SURFACE_EXPLORATION` (previously all three hung).

---

## 2. What v14.7 adds (from the v14.6 → v14.7 patch list)

| Patch | Status | Notes |
|---|---|---|
| P0.1 Quality schema in session + migration | ✅ | Full `QualityProfile` object in `defaultSession().settings.quality`; legacy `'high'` string auto-migrates (ledger entry, `schemaVersion: '14.7.0'`); import path migrates too |
| P0.2 `TF14.Quality` module (detect / apply / tick / scaleDown / scaleUp) | ✅ | Tier presets `ultra/high/medium/low/potato` + `auto`; GPU heuristic (software renderer, mobile, cores, memory); FPS auto-scaler with hysteresis + cooldown, only active on `auto` |
| P0.3 Blob-URL cleanup | ✅ | Both module blob URLs revoked **after** the BVH import (revoking the three.js URL immediately, as originally drafted, would break the BVH module's rewritten `from 'three'` import — corrected) |
| P1.1 Adaptive pixel ratio + resize | ✅ | `pixelRatioMax` per tier, re-applied on resize and quality change |
| P1.2 WebGL context loss/restore | ✅ | Scheduler halts on loss; on restore re-applies quality, resets accumulator, resumes, toasts |
| P1.3 Shadow & lighting control | ✅ | `shadowMapSize` (0 = off), `shadowType` basic/pcf/pcfsoft/vsm, sun/hemi intensities, shadow map re-allocated on size change |
| P1.4 `TF14.teardown()` on `pagehide` | ✅ | Saves surface transform, disposes surface/audio/scopes/renderer; skips bfcache-persisted pagehides |
| P2.1 Quality-aware character builder | ✅ | `boneCount:'minimal'`/`skinnedMeshes:false` → low-detail rig; `facial:false` drops backpack detail; explicit opts still win (NPCs stay low-detail) |
| P2.2 Animation/NPC update throttling | ✅ | Player animator at `animationUpdateHz` (60/30/20/12) with dt accumulation; `NPCSystem` at `npcUpdateHz`, hard `npcMaxCount` cap (dropped count in diagnostics) |
| P2.3 Shadow flags on avatars | ✅ | `castShadow`/`receiveShadow` per tier on all rig meshes |
| P3.1 Galaxy `_build` particle scaling | ✅ | `stars, armParticles, funnel, accretion, dust, nebula, beltParticles` from profile; `grid/streamers/jets/radiationBelts` build-gated; layer map applied; **live `applyProfile()`/`rebuild()`** preserves selection & world time |
| P3.2 Surface / MiniPlanet quality | ✅ | `planetShellSegments` drives terrain cap + underside tessellation; `buildingDetail` full/medium/low/impostor (windows→trim gating); `maxBuildings` soft cap; `islandCount`/`waterfallCount` slices; atmosphere/water/windables/audioZones/cameraZones gates; `groundProbes` 1–4; `collisionPrecision` swept/simple; `bvhMaxDepth`; `fogDensity` → fog range |
| P3.3 Audio quality | ✅ | `beds` gate (oscillator/noise beds never created on potato), `footstepQuality` full/simple/none, `cuePriority` all/important/none, `sampleRateHint` (guarded constructor) |
| P4.1 Quality panel in System monitor | ✅ | Tier dropdown (AUTO…POTATO), live readout (selected→effective tier, fps, GPU, auto-steps), RESET TO AUTO |
| P4.2 Selftest / lifecycle updates | ✅ | +5 checks: profile validity, landfall re-entrancy guard, galaxy particle counts ±10% vs profile, shell segments vs profile, sky bodies present; collision check is now profile-aware |
| P4.3 Migration + `prefers-reduced-motion` | ✅ | Media query honored at boot unless the user explicitly toggled reduced motion |

### MiniPlanet-journey sky (spec §25–26 / reference images)

New per-realm `skyBodies()` layer on every surface, disposed with the city and gated by
`surface.skyBodies`:

* **spherical sky-gradient shell** (realm-tinted zenith blending into the fog horizon — locally flat physics, visibly curved world)
* **visible QuramaQuore** (warm core + violet glow + tilted accretion ring) high in the sky
* **visible moon** with halo on the opposite azimuth
* joins the existing curved-cap terrain (`curveAt` drop), spherical underside, rim,
  atmosphere shell, floating satellite islands and far planet — the Messenger-style
  "small round world under a big sky" read from the concept frames.

---

## 3. Already present in v14.6 (no extraction from the v13.2 zip needed)

The v13.2 zip is **fully superseded** — its canonical manifest, quasar hazard routing,
Canvas2D planner successor, terrain-projected city network and lifecycle events were all
re-implemented natively in v14.x. Nothing left to extract; its roadmap maps as follows:

| v13.2 roadmap item | v14.7 status |
|---|---|
| City graph → gameplay (NPC patrols, courier hooks) | ✅ authored NPC routines + interactions per realm |
| Replace placeholder architecture | ✅ authored districts, buildings w/ doors, signs, interactions |
| Route events (radiation, jets, hazards) | ✅ radiation belts/field, jet cones, hazard-scored route solver, live revalidation |
| Lifecycle extraction (registry, dispose) | ✅ Runtime scopes, Lifecycle counters, deep lifecycle test |
| **Global performance budgets** | ✅ **this release** — the `TF14.Quality` engine |
| Production packaging / smoke tests | ✅ Node syntax validation of all 12 script blocks + headless-Chromium e2e travel suite |

From the original v14 "Grounded Worlds" spec, v14.6 already delivered: swept-capsule BVH
collision, multi-probe grounding + ledge guard, collision-aware camera with zones,
17+-bone skinned player with 2D locomotion blend + foot plants, companion + NPC life,
governed FSM travel (terminal-only departure), readiness barrier before control unlock,
session persistence/checkpoints, procedural audio zones, diagnostics + selftest + QA.

## 4. Remaining backlog (not yet integrated — future v14.8+)

**From the v14 mega-spec:**
1. Stairs-specific camera damping + stair-stride animation set (stairs use ramp colliders today).
2. Foot-IK raycast conformance (`footPlantPrecision` is plumbed; the full raycast IK pass is procedural-only).
3. Layered wind system (global breeze / canopy / branch / gust frequencies) — `windables` metadata exists, animation pass pending.
4. Interaction verb expansion (sit/photograph/meditate…) beyond current inspect/talk/board set.
5. NPC impostor LOD at `npcLodDistance` (cap + Hz throttle shipped; billboard impostors pending).
6. Boundary-vocabulary art pass (realm-specific rails/fences everywhere a collider exists).
7. Destination console extra tabs (Surface Conditions, live surface preview hologram).
8. Toon/outline unified render pass (stylized bands + selective outlines).

**From the v14.7 patch list P5 (explicitly deferred):**
KTX2 texture compression · InstancedMesh building kits · progressive district streaming ·
WebGPU path · AudioWorklet beds · IndexedDB for large surface snapshots.

## 5. Verification (headless Chromium, SwiftShader)

* 12/12 script blocks pass Node syntax validation.
* Boot → `GALACTIC_OVERVIEW`; auto-detect resolved `low` tier on software GL; galaxy built to profile counts.
* Route travel legs **saiyan ✅ / pirate ✅ / shinobi ✅** all reach `SURFACE_EXPLORATION` (bug previously hung all three).
* `TF14.selftest()` — **all checks pass on every realm surface** (incl. 5 new quality checks).
* `TF14.deepLifecycleTest()` — 2×3 realm build/dispose, zero listener/scope leaks.
* Tier switching live-rebuilds the galaxy (potato 700+2600 ↔ ultra 7000+34000 particles) and restores.
* Legacy `quality:'high'` session migrates to the adaptive profile with a ledger entry.
* Zero console errors across the full run.

## 6. Console quick reference

```js
TF14.Quality.diagnostics()   // selected→effective tier, fps, gpu, auto-steps
TF14.Quality.apply('ultra')  // force a tier (galaxy rebuilds live)
TF14.Quality.apply('auto')   // hand control back to the FPS auto-scaler
TF14.diagnostics()           // full system tree incl. quality, physics, player
TF14.selftest()              // 33 checks
await TF14.deepLifecycleTest()
```
