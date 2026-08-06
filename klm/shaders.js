/* =========================================================================
 * GLSL. One shared chunk library, the way the TriCalm engine does it: the
 * surface, the props, the cloak and the aura all have to agree about where the
 * light is and what "scratchy" means, and three copies of a cel ramp is three
 * places for a world to stop looking like one world.
 * ========================================================================= */

/** Shared preamble: cel ramp, ink, paper grain, hand-wobble. */
export const CHUNK_COMMON = /* glsl */`
uniform vec3  uSunDir;
uniform vec3  uSunColor;
uniform vec3  uSkyColor;
uniform vec3  uGroundColor;
uniform float uTime;
uniform float uCelSteps;
uniform float uScratch;
uniform float uInk;
uniform float uWobble;

float hash21(vec2 p){
  p = fract(p * vec2(233.34, 851.73));
  p += dot(p, p + 23.45);
  return fract(p.x * p.y);
}
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i), b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0)), d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm2(vec2 p){
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++){ s += vnoise(p) * a; p *= 2.03; a *= 0.5; }
  return s;
}

/**
 * The cel ramp. Quantised diffuse with a soft terminator: a hard floor() alone
 * bands badly on a sphere the size of a planet, so the step is smoothed by the
 * screen-space derivative of the lighting itself, which is scale-free.
 */
float celRamp(float ndl){
  float steps = max(uCelSteps, 1.0);
  float lit = ndl * 0.5 + 0.5;
  float scaled = lit * steps;
  float f = fract(scaled);
  float w = clamp(fwidth(scaled) * 0.9, 0.02, 0.45);
  return (floor(scaled) + smoothstep(0.5 - w, 0.5 + w, f)) / steps;
}

/**
 * Ink and scratch. Two layers doing different jobs: a fine cross-hatch that
 * lives in the shadow band only — hatching a lit face reads as dirt, not as
 * drawing — and a broad paper grain across everything so flat colour never
 * looks like flat colour.
 */
vec3 applyScratch(vec3 col, vec2 sp, float lit){
  float hatch = vnoise(sp * vec2(38.0, 9.0) + vec2(uTime * 0.02, 0.0));
  float hatch2 = vnoise(sp * vec2(9.0, 38.0) - vec2(0.0, uTime * 0.017));
  float shade = 1.0 - lit;
  float ink = max(hatch, hatch2) * shade * shade * uScratch;
  col = mix(col, col * 0.42, clamp(ink, 0.0, 0.7));
  float grain = fbm2(sp * 120.0) - 0.5;
  return col * (1.0 + grain * 0.10 * uScratch);
}

/** Wrapped hemisphere ambient. Stylised worlds want sky and bounce, not IBL. */
vec3 ambientTerm(vec3 n){
  float h = n.y * 0.5 + 0.5;
  return mix(uGroundColor, uSkyColor, h);
}
`;

/* ------------------------------------------------------------------ planet */

export const PLANET_VERT = /* glsl */`
in vec3 position;
in vec3 normal;
in vec2 uv;
in float aRelief;      // baked relief height, metres above mean radius
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform float uRadius;
out vec3 vWorld;
out vec3 vNormal;
out vec2 vUv;
out float vRelief;
out float vHeight;
void main(){
  vec3 p = position;
  vWorld = (modelMatrix * vec4(p, 1.0)).xyz;
  vNormal = normalize(normal);
  vUv = uv;
  vRelief = aRelief;
  // Height above mean sea level, normalised — drives the biome banding.
  vHeight = (length(p) - uRadius) ;
  gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
}
`;

/**
 * The surface. Height bands rather than a texture: a small planet is read at a
 * glance from orbit, so what matters is that shore, lowland, upland and peak are
 * four legible zones with hand-drawn edges between them.
 */
