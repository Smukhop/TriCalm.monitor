/* === env.skillforge.js — Ember Skill Forge · Skills Anvil (Naruto flavor) ==
   TriFable · MiniVerse environment pack. Capability station: SKILLS — the
   smithy where a builder's skills are hammered, tempered and racked. Iron-grey
   stone bodies, ember/crimson roofs, forge-glow everywhere.
   Anime cel + ink-outline styling, authored against the registry contract
   in kurama.registry.js. Classic script, shared global scope. ============= */
(function(){
  // ---------- buildings (ctx.bx/cy/cn are NOT pre-scaled — multiply by ctx.s) ----------

  // Blast furnace: tall stone stack, banded brick courses, a chimney + ember mouth glow.
  registerBuilding('blastFurnace', function(ctx){
    const {add,bx,cy,cn,outline,toon,PAL,THREE,s,col,roof,bobbers,particles,g}=ctx;
    const slab=add(cy(1.7*s,1.9*s,.4*s,12,0x8f857a));slab.position.y=.2*s;g.add(outline(slab,1.02));
    const stack=add(cy(1.2*s,1.55*s,3.4*s,12,col));stack.position.y=2.1*s;g.add(outline(stack,1.025));
    // banded brick courses for read at distance
    for(const y of[1.0,1.9,2.8]){const band=add(cy(1.42*s,1.42*s,.18*s,12,0x6e5f50));band.position.y=y*s;}
    // tapered chimney cap + flue
    const taper=add(cn(1.35*s,1.1*s,12,col));taper.position.y=4.2*s;g.add(outline(taper,1.025));
    const flue=add(cy(.42*s,.5*s,1.0*s,10,0x5a4d40));flue.position.y=5.1*s;g.add(outline(flue,1.03));
    const lip=add(cy(.56*s,.56*s,.16*s,10,roof));lip.position.y=5.62*s;
    // glowing furnace mouth at the base front
    const arch=add(bx(.95*s,1.1*s,.18*s,0x3a2c22),false);arch.position.set(0,.85*s,1.3*s);
    const mouth=new THREE.Mesh(new THREE.PlaneGeometry(.78*s,.86*s),new THREE.MeshBasicMaterial({color:PAL.ember,transparent:true,opacity:.92,blending:THREE.AdditiveBlending,depthWrite:false}));
    mouth.position.set(0,.85*s,1.41*s);g.add(mouth);bobbers&&bobbers.push({m:mouth,bob:.85*s,amp:.02});
    // ember halo at the mouth + lazy smoke from the flue
    const halo=new THREE.Mesh(new THREE.SphereGeometry(.34*s,10,8),new THREE.MeshBasicMaterial({color:PAL.gold,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false}));
    halo.position.set(0,.85*s,1.46*s);g.add(halo);bobbers&&bobbers.push({m:halo,bob:.85*s,amp:.05});
    for(let i=0;i<5;i++){const sm=new THREE.Mesh(new THREE.SphereGeometry(.09*s,6,5),new THREE.MeshBasicMaterial({color:0x6b625a,transparent:true,opacity:.4,depthWrite:false}));
      sm.position.set((Math.random()-.5)*.4*s,5.7*s+Math.random()*.4,0);sm.userData.fall=-(0.08+Math.random()*0.14);sm.userData.sway=1+Math.random()*2;sm.userData.sy=sm.position.y;particles&&particles.push(sm);g.add(sm);}
    // a couple of bellows pipes hugging the stack
    for(const x of[-1.0,1.0]){const pipe=add(cy(.07*s,.07*s,2.0*s,7,0x737a78),false);pipe.position.set(x*s,1.4*s,.7*s);}
  });

  // Anvil yard: open timber-post forge over a stone slab, 2 anvils + a glowing forge pit.
  registerBuilding('anvilYard', function(ctx){
    const {add,bx,cy,cn,outline,toon,PAL,THREE,s,col,roof,bobbers,particles,g}=ctx;
    const slab=add(bx(3.6*s,.34*s,3.0*s,0x8f857a));slab.position.y=.17*s;g.add(outline(slab,1.018));
    // four corner timber posts holding a pitched ember-tile roof
    for(const x of[-1.5,1.5])for(const z of[-1.2,1.2]){const post=add(cy(.13*s,.15*s,2.2*s,8,0x6f4a2c));post.position.set(x*s,1.3*s,z*s);g.add(outline(post,1.03));}
    const beam1=add(bx(3.4*s,.16*s,.16*s,0x5a3a1e),false);beam1.position.set(0,2.35*s,-1.2*s);
    const beam2=add(bx(3.4*s,.16*s,.16*s,0x5a3a1e),false);beam2.position.set(0,2.35*s,1.2*s);
    const roof1=add(bx(3.9*s,.2*s,1.9*s,roof));roof1.position.set(0,2.6*s,-.55*s);roof1.rotation.x=.26;g.add(outline(roof1,1.018));
    const roof2=add(bx(3.9*s,.2*s,1.9*s,roof));roof2.position.set(0,2.6*s,.55*s);roof2.rotation.x=-.26;g.add(outline(roof2,1.018));
    const ridge=add(bx(4.0*s,.14*s,.14*s,0x7a3c30),false);ridge.position.set(0,2.92*s,0);
    // glowing sunken forge pit at center
    const ring=add(cy(.65*s,.72*s,.34*s,12,0x6e5f50));ring.position.set(0,.34*s,-.4*s);g.add(outline(ring,1.03));
    const coals=new THREE.Mesh(new THREE.CircleGeometry(.55*s,16),new THREE.MeshBasicMaterial({color:PAL.ember,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false}));
    coals.rotation.x=-Math.PI/2;coals.position.set(0,.52*s,-.4*s);g.add(coals);
    const pitGlow=new THREE.Mesh(new THREE.SphereGeometry(.4*s,10,8),new THREE.MeshBasicMaterial({color:PAL.gold,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false}));
    pitGlow.position.set(0,.65*s,-.4*s);g.add(pitGlow);bobbers&&bobbers.push({m:pitGlow,bob:.65*s,amp:.06});
    // two stump-mounted anvils up front
    for(const x of[-.95,.95]){
      const stump=add(cy(.26*s,.3*s,.5*s,8,0x5a3a1e));stump.position.set(x*s,.42*s,.85*s);
      const body=add(bx(.5*s,.2*s,.28*s,0x4a4d50));body.position.set(x*s,.78*s,.85*s);g.add(outline(body,1.05));
      const horn=add(cn(.13*s,.34*s,8,0x4a4d50));horn.position.set((x>0?x+.34:x-.34)*s,.78*s,.85*s);horn.rotation.z=Math.PI/2;
      const waist=add(bx(.22*s,.14*s,.18*s,0x3f4245));waist.position.set(x*s,.62*s,.85*s);
    }
    // rising sparks off the pit
    for(let i=0;i<6;i++){const sp=new THREE.Mesh(new THREE.SphereGeometry(.04*s,5,4),new THREE.MeshBasicMaterial({color:PAL.gold,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false}));
      sp.position.set((Math.random()-.5)*.7*s,.7*s+Math.random()*.6,(-.4+(Math.random()-.5)*.5)*s);sp.userData.fall=-(0.18+Math.random()*0.25);sp.userData.sway=2+Math.random()*2;sp.userData.sy=sp.position.y;particles&&particles.push(sp);g.add(sp);}
  });

  // Tool hall: low workshop, a hung tool-rack facade + roll-up shutter, ember sign.
  registerBuilding('toolHall', function(ctx){
    const {add,bx,cy,cn,win,outline,toon,PAL,THREE,s,col,roof,g}=ctx;
    const base=add(bx(3.8*s,1.8*s,2.4*s,col));base.position.y=.9*s;g.add(outline(base,1.022));
    const roof1=add(bx(4.2*s,.22*s,2.8*s,roof));roof1.position.y=1.95*s;roof1.rotation.z=.03;g.add(outline(roof1,1.018));
    const eave=add(bx(4.3*s,.12*s,.5*s,0x7a3c30),false);eave.position.set(0,1.7*s,1.3*s);eave.rotation.x=-.16;
    // corrugated roll-up shutter
    const shutter=add(bx(1.5*s,1.2*s,.1*s,0x565d5d));shutter.position.set(-.9*s,.7*s,1.21*s);g.add(outline(shutter,1.02));
    for(let i=0;i<5;i++){const slat=add(bx(1.5*s,.04*s,.04*s,0x3f4245),false);slat.position.set(-.9*s,(.3+i*.24)*s,1.27*s);}
    // tool-rack facade: hammers + tongs hung on the right wall
    const rackbar=add(bx(1.7*s,.08*s,.08*s,0x5a3a1e),false);rackbar.position.set(1.0*s,1.5*s,1.22*s);
    for(let i=-2;i<=2;i++){
      const hx=(1.0+i*.32);
      const handle=add(cy(.03*s,.03*s,.6*s,6,0x6f4a2c),false);handle.position.set(hx*s,1.18*s,1.24*s);
      if(i%2){const head=add(bx(.16*s,.1*s,.1*s,0x4a4d50),false);head.position.set(hx*s,1.46*s,1.26*s);}
      else{const jaw=add(cn(.06*s,.22*s,6,0x9aa3aa),false);jaw.position.set(hx*s,1.5*s,1.26*s);}
    }
    // ember sign medallion + a side window
    const sign=add(bx(1.0*s,.42*s,.08*s,PAL.gold),false);sign.position.set(-.9*s,1.55*s,1.22*s);
    const stud=add(new THREE.Mesh(new THREE.TorusGeometry(.14*s,.04*s,6,18),new THREE.MeshBasicMaterial({color:PAL.ember})),false);stud.position.set(-.9*s,1.55*s,1.28*s);
    const fr=add(bx(.6*s,.6*s,.08*s,0x31434a),false);fr.position.set(1.4*s,.95*s,1.21*s);win(1.4*s,.95*s,1.24*s);
  });

  // ---------- props (ctx.bx/cy/cn ARE pre-scaled; scale positions by ctx.s) ----------

  // Ore cart: wooden tipper of ore chunks sitting on a short rail.
  registerProp('oreCart', function(ctx){
    const {add,bx,cy,cn,outline,toon,PAL,THREE,s,g}=ctx;
    for(const z of[-.5,.5]){const rail=add(bx(1.6,.06,.06,0x6b625a),false);rail.position.set(0,.05*s,z*s);}
    for(let i=-2;i<=2;i++){const tie=add(bx(.1,.05,1.1,0x5a3a1e),false);tie.position.set(i*.34*s,.03*s,0);}
    const tub=add(bx(.9,.5,.7,0x7a5236));tub.position.set(0,.45*s,0);g.add(outline(tub,1.04));
    const lip=add(bx(.98,.1,.78,0x6f4a2c),false);lip.position.set(0,.7*s,0);
    for(const x of[-.4,.4])for(const z of[-.36,.36]){const wheel=add(new THREE.Mesh(new THREE.TorusGeometry(.16*s,.05*s,6,10),toon(0x4a4d50)));wheel.position.set(x*s,.16*s,z*s);wheel.rotation.y=Math.PI/2;}
    // heaped ore chunks
    for(const o of[[-.2,.62,-.12],[.18,.66,.1],[0,.74,0],[-.05,.6,.22]]){const ore=add(new THREE.Mesh(new THREE.OctahedronGeometry(.14*s,0),toon(0x8a8f7a)));ore.position.set(o[0]*s,o[1]*s,o[2]*s);ore.rotation.y=o[0];}
  }, 0.3);

  // Ember pit: sunken brazier ringed in stone with an additive ember glow.
  registerProp('emberPit', function(ctx){
    const {add,cy,outline,toon,PAL,THREE,s,bobbers,particles,g}=ctx;
    const ring=add(cy(.5,.56,.3,12,0x6e5f50));ring.position.y=.15*s;g.add(outline(ring,1.03));
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const stone=add(new THREE.Mesh(new THREE.DodecahedronGeometry(.1*s,0),toon(0x8f857a)));stone.position.set(Math.cos(a)*.48*s,.3*s,Math.sin(a)*.48*s);}
    const coals=new THREE.Mesh(new THREE.CircleGeometry(.4*s,14),new THREE.MeshBasicMaterial({color:PAL.ember,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false}));
    coals.rotation.x=-Math.PI/2;coals.position.y=.3*s;g.add(coals);
    const glow=new THREE.Mesh(new THREE.SphereGeometry(.3*s,10,8),new THREE.MeshBasicMaterial({color:PAL.gold,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false}));
    glow.position.y=.42*s;g.add(glow);bobbers&&bobbers.push({m:glow,bob:.42*s,amp:.05});
    for(let i=0;i<4;i++){const sp=new THREE.Mesh(new THREE.SphereGeometry(.03*s,5,4),new THREE.MeshBasicMaterial({color:PAL.gold,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false}));
      sp.position.set((Math.random()-.5)*.4*s,.45*s+Math.random()*.4,(Math.random()-.5)*.4*s);sp.userData.fall=-(0.16+Math.random()*0.22);sp.userData.sway=2+Math.random()*2;sp.userData.sy=sp.position.y;particles&&particles.push(sp);g.add(sp);}
  }, 0.25);

  // Tool rack: free-standing A-frame rack of hammers + tongs.
  registerProp('toolRack', function(ctx){
    const {add,bx,cy,cn,outline,toon,PAL,THREE,s,g}=ctx;
    for(const x of[-.5,.5]){const leg=add(bx(.08,1.4,.08,0x5a3a1e));leg.position.set(x*s,.7*s,0);}
    const bar=add(bx(1.2,.1,.12,0x6f4a2c));bar.position.y=1.3*s;g.add(outline(bar,1.04));
    const shelf=add(bx(1.1,.08,.4,0x7a5236));shelf.position.y=.3*s;
    // hung hammers + tongs
    for(let i=-2;i<=2;i++){const handle=add(cy(.025,.025,.7,6,0x6f4a2c),false);handle.position.set(i*.26*s,.92*s,0);
      if(i%2===0){const head=add(bx(.18,.1,.12,0x4a4d50));head.position.set(i*.26*s,1.24*s,0);}
      else{const jaw=add(cn(.06,.26,6,0x9aa3aa));jaw.position.set(i*.26*s,1.28*s,0);}}
    // a couple of stood tongs on the shelf
    for(const x of[-.3,.3]){const t=add(cy(.02,.02,.5,5,0x9aa3aa));t.position.set(x*s,.55*s,.12*s);t.rotation.z=.18;}
  }, 0.25);

  // ---------- district (placed on a free band; linked into the forge hub) ----------
  registerDistrict({
    id:'skillforge', name:'Ember Skill Forge · Skills Anvil', t:-1.95, p:Math.PI/2-0.08, radius:.32,
    buildings:[
      {type:'blastFurnace', offset:[0,-.04],   col:0x8a8079, roof:0xc24d42, s:1.05, rot:Math.PI},
      {type:'anvilYard',    offset:[-.17,.1],   col:0x9a8f82, roof:0xe06a32, s:.95, rot:-.2},
      {type:'toolHall',     offset:[.18,.1],    col:0x86827b, roof:0xc24d42, s:.95, rot:.15},
      {type:'villageHouse', offset:[.2,-.12],   col:0x9c8a76, roof:0x8e5648, s:.85}],
    roads:[{offset:[-.22,.05],to:[.24,.06],width:2.6,curve:.04,markings:true}],
    props:[
      ['oreCart',[.04,.07],1.05,.2],['emberPit',[-.1,-.06],1,0],['toolRack',[.12,-.04],1,-.2],
      ['emberPit',[.16,.14],.9,0],['stoneLantern',[-.16,.02],1,0],['stoneLantern',[.16,.02],1,0],
      ['guardRail',[-.18,.13],1,.15],['guardRail',[.18,.12],1,-.1],['signboard',[.0,-.13],1.1,.1],
      ['crateStack',[-.13,.09],1,.3]],
    wires:[[[-.18,-.12],[.0,-.13]],[[.0,-.13],[.18,-.12]]]
  });
  registerLink('skillforge','forge',{width:1.4,curve:.03});

  // ambient scatter so the smithy yard blends into the horizon
  registerDecorator(function(){
    if(typeof tree==='function'){ tree(-2.04,Math.PI/2+0.26,'pine',.85); tree(-1.86,Math.PI/2-0.30,'round',.8); }
    if(typeof surfaceDetail==='function'){ surfaceDetail('crateStack',-1.99,Math.PI/2+0.30,.85,.5); }
  });

  registerEnvPack({id:'skillforge',theme:'naruto',title:'Ember Skill Forge',capability:'Skills'});
})();
