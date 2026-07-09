/* === kurama.verses.js — Tri-Planet Verse Gate ==============================
   Decompiles the three fables into three visible planets at initialization.
   When the boot bar completes, the single BEGIN gives way to a verse gate:
   three live-rendered miniature planets — Shinobi, Pirate, Saiyan — each a
   stylized decompilation of its realm (palette, ring, moons, hub roster,
   lead courier). Choosing one:
     1) assigns that verse's lead courier as the avatar,
     2) spawns the player at the realm's anchor hub,
     3) fires the native orbit-dive so the camera falls out of space onto
        that planet-region of the walkable globe,
     4) tunes the painterly grade to the verse before the first frame lands.
   The full globe remains one seamless world — the verse chosen is simply
   which planet-face of the tri-fabled horizon you dive into first.
   Keyboard 1/2/3 selects; last verse is remembered. Classic script. ======= */
(function(){
  'use strict';
  const LS_VERSE='trifable.verse';
  const LEADS={shinobi:'kuro',pirate:'lowkey',saiyan:'vageta'};
  /* per-verse mini-planet palettes: [low terrain, high terrain, sea, ring] */
  const MINI_PAL={
    shinobi:[0x2f6b3a,0x9fc46a,0x1d4a46,0xF2843D],
    pirate:[0x1d5f66,0xd8c08a,0x123a52,0x3DC9C2],
    saiyan:[0x2a2a4a,0x8a7ad8,0x141628,0x9B7CF6]};

  /* ---------------- gate DOM + CSS ---------------- */
  const css=document.createElement('style');css.textContent=`
  #verseGate{margin-top:2.1rem;display:none;gap:18px;opacity:0;transition:opacity .9s ease;}
  #verseGate.show{display:flex;opacity:1;}
  .verseCard{width:min(200px,27vw);border:1px solid var(--line);border-radius:18px;padding:12px 12px 14px;
    background:rgba(10,12,24,.55);backdrop-filter:blur(12px) saturate(1.15);-webkit-backdrop-filter:blur(12px) saturate(1.15);
    cursor:pointer;text-align:center;transition:all .28s ease;position:relative;overflow:hidden;}
  .verseCard:hover{transform:translateY(-6px);border-color:var(--vc,var(--gold));
    box-shadow:0 22px 44px -18px var(--vc,var(--gold));}
  .verseCard canvas{width:100%;aspect-ratio:1;display:block;}
  .verseCard .vn{font-family:var(--disp);font-weight:700;font-size:.82rem;letter-spacing:.2em;text-transform:uppercase;color:var(--cream);margin-top:2px;}
  .verseCard .vs{font-family:var(--mono);font-size:.55rem;letter-spacing:.16em;text-transform:uppercase;color:var(--frost);opacity:.8;margin-top:3px;}
  .verseCard .vh{font-family:var(--mono);font-size:.52rem;color:var(--frost);opacity:.6;margin-top:7px;line-height:1.6;}
  .verseCard .vk{position:absolute;top:9px;left:11px;font-family:var(--mono);font-size:.6rem;color:var(--frost);opacity:.55;}
  .verseCard .vlast{position:absolute;top:9px;right:11px;font-family:var(--mono);font-size:.5rem;letter-spacing:.12em;
    color:var(--gold);border:1px solid rgba(255,176,104,.4);border-radius:999px;padding:2px 7px;display:none;}
  .verseCard.last .vlast{display:block;}
  .verseCard .vgo{margin-top:9px;font-family:var(--disp);font-weight:600;font-size:.6rem;letter-spacing:.3em;
    text-transform:uppercase;color:var(--vc,var(--gold));opacity:.9;}
  #verseHint{margin-top:1.05rem;font-family:var(--mono);font-size:.55rem;letter-spacing:.22em;text-transform:uppercase;
    color:var(--frost);opacity:0;transition:opacity .9s ease .35s;}
  #verseGate.show~#verseHint{opacity:.65;}
  @media(max-width:640px){#verseGate{flex-direction:column;align-items:center;}
    .verseCard{width:min(240px,72vw);display:flex;align-items:center;gap:10px;text-align:left;padding:10px 14px;}
    .verseCard canvas{width:84px;flex:0 0 84px;}}`;
  document.head.appendChild(css);

  /* ---------------- mini planet renderer (one shared low-cost context per card) --- */
  const minis=[];
  function buildMiniPlanet(canvas,realmId){
    const pal=MINI_PAL[realmId],grade=REALMS[realmId].grade;
    const r=new THREE.WebGLRenderer({canvas,antialias:false,alpha:true,preserveDrawingBuffer:true});
    r.setSize(190,190,false);r.setPixelRatio(1);
    const sc=new THREE.Scene();
    const cam=new THREE.PerspectiveCamera(38,1,.1,50);cam.position.set(0,1.1,4.6);cam.lookAt(0,0,0);
    sc.add(new THREE.AmbientLight(0xffffff,.55));
    const dl=new THREE.DirectionalLight(0xfff2dd,1.5);dl.position.set(3,4,5);sc.add(dl);
    const rig=new THREE.Group();sc.add(rig);
    // terrain: displaced icosahedron, vertex-coloured low→high
    const geo=new THREE.IcosahedronGeometry(1.18,3);
    const pos=geo.attributes.position,col=[];const cLo=new THREE.Color(pal[0]),cHi=new THREE.Color(pal[1]),v=new THREE.Vector3();
    for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i);
      const n=Math.sin(v.x*3.1)*Math.cos(v.y*2.7)*Math.sin(v.z*3.6);
      const h=.5+.5*n;v.normalize().multiplyScalar(1.18+n*.09);pos.setXYZ(i,v.x,v.y,v.z);
      const c=cLo.clone().lerp(cHi,h);col.push(c.r,c.g,c.b);}
    geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.computeVertexNormals();
    rig.add(new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true})));
    // sea shell + atmosphere
    rig.add(new THREE.Mesh(new THREE.SphereGeometry(1.185,24,18),
      new THREE.MeshLambertMaterial({color:pal[2],transparent:true,opacity:.85})));
    rig.add(new THREE.Mesh(new THREE.SphereGeometry(1.34,24,18),
      new THREE.MeshBasicMaterial({color:grade.accent,transparent:true,opacity:.10,blending:THREE.AdditiveBlending,side:THREE.BackSide})));
    // accent ring + two moons
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1.78,.03,6,48),
      new THREE.MeshBasicMaterial({color:pal[3],transparent:true,opacity:.75,blending:THREE.AdditiveBlending}));
    ring.rotation.x=Math.PI/2.25;rig.add(ring);
    const moons=[];for(let i=0;i<2;i++){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.09+i*.04,1),
      new THREE.MeshLambertMaterial({color:0xd8dbe6}));rig.add(m);moons.push(m);}
    minis.push({r,sc,cam,rig,ring,moons,ph:Math.random()*6});
  }
  let _miniOn=true,_miniLast=0;
  function miniLoop(ts){
    if(!_miniOn)return;
    const dt=Math.min(.05,(ts-_miniLast)/1000||.016);_miniLast=ts;
    for(const m of minis){m.ph+=dt;
      m.rig.rotation.y+=dt*.4;m.rig.position.y=Math.sin(m.ph*.9)*.05;
      m.moons.forEach((mo,i)=>{const a=m.ph*(0.9+i*.5)+i*2.4;
        mo.position.set(Math.cos(a)*1.95,Math.sin(a*.7)*.4,Math.sin(a)*1.95);});
      m.r.render(m.sc,m.cam);}
    requestAnimationFrame(miniLoop);
  }
  function disposeMinis(){_miniOn=false;
    for(const m of minis){m.sc.traverse(o=>{o.geometry&&o.geometry.dispose();o.material&&o.material.dispose();});
      m.r.dispose();}
    minis.length=0;}

  /* ---------------- gate assembly ---------------- */
  function buildGate(){
    const inner=document.querySelector('#boot .boot-inner');if(!inner)return;
    const bgBtn=document.getElementById('bootgo');if(bgBtn)bgBtn.style.display='none';
    const gate=document.createElement('div');gate.id='verseGate';
    const last=localStorage.getItem(LS_VERSE);
    let key=1;
    for(const id of['shinobi','pirate','saiyan']){
      const r=REALMS[id],lead=ROSTER.find(c=>c.id===LEADS[id]);
      const card=document.createElement('div');card.className='verseCard'+(last===id?' last':'');
      card.style.setProperty('--vc','#'+new THREE.Color(r.grade.accent).getHexString());
      card.innerHTML=`<span class="vk">${key}</span><span class="vlast">last dive</span>
        <canvas width="190" height="190"></canvas>
        <div><div class="vn">${r.emo} ${r.name.replace(' Realm','')}</div>
        <div class="vs">${r.sub}</div>
        <div class="vh">${r.districts.length} districts · hub ${WORLD_SPEC.districts.find(d=>d.id===r.hub)?.name||r.hub}<br>
        lead courier ${lead.emo} ${lead.name}</div>
        <div class="vgo">Dive In ↓</div></div>`;
      card.onclick=()=>chooseVerse(id);
      gate.appendChild(card);
      buildMiniPlanet(card.querySelector('canvas'),id);
      key++;
    }
    const hint=document.createElement('div');hint.id='verseHint';
    hint.textContent='choose a verse · keys 1 / 2 / 3 · one horizon, three fables';
    inner.appendChild(gate);inner.appendChild(hint);
    requestAnimationFrame(()=>gate.classList.add('show'));
    requestAnimationFrame(miniLoop);
    addEventListener('keydown',verseKeys);
  }
  function verseKeys(e){
    if(gameOn)return;
    const map={Digit1:'shinobi',Digit2:'pirate',Digit3:'saiyan'};
    if(map[e.code])chooseVerse(map[e.code]);
  }

  /* ---------------- dive-in ---------------- */
  window.chooseVerse=function(id){
    const r=REALMS[id];if(!r||gameOn)return;
    localStorage.setItem(LS_VERSE,id);
    if(window.Planets&&id!==window._verse)Planets.rebuild(id); // decompile the horizon into the chosen verse-planet
    // 1) verse lead courier becomes the avatar
    const li=ROSTER.findIndex(c=>c.id===LEADS[id]);
    if(li>=0){curChar=li;}
    // 2) spawn at the realm anchor hub (slight offset off the plaza heart)
    const VA=r.anchorLive||r.anchor;
    player.position.copy(s2c(VA.t+.07,VA.p+.06,PLANET_R+CHAR_H*0.1));
    velocity.set(0,0,0);onGround=true;
    const n=player.position.clone().normalize();
    facingDir.copy(s2c(VA.t,VA.p,PLANET_R).sub(player.position)).projectOnPlane(n).normalize();
    camYaw=0;camPitch=0.08;
    // 3) pre-tune the verse grade so the dive lands already colour-correct
    if(typeof updateRealms==='function')updateRealms(0.4);
    document.body.dataset.realm=id;
    // 4) hand off to the native begin (audio, UI live, intro orbit-dive)
    disposeMinis();removeEventListener('keydown',verseKeys);
    applyChar();syncSwitch();
    document.getElementById('bootgo').click();
    banner('Verse Dive',`${r.emo} ${r.name} — ${r.sub}. Falling toward the ${WORLD_SPEC.districts.find(d=>d.id===r.hub)?.name||r.hub}.`);
    save&&save();
  };
  window.Verses={leads:LEADS,choose:window.chooseVerse,last:()=>localStorage.getItem(LS_VERSE)};

  /* ---------------- boot hook: gate appears when the bar completes -------- */
  const prevInit=window.init;
  window.init=async function(){
    await prevInit();
    buildGate();
  };
})();