export const PLANET_FRAG = /* glsl */`
precision highp float;
${CHUNK_COMMON}
in vec3 vWorld;
in vec3 vNormal;
in vec2 vUv;
in float vRelief;
in float vHeight;
out vec4 fragColor;
uniform vec3 uCamPos;
uniform vec3 uShore;
uniform vec3 uLow;
uniform vec3 uMid;
uniform vec3 uHigh;
uniform vec3 uLiquid;
uniform float uSeaLevel;
uniform float uBandJitter;

void main(){
  vec3 n = normalize(vNormal);
  // Object-space-ish coords for the hatching: xz plus a slice of y, so the
  // pattern does not smear on vertical faces the way a pure xz projection does.
  vec2 sp = vWorld.xz * 0.5 + vWorld.yy * 0.31;

  // Wobbly band edges. A straight contour is the tell that a planet was made by
  // a threshold; jittering the *height* rather than the colour keeps the wobble
  // consistent between the surface and anything standing on it.
  float j = (fbm2(vWorld.xz * 0.06 + vWorld.y * 0.05) - 0.5) * uBandJitter;
  float h = vHeight + j;

  vec3 col = uLow;
  col = mix(uShore, col, smoothstep(uSeaLevel - 0.15, uSeaLevel + 0.55, h));
  col = mix(col, uMid,  smoothstep(0.55, 1.9, h));
  col = mix(col, uHigh, smoothstep(1.8, 3.4, h));
  // Below sea level is liquid — lakes and seas fall out of the same band stack.
  float wet = smoothstep(uSeaLevel + 0.02, uSeaLevel - 0.30, h);
  col = mix(col, uLiquid, wet);

  float ndl = dot(n, normalize(uSunDir));
  float lit = celRamp(ndl);
  vec3 lightCol = uSunColor * lit;
  vec3 amb = ambientTerm(n);
  vec3 outC = col * (lightCol + amb);

  // Water gets one specular lobe and no hatching; land gets hatching.
  if (wet > 0.5){
    vec3 V = normalize(uCamPos - vWorld);
    vec3 H = normalize(V + normalize(uSunDir));
    float spec = pow(max(dot(n, H), 0.0), 46.0);
    outC += uSunColor * spec * 0.6;
    float ripple = fbm2(vWorld.xz * 1.4 + uTime * 0.16);
    outC += uLiquid * ripple * 0.06;
  } else {
    outC = applyScratch(outC, sp, lit);
  }

  // Rim ink: the silhouette line, done per-fragment so it survives on a sphere
  // where a geometric outline pass would cost a second draw of the whole planet.
  vec3 V = normalize(uCamPos - vWorld);
  float rim = 1.0 - max(dot(n, V), 0.0);
  outC = mix(outC, vec3(0.04, 0.06, 0.09), smoothstep(0.72, 0.99, rim) * uInk);

  fragColor = vec4(outC, 1.0);
}
`;

/* ------------------------------------------------------------------- props */

/** Instanced props: buildings, trees, rocks. One draw per kind. */
export const PROP_VERT = /* glsl */`
in vec3 position;
in vec3 normal;
in vec3 aOffset;      // world position on the surface
in vec4 aQuat;        // orientation (up = surface normal)
in vec3 aScale;
in vec3 aTint;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform float uTime;
uniform float uWobble;
out vec3 vWorld;
out vec3 vNormal;
out vec3 vTint;
vec3 applyQuat(vec4 q, vec3 v){
  return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
}
void main(){
  vec3 p = position * aScale;
  // Hand-wobble: a sub-centimetre per-instance sway so a field of instanced
  // props does not read as a field of one prop. Keyed off the offset so each
  // instance has its own phase and nothing pulses in unison.
  float ph = aOffset.x * 1.7 + aOffset.z * 2.3;
  p.x += sin(uTime * 0.7 + ph) * uWobble * p.y * 0.02;
  p.z += cos(uTime * 0.6 + ph * 1.3) * uWobble * p.y * 0.02;
  vec3 wp = applyQuat(aQuat, p) + aOffset;
  vWorld = wp;
  vNormal = normalize(applyQuat(aQuat, normal));
  vTint = aTint;
  gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
}
`;

export const PROP_FRAG = /* glsl */`
precision highp float;
${CHUNK_COMMON}
in vec3 vWorld;
in vec3 vNormal;
in vec3 vTint;
out vec4 fragColor;
uniform vec3 uCamPos;
void main(){
  vec3 n = normalize(vNormal);
  float ndl = dot(n, normalize(uSunDir));
  float lit = celRamp(ndl);
  vec3 col = vTint * (uSunColor * lit + ambientTerm(n));
  col = applyScratch(col, vWorld.xz * 1.6 + vWorld.yy * 0.9, lit);
  vec3 V = normalize(uCamPos - vWorld);
  float rim = 1.0 - max(dot(n, V), 0.0);
  col = mix(col, vec3(0.05, 0.07, 0.10), smoothstep(0.55, 0.98, rim) * uInk * 1.2);
  fragColor = vec4(col, 1.0);
}
`;

/* ------------------------------------------------------------------- cloak */

