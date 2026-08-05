/* =========================================================================
 * Walking a small planet, and looking at someone who is.
 *
 * Position is stored as a UNIT DIRECTION from the planet centre plus a height
 * above the relief — never as a world vector. That one choice removes every
 * accumulating-drift bug this kind of movement is prone to: the walker cannot
 * sink into the planet or float off it, because "on the surface" is not a
 * condition being maintained, it is the coordinate system.
 *
 * Heading is stored as a TANGENT VECTOR and parallel-transported, never as a yaw
 * angle. A yaw needs a reference frame to be an angle in, every choice of frame
 * has a singularity somewhere on the sphere, and the walker will find it.
 * ========================================================================= */
import * as THREE from 'three';
import {
  clamp, clamp01, mix, expDamp, transportTangent, orientOnSurface, smooth01,
} from './math.js';

const WALK = 3.2, RUN = 6.4, SPRINT = 13.0;
const ACCEL = 22, DECEL = 26;
const EYE = 1.5;
/** Stride length in metres, so the gait is driven by distance and feet plant. */
const STRIDE = 1.62;

export class SphericalController {
  constructor(planet) {
    this.planet = planet;
    /** Unit direction from planet centre. The authoritative position. */
    this.dir = new THREE.Vector3(0, 1, 0);
    /** Metres above the relief surface. Zero while grounded. */
    this.lift = 0;
    /** Unit tangent, the way the body is facing. */
    this.heading = new THREE.Vector3(1, 0, 0);
    /** Surface normal, smoothed — the raw one is noisy enough to jitter the model. */
    this.up = new THREE.Vector3(0, 1, 0);
    this.rawUp = new THREE.Vector3(0, 1, 0);

    this.speed = 0;
    this.speed01 = 0;
    this.velTangent = new THREE.Vector3();
    this.position = new THREE.Vector3();
    this.quaternion = new THREE.Quaternion();

    this.sprinting = false;
    this.stamina = 1;
    this.chakra = 1;
    this.winded = false;
    this.gaitPhase = 0;
    this.footfall = false;
    this.footIndex = 0;
    this.lean = 0;
    this.wet = false;

    /** Set by the skill system: a multiplier on top speed. */
    this.speedBoost = 1;

    this._axis = new THREE.Vector3();
    this._wish = new THREE.Vector3();
    this._tmp = new THREE.Vector3();
    this._prevDir = new THREE.Vector3(0, 1, 0);

    this.spawnAt(28, -14);
  }

