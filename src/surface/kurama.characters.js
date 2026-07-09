/* === Kurama · Quasar Horizon — flattened module (classic script, shared global scope). THREE + postprocessing provided as globals by the boot shim in index.html. === */
/* ============================================================
   CHARACTER MODELS (original anime-flavoured archetypes)
============================================================ */
function charModel(cfg,scale=1,accentOverride=null){
  scale*= (cfg.h||1);                       // per-agent stature (Choppa tiny → Jinbay towering)
  const g=new THREE.Group();
  const add=(m,sh=true)=>{m.castShadow=sh;m.receiveShadow=false;g.add(m);return m;};
  const _acc=accentOverride!==null?accentOverride:cfg.accent;
  const skin=cfg.skin||0xf1d2b5, deepSkin=_colorBlend(skin,0x8a5a44,0.3);
  const sweaterCol=_colorBlend(cfg.color,0xf7f1e6,0.18);
  const coatCol=_colorBlend(cfg.color,0x121622,0.12);
  const pantsCol=_colorBlend(cfg.hair||0x3a3a52,0x2c3141,0.58);
  const hatCol=_colorBlend(_acc,0x2a2433,0.25);
  const bootCol=0x171922;
  const shoulderY=1.02*scale, hipY=0.56*scale;

  // silhouette / torso blocks
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(0.23*scale,0.46*scale,10,22),toon(sweaterCol,0.02));
  torso.position.y=0.84*scale;add(torso);g.add(outline(torso,1.05));
  const chest=new THREE.Mesh(new THREE.SphereGeometry(0.25*scale,18,16),toon(sweaterCol,0.02));
  chest.scale.set(1.04,0.84,0.84);chest.position.set(0,0.97*scale,0.02*scale);add(chest);
  const pelvis=new THREE.Mesh(new THREE.SphereGeometry(0.18*scale,16,14),toon(coatCol,0.03));
  pelvis.scale.set(1.05,0.72,0.92);pelvis.position.set(0,0.54*scale,0.0);add(pelvis);
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(0.072*scale,0.08*scale,0.11*scale,10),toon(skin));
  neck.position.set(0,1.22*scale,0.01*scale);add(neck);

  // clothing layers: sweater / jacket / scarf / belt
  const hem=new THREE.Mesh(new THREE.CylinderGeometry(0.25*scale,0.29*scale,0.18*scale,18),toon(coatCol,0.02));
  hem.position.set(0,0.71*scale,-0.005*scale);add(hem);g.add(outline(hem,1.03));
  hem.userData.cloak=1;
  const collar=new THREE.Mesh(new THREE.TorusGeometry(0.16*scale,0.032*scale,8,22),toon(_acc,0.06));
  collar.rotation.x=Math.PI/2;collar.position.set(0,1.08*scale,0.03*scale);add(collar);
  const scarf=new THREE.Mesh(new THREE.BoxGeometry(0.08*scale,0.34*scale,0.07*scale),toon(_acc,0.07));
  scarf.position.set(0.12*scale,0.88*scale,0.18*scale);scarf.rotation.z=-0.16;add(scarf);scarf.userData.scarf=1;
  const belt=new THREE.Mesh(new THREE.CylinderGeometry(0.235*scale,0.24*scale,0.05*scale,18),toon(0x5e4636,0.02));
  belt.position.set(0,0.63*scale,0.01*scale);add(belt);
  const buckle=new THREE.Mesh(new THREE.BoxGeometry(0.08*scale,0.06*scale,0.03*scale),new THREE.MeshBasicMaterial({color:0xd8cda9}));
  buckle.position.set(0,0.63*scale,0.24*scale);g.add(buckle);

  // courier gear
  const pack=new THREE.Mesh(new THREE.BoxGeometry(0.29*scale,0.36*scale,0.13*scale),toon(0x745842,0.05));
  pack.position.set(0.0,0.84*scale,-0.26*scale);add(pack);g.add(outline(pack,1.028));
  const packTop=new THREE.Mesh(new THREE.CylinderGeometry(0.15*scale,0.15*scale,0.08*scale,12),toon(0x87644a,0.05));
  packTop.position.set(0,1.0*scale,-0.25*scale);add(packTop);
  const strap1=new THREE.Mesh(new THREE.BoxGeometry(0.05*scale,0.62*scale,0.03*scale),toon(0xf0e0d2,0.04));
  strap1.position.set(-0.135*scale,0.8*scale,0.17*scale);strap1.rotation.z=-0.48;add(strap1);
  const strap2=strap1.clone();strap2.position.x=0.135*scale;strap2.rotation.z=0.48;add(strap2);
  const satchel=new THREE.Mesh(new THREE.BoxGeometry(0.24*scale,0.2*scale,0.16*scale),toon(0xaf8456,0.06));
  satchel.position.set(0.33*scale,0.53*scale,0.0);satchel.rotation.z=-0.12;add(satchel);g.add(outline(satchel,1.045));

  // head
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.25*scale,26,22),toon(skin));
  head.position.set(0,1.42*scale,0.02*scale);add(head);g.add(outline(head,1.04));
  const jaw=new THREE.Mesh(new THREE.SphereGeometry(0.18*scale,18,14),toon(skin));
  jaw.scale.set(1.0,0.75,0.95);jaw.position.set(0,1.29*scale,0.08*scale);add(jaw);
  const nose=new THREE.Mesh(new THREE.ConeGeometry(0.02*scale,0.06*scale,6),new THREE.MeshBasicMaterial({color:deepSkin}));
  nose.position.set(0,1.40*scale,0.255*scale);nose.rotation.x=Math.PI/2;g.add(nose);
  const mouth=new THREE.Mesh(new THREE.BoxGeometry(0.09*scale,0.012*scale,0.01*scale),new THREE.MeshBasicMaterial({color:0x402329}));
  mouth.position.set(0,1.31*scale,0.242*scale);g.add(mouth);

  // eyes with anime depth
  for(const sgn of [-1,1]){
    const eyeWhite=new THREE.Mesh(new THREE.SphereGeometry(0.055*scale,12,10),new THREE.MeshBasicMaterial({color:0xffffff}));
    eyeWhite.scale.set(1.0,0.72,0.42);eyeWhite.position.set(sgn*0.095*scale,1.43*scale,0.218*scale);g.add(eyeWhite);
    const iris=new THREE.Mesh(new THREE.SphereGeometry(0.026*scale,12,10),new THREE.MeshBasicMaterial({color:_colorBlend(cfg.hair||0x2a2834,_acc,0.38)}));
    iris.position.set(sgn*0.094*scale,1.425*scale,0.248*scale);g.add(iris);
    const pupil=new THREE.Mesh(new THREE.SphereGeometry(0.012*scale,8,8),new THREE.MeshBasicMaterial({color:0x141116}));
    pupil.position.set(sgn*0.094*scale,1.423*scale,0.262*scale);g.add(pupil);
    const shine=new THREE.Mesh(new THREE.SphereGeometry(0.008*scale,8,8),new THREE.MeshBasicMaterial({color:0xffffff}));
    shine.position.set(sgn*0.104*scale,1.442*scale,0.266*scale);g.add(shine);
    const brow=new THREE.Mesh(new THREE.BoxGeometry(0.10*scale,0.018*scale,0.01*scale),new THREE.MeshBasicMaterial({color:0x26181f}));
    brow.position.set(sgn*0.10*scale,1.50*scale,0.232*scale);brow.rotation.z=sgn*0.14;g.add(brow);
    const cheek=new THREE.Mesh(new THREE.SphereGeometry(0.018*scale,8,8),new THREE.MeshBasicMaterial({color:0xe7a4a0,transparent:true,opacity:0.45}));
    cheek.scale.set(1.8,1.0,0.5);cheek.position.set(sgn*0.14*scale,1.32*scale,0.22*scale);g.add(cheek);
  }

  // hair / hats / species details
  const hairCol=cfg.hair||0x2e2433;
  const hairCap=()=>{const h=new THREE.Mesh(new THREE.SphereGeometry(0.27*scale,22,18,0,TAU,0,Math.PI*0.62),toon(hairCol,0.02));h.position.set(0,1.5*scale,-0.015*scale);add(h);g.add(outline(h,1.03));return h;};
  if(cfg.kind==='fox'){
    hairCap();
    for(const sgn of[-1,1]){const ear=new THREE.Mesh(new THREE.ConeGeometry(0.08*scale,0.2*scale,6),toon(cfg.color,0.08));ear.position.set(sgn*0.16*scale,1.72*scale,0);ear.rotation.z=-sgn*0.2;add(ear);g.add(outline(ear,1.04));}
    const hood=new THREE.Mesh(new THREE.SphereGeometry(0.31*scale,18,14,0,TAU,0,Math.PI*0.55),toon(coatCol,0.03));
    hood.position.set(0,1.52*scale,-0.07*scale);hood.scale.set(1.05,0.95,1.0);add(hood);g.add(outline(hood,1.02));
    for(let i=0;i<3;i++){const fan=i-1,curve=new THREE.CatmullRomCurve3([
      new THREE.Vector3(fan*.035*scale,.42*scale,-.24*scale),
      new THREE.Vector3(fan*.14*scale,.44*scale,-.41*scale),
      new THREE.Vector3(fan*.31*scale,.57*scale,-.52*scale),
      new THREE.Vector3(fan*.43*scale,.69*scale,-.47*scale)]);
      const tail=new THREE.Mesh(new THREE.TubeGeometry(curve,20,.044*scale,10,false),toon(cfg.color,.08));tail.userData.tail=i;add(tail);}  
  }else if(cfg.kind==='spike'){
    hairCap();
    for(let i=0;i<9;i++){const sp=new THREE.Mesh(new THREE.ConeGeometry(0.048*scale,0.22*scale,6),toon(hairCol,0.02));const a=(i/9)*TAU;sp.position.set(Math.cos(a)*0.13*scale,1.67*scale,Math.sin(a)*0.13*scale-0.01*scale);sp.rotation.z=Math.sin(a)*0.45;sp.rotation.x=-Math.cos(a)*0.45;add(sp);}    
  }else if(cfg.kind==='long'){
    hairCap();
    const back=new THREE.Mesh(new THREE.BoxGeometry(0.34*scale,0.62*scale,0.12*scale),toon(hairCol,0.02));back.position.set(0,1.20*scale,-0.16*scale);add(back);back.userData.cloak=1;
    const beret=new THREE.Mesh(new THREE.SphereGeometry(0.19*scale,18,14),toon(hatCol,0.05));beret.scale.set(1.2,0.45,1.1);beret.position.set(0.08*scale,1.72*scale,0.0);add(beret);
  }else if(cfg.kind==='bowl'){
    const h=new THREE.Mesh(new THREE.SphereGeometry(0.28*scale,18,16,0,TAU,0,Math.PI*0.56),toon(hairCol));h.position.set(0,1.52*scale,-0.01*scale);add(h);
    const cap=new THREE.Mesh(new THREE.CylinderGeometry(0.18*scale,0.18*scale,0.12*scale,18),toon(hatCol,0.04));cap.position.set(0,1.72*scale,0);add(cap);g.add(outline(cap,1.04));
    const brim=new THREE.Mesh(new THREE.TorusGeometry(0.18*scale,0.022*scale,6,18),toon(hatCol,0.03));brim.rotation.x=Math.PI/2;brim.position.set(0,1.66*scale,0);add(brim);
  }else if(cfg.kind==='side'){
    hairCap();
    for(const sgn of[-1,1]){const str=new THREE.Mesh(new THREE.CylinderGeometry(0.042*scale,0.03*scale,0.52*scale,8),toon(hairCol));str.position.set(sgn*0.22*scale,1.28*scale,0.0);str.rotation.z=sgn*0.05;add(str);str.userData.tail=sgn+4;}
    const cap=new THREE.Mesh(new THREE.SphereGeometry(0.22*scale,18,14),toon(hatCol,0.05));cap.scale.set(1.15,0.55,1.1);cap.position.set(-0.05*scale,1.69*scale,0.02*scale);cap.rotation.z=-0.16;add(cap);
  }else if(cfg.kind==='turban'){
    const base=new THREE.Mesh(new THREE.SphereGeometry(0.29*scale,18,14,0,TAU,0,Math.PI*0.6),toon(0xaad7b6,0.02));base.position.set(0,1.55*scale,0);add(base);
    const wrap=new THREE.Mesh(new THREE.TorusGeometry(0.22*scale,0.05*scale,10,22),toon(_acc,0.05));wrap.rotation.x=Math.PI/2;wrap.position.set(0,1.62*scale,0.0);add(wrap);
    const jewel=new THREE.Mesh(new THREE.OctahedronGeometry(0.04*scale,0),new THREE.MeshBasicMaterial({color:0xfbe08c}));jewel.position.set(0,1.60*scale,0.22*scale);g.add(jewel);
  }else if(cfg.kind==='cat'){
    hairCap();
    for(const sgn of[-1,1]){const ear=new THREE.Mesh(new THREE.ConeGeometry(0.07*scale,0.15*scale,5),toon(hairCol));ear.position.set(sgn*0.17*scale,1.70*scale,0);add(ear);}    
    const hat=new THREE.Mesh(new THREE.ConeGeometry(0.3*scale,0.48*scale,10),toon(0x493a67,0.05));hat.position.set(0,1.88*scale,0);add(hat);g.add(outline(hat,1.04));
    const brim=new THREE.Mesh(new THREE.CylinderGeometry(0.35*scale,0.35*scale,0.028*scale,18),toon(0x493a67));brim.position.set(0,1.66*scale,0);add(brim);
  }else if(cfg.kind==='captain'){
    hairCap();
    const brim=new THREE.Mesh(new THREE.CylinderGeometry(0.42*scale,0.42*scale,0.03*scale,20),toon(0x1a1420,0.03));
    brim.position.set(0,1.66*scale,0);add(brim);g.add(outline(brim,1.03));
    const crown=new THREE.Mesh(new THREE.CylinderGeometry(0.2*scale,0.24*scale,0.2*scale,14),toon(0x1a1420,0.03));
    crown.position.set(0,1.77*scale,0);add(crown);
    const trim=new THREE.Mesh(new THREE.TorusGeometry(0.22*scale,0.02*scale,6,18),toon(_acc,0.1));
    trim.rotation.x=Math.PI/2;trim.position.set(0,1.7*scale,0);add(trim);
    const feather=new THREE.Mesh(new THREE.ConeGeometry(0.03*scale,0.26*scale,5),toon(0xf4f0e6,0.06));
    feather.position.set(0.2*scale,1.86*scale,-0.06*scale);feather.rotation.z=-0.7;add(feather);
    const coatTail=new THREE.Mesh(new THREE.BoxGeometry(0.44*scale,0.5*scale,0.05*scale),toon(cfg.color,0.04));
    coatTail.position.set(0,0.5*scale,-0.2*scale);coatTail.rotation.x=0.14;add(coatTail);coatTail.userData.cloak=1;g.add(outline(coatTail,1.03));
  }else if(cfg.kind==='blade'){
    hairCap();
    const bandana=new THREE.Mesh(new THREE.SphereGeometry(0.265*scale,18,12,0,TAU,0,Math.PI*0.42),toon(0x14201a,0.03));
    bandana.position.set(0,1.53*scale,0);add(bandana);
    const knot=new THREE.Mesh(new THREE.BoxGeometry(0.1*scale,0.16*scale,0.03*scale),toon(0x14201a));
    knot.position.set(0.2*scale,1.5*scale,-0.16*scale);knot.rotation.z=0.5;add(knot);knot.userData.tail=7;
    for(let k=0;k<3;k++){const hilt=new THREE.Mesh(new THREE.CylinderGeometry(0.022*scale,0.022*scale,0.2*scale,6),toon(k===1?0xf4f0e6:0x2a2f3a,0.06));
      hilt.position.set(0.27*scale,0.62*scale+k*0.07*scale,-0.06*scale+k*0.05*scale);hilt.rotation.z=1.2;add(hilt);}
  }else if(cfg.kind==='swoop'){
    hairCap();
    const swoop=new THREE.Mesh(new THREE.SphereGeometry(0.24*scale,16,12,0,TAU,0,Math.PI*0.5),toon(hairCol,0.02));
    swoop.scale.set(1.06,0.8,1.08);swoop.position.set(0.05*scale,1.55*scale,0.05*scale);swoop.rotation.z=-0.22;add(swoop);
    const fringe=new THREE.Mesh(new THREE.BoxGeometry(0.16*scale,0.16*scale,0.04*scale),toon(hairCol,0.02));
    fringe.position.set(-0.1*scale,1.45*scale,0.21*scale);fringe.rotation.z=0.28;add(fringe);
    const tieM=new THREE.Mesh(new THREE.BoxGeometry(0.05*scale,0.2*scale,0.02*scale),toon(_acc,0.08));
    tieM.position.set(0,0.98*scale,0.245*scale);add(tieM);
  }else if(cfg.kind==='pony'){
    hairCap();
    const knob=new THREE.Mesh(new THREE.SphereGeometry(0.1*scale,12,10),toon(hairCol,0.02));
    knob.position.set(0,1.72*scale,-0.14*scale);add(knob);
    const tailC=new THREE.CatmullRomCurve3([
      new THREE.Vector3(0,1.7*scale,-0.18*scale),
      new THREE.Vector3(0.03*scale,1.44*scale,-0.32*scale),
      new THREE.Vector3(-0.02*scale,1.1*scale,-0.3*scale)]);
    const pony=new THREE.Mesh(new THREE.TubeGeometry(tailC,10,0.06*scale,8,false),toon(hairCol,0.02));
    pony.userData.tail=8;add(pony);g.add(outline(pony,1.05));
  }else if(cfg.kind==='widehat'){
    hairCap();
    const brim=new THREE.Mesh(new THREE.CylinderGeometry(0.46*scale,0.48*scale,0.026*scale,18),toon(0x3a2f22,0.03));
    brim.position.set(0,1.62*scale,0);brim.rotation.z=0.05;add(brim);g.add(outline(brim,1.02));
    const dome=new THREE.Mesh(new THREE.SphereGeometry(0.2*scale,14,10,0,TAU,0,Math.PI*0.55),toon(0x3a2f22,0.03));
    dome.position.set(0,1.63*scale,0);add(dome);
    const scope=new THREE.Mesh(new THREE.CylinderGeometry(0.028*scale,0.028*scale,0.34*scale,8),toon(0x6a5136,0.05));
    scope.rotation.x=Math.PI/2.4;scope.position.set(-0.3*scale,0.9*scale,-0.14*scale);add(scope);
  }else if(cfg.kind==='tiny'){
    hairCap();
    const cap=new THREE.Mesh(new THREE.CylinderGeometry(0.3*scale,0.34*scale,0.24*scale,14),toon(0xE86A8A,0.05));
    cap.position.set(0,1.74*scale,0);add(cap);g.add(outline(cap,1.03));
    const cross=new THREE.Mesh(new THREE.BoxGeometry(0.16*scale,0.05*scale,0.02*scale),new THREE.MeshBasicMaterial({color:0xffffff}));
    cross.position.set(0,1.74*scale,0.33*scale);g.add(cross);
    const cross2=new THREE.Mesh(new THREE.BoxGeometry(0.05*scale,0.16*scale,0.02*scale),new THREE.MeshBasicMaterial({color:0xffffff}));
    cross2.position.copy(cross.position);g.add(cross2);
    for(const sgn of[-1,1]){const antler=new THREE.Mesh(new THREE.CylinderGeometry(0.02*scale,0.03*scale,0.24*scale,5),toon(0x7a5a3a,0.04));
      antler.position.set(sgn*0.3*scale,1.86*scale,0);antler.rotation.z=sgn*0.6;add(antler);
      const tine=new THREE.Mesh(new THREE.CylinderGeometry(0.014*scale,0.02*scale,0.12*scale,5),toon(0x7a5a3a));
      tine.position.set(sgn*0.36*scale,1.94*scale,0);tine.rotation.z=sgn*1.3;add(tine);}
  }else if(cfg.kind==='giant'){
    const knot=new THREE.Mesh(new THREE.SphereGeometry(0.12*scale,12,10),toon(hairCol,0.02));
    knot.position.set(0,1.78*scale,-0.05*scale);add(knot);
    hairCap();
    const haori=new THREE.Mesh(new THREE.BoxGeometry(0.56*scale,0.62*scale,0.06*scale),toon(cfg.color,0.03));
    haori.position.set(0,0.72*scale,-0.24*scale);haori.rotation.x=0.1;add(haori);haori.userData.cloak=1;g.add(outline(haori,1.02));
    for(const sgn of[-1,1]){const mark=new THREE.Mesh(new THREE.TorusGeometry(0.05*scale,0.012*scale,5,10),toon(_acc,0.1));
      mark.position.set(sgn*0.14*scale,1.36*scale,0.235*scale);g.add(mark);}
  }else if(cfg.kind==='baldcape'){
    for(const sgn of[-1,1]){const ant=new THREE.Mesh(new THREE.CylinderGeometry(0.012*scale,0.02*scale,0.14*scale,5),toon(skin));
      ant.position.set(sgn*0.07*scale,1.7*scale,0.1*scale);ant.rotation.x=-0.5;ant.rotation.z=sgn*0.3;add(ant);}
    const cape=new THREE.Mesh(new THREE.BoxGeometry(0.58*scale,0.78*scale,0.05*scale),toon(0xf0ede4,0.03));
    cape.position.set(0,0.78*scale,-0.26*scale);cape.rotation.x=0.1;add(cape);cape.userData.cloak=1;g.add(outline(cape,1.02));
    const pad=new THREE.Mesh(new THREE.CylinderGeometry(0.3*scale,0.34*scale,0.1*scale,12),toon(0xf0ede4,0.03));
    pad.position.set(0,1.14*scale,0);add(pad);
  }else{
    hairCap();
    const beanie=new THREE.Mesh(new THREE.SphereGeometry(0.2*scale,16,12),toon(hatCol,0.04));beanie.scale.set(1.08,0.68,1.0);beanie.position.set(0,1.70*scale,0.0);add(beanie);
  }

  // forehead band / head accessory for courier identity
  const band=new THREE.Mesh(new THREE.BoxGeometry(.48*scale,.065*scale,.03*scale),toon(_acc,.12));
  band.position.set(0,1.55*scale,.21*scale);g.add(band);
  const plate=new THREE.Mesh(new THREE.BoxGeometry(0.15*scale,0.052*scale,0.016*scale),new THREE.MeshBasicMaterial({color:0xcbd0d4}));
  plate.position.set(0,1.55*scale,0.236*scale);g.add(plate);
  for(const sgn of[-1,1]){const tie=new THREE.Mesh(new THREE.BoxGeometry(.034*scale,.22*scale,.02*scale),toon(_acc,.08));tie.position.set(sgn*.22*scale,1.48*scale,-.16*scale);tie.rotation.z=sgn*.34;tie.userData.tail=sgn+6;g.add(tie);}  

  // armature — pivots with upper/lower limbs
  for(const sgn of[-1,1]){
    const armPivot=new THREE.Group();armPivot.position.set(sgn*0.29*scale,shoulderY,0.0);armPivot.userData.arm=sgn;g.add(armPivot);
    const upperArm=new THREE.Mesh(new THREE.CapsuleGeometry(0.058*scale,0.22*scale,8,12),toon(coatCol,0.03));
    upperArm.position.set(0,-0.16*scale,0);armPivot.add(upperArm);
    const elbow=new THREE.Group();elbow.position.set(0,-0.31*scale,0);elbow.userData.forearm=sgn;armPivot.add(elbow);
    const foreArm=new THREE.Mesh(new THREE.CapsuleGeometry(0.052*scale,0.20*scale,8,12),toon(sweaterCol,0.03));
    foreArm.position.set(0,-0.14*scale,0);elbow.add(foreArm);
    const cuff=new THREE.Mesh(new THREE.CylinderGeometry(0.054*scale,0.06*scale,0.05*scale,10),toon(_acc,0.04));cuff.position.set(0,-0.25*scale,0);elbow.add(cuff);
    const hand=new THREE.Mesh(new THREE.SphereGeometry(0.062*scale,12,10),toon(skin));hand.scale.set(0.95,1.0,0.8);hand.position.set(0,-0.29*scale,0.01*scale);elbow.add(hand);

    const legPivot=new THREE.Group();legPivot.position.set(sgn*0.12*scale,hipY,0.0);legPivot.userData.leg=sgn;g.add(legPivot);
    const thigh=new THREE.Mesh(new THREE.CapsuleGeometry(0.078*scale,0.24*scale,8,14),toon(pantsCol,0.02));thigh.position.set(0,-0.18*scale,0);legPivot.add(thigh);
    const knee=new THREE.Group();knee.position.set(0,-0.34*scale,0.02*scale);knee.userData.calf=sgn;legPivot.add(knee);
    const calf=new THREE.Mesh(new THREE.CapsuleGeometry(0.068*scale,0.21*scale,8,12),toon(_colorBlend(pantsCol,0xffffff,0.08),0.02));calf.position.set(0,-0.13*scale,0);knee.add(calf);
    const boot=new THREE.Mesh(new THREE.BoxGeometry(0.13*scale,0.10*scale,0.24*scale),toon(bootCol,0.02));boot.position.set(0,-0.27*scale,0.06*scale);knee.add(boot);
  }

  // aura ring
  const aura=new THREE.Mesh(new THREE.TorusGeometry(0.34*scale,0.012*scale,6,40),
    new THREE.MeshBasicMaterial({color:_acc,transparent:true,opacity:0.42,blending:THREE.AdditiveBlending,depthWrite:false}));
  aura.rotation.x=Math.PI/2;aura.position.y=0.04;aura.userData.aura=true;g.add(aura);
  return g;
}
function animateChar(model,t,walking,sprinting=false){
  const stride=sprinting ? 1.0 : 0.72, armSwing=sprinting ? 0.84 : 0.54;
  const bob=walking ? Math.abs(Math.sin(t))*(sprinting ? .078 : .05) : Math.sin(t*.45)*.015;
  model.position.y+=(bob-model.position.y)*.25;
  model.rotation.x+=(((walking?(sprinting?-.22:-.11):0))-model.rotation.x)*.18;
  model.rotation.z+=(((walking?Math.sin(t*0.5)*0.02:0))-model.rotation.z)*.12;
  model.traverse(c=>{
    if(c.userData.leg!==undefined){
      const s=Math.sin(t*c.userData.leg);
      c.rotation.x=walking?s*stride:c.rotation.x*0.82;
      c.rotation.z=walking?s*0.06*c.userData.leg:c.rotation.z*0.82;
    }
    if(c.userData.calf!==undefined){
      const s=Math.sin(t*c.userData.calf);
      c.rotation.x=walking?Math.max(0,-s)*(sprinting?0.95:0.72):c.rotation.x*0.8;
    }
    if(c.userData.arm!==undefined){
      const s=Math.sin(t*-c.userData.arm);
      c.rotation.x=walking?s*armSwing:Math.sin(t*0.55)*0.08;
      c.rotation.z=walking?-c.userData.arm*0.10:0;
    }
    if(c.userData.forearm!==undefined){
      const s=Math.sin(t*-c.userData.forearm);
      c.rotation.x=walking?Math.max(0,s)*(sprinting?0.52:0.34):Math.sin(t*0.7)*0.04;
    }
    if(c.userData.tail!==undefined)c.rotation.z=Math.sin(t*1.5+c.userData.tail)*0.18;
    if(c.userData.cloak)c.rotation.x=(walking?Math.sin(t*2.0)*0.06:0.03)+Math.sin(t*0.65)*0.02;
    if(c.userData.scarf)c.rotation.x=(walking?Math.sin(t*2.2+0.4)*0.1:0.06);
    if(c.userData.aura)c.rotation.z+=0.028;
  });
}

