/* === Kurama · Quasar Horizon — flattened module (classic script, shared global scope). THREE + postprocessing provided as globals by the boot shim in index.html. === */
/* ============================================================
   INIT + BOOT + LOOP
============================================================ */
const bb=document.getElementById('bootbar'),bg=document.getElementById('bootgo'),bs=document.getElementById('bootstat');
const BOOTMSG=['Spinning up accretion…','Aligning photon rim…','Seeding the horizon…','Placing couriers…','Scattering shards…','Horizon ready.'];
function boot(p,msg){bb.style.right=(100-Math.min(p,100))+'%';if(msg)bs.textContent=msg;if(p>=100){bg.classList.add('show');}}

async function init(){
  boot(5,BOOTMSG[0]);
  scene=new THREE.Scene();scene.background=new THREE.Color(0x05060f);scene.fog=new THREE.Fog(0x05060f,55,260);
  camera=new THREE.PerspectiveCamera(52,innerWidth/innerHeight,0.1,3000);camera.position.set(0,PLANET_R+50,40);
  renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.14;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  document.body.insertBefore(renderer.domElement,document.body.firstChild);
  toonRamp=makeRamp();boot(15,BOOTMSG[1]);

  // lights
  ambLight=new THREE.AmbientLight(0xffffff,0.32);scene.add(ambLight);
  hemiLight=new THREE.HemisphereLight(0xbfe0ff,0x33402e,0.22);scene.add(hemiLight);
  sunLight=new THREE.DirectionalLight(0xfff0dc,1.7);sunLight.position.set(120,80,40);
  sunLight.castShadow=true;sunLight.shadow.mapSize.set(2048,2048);
  const sc=sunLight.shadow.camera;sc.near=40;sc.far=320;sc.left=sc.bottom=-46;sc.right=sc.top=46;
  sunLight.shadow.bias=-0.0004;scene.add(sunLight);scene.add(sunLight.target);

  // quasar sky rig (quasar + ties to sun direction)
  skyRig=new THREE.Group();scene.add(skyRig);
  quasar=buildQuasar();quasar.scale.setScalar(1.0);skyRig.add(quasar);
  starfield=buildStars();scene.add(starfield);
  buildSkyDome();
  boot(28,BOOTMSG[2]);

  buildPlanet();buildBeacon();buildBootHalo();buildTitleRing('KURAMA');boot(48,BOOTMSG[3]);
  buildWorld();
  agents=NPCS.map(makeAgent);boot(70,BOOTMSG[4]);
  makePlayer();
  makeShards();buildSwitch();boot(85,BOOTMSG[5]);

  composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  bloomPass=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.24,0.35,0.9);
  composer.addPass(bloomPass);
  inkPass=new ShaderPass(AnimeInkShader);inkPass.uniforms.resolution.value.set(1/innerWidth,1/innerHeight);composer.addPass(inkPass);
  composer.addPass(new OutputPass());

  setupInput();

  // restore save
  const s=await load();
  if(s){
    if(Number.isInteger(s.char)&&ROSTER[s.char])curChar=s.char;
    if(Number.isInteger(s.deliver))deliverIdx=Math.min(s.deliver,TOTAL);
    if(Array.isArray(s.done))doneSet=new Set(s.done);
    if(Number.isInteger(s.shards))shardCount=s.shards;
    if(typeof s.audio==='boolean')audioOn=s.audio;
    if(Number.isInteger(s.bloom))bloomLevel=s.bloom;
    if(Number.isInteger(s.day))dayLevel=s.day;
    carrying=!!s.carrying;giverSlot=s.giverSlot??0;targetSlot=s.targetSlot??1;
  }
  applyChar();syncSwitch();syncMeters();
  document.getElementById('setAudio').textContent=audioOn?'ON':'OFF';
  document.getElementById('setBloom').textContent=['Low','Medium','High'][bloomLevel];
  document.getElementById('setDay').textContent=['Slow','Normal','Fast'][dayLevel];
  document.getElementById('dcount').textContent=`${Math.min(deliverIdx,TOTAL)} / ${TOTAL}`;
  if(carrying)setBeacon(targetSlot);

  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);if(inkPass)inkPass.uniforms.resolution.value.set(1/innerWidth,1/innerHeight);});
  const qa=Game.selfTest();document.body.dataset.qa=qa.pass?'pass':'fail';document.body.dataset.world=JSON.stringify(qa.diagnostics.world);
  boot(100);
}

