/* =========================================================================
 * THE STEERING FRAMEWORK
 *
 *   Framework → Model Engines → Transmission → Axles
 *
 * The v19 board drew its coupling matrix from `Math.sin(i*2.6 + j*1.9 + seed*17)`.
 * That is a picture of a matrix, and it was labelled honestly as a proxy — but a
 * picture cannot tell you that an agent is stuck, because it does not know
 * whether one is.
 *
 * This builds the same 8x8 from live state. Every entry is a count of something
 * that actually happened, decayed over a window, so the spectrum is a measurement:
 *
 *   A[i][j] = how much system i has been driving system j lately
 *
 * That makes the eigenvalues mean something. The dominant eigenvalue of the
 * symmetric part is how much coupled energy the board is carrying; its
 * participation ratio is how many systems are sharing it; and the norm of the
 * skew part is how much of the traffic is one-way circulation rather than
 * mutual work. Those three numbers separate a healthy board from a stalled one,
 * a loop, and a cascade — which is exactly the delegation problem.
 *
 * The honest caveat still stands, and is stated in the UI: this is a coupling
 * field over *observable platform events*. It is not a Jacobian of any model's
 * hidden state, and nothing here claims to read one.
 * ========================================================================= */
import { spectrum, clamp, clamp01, mix } from './math.js';
import { STEER_SYSTEMS, PATHOLOGIES, AGENT_CORPS, FAB_PHASES } from './data.js';

/** Phase id -> owning discipline, resolved once so attribution is a lookup. */
const FAB_PHASE_DISC = Object.fromEntries(FAB_PHASES.map((p) => [p.id, p.disc]));

const N = 8;
/** Index of each system, so an event can name its source and sink by id. */
const IDX = Object.fromEntries(STEER_SYSTEMS.map((s, i) => [s.id, i]));

/**
 * Coupling decays. Without it the matrix is a lifetime total and every board
 * eventually looks identical; with it the spectrum reflects the last minute or so
 * of work, which is the timescale a steering decision acts on.
 */
const HALF_LIFE = 26;

export class Steering {
  constructor() {
    /** Raw accumulated coupling. Row = driver, column = driven. */
    this.A = new Float64Array(N * N);
    /** The normalised field the spectrum is taken of. */
    this.field = new Float64Array(N * N);
    this.spectrum = null;
    this.pathology = PATHOLOGIES[PATHOLOGIES.length - 1];
    /** Which pathway the operator has selected, or -1. */
    this.selected = -1;
    /** Ablation dampens the selected pathway only. */
    this.ablation = 0;
    this.history = [];
    this._t = 0;
    // Seed the diagonal. Every system has some self-influence — inertia, its own
    // internal feedback — and a matrix whose diagonal starts at zero claims that
    // a system has no effect on itself, which is never true and makes the early
    // spectrum meaningless.
    for (let i = 0; i < N; i++) this.A[i * N + i] = 0.25;
  }

  /**
   * Record that something happened. `from` drove `to`.
   *
   * This is the only way coupling enters the matrix, which is the point: if a
   * subsystem is not calling `drive`, it will read as uncoupled, and that is
   * correct rather than a bug — an agent nobody hands work to IS stuck.
   */
  drive(from, to, weight) {
    const i = IDX[from], j = IDX[to];
    if (i === undefined || j === undefined) return;
    const w = weight === undefined ? 1 : weight;
    this.A[i * N + j] += w;
    // Self-coupling too: doing work at all keeps a system warm.
    this.A[i * N + i] += w * 0.30;
  }

  /** Convenience: a mutual exchange, which most real hand-offs are. */
  couple(a, b, weight) {
    this.drive(a, b, weight);
    this.drive(b, a, (weight === undefined ? 1 : weight) * 0.72);
  }

  /**
   * Fold the Corps' own state into the matrix. The roster is the largest live
   * signal on the board and it would be strange for the agents axis to be driven
   * only by explicit events when every agent already publishes what it is doing.
   */
  sampleCorps(dt) {
    let exec = 0, verify = 0, transit = 0;
    for (const a of AGENT_CORPS) {
      if (a.paused) continue;
      if (a.state === 'EXECUTING') exec++;
      else if (a.state === 'VERIFYING') verify++;
      else transit++;
    }
    const n = AGENT_CORPS.length;
    // Executing agents are drawing routes and writing memory. Verifying agents
    // are reading memory and feeding the panels. Agents in transit are consuming
    // orbit and cron but producing nothing — which is why a board full of them
    // reads as stalled rather than as busy.
    this.drive('routes', 'agents', (exec / n) * dt * 2.2);
    this.drive('agents', 'memory', (exec / n) * dt * 1.8);
    this.drive('memory', 'panels', (verify / n) * dt * 1.6);
    this.drive('agents', 'panels', (verify / n) * dt * 1.2);
    this.drive('orbit', 'agents', (transit / n) * dt * 0.9);
    this.drive('cron', 'routes', (transit / n) * dt * 0.7);
  }

