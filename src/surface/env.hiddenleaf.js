/* === env.hiddenleaf.js — Hidden Leaf Quarter (Naruto flavor) ==============
   TriFable · MiniVerse environment pack. Capability station: KNOWLEDGE —
   the Academy archives a builder's tasks, skills and SFT models.
   Anime cel + ink-outline styling, authored against the registry contract
   in kurama.registry.js. Classic script, shared global scope. ============= */
(function(){
  // ---------- buildings (ctx.bx/cy/cn are NOT pre-scaled — multiply by ctx.s) ----------

  // Hokage-style spire: round tower, layered tile roof, kanji crest, banners.
  registerBuilding('hokageSpire', function(ctx){
    const {add,bx,cy,cn,outline,toon,PAL,THREE,s,col,roof,bobbers,bannerG,g}=ctx;
    const drum=add(cy(1.5*s,1.7*s,3.2*s,12,col));drum.position.y=1.6*s;g.add(outline(drum,1.025));
    const band=add(cy(1.62*s,1.62*s,.34*s,12,0xe7ddc9));band.position.y=2.4*s;
    const eave=add(cy(2.15*s,2.15*s,.2*s,12,roof));eave.position.y=3.3*s;g.add(outline(eave,1.02));
    const cap=add(cn(1.9*s,1.5*s,12,roof));cap.position.y=4.25*s;g.add(outline(cap,1.025));
    const finial=add(cy(.12*s,.12*s,.6*s,8,PAL.gold));finial.position.y=5.2*s;
    const crest=add(new THREE.Mesh(new THREE.TorusGeometry(.34*s,.07*s,8,22),new THREE.MeshBasicMaterial({color:PAL.crimson})));
    crest.position.set(0,2.55*s,1.55*s);
    const door=add(bx(.8*s,1.4*s,.1*s,0x49362c),false);door.position.set(0,.7*s,1.5*s);
    for(let k=0;k<6;k++){const a=k/6*Math.PI*2;const wf=add(bx(.5*s,.7*s,.08*s,0x31434a),false);
      wf.position.set(Math.cos(a)*1.52*s,2.0*s,Math.sin(a)*1.52*s);wf.lookAt(Math.cos(a)*4*s,2.0*s,Math.sin(a)*4*s);}
    for(const x of[-1.0,1.0]) if(typeof bannerG==='function') bannerG(g,PAL.crimson,x*s,1.4*s,3.0*s);
  });

  // Ichiraku-style noodle stall: counter, split noren awning, stools, hanging lamp + steam.
  registerBuilding('noodleStall', function(ctx){
    const {add,bx,cy,cn,outline,toon,PAL,THREE,s,col,roof,particles,g}=ctx;
    const counter=add(bx(2.6*s,.9*s,1.0*s,col));counter.position.set(0,.45*s,0);g.add(outline(counter,1.03));
    const top=add(bx(2.8*s,.12*s,1.2*s,0x7a5236));top.position.y=.96*s;
    for(const x of[-1.1,1.1]){const post=add(cy(.08*s,.08*s,2.0*s,7,0x5a3a1e));post.position.set(x,1.5*s,.4*s);}
    const awn=add(bx(3.0*s,.14*s,1.4*s,roof));awn.position.set(0,2.45*s,.1*s);awn.rotation.x=-.12;g.add(outline(awn,1.02));
    // noren curtains (alpha-free toon strips)
    for(let i=-2;i<=2;i++){const c=add(bx(.5*s,.7*s,.04*s,i%2?0xf0e6d6:PAL.crimson),false);c.position.set(i*.52*s,2.0*s,.78*s);}
    for(const x of[-.7,0,.7]){const stool=add(cy(.18*s,.2*s,.5*s,8,0x6f4a2c));stool.position.set(x,.25*s,1.05*s);}
    const lamp=add(new THREE.Mesh(new THREE.SphereGeometry(.22*s,10,8),toon(PAL.hot,.6)));lamp.position.set(0,2.0*s,.2*s);
    bobbers&&bobbers.push({m:lamp,bob:2.0*s,amp:.04});
    // rising steam
    for(let i=0;i<5;i++){const st=new THREE.Mesh(new THREE.SphereGeometry(.06*s,6,5),new THREE.MeshBasicMaterial({color:0xf2efe6,transparent:true,opacity:.5,depthWrite:false}));
      st.position.set((Math.random()-.5)*.8*s,1.1*s+Math.random()*.5,.1*s);st.userData.fall=-(0.1+Math.random()*0.18);st.userData.sway=1+Math.random()*2;st.userData.sy=st.position.y;particles&&particles.push(st);g.add(st);}
  });

  // Academy hall: wide low pitched-roof schoolhouse with a clock/seal medallion + window rows.
  registerBuilding('academyHall', function(ctx){
    const {add,bx,cn,win,outline,toon,PAL,THREE,s,col,roof,g}=ctx;
    const base=add(bx(4.2*s,1.9*s,2.6*s,col));base.position.y=.95*s;g.add(outline(base,1.022));
    const roof1=add(bx(4.6*s,.22*s,1.6*s,roof));roof1.position.set(0,2.0*s,-.5*s);roof1.rotation.x=.22;g.add(outline(roof1,1.018));
    const roof2=add(bx(4.6*s,.22*s,1.6*s,roof));roof2.position.set(0,2.0*s,.5*s);roof2.rotation.x=-.22;g.add(outline(roof2,1.018));
    const medal=add(new THREE.Mesh(new THREE.TorusGeometry(.4*s,.08*s,8,24),toon(PAL.gold,.2)));medal.position.set(0,1.5*s,1.32*s);
    const seal=add(new THREE.Mesh(new THREE.CircleGeometry(.3*s,20),new THREE.MeshBasicMaterial({color:PAL.crimson})),false);seal.position.set(0,1.5*s,1.34*s);
    for(const x of[-1.5,-.5,.5,1.5]){const fr=add(bx(.55*s,.7*s,.08*s,0x31434a),false);fr.position.set(x,1.0*s,1.31*s);win(x,1.0*s,1.33*s);}
    const door=add(bx(.9*s,1.3*s,.1*s,0x4a382c),false);door.position.set(0,.65*s,1.31*s);
  });

  // ---------- props (ctx.bx/cy/cn ARE pre-scaled; scale positions by ctx.s) ----------

  // Catenary of paper lanterns strung between two poles.
  registerProp('lanternString', function(ctx){
    const {add,cy,toon,PAL,THREE,s,bobbers,g}=ctx;
    for(const x of[-1.3,1.3]){const pole=add(cy(.05,.06,2.2,7,0x5a3a1e));pole.position.set(x*s,1.1*s,0);}
    for(let i=-3;i<=3;i++){const sag=Math.cos(i/3*Math.PI/2)*.5;
      const lan=add(new THREE.Mesh(new THREE.SphereGeometry(.16*s,10,8),toon(i%2?PAL.crimson:PAL.hot,.5)));
      lan.position.set(i*.34*s,(1.9-sag)*s,0);lan.scale.y=1.2;bobbers&&bobbers.push({m:lan,bob:(1.9-sag)*s,amp:.03});}
  }, 0.0);

  // Standing ramen signboard (bowl glyph).
  registerProp('ramenSign', function(ctx){
    const {add,bx,cy,outline,PAL,s,g}=ctx;
    const pole=add(cy(.05,.06,1.6,7,0x565d5d));pole.position.y=.8*s;
    const board=add(bx(.9,.5,.08,PAL.crimson));board.position.set(0,1.45*s,0);g.add(outline(board,1.03));
    const bowl=add(bx(.42,.18,.06,0xf0e6d6));bowl.position.set(0,1.45*s,.06*s);
    const steam=add(bx(.06,.22,.04,0xf0e6d6));steam.position.set(0,1.72*s,.06*s);steam.rotation.z=.3;
  }, 0.26);

  // Weapon rack with kunai / shuriken.
  registerProp('kunaiRack', function(ctx){
    const {add,bx,cy,cn,outline,toon,s,g}=ctx;
    const frame=add(bx(1.1,.1,.4,0x6f4a2c));frame.position.y=1.0*s;
    for(const x of[-.45,.45]){const leg=add(bx(.1,1.0,.1,0x5a3a1e));leg.position.set(x*s,.5*s,0);}
    for(let i=-2;i<=2;i++){const blade=add(cn(.05,.34,4,0xb9c2c8));blade.position.set(i*.22*s,.78*s,0);blade.rotation.x=Math.PI;}
    const shuriken=add(new THREE.Mesh(new THREE.TorusGeometry(.12*s,.04*s,4,8),toon(0x9aa3aa)));shuriken.position.set(.0,1.18*s,.05*s);g.add(outline(shuriken,1.05));
  }, 0.32);

  // ---------- district (placed on a free band; linked into the market hub) ----------
  registerDistrict({
    id:'hiddenleaf', name:'Hidden Leaf Quarter · Knowledge Archive', t:1.7, p:Math.PI/2+0.18, radius:.33,
    buildings:[
      {type:'hokageSpire',  offset:[0,-.02],  col:0xefe4d1, roof:0xc24d42, s:1.05, rot:Math.PI},
      {type:'academyHall',  offset:[-.16,.12], col:0xf2eee2, roof:0x8e5648, s:.95},
      {type:'noodleStall',  offset:[.18,.1],   col:0xe9c690, roof:0xc64d42, s:.95, rot:-.3},
      {type:'villageHouse', offset:[.2,-.1],   col:0xb9c6e1, roof:0x626b91, s:.9}],
    roads:[{offset:[-.22,.04],to:[.24,.05],width:2.6,curve:.04,markings:true}],
    props:[
      ['lanternString',[0,.06],1.05,.2],['ramenSign',[.15,.16],1,-.2],['kunaiRack',[-.1,-.08],1,.3],
      ['stoneLantern',[-.16,.02],1,0],['stoneLantern',[.16,.02],1,0],['redMailbox',[.05,.14],1,0],
      ['guardRail',[-.18,.13],1,.15],['guardRail',[.18,.12],1,-.1],['signboard',[.0,-.12],1.1,.1],['pottedPlants',[-.12,-.02],1,0]],
    wires:[[[-.18,-.12],[.0,-.13]],[[.0,-.13],[.18,-.12]]]
  });
  registerLink('hiddenleaf','market',{width:1.4,curve:.03});
  registerLink('hiddenleaf','dojo',{width:1.25,curve:-.04});

  // ambient scatter so the quarter blends into the horizon
  registerDecorator(function(){
    if(typeof tree==='function'){ tree(1.62,Math.PI/2+0.30,'sakura',.8); tree(1.82,Math.PI/2+0.28,'round',.9); }
  });

  registerEnvPack({id:'hiddenleaf',theme:'naruto',title:'Hidden Leaf Quarter',capability:'Knowledge'});
})();