function updateParticles(dt){
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];
    if(p.userData.dust){p.userData.life+=dt;p.position.add(p.userData.up.clone().multiplyScalar(dt*0.6));
      p.material.opacity=Math.max(0,0.4-p.userData.life*0.9);p.scale.multiplyScalar(1+dt*1.5);
      if(p.userData.life>0.5){scene.remove(p);p.geometry.dispose();p.material.dispose();particles.splice(i,1);}continue;}
    if(p.userData.fall!==undefined){p.position.y-=p.userData.fall*dt;p.position.x+=Math.sin(clock.elapsedTime*p.userData.sway)*0.04*dt;
      p.rotation.z+=dt*2;if(p.position.y<0){p.position.y=p.userData.sy;p.position.x=(Math.random()-0.5)*1.2;}}
  }
}
function updateLoc(){
  const pp=player.position.clone().normalize();let best='Open Horizon',bestId='open',bd=.34;
  for(const d of WORLD_SPEC.districts){const dd=pp.distanceTo(s2c(d.t,d.p,1));if(dd<Math.min(bd,d.radius||.3)){bd=dd;best=d.name;bestId=d.id;}}
  for(const ag of agents){const dd=pp.distanceTo(s2c(ag.t,ag.p,1));if(dd<.055){best=ag.loc;bestId='npc-'+ag.slot;}}
  if(bestId!==currentDistrict){currentDistrict=bestId;if(bestId!=='open')banner('Entering District',best);}
  document.getElementById('loc').textContent=best;
}

function updateBeacon(dt){
  // beacon always marks the active node: the giver when empty-handed, the recipient when carrying
  let slot=-1;if(deliverIdx<TOTAL)slot=carrying?targetSlot:giverSlot;
  const ag=agents.find(a=>a.slot===slot);
  if(!ag){beacon.visible=false;return;}
  if(ag.offworld&&window.WormholeGate){placeOn(beacon,WormholeGate.t,WormholeGate.p,0);}
  else placeOn(beacon,ag.t,ag.p,0);
  beacon.visible=true;
  const col=carrying?PAL.crimson:PAL.gold;
  beacon.children.forEach(c=>{
    if(c.userData.beam){c.material.color.setHex(carrying?PAL.hot:0xFFE4B8);c.material.opacity=0.2+Math.sin(clock.elapsedTime*2.5)*0.1;}
    if(c.userData.ring){c.material.color.setHex(col);c.scale.setScalar(1+Math.sin(clock.elapsedTime*2)*0.12);c.rotation.z+=dt*0.6;}});
}

function victory(){
  document.getElementById('winText').textContent=`The six legs are walked, the core shard returned. The accretion settles to a calm shear and the nine tails glow at the hall. The Quasar Horizon turns easy tonight — because you kept the light moving.`;
  document.getElementById('winStat').textContent=`${shardCount}/${SHARD_GOAL} photon shards gathered`;
  document.getElementById('win').classList.add('show');
}

