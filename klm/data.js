/* =========================================================================
 * The data spine.
 *
 * Three sources are fused here and it is worth naming them, because the whole
 * point of this file is that they stop being three things:
 *
 *   AERIS Quasar Expanse   the seven worlds — palettes, ring systems, moons,
 *                          atmospheric stats, and the missions that become
 *                          quests. The geometry and colour of the verse.
 *   JAGANAUGHT v19         the 27-agent Corps, the three inhabited Realms, the
 *                          Norse memory nodes, the J-Lens systems.
 *   TriCalm engine         the discipline that fabrication is a property of the
 *                          ground, not a style applied over it.
 *
 * Everything downstream reads only this file for "what is true about a world",
 * so a world's palette, its buildable ground, its resident agents, its quests
 * and its skills cannot drift apart.
 * ========================================================================= */

/* =========================================================================
 * FABRICATION STYLES
 *
 * The requirement is that fabrication is catered to the planet. Not tinted to
 * match it — *determined* by it. What a crew can build is decided by what the
 * ground will hold, what the air will do to it, and how far away help is.
 *
 * So each style names: the ground it is working, how it gets load into that
 * ground, what it therefore builds, and which of the eleven fabrication phases
 * dominate or drop out entirely. A world with no solid surface cannot pour a
 * foundation, and its phase weights say so with a zero.
 * ========================================================================= */
export const FAB_PHASES = [
  { id: 'site', name: 'SITE PREPARATION', disc: 'civil' },
  { id: 'found', name: 'FOUNDATIONS & CIVILS', disc: 'civil' },
  { id: 'struct', name: 'STRUCTURAL FRAME', disc: 'struct' },
  { id: 'mech', name: 'MECHANICAL ERECTION', disc: 'mech' },
  { id: 'rotate', name: 'ROTATING EQUIPMENT', disc: 'mech' },
  { id: 'pipe', name: 'PIPING & CONDUIT', disc: 'piping' },
  { id: 'eni', name: 'ELECTRICAL & INSTRUMENTATION', disc: 'eni' },
  { id: 'clad', name: 'CLADDING & SEALING', disc: 'struct' },
  { id: 'precom', name: 'PRE-COMMISSIONING', disc: 'qa' },
  { id: 'commis', name: 'COMMISSIONING', disc: 'qa' },
  { id: 'handover', name: 'PERFORMANCE & HANDOVER', disc: 'qa' },
];

