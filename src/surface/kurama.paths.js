/* === kurama.paths.js — PathSystem v3 + Ghibli lived-in layer ==============
   Authored, walkable trails between district hubs — the structural feature
   that turns the tiny planet from open playground into a directed, scenic
   journey (bridge scene + forest trail references). Provides:
     • createPath()            spline-band trails in (t,p) space, 3 styles
     • Kurama Crossing         arched wooden bridge over the carved ravine,
                               rail + rim capsule walls funnel the crossing
     • forest corridor         tree rows, undergrowth, lanterns, torii
     • PATH_CLEAR(t,p,extra)   keeps ALL scatter off the walkable bands
     • applyPathGuidance()     soft tangential pull toward the trail centre
     • addGhibliPropsAround()  realm-aware, path-biased lived-in props
   Classic script, shared global scope. ==================================== */

const PATHS=[];
const PATH_STYLE={
  dirt:{deck:0xc7a06e,worn:0xd8b98a,edge:0x8f8a80},
  plank:{deck:0x8f6b49,deck2:0xa07a54,rope:0xc49a62,post:0x60442f},
  tech:{deck:0x2b3340,strip:0x3DC9C2,pylon:0x3a4150}
};

function _yawFor(t,p,dir,axis){
  const n=s2c(t,p,1).normalize();
  const q=new THREE.Quaternion().setFromUnitVectors(_up,n);
  const base=new THREE.Vector3(axis==='x'?1:0,0,axis==='x'?0:1).applyQuaternion(q);
  const f=dir.clone().projectOnPlane(n);if(f.lengthSq()<1e-8)return 0;f.normalize();
  return Math.atan2(new THREE.Vector3().crossVectors(base,f).dot(n),base.dot(f));
}

