/* === Kurama · Quasar Horizon — flattened module (classic script, shared global scope). THREE + postprocessing provided as globals by the boot shim in index.html. === */

/* ====================================================================
   KURAMA · QUASAR HORIZON  — unified single-file globe game
   A walkable planet orbiting a quasar. Original characters & world.
   Fuses: Elbaf-Horizon globe roam + RasenForge quasar backdrop.
==================================================================== */

const PAL={hot:0xFFE9CC,gold:0xFFB068,ember:0xF2843D,crimson:0xF2554B,soul:0x9B7CF6,
  frost:0xCFE3FF,teal:0x3DC9C2,void:0x05060F,void2:0x0A0506};
const PLANET_R=32, CHAR_H=1.25, GRAV=58, SPD=9.2, SPRINT=15.5, JUMP=17;
const TAU=Math.PI*2, DEG=Math.PI/180;
const TOTAL=6;

// ---- courier roster (original characters) ----
const ROSTER=[
 /* — Shinobi guild (legacy courier chain + one new runner) — */
 {id:'kuro',  name:'Kuro',    title:'Nine-Tail Courier',  emo:'🦊',color:0xF2843D,hair:0x2A1A0A,accent:0xFFE9CC,kind:'fox',  ability:'Foxfire Sprint',ward:'Default Foxfire',realm:'shinobi'},
 {id:'raijin',name:'Raijin',  title:'Storm Dispatcher',    emo:'⚡',color:0xC0C8D8,hair:0xD8D8E0,accent:0x5AC8F2,kind:'spike',ability:'Thunder Step', ward:'Storm Cloak',realm:'shinobi'},
 {id:'yuki',  name:'Yuki',    title:'Mist Runner',         emo:'🌑',color:0x232338,hair:0x0A0A12,accent:0xF2554B,kind:'long', ability:'Shadow Step',  ward:'Shadow Wrap',realm:'shinobi'},
 {id:'goro',  name:'Goro',    title:'Iron Porter',         emo:'⛰',color:0x2E8B3A,hair:0x0A0A0A,accent:0x884422,kind:'bowl', ability:'Mountain Set',  ward:'Mountain Gi',realm:'shinobi'},
 {id:'aria',  name:'Aria',    title:'Frost Envoy',         emo:'❄',color:0xD8E4F0,hair:0xE8C060,accent:0x66AADD,kind:'side', ability:'Glacier Seal', ward:'Frost Mantle',realm:'shinobi'},
 {id:'taro',  name:'Taro',    title:'Spark Carrier',       emo:'☀',color:0xFF8C2A,hair:0x1A0A0A,accent:0x2255AA,kind:'spike',ability:'Solar Flare',  ward:'Solar Garb',realm:'shinobi'},
 {id:'sage',  name:'Viridian',title:'Cliff Mystic',        emo:'🌿',color:0x4A7A4A,hair:0x1A5A3A,accent:0xAADDAA,kind:'turban',ability:'Ancient Ward',ward:'Sage Robes',realm:'shinobi'},
 {id:'whisk', name:'Whisker', title:'Orb Familiar',        emo:'🔮',color:0x8B4513,hair:0x4A2A0A,accent:0x9B7CF6,kind:'cat',  ability:'Crystal Scry', ward:'Arcane Cape',realm:'shinobi'},
 {id:'rockli',name:'Rockli',  title:'Taijutsu Runner',     emo:'🥋',color:0x3AA04A,hair:0x101010,accent:0xFF9A3D,kind:'bowl', ability:'Eight Gates Dash',ward:'Green Beast Gi',realm:'shinobi'},
 /* — Grandline crew (CALM.monitor full-body agents) — */
 {id:'lowkey',name:'LowKey',  title:'Model-Fusion Captain',emo:'⚓',color:0x8F1F2E,hair:0x191420,accent:0xD8A24A,kind:'captain',ability:'Fusion Broadside',ward:"Captain's Longcoat",realm:'pirate'},
 {id:'zoroh', name:'Zoroh',   title:'Repo Hunter',         emo:'⚔',color:0x1F5C46,hair:0x143326,accent:0xBFD8C9,kind:'blade',ability:'Three-Branch Cut',ward:'Santoryu Rig',realm:'pirate'},
 {id:'sanjii',name:'Sanjii',  title:'Research Chef',       emo:'🔥',color:0x14161F,hair:0xE8C25A,accent:0xD8A24A,kind:'swoop',ability:'Diable Sauté',ward:'Black Service Suit',realm:'pirate'},
 {id:'namiya',name:'Namiya',  title:'Navigator of Markets',emo:'🧭',color:0xE8E2F0,hair:0x3A2A5C,accent:0x9B7CF6,kind:'long',ability:'Climate Ledger',ward:'Mikan Mantle',realm:'pirate'},
 {id:'usaro', name:'Usaro',   title:'Observability Sniper',emo:'🎯',color:0x2A2620,hair:0x241A12,accent:0x8A6A42,kind:'widehat',ability:'Long-Scope Truth',ward:'Sogeking Poncho',realm:'pirate'},
 {id:'robina',name:'Robina',  title:'Archive Scholar',     emo:'📜',color:0x221D2C,hair:0x160F1A,accent:0xB78CFF,kind:'long',ability:'Mil Fleur Index',ward:'Poneglyph Shawl',realm:'pirate'},
 {id:'franko',name:'Franko',  title:'Systems Shipwright',  emo:'🔧',color:0x2B3340,hair:0x2F7FD8,accent:0x5AC8F2,kind:'spike',ability:'Radical Beam Weld',ward:'Shipwright Frame',realm:'pirate',bulk:1.3,h:1.12},
 {id:'choppa',name:'Choppa',  title:'Health Monitor',      emo:'🩺',color:0x7A4A34,hair:0x5C3624,accent:0xFF7BA6,kind:'tiny',ability:'Rumble Triage',ward:'Sakura Cap',realm:'pirate',h:0.62,skin:0xC98D64},
 {id:'jinbay',name:'Jinbay',  title:'Tide Network Master', emo:'🌊',color:0x1C2F5E,hair:0x10131F,accent:0x7AB0FF,kind:'giant',ability:'Ocean Current Route',ward:'Tidal Haori',realm:'pirate',bulk:1.42,h:1.2,skin:0x5A86C8},
 /* — Sayajin cadre (Capsule Realm full-body agents) — */
 {id:'vageta',name:'Vageta',  title:'Vanguard Commander',  emo:'👑',color:0x1C2030,hair:0x14101C,accent:0x9B7CF6,kind:'spike',ability:'Final Flash Sprint',ward:'Royal Battle Rig',realm:'saiyan'},
 {id:'gosun', name:'Gosun',   title:'Research Dev Scout',  emo:'🐉',color:0xF0ECE2,hair:0x141018,accent:0x8A7AD8,kind:'spike',ability:'Instinct Survey',ward:'Scout Gi',realm:'saiyan'},
 {id:'gojutsu',name:'Gojutsu',title:'Model Fusion Engineer',emo:'🧬',color:0x232030,hair:0x0F0C14,accent:0xB08CFF,kind:'spike',ability:'Fusion Splice',ward:'Potara Coat',realm:'saiyan'},
 {id:'gohana',name:'Gohana',  title:'Insight Analyst',     emo:'📊',color:0xE8E4F0,hair:0x181226,accent:0x9B7CF6,kind:'pony',ability:'Hidden Pattern Burst',ward:'Analyst Mantle',realm:'saiyan'},
 {id:'trunket',name:'Trunket',title:'Time Branch Keeper',  emo:'⏳',color:0x1C1A26,hair:0xB9A3E0,accent:0x9B7CF6,kind:'side',ability:'Rollback Slash',ward:'Time Capsule Jacket',realm:'saiyan'},
 {id:'bulmara',name:'Bulmara',title:'Capsule Lab Chief',   emo:'🧪',color:0xF0ECE4,hair:0x39C2C9,accent:0x5AC8F2,kind:'pony',ability:'Capsule Deploy',ward:'Lab Chief Coat',realm:'saiyan'},
 {id:'picoroid',name:'Picoroid',title:'Tactical Mentor',   emo:'🧿',color:0x2A2F4A,hair:0x2A4A34,accent:0xD8E4F0,kind:'baldcape',ability:'Regeneration Drill',ward:'Namek Cloak',realm:'saiyan',skin:0x6FAE6A},
 {id:'brolon',name:'Brolon',  title:'Load-Test Enforcer',  emo:'💥',color:0x2A2420,hair:0x141018,accent:0xB08CFF,kind:'spike',ability:'Berserk Benchmark',ward:'Enforcer Harness',realm:'saiyan',bulk:1.45,h:1.22},
 {id:'keflara',name:'Keflara',title:'Burst Fusion Striker',emo:'💫',color:0x1E1A28,hair:0x18121E,accent:0xCF9DFF,kind:'pony',ability:'Kefla Comet',ward:'Striker Braids',realm:'saiyan'},
];

