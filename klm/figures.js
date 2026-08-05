/* =========================================================================
 * The two figures.
 *
 * Both are procedural. No glTF, no rig, no animation data — which is a real
 * constraint and buys one specific thing: the cloak can be a live surface that
 * responds to speed and to the skill level, and the armour can change livery,
 * without shipping a variant mesh for every state.
 *
 * The cloak is the reason this file exists. It is the visible record of the
 * player's journey, it is the view the camera spends the whole game looking at,
 * and it is what makes Minato read as Minato from behind at forty pixels tall.
 * ========================================================================= */
import * as THREE from 'three';
import { clamp, clamp01, mix, expDamp } from './math.js';
import { CLOAK_VERT, CLOAK_FRAG, PROP_VERT, PROP_FRAG } from './shaders.js';

/** One instanced-prop material per part, so every figure gets the same cel ramp. */
function partMaterial(colorHex) {
  const c = new THREE.Color(colorHex);
  return { color: c };
}

/**
 * A body part. Built as a plain indexed geometry with the instanced attributes
 * the prop shader expects, all set to identity — the part is positioned by its
 * parent Object3D, and reusing the prop shader means a boot, a building and a
 * moon all shade identically.
 */
function makePart(geo, colorHex) {
  const c = new THREE.Color(colorHex);
  geo.setAttribute('aOffset',
    new THREE.InstancedBufferAttribute(new Float32Array([0, 0, 0]), 3));
  geo.setAttribute('aQuat',
    new THREE.InstancedBufferAttribute(new Float32Array([0, 0, 0, 1]), 4));
  geo.setAttribute('aScale',
    new THREE.InstancedBufferAttribute(new Float32Array([1, 1, 1]), 3));
  geo.setAttribute('aTint',
    new THREE.InstancedBufferAttribute(new Float32Array([c.r, c.g, c.b]), 3));
  const mat = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: PROP_VERT,
    fragmentShader: PROP_FRAG,
    uniforms: {},
  });
  const m = new THREE.Mesh(geo, mat);
  m.frustumCulled = false;
  return m;
}

/* =========================================================================
 * MINATO
 * ========================================================================= */
export class Minato {
  constructor() {
    this.root = new THREE.Group();
    this.root.name = 'Minato';
    this.materials = [];
    this.cloakLevel = null;
    this._t = 0;
    this._build();
  }

  _add(parent, geo, color, pos, rot, scale) {
    const m = makePart(geo, color);
    if (pos) m.position.set(pos[0], pos[1], pos[2]);
    if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
    if (scale) m.scale.set(scale[0], scale[1], scale[2]);
    parent.add(m);
    this.materials.push(m.material);
    return m;
  }