/* ============================================================
   AGENTS (NPCs)
============================================================ */
function makeAgent(npc){
  const cfg=ROSTER.find(r=>r.id===npc.role);
  const realmAcc=cfg.realm&&REALMS[cfg.realm]?REALMS[cfg.realm].grade.accent:cfg.accent;
  const model=charModel(cfg,0.96,_colorBlend(cfg.accent,realmAcc,0.3));
  if(cfg.bulk)model.scale.set(cfg.bulk,1,cfg.bulk);
  const g=new THREE.Group();g.add(model);
  // floating indicator
  const ind=new THREE.Mesh(new THREE.ConeGeometry(0.12,0.26,4),
    new THREE.MeshBasicMaterial({color:PAL.gold,transparent:true,opacity:0.95,blending:THREE.AdditiveBlending}));
  ind.position.y=1.7;ind.rotation.x=Math.PI;ind.userData.ind=true;g.add(ind);
  // split-planet verses: an NPC stationed on another planet parks hidden here;
  // the beacon retargets to the Wormhole Gate so the leg reads "transit required".
  const live=(window.NPCS_LIVE&&window.NPCS_LIVE[npc.slot])||{t:npc.t,p:npc.p,offworld:false};
  placeOn(g,live.t,live.p,0);planet.add(g);
  if(live.offworld)g.visible=false;
  return {group:g,model,ind,cfg,slot:npc.slot,role:npc.role,t:live.t,p:live.p,offworld:!!live.offworld,loc:npc.loc,dlg:DLG[npc.role]};
}