  /** Place the walker at a latitude/longitude, facing east. */
  spawnAt(lat, lon) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const s = Math.sin(phi);
    this.dir.set(-(s * Math.cos(theta)), Math.cos(phi), s * Math.sin(theta)).normalize();
    this.planet.normalAt(this.dir, this.rawUp);
    this.up.copy(this.rawUp);
    // Any tangent will do for an initial heading; east is the readable choice.
    this.heading.set(-this.dir.z, 0, this.dir.x);
    if (this.heading.lengthSq() < 1e-8) this.heading.set(1, 0, 0);
    transportTangent(this.heading, this.up, this.heading);
    this._prevDir.copy(this.dir);
    this._sync();
  }

  /**
   * @param {number} dt
   * @param {{x:number,y:number}} move  tangent-plane intent in camera space,
   *        x = right, y = forward, each in [-1,1]
   * @param {CameraRig} rig  supplies the camera's own tangent basis
   * @param {boolean} sprint
   */
  update(dt, move, rig, sprint) {
    const h = Math.min(dt, 1 / 30);

    // ---- the surface under the feet ---------------------------------------
    this.planet.normalAt(this.dir, this.rawUp);
    // Smoothed hard: the relief normal at walking scale changes fast enough to
    // shake the model and, through the camera basis, the whole frame.
    this.up.lerp(this.rawUp, 1 - Math.exp(-9 * h)).normalize();

    // ---- intent ------------------------------------------------------------
    // The camera's forward and right, projected into THIS point's tangent plane.
    // Using the camera's basis rather than the body's is what makes the controls
    // feel camera-relative, which is what a third-person game needs.
    const camF = transportTangent(rig.forward.clone(), this.up, this._tmp.clone());
    const camR = new THREE.Vector3().crossVectors(this.up, camF).normalize().negate();
    this._wish.set(0, 0, 0)
      .addScaledVector(camF, move.y)
      .addScaledVector(camR, move.x);
    const wishLen = this._wish.length();

    // ---- vitals ------------------------------------------------------------
    // Sprint is the Kurama run: it costs chakra, not just stamina, and it will not
    // start on an empty tank — but it degrades to a run rather than stopping dead,
    // because a traversal game that strands you is a traversal game you stop
    // playing.
    const wantSprint = sprint && wishLen > 0.15 && !this.winded && this.chakra > 0.04;
    this.sprinting = wantSprint;
    if (wantSprint) {
      this.chakra = clamp01(this.chakra - 0.19 * h);
      this.stamina = clamp01(this.stamina - 0.13 * h);
    } else {
      this.chakra = clamp01(this.chakra + (wishLen > 0.1 ? 0.085 : 0.20) * h);
      this.stamina = clamp01(this.stamina + (wishLen > 0.1 ? 0.11 : 0.26) * h);
    }
    if (this.stamina < 0.02) this.winded = true;
    else if (this.stamina > 0.24) this.winded = false;

    let top = this.sprinting ? SPRINT : (wishLen > 0.75 ? RUN : WALK);
    top *= this.speedBoost;
    // Wading. Shallow water is passable and slow; it is also the shore-reading
    // cue that makes a coastline feel like a coastline rather than a colour change.
    const relief = this.planet.heightAt(this.dir);
    const depth = this.planet.spec.seaLevel - relief;
    this.wet = depth > 0.02;
    if (this.wet) top *= mix(1, 0.34, clamp01(depth / 0.9));

    // ---- integrate the tangential velocity --------------------------------
    if (wishLen > 0.001) {
      this._wish.multiplyScalar(top / wishLen);
      const a = ACCEL * h;
      this._tmp.copy(this._wish).sub(this.velTangent);
      const need = this._tmp.length();
      if (need > a) this._tmp.multiplyScalar(a / need);
      this.velTangent.add(this._tmp);
    } else {
      const d = DECEL * h;
      const s = this.velTangent.length();
      this.velTangent.multiplyScalar(s > d ? (s - d) / s : 0);
    }
    // The velocity is a tangent vector too, so it has to be transported with the
    // walker or it drifts out of the tangent plane and the speed reads wrong.
    // transportTangent normalises, so the magnitude has to be taken *first* and
    // put back after — reading it back off the transported vector returns 1 and
    // silently pins the walker to one metre per second.
    const mag = this.velTangent.length();
    if (mag > 1e-6) {
      transportTangent(this.velTangent, this.up, this.velTangent)
        .multiplyScalar(mag);
    }
    const sp = this._advance(h);
    this.speed = sp;
    this.speed01 = clamp01(sp / (SPRINT * this.speedBoost));

    // ---- facing ------------------------------------------------------------
    if (sp > 0.12) {
      const want = this._tmp.copy(this.velTangent).normalize();
      // Slerp the heading through the tangent plane by nudging and re-transporting,
      // which keeps it a genuine tangent at every intermediate step.
      const k = 1 - Math.exp(-11 * h);
      this.heading.addScaledVector(want.sub(this.heading), k);
      transportTangent(this.heading, this.up, this.heading);
    }

    // ---- lean and gait -----------------------------------------------------
    // Lateral acceleration against the body's own right, so a hard turn at speed
    // banks the model into it.
    const right = this._tmp.crossVectors(this.up, this.heading).normalize();
    const lat = this.velTangent.dot(right);
    this.lean = expDamp(this.lean, clamp(lat / 9, -1, 1) * (0.4 + 0.6 * this.speed01), 7, h);
    this._gait(h, sp);

    this._sync();
    return sp;
  }

  /**
   * Move along the great circle. Rotating the direction about the axis
   * perpendicular to it and the travel direction is exact: no normalise-and-hope,
   * no drift, and the arc length is exactly speed*dt however large the step.
   */
  _advance(h) {
    const sp = this.velTangent.length();
    if (sp < 1e-6) return 0;
    this._prevDir.copy(this.dir);
    const travel = this._tmp.copy(this.velTangent).multiplyScalar(1 / sp);
    this._axis.crossVectors(this.dir, travel);
    const al = this._axis.length();
    if (al < 1e-8) return sp;
    this._axis.multiplyScalar(1 / al);
    // Arc angle for this step. The radius is the walked radius, not the mean, so
    // walking a ridge does not secretly cover more ground than walking a plain.
    const r = this.planet.radius + this.planet.heightAt(this.dir);
    this.dir.applyAxisAngle(this._axis, (sp * h) / Math.max(r, 1)).normalize();
    return sp;
  }

  /** Distance-driven gait, so feet land where they look like they land. */
  _gait(h, sp) {
    this.footfall = false;
    if (sp < 0.2) { return; }
    const stride = STRIDE * (0.7 + 0.3 * this.speed01);
    const prev = this.gaitPhase;
    this.gaitPhase = (this.gaitPhase + (sp * h) / stride) % 1;
    const crossed = (prev < 0.5 && this.gaitPhase >= 0.5) || this.gaitPhase < prev;
    if (!crossed) return;
    this.footfall = true;
    this.footIndex = this.gaitPhase < 0.5 ? 0 : 1;
  }

  /** Push the authoritative state into a world transform for the renderer. */
  _sync() {
    const relief = this.planet.heightAt(this.dir);
    const r = this.planet.radius + relief + this.lift;
    this.position.copy(this.dir).multiplyScalar(r);
    orientOnSurface(this.up, this.heading, this.quaternion);
  }

  get eyePosition() {
    return this._tmp.copy(this.position).addScaledVector(this.up, EYE);
  }
}

