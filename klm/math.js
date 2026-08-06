/* =========================================================================
 * Spherical math, and the eigen-decomposition the steering framework runs on.
 *
 * Two unrelated jobs live here because both are pure numerics with no scene
 * dependencies, and both are the kind of thing that is quietly wrong for weeks
 * if it is buried next to rendering code.
 * ========================================================================= */
import * as THREE from 'three';

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const mix = (a, b, t) => a + (b - a) * t;
export const smooth01 = (t) => { const x = clamp01(t); return x * x * (3 - 2 * x); };
export const PI2 = Math.PI * 2;

/** Framerate-independent approach. `rate` is e-foldings per second. */
export function expDamp(cur, target, rate, dt) {
  return target + (cur - target) * Math.exp(-rate * dt);
}

/** Shortest signed angle from `a` to `b`. */
export function angleDelta(a, b) {
  let d = (b - a) % PI2;
  if (d > Math.PI) d -= PI2;
  if (d < -Math.PI) d += PI2;
  return d;
}

/* ------------------------------------------------------------- spherical */

/**
 * Latitude/longitude in degrees to a point on a sphere of `radius`.
 *
 * Everything placed on the planet goes through this, so a prop's authored
 * position is a pair of readable numbers rather than a magic vector — and two
 * props authored at the same lat/lon land in the same place no matter what the
 * planet's radius or seed becomes later.
 */
export function latLonToVec3(latDeg, lonDeg, radius, out) {
  const phi = (90 - latDeg) * (Math.PI / 180);
  const theta = (lonDeg + 180) * (Math.PI / 180);
  const s = Math.sin(phi);
  return (out || new THREE.Vector3()).set(
    -(radius * s * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * s * Math.sin(theta),
  );
}

/** The inverse, for reporting where the player is standing. */
export function vec3ToLatLon(v) {
  const r = v.length() || 1;
  const lat = 90 - Math.acos(clamp(v.y / r, -1, 1)) * (180 / Math.PI);
  let lon = Math.atan2(v.z, -v.x) * (180 / Math.PI) - 180;
  while (lon < -180) lon += 360;
  while (lon > 180) lon -= 360;
  return { lat, lon };
}

/**
 * Re-seat a tangent vector onto a new tangent plane, preserving as much of its
 * direction as possible. This is the whole trick to walking a sphere without the
 * heading flipping at the poles.
 *
 * The naive approach — deriving a heading from a world-up yaw — has a
 * singularity exactly where the surface normal passes through world up, so a
 * walker crossing a pole spins. Parallel transport has no such point: the
 * heading is carried along the surface as a genuine tangent vector, and the only
 * degenerate case is a tangent that is exactly parallel to the new normal, which
 * cannot happen for a step of finite size.
 */
export function transportTangent(tan, newUp, out) {
  const o = out || tan;
  const d = tan.dot(newUp);
  o.copy(tan).addScaledVector(newUp, -d);
  const len = o.length();
  if (len < 1e-6) {
    // Degenerate only if the old heading was already the new normal. Pick any
    // perpendicular so the walker keeps moving rather than freezing.
    const seed = Math.abs(newUp.y) > 0.95
      ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    o.copy(seed).addScaledVector(newUp, -seed.dot(newUp)).normalize();
    return o;
  }
  return o.multiplyScalar(1 / len);
}

/**
 * A rotation that puts +Y along `up` and +Z along `fwd`. Built as an explicit
 * basis rather than through lookAt, because lookAt resolves its roll against
 * world up and therefore rolls the model 180 degrees as the character crosses a
 * pole — the single most common bug in small-planet games.
 */
const _m4 = new THREE.Matrix4();
const _right = new THREE.Vector3();
const _fwd2 = new THREE.Vector3();
export function orientOnSurface(up, fwd, outQuat) {
  _right.crossVectors(up, fwd);
  if (_right.lengthSq() < 1e-10) {
    // fwd parallel to up: nudge with any other axis.
    _right.crossVectors(up, Math.abs(up.y) > 0.95
      ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0));
  }
  _right.normalize();
  _fwd2.crossVectors(_right, up).normalize().negate();
  _m4.makeBasis(_right, up, _fwd2);
  return outQuat.setFromRotationMatrix(_m4);
}

/* ------------------------------------------------------------------ noise */

/** Deterministic 3D value hash. Stable across reloads, which the bake needs. */
export function hash3(x, y, z) {
  let h = x * 374761393 + y * 668265263 + z * 1274126177;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }

/** Value noise on a lattice. Cheap, and smooth enough for terrain relief. */
export function noise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = fade(xf), v = fade(yf), w = fade(zf);
  const c = (a, b, cc) => hash3(xi + a, yi + b, zi + cc);
  const x00 = mix(c(0, 0, 0), c(1, 0, 0), u);
  const x10 = mix(c(0, 1, 0), c(1, 1, 0), u);
  const x01 = mix(c(0, 0, 1), c(1, 0, 1), u);
  const x11 = mix(c(0, 1, 1), c(1, 1, 1), u);
  return mix(mix(x00, x10, v), mix(x01, x11, v), w) * 2 - 1;
}

/** Ridged/billowed fBm. `ridge` at 1 gives sharp crests, at 0 rolling hills. */
export function fbm3(x, y, z, octaves, lac, gain, ridge) {
  let sum = 0, amp = 1, norm = 0, fx = x, fy = y, fz = z;
  for (let i = 0; i < octaves; i++) {
    let n = noise3(fx, fy, fz);
    if (ridge) n = mix(n, 1 - Math.abs(n) * 2, ridge);
    sum += n * amp;
    norm += amp;
    amp *= gain;
    fx *= lac; fy *= lac; fz *= lac;
  }
  return sum / (norm || 1);
}

