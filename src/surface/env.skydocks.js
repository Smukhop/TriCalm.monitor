/* === env.skydocks.js — Sky Docks · Deployment Yard (One Piece + DBZ) ======
   TriFable · MiniVerse environment pack. Capability station: DEPLOYMENT — the
   yard where finished builds are moored, crated and shipped to the horizon.
   Moored dirigible, cargo crane, gangways. Brass/canvas tan, navy roofs,
   cream+crimson striped balloon. Anime cel + ink-outline styling, authored
   against the registry contract in kurama.registry.js. Global scope. ======= */
(function(){
  // ---------- buildings (ctx.bx/cy/cn are NOT pre-scaled — multiply by ctx.s) ----------

  // Airship dock: tall mooring mast + a tethered dirigible (balloon + gondola) that floats & bobs.
  registerBuilding('airshipDock', function(ctx){
    const {add,bx,cy,cn,win,outline,toon,PAL,TAU,THREE,s,col,roof,bobbers,g}=ctx;
    // mooring mast + cap
    const mast=add(cy(.2*s,.26*s,5.2*s,8,col));mast.position.y=2.6*s;g.add(outline(mast,1.025));
    const collar=add(cy(.34*s,.34*s,.2*s,8,0xb9c6d8));collar.position.y=4.9*s;
    const cap=add(cn(.3*s,.5*s,8,roof));cap.position.y=5.45*s;g.add(outline(cap,1.03));
    // floating assembly (balloon + gondola) — bobbed as one group, tethered to the mast head
    const air=new THREE.Group();g.add(air);
    const balloon=new THREE.Mesh(new THREE.SphereGeometry(1.5*s,18,12),toon(0xf0e6d6));
    balloon.scale.set(1,0.72,2.0);balloon.castShadow=true;air.add(balloon);air.add(outline(balloon,1.02));
    for(const z of[-.6,.6]){const band=new THREE.Mesh(new THREE.TorusGeometry(1.08*s,.12*s,8,20),toon(PAL.crimson));
      band.rotation.y=Math.PI/2;band.position.z=z*s;band.scale.set(1,1,1);air.add(band);}
    const tail=new THREE.Mesh(new THREE.ConeGeometry(.5*s,1.0*s,8),toon(0xe2d6c2));tail.position.z=-3.0*s;tail.rotation.x=-Math.PI/2;air.add(tail);
    for(const x of[-.55,.55]){const fin=new THREE.Mesh(new THREE.BoxGeometry(.08*s,.7*s,.7*s),toon(roof));fin.position.set(x*s,0,-2.7*s);air.add(fin);}
    const gondola=new THREE.Mesh(new THREE.BoxGeometry(1.0*s,.5*s,1.9*s),toon(col));gondola.position.y=-1.45*s;gondola.castShadow=true;air.add(gondola);air.add(outline(gondola,1.03));
    for(const z of[-.5,0,.5]){const m=new THREE.MeshBasicMaterial({color:0xffcf88,transparent:true,opacity:0});
      const w=new THREE.Mesh(new THREE.PlaneGeometry(.22*s,.3*s),m);w.position.set(.51*s,-1.45*s,z*s);w.rotation.y=Math.PI/2;air.add(w);if(typeof windowMats!=='undefined')windowMats.push(m);}
    air.position.set(1.6*s,6.4*s,0);bobbers&&bobbers.push({m:air,bob:6.4*s,amp:.16});
    // tether line from mast head to the gondola nose
    const tether=add(cy(.03*s,.03*s,2.0*s,5,0x4a4d50),false);tether.position.set(.8*s,5.2*s,0);tether.rotation.z=-.7;
  });

  // Cargo crane: lattice tower, swinging jib with counterweight, hanging hook block.
  registerBuilding('craneRig', function(ctx){
    const {add,bx,cy,cn,outline,toon,PAL,THREE,s,col,roof,bobbers,g}=ctx;
    const base=add(bx(1.5*s,.4*s,1.5*s,0x8f857a));base.position.y=.2*s;g.add(outline(base,1.02));
    const tower=add(cy(.22*s,.26*s,4.0*s,6,col));tower.position.y=2.2*s;g.add(outline(tower,1.025));
    // cross-bracing studs for a lattice read
    for(const y of[1.2,2.2,3.2]){const stud=add(cy(.28*s,.28*s,.1*s,6,0x6e5f50),false);stud.position.y=y*s;}
    // jib arm + counterweight
    const jib=add(bx(3.6*s,.18*s,.2*s,col));jib.position.set(.9*s,4.2*s,0);g.add(outline(jib,1.03));
    const cw=add(bx(.6*s,.6*s,.5*s,0x4a4d50));cw.position.set(-.95*s,4.2*s,0);g.add(outline(cw,1.04));
    const apex=add(cn(.3*s,.6*s,6,roof));apex.position.y=4.45*s;g.add(outline(apex,1.03));
    // hoist cable + hook block (bobs)
    const cable=add(cy(.025*s,.025*s,1.7*s,5,0x39424a),false);cable.position.set(2.4*s,3.5*s,0);
    const hook=add(bx(.3*s,.3*s,.3*s,0x6e5f50));hook.position.set(2.4*s,2.6*s,0);g.add(outline(hook,1.05));
    bobbers&&bobbers.push({m:hook,bob:2.6*s,amp:.12});
  });

  // Gangway platform: raised deck on legs, perimeter railing, a boarding ramp.
  registerBuilding('gangwayPlatform', function(ctx){
    const {add,bx,cy,win,outline,toon,PAL,THREE,s,col,roof,g}=ctx;
    const deck=add(bx(2.8*s,.24*s,1.8*s,col));deck.position.y=1.25*s;g.add(outline(deck,1.025));
    for(const x of[-1.2,1.2])for(const z of[-.7,.7]){const leg=add(cy(.12*s,.14*s,1.25*s,6,0x6f4a2c));leg.position.set(x*s,.62*s,z*s);}
    // perimeter railing (posts + top rail)
    for(let i=-3;i<=3;i++){const post=add(bx(.07*s,.5*s,.07*s,0x4a4d50),false);post.position.set(i*.42*s,1.62*s,.85*s);}
    const rail=add(bx(2.8*s,.07*s,.07*s,0x4a4d50),false);rail.position.set(0,1.84*s,.85*s);
    const rail2=add(bx(2.8*s,.07*s,.07*s,0x4a4d50),false);rail2.position.set(0,1.84*s,-.85*s);
    // a small dock-master booth + lit window
    const booth=add(bx(.9*s,1.0*s,.9*s,0xe2d6c2));booth.position.set(-.9*s,1.87*s,0);g.add(outline(booth,1.03));
    const broof=add(bx(1.05*s,.16*s,1.05*s,roof));broof.position.set(-.9*s,2.45*s,0);
    const fr=add(bx(.4*s,.5*s,.08*s,0x31434a),false);fr.position.set(-.9*s,1.95*s,.46*s);win(-.9*s,1.95*s,.49*s);
    // boarding ramp down to the ground
    const ramp=add(bx(.9*s,.12*s,1.9*s,0x7a5236));ramp.position.set(1.1*s,.7*s,1.3*s);ramp.rotation.x=.5;g.add(outline(ramp,1.02));
  });

  // ---------- props (ctx.bx/cy/cn ARE pre-scaled; scale positions by ctx.s) ----------

  // Mooring mast: tapered post with tie-off rings + a pennant.
  registerProp('mooringMast', function(ctx){
    const {add,bx,cy,cn,outline,toon,PAL,THREE,s,g}=ctx;
    const post=add(cy(.12,.16,2.6,8,0x9a8f6a));post.position.y=1.3*s;g.add(outline(post,1.03));
    for(const y of[.8,1.5,2.2]){const ring=add(new THREE.Mesh(new THREE.TorusGeometry(.2*s,.04*s,6,14),toon(0x4a4d50)));ring.position.y=y*s;ring.rotation.x=Math.PI/2;}
    const cap=add(cn(.18,.3,8,PAL.crimson));cap.position.y=2.75*s;
    const flag=add(bx(.4,.24,.03,PAL.gold),false);flag.position.set(.22*s,2.5*s,0);
  }, 0.3);

  // Cargo net: a netted stack of shipping crates.
  registerProp('cargoNet', function(ctx){
    const {add,bx,outline,toon,PAL,THREE,s,g}=ctx;
    const cubes=[[-.3,.3,-.3],[.3,.3,-.3],[-.3,.3,.3],[.3,.3,.3],[0,.85,0]];
    cubes.forEach((c,i)=>{const box=add(bx(.55,.55,.55,i%2?0x9a7a4a:0xb28a5a));box.position.set(c[0]*s,c[1]*s,c[2]*s);g.add(outline(box,1.03));});
    // crisscross net straps over the heap
    for(const a of[-.7,.7]){const strap=add(bx(.05,1.3,.9,0x3f4245),false);strap.position.set(a*s,.6*s,0);strap.rotation.z=a*.4;}
    const top=add(bx(1.1,.05,1.1,0x3f4245),false);top.position.y=1.16*s;
  }, 0.2);

  // Propeller fan: a 3-blade prop on a hub atop a short post — spins.
  registerProp('propellerFan', function(ctx){
    const {add,bx,cy,cn,outline,toon,PAL,THREE,s,bobbers,g}=ctx;
    const post=add(cy(.1,.12,1.4,7,0x6e5f50));post.position.y=.7*s;
    const housing=add(cy(.22,.22,.4,10,0x4a4d50));housing.position.set(0,1.5*s,0);housing.rotation.x=Math.PI/2;g.add(outline(housing,1.04));
    const prop=new THREE.Group();
    for(let i=0;i<3;i++){const blade=new THREE.Mesh(new THREE.BoxGeometry(.12*s,.9*s,.05*s),toon(0xb9c6d8));
      blade.position.y=.42*s;const piv=new THREE.Group();piv.add(blade);piv.rotation.z=i/3*Math.PI*2;prop.add(piv);}
    prop.position.set(0,1.5*s,.24*s);g.add(prop);bobbers&&bobbers.push({m:prop,spinZ:2.2});
  }, 0.3);

  // Gangway: a short railed boarding ramp.
  registerProp('gangway', function(ctx){
    const {add,bx,outline,toon,s,g}=ctx;
    const plank=add(bx(.8,.1,1.8,0x7a5236));plank.position.set(0,.4*s,0);plank.rotation.x=.45;g.add(outline(plank,1.03));
    for(const x of[-.42,.42]){const rail=add(bx(.05,.4,1.7,0x4a4d50),false);rail.position.set(x*s,.62*s,0);rail.rotation.x=.45;}
    for(let i=-1;i<=1;i++){const cleat=add(bx(.8,.04,.05,0x5a3a1e),false);cleat.position.set(0,.45*s+i*.18*s,i*.5*s);cleat.rotation.x=.45;}
  }, 0.2);

  // ---------- district (placed on a free upper band; linked into the lookout hub) ----------
  registerDistrict({
    id:'skydocks', name:'Sky Docks · Deployment Yard', t:-2.6, p:Math.PI/2-0.40, radius:.31,
    buildings:[
      {type:'airshipDock',     offset:[0,-.02],  col:0xc9b78a, roof:0x36506e, s:1.0, rot:0.4},
      {type:'craneRig',        offset:[-.17,.1],  col:0xb9c6d8, roof:0x36506e, s:.95, rot:-.3},
      {type:'gangwayPlatform', offset:[.17,.1],   col:0xc9b78a, roof:0x36506e, s:.95, rot:.2},
      {type:'cargoStation',    offset:[.04,-.16], col:0xc4b48a, roof:0x8a5a2a, s:.7}],
    roads:[{offset:[-.22,.05],to:[.24,.05],width:2.4,curve:.04,color:0x6f7b86,markings:true}],
    props:[
      ['mooringMast',[-.06,.06],1.05,0],['cargoNet',[.12,.07],1,.2],['propellerFan',[-.13,-.04],1,0],
      ['gangway',[.16,.13],1,-.2],['cargoNet',[-.15,.13],.9,.4],['crateStack',[.06,.15],1,.5],
      ['guardRail',[-.18,.12],1,.15],['guardRail',[.18,.11],1,-.1],['signboard',[.0,-.12],1.1,.1],['barrelStack',[-.1,-.08],1,0]],
    wires:[[[-.18,-.11],[.0,-.12]],[[.0,-.12],[.18,-.11]]]
  });
  registerLink('skydocks','lookout',{width:1.35,curve:-.03});
  registerLink('skydocks','harbor',{width:1.2,curve:.04});

  // ambient scatter so the yard blends into the sky-edge band
  registerDecorator(function(){
    if(typeof tree==='function'){ tree(-2.7,Math.PI/2-0.28,'pine',.8); tree(-2.5,Math.PI/2-0.30,'round',.85); }
    if(typeof surfaceDetail==='function'){ surfaceDetail('barrelStack',-2.66,Math.PI/2-0.30,.9,.3); }
  });

  registerEnvPack({id:'skydocks',theme:'onepiece',title:'Sky Docks',capability:'Deployment'});
})();
