/* === kurama.realms.js — Tri-Fabled Planetary Realms layer =================
   One walkable horizon, three sovereign fables. Provides:
     • realm dock (🌀 / 🏴‍☠️ / ⚡) + zoom-transit overlay (DOM injected)
     • orbit-visible realm beacon totems at each anchor hub
     • flyToRealm() — cinematic pull-out → orbit → native dive hand-off
     • updateRealms() — walking detection + per-realm painterly grade,
       fog tint/breathing (clearer on the trails), light tinting layered
       AFTER the day/night pass so the two systems never fight.
   Classic script, shared global scope. Loaded after kurama.main.js. ====== */
(function(){
  /* ---- UI: styles + dock + transit overlay ---- */
  const css=document.createElement('style');css.textContent=`
  #realmDock{position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:60;display:flex;gap:8px;
    opacity:0;pointer-events:none;transition:opacity .8s ease .5s;}
  #ui.live~#realmDock,body[data-live="1"] #realmDock{opacity:1;pointer-events:all;}
  .realmBtn{padding:7px 15px;display:flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:999px;
    background:var(--ink);backdrop-filter:blur(13px) saturate(1.2);-webkit-backdrop-filter:blur(13px) saturate(1.2);
    font-family:var(--disp);font-weight:600;font-size:.66rem;letter-spacing:.18em;text-transform:uppercase;
    color:var(--cream);transition:all .22s;}
  .realmBtn .re{font-size:.95rem;line-height:1;}
  .realmBtn:hover{border-color:var(--gold);background:rgba(255,176,104,.12);}
  .realmBtn.active{border-color:var(--gold);color:var(--hot);box-shadow:0 0 18px -6px rgba(255,176,104,.55);}
  .realmBtn.active.r-pirate{border-color:var(--teal);color:#bff2ee;box-shadow:0 0 18px -6px rgba(61,201,194,.55);}
  .realmBtn.active.r-saiyan{border-color:var(--soul);color:#d9ccff;box-shadow:0 0 18px -6px rgba(155,124,246,.55);}
  #realmVeil{position:fixed;inset:0;z-index:58;pointer-events:none;opacity:0;transition:opacity .5s ease;
    background:radial-gradient(120% 100% at 50% 50%,transparent 34%,rgba(4,6,15,.55) 72%,rgba(4,6,15,.96) 100%);}
  #realmVeil.on{opacity:1;}`;
  document.head.appendChild(css);
  const dock=document.createElement('div');dock.id='realmDock';
  dock.innerHTML=Object.values(REALMS).map(r=>
    `<button class="realmBtn r-${r.id}" data-realm="${r.id}"><span class="re">${r.emo}</span>${r.name.split(' ')[0]}</button>`).join('');
  document.body.appendChild(dock);
  const veil=document.createElement('div');veil.id='realmVeil';document.body.appendChild(veil);
  dock.querySelectorAll('.realmBtn').forEach(b=>b.addEventListener('click',()=>flyToRealm(b.dataset.realm)));

  /* ---- realm state ---- */
  let curRealm=null,gradeTgt=null;
  const G={levels:8,warm:.04,grain:.05,fog:new THREE.Color(0x0a140f),
    hemiSky:new THREE.Color(0xbfe0ff),hemiGnd:new THREE.Color(0x33402e),
    sunTint:new THREE.Color(1,1,1),accent:new THREE.Color(0xF2843D)};
  const SUN_TINT={shinobi:new THREE.Color(1.0,.975,.915),pirate:new THREE.Color(.94,1.0,1.02),saiyan:new THREE.Color(.985,.965,1.045)};

  function setGradeTarget(r){
    gradeTgt={levels:r.grade.levels,warm:r.grade.warm,grain:r.grade.grain,
      fog:new THREE.Color(r.grade.fog),hemiSky:new THREE.Color(r.grade.hemiSky),
      hemiGnd:new THREE.Color(r.grade.hemiGnd),sunTint:SUN_TINT[r.id],accent:new THREE.Color(r.grade.accent)};
  }
  function syncDock(){dock.querySelectorAll('.realmBtn').forEach(b=>b.classList.toggle('active',curRealm&&b.dataset.realm===curRealm.id));}

  /* ---- orbit-visible realm beacon totems ---- */
  window.buildRealmBeacons=function(){
    for(const r of Object.values(REALMS)){
      if(window._verse&&r.id!==window._verse)continue; // split planets: only the local realm raises its totem
      const g=new THREE.Group();
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(.09,.13,7.4,7),toon(0x3a2c1c));
      pole.position.y=3.7;pole.castShadow=true;g.add(pole);g.add(outline(pole,1.05));
      const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
      x.font='92px system-ui';x.textAlign='center';x.textBaseline='middle';x.fillText(r.emo,64,70);
      const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
      const emblem=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false}));
      emblem.scale.set(2.6,2.6,1);emblem.position.y=8.6;g.add(emblem);bobbers.push({m:emblem,bob:8.6,amp:.28});
      const ring=new THREE.Mesh(new THREE.TorusGeometry(1.05,.055,8,30),
        new THREE.MeshBasicMaterial({color:r.grade.accent,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false}));
      ring.position.y=8.6;g.add(ring);bobbers.push({m:ring,spinY:.7});
      const halo=new THREE.Mesh(new THREE.CylinderGeometry(.5,.22,6.5,14,1,true),
        new THREE.MeshBasicMaterial({color:r.grade.accent,transparent:true,opacity:.14,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));
      halo.position.y=5.4;g.add(halo);
      const AA=r.anchorLive||r.anchor;
      placeOn(g,AA.t+.14,AA.p-.11,0);planet.add(g);
      worldColliders.push({pos:g.position.clone(),radius:.34,label:'realm-beacon'});
    }
  };

  /* ---- cinematic realm transit: pull-out, then the native intro dive ---- */
  window.flyToRealm=function(id){
    const r=REALMS[id];if(!r||!gameOn||window._cine||window._transit)return;
    if(window.Planets&&id!==window._verse){if(typeof transitTo==='function')transitTo(id);return;}
    const A=r.anchorLive||r.anchor;
    window._cine=true;veil.classList.add('on');
    const anchorN=s2c(A.t,A.p,1).normalize();
    let t1=new THREE.Vector3().crossVectors(anchorN,new THREE.Vector3(0,1,0));
    if(t1.lengthSq()<.001)t1.crossVectors(anchorN,new THREE.Vector3(1,0,0));t1.normalize();
    const startPos=camera.position.clone(),startUp=camera.up.clone();
    const orbitPos=anchorN.clone().multiplyScalar(PLANET_R+58).add(t1.clone().multiplyScalar(34));
    const lookA=player.position.clone(),lookB=s2c(A.t,A.p,PLANET_R);
    let e=0;const DUR=1.35;
    window._cineTick=function(dt){
      e=Math.min(1,e+dt/DUR);
      const k=e<.5?2*e*e:1-Math.pow(-2*e+2,2)/2; // easeInOutQuad
      camera.position.lerpVectors(startPos,orbitPos,k);
      camera.up.copy(startUp).lerp(anchorN,k).normalize();
      camera.lookAt(lookA.clone().lerp(lookB,k));
      if(e>=1){
        // land the courier at the realm anchor and hand off to the native orbit-dive
        player.position.copy(s2c(A.t+.07,A.p+.06,PLANET_R+CHAR_H*0.1));
        velocity.set(0,0,0);onGround=true;
        const n=player.position.clone().normalize();
        facingDir.copy(s2c(A.t,A.p,PLANET_R).sub(player.position)).projectOnPlane(n).normalize();
        camYaw=0;camPitch=0.08;intro=0;
        window._cineTick=null;window._cine=false;
        setTimeout(()=>veil.classList.remove('on'),380);
        banner('Realm Transit',`${r.emo} ${r.name} — ${r.sub}. The ${WORLD_SPEC.districts.find(d=>d.id===r.hub)?.name||r.hub} lies ahead.`);
        save&&save();
      }
    };
  };

  /* ---- per-frame realm grade (layered after updateDayNight) ---- */
  let _rt=0;
  window.updateRealms=function(dt){
    if(!player)return;
    _rt+=dt;
    if(_rt>0.25){_rt=0;
      const pp=player.position;const t=Math.atan2(pp.z,pp.x);
      const r=window._verse?REALMS[window._verse]:realmAt(t);
      if(r!==curRealm){
        const first=!curRealm;curRealm=r;setGradeTarget(r);syncDock();
        if(!first)banner('Entering Realm',`${r.emo} ${r.name} — ${r.sub}`);
      }
    }
    if(!gradeTgt)return;
    const k=1-Math.exp(-dt*1.7);
    G.levels+=(gradeTgt.levels-G.levels)*k;G.warm+=(gradeTgt.warm-G.warm)*k;G.grain+=(gradeTgt.grain-G.grain)*k;
    G.fog.lerp(gradeTgt.fog,k);G.hemiSky.lerp(gradeTgt.hemiSky,k);G.hemiGnd.lerp(gradeTgt.hemiGnd,k);
    G.sunTint.lerp(gradeTgt.sunTint,k);G.accent.lerp(gradeTgt.accent,k);
    const pp=window._painterlyPass;
    if(pp&&pp.uniforms){pp.uniforms.uLevels.value=G.levels;pp.uniforms.uWarm.value=G.warm;pp.uniforms.uGrain.value=G.grain;}
    if(sunLight)sunLight.color.multiply(G.sunTint);
    if(hemiLight){hemiLight.color.copy(G.hemiSky);hemiLight.groundColor.copy(G.hemiGnd);}
    if(scene.fog){
      scene.fog.color.lerp(G.fog,.34);                       // realm tint over the day/night base
      const info=typeof nearestPathInfo==='function'?nearestPathInfo(player.position):null;
      const onPath=info&&info.d<info.path.width*1.6;
      const farTgt=onPath?276:236;                            // trails read as clear, safe routes
      scene.fog.far+=(farTgt-scene.fog.far)*Math.min(1,dt*1.4);
    }
  };

  /* ---- post-init hook: beacons + initial grade (before fidelity's wrap) ---- */
  const _init=window.init;
  if(typeof _init==='function'){
    window.init=async function(){
      const out=await _init.apply(this,arguments);
      try{buildRealmBeacons();buildCollisionIndex();}catch(e){console.warn('[realms] beacons skipped:',e);}
      try{const t=Math.atan2(player.position.z,player.position.x);curRealm=realmAt(t);setGradeTarget(curRealm);syncDock();
        document.body.dataset.realm=curRealm.id;}catch(e){}
      return out;
    };
  }
  window.Realms={current:()=>curRealm&&curRealm.id,all:REALMS,fly:window.flyToRealm};
})();