function createPath(spec){
  const {a,b,width=1.7,curve=0,style='dirt',rails=false}=spec;
  const arc=Math.hypot((b.t-a.t)*Math.sin((a.p+b.p)/2),(b.p-a.p))*PLANET_R;
  const segments=Math.max(12,Math.ceil(arc/1.05));
  const S=PATH_STYLE[style]||PATH_STYLE.dirt;
  const sample=u=>({t:THREE.MathUtils.lerp(a.t,b.t,u),p:THREE.MathUtils.lerp(a.p,b.p,u)+Math.sin(u*Math.PI)*curve});
  const path={id:spec.id,name:spec.name,style,width,realm:spec.realm,tp:[],pts:[]};
  for(let i=0;i<=segments;i++){const s=sample(i/segments);path.tp.push(s);path.pts.push(s2c(s.t,s.p,PLANET_R+.05));}

  const group=new THREE.Group();planet.add(group);path.group=group;
  const _tx=pathTexture(style);
  const _texToon=(c)=>{const m=toon(c);m.map=_tx;return m;};
  const deckMat=_texToon(S.deck),wornMat=toon(S.worn||S.deck),edgeMat=toon(S.edge||S.deck);
  const deck2Mat=S.deck2?_texToon(S.deck2):deckMat;
  for(let i=0;i<segments;i++){
    const A=path.tp[i],B=path.tp[i+1],mid={t:(A.t+B.t)/2,p:(A.p+B.p)/2};
    const pa=path.pts[i],pb=path.pts[i+1],len=pa.distanceTo(pb)*1.16,fwd=pb.clone().sub(pa);
    const tile=new THREE.Group();
    if(style==='plank'){
      const n=3,pl=len/n;
      for(let k=0;k<n;k++){const m=new THREE.Mesh(new THREE.BoxGeometry(width+.14,.09,pl*.82),k%2?deck2Mat:deckMat);
        m.position.set(0,.02+((i+k)%2)*.012,-len/2+pl*(k+.5));m.receiveShadow=true;m.castShadow=true;tile.add(m);}
      if(i%2===0)for(const x of[-1,1]){const post=new THREE.Mesh(new THREE.CylinderGeometry(.05,.062,.62,6),toon(S.post));
        post.position.set(x*(width/2+.1),.31,0);post.castShadow=true;tile.add(post);}
      for(const x of[-1,1]){const rope=new THREE.Mesh(new THREE.CylinderGeometry(.024,.024,len,6),toon(S.rope));
        rope.rotation.x=Math.PI/2;rope.position.set(x*(width/2+.1),.55,0);tile.add(rope);}
    }else if(style==='tech'){
      const slab=new THREE.Mesh(new THREE.BoxGeometry(width,.08,len),deckMat);slab.position.y=.01;slab.receiveShadow=true;tile.add(slab);
      const strip=new THREE.Mesh(new THREE.BoxGeometry(.2,.02,len*.9),
        new THREE.MeshBasicMaterial({color:S.strip,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false}));
      strip.position.y=.07;tile.add(strip);
      if(i%2){for(const x of[-1,1]){const dash=new THREE.Mesh(new THREE.BoxGeometry(.07,.018,len*.32),
        new THREE.MeshBasicMaterial({color:0x9B7CF6,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false}));
        dash.position.set(x*(width/2-.14),.06,0);tile.add(dash);}}
      if(i%5===2){const py=new THREE.Mesh(new THREE.CylinderGeometry(.07,.1,1.35,6),toon(S.pylon));
        py.position.set((i%2?1:-1)*(width/2+.42),.68,0);py.castShadow=true;tile.add(py);
        const orb=new THREE.Mesh(new THREE.OctahedronGeometry(.14,0),
          new THREE.MeshBasicMaterial({color:S.strip,transparent:true,opacity:.9,blending:THREE.AdditiveBlending}));
        orb.position.set(py.position.x,1.46,0);tile.add(orb);bobbers.push({m:orb,spinY:1.6});}
    }else{ // dirt — the Ghibli trail language
      const slab=new THREE.Mesh(new THREE.BoxGeometry(width,.07,len),deckMat);slab.position.y=.005;slab.receiveShadow=true;tile.add(slab);
      const worn=new THREE.Mesh(new THREE.BoxGeometry(width*.42,.075,len),wornMat);worn.position.y=.008;worn.receiveShadow=true;tile.add(worn);
      if(i%3===0)for(const x of[-1,1]){const peb=new THREE.Mesh(new THREE.DodecahedronGeometry(.09+Math.random()*.05,0),edgeMat);
        peb.position.set(x*(width/2+.12),.06,(Math.random()-.5)*len*.5);peb.rotation.set(Math.random(),Math.random(),0);tile.add(peb);}
    }
    surfaceFrame(tile,mid.t,mid.p,fwd,.05);group.add(tile);
    if(rails&&i%2===0&&i+2<=segments){
      const na=path.pts[i].clone().normalize(),perp=new THREE.Vector3().crossVectors(na,fwd.clone().normalize()).normalize();
      for(const sgn of[-1,1]){
        const wa=path.pts[i].clone().addScaledVector(perp,sgn*(width/2+.1));
        const wb=path.pts[Math.min(i+2,segments)].clone().addScaledVector(perp,sgn*(width/2+.1));
        wallColliders.push({a:wa,b:wb,radius:.15,label:spec.id+'-rail'});
      }
    }
  }
  PATHS.push(path);WORLD_STATS.paths++;return path;
}

