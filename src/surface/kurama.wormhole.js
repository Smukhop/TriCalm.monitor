/* === kurama.wormhole.js — Wormhole Galaxy Transit ==========================
   The only road between the split verse-planets. Each planet raises a
   Wormhole Gate beside its anchor hub: a standing ring of stone and light
   with a slow galactic swirl inside. Walk up, press E, choose a destination,
   and the sequence runs:
     1) LIFT-OFF   — the camera pulls off the surface into orbit
     2) THE TUNNEL — a swirling wormhole galaxy scene (source-realm colour
                     bleeding into destination colour, star-streaks, drifting
                     galaxies); the target planet is rebuilt mid-tunnel
     3) ARRIVAL    — white-out, then the native orbit-dive drops you onto
                     the new verse-planet at its hub
   Click / Enter after the first second skips to arrival. Classic script. == */
(function(){
  'use strict';

  /* ---------------- gate structure ---------------- */
  window.WormholeGate=null;
  function swirlTexture(hexA,hexB){
    const cv=document.createElement('canvas');cv.width=cv.height=256;const x=cv.getContext('2d');
    x.fillStyle='#05060f';x.fillRect(0,0,256,256);
    const cA='#'+new THREE.Color(hexA).getHexString(),cB='#'+new THREE.Color(hexB).getHexString();
    for(let arm=0;arm<3;arm++){
      x.strokeStyle=arm%2?cA:cB;x.lineWidth=7;x.globalAlpha=.8;
      x.beginPath();
      for(let i=0;i<130;i++){const a=i*.13+arm*(Math.PI*2/3),r=4+i*.9;
        const px=128+Math.cos(a)*r,py=128+Math.sin(a)*r;
        i?x.lineTo(px,py):x.moveTo(px,py);}
      x.stroke();}
    x.globalAlpha=1;const gr=x.createRadialGradient(128,128,2,128,128,50);
    gr.addColorStop(0,'#ffffff');gr.addColorStop(1,'rgba(255,255,255,0)');
    x.fillStyle=gr;x.beginPath();x.arc(128,128,50,0,7);x.fill();
    const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;return tx;
  }
  window.buildWormholeGate=function(){
    const r=REALMS[window._verse||'shinobi'];const A=r.anchorLive||r.anchor;
    const t=A.t+.42,p=A.p-.02;
    const g=new THREE.Group();
    const base=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.8,.34,10),toon(0x2a2433,.03));
    base.position.y=.17;base.castShadow=true;g.add(base);g.add(outline(base,1.03));
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1.9,.17,10,40),toon(0x3a2c46,.05));
    ring.position.y=2.4;ring.castShadow=true;g.add(ring);g.add(outline(ring,1.03));
    const trim=new THREE.Mesh(new THREE.TorusGeometry(1.9,.05,6,40),
      new THREE.MeshBasicMaterial({color:r.grade.accent,transparent:true,opacity:.85,blending:THREE.AdditiveBlending}));
    trim.position.y=2.4;g.add(trim);
    const swirl=new THREE.Mesh(new THREE.CircleGeometry(1.7,36),
      new THREE.MeshBasicMaterial({map:swirlTexture(r.grade.accent,0x9B7CF6),transparent:true,opacity:.9,
        side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));
    swirl.position.y=2.4;g.add(swirl);
    for(const sgn of[-1,1]){
      const py=new THREE.Mesh(new THREE.BoxGeometry(.3,2.8,.3),toon(0x2a2433,.03));
      py.position.set(sgn*2.5,1.4,0);py.castShadow=true;g.add(py);g.add(outline(py,1.03));
      const orb=new THREE.Mesh(new THREE.OctahedronGeometry(.2,0),
        new THREE.MeshBasicMaterial({color:r.grade.accent,transparent:true,opacity:.9,blending:THREE.AdditiveBlending}));
      orb.position.set(sgn*2.5,3.05,0);g.add(orb);bobbers.push({m:orb,spinY:1.2});
    }
    const L=new THREE.PointLight(r.grade.accent,1.6,10,2);L.position.y=2.6;g.add(L);
    placeOn(g,t,p,0);planet.add(g);
    worldColliders.push({pos:g.position.clone(),radius:1.0,label:'wormholeGate'});
    window.WormholeGate={t,p,group:g,swirl,trim};
  };

  /* ---------------- destination menu ---------------- */
  const css=document.createElement('style');css.textContent=`
  #wormMenuWrap{position:fixed;inset:0;z-index:82;display:none;align-items:center;justify-content:center;
    background:rgba(5,6,15,.7);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);}
  #wormMenuWrap.open{display:flex;}
  #wormMenu{width:min(400px,90vw);border:1px solid var(--line);border-radius:18px;background:var(--ink);
    padding:20px 22px;font-family:var(--disp);color:var(--cream);}
  #wormMenu h3{margin:0 0 4px;font-size:.9rem;letter-spacing:.2em;text-transform:uppercase;}
  #wormMenu .sub{font-family:var(--mono);font-size:.58rem;letter-spacing:.14em;color:var(--frost);opacity:.75;margin-bottom:12px;}
  .wormDest{display:flex;align-items:center;gap:12px;padding:10px 12px;margin:8px 0;border:1px solid var(--line);
    border-radius:12px;cursor:pointer;transition:all .2s;}
  .wormDest:hover{border-color:var(--wc);transform:translateX(4px);box-shadow:0 8px 30px -14px var(--wc);}
  .wormDest .dot{width:14px;height:14px;border-radius:50%;background:var(--wc);box-shadow:0 0 12px var(--wc);}
  .wormDest .n{font-weight:700;font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;}
  .wormDest .h{font-family:var(--mono);font-size:.55rem;color:var(--frost);opacity:.7;margin-top:2px;}
  #wormCancel{width:100%;margin-top:10px;padding:9px 0;border-radius:10px;border:1px solid var(--line);
    background:transparent;color:var(--cream);font-family:var(--disp);font-size:.64rem;letter-spacing:.18em;
    text-transform:uppercase;cursor:pointer;}
  #wormVeil{position:fixed;inset:0;z-index:90;background:#fff;opacity:0;pointer-events:none;transition:opacity .45s ease;}
  #wormVeil.on{opacity:1;}
  #wormSkip{position:fixed;bottom:36px;left:50%;transform:translateX(-50%);z-index:91;font-family:var(--mono);
    font-size:.6rem;letter-spacing:.24em;text-transform:uppercase;color:var(--frost);opacity:0;transition:opacity .6s;pointer-events:none;}
  #wormSkip.on{opacity:.75;}`;
  document.head.appendChild(css);
  const menuWrap=document.createElement('div');menuWrap.id='wormMenuWrap';
  menuWrap.innerHTML='<div id="wormMenu"></div>';
  const veil=document.createElement('div');veil.id='wormVeil';
  const skipHint=document.createElement('div');skipHint.id='wormSkip';skipHint.textContent='click / enter · skip transit';
  function mountUI(){document.body.appendChild(menuWrap);document.body.appendChild(veil);document.body.appendChild(skipHint);}
  menuWrap.onclick=e=>{if(e.target===menuWrap)closeMenu();};
  function closeMenu(){menuWrap.classList.remove('open');}
  window.openWormholeMenu=function(){
    if(!gameOn||window._cine||window._transit)return;
    const m=menuWrap.querySelector('#wormMenu');
    const dests=Object.values(REALMS).filter(r=>r.id!==window._verse);
    m.innerHTML=`<h3>🌀 Wormhole Gate</h3><div class="sub">escape this verse · ride the galaxy between the planets</div>`+
      dests.map(r=>{const hub=Planets.districtsOf(r.id).find(d=>d.id===r.hub);
        return `<div class="wormDest" data-id="${r.id}" style="--wc:#${new THREE.Color(r.grade.accent).getHexString()}">
          <span class="dot"></span><div><div class="n">${r.emo} ${r.name}</div>
          <div class="h">${r.sub} · arrive at ${hub?hub.name:r.hub}</div></div></div>`;}).join('')+
      `<button id="wormCancel">Stay</button>`;
    m.querySelectorAll('.wormDest').forEach(d=>d.onclick=()=>{closeMenu();transitTo(d.dataset.id);});
    m.querySelector('#wormCancel').onclick=closeMenu;
    menuWrap.classList.add('open');
  };

  /* ---------------- the tunnel scene ---------------- */
  let worm=null;
  function buildWormScene(){
    if(worm)return worm;
    const sc=new THREE.Scene();sc.background=new THREE.Color(0x02030a);
    const cam=new THREE.PerspectiveCamera(74,innerWidth/innerHeight,.1,900);cam.position.set(0,0,0);
    const tubeTex=swirlStripeTex();
    const tube=new THREE.Mesh(new THREE.CylinderGeometry(9,9,700,36,1,true),
      new THREE.MeshBasicMaterial({map:tubeTex,side:THREE.BackSide,transparent:true,opacity:.9,
        blending:THREE.AdditiveBlending,depthWrite:false,color:0xffffff}));
    tube.rotation.x=Math.PI/2;sc.add(tube);
    // star streaks
    const N=700,arr=new Float32Array(N*3),spd=new Float32Array(N);
    for(let i=0;i<N;i++){const a=Math.random()*TAU,rr=2.2+Math.random()*5.6;
      arr[i*3]=Math.cos(a)*rr;arr[i*3+1]=Math.sin(a)*rr;arr[i*3+2]=-Math.random()*300;
      spd[i]=90+Math.random()*160;}
    const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(arr,3));
    const streaks=new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:.5,transparent:true,opacity:.9,
      blending:THREE.AdditiveBlending,depthWrite:false}));
    sc.add(streaks);
    // drifting galaxies
    const gals=[];
    for(let i=0;i<4;i++){
      const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:galaxyTex(i%2),transparent:true,opacity:.8,
        blending:THREE.AdditiveBlending,depthWrite:false}));
      sp.scale.setScalar(16+i*7);sp.position.set((Math.random()-.5)*10,(Math.random()-.5)*10,-70-i*70);
      sc.add(sp);gals.push(sp);
    }
    worm={sc,cam,tube,tubeTex,streaks,spd,gals};return worm;
  }
  function swirlStripeTex(){
    const cv=document.createElement('canvas');cv.width=256;cv.height=256;const x=cv.getContext('2d');
    x.fillStyle='#04050e';x.fillRect(0,0,256,256);
    for(let i=0;i<20;i++){x.strokeStyle=`rgba(${120+Math.random()*135|0},${120+Math.random()*135|0},255,${.15+Math.random()*.4})`;
      x.lineWidth=2+Math.random()*7;x.beginPath();const y=Math.random()*256;
      x.moveTo(0,y);x.bezierCurveTo(80,y-30+Math.random()*60,176,y-30+Math.random()*60,256,y);x.stroke();}
    const tx=new THREE.CanvasTexture(cv);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.repeat.set(3,4);
    tx.colorSpace=THREE.SRGBColorSpace;return tx;
  }
  function galaxyTex(kind){
    const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d');
    const g=x.createRadialGradient(64,64,2,64,64,62);
    g.addColorStop(0,'#fff');g.addColorStop(.3,kind?'rgba(155,124,246,.8)':'rgba(61,201,194,.8)');
    g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,128,128);
    for(let i=0;i<60;i++){x.fillStyle='rgba(255,255,255,'+(Math.random()*.7)+')';
      const a=Math.random()*TAU,r=Math.random()*58;x.fillRect(64+Math.cos(a)*r,64+Math.sin(a)*r,1.4,1.4);}
    const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;return tx;
  }

  /* ---------------- transit sequence ---------------- */
  window.transitTo=function(dstId){
    if(!gameOn||window._transit||window._cine)return;
    const src=REALMS[window._verse],dst=REALMS[dstId];if(!dst||dst===src)return;
    localStorage.setItem('trifable.verse',dstId);
    if(window.LoqiBus)LoqiBus.push('transit','🌀',`Wormhole transit · ${src.name} → ${dst.name}`);
    banner('Wormhole Transit',`${src.emo} ${src.name} → ${dst.emo} ${dst.name} — escaping to the galaxy between.`);
    const W=buildWormScene();
    const cSrc=new THREE.Color(src.grade.accent),cDst=new THREE.Color(dst.grade.accent);
    const startPos=camera.position.clone(),startQuat=camera.quaternion.clone();
    const norm=player.position.clone().normalize();
    const liftPos=norm.clone().multiplyScalar(PLANET_R+72).add(new THREE.Vector3(0,18,0));
    const T={phase:'lift',t:0,lift:1.05,tunnel:4.6,dst:dstId,rebuilt:false,skippable:false};
    window._transit=T;window._cine=true;
    skipHint.classList.remove('on');
    const onSkip=e=>{if(!T.skippable)return;if(e.type==='keydown'&&e.key!=='Enter')return;T.t=T.tunnel;};
    addEventListener('click',onSkip);addEventListener('keydown',onSkip);
    window._transitTick=function(dt){
      if(T.phase==='lift'){
        T.t+=dt;const k=Math.min(1,T.t/T.lift),e=k*k*(3-2*k);
        camera.position.lerpVectors(startPos,liftPos,e);
        camera.lookAt(player.position);
        composer.render();
        if(k>=1){T.phase='tunnel';T.t=0;veil.classList.add('on');
          setTimeout(()=>veil.classList.remove('on'),420);}
        return;
      }
      if(T.phase==='tunnel'){
        T.t+=dt;const k=Math.min(1,T.t/T.tunnel);
        if(T.t>1.1&&!T.skippable){T.skippable=true;skipHint.classList.add('on');}
        // colour bleed source → destination
        W.tube.material.color.copy(cSrc).lerp(cDst,k);
        W.streaks.material.color.copy(cSrc).lerp(cDst,Math.min(1,k*1.3)).lerp(new THREE.Color(0xffffff),.5);
        W.tubeTex.offset.y-=dt*(1.4+k*1.8);W.tubeTex.offset.x+=dt*.22;
        const pos=W.streaks.geometry.attributes.position;
        for(let i=0;i<W.spd.length;i++){let z=pos.getZ(i)+W.spd[i]*dt;if(z>4)z=-300-Math.random()*80;pos.setZ(i,z);}
        pos.needsUpdate=true;
        for(const g of W.gals){g.position.z+=dt*26;g.material.rotation+=dt*.3;
          if(g.position.z>16)g.position.z=-300;}
        W.cam.rotation.z+=dt*.16;
        // rebuild the destination planet under cover of the tunnel
        if(!T.rebuilt&&k>.45){T.rebuilt=true;try{rebuildVerse(T.dst);}catch(e){console.error('[wormhole] rebuild:',e);}}
        renderer.render(W.sc,W.cam);
        if(k>=1){
          if(!T.rebuilt){T.rebuilt=true;try{rebuildVerse(T.dst);}catch(e){}}
          T.phase='arrive';veil.classList.add('on');skipHint.classList.remove('on');
          removeEventListener('click',onSkip);removeEventListener('keydown',onSkip);
          setTimeout(()=>{
            const A=dst.anchorLive||dst.anchor;
            player.position.copy(s2c(A.t+.07,A.p+.06,PLANET_R+CHAR_H*0.1));
            velocity.set(0,0,0);onGround=true;
            const n2=player.position.clone().normalize();
            facingDir.copy(s2c(A.t,A.p,PLANET_R).sub(player.position)).projectOnPlane(n2).normalize();
            camYaw=0;camPitch=.08;intro=0;
            window._transit=null;window._transitTick=null;window._cine=false;
            camera.quaternion.copy(startQuat);
            veil.classList.remove('on');
            banner('Verse Landfall',`${dst.emo} ${dst.name} — ${dst.sub}. The hub lies ahead.`);
            if(window.LoqiBus)LoqiBus.push('transit','🪐',`Landfall · ${dst.name}`);
            save&&save();
          },430);
        }
        return;
      }
      // 'arrive' — hold the white veil for a beat
    };
  };

  /* ---------------- gate proximity + E to open ---------------- */
  let _nearGate=false;
  window.updateWormhole=function(dt){
    const G=window.WormholeGate;if(!G||!player)return;
    if(G.swirl){G.swirl.rotation.z-=dt*.55;G.trim.rotation.z+=dt*.3;}
    if(window._cine||window._transit||dialogOn){_nearGate=false;return;}
    const wp=new THREE.Vector3();G.group.getWorldPosition(wp);
    const d=player.position.distanceTo(wp);
    const pr=document.getElementById('prompt');
    if(d<3.4&&!near){
      if(!_nearGate){_nearGate=true;}
      pr.classList.add('show');
      document.getElementById('pkey').textContent='E · Ride the Wormhole';
      document.getElementById('pwho').textContent='Wormhole Gate · verse transit';
    }else if(_nearGate){_nearGate=false;
      if(!near)pr.classList.remove('show');
      document.getElementById('pkey').textContent='E · Interact';
    }
  };
  addEventListener('keydown',e=>{
    if(e.code==='KeyE'&&_nearGate&&gameOn&&!dialogOn&&!window._transit&&!window._cine)openWormholeMenu();
  });

  /* ---------------- boot hook ---------------- */
  const prevInit=window.init;
  window.init=async function(){
    await prevInit();
    mountUI();
    buildWormholeGate();
    if(typeof buildCollisionIndex==='function')buildCollisionIndex();
  };
})();