/* ------------------------------------------------------- eigen (steering) */

/**
 * Symmetric eigen-decomposition by cyclic Jacobi rotation.
 *
 * The coupling matrix the steering framework builds is not symmetric — A[i][j]
 * is "how much i drives j", and influence genuinely runs one way. But the
 * general non-symmetric eigenproblem needs a full Hessenberg-QR implementation
 * and returns complex pairs, which is a lot of numerics to carry for an 8x8.
 *
 * So the spectrum is taken in two parts, which is both cheaper and more
 * informative than one complex decomposition would be:
 *
 *   the symmetric part  S = (A + Aᵀ)/2  carries the *magnitude* of coupling.
 *                       Its eigenvalues are real, Jacobi finds them exactly,
 *                       and the dominant eigenvector is the mode that actually
 *                       has energy in it — which is what "who is driving the
 *                       board" means.
 *   the skew part       K = (A - Aᵀ)/2  carries the *circulation*. Its norm is
 *                       exactly the part of the field that cannot be explained
 *                       by mutual coupling, i.e. one-way hand-offs going round
 *                       a loop. That is the oscillatory diagnosis, obtained
 *                       without ever forming a complex eigenvalue.
 *
 * Returns eigenvalues descending with their eigenvectors as columns.
 */
export function jacobiEigen(A, n, sweeps) {
  // Work on a copy: the caller's matrix is live state.
  const a = new Float64Array(n * n);
  for (let i = 0; i < n * n; i++) a[i] = A[i];
  const v = new Float64Array(n * n);
  for (let i = 0; i < n; i++) v[i * n + i] = 1;

  const S = sweeps === undefined ? 12 : sweeps;
  for (let sweep = 0; sweep < S; sweep++) {
    // Sum of squares off the diagonal. Jacobi drives this to zero.
    let off = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) off += a[i * n + j] * a[i * n + j];
    }
    if (off < 1e-18) break;

    for (let p = 0; p < n - 1; p++) {
      for (let q = p + 1; q < n; q++) {
        const apq = a[p * n + q];
        if (Math.abs(apq) < 1e-15) continue;
        const app = a[p * n + p], aqq = a[q * n + q];
        // Rotation that zeroes (p,q). The `t` form avoids the catastrophic
        // cancellation a naive atan2 would hit when app is close to aqq.
        const theta = (aqq - app) / (2 * apq);
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1);
        const s = t * c;
        for (let k = 0; k < n; k++) {
          const akp = a[k * n + p], akq = a[k * n + q];
          a[k * n + p] = c * akp - s * akq;
          a[k * n + q] = s * akp + c * akq;
        }
        for (let k = 0; k < n; k++) {
          const apk = a[p * n + k], aqk = a[q * n + k];
          a[p * n + k] = c * apk - s * aqk;
          a[q * n + k] = s * apk + c * aqk;
        }
        for (let k = 0; k < n; k++) {
          const vkp = v[k * n + p], vkq = v[k * n + q];
          v[k * n + p] = c * vkp - s * vkq;
          v[k * n + q] = s * vkp + c * vkq;
        }
      }
    }
  }

  const order = [];
  for (let i = 0; i < n; i++) order.push({ val: a[i * n + i], idx: i });
  order.sort((x, y) => y.val - x.val);
  const values = new Float64Array(n);
  const vectors = [];
  for (let k = 0; k < n; k++) {
    values[k] = order[k].val;
    const col = new Float64Array(n);
    for (let i = 0; i < n; i++) col[i] = v[i * n + order[k].idx];
    // Sign is arbitrary out of Jacobi; fix it so the largest component is
    // positive, or the reported "driving system" flips between frames.
    let big = 0, bigI = 0;
    for (let i = 0; i < n; i++) {
      if (Math.abs(col[i]) > big) { big = Math.abs(col[i]); bigI = i; }
    }
    if (col[bigI] < 0) for (let i = 0; i < n; i++) col[i] = -col[i];
    vectors.push(col);
  }
  return { values, vectors };
}

/**
 * The full spectral read of a coupling field. Splits A into its symmetric and
 * skew parts, decomposes the symmetric one, and measures the circulation the
 * skew one carries.
 */
export function spectrum(A, n) {
  const sym = new Float64Array(n * n);
  let skewNorm = 0, symNorm = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const aij = A[i * n + j], aji = A[j * n + i];
      const s = (aij + aji) * 0.5;
      const k = (aij - aji) * 0.5;
      sym[i * n + j] = s;
      symNorm += s * s;
      skewNorm += k * k;
    }
  }
  const { values, vectors } = jacobiEigen(sym, n);
  const dominant = values[0];
  const smallest = values[n - 1];
  let trace = 0;
  for (let i = 0; i < n; i++) trace += values[i];
  // Participation ratio of the dominant mode: 1 means one system carries the
  // whole mode (a cascade), n means it is spread evenly (a healthy board).
  const vec = vectors[0];
  let s2 = 0, s4 = 0;
  for (let i = 0; i < n; i++) { const w = vec[i] * vec[i]; s2 += w; s4 += w * w; }
  const participation = s4 > 1e-12 ? (s2 * s2) / s4 : n;
  return {
    values, vectors, dominant, smallest, trace,
    spectralRadius: Math.max(Math.abs(dominant), Math.abs(smallest)),
    participation,
    // How much of the field is circulation rather than mutual coupling.
    circulation: symNorm + skewNorm > 1e-12
      ? Math.sqrt(skewNorm / (symNorm + skewNorm)) : 0,
  };
}