/* ---- global path queries ---- */
const _pcTmp=new THREE.Vector3();
function PATH_CLEAR(t,p,extra=0.9){
  _pcTmp.copy(s2c(t,p,PLANET_R));
  for(const path of PATHS){const lim=(path.width/2+extra);const lim2=lim*lim;
    for(const pt of path.pts)if(_pcTmp.distanceToSquared(pt)<lim2)return false;}
  // keep scatter off the ravine cut as well
  if(typeof RAVINE!=='undefined'){
    const RVX=window.RAVINE_LIVE||RAVINE;
    if(window._verseCarve===false)return true;
    const A=s2c(RVX.a.t,RVX.a.p,PLANET_R),B=s2c(RVX.b.t,RVX.b.p,PLANET_R);
    const AB=B.clone().sub(A),l2=Math.max(1e-8,AB.lengthSq());
    const u=THREE.MathUtils.clamp(_pcTmp.clone().sub(A).dot(AB)/l2,0,1);
    if(_pcTmp.distanceTo(A.addScaledVector(AB,u))<RVX.halfWidth+extra+.5)return false;
  }
  return true;
}
function nearestPathInfo(pos){
  let best=null,bd=1e9;
  for(const path of PATHS)for(const pt of path.pts){const d=pos.distanceToSquared(pt);if(d<bd){bd=d;best=path;}}
  return best?{d:Math.sqrt(bd),path:best}:null;
}
function applyPathGuidance(dt,mv){
  if(!onGround||window._cine||!PATHS.length||!mv||mv.lengthSq()<1e-7)return;
  let bestPt=null,bd=1e9,bw=1.7;
  for(const path of PATHS)for(const pt of path.pts){const d=player.position.distanceToSquared(pt);if(d<bd){bd=d;bestPt=pt;bw=path.width;}}
  if(!bestPt)return;const d=Math.sqrt(bd),inner=bw*.34,outer=bw*2.3;
  if(d<=inner||d>=outer)return;
  const n=player.position.clone().normalize();
  const pull=bestPt.clone().sub(player.position);
  pull.sub(n.multiplyScalar(pull.dot(n)));if(pull.lengthSq()<1e-8)return;pull.normalize();
  const k=1.85*(d-inner)/(outer-inner);
  player.position.addScaledVector(pull,Math.min(k,2.2)*dt);
}

/* ---- Kurama Crossing — arched wooden bridge over the carved ravine ---- */
function buildKuramaBridge(path){
  // locate the sample nearest the ravine centreline
  const RVB=window.RAVINE_LIVE||RAVINE;
  const A=s2c(RVB.a.t,RVB.a.p,PLANET_R),B=s2c(RVB.b.t,RVB.b.p,PLANET_R);
  const AB=B.clone().sub(A),l2=Math.max(1e-8,AB.lengthSq());
  let ci=1,cd=1e9;
  for(let i=1;i<path.pts.length-1;i++){const P=path.pts[i];
    const u=THREE.MathUtils.clamp(P.clone().sub(A).dot(AB)/l2,0,1);
    const d=P.distanceTo(A.clone().addScaledVector(AB,u));if(d<cd){cd=d;ci=i;}}
  const tp=path.tp[ci],fwd=path.pts[Math.min(ci+1,path.pts.length-1)].clone().sub(path.pts[Math.max(ci-1,0)]);
  const span=(RVB.halfWidth+1.05)*2,deckW=path.width+.45;
  const g=new THREE.Group();
  const planks=14;
  for(let k=0;k<planks;k++){
    const z=-span/2+span*(k+.5)/planks,ar=Math.sin((k+.5)/planks*Math.PI)*.36;
    const m=new THREE.Mesh(new THREE.BoxGeometry(deckW,.1,span/planks*.86),toon(k%2?0x8a6242:0x9a7050));
    m.position.set(0,.08+ar,z);m.castShadow=true;m.receiveShadow=true;g.add(m);g.add(outline(m,1.015));
  }
  for(const x of[-1,1]){ // arched side beams
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,span*1.02,7),toon(0x6a4328));
    beam.rotation.x=Math.PI/2;beam.position.set(x*(deckW/2-.05),.06,0);beam.castShadow=true;g.add(beam);
    for(let k=0;k<5;k++){const z=-span/2+span*k/4;
      const post=new THREE.Mesh(new THREE.CylinderGeometry(.055,.065,.86,6),toon(0x6a4328));
      post.position.set(x*(deckW/2+.06),.5+Math.sin(k/4*Math.PI)*.34,z);post.castShadow=true;g.add(post);}
    for(const ry of[.62,.92]){const rail=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,span*1.02,6),toon(0x7d4f30));
      rail.rotation.x=Math.PI/2;rail.position.set(x*(deckW/2+.06),ry+.18,0);g.add(rail);g.add(outline(rail,1.05));}
  }
  surfaceFrame(g,tp.t,tp.p,fwd,.02);g.userData.kind='bridge';
  // rail capsule walls — you cannot fall off the crossing
  const nC=path.pts[ci].clone().normalize(),f=fwd.clone().normalize();
  const perp=new THREE.Vector3().crossVectors(nC,f).normalize();
  for(const sgn of[-1,1]){
    const wa=path.pts[ci].clone().addScaledVector(f,-span/2-.4).addScaledVector(perp,sgn*(deckW/2+.1));
    const wb=path.pts[ci].clone().addScaledVector(f, span/2+.4).addScaledVector(perp,sgn*(deckW/2+.1));
    wallColliders.push({a:wa,b:wb,radius:.18,label:'bridge-rail'});
  }
  // ravine rim walls — funnel every approach to the bridge (gap only at the deck)
  const Dv=AB.clone().normalize(),C=path.pts[ci].clone();
  const ext=v=>v.clone().normalize().multiplyScalar(PLANET_R+.4);
  for(const sgn of[-1,1]){
    const off=perp.clone().multiplyScalar(sgn*(RVB.halfWidth+.55));
    const rimA=ext(A.clone().addScaledVector(Dv,-1.4).add(off)),rimB=ext(B.clone().addScaledVector(Dv,1.4).add(off));
    const gA=ext(C.clone().addScaledVector(Dv,-(deckW/2+1.0)).add(off)),gB=ext(C.clone().addScaledVector(Dv,(deckW/2+1.0)).add(off));
    wallColliders.push({a:rimA,b:gA,radius:.24,label:'ravine-rim'});
    wallColliders.push({a:gB,b:rimB,radius:.24,label:'ravine-rim'});
  }
  // welcoming light at both bridgeheads
  surfaceDetail('paperLantern',path.tp[Math.max(0,ci-3)].t,path.tp[Math.max(0,ci-3)].p,1, Math.random()*TAU);
  surfaceDetail('paperLantern',path.tp[Math.min(path.tp.length-1,ci+3)].t,path.tp[Math.min(path.tp.length-1,ci+3)].p,1,Math.random()*TAU);
  WORLD_STATS.bridges++;return g;
}

