/* =========================================================================
 * The KLM Monitor panel, and the small HUD pieces around it.
 *
 * The rule the whole panel obeys: it may only report things the simulation
 * actually computes. Every number on it traces to state — a karma total is a sum
 * of ledger entries, a pinned skill is a skill the player earned on a named
 * world, a pathology is a threshold on a measured spectrum. Nothing here is
 * decorative telemetry, because a monitor that shows a number it invented is
 * worse than one that shows nothing.
 * ========================================================================= */
import {
  LOBES, SKILLS, SKILL_BY_ID, CLOAK_LEVELS, KARMA_BY_KIND, CONTROL_PLANETS,
  STEER_SYSTEMS, AGENT_CORPS, HOKAGE_COUNCIL, FAB_STYLES, WORLDS,
} from './data.js';
import { drawJLens } from './steering.js';
import { clamp01 } from './math.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export class MonitorUI {
  constructor(game) {
    this.game = game;
    this.open = false;
    this.tab = 'journey';
    this.el = {
      mon: $('#mon'), body: $('#monBody'), sub: $('#monSub'),
      ribWorld: $('#ribWorld'), ribSub: $('#ribSub'), ribFab: $('#ribFab'),
      ribDot: $('#ribDot'),
      vitName: $('#vitName'), vitState: $('#vitState'),
      barChakra: $('#barChakra'), valChakra: $('#valChakra'),
      barStam: $('#barStam'), valStam: $('#valStam'),
      barKarma: $('#barKarma'), valKarma: $('#valKarma'),
      valCloak: $('#valCloak'),
      prompt: $('#prompt'), promptTxt: $('#promptTxt'),
      dlg: $('#dlg'), dlgWho: $('#dlgWho'), dlgRole: $('#dlgRole'),
      dlgTxt: $('#dlgTxt'), dlgOpts: $('#dlgOpts'),
      toast: $('#toast'), toastKind: $('#toastKind'),
      toastTitle: $('#toastTitle'), toastSub: $('#toastSub'),
      btnMon: $('#btnMon'), btnWarp: $('#btnWarp'),
      btnAuto: $('#btnAuto'), btnEmote: $('#btnEmote'),
    };
    this._toastT = 0;
    this._acc = 0;
    this._typeT = 0;
    this._typeFull = '';
    this._typeAt = 0;
    this._wire();
    this.render();
  }

  _wire() {
    this.el.btnMon.addEventListener('click', () => this.toggle());
    for (const b of document.querySelectorAll('#mon .tabs button')) {
      b.addEventListener('click', () => {
        this.tab = b.dataset.tab;
        for (const o of document.querySelectorAll('#mon .tabs button')) {
          o.classList.toggle('on', o === b);
        }
        this.render();
      });
    }
    // Delegated, because the panel's innerHTML is replaced on every render and
    // per-element listeners would leak one set per rebuild.
    this.el.body.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]');
      if (act) { this.game.steerAction(act.dataset.act); this.render(); return; }
      const sys = e.target.closest('[data-sys]');
      if (sys) { this.game.steering.select(+sys.dataset.sys); this.render(); }
    });
  }

  toggle(force) {
    this.open = force === undefined ? !this.open : !!force;
    this.el.mon.classList.toggle('on', this.open);
    this.el.btnMon.classList.toggle('on', this.open);
    if (this.open) {
      this.render();
      // Opening a panel is itself a coupling event: the operator reading the
      // board is part of the board.
      this.game.steering.drive('panels', 'memory', 2);
    }
  }

  toast(kind, title, sub) {
    this.el.toastKind.textContent = kind;
    this.el.toastTitle.textContent = title;
    this.el.toastSub.textContent = sub || '';
    this.el.toast.classList.remove('on');
    // One frame off then on, so a toast arriving during another one replays.
    requestAnimationFrame(() => this.el.toast.classList.add('on'));
    this._toastT = 3.6;
  }

  showPrompt(text) {
    if (text) {
      this.el.promptTxt.textContent = text;
      this.el.prompt.classList.add('on');
    } else this.el.prompt.classList.remove('on');
  }

  /* ------------------------------------------------------------- dialogue */

  openDialogue(npc, node, onChoose) {
    this.el.dlgWho.textContent = npc.agent.name;
    this.el.dlgRole.textContent = npc.agent.role + ' · ' + npc.agent.realm;
    this._typeFull = node.text;
    this._typeAt = 0;
    this.el.dlgTxt.textContent = '';
    this.el.dlgOpts.innerHTML = '';
    this.el.dlg.classList.add('on');
    this._pendingOpts = node.options || [];
    this._onChoose = onChoose;
  }

  closeDialogue() {
    this.el.dlg.classList.remove('on');
    this._pendingOpts = null;
  }

  /** Typewriter. Options appear only once the line has finished arriving. */
  tickDialogue(dt) {
    if (!this._pendingOpts) return;
    if (this._typeAt < this._typeFull.length) {
      this._typeT += dt;
      const rate = 52;
      while (this._typeT > 1 / rate && this._typeAt < this._typeFull.length) {
        this._typeT -= 1 / rate;
        this._typeAt++;
      }
      this.el.dlgTxt.textContent = this._typeFull.slice(0, this._typeAt);
      if (this._typeAt >= this._typeFull.length) this._spawnOptions();
    }
  }

  _spawnOptions() {
    if (!this._pendingOpts || this.el.dlgOpts.childElementCount) return;
    for (const o of this._pendingOpts) {
      const b = document.createElement('button');
      b.textContent = o.label;
      b.addEventListener('click', () => this._onChoose && this._onChoose(o));
      this.el.dlgOpts.appendChild(b);
    }
  }

  /* ------------------------------------------------------------- fast HUD */

  /** Per-frame, cheap: bars and labels only. */
  fast(dt, g) {
    const ch = g.controller;
    this.el.barChakra.style.width = (ch.chakra * 100).toFixed(0) + '%';
    this.el.valChakra.textContent = (ch.chakra * 100).toFixed(0) + '%';
    this.el.barStam.style.width = (ch.stamina * 100).toFixed(0) + '%';
    this.el.valStam.textContent = (ch.stamina * 100).toFixed(0) + '%';
    // Karma has no ceiling, so the bar shows progress to the next cloak level —
    // which is the only thing a karma bar could honestly be a fraction of.
    const nxt = g.nextCloak();
    const have = g.skills.size;
    const frac = nxt ? clamp01((have - (g.cloak.at)) / Math.max(1, nxt.at - g.cloak.at)) : 1;
    this.el.barKarma.style.width = (frac * 100).toFixed(0) + '%';
    this.el.valKarma.textContent = String(g.karma);
    this.el.valCloak.textContent = g.cloak.name;
    this.el.vitState.textContent = ch.sprinting ? 'KURAMA RUN'
      : ch.wet ? 'WADING' : ch.speed > 4.2 ? 'RUNNING'
        : ch.speed > 0.3 ? 'WALKING' : 'STANDING';

    if (this._toastT > 0) {
      this._toastT -= dt;
      if (this._toastT <= 0) this.el.toast.classList.remove('on');
    }
    this.tickDialogue(dt);

    // The panel body is expensive; rebuild it a few times a second at most.
    if (!this.open) return;
    this._acc += dt;
    if (this._acc > 0.28) { this._acc = 0; this.render(); }
  }

  setWorld(world) {
    const fab = FAB_STYLES[world.fab];
    this.el.ribWorld.textContent = world.name;
    this.el.ribSub.textContent = world.sub.toLowerCase();
    this.el.ribFab.textContent = fab.label;
    this.el.ribDot.style.background = world.palette
      ? world.palette.mid : '#5fd8ff';
    this.el.ribDot.style.color = world.palette ? world.palette.mid : '#5fd8ff';
  }

  /* ---------------------------------------------------------------- panel */

  render() {
    const g = this.game;
    this.el.sub.textContent =
      `${g.skills.size} skills · ${g.karma} karma · ${g.visited.size}/${WORLDS.length} worlds`;
    if (!this.open) return;
    const fn = {
      journey: () => this._journey(g),
      compass: () => this._compass(g),
      steer: () => this._steer(g),
      corps: () => this._corps(g),
    }[this.tab];
    this.el.body.innerHTML = fn ? fn() : '';
    if (this.tab === 'steer') {
      const c = $('#jcanvas');
      if (c) drawJLens(c, g.steering);
    }
  }

  _journey(g) {
    const w = g.world, fab = FAB_STYLES[w.fab];
    let h = '';
    h += `<div class="sec"><h4>Standing on <span>${esc(w.sector)}</span></h4>
      <div class="krow got"><k>◈</k><span>${esc(w.name)} · ${esc(w.sub.toLowerCase())}</span><em></em></div>
      <div class="krow"><k>·</k><span>${esc(w.desc)}</span><em></em></div></div>`;

    // Fabrication: the part that is catered to the planet.
    h += `<div class="sec"><h4>Fabrication style <span>${esc(fab.label)}</span></h4>
      <div class="krow"><k>▣</k><span>ground · ${esc(fab.ground)}</span><em></em></div>
      <div class="krow"><k>⊥</k><span>load · ${esc(fab.foundation)}</span><em></em></div>
      <div class="krow"><k>⚑</k><span>builds · ${esc(fab.builds.join(' · '))}</span><em></em></div>
      <div class="krow hot"><k>!</k><span>hazard · ${esc(fab.hazard)}</span><em></em></div></div>`;

    // Phase weights, as bars — the shape of the work on this world.
    const maxW = Math.max(0.001, ...Object.values(fab.phase));
    h += '<div class="sec"><h4>Phase load <span>weighted</span></h4>';
    for (const [id, wt] of Object.entries(fab.phase)) {
      const pc = (wt / maxW) * 100;
      const dead = wt <= 0.0001;
      h += `<div class="krow ${dead ? '' : 'got'}"><k>${dead ? '·' : '▸'}</k>
        <span>${esc(id)}</span><em>${dead ? 'n/a' : wt.toFixed(2)}</em></div>
        <div class="bar2"><s style="width:${pc.toFixed(0)}%"></s></div>`;
    }
    h += '</div>';

    // Quests.
    h += `<div class="sec"><h4>Charters <span>${g.quests.filter((q) => q.done).length} / ${g.quests.length} closed</span></h4>`;
    if (!g.quests.length) h += '<div class="krow"><k>·</k><span>none yet — find an agent</span><em></em></div>';
    for (const q of g.quests) {
      h += `<div class="krow ${q.done ? 'got' : q.active ? 'hot' : ''}">
        <k>${q.done ? '✓' : q.active ? '▸' : '·'}</k>
        <span>${esc(q.title)}</span><em>${esc(q.world)}</em></div>`;
    }
    h += '</div>';

    // The ledger.
    h += '<div class="sec"><h4>Karma ledger <span>append-only</span></h4><div class="log">';
    const tail = g.ledger.slice(-24).reverse();
    if (!tail.length) h += '<div>nothing recorded yet</div>';
    for (const e of tail) {
      const r = KARMA_BY_KIND[e.kind];
      h += `<div><t>${esc(e.at)}</t><b>${esc(r ? r.label : e.kind)}</b> — ${esc(e.what)}${
        e.karma ? ` <t>+${e.karma}</t>` : ''}</div>`;
    }
    h += '</div></div>';
    return h;
  }

  _compass(g) {
    let h = '';
    h += '<div class="sec"><h4>Lobes <span>NEXUS axes</span></h4>';
    for (const l of LOBES) {
      const got = SKILLS.filter((s) => s.lobe === l.id && g.skills.has(s.id)).length;
      const all = SKILLS.filter((s) => s.lobe === l.id).length;
      h += `<div class="lobe"><u style="background:${l.color};color:${l.color}"></u>
        <span>${esc(l.name)} · ${esc(l.axis.toLowerCase())}</span>
        <em>${got}/${all}</em></div>`;
    }
    h += '</div>';

    h += '<div class="sec"><h4>Hokage Council <span>guardian per lobe</span></h4>';
    for (const c of HOKAGE_COUNCIL) {
      const got = SKILLS.filter((s) => c.lobes.includes(s.lobe) && g.skills.has(s.id)).length;
      h += `<div class="krow ${got ? 'got' : ''}"><k>${got ? '✓' : '·'}</k>
        <span>${esc(c.name)} · ${esc(c.guards)}</span><em>${got}</em></div>`;
    }
    h += '</div>';

    h += `<div class="sec"><h4>Deployment crosswalk <span>${g.skills.size} / ${SKILLS.length} pinned</span></h4>`;
    for (const s of SKILLS) {
      const got = g.skills.has(s.id);
      const lobe = LOBES.find((l) => l.id === s.lobe);
      h += `<div class="krow ${got ? 'got' : ''}"><k>${got ? '✦' : '·'}</k>
        <span>${esc(s.name)} — ${esc(s.note)}</span>
        <em style="color:${got ? lobe.color : ''}">${esc(s.worlds.join(','))}</em></div>`;
    }
    h += '</div>';

    h += '<div class="sec"><h4>Cloak <span>visible progression</span></h4>';
    for (const c of CLOAK_LEVELS) {
      const got = g.skills.size >= c.at;
      const now = g.cloak.id === c.id;
      h += `<div class="krow ${now ? 'hot' : got ? 'got' : ''}"><k>${now ? '◈' : got ? '✓' : '·'}</k>
        <span>${esc(c.name)}</span><em>${c.at} skills</em></div>`;
    }
    h += '</div>';

    h += '<div class="sec"><h4>Control loop <span>plan → refine</span></h4>';
    for (const p of CONTROL_PLANETS) {
      h += `<div class="krow"><k>${p.glyph}</k>
        <span>${esc(p.name)} — ${esc(p.does)}</span><em>${esc(p.stage)}</em></div>`;
    }
    h += '</div>';
    return h;
  }

  _steer(g) {
    const st = g.steering, sp = st.spectrum;
    if (!sp) return '<div class="krow"><k>·</k><span>spectrum warming up</span><em></em></div>';
    const p = st.pathology;
    let h = '';
    h += '<div class="sec"><h4>J-Lens <span>live coupling field</span></h4>';
    h += '<canvas id="jcanvas"></canvas>';
    h += `<div class="diag ${p.tone === 'ok' ? 'ok' : ''}">
      <b>${esc(p.label)}</b> — ${esc(p.why)}</div>`;
    h += `<div class="act">
      <button data-act="reroute">Route via Council</button>
      <button data-act="steer">Steer off driver</button>
      <button data-act="ablate">${st.ablation > 0 ? 'Release' : 'Ablate'} pathway</button>
      <button data-act="gate">Request human gate</button></div>`;
    h += '</div>';

    h += '<div class="sec"><h4>Spectrum <span>symmetric part</span></h4>';
    h += `<div class="krow"><k>λ</k><span>dominant eigenvalue — coupled energy</span>
      <em>${sp.dominant.toFixed(3)}</em></div>`;
    h += `<div class="krow"><k>λ</k><span>smallest — the slackest mode</span>
      <em>${sp.smallest.toFixed(3)}</em></div>`;
    h += `<div class="krow"><k>ρ</k><span>spectral radius</span>
      <em>${sp.spectralRadius.toFixed(3)}</em></div>`;
    h += `<div class="krow"><k>Ρ</k><span>participation — systems sharing the mode</span>
      <em>${sp.participation.toFixed(2)} / 8</em></div>`;
    h += `<div class="krow ${sp.circulation > 0.46 ? 'hot' : ''}"><k>↻</k>
      <span>circulation — one-way traffic (skew norm)</span>
      <em>${(sp.circulation * 100).toFixed(0)}%</em></div>`;
    h += `<div class="krow"><k>▶</k><span>driving</span><em>${esc(st.driver.id)}</em></div>`;
    h += `<div class="krow"><k>◁</k><span>quietest</span><em>${esc(st.quietest.id)}</em></div>`;
    h += '</div>';

    h += '<div class="sec"><h4>Axles <span>tap to select a pathway</span></h4>';
    for (let i = 0; i < STEER_SYSTEMS.length; i++) {
      const s = STEER_SYSTEMS[i];
      const w = Math.abs(sp.vectors[0][i]);
      h += `<div class="krow ${st.selected === i ? 'hot' : ''}" data-sys="${i}"
        style="cursor:pointer"><k>${st.selected === i ? '◉' : '○'}</k>
        <span>${esc(s.name)} — ${esc(s.measure)}</span>
        <em>${(w * 100).toFixed(0)}%</em></div>`;
    }
    h += '</div>';

    // Attribution: which agents look derailed and why.
    const sus = st.suspects(g.world, FAB_STYLES[g.world.fab]);
    h += `<div class="sec"><h4>Derailed <span>${sus.length} flagged</span></h4>`;
    if (!sus.length) h += '<div class="krow got"><k>✓</k><span>every cell has work it can draw</span><em></em></div>';
    for (const s of sus) {
      h += `<div class="krow ${s.sev >= 3 ? 'hot' : ''}"><k>${s.sev >= 3 ? '!' : '·'}</k>
        <span>${esc(s.agent.name)} — ${esc(s.why)}</span>
        <em>${esc(s.agent.disc)}</em></div>`;
    }
    h += '</div>';

    h += `<div class="diag">This is a coupling field over observable platform
      events — worlds entered, charters routed, ledger writes, skills pinned, corps
      state. It is <b>not</b> a Jacobian of any model's hidden state and does not
      claim to read one.</div>`;
    return h;
  }

  _corps(g) {
    let h = '';
    const byRealm = {};
    for (const a of AGENT_CORPS) (byRealm[a.realm] = byRealm[a.realm] || []).push(a);
    for (const [realm, list] of Object.entries(byRealm)) {
      const worlds = WORLDS.filter((w) => w.realm === realm).map((w) => w.name).join(' · ');
      h += `<div class="sec"><h4>${esc(realm)} <span>${esc(worlds)}</span></h4>`;
      for (const a of list) {
        const st = a.paused ? '' : a.state === 'EXECUTING' ? 'got'
          : a.state === 'VERIFYING' ? '' : 'hot';
        h += `<div class="krow ${st}"><k>${a.paused ? '‖' : '▸'}</k>
          <span>${esc(a.name)} · ${esc(a.role.toLowerCase())}</span>
          <em>${esc(a.paused ? 'STOOD DOWN' : a.state)}</em></div>`;
      }
      h += '</div>';
    }
    return h;
  }
}
