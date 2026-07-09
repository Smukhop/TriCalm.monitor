/* === env.monastery.js — Cliff Monastery · Alignment Sanctum (Naruto flavor) =
   TriFable · MiniVerse environment pack. Capability station: ALIGNMENT —
   the Sanctum tunes a builder's values, rules and guardrails into harmony.
   Anime cel + ink-outline styling, authored against the registry contract
   in kurama.registry.js. Classic script, shared global scope. ============= */
(function(){
  // ---------- buildings (ctx.bx/cy/cn are NOT pre-scaled — multiply by ctx.s) ----------

  // Stepped 2-tier cliff temple: stone podium, two tiers with upturned crimson
  // eaves, a central shrine door and a floating soul-gem finial.
  registerBuilding('cliffTemple', function(ctx){
    const {add,bx,cy,cn,win,outline,toon,PAL,TAU,THREE,s,col,roof,bobbers,g}=ctx;
    // stone podium the whole temple sits on
    const podium=add(bx(4.4*s,.5*s,3.4*s,0xb4aa98));podium.position.y=.25*s;g.add(outline(podium,1.016));
    // lower (broad) tier
    const lower=add(bx(3.6*s,1.7*s,2.7*s,col));lower.position.y=1.35*s;g.add(outline(lower,1.024));
    // upturned eaves over the lower tier — two box slabs tilted at the ends
    const eaveL1=add(bx(4.3*s,.22*s,1.55*s,roof));eaveL1.position.set(0,2.28*s,-.55*s);eaveL1.rotation.x=.2;g.add(outline(eaveL1,1.018));
    const eaveL2=add(bx(4.3*s,.22*s,1.55*s,roof));eaveL2.position.set(0,2.28*s,.55*s);eaveL2.rotation.x=-.2;g.add(outline(eaveL2,1.018));
    // upper (narrow) tier set back
    const upper=add(bx(2.5*s,1.4*s,1.9*s,0xf2eee2));upper.position.set(0,3.15*s,-.05*s);g.add(outline(upper,1.024));
    // upper crimson eaves
    const eaveU1=add(bx(3.0*s,.2*s,1.2*s,roof));eaveU1.position.set(0,3.88*s,-.45*s);eaveU1.rotation.x=.24;g.add(outline(eaveU1,1.018));
    const eaveU2=add(bx(3.0*s,.2*s,1.2*s,roof));eaveU2.position.set(0,3.88*s,.4*s);eaveU2.rotation.x=-.24;g.add(outline(eaveU2,1.018));
    // gold ridge cap + finial pole
    const ridge=add(cy(.13*s,.13*s,1.2*s,8,PAL.gold));ridge.position.set(0,4.2*s,-.05*s);ridge.rotation.z=Math.PI/2;
    const pole=add(cy(.07*s,.07*s,.7*s,8,PAL.gold));pole.position.set(0,4.5*s,-.05*s);
    // central shrine door, recessed dark with a gold lintel
    const lintel=add(bx(1.2*s,.18*s,.12*s,PAL.gold),false);lintel.position.set(0,1.55*s,1.36*s);
    const door=add(bx(.9*s,1.4*s,.1*s,0x3a2a23),false);door.position.set(0,.95*s,1.36*s);
    // window rows that warm at night, flanking the door
    for(const x of[-1.25,1.25]){const fr=add(bx(.6*s,.7*s,.08*s,0x31434a),false);fr.position.set(x,1.15*s,1.34*s);win(x,1.15*s,1.36*s);}
    // floating soul-gem above the finial — the alignment beacon
    const gem=add(new THREE.Mesh(new THREE.OctahedronGeometry(.4*s,0),new THREE.MeshBasicMaterial({color:PAL.soul})),false);
    gem.position.y=5.4*s;g.add(gem);bobbers&&bobbers.push({m:gem,bob:5.4*s,amp:.06});
    // soul-tinted aura ring spinning at the base, additive glow
    const aura=new THREE.Mesh(new THREE.TorusGeometry(1.9*s,.09*s,8,40),new THREE.MeshBasicMaterial({color:PAL.soul,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false}));
    aura.rotation.x=-Math.PI/2;aura.position.y=.55*s;g.add(aura);bobbers&&bobbers.push({m:aura,spinY:.4});
  });

  // Open 4-post bell tower: stone legs, a railed deck, a small hip roof, and a
  // hanging bronze bell that gently sways under it.
  registerBuilding('bellTower', function(ctx){
    const {add,bx,cy,cn,outline,toon,PAL,TAU,THREE,s,col,roof,bobbers,g}=ctx;
    // square stone base / steps
    const base=add(bx(2.4*s,.45*s,2.4*s,0xb4aa98));base.position.y=.22*s;g.add(outline(base,1.018));
    // four corner posts
    for(const sx of[-1,1])for(const sz of[-1,1]){
      const post=add(cy(.13*s,.15*s,3.0*s,8,col));post.position.set(sx*.85*s,1.95*s,sz*.85*s);g.add(outline(post,1.03));}
    // railed deck partway up
    const deck=add(bx(2.1*s,.12*s,2.1*s,0xc7bda9));deck.position.y=1.2*s;
    for(let i=-2;i<=2;i++){for(const sz of[-1,1]){const rail=add(bx(.05*s,.4*s,.05*s,0x6f4a2c),false);rail.position.set(i*.42*s,1.45*s,sz*1.0*s);}}
    for(const sz of[-1,1]){const hand=add(bx(2.05*s,.06*s,.06*s,0x6f4a2c),false);hand.position.set(0,1.65*s,sz*1.0*s);}
    // cross-beam the bell hangs from
    const beam=add(bx(2.0*s,.18*s,.18*s,0x6f4a2c));beam.position.y=3.3*s;
    // small hip roof on top
    const eaveT=add(bx(2.8*s,.2*s,2.8*s,roof));eaveT.position.y=3.55*s;g.add(outline(eaveT,1.02));
    const cap=add(cn(1.7*s,1.0*s,4,roof));cap.position.y=4.25*s;cap.rotation.y=Math.PI/4;g.add(outline(cap,1.025));
    const finial=add(cy(.08*s,.08*s,.4*s,8,PAL.gold));finial.position.y=4.9*s;
    // hanging bronze bell — cylinder body + dome shoulder + clapper hook
    const bellG=new THREE.Group();
    const body=new THREE.Mesh(new THREE.CylinderGeometry(.42*s,.5*s,.85*s,12),toon(0xb98b3a));body.position.y=-.42*s;body.castShadow=true;bellG.add(body);g.add(outline(body,1.03));
    const dome=new THREE.Mesh(new THREE.SphereGeometry(.42*s,12,8,0,TAU,0,Math.PI/2),toon(0xc89a48));dome.position.y=0;bellG.add(dome);
    const hook=new THREE.Mesh(new THREE.TorusGeometry(.1*s,.03*s,6,12),toon(PAL.gold));hook.position.y=.18*s;bellG.add(hook);
    bellG.position.set(0,3.1*s,0);g.add(bellG);bobbers&&bobbers.push({m:bellG,bob:3.1*s,amp:.03});
  });

  // ---------- props (ctx.bx/cy/cn ARE pre-scaled; scale positions by ctx.s) ----------

  // Line of small colored prayer flags strung between two poles (overhead, no collider).
  registerProp('prayerFlags', function(ctx){
    const {add,bx,cy,toon,PAL,THREE,s,bobbers,g}=ctx;
    const cols=[PAL.crimson,PAL.gold,PAL.frost,PAL.soul,PAL.teal];
    for(const x of[-1.4,1.4]){const pole=add(cy(.05,.06,2.2,7,0x6f4a2c));pole.position.set(x*s,1.1*s,0);}
    for(let i=-4;i<=4;i++){const sag=Math.cos(i/4*Math.PI/2)*.45;
      const flag=add(bx(.26,.34,.02,cols[(i+4)%cols.length]),false);
      flag.position.set(i*.32*s,(1.95-sag)*s,0);flag.rotation.z=.12;
      bobbers&&bobbers.push({m:flag,bob:(1.95-sag)*s,amp:.025});}
  }, 0.0);

  // Standing brazier: a tripod-footed stone bowl with an additive fire glow + embers.
  registerProp('brazier', function(ctx){
    const {add,bx,cy,cn,outline,toon,PAL,THREE,s,bobbers,particles,g}=ctx;
    for(let i=0;i<3;i++){const a=i/3*Math.PI*2;const leg=add(cy(.05,.06,.9,6,0x565d5d));leg.position.set(Math.cos(a)*.18*s,.45*s,Math.sin(a)*.18*s);}
    const bowl=add(cy(.42,.26,.3,12,0x8f867a));bowl.position.y=.95*s;g.add(outline(bowl,1.03));
    const rim=add(new THREE.Mesh(new THREE.TorusGeometry(.4*s,.05*s,8,18),toon(PAL.gold)));rim.position.y=1.1*s;rim.rotation.x=Math.PI/2;
    // additive fire core
    const fire=add(new THREE.Mesh(new THREE.ConeGeometry(.28*s,.55*s,10),new THREE.MeshBasicMaterial({color:PAL.ember,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false})),false);
    fire.position.y=1.35*s;bobbers&&bobbers.push({m:fire,bob:1.35*s,amp:.05});
    const glow=add(new THREE.Mesh(new THREE.SphereGeometry(.3*s,10,8),new THREE.MeshBasicMaterial({color:PAL.gold,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false})),false);
    glow.position.y=1.25*s;
    // rising embers
    for(let i=0;i<4;i++){const em=new THREE.Mesh(new THREE.SphereGeometry(.04*s,5,4),new THREE.MeshBasicMaterial({color:PAL.ember,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false}));
      em.position.set((Math.random()-.5)*.3*s,1.4*s+Math.random()*.4,(Math.random()-.5)*.3*s);
      em.userData.fall=-(0.12+Math.random()*0.18);em.userData.sway=1+Math.random()*2;em.userData.sy=em.position.y;particles&&particles.push(em);g.add(em);}
  }, 0.25);

  // Flat-topped sitting boulder for meditation — a low blocking rock.
  registerProp('meditationRock', function(ctx){
    const {add,cy,outline,toon,PAL,THREE,s,g}=ctx;
    const rock=add(new THREE.Mesh(new THREE.SphereGeometry(.5*s,10,8),toon(0x8f8a80)));rock.position.y=.32*s;rock.scale.set(1,.55,1.05);g.add(outline(rock,1.04));
    const topp=add(cy(.36,.4,.16,12,0x9a958c));topp.position.y=.52*s;
    const moss=add(new THREE.Mesh(new THREE.CircleGeometry(.3*s,16),new THREE.MeshBasicMaterial({color:0x5f8a4a})),false);moss.position.y=.605*s;moss.rotation.x=-Math.PI/2;
  }, 0.3);

  // Large disc gong on a wooden frame with a striker post.
  registerProp('gong', function(ctx){
    const {add,bx,cy,outline,toon,PAL,THREE,s,bobbers,g}=ctx;
    for(const sx of[-1,1]){const leg=add(cy(.07,.09,2.0,7,0x6f4a2c));leg.position.set(sx*.7*s,1.0*s,0);g.add(outline(leg,1.04));}
    const top=add(bx(1.7,.14,.14,0x6f4a2c));top.position.y=2.0*s;
    for(const sx of[-1,1]){const foot=add(bx(.5,.1,.5,0x5a3a1e),false);foot.position.set(sx*.7*s,.05*s,0);}
    // the gong disc — torus rim + circle face, soul-tinted accent
    const disc=add(new THREE.Mesh(new THREE.CylinderGeometry(.6*s,.6*s,.06*s,20),toon(0xb98b3a)));disc.position.set(0,1.15*s,0);disc.rotation.x=Math.PI/2;g.add(outline(disc,1.03));
    const boss=add(new THREE.Mesh(new THREE.SphereGeometry(.16*s,10,8),toon(PAL.gold)),false);boss.position.set(0,1.15*s,.05*s);
    const ring=add(new THREE.Mesh(new THREE.TorusGeometry(.6*s,.04*s,8,24),toon(PAL.soul)));ring.position.set(0,1.15*s,0);
    bobbers&&bobbers.push({m:disc,bob:1.15*s,amp:.02});
    // striker mallet hanging at the side
    const mallet=add(cy(.04,.04,.6,7,0x5a3a1e));mallet.position.set(.95*s,1.25*s,.1*s);mallet.rotation.z=.4;
    const head=add(new THREE.Mesh(new THREE.SphereGeometry(.1*s,8,6),toon(0x4f4037)));head.position.set(1.2*s,.95*s,.1*s);
  }, 0.3);

  // ---------- district (cliff band, linked into the lookout hub) ----------
  registerDistrict({
    id:'monastery', name:'Cliff Monastery · Alignment Sanctum', t:2.9, p:Math.PI/2-0.42, radius:.3,
    buildings:[
      {type:'cliffTemple',  offset:[0,-.02],   col:0xe8e1d2, roof:0xc24d42, s:1.05, rot:Math.PI},
      {type:'bellTower',    offset:[.18,.12],   col:0xd8cfbc, roof:0xb84438, s:.95, rot:-.2},
      {type:'cliffTemple',  offset:[-.18,.13],  col:0xf2eee2, roof:0xa84236, s:.7,  rot:Math.PI*0.92},
      {type:'villageHouse', offset:[.2,-.12],   col:0xcdc4b2, roof:0x8e5648, s:.85, rot:.3}],
    roads:[{offset:[-.2,.02],to:[.22,.03],width:2.4,curve:.05,markings:true}],
    props:[
      ['prayerFlags',[0,.06],1.05,.15],['prayerFlags',[-.14,-.08],.9,-.4],
      ['brazier',[-.12,.04],1,0],['brazier',[.12,.04],1,0],
      ['meditationRock',[.06,.12],1.1,.2],['meditationRock',[-.08,.1],.95,-.3],
      ['gong',[.0,-.12],1,.1],
      ['stoneLantern',[-.16,.02],1,0],['stoneLantern',[.16,.02],1,0],
      ['guardRail',[-.18,.13],1,.15],['guardRail',[.18,.12],1,-.1],
      ['signboard',[.12,-.1],1.1,.1],['crateStack',[-.13,-.04],.9,0]],
    wires:[[[-.18,-.1],[.0,-.13]],[[.0,-.13],[.18,-.11]]]
  });
  registerLink('monastery','lookout',{width:1.3,curve:.03});

  // ambient scatter so the sanctum settles into the cliffside
  registerDecorator(function(){
    if(typeof tree==='function'){ tree(2.78,Math.PI/2-0.30,'pine',.85); tree(3.02,Math.PI/2-0.28,'pine',.95); tree(2.9,Math.PI/2-0.58,'round',.8); }
    if(typeof rock==='function'){ rock(2.96,Math.PI/2-0.55,.9); }
  });

  registerEnvPack({id:'monastery',theme:'naruto',title:'Cliff Monastery',capability:'Alignment'});
})();