/* ---- forest corridor dressing — two loose tree rows frame the trail ---- */
function dressForestCorridor(path){
  const n=path.tp.length,R=PLANET_R;
  for(let i=2;i<n-2;i++){
    const tp=path.tp[i],sinp=Math.max(.25,Math.sin(tp.p));
    const fwd=path.pts[i+1].clone().sub(path.pts[i-1]);
    const yaw=_yawFor(tp.t,tp.p,fwd,'x');
    const lat=(off,ang)=>({t:tp.t+Math.cos(ang)*off/(R*sinp),p:tp.p+Math.sin(ang)*off/R});
    const side=(i%2?1:-1),perpA=yaw+Math.PI/2;
    if(i%2===0){const o=lat(side*(path.width/2+1.05+Math.random()*.85),perpA);
      tree(o.t,o.p,Math.random()<.6?'pine':(Math.random()<.5?'round':'sakura'),.7+Math.random()*.6);}
    if(i%3===1){const o=lat(-side*(path.width/2+.5+Math.random()*.3),perpA);bush(o.t,o.p);}
    if(i%6===2){const o=lat(side*(path.width/2+.55),perpA);surfaceDetail('stoneLantern',o.t,o.p,.95,yaw);WORLD_STATS.props++;}
  }
  for(const u of[2,n-3]){const tp=path.tp[u],fwd=path.pts[Math.min(u+1,n-1)].clone().sub(path.pts[Math.max(u-1,0)]);
    surfaceDetail('toriiGate',tp.t,tp.p,1.05,_yawFor(tp.t,tp.p,fwd,'x'));WORLD_STATS.props++;}
}