export const FAB_STYLES = {
  inferno: {
    label: 'SLAG CAST & HEAT SHIELD',
    ground: 'hammered basalt crust over convecting ash rivers',
    foundation: 'footings cast from cooled slag, refloated when the crust shifts',
    builds: ['refractory shells', 'stilt walkways over the ash', 'thermal spines'],
    // No cladding phase worth the name — everything here IS cladding — and
    // commissioning is the long pole because nothing survives a first firing.
    phase: { site: 1.4, found: 1.3, struct: 1.0, mech: 0.9, rotate: 0.5,
      pipe: 0.8, eni: 0.6, clad: 1.8, precom: 1.2, commis: 1.6, handover: 0.8 },
    hazard: 'crust migration · iron rain',
    palette: { deck: '#7c2d12', trim: '#f59e0b', glow: '#fde68a' },
  },
  ocean: {
    label: 'FLOAT & TETHER',
    ground: 'no reachable bed — liquid ammonia under crushing acid cloud',
    foundation: 'buoyant caissons on catenary tethers; nothing touches bottom',
    builds: ['moored caissons', 'acid-proof liners', 'vapour intake masts'],
    // Foundations are a mooring problem, not an earthworks problem, so `found`
    // is low and `struct` carries the load path instead.
    phase: { site: 0.5, found: 0.4, struct: 1.7, mech: 1.2, rotate: 1.0,
      pipe: 1.5, eni: 1.0, clad: 1.9, precom: 1.1, commis: 1.0, handover: 0.7 },
    hazard: 'acid ingress · pressure creep',
    palette: { deck: '#134e4b', trim: '#2f9e8f', glow: '#e8f7f2' },
  },
  cradle: {
    label: 'GROW & GRAFT',
    ground: 'living soil over bioluminescent shallows',
    foundation: 'shallow rafts and grafted root piles — the ground is an asset',
    builds: ['grown scaffolds', 'reef causeways', 'canopy platforms'],
    // The only world where site prep is *restraint*: the charter is to build
    // without breaking what is already alive.
    phase: { site: 1.6, found: 0.9, struct: 1.0, mech: 0.8, rotate: 0.6,
      pipe: 0.9, eni: 1.1, clad: 0.7, precom: 0.9, commis: 1.0, handover: 1.5 },
    hazard: 'habitat disturbance · consent required',
    palette: { deck: '#38b6c9', trim: '#8fd7e0', glow: '#c9a0e8' },
  },
  rock: {
    label: 'SALVAGE & RE-COMMISSION',
    ground: 'rust steppe and canyon, with dormant terraformers already in it',
    foundation: 'cut-and-cover into canyon walls; reuse the old machine footings',
    builds: ['restarted terraformers', 'buried service runs', 'canyon galleries'],
    // Almost no new structure. The work is precom and commissioning of somebody
    // else's plant, which is a completely different risk profile.
    phase: { site: 1.1, found: 0.7, struct: 0.6, mech: 1.3, rotate: 1.4,
      pipe: 1.2, eni: 1.5, clad: 0.6, precom: 1.9, commis: 1.7, handover: 1.0 },
    hazard: 'unknown legacy state · low gravity handling',
    palette: { deck: '#9a4a22', trim: '#c8763e', glow: '#e8e0cf' },
  },
  gas: {
    label: 'AEROSTAT & TENSION LATTICE',
    ground: 'none — turbulent hydrogen at three gravities',
    foundation: 'buoyancy and tension only; the structure IS the foundation',
    builds: ['aerostat lattices', 'tension rings', 'storm-cell probes'],
    // Site prep and foundations are literally zero: there is no site. Every gram
    // of load goes through the frame.
    phase: { site: 0, found: 0, struct: 2.2, mech: 1.3, rotate: 1.1,
      pipe: 1.2, eni: 1.3, clad: 1.6, precom: 1.2, commis: 1.1, handover: 0.6 },
    hazard: 'hypercane shear · no abort surface',
    palette: { deck: '#d9a44c', trim: '#eadfc4', glow: '#7fa88a' },
  },
  jewel: {
    label: 'CRYSTAL LATTICE & VACUUM WELD',
    ground: 'noble-gas frost over shattered star-matter',
    foundation: 'grown crystal footings, vacuum-welded — no fasteners, no thaw',
    builds: ['grown lattice towers', 'ring-shard harvesters', 'resonance masts'],
    phase: { site: 0.8, found: 1.2, struct: 1.5, mech: 0.9, rotate: 0.5,
      pipe: 0.7, eni: 1.2, clad: 1.0, precom: 1.3, commis: 1.2, handover: 1.1 },
    hazard: 'shard strike · harmonic resonance',
    palette: { deck: '#1d3a8f', trim: '#b3202e', glow: '#f0ede6' },
  },
  ice: {
    label: 'PILE & ICE-ROAD',
    ground: 'frozen ether shell over a dark ocean, on a world tipped on its side',
    foundation: 'piles driven through the shell to bearing, on thermal breaks',
    builds: ['piled platforms', 'ice roads', 'thermal-break galleries'],
    // Foundations dominate and dominate hard: getting load through a shell that
    // will melt under anything warm is the entire engineering problem.
    phase: { site: 1.2, found: 2.1, struct: 1.2, mech: 0.9, rotate: 0.6,
      pipe: 1.0, eni: 0.9, clad: 1.4, precom: 1.0, commis: 0.9, handover: 0.8 },
    hazard: 'shell breakthrough · thermal bridging',
    palette: { deck: '#3a8f7f', trim: '#5fd4c4', glow: '#bff0e8' },
  },
  core: {
    label: 'OBSERVATION ONLY — NO FABRICATION',
    ground: 'there is no ground and there will not be one',
    foundation: 'none permitted inside the last stable orbit',
    builds: ['nothing · instruments only'],
    // Every phase zero. The Core is the one world the Corps may look at and not
    // touch, and the data model says so rather than a note in the UI saying so.
    phase: { site: 0, found: 0, struct: 0, mech: 0, rotate: 0,
      pipe: 0, eni: 0, clad: 0, precom: 0, commis: 0, handover: 0 },
    hazard: 'tidal disruption · causal horizon',
    palette: { deck: '#4527a8', trim: '#f0762e', glow: '#ffd9a0' },
  },
};

/* =========================================================================
 * THE WORLDS
 *
 * Palettes, rings, moons, stats and missions are carried over from the AERIS
 * survey. What is added is the part a walkable world needs and an orbital
 * diagram does not: relief parameters, a sea level, a sky, a prop mix, and the
 * fabrication style its ground implies.
 * ========================================================================= */