/**
 * The Hokage cloak. Cel-shaded white with a red flame hem and the kanji band,
 * all procedural — no texture, so it costs nothing to ship and scales to any
 * screen. The flame edge is a ridged noise threshold against the hem coordinate,
 * which is what gives it the torn, painted look rather than a clean scallop.
 */
export const CLOAK_FRAG = /* glsl */`
precision highp float;
${CHUNK_COMMON}
in vec3 vWorld;
in vec3 vNormal;
in vec2 vUv;
out vec4 fragColor;
uniform vec3 uCamPos;
uniform vec3 uCloth;
uniform vec3 uFlame;
uniform float uFlameRise;   // 0..1 how far the flames climb — the cloak level
uniform float uKanji;
void main(){
  vec3 n = normalize(vNormal);
  // vUv.y: 0 at the hem, 1 at the collar.
  float hem = 1.0 - vUv.y;
  vec3 col = uCloth;

  // Flame hem. Ridged noise along the hem, thresholded against a rising edge.
  float f = fbm2(vec2(vUv.x * 15.0, hem * 3.0) + vec2(uTime * 0.05, 0.0));
  float ridge = 1.0 - abs(f * 2.0 - 1.0);
  float edge = 0.16 + uFlameRise * 0.30 + ridge * 0.13;
  float flame = smoothstep(edge + 0.035, edge - 0.035, hem);
  col = mix(uFlame, col, flame);

  // The kanji band on the back. Rendered as five stacked blocks with a broken
  // interior — legible as vertical characters at gameplay distance, which is all
  // a 40-pixel-tall band can ever be, and honest about being a suggestion.
  if (uKanji > 0.5 && vUv.x > 0.40 && vUv.x < 0.60){
    float band = (vUv.y - 0.18) / 0.62;
    if (band > 0.0 && band < 1.0){
      float cell = fract(band * 5.0);
      float glyphX = (vUv.x - 0.40) / 0.20;
      float strokes = step(0.22, fract(cell * 3.0)) * step(0.18, fract(glyphX * 3.0));
      float mask = step(0.14, cell) * step(cell, 0.86)
                 * step(0.16, glyphX) * step(glyphX, 0.84);
      col = mix(col, uFlame * 0.62, mask * strokes * 0.92);
    }
  }

  float ndl = dot(n, normalize(uSunDir));
  float lit = celRamp(ndl);
  vec3 outC = col * (uSunColor * lit + ambientTerm(n));
  outC = applyScratch(outC, vUv * 12.0, lit);
  vec3 V = normalize(uCamPos - vWorld);
  float rim = 1.0 - max(dot(n, V), 0.0);
  outC = mix(outC, vec3(0.06, 0.05, 0.06), smoothstep(0.60, 0.99, rim) * uInk);
  fragColor = vec4(outC, 1.0);
}
`;

export const CLOAK_VERT = /* glsl */`
in vec3 position;
in vec3 normal;
in vec2 uv;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
out vec3 vWorld;
out vec3 vNormal;
out vec2 vUv;
void main(){
  vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
}
`;

/* -------------------------------------------------------------- chakra aura */

/**
 * The chakra trail. Additive points with a soft core; size falls with age so a
 * grain expands as it dissipates, and the colour runs from the aura tint to
 * white at the core so a dense plume reads hot rather than just orange.
 */
export const CHAKRA_VERT = /* glsl */`
in vec3 position;
in float aAge;      // 0 fresh -> 1 dead
in float aSeed;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform float uSize;
uniform float uPixelRatio;
out float vAge;
out float vSeed;
void main(){
  vAge = aAge;
  vSeed = aSeed;
  vec4 mv = viewMatrix * vec4(position, 1.0);
  float grow = 1.0 + aAge * 2.4;
  gl_PointSize = uSize * grow * uPixelRatio / max(-mv.z, 0.1);
  gl_Position = projectionMatrix * mv;
}
`;

export const CHAKRA_FRAG = /* glsl */`
precision highp float;
in float vAge;
in float vSeed;
out vec4 fragColor;
uniform vec3 uTint;
void main(){
  vec2 d = gl_PointCoord - 0.5;
  float r = length(d) * 2.0;
  if (r > 1.0) discard;
  float core = pow(1.0 - r, 2.2);
  float fade = 1.0 - vAge;
  vec3 col = mix(uTint, vec3(1.0, 0.96, 0.86), core * 0.8);
  fragColor = vec4(col * core * fade * 1.6, core * fade * 0.9);
}
`;

/* ------------------------------------------------------------------ sky */

