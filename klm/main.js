/* =========================================================================
 * KarmaMinato's Lowkey KLM Monitor — wiring and the run loop.
 *
 * The shape of the loop, which is the whole design:
 *
 *   walk a small world  →  meet an agent of the Corps  →  take a charter
 *   →  do the thing  →  a skill pins to the compass  →  the cloak advances
 *   →  karma is written to a visible ledger  →  the coupling field moves
 *
 * Every arrow in that chain is a real function call in this file. The Monitor is
 * not a dashboard bolted onto a game; the game's events ARE the monitor's data,
 * which is the only way a monitor can be trusted.
 * ========================================================================= */
import * as THREE from 'three';
import {
  WORLDS, WORLD_BY_ID, CORE, FAB_STYLES, AGENT_CORPS, SKILLS, SKILL_BY_ID,
  CLOAK_LEVELS, KARMA_BY_KIND, STEER_SYSTEMS, LOBES,
} from './data.js';
import { Planet } from './planet.js';
import { SphericalController, CameraRig } from './controller.js';
import { Minato, Jaganaught } from './figures.js';
import { Steering } from './steering.js';
import { MonitorUI } from './ui.js';
import {
  clamp, clamp01, mix, expDamp, latLonToVec3, transportTangent, orientOnSurface,
  vec3ToLatLon, hash3,
} from './math.js';
import { SKY_FRAG, FS_VERT, POST_FRAG, CHAKRA_VERT, CHAKRA_FRAG } from './shaders.js';

const $ = (s) => document.querySelector(s);
const SAVE_KEY = 'klm.monitor.v1';

/* ------------------------------------------------------------------ props */

/**
 * The prop library. Deliberately blocky: a cel ramp reads a chamfered box far
 * better than it reads a smooth form, and every one of these is a silhouette
 * first. Keyed by the names the world specs ask for.
 */
function propLibrary() {
  const L = {};
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  // Buildings sit with their base at y=0 so `scatter` can drop them on a surface.
  const lift = (g, y) => { g.translate(0, y, 0); return g; };

  L.house = { id: 'house', geometry: mergeGeo([
    lift(box(1.9, 1.5, 1.7), 0.75),
    lift(new THREE.ConeGeometry(1.55, 1.0, 4), 2.0),
  ]), count: 74, tint: '#d8cdb6', scale: [0.85, 1.5], minHeight: 0.25,
  maxHeight: 2.1, maxSlope: 0.030, jitter: 0.5 };

  L.tree = { id: 'tree', geometry: mergeGeo([
    lift(new THREE.CylinderGeometry(0.11, 0.17, 1.3, 6), 0.65),
    lift(new THREE.ConeGeometry(0.72, 1.9, 6), 1.9),
  ]), count: 260, tint: '#3f8f5c', scale: [0.7, 1.6], minHeight: 0.22,
  maxHeight: 2.6, maxSlope: 0.055, jitter: 0.9 };

  L.rock = { id: 'rock', geometry: new THREE.DodecahedronGeometry(0.45, 0),
    count: 190, tint: '#8a8577', scale: [0.5, 1.5], minHeight: -1.2,
    maxHeight: 4.0, maxSlope: 0.35, jitter: 1.0, alignUp: false };

  L.lantern = { id: 'lantern', geometry: mergeGeo([
    lift(box(0.10, 1.5, 0.10), 0.75),
    lift(box(0.34, 0.40, 0.34), 1.7),
  ]), count: 52, tint: '#ffcf7a', scale: [0.8, 1.2], minHeight: 0.28,
  maxHeight: 1.9, maxSlope: 0.026, jitter: 0.4 };

  L.spire = { id: 'spire', geometry: lift(new THREE.ConeGeometry(0.5, 3.4, 5), 1.7),
    count: 150, tint: '#7c2d12', scale: [0.6, 2.0], minHeight: 0.1,
    maxHeight: 5.0, maxSlope: 0.30, jitter: 0.9, alignUp: false };
  L.slagBlock = { id: 'slagBlock', geometry: lift(box(1.5, 0.9, 1.5), 0.45),
    count: 66, tint: '#3f1c0c', scale: [0.8, 1.7], minHeight: -0.2,
    maxHeight: 2.4, maxSlope: 0.045, jitter: 0.6 };
  L.ember = { id: 'ember', geometry: lift(new THREE.TetrahedronGeometry(0.3), 0.2),
    count: 220, tint: '#ff8a2b', scale: [0.5, 1.4], minHeight: -1.6,
    maxHeight: 0.2, maxSlope: 0.5, jitter: 1.0, alignUp: false };

  L.caisson = { id: 'caisson', geometry: mergeGeo([
    lift(new THREE.CylinderGeometry(0.9, 1.0, 1.1, 8), 0.55),
    lift(box(1.7, 0.22, 1.7), 1.2),
  ]), count: 58, tint: '#2f9e8f', scale: [0.9, 1.6], minHeight: 0.55,
  maxHeight: 1.6, maxSlope: 0.09, jitter: 0.7 };
  L.mast = { id: 'mast', geometry: mergeGeo([
    lift(box(0.12, 3.2, 0.12), 1.6),
    lift(box(1.0, 0.10, 0.10), 2.9),
  ]), count: 70, tint: '#cbd5e1', scale: [0.7, 1.5], minHeight: 0.3,
  maxHeight: 3.2, maxSlope: 0.10, jitter: 0.8 };
  L.kelp = { id: 'kelp', geometry: lift(new THREE.ConeGeometry(0.14, 1.6, 4), 0.8),
    count: 240, tint: '#0f6b5a', scale: [0.6, 1.5], minHeight: -2.0,
    maxHeight: 0.9, maxSlope: 0.4, jitter: 1.0, alignUp: false };

  L.terraformer = { id: 'terraformer', geometry: mergeGeo([
    lift(box(2.4, 2.0, 2.4), 1.0),
    lift(new THREE.CylinderGeometry(0.55, 0.75, 2.4, 8), 3.2),
  ]), count: 34, tint: '#8a6a4a', scale: [1.0, 2.1], minHeight: 0.2,
  maxHeight: 3.0, maxSlope: 0.05, jitter: 0.5 };
  L.mesa = { id: 'mesa', geometry: lift(new THREE.CylinderGeometry(1.6, 2.0, 2.2, 6), 1.1),
    count: 90, tint: '#9a4a22', scale: [0.9, 2.4], minHeight: 0.4,
    maxHeight: 5.0, maxSlope: 0.12, jitter: 0.9, alignUp: false };
  L.antenna = { id: 'antenna', geometry: mergeGeo([
    lift(box(0.10, 2.6, 0.10), 1.3),
    lift(new THREE.SphereGeometry(0.36, 8, 6), 2.7),
  ]), count: 48, tint: '#c8763e', scale: [0.7, 1.5], minHeight: 0.5,
  maxHeight: 4.0, maxSlope: 0.09, jitter: 0.8 };

  L.aerostat = { id: 'aerostat', geometry: mergeGeo([
    lift(new THREE.SphereGeometry(1.1, 10, 8), 1.6),
    lift(box(0.9, 0.35, 0.9), 0.4),
  ]), count: 76, tint: '#eadfc4', scale: [0.9, 1.9], minHeight: 0.6,
  maxHeight: 5.5, maxSlope: 0.6, jitter: 1.0, alignUp: false };
  L.lattice = { id: 'lattice', geometry: mergeGeo([
    lift(box(2.0, 0.14, 0.14), 1.4), lift(box(0.14, 0.14, 2.0), 1.4),
    lift(box(0.14, 1.4, 0.14), 0.7),
  ]), count: 96, tint: '#d9a44c', scale: [0.8, 1.8], minHeight: 0.4,
  maxHeight: 5.5, maxSlope: 0.6, jitter: 1.0 };
  L.vane = { id: 'vane', geometry: lift(box(0.08, 1.8, 0.9), 0.9),
    count: 130, tint: '#b8622e', scale: [0.6, 1.5], minHeight: 0.2,
    maxHeight: 5.5, maxSlope: 0.7, jitter: 1.0, alignUp: false };

  L.crystal = { id: 'crystal', geometry: lift(new THREE.OctahedronGeometry(0.7, 0), 0.7),
    count: 200, tint: '#cfe8f7', scale: [0.5, 1.9], minHeight: -0.8,
    maxHeight: 4.5, maxSlope: 0.4, jitter: 1.0, alignUp: false };
  L.shard = { id: 'shard', geometry: lift(new THREE.TetrahedronGeometry(0.55), 0.4),
    count: 260, tint: '#9db8d8', scale: [0.4, 1.5], minHeight: -1.5,
    maxHeight: 4.5, maxSlope: 0.5, jitter: 1.0, alignUp: false };

  L.pile = { id: 'pile', geometry: mergeGeo([
    lift(box(0.22, 2.2, 0.22), 1.1), lift(box(1.6, 0.18, 1.6), 2.2),
  ]), count: 82, tint: '#8fd7d0', scale: [0.8, 1.5], minHeight: 0.35,
  maxHeight: 2.4, maxSlope: 0.07, jitter: 0.6 };
  L.berg = { id: 'berg', geometry: lift(new THREE.DodecahedronGeometry(1.1, 0), 0.6),
    count: 120, tint: '#e8f7f4', scale: [0.7, 2.2], minHeight: -1.0,
    maxHeight: 1.2, maxSlope: 0.4, jitter: 1.0, alignUp: false };
  return L;
}