  _build() {
    const SKIN = '#e8b98f', FLAK = '#2f6f52', NAVY = '#1f3550';
    const HAIR = '#f2c531', STEEL = '#8f9aa6', DARK = '#141b24';

    // The rig. Three joints is all a 40-pixel figure needs, and the fourth would
    // cost a solver.
    this.hips = new THREE.Group();
    this.hips.position.y = 0.92;
    this.root.add(this.hips);
    this.chest = new THREE.Group();
    this.chest.position.y = 0.30;
    this.hips.add(this.chest);
    this.head = new THREE.Group();
    this.head.position.y = 0.42;
    this.chest.add(this.head);

    // Torso: the flak jacket, boxier than the body under it.
    this._add(this.chest, new THREE.BoxGeometry(0.52, 0.56, 0.30, 1, 1, 1), FLAK,
      [0, 0.04, 0]);
    this._add(this.chest, new THREE.BoxGeometry(0.44, 0.20, 0.26), NAVY, [0, -0.26, 0]);
    // Collar
    this._add(this.chest, new THREE.BoxGeometry(0.40, 0.10, 0.26), FLAK, [0, 0.34, 0]);

    // Head: a slightly tall box reads better than a sphere under a cel ramp,
    // because a sphere's terminator wraps and a box's does not.
    this._add(this.head, new THREE.BoxGeometry(0.30, 0.34, 0.28), SKIN);
    // Headband: the plate is the silhouette cue, so it is deliberately oversized.
    this._add(this.head, new THREE.BoxGeometry(0.33, 0.09, 0.30), DARK, [0, 0.14, 0]);
    this._add(this.head, new THREE.BoxGeometry(0.15, 0.07, 0.02), STEEL, [0, 0.14, 0.16]);

    // Hair. Spikes placed on a ring and fanned outward — the one feature that has
    // to be right or the figure is not Minato at any distance.
    const hairGroup = new THREE.Group();
    this.head.add(hairGroup);
    for (let i = 0; i < 11; i++) {
      const a = (i / 11) * Math.PI * 2;
      const back = Math.cos(a) < 0 ? 1.35 : 1.0;   // longer at the back
      const len = (0.20 + (i % 3) * 0.07) * back;
      const spike = new THREE.ConeGeometry(0.055, len, 4);
      const m = makePart(spike, HAIR);
      m.position.set(Math.sin(a) * 0.13, 0.19, Math.cos(a) * 0.12);
      // Lean each spike out and back, which is what makes it read as hair rather
      // than as a crown of thorns.
      m.rotation.set(-Math.cos(a) * 0.75, a, Math.sin(a) * 0.55);
      hairGroup.add(m);
      this.materials.push(m.material);
    }
    // Two long fringe strands at the front.
    for (const s of [-1, 1]) {
      const g = new THREE.ConeGeometry(0.05, 0.40, 4);
      const m = makePart(g, HAIR);
      m.position.set(s * 0.13, 0.03, 0.13);
      m.rotation.set(0.30, 0, s * 0.16);
      hairGroup.add(m);
      this.materials.push(m.material);
    }

    // Arms and legs. Kept as single segments and posed by rotation only: a
    // two-bone IK on a figure this size is detail nobody can see.
    this.armL = new THREE.Group(); this.armL.position.set(-0.30, 0.22, 0);
    this.armR = new THREE.Group(); this.armR.position.set(0.30, 0.22, 0);
    this.chest.add(this.armL, this.armR);
    for (const arm of [this.armL, this.armR]) {
      this._add(arm, new THREE.BoxGeometry(0.13, 0.44, 0.14), NAVY, [0, -0.22, 0]);
      this._add(arm, new THREE.BoxGeometry(0.14, 0.12, 0.15), SKIN, [0, -0.50, 0]);
    }
    this.legL = new THREE.Group(); this.legL.position.set(-0.13, 0, 0);
    this.legR = new THREE.Group(); this.legR.position.set(0.13, 0, 0);
    this.hips.add(this.legL, this.legR);
    for (const leg of [this.legL, this.legR]) {
      this._add(leg, new THREE.BoxGeometry(0.16, 0.52, 0.17), NAVY, [0, -0.28, 0]);
      this._add(leg, new THREE.BoxGeometry(0.17, 0.12, 0.24), DARK, [0, -0.58, 0.03]);
    }

    this._buildCloak();
  }

