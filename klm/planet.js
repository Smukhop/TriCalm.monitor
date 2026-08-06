/* =========================================================================
 * The planet.
 *
 * A small world you can walk all the way around. Three decisions shape the rest:
 *
 * 1. An icosphere, not a UV sphere. SphereGeometry crowds its vertices at the
 *    poles and stretches them at the equator, so relief detail and prop density
 *    would both be latitude-dependent on a world whose whole point is that every
 *    part of it is walkable. An icosphere is near-uniform everywhere.
 *
 * 2. The relief is displaced on the CPU, and the CPU function is the only
 *    definition of it. The TriCalm engine's hardest-won lesson was that a
 *    surface displaced in a vertex shader needs an exact JS mirror or the player
 *    walks on a surface nobody drew. Here there is nothing to mirror: `heightAt`
 *    IS the displacement, called once at build time for the mesh and every frame
 *    for the walker.
 *
 * 3. BVH is built anyway, for props and picking. Ground-following does not need
 *    it — `heightAt` is closed-form and costs a few fBm octaves — but placing a
 *    thousand props with slope rules and tapping a distant NPC do, and both want
 *    accelerated raycasts against the real triangles.
 * ========================================================================= */
import * as THREE from 'three';
import { MeshBVH, acceleratedRaycast } from 'three-mesh-bvh';
import {
  fbm3, latLonToVec3, clamp, clamp01, mix, smooth01, hash3, orientOnSurface,
} from './math.js';
import { PLANET_VERT, PLANET_FRAG, PROP_VERT, PROP_FRAG } from './shaders.js';

THREE.Mesh.prototype.raycast = acceleratedRaycast;

/** Subdivision of the base icosahedron. 6 gives ~40k tris — a mobile-safe hero mesh. */
const DETAIL = 6;

export class Planet {
  /**
   * @param {object} spec  a PLANET entry: radius, relief, seaLevel, palette,
   *                       fabrication style, prop mix.
   */
  constructor(spec) {
    this.spec = spec;
    this.radius = spec.radius;
    this.group = new THREE.Group();
    this.group.name = 'Planet:' + spec.id;
    this._n = new THREE.Vector3();
    this._raycaster = new THREE.Raycaster();
    this._raycaster.firstHitOnly = true;
    this.props = [];
    this._build();
  }

  /* ------------------------------------------------------------- the surface */

  /**
   * Relief above mean radius, in metres, for a unit direction. The single
   * definition of the surface: the mesh is displaced by it and the walker stands
   * on it, so the two cannot disagree.
   *
   * Three bands, and they are three different jobs. The continental term decides
   * where land and sea are, so it is the lowest frequency and the only one that
   * can go negative far enough to cut a basin. The upland term makes the ridges
   * a walker reads as terrain. The detail term is the roughness underfoot, and it
   * is deliberately weak — a small planet walked at 4 m/s turns high-frequency
   * relief into a trip hazard, not into character.
   */
  heightAt(dir) {
    const s = this.spec.relief;
    const x = dir.x, y = dir.y, z = dir.z;
    const cont = fbm3(x * s.contFreq, y * s.contFreq, z * s.contFreq, 4, 2.03, 0.55, 0);
    const upland = fbm3(x * s.upFreq + 31.7, y * s.upFreq, z * s.upFreq - 13.1,
      5, 2.11, 0.52, s.ridge);
    const detail = fbm3(x * s.detFreq - 7.3, y * s.detFreq + 19.4, z * s.detFreq,
      3, 2.17, 0.5, 0);
    // Upland only piles onto land that is already above the shore, so mountains
    // do not grow out of the middle of a sea.
    const landMask = smooth01((cont + s.landBias) * 2.2);
    return cont * s.contAmp
      + upland * s.upAmp * landMask
      + detail * s.detAmp;
  }

  /** The outward normal of the relief surface, by finite difference on the sphere. */
  normalAt(dir, out) {
    const o = out || new THREE.Vector3();
    // Two orthogonal tangents, stepped by a fixed arc so the epsilon is uniform.
    const e = 0.0035;
    const t1 = new THREE.Vector3();
    const t2 = new THREE.Vector3();
    t1.set(0, 1, 0);
    if (Math.abs(dir.y) > 0.9) t1.set(1, 0, 0);
    t1.addScaledVector(dir, -t1.dot(dir)).normalize();
    t2.crossVectors(dir, t1);

    const p0 = this.surfacePoint(dir);
    const d1 = new THREE.Vector3().copy(dir).addScaledVector(t1, e).normalize();
    const d2 = new THREE.Vector3().copy(dir).addScaledVector(t2, e).normalize();
    const p1 = this.surfacePoint(d1);
    const p2 = this.surfacePoint(d2);
    p1.sub(p0); p2.sub(p0);
    o.crossVectors(p1, p2).normalize();
    // Keep it outward — the cross product's sign depends on the tangent handedness.
    if (o.dot(dir) < 0) o.negate();
    return o;
  }