  update(dt) {
    this._t += dt;
    // Exponential decay toward the diagonal floor.
    const k = Math.pow(0.5, dt / HALF_LIFE);
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const at = i * N + j;
        this.A[at] *= k;
        if (i === j && this.A[at] < 0.25) this.A[at] = 0.25;
      }
    }
    this.sampleCorps(dt);

    // Normalise into the field the spectrum reads. Scaling by the mean keeps the
    // eigenvalues in a comparable range whatever the absolute event rate is, so
    // the pathology thresholds mean the same thing on a quiet board and a busy
    // one — it is the SHAPE of the coupling that diagnoses, not the volume.
    let sum = 0;
    for (let i = 0; i < N * N; i++) sum += this.A[i];
    const scale = sum > 1e-6 ? (N * N * 0.5) / sum : 1;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        let v = this.A[i * N + j] * scale;
        // Ablation: dampen the selected row and column, and nothing else. This is
        // the operator asking "what is this pathway actually contributing?"
        if (this.ablation > 0 && this.selected >= 0
          && (i === this.selected || j === this.selected)) {
          v *= 1 - this.ablation;
        }
        this.field[i * N + j] = v;
      }
    }

    this.spectrum = spectrum(this.field, N);
    // How much real traffic is on the board, above the diagonal floor the
    // constructor seeds. The pathologies need this to avoid diagnosing an empty
    // board: the shape of one hand-off is indistinguishable from a loop.
    let edges = 0;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (i !== j && this.A[i * N + j] > 0.12) edges++;
      }
    }
    // Distinct active edges, not total volume. Ten units of traffic on two edges
    // is still one hand-off going nowhere, and its spectrum is indistinguishable
    // from a pathological loop — so the gate counts breadth, not throughput.
    this.spectrum.energy = edges;
    for (const p of PATHOLOGIES) {
      if (p.test(this.spectrum)) { this.pathology = p; break; }
    }
    // A short history, for the sparkline. Sampled rather than every frame.
    if (this.history.length === 0
      || this._t - this.history[this.history.length - 1].t > 0.5) {
      this.history.push({ t: this._t, d: this.spectrum.dominant });
      if (this.history.length > 90) this.history.shift();
    }
    return this.spectrum;
  }

  /** The system carrying most of the dominant mode — "who is driving". */
  get driver() {
    if (!this.spectrum) return STEER_SYSTEMS[0];
    const v = this.spectrum.vectors[0];
    let big = -1, bi = 0;
    for (let i = 0; i < N; i++) {
      const w = Math.abs(v[i]);
      if (w > big) { big = w; bi = i; }
    }
    return STEER_SYSTEMS[bi];
  }

  /** The system carrying least — the one most likely to be starving. */
  get quietest() {
    if (!this.spectrum) return STEER_SYSTEMS[0];
    const v = this.spectrum.vectors[0];
    let small = Infinity, si = 0;
    for (let i = 0; i < N; i++) {
      const w = Math.abs(v[i]);
      if (w < small) { small = w; si = i; }
    }
    return STEER_SYSTEMS[si];
  }

  /**
   * Which agents look derailed, and why.
   *
   * The spectrum diagnoses the BOARD; this attributes it to individuals. An agent
   * is suspect when the discipline it draws from is starved on the loaded world
   * and it has not changed state — the two conditions together, because either
   * alone is normal: a starved discipline with a working agent is just a quiet
   * shift, and a stalled agent in a busy discipline is about to pick something up.
   */
  suspects(world, fabStyle) {
    const out = [];
    if (!fabStyle) return out;
    for (const a of AGENT_CORPS) {
      if (a.paused) { out.push({ agent: a, why: 'stood down by operator', sev: 1 }); continue; }
      // How much of this world's fabrication belongs to this agent's discipline.
      // A gas giant weights `found` at zero, so its civil agents genuinely have
      // nothing to draw — and that is a fact about the planet, not a fault.
      let mine = 0, total = 0;
      for (const [id, w] of Object.entries(fabStyle.phase)) {
        total += w;
        if (FAB_PHASE_DISC[id] === a.disc) mine += w;
      }
      const load = total > 0 ? mine / total : 0;
      if (load < 0.02 && a.state !== 'TRANSIT') {
        out.push({
          agent: a, sev: 3,
          why: `no ${a.disc} work exists on ${world.name} — ${fabStyle.label.toLowerCase()}`,
        });
      } else if (a.state === 'TRANSIT' && load > 0.2) {
        out.push({ agent: a, sev: 2, why: 'in transit while its discipline has work' });
      }
    }
    out.sort((x, y) => y.sev - x.sev);
    return out.slice(0, 6);
  }

  /* --------------------------------------------------------- interventions */

  /**
   * Re-route: inject coupling from the Council into the quietest pathway. This is
   * the fix for a stalled board — the Council exists precisely to hand work to
   * something that is not drawing any.
   */
  reroute() {
    const q = this.quietest.id;
    this.drive('routes', q, 6);
    this.drive(q, 'memory', 4);
    this.couple('agents', q, 3);
    return `routed through ${q}`;
  }

  /** Ablate the selected pathway, or the driver if nothing is selected. */
  ablate() {
    if (this.selected < 0) this.selected = STEER_SYSTEMS.indexOf(this.driver);
    this.ablation = this.ablation > 0 ? 0 : 0.7;
    return this.ablation > 0
      ? `ablated ${STEER_SYSTEMS[this.selected].id}`
      : 'ablation released';
  }

  /** Steer: a deterministic nudge that redistributes without adding energy. */
  steer() {
    const d = STEER_SYSTEMS.indexOf(this.driver);
    // Take a little from the driver's self-loop and give it to everyone else.
    const take = this.A[d * N + d] * 0.35;
    this.A[d * N + d] -= take;
    for (let j = 0; j < N; j++) {
      if (j === d) continue;
      this.A[d * N + j] += take / (N - 1);
    }
    return `steered off ${STEER_SYSTEMS[d].id}`;
  }

  select(i) {
    this.selected = this.selected === i ? -1 : i;
  }
}