/* parcel carried by player */
function makeParcel(){
  const g=new THREE.Group();
  const box=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.3,0.34),toon(0xd8c2a0));box.castShadow=true;g.add(box);g.add(outline(box,1.06));
  const tie=new THREE.Mesh(new THREE.BoxGeometry(0.36,0.05,0.05),toon(PAL.crimson,0.2));tie.position.y=0.16;g.add(tie);
  const tie2=tie.clone();tie2.rotation.y=Math.PI/2;g.add(tie2);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.34,16,12),
    new THREE.MeshBasicMaterial({color:PAL.gold,transparent:true,opacity:0.16,blending:THREE.AdditiveBlending,depthWrite:false}));g.add(glow);
  g.visible=false;return g;
}

/* collectible photon shards */
function makeShards(){
  for(let i=0;i<SHARD_GOAL;i++){
    const t=Math.random()*TAU,p=0.35+Math.random()*2.3;
    const g=new THREE.Group();
    const core=new THREE.Mesh(new THREE.OctahedronGeometry(0.22,0),
      new THREE.MeshBasicMaterial({color:PAL.frost}));
    core.userData.spin=true;g.add(core);
    const halo=new THREE.Mesh(new THREE.OctahedronGeometry(0.34,0),
      new THREE.MeshBasicMaterial({color:PAL.soul,transparent:true,opacity:0.3,blending:THREE.AdditiveBlending,depthWrite:false}));
    halo.userData.spin=true;g.add(halo);
    placeOn(g,t,p,1.1);planet.add(g);
    shards.push({group:g,t,p,got:false,phase:Math.random()*TAU});
  }
}