// ---- delivery chain: tours the whole planet (giver -> target) ----
//  position objects placed on globe; deliveries reference NPC slot indices
const NPCS=[
 {slot:0,role:'kuro',  t:0.0,        p:Math.PI/2,        loc:'Dispatch Hall'},
 {slot:1,role:'raijin',t:-Math.PI/2, p:Math.PI/2+0.30,   loc:'Cliff Overlook'},
 {slot:2,role:'goro',  t:Math.PI,    p:Math.PI/2+0.05,   loc:'Iron Dojo'},
 {slot:3,role:'sage',  t:Math.PI/2,  p:Math.PI/3+0.03,   loc:'Nine-Tail Shrine'},
 {slot:4,role:'yuki',  t:0.52,       p:Math.PI/2+0.02,   loc:'Market District'},
 {slot:5,role:'aria',  t:Math.PI/4,  p:Math.PI/4+0.04,   loc:'Pine Grove'},
 {slot:6,role:'whisk', t:3.9,        p:Math.PI/2-0.05,   loc:'Open Horizon'}, // roaming hint-giver
];
// chain of (giverSlot -> targetSlot, parcel)
const CHAIN=[
 {from:0,to:1,parcel:'Storm Relay Seal',     line:'Carry the storm seal to Raijin at the Cliff Overlook.'},
 {from:1,to:2,parcel:'Iron Bell Casting',    line:'Take the iron bell casting to Goro at the Dojo.'},
 {from:2,to:3,parcel:'Shrine Keystone',      line:'Bring the keystone to Viridian at the Shrine.'},
 {from:3,to:4,parcel:'Mist Ledger',          line:'Run the mist ledger to Yuki in the Market.'},
 {from:4,to:5,parcel:'Frost Fragment',       line:'Deliver the frost fragment to Aria in the Pine Grove.'},
 {from:5,to:0,parcel:'Quasar Core Shard',    line:'Return the core shard to the Dispatch Hall and sync the Horizon.'},
];