/**
 * The sky. A vertical gradient with a soft horizon glow plus a starfield that
 * only survives where the sky is dark — so the same shader serves the daylit
 * cyan of the reference plate and the cosmic night the warp drops you into.
 */
export const SKY_FRAG = /* glsl */`
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform mat4 uInvVP;
uniform vec3 uCamPos;
uniform vec3 uSunDir;
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uSunColor;
uniform float uStarGain;
uniform float uTime;
float h31(vec3 p){
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float stars(vec3 rd, float cell, float thresh){
  vec3 p = rd * cell, id = floor(p), f = p - id;
  float acc = 0.0;
  for (int k = 0; k < 8; k++){
    vec3 o = vec3(float(k & 1), float((k >> 1) & 1), float((k >> 2) & 1));
    float hv = h31(id + o);
    if (hv < thresh) continue;
    vec3 c = o + vec3(h31(id + o + 11.0), h31(id + o + 23.0), h31(id + o + 37.0)) * 0.8 + 0.1;
    float d = length(f - c);
    float tw = 0.6 + 0.4 * sin(uTime * (1.4 + hv * 3.0) + hv * 40.0);
    acc += exp(-d * d * 240.0) * tw;
  }
  return acc;
}
void main(){
  vec4 ndc = vec4(vUv * 2.0 - 1.0, 1.0, 1.0);
  vec4 wp = uInvVP * ndc;
  vec3 rd = normalize(wp.xyz / wp.w - uCamPos);
  float up = clamp(rd.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 col = mix(uHorizon, uZenith, pow(up, 0.75));
  // Sun bloom in the sky itself, so it reads even when the disc is off-frame.
  float mu = max(dot(rd, normalize(uSunDir)), 0.0);
  col += uSunColor * pow(mu, 220.0) * 12.0;
  col += uSunColor * pow(mu, 6.0) * 0.06;
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  float night = exp(-lum * 5.0) * uStarGain;
  if (night > 0.004){
    float s = stars(rd, 46.0, 0.976) + stars(rd, 108.0, 0.988) * 0.55;
    col += vec3(0.78, 0.86, 1.0) * s * night;
  }
  fragColor = vec4(col, 1.0);
}
`;

export const FS_VERT = /* glsl */`
in vec3 position;
out vec2 vUv;
void main(){
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`;

/* ------------------------------------------------------------------- post */

/**
 * The composite. Speed lines and a cheap radial motion blur, both driven by one
 * `uSpeed` uniform so the Kurama run is a single number the gameplay can turn up.
 *
 * The blur is radial rather than a true velocity buffer: a per-object velocity
 * pass would double the geometry cost of the whole scene for an effect that only
 * matters during a sprint, and radial-from-centre is what the reference footage
 * actually looks like anyway.
 */
export const POST_FRAG = /* glsl */`
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uScene;
uniform vec2 uRes;
uniform float uSpeed;      // 0..1 blur + streak amount
uniform float uTime;
uniform float uVignette;
uniform float uGrain;
uniform float uFlash;      // impact-frame whiteout
float h21(vec2 p){
  p = fract(p * vec2(233.34, 851.73));
  p += dot(p, p + 23.45);
  return fract(p.x * p.y);
}
void main(){
  vec2 c = vUv - 0.5;
  float r = length(c);
  vec3 col;
  if (uSpeed > 0.01){
    // Eight taps along the radius, weighted toward the centre so the middle of
    // the frame stays readable while the edges smear.
    vec2 dir = c * uSpeed * 0.085;
    float w = 0.0;
    col = vec3(0.0);
    for (int i = 0; i < 8; i++){
      float t = float(i) / 7.0;
      float wt = 1.0 - t * 0.75;
      col += texture(uScene, vUv - dir * t * r * 2.0).rgb * wt;
      w += wt;
    }
    col /= w;
    // Radial ink streaks, only out past the middle of the frame.
    float ang = atan(c.y, c.x);
    float streak = h21(vec2(floor(ang * 62.0), 3.0));
    float band = smoothstep(0.22, 0.62, r) * uSpeed;
    col = mix(col, col * (0.55 + streak * 0.9), band * step(0.62, streak) * 0.8);
  } else {
    col = texture(uScene, vUv).rgb;
  }
  col = mix(col, vec3(1.0), uFlash);
  col *= 1.0 - smoothstep(0.42, 0.92, r) * uVignette;
  col += (h21(vUv * uRes + uTime) - 0.5) * uGrain;
  fragColor = vec4(col, 1.0);
}
`;