/* ============================================================
   PLAYER
============================================================ */
function makePlayer(){
  player=new THREE.Group();playerMesh=new THREE.Group();player.add(playerMesh);
  // soft contact shadow blob
  playerShadow=new THREE.Mesh(new THREE.CircleGeometry(0.5,20),
    new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.32}));
  playerShadow.rotation.x=-Math.PI/2;playerShadow.position.y=0.02;player.add(playerShadow);
  // carried parcel (offset to side)
  carryMesh=makeParcel();carryMesh.position.set(0.37,0.84,0.10);carryMesh.rotation.z=-0.06;carryMesh.scale.setScalar(0.82);playerMesh.add(carryMesh);
  scene.add(player);applyChar();
  // Start on the marked dispatch road, clear of the hall, with the office framed ahead.
  placeOn(player,-0.075,Math.PI/2+0.035,CHAR_H*0.1);
  const n=player.position.clone().normalize(),toward=s2c(0,Math.PI/2,PLANET_R).sub(player.position).projectOnPlane(n).normalize();
  const right=new THREE.Vector3().crossVectors(n,toward).normalize(),forward=new THREE.Vector3().crossVectors(right,n).normalize();
  player.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right,n,forward));
  facingDir.copy(forward);
}
function applyChar(){
  const cfg=ROSTER[curChar];
  // remove old model (keep carry + shadow)
  for(let i=playerMesh.children.length-1;i>=0;i--){if(playerMesh.children[i]!==carryMesh)playerMesh.remove(playerMesh.children[i]);}
  const realmAcc=cfg.realm&&REALMS[cfg.realm]?REALMS[cfg.realm].grade.accent:cfg.accent;
  const _pm=charModel(cfg,1,_colorBlend(cfg.accent,realmAcc,0.3));
  if(cfg.bulk)_pm.scale.set(cfg.bulk,1,cfg.bulk);
  playerMesh.add(_pm);
  document.getElementById('cname').textContent=cfg.name;
  document.getElementById('ctitle').textContent=cfg.title;
  if(gameOn)save();
}