  /** The world-space point on the relief surface below a unit direction. */
  surfacePoint(dir, out) {
    const o = out || new THREE.Vector3();
    return o.copy(dir).multiplyScalar(this.radius + this.heightAt(dir));
  }

  /** True where the surface is under its own sea level. */
  isWet(dir) { return this.heightAt(dir) < this.spec.seaLevel; }

  /* ----------------------------------------------------------------- build */

  _build() {
    const geo = new THREE.IcosahedronGeometry(this.radius, DETAIL);
    // Icosahedron geometry arrives non-indexed with duplicated verts. Merging is
    // what lets the BVH and the smooth normals both behave.
    geo.deleteAttribute('uv');
    const merged = mergeVertices(geo);
    const pos = merged.attributes.position;
    const count = pos.count;
    const relief = new Float32Array(count);
    const dir = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      dir.fromBufferAttribute(pos, i).normalize();
      const h = this.heightAt(dir);
      relief[i] = h;
      const r = this.radius + h;
      pos.setXYZ(i, dir.x * r, dir.y * r, dir.z * r);
    }
    merged.setAttribute('aRelief', new THREE.BufferAttribute(relief, 1));
    merged.computeVertexNormals();
    // A cheap spherical UV, only used by the scratch layer which does not care
    // about the seam.
    const uv = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      dir.fromBufferAttribute(pos, i).normalize();
      uv[i * 2] = (Math.atan2(dir.z, dir.x) / (Math.PI * 2)) + 0.5;
      uv[i * 2 + 1] = Math.acos(clamp(dir.y, -1, 1)) / Math.PI;
    }
    merged.setAttribute('uv', new THREE.BufferAttribute(uv, 2));

    const p = this.spec.palette;
    this.uniforms = {
      uRadius: { value: this.radius },
      uSeaLevel: { value: this.spec.seaLevel },
      uBandJitter: { value: this.spec.bandJitter || 0.22 },
      uShore: { value: new THREE.Color(p.shore) },
      uLow: { value: new THREE.Color(p.low) },
      uMid: { value: new THREE.Color(p.mid) },
      uHigh: { value: new THREE.Color(p.high) },
      uLiquid: { value: new THREE.Color(p.liquid) },
    };

    this.material = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: PLANET_VERT,
      fragmentShader: PLANET_FRAG,
      uniforms: this.uniforms,
    });
    this.mesh = new THREE.Mesh(merged, this.material);
    this.mesh.name = 'PlanetSurface';
    this.mesh.frustumCulled = false;
    this.group.add(this.mesh);

    merged.boundsTree = new MeshBVH(merged);
    this.geometry = merged;
  }

  /** Bind the shared scene uniforms into this planet's materials. */
  bind(shared) {
    Object.assign(this.material.uniforms, shared);
    this.material.needsUpdate = true;
    for (const p of this.props) {
      Object.assign(p.material.uniforms, shared);
      p.material.needsUpdate = true;
    }
  }

  /* ----------------------------------------------------------------- props */

  /**
   * Scatter one kind of prop over the surface.
   *
   * Placement is rejection sampling on a Fibonacci lattice rather than pure
   * random: a lattice is even by construction, so a modest count reads as a
   * populated world instead of as clumps and bald patches. The rules that reject
   * a site are the fabrication style — what a given world will and will not build
   * on — which is why they are per-kind numbers rather than one global slope test.
   */
  scatter(kind) {
    const {
      geometry, count, tint, scale, minHeight, maxHeight, maxSlope, jitter, alignUp,
    } = kind;
    const dir = new THREE.Vector3();
    const up = new THREE.Vector3();
    const fwd = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const offs = [], quats = [], scales = [], tints = [];

    // Golden-angle lattice: the only arrangement that fills a sphere evenly at
    // any count, which matters because the count is a quality setting.
    const samples = Math.max(count * 5, count + 32);
    const ga = Math.PI * (3 - Math.sqrt(5));
    const baseTint = new THREE.Color(tint);
    const tmp = new THREE.Color();
    let placed = 0;

    for (let i = 0; i < samples && placed < count; i++) {
      const y = 1 - (i / (samples - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const th = ga * i;
      dir.set(Math.cos(th) * r, y, Math.sin(th) * r);
      // Jitter off the lattice so it does not read as a grid at close range.
      const j = jitter === undefined ? 0.35 : jitter;
      if (j > 0) {
        dir.x += (hash3(i, 3, 7) - 0.5) * j * 0.09;
        dir.y += (hash3(i, 11, 5) - 0.5) * j * 0.09;
        dir.z += (hash3(i, 17, 13) - 0.5) * j * 0.09;
        dir.normalize();
      }
      const h = this.heightAt(dir);
      if (h < minHeight || h > maxHeight) continue;
      this.normalAt(dir, up);
      // Slope as the cosine between the relief normal and straight up-from-centre.
      const slope = 1 - up.dot(dir);
      if (slope > maxSlope) continue;

      const pt = this.surfacePoint(dir);
      offs.push(pt.x, pt.y, pt.z);
      // Orient: up along the relief normal if the kind is built (a building must
      // stand on its footing), along the radius if it is scattered (a rock does
      // not care and a radial rock reads better on a slope).
      const u = alignUp === false ? dir : up;
      fwd.set(-u.z, 0, u.x);
      if (fwd.lengthSq() < 1e-8) fwd.set(1, 0, 0);
      fwd.normalize();
      // A per-instance yaw about the surface normal.
      const yaw = hash3(i, 23, 29) * Math.PI * 2;
      const spin = new THREE.Quaternion().setFromAxisAngle(u, yaw);
      orientOnSurface(u, fwd, quat);
      quat.premultiply(spin);
      quats.push(quat.x, quat.y, quat.z, quat.w);
      const s = scale[0] + hash3(i, 31, 37) * (scale[1] - scale[0]);
      const sw = 0.82 + hash3(i, 41, 43) * 0.36;
      scales.push(s * sw, s, s * sw);
      tmp.copy(baseTint);
      tmp.offsetHSL((hash3(i, 47, 53) - 0.5) * 0.045,
        (hash3(i, 59, 61) - 0.5) * 0.12,
        (hash3(i, 67, 71) - 0.5) * 0.14);
      tints.push(tmp.r, tmp.g, tmp.b);
      placed++;
    }

    if (!placed) return null;
    // An InstancedBufferGeometry, not a cloned BufferGeometry. Putting
    // InstancedBufferAttributes on a plain geometry does not make it instanced —
    // three uploads them as ordinary per-vertex attributes, so vertex 0 reads
    // instance 0 and every vertex after it reads past the end of a one-element
    // buffer. The result is geometry folded into a shape nobody authored, which
    // is exactly what it looked like.
    const inst = toInstanced(geometry, placed);
    inst.setAttribute('aOffset',
      new THREE.InstancedBufferAttribute(new Float32Array(offs), 3));
    inst.setAttribute('aQuat',
      new THREE.InstancedBufferAttribute(new Float32Array(quats), 4));
    inst.setAttribute('aScale',
      new THREE.InstancedBufferAttribute(new Float32Array(scales), 3));
    inst.setAttribute('aTint',
      new THREE.InstancedBufferAttribute(new Float32Array(tints), 3));

    const mat = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: PROP_VERT,
      fragmentShader: PROP_FRAG,
      uniforms: {},
    });
    const mesh = new THREE.Mesh(inst, mat);
    mesh.frustumCulled = false;
    mesh.name = 'Props:' + kind.id;
    this.group.add(mesh);
    const rec = { id: kind.id, mesh, material: mat, count: placed };
    this.props.push(rec);
    return rec;
  }

  /**
   * A road along a list of lat/lon waypoints, laid on the relief.
   *
   * Built as a ribbon rather than a TubeGeometry: a tube on a surface is a pipe
   * half-buried in it, and the width that reads as a road at walking scale makes
   * a tube visibly cylindrical. A ribbon offset a few centimetres along the local
   * normal sits on the ground the way a path does.
   */
  road(waypoints, opts) {
    const o = opts || {};
    const width = o.width || 1.5;
    const lift = o.lift === undefined ? 0.06 : o.lift;
    const seg = o.segments || 220;

    const ctrl = waypoints.map((w) =>
      latLonToVec3(w[0], w[1], 1).normalize());
    const curve = new THREE.CatmullRomCurve3(ctrl, !!o.closed, 'catmullrom', 0.4);

    const positions = [], normals = [], uvs = [], indices = [];
    const dir = new THREE.Vector3();
    const nrm = new THREE.Vector3();
    const tan = new THREE.Vector3();
    const side = new THREE.Vector3();
    const prev = new THREE.Vector3();

    for (let i = 0; i <= seg; i++) {
      const t = i / seg;
      curve.getPoint(t, dir);
      dir.normalize();
      curve.getTangent(t, tan);
      // Project the tangent into the local tangent plane, or the ribbon twists
      // where the control polygon cuts through the sphere.
      tan.addScaledVector(dir, -tan.dot(dir));
      if (tan.lengthSq() < 1e-10) tan.copy(prev);
      tan.normalize();
      prev.copy(tan);
      this.normalAt(dir, nrm);
      side.crossVectors(tan, nrm).normalize();
      const base = this.surfacePoint(dir).addScaledVector(nrm, lift);
      const half = width * 0.5;
      positions.push(
        base.x - side.x * half, base.y - side.y * half, base.z - side.z * half,
        base.x + side.x * half, base.y + side.y * half, base.z + side.z * half,
      );
      normals.push(nrm.x, nrm.y, nrm.z, nrm.x, nrm.y, nrm.z);
      uvs.push(0, t * seg * 0.25, 1, t * seg * 0.25);
      if (i < seg) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }

    const base = new THREE.BufferGeometry();
    base.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    base.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    base.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    base.setIndex(indices);
    // Roads reuse the prop shader with a single instance, so they get the same
    // cel ramp, hatching and rim ink as everything else standing on the ground.
    const g = toInstanced(base, 1);
    g.setAttribute('aOffset', new THREE.InstancedBufferAttribute(new Float32Array([0, 0, 0]), 3));
    g.setAttribute('aQuat', new THREE.InstancedBufferAttribute(new Float32Array([0, 0, 0, 1]), 4));
    g.setAttribute('aScale', new THREE.InstancedBufferAttribute(new Float32Array([1, 1, 1]), 3));
    const c = new THREE.Color(o.tint || '#7d6a52');
    g.setAttribute('aTint', new THREE.InstancedBufferAttribute(new Float32Array([c.r, c.g, c.b]), 3));

    const mat = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: PROP_VERT,
      fragmentShader: PROP_FRAG,
      uniforms: {},
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(g, mat);
    mesh.frustumCulled = false;
    mesh.name = 'Road';
    this.group.add(mesh);
    this.props.push({ id: 'road', mesh, material: mat, count: 1, curve });
    return { mesh, curve };
  }

  /** BVH-accelerated radial raycast. For picking and for props, not for walking. */
  raycastRadial(dir, out) {
    const from = new THREE.Vector3().copy(dir)
      .multiplyScalar(this.radius + this.spec.relief.contAmp * 4 + 12);
    this._raycaster.set(from, new THREE.Vector3().copy(dir).negate());
    const hits = this._raycaster.intersectObject(this.mesh, false);
    if (!hits.length) return null;
    const h = hits[0];
    if (out) out.copy(h.point);
    return h;
  }

  dispose() {
    this.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
    this.material.dispose();
    for (const p of this.props) p.material.dispose();
  }
}

