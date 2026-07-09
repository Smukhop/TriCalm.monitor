/* === env.neonarcade.js — Neon Market Arcade · Skill Exchange ==============
   TriFable · MiniVerse environment pack. Capability station: MARKETPLACE —
   a dense neon-soaked night bazaar where builders barter skills, props and
   trained models. Cel + ink-outline styling with emissive soul/teal/ember
   accents, authored against the registry contract in kurama.registry.js.
   Classic script, shared global scope. ================================= */
(function(){
  // small helper: an emissive additive-blend material for the neon glow look.
  function neon(THREE,color,opacity){
    return new THREE.MeshBasicMaterial({color:color,transparent:true,opacity:opacity==null?0.85:opacity,blending:THREE.AdditiveBlending,depthWrite:false});
  }

  // ---------- buildings (ctx.bx/cy/cn are NOT pre-scaled — multiply by ctx.s) ----------

  // shopStack: 3 stacked, offset shop boxes with awnings + lit windows — dense city block feel.
  registerBuilding('shopStack', function(ctx){
    const {add,bx,cy,win,outline,toon,PAL,THREE,s,col,roof,bobbers,g}=ctx;
    // three masses, each smaller and nudged off-axis to read as a leaning stacked block
    const tiers=[{w:2.4,h:1.5,d:2.0,y:0.75,x:0.0,z:0.0,c:col},
                 {w:2.0,h:1.3,d:1.7,y:2.05,x:0.22,z:-0.1,c:0xcfe3ff},
                 {w:1.6,h:1.2,d:1.4,y:3.15,x:-0.16,z:0.12,c:0x3dc9c2}];
    for(const t of tiers){
      const m=add(bx(t.w*s,t.h*s,t.d*s,t.c));m.position.set(t.x*s,t.y*s,t.z*s);g.add(outline(m,1.025));
      // a thin striped awning over each tier's frontage
      const aw=add(bx((t.w+0.2)*s,0.12*s,0.6*s,roof),false);aw.position.set(t.x*s,(t.y+t.h/2-0.05)*s,(t.z+t.d/2+0.18)*s);aw.rotation.x=-0.16;g.add(outline(aw,1.02));
      for(let i=-1;i<=1;i++){const str=add(bx(0.3*s,0.13*s,0.62*s,i%2?PAL.hot:PAL.crimson),false);str.position.set((t.x+i*0.34)*s,(t.y+t.h/2-0.05)*s,(t.z+t.d/2+0.19)*s);str.rotation.x=-0.16;}
    }
    // lit window rows on the front of each tier
    for(const t of tiers){
      for(const x of[-0.5,0.5]){const fr=add(bx(0.46*s,0.5*s,0.08*s,0x2a3742),false);fr.position.set((t.x+x)*s,(t.y+0.05)*s,(t.z+t.d/2+0.02)*s);win((t.x+x)*s,(t.y+0.05)*s,(t.z+t.d/2+0.04)*s);}
    }
    const door=add(bx(0.7*s,1.1*s,0.1*s,0x35241c),false);door.position.set(0,0.55*s,1.02*s);
    // a single floating neon orb crowning the stack (emissive accent)
    const orb=add(new THREE.Mesh(new THREE.SphereGeometry(0.22*s,12,10),neon(THREE,PAL.soul,0.9)),false);orb.position.set(-0.16*s,4.2*s,0.12*s);
    bobbers&&bobbers.push({m:orb,bob:4.2*s,amp:0.06});
  });

  // arcadeHall: long low hall with a big glowing neon marquee band + recessed entrance.
  registerBuilding('arcadeHall', function(ctx){
    const {add,bx,cy,win,outline,toon,PAL,THREE,s,col,roof,bobbers,g}=ctx;
    const base=add(bx(4.6*s,2.1*s,2.4*s,col));base.position.y=1.05*s;g.add(outline(base,1.022));
    const roofm=add(bx(4.9*s,0.24*s,2.7*s,roof));roofm.position.y=2.28*s;g.add(outline(roofm,1.018));
    // the marquee: a wide emissive band running the full frontage, with a teal lit core panel
    const marqueeFrame=add(bx(4.2*s,0.7*s,0.12*s,0x2a3742),false);marqueeFrame.position.set(0,1.78*s,1.22*s);g.add(outline(marqueeFrame,1.03));
    const marquee=add(new THREE.Mesh(new THREE.BoxGeometry(4.0*s,0.5*s,0.08*s),neon(THREE,PAL.teal,0.8)),false);marquee.position.set(0,1.78*s,1.28*s);
    // marquee bulb dots
    for(let i=-4;i<=4;i++){const bulb=add(new THREE.Mesh(new THREE.SphereGeometry(0.07*s,7,6),neon(THREE,i%2?PAL.ember:PAL.hot,0.95)),false);bulb.position.set(i*0.44*s,2.16*s,1.28*s);}
    // recessed entrance arch
    const arch=add(bx(1.3*s,1.5*s,0.2*s,0x1f2a33),false);arch.position.set(0,0.75*s,1.22*s);
    const entry=add(new THREE.Mesh(new THREE.BoxGeometry(1.0*s,1.2*s,0.06*s),neon(THREE,PAL.soul,0.55)),false);entry.position.set(0,0.7*s,1.3*s);
    // side window strips
    for(const x of[-1.6,-0.85,0.85,1.6]){const fr=add(bx(0.5*s,0.7*s,0.08*s,0x2a3742),false);fr.position.set(x,0.95*s,1.22*s);win(x,0.95*s,1.24*s);}
    // a thin animated neon ring hovering over the marquee for extra flicker
    const ring=add(new THREE.Mesh(new THREE.TorusGeometry(0.5*s,0.05*s,8,24),neon(THREE,PAL.ember,0.85)),false);ring.position.set(0,2.7*s,1.0*s);ring.rotation.x=Math.PI/2;
    bobbers&&bobbers.push({m:ring,spinY:0.6});
  });

  // ramenAlley: cluster of 3 narrow stalls with split noren + hanging lamps + steam.
  registerBuilding('ramenAlley', function(ctx){
    const {add,bx,cy,outline,toon,PAL,THREE,s,col,roof,bobbers,particles,g}=ctx;
    const stallX=[-1.5,0,1.5];
    for(let n=0;n<stallX.length;n++){
      const sx=stallX[n];
      const bodyC=[0xe9c690,0xcfe3ff,0x3dc9c2][n];
      const counter=add(bx(1.2*s,0.85*s,0.9*s,bodyC));counter.position.set(sx*s,0.42*s,0);g.add(outline(counter,1.03));
      const top=add(bx(1.34*s,0.12*s,1.05*s,0x6a4a2c),false);top.position.set(sx*s,0.9*s,0);
      for(const x of[-0.5,0.5]){const post=add(cy(0.06*s,0.06*s,1.9*s,7,0x4a3320),false);post.position.set((sx+x)*s,1.4*s,0.35*s);}
      const awn=add(bx(1.4*s,0.12*s,1.2*s,roof));awn.position.set(sx*s,2.3*s,0.05*s);awn.rotation.x=-0.12;g.add(outline(awn,1.02));
      // split noren curtains
      for(let i=-1;i<=1;i++){const c=add(bx(0.34*s,0.6*s,0.04*s,i%2?0xf0e6d6:PAL.crimson),false);c.position.set((sx+i*0.36)*s,1.85*s,0.62*s);}
      // hanging neon lamp (emissive, bobbing)
      const lampC=[PAL.ember,PAL.soul,PAL.teal][n];
      const lamp=add(new THREE.Mesh(new THREE.SphereGeometry(0.16*s,10,8),neon(THREE,lampC,0.9)),false);lamp.position.set(sx*s,1.75*s,0.18*s);lamp.scale.y=1.2;
      bobbers&&bobbers.push({m:lamp,bob:1.75*s,amp:0.05});
      // rising steam motes
      for(let i=0;i<3;i++){const st=new THREE.Mesh(new THREE.SphereGeometry(0.05*s,6,5),new THREE.MeshBasicMaterial({color:0xf2efe6,transparent:true,opacity:0.5,depthWrite:false}));
        st.position.set((sx+(Math.random()-0.5)*0.5)*s,1.0*s+Math.random()*0.4,0.1*s);st.userData.fall=-(0.1+Math.random()*0.16);st.userData.sway=1+Math.random()*2;st.userData.sy=st.position.y;particles&&particles.push(st);g.add(st);}
    }
  });

  // ---------- props (ctx.bx/cy/cn ARE pre-scaled; scale positions by ctx.s) ----------

  // neonSign: a tall vertical emissive sign panel on a slim pole.
  registerProp('neonSign', function(ctx){
    const {add,bx,cy,outline,toon,PAL,THREE,s,bobbers,g}=ctx;
    const pole=add(cy(0.05,0.06,2.0,7,0x565d5d));pole.position.y=1.0*s;
    const board=add(bx(0.5,1.3,0.08,0x1f2a33));board.position.set(0,1.85*s,0);g.add(outline(board,1.03));
    // stacked emissive glyph bars down the sign face
    for(let i=0;i<4;i++){const glyph=add(new THREE.Mesh(new THREE.BoxGeometry(0.34*s,0.2*s,0.05*s),new THREE.MeshBasicMaterial({color:[PAL.soul,PAL.teal,PAL.ember,PAL.hot][i],transparent:true,opacity:0.9,blending:THREE.AdditiveBlending,depthWrite:false})),false);glyph.position.set(0,(1.4+i*0.3)*s,0.05*s);}
  }, 0.2);

  // awningRow: a striped awning over a shelf of goods crates.
  registerProp('awningRow', function(ctx){
    const {add,bx,cy,outline,toon,PAL,THREE,s,g}=ctx;
    for(const x of[-0.7,0.7]){const post=add(cy(0.05,0.05,1.2,7,0x4a3320));post.position.set(x*s,0.6*s,-0.3*s);}
    const shelf=add(bx(1.6,0.12,0.7,0x7a5236));shelf.position.set(0,0.7*s,-0.2*s);g.add(outline(shelf,1.03));
    for(let i=-1;i<=1;i++){const good=add(bx(0.34,0.34,0.34,i%2?PAL.ember:PAL.gold));good.position.set(i*0.45*s,0.95*s,-0.2*s);}
    // striped awning canopy
    const awn=add(bx(1.7,0.1,0.8,PAL.crimson));awn.position.set(0,1.25*s,0.05*s);awn.rotation.x=-0.22;g.add(outline(awn,1.02));
    for(let i=-2;i<=2;i++){if(i%2===0)continue;const str=add(bx(0.3,0.11,0.82,0xf0e6d6),false);str.position.set(i*0.32*s,1.25*s,0.05*s);str.rotation.x=-0.22;}
  }, 0.2);

  // acUnit: a boxy wall AC condenser with a vent grille + slow fan.
  registerProp('acUnit', function(ctx){
    const {add,bx,cy,outline,toon,PAL,THREE,s,bobbers,g}=ctx;
    const box=add(bx(0.7,0.6,0.5,0xc7c9c3));box.position.y=0.5*s;g.add(outline(box,1.03));
    const grille=add(bx(0.56,0.46,0.04,0x6a7075),false);grille.position.set(0,0.5*s,0.27*s);
    const fan=add(new THREE.Mesh(new THREE.TorusGeometry(0.16*s,0.03*s,6,16),toon(0x9aa3aa)),false);fan.position.set(0,0.5*s,0.3*s);
    bobbers&&bobbers.push({m:fan,spinY:1.2});
    // small drip pipe
    const pipe=add(cy(0.03,0.03,0.5,6,0x737a78),false);pipe.position.set(0.3*s,0.25*s,0.1*s);
  }, 0.2);

  // vendingCluster: 2-3 glowing vending machines side by side.
  registerProp('vendingCluster', function(ctx){
    const {add,bx,cy,outline,toon,PAL,THREE,s,g}=ctx;
    const tints=[PAL.teal,PAL.soul,PAL.ember];
    for(let i=0;i<3;i++){
      const x=(i-1)*0.62;
      const cab=add(bx(0.56,1.4,0.5,0x2a3742));cab.position.set(x*s,0.7*s,0);g.add(outline(cab,1.03));
      // glowing display window
      const disp=add(new THREE.Mesh(new THREE.BoxGeometry(0.42*s,0.9*s,0.05*s),new THREE.MeshBasicMaterial({color:tints[i],transparent:true,opacity:0.7,blending:THREE.AdditiveBlending,depthWrite:false})),false);disp.position.set(x*s,0.85*s,0.26*s);
      // product rows hint
      for(let r=0;r<3;r++){const row=add(bx(0.36,0.06,0.04,0xf0e6d6),false);row.position.set(x*s,(0.6+r*0.25)*s,0.28*s);}
    }
  }, 0.4);

  // ---------- district (neon urban band; linked into the market hub) ----------
  registerDistrict({
    id:'neonarcade', name:'Neon Market Arcade · Skill Exchange', t:0.95, p:Math.PI/2+0.42, radius:0.33,
    buildings:[
      {type:'arcadeHall',   offset:[0,-.02],   col:0x2f5d6b, roof:0xc24d42, s:1.0,  rot:Math.PI},
      {type:'shopStack',    offset:[-.17,.11],  col:0xeae0cf, roof:0xffb068, s:0.95, rot:-.25},
      {type:'ramenAlley',   offset:[.18,.1],    col:0x3dc9c2, roof:0xc64d42, s:0.9,  rot:-.35},
      {type:'villageHouse', offset:[.2,-.12],   col:0xb9c6e1, roof:0x626b91, s:0.85}],
    roads:[{offset:[-.22,.05],to:[.24,.06],width:2.6,curve:.05,markings:true}],
    props:[
      ['neonSign',[-.04,.05],1.05,.2],['neonSign',[.1,-.06],1,-.3],
      ['awningRow',[.14,.16],1,-.2],['acUnit',[-.13,.04],1,.3],
      ['vendingCluster',[.04,.14],1,.1],
      ['stoneLantern',[-.16,.02],1,0],['signboard',[.0,-.13],1.1,.1],
      ['crateStack',[.16,-.04],1,-.15],['guardRail',[-.18,.13],1,.15],['guardRail',[.18,.12],1,-.1]],
    wires:[[[-.18,-.12],[.0,-.13]],[[.0,-.13],[.18,-.12]]]
  });
  registerLink('neonarcade','market',{width:1.4,curve:.03});

  // ambient scatter so the arcade bleeds into the night skyline
  registerDecorator(function(){
    if(typeof tree==='function'){ tree(0.78,Math.PI/2+0.54,'round',.8); tree(1.12,Math.PI/2+0.52,'pine',.85); }
  });

  registerEnvPack({id:'neonarcade',theme:'urban',title:'Neon Market Arcade',capability:'Marketplace'});
})();