  /**
   * The Hokage cloak.
   *
   * A lofted skirt: a ring of rows from collar to hem, flaring as it falls, with
   * the UV laid out so v runs 1 at the collar to 0 at the hem — which is what
   * lets the fragment shader put the flame band at the bottom without knowing
   * anything about the geometry.
   *
   * It is simulated as a lag chain rather than a cloth solver. Each row carries a
   * horizontal offset that trails the row above it, so the whole cloak sweeps
   * behind the runner and settles when they stop. A Verlet solver would look
   * marginally better and would need constraint iterations, collision against the
   * body, and a fixed timestep; a lag chain is four lines and never explodes.
   */
  _buildCloak() {
    const ROWS = 11, SEG = 20;
    this.cloakRows = ROWS;
    this.cloakSeg = SEG;
    const pos = [], nrm = [], uv = [], idx = [];
    this._cloakRest = [];

    for (let r = 0; r < ROWS; r++) {
      const v = r / (ROWS - 1);            // 0 collar -> 1 hem
      const y = 0.42 - v * 1.32;
      // Flare: opens out low, so the cloak is a bell rather than a cone. The
      // exponent under 1 is what puts the widening in the upper half.
      const rad = 0.30 + Math.pow(v, 0.72) * 0.44;
      for (let s = 0; s <= SEG; s++) {
        const a = (s / SEG) * Math.PI * 2;
        // Open at the front: the cloak is a mantle, not a tube, so the front
        // eighth is pinched inward rather than closed across the chest.
        const front = Math.max(0, Math.cos(a));
        const pinch = 1 - front * front * 0.55;
        const x = Math.sin(a) * rad * pinch;
        const z = Math.cos(a) * rad * pinch;
        pos.push(x, y, z);
        nrm.push(Math.sin(a), 0.22, Math.cos(a));
        uv.push(s / SEG, 1 - v);
        this._cloakRest.push(x, y, z);
      }
    }
    for (let r = 0; r < ROWS - 1; r++) {
      for (let s = 0; s < SEG; s++) {
        const a = r * (SEG + 1) + s, b = a + SEG + 1;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }

    const g = new THREE.BufferGeometry();
    this._cloakPos = new Float32Array(pos);
    g.setAttribute('position', new THREE.BufferAttribute(this._cloakPos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();

    this.cloakUniforms = {
      uCloth: { value: new THREE.Color('#f4f1ea') },
      uFlame: { value: new THREE.Color('#c0342b') },
      uFlameRise: { value: 0.30 },
      uKanji: { value: 1 },
    };
    this.cloakMaterial = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: CLOAK_VERT,
      fragmentShader: CLOAK_FRAG,
      uniforms: this.cloakUniforms,
      side: THREE.DoubleSide,
    });
    this.cloak = new THREE.Mesh(g, this.cloakMaterial);
    this.cloak.frustumCulled = false;
    this.cloak.name = 'HokageCloak';
    this.chest.add(this.cloak);
    this.materials.push(this.cloakMaterial);
    // Per-row lag state, in the figure's local frame.
    this._lag = new Float32Array(ROWS * 2);
  }

  /** Apply a cloak level from the CLOAK_LEVELS table. */
  setCloak(level) {
    this.cloakLevel = level;
    this.cloakUniforms.uCloth.value.set(level.cloth);
    this.cloakUniforms.uFlame.value.set(level.flame);
    this.cloakUniforms.uFlameRise.value = level.rise;
    this.cloakUniforms.uKanji.value = level.kanji;
  }

  bind(shared) {
    for (const m of this.materials) {
      Object.assign(m.uniforms, shared);
      m.needsUpdate = true;
    }
  }

  /**
   * Pose from the controller. Everything is driven by gait phase and speed —
   * there is no clip to blend, so there is nothing to desynchronise.
   */
  update(dt, ch) {
    this._t += dt;
    const sp = ch.speed01;
    const ph = ch.gaitPhase * Math.PI * 2;
    const stride = mix(0.35, 1.15, sp);

    // Legs swing in antiphase; the amplitude is the stride.
    this.legL.rotation.x = Math.sin(ph) * stride;
    this.legR.rotation.x = Math.sin(ph + Math.PI) * stride;
    // Arms counter-swing, and pin back at a sprint — the Kurama run silhouette.
    const armBack = ch.sprinting ? -1.15 : 0;
    this.armL.rotation.x = Math.sin(ph + Math.PI) * stride * 0.75 + armBack;
    this.armR.rotation.x = Math.sin(ph) * stride * 0.75 + armBack;
    this.armL.rotation.z = mix(0.08, 0.42, sp);
    this.armR.rotation.z = -mix(0.08, 0.42, sp);

    // The body pitches into the run and bobs on the stride.
    this.chest.rotation.x = mix(0, 0.44, sp);
    this.hips.position.y = 0.92 + Math.abs(Math.sin(ph)) * mix(0.02, 0.10, sp)
      - mix(0, 0.10, sp);
    this.hips.rotation.z = ch.lean * 0.22;
    // The head stays level far more than the chest it sits on.
    this.head.rotation.x = -this.chest.rotation.x * 0.72;

    this._poseCloak(dt, ch);
  }

  /**
   * The lag chain. Each row's horizontal offset chases the row above it, with the
   * target driven by speed — so the cloak streams straight back at a sprint,
   * hangs at a stop, and passes through every shape between on its own.
   */
  _poseCloak(dt, ch) {
    const ROWS = this.cloakRows, SEG = this.cloakSeg;
    const sp = ch.speed01;
    // How far back the hem is thrown, in local metres.
    const throwBack = mix(0.02, 0.95, sp) + (ch.sprinting ? 0.30 : 0);
    const lift = mix(0.0, 0.42, sp);
    const flutter = mix(0.006, 0.055, sp);
    const k = 1 - Math.exp(-mix(7, 15, sp) * Math.min(dt, 1 / 30));

    const rest = this._cloakRest, out = this._cloakPos;
    for (let r = 0; r < ROWS; r++) {
      const v = r / (ROWS - 1);
      // Rows near the collar barely move: they are pinned by the shoulders.
      const w = Math.pow(v, 1.6);
      const wantZ = -throwBack * w;
      const wantY = lift * w;
      this._lag[r * 2] += (wantZ - this._lag[r * 2]) * k;
      this._lag[r * 2 + 1] += (wantY - this._lag[r * 2 + 1]) * k;
      const dz = this._lag[r * 2], dy = this._lag[r * 2 + 1];
      for (let s = 0; s <= SEG; s++) {
        const i = (r * (SEG + 1) + s) * 3;
        // Flutter: a travelling wave along the hem, phase-shifted per row so the
        // fabric ripples rather than pulsing as one sheet.
        const f = Math.sin(this._t * mix(3, 11, sp) + s * 0.7 - r * 0.5) * flutter * w;
        out[i] = rest[i] + f * 0.5;
        out[i + 1] = rest[i + 1] + dy + f;
        out[i + 2] = rest[i + 2] + dz;
      }
    }
    this.cloak.geometry.attributes.position.needsUpdate = true;
    // Normals are not recomputed: at this size the cel ramp is quantised far
    // coarser than the error, and computeVertexNormals every frame on 231
    // vertices is real cost for no visible return.
  }
}

/* =========================================================================
 * JAGANAUGHT — the agentic companion.
 *
 * Bulk is the whole read: it has to be twice Minato's mass at a glance, because
 * it is the thing that can take over. Violet ceramite with aurum trim, from the
 * reference plates.
 * ========================================================================= */
export class Jaganaught {
  constructor() {
    this.root = new THREE.Group();
    this.root.name = 'Jaganaught';
    this.materials = [];
    this.scale = 1.42;
    this._t = 0;
    this._build();
    this.root.scale.setScalar(this.scale);
  }