/* ============================================================
   COLLISION v2 — robust spherical sliding resolution
   Iterative pushout in tangent space against circle colliders
   (buildings, trunks, props) and capsule-segment walls (bridge
   rails, ravine rims, plankway ropes). A static spatial hash
   keeps hundreds of colliders O(neighbourhood) per frame.
============================================================ */
function _colKey(x,y,z){return x+','+y+','+z;}
function buildCollisionIndex(){
  colHash=new Map();
  const put=(k,ref)=>{let b=colHash.get(k);if(!b){b={c:[],w:[]};colHash.set(k,b);}b[ref.w?'w':'c'].push(ref.o);};
  const cellOf=v=>_colKey(Math.floor(v.x/COL_CELL),Math.floor(v.y/COL_CELL),Math.floor(v.z/COL_CELL));
  for(const c of worldColliders)put(cellOf(c.pos),{o:c});
  for(const w of wallColliders){const mid=w.a.clone().add(w.b).multiplyScalar(.5);
    const cells=new Set([cellOf(w.a),cellOf(mid),cellOf(w.b)]);
    for(const k of cells)put(k,{o:w,w:true});}
}
function _gatherColliders(pos,out){
  out.c.length=0;out.w.length=0;
  if(!colHash){out.c=worldColliders;out.w=wallColliders;return out;}
  const bx=Math.floor(pos.x/COL_CELL),by=Math.floor(pos.y/COL_CELL),bz=Math.floor(pos.z/COL_CELL);
  const seenW=new Set();
  for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(let dz=-1;dz<=1;dz++){
    const b=colHash.get(_colKey(bx+dx,by+dy,bz+dz));if(!b)continue;
    for(const c of b.c)out.c.push(c);
    for(const w of b.w)if(!seenW.has(w)){seenW.add(w);out.w.push(w);}
  }
  return out;
}
const _colBuf={c:[],w:[]},_segAB=new THREE.Vector3(),_segAP=new THREE.Vector3(),_segPt=new THREE.Vector3();
function _closestOnSeg(a,b,p,out){
  _segAB.subVectors(b,a);_segAP.subVectors(p,a);
  const len2=Math.max(1e-8,_segAB.lengthSq());
  const t=THREE.MathUtils.clamp(_segAP.dot(_segAB)/len2,0,1);
  return out.copy(a).addScaledVector(_segAB,t);
}
function resolveWorldCollisions(){
  const cushion=.34;
  for(let iter=0;iter<3;iter++){
    const n=player.position.clone().normalize();
    const set=_gatherColliders(player.position,_colBuf);
    let moved=false;
    for(const c of set.c){
      const delta=player.position.clone().sub(c.pos),radial=Math.abs(delta.dot(n));
      if(radial>2.2)continue;
      const tangent=delta.sub(n.clone().multiplyScalar(delta.dot(n))),min=c.radius+cushion,d=tangent.length();
      if(d<min){
        if(d<.001)tangent.set(1,0,0).cross(n).normalize();else tangent.multiplyScalar(1/d);
        player.position.add(tangent.multiplyScalar(min-d));
        const vn=velocity.dot(tangent);if(vn<0)velocity.sub(tangent.clone().multiplyScalar(vn));
        moved=true;
      }
    }
    for(const w of set.w){
      _closestOnSeg(w.a,w.b,player.position,_segPt);
      const delta=player.position.clone().sub(_segPt),radial=Math.abs(delta.dot(n));
      if(radial>2.6)continue;
      const tangent=delta.sub(n.clone().multiplyScalar(delta.dot(n))),min=w.radius+cushion,d=tangent.length();
      if(d<min){
        if(d<.001)tangent.crossVectors(_segAB,n).normalize();else tangent.multiplyScalar(1/d);
        player.position.add(tangent.multiplyScalar(min-d));
        const vn=velocity.dot(tangent);if(vn<0)velocity.sub(tangent.clone().multiplyScalar(vn));
        moved=true;
      }
    }
    if(!moved)break;
  }
}