/* ---------------------------------------------------------------- helpers */

/**
 * Wrap a geometry as an InstancedBufferGeometry with a given instance count,
 * sharing the source attribute buffers rather than copying them.
 *
 * Exported because everything drawn with PROP_VERT needs it — props, roads, and
 * every part of both figures. A single-instance mesh needs it just as much as a
 * two-hundred-instance one: the shader reads aOffset/aQuat/aScale/aTint as
 * instance attributes either way, and on a non-instanced geometry those reads
 * run off the end of the buffer.
 */
export function toInstanced(geo, count) {
  const inst = new THREE.InstancedBufferGeometry();
  inst.index = geo.index;
  for (const name of Object.keys(geo.attributes)) {
    inst.setAttribute(name, geo.attributes[name]);
  }
  inst.instanceCount = count;
  // Frustum culling on an instanced geometry needs a bounding sphere that covers
  // every instance, and the one inherited from the source mesh covers only the
  // prototype at the origin. Everything here sets frustumCulled = false, but
  // leaving a wrong sphere on the geometry is a trap for the next reader.
  inst.boundingSphere = new THREE.Sphere(new THREE.Vector3(), Infinity);
  return inst;
}

/**
 * Weld coincident vertices. three's BufferGeometryUtils has one of these, but
 * pulling in the whole addon for a single function on a hot path at boot is not
 * worth the request — and this version can key on position alone, which is all
 * an un-UVd icosphere needs and is therefore both simpler and stricter.
 */
function mergeVertices(geo) {
  const src = geo.attributes.position;
  const n = src.count;
  const map = new Map();
  const pos = [];
  const indices = new Uint32Array(n);
  const PREC = 1e4;
  for (let i = 0; i < n; i++) {
    const x = src.getX(i), y = src.getY(i), z = src.getZ(i);
    const key = `${Math.round(x * PREC)},${Math.round(y * PREC)},${Math.round(z * PREC)}`;
    let idx = map.get(key);
    if (idx === undefined) {
      idx = pos.length / 3;
      map.set(key, idx);
      pos.push(x, y, z);
    }
    indices[i] = idx;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  out.setIndex(new THREE.BufferAttribute(indices, 1));
  return out;
}