/* ============================================================
   GHIBLI LIVED-IN LAYER — auto props around every hub building,
   biased toward the district heart (the "public face"), realm-
   aware kinds, PATH_CLEAR-respecting so trails stay readable.
============================================================ */
const GHIBLI_TABLE={
  shinobi:['pottedPlants','crateStack','signboard','bench','redMailbox','stoneLantern','paperLantern','laundryLine','broom'],
  pirate:['barrelStack','crateStack','lifeRing','signboard','paperLantern','broom','bench'],
  saiyan:['vendingMachine','crateStack','satelliteDish','pottedPlants','cone','roadSign','paperLantern']
};
let GHIBLI_BUDGET=150;
function addGhibliPropsAround(q){
  if(GHIBLI_BUDGET<=0)return;
  const R=PLANET_R,sinp=Math.max(.25,Math.sin(q.p));
  const table=GHIBLI_TABLE[q.realm]||GHIBLI_TABLE.shinobi;
  const a0=Math.atan2((q.dp-q.p)*R,(q.dt-q.t)*R*sinp);       // toward the district heart / path side
  const count=3+Math.floor(Math.random()*3);
  for(let i=0;i<count&&GHIBLI_BUDGET>0;i++){
    let ang=Math.random()*TAU;
    if(Math.random()<.65)ang=a0+(Math.random()-.5)*2.0;       // 65% face the public side
    const dist=(1.45+Math.random()*.95)*Math.max(.8,q.s);
    const t=q.t+Math.cos(ang)*dist/(R*sinp),p=q.p+Math.sin(ang)*dist/R;
    if(!PATH_CLEAR(t,p,0.18))continue;                        // may frame the trail edge, never block it
    const kind=table[Math.floor(Math.random()*table.length)];
    try{surfaceDetail(kind,t,p,.8+Math.random()*.35,Math.random()*TAU);GHIBLI_BUDGET--;WORLD_STATS.ghibli++;}catch(e){}
    if(Math.random()<.22&&GHIBLI_BUDGET>0){                   // clustered pots — very Ghibli
      const ct=q.t+Math.cos(ang)*dist*.55/(R*sinp),cp=q.p+Math.sin(ang)*dist*.55/R;
      if(PATH_CLEAR(ct,cp,0.18)){try{surfaceDetail('pottedPlants',ct,cp,.7,Math.random()*TAU);GHIBLI_BUDGET--;WORLD_STATS.ghibli++;}catch(e){}}
    }
  }
}
function flushGhibliProps(){
  const qq=window._ghibliQueue||[];
  for(const q of qq)addGhibliPropsAround(q);
  window._ghibliQueue=[];
}

