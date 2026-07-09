/* === Kurama · Quasar Horizon — flattened module (classic script, shared global scope). THREE + postprocessing provided as globals by the boot shim in index.html. === */

/* ============================================================
   CAMERA (+ cinematic intro fly-in)
============================================================ */
function cycleCamera(){
  cameraMode=cameraMode==='follow'?'orbit':cameraMode==='orbit'?'poster':'follow';
  document.getElementById('camMode').textContent=cameraMode[0].toUpperCase()+cameraMode.slice(1);
  banner('Camera Mode',cameraMode==='follow'?'Ground-level courier follow':cameraMode==='orbit'?'Tactical orbit view':'Tiny-planet poster view');
}
function updateCam(dt){
  const pPos=player.position.clone(),norm=pPos.clone().normalize();
  const t1=new THREE.Vector3().crossVectors(norm,new THREE.Vector3(0,1,0));if(t1.lengthSq()<.001)t1.crossVectors(norm,new THREE.Vector3(1,0,0));t1.normalize();
  const t2=new THREE.Vector3().crossVectors(norm,t1).normalize();
  const dist=cameraMode==='follow'?4.65:cameraMode==='orbit'?8.2:26;
  const height=cameraMode==='follow'?1.12:cameraMode==='orbit'?3.9:18;
  const pitchBoost=cameraMode==='follow'?1.15:cameraMode==='orbit'?2.8:6;
  let offset;
  if(cameraMode==='follow'){
    const back=facingDir.clone().projectOnPlane(norm).normalize().negate().applyAxisAngle(norm,camYaw);
    offset=back.multiplyScalar(dist*Math.cos(camPitch)).add(norm.clone().multiplyScalar(height+Math.sin(camPitch)*pitchBoost));
  }else{
    offset=t1.clone().multiplyScalar(Math.sin(camYaw)*dist*Math.cos(camPitch))
      .add(t2.clone().multiplyScalar(Math.cos(camYaw)*dist*Math.cos(camPitch)))
      .add(norm.clone().multiplyScalar(height+Math.sin(camPitch)*pitchBoost));
  }
  const target=pPos.clone().add(offset);
  if(intro<1){
    intro=Math.min(1,intro+dt*0.42);
    const e=1-Math.pow(1-intro,3); // easeOutCubic
    // start far out in space (orbit), end at follow target
    const orbitPos=norm.clone().multiplyScalar(PLANET_R+58).add(t1.clone().multiplyScalar(34));
    camera.position.lerpVectors(orbitPos,target,e);
    const look=pPos.clone().add(norm.clone().multiplyScalar(THREE.MathUtils.lerp(8,1.05,e)));
    camera.up.copy(norm);camera.lookAt(look);
    bloomPass.strength=THREE.MathUtils.lerp(0.9,bloomStrength(),e);
  }else{
    camera.position.lerp(target,(cameraMode==='follow'?8:5)*dt);
    camera.up.copy(norm);
    camera.lookAt(cameraMode==='poster'?pPos.clone().multiplyScalar(.7):pPos.clone().add(norm.clone().multiplyScalar(cameraMode==='follow'?1.02:1.45)));
  }
}
function idleCam(){ // boot: slow hero orbit framing the WHOLE tiny planet (Messenger-style hero shot)
  const e=clock.elapsedTime;
  // R=86,H=46 -> cam dist ~97.5; asin(32/97.5)=19deg < 26deg half-FOV, so the full globe sits in frame with margin
  const R=86, H=46;
  camera.position.set(Math.cos(e*0.055)*R, H+Math.sin(e*0.045)*5, Math.sin(e*0.055)*R);
  camera.up.set(0,1,0);camera.lookAt(0,0,0);
}

/* ============================================================
   DELIVERY LOOP + BEACON + OFF-SCREEN ARROW
============================================================ */
let beacon;
function buildBeacon(){
  beacon=new THREE.Group();
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(0.45,0.18,7,18,1,true),
    new THREE.MeshBasicMaterial({color:PAL.hot,transparent:true,opacity:0.28,side:THREE.DoubleSide,
    blending:THREE.AdditiveBlending,depthWrite:false}));
  beam.position.y=3.5;beam.userData.beam=true;beacon.add(beam);
  const ring=new THREE.Mesh(new THREE.RingGeometry(0.5,0.66,28),
    new THREE.MeshBasicMaterial({color:PAL.gold,transparent:true,opacity:0.6,side:THREE.DoubleSide,
    blending:THREE.AdditiveBlending,depthWrite:false}));
  ring.rotation.x=-Math.PI/2;ring.position.y=0.06;ring.userData.ring=true;beacon.add(ring);
  beacon.visible=false;planet.add(beacon);
}
function setBeacon(slot){
  const ag=agents.find(a=>a.slot===slot);
  if(!ag){beacon.visible=false;return;}
  placeOn(beacon,ag.t,ag.p,0);beacon.visible=true;
}
function startDelivery(){ // receive the current leg's parcel
  const link=CHAIN[deliverIdx];if(!link)return;
  carrying=true;giverSlot=link.from;targetSlot=link.to;
  setBeacon(targetSlot);
  banner('New Dispatch',link.line);
  document.getElementById('dcount').textContent=`${Math.min(deliverIdx,TOTAL)} / ${TOTAL}`;
  sfx.pickup();save();
}
function completeDelivery(){
  doneSet.add(deliverIdx);carrying=false;shardReward();sfx.deliver();
  deliverIdx++;
  document.getElementById('dcount').textContent=`${Math.min(deliverIdx,TOTAL)} / ${TOTAL}`;
  if(deliverIdx>=TOTAL){beacon.visible=false;banner('Final Delivery','The Horizon is synced. The nine tails glow at the hall.');setTimeout(victory,2400);}
  else{startDelivery();} // recipient immediately hands you the next leg
  save();
}
function shardReward(){shardCount=Math.min(SHARD_GOAL,shardCount+2);chakra=Math.min(100,chakra+10);syncMeters();}