function loop(){
  requestAnimationFrame(loop);
  const dt=Math.min(clock.getDelta(),0.05);
  if(window._transitTick){window._transitTick(dt);return;}
  if(gameOn){
    updatePlayer(dt);if(!window._cine)updateCam(dt);else if(window._cineTick)window._cineTick(dt);updateAgents(dt);updateShards(dt);
    updateDayNight(dt);updateParticles(dt);updateChakra(dt);updateArrow();updateBeacon(dt);updateLoc();if(typeof updateRealms==='function')updateRealms(dt);if(typeof updateSocialGems==='function')updateSocialGems(dt);
    if(typeof updateWormhole==='function')updateWormhole(dt);if(typeof updateLoqi==='function')updateLoqi(dt);
    // update environmental animations and interactions
    updateBobbers(dt);
    updateLandmarks(dt);
    updateVillagers(dt);
    updateClouds(dt);
    updateBirds(dt);
    if(Math.floor(clock.elapsedTime*4)%2===0)updateMini();
    readPad();
  }else{
    idleCam();updateBootHalo();
    if(bootHalo)bootHalo.visible=true;if(titleRing)titleRing.visible=true;
    if(quasar){quasar.traverse(o=>{if(o.userData&&o.userData.faceCam)o.lookAt(camera.position);});
      const rd=quasar.userData;if(rd&&rd.rings)rd.rings.forEach(r=>r.piv.rotation.y+=r.omega*dt);}
    if(skyRig)skyRig.position.set(0,140,-300);
    if(starfield)starfield.material.opacity=0.7;
  }
  composer.render();
}

bg.addEventListener('click',()=>{
  initAudio();gameOn=true;intro=0;
  document.getElementById('boot').classList.add('gone');
  if(bootHalo)bootHalo.visible=false;if(titleRing)titleRing.visible=false;
  document.getElementById('ui').classList.add('live');
  setTimeout(()=>{document.getElementById('boot').style.display='none';},1200);
  // ensure starting delivery is set up if fresh
  if(deliverIdx<TOTAL && !carrying){giverSlot=CHAIN[deliverIdx].from;targetSlot=CHAIN[deliverIdx].to;}
  if(carrying)banner('Active Dispatch',CHAIN[deliverIdx]?.line||'Follow the marked route.');
  else if(deliverIdx<TOTAL)banner(deliverIdx===0?'First Dispatch':'Next Dispatch','Speak to the marked courier to receive the next parcel.');
  else banner('Horizon Synced','Every dispatch leg is complete.');
  save();
});

/* ============================================================
   §EXP  WORLD EXPANSION — detail parts, landmarks, biomes,
   instanced grass, bushes, clouds, birds, roaming villagers.
   (Harvested from the KLAWDCHAKRA RTS, refit to the globe.)
============================================================ */
function thatchRoofG(g,radius,baseY,height,col){
  const layers=Math.max(3,Math.round(radius*1.5));let r=radius,y=baseY,lh=height/layers*1.6;
  for(let i=0;i<layers;i++){const cn=new THREE.Mesh(new THREE.ConeGeometry(r,lh,Math.max(8,Math.round(radius*4))),toon(col));
    cn.castShadow=true;cn.position.set(0,y+lh*0.5,0);g.add(cn);r*=0.8;y+=lh*0.42;}
}
function stonePillarsG(g,ringR,count){
  for(let i=0;i<count;i++){const a=i/count*TAU;const m=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.26,0.9+Math.random()*0.6,5),toon(0x9a958c));
    m.castShadow=true;m.receiveShadow=true;m.position.set(Math.cos(a)*ringR,0.5+Math.random()*0.3,Math.sin(a)*ringR);m.rotation.y=Math.random()*3;g.add(m);}
}
function bannerG(g,col,x,z,h){h=h||2.6;const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,h,5),toon(0x3a2c1c));pole.position.set(x,h/2,z);pole.castShadow=true;g.add(pole);
  const flag=new THREE.Mesh(new THREE.PlaneGeometry(0.8,0.55),new THREE.MeshToonMaterial({color:new THREE.Color(col),gradientMap:toonRamp,emissive:new THREE.Color(col),emissiveIntensity:0.35,side:THREE.DoubleSide}));
  flag.position.set(x+0.45,h-0.4,z);g.add(flag);}
function pagodaG(g,levels,baseW,baseH,topY,wall,roof){let w=baseW,y=topY;
  for(let i=0;i<levels;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(w,baseH,w),toon(wall));b.position.y=y+baseH/2;b.castShadow=true;b.receiveShadow=true;g.add(b);g.add(outline(b,1.03));
    const rf=new THREE.Mesh(new THREE.ConeGeometry(w*0.95,baseH*0.9,4),toon(roof));rf.rotation.y=Math.PI/4;rf.position.y=y+baseH+baseH*0.35;rf.castShadow=true;g.add(rf);g.add(outline(rf,1.03));
    y+=baseH+baseH*0.55;w*=0.74;}return y;}

