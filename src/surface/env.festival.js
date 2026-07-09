/* === env.festival.js — Matsuri Grounds · Community Plaza ===================
   TriFable · MiniVerse environment pack. Capability station: COMMUNITY —
   the plaza where builders gather, share and celebrate as a guild.
   Anime cel + ink-outline styling, authored against the registry contract
   in kurama.registry.js. Classic script, shared global scope. ============= */
(function(){
  // ---------- buildings (ctx.bx/cy/cn are NOT pre-scaled — multiply by ctx.s) ----------

  // Festival stage: raised plank platform, painted back banner, 2 taiko drums + a beam of hung lanterns.
  registerBuilding('festivalStage', function(ctx){
    const {add,bx,cy,outline,toon,PAL,THREE,s,col,roof,bobbers,g}=ctx;
    // raised wooden deck on stubby legs
    const deck=add(bx(4.0*s,.4*s,2.6*s,0x8a5a30));deck.position.y=.7*s;g.add(outline(deck,1.02));
    const planks=add(bx(3.9*s,.06*s,2.5*s,0x9c6a38));planks.position.y=.93*s;
    for(const x of[-1.8,1.8])for(const z of[-1.1,1.1]){const leg=add(bx(.22*s,.7*s,.22*s,0x5a3a1e));leg.position.set(x,.35*s,z);}
    // tall back frame + painted banner cloth
    for(const x of[-1.9,1.9]){const post=add(cy(.12*s,.14*s,3.4*s,8,0x6f4a2c));post.position.set(x,2.6*s,-1.1*s);g.add(outline(post,1.03));}
    const beam=add(bx(4.2*s,.22*s,.22*s,0x6f4a2c));beam.position.set(0,4.2*s,-1.1*s);g.add(outline(beam,1.03));
    const banner=add(bx(3.4*s,2.1*s,.1*s,PAL.crimson));banner.position.set(0,3.0*s,-1.05*s);g.add(outline(banner,1.02));
    const crest=add(new THREE.Mesh(new THREE.CircleGeometry(.55*s,22),new THREE.MeshBasicMaterial({color:PAL.gold})),false);crest.position.set(0,3.1*s,-.99*s);
    const seal=add(new THREE.Mesh(new THREE.TorusGeometry(.55*s,.07*s,8,24),toon(roof,.15)));seal.position.set(0,3.1*s,-.97*s);
    // two taiko drums centre-stage (barrel body + rim + tilted stand)
    for(const x of[-1.0,1.0]){
      const stand=add(bx(.8*s,.5*s,.5*s,0x4f3322));stand.position.set(x,1.18*s,.2*s);
      const drum=add(cy(.5*s,.5*s,.7*s,12,0xc7452f));drum.position.set(x,1.7*s,.2*s);drum.rotation.z=Math.PI/2;g.add(outline(drum,1.03));
      const head=add(new THREE.Mesh(new THREE.CircleGeometry(.5*s,16),toon(0xf0e6d6)),false);head.position.set(x+.36*s,1.7*s,.2*s);head.rotation.y=Math.PI/2;
      const rim=add(new THREE.Mesh(new THREE.TorusGeometry(.5*s,.05*s,7,18),toon(PAL.gold)));rim.position.set(x+.34*s,1.7*s,.2*s);rim.rotation.y=Math.PI/2;
    }
    // string of glowing paper lanterns hung from the beam — gentle float
    for(let i=-3;i<=3;i++){const lan=add(new THREE.Mesh(new THREE.SphereGeometry(.2*s,10,8),toon(i%2?PAL.gold:PAL.hot,.55)));
      lan.position.set(i*.58*s,3.7*s,-1.0*s);lan.scale.y=1.25;bobbers&&bobbers.push({m:lan,bob:3.7*s,amp:.04});}
  });

  // Stall row: three festival food stalls side by side, each with a striped awning + counter + lamp.
  registerBuilding('stallRow', function(ctx){
    const {add,bx,cy,outline,toon,PAL,THREE,s,col,roof,bobbers,g}=ctx;
    const stripe=[PAL.crimson,0xf0e6d6,PAL.gold];
    for(let n=0;n<3;n++){
      const ox=(n-1)*2.0*s;
      const counter=add(bx(1.7*s,.95*s,1.0*s,col));counter.position.set(ox,.48*s,0);g.add(outline(counter,1.03));
      const top=add(bx(1.85*s,.12*s,1.15*s,0x7a5236));top.position.set(ox,1.0*s,0);
      for(const x of[-.78,.78]){const post=add(cy(.07*s,.08*s,2.0*s,7,0x5a3a1e));post.position.set(ox+x,1.5*s,.42*s);}
      // striped awning — alternating toon strips, tilted forward
      const awn=add(bx(1.95*s,.12*s,1.3*s,stripe[n%3]),false);awn.position.set(ox,2.45*s,.15*s);awn.rotation.x=-.16;g.add(outline(awn,1.02));
      for(let k=-2;k<=2;k++){const st=add(bx(.34*s,.08*s,1.26*s,k%2?0xf0e6d6:stripe[n%3]),false);st.position.set(ox+k*.38*s,2.47*s,.16*s);st.rotation.x=-.16;}
      // little hanging lamp over each counter
      const lamp=add(new THREE.Mesh(new THREE.SphereGeometry(.16*s,10,8),toon(PAL.hot,.6)));lamp.position.set(ox,2.0*s,.2*s);lamp.scale.y=1.2;
      bobbers&&bobbers.push({m:lamp,bob:2.0*s,amp:.035});
      // goods on the counter
      for(let i=-1;i<=1;i++){const g0=add(bx(.28*s,.22*s,.28*s,i%2?PAL.ember:0xe9c690));g0.position.set(ox+i*.5*s,1.18*s,.2*s);}
    }
  });

  // Torii arch: large twin-pillar gate, double crossbeam, painted vermilion with an additive glow ring.
  registerBuilding('toriiArch', function(ctx){
    const {add,bx,cy,outline,toon,PAL,THREE,s,col,roof,bobbers,g}=ctx;
    const RED=0xd83b2e;
    for(const x of[-1.55,1.55]){const pillar=add(cy(.26*s,.32*s,4.2*s,10,RED));pillar.position.set(x,2.1*s,0);g.add(outline(pillar,1.03));
      const foot=add(cy(.4*s,.46*s,.34*s,10,0x4a4d50));foot.position.set(x,.17*s,0);}
    // lower tie beam (nuki) and upper lintel (kasagi) with upswept ends
    const nuki=add(bx(3.9*s,.34*s,.42*s,RED));nuki.position.y=3.3*s;g.add(outline(nuki,1.03));
    const kasagi=add(bx(4.7*s,.4*s,.6*s,RED));kasagi.position.y=4.25*s;kasagi.rotation.z=0;g.add(outline(kasagi,1.03));
    const ridge=add(bx(4.9*s,.16*s,.5*s,0x101010));ridge.position.y=4.5*s;
    for(const x of[-2.35,2.35]){const tip=add(bx(.5*s,.34*s,.62*s,RED));tip.position.set(x,4.32*s,0);tip.rotation.z=x<0?.22:-.22;}
    // central plaque tablet (gakuzuka) between the beams
    const plaque=add(bx(.8*s,.7*s,.16*s,0x2a2a2a));plaque.position.y=3.8*s;
    const glyph=add(new THREE.Mesh(new THREE.CircleGeometry(.26*s,18),new THREE.MeshBasicMaterial({color:PAL.gold})),false);glyph.position.set(0,3.8*s,.1*s);
    // soft additive halo ring drifting under the arch for the spirit-gate read
    const halo=new THREE.Mesh(new THREE.TorusGeometry(1.3*s,.07*s,8,40),new THREE.MeshBasicMaterial({color:PAL.hot,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false}));
    halo.rotation.x=-Math.PI/2;halo.position.y=.5*s;g.add(halo);bobbers&&bobbers.push({m:halo,spinY:.4});
  });

  // ---------- props (ctx.bx/cy/cn ARE pre-scaled; scale positions by ctx.s) ----------

  // Overhead catenary of glowing paper lanterns strung between two poles (no collider — walk under it).
  registerProp('paperLanternRow', function(ctx){
    const {add,cy,outline,toon,PAL,THREE,s,bobbers,g}=ctx;
    for(const x of[-1.6,1.6]){const pole=add(cy(.06,.07,2.6,7,0x5a3a1e));pole.position.set(x*s,1.3*s,0);g.add(outline(pole,1.03));}
    const wire=add(cy(.015,.015,3.2,5,0x222222),false);wire.position.set(0,2.5*s,0);wire.rotation.z=Math.PI/2;
    for(let i=-4;i<=4;i++){const sag=Math.cos(i/4*Math.PI/2)*.55;
      const lan=add(new THREE.Mesh(new THREE.SphereGeometry(.17*s,10,8),toon(i%2?PAL.gold:PAL.hot,.55)));
      lan.position.set(i*.38*s,(2.5-sag)*s,0);lan.scale.y=1.25;bobbers&&bobbers.push({m:lan,bob:(2.5-sag)*s,amp:.035});}
  }, 0.0);

  // Food cart: boxy cart on wheels with a tilted parasol and a curl of rising steam.
  registerProp('foodCart', function(ctx){
    const {add,bx,cy,cn,outline,toon,PAL,THREE,s,particles,g}=ctx;
    const body=add(bx(1.3,.7,.8,PAL.crimson));body.position.y=.65*s;g.add(outline(body,1.03));
    const top=add(bx(1.4,.12,.9,0xe9c690));top.position.y=1.06*s;
    for(const x of[-.5,.5]){const wheel=add(cy(.26,.26,.1,12,0x3a2a23));wheel.position.set(x*s,.26*s,.42*s);wheel.rotation.x=Math.PI/2;g.add(outline(wheel,1.04));}
    const handle=add(cy(.04,.04,.9,6,0x5a3a1e),false);handle.position.set(.8*s,.7*s,0);handle.rotation.z=.5;
    // parasol on a mast
    const mast=add(cy(.05,.05,2.0,7,0x5a3a1e));mast.position.set(-.2*s,1.7*s,0);
    const shade=add(cn(.95,.5,12,PAL.ember));shade.position.set(-.2*s,2.55*s,0);g.add(outline(shade,1.03));
    const tipo=add(new THREE.Mesh(new THREE.SphereGeometry(.07*s,7,5),toon(PAL.gold)),false);tipo.position.set(-.2*s,2.85*s,0);
    // rising steam over the cooktop
    for(let i=0;i<5;i++){const st=new THREE.Mesh(new THREE.SphereGeometry(.06*s,6,5),new THREE.MeshBasicMaterial({color:0xf2efe6,transparent:true,opacity:.5,depthWrite:false}));
      st.position.set((Math.random()-.5)*.6*s,1.2*s+Math.random()*.5,0);st.userData.fall=-(0.1+Math.random()*0.18);st.userData.sway=1+Math.random()*2;st.userData.sy=st.position.y;particles&&particles.push(st);g.add(st);}
  }, 0.3);

  // Firework rack: angled launch frame holding a fan of paper tubes, each capped with a glowing fuse mote.
  registerProp('fireworkRack', function(ctx){
    const {add,bx,cy,outline,toon,PAL,THREE,s,bobbers,g}=ctx;
    const base=add(bx(1.3,.16,.7,0x5a3a1e));base.position.y=.08*s;g.add(outline(base,1.03));
    const backRail=add(bx(1.3,.1,.1,0x6f4a2c));backRail.position.set(0,.8*s,-.25*s);backRail.rotation.x=-.4;
    for(const x of[-.55,.55]){const strut=add(bx(.1,1.0,.1,0x6f4a2c));strut.position.set(x*s,.5*s,-.18*s);strut.rotation.x=-.4;}
    const tubeCol=[PAL.crimson,PAL.gold,PAL.ember,PAL.soul,PAL.crimson];
    for(let i=-2;i<=2;i++){const tube=add(cy(.1,.1,.9,8,tubeCol[i+2]));tube.position.set(i*.27*s,.65*s,-.05*s);tube.rotation.x=-.4;g.add(outline(tube,1.04));
      const fuse=add(new THREE.Mesh(new THREE.SphereGeometry(.06*s,7,5),new THREE.MeshBasicMaterial({color:PAL.hot,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false})),false);
      fuse.position.set(i*.27*s,1.18*s,.2*s);bobbers&&bobbers.push({m:fuse,bob:1.18*s,amp:.05});}
  }, 0.3);

  // Taiko drum: a fat barrel drum slung in an X-stand, gold-studded rim + leather head.
  registerProp('taikoDrum', function(ctx){
    const {add,bx,cy,outline,toon,PAL,THREE,s,g}=ctx;
    for(const sgn of[-1,1]){const leg=add(bx(.1,1.1,.1,0x4f3322));leg.position.set(sgn*.4*s,.55*s,0);leg.rotation.z=sgn*.32;}
    const cross=add(bx(.9,.1,.1,0x4f3322));cross.position.y=.7*s;
    const drum=add(cy(.55,.55,.8,12,0xc7452f));drum.position.y=1.15*s;drum.rotation.x=Math.PI/2;g.add(outline(drum,1.03));
    const head=add(new THREE.Mesh(new THREE.CircleGeometry(.55*s,16),toon(0xf0e6d6)),false);head.position.set(0,1.15*s,.41*s);
    const rim=add(new THREE.Mesh(new THREE.TorusGeometry(.55*s,.05*s,7,20),toon(PAL.gold)));rim.position.set(0,1.15*s,.39*s);
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const stud=add(new THREE.Mesh(new THREE.SphereGeometry(.04*s,6,5),toon(PAL.gold)),false);stud.position.set(Math.cos(a)*.55*s,1.15*s+Math.sin(a)*.55*s,.41*s);}
  }, 0.3);

  // ---------- district (placed on a free band; linked into the market hub) ----------
  registerDistrict({
    id:'festival', name:'Matsuri Grounds · Community Plaza', t:2, p:Math.PI/2+0.46, radius:.32,
    buildings:[
      {type:'toriiArch',     offset:[0,-.18],  col:0xd83b2e, roof:0xb33020, s:1.05, rot:0},
      {type:'festivalStage', offset:[-.04,.1],  col:0xe9c690, roof:0xc24d42, s:1.0,  rot:0},
      {type:'stallRow',      offset:[.16,-.04], col:0xf2eee2, roof:0xc64d42, s:.92,  rot:-.4},
      {type:'villageHouse',  offset:[-.18,-.1], col:0xe7c08a, roof:0xc24d42, s:.88,  rot:.3}],
    roads:[{offset:[-.2,-.16],to:[.2,.12],width:2.8,curve:.05,markings:true}],
    props:[
      ['paperLanternRow',[-.04,-.02],1.05,.2],['paperLanternRow',[.08,.08],1.0,-.4],
      ['foodCart',[.14,.06],1.0,.3],['fireworkRack',[-.14,.04],1.0,-.2],
      ['taikoDrum',[.06,-.1],1.0,.5],['taikoDrum',[-.08,-.12],1.0,-.3],
      ['stoneLantern',[-.16,.0],1,0],['stoneLantern',[.16,-.16],1,0],
      ['guardRail',[-.18,.1],1,.15],['guardRail',[.18,.08],1,-.1],
      ['signboard',[.0,.16],1.1,.1],['crateStack',[.16,.12],1,.4]],
    wires:[[[-.18,-.16],[.0,-.17]],[[.0,-.17],[.18,-.16]]]
  });
  registerLink('festival','market',{width:1.5,curve:.04});

  // ambient scatter so the plaza blends into the horizon
  registerDecorator(function(){
    if(typeof tree==='function'){ tree(1.92,Math.PI/2+0.62,'sakura',.85); tree(2.12,Math.PI/2+0.58,'round',.9); }
  });

  registerEnvPack({id:'festival',theme:'matsuri',title:'Matsuri Grounds',capability:'Community'});
})();