/* dialog */
function interact(){
  if(intro<1)return;
  if(dialogOn){advance();return;}
  if(!near)return;
  dialogOn=true;sfx.talk();
  const ag=near;let lines=[...ag.dlg];
  // delivery logic
  if(carrying && ag.slot===targetSlot){completeDelivery();}
  else if(!carrying && ag.slot===giverSlot && deliverIdx<TOTAL && doneSet.size<TOTAL){
    // picking up next parcel from the giver (the dispatch hall first, then chain links)
    startDelivery();
  }
  dq=lines;showDialog(ag.cfg.name,dq.shift());
}
function showDialog(nm,tx){document.getElementById('dnm').textContent=nm;document.getElementById('dtx').textContent=tx;
  document.getElementById('dialog').classList.add('show');}
function advance(){if(dq.length)document.getElementById('dtx').textContent=dq.shift();
  else{document.getElementById('dialog').classList.remove('show');dialogOn=false;}}
function banner(k,t){const el=document.getElementById('dispatch');document.getElementById('dtext').textContent=t;
  el.querySelector('.k').textContent=k;el.classList.add('show');clearTimeout(banner._t);banner._t=setTimeout(()=>el.classList.remove('show'),4600);}

function updateAgents(dt){
  near=null;
  for(const ag of agents){
    if(ag.offworld)continue;
    const wp=new THREE.Vector3();ag.group.getWorldPosition(wp);
    const d=player.position.distanceTo(wp);
    animateChar(ag.model,clock.elapsedTime*1.1+ag.slot,false);
    // indicator: active giver = gold, active target while carrying = crimson, else dim green
    if(ag.ind){ag.ind.position.y=1.7+Math.sin(clock.elapsedTime*3+ag.slot)*0.12;
      let show=false,col=0x6fcf77;
      if(carrying && ag.slot===targetSlot){show=true;col=PAL.crimson;}
      else if(!carrying && ag.slot===giverSlot && deliverIdx<TOTAL){show=true;col=PAL.gold;}
      else if(ag.role==='whisk'){show=true;col=PAL.soul;}
      ag.ind.visible=show;ag.ind.material.color.setHex(col);}
    // face player when near
    if(d<5){const toP=player.position.clone().sub(wp),agN=wp.clone().normalize();
      const tan=toP.clone().sub(agN.clone().multiplyScalar(toP.dot(agN)));
      if(tan.lengthSq()>0.01){const lr=new THREE.Vector3().crossVectors(agN,tan.normalize()).normalize();
        const cf=new THREE.Vector3().crossVectors(lr,agN).normalize();
        ag.group.quaternion.slerp(new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(lr,agN,cf)),2.5*dt);}}
    if(d<2.9)near=ag;
  }
  const pr=document.getElementById('prompt');
  if(near&&!dialogOn){pr.classList.add('show');
    document.getElementById('pwho').textContent=near.cfg.name+' · '+near.loc;
    const giving=!carrying&&near.slot===giverSlot&&deliverIdx<TOTAL;
    const taking=carrying&&near.slot===targetSlot;
    document.getElementById('pkey').textContent=giving?'E · Pick up parcel':taking?'E · Deliver':'E · Talk';
  }else pr.classList.remove('show');
}

/* off-screen objective arrow toward target beacon */
function updateArrow(){
  const arrow=document.getElementById('objArrow');
  if(!beacon.visible){arrow.classList.remove('show');return;}
  const wp=new THREE.Vector3();beacon.getWorldPosition(wp);
  const v=wp.clone().project(camera);
  const onScreen=v.z<1&&Math.abs(v.x)<0.9&&Math.abs(v.y)<0.9;
  if(onScreen){arrow.classList.remove('show');return;}
  arrow.classList.add('show');
  let ang=Math.atan2(v.y,v.x);if(v.z>1)ang+=Math.PI;
  const R=Math.min(innerWidth,innerHeight)*0.36;
  const cx=innerWidth/2+Math.cos(ang)*R, cy=innerHeight/2-Math.sin(ang)*R;
  arrow.style.left=cx+'px';arrow.style.top=cy+'px';
  arrow.querySelector('.a').style.transform=`rotate(${90-ang*180/Math.PI}deg)`;
}