/* ---- biome zones (matches the planet vertex tint) ---- */
function biomeAt(t,p){
  const ny=Math.cos(p);                      // +1 north pole .. -1 south pole
  if(Math.abs(ny)>0.82)return 'snow';
  const tn=((t%TAU)+TAU)%TAU;
  if(tn>2.45&&tn<3.95&&Math.abs(ny)<0.5)return 'wastes';
  const lat=Math.asin(ny);
  if(lat<-0.5)return 'coast';
  return 'forest';
}

/* ---- biome scatter pieces ---- */
function spireTree(t,p){const g=new THREE.Group();const c=new THREE.Mesh(new THREE.ConeGeometry(0.42,1.8+Math.random()*0.9,5),toon(0x8a5a3a));c.position.y=1.0;c.castShadow=true;g.add(c);g.add(outline(c,1.04));
  const gem=new THREE.Mesh(new THREE.OctahedronGeometry(0.18,0),new THREE.MeshBasicMaterial({color:PAL.ember}));gem.position.y=2.0;g.add(gem);
  placeOn(g,t,p,0);planet.add(g);}
function redRock(t,p){const g=new THREE.Group();const r=0.2+Math.random()*0.35;const m=new THREE.Mesh(new THREE.DodecahedronGeometry(r,0),toon(0x8a4a2a));m.position.y=r*0.5;m.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3);m.castShadow=true;m.receiveShadow=true;g.add(m);g.add(outline(m,1.05));placeOn(g,t,p,0);planet.add(g);}
function snowRock(t,p){const g=new THREE.Group();const r=0.2+Math.random()*0.3;const m=new THREE.Mesh(new THREE.DodecahedronGeometry(r,0),toon(0xbcc4cc));m.position.y=r*0.5;m.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3);m.castShadow=true;g.add(m);g.add(outline(m,1.05));
  const cap=new THREE.Mesh(new THREE.SphereGeometry(r*0.72,8,6,0,TAU,0,Math.PI*0.5),toon(0xffffff));cap.position.y=r*0.85;g.add(cap);placeOn(g,t,p,0);planet.add(g);}
function bush(t,p){const g=new THREE.Group();for(let i=0;i<4;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(0.25+Math.random()*0.2,14,9),toon(i%2?0x4f7a46:0x679a55));s.position.set((Math.random()-0.5)*0.58,0.22+Math.random()*0.2,(Math.random()-0.5)*0.5);s.scale.y=.78;s.castShadow=true;g.add(s);g.add(outline(s,1.018));}placeOn(g,t,p,0);planet.add(g);}