/** Merge a few geometries into one. Small and local; no addon needed. */
function mergeGeo(list) {
  let vc = 0, ic = 0;
  for (const g of list) {
    vc += g.attributes.position.count;
    ic += g.index ? g.index.count : g.attributes.position.count;
  }
  const pos = new Float32Array(vc * 3);
  const nrm = new Float32Array(vc * 3);
  const idx = new Uint32Array(ic);
  let vo = 0, io = 0;
  for (const g of list) {
    const gp = g.attributes.position, gn = g.attributes.normal;
    for (let i = 0; i < gp.count; i++) {
      pos[(vo + i) * 3] = gp.getX(i);
      pos[(vo + i) * 3 + 1] = gp.getY(i);
      pos[(vo + i) * 3 + 2] = gp.getZ(i);
      if (gn) {
        nrm[(vo + i) * 3] = gn.getX(i);
        nrm[(vo + i) * 3 + 1] = gn.getY(i);
        nrm[(vo + i) * 3 + 2] = gn.getZ(i);
      }
    }
    if (g.index) {
      for (let i = 0; i < g.index.count; i++) idx[io + i] = g.index.getX(i) + vo;
      io += g.index.count;
    } else {
      for (let i = 0; i < gp.count; i++) idx[io + i] = i + vo;
      io += gp.count;
    }
    vo += gp.count;
    g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  out.setIndex(new THREE.BufferAttribute(idx, 1));
  return out;
}

/* ------------------------------------------------------------------ spray */

/**
 * Chakra grains. One pooled Points cloud, additive, written straight into a
 * typed array — the plume during a Kurama run is a few hundred live grains and a
 * per-grain object would be a few hundred allocations a second.
 */
class Chakra {
  constructor(scene, cap) {
    this.cap = cap || 900;
    this.pos = new Float32Array(this.cap * 3);
    this.vel = new Float32Array(this.cap * 3);
    this.age = new Float32Array(this.cap);
    this.life = new Float32Array(this.cap);
    this.seed = new Float32Array(this.cap);
    this.ageAttr = new Float32Array(this.cap);
    this._next = 0;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute('aAge', new THREE.BufferAttribute(this.ageAttr, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(this.seed, 1));
    this.uniforms = {
      uSize: { value: 140 },
      uPixelRatio: { value: Math.min(devicePixelRatio || 1, 2) },
      uTint: { value: new THREE.Color('#ff9a3c') },
    };
    this.material = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: CHAKRA_VERT,
      fragmentShader: CHAKRA_FRAG,
      uniforms: this.uniforms,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    this.points = new THREE.Points(g, this.material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 20;
    scene.add(this.points);
    this.geometry = g;
    // Dead grains are parked at the origin with age 1, which the shader fades to
    // nothing — cheaper than maintaining a draw range.
    for (let i = 0; i < this.cap; i++) this.ageAttr[i] = 1;
  }

  emit(p, v, life, size) {
    const i = this._next;
    this._next = (this._next + 1) % this.cap;
    const o = i * 3;
    this.pos[o] = p.x; this.pos[o + 1] = p.y; this.pos[o + 2] = p.z;
    this.vel[o] = v.x; this.vel[o + 1] = v.y; this.vel[o + 2] = v.z;
    this.age[i] = 0;
    this.life[i] = life;
    this.seed[i] = Math.random() * 10;
  }

  update(dt, planet) {
    for (let i = 0; i < this.cap; i++) {
      if (this.life[i] <= 0) { this.ageAttr[i] = 1; continue; }
      this.age[i] += dt;
      if (this.age[i] >= this.life[i]) { this.life[i] = 0; this.ageAttr[i] = 1; continue; }
      const o = i * 3;
      // Drag, and a pull toward the planet along the local radius — "down" is a
      // different direction for every grain, which is the whole charm of a small
      // world and costs one normalise.
      const d = 1 - 2.1 * dt;
      this.vel[o] *= d; this.vel[o + 1] *= d; this.vel[o + 2] *= d;
      const px = this.pos[o], py = this.pos[o + 1], pz = this.pos[o + 2];
      const r = Math.hypot(px, py, pz) || 1;
      const g = 5.5 * dt;
      this.vel[o] -= (px / r) * g;
      this.vel[o + 1] -= (py / r) * g;
      this.vel[o + 2] -= (pz / r) * g;
      this.pos[o] += this.vel[o] * dt;
      this.pos[o + 1] += this.vel[o + 1] * dt;
      this.pos[o + 2] += this.vel[o + 2] * dt;
      this.ageAttr[i] = this.age[i] / this.life[i];
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.aAge.needsUpdate = true;
  }
}

/* ------------------------------------------------------------------- game */

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.karma = 0;
    this.skills = new Set();
    this.visited = new Set();
    this.quests = [];
    this.ledger = [];
    this.cloak = CLOAK_LEVELS[0];
    this.autonomy = false;
    this.npcs = [];
    this.nearest = null;
    this.flash = 0;
    this.worldIndex = 2;   // Aerilion — the cradle, and the reference plate
    this._t = 0;
    this._questT = 0;
    this._boot = 0;
  }

  /* ------------------------------------------------------------ lifecycle */

  async init() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas, antialias: true, powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    this.renderer.setSize(innerWidth, innerHeight, false);
    this.renderer.autoClear = false;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 4000);

    // Shared uniforms. Every material in the scene reads these, so the world
    // cannot half-change when a planet swaps.
    this.shared = {
      uSunDir: { value: new THREE.Vector3(0.5, 0.6, 0.35).normalize() },
      uSunColor: { value: new THREE.Color('#fff3d8') },
      uSkyColor: { value: new THREE.Color('#7fc9dd') },
      uGroundColor: { value: new THREE.Color('#2c5a4a') },
      uTime: { value: 0 },
      uCelSteps: { value: 4 },
      uScratch: { value: 1 },
      uInk: { value: 1 },
      uWobble: { value: 1 },
      uCamPos: { value: new THREE.Vector3() },
    };

    this._buildSky();
    this._buildPost();
    this.props = propLibrary();

    this.steering = new Steering();
    this.load();

    this.minato = new Minato();
    this.jaganaught = new Jaganaught();
    this.scene.add(this.minato.root, this.jaganaught.root);
    this.minato.setCloak(this.cloak);

    this.chakra = new Chakra(this.scene, 900);

    await this.loadWorld(WORLDS[this.worldIndex], true);

    this.ui = new MonitorUI(this);
    this.ui.setWorld(this.world);
    this._wireInput();
    this._wireRail();
    return this;
  }

  _buildSky() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(
      new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
    this.skyUniforms = {
      uInvVP: { value: new THREE.Matrix4() },
      uCamPos: this.shared.uCamPos,
      uSunDir: this.shared.uSunDir,
      uZenith: { value: new THREE.Color('#1d5f86') },
      uHorizon: { value: new THREE.Color('#a9e6ee') },
      uSunColor: this.shared.uSunColor,
      uStarGain: { value: 0.25 },
      uTime: this.shared.uTime,
    };
    this.sky = new THREE.Mesh(g, new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: FS_VERT, fragmentShader: SKY_FRAG,
      uniforms: this.skyUniforms, depthTest: false, depthWrite: false,
    }));
    this.sky.frustumCulled = false;
    this.sky.renderOrder = -1000;
    this.scene.add(this.sky);
  }

  _buildPost() {
    const dpr = this.renderer.getPixelRatio();
    this.rt = new THREE.WebGLRenderTarget(
      Math.max(2, Math.floor(innerWidth * dpr)),
      Math.max(2, Math.floor(innerHeight * dpr)),
      { type: THREE.HalfFloatType });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(
      new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
    this.postUniforms = {
      uScene: { value: this.rt.texture },
      uRes: { value: new THREE.Vector2(innerWidth, innerHeight) },
      uSpeed: { value: 0 },
      uTime: this.shared.uTime,
      uVignette: { value: 0.34 },
      uGrain: { value: 0.026 },
      uFlash: { value: 0 },
    };
    this.postScene = new THREE.Scene();
    this.postCam = new THREE.Camera();
    this.postScene.add(new THREE.Mesh(g, new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: FS_VERT, fragmentShader: POST_FRAG,
      uniforms: this.postUniforms, depthTest: false, depthWrite: false,
    })));
  }

  /** Build (or rebuild) a world and drop the team onto it. */
  async loadWorld(spec, first) {
    if (this.planet) {
      this.scene.remove(this.planet.group);
      this.planet.dispose();
    }
    this.world = spec;
    this.planet = new Planet(spec);
    this.scene.add(this.planet.group);

    for (const id of spec.props) {
      const kind = this.props[id];
      if (kind) this.planet.scatter(kind);
    }
    // One ring road plus a spur, so there is somewhere to run that reads as a
    // route rather than as open ground.
    this.planet.road([[18, -160], [26, -90], [12, -20], [-6, 40], [4, 120],
      [22, 170], [18, -160]], { width: 2.2, closed: true, tint: '#6f6250' });
    this.planet.road([[26, -90], [58, -70], [72, -10]],
      { width: 1.5, tint: '#7a6c58' });

    this.planet.bind(this.shared);
    this.minato.bind(this.shared);
    this.jaganaught.bind(this.shared);

    // Sky and ambient come from the world, so a planet change is a whole-frame
    // change rather than a new ball in the same room.
    this.skyUniforms.uZenith.value.set(spec.sky.zenith);
    this.skyUniforms.uHorizon.value.set(spec.sky.horizon);
    this.skyUniforms.uStarGain.value = spec.sky.star;
    this.shared.uSunColor.value.set(spec.sky.sun);
    this.shared.uSkyColor.value.set(spec.ambient.sky);
    this.shared.uGroundColor.value.set(spec.ambient.ground);

    if (first) {
      this.controller = new SphericalController(this.planet);
      this.rig = new CameraRig(this.camera, this.planet);
      this.follower = new SphericalController(this.planet);
    } else {
      this.controller.planet = this.planet;
      this.follower.planet = this.planet;
      this.rig.planet = this.planet;
    }
    // Spawn somewhere dry, walking outward from the intended point if it is wet.
    this._spawnDry(this.controller, 22, -70);
    this.follower.dir.copy(this.controller.dir);
    this.follower.spawnAt(...Object.values(vec3ToLatLon(this.controller.dir))
      .slice(0, 2));

    this._placeNPCs();
    this.visited.add(spec.id);
    this.steering.drive('orbit', 'panels', 4);
    this.steering.couple('orbit', 'memory', 3);
    this.record('world', `${spec.name} surveyed · ${FAB_STYLES[spec.fab].label}`);
    if (this.ui) this.ui.setWorld(spec);
    this.save();
  }

  /** Nudge a spawn until it is above the waterline. A drowned start is unplayable. */
  _spawnDry(ch, lat, lon) {
    for (let i = 0; i < 24; i++) {
      ch.spawnAt(lat + i * 6, lon + i * 11);
      if (this.planet.heightAt(ch.dir) > this.world.seaLevel + 0.15) return;
    }
  }

  /**
   * Place a handful of the Corps on the surface as NPCs.
   *
   * Only the agents whose realm holds this world, because the roster is the
   * roster: an agent stationed in Grandline has no business standing on a Sayajin
   * furnace world, and honouring that is what makes the manifest mean something.
   */
  _placeNPCs() {
    for (const n of this.npcs) this.scene.remove(n.root);
    this.npcs = [];
    const pool = AGENT_CORPS.filter((a) => a.realm === this.world.realm);
    const fab = FAB_STYLES[this.world.fab];
    const take = Math.min(5, pool.length);
    for (let i = 0; i < take; i++) {
      const agent = pool[i * 2 % pool.length];
      const root = new THREE.Group();
      // A marker post, not a figure: five more rigged bodies would be five more
      // pose solvers for something the player reads at ten metres.
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.10, 0.14, 1.8, 6),
        new THREE.MeshBasicMaterial({ color: 0x1b2430 }));
      post.position.y = 0.9;
      const lobe = LOBES.find((l) => l.id === (SKILLS.find((s) =>
        s.worlds.includes(this.world.id)) || SKILLS[0]).lobe);
      const orb = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.36, 0),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(lobe.color) }));
      orb.position.y = 2.1;
      root.add(post, orb);

      // Space them around the ring road's latitude band.
      const lat = 12 + ((i * 37) % 40) - 12;
      const lon = -170 + (i * 71) % 340;
      let dir = latLonToVec3(lat, lon, 1).normalize();
      for (let k = 0; k < 12 && this.planet.heightAt(dir) < this.world.seaLevel + 0.2; k++) {
        dir = latLonToVec3(lat + k * 7, lon + k * 13, 1).normalize();
      }
      const up = this.planet.normalAt(dir, new THREE.Vector3());
      const fwd = transportTangent(new THREE.Vector3(-dir.z, 0, dir.x).normalize(),
        up, new THREE.Vector3());
      root.position.copy(this.planet.surfacePoint(dir));
      orientOnSurface(up, fwd, root.quaternion);
      this.scene.add(root);
      this.npcs.push({
        agent, root, dir, orb,
        mission: this.world.missions[i % this.world.missions.length],
        spoken: false,
      });
    }
  }

  /* ------------------------------------------------------------- progress */

  now() {
    const d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':'
      + String(d.getMinutes()).padStart(2, '0') + ':'
      + String(d.getSeconds()).padStart(2, '0');
  }

  /**
   * Write to the ledger. The one place karma is created, so the total is always
   * the sum of visible entries and there is no hidden multiplier to find.
   */
  record(kind, what) {
    const r = KARMA_BY_KIND[kind];
    const k = r ? r.karma : 0;
    this.karma += k;
    this.ledger.push({ kind, what, karma: k, at: this.now() });
    if (this.ledger.length > 240) this.ledger.shift();
    this.steering.drive('memory', 'panels', 1.4);
    return k;
  }

  nextCloak() {
    return CLOAK_LEVELS.find((c) => c.at > this.skills.size) || null;
  }

  /** Pin a skill, apply whatever it grants, and advance the cloak if it is due. */
  grantSkill(id, why) {
    const s = SKILL_BY_ID[id];
    if (!s || this.skills.has(id)) return false;
    this.skills.add(id);
    this.record('skill', `${s.name} — ${why || s.note}`);
    this.steering.couple('skills', 'agents', 5);
    this.steering.drive('routes', 'skills', 4);
    this._applyGrants();
    this.ui && this.ui.toast('SKILL PINNED', s.name, s.note);

    // Cloak: the highest level the skill count has earned.
    const lvl = CLOAK_LEVELS.filter((c) => this.skills.size >= c.at).pop();
    if (lvl && lvl.id !== this.cloak.id) {
      this.cloak = lvl;
      this.minato.setCloak(lvl);
      this.chakra.uniforms.uTint.value.set(lvl.aura);
      this.record('cloak', `cloak advanced to ${lvl.name}`);
      // The transition: a camera punch and an impact frame, so an unlock is a
      // moment rather than a line in a list.
      this.flash = 0.85;
      this.rig.addTrauma(0.7);
      setTimeout(() => this.ui && this.ui.toast('CLOAK ADVANCED', lvl.name,
        'the verse can see it from behind'), 1500);
    }
    this.save();
    return true;
  }

  /** Recompute every derived stat from the pinned set. Never incremental. */
  _applyGrants() {
    let speed = 1, chakraRegen = 1, chakraMax = 1, wade = 1;
    for (const id of this.skills) {
      const g = SKILL_BY_ID[id] && SKILL_BY_ID[id].grant;
      if (!g) continue;
      if (g.speed) speed *= g.speed;
      if (g.sprint) speed *= g.sprint;
      if (g.chakraRegen) chakraRegen *= g.chakraRegen;
      if (g.chakraMax) chakraMax *= g.chakraMax;
      if (g.wade) wade *= g.wade;
    }
    this.controller.speedBoost = speed;
    this.grants = { speed, chakraRegen, chakraMax, wade };
  }

  /* ---------------------------------------------------------- interaction */

  interact() {
    if (this.ui && this.ui._pendingOpts) return;   // already talking
    const n = this.nearest;
    if (!n) {
      // Nothing to talk to: an observation. Mercury records it, Venus pays it.
      const { lat, lon } = vec3ToLatLon(this.controller.dir);
      this.record('observe',
        `${this.world.name} ${lat.toFixed(1)}°, ${lon.toFixed(1)}° — `
        + `${this.planet.heightAt(this.controller.dir).toFixed(2)} m relief`);
      this.steering.drive('sonar', 'memory', 3);
      this.ui && this.ui.toast('OBSERVED', 'SIGNAL RECORDED',
        `${lat.toFixed(1)}° ${lon.toFixed(1)}° · +1 karma`);
      return;
    }
    const [title, desc] = n.mission;
    const existing = this.quests.find((q) => q.title === title);
    if (existing && !existing.done) {
      this.ui.openDialogue(n, {
        text: `Still on it? ${desc} Come back when it's closed.`,
        options: [{ label: 'Understood', act: 'close' }],
      }, (o) => this._choose(n, o));
      return;
    }
    if (existing && existing.done) {
      this.ui.openDialogue(n, {
        text: `${title} is closed. The compass has it. `
          + `${FAB_STYLES[this.world.fab].label} holds on this ground — good work.`,
        options: [{ label: 'Walk on', act: 'close' }],
      }, (o) => this._choose(n, o));
      return;
    }
    this.record('talk', `${n.agent.name} consulted on ${this.world.name}`);
    this.steering.couple('agents', 'routes', 4);
    this.ui.openDialogue(n, {
      text: `${n.agent.focus}. This world builds by ${
        FAB_STYLES[this.world.fab].label.toLowerCase()} — ${
        FAB_STYLES[this.world.fab].foundation}. Charter: ${desc}`,
      options: [
        { label: 'Take the charter', act: 'accept' },
        { label: 'Not yet', act: 'close' },
      ],
    }, (o) => this._choose(n, o));
  }

  _choose(npc, opt) {
    if (opt.act === 'accept') {
      const [title, desc, kind] = npc.mission;
      const q = {
        title, desc, kind, world: this.world.name, worldId: this.world.id,
        agent: npc.agent.name, active: true, done: false, progress: 0,
        // The target is somewhere else on this world, so a charter is always a
        // reason to cross ground.
        target: this._pickTarget(),
      };
      this.quests.push(q);
      this.record('quest-open', `${title} accepted from ${npc.agent.name}`);
      this.steering.drive('routes', 'agents', 5);
      this.ui.toast('CHARTER OPEN', title, desc);
      npc.spoken = true;
      this.save();
    }
    this.ui.closeDialogue();
  }

  /** A dry point on the far side of the world from the player. */
  _pickTarget() {
    const d = this.controller.dir;
    for (let i = 0; i < 40; i++) {
      const t = new THREE.Vector3(
        Math.sin(i * 2.399) * 0.9 - d.x * 0.7,
        Math.cos(i * 1.71) * 0.7 - d.y * 0.5,
        Math.sin(i * 3.11 + 1) * 0.9 - d.z * 0.7).normalize();
      if (this.planet.heightAt(t) > this.world.seaLevel + 0.3
        && t.dot(d) < 0.35) return t;
    }
    return new THREE.Vector3().copy(d).negate();
  }

  /** Charters close by arrival. Simple, legible, and it makes the world the task. */
  _tickQuests(dt) {
    for (const q of this.quests) {
      if (q.done || !q.active) continue;
      const d = this.controller.dir.distanceTo(q.target) * this.planet.radius;
      q.progress = clamp01(1 - d / (this.planet.radius * 1.6));
      if (d < 7) {
        q.done = true; q.active = false;
        this.record('quest-done', `${q.title} delivered on ${q.world}`);
        this.steering.couple('agents', 'memory', 6);
        this.ui.toast('CHARTER CLOSED', q.title, 'the compass is listening');
        // The reward: a skill this world can actually teach.
        const candidates = SKILLS.filter((s) =>
          s.worlds.includes(q.worldId) && !this.skills.has(s.id));
        if (candidates.length) {
          setTimeout(() => this.grantSkill(candidates[0].id,
            `earned by closing ${q.title}`), 900);
        }
        this.save();
      }
    }
  }

  steerAction(act) {
    const st = this.steering;
    let msg = '';
    if (act === 'reroute') msg = st.reroute();
    else if (act === 'ablate') msg = st.ablate();
    else if (act === 'steer') msg = st.steer();
    else if (act === 'gate') {
      this.record('gate', 'human gate requested before a non-reversible step');
      this.ui.toast('HUMAN GATE', 'NEPTUNE', 'nothing proceeds without a person');
      return;
    }
    if (msg) {
      this.record('steer', msg);
      this.ui.toast('STEERED', msg.toUpperCase(), this.steering.pathology.label);
    }
  }

  warp() {
    this.worldIndex = (this.worldIndex + 1) % WORLDS.length;
    const w = WORLDS[this.worldIndex];
    this.flash = 0.9;
    this.loadWorld(w, false);
    this.ui.toast('WARP', w.name, `${w.sub.toLowerCase()} · ${FAB_STYLES[w.fab].label}`);
  }

  /* ------------------------------------------------------------ persistence */

  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        karma: this.karma,
        skills: [...this.skills],
        visited: [...this.visited],
        quests: this.quests.map((q) => ({ ...q, target: null })),
        ledger: this.ledger.slice(-120),
        worldIndex: this.worldIndex,
      }));
    } catch (e) { /* private mode; the run is still playable */ }
  }

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      this.karma = d.karma || 0;
      this.skills = new Set(d.skills || []);
      this.visited = new Set(d.visited || []);
      this.ledger = d.ledger || [];
      // Quests are dropped rather than restored: their target is a live vector on
      // a planet that has not been built yet, and a charter you cannot walk to is
      // worse than one you have to take again.
      this.quests = [];
      if (typeof d.worldIndex === 'number') this.worldIndex = d.worldIndex;
      const lvl = CLOAK_LEVELS.filter((c) => this.skills.size >= c.at).pop();
      if (lvl) this.cloak = lvl;
    } catch (e) { /* corrupt save; start clean rather than refuse to boot */ }
  }

  /* ------------------------------------------------------------------ input */

  _wireInput() {
    this.keys = new Set();
    this.move = { x: 0, y: 0 };
    this.sprintKey = false;
    this.pointerLocked = false;

    addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) {
        e.preventDefault();
      }
      this.keys.add(k);
      if (k === 'e') this.interact();
      if (k === 'm') this.ui.toggle();
      if (k === 't') this.warp();
      if (k === 'p') this.toggleAutonomy();
      if (k === 'escape') { this.ui.closeDialogue(); this.ui.toggle(false); }
    });
    addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    addEventListener('blur', () => this.keys.clear());

    this.canvas.addEventListener('click', () => {
      if (!this.pointerLocked) this.canvas.requestPointerLock();
    });
    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
    });
    addEventListener('mousemove', (e) => {
      if (!this.pointerLocked) return;
      this.rig.look(e.movementX * 0.0026, e.movementY * 0.0020);
      // Taking the controls parks the pilot: real intent beats autonomy.
      if (this.autonomy && (Math.abs(e.movementX) + Math.abs(e.movementY)) > 6) {
        this.suspend = 6;
      }
    });

    // Touch: a virtual stick and a sprint pad. Detected by capability rather than
    // by user-agent, because a laptop with a touchscreen is not a phone.
    if (matchMedia('(pointer:coarse)').matches) {
      document.body.classList.add('touch');
      this._wireStick();
    }
  }

  _wireStick() {
    const stick = $('#stick'), nub = $('#stickNub');
    let active = false, cx = 0, cy = 0;
    const R = 46;
    const set = (dx, dy) => {
      const l = Math.hypot(dx, dy) || 1;
      const c = Math.min(l, R);
      const nx = (dx / l) * c, ny = (dy / l) * c;
      nub.style.transform = `translate(${nx}px,${ny}px)`;
      this.move.x = nx / R;
      this.move.y = -ny / R;
    };
    stick.addEventListener('pointerdown', (e) => {
      active = true;
      const r = stick.getBoundingClientRect();
      cx = r.left + r.width / 2; cy = r.top + r.height / 2;
      set(e.clientX - cx, e.clientY - cy);
      stick.setPointerCapture(e.pointerId);
    });
    stick.addEventListener('pointermove', (e) => {
      if (active) set(e.clientX - cx, e.clientY - cy);
    });
    const end = () => {
      active = false; nub.style.transform = 'translate(0,0)';
      this.move.x = 0; this.move.y = 0;
    };
    stick.addEventListener('pointerup', end);
    stick.addEventListener('pointercancel', end);
    // Drag anywhere on the right of the screen to look.
    let lx = 0, ly = 0, looking = false;
    this.canvas.addEventListener('pointerdown', (e) => {
      looking = true; lx = e.clientX; ly = e.clientY;
    });
    this.canvas.addEventListener('pointermove', (e) => {
      if (!looking) return;
      this.rig.look((e.clientX - lx) * 0.006, (e.clientY - ly) * 0.005);
      lx = e.clientX; ly = e.clientY;
    });
    this.canvas.addEventListener('pointerup', () => { looking = false; });
    const sb = $('#sprintBtn');
    sb.addEventListener('pointerdown', () => { this.sprintKey = true; });
    sb.addEventListener('pointerup', () => { this.sprintKey = false; });
    sb.addEventListener('pointercancel', () => { this.sprintKey = false; });
  }

  _wireRail() {
    $('#btnWarp').addEventListener('click', () => this.warp());
    $('#btnAuto').addEventListener('click', () => this.toggleAutonomy());
    $('#btnEmote').addEventListener('click', () => this.interact());
  }

  toggleAutonomy() {
    this.autonomy = !this.autonomy;
    $('#btnAuto').classList.toggle('on', this.autonomy);
    this.ui.toast(this.autonomy ? 'AUTONOMY ENGAGED' : 'AUTONOMY STOOD DOWN',
      this.autonomy ? 'JAGANAUGHT HAS THE CONTROLS' : 'YOU HAVE THE CONTROLS',
      this.autonomy ? 'it walks the charter · any input parks it' : '');
    this.steering.drive('agents', 'orbit', 4);
  }

  /* -------------------------------------------------------------- the loop */

  /**
   * The pilot. It fills in the same move struct a thumb fills in, so the gait,
   * the cloak, the chakra and the camera are all still being driven by
   * locomotion — none of them know the hands on the controls are not human.
   */
  _pilot(dt) {
    if (this.suspend > 0) { this.suspend -= dt; return false; }
    const open = this.quests.find((q) => q.active && !q.done);
    let target = open ? open.target : null;
    if (!target) {
      // Nothing open: walk to the nearest agent that has not been spoken to.
      const n = this.npcs.find((x) => !x.spoken) || this.npcs[0];
      target = n ? n.dir : null;
    }
    if (!target) return false;
    const ch = this.controller;
    // Steer along the great circle toward the target, expressed in the camera
    // basis the controller expects.
    const to = new THREE.Vector3().copy(target)
      .addScaledVector(ch.dir, -target.dot(ch.dir));
    if (to.lengthSq() < 1e-8) return false;
    to.normalize();
    const f = transportTangent(this.rig.forward.clone(), ch.up, new THREE.Vector3());
    const r = new THREE.Vector3().crossVectors(ch.up, f).normalize().negate();
    this.move.x = clamp(to.dot(r), -1, 1);
    this.move.y = clamp(to.dot(f), -1, 1);
    const arc = Math.acos(clamp(ch.dir.dot(target), -1, 1)) * this.planet.radius;
    this.sprintKey = arc > 46 && ch.chakra > 0.35;
    // The pilot also turns the camera, or an autonomous walk never faces where it
    // is going and the whole thing reads as a slide.
    this.rig.orbit = expDamp(this.rig.orbit, 0, 2.2, dt);
    return true;
  }

  frame(dt) {
    this._t += dt;
    this.shared.uTime.value = this._t;

    // ---- intent -----------------------------------------------------------
    if (this.autonomy) this._pilot(dt);
    else if (!matchMedia('(pointer:coarse)').matches) {
      const k = this.keys;
      this.move.x = (k.has('d') || k.has('arrowright') ? 1 : 0)
        - (k.has('a') || k.has('arrowleft') ? 1 : 0);
      this.move.y = (k.has('w') || k.has('arrowup') ? 1 : 0)
        - (k.has('s') || k.has('arrowdown') ? 1 : 0);
      this.sprintKey = k.has('shift') || k.has(' ');
    }

    // ---- simulate ---------------------------------------------------------
    this.controller.update(dt, this.move, this.rig, this.sprintKey);
    this.rig.update(dt, this.controller);
    this._followerStep(dt);

    this.minato.root.position.copy(this.controller.position);
    this.minato.root.quaternion.copy(this.controller.quaternion);
    this.minato.update(dt, this.controller);
    this.jaganaught.root.position.copy(this.follower.position);
    this.jaganaught.root.quaternion.copy(this.follower.quaternion);
    this.jaganaught.update(dt, this.follower);

    this._emitChakra(dt);
    this.chakra.update(dt, this.planet);
    this._proximity();
    this._tickQuests(dt);
    this.steering.update(dt);

    // ---- present ----------------------------------------------------------
    this.shared.uCamPos.value.copy(this.camera.position);
    this.camera.updateMatrixWorld();
    this.skyUniforms.uInvVP.value
      .multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse)
      .invert();
    // Speed drives the whole post chain from one number.
    const sp = this.controller.speed01 * (this.controller.sprinting ? 1 : 0.35);
    this.postUniforms.uSpeed.value = expDamp(
      this.postUniforms.uSpeed.value, sp, 6, dt);
    this.flash = Math.max(0, this.flash - dt * 2.4);
    this.postUniforms.uFlash.value = this.flash * 0.55;

    this.renderer.setRenderTarget(this.rt);
    this.renderer.clear(true, true, false);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
    this.renderer.clear(true, true, false);
    this.renderer.render(this.postScene, this.postCam);

    this.ui.fast(dt, this);
  }

  /**
   * The companion. It runs the same controller as the player — same gait, same
   * wading, same surface — aimed at a standoff point behind and to one side.
   * Giving it a bespoke follow would have meant a second locomotion model that
   * looked wrong next to the first.
   */
  _followerStep(dt) {
    const ch = this.controller, fo = this.follower;
    const stand = 3.4;
    const back = new THREE.Vector3().copy(ch.heading).negate();
    const side = new THREE.Vector3().crossVectors(ch.up, ch.heading).normalize();
    const want = new THREE.Vector3().copy(ch.dir)
      .addScaledVector(back, stand / this.planet.radius)
      .addScaledVector(side, (stand * 0.45) / this.planet.radius)
      .normalize();
    const to = new THREE.Vector3().copy(want)
      .addScaledVector(fo.dir, -want.dot(fo.dir));
    const arc = Math.acos(clamp(fo.dir.dot(want), -1, 1)) * this.planet.radius;
    const mv = { x: 0, y: 0 };
    if (to.lengthSq() > 1e-9 && arc > 0.5) {
      to.normalize();
      const f = transportTangent(this.rig.forward.clone(), fo.up, new THREE.Vector3());
      const r = new THREE.Vector3().crossVectors(fo.up, f).normalize().negate();
      const gain = clamp(arc / 5, 0, 1);
      mv.x = clamp(to.dot(r), -1, 1) * gain;
      mv.y = clamp(to.dot(f), -1, 1) * gain;
    }
    fo.update(dt, mv, this.rig, arc > 16);
  }

  _emitChakra(dt) {
    const ch = this.controller;
    const lvl = this.cloak;
    // The aura only exists once the cloak has earned it, so the trail is a
    // readout of progress rather than a constant.
    const gain = lvl.auraGain * (ch.sprinting ? 1 : 0.22) * ch.speed01;
    if (gain < 0.02) return;
    this._chakraOwed = (this._chakraOwed || 0) + gain * dt * 220;
    let n = Math.floor(this._chakraOwed);
    if (n <= 0) return;
    this._chakraOwed -= n;
    n = Math.min(n, 14);
    const p = new THREE.Vector3(), v = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      // From the feet and the trailing hem, thrown backward and up.
      p.copy(ch.position)
        .addScaledVector(ch.up, 0.15 + Math.random() * 1.2)
        .addScaledVector(ch.heading, -0.2 - Math.random() * 0.7);
      const side = new THREE.Vector3().crossVectors(ch.up, ch.heading);
      p.addScaledVector(side, (Math.random() - 0.5) * 0.7);
      v.copy(ch.heading).multiplyScalar(-1.6 - Math.random() * 2.4)
        .addScaledVector(ch.up, 0.6 + Math.random() * 2.0)
        .addScaledVector(side, (Math.random() - 0.5) * 2.2);
      this.chakra.emit(p, v, 0.42 + Math.random() * 0.5);
    }
    if (ch.sprinting) this.rig.addTrauma(dt * 0.24);
  }

  /** Nearest NPC inside talking range, and the prompt that goes with it. */
  _proximity() {
    let best = null, bestD = 8.5;
    for (const n of this.npcs) {
      const d = this.controller.position.distanceTo(n.root.position);
      if (d < bestD) { bestD = d; best = n; }
      // The orb bobs and spins, which is the only thing that makes a marker post
      // read as somebody standing there.
      n.orb.rotation.y += 0.9 * (1 / 60);
      n.orb.position.y = 2.1 + Math.sin(this._t * 1.6 + n.dir.x * 4) * 0.14;
    }
    this.nearest = best;
    if (!this.ui) return;
    if (best) {
      const q = this.quests.find((x) => x.title === best.mission[0]);
      this.ui.showPrompt(`talk to ${best.agent.name}`
        + (q ? (q.done ? ' · closed' : ' · open') : ''));
    } else {
      const open = this.quests.find((x) => x.active && !x.done);
      this.ui.showPrompt(open ? `observe · ${open.title} open` : 'observe');
    }
  }

  resize() {
    const w = innerWidth, h = innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    const dpr = this.renderer.getPixelRatio();
    this.rt.setSize(Math.max(2, Math.floor(w * dpr)), Math.max(2, Math.floor(h * dpr)));
    this.postUniforms.uRes.value.set(w, h);
  }
}