/* shards pickup */
function updateShards(dt){
  for(const sh of shards){
    if(sh.got)continue;
    sh.phase+=dt*2;
    sh.group.children.forEach(c=>{if(c.userData.spin){c.rotation.y+=dt*1.6;c.rotation.x+=dt*0.8;}});
    sh.group.position.copy(s2c(sh.t,sh.p,PLANET_R+1.1+Math.sin(sh.phase)*0.12));
    const wp=new THREE.Vector3();sh.group.getWorldPosition(wp);
    if(player.position.distanceTo(wp)<1.5){
      sh.got=true;sh.group.visible=false;shardCount=Math.min(SHARD_GOAL,shardCount+1);
      chakra=Math.min(100,chakra+3);syncMeters();sfx.pick();popMark('✦',wp);
    }
  }
}
function popMark(sym,wp){const v=wp.clone().project(camera);
  const el=document.createElement('div');el.className='emote';el.textContent=sym;
  el.style.left=((v.x*0.5+0.5)*innerWidth-18)+'px';el.style.top=((-v.y*0.5+0.5)*innerHeight-18)+'px';
  document.body.appendChild(el);setTimeout(()=>el.remove(),1800);}

function syncMeters(){
  document.getElementById('shards').textContent=shardCount;
  document.getElementById('chakra').textContent=Math.round(chakra);
  document.getElementById('shardbar').style.transform=`scaleX(${shardCount/SHARD_GOAL})`;
  document.getElementById('chkbar').style.transform=`scaleX(${chakra/100})`;
}