/* ---- resource landmarks (discoverable) ---- */
function landmark(kind,t,p){
  const g=new THREE.Group();let give='chakra',label='Landmark';
  if(kind==='chakraPool'){label='Chakra Spring';give='chakra';
    const pool=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,0.18,22),new THREE.MeshToonMaterial({color:0x0c2f3e,gradientMap:toonRamp,emissive:new THREE.Color(0x12909f),emissiveIntensity:0.7,transparent:true,opacity:0.9}));pool.position.y=0.1;g.add(pool);
    const gem=new THREE.Mesh(new THREE.OctahedronGeometry(0.55,0),new THREE.MeshBasicMaterial({color:0x66cfff}));gem.position.y=1.2;g.add(gem);bobbers.push({m:gem,bob:1.2});
    const glow=new THREE.Mesh(new THREE.OctahedronGeometry(0.85,0),new THREE.MeshBasicMaterial({color:0x46b3ff,transparent:true,opacity:0.3,blending:THREE.AdditiveBlending,depthWrite:false}));glow.position.y=1.2;g.add(glow);bobbers.push({m:glow,bob:1.2});
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1.25,0.06,8,28),new THREE.MeshBasicMaterial({color:0x46b3ff,transparent:true,opacity:0.7,blending:THREE.AdditiveBlending,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=0.3;g.add(ring);bobbers.push({m:ring,spinY:0.5});
    stonePillarsG(g,1.7,5);
  } else if(kind==='dataCrystals'){label='Data Cache';give='shards';
    for(let i=0;i<7;i++){const o=new THREE.Mesh(new THREE.OctahedronGeometry(0.3+Math.random()*0.4,0),new THREE.MeshBasicMaterial({color:0x00e0c8}));
      o.position.set((Math.random()-0.5)*2.4,0.4+Math.random()*1.4,(Math.random()-0.5)*2.4);g.add(o);bobbers.push({m:o,spinY:1.2});
      const gl=new THREE.Mesh(new THREE.OctahedronGeometry(0.5,0),new THREE.MeshBasicMaterial({color:0x00e0c8,transparent:true,opacity:0.25,blending:THREE.AdditiveBlending,depthWrite:false}));gl.position.copy(o.position);g.add(gl);}
  } else if(kind==='ryoVein'){label='Ryō Vein';give='shards';
    [[0,0.5,0,0.9],[0.9,0.35,0.3,0.6],[-0.7,0.3,-0.4,0.55]].forEach(b=>{const rk=new THREE.Mesh(new THREE.DodecahedronGeometry(b[3],0),toon(0x9a958c));rk.position.set(b[0],b[1],b[2]);rk.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3);rk.castShadow=true;g.add(rk);
      for(let v=0;v<3;v++){const vein=new THREE.Mesh(new THREE.BoxGeometry(0.3+Math.random()*0.4,0.05,0.05),new THREE.MeshBasicMaterial({color:0xffd95c}));vein.position.set(b[0]+(Math.random()-0.5),b[1]+Math.random()*0.4,b[2]+b[3]*0.6);vein.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3);g.add(vein);}});
  } else if(kind==='scrollStones'){label='Scroll Henge';give='both';
    for(let i=0;i<4;i++){const a=i/4*TAU;const c=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.28,1.2+Math.random()*0.8,7),toon(0x9a958c));c.position.set(Math.cos(a)*1.1,0.8,Math.sin(a)*1.1);c.castShadow=true;g.add(c);}
    const scr=new THREE.Mesh(new THREE.OctahedronGeometry(0.45,0),new THREE.MeshBasicMaterial({color:0xd8a0ff}));scr.position.y=1.6;g.add(scr);bobbers.push({m:scr,bob:1.6});
   } else if(kind==='cropField'){label='Courier Crop Fields';give='both';
    const fld=new THREE.Mesh(new THREE.PlaneGeometry(3.4,3.4),new THREE.MeshToonMaterial({color:0x8fb24a,gradientMap:toonRamp}));
    fld.rotation.x=-Math.PI/2;fld.position.y=0.02;fld.receiveShadow=true;g.add(fld);
    for(let rx=-2;rx<=2;rx++){
      for(let cz=-1;cz<=1;cz++){
        const crop=new THREE.Mesh(new THREE.ConeGeometry(0.13,0.52,5),toon((rx+cz)%2?0x7ec24a:0x6fa544));
        crop.position.set(rx*0.46,0.28,cz*0.68);crop.castShadow=true;crop.receiveShadow=true;g.add(crop);
      }
    }
    const scare=new THREE.Group();
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.04,1.1,5),toon(0x6d4b2a));pole.position.y=0.55;scare.add(pole);
    const arm=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.06,0.06),toon(0x6d4b2a));arm.position.y=0.9;scare.add(arm);
    const hat=new THREE.Mesh(new THREE.ConeGeometry(0.18,0.18,5),toon(0xd8b96a));hat.position.y=1.18;scare.add(hat);
    scare.position.set(-1.2,0,1.0);g.add(scare);
    const shed=new THREE.Mesh(new THREE.BoxGeometry(0.78,0.78,0.78),toon(0xb0a090));shed.position.set(1.35,0.39,1.25);g.add(shed);g.add(outline(shed,1.05));
  }
  placeOn(g,t,p,0);planet.add(g);
  landmarks.push({group:g,t,p,kind,give,label,discovered:false});
  TOTAL_LM=landmarks.length;return g;
}