/* -------------------------------------------------------------------- boot */

const BOOT_STEPS = [
  'Loading KLM kernel…',
  'Compiling cel + scratch shaders…',
  'Displacing the surface…',
  'Building the accelerated raycast tree…',
  'Rigging the Hokage cloak…',
  'Mustering the Agent Corps…',
  'Opening the coupling field…',
  'Dispatch ready.',
];

async function main() {
  const bar = $('#bootBar'), msg = $('#bootMsg'), enter = $('#enterBtn');
  const step = (i) => {
    msg.textContent = BOOT_STEPS[Math.min(i, BOOT_STEPS.length - 1)];
    bar.style.width = ((i + 1) / BOOT_STEPS.length * 100).toFixed(0) + '%';
  };
  step(0);
  // A frame between steps so the bar actually paints — a synchronous boot shows
  // one frame at 0% and one at 100%, which is not a loading screen.
  const yield_ = () => new Promise((r) => requestAnimationFrame(() => r()));
  await yield_();

  let game;
  try {
    game = new Game($('#view'));
    step(1); await yield_();
    step(2); await yield_();
    await game.init();
    step(4); await yield_();
    step(6); await yield_();
    step(7);
  } catch (err) {
    console.error(err);
    msg.textContent = 'Boot failed — see the console.';
    return;
  }

  enter.classList.add('ready');
  let entered = false;
  const go = () => {
    if (entered) return;
    entered = true;
    $('#boot').classList.add('off');
    game.ui.toast('MONITOR OPEN', game.world.name,
      `${game.world.sub.toLowerCase()} · WASD · SHIFT run · E talk · M monitor · T warp`);
  };
  enter.addEventListener('click', go);
  // Enter on its own after a beat, so nobody is stranded on the boot screen.
  setTimeout(go, 4200);

  addEventListener('resize', () => game.resize());
  globalThis.KLM = game;

  let prev = performance.now();
  const loop = (now) => {
    const dt = Math.min((now - prev) / 1000, 1 / 20);
    prev = now;
    try { game.frame(dt); } catch (e) { console.error(e); }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

main();