function triggerJump(){
  if(!gameOn||!player||dialogOn)return false;
  const groundRadius=PLANET_R+CHAR_H*0.1;
  const grounded=onGround||player.position.length()<=groundRadius+0.08;
  if(!grounded)return false;
  const up=player.position.clone().normalize();
  // Clear the curved surface before applying the impulse so the ground clamp
  // cannot swallow a jump on the same frame.
  player.position.addScaledVector(up,0.055);
  const radialSpeed=velocity.dot(up);
  if(radialSpeed<0)velocity.addScaledVector(up,-radialSpeed);
  velocity.addScaledVector(up,JUMP);
  onGround=false;jumpQueued=false;keys.btnJ=false;sfx.jump();
  return true;
}

function updatePlayer(dt){
  if(dialogOn||window._cine)return;
  const norm=player.position.clone().normalize();
  const camFwd=new THREE.Vector3();camera.getWorldDirection(camFwd);
  const fwd=camFwd.clone().sub(norm.clone().multiplyScalar(camFwd.dot(norm))).normalize();
  const right=new THREE.Vector3().crossVectors(fwd,norm).normalize();
  let ix=0,iz=0;
  if(keys['KeyW']||keys['ArrowUp'])iz+=1;
  if(keys['KeyS']||keys['ArrowDown'])iz-=1;
  if(keys['KeyA']||keys['ArrowLeft'])ix-=1;
  if(keys['KeyD']||keys['ArrowRight'])ix+=1;
  if(joyOn){ix+=joyV.x;iz+=-joyV.y;}
  if(padX||padY){ix+=padX;iz+=-padY;}
  running=keys['ShiftLeft']||keys['ShiftRight'];
  const spd=running?SPRINT:SPD;
  let mv=new THREE.Vector3();
  if(ix||iz)mv=fwd.clone().multiplyScalar(iz).add(right.clone().multiplyScalar(ix)).normalize().multiplyScalar(spd*dt);
  if(jumpQueued||keys['btnJ'])triggerJump();
  velocity.add(norm.clone().multiplyScalar(-GRAV*dt));
  player.position.add(mv);player.position.add(velocity.clone().multiplyScalar(dt));resolveWorldCollisions();
  if(typeof applyPathGuidance==='function')applyPathGuidance(dt,mv);
  const d=player.position.length();
  if(d<PLANET_R+CHAR_H*0.1){
    player.position.normalize().multiplyScalar(PLANET_R+CHAR_H*0.1);
    const vd=velocity.dot(norm);if(vd<0)velocity.sub(norm.clone().multiplyScalar(vd));
    onGround=true;
    const beat=Math.floor(animT*5);if(mv.lengthSq()>0.0008&&beat%4===0&&beat!==lastStepBeat){lastStepBeat=beat;sfx.step();dust();}
  }
  const nn=player.position.clone().normalize();
  if(mv.lengthSq()>0.0001){
    const lf=mv.clone().normalize();
    const lr=new THREE.Vector3().crossVectors(nn,lf).normalize();
    const cf=new THREE.Vector3().crossVectors(lr,nn).normalize();
    const mat=new THREE.Matrix4().makeBasis(lr,nn,cf);
    player.quaternion.slerp(new THREE.Quaternion().setFromRotationMatrix(mat),11*dt);
    facingDir.lerp(lf,.22).projectOnPlane(nn).normalize();
    animT+=dt*(running?14:9.5);animateChar(playerMesh,animT,true,running);
    _chakraT+=dt;if(_chakraT>(running?0.04:0.105)){_chakraT=0;spawnChakra(running?1:0.5);}
  }else{
    const idleForward=facingDir.clone().projectOnPlane(nn).normalize();
    const idleRight=new THREE.Vector3().crossVectors(nn,idleForward).normalize();
    const idleBasis=new THREE.Matrix4().makeBasis(idleRight,nn,idleForward);
    player.quaternion.slerp(new THREE.Quaternion().setFromRotationMatrix(idleBasis),5*dt);
    animT+=dt*1.5;animateChar(playerMesh,animT,false,false);
  }
  carryMesh.visible=carrying;
  if(carrying){carryMesh.rotation.y+=dt*1.4;carryMesh.position.y=0.78+Math.sin(clock.elapsedTime*3)*0.03;}
  document.body.dataset.player=player.position.toArray().map(v=>v.toFixed(3)).join(',');
  document.body.dataset.moving=(ix||iz)?(running?'sprint':'walk'):'idle';
  document.body.dataset.grounded=String(onGround);
  document.body.dataset.radius=player.position.length().toFixed(3);
  document.body.dataset.velocity=velocity.length().toFixed(3);
  document.body.dataset.carrying=String(carrying);
}
function dust(){
  const pp=new THREE.Vector3();player.getWorldPosition(pp);
  const up=pp.clone().normalize();
  const m=new THREE.Mesh(new THREE.SphereGeometry(0.12,6,6),
    new THREE.MeshBasicMaterial({color:running?PAL.ember:0xcab59a,transparent:true,opacity:running ? .65 : .4,blending:running?THREE.AdditiveBlending:THREE.NormalBlending}));
  m.position.copy(pp).add(up.clone().multiplyScalar(0.05));
  m.userData.dust=1;m.userData.up=up;m.userData.life=0;scene.add(m);particles.push(m);
}

