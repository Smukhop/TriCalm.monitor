/* === env.capsulecorp.js — Capsule Corp Plateau (Dragon Ball flavor) =======
   TriFable · MiniVerse environment pack. Capability station: ACTUATION —
   the QB Engine Core spins up gravity rigs, hover pads and ki spires that
   turn a builder's intent into motion across the planet.
   Anime cel + ink-outline styling, authored against the registry contract
   in kurama.registry.js. Classic script, shared global scope. ============= */
(function(){
  // ---------- buildings (ctx.bx/cy/cn are NOT pre-scaled — multiply by ctx.s) ----------

  // Corporate HQ: round cream base, glass dome, glowing logo ring + crest.
  registerBuilding('capsuleHQ', function(ctx){
    const {add,bx,cy,outline,toon,PAL,TAU,THREE,s,col,roof,win,bobbers,g}=ctx;
    // wide stone footing + drum body
    const slab=add(cy(2.4*s,2.6*s,.4*s,16,0xc7bda9));slab.position.y=.2*s;g.add(outline(slab,1.02));
    const drum=add(cy(2.0*s,2.15*s,2.4*s,16,col));drum.position.y=1.6*s;g.add(outline(drum,1.025));
    const band=add(cy(2.06*s,2.06*s,.3*s,16,0xeae0cf));band.position.y=2.7*s;
    // translucent glass dome cap
    const dome=add(new THREE.Mesh(new THREE.SphereGeometry(2.0*s,16,12,0,TAU,0,Math.PI/2),
      new THREE.MeshToonMaterial({color:new THREE.Color(roof),gradientMap:toonRamp,emissive:new THREE.Color(roof),emissiveIntensity:.4,transparent:true,opacity:.78})));
    dome.position.y=2.85*s;g.add(outline(dome,1.02));
    // glowing logo ring banded around the drum
    const logo=add(new THREE.Mesh(new THREE.TorusGeometry(2.12*s,.1*s,8,32),
      new THREE.MeshBasicMaterial({color:PAL.frost,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false})),false);
    logo.rotation.x=Math.PI/2;logo.position.y=1.9*s;
    // "CC" crest medallion over the door
    const crest=add(new THREE.Mesh(new THREE.TorusGeometry(.42*s,.08*s,8,24),toon(PAL.teal,.25)),false);crest.position.set(0,2.0*s,2.08*s);
    const seal=add(new THREE.Mesh(new THREE.CircleGeometry(.3*s,20),new THREE.MeshBasicMaterial({color:PAL.frost})),false);seal.position.set(0,2.0*s,2.1*s);
    // entry + window ring
    const door=add(bx(.9*s,1.4*s,.1*s,0x39424a),false);door.position.set(0,.7*s,2.06*s);
    for(let k=0;k<7;k++){const a=k/7*TAU;const fr=add(bx(.5*s,.7*s,.08*s,0x31434a),false);
      fr.position.set(Math.cos(a)*2.06*s,1.4*s,Math.sin(a)*2.06*s);fr.lookAt(Math.cos(a)*5*s,1.4*s,Math.sin(a)*5*s);win(Math.cos(a)*2.1*s,1.4*s,Math.sin(a)*2.1*s);}
    // floating ki orb finial above the dome
    const orb=add(new THREE.Mesh(new THREE.SphereGeometry(.34*s,12,10),new THREE.MeshBasicMaterial({color:PAL.teal,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false})),false);
    orb.position.y=5.3*s;bobbers&&bobbers.push({m:orb,bob:5.3*s,amp:.07});
  });

  // Gravity training dome: large translucent sphere on a ring base, glowing inner core.
  registerBuilding('gravityDome', function(ctx){
    const {add,bx,cy,outline,toon,PAL,TAU,THREE,s,col,roof,bobbers,g}=ctx;
    // ring foundation
    const ring=add(cy(2.3*s,2.5*s,.55*s,18,0xd8cfbc));ring.position.y=.27*s;g.add(outline(ring,1.02));
    const collar=add(cy(1.9*s,2.0*s,.7*s,16,col));collar.position.y=.75*s;g.add(outline(collar,1.025));
    // ribbed support struts around the base
    for(let k=0;k<6;k++){const a=k/6*TAU;const strut=add(cy(.1*s,.12*s,1.9*s,7,0x9aa3aa));
      strut.position.set(Math.cos(a)*1.8*s,1.4*s,Math.sin(a)*1.8*s);}
    // big translucent training sphere
    const sphere=add(new THREE.Mesh(new THREE.SphereGeometry(1.95*s,18,14),
      new THREE.MeshToonMaterial({color:new THREE.Color(roof),gradientMap:toonRamp,emissive:new THREE.Color(roof),emissiveIntensity:.35,transparent:true,opacity:.5,depthWrite:false})),false);
    sphere.position.y=2.7*s;g.add(outline(sphere,1.01));
    // equatorial ink band for the cel read
    const belt=add(new THREE.Mesh(new THREE.TorusGeometry(1.96*s,.08*s,8,32),toon(0x39424a)),false);belt.rotation.x=Math.PI/2;belt.position.y=2.7*s;
    // glowing inner ki core that bobs
    const core=add(new THREE.Mesh(new THREE.OctahedronGeometry(.62*s,0),new THREE.MeshBasicMaterial({color:PAL.frost,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false})),false);
    core.position.y=2.7*s;bobbers&&bobbers.push({m:core,bob:2.7*s,amp:.1});
    const halo=add(new THREE.Mesh(new THREE.TorusGeometry(.9*s,.05*s,8,28),new THREE.MeshBasicMaterial({color:PAL.teal,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false})),false);
    halo.rotation.x=Math.PI/2;halo.position.y=2.7*s;bobbers&&bobbers.push({m:halo,spinY:.6});
    const hatch=add(bx(.9*s,1.2*s,.12*s,0x39424a),false);hatch.position.set(0,.7*s,2.0*s);
  });

  // Hover pad: circular landing disc, light strip rim, a parked capsule pod + beacon.
  registerBuilding('hoverPad', function(ctx){
    const {add,bx,cy,cn,outline,toon,PAL,TAU,THREE,s,col,roof,bobbers,particles,g}=ctx;
    // layered landing disc
    const pad=add(cy(2.6*s,2.7*s,.3*s,20,0xc7bda9));pad.position.y=.15*s;g.add(outline(pad,1.015));
    const deck=add(cy(2.3*s,2.3*s,.16*s,20,col));deck.position.y=.36*s;
    // glowing light-strip rim
    const rim=add(new THREE.Mesh(new THREE.TorusGeometry(2.32*s,.07*s,8,40),
      new THREE.MeshBasicMaterial({color:PAL.teal,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false})),false);
    rim.rotation.x=Math.PI/2;rim.position.y=.46*s;
    // landing chevrons painted on the deck
    for(let k=0;k<4;k++){const a=k/4*TAU;const mark=add(bx(.7*s,.04*s,.18*s,PAL.frost),false);
      mark.position.set(Math.cos(a)*1.4*s,.45*s,Math.sin(a)*1.4*s);mark.rotation.y=-a;}
    // parked capsule pod (round body + dome lid + porthole)
    const body=add(cy(.85*s,.95*s,1.1*s,14,0xeae0cf));body.position.set(.55*s,.95*s,-.3*s);g.add(outline(body,1.03));
    const lid=add(new THREE.Mesh(new THREE.SphereGeometry(.85*s,14,10,0,TAU,0,Math.PI/2),toon(roof)));lid.position.set(.55*s,1.5*s,-.3*s);g.add(outline(lid,1.03));
    const port=add(new THREE.Mesh(new THREE.CircleGeometry(.28*s,16),new THREE.MeshBasicMaterial({color:PAL.frost})),false);port.position.set(.55*s,1.1*s,.55*s);
    const fin=add(cy(.04*s,.04*s,.5*s,6,PAL.gold),false);fin.position.set(.55*s,2.1*s,-.3*s);
    // hovering beacon orb above the pad + drifting motes
    const beacon=add(new THREE.Mesh(new THREE.SphereGeometry(.26*s,12,10),new THREE.MeshBasicMaterial({color:PAL.frost,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false})),false);
    beacon.position.set(-.9*s,1.7*s,.6*s);bobbers&&bobbers.push({m:beacon,bob:1.7*s,amp:.12});
    for(let i=0;i<4;i++){const mote=new THREE.Mesh(new THREE.SphereGeometry(.05*s,6,5),new THREE.MeshBasicMaterial({color:PAL.teal,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false}));
      mote.position.set((Math.random()-.5)*2.0*s,.6*s+Math.random()*.6,(Math.random()-.5)*2.0*s);mote.userData.fall=-(0.08+Math.random()*0.14);mote.userData.sway=1+Math.random()*2;mote.userData.sy=mote.position.y;particles&&particles.push(mote);g.add(mote);}
  });

  // ---------- props (ctx.bx/cy/cn ARE pre-scaled; scale positions by ctx.s) ----------

  // Ki spire: tall glowing energy needle that bobs on a small plinth.
  registerProp('kiSpire', function(ctx){
    const {add,cy,cn,outline,toon,PAL,THREE,s,bobbers,g}=ctx;
    const base=add(cy(.28,.34,.3,10,0x9aa3aa));base.position.y=.15*s;g.add(outline(base,1.03));
    const shaft=add(cy(.08,.14,1.7,8,0xeae0cf));shaft.position.y=1.05*s;g.add(outline(shaft,1.04));
    const tip=add(new THREE.Mesh(new THREE.ConeGeometry(.16*s,.7*s,8),new THREE.MeshBasicMaterial({color:PAL.teal,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false})));
    tip.position.y=2.25*s;bobbers&&bobbers.push({m:tip,bob:2.25*s,amp:.06});
    const ring=add(new THREE.Mesh(new THREE.TorusGeometry(.26*s,.04*s,8,20),new THREE.MeshBasicMaterial({color:PAL.frost,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false})));
    ring.rotation.x=Math.PI/2;ring.position.y=1.0*s;bobbers&&bobbers.push({m:ring,spinY:.8});
  }, 0.3);

  // Scouter stand: angled console on a post with a glowing readout screen.
  registerProp('scouterStand', function(ctx){
    const {add,bx,cy,outline,toon,PAL,THREE,s,g}=ctx;
    const post=add(cy(.07,.09,1.1,8,0x565d5d));post.position.y=.55*s;
    const housing=add(bx(.9,.55,.22,0x39424a));housing.position.set(0,1.2*s,0);housing.rotation.x=-.35;g.add(outline(housing,1.03));
    const screen=add(new THREE.Mesh(new THREE.PlaneGeometry(.74*s,.4*s),new THREE.MeshBasicMaterial({color:PAL.teal,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false})),false);
    screen.position.set(0,1.24*s,.13*s);screen.rotation.x=-.35;
    for(let i=-1;i<=1;i++){const led=add(new THREE.Mesh(new THREE.SphereGeometry(.04*s,6,5),new THREE.MeshBasicMaterial({color:PAL.frost})),false);led.position.set(i*.2*s,1.42*s,.1*s);}
  }, 0.25);

  // Senzu planter: a long box bed holding 3 small sprouting bean planters.
  registerProp('senzuPlanter', function(ctx){
    const {add,bx,cy,cn,outline,toon,PAL,THREE,s,bobbers,g}=ctx;
    const bed=add(bx(1.1,.26,.4,0x7a5236));bed.position.y=.13*s;g.add(outline(bed,1.03));
    for(let i=-1;i<=1;i++){
      const pot=add(cy(.13,.16,.22,9,0xc7bda9));pot.position.set(i*.34*s,.3*s,0);
      const soil=add(cy(.1,.1,.05,9,0x4a382c),false);soil.position.set(i*.34*s,.42*s,0);
      const sprout=add(cn(.07*s,.26*s,6,0x3DC9C2));sprout.position.set(i*.34*s,.58*s,0);
      const bean=add(new THREE.Mesh(new THREE.SphereGeometry(.05*s,7,6),new THREE.MeshBasicMaterial({color:PAL.frost,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false})),false);
      bean.position.set(i*.34*s,.72*s,0);bobbers&&bobbers.push({m:bean,bob:.72*s,amp:.04});
    }
  }, 0.2);

  // ---------- district (placed on a free band; linked into the forge hub) ----------
  registerDistrict({
    id:'capsulecorp', name:'Capsule Corp Plateau · QB Engine Core', t:-0.4, p:Math.PI/2-0.30, radius:.32,
    buildings:[
      {type:'capsuleHQ',    offset:[0,-.02],   col:0xf2eee2, roof:0x3DC9C2, s:1.05, rot:Math.PI},
      {type:'gravityDome',  offset:[-.17,.12],  col:0xefe7d6, roof:0x9B7CF6, s:.95},
      {type:'hoverPad',     offset:[.18,.1],    col:0xeae0cf, roof:0x6a73a8, s:.95, rot:-.3},
      {type:'villageHouse', offset:[.2,-.12],   col:0xf2eee2, roof:0x3a8f8a, s:.85}],
    roads:[{offset:[-.2,.05],to:[.22,.06],width:2.6,curve:.04,markings:true}],
    props:[
      ['kiSpire',[0,.07],1.05,0],['scouterStand',[.14,.16],1,-.2],['senzuPlanter',[-.1,-.08],1,.3],
      ['kiSpire',[-.16,.04],.9,0],['stoneLantern',[-.16,.0],1,0],['stoneLantern',[.16,.0],1,0],
      ['guardRail',[-.18,.13],1,.15],['guardRail',[.18,.12],1,-.1],['signboard',[.0,-.12],1.1,.1],['crateStack',[.12,-.04],1,0]],
    wires:[[[-.18,-.12],[.0,-.13]],[[.0,-.13],[.18,-.12]]]
  });
  registerLink('capsulecorp','forge',{width:1.4,curve:.03});

  // ambient scatter so the plateau blends into the horizon
  registerDecorator(function(){
    if(typeof tree==='function'){ tree(-0.46,Math.PI/2-0.42,'round',.85); tree(-0.28,Math.PI/2-0.44,'pine',.9); }
  });

  registerEnvPack({id:'capsulecorp',theme:'dragonball',title:'Capsule Corp Plateau',capability:'Actuation'});
})();