  _add(parent, geo, color, pos, rot) {
    const m = makePart(geo, color);
    if (pos) m.position.set(pos[0], pos[1], pos[2]);
    if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
    parent.add(m);
    this.materials.push(m.material);
    return m;
  }

  _build() {
    const CERAMITE = '#6b3fa8', AURUM = '#d9a441', DARK = '#1a1526';
    const CORE = '#7ff0ff';

    this.hips = new THREE.Group();
    this.hips.position.y = 1.05;
    this.root.add(this.hips);
    this.chest = new THREE.Group();
    this.chest.position.y = 0.34;
    this.hips.add(this.chest);

    // Plastron: widest at the upper chest, pinched at the waist.
    this._add(this.chest, new THREE.BoxGeometry(0.78, 0.62, 0.44), CERAMITE, [0, 0.06, 0]);
    this._add(this.chest, new THREE.BoxGeometry(0.62, 0.18, 0.40), DARK, [0, -0.30, 0]);
    // The reactor. Recessed, so the plate rim occludes it at grazing angles.
    this.core = this._add(this.chest, new THREE.CylinderGeometry(0.11, 0.11, 0.06, 10),
      CORE, [0, 0.06, 0.23], [Math.PI / 2, 0, 0]);
    // Gorget + helm
    this._add(this.chest, new THREE.BoxGeometry(0.40, 0.12, 0.34), AURUM, [0, 0.40, 0]);
    this.head = new THREE.Group();
    this.head.position.y = 0.56;
    this.chest.add(this.head);
    this._add(this.head, new THREE.BoxGeometry(0.34, 0.30, 0.36), CERAMITE);
    this._add(this.head, new THREE.BoxGeometry(0.30, 0.06, 0.03), CORE, [0, 0.02, 0.19]);
    // Helm crest — the silhouette cue that separates it from a crate.
    this._add(this.head, new THREE.ConeGeometry(0.06, 0.26, 4), AURUM,
      [0, 0.24, 0.02], [0.2, 0, 0]);
    // Pauldrons with studs.
    for (const s of [-1, 1]) {
      this._add(this.chest, new THREE.SphereGeometry(0.26, 8, 6), CERAMITE,
        [s * 0.48, 0.22, 0]);
      this._add(this.chest, new THREE.ConeGeometry(0.07, 0.20, 4), AURUM,
        [s * 0.52, 0.44, 0], [0, 0, -s * 0.4]);
    }
    // Arms
    this.armL = new THREE.Group(); this.armL.position.set(-0.50, 0.10, 0);
    this.armR = new THREE.Group(); this.armR.position.set(0.50, 0.10, 0);
    this.chest.add(this.armL, this.armR);
    for (const arm of [this.armL, this.armR]) {
      this._add(arm, new THREE.BoxGeometry(0.20, 0.46, 0.22), CERAMITE, [0, -0.24, 0]);
      this._add(arm, new THREE.BoxGeometry(0.22, 0.16, 0.24), AURUM, [0, -0.52, 0]);
    }
    // Legs
    this.legL = new THREE.Group(); this.legL.position.set(-0.20, 0, 0);
    this.legR = new THREE.Group(); this.legR.position.set(0.20, 0, 0);
    this.hips.add(this.legL, this.legR);
    for (const leg of [this.legL, this.legR]) {
      this._add(leg, new THREE.BoxGeometry(0.24, 0.56, 0.26), CERAMITE, [0, -0.30, 0]);
      this._add(leg, new THREE.BoxGeometry(0.26, 0.14, 0.34), DARK, [0, -0.62, 0.04]);
    }
    // Tabard: a rigid skirt off the hips, not cloth — the player already carries
    // the only cloth in the scene and a second solver would be for nothing.
    this._add(this.hips, new THREE.BoxGeometry(0.52, 0.44, 0.10), AURUM, [0, -0.24, 0.20]);
  }

  bind(shared) {
    for (const m of this.materials) {
      Object.assign(m.uniforms, shared);
      m.needsUpdate = true;
    }
  }

  update(dt, follower) {
    this._t += dt;
    const sp = follower.speed01;
    const ph = follower.gaitPhase * Math.PI * 2;
    const stride = mix(0.28, 0.92, sp);
    this.legL.rotation.x = Math.sin(ph) * stride;
    this.legR.rotation.x = Math.sin(ph + Math.PI) * stride;
    this.armL.rotation.x = Math.sin(ph + Math.PI) * stride * 0.5;
    this.armR.rotation.x = Math.sin(ph) * stride * 0.5;
    this.chest.rotation.x = mix(0, 0.28, sp);
    this.hips.position.y = 1.05 + Math.abs(Math.sin(ph)) * mix(0.015, 0.07, sp);
    // The core throbs on idle and brightens with speed, so the companion reads as
    // powered even when it is standing still.
    const throb = 0.8 + 0.2 * Math.sin(this._t * 1.9);
    this.core.scale.setScalar(throb * (1 + sp * 0.18));
  }
}