/* ============================================================
   §CHAKRA TRAIL — bright additive energy streaks that ribbon
   off the courier while moving (video-aligned foxfire effect)
============================================================ */
var chakra3D=[], _chakraT=0, _chakraTex=null;
function _chakraTexture(){
  if(_chakraTex)return _chakraTex;
  const c=document.createElement('canvas');c.width=64;c.height=16;const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,64,0);
  g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.32,'rgba(255,225,160,0.85)');
  g.addColorStop(.5,'rgba(255,255,250,1)');g.addColorStop(.68,'rgba(255,180,90,0.85)');
  g.addColorStop(1,'rgba(255,120,70,0)');
  // vertical soft falloff
  x.fillStyle=g;x.fillRect(0,0,64,16);
  const vg=x.createLinearGradient(0,0,0,16);
  vg.addColorStop(0,'rgba(0,0,0,1)');vg.addColorStop(.5,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,1)');
  x.globalCompositeOperation='destination-out';x.fillStyle=vg;x.fillRect(0,0,64,16);
  _chakraTex=new THREE.CanvasTexture(c);_chakraTex.colorSpace=THREE.SRGBColorSpace;return _chakraTex;
}
function spawnChakra(power){
  if(!player)return;
  const pp=new THREE.Vector3();player.getWorldPosition(pp);
  const up=pp.clone().normalize();
  const back=facingDir.clone().projectOnPlane(up).normalize().negate();   // trail points behind
  const side=new THREE.Vector3().crossVectors(up,back).normalize();
  const n=power>0.8?3:2;
  for(let i=0;i<n;i++){
    const s=(Math.random()*2-1);
    const len=(0.55+Math.random()*0.5)*(0.7+power*0.6);
    const mat=new THREE.MeshBasicMaterial({map:_chakraTexture(),transparent:true,
      blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,side:THREE.DoubleSide,
      color:new THREE.Color().lerpColors(new THREE.Color(PAL.gold),new THREE.Color(PAL.ember),Math.random())});
    const q=new THREE.Mesh(new THREE.PlaneGeometry(len,0.12+0.05*power),mat);
    // base position around the lower body, fanned to the sides
    const base=pp.clone()
      .add(up.clone().multiplyScalar(0.35+Math.random()*0.7))
      .add(side.clone().multiplyScalar(s*0.28))
      .add(back.clone().multiplyScalar(0.1));
    q.position.copy(base);
    // orient the streak along the back direction, arced slightly upward+outward
    const dir=back.clone().add(up.clone().multiplyScalar(0.25+Math.random()*0.4))
      .add(side.clone().multiplyScalar(s*0.5)).normalize();
    const east=new THREE.Vector3().crossVectors(up,dir).normalize();
    q.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(dir,east,up));
    q.userData={life:0,max:0.34+Math.random()*0.22,vel:dir.multiplyScalar(2.4+power*2.6),
      up:up.clone(),swirl:s*(2+Math.random()*3)};
    scene.add(q);chakra3D.push(q);
  }
}
function updateChakra(dt){
  for(let i=chakra3D.length-1;i>=0;i--){
    const q=chakra3D[i],u=q.userData;u.life+=dt;
    const k=u.life/u.max;
    if(k>=1){scene.remove(q);q.geometry.dispose();q.material.dispose();chakra3D.splice(i,1);continue;}
    q.position.addScaledVector(u.vel,dt);
    q.position.addScaledVector(u.up,Math.sin(u.life*8+u.swirl)*dt*0.4); // gentle foxfire weave
    u.vel.multiplyScalar(1-dt*1.6);
    const sc=1+k*1.3;q.scale.set(sc,1-k*0.4,1);
    q.material.opacity=(1-k)*(0.9);
  }
}
