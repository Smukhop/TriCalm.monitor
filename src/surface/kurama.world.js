/* === Kurama · Quasar Horizon — flattened module (classic script, shared global scope). THREE + postprocessing provided as globals by the boot shim in index.html. === */
/* ============================================================
   QUASAR BACKDROP — adapted RasenForge: withholding core,
   Doppler photon rim, tilted Keplerian accretion disc.
   Placed far in the sun direction; it IS the day/night light.
============================================================ */
function buildQuasar(){
  const Q=new THREE.Group();
  const R=18;
  // dark withholding core
  const body=new THREE.Mesh(new THREE.SphereGeometry(R*0.98,48,48),
    new THREE.MeshBasicMaterial({color:0x05030A}));
  Q.add(body);
  const shell=new THREE.Mesh(new THREE.SphereGeometry(R*1.02,30,22),
    new THREE.MeshBasicMaterial({color:PAL.soul,wireframe:true,transparent:true,opacity:0.06,depthWrite:false}));
  Q.add(shell);
  const halo=new THREE.Mesh(new THREE.SphereGeometry(R*1.22,40,40),
    new THREE.MeshBasicMaterial({color:PAL.ember,transparent:true,opacity:0.07,side:THREE.BackSide,
    blending:THREE.AdditiveBlending,depthWrite:false}));
  Q.add(halo);

  // photon rim — camera-facing, vertex-coloured Doppler-asymmetric annulus
  (function(){
    const seg=240,rMid=R*1.06,hw=R*0.055,col=new THREE.Color(PAL.hot);
    const pos=[],ca=[],idx=[],radii=[rMid-hw,rMid,rMid+hw];
    for(let i=0;i<=seg;i++){const a=i/seg*TAU;const dop=0.30+0.70*(0.5*(1+Math.cos(a-0.4)));
      for(let r=0;r<3;r++){pos.push(Math.cos(a)*radii[r],Math.sin(a)*radii[r],0);
        const edge=(r===1)?1:0,b=edge*dop;ca.push(col.r*b,col.g*b,col.b*b);}}
    for(let i=0;i<seg;i++){const a0=i*3,a1=(i+1)*3;
      idx.push(a0,a0+1,a1+1,a0,a1+1,a1,a0+1,a0+2,a1+2,a0+1,a1+2,a1+1);}
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    g.setAttribute('color',new THREE.Float32BufferAttribute(ca,3));g.setIndex(idx);
    const rim=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,
      blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,side:THREE.DoubleSide}));
    rim.renderOrder=6;rim.userData.faceCam=true;Q.add(rim);
  })();

  // accretion disc — nested rings, blackbody ramp, Keplerian shear
  const disc=new THREE.Group();disc.rotation.x=24*DEG;disc.rotation.z=-8*DEG;Q.add(disc);
  const spec=[[R*1.18,0.06,PAL.gold,0.34],[R*1.34,0.05,PAL.ember,0.26],
              [R*1.54,0.045,PAL.crimson,0.19],[R*1.82,0.035,PAL.soul,0.13],[R*2.12,0.028,PAL.soul,0.09]];
  const rings=[];
  spec.forEach((s,i)=>{
    const piv=new THREE.Group();
    const full=new THREE.Mesh(new THREE.TorusGeometry(s[0],s[1],12,170),
      new THREE.MeshBasicMaterial({color:s[2],transparent:true,opacity:s[3],blending:THREE.AdditiveBlending,depthWrite:false}));
    full.rotation.x=Math.PI/2;piv.add(full);
    const arc=new THREE.Mesh(new THREE.TorusGeometry(s[0],s[1]*1.6,8,34,0.6+Math.random()*0.35),
      new THREE.MeshBasicMaterial({color:i<2?PAL.hot:PAL.gold,transparent:true,opacity:0.46,
      blending:THREE.AdditiveBlending,depthWrite:false}));
    arc.rotation.x=Math.PI/2;piv.add(arc);piv.rotation.y=Math.random()*TAU;disc.add(piv);
    rings.push({piv,omega:0.16*Math.pow(s[0]/R,-1.5)});
  });
  const sheet=new THREE.Mesh(new THREE.RingGeometry(R*1.12,R*2.2,120),
    new THREE.MeshBasicMaterial({color:PAL.ember,transparent:true,opacity:0.04,side:THREE.DoubleSide,
    blending:THREE.AdditiveBlending,depthWrite:false}));sheet.rotation.x=-Math.PI/2;disc.add(sheet);
  // dust band
  {const n=700,a=new Float32Array(n*3);for(let i=0;i<n;i++){const t=Math.random()*TAU,r=R*1.15+Math.random()*R*0.95;
    a[i*3]=Math.cos(t)*r;a[i*3+1]=(Math.random()-0.5)*0.2;a[i*3+2]=Math.sin(t)*r;}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(a,3));
   disc.add(new THREE.Points(g,new THREE.PointsMaterial({color:PAL.gold,size:0.16,transparent:true,opacity:0.3,
     blending:THREE.AdditiveBlending,depthWrite:false})));}
  Q.userData={rings,disc,sheet};
  return Q;
}

function buildStars(){
  const n=1700,pos=new Float32Array(n*3),col=new Float32Array(n*3);
  for(let i=0;i<n;i++){const r=520+Math.random()*900,th=Math.random()*TAU,ph=Math.acos(2*Math.random()-1);
    pos[i*3]=r*Math.sin(ph)*Math.cos(th);pos[i*3+1]=r*Math.sin(ph)*Math.sin(th);pos[i*3+2]=r*Math.cos(ph);
    const hue=Math.random()<0.7?0.60:(Math.random()<0.5?0.08:0.74);
    const c=new THREE.Color().setHSL(hue,0.22,0.55+Math.random()*0.3);col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  g.setAttribute('color',new THREE.BufferAttribute(col,3));
  return new THREE.Points(g,new THREE.PointsMaterial({size:1.7,vertexColors:true,transparent:true,opacity:0.85,
    sizeAttenuation:true,depthWrite:false}));
}

/* ============================================================
   PLANET + ATMOSPHERE
============================================================ */
function buildPlanet(){
  planet=new THREE.Group();scene.add(planet);
  const geo=new THREE.IcosahedronGeometry(PLANET_R,6);
  const pos=geo.attributes.position,cols=[];
  // authored ravine frame (Kurama Crossing) — precomputed chord segment on the unit sphere
  const RV=window.RAVINE_LIVE||RAVINE, _carve=(window._verseCarve===false)?0:1;
  const _rA=s2c(RV.a.t,RV.a.p,1),_rB=s2c(RV.b.t,RV.b.p,1);
  const _rAB=_rB.clone().sub(_rA),_rL2=Math.max(1e-8,_rAB.lengthSq()),_rTmp=new THREE.Vector3();
  // gentle elevation for hills
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
    const n=new THREE.Vector3(x,y,z).normalize();
    const lat=Math.asin(n.y);
    const th=Math.atan2(n.z,n.x);
    const h=Math.sin(x*0.22)*Math.cos(z*0.22)*0.5+Math.sin(y*0.4+x*0.15)*0.28+Math.sin(z*0.5)*0.18;
    // ravine carve: depress toward the inner water shell across the authored band
    _rTmp.copy(n).sub(_rA);
    const rpj=THREE.MathUtils.clamp(_rTmp.dot(_rAB)/_rL2,0,1);
    _rTmp.copy(_rA).addScaledVector(_rAB,rpj);
    const rd=_rTmp.distanceTo(n)*PLANET_R;
    const rf=_carve*(1-THREE.MathUtils.smoothstep(rd,RV.halfWidth*0.25,RV.halfWidth));
    const rr=PLANET_R+Math.max(0,h)*1.4-rf*RV.depth;
    pos.setXYZ(i,n.x*rr,n.y*rr,n.z*rr);
    let r,g,b;
    const tn=((th%TAU)+TAU)%TAU;
    const inWastes=(tn>2.45&&tn<3.95&&Math.abs(n.y)<0.5);
    if(Math.abs(n.y)>0.82){r=0.9+h*0.04;g=0.93;b=0.98;}                 // snow caps (poles)
    else if(inWastes){r=0.54+h*0.12;g=0.30+h*0.06;b=0.20;}             // crimson wastes band
    else if(lat<-0.5){r=0.84+h*0.05;g=0.76+h*0.05;b=0.55;}            // coastal sand (south)
    else if(lat<-0.06+h*0.12){r=0.32+h*0.07;g=0.55+h*0.08;b=0.30;}    // grass lowland
    else if(lat<0.46+h*0.1){r=0.25+h*0.05;g=0.46+h*0.07;b=0.27;}      // forest floor
    else{r=0.58+h*0.08;g=0.55+h*0.05;b=0.52;}                          // highland
    if(rf>0.02){const bank=Math.min(1,rf*1.35);                        // ravine banks — carved earth
      r=THREE.MathUtils.lerp(r,0.44,bank*0.82);g=THREE.MathUtils.lerp(g,0.35,bank*0.82);b=THREE.MathUtils.lerp(b,0.27,bank*0.82);}
    cols.push(r,g,b);
  }
  geo.computeVertexNormals();
  geo.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
  const mat=new THREE.MeshToonMaterial({vertexColors:true,gradientMap:toonRamp});
  const m=new THREE.Mesh(geo,mat);m.receiveShadow=true;m.castShadow=true;planet.add(m);
  planet.userData.surface=m;
  // dark rim outline
  const o=new THREE.Mesh(new THREE.IcosahedronGeometry(PLANET_R*1.004,5),
    new THREE.MeshBasicMaterial({color:0x070510,side:THREE.BackSide}));planet.add(o);
  // water
  const water=new THREE.Mesh(new THREE.IcosahedronGeometry(PLANET_R*0.972,4),
    new THREE.MeshToonMaterial({color:0x2f6fae,gradientMap:toonRamp,transparent:true,opacity:0.82,
    emissive:new THREE.Color(0x16335a),emissiveIntensity:0.25}));planet.add(water);planet.userData.water=water;
  // Rim-only Fresnel atmosphere. A uniform transparent shell washed the planet
  // white in poster mode; this keeps the turquoise glow on the actual horizon.
  const fresnelMat=(color,intensity,power)=>new THREE.ShaderMaterial({
    uniforms:{color:{value:new THREE.Color(color)},intensity:{value:intensity},power:{value:power}},
    vertexShader:`varying float vFacing;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);vec3 n=normalize(normalMatrix*normal);vec3 v=normalize(-mv.xyz);vFacing=abs(dot(n,v));gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform vec3 color;uniform float intensity;uniform float power;varying float vFacing;void main(){float rim=pow(clamp(1.0-vFacing,0.0,1.0),power);gl_FragColor=vec4(color,rim*intensity);}`,
    transparent:true,side:THREE.BackSide,blending:THREE.AdditiveBlending,depthWrite:false
  });
  const atmo=new THREE.Mesh(new THREE.SphereGeometry(PLANET_R*1.085,64,48),fresnelMat(0x62d8dc,.46,2.4));
  planet.add(atmo);planet.userData.atmo=atmo;
  const atmo2=new THREE.Mesh(new THREE.SphereGeometry(PLANET_R*1.14,48,36),fresnelMat(0x5379c4,.2,4.2));
  planet.add(atmo2);planet.userData.atmo2=atmo2;
  if(typeof applyVerseSkin==='function')applyVerseSkin();
}