/* ---- new lived-in micro props (registry — cel + ink uniform) ---- */
if(typeof registerProp==='function'){
  registerProp('paperLantern',ctx=>{const{add,cy,toon,outline,g}=ctx;
    const pole=add(cy(.03,.038,1.15,6,0x4a3a2c));pole.position.y=.58;
    const arm=add(cy(.02,.02,.34,5,0x4a3a2c));arm.rotation.z=Math.PI/2;arm.position.set(.14,1.12,0);
    const lamp=add(new THREE.Mesh(new THREE.SphereGeometry(.15*ctx.s,10,8),toon(0xFFE9CC,.85)),false);lamp.position.set(.28,.98,0);
    g.add(outline(lamp,1.06));
    const band=add(cy(.155,.155,.03,10,0xc9473f),false);band.position.set(.28,.98,0);
    const L=new THREE.PointLight(0xffcf9e,0,5,2);L.position.set(.28,.98,0);g.add(L);
    if(typeof lanternLights!=='undefined')lanternLights.push(L);
  },.13);
  registerProp('laundryLine',ctx=>{const{add,cy,toon,g}=ctx;
    for(const x of[-.72,.72]){const pole=add(cy(.028,.034,1.2,5,0x5a4632));pole.position.set(x,.6,0);}
    const line=add(cy(.012,.012,1.44,4,0x3a3430),false);line.rotation.z=Math.PI/2;line.position.y=1.12;
    const cols=[0xf2eee2,0x9fc9e1,0xf2b7cf];
    for(let i=0;i<3;i++){const cloth=new THREE.Mesh(new THREE.PlaneGeometry(.3*ctx.s,.4*ctx.s),
      new THREE.MeshToonMaterial({color:cols[i],gradientMap:toonRamp,side:THREE.DoubleSide}));
      cloth.position.set(-.42+i*.42,.9,0);cloth.rotation.y=(Math.random()-.5)*.3;g.add(cloth);}
  },.1);
  registerProp('broom',ctx=>{const{add,cy,cn,g}=ctx;
    const stick=add(cy(.02,.024,1.0,5,0x8a6a42));stick.rotation.z=.32;stick.position.set(.12,.5,0);
    const head=add(cn(.11,.3,7,0xc9a86a));head.position.set(.28,.12,0);head.rotation.z=2.4;
  });
  // trail flora — dense greenery that frames every authored corridor
  registerProp('fern',ctx=>{const{add,cn,g}=ctx;
    for(let i=0;i<5;i++){const a=(i/5)*Math.PI*2;
      const leaf=add(cn(.05,.34+Math.random()*.14,4,0x3f7a44),false);
      leaf.position.set(Math.cos(a)*.07,.16,Math.sin(a)*.07);
      leaf.rotation.set(Math.sin(a)*.85,0,Math.cos(a)*.85);}
  });
  registerProp('wildflower',ctx=>{const{add,cy,g,THREE}=ctx;
    const cols=[0xff9db8,0xffd36d,0xc9a2ff,0xfff0f4];
    for(let i=0;i<3;i++){const st=add(cy(.008,.01,.2+Math.random()*.1,4,0x4d7a46),false);
      st.position.set((Math.random()-.5)*.2,.11,(Math.random()-.5)*.2);
      const bl=new THREE.Mesh(new THREE.SphereGeometry(.035,6,5),
        new THREE.MeshBasicMaterial({color:cols[(Math.random()*cols.length)|0]}));
      bl.position.set(st.position.x,.24,st.position.z);g.add(bl);}
  });
}
function resetGhibliBudget(){GHIBLI_BUDGET=150;}
/* shared canvas textures for trail decks — dirt speckle, plank grain, tech grid */
const _pathTexCache={};
function pathTexture(style){
  if(_pathTexCache[style])return _pathTexCache[style];
  const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d');
  if(style==='plank'){x.fillStyle='#a07a54';x.fillRect(0,0,128,128);
    for(let i=0;i<26;i++){x.strokeStyle=`rgba(60,38,20,${.12+Math.random()*.2})`;x.lineWidth=1+Math.random()*1.6;
      x.beginPath();const y=Math.random()*128;x.moveTo(0,y);
      x.bezierCurveTo(42,y+(Math.random()-.5)*8,86,y+(Math.random()-.5)*8,128,y+(Math.random()-.5)*6);x.stroke();}
    for(let i=0;i<7;i++){x.fillStyle='rgba(50,30,16,.35)';x.beginPath();
      x.ellipse(Math.random()*128,Math.random()*128,2.4,1.4,Math.random()*3,0,7);x.fill();}
  }else if(style==='tech'){x.fillStyle='#2b3340';x.fillRect(0,0,128,128);
    x.strokeStyle='rgba(61,201,194,.20)';x.lineWidth=1;
    for(let i=0;i<=8;i++){x.beginPath();x.moveTo(i*16,0);x.lineTo(i*16,128);x.stroke();
      x.beginPath();x.moveTo(0,i*16);x.lineTo(128,i*16);x.stroke();}
    x.fillStyle='rgba(155,124,246,.5)';
    for(let i=0;i<9;i++)x.fillRect(Math.random()*120,Math.random()*120,5,2);
  }else{x.fillStyle='#c7a06e';x.fillRect(0,0,128,128);
    for(let i=0;i<420;i++){x.fillStyle=`rgba(${90+Math.random()*70|0},${64+Math.random()*46|0},${30+Math.random()*26|0},${.1+Math.random()*.25})`;
      const s=1+Math.random()*2.2;x.fillRect(Math.random()*128,Math.random()*128,s,s);}
    for(let i=0;i<8;i++){x.strokeStyle='rgba(120,96,62,.28)';x.lineWidth=2;
      x.beginPath();x.arc(Math.random()*128,Math.random()*128,4+Math.random()*7,0,7);x.stroke();}}
  const tx=new THREE.CanvasTexture(cv);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;
  tx.colorSpace=THREE.SRGBColorSpace;_pathTexCache[style]=tx;return tx;
}
/* flora dressing pass — bushes, ferns and wildflowers flanking a trail */
function dressTrailFlora(path){
  const n=path.tp.length,R=PLANET_R,half=path.width/2;
  for(let i=1;i<n-1;i++){
    const tp=path.tp[i],sinp=Math.max(.25,Math.sin(tp.p));
    const fwd=path.pts[i+1].clone().sub(path.pts[i-1]);
    const yaw=_yawFor(tp.t,tp.p,fwd,'x'),perpA=yaw+Math.PI/2;
    const lat=(off)=>({t:tp.t+Math.cos(perpA)*off/(R*sinp),p:tp.p+Math.sin(perpA)*off/R});
    const side=(i%2?1:-1);
    if(i%2===0){const o=lat(side*(half+0.5+Math.random()*.5));
      try{surfaceDetail('fern',o.t,o.p,.8+Math.random()*.5,Math.random()*TAU);WORLD_STATS.flora++;}catch(e){}}
    if(i%3===0){const o=lat(-side*(half+0.65+Math.random()*.55));
      try{surfaceDetail('wildflower',o.t,o.p,.9,Math.random()*TAU);WORLD_STATS.flora++;}catch(e){}}
    if(i%4===1&&typeof bush==='function'){const o=lat(side*(half+0.9+Math.random()*.7));
      try{bush(o.t,o.p);WORLD_STATS.flora++;}catch(e){}}
  }
}