// Authored anime planet map. Every district is built from the same data contract so
// geometry, traversal, storytelling, and future quest unlocks remain synchronized.
const WORLD_SPEC={
  version:'anime-refactor-v2',
  artStyle:{toon:true,outlines:true,grade:'turquoise-sky-warm-cream',roadLanguage:'curved-hillside'},
  districts:[
    {id:'dispatch',name:'Courier Core · Dispatch Village',t:0,p:Math.PI/2,radius:.32,
      buildings:[
        {type:'dispatchHall',offset:[0,0],col:0xefe4d1,roof:0x8e5648,s:1.18,rot:Math.PI},
        {type:'villageHouse',offset:[-.13,-.085],col:0xf2eee2,roof:0xb76a63,s:.95},
        {type:'villageHouse',offset:[.16,-.09],col:0xa9d4ac,roof:0x5f7b62,s:.92},
        {type:'market',offset:[.12,.13],col:0xe9c690,roof:0xc64d42,s:.9}],
      roads:[{offset:[-.19,.065],to:[.24,.035],width:2.75,curve:.045,markings:true}],
      props:[['redMailbox',[-.09,.095],1,.1],['vendingMachine',[.18,.055],1,-.2],['signboard',[.035,-.105],1.15,.1],['crateStack',[.11,.17],.9,.5],['bench',[-.18,.05],1,.8],['guardRail',[-.19,.13],1,.2],['guardRail',[.18,.12],1,-.15],['pottedPlants',[-.13,-.02],1,0],['satelliteDish',[.18,-.035],.9,0]],
      wires:[[[.1,-.125],[.22,-.12]],[[-.03,-.12],[.1,-.125]]]},
    {id:'market',name:'Ninja Market Slope',t:.55,p:Math.PI/2+.03,radius:.34,
      buildings:[
        {type:'villageHouse',offset:[-.12,-.12],col:0xf3eee1,roof:0xc27b76,s:1.02},
        {type:'villageHouse',offset:[.07,-.12],col:0x9fc991,roof:0x5f765a,s:.94},
        {type:'market',offset:[-.02,.12],col:0xf1d9b6,roof:0xc64d42,s:1.04},
        {type:'villageHouse',offset:[.17,.09],col:0xb9c6e1,roof:0x626b91,s:.9}],
      roads:[{offset:[-.22,.02],to:[.25,.02],width:2.9,curve:-.07,markings:true}],
      props:[['guardRail',[-.16,.13],1.05,.15],['guardRail',[0,.14],1.05,.08],['guardRail',[.16,.12],1.05,-.05],['redMailbox',[.04,.11],1,0],['stairSegment',[.19,-.04],1,.45],['roadSign',[-.08,-.12],1,.2],['vendingMachine',[.14,-.04],1,.1],['pottedPlants',[-.13,-.04],1,0]],
      wires:[[[ -.18,-.13],[0,-.14]],[[0,-.14],[.18,-.12]]]},
    {id:'shrine',name:'Shinobi Shrine Grove',t:Math.PI/2,p:Math.PI/3,radius:.3,
      buildings:[{type:'shrine',offset:[0,0],col:0xc43a3a,roof:0xffd766,s:1.2},{type:'villageHouse',offset:[.14,.12],col:0xe9dcc8,roof:0x8f4638,s:.82}],
      roads:[{offset:[-.15,.13],to:[.15,.13],width:1.55,curve:.02,color:0xb9aa91}],
      props:[['foxStatue',[-.18,-.04],1,.3],['foxStatue',[.18,-.04],1,-.3],['toriiGate',[0,.13],1.1,0],['shrineCharm',[-.12,.1],1,0],['shrineCharm',[.12,.1],1,0],['stoneLantern',[-.1,.03],1,0],['stoneLantern',[.1,.03],1,0]]},
    {id:'forge',name:'Capsule Forge · Agent Core',t:-.82,p:Math.PI/2+.13,radius:.34,
      buildings:[{type:'forge',offset:[0,0],col:0xd8a572,roof:0x884422,s:1.08},{type:'lab',offset:[-.16,-.12],col:0xb8c2c7,roof:0x3dc9c2,s:.92},{type:'capsulePod',offset:[.15,-.1],col:0xd8e4f0,roof:0x9b7cf6,s:.9},{type:'energyNode',offset:[.19,.13],col:0x8ab2f0,roof:0x9b7cf6,s:.85}],
      roads:[{offset:[-.22,.08],to:[.24,.04],width:2.25,curve:.035,color:0x586f73,markings:true}],
      props:[['pipeRig',[-.08,.19],1.1,.5],['pipeRig',[.1,.2],.95,-.3],['crateStack',[.03,-.17],.9,.8],['roadSign',[.17,-.02],1,.2],['cablePole',[-.19,-.14],1,0],['cablePole',[.08,-.15],1,0]],
      wires:[[[ -.19,-.14],[.08,-.15]]]},
    {id:'dojo',name:'Motion Dojo · ShuttleSensei Arena',t:Math.PI,p:Math.PI/2+.05,radius:.32,
      buildings:[{type:'motionDojo',offset:[0,0],col:0xe6dfd0,roof:0x58636c,s:1.08},{type:'market',offset:[.16,-.03],col:0xd9c49e,roof:0x8d7744,s:.85}],
      roads:[{offset:[-.2,.13],to:[.22,.1],width:2.2,curve:-.03,color:0x596d70,markings:true}],
      props:[['shuttleCourt',[-.03,.19],1.08,.35],['bench',[.18,.17],1,.1],['roadSign',[-.16,.05],1,-.2],['trainingDummy',[.12,-.14],1,0]]},
    {id:'harbor',name:'Harbor of Horizons',t:-Math.PI/2,p:Math.PI/2+.42,radius:.34,
      buildings:[{type:'harborShack',offset:[-.15,.05],col:0xadd8e6,roof:0x2f6fae,s:1.05},{type:'cargoStation',offset:[.17,.04],col:0xc4b48a,roof:0x8a5a2a,s:.9},{type:'watchtower',offset:[0,-.14],col:0xd8c8a8,roof:0xc85c4f,s:.7}],
      roads:[{offset:[-.22,-.02],to:[.22,.02],width:2.1,curve:.04,color:0x8b765d}],
      props:[['boat',[-.18,.16],1.3,.2],['lifeRing',[.02,.12],1,.1],['crateStack',[.2,.13],.95,.5],['dock',[0,.19],1.1,0],['barrelStack',[.11,-.08],1,0]]},
    {id:'grove',name:'Giant Grove · Rootway',t:Math.PI*1.12,p:Math.PI/2-.42,radius:.3,
      buildings:[{type:'giantRootHouse',offset:[0,0],col:0xb78b5c,roof:0x5b7f42,s:1.08},{type:'cottage',offset:[.17,.1],col:0xd4c2a2,roof:0x6f533b,s:.9}],
      roads:[{offset:[-.19,.12],to:[.2,.1],width:1.55,curve:-.04,color:0x92775b}],
      props:[['giantRoot',[-.12,-.08],1.1,.2],['giantRoot',[.14,-.1],.9,-.2],['ropeBridge',[0,.18],1,0],['hugeMushroom',[.19,.02],1,0]]},
    {id:'lookout',name:'Sky Lookout · Dragon Trial Peak',t:2.45,p:Math.PI/2-.68,radius:.28,
      buildings:[{type:'skyLookout',offset:[0,0],col:0xeee7d5,roof:0x3dc9c2,s:1.0},{type:'capsulePod',offset:[.16,.08],col:0xe5e8ec,roof:0xf2843d,s:.75}],
      roads:[{offset:[-.14,.12],to:[.14,.12],width:1.35,curve:0,color:0xc5bca8}],
      props:[['energyRing',[-.12,-.06],1,0],['energyRing',[.06,-.1],.8,.35],['roadSign',[.15,.02],1,0],['stoneLantern',[-.15,.08],1,0]]}
  ]
};