export const WORLDS = [
  {
    id: 'vultron', name: 'VULTRON', sub: 'THE ASHEN ANVIL', sector: 'AERIS-01',
    fab: 'inferno', realm: 'Sayajin', chapter: 'OPTIMIZE',
    desc: 'A furnace world of ash plumes and iron squalls hammered flat by relentless convection storms.',
    radius: 46, seaLevel: -0.55, bandJitter: 0.30,
    palette: { shore: '#7c2d12', low: '#5b2410', mid: '#8f3a16', high: '#c2410c',
      liquid: '#f59e0b' },
    sky: { zenith: '#2a0f08', horizon: '#c2410c', sun: '#ffd9a0', star: 0.5 },
    ambient: { sky: '#5a2413', ground: '#2a0f08' },
    // Ridged and violent: this is a hammered crust, so the upland term is sharp
    // and the sea (lava) sits low in the basins.
    relief: { contFreq: 1.5, contAmp: 3.4, landBias: 0.05, upFreq: 3.9, upAmp: 2.6,
      ridge: 0.85, detFreq: 12, detAmp: 0.16 },
    props: ['spire', 'slagBlock', 'ember'],
    stats: { gravity: ['1.32 g', 7], atmosphere: ['Ash Veil', 5], temp: ['+540 °C', 9],
      moons: ['0', 0], magnetic: ['Weak', 2], difficulty: ['Extreme', 10] },
    rings: null, moons: [],
    missions: [
      ['CINDER RUN', 'Skim the glowing ash rivers of the equatorial forge.', 'speed'],
      ['ANVIL CORE', 'Drill a thermal probe into the hammered crust.', 'forge'],
      ['SQUALL WATCH', 'Chart the iron-rain convection cells from orbit.', 'observe'],
    ],
  },
  {
    id: 'syran', name: 'SYRAN', sub: 'THE POISON PEARL', sector: 'AERIS-02',
    fab: 'ocean', realm: 'Grandline', chapter: 'EXPLORE',
    desc: 'Enshrouded in iridescent jade clouds, a world of crushing pressure masking deep oceans of liquid ammonia.',
    radius: 52, seaLevel: 0.85, bandJitter: 0.18,
    palette: { shore: '#134e4b', low: '#0b5e54', mid: '#2f9e8f', high: '#8fd7e0',
      liquid: '#0e6b62' },
    sky: { zenith: '#0a3b38', horizon: '#7fd4c2', sun: '#e8f7f2', star: 0.2 },
    ambient: { sky: '#2f6f68', ground: '#0a2b28' },
    // Drowned: a high sea level over gentle relief, so most of the surface is
    // shallows and the land that does show is archipelago.
    relief: { contFreq: 1.1, contAmp: 2.6, landBias: -0.10, upFreq: 3.1, upAmp: 1.1,
      ridge: 0.25, detFreq: 9, detAmp: 0.12 },
    props: ['caisson', 'mast', 'kelp'],
    stats: { gravity: ['1.05 g', 6], atmosphere: ['98% Acid', 9], temp: ['+312 °C', 8],
      moons: ['1', 1], magnetic: ['None', 0], difficulty: ['Extreme', 10] },
    rings: null,
    moons: [{ name: 'Vessel', r: 0.16, d: 3.6, s: 0.8, c: '#cbd5e1' }],
    missions: [
      ['VAPOR DRIFT', 'Float a balloon probe through the temperate acid layer.', 'observe'],
      ['CRUSH ASCENT', 'Climb the highest pressure-ridge through searing heat.', 'climb'],
      ['STATIC SURVEY', 'Catalogue the constant storms in the upper atmosphere.', 'observe'],
    ],
  },
  {
    id: 'aerilion', name: 'AERILION', sub: 'THE CRADLE', sector: 'AERIS-03',
    fab: 'cradle', realm: 'Shinobi', chapter: 'BUILD',
    desc: 'A thriving pale aqua world. Violet flora and bioluminescent oceans shelter a multi-species coalition.',
    radius: 54, seaLevel: 0.15, bandJitter: 0.24,
    palette: { shore: '#e9c88a', low: '#4bb07a', mid: '#38b6c9', high: '#c9a0e8',
      liquid: '#2f8fb0' },
    sky: { zenith: '#1d5f86', horizon: '#a9e6ee', sun: '#fff3d8', star: 0.25 },
    ambient: { sky: '#7fc9dd', ground: '#2c5a4a' },
    // The home world, and the tuning shows it: rolling, generous, easy to read
    // and easy to run. This is the one the reference footage is set on.
    relief: { contFreq: 1.25, contAmp: 3.0, landBias: 0.12, upFreq: 3.4, upAmp: 1.7,
      ridge: 0.35, detFreq: 10, detAmp: 0.15 },
    props: ['house', 'tree', 'lantern', 'rock'],
    stats: { gravity: ['1.00 g', 6], atmosphere: ['Oxidized mix', 6], temp: ['+18 °C', 5],
      moons: ['3', 3], magnetic: ['Strong', 7], difficulty: ['Easy', 2] },
    rings: null,
    moons: [
      { name: 'Zyphos', r: 0.22, d: 3.6, s: 0.75, c: '#efe8d8' },
      { name: 'Kharon IX', r: 0.15, d: 4.4, s: -0.55, c: '#d8d2c4' },
      { name: 'Vortyx', r: 0.11, d: 5.1, s: 1.15, c: '#c9b98f' },
    ],
    missions: [
      ['ABYSSAL SWEEP', 'Document glowing bioluminescent reefs from the shore.', 'observe'],
      ['AETHER RUN', 'Chase the plasma light shows above the magnetic poles.', 'speed'],
      ['CELENE HOP', 'Stage a quick visit to the shattered moon.', 'travel'],
    ],
  },
  {
    id: 'doth', name: 'DOTH', sub: 'THE CRIMSON WASTES', sector: 'AERIS-04',
    fab: 'rock', realm: 'Sayajin', chapter: 'OPTIMIZE',
    desc: 'Rust-blown steppes and jagged canyons under a maroon sky. Ancient terraforming engines lie dormant here.',
    radius: 50, seaLevel: -1.4, bandJitter: 0.26,
    palette: { shore: '#b98a5a', low: '#9a4a22', mid: '#c8763e', high: '#e8e0cf',
      liquid: '#5d7d6a' },
    sky: { zenith: '#3a1a18', horizon: '#c08a5e', sun: '#ffdcb0', star: 0.6 },
    ambient: { sky: '#8a5a44', ground: '#3a2018' },
    // Dry: the sea level is well below the deepest basin, so `liquid` only ever
    // appears in the very lowest canyon floors as standing brine.
    relief: { contFreq: 1.35, contAmp: 3.6, landBias: 0.20, upFreq: 4.2, upAmp: 2.3,
      ridge: 0.70, detFreq: 11, detAmp: 0.20 },
    props: ['terraformer', 'mesa', 'rock', 'antenna'],
    stats: { gravity: ['0.42 g', 2], atmosphere: ['Dense Smog', 3], temp: ['−45 °C', 3],
      moons: ['1', 1], magnetic: ['Very Weak', 1], difficulty: ['Hard', 8] },
    rings: { inner: 1.45, outer: 2.35, c1: '#e9dfca', c2: '#c9b898' },
    moons: [{ name: 'Elyndra', r: 0.22, d: 4.6, s: 0.6, c: '#f2ecd9' }],
    missions: [
      ['ENGINE RUN', 'Traverse the ancient artificial canyon systems.', 'speed'],
      ['APEX CLIMB', 'Summit the largest dormant terraformer module.', 'climb'],
      ['CORE SCAN', 'Search for active power beneath the southern hemisphere.', 'forge'],
    ],
  },
  {
    id: 'vorantis', name: 'VORANTIS', sub: 'THE STORM SOVEREIGN', sector: 'AERIS-05',
    fab: 'gas', realm: 'Sayajin', chapter: 'OPTIMIZE',
    desc: 'A colossal gas giant wracked by eternal tempest cells, reigning over an armada of moons.',
    radius: 68, seaLevel: 1.9, bandJitter: 0.45,
    palette: { shore: '#eadfc4', low: '#d9a44c', mid: '#b8622e', high: '#f4eddc',
      liquid: '#7fa88a' },
    sky: { zenith: '#2c2413', horizon: '#d9a44c', sun: '#fff0cc', star: 0.35 },
    ambient: { sky: '#b08a4a', ground: '#3a2e18' },
    // A cloud deck rather than a surface: almost no continental variation, heavy
    // banding, and a "sea level" high enough that the walkable band is the tops
    // of the storm cells.
    relief: { contFreq: 0.9, contAmp: 2.2, landBias: 0.40, upFreq: 2.4, upAmp: 2.9,
      ridge: 0.20, detFreq: 7, detAmp: 0.22 },
    props: ['aerostat', 'lattice', 'vane'],
    stats: { gravity: ['3.12 g', 10], atmosphere: ['Turbulent H₂', 8], temp: ['−120 °C', 2],
      moons: ['4', 4], magnetic: ['Extreme', 10], difficulty: ['Extreme', 10] },
    rings: null,
    moons: [
      { name: 'Virellion', r: 0.24, d: 5.0, s: 0.55, c: '#efe9d6' },
      { name: 'Noctyra', r: 0.18, d: 5.9, s: -0.4, c: '#d9d2c0' },
      { name: 'Tesseron', r: 0.15, d: 6.7, s: 0.85, c: '#e5dbc2' },
      { name: 'Dravion', r: 0.2, d: 7.6, s: -0.65, c: '#efeadb' },
    ],
    missions: [
      ['VORTEX DIVE', 'Plunge a probe into the centuries-old hypercane.', 'observe'],
      ['GLACIA DRILL', 'Pierce the ice shell to sample the hidden dark ocean.', 'forge'],
      ['IGNIS MAP', 'Catalog active plasma eruptions on the violent moon.', 'travel'],
    ],
  },
  {
    id: 'nyxia', name: 'NYXIA', sub: 'THE CROWNED JEWEL', sector: 'AERIS-06',
    fab: 'jewel', realm: 'Grandline', chapter: 'EXPLORE',
    desc: 'An elegant world adorned with crystalline rings of shattered star-matter and shimmering aurorae.',
    radius: 58, seaLevel: -0.25, bandJitter: 0.20,
    palette: { shore: '#f0ede6', low: '#1d3a8f', mid: '#4a6fc0', high: '#f4f1ea',
      liquid: '#b3202e' },
    sky: { zenith: '#0a1030', horizon: '#5a72b8', sun: '#eef2ff', star: 1.1 },
    ambient: { sky: '#4a62a8', ground: '#141a3a' },
    relief: { contFreq: 1.2, contAmp: 3.1, landBias: 0.14, upFreq: 3.8, upAmp: 2.1,
      ridge: 0.62, detFreq: 13, detAmp: 0.13 },
    props: ['crystal', 'mast', 'shard'],
    stats: { gravity: ['1.25 g', 7], atmosphere: ['Noble Gases', 7], temp: ['−155 °C', 2],
      moons: ['2', 2], magnetic: ['Very Strong', 9], difficulty: ['Moderate', 5] },
    rings: { inner: 1.5, outer: 2.6, c1: '#cfe8f7', c2: '#9db8d8' },
    moons: [
      { name: 'Orphelios', r: 0.2, d: 4.6, s: 0.7, c: '#d8dde3' },
      { name: 'Xanthea', r: 0.15, d: 5.6, s: -0.5, c: '#e6e9ee' },
    ],
    missions: [
      ['HALO DIVE', 'Navigate the crystalline rings to study anomaly shards.', 'travel'],
      ['AURA SURVEY', 'Land in the northern basins and analyze exotic liquids.', 'observe'],
      ['RESONANCE WATCH', 'Track harmonic vibrations through the atmosphere.', 'observe'],
    ],
  },
  {
    id: 'glacies', name: 'GLACIES', sub: 'THE SILENT WARDEN', sector: 'AERIS-07',
    fab: 'ice', realm: 'Shinobi', chapter: 'BUILD',
    desc: 'A pale cyan orb tipped entirely on its side, rolling through the outer dark with dust-thin bands.',
    radius: 56, seaLevel: 0.45, bandJitter: 0.16,
    palette: { shore: '#dff5f0', low: '#bff0e8', mid: '#5fd4c4', high: '#f4ffff',
      liquid: '#2d7f74' },
    sky: { zenith: '#071e2a', horizon: '#7fd0d8', sun: '#e8fbff', star: 0.95 },
    ambient: { sky: '#6ab8c4', ground: '#12303a' },
    relief: { contFreq: 1.15, contAmp: 2.8, landBias: 0.10, upFreq: 3.0, upAmp: 1.5,
      ridge: 0.30, detFreq: 9, detAmp: 0.10 },
    props: ['pile', 'berg', 'crystal'],
    stats: { gravity: ['0.92 g', 5], atmosphere: ['Frozen Ether', 8], temp: ['−210 °C', 1],
      moons: ['3', 3], magnetic: ['Fractured', 5], difficulty: ['Hard', 8] },
    rings: { inner: 1.5, outer: 2.1, c1: '#e8f4f2', c2: '#cfe4e0', ghost: true },
    moons: [
      { name: 'Umbrix', r: 0.2, d: 3.9, s: 0.85, c: '#b9c1c8' },
      { name: 'Caelora', r: 0.16, d: 4.7, s: -0.55, c: '#d6c39a' },
      { name: 'Myrith', r: 0.12, d: 5.5, s: 1.2, c: '#c4cbd1' },
    ],
    missions: [
      ['AXIAL ORBIT', 'Map the fractured magnetic poles.', 'observe'],
      ['DUST TRACE', 'Profile the barely-visible ghost rings up close.', 'travel'],
      ['VERA SURVEY', 'Catalogue the unnatural geometric cliffs.', 'climb'],
    ],
  },
];