/* ============================================================
   AUTHORED TRAIL NETWORK — one flagship per realm + the crossing
============================================================ */
function buildPathNetwork(){
  // 1 · Shinobi — Kurama Crossing trail: Shrine Grove → Hidden Leaf, over the ravine
  const p1=createPath({id:'kurama-crossing',name:'Kurama Crossing',realm:'shinobi',
    a:{t:Math.PI/2,p:Math.PI/3},b:{t:1.7,p:Math.PI/2+0.18},width:1.7,curve:.045,style:'dirt'});
  buildKuramaBridge(p1);
  // 2 · Shinobi — Lantern Wood: Hidden Leaf → Matsuri Grounds forest corridor
  const p2=createPath({id:'lantern-wood',name:'Lantern Wood Trail',realm:'shinobi',
    a:{t:1.7,p:Math.PI/2+0.18},b:{t:2.0,p:Math.PI/2+0.46},width:1.6,curve:-.05,style:'dirt'});
  dressForestCorridor(p2);
  // 3 · Pirate — Grand Plankway: Coastal Boardwalk → Elbaf Causeway, rope-railed
  const p3=createPath({id:'grand-plankway',name:'Grand Plankway',realm:'pirate',
    a:{t:-2.25,p:Math.PI/2+0.48},b:{t:4.25-TAU,p:Math.PI/2+0.28},width:1.8,curve:.03,style:'plank',rails:true});
  surfaceDetail('barrelStack',p3.tp[1].t,p3.tp[1].p+.09,1,0.4);
  surfaceDetail('lifeRing',p3.tp[p3.tp.length-2].t,p3.tp[p3.tp.length-2].p-.08,1,0);
  // 4 · Saiyan — Capsule Energy Lane: Capsule Forge → Harbor of Horizons
  const p4=createPath({id:'capsule-lane',name:'Capsule Energy Lane',realm:'saiyan',
    a:{t:-.82,p:Math.PI/2+.13},b:{t:-Math.PI/2,p:Math.PI/2+.42},width:1.7,curve:-.04,style:'tech'});
  surfaceDetail('pipeRig',p4.tp[2].t,p4.tp[2].p-.1,1,.4);
  surfaceDetail('energyRing',p4.tp[p4.tp.length-3].t,p4.tp[p4.tp.length-3].p-.08,.9,0);
  // lived-in pass now that trails exist (props frame, never block)
  flushGhibliProps();
  window.PathSystem={list:()=>PATHS.map(p=>({id:p.id,name:p.name,style:p.style,realm:p.realm,points:p.pts.length})),
    count:PATHS.length,clear:PATH_CLEAR};
}