const DLG={
 kuro:['The hall mirror — that\'s me before the run.','Every parcel is light moved from one edge to the next.','Let\'s keep the horizon turning.'],
 raijin:['Kuro! The relay\'s been waiting on you.','Storms move on trust, not speed — but speed helps.','Good. The next leg runs to the Dojo.'],
 goro:['Hah — smaller than the parcel, almost.','Set it down gently. Iron remembers a careless hand.','On to the shrine with you.'],
 sage:['The core has been watching your loops, little fox.','A keystone is a promise cut in stone.','Carry the ledger onward — Yuki waits.'],
 yuki:['I half expected the mist to keep you.','Numbers and shadow — both need a steady courier.','Frost grove next. Aria will know you by your tails.'],
 aria:['The glacier hums when a runner is near.','Cold keeps what heat would spend. Hold this fragment close.','One leg left — the core shard, back to the hall.'],
 whisk:['Meep! The orb shows the bright line — follow it.','The quasar never truly sets; it only turns away.','Fluffy tails. Ten out of nine.'],
};

/* ====================================================================
   TRI-FABLED PLANETARY REALMS — the three fables share one horizon.
   Longitude sectors partition the equatorial civilization into three
   sovereign realms; each carries its own painterly grade, fog, light
   and anchor hub for the cinematic realm transit.
==================================================================== */
const REALMS={
  shinobi:{id:'shinobi',emo:'🌀',name:'Shinobi Realm',sub:'Hidden Leaf Fable',
    range:[5.98,2.20],anchor:{t:1.7,p:Math.PI/2+0.18},hub:'hiddenleaf',
    districts:['dispatch','observatory','market','neonarcade','shrine','hiddenleaf','festival'],
    grade:{levels:8.0,warm:0.046,grain:0.050,fog:0x0a140f,sun:0xfff1d0,hemiSky:0xbfe0ff,hemiGnd:0x33402e,accent:0xF2843D}},
  pirate:{id:'pirate',emo:'🏴‍☠️',name:'Pirate Realm',sub:'Grand Line Fable',
    range:[2.20,4.30],anchor:{t:-2.25,p:Math.PI/2+0.48},hub:'boardwalk',
    districts:['lookout','monastery','dojo','grove','skydocks','boardwalk','elbaf'],
    grade:{levels:7.0,warm:0.028,grain:0.066,fog:0x08131c,sun:0xffe6bd,hemiSky:0xa8d8e8,hemiGnd:0x2e3a40,accent:0x3DC9C2}},
  saiyan:{id:'saiyan',emo:'⚡',name:'Saiyan Realm',sub:'Capsule Fable',
    range:[4.30,5.98],anchor:{t:-0.4,p:Math.PI/2-0.30},hub:'capsulecorp',
    districts:['skillforge','harbor','sakura','forge','capsulecorp'],
    grade:{levels:9.0,warm:0.016,grain:0.034,fog:0x0b0d16,sun:0xfff5e6,hemiSky:0xc8c8f0,hemiGnd:0x2e3040,accent:0x9B7CF6}}
};
function realmAt(t){const tn=((t%TAU)+TAU)%TAU;
  if(tn>=2.20&&tn<4.30)return REALMS.pirate;
  if(tn>=4.30&&tn<5.98)return REALMS.saiyan;
  return REALMS.shinobi;}
// Blends a base hex colour toward a target hex by amt (0-1). Foundation for all
// realm-coherent recolouring below (buildings, courier wardrobe, NPC/villager trim).
function _colorBlend(hex,targetHex,amt){
  try{ return new THREE.Color(hex).lerp(new THREE.Color(targetHex),amt).getHex(); }catch(e){return hex;}
}
function _realmTint(hex,t,amt){
  try{ return _colorBlend(hex,realmAt(t).grade.accent,amt); }catch(e){return hex;}
}

// Authored ravine — carved into the planet mesh between the Shrine Grove and
// Hidden Leaf so the inner water shell reads through; the Kurama Crossing
// wooden bridge is the only way over (reference: Ghibli bridge scene).
const RAVINE={a:{t:1.30,p:1.415},b:{t:1.98,p:1.385},halfWidth:0.95,depth:2.35};