/**
 * The Core. Kept out of WORLDS because it is not a place you land — it is what
 * every world orbits, it has no surface, and its fabrication style is the only
 * one whose every phase weight is zero. Treating it as an eighth walkable world
 * would have meant special-casing it in six systems instead of one.
 */
export const CORE = {
  id: 'core', name: 'LOWKI CORE', sub: 'THE QUASAR HORIZON', sector: 'AERIS-00',
  fab: 'core',
  desc: 'A supermassive singularity dressed in a relativistically-beamed accretion disk. Every world of the Expanse orbits its silent gravity.',
  stats: { gravity: ['∞ (4.3M M☉)', 10], atmosphere: ['Plasma Torus', 10],
    temp: ['20 000 K', 10], moons: ['7', 7], magnetic: ['Relativistic', 10],
    difficulty: ['Impossible', 10] },
  missions: [
    ['HORIZON DIVE', 'Ride the photon ring down past the last stable orbit.', 'observe'],
    ['DOPPLER FRAME', 'Capture the blue-shifted approaching limb of the disk.', 'observe'],
    ['LENSING SURVEY', 'Map background stars smeared by gravitational lensing.', 'observe'],
  ],
};

export const WORLD_BY_ID = Object.fromEntries(
  WORLDS.concat([CORE]).map((w) => [w.id, w]));