function buildSkyDome(){
  // gradient sky shell — tints with day/night; stars show beyond it (it's semi-transparent up top)
  const g=new THREE.SphereGeometry(420,32,24);
  const m=new THREE.ShaderMaterial({side:THREE.BackSide,transparent:true,depthWrite:false,
    uniforms:{top:{value:new THREE.Color(0x43aeb1)},hor:{value:new THREE.Color(0x78cfc2)},
      sun:{value:new THREE.Vector3(0,1,0)},glow:{value:new THREE.Color(PAL.ember)},night:{value:0}},
    vertexShader:`varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`varying vec3 vP;uniform vec3 top;uniform vec3 hor;uniform vec3 sun;uniform vec3 glow;uniform float night;
      void main(){float h=clamp(vP.y*0.5+0.5,0.0,1.0);
      vec3 base=mix(hor,top,pow(h,0.7));
      float sd=max(dot(normalize(vP),normalize(sun)),0.0);
      base+=glow*pow(sd,6.0)*(1.0-night)*0.9;          // warm airglow toward quasar
      base+=glow*pow(sd,40.0)*1.4*(1.0-night*0.6);     // hotspot
      float a=mix(0.92,0.28,h);                         // fade out at zenith so stars read
      a*=(1.0-night*0.55);
      gl_FragColor=vec4(base,a);}`});
  skyDome=new THREE.Mesh(g,m);scene.add(skyDome);
}

/* ============================================================
   WORLD STRUCTURES
============================================================ */
function building(type,t,p,col,roof,s=1){
  // Realm wash: every building — core district or env-pack homage — gets a subtle
  // pull toward its realm's accent so the three fables read as coherent regions
  // from a distance, while fixed accent details (PAL.gold trims, banners, crests)
  // stay untouched since they bypass col/roof entirely.
  if(typeof THREE!=='undefined'){
    if(col!==undefined)col=_realmTint(col,t,0.15);
    if(roof!==undefined)roof=_realmTint(roof,t,0.22);
  }
  const g=new THREE.Group();
  const add=(m,sh=true)=>{m.castShadow=sh;m.receiveShadow=true;g.add(m);return m;};
  const bx=(w,h,d,c)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),toon(c));
  const cy=(rt,rb,h,seg,c)=>new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),toon(c));
  const cn=(r,h,seg,c)=>new THREE.Mesh(new THREE.ConeGeometry(r,h,seg),toon(c));
  const win=(x,y,z)=>{const m=new THREE.MeshBasicMaterial({color:0xffcf88,transparent:true,opacity:0});
    const w=new THREE.Mesh(new THREE.PlaneGeometry(0.26*s,0.38*s),m);w.position.set(x,y,z);g.add(w);windowMats.push(m);};
  const plat=()=>{const m=cy(2.0*s,2.2*s,0.4*s,Math.max(8,Math.round(s*8)),0x9a958c);add(m,true).position.y=0.2*s;};

  // Environment-pack builders (registry) take precedence over the core chain below.
  const _ctx={g,add,bx,cy,cn,win,plat,outline,toon,PAL,TAU,DEG,THREE,s,col,roof,t,p,
    bobbers,particles,windowMats,bannerG,thatchRoofG,stonePillarsG,pagodaG};
  if(typeof BUILDERS!=='undefined' && _extBuild(BUILDERS,type,_ctx)){
    /* built by a registered environment pack */
  } else if(type==='dispatchHall'){
    // Warm mission-office silhouette: broad frontage, layered eaves, lit scroll crest.
    const slab=add(bx(4.25*s,.34*s,3.35*s,0xc7bda9));slab.position.y=.17*s;g.add(outline(slab,1.018));
    const base=add(bx(3.65*s,2.35*s,2.85*s,col));base.position.y=1.48*s;g.add(outline(base,1.025));
    const upper=add(bx(2.75*s,1.25*s,2.35*s,0xf3eadc));upper.position.set(-.22*s,3.1*s,-.08*s);g.add(outline(upper,1.025));
    const roof1=add(bx(4.15*s,.24*s,3.45*s,roof));roof1.position.y=2.72*s;roof1.rotation.z=-.035;g.add(outline(roof1,1.018));
    const roof2=add(bx(3.2*s,.25*s,2.85*s,roof));roof2.position.set(-.22*s,3.78*s,-.08*s);roof2.rotation.z=.035;g.add(outline(roof2,1.018));
    const door=add(bx(.82*s,1.48*s,.08*s,0x4b3a32),false);door.position.set(0,.92*s,1.47*s);
    for(const x of[-1.15,1.15]){const frame=add(bx(.86*s,.72*s,.08*s,0x303740),false);frame.position.set(x,1.65*s,1.47*s);const pane=add(bx(.68*s,.55*s,.09*s,0x79a9b7),false);pane.position.set(x,1.65*s,1.52*s);}
    for(const x of[-1.05,1.05]){const frame=add(bx(.76*s,.64*s,.08*s,0x303740),false);frame.position.set(x,1.62*s,-1.45*s);const pane=add(bx(.58*s,.47*s,.09*s,0x79a9b7),false);pane.position.set(x,1.62*s,-1.5*s);}
    for(const x of[-1.84,1.84]){const side=add(bx(.08*s,.64*s,.72*s,0x303740),false);side.position.set(x,1.55*s,0);}
    for(const x of[-.72,.38]){const frame=add(bx(.72*s,.55*s,.08*s,0x303740),false);frame.position.set(x,3.12*s,1.12*s);}
    const crest=add(cy(.32*s,.32*s,.08*s,20,PAL.gold),false);crest.position.set(0,2.25*s,1.53*s);crest.rotation.x=Math.PI/2;
    const mark=add(new THREE.Mesh(new THREE.TorusGeometry(.16*s,.035*s,6,20),new THREE.MeshBasicMaterial({color:PAL.crimson})),false);mark.position.set(0,2.25*s,1.59*s);
    for(const x of[-1.55,1.55])bannerG(g,PAL.crimson,x*s,1.35*s,3.1*s);
    for(let i=0;i<3;i++){const step=add(bx((1.5-i*.2)*s,.12*s,.45*s,0xb4aa98));step.position.set(0,.06+i*.11,(1.85+i*.32)*s);}
  } else if(type==='villageHouse'){
    // Tall hillside home with the readable linework, balconies and utility clutter of the reference.
    const base=add(bx(2.25*s,2.55*s,1.8*s,col));base.position.y=1.28*s;g.add(outline(base,1.03));
    const roofm=add(bx(2.55*s,.22*s,2.1*s,roof));roofm.position.y=2.66*s;roofm.rotation.z=.035;g.add(outline(roofm,1.025));
    const aw=add(bx(2.05*s,.12*s,.62*s,roof),false);aw.position.set(0,1.48*s,1.18*s);aw.rotation.x=-.14;
    const door=add(bx(.48*s,.88*s,.07*s,0x4f4037),false);door.position.set(.63*s,.45*s,.92*s);
    for(const y of[.92,2.02])for(const x of[-.55,.35]){const fr=add(bx(.58*s,.48*s,.08*s,0x313a42),false);fr.position.set(x,y*s,.93*s);const pn=add(bx(.42*s,.34*s,.09*s,0x86abb5),false);pn.position.set(x,y*s,.98*s);}
    for(const y of[1.0,2.02]){const rear=add(bx(.68*s,.48*s,.08*s,0x313a42),false);rear.position.set(-.15*s,y*s,-.92*s);const side=add(bx(.08*s,.48*s,.62*s,0x313a42),false);side.position.set(-1.14*s,y*s,0);}
    const balcony=add(bx(1.4*s,.1*s,.58*s,0xb7b0a5));balcony.position.set(-.25*s,1.54*s,1.14*s);
    for(let i=-2;i<=2;i++){const rail=add(bx(.05*s,.38*s,.05*s,0x4a4d50),false);rail.position.set((-.25+i*.28)*s,1.76*s,1.38*s);}
    const hand=add(bx(1.4*s,.06*s,.06*s,0x4a4d50),false);hand.position.set(-.25*s,1.94*s,1.38*s);
    const ac=add(bx(.42*s,.36*s,.26*s,0xc7c9c3));ac.position.set(-.83*s,.55*s,1.02*s);g.add(outline(ac,1.02));
    const pipe=add(cy(.035*s,.035*s,2.2*s,7,0x737a78),false);pipe.position.set(-1.02*s,1.2*s,.93*s);
  } else if(type==='motionDojo'){
    const b=add(bx(3.45*s,2.15*s,2.7*s,col));b.position.y=1.08*s;g.add(outline(b,1.028));
    const rf=add(bx(3.9*s,.22*s,3.1*s,roof));rf.position.y=2.26*s;g.add(outline(rf,1.02));
    const sign=add(bx(1.38*s,.48*s,.08*s,PAL.gold),false);sign.position.set(0,1.72*s,1.39*s);
    for(const x of[-1.15,1.15]){const winf=add(bx(.7*s,.78*s,.08*s,0x31434a),false);winf.position.set(x,1.12*s,1.39*s);}
    for(let i=0;i<5;i++){const bell=add(new THREE.Mesh(new THREE.SphereGeometry(.08*s,7,5),toon(PAL.ember)),false);bell.position.set((i-2)*.32*s,2.48*s,1.25*s);}
  } else if(type==='skyLookout'){
    const base=add(cy(1.8*s,2.05*s,.5*s,18,0xd8cfbc));base.position.y=.25*s;
    const dome=add(new THREE.Mesh(new THREE.SphereGeometry(1.55*s,18,12,0,TAU,0,Math.PI/2),toon(col)));dome.position.y=.5*s;g.add(outline(dome,1.025));
    const ring=add(new THREE.Mesh(new THREE.TorusGeometry(1.25*s,.11*s,8,32),toon(roof,.25)));ring.position.y=1.28*s;ring.rotation.x=Math.PI/2;
    const dish=add(new THREE.Mesh(new THREE.SphereGeometry(.58*s,16,10,0,TAU,0,Math.PI/3),toon(0xe6e8e5)));dish.position.set(0,2.15*s,0);dish.rotation.x=-.55;
  } else if(type==='giantRootHouse'){
    const trunk=add(cy(1.25*s,1.75*s,3.3*s,11,0x805a3b));trunk.position.y=1.65*s;g.add(outline(trunk,1.035));
    const door=add(bx(.65*s,1.2*s,.09*s,0x3a2a23),false);door.position.set(0,.62*s,1.31*s);
    for(let i=0;i<5;i++){const root=add(cn(.28*s,2.2*s,7,0x8f6845));const a=i/5*TAU;root.position.set(Math.cos(a)*1.35*s,.22*s,Math.sin(a)*1.35*s);root.rotation.z=Math.PI/2;root.rotation.y=a;}
    const cap=add(cn(2.05*s,1.3*s,9,roof));cap.position.y=3.65*s;g.add(outline(cap,1.035));
  } else if(type==='hall'||type==='citadel'){
    plat();
    const base=add(bx(3.2*s,2.1*s,2.7*s,col));base.position.y=1.25*s;g.add(outline(base,1.03));
    const door=add(bx(0.8*s,1.3*s,0.06*s,0x5a3a1a),false);door.position.set(0,0.9*s,1.37*s);
    win(-1.0*s,1.55*s,1.38*s);win(1.0*s,1.55*s,1.38*s);
    thatchRoofG(g,1.95*s,2.3*s,type==='citadel'?2.6:1.95,0xc8a850);
    stonePillarsG(g,1.98*s,type==='citadel'?9:7);
    const aura=new THREE.Mesh(new THREE.TorusGeometry(1.8*s,0.1*s,8,40),new THREE.MeshBasicMaterial({color:PAL.gold,transparent:true,opacity:0.6,blending:THREE.AdditiveBlending,depthWrite:false}));aura.rotation.x=-Math.PI/2;aura.position.y=0.6*s;g.add(aura);bobbers.push({m:aura,spinY:0.5});
    bannerG(g,PAL.crimson,1.3*s,1.3*s,3.0*s);bannerG(g,PAL.crimson,-1.3*s,1.3*s,3.0*s);
    if(type==='citadel'){const gem=new THREE.Mesh(new THREE.OctahedronGeometry(0.5*s,0),new THREE.MeshBasicMaterial({color:PAL.hot}));gem.position.y=5.6*s;g.add(gem);bobbers.push({m:gem,bob:5.6*s});}
  } else if(type==='house'||type==='cottage'){
    const b=add(bx(1.9*s,1.6*s,1.6*s,col));b.position.y=0.8*s;g.add(outline(b,1.04));
    const r=add(cn(1.6*s,1.05*s,4,roof));r.position.y=2.1*s;r.rotation.y=Math.PI/4;g.add(outline(r,1.04));
    const d=add(bx(0.42*s,0.74*s,0.05*s,0x5c3a1e),false);d.position.set(0,0.37*s,0.81*s);
    win(0.6*s,0.95*s,0.82*s);win(-0.6*s,0.95*s,0.82*s);
    if(type==='cottage'){const ch=add(bx(0.25*s,0.7*s,0.25*s,0x7a5236));ch.position.set(0.55*s,2.35*s,0);}
  } else if(type==='shrine'){
    for(let i=0;i<3;i++){const sz=(3-i)/3;const tt=add(bx(2.6*sz*s,0.85*s,2.6*sz*s,col));tt.position.y=(0.42+i*0.9)*s;g.add(outline(tt,1.03));}
    const tr=add(cn(0.55*s,1.05*s,4,roof));tr.position.y=3.4*s;tr.rotation.y=Math.PI/4;g.add(outline(tr,1.04));
    const torii=new THREE.Group();const p1=cy(0.09*s,0.09*s,1.6*s,6,0xcc3a44);p1.position.set(-0.62*s,0.8*s,0);torii.add(p1);const p2=p1.clone();p2.position.x=0.62*s;torii.add(p2);
    const top=bx(1.7*s,0.16*s,0.22*s,0xcc3a44);top.position.y=1.6*s;torii.add(top);torii.position.set(0,0,1.6*s);g.add(torii);
    const gem=new THREE.Mesh(new THREE.OctahedronGeometry(0.4*s,0),new THREE.MeshBasicMaterial({color:PAL.soul}));gem.position.y=2.2*s;g.add(gem);bobbers.push({m:gem,bob:2.2*s});
  } else if(type==='pagoda'){
    plat();pagodaG(g,4,2.2*s,0.7*s,0.4*s,col,roof);
    const gem=new THREE.Mesh(new THREE.OctahedronGeometry(0.35*s,0),new THREE.MeshBasicMaterial({color:PAL.hot}));gem.position.y=5.4*s;g.add(gem);bobbers.push({m:gem,bob:5.4*s});
  } else if(type==='dojo'||type==='barracks'){
    const b=add(bx(3.1*s,2.1*s,2.6*s,col));b.position.y=1.05*s;g.add(outline(b,1.03));
    add(bx(3.6*s,0.22*s,3.0*s,roof)).position.y=2.2*s;
    const sign=add(bx(1.05*s,0.42*s,0.05*s,PAL.gold),false);sign.position.set(0,1.65*s,1.32*s);
    win(-1.0*s,1.1*s,1.31*s);win(1.0*s,1.1*s,1.31*s);
    if(type==='barracks'){for(const sgn of[-1,1]){add(bx(0.05*s,1.6*s,0.05*s,0xcfd6da)).position.set(sgn*1.3*s,1.4*s,1.0*s);
      add(cn(0.1*s,0.3*s,4,PAL.frost)).position.set(sgn*1.3*s,2.3*s,1.0*s);}}
  } else if(type==='market'||type==='stall'){
    const b=add(bx(2.1*s,1.3*s,1.9*s,col));b.position.y=0.65*s;g.add(outline(b,1.03));
    const aw=add(bx(2.3*s,0.1*s,0.85*s,roof),false);aw.position.set(0,1.3*s,1.15*s);aw.rotation.x=-0.2;
    for(let i=-1;i<=1;i++)add(bx(0.4*s,0.4*s,0.4*s,0x9a7a4a)).position.set(i*0.6*s,0.2*s,1.1*s);
  } else if(type==='tower'||type==='watchtower'){
    const b=add(cy(0.7*s,0.95*s,4.0*s,7,col));b.position.y=2.2*s;g.add(outline(b,1.02));
    add(cy(0.95*s,0.95*s,0.6*s,7,0x857f76)).position.y=4.4*s;
    thatchRoofG(g,1.0*s,4.7*s,1.2*s,roof);
    const tip=new THREE.Mesh(new THREE.SphereGeometry(0.3*s,10,8),new THREE.MeshBasicMaterial({color:PAL.gold}));tip.position.y=5.0*s;g.add(tip);bobbers.push({m:tip,bob:5.0*s});
    win(0,2.6*s,0.97*s);
  } else if(type==='lab'||type==='simdome'){
    const b=add(bx(2.4*s,2.4*s,2.4*s,col));b.position.y=1.4*s;g.add(outline(b,1.03));
    add(new THREE.Mesh(new THREE.SphereGeometry(1.3*s,16,10,0,TAU,0,Math.PI/2),new THREE.MeshToonMaterial({color:new THREE.Color(roof),gradientMap:toonRamp,emissive:new THREE.Color(roof),emissiveIntensity:0.4,transparent:true,opacity:0.72}))).position.y=2.6*s;
    const lab=new THREE.Mesh(new THREE.OctahedronGeometry(0.4*s,0),new THREE.MeshBasicMaterial({color:PAL.frost}));lab.position.y=3.6*s;g.add(lab);bobbers.push({m:lab,bob:3.6*s});
    const panel=add(bx(2.42*s,0.5*s,0.05*s,PAL.teal),false);panel.position.set(0,1.5*s,1.21*s);
  } else if(type==='forge'){
    const b=add(bx(2.4*s,1.9*s,2.2*s,col));b.position.y=1.15*s;g.add(outline(b,1.03));
    thatchRoofG(g,1.55*s,2.1*s,1.2*s,roof);
    add(cy(0.3*s,0.4*s,1.6*s,6,0x6a5a4a)).position.set(0.7*s,2.6*s,0);
    const glow=new THREE.Mesh(new THREE.SphereGeometry(0.2*s,8,6),new THREE.MeshBasicMaterial({color:PAL.ember,transparent:true,opacity:0.9,blending:THREE.AdditiveBlending}));glow.position.set(0.7*s,3.4*s,0);g.add(glow);bobbers.push({m:glow,bob:3.4*s,amp:0.06});
    win(-0.7*s,1.2*s,1.11*s);
  } else if(type==='farm'){
    const field=new THREE.Mesh(new THREE.PlaneGeometry(2.6*s,2.6*s),new THREE.MeshToonMaterial({color:0x8fb24a,gradientMap:toonRamp}));field.rotation.x=-Math.PI/2;field.position.y=0.03;field.receiveShadow=true;g.add(field);
    for(let r=-1;r<=1;r++)for(let cc=-1;cc<=1;cc++)add(cn(0.18*s,0.55*s,5,0x7ec24a)).position.set(r*0.7*s,0.3*s,cc*0.7*s);
    add(bx(0.9*s,0.9*s,0.9*s,col)).position.set(1.0*s,0.45*s,1.0*s);
    const sr=add(cn(0.7*s,0.5*s,4,roof));sr.position.set(1.0*s,1.1*s,1.0*s);sr.rotation.y=Math.PI/4;
  } else if(type==='woodcamp'){
    const b=add(bx(1.8*s,1.5*s,1.5*s,col));b.position.y=0.75*s;g.add(outline(b,1.04));
    const r=add(cn(1.4*s,0.9*s,4,roof));r.position.y=1.9*s;r.rotation.y=Math.PI/4;
    for(let i=0;i<3;i++){const log=add(cy(0.16*s,0.16*s,1.4*s,6,0x7a5236));log.position.set(1.0*s,0.2*s+i*0.3*s,0);log.rotation.z=Math.PI/2;}
  } else if(type==='medbay'){
    const b=add(bx(2.0*s,1.6*s,1.8*s,col));b.position.y=0.85*s;g.add(outline(b,1.03));
    const r=add(cn(1.5*s,0.9*s,4,roof));r.position.y=2.0*s;r.rotation.y=Math.PI/4;
    add(bx(0.7*s,0.18*s,0.05*s,0xff5a5a),false).position.set(0,1.5*s,0.92*s);
    add(bx(0.18*s,0.7*s,0.05*s,0xff5a5a),false).position.set(0,1.5*s,0.92*s);
  } else if(type==='well'){
    add(cy(0.6*s,0.7*s,0.7*s,10,0x9a958c)).position.y=0.35*s;
    for(const sgn of[-1,1])add(bx(0.1*s,1.3*s,0.1*s,0x7a5236)).position.set(sgn*0.55*s,0.95*s,0);
    const roofw=add(cn(0.85*s,0.5*s,4,roof));roofw.position.y=1.85*s;roofw.rotation.y=Math.PI/4;
  } else if(type==='gate'){
    for(const sgn of[-1,1]){const post=add(cy(0.25*s,0.3*s,2.4*s,6,col));post.position.set(sgn*1.4*s,1.2*s,0);g.add(outline(post,1.04));}
    const lintel=add(bx(3.4*s,0.4*s,0.5*s,roof));lintel.position.y=2.6*s;g.add(outline(lintel,1.03));
    const b2=new THREE.Mesh(new THREE.PlaneGeometry(0.8*s,1.0*s),new THREE.MeshToonMaterial({color:new THREE.Color(PAL.crimson),gradientMap:toonRamp,emissive:new THREE.Color(PAL.crimson),emissiveIntensity:0.3,side:THREE.DoubleSide}));b2.position.set(0,2.0*s,0.26*s);g.add(b2);
  } else if(type==='capsulePod'){
    // Dragon Ball inspired capsule pod: cylinder with dome
    // base cylinder
    const body=add(cy(1.1*s,1.1*s,1.8*s,14,col));body.position.y=0.9*s;g.add(outline(body,1.03));
    // domed top
    const top=new THREE.Mesh(new THREE.SphereGeometry(1.1*s,16,12,0,TAU,0,Math.PI/2),new THREE.MeshToonMaterial({color:new THREE.Color(roof),gradientMap:toonRamp,emissive:new THREE.Color(roof),emissiveIntensity:0.4}));
    top.position.y=1.8*s;g.add(top);g.add(outline(top,1.03));
    // windows on the capsule
    win(0.8*s,1.3*s,1.12*s);win(-0.8*s,1.3*s,1.12*s);
  } else if(type==='energyNode'){
    // Energy node chamber: vertical cylinder with glowing ring and orb
    const core=add(cy(0.6*s,0.6*s,1.6*s,10,col));core.position.y=0.8*s;g.add(outline(core,1.04));
    const ring=new THREE.Mesh(new THREE.TorusGeometry(0.78*s,0.06*s,8,22),new THREE.MeshBasicMaterial({color:new THREE.Color(roof),transparent:true,opacity:0.8,blending:THREE.AdditiveBlending,depthWrite:false}));
    ring.rotation.x=Math.PI/2;ring.position.y=1.6*s;g.add(ring);
    const orb=new THREE.Mesh(new THREE.SphereGeometry(0.4*s,12,10),new THREE.MeshBasicMaterial({color:new THREE.Color(roof),transparent:true,opacity:0.7,blending:THREE.AdditiveBlending,depthWrite:false}));
    orb.position.y=2.2*s;g.add(orb);bobbers.push({m:orb,bob:2.2*s,amp:0.05});
  } else if(type==='harborShack'){
    // Harbor shack: small house with sloped roof for the port district
    const b=add(bx(2.0*s,1.4*s,1.6*s,col));b.position.y=0.7*s;g.add(outline(b,1.04));
    const roofMesh=add(cn(1.8*s,1.1*s,4,roof));roofMesh.position.y=2.0*s;roofMesh.rotation.y=Math.PI/4;g.add(outline(roofMesh,1.04));
    win(0.7*s,1.05*s,0.85*s);win(-0.7*s,1.05*s,0.85*s);
  } else if(type==='cargoStation'){
    // Cargo station: large open base with crates
    const base=add(bx(3.0*s,0.6*s,3.0*s,col));base.position.y=0.3*s;g.add(outline(base,1.02));
    // scatter crates on the base
    for(let ix=-1;ix<=1;ix++){
      for(let iz=-1;iz<=1;iz++){
        const cr=new THREE.Mesh(new THREE.BoxGeometry(0.6*s,0.5*s,0.6*s),toon(0x7a5236));cr.position.set(ix*0.9*s,0.55*s,iz*0.9*s);cr.castShadow=true;cr.receiveShadow=true;g.add(cr);g.add(outline(cr,1.05));
      }
    }
  }
  if(g.children.length===0){const b=add(bx(1.6*s,1.4*s,1.4*s,col));b.position.y=0.7*s;g.add(outline(b,1.04));}
  placeOn(g,t,p,0);planet.add(g);g.userData.kind='building';
  const compact=/^(well|energyNode)$/.test(type),open=/^(cargoStation|farm)$/.test(type);
  if(!open)worldColliders.push({pos:g.position.clone(),radius:(compact ? .72 : 1.12)*s,label:type});
  return g;
}
function tree(t,p,type,s=1){
  const g=new THREE.Group();const add=m=>{m.castShadow=true;m.receiveShadow=true;g.add(m);};
  if(type==='round'){const tr=new THREE.Mesh(new THREE.CylinderGeometry(0.09*s,0.13*s,0.85*s,10),toon(0x7a5236));tr.position.y=0.42*s;add(tr);
    const lf=new THREE.Mesh(new THREE.SphereGeometry(0.55*s,18,12),toon(0x2d8a4e));lf.position.y=1.18*s;add(lf);g.add(outline(lf,1.025));}
  else if(type==='pine'){const tr=new THREE.Mesh(new THREE.CylinderGeometry(0.07*s,0.11*s,0.6*s,10),toon(0x6b4226));tr.position.y=0.3*s;add(tr);
    for(let i=0;i<3;i++){const c=new THREE.Mesh(new THREE.ConeGeometry((0.55-i*0.13)*s,0.66*s,14),toon(i===0?0x1a6b3a:0x238b3c));c.position.y=(0.72+i*0.42)*s;add(c);g.add(outline(c,1.025));}}
  else if(type==='sakura'){const tr=new THREE.Mesh(new THREE.CylinderGeometry(0.09*s,0.13*s,1.05*s,10),toon(0x5c3a1e));tr.position.y=0.52*s;add(tr);
    const lf=new THREE.Mesh(new THREE.SphereGeometry(0.72*s,18,12),toon(0xf2b7cf));lf.position.y=1.35*s;add(lf);g.add(outline(lf,1.025));
    for(let i=0;i<6;i++){const pt=new THREE.Mesh(new THREE.PlaneGeometry(0.07,0.07),new THREE.MeshBasicMaterial({color:0xffccd9,side:THREE.DoubleSide,transparent:true,opacity:0.85}));
      pt.position.set((Math.random()-0.5)*1.3*s,1+Math.random(),(Math.random()-0.5)*1.3*s);
      pt.userData.fall=0.14+Math.random()*0.22;pt.userData.sway=1+Math.random()*2;pt.userData.sy=pt.position.y;particles.push(pt);g.add(pt);}}
  else if(type==='palm'){const tr=new THREE.Mesh(new THREE.CylinderGeometry(0.07*s,0.11*s,1.5*s,6),toon(0xc4a35a));tr.position.y=0.75*s;tr.rotation.z=0.12;add(tr);
    for(let i=0;i<5;i++){const l=new THREE.Mesh(new THREE.ConeGeometry(0.14*s,0.8*s,4),toon(i%2?0x3e8a44:0x5faa54));const a=(i/5)*TAU;l.position.set(Math.cos(a)*0.28*s,1.5*s,Math.sin(a)*0.28*s);l.rotation.z=0.9;l.rotation.y=a;add(l);}
    const co=new THREE.Mesh(new THREE.SphereGeometry(0.1*s,6,6),toon(0x6a4a2a));co.position.set(0,1.4*s,0);add(co);}
  placeOn(g,t,p,0);planet.add(g);
  worldColliders.push({pos:g.position.clone(),radius:.14*s+.05,label:'tree'});
  return g;
}
function lantern(t,p){const g=new THREE.Group();
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.035,1.5,6),toon(0x4a4452));pole.position.y=0.75;pole.castShadow=true;g.add(pole);
  const lamp=new THREE.Mesh(new THREE.SphereGeometry(0.16,10,8),toon(PAL.hot,0.6));lamp.position.y=1.56;g.add(lamp);
  const L=new THREE.PointLight(0xffcaa0,0,6,2);L.position.y=1.56;g.add(L);lanternLights.push(L);
  placeOn(g,t,p,0);planet.add(g);}
function rock(t,p,s){const g=new THREE.Group();const m=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),toon(0x7d7a82));
  m.position.y=s*0.5;m.rotation.set(Math.random(),Math.random(),Math.random());m.castShadow=true;m.receiveShadow=true;g.add(m);g.add(outline(m,1.06));
  placeOn(g,t,p,0);planet.add(g);
  if(s>0.24)worldColliders.push({pos:g.position.clone(),radius:s*0.85,label:'rock'});}


/* ---- high-detail district props and environmental craft pieces ---- */
function surfaceDetail(kind,t,p,s=1,rot=0){
  const g=new THREE.Group();
  const add=(m,sh=true)=>{m.castShadow=sh;m.receiveShadow=true;g.add(m);return m;};
  const bx=(w,h,d,c)=>new THREE.Mesh(new THREE.BoxGeometry(w*s,h*s,d*s),toon(c));
  const cy=(rt,rb,h,seg,c)=>new THREE.Mesh(new THREE.CylinderGeometry(rt*s,rb*s,h*s,seg),toon(c));
  const cn=(r,h,seg,c)=>new THREE.Mesh(new THREE.ConeGeometry(r*s,h*s,seg),toon(c));
  // Environment-pack props (registry) take precedence over the core chain below.
  const _ctx={g,add,bx,cy,cn,outline,toon,PAL,TAU,THREE,s,bobbers,particles};
  if(typeof PROPS!=='undefined' && _extBuild(PROPS,kind,_ctx)){
    /* built by a registered environment pack */
  } else if(kind==='crateStack'){
    for(let i=0;i<5;i++){const b=add(bx(0.44,0.38,0.44,i%2?0x9a7a4a:0xb28a5a));b.position.set((i%2)*0.42-0.2,0.19+Math.floor(i/2)*0.38,(i%3)*0.18-0.18);g.add(outline(b,1.025));}
  }else if(kind==='mailbox'){
    const post=add(cy(0.05,0.06,0.75,6,0x3a3442));post.position.y=0.38;
    const box=add(bx(0.58,0.34,0.38,0x5ac8f2));box.position.y=0.86;g.add(outline(box,1.04));
    const flap=add(bx(0.42,0.08,0.04,0xffe9cc),false);flap.position.set(0,0.9,0.22);
  }else if(kind==='cone'){
    const c=add(cn(0.22,0.62,12,0xf2843d));c.position.y=0.31;g.add(outline(c,1.035));
    const band=add(cy(0.18,0.18,0.04,12,0xffe9cc),false);band.position.y=0.34;
  }else if(kind==='bench'){
    for(const z of[-0.18,0.18]){const leg=add(bx(0.08,0.28,0.08,0x5a3a1a));leg.position.set(-0.38,0.14,z);const leg2=leg.clone();leg2.position.x=0.38;g.add(leg2);}
    const seat=add(bx(1.05,0.12,0.42,0x9a6a42));seat.position.y=0.34;g.add(outline(seat,1.025));
    const back=add(bx(1.05,0.42,0.1,0x8a5a35));back.position.set(0,0.62,-0.24);
  }else if(kind==='signboard'){
    const a=add(cy(0.035,0.04,1.05,5,0x5a3a1a));a.position.set(-0.36,0.53,0);
    const b=add(cy(0.035,0.04,1.05,5,0x5a3a1a));b.position.set(0.36,0.53,0);
    const board=add(bx(0.9,0.42,0.08,0xffd27a));board.position.y=0.82;g.add(outline(board,1.03));
    const mark=add(bx(0.45,0.04,0.09,0x2a2230),false);mark.position.set(0,0.83,0.05);
  }else if(kind==='cablePole'){
    const pole=add(cy(0.06,0.07,2.2,6,0x4a4452));pole.position.y=1.1;
    const cross=add(bx(1.2,0.08,0.08,0x4a4452));cross.position.y=1.85;
    for(const x of[-0.45,0.45]){const bead=add(cy(0.06,0.06,0.1,8,0xcfe3ff),false);bead.position.set(x,1.72,0);bead.rotation.x=Math.PI/2;}
  }else if(kind==='lifeRing'){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(0.28*s,0.055*s,8,24),new THREE.MeshToonMaterial({color:0xffffff,gradientMap:toonRamp}));ring.position.y=0.68*s;ring.rotation.x=Math.PI/2;g.add(ring);
    for(let i=0;i<4;i++){const pch=add(bx(0.16,0.055,0.07,0xf2843d),false);const a=i/4*TAU;pch.position.set(Math.cos(a)*0.2*s,0.68*s,Math.sin(a)*0.2*s);pch.rotation.y=-a;}
  }else if(kind==='boat'){
    const hull=add(new THREE.Mesh(new THREE.CylinderGeometry(0.28*s,0.55*s,1.35*s,8),toon(0x2f8cae)));hull.rotation.z=Math.PI/2;hull.position.y=0.33*s;g.add(outline(hull,1.03));
    const cabin=add(bx(0.5,0.35,0.42,0xffe9cc));cabin.position.set(0.05,0.68,0);g.add(outline(cabin,1.04));
    const mast=add(cy(0.025,0.03,0.9,5,0x5a3a1a));mast.position.set(-0.25,0.86,0);
  }else if(kind==='pipeRig'){
    const base=add(bx(1.0,0.22,0.8,0x6c6a64));base.position.y=0.11;
    for(const x of[-0.32,0,0.32]){const pipe=add(cy(0.07,0.07,1.05,8,0x728082));pipe.position.set(x,0.7,0);pipe.rotation.z=Math.PI/2;}
    const valve=add(new THREE.Mesh(new THREE.TorusGeometry(0.18*s,0.025*s,6,18),toon(0xffb068)));valve.position.set(0.46*s,0.7*s,0);valve.rotation.y=Math.PI/2;
  }else if(kind==='shuttleCourt'){
    const court=new THREE.Mesh(new THREE.PlaneGeometry(2.8*s,1.7*s),new THREE.MeshToonMaterial({color:0x4d8f73,gradientMap:toonRamp}));
    court.rotation.x=-Math.PI/2;court.position.y=0.02;court.receiveShadow=true;g.add(court);
    const lineMat=new THREE.MeshBasicMaterial({color:0xffe9cc});
    for(const z of[-0.72,0,0.72]){const ln=new THREE.Mesh(new THREE.BoxGeometry(2.65*s,0.025*s,0.025*s),lineMat);ln.position.set(0,0.04,z*s);g.add(ln);}
    const mid=new THREE.Mesh(new THREE.BoxGeometry(0.035*s,0.025*s,1.65*s),lineMat);mid.position.set(0,0.045,0);g.add(mid);
    const net=new THREE.Mesh(new THREE.BoxGeometry(0.035*s,0.45*s,1.75*s),toon(0xcfe3ff));net.position.set(0,0.27,0);g.add(net);
    const arc=new THREE.Mesh(new THREE.TorusGeometry(0.8*s,0.018*s,6,30,Math.PI),new THREE.MeshBasicMaterial({color:PAL.frost,transparent:true,opacity:0.7,blending:THREE.AdditiveBlending}));arc.position.set(0,0.8,0);arc.rotation.z=Math.PI/2;g.add(arc);bobbers.push({m:arc,spinY:0.2});
  }else if(kind==='foxStatue'){
    const plinth=add(cy(0.42,0.48,0.32,8,0x9a958c));plinth.position.y=0.16;
    const body=add(new THREE.Mesh(new THREE.CapsuleGeometry(0.18*s,0.36*s,4,8),toon(0xd8c8a8)));body.position.y=0.62*s;g.add(outline(body,1.05));
    const head=add(new THREE.Mesh(new THREE.SphereGeometry(0.18*s,8,6),toon(0xd8c8a8)));head.position.y=0.98*s;
    for(const x of[-0.1,0.1]){const ear=add(cn(0.06,0.16,4,0xd8c8a8));ear.position.set(x,1.13,0);ear.rotation.z=-x*2;}
    for(let i=0;i<3;i++){const tail=add(cn(0.07,0.45,6,0xd8c8a8));tail.position.set((i-1)*0.08,0.52,-0.18);tail.rotation.x=0.65;tail.rotation.z=(i-1)*0.35;}
  }else if(kind==='shrineCharm'){
    const pole=add(cy(0.025,0.03,1.0,5,0x5a3a1a));pole.position.y=0.5;
    for(let i=0;i<4;i++){const charm=new THREE.Mesh(new THREE.PlaneGeometry(0.12*s,0.22*s),new THREE.MeshToonMaterial({color:new THREE.Color(i%2?0xffe9cc:0xf2554b),gradientMap:toonRamp,side:THREE.DoubleSide}));charm.position.set((i-1.5)*0.16*s,0.85*s,0);g.add(charm);}
  }else if(kind==='redMailbox'){
    const post=add(cy(.055,.065,.78,7,0x49434a));post.position.y=.39;
    const box=add(bx(.46,.58,.38,0xc94843));box.position.y=.92;g.add(outline(box,1.035));
    const cap=add(cn(.32,.22,4,0xf0e8d8));cap.position.y=1.29;cap.rotation.y=Math.PI/4;
    const slot=add(bx(.25,.055,.035,0x242a31),false);slot.position.set(0,1.03,.205);
  }else if(kind==='guardRail'){
    for(const x of[-.68,0,.68]){const post=add(bx(.1,.72,.1,0xe9e9df));post.position.set(x,.36,0);g.add(outline(post,1.018));const bolt=add(cy(.035,.035,.02,8,0x6f7477),false);bolt.position.set(x,.56,.065);bolt.rotation.x=Math.PI/2;}
    for(const y of[.38,.62]){const rail=add(bx(1.58,.12,.1,0xf4f2e9));rail.position.y=y;g.add(outline(rail,1.015));}
  }else if(kind==='roadSign'){
    const pole=add(cy(.045,.055,1.65,7,0x565d5d));pole.position.y=.83;
    const board=add(bx(.68,.88,.09,0xf1b842));board.position.set(0,1.42,0);g.add(outline(board,1.025));
    const arrow=add(bx(.36,.08,.1,0x9e382f),false);arrow.position.set(-.04,1.27,.055);arrow.rotation.z=.1;
    const glyph=add(bx(.18,.24,.1,0xf4eee1),false);glyph.position.set(.06,1.56,.055);
  }else if(kind==='vendingMachine'){
    const body=add(bx(.7,1.55,.55,0x83c887));body.position.y=.78;g.add(outline(body,1.025));
    const screen=add(bx(.43,.56,.04,0x303842),false);screen.position.set(0,1.1,.295);
    for(let i=0;i<3;i++){const slot=add(bx(.38,.1,.045,i===2?0xf1b842:0xaad5e8),false);slot.position.set(0,.72-i*.18,.3);}
    const bumper=add(cy(.07,.08,.72,8,0xf1b842));bumper.position.set(.48,.36,0);
  }else if(kind==='stairSegment'){
    for(let i=0;i<7;i++){const st=add(bx(1.25,.12,.32,0xd8d2c5));st.position.set(0,.06+i*.11,-.84+i*.26);g.add(outline(st,1.012));}
  }else if(kind==='pottedPlants'){
    for(let i=0;i<3;i++){const pot=add(cy(.13,.17,.25,8,i%2?0xb96a49:0xd6a46a));pot.position.set((i-1)*.34,.13,0);const leaf=add(new THREE.Mesh(new THREE.SphereGeometry(.18*s,7,5),toon(i%2?0x4e8d54:0x65a862)));leaf.position.set((i-1)*.34,.42,0);g.add(outline(leaf,1.03));}
  }else if(kind==='satelliteDish'){
    const mast=add(cy(.035,.045,1.0,7,0x596164));mast.position.y=.5;
    const dish=add(new THREE.Mesh(new THREE.SphereGeometry(.4*s,14,8,0,TAU,0,Math.PI/3),toon(0xaab1b1)));dish.position.set(0,.95,0);dish.rotation.x=-.65;g.add(outline(dish,1.02));
    const tip=add(cy(.025,.025,.35,6,0x41494d),false);tip.position.set(0,1.12,.16);tip.rotation.x=.65;
  }else if(kind==='toriiGate'){
    for(const x of[-.62,.62]){const post=add(cy(.09,.11,1.75,7,0xc9473f));post.position.set(x,.88,0);}
    const top=add(bx(1.7,.18,.2,0xc9473f));top.position.y=1.76;g.add(outline(top,1.02));
    const top2=add(bx(1.4,.12,.18,0x313038));top2.position.y=1.5;
  }else if(kind==='stoneLantern'){
    const base=add(cy(.24,.32,.24,6,0xaaa69a));base.position.y=.12;
    const stem=add(cy(.1,.13,.65,6,0xa19e94));stem.position.y=.52;
    const lamp=add(bx(.42,.36,.42,0xc4bfae));lamp.position.y=.98;g.add(outline(lamp,1.025));
    const cap=add(cn(.38,.26,4,0x8e8a82));cap.position.y=1.29;cap.rotation.y=Math.PI/4;
  }else if(kind==='trainingDummy'){
    const pole=add(cy(.07,.08,1.7,7,0x6f4d32));pole.position.y=.85;
    for(const a of[-.65,.65]){const arm=add(cy(.05,.055,.75,7,0x835b38));arm.position.set(Math.sin(a)*.3,1.12,0);arm.rotation.z=a;}
    const pad=add(cy(.24,.28,.48,9,0xb66a48));pad.position.y=1.05;g.add(outline(pad,1.03));
  }else if(kind==='dock'){
    const deck=add(bx(2.3,.16,1.0,0x8c6848));deck.position.y=.22;g.add(outline(deck,1.015));
    for(const x of[-.95,.95])for(const z of[-.35,.35]){const post=add(cy(.06,.075,.8,7,0x60442f));post.position.set(x,.25,z);}
    for(let i=-2;i<=2;i++){const seam=add(bx(.025,.02,.92,0x544031),false);seam.position.set(i*.42,.32,0);}
  }else if(kind==='barrelStack'){
    for(const [x,y] of[[-.25,.34],[.25,.34],[0,.94]]){const bar=add(cy(.24,.24,.62,10,0x8f5f38));bar.position.set(x,y,0);bar.rotation.z=Math.PI/2;g.add(outline(bar,1.025));for(const dx of[-.22,.22]){const band=add(new THREE.Mesh(new THREE.TorusGeometry(.245*s,.025*s,6,16),toon(0x3e4144)),false);band.position.set(x+dx,y,0);band.rotation.y=Math.PI/2;}}
  }else if(kind==='giantRoot'){
    const root=add(cn(.72,3.4,8,0x7d593b));root.position.set(0,.55,0);root.rotation.z=Math.PI/2;g.add(outline(root,1.025));
  }else if(kind==='ropeBridge'){
    for(let i=-4;i<=4;i++){const plank=add(bx(.36,.08,.75,i%2?0x8f6b49:0xa07a54));plank.position.set(i*.36,.12+Math.cos(i*.35)*.06,0);}
    for(const z of[-.46,.46]){const rope=add(cy(.025,.025,3.2,8,0xc49a62),false);rope.position.set(0,.58,z);rope.rotation.z=Math.PI/2;}
  }else if(kind==='hugeMushroom'){
    const stem=add(cy(.2,.32,1.3,9,0xe2d4bd));stem.position.y=.65;
    const cap=add(new THREE.Mesh(new THREE.SphereGeometry(.72*s,12,8,0,TAU,0,Math.PI/2),toon(0xc45f56)));cap.position.y=1.24;g.add(outline(cap,1.035));
  }else if(kind==='energyRing'){
    const ring=add(new THREE.Mesh(new THREE.TorusGeometry(.7*s,.065*s,9,30),new THREE.MeshBasicMaterial({color:PAL.teal,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false})),false);ring.position.y=.9;ring.rotation.y=.25;bobbers.push({m:ring,spinY:.8});
  }else if(kind==='waterRings'){
    for(let i=0;i<3;i++){const r=new THREE.Mesh(new THREE.TorusGeometry((0.25+i*0.16)*s,0.01*s,5,24),new THREE.MeshBasicMaterial({color:0xcfe3ff,transparent:true,opacity:0.4,blending:THREE.AdditiveBlending}));r.rotation.x=-Math.PI/2;r.position.y=0.035;g.add(r);bobbers.push({m:r,spinY:0.1+i*0.05});}
  }
  placeOn(g,t,p,0);g.rotateY(rot);planet.add(g);
  const blocker=Object.assign({guardRail:.75,vendingMachine:.46,redMailbox:.28,cablePole:.2,stoneLantern:.28,trainingDummy:.28},(typeof EXT_COLLIDERS!=='undefined'?EXT_COLLIDERS:{}));
  if(blocker[kind])worldColliders.push({pos:g.position.clone(),radius:blocker[kind]*s,label:kind});
  return g;
}

function decorateDistricts(){
  surfaceDetail('mailbox',0.04,Math.PI/2+0.08,1,0.3);
  surfaceDetail('signboard',-0.07,Math.PI/2-0.08,1.1,-0.4);
  surfaceDetail('crateStack',0.14,Math.PI/2+0.17,1.1,0.2);
  surfaceDetail('bench',-0.18,Math.PI/2+0.05,1.0,0.8);
  surfaceDetail('cablePole',0.22,Math.PI/2-0.12,1.0,0.2);
  ['cone','crateStack','signboard','bench','mailbox'].forEach((k,i)=>surfaceDetail(k,0.42+i*0.06,Math.PI/2+0.06+(i%2)*0.1,0.9+0.12*(i%2),i*0.5));
  for(let i=0;i<4;i++)surfaceDetail('cablePole',0.48+i*0.05,Math.PI/2-0.13,0.85,0.6);
  for(let i=0;i<5;i++)surfaceDetail('shrineCharm',Math.PI/2-0.16+i*0.08,Math.PI/3+0.12,0.9,i*0.1);
  surfaceDetail('foxStatue',Math.PI/2-0.18,Math.PI/3-0.04,1.0,0.3);
  surfaceDetail('foxStatue',Math.PI/2+0.18,Math.PI/3-0.04,1.0,-0.3);
  surfaceDetail('pipeRig',-0.72,Math.PI/2+0.22,1.1,0.5);
  surfaceDetail('pipeRig',-0.9,Math.PI/2+0.08,0.95,-0.3);
  surfaceDetail('crateStack',-0.62,Math.PI/2+0.05,0.85,0.8);
  surfaceDetail('cone',-0.85,Math.PI/2+0.28,0.8,0.2);
  surfaceDetail('boat',-Math.PI/2-0.1,Math.PI/2+0.46,1.25,0.4);
  surfaceDetail('lifeRing',-Math.PI/2+0.02,Math.PI/2+0.24,1.0,0.1);
  surfaceDetail('waterRings',-Math.PI/2-0.22,Math.PI/2+0.54,1.0,0.0);
  surfaceDetail('crateStack',-Math.PI/2+0.16,Math.PI/2+0.42,0.9,0.7);
  surfaceDetail('shuttleCourt',Math.PI-0.22,Math.PI/2+0.08,1.05,0.4);
  surfaceDetail('signboard',Math.PI+0.05,Math.PI/2+0.25,0.9,-0.5);
  surfaceDetail('bench',Math.PI/4+0.16,Math.PI/4+0.04,0.9,0.6);
  surfaceDetail('signboard',Math.PI+0.0,Math.PI/2-0.28,1.2,0.0);

  // additional tech district details near capsule zone
  surfaceDetail('cablePole',-2.25,Math.PI/2+0.12,1.0,0.4);
  surfaceDetail('crateStack',-2.20,Math.PI/2+0.18,1.05,0.6);
  surfaceDetail('signboard',-2.28,Math.PI/2+0.15,0.9,0.0);
  // harbor district details near new shack and cargo station
  surfaceDetail('boat',-Math.PI/2-0.18,Math.PI/2+0.51,1.25,0.2);
  surfaceDetail('lifeRing',-Math.PI/2+0.04,Math.PI/2+0.49,1.0,0.1);
  surfaceDetail('crateStack',-Math.PI/2+0.28,Math.PI/2+0.44,0.95,0.5);
}

function surfaceFrame(group,t,p,forward,h=.055){
  const pos=s2c(t,p,PLANET_R+h),up=pos.clone().normalize();
  const f=forward.clone().sub(up.clone().multiplyScalar(forward.dot(up))).normalize();
  const right=new THREE.Vector3().crossVectors(up,f).normalize();
  group.position.copy(pos);group.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right,up,f));
  group.userData.t=t;group.userData.p=p;return group;
}

function buildRoadRibbon(t0,p0,t1,p1,spec={}){
  const group=new THREE.Group(),segments=spec.segments||Math.max(14,Math.ceil(Math.hypot(t1-t0,p1-p0)*PLANET_R/1.05));
  planet.add(group);
  const width=spec.width||2.5,color=spec.color||0x53686b,curve=spec.curve||0;
  const roadMat=toon(color),curbMat=toon(0xd8d4c8),lineMat=new THREE.MeshBasicMaterial({color:0xf6f0df});
  const sample=i=>{const u=i/segments;return {t:THREE.MathUtils.lerp(t0,t1,u),p:THREE.MathUtils.lerp(p0,p1,u)+Math.sin(u*Math.PI)*curve};};
  for(let i=0;i<segments;i++){
    const a=sample(i),b=sample(i+1),mid={t:(a.t+b.t)/2,p:(a.p+b.p)/2};
    const pa=s2c(a.t,a.p,PLANET_R+.06),pb=s2c(b.t,b.p,PLANET_R+.06),len=pa.distanceTo(pb)*1.14;
    const tile=new THREE.Group(),slab=new THREE.Mesh(new THREE.BoxGeometry(width,.09,len),roadMat);slab.position.y=.01;slab.receiveShadow=true;tile.add(slab);
    for(const x of[-width/2-.09,width/2+.09]){const curb=new THREE.Mesh(new THREE.BoxGeometry(.18,.13,len),curbMat);curb.position.set(x,.05,0);curb.receiveShadow=true;tile.add(curb);}
    if(spec.markings&&i%2===0){const mark=new THREE.Mesh(new THREE.BoxGeometry(.11,.018,len*.5),lineMat);mark.position.set(0,.075,0);tile.add(mark);}
    if(i%5===2){const crack=new THREE.Mesh(new THREE.BoxGeometry(width*.32,.012,.025),new THREE.MeshBasicMaterial({color:0x313e42,transparent:true,opacity:.48}));crack.position.set((i%3-1)*width*.18,.078,0);crack.rotation.y=(i%2?1:-1)*.42;tile.add(crack);}
    surfaceFrame(tile,mid.t,mid.p,pb.sub(pa),.06);group.add(tile);
  }
  WORLD_STATS.roads++;return group;
}

function buildUtilityWire(t0,p0,t1,p1){
  const a=s2c(t0,p0,PLANET_R+1.86),b=s2c(t1,p1,PLANET_R+1.86),m=s2c((t0+t1)/2,(p0+p1)/2,PLANET_R+1.55);
  const curve=new THREE.CatmullRomCurve3([a,m,b]),wire=new THREE.Mesh(new THREE.TubeGeometry(curve,16,.025,5,false),toon(0x343940));
  wire.castShadow=true;planet.add(wire);WORLD_STATS.wires++;return wire;
}

const DISTRICT_GROUND={dispatch:0x91b886,market:0x82b677,shrine:0x548f63,forge:0x789493,dojo:0x7a9e7c,harbor:0x7fa7a0,grove:0x4e8054,lookout:0xaaa997};
function buildDistrictGround(d){
  const radius=Math.max(3.2,d.radius*PLANET_R*.48),seg=48,pos=[],idx=[];
  pos.push(...s2c(d.t,d.p,PLANET_R+.025).toArray());
  for(let i=0;i<=seg;i++){const a=i/seg*TAU,dt=Math.cos(a)*radius/(PLANET_R*Math.max(.25,Math.sin(d.p))),dp=Math.sin(a)*radius/PLANET_R;pos.push(...s2c(d.t+dt,d.p+dp,PLANET_R+.028).toArray());if(i<seg)idx.push(0,i+1,i+2);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();
  const patch=new THREE.Mesh(geo,new THREE.MeshToonMaterial({color:DISTRICT_GROUND[d.id]||0x82a878,gradientMap:toonRamp,transparent:true,opacity:.42,side:THREE.DoubleSide,depthWrite:false}));patch.receiveShadow=true;planet.add(patch);
}

function buildDistrict(d){
  WORLD_STATS.districts++;
  buildDistrictGround(d);
  for(const b of d.buildings||[]){const o=b.offset||[0,0],bt=d.t+o[0],bp=d.p+o[1],bg=building(b.type,bt,bp,b.col,b.roof,b.s||1);
    if(b.rot)bg.rotateY(b.rot);
    // Ghibli "it grew here" imperfection — nothing sits perfectly true
    bg.rotateY((Math.random()-.5)*.09);bg.scale.multiplyScalar(1+(Math.random()-.5)*.045);
    window._ghibliQueue=window._ghibliQueue||[];
    window._ghibliQueue.push({t:bt,p:bp,dt:d.t,dp:d.p,s:b.s||1,realm:realmAt(bt).id,type:b.type});
    WORLD_STATS.buildings++;}
  for(const r of d.roads||[]){const a=r.offset||[0,0],z=r.to||[0,0];buildRoadRibbon(d.t+a[0],d.p+a[1],d.t+z[0],d.p+z[1],r);}
  for(const pr of d.props||[]){const [kind,o,s,rot]=pr;surfaceDetail(kind,d.t+o[0],d.p+o[1],s||1,rot||0);WORLD_STATS.props++;}
  const poleKeys=new Set();
  for(const pair of d.wires||[]){const a=pair[0],b=pair[1];for(const o of[a,b]){const key=o.join(',');if(!poleKeys.has(key)){surfaceDetail('cablePole',d.t+o[0],d.p+o[1],1,0);poleKeys.add(key);}}buildUtilityWire(d.t+a[0],d.p+a[1],d.t+b[0],d.p+b[1]);}
}
function buildDistricts(){
  WORLD_SPEC.districts.forEach(buildDistrict);
  const byId=Object.fromEntries(WORLD_SPEC.districts.map(d=>[d.id,d]));
  [['dispatch','market'],['dispatch','forge'],['forge','harbor'],['market','shrine'],['market','dojo'],['dojo','grove'],['grove','lookout'],['lookout','shrine']].forEach(([a,b],i)=>{
    const x=byId[a],y=byId[b];if(!x||!y)return; // split planets: only link districts that share this globe
    buildRoadRibbon(x.t,x.p,y.t,y.p,{width:1.35,color:i%2?0x657b76:0x5f7471,curve:(i%3-1)*.035,segments:Math.max(18,Math.ceil(Math.hypot(y.t-x.t,y.p-x.p)*PLANET_R/1.5))});
  });
  // env-pack connector roads (registry) — wire new build environments into the network
  if(typeof EXT_LINKS!=='undefined') EXT_LINKS.forEach((lk,i)=>{
    const x=byId[lk.a],y=byId[lk.b];if(!x||!y)return;
    buildRoadRibbon(x.t,x.p,y.t,y.p,Object.assign({width:1.3,color:i%2?0x657b76:0x5f7471,curve:(i%3-1)*.03,
      segments:Math.max(18,Math.ceil(Math.hypot(y.t-x.t,y.p-x.p)*PLANET_R/1.5))},lk.spec||{}));
  });
}


/* ============================================================
   §BOOT VISUALS — tiny-planet hero halo + 3D wrapped title
   (video-aligned: teal radial glow behind the globe, bold
   block-letter title curving across the planet surface)
============================================================ */
var bootHalo=null, titleRing=null;

function _glyphTex(ch){
  const c=document.createElement('canvas');c.width=160;c.height=200;const x=c.getContext('2d');
  x.clearRect(0,0,160,200);
  x.font='800 150px Rajdhani, "Arial Black", system-ui, sans-serif';
  x.textAlign='center';x.textBaseline='middle';
  x.lineJoin='round';x.miterLimit=2;
  // dark ink contour
  x.lineWidth=22;x.strokeStyle='#15171f';x.strokeText(ch,80,108);
  // warm cream fill with a soft top-light gradient
  const g=x.createLinearGradient(0,28,0,184);
  g.addColorStop(0,'#ffffff');g.addColorStop(.55,'#f3ece0');g.addColorStop(1,'#d9cbb6');
  x.fillStyle=g;x.fillText(ch,80,108);
  const t=new THREE.CanvasTexture(c);t.anisotropy=4;t.colorSpace=THREE.SRGBColorSpace;return t;
}

function buildTitleRing(text='KURAMA'){
  titleRing=new THREE.Group();planet.add(titleRing);
  const chars=[...text];
  const lat=Math.PI/2-0.30;            // slightly upper-front band
  const span=1.18;                      // total arc width (radians of longitude) — bold, wraps the front
  const h=3.2, lh=7.4;                  // float height & letter height (world units) — reads big at the hero distance
  const step=span/Math.max(1,chars.length-1);
  chars.forEach((ch,i)=>{
    if(ch.trim()===''){return;}
    const t=-span/2 + i*step + Math.PI*0.5;     // centre the word toward +X/front
    const pos=s2c(t,lat,PLANET_R+h);
    const radialOut=pos.clone().normalize();
    // north-tangent (toward pole) and east-tangent give an upright, outward-facing letter
    const north=new THREE.Vector3(0,1,0).sub(radialOut.clone().multiplyScalar(radialOut.y)).normalize();
    const east=new THREE.Vector3().crossVectors(north,radialOut).normalize();
    const m=new THREE.Matrix4().makeBasis(east,north,radialOut);
    const lw=lh*(160/200);
    const plane=new THREE.Mesh(new THREE.PlaneGeometry(lw,lh),
      new THREE.MeshBasicMaterial({map:_glyphTex(ch),transparent:true,alphaTest:0.18,side:THREE.DoubleSide,depthWrite:true,toneMapped:false}));
    plane.position.copy(pos);plane.quaternion.setFromRotationMatrix(m);
    plane.userData.spin=true;titleRing.add(plane);
  });
  titleRing.visible=true;
}

function buildBootHalo(){
  const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');
  const g=x.createRadialGradient(256,256,30,256,256,256);
  g.addColorStop(0.00,'rgba(150,236,248,0.95)');
  g.addColorStop(0.18,'rgba(86,212,236,0.70)');
  g.addColorStop(0.42,'rgba(44,150,210,0.30)');
  g.addColorStop(0.72,'rgba(20,70,150,0.08)');
  g.addColorStop(1.00,'rgba(8,14,32,0.0)');
  x.fillStyle=g;x.fillRect(0,0,512,512);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
  bootHalo=new THREE.Mesh(new THREE.PlaneGeometry(170,170),
    new THREE.MeshBasicMaterial({map:tex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,toneMapped:false}));
  bootHalo.renderOrder=-5;scene.add(bootHalo);
}

// keep the halo centred behind the planet, always facing the camera (call from idle loop)
function updateBootHalo(){
  if(!bootHalo)return;
  const dir=camera.position.clone().normalize();      // planet sits at origin
  bootHalo.position.copy(dir.multiplyScalar(-120));    // far side of the globe from camera
  bootHalo.lookAt(camera.position);
}