/* ---- instanced grass ---- */
function buildGrass(){
  const blade=new THREE.ConeGeometry(0.045,0.42,3);
  const gm=new THREE.MeshToonMaterial({color:0x5a8a3a,gradientMap:toonRamp});
  const N=1100,im=new THREE.InstancedMesh(blade,gm,N),dummy=new THREE.Object3D();let c=0;
  for(let i=0;i<N;i++){const t=Math.random()*TAU,p=0.3+Math.random()*2.4,b=biomeAt(t,p);
    if(b==='wastes'||b==='snow')continue;
    const pos=s2c(t,p,PLANET_R);dummy.position.copy(pos).add(pos.clone().normalize().multiplyScalar(0.2));
    dummy.quaternion.setFromUnitVectors(_up,pos.clone().normalize());dummy.scale.setScalar(0.55+Math.random()*0.85);dummy.updateMatrix();im.setMatrixAt(c++,dummy.matrix);}
  im.count=c;im.castShadow=false;im.receiveShadow=true;planet.add(im);
}

/* ---- painterly anime clouds + birds ---- */
let animeCloudTexture;
function makeAnimeCloudTexture(){
  const c=document.createElement('canvas');c.width=512;c.height=192;const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);
  x.beginPath();x.moveTo(44,130);x.bezierCurveTo(60,92,102,88,132,103);x.bezierCurveTo(143,49,210,39,242,83);x.bezierCurveTo(277,35,347,52,354,96);x.bezierCurveTo(402,73,456,91,470,130);x.bezierCurveTo(376,150,145,153,44,130);x.closePath();
  x.fillStyle='#d8f0e9';x.strokeStyle='#5f8f8d';x.lineWidth=7;x.lineJoin='round';x.fill();x.stroke();
  x.globalAlpha=.5;x.fillStyle='#f5fff9';x.beginPath();x.ellipse(230,78,112,30,-.08,0,TAU);x.fill();return new THREE.CanvasTexture(c);
}
function buildClouds(n){
  animeCloudTexture=animeCloudTexture||makeAnimeCloudTexture();
  for(let i=0;i<n;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:animeCloudTexture,transparent:true,opacity:.78,depthWrite:false,color:i%3?0xffffff:0xd8fff1}));
    sp.scale.set(10+Math.random()*13,3.8+Math.random()*3.5,1);const t=Math.random()*TAU,p=.3+Math.random()*2.4,r=PLANET_R+14+Math.random()*12;sp.position.copy(s2c(t,p,r));
    clouds.push({group:sp,sprite:true,t,p,r,spd:.004+Math.random()*.008});scene.add(sp);}}
function buildBirds(n){for(let i=0;i<n;i++){const b=new THREE.Group();
  const body=new THREE.Mesh(new THREE.ConeGeometry(0.1,0.42,4),new THREE.MeshBasicMaterial({color:0x2a2a38}));body.rotation.x=Math.PI/2;b.add(body);
  for(const sgn of[-1,1]){const w=new THREE.Mesh(new THREE.PlaneGeometry(0.46,0.16),new THREE.MeshBasicMaterial({color:0x3a3a4a,side:THREE.DoubleSide}));w.position.x=sgn*0.26;w.userData.wing=sgn;b.add(w);}
  birds.push({group:b,t:Math.random()*TAU,p:0.5+Math.random()*1.8,r:PLANET_R+6+Math.random()*4,spd:0.28+Math.random()*0.3,flap:Math.random()*10});scene.add(b);}}

/* ---- roaming villager NPCs ---- */
function buildVillagers(n){
  const cast=(window._verse?ROSTER.filter(c=>c.realm===window._verse):ROSTER);
  for(let i=0;i<n;i++){const cfg=cast[Math.floor(Math.random()*cast.length)]||ROSTER[0];
  const t=Math.random()*TAU,p=0.45+Math.random()*2.1;
  const m=charModel(cfg,0.78+Math.random()*0.18,_realmTint(cfg.accent,t,0.4)),g=new THREE.Group();g.add(m);
  g.position.copy(s2c(t,p,PLANET_R));g.quaternion.setFromUnitVectors(_up,g.position.clone().normalize());planet.add(g);
  villagers.push({group:g,model:m,t,p,dir:Math.random()*TAU,spd:0.16+Math.random()*0.22,wt:Math.random()*4,anim:Math.random()*10});}}