/* =========================================================================
 * THE AGENT CORPS — 27, from JAGANAUGHT v19, stationed across the verse.
 *
 * `disc` is the fabrication discipline the agent draws work from, which is what
 * connects the roster to FAB_PHASES: an agent is not "assigned to a planet" in
 * the abstract, it draws the phases its discipline owns on the worlds its realm
 * holds. A gas giant with zero foundation weight will starve its civil agents,
 * and that starvation is visible in the steering matrix rather than hidden.
 * ========================================================================= */
const CORPS_RAW = [
  ['Shinobi', 'MiniMihaki', 'Adaptive Builder', 'Design systems + component craft', 'struct'],
  ['Shinobi', 'MiniMihako', 'Precision Builder', 'Architecture + secure deploy', 'struct'],
  ['Shinobi', 'Dev-Loki', 'Autonomous Orchestrator', 'Sidequest routing + memory sync', 'eni'],
  ['Shinobi', 'Kakagshi', 'Chief Reviewer', 'Review + coaching', 'qa'],
  ['Shinobi', 'Shikanoa', 'Strategy Chief', 'Sprint logic + issue triage', 'qa'],
  ['Shinobi', 'Itachig', 'Threat Sentinel', 'Security + exploit scan', 'qa'],
  ['Shinobi', 'Jiraiyo', 'Field Research Sage', 'Research + prototypes', 'mech'],
  ['Shinobi', 'Gaiyo', 'Training Captain', 'Practice + stamina loops', 'civil'],
  ['Shinobi', 'Minatora', 'Blink Architect', 'Instant deploy + routes', 'eni'],
  ['Sayajin', 'Vageta', 'Vanguard Commander', 'Performance + pressure testing', 'mech'],
  ['Sayajin', 'Gosun', 'Research Dev Scout', 'Discovery + experiments', 'mech'],
  ['Sayajin', 'Gojutsu', 'Model Fusion Engineer', 'Agent + model fusion', 'eni'],
  ['Sayajin', 'Gohana', 'Insight Analyst', 'Evaluation + metrics', 'qa'],
  ['Sayajin', 'Trunket', 'Time Branch Keeper', 'Versioning + migration', 'eni'],
  ['Sayajin', 'Bulmara', 'Capsule Lab Chief', 'Tools + data labs', 'struct'],
  ['Sayajin', 'Picoroid', 'Tactical Mentor', 'Regeneration + teaching', 'civil'],
  ['Sayajin', 'Brolon', 'Load-Test Enforcer', 'Scale + endurance', 'civil'],
  ['Sayajin', 'Keflara', 'Burst Fusion Striker', 'Rapid build sprints', 'piping'],
  ['Grandline', 'LowKey', 'Model-Fusion Captain', 'Vision + voyage routing', 'eni'],
  ['Grandline', 'Zoroh', 'Repo Hunter', 'Refactor + bug hunt', 'struct'],
  ['Grandline', 'Chief-Dev Sanjii', 'Research Chef', 'Synthesis + playbooks', 'piping'],
  ['Grandline', 'Namiya', 'Navigator of Markets', 'Finance + external conditions', 'qa'],
  ['Grandline', 'Usaro', 'Observability Sniper', 'Logs + anomalies', 'qa'],
  ['Grandline', 'Robina', 'Archive Scholar', 'Docs + semantic knowledge', 'eni'],
  ['Grandline', 'Franko', 'Systems Shipwright', 'Platform + CI/CD', 'struct'],
  ['Grandline', 'Choppa', 'Health Monitor', 'Diagnostics + recovery', 'qa'],
  ['Grandline', 'Jinbay', 'Tide Network Master', 'Team stability + throughput', 'piping'],
];

