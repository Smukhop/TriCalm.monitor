/* === env.observatory.js — Quasar Observatory · Perception Array (Dragon Ball flavor) ==
   TriFable · MiniVerse environment pack. Capability station: PERCEPTION —
   the Array scans the heavens so the planet can SEE what is coming.
   Anime cel + ink-outline styling, authored against the registry contract
   in kurama.registry.js. Classic script, shared global scope. ============= */
(function(){
  // ---------- buildings (ctx.bx/cy/cn are NOT pre-scaled — multiply by ctx.s) ----------

  // White observatory dome: drum base, hemispherical dome with a dark slit aperture,
  // and a tilted telescope barrel poking out toward the sky. Frost glow ring + rotating dome read.
  registerBuilding('domeObservatory', function(ctx){
    const {add,bx,cy,cn,outline,toon,PAL,TAU,THREE,s,col,roof,bobbers,g}=ctx;
    // cylindrical drum base
    const drum=add(cy(1.7*s,1.85*s,2.1*s,14,col));drum.position.y=1.05*s;g.add(outline(drum,1.025));
    const band=add(cy(1.78*s,1.78*s,.28*s,14,0xbfd0dd));band.position.y=1.95*s;
    // hemispherical white dome
    const dome=add(new THREE.Mesh(new THREE.SphereGeometry(1.7*s,16,12,0,TAU,0,Math.PI/2),toon(0xeef4fb)));dome.position.y=2.1*s;g.add(outline(dome,1.022));
    // dark observation slit running over the dome crown
    const slit=add(bx(.34*s,.06*s,1.7*s,0x26323d),false);slit.position.set(0,3.05*s,.2*s);slit.rotation.x=-.35;
    const slitLip=add(bx(.5*s,.12*s,.5*s,0x2f3c48),false);slitLip.position.set(0,2.95*s,.95*s);
    // tilted telescope barrel emerging from the slit
    const barrel=add(cy(.26*s,.3*s,1.9*s,12,0xc4ccd4));barrel.position.set(0,3.0*s,.55*s);barrel.rotation.x=-.55;g.add(outline(barrel,1.03));
    const lens=add(new THREE.Mesh(new THREE.CircleGeometry(.27*s,16),new THREE.MeshBasicMaterial({color:PAL.frost})),false);lens.position.set(0,3.78*s,1.05*s);lens.rotation.x=-.55+Math.PI/2;
    const barrelCap=add(cy(.16*s,.16*s,.4*s,10,0x9aa6b1));barrelCap.position.set(0,2.55*s,.0*s);barrelCap.rotation.x=-.55;
    // door + window strip on the drum
    const door=add(bx(.66*s,1.2*s,.1*s,0x36434f),false);door.position.set(0,.62*s,1.72*s);
    for(const x of[-.85,.85]){const fr=add(bx(.5*s,.6*s,.08*s,0x2f3c48),false);fr.position.set(x,1.2*s,1.66*s);const pane=add(bx(.36*s,.46*s,.09*s,0x86c3d4),false);pane.position.set(x,1.2*s,1.71*s);}
    // floating frost glow ring crowning the dome aperture
    const aura=new THREE.Mesh(new THREE.TorusGeometry(1.0*s,.06*s,8,32),new THREE.MeshBasicMaterial({color:PAL.frost,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false}));
    aura.rotation.x=-Math.PI/2;aura.position.y=2.5*s;g.add(aura);bobbers&&bobbers.push({m:aura,spinY:.4});
  });

  // Antenna mast: tall lattice tower of stacked cross-braced segments, topped with
  // tilted parabolic dishes and a blinking frost beacon orb.
  registerBuilding('antennaMast', function(ctx){
    const {add,bx,cy,cn,outline,toon,PAL,TAU,THREE,s,col,roof,bobbers,g}=ctx;
    // concrete footing
    const foot=add(cy(.7*s,.85*s,.45*s,12,0xb9c2cb));foot.position.y=.22*s;g.add(outline(foot,1.02));
    // four lattice legs leaning into a spire
    const H=4.4;
    for(let i=0;i<4;i++){const a=i/4*TAU+Math.PI/4;
      const leg=add(cy(.06*s,.07*s,H*s,6,roof));
      leg.position.set(Math.cos(a)*.34*s,H/2*s+.4*s,Math.sin(a)*.34*s);
      leg.rotation.z=Math.cos(a)*.07;leg.rotation.x=-Math.sin(a)*.07;}
    // cross-brace rings climbing the mast (lattice read)
    for(let r=0;r<6;r++){const ring=add(new THREE.Mesh(new THREE.TorusGeometry((.32-r*.03)*s,.025*s,5,4),toon(0x9aa6b1)));
      ring.position.y=(.7+r*.72)*s;ring.rotation.x=Math.PI/2;ring.rotation.z=Math.PI/4;}
    // dishes mounted on the mast, angled at the sky
    for(const d of[{y:2.0,a:0,t:.6},{y:3.1,a:Math.PI,t:.7}]){
      const arm=add(cy(.04*s,.04*s,.6*s,6,0x8a96a1),false);arm.position.set(Math.cos(d.a)*.45*s,d.y*s,Math.sin(d.a)*.45*s);arm.rotation.z=Math.PI/2;arm.rotation.y=-d.a;
      const dish=add(new THREE.Mesh(new THREE.SphereGeometry(.5*s,14,9,0,TAU,0,Math.PI/3),toon(0xe6edf3)));
      dish.position.set(Math.cos(d.a)*.85*s,d.y*s,Math.sin(d.a)*.85*s);dish.rotation.x=-d.t;dish.rotation.y=-d.a;g.add(outline(dish,1.03));
      const feed=add(cy(.02*s,.02*s,.34*s,5,0x6f7b86),false);feed.position.set(Math.cos(d.a)*1.0*s,d.y*s+.18*s,Math.sin(d.a)*1.0*s);}
    // frost beacon orb at the summit
    const beacon=new THREE.Mesh(new THREE.SphereGeometry(.22*s,12,9),new THREE.MeshBasicMaterial({color:PAL.frost,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false}));
    beacon.position.y=5.0*s;g.add(beacon);bobbers&&bobbers.push({m:beacon,bob:5.0*s,amp:.06});
  });

  // Sensor shack: small flat-roofed control hut faced with glowing monitor screens,
  // a slanted radar plate on the roof and a warm doorway.
  registerBuilding('sensorShack', function(ctx){
    const {add,bx,cy,cn,win,outline,toon,PAL,TAU,THREE,s,col,roof,bobbers,g}=ctx;
    const base=add(bx(2.4*s,1.5*s,1.8*s,col));base.position.y=.78*s;g.add(outline(base,1.026));
    // flat steel roof with a lip
    const cap=add(bx(2.6*s,.18*s,2.0*s,roof));cap.position.y=1.6*s;g.add(outline(cap,1.02));
    const lip=add(bx(2.66*s,.08*s,2.06*s,0x86929d),false);lip.position.y=1.48*s;
    // bank of glowing monitor screens on the front face
    for(const x of[-.7,0,.7]){const scr=add(bx(.5*s,.42*s,.06*s,0x223038),false);scr.position.set(x,1.0*s,.92*s);
      const glow=add(new THREE.Mesh(new THREE.PlaneGeometry(.4*s,.32*s),new THREE.MeshBasicMaterial({color:PAL.frost,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false})),false);glow.position.set(x,1.0*s,.97*s);}
    // warm doorway on the side
    const door=add(bx(.6*s,1.05*s,.1*s,0x37434e),false);door.position.set(1.22*s,.55*s,0);door.rotation.y=Math.PI/2;
    win(1.24*s,1.05*s,.45*s);
    // slanted radar plate spinning on a short post on the roof
    const post=add(cy(.06*s,.06*s,.5*s,7,0x8a96a1));post.position.y=1.9*s;
    const radar=add(new THREE.Mesh(new THREE.CircleGeometry(.55*s,5),new THREE.MeshBasicMaterial({color:0xd4dde4,side:THREE.DoubleSide})),false);radar.position.y=2.18*s;radar.rotation.x=-.7;g.add(outline(radar,1.04));
    bobbers&&bobbers.push({m:radar,spinY:.9});
  });

  // ---------- props (ctx.bx/cy/cn ARE pre-scaled; scale positions by ctx.s) ----------

  // Solar array: tilted grid of frost-blue cells on a post, with a thin support strut.
  registerProp('solarArray', function(ctx){
    const {add,bx,cy,outline,toon,PAL,THREE,s,g}=ctx;
    const post=add(cy(.07,.08,1.2,8,0x8a96a1));post.position.y=.6*s;
    const panel=add(bx(1.3,.07,.85,0x2f3c48));panel.position.set(0,1.25*s,0);panel.rotation.x=-.55;g.add(outline(panel,1.04));
    // glowing cell grid laid over the panel face
    for(let ix=-1;ix<=1;ix++)for(let iz=-1;iz<=1;iz++){
      const cell=add(new THREE.Mesh(new THREE.PlaneGeometry(.36,.22),new THREE.MeshBasicMaterial({color:PAL.frost,transparent:true,opacity:.45,blending:THREE.AdditiveBlending,depthWrite:false})),false);
      cell.position.set(ix*.4*s,1.25*s+iz*.12*s,iz*.18*s);cell.rotation.x=-.55-Math.PI/2;}
    const strut=add(cy(.03,.03,.6,5,0x6f7b86));strut.position.set(0,.95*s,.28*s);strut.rotation.x=.5;
  }, 0.3);

  // Data pylon: glowing crystal pylon that bobs — frosted octahedron on a slim plinth.
  registerProp('dataPylon', function(ctx){
    const {add,bx,cy,outline,toon,PAL,THREE,s,bobbers,particles,g}=ctx;
    const base=add(cy(.3,.36,.34,8,0xb9c2cb));base.position.y=.17*s;g.add(outline(base,1.03));
    const stem=add(cy(.12,.14,1.0,7,0x9aa6b1));stem.position.y=.8*s;
    const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.34*s,0),new THREE.MeshBasicMaterial({color:PAL.frost,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false}));
    crystal.position.y=1.55*s;g.add(crystal);bobbers&&bobbers.push({m:crystal,bob:1.55*s,amp:.07});
    // faint inner core so the glow has depth
    const core=add(new THREE.Mesh(new THREE.OctahedronGeometry(.16*s,0),toon(0xeef4fb)),false);core.position.y=1.55*s;
    bobbers&&bobbers.push({m:core,bob:1.55*s,amp:.07});
  }, 0.25);

  // Cooling fin: finned radiator block — a metal box wearing a comb of vertical fins.
  registerProp('coolingFin', function(ctx){
    const {add,bx,cy,outline,toon,PAL,THREE,s,g}=ctx;
    const block=add(bx(.7,.7,.5,0xaeb9c3));block.position.y=.35*s;g.add(outline(block,1.03));
    // comb of vertical cooling fins along the top
    for(let i=-3;i<=3;i++){const fin=add(bx(.04,.5,.5,0x8a96a1),false);fin.position.set(i*.1*s,.85*s,0);}
    // intake grille hint on the face
    const grille=add(bx(.5,.4,.04,0x55636e),false);grille.position.set(0,.35*s,.27*s);
    const foot=add(bx(.78,.1,.58,0x6f7b86));foot.position.y=.05*s;
  }, 0.2);

  // ---------- district (perched on the lookout band; linked into the lookout hub) ----------
  registerDistrict({
    id:'observatory', name:'Quasar Observatory · Perception Array', t:0.4, p:Math.PI/2-0.50, radius:.3,
    buildings:[
      {type:'domeObservatory', offset:[0,-.02],   col:0xe8eff6, roof:0x3a8f96, s:1.05, rot:0},
      {type:'antennaMast',     offset:[-.16,.1],   col:0xdfe7ee, roof:0x5a6e7a, s:1.0,  rot:.2},
      {type:'sensorShack',     offset:[.17,.11],   col:0xeef3f8, roof:0x4a8f93, s:.95,  rot:-.3},
      {type:'villageHouse',    offset:[.2,-.12],   col:0xcdd8e4, roof:0x5a6b7a, s:.85}],
    roads:[{offset:[-.2,.04],to:[.22,.05],width:2.4,curve:.05,markings:true}],
    props:[
      ['solarArray',[-.06,.06],1.05,.3],['solarArray',[.06,.07],1,-.4],
      ['dataPylon',[0,.0],1.05,0],['dataPylon',[-.12,-.04],.9,.2],
      ['coolingFin',[.12,-.06],1,.15],
      ['guardRail',[-.18,.12],1,.15],['guardRail',[.18,.11],1,-.1],
      ['stoneLantern',[-.15,.02],1,0],['stoneLantern',[.15,.02],1,0],
      ['signboard',[0,-.13],1.1,.1],['crateStack',[.1,.14],1,-.2]],
    wires:[[[-.16,-.1],[0,-.12]],[[0,-.12],[.17,-.1]]]
  });
  registerLink('observatory','lookout',{width:1.4,curve:.03});

  // ambient scatter so the array blends into the horizon
  registerDecorator(function(){
    if(typeof tree==='function'){ tree(0.32,Math.PI/2-0.62,'pine',.85); tree(0.5,Math.PI/2-0.64,'pine',.95); }
    if(typeof rock==='function'){ rock(0.28,Math.PI/2-0.40,.9); rock(0.54,Math.PI/2-0.38,.8); }
  });

  registerEnvPack({id:'observatory',theme:'dragonball',title:'Quasar Observatory',capability:'Perception'});
})();