/* ============================================================
   §EXP UPDATES
============================================================ */
function updateBobbers(dt){const e=clock.elapsedTime;for(const b of bobbers){
  if(b.bob!==undefined)b.m.position.y=b.bob+Math.sin(e*2+b.m.id*0.1)*(b.amp||0.12);
  if(b.spinY!==undefined)b.m.rotation.y+=dt*b.spinY;
  if(b.spinZ!==undefined)b.m.rotation.z+=dt*b.spinZ;}}

function updateLandmarks(dt){
  for(const lm of landmarks){
    if(lm.discovered)continue;
    const wp=new THREE.Vector3();lm.group.getWorldPosition(wp);
    if(player.position.distanceTo(wp)<3.0){
      lm.discovered=true;discoveredCount++;
      if(lm.give==='chakra'){chakra=Math.min(100,chakra+18);}
      else if(lm.give==='shards'){shardCount=Math.min(SHARD_GOAL,shardCount+3);}
      else{chakra=Math.min(100,chakra+10);shardCount=Math.min(SHARD_GOAL,shardCount+2);}
      syncMeters();sfx.deliver();popMark('🗺',wp.clone().add(wp.clone().normalize().multiplyScalar(2)));
      banner('Landmark Discovered',lm.label+' — the Horizon remembers this place.');
      document.getElementById('disc').textContent=`${discoveredCount} / ${TOTAL_LM}`;save();
    }
  }
}

function updateVillagers(dt){
  for(const v of villagers){
    v.wt-=dt;if(v.wt<=0){v.dir+=(Math.random()-0.5)*1.6;v.wt=2+Math.random()*4;}
    const step=v.spd*dt, sinp=Math.max(0.18,Math.sin(v.p));
    v.t+=Math.cos(v.dir)*step/sinp;
    v.p+=Math.sin(v.dir)*step;
    if(v.p<0.2){v.p=0.2;v.dir=-v.dir;}if(v.p>Math.PI-0.2){v.p=Math.PI-0.2;v.dir=-v.dir;}
    const pos=s2c(v.t,v.p,PLANET_R);v.group.position.copy(pos);
    const nrm=pos.clone().normalize();
    const ahead=s2c(v.t+Math.cos(v.dir)*0.03/sinp,v.p+Math.sin(v.dir)*0.03,PLANET_R).sub(pos);
    if(ahead.lengthSq()>1e-7){const lr=new THREE.Vector3().crossVectors(nrm,ahead.clone().normalize()).normalize();
      const cf=new THREE.Vector3().crossVectors(lr,nrm).normalize();
      v.group.quaternion.slerp(new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(lr,nrm,cf)),7*dt);}
    v.anim+=dt*8;animateChar(v.model,v.anim,true);
  }
}
function updateClouds(dt){for(const c of clouds){c.t+=c.spd*dt;const pos=s2c(c.t,c.p,c.r);c.group.position.copy(pos);if(!c.sprite)c.group.quaternion.setFromUnitVectors(_up,pos.clone().normalize());}}
function updateBirds(dt){for(const bd of birds){bd.t+=bd.spd*dt;bd.flap+=dt*12;
  const pos=s2c(bd.t,bd.p,bd.r);bd.group.position.copy(pos);const nrm=pos.clone().normalize();
  const ahead=s2c(bd.t+0.02,bd.p,bd.r).sub(pos);const lr=new THREE.Vector3().crossVectors(nrm,ahead.clone().normalize()).normalize();
  const cf=new THREE.Vector3().crossVectors(lr,nrm).normalize();
  bd.group.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(lr,nrm,cf.negate()));
  bd.group.children.forEach(c=>{if(c.userData.wing)c.rotation.z=Math.sin(bd.flap)*0.6*c.userData.wing;});}}