export const AGENT_CORPS = CORPS_RAW.map((a, i) => ({
  id: 'agent-' + String(i + 1).padStart(2, '0'),
  realm: a[0], name: a[1], role: a[2], focus: a[3], disc: a[4],
  // Deterministic starting state so a reload does not reshuffle the board.
  state: i % 5 === 0 ? 'TRANSIT' : i % 4 === 0 ? 'VERIFYING' : 'EXECUTING',
  xp: 80 + (i * 37) % 480,
  phase: (i / 27) * Math.PI * 2,
  auto: true, paused: false,
}));

/* =========================================================================
 * THE NEXUS COMPASS — 6 lobes.
 *
 * The lobe is the unit of routing: a quest pins a skill, a skill belongs to a
 * lobe, and a lobe has an axis that a planet's stats can push on. That chain is
 * what makes "walk this world, get better at this thing" a rule rather than a
 * coincidence.
 * ========================================================================= */
export const LOBES = [
  { id: 'steering', name: 'STEERING · INTERP', axis: 'ADAPTABILITY', color: '#00D4FF' },
  { id: 'engineering', name: 'ENGINEERING', axis: 'PRECISION', color: '#FFB84D' },
  { id: 'sports', name: 'SPORTS SCIENCE', axis: 'MOBILITY', color: '#4DFF9D' },
  { id: 'neuro', name: 'NEURO · BRAIN', axis: 'RESILIENCE', color: '#A06BFF' },
  { id: 'markets', name: 'MARKETS · FINOPS', axis: 'ENDURANCE', color: '#4D8DFF' },
  { id: 'energy', name: 'ENERGY PRODUCTION', axis: 'POWER', color: '#FF5566' },
];

/**
 * THE MULTI-HOKAGE COUNCIL — the guardian per lobe.
 *
 * Carried over from the Minato Sensei council, where five guardians protect a
 * real-world village across engineering, markets, sport and mental health. That
 * mapping is the missing link between the council and the compass: a lobe is not
 * an abstract axis, it is a seat with somebody in it, and when a lobe's agents
 * derail it is that seat the steering framework routes through.
 *
 * Five guardians, six lobes — Minato holds two, because steering is his and the
 * verse is named after him.
 */
export const HOKAGE_COUNCIL = [
  { id: 'minato', name: 'MINATO', title: 'The Fourth', lobes: ['steering'],
    guards: 'orchestration · routing · the dispatch itself', accent: '#ffb35c' },
  { id: 'kakashi', name: 'KAKASHI', title: 'The Copy Ninja', lobes: ['engineering'],
    guards: 'review · precision · the thing being built', accent: '#8fd7e0' },
  { id: 'naruto', name: 'NARUTO', title: 'The Will of Fire', lobes: ['sports'],
    guards: 'mobility · endurance · never sitting down', accent: '#ff9a3c' },
  { id: 'itachi', name: 'ITACHI', title: 'The Watcher', lobes: ['neuro'],
    guards: 'resilience · insight · the cost nobody logged', accent: '#b98cff' },
  { id: 'hashirama', name: 'HASHIRAMA', title: 'The First', lobes: ['energy', 'markets'],
    guards: 'power · growth · what the village runs on', accent: '#6fe3b0' },
];

