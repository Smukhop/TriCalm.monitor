/* === env.boardwalk.js — Coastal Boardwalk · Distribution Pier (One Piece flavor) =
   TriFable · MiniVerse environment pack. Capability station: DISTRIBUTION —
   the pier moves crates, catches and supplies out across the horizon.
   Anime cel + ink-outline styling, authored against the registry contract
   in kurama.registry.js. Classic script, shared global scope. ============= */
(function(){
  // ---------- buildings (ctx.bx/cy/cn are NOT pre-scaled — multiply by ctx.s) ----------

  // Stilt house: plank deck raised on 4 stilts, ladder down to the water, pitched roof.
  registerBuilding('stiltHouse', function(ctx){
    const {add,bx,cy,cn,win,outline,toon,PAL,THREE,s,col,roof,g}=ctx;
    // four stilts plunge into the surf
    for(const x of[-1.0,1.0])for(const z of[-.8,.8]){const leg=add(cy(.12*s,.14*s,1.6*s,7,0x6f4a2c));leg.position.set(x*s,.8*s,z*s);}
    // cross-bracing between the stilts (reads as a dock structure)
    for(const z of[-.8,.8]){const brace=add(bx(2.2*s,.1*s,.1*s,0x5a3a1e),false);brace.position.set(0,.5*s,z*s);}
    // plank deck the cabin sits on
    const deck=add(bx(2.6*s,.2*s,2.2*s,0xc4a35a));deck.position.y=1.55*s;g.add(outline(deck,1.02));
    // cabin body (blue/teal weatherboard)
    const body=add(bx(1.9*s,1.5*s,1.7*s,col));body.position.y=2.4*s;g.add(outline(body,1.028));
    // pitched roof (navy), two slopes
    const roof1=add(bx(2.25*s,.2*s,1.3*s,roof));roof1.position.set(0,3.18*s,-.45*s);roof1.rotation.x=.34;g.add(outline(roof1,1.02));
    const roof2=add(bx(2.25*s,.2*s,1.3*s,roof));roof2.position.set(0,3.18*s,.45*s);roof2.rotation.x=-.34;g.add(outline(roof2,1.02));
    // door + warm windows
    const door=add(bx(.5*s,.9*s,.07*s,0x4f4037),false);door.position.set(.45*s,2.0*s,.86*s);
    for(const x of[-.55,.4]){const fr=add(bx(.5*s,.5*s,.08*s,0x31434a),false);fr.position.set(x,2.65*s,.86*s);win(x,2.65*s,.9*s);}
    // ladder from deck edge down toward the water
    for(const sgn of[-1,1]){const rail=add(cy(.05*s,.05*s,1.5*s,6,0x6f4a2c),false);rail.position.set((1.05+sgn*.18)*s,.85*s,1.0*s);}
    for(let i=0;i<4;i++){const rung=add(bx(.42*s,.05*s,.05*s,0x5a3a1e),false);rung.position.set(1.05*s,.4*s+i*.34*s,1.0*s);}
    // little roof-ridge lamp glow for the night silhouette
    const lamp=add(new THREE.Mesh(new THREE.SphereGeometry(.14*s,10,8),toon(PAL.hot,.6)));lamp.position.set(0,3.55*s,0);
  });

  // Lighthouse: tapered round tower, banded paint, glowing lamp room ringed by a railing.
  registerBuilding('lighthouse', function(ctx){
    const {add,bx,cy,cn,win,outline,toon,PAL,TAU,THREE,s,col,roof,bobbers,g}=ctx;
    // stone footing
    const foot=add(cy(1.25*s,1.5*s,.5*s,14,0x9a958c));foot.position.y=.25*s;g.add(outline(foot,1.02));
    // tapered tower shaft
    const shaft=add(cy(.7*s,1.15*s,3.4*s,14,col));shaft.position.y=2.2*s;g.add(outline(shaft,1.02));
    // painted bands (classic red rings)
    for(const y of[1.2,2.6]){const band=add(cy(.92*s,1.0*s,.42*s,14,roof));band.position.y=y*s;}
    // gallery deck under the lamp room
    const gallery=add(cy(1.0*s,1.0*s,.16*s,14,0x857f76));gallery.position.y=4.0*s;g.add(outline(gallery,1.02));
    // railing posts around the gallery
    for(let i=0;i<8;i++){const a=i/8*TAU;const post=add(cy(.04*s,.04*s,.42*s,6,0x4a4d50),false);post.position.set(Math.cos(a)*.92*s,4.25*s,Math.sin(a)*.92*s);}
    const hand=add(new THREE.Mesh(new THREE.TorusGeometry(.92*s,.04*s,6,24),toon(0x4a4d50)),false);hand.position.y=4.45*s;hand.rotation.x=Math.PI/2;
    // lamp room cylinder (glass)
    const room=add(cy(.62*s,.62*s,.9*s,12,0xcfe3ff));room.position.y=4.7*s;
    // the beacon — additive glow orb that bobs
    const beacon=new THREE.Mesh(new THREE.SphereGeometry(.42*s,12,10),new THREE.MeshBasicMaterial({color:PAL.hot,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false}));
    beacon.position.y=4.7*s;g.add(beacon);bobbers&&bobbers.push({m:beacon,bob:4.7*s,amp:.05});
    // ring of light sweeping the lamp room
    const halo=new THREE.Mesh(new THREE.TorusGeometry(.78*s,.06*s,8,24),new THREE.MeshBasicMaterial({color:PAL.gold,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false}));
    halo.position.y=4.7*s;halo.rotation.x=Math.PI/2;g.add(halo);bobbers&&bobbers.push({m:halo,spinY:1.2});
    // conical cap roof + finial
    const cap=add(cn(.78*s,.8*s,12,roof));cap.position.y=5.45*s;g.add(outline(cap,1.025));
    const finial=add(cy(.06*s,.06*s,.4*s,6,PAL.gold));finial.position.y=6.05*s;
    // a single warm tower window
    const fr=add(bx(.34*s,.5*s,.08*s,0x31434a),false);fr.position.set(0,2.2*s,1.0*s);win(0,2.2*s,1.04*s);
  });

  // Fish market: open-front stall, striped canopy, hanging fish + crates of the day's catch.
  registerBuilding('fishMarket', function(ctx){
    const {add,bx,cy,cn,outline,toon,PAL,THREE,s,col,roof,bobbers,g}=ctx;
    // sandy counter base
    const counter=add(bx(3.0*s,.95*s,1.3*s,col));counter.position.set(0,.48*s,0);g.add(outline(counter,1.025));
    const top=add(bx(3.2*s,.14*s,1.5*s,0x7a5236));top.position.y=1.0*s;
    // back wall (closed) so the front reads as open
    const wall=add(bx(3.0*s,1.9*s,.18*s,0xb9c6d8));wall.position.set(0,1.45*s,-.62*s);g.add(outline(wall,1.025));
    // four canopy posts
    for(const x of[-1.4,1.4])for(const z of[-.55,.55]){const post=add(cy(.08*s,.08*s,2.2*s,7,0x5a3a1e));post.position.set(x*s,1.6*s,z*s);}
    // striped canopy (red/sand) — a couple of slabs for the awning look
    const canopy=add(bx(3.5*s,.16*s,1.8*s,roof));canopy.position.set(0,2.75*s,.1*s);canopy.rotation.x=-.14;g.add(outline(canopy,1.02));
    for(let i=-2;i<=2;i+=2){const stripe=add(bx(.5*s,.18*s,1.84*s,0xf2eee2),false);stripe.position.set(i*.66*s,2.74*s,.1*s);stripe.rotation.x=-.14;}
    // crossbar under the canopy to hang the catch from
    const bar=add(cy(.05*s,.05*s,3.0*s,6,0x6f4a2c),false);bar.position.set(0,2.45*s,.7*s);bar.rotation.z=Math.PI/2;
    // hanging fish (capsules) that sway gently
    for(let i=-2;i<=2;i++){const fish=add(new THREE.Mesh(new THREE.CapsuleGeometry(.1*s,.34*s,4,8),toon(i%2?PAL.frost:PAL.teal)));
      fish.position.set(i*.55*s,2.05*s,.7*s);fish.rotation.z=Math.PI/2;bobbers&&bobbers.push({m:fish,bob:2.05*s,amp:.04});}
    // crates of fish on the front counter ledge
    for(let i=-1;i<=1;i++){const cr=add(bx(.5*s,.42*s,.5*s,0x9a7a4a));cr.position.set(i*.85*s,1.2*s,.55*s);g.add(outline(cr,1.04));}
    // small chalkboard price sign
    const sign=add(bx(.7*s,.46*s,.07*s,0x2f3a3a),false);sign.position.set(-1.1*s,1.55*s,.7*s);
  });

  // ---------- props (ctx.bx/cy/cn ARE pre-scaled; scale positions by ctx.s) ----------

  // Fishing net draped between two stakes, with a couple of cork floats.
  registerProp('fishingNet', function(ctx){
    const {add,cy,bx,toon,PAL,THREE,s,g}=ctx;
    for(const x of[-.8,.8]){const stake=add(cy(.06,.07,1.4,6,0x6f4a2c));stake.position.set(x*s,.7*s,0);}
    // the net — a thin plane sagging between stakes (DoubleSide so it reads from both faces)
    const net=add(new THREE.Mesh(new THREE.PlaneGeometry(1.5,.9),new THREE.MeshToonMaterial({color:0xcdd8d0,gradientMap:toonRamp,transparent:true,opacity:.55,side:THREE.DoubleSide})),false);
    net.position.set(0,.85*s,0);
    // top sag bar + a few cork floats along it
    const bar=add(cy(.03,.03,1.6,6,0x5a3a1e),false);bar.position.set(0,1.28*s,0);bar.rotation.z=Math.PI/2;
    for(let i=-1;i<=1;i++){const cork=add(new THREE.Mesh(new THREE.SphereGeometry(.08*s,8,6),toon(PAL.ember)));cork.position.set(i*.5*s,1.28*s,0);}
  }, 0.2);

  // Striped floating buoy on a small base ring.
  registerProp('buoy', function(ctx){
    const {add,cy,bx,outline,toon,PAL,THREE,s,bobbers,g}=ctx;
    const ring=add(new THREE.Mesh(new THREE.TorusGeometry(.28*s,.07*s,8,16),toon(0x857f76)));ring.position.y=.08*s;ring.rotation.x=Math.PI/2;
    // buoy body — red base, white stripe, red cap
    const lower=add(cy(.22,.24,.5,12,PAL.crimson));lower.position.y=.45*s;g.add(outline(lower,1.03));
    const stripe=add(cy(.23,.23,.18,12,0xf2eee2));stripe.position.y=.62*s;
    const upper=add(cy(.16,.22,.42,12,PAL.crimson));upper.position.y=.92*s;
    const cap=add(new THREE.Mesh(new THREE.SphereGeometry(.16*s,10,8),toon(PAL.gold)));cap.position.y=1.18*s;
    // tiny topmark glow that bobs like it floats
    const top=add(new THREE.Mesh(new THREE.SphereGeometry(.07*s,8,6),toon(PAL.hot,.6)));top.position.y=1.34*s;
    bobbers&&bobbers.push({m:top,bob:1.34*s,amp:.04});
  }, 0.25);

  // Pier lamp on a curved gooseneck post, warm glow at night.
  registerProp('pierLamp', function(ctx){
    const {add,cy,bx,outline,toon,PAL,THREE,s,bobbers,g}=ctx;
    const base=add(cy(.14,.18,.24,10,0x565d5d));base.position.y=.12*s;
    const post=add(cy(.06,.07,1.9,8,0x3f4848));post.position.y=1.05*s;
    // curved gooseneck arm (a short angled segment) reaching out over the water
    const arm=add(cy(.05,.05,.7,6,0x3f4848),false);arm.position.set(.22*s,1.95*s,0);arm.rotation.z=Math.PI/2.6;
    // lantern housing + glow
    const housing=add(bx(.22,.3,.22,0x2f3a3a));housing.position.set(.45*s,1.85*s,0);g.add(outline(housing,1.04));
    const glow=add(new THREE.Mesh(new THREE.SphereGeometry(.1*s,8,6),toon(PAL.hot,.7)));glow.position.set(.45*s,1.82*s,0);
    const halo=new THREE.Mesh(new THREE.SphereGeometry(.18*s,8,6),new THREE.MeshBasicMaterial({color:PAL.hot,transparent:true,opacity:.4,blending:THREE.AdditiveBlending,depthWrite:false}));
    halo.position.set(.45*s,1.82*s,0);g.add(halo);
  }, 0.2);

  // Tackle crate: open crate with rods leaning out and a few floats inside.
  registerProp('tackleCrate', function(ctx){
    const {add,bx,cy,cn,outline,toon,PAL,THREE,s,g}=ctx;
    const crate=add(bx(.7,.55,.7,0x9a7a4a));crate.position.y=.28*s;g.add(outline(crate,1.03));
    // plank slats on the front face
    for(let i=0;i<3;i++){const slat=add(bx(.72,.06,.04,0x7a5236),false);slat.position.set(0,(.14+i*.18)*s,.36*s);}
    // fishing rods leaning out of the crate
    for(let i=-1;i<=1;i++){const rod=add(cy(.02,.03,1.4,5,0x5a3a1e),false);rod.position.set(i*.18*s,.95*s,-.1*s);rod.rotation.x=-.4;rod.rotation.z=i*.12;}
    // a couple of cork floats sitting in the crate
    for(const x of[-.18,.18]){const fl=add(new THREE.Mesh(new THREE.SphereGeometry(.09*s,8,6),toon(x<0?PAL.crimson:PAL.teal)));fl.position.set(x,.6*s,.18*s);}
  }, 0.3);

  // ---------- district (placed on the seaward band; linked into the harbor hub) ----------
  registerDistrict({
    id:'boardwalk', name:'Coastal Boardwalk · Distribution Pier', t:-2.25, p:Math.PI/2+0.48, radius:.33,
    buildings:[
      {type:'lighthouse',   offset:[0,-.04],   col:0xeef2f6, roof:0xc24d42, s:1.05},
      {type:'fishMarket',   offset:[-.17,.12],  col:0xe9c690, roof:0xc64d42, s:.95, rot:-.25},
      {type:'stiltHouse',   offset:[.18,.1],    col:0x7fb4c4, roof:0x303a5e, s:.95, rot:.2},
      {type:'villageHouse', offset:[.2,-.12],   col:0x9fc6d6, roof:0x3a4570, s:.9}],
    roads:[{offset:[-.2,.05],to:[.22,.06],width:2.4,curve:.04,markings:true}],
    props:[
      ['pierLamp',[0,.07],1.05,0],['pierLamp',[-.16,.14],1,0],
      ['buoy',[.14,.16],1,0],['buoy',[-.06,-.1],1,0],
      ['fishingNet',[.15,-.06],1,.4],['tackleCrate',[-.1,.0],1,-.2],
      ['guardRail',[-.18,.13],1,.15],['guardRail',[.18,.12],1,-.1],
      ['stoneLantern',[.1,-.14],1,0],['signboard',[.0,-.13],1.1,.1],['crateStack',[.16,.02],1,0]],
    wires:[[[-.18,-.12],[.0,-.13]],[[.0,-.13],[.18,-.12]]]
  });
  registerLink('boardwalk','harbor',{width:1.5,curve:.03});

  // ambient scatter so the pier blends into the coastline horizon
  registerDecorator(function(){
    if(typeof tree==='function'){ tree(-2.4,Math.PI/2+0.62,'palm',.85); tree(-2.1,Math.PI/2+0.64,'palm',.95); }
    if(typeof rock==='function'){ rock(-2.35,Math.PI/2+0.30,.7); }
  });

  registerEnvPack({id:'boardwalk',theme:'onepiece',title:'Coastal Boardwalk',capability:'Distribution'});
})();