/* ------------------------------------------------------------------ drawing */

/**
 * The J-Lens. The 8x8 field as a heat grid, with the selected pathway outlined
 * and the dominant eigenvector drawn as a bar along the bottom — because the
 * eigenvector is the actionable part and a matrix alone does not show it.
 */
export function drawJLens(canvas, st) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth || 340, h = canvas.clientHeight || 190;
  if (canvas.width !== w * dpr) { canvas.width = w * dpr; canvas.height = h * dpr; }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(6,13,22,.9)';
  ctx.fillRect(0, 0, w, h);
  if (!st.spectrum) return;

  const pad = 6, barH = 26;
  const gridH = h - barH - pad * 2;
  const cell = Math.min((w - pad * 2) / N, gridH / N);
  const ox = pad + ((w - pad * 2) - cell * N) * 0.5;
  const oy = pad;

  let max = 1e-6;
  for (let i = 0; i < N * N; i++) max = Math.max(max, st.field[i]);
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const v = st.field[i * N + j] / max;
      // Cool for weak coupling, warm for strong — the same read as the v19 board.
      const hue = 200 - v * 168;
      ctx.fillStyle = `hsla(${hue},86%,${22 + v * 40}%,${0.30 + v * 0.66})`;
      ctx.fillRect(ox + j * cell + 0.6, oy + i * cell + 0.6, cell - 1.2, cell - 1.2);
    }
  }
  if (st.selected >= 0) {
    ctx.strokeStyle = 'rgba(255,210,122,.62)';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(ox + st.selected * cell, oy, cell, cell * N);
    ctx.strokeRect(ox, oy + st.selected * cell, cell * N, cell);
  }

  // The dominant eigenvector: how the leading mode is distributed.
  const v0 = st.spectrum.vectors[0];
  const by = oy + cell * N + 8;
  ctx.fillStyle = 'rgba(140,185,225,.16)';
  ctx.fillRect(ox, by, cell * N, barH - 10);
  for (let i = 0; i < N; i++) {
    const m = Math.abs(v0[i]);
    const bh = (barH - 10) * m;
    ctx.fillStyle = i === st.selected ? 'rgba(255,210,122,.9)' : 'rgba(95,216,255,.82)';
    ctx.fillRect(ox + i * cell + cell * 0.18, by + (barH - 10) - bh,
      cell * 0.64, bh);
  }
  ctx.fillStyle = 'rgba(142,166,189,.6)';
  ctx.font = '7px ui-monospace,monospace';
  ctx.fillText('DOMINANT MODE · ' + st.driver.id.toUpperCase(), ox, by + barH + 1);
}