/**
 * The deployment crosswalk. Each skill declares the lobe it belongs to, the
 * worlds it can be earned on, and — where it has one — the thing it changes
 * about the player. A skill with a `grant` is a mechanical unlock; a skill
 * without one is knowledge, and the monitor is honest about which is which.
 */
export const SKILLS = [
  { id: 'chakra-control', lobe: 'neuro', name: 'Chakra Control', worlds: ['aerilion'],
    grant: { chakraRegen: 1.5 }, note: 'Chakra returns half again as fast.' },
  { id: 'flash-step', lobe: 'sports', name: 'Flash Step', worlds: ['aerilion', 'doth'],
    grant: { speed: 1.14 }, note: 'The Blink Architect’s footwork. Faster on every surface.' },
  { id: 'ash-tread', lobe: 'energy', name: 'Ash Tread', worlds: ['vultron'],
    grant: { hazard: 0.6 }, note: 'Crust migration and iron rain cost less.' },
  { id: 'pressure-seal', lobe: 'engineering', name: 'Pressure Seal', worlds: ['syran'],
    grant: { wade: 0.6 }, note: 'Deep water slows you far less.' },
  { id: 'salvage-eye', lobe: 'engineering', name: 'Salvage Eye', worlds: ['doth'],
    note: 'Dormant plant reads as re-commissionable rather than as scrap.' },
  { id: 'storm-sense', lobe: 'steering', name: 'Storm Sense', worlds: ['vorantis'],
    note: 'Tempest cells announce themselves a beat before they arrive.' },
  { id: 'lattice-weld', lobe: 'engineering', name: 'Lattice Weld', worlds: ['nyxia'],
    note: 'Vacuum welding without a jig.' },
  { id: 'rime-pile', lobe: 'engineering', name: 'Rime Pile', worlds: ['glacies'],
    note: 'Load through a shell that will not hold heat.' },
  { id: 'kurama-cloak', lobe: 'neuro', name: 'Kurama Cloak', worlds: ['aerilion', 'vultron'],
    grant: { sprint: 1.22, aura: '#ff5a1f' }, note: 'The run the whole verse recognises.' },
  { id: 'council-routing', lobe: 'steering', name: 'Council Routing', worlds: ['aerilion'],
    note: 'Hand a stuck agent to the seat that can move it.' },
  { id: 'jacobian-read', lobe: 'steering', name: 'Jacobian Read', worlds: ['core'],
    note: 'Read the coupling field as a spectrum rather than as a picture.' },
  { id: 'horizon-nerve', lobe: 'neuro', name: 'Horizon Nerve', worlds: ['core'],
    grant: { chakraMax: 1.25 }, note: 'Standing at the last stable orbit and not flinching.' },
];

export const SKILL_BY_ID = Object.fromEntries(SKILLS.map((s) => [s.id, s]));

/* =========================================================================
 * THE CLOAK
 *
 * The visible record of the journey. Every level is earned by a skill count, and
 * every level changes something you can see from behind — which is the whole
 * point, because that is the view the player spends the game looking at.
 * ========================================================================= */
export const CLOAK_LEVELS = [
  { at: 0, id: 'sealed', name: 'SEALED', cloth: '#dcd8cf', flame: '#8a5a48',
    rise: 0.0, kanji: 0, aura: '#5fd8ff', auraGain: 0.0 },
  { at: 1, id: 'marked', name: 'MARKED', cloth: '#e8e4da', flame: '#a8452f',
    rise: 0.12, kanji: 0, aura: '#7fd8ff', auraGain: 0.25 },
  { at: 3, id: 'hokage', name: 'FOURTH HOKAGE', cloth: '#f4f1ea', flame: '#c0342b',
    rise: 0.30, kanji: 1, aura: '#ffb35c', auraGain: 0.55 },
  { at: 6, id: 'kurama', name: 'KURAMA MANTLE', cloth: '#fff6e8', flame: '#e8471f',
    rise: 0.52, kanji: 1, aura: '#ff9a3c', auraGain: 0.85 },
  { at: 9, id: 'karma', name: 'KARMA ASCENDANT', cloth: '#fffdf6', flame: '#ff5a1f',
    rise: 0.74, kanji: 1, aura: '#ffd166', auraGain: 1.15 },
];

/* =========================================================================
 * KARMA
 *
 * The constitution is that value must be visible and consented. So the ledger
 * is append-only, every entry names what produced it, and there is no hidden
 * multiplier anywhere — the numbers below are the whole scoring model.
 * ========================================================================= */
export const KARMA_RULES = [
  { kind: 'observe', karma: 1, label: 'Observation recorded' },
  { kind: 'talk', karma: 1, label: 'Agent consulted' },
  { kind: 'quest-open', karma: 0, label: 'Charter accepted' },
  { kind: 'quest-done', karma: 5, label: 'Charter delivered' },
  { kind: 'skill', karma: 8, label: 'Skill pinned to the compass' },
  { kind: 'cloak', karma: 12, label: 'Cloak advanced' },
  { kind: 'world', karma: 15, label: 'World surveyed' },
  { kind: 'steer', karma: 3, label: 'Agent re-coupled' },
  { kind: 'gate', karma: 0, label: 'Human gate requested' },
];
export const KARMA_BY_KIND = Object.fromEntries(KARMA_RULES.map((r) => [r.kind, r]));