/* =========================================================================
 * The camera.
 *
 * The classic small-planet bug is a camera that resolves its roll against world
 * up: as the walker crosses a pole the character's up passes through the world
 * up the camera is using as a reference, the cross product collapses, and the
 * view snaps through 180 degrees. Object3D.lookAt does exactly this, so it is
 * never used here.
 *
 * Instead the rig carries its own tangent basis. `forward` is a tangent vector
 * transported along the surface exactly like the walker's heading, and the view
 * matrix is built from an explicit (right, up, back) basis with the *character's*
 * up. There is no world-up reference anywhere in the chain, so there is no pole.
 * ========================================================================= */
export class CameraRig {
  constructor(camera, planet) {
    this.camera = camera;
    this.planet = planet;
    /** Tangent vector: the direction the camera looks, along the surface. */
    this.forward = new THREE.Vector3(1, 0, 0);
    this.up = new THREE.Vector3(0, 1, 0);
    /** Yaw the player has dragged, relative to the walker's heading. */
    this.orbit = 0;
    this.pitch = 0.20;
    this.distance = 9.5;
    this.distanceTarget = 9.5;
    this.fov = 58;
    this.fovTarget = 58;
    this.trauma = 0;

    this._pos = new THREE.Vector3();
    this._target = new THREE.Vector3();
    this._back = new THREE.Vector3();
    this._right = new THREE.Vector3();
    this._m4 = new THREE.Matrix4();
    this._tmp = new THREE.Vector3();
  }

  addTrauma(v) { this.trauma = Math.min(1.2, this.trauma + v); }

  /** Player look input, in radians. */
  look(dx, dy) {
    this.orbit -= dx;
    this.pitch = clamp(this.pitch + dy, -0.55, 0.98);
  }

  update(dt, ch) {
    const h = Math.min(dt, 1 / 30);
    this.up.lerp(ch.up, 1 - Math.exp(-7 * h)).normalize();

    // The camera's own forward, transported onto the current tangent plane and
    // then eased toward the walker's heading rotated by the orbit the player has
    // dragged. Transport first, ease second: easing a stale tangent lets it drift
    // out of the plane and the basis goes non-orthogonal.
    transportTangent(this.forward, this.up, this.forward);
    const want = this._tmp.copy(ch.heading).applyAxisAngle(this.up, this.orbit);
    transportTangent(want, this.up, want);
    // Follow faster at speed, so a sprint does not out-run its own camera.
    const rate = mix(3.0, 7.5, ch.speed01);
    this.forward.addScaledVector(want.sub(this.forward), 1 - Math.exp(-rate * h));
    transportTangent(this.forward, this.up, this.forward);

    // Pull back and widen with speed — the cheapest, most legible speed cue there
    // is, and the one the reference footage leans on hardest.
    this.distanceTarget = mix(8.6, 13.4, ch.speed01) + (ch.sprinting ? 1.5 : 0);
    this.fovTarget = mix(56, 78, ch.speed01 * (ch.sprinting ? 1 : 0.45));
    this.distance = expDamp(this.distance, this.distanceTarget, 3.4, h);
    this.fov = expDamp(this.fov, this.fovTarget, 4.2, h);

    // Aim point: a little above the walker, a little ahead of them.
    this._target.copy(ch.position)
      .addScaledVector(this.up, 1.85)
      .addScaledVector(this.forward, 1.1);

    // The boom. Back along the forward tangent, lifted by the pitch — both
    // measured in the local frame, so there is nothing global to gimbal against.
    const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    this._back.copy(this.forward).multiplyScalar(-cp).addScaledVector(this.up, sp);
    this._pos.copy(this._target).addScaledVector(this._back, this.distance);

    // Keep the camera out of the ground. On a small planet the boom swings below
    // the horizon constantly, and clipping through the surface is far more
    // noticeable here than on a flat map.
    const camDir = this._tmp.copy(this._pos).normalize();
    const floor = this.planet.radius + this.planet.heightAt(camDir) + 1.1;
    const len = this._pos.length();
    if (len < floor) this._pos.multiplyScalar(floor / len);

    // Trauma: a positional shake in the local frame only, so it never introduces
    // a roll the basis would then have to resolve.
    this.trauma = Math.max(0, this.trauma - h * 1.9);
    if (this.trauma > 0.001) {
      const t = this.trauma * this.trauma * 0.34;
      this._right.crossVectors(this.up, this.forward).normalize();
      this._pos.addScaledVector(this._right, (Math.random() - 0.5) * t)
        .addScaledVector(this.up, (Math.random() - 0.5) * t);
    }

    this.camera.position.copy(this._pos);
    // Explicit basis. No lookAt, no world up, no pole.
    this._back.copy(this._pos).sub(this._target).normalize();
    this._right.crossVectors(this.up, this._back);
    if (this._right.lengthSq() < 1e-10) this._right.crossVectors(this.forward, this._back);
    this._right.normalize();
    const trueUp = new THREE.Vector3().crossVectors(this._back, this._right).normalize();
    this._m4.makeBasis(this._right, trueUp, this._back);
    this.camera.quaternion.setFromRotationMatrix(this._m4);
    if (Math.abs(this.camera.fov - this.fov) > 0.01) {
      this.camera.fov = this.fov;
      this.camera.updateProjectionMatrix();
    }
  }
}
