/* === env.elbaf.js — Elbaf Giant Causeway · Capacity Hall (One Piece flavor) ==
   TriFable · MiniVerse environment pack. Capability station: CAPACITY —
   the giants' causeway measures how much weight a builder's realm can bear:
   oversized timber, iron-banded mead and stones carved with capacity runes.
   Anime cel + ink-outline styling, authored against the registry contract
   in kurama.registry.js. Classic script, shared global scope. ============== */
(function(){
  // shared Elbaf palette: warm timber bodies, mossy roofs, dark iron banding.
  const TIMBER=0x9c6b3e, TIMBER_DK=0x6e4a2a, MOSS=0x5f7a3c, MOSS_DK=0x47602c,
        IRON=0x3b3f44, IRON_HI=0x6b7178, STONE=0x8d877c, ROPE=0xc9a86a;

  // ---------- buildings (ctx.bx/cy/cn are NOT pre-scaled — multiply by ctx.s) ----------

  // Giant longhouse: everything 1.4x to read as giant-sized — huge log base,
  // oversized end beams, a great timber door and a mossy pitched roof.
  registerBuilding('giantHall', function(ctx){
    const {add,bx,cy,cn,win,outline,toon,PAL,THREE,s,col,roof,g}=ctx;
    const G=1.4;                                   // "giant" multiplier — reads oversized vs neighbours
    // raised log foundation
    const sill=add(bx(5.2*G*s,.5*s,2.9*G*s,TIMBER_DK));sill.position.y=.25*s;g.add(outline(sill,1.016));
    // great log body
    const base=add(bx(4.8*G*s,2.7*s,2.5*G*s,col));base.position.y=1.7*s;g.add(outline(base,1.02));
    // horizontal timber courses for log-stack feel
    for(let i=0;i<3;i++){const course=add(bx(4.84*G*s,.1*s,2.54*G*s,TIMBER_DK),false);course.position.y=(.9+i*.7)*s;}
    // oversized corner beams poking past the eaves
    for(const sx of[-1,1])for(const sz of[-1,1]){const post=add(cy(.28*s,.32*s,3.6*s,8,TIMBER_DK));post.position.set(sx*2.4*G*s,1.8*s,sz*1.25*G*s);g.add(outline(post,1.03));}
    // mossy pitched roof — two big slabs meeting at a ridge
    const roof1=add(bx(5.4*G*s,.3*s,1.95*G*s,roof));roof1.position.set(0,3.5*s,-.95*G*s);roof1.rotation.x=.4;g.add(outline(roof1,1.016));
    const roof2=add(bx(5.4*G*s,.3*s,1.95*G*s,roof));roof2.position.set(0,3.5*s,.95*G*s);roof2.rotation.x=-.4;g.add(outline(roof2,1.016));
    const ridge=add(cy(.18*s,.18*s,5.4*G*s,8,MOSS_DK));ridge.position.y=4.25*s;ridge.rotation.z=Math.PI/2;g.add(outline(ridge,1.04));
    // carved gable horn beams at each end of the ridge (One Piece longhouse flair)
    for(const sx of[-1,1]){const horn=add(cn(.26*s,1.0*s,6,TIMBER_DK));horn.position.set(sx*2.7*G*s,4.7*s,0);horn.rotation.z=sx*.6;g.add(outline(horn,1.04));}
    // the great door — huge plank slab with iron strap bands
    const door=add(bx(1.5*s,2.4*s,.16*s,TIMBER_DK),false);door.position.set(0,1.2*s,1.78*G*s);g.add(outline(door,1.03));
    for(const y of[.6,1.2,1.8]){const strap=add(bx(1.56*s,.14*s,.06*s,IRON),false);strap.position.set(0,y*s,1.84*G*s);}
    const ringL=add(new THREE.Mesh(new THREE.TorusGeometry(.16*s,.04*s,6,16),toon(IRON_HI)));ringL.position.set(.45*s,1.2*s,1.9*G*s);
    // flanking lit windows
    for(const x of[-2.1*G,2.1*G]){const fr=add(bx(.7*s,.9*s,.1*s,IRON),false);fr.position.set(x*s,1.9*s,1.78*G*s);win(x*s,1.9*s,1.82*G*s);}
  });

  // Beanstalk tower: a huge spiraling vine/timber trunk wound with leaf-rings,
  // topped by a leafy crown and a softly bobbing seed-pod glow.
  registerBuilding('beanstalkTower', function(ctx){
    const {add,bx,cy,cn,outline,toon,PAL,THREE,s,col,roof,bobbers,particles,g}=ctx;
    // tapering trunk
    const trunk=add(cy(.55*s,.95*s,5.6*s,10,col));trunk.position.y=2.8*s;g.add(outline(trunk,1.03));
    // spiraling vine wound up the trunk + leaf blades sprouting at each turn
    const turns=7;
    for(let i=0;i<turns;i++){
      const f=i/(turns-1), y=(.6+f*5.0)*s, r=(.9-f*.42)*s, a=f*Math.PI*3.2;
      const seg=add(cy(.13*s,.15*s,1.0*s,6,MOSS_DK));seg.position.set(Math.cos(a)*r,y,Math.sin(a)*r);seg.rotation.set(.5,a,.7);
      const leaf=add(cn(.34*s,.9*s,5,i%2?MOSS:MOSS_DK));leaf.position.set(Math.cos(a)*r*1.4,y,Math.sin(a)*r*1.4);leaf.rotation.set(0,-a,Math.PI/2);
    }
    // a little timber door at the root so it reads as enterable
    const door=add(bx(.7*s,1.2*s,.1*s,TIMBER_DK),false);door.position.set(0,.6*s,.95*s);g.add(outline(door,1.03));
    // leafy crown — stacked spheres of foliage
    for(const o of[[0,5.9,0,1.3],[-.5,5.5,.3,.9],[.55,5.6,-.2,.85],[0,6.3,0,.8]]){
      const blob=add(new THREE.Mesh(new THREE.SphereGeometry(o[3]*s,12,9),toon(o[0]+o[2]>0?MOSS:MOSS_DK)));
      blob.position.set(o[0]*s,o[1]*s,o[2]*s);g.add(outline(blob,1.03));
    }
    // glowing seed-pod at the very crown — the "capacity bloom"
    const pod=add(new THREE.Mesh(new THREE.SphereGeometry(.34*s,12,10),new THREE.MeshBasicMaterial({color:PAL.gold,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false})),false);
    pod.position.y=6.9*s;g.add(pod);bobbers&&bobbers.push({m:pod,bob:6.9*s,amp:.07});
    // drifting leaf motes shed from the crown
    for(let i=0;i<5;i++){const lf=new THREE.Mesh(new THREE.PlaneGeometry(.09,.09),new THREE.MeshBasicMaterial({color:MOSS,side:THREE.DoubleSide,transparent:true,opacity:.85}));
      lf.position.set((Math.random()-.5)*1.6*s,5+Math.random()*1.4,(Math.random()-.5)*1.6*s);
      lf.userData.fall=.12+Math.random()*.2;lf.userData.sway=1+Math.random()*2;lf.userData.sy=lf.position.y;particles&&particles.push(lf);g.add(lf);}
  });

  // Shield gate: a massive timber gate flanked by two great round shields,
  // crossed iron straps on the doors and a heavy crossbeam lintel.
  registerBuilding('shieldGate', function(ctx){
    const {add,bx,cy,cn,outline,toon,PAL,THREE,s,col,roof,g}=ctx;
    // two heavy gate posts
    for(const sx of[-1,1]){const post=add(bx(.6*s,3.6*s,.6*s,col));post.position.set(sx*1.7*s,1.8*s,0);g.add(outline(post,1.03));}
    // crossbeam lintel with end caps
    const lintel=add(bx(4.2*s,.7*s,.7*s,TIMBER_DK));lintel.position.y=3.55*s;g.add(outline(lintel,1.025));
    for(const sx of[-1,1]){const cap=add(cn(.42*s,.7*s,6,MOSS_DK));cap.position.set(sx*2.15*s,3.55*s,0);cap.rotation.z=sx*Math.PI/2;g.add(outline(cap,1.04));}
    // double gate doors with crossed iron straps
    for(const sx of[-1,1]){
      const leaf=add(bx(1.5*s,3.0*s,.16*s,TIMBER),false);leaf.position.set(sx*.78*s,1.6*s,0);g.add(outline(leaf,1.025));
      const d1=add(bx(1.9*s,.16*s,.06*s,IRON),false);d1.position.set(sx*.78*s,1.6*s,.1*s);d1.rotation.z=.6;
      const d2=add(bx(1.9*s,.16*s,.06*s,IRON),false);d2.position.set(sx*.78*s,1.6*s,.1*s);d2.rotation.z=-.6;
    }
    // two great round shields mounted on the posts — iron rim, soul-glow boss
    for(const sx of[-1,1]){
      const shield=add(new THREE.Mesh(new THREE.CylinderGeometry(.95*s,.95*s,.2*s,16),toon(MOSS)));
      shield.position.set(sx*1.7*s,2.3*s,.45*s);shield.rotation.x=Math.PI/2;g.add(outline(shield,1.04));
      const rim=add(new THREE.Mesh(new THREE.TorusGeometry(.92*s,.1*s,8,24),toon(IRON_HI)));rim.position.set(sx*1.7*s,2.3*s,.5*s);
      const boss=add(new THREE.Mesh(new THREE.SphereGeometry(.26*s,12,10),new THREE.MeshBasicMaterial({color:PAL.soul,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false})),false);
      boss.position.set(sx*1.7*s,2.3*s,.62*s);
    }
  });

  // ---------- props (ctx.bx/cy/cn ARE pre-scaled; scale positions by ctx.s) ----------

  // Oversized axe planted head-down in the ground — long haft, broad bit.
  registerProp('greatAxe', function(ctx){
    const {add,bx,cy,cn,outline,toon,PAL,THREE,s,g}=ctx;
    const haft=add(cy(.07,.09,2.6,8,TIMBER_DK));haft.position.set(0,1.0*s,0);haft.rotation.z=.12;g.add(outline(haft,1.05));
    const knob=add(new THREE.Mesh(new THREE.SphereGeometry(.12*s,8,7),toon(IRON_HI)));knob.position.set(.27*s,2.18*s,0);
    // axe head buried bit-down near the base
    const head=add(bx(.7,.5,.16,IRON_HI));head.position.set(-.04*s,.32*s,0);g.add(outline(head,1.04));
    const bit=add(cn(.36,.5,4,IRON));bit.position.set(-.34*s,.32*s,0);bit.rotation.z=Math.PI/2;
    const cheek=add(bx(.22,.34,.2,IRON));cheek.position.set(.18*s,.4*s,0);
  }, 0.4);

  // Giant mead cask laid on its side, bound with iron bands and a bung.
  registerProp('meadBarrel', function(ctx){
    const {add,bx,cy,outline,toon,PAL,THREE,s,g}=ctx;
    const body=add(cy(.62,.5,1.5,12,TIMBER));body.position.set(0,.62*s,0);body.rotation.z=Math.PI/2;g.add(outline(body,1.03));
    // iron hoops around the staves
    for(const z of[-.55,-.2,.2,.55]){const band=add(new THREE.Mesh(new THREE.TorusGeometry(.6*s,.05*s,6,16),toon(IRON)));band.position.set(z*s,.62*s,0);band.rotation.y=Math.PI/2;}
    // end caps
    for(const z of[-1,1]){const cap=add(cy(.5,.5,.08,12,TIMBER_DK));cap.position.set(z*.78*s,.62*s,0);cap.rotation.z=Math.PI/2;}
    // bung + a little frothy mead glint on top
    const bung=add(cy(.08,.08,.12,8,TIMBER_DK));bung.position.set(0,1.18*s,0);
    const froth=add(new THREE.Mesh(new THREE.SphereGeometry(.1*s,8,6),toon(PAL.hot,.4)),false);froth.position.set(0,1.26*s,0);
  }, 0.3);

  // Tall carved standing stone with a glowing soul-rune cut into its face.
  registerProp('runestone', function(ctx){
    const {add,bx,cy,cn,outline,toon,PAL,THREE,s,bobbers,g}=ctx;
    const stone=add(bx(.7,2.2,.34,STONE));stone.position.set(0,1.1*s,0);stone.rotation.z=.05;g.add(outline(stone,1.03));
    const cap=add(cn(.5,.45,5,STONE));cap.position.set(.02*s,2.3*s,0);g.add(outline(cap,1.05));
    // carved groove lines
    for(const y of[1.5,1.0]){const groove=add(bx(.5,.06,.05,0x6c665c),false);groove.position.set(0,y*s,.18*s);}
    // the glowing rune — additive soul mark that gently pulses via a bobber
    const rune=add(new THREE.Mesh(new THREE.TorusGeometry(.18*s,.05*s,6,3),new THREE.MeshBasicMaterial({color:PAL.soul,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false})),false);
    rune.position.set(0,1.3*s,.2*s);
    const core=add(new THREE.Mesh(new THREE.SphereGeometry(.08*s,8,6),new THREE.MeshBasicMaterial({color:PAL.soul,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false})),false);
    core.position.set(0,1.3*s,.2*s);bobbers&&bobbers.push({m:core,bob:1.3*s,amp:.03});
  }, 0.35);

  // ---------- district (placed on a free band; linked into the Giant Grove hub) ----------
  registerDistrict({
    id:'elbaf', name:'Elbaf Giant Causeway · Capacity Hall', t:4.25, p:Math.PI/2+0.28, radius:.34,
    buildings:[
      {type:'giantHall',      offset:[0,-.02],   col:TIMBER,   roof:MOSS,    s:1.0,  rot:Math.PI},
      {type:'beanstalkTower', offset:[-.17,.13],  col:0x8a5f37, roof:MOSS,    s:.95},
      {type:'shieldGate',     offset:[.2,.04],    col:TIMBER,   roof:MOSS,    s:1.0,  rot:-Math.PI/2},
      {type:'villageHouse',   offset:[.16,-.15],  col:0xc0a070, roof:MOSS_DK, s:.85,  rot:.3}],
    roads:[{offset:[-.22,.02],to:[.24,.05],width:3.0,curve:.04,markings:true}],
    props:[
      ['greatAxe',[.06,.07],1.1,.2],['meadBarrel',[-.1,-.08],1.0,.3],['meadBarrel',[-.04,-.1],.9,-.5],
      ['runestone',[-.18,-.04],1.0,0],['runestone',[.18,.1],1.0,.4],
      ['stoneLantern',[-.14,.05],1.0,0],['stoneLantern',[.14,.05],1.0,0],
      ['signboard',[0,-.14],1.1,.1],['guardRail',[-.2,.12],1.0,.15],['guardRail',[.2,.11],1.0,-.1],
      ['crateStack',[.1,.16],1.0,.3]],
    wires:[[[-.18,-.13],[.0,-.14]],[[.0,-.14],[.18,-.12]]]
  });
  registerLink('elbaf','grove',{width:1.5,curve:.03});

  // ambient scatter so the causeway blends into the giants' horizon
  registerDecorator(function(){
    if(typeof tree==='function'){ tree(4.18,Math.PI/2+0.40,'pine',1.1); tree(4.36,Math.PI/2+0.38,'round',1.0); }
    if(typeof surfaceDetail==='function'){ surfaceDetail('runestone',4.40,Math.PI/2+0.12,1.0,0.5); }
  });

  registerEnvPack({id:'elbaf',theme:'onepiece',title:'Elbaf Giant Causeway',capability:'Capacity'});
})();