/* =========================================================================
 * THE CONTROL LOOP — nine operational planets.
 *
 * Not places. These are the stages of plan → build → execute → review → refine,
 * named after the classical planets the way the v19 board does, and each one
 * owns a concrete action in the simulation. The loop is what the Monitor is
 * monitoring.
 * ========================================================================= */
export const CONTROL_PLANETS = [
  { id: 'mercury', glyph: '☿', name: 'Signal Intake', stage: 'PLAN',
    does: 'Every observation, footfall and conversation is recorded with its provenance.' },
  { id: 'venus', glyph: '♀', name: 'Joyous Karma Field', stage: 'PLAN',
    does: 'Value becomes visible karma. Nothing is scored in secret.' },
  { id: 'earth', glyph: '⊕', name: 'Builder Studio', stage: 'BUILD',
    does: 'Charters become artifacts: briefs, routes, episode cards.' },
  { id: 'mars', glyph: '♂', name: 'Forge & Simulation', stage: 'BUILD',
    does: 'The fabrication phases run, and the quality gates run with them.' },
  { id: 'jupiter', glyph: '♃', name: 'Agent Council', stage: 'EXECUTE',
    does: 'Work is routed across the 27-agent Corps. Stuck agents are re-coupled here.' },
  { id: 'saturn', glyph: '♄', name: 'NEXUS Skill Compass', stage: 'EXECUTE',
    does: 'Skills are pinned, and the smallest useful next route is chosen.' },
  { id: 'uranus', glyph: '♅', name: 'External Evidence', stage: 'REVIEW',
    does: 'Permissioned outside references. Nothing arrives silently.' },
  { id: 'neptune', glyph: '♆', name: 'Human Review Horizon', stage: 'REVIEW',
    does: 'The gate. No non-reversible step passes without a person.' },
  { id: 'pluto', glyph: '♇', name: 'Memory Archive', stage: 'REFINE',
    does: 'Portable evidence, and the reason recorded for the next decision.' },
];

/* =========================================================================
 * THE STEERING SYSTEMS — the eight axes of the coupling matrix.
 *
 * These are the wheels the framework can actually turn. Each declares how its
 * coupling is measured, because a matrix built from a seed is a picture and a
 * matrix built from state is an instrument.
 * ========================================================================= */
export const STEER_SYSTEMS = [
  { id: 'orbit', name: 'Orbit', measure: 'world selection + transit activity' },
  { id: 'panels', name: 'Panels', measure: 'monitor surfaces opened and read' },
  { id: 'routes', name: 'Routes', measure: 'charter hand-offs between agents' },
  { id: 'agents', name: 'Agents', measure: 'corps execution and verification' },
  { id: 'memory', name: 'Memory', measure: 'ledger writes and archive reads' },
  { id: 'skills', name: 'Skills', measure: 'pins on the compass' },
  { id: 'cron', name: 'Cron', measure: 'scheduled sidequests firing' },
  { id: 'sonar', name: 'Sonar', measure: 'contacts raised by observation' },
];

/**
 * What can go wrong with delegation, how to see it in the spectrum, and what to
 * do about it. Thresholds are on the quantities `spectrum()` returns, so the
 * diagnosis is a measurement rather than a vibe.
 */
export const PATHOLOGIES = [
  {
    id: 'warming', label: 'WARMING UP', tone: 'ok',
    // Checked first, and it matters. A board that has barely had an event on it
    // reads as pure one-way circulation — technically true and completely
    // useless, because one hand-off with nothing to close against IS a loop.
    // Diagnosing before there is anything to diagnose is how an instrument loses
    // its credibility on the first frame a user sees it.
    test: (s) => s.energy !== undefined && s.energy < 9,
    why: 'Too few active pathways to read a spectrum. Walk, talk, take a charter.',
    fix: 'Hold course',
    action: 'hold',
  },
  {
    id: 'stuck', label: 'STUCK', tone: 'warn',
    // Almost no coupling anywhere: the board has energy nowhere to go.
    test: (s) => s.dominant < 0.55,
    why: 'Coupling has collapsed. Work is on the books and nothing is drawing it.',
    fix: 'Route through the Council',
    action: 'reroute',
  },
  {
    id: 'circular', label: 'CIRCULAR HAND-OFF', tone: 'warn',
    // Most of the field is one-way circulation rather than mutual coupling.
    test: (s) => s.circulation > 0.46,
    why: 'Charters are going round a loop. Every agent is handing on and none is closing.',
    fix: 'Ablate the loop',
    action: 'ablate',
  },
  {
    id: 'cascade', label: 'RUNAWAY CASCADE', tone: 'warn',
    // One dominant mode carrying almost everything, concentrated on few systems.
    test: (s) => s.dominant > 3.1 && s.participation < 3.4,
    why: 'One pathway is driving the whole board. The rest of the Corps are passengers.',
    fix: 'Gate at Neptune',
    action: 'gate',
  },
  {
    id: 'healthy', label: 'NOMINAL', tone: 'ok',
    test: () => true,
    why: 'Energy is spread across the Corps and closing. Delegation is holding.',
    fix: 'Hold course',
    action: 'hold',
  },
];
