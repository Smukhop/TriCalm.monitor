/* === env.sakura.js — Sakura Terrace · Origin Garden ======================
   TriFable · MiniVerse environment pack. Capability station: IDENTITY —
   the Origin Garden is where a builder's first self is rooted: a quiet
   pastoral terrace of tea, koi and falling petals.
   Anime cel + ink-outline styling, authored against the registry contract
   in kurama.registry.js. Classic script, shared global scope. ============= */
(function(){
  // ---------- buildings (ctx.bx/cy/cn are NOT pre-scaled — multiply by ctx.s) ----------

  // Tea house: low open pavilion, wide gentle slate roof, paper walls, small veranda + glow.
  registerBuilding('teaHouse', function(ctx){
    const {add,bx,cy,cn,win,outline,toon,PAL,THREE,s,col,roof,bobbers,g}=ctx;
    // raised wooden veranda deck the whole pavilion sits on
    const deck=add(bx(3.4*s,.3*s,2.8*s,0x9a6f44));deck.position.y=.15*s;g.add(outline(deck,1.018));
    const step=add(bx(1.4*s,.16*s,.5*s,0x8a6038));step.position.set(0,.08*s,1.55*s);
    // cream body with paper-wall lattice (open pavilion, low and broad)
    const body=add(bx(2.7*s,1.5*s,2.1*s,col));body.position.y=1.05*s;g.add(outline(body,1.022));
    // paper panel insets (warm shoji glow at night)
    for(const x of[-.7,.7]){const frame=add(bx(.66*s,.92*s,.06*s,0x6f4a2c),false);frame.position.set(x,1.1*s,1.06*s);
      const panel=add(bx(.52*s,.78*s,.07*s,0xf4ead6),false);panel.position.set(x,1.1*s,1.09*s);win(x,1.1*s,1.11*s);}
    const door=add(bx(.7*s,1.0*s,.08*s,0x4f3a2a),false);door.position.set(0,.7*s,1.07*s);
    // corner posts holding the wide eaves
    for(const x of[-1.45,1.45])for(const z of[-1.05,1.05]){const post=add(cy(.08*s,.09*s,1.7*s,7,0x5a3a1e));post.position.set(x,1.0*s,z);}
    // wide gentle slate roof — two shallow box slopes + a ridge cap, eaves overhanging far
    const eaveZ=add(bx(3.9*s,.2*s,1.7*s,roof));eaveZ.position.set(0,2.05*s,-.55*s);eaveZ.rotation.x=.2;g.add(outline(eaveZ,1.016));
    const eaveZf=add(bx(3.9*s,.2*s,1.7*s,roof));eaveZf.position.set(0,2.05*s,.55*s);eaveZf.rotation.x=-.2;g.add(outline(eaveZf,1.016));
    const ridge=add(bx(4.0*s,.16*s,.26*s,0x4a5560));ridge.position.y=2.34*s;g.add(outline(ridge,1.02));
    // upturned corner accents (sakura crimson) at the eave tips for the painterly read
    for(const x of[-1.9,1.9]){const tip=add(cn(.16*s,.34*s,4,PAL.crimson),false);tip.position.set(x,2.18*s,0);tip.rotation.z=x>0?-.5:.5;}
    // hanging pink lantern under the veranda eave — gentle bob, additive glow
    const lantern=add(new THREE.Mesh(new THREE.SphereGeometry(.2*s,10,8),toon(0xf6a8c0,.6)));lantern.scale.y=1.25;lantern.position.set(.95*s,1.7*s,1.0*s);
    const halo=new THREE.Mesh(new THREE.SphereGeometry(.3*s,8,6),new THREE.MeshBasicMaterial({color:0xf6a8c0,transparent:true,opacity:.4,blending:THREE.AdditiveBlending,depthWrite:false}));
    halo.position.copy(lantern.position);g.add(halo);
    bobbers&&bobbers.push({m:lantern,bob:1.7*s,amp:.04});bobbers&&bobbers.push({m:halo,bob:1.7*s,amp:.04});
  });

  // Koi pavilion: a deck platform reaching over a round water disc with a small shelter.
  registerBuilding('koiPavilion', function(ctx){
    const {add,bx,cy,cn,outline,toon,PAL,THREE,s,col,roof,bobbers,particles,g}=ctx;
    // round water disc the pavilion overlooks (cel teal, faintly emissive)
    const water=add(new THREE.Mesh(new THREE.CylinderGeometry(1.9*s,1.9*s,.12*s,20),toon(0x6fb9c4,.22)),false);water.position.set(0,.06*s,-.4*s);g.add(outline(water,1.01));
    const rim=add(new THREE.Mesh(new THREE.TorusGeometry(1.92*s,.08*s,8,28),toon(0x9a958c)));rim.position.set(0,.12*s,-.4*s);rim.rotation.x=Math.PI/2;
    // drifting koi shapes just above the surface (slow spin around the disc)
    for(let i=0;i<3;i++){const koi=new THREE.Group();const bodyk=add(new THREE.Mesh(new THREE.CapsuleGeometry(.1*s,.26*s,4,7),toon(i===2?0xf2f0e6:PAL.ember)),false);bodyk.rotation.z=Math.PI/2;koi.add(bodyk);
      const a=i/3*Math.PI*2;koi.position.set(Math.cos(a)*1.0*s,.16*s,-.4*s+Math.sin(a)*1.0*s);koi.rotation.y=a;g.add(koi);bobbers&&bobbers.push({m:koi,spinY:.25});}
    // raised viewing deck reaching out over the water
    const deck=add(bx(2.0*s,.26*s,2.7*s,0x9a6f44));deck.position.set(0,.5*s,.85*s);g.add(outline(deck,1.018));
    for(const x of[-.85,.85])for(const z of[.0,1.6]){const piling=add(cy(.08*s,.1*s,1.0*s,7,0x6a4a2e));piling.position.set(x,.0,z);}
    // low rail along the water edge of the deck
    for(let i=-2;i<=2;i++){const baluster=add(bx(.07*s,.4*s,.07*s,0x6f4a2c),false);baluster.position.set(i*.42*s,.83*s,-.4*s);}
    const handrail=add(bx(2.0*s,.08*s,.08*s,0x5a3a1e));handrail.position.set(0,1.02*s,-.4*s);
    // small shelter at the land end: cream body + four posts + a peaked slate roof
    const hut=add(bx(1.5*s,1.1*s,1.2*s,col));hut.position.set(0,1.18*s,1.55*s);g.add(outline(hut,1.022));
    for(const x of[-.85,.85]){const post=add(cy(.07*s,.08*s,1.3*s,7,0x5a3a1e));post.position.set(x,1.2*s,.4*s);}
    const shelterRoof=add(cn(1.55*s,1.0*s,4,roof));shelterRoof.position.set(0,2.35*s,1.55*s);shelterRoof.rotation.y=Math.PI/4;g.add(outline(shelterRoof,1.025));
    const finial=add(new THREE.Mesh(new THREE.OctahedronGeometry(.16*s,0),new THREE.MeshBasicMaterial({color:PAL.soul})));finial.position.set(0,3.0*s,1.55*s);g.add(finial);bobbers&&bobbers.push({m:finial,bob:3.0*s,amp:.05});
    // falling petals over the pond
    for(let i=0;i<5;i++){const pt=new THREE.Mesh(new THREE.PlaneGeometry(.08,.08),new THREE.MeshBasicMaterial({color:0xffccd9,side:THREE.DoubleSide,transparent:true,opacity:.85}));
      pt.position.set((Math.random()-.5)*2.4*s,.8*s+Math.random()*.8,-.4*s+(Math.random()-.5)*2.4*s);
      pt.userData.fall=.12+Math.random()*.2;pt.userData.sway=1+Math.random()*2;pt.userData.sy=pt.position.y;particles&&particles.push(pt);g.add(pt);}
  });

  // ---------- props (ctx.bx/cy/cn ARE pre-scaled; scale positions by ctx.s) ----------

  // Arched red foot-bridge with rails and planks over a small span.
  registerProp('redBridge', function(ctx){
    const {add,bx,cy,outline,toon,PAL,THREE,s,g}=ctx;
    // arched deck built from short planks following a torus arc
    const span=7;
    for(let i=0;i<span;i++){const t=(i/(span-1)-.5)*Math.PI*.7;const plank=add(bx(.34,.1,.9,0xc9473f));
      plank.position.set(Math.sin(t)*1.0*s,(.55+Math.cos(t)*.0+Math.cos(i/(span-1)*Math.PI)* .35)*s,0);
      plank.rotation.z=-t*.55;g.add(outline(plank,1.02));}
    // crimson hand-rails arcing across both sides
    for(const z of[-.42,.42]){const rail=add(new THREE.Mesh(new THREE.TorusGeometry(1.05*s,.05*s,6,18,Math.PI),toon(PAL.crimson)));
      rail.position.set(0,.55*s,z*s);rail.rotation.z=Math.PI;}
    // end posts with little knobs
    for(const x of[-1.0,1.0])for(const z of[-.42,.42]){const post=add(cy(.07,.08,.6,7,0x9e362f));post.position.set(x*s,.55*s,z*s);
      const knob=add(new THREE.Mesh(new THREE.SphereGeometry(.08*s,8,6),toon(PAL.gold)),false);knob.position.set(x*s,.88*s,z*s);}
  }, 0.3);

  // A short flight of stone steps climbing the terrace.
  registerProp('stoneSteps', function(ctx){
    const {add,bx,outline,s,g}=ctx;
    for(let i=0;i<5;i++){const step=add(bx(1.1,.16,.4,i%2?0xcfc8ba:0xc2bbac));
      step.position.set(0,.08*s+i*.16*s,-.7*s+i*.32*s);g.add(outline(step,1.014));}
    // low side cheeks framing the flight
    for(const x of[-.6,.6]){const cheek=add(bx(.18,.5,1.7,0xb6afa0));cheek.position.set(x*s,.35*s,0);g.add(outline(cheek,1.018));}
  }, 0.2);

  // Stone lantern with a soft pink soul-glow inside the lamp box.
  registerProp('sakuraLantern', function(ctx){
    const {add,bx,cy,cn,outline,toon,THREE,s,bobbers,g}=ctx;
    const base=add(cy(.26,.34,.26,6,0xaaa69a));base.position.y=.13*s;
    const stem=add(cy(.1,.13,.62,6,0xa19e94));stem.position.y=.52*s;
    const lamp=add(bx(.42,.4,.42,0xc4bfae));lamp.position.y=1.0*s;g.add(outline(lamp,1.025));
    // pink glow core peeking through the lamp openings
    const glow=new THREE.Mesh(new THREE.SphereGeometry(.16*s,8,6),new THREE.MeshBasicMaterial({color:0xf6a8c0,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false}));
    glow.position.y=1.0*s;g.add(glow);bobbers&&bobbers.push({m:glow,bob:1.0*s,amp:.02});
    const cap=add(cn(.4,.26,4,0x8e8a82));cap.position.y=1.34*s;cap.rotation.y=Math.PI/4;
    const top=add(new THREE.Mesh(new THREE.SphereGeometry(.07*s,8,6),toon(0xf2554b)),false);top.position.y=1.5*s;
  }, 0.25);

  // Round koi pond: still water disc with concentric ripple rings + floating lily pads.
  registerProp('koiPond', function(ctx){
    const {add,toon,THREE,s,bobbers,g}=ctx;
    // shallow water disc
    const water=add(new THREE.Mesh(new THREE.CylinderGeometry(1.1*s,1.1*s,.1*s,20),toon(0x6fb9c4,.2)),false);water.position.y=.05*s;
    const rim=add(new THREE.Mesh(new THREE.TorusGeometry(1.12*s,.07*s,8,26),toon(0x9a958c)));rim.position.y=.1*s;rim.rotation.x=Math.PI/2;
    // concentric ripple rings, slowly turning (additive shimmer)
    for(let i=0;i<3;i++){const r=new THREE.Mesh(new THREE.TorusGeometry((.32+i*.24)*s,.012*s,5,28),new THREE.MeshBasicMaterial({color:0xcfe3ff,transparent:true,opacity:.4,blending:THREE.AdditiveBlending,depthWrite:false}));
      r.rotation.x=-Math.PI/2;r.position.y=.11*s;g.add(r);bobbers&&bobbers.push({m:r,spinY:.1+i*.05});}
    // lily pads + a couple of pink blossoms
    for(let i=0;i<4;i++){const a=i/4*Math.PI*2;const pad=add(new THREE.Mesh(new THREE.CircleGeometry(.22*s,10),toon(0x4e8d54)),false);
      pad.rotation.x=-Math.PI/2;pad.position.set(Math.cos(a)*.62*s,.115*s,Math.sin(a)*.62*s);
      if(i%2){const bloom=add(new THREE.Mesh(new THREE.SphereGeometry(.07*s,8,6),toon(0xf6a8c0)),false);bloom.position.set(Math.cos(a)*.62*s,.16*s,Math.sin(a)*.62*s);}}
  }, 0.2);

  // ---------- district (placed near the shrine band; linked into the shrine hub) ----------
  registerDistrict({
    id:'sakura', name:'Sakura Terrace · Origin Garden', t:-1.15, p:Math.PI/2-0.34, radius:.3,
    buildings:[
      {type:'teaHouse',     offset:[0,.0],     col:0xf3eadc, roof:0x5d6b78, s:1.0,  rot:Math.PI},
      {type:'koiPavilion',  offset:[-.17,.13],  col:0xefe4d1, roof:0x55636f, s:.95, rot:-.4},
      {type:'villageHouse', offset:[.19,.1],    col:0xf2e6d2, roof:0x6b7783, s:.85, rot:.3},
      {type:'koiPavilion',  offset:[.16,-.13],  col:0xefe4d1, roof:0x55636f, s:.8,  rot:2.4}],
    roads:[{offset:[-.2,-.04],to:[.22,.06],width:2.4,curve:.05,color:0xcdbfa6,markings:false}],
    props:[
      ['redBridge',[0,.07],1.05,.2],['stoneSteps',[-.1,-.08],1,.15],
      ['sakuraLantern',[-.15,.03],1,0],['sakuraLantern',[.15,.03],1,0],['sakuraLantern',[.04,.14],1,0],
      ['koiPond',[.1,-.04],1,0],
      ['stoneLantern',[-.17,-.02],1,0],['guardRail',[-.19,.12],1,.15],['guardRail',[.19,.11],1,-.1],
      ['signboard',[.0,-.13],1.1,.1],['crateStack',[.17,.16],.9,.4],['pottedPlants',[-.12,.06],1,0]],
    wires:[[[-.18,-.12],[.0,-.13]],[[.0,-.13],[.18,-.12]]]
  });
  registerLink('sakura','shrine',{width:1.35,curve:.04});

  // ambient scatter so the garden melts into the horizon
  registerDecorator(function(){
    if(typeof tree==='function'){ tree(-1.32,Math.PI/2-0.18,'sakura',.95); tree(-1.0,Math.PI/2-0.2,'sakura',.8); tree(-1.2,Math.PI/2-0.52,'round',.85); }
  });

  registerEnvPack({id:'sakura',theme:'pastoral',title:'Sakura Terrace',capability:'Identity'});
})();