/* ============================================================
   DAY / NIGHT — the quasar literally rises and sets
============================================================ */
let bloomTarget=2;
function bloomStrength(){return [0.05,0.12,0.24][bloomLevel];}
function updateDayNight(dt){
  gameTime+=dt*DAYLENS[dayLevel];if(gameTime>=24)gameTime-=24;
  const hh=Math.floor(gameTime),mm=Math.floor((gameTime-hh)*60);
  document.getElementById('gtime').textContent=`${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
  // sun angle around planet (tilted arc)
  const ang=(gameTime/24)*TAU - Math.PI/2;
  const tilt=0.32;
  const sunDir=new THREE.Vector3(Math.cos(ang),Math.sin(ang)*Math.cos(tilt)+0.25,Math.sin(ang)*Math.sin(tilt)).normalize();
  // place quasar far away in sun direction
  const far=720;
  if(skyRig){skyRig.position.copy(sunDir.clone().multiplyScalar(far));
    // keep quasar facing the planet
    skyRig.lookAt(0,0,0);
    // photon rim must face camera
    quasar.traverse(o=>{if(o.userData&&o.userData.faceCam)o.lookAt(camera.position);});
    // disc shear (Keplerian)
    const rd=quasar.userData;if(rd&&rd.rings)rd.rings.forEach(r=>r.piv.rotation.y+=r.omega*dt);
  }
  if(sunLight){sunLight.position.copy(sunDir.clone().multiplyScalar(140));sunLight.target.position.set(0,0,0);sunLight.target.updateMatrixWorld();}
  // elevation of sun => daylight factor
  const elev=THREE.MathUtils.clamp(sunDir.y*1.4+0.15,0,1);
  const night=1-elev;
  // light intensity + colour
  const dayCol=new THREE.Color(0xfff0dc),duskCol=new THREE.Color(0xff8a4a),nightCol=new THREE.Color(0x2a2a4a);
  let lc;if(elev>0.5)lc=duskCol.clone().lerp(dayCol,(elev-0.5)/0.5);else lc=nightCol.clone().lerp(duskCol,elev/0.5);
  if(sunLight){sunLight.color.copy(lc);sunLight.intensity=0.45+elev*2.05;}
  if(ambLight)ambLight.intensity=0.14+elev*0.20;
  if(hemiLight)hemiLight.intensity=0.10+elev*0.16;
  // sky dome
  if(skyDome){const u=skyDome.material.uniforms;
    u.sun.value.copy(sunDir);u.night.value=night;
    u.top.value.setHex(0x0a1230).lerp(new THREE.Color(0x2C82E6),elev);
    u.hor.value.setHex(0x171522).lerp(new THREE.Color(0xC2E8F5),elev);
    u.glow.value.setHex(PAL.ember);}
  if(starfield)starfield.material.opacity=0.25+night*0.7;
  // scene bg + fog
  const bgcol=new THREE.Color(0x05060f).lerp(new THREE.Color(0x9BD7EC),elev*.9);
  if(scene.background&&scene.background.copy)scene.background.copy(bgcol);else scene.background=bgcol;
  if(scene.fog)scene.fog.color.copy(bgcol);
  // lanterns glow at night
  const li=night*2.6;lanternLights.forEach(L=>L.intensity=li);
  // atmosphere tint
  if(planet.userData.atmo?.material.uniforms)planet.userData.atmo.material.uniforms.intensity.value=0.3+elev*0.18;
  if(planet.userData.atmo2?.material.uniforms)planet.userData.atmo2.material.uniforms.intensity.value=0.12+elev*0.1;
  // phase label
  let phase='Night';if(elev>0.82)phase='High Sun';else if(elev>0.4)phase=gameTime<12?'Morning':'Afternoon';
    else if(elev>0.08)phase=gameTime<12?'Dawn':'Dusk';
  document.getElementById('phase').textContent=phase;
  // ease bloom toward target
  bloomPass.strength+=(bloomStrength()*(0.6+elev*0.6)-bloomPass.strength)*Math.min(1,dt*2);

  // update emissive window materials based on night factor: brighten at night, dim at day
  if(windowMats && windowMats.length){
    const nightFactor = 1 - elev;
    for(const wm of windowMats){
      wm.opacity = 0.05 + nightFactor * 0.9;
    }
  }
}

/* ============================================================
   SIGNS (chakra hand-sign emotes)
============================================================ */
const Game={};window.Game=Game;
Game.diagnostics=()=>({
  version:WORLD_SPEC.version,artStyle:WORLD_SPEC.artStyle,districts:WORLD_SPEC.districts.map(d=>d.id),
  world:Object.assign({},WORLD_STATS),colliders:worldColliders.length,cameraMode,currentDistrict,
  playerReady:!!player,rendererReady:!!renderer,deliveryLeg:deliverIdx,carrying
});
Game.selfTest=()=>{
  // split-planet architecture: each verse-planet only carries its own district
  // subset (5-7, not the old combined ~19), so checks below are verse-relative
  // rather than fixed global thresholds.
  const expectedDistricts=window.Planets?Planets.districtsOf(window._verse).length:WORLD_SPEC.districts.length;
  const hasBridgeIfCarved=(window._verseCarve===false)||WORLD_STATS.bridges>=1;
  const checks={
    renderer:!!renderer&&!!scene&&!!camera,
    allDistrictsBuilt:WORLD_SPEC.districts.length===expectedDistricts&&WORLD_STATS.districts===WORLD_SPEC.districts.length,
    authoredRoadNetwork:WORLD_STATS.roads>=6,
    environmentProps:WORLD_STATS.props>=35,
    utilityWires:WORLD_STATS.wires>=4,
    collisionLayer:worldColliders.length>=25,
    avatarAndCamera:!!player&&!!playerMesh&&['follow','orbit','poster'].includes(cameraMode),
    deliveryLoop:CHAIN.length===TOTAL&&agents.length===NPCS.length,
    worldTransitions:WORLD_SPEC.districts.every(d=>d.name&&d.radius>0),
    pathNetwork:typeof PATHS!=='undefined'&&PATHS.length>=2,
    bridgeBuilt:hasBridgeIfCarved, // only the shinobi (ravine-carved) planet raises the Kurama bridge
    wallColliders:typeof wallColliders!=='undefined', // rope-rails/ravine-rim are verse-specific, not universal
    realmLayer:typeof REALMS==='object'&&Object.keys(REALMS).length===3,
    ghibliLayer:WORLD_STATS.ghibli>0,
    socialLayer:typeof window.Social==='object'&&typeof window.fetchAgenticNews==='function',
    newsGems:WORLD_STATS.gems>=6, // 2 trails × 3 gems per verse-planet
    verseGate:typeof window.chooseVerse==='function'&&typeof window.Verses==='object',
    planetVerse:typeof window.Planets==='object'&&!!window._verse,
    wormholeTransit:typeof window.transitTo==='function'&&!!window.WormholeGate,
    realmCast:typeof ROSTER!=='undefined'&&ROSTER.length>=27,
    trailFlora:WORLD_STATS.flora>0,
    loqiOS:typeof window.LoqiBus==='object'&&typeof window.updateLoqi==='function',
    storyboardLayer:typeof window.LoqiStoryboard==='object'&&typeof window.LoqiStoryboard.metrics==='function',
    agentsConfigured:typeof window.LoqiStoryboard==='object'&&window.LoqiStoryboard.agentsConfigured().ok
  };
  return {pass:Object.values(checks).every(Boolean),checks,diagnostics:Game.diagnostics()};
};
Game.sign=function(sym,name){
  if(chakra<5)return;
  chakra=Math.max(0,chakra-5);syncMeters();sfx.sign();UI.wheel();
  const pp=new THREE.Vector3();player.getWorldPosition(pp);
  popMark(sym,pp.clone().add(pp.clone().normalize().multiplyScalar(2)));
  // 3D additive ring burst
  const up=pp.clone().normalize();
  const ring=new THREE.Mesh(new THREE.RingGeometry(0.2,0.34,28),
    new THREE.MeshBasicMaterial({color:PAL.gold,transparent:true,opacity:0.8,side:THREE.DoubleSide,
    blending:THREE.AdditiveBlending,depthWrite:false}));
  ring.position.copy(pp).add(up.clone().multiplyScalar(0.1));
  _q.setFromUnitVectors(_up,up);ring.quaternion.copy(_q);scene.add(ring);
  const t0=clock.elapsedTime;
  (function grow(){const e=clock.elapsedTime-t0;if(e>0.9){scene.remove(ring);ring.geometry.dispose();ring.material.dispose();return;}
    ring.scale.setScalar(1+e*5);ring.material.opacity=0.8*(1-e/0.9);requestAnimationFrame(grow);})();
  banner('Hand Sign',name+' — chakra channelled.');
};

/* ============================================================
   MINIMAP
============================================================ */
function updateMini(){
  const c=document.getElementById('minicv'),x=c.getContext('2d'),w=c.width,h=c.height,cx=w/2,cy=h/2,r=w*0.43;
  x.clearRect(0,0,w,h);
  const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,'#16324a');g.addColorStop(0.7,'#0e2236');g.addColorStop(1,'#0a1322');
  x.beginPath();x.arc(cx,cy,r,0,TAU);x.fillStyle=g;x.fill();
  // player-centred rotation so "up" = forward-ish
  const pp=player.position.clone().normalize();
  const pt=Math.atan2(pp.z,pp.x),pph=Math.acos(THREE.MathUtils.clamp(pp.y,-1,1));
  const proj=(t,p)=>{const dx=Math.sin(p)*Math.cos(t)-Math.sin(pph)*Math.cos(pt);
    const dz=Math.sin(p)*Math.sin(t)-Math.sin(pph)*Math.sin(pt);
    const dy=Math.cos(p)-Math.cos(pph);
    return {mx:cx+dx*r*1.3,my:cy+dz*r*1.3,vis:(Math.sin(p)*Math.cos(t)*pp.x+Math.cos(p)*pp.y+Math.sin(p)*Math.sin(t)*pp.z)>-0.1};};
  // authored trails (drawn under markers)
  if(typeof PATHS!=='undefined'&&PATHS.length){
    const pcol={dirt:'rgba(212,183,138,0.55)',plank:'rgba(160,120,80,0.6)',tech:'rgba(120,220,210,0.55)'};
    for(const pa of PATHS){x.beginPath();let started=false;
      for(const s of pa.tp){const o=proj(s.t,s.p);if(!o.vis){started=false;continue;}
        if(!started){x.moveTo(o.mx,o.my);started=true;}else x.lineTo(o.mx,o.my);}
      x.strokeStyle=pcol[pa.style]||pcol.dirt;x.lineWidth=pa.style==='plank'?2.6:2;x.stroke();}
  }
  // agents
  for(const ag of agents){const o=proj(ag.t,ag.p);if(!o.vis)continue;
    let col='rgba(111,207,119,0.7)',sz=2.4;
    if(carrying&&ag.slot===targetSlot){col='#F2554B';sz=4;}
    else if(!carrying&&ag.slot===giverSlot&&deliverIdx<TOTAL){col='#FFB068';sz=4;}
    x.beginPath();x.arc(o.mx,o.my,sz,0,TAU);x.fillStyle=col;x.fill();}
  // shards
  for(const sh of shards){if(sh.got)continue;const o=proj(sh.t,sh.p);if(!o.vis)continue;
    x.fillStyle='rgba(207,227,255,0.55)';x.fillRect(o.mx-1,o.my-1,2,2);}
  // player
  x.beginPath();x.arc(cx,cy,4.5,0,TAU);x.fillStyle='#FFE9CC';x.fill();
  x.strokeStyle='#0a1322';x.lineWidth=1.4;x.stroke();
}

/* ============================================================
   UI CONTROLLERS
============================================================ */
const UI={};window.UI=UI;
UI.panel=function(id){const el=document.getElementById('p-'+id);const open=el.classList.contains('open');UI.closeAll();
  if(!open){if(id==='ward')fillWard();if(id==='codex')fillCodex();el.classList.add('open');}};
UI.closeAll=function(){document.querySelectorAll('.panel').forEach(p=>p.classList.remove('open'));document.getElementById('wheel').classList.remove('open');};
UI.wheel=function(){document.getElementById('wheel').classList.toggle('open');};
UI.audio=function(){audioOn=!audioOn;document.getElementById('setAudio').textContent=audioOn?'ON':'OFF';
  if(audioCtx){audioOn?audioCtx.resume():audioCtx.suspend();}save();};
UI.bloom=function(){bloomLevel=(bloomLevel+1)%3;document.getElementById('setBloom').textContent=['Low','Medium','High'][bloomLevel];save();};
UI.daylen=function(){dayLevel=(dayLevel+1)%3;document.getElementById('setDay').textContent=['Slow','Normal','Fast'][dayLevel];save();};

function fillWard(){const box=document.getElementById('wardBody');box.innerHTML='';
  ROSTER.forEach((c,i)=>{const d=document.createElement('div');d.className='witem'+(i===curChar?' on':'');
    const re=(c.realm&&REALMS[c.realm])?REALMS[c.realm].emo:'';
    d.innerHTML=`<div class="wi">${c.emo}</div><div class="wn">${c.name} ${re}<br>${c.ward}</div>`;
    d.onclick=()=>{curChar=i;applyChar();syncSwitch();fillWard();};box.appendChild(d);});}
function fillCodex(){document.getElementById('codexBody').innerHTML=`
  <div class="lore"><h3>The Split Verse Planets</h3><p>The Tri-Fabled horizon has been decompiled into three planets. Each verse now builds the whole globe from its own districts — Shinobi Kai keeps the carved ravine and the Kurama bridge; Grandline Tide runs plankways over teal seas; Sayajin Prime hums with capsule lanes under a violet atmosphere. One verse, one world, one sky.</p></div>
  <div class="lore"><h3>The Wormhole Galaxy</h3><p>Between the planets there is no road — only the gate. Each hub raises a Wormhole Gate: stand in its light, press E, choose a destination, and escape into the swirling galaxy between. Source colour bleeds into destination colour as the tunnel carries you; the new planet assembles beneath you before landfall.</p></div>
  <div class="lore"><h3>LOQI⁘MONITOR</h3><p>The orchestration OS that watches all three verse-planets at once (press L). Verse telemetry, the 27-agent working council — the Shinobi guild on ShuttleSensei sport-skills, the Grandline crew and Sayajin cadre on WorleyVerse agentic engineering — the notification feed, and every banked artifact.</p></div>
  <div class="lore"><h3>The Horizon</h3><p>A planet small enough to walk around, held in a slow orbit about a quasar — a withholding core ringed by a photon rim and a tilted accretion disc. The disc's inner edge laps its outer edge; the world feels alive because the sky is.</p></div>
  <div class="lore"><h3>Couriers of the Core</h3><p>Eight couriers keep dispatches moving edge to edge. You begin as Kuro, the nine-tail courier; switch with 1–8 or the wardrobe.</p></div>
  <div class="lore"><h3>The Six-Leg Loop</h3><p>Storm seal, iron bell, keystone, ledger, frost fragment, core shard. Each leg tours a district; the last returns to the hall and syncs the Horizon.</p></div>
  <div class="lore"><h3>Photon Shards</h3><p>Drifting motes of accretion light. Gather them for chakra — ${SHARD_GOAL} are scattered across the surface.</p></div>
  <div class="lore"><h3>Hand Signs</h3><p>Ember, Light, Spiral, Frost, Soul, Greet — five elements and a wave, each a word you speak to the world.</p></div>
  <div class="lore"><h3>The Eight Living Districts</h3><p>Courier Core, Ninja Market Slope, Shrine Grove, Capsule Forge, Motion Dojo, Harbor of Horizons, Giant Grove, and Sky Lookout form one continuous curved civilization. Roads, stairs, wires, guardrails, docks, rootways, and signs author the transitions between them.</p></div>
  <div class="lore"><h3>Courier Movement</h3><p>Follow camera sits low behind the avatar; Orbit reveals tactical geometry; Poster reveals the tiny planet. Sprint adds foxfire footfall sparks, slopes follow the planet curvature, and soft collision keeps couriers outside authored environment blocks.</p></div>
  <div class="lore"><h3>Handcrafted District Detail</h3><p>Anime houses carry eaves, balconies, utilities, mailboxes and dishes. Shrine seals, capsule conduits, court arcs, harbor cargo, giant roots and energy rings translate the platform backstory into playable geometry.</p></div>
  <div class="lore"><h3>The Tri-Fabled Realms</h3><p>One walkable horizon, three sovereign fables. The Shinobi Realm rises around Hidden Leaf — dispatch, market, shrine, arcade, observatory and festival share its ridge. The Pirate Realm sprawls from the Grand Plankway to Elbaf — lookout, monastery, dojo, grove and skydocks ride its coast. The Saiyan Realm gathers at Capsule Corp — forge, harbor, sakura grove and skillforge share its dusk. Cross a border on foot and the light, grain and fog quietly retune to the fable you've entered; use the realm dock to leap straight to an anchor hub.</p></div>
  <div class="lore"><h3>Authored Trails</h3><p>Four hand-laid paths keep travel legible where the wilds thicken. Kurama Crossing spans the carved ravine between Shrine Grove and Hidden Leaf on a lantern-lit wooden bridge. Lantern Wood threads a pine-and-paper-lantern corridor from Hidden Leaf to the Festival grounds. The Grand Plankway runs rope-railed decking from the Boardwalk out to Elbaf. The Capsule Energy Lane lights a teal-and-violet tech walk between the Forge and the Harbor. Off the trail the ground stays wild; on it, the world clears a path.</p></div>
  <div class="lore"><h3>The Horizon News Wire</h3><p>Wire-gems hover along every authored trail, each holding a dispatch from that realm's bulletin. Walk through one to read it and draw a little chakra. Link an 𝕏 or Instagram account from the social dock and the wire re-tunes — gems begin surfacing stories matched to your interests, marked "for you". Collected gems re-arm with fresh dispatches as you travel.</p></div>
  <div class="lore"><h3>The Verse Gate</h3><p>Every dive begins among three planets. At the gate, the tri-fabled horizon decompiles into its verses — a leaf-green Shinobi world, an ocean-belted Pirate world, a violet Saiyan world — each turning under its own ring and moons. Choose one and its lead courier takes the harness as you fall out of orbit onto that face of the globe. The three planets are one: walk far enough in any direction and the next fable simply begins.</p></div>`;}

function buildSwitch(){const box=document.getElementById('cswitch');box.innerHTML='';
  ROSTER.forEach((c,i)=>{const b=document.createElement('div');b.className='cbtn'+(i===curChar?' on':'');b.textContent=c.emo;b.title=c.name;
    b.onclick=()=>{curChar=i;applyChar();syncSwitch();};box.appendChild(b);});}
function syncSwitch(){document.querySelectorAll('#cswitch .cbtn').forEach((b,i)=>b.classList.toggle('on',i===curChar));}

/* ============================================================
   INPUT
============================================================ */
function setupInput(){
  addEventListener('keydown',e=>{keys[e.code]=true;
    document.body.dataset.lastInput=e.code;
    if(e.code==='Space'){
      jumpQueued=true;triggerJump();e.preventDefault();
    }
    if(e.code==='KeyE'){interact();e.preventDefault();}
    if(e.code==='KeyC')cycleCamera();
    if(e.code==='KeyB')UI.panel('codex');
    if(e.code==='KeyV')UI.panel('ward');
    if(e.code==='KeyQ')UI.wheel();
    if(e.code==='Escape')UI.closeAll();
    if(e.code>='Digit1'&&e.code<='Digit8'){const i=+e.code.slice(5)-1;if(ROSTER[i]){curChar=i;applyChar();syncSwitch();}}
  });
  addEventListener('keyup',e=>{keys[e.code]=false;});
  document.getElementById('dialog').addEventListener('click',()=>{if(dialogOn)advance();});
  const J=document.getElementById('joy'),JK=document.getElementById('joyk');
  J.addEventListener('touchstart',e=>{joyOn=true;e.preventDefault();},{passive:false});
  J.addEventListener('touchmove',e=>{e.preventDefault();const t=e.touches[0],r=J.getBoundingClientRect();
    let dx=(t.clientX-r.left-r.width/2)/(r.width/2),dy=(t.clientY-r.top-r.height/2)/(r.height/2);
    const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l;}joyV={x:dx,y:dy};
    JK.style.transform=`translate(${-50+dx*42}%,${-50+dy*42}%)`;},{passive:false});
  J.addEventListener('touchend',()=>{joyOn=false;joyV={x:0,y:0};JK.style.transform='translate(-50%,-50%)';});
  document.getElementById('mInt').addEventListener('touchstart',e=>{e.preventDefault();interact();},{passive:false});
  document.getElementById('mJmp').addEventListener('touchstart',e=>{e.preventDefault();keys.btnJ=true;},{passive:false});
  // RMB orbit
  renderer.domElement.addEventListener('pointerdown',e=>{if(e.button===2){ptr.down=true;ptr.x=e.clientX;ptr.y=e.clientY;}});
  addEventListener('pointermove',e=>{if(ptr.down){camYaw+=(e.clientX-ptr.x)*0.005;
    camPitch=THREE.MathUtils.clamp(camPitch+(e.clientY-ptr.y)*0.005,-0.45,1.15);ptr.x=e.clientX;ptr.y=e.clientY;}});
  addEventListener('pointerup',()=>ptr.down=false);
  renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
  // touch-drag camera (single finger on canvas)
  let tx=0,ty=0,td=false;
  renderer.domElement.addEventListener('touchstart',e=>{if(e.touches.length===1){td=true;tx=e.touches[0].clientX;ty=e.touches[0].clientY;}},{passive:true});
  renderer.domElement.addEventListener('touchmove',e=>{if(td&&e.touches.length===1){const t=e.touches[0];
    camYaw+=(t.clientX-tx)*0.006;camPitch=THREE.MathUtils.clamp(camPitch+(t.clientY-ty)*0.006,-0.45,1.15);tx=t.clientX;ty=t.clientY;}},{passive:true});
  renderer.domElement.addEventListener('touchend',()=>td=false);
  addEventListener('gamepadconnected',e=>document.getElementById('gpStat').textContent=e.gamepad.id.slice(0,16));
  addEventListener('gamepaddisconnected',()=>document.getElementById('gpStat').textContent='none');
}
let padX=0,padY=0,padBtn2=false;
function readPad(){padX=0;padY=0;const ps=navigator.getGamepads?.()||[];
  for(const gp of ps){if(!gp)continue;
    const dz=0.18;
    if(Math.abs(gp.axes[0])>dz)padX=gp.axes[0];
    if(Math.abs(gp.axes[1])>dz)padY=gp.axes[1];
    if(gp.axes[2]!==undefined&&Math.abs(gp.axes[2])>dz)camYaw+=gp.axes[2]*0.045;
    if(gp.axes[3]!==undefined&&Math.abs(gp.axes[3])>dz)camPitch=THREE.MathUtils.clamp(camPitch+gp.axes[3]*0.03,-0.45,1.15);
    if(gp.buttons[0]?.pressed)keys.btnJ=true;
    const b2=gp.buttons[2]?.pressed;if(b2&&!padBtn2)interact();padBtn2=b2;
    break; // first connected pad only
  }}

/* ============================================================
   WORLD ASSEMBLY
============================================================ */
function buildWorld(){
  buildDistricts();
  buildPathNetwork();   // authored trails + bridge + corridors + Ghibli pass (before scatter, so PATH_CLEAR governs it)
  // Transitional settlements between the authored hubs keep the horizon populated.
  const _mids=[['farm',1.8,Math.PI/2-.2,0xa0c47a,0x446633,.9],['woodcamp',-1.5,Math.PI/2-.4,0xd0b090,0x7a5236,.9],
    ['medbay',-2.0,Math.PI/2+.4,0xc8e4f0,0x8aabc4,.82],['well',2.4,Math.PI/2+.1,0xd8c6a4,0x6a523a,.9],
    ['gate',Math.PI,Math.PI/2-.4,0xcf9540,0x883322,.8],['pagoda',1.15,Math.PI/3+.18,0xd8c0a0,0xffb068,.72]];
  for(const [ty,mt,mp,mc,mr,ms] of _mids){if(PATH_CLEAR(mt,mp,1.2))building(ty,mt,mp,mc,mr,ms);}

  // trees
  const types=['round','pine','sakura','round','pine'];
  for(let i=0;i<125;i++){const t=Math.random()*TAU,p=0.3+Math.random()*2.3;
    if(!PATH_CLEAR(t,p,0.9))continue;
    tree(t,p,types[Math.floor(Math.random()*types.length)],0.55+Math.random()*0.9);}
  for(let i=0;i<58;i++){const t=Math.random()*TAU,p=0.2+Math.random()*2.4;
    if(!PATH_CLEAR(t,p,0.7))continue;
    rock(t,p,0.16+Math.random()*0.28);}

  // === EXPANSION: environmental scatter and landmarks ===
  // scatter instanced grass across non-snow/waste biomes
  buildGrass();
  // atmosphere is shared across the verse planets — build clouds/birds once
  if(!window._skyBuilt){buildClouds(18);buildBirds(12);window._skyBuilt=true;}
  // spawn roaming villagers around the horizon
  buildVillagers(18);
  // place special landmarks (resource nodes)
  landmark('chakraPool', 0.8, Math.PI/4);
  landmark('dataCrystals', 3.5, Math.PI/3 + 0.2);
  landmark('ryoVein', 2.2, Math.PI/2 + 0.4);
  landmark('scrollStones', 5.1, Math.PI/2 - 0.3);
  landmark('cropField', 1.4, Math.PI/2 - 0.6);
  // scatter biome-dependent rocks, spire trees and bushes for variation
  for(let i=0;i<75;i++){
    const t=Math.random()*TAU;
    const p=0.25+Math.random()*2.5;
    if(!PATH_CLEAR(t,p,0.8))continue;
    const b=biomeAt(t,p);
    if(b==='wastes'){
      redRock(t,p);
    } else if(b==='snow'){
      snowRock(t,p);
    } else {
      if(Math.random()<0.4){
        spireTree(t,p);
      } else {
        bush(t,p);
      }
    }
  }
  // env-pack ambient decorators (registry) — extra scatter for the new build environments
  if(typeof _runDecorators==='function') _runDecorators();
  // freeze the static spatial hash once every collider (circles + capsule walls) is registered
  buildCollisionIndex();
  // update discovered UI with new total landmarks
  document.getElementById('disc').textContent=`${discoveredCount} / ${TOTAL_LM}`;
}

