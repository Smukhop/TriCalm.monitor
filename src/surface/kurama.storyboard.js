/* === kurama.storyboard.js — Unified Tri-System Storyboard ================
   Final orchestration layer that binds the three split verse-planets, the
   wormhole transit, AERIS scan shell, LOQI feed, and configured agent roster
   into one live storyboard. It is additive: no planet/wormhole/AERIS code is
   replaced, only observed and connected. ================================== */
(function(){
  'use strict';

  const REALM_IDS=['shinobi','pirate','saiyan'];
  const LS_KEY='loqi.storyboard.v1';
  const CORE_AGENTS=[
    {id:'kakashi',name:'Kakashi',tree:'build',role:'Copy-Ninja Reviewer',programme:'review'},
    {id:'naruto',name:'Naruto',tree:'build',role:'Shadow-Clone Builder',programme:'build'},
    {id:'sasuke',name:'Sasuke',tree:'build',role:'Sharingan Refactorer',programme:'refactor'},
    {id:'kurama',name:'Kurama',tree:'perf',role:'Nine-Tail Kernel',programme:'substrate'},
    {id:'vegeta',name:'Vegeta',tree:'perf',role:'Prince of Perf',programme:'performance'},
    {id:'bulma',name:'Bulma',tree:'perf',role:'Tooling Engineer',programme:'tooling'},
    {id:'loki',name:'Dev-Loki',tree:'route',role:'Trickster Aggregator',programme:'synthesis'},
    {id:'nami',name:'Nami',tree:'route',role:'Navigator Router',programme:'routing'},
    {id:'zoro',name:'Zoro',tree:'route',role:'Three-Sword Tester',programme:'testing'},
    {id:'robin',name:'Robin',tree:'route',role:'Archaeologist Docs',programme:'archive'}
  ];
  const SYSTEMS=[
    {id:'shinobi',k:'I',title:'Shinobi Kai',tag:'origin bridge',tone:'Courier memory, ravine crossing, lantern forest, ShuttleSensei skill loop.',agents:['kuro','raijin','yuki','goro','aria','taro','sage','whisk','rockli','kakashi','naruto','sasuke']},
    {id:'pirate',k:'II',title:'Grandline Tide',tag:'navigation sea',tone:'Plankway routes, harbor cargo, Elbaf causeway, agentic engineering crew.',agents:['lowkey','zoroh','sanjii','namiya','usaro','robina','franko','choppa','jinbay','loki','nami','zoro','robin']},
    {id:'saiyan',k:'III',title:'Sayajin Prime',tag:'capsule engine',tone:'Gravity lanes, SkillForge labs, performance proofs, AERIS resonance scans.',agents:['vageta','gosun','gojutsu','gohana','trunket','bulmara','picoroid','brolon','keflara','kurama','vegeta','bulma']}
  ];
  const ACTS=[
    {id:'gate',label:'Act 0',title:'Horizon Gate',agents:['kakashi','kurama','loki']},
    {id:'shinobi',label:'Act I',title:'Shinobi Kai',agents:['kuro','sage','naruto','sasuke','kakashi']},
    {id:'pirate',label:'Act II',title:'Grandline Tide',agents:['lowkey','robina','nami','zoro','loki']},
    {id:'saiyan',label:'Act III',title:'Sayajin Prime',agents:['vageta','picoroid','vegeta','bulma','kurama']},
    {id:'synthesis',label:'Finale',title:'Council Synthesis',agents:['sage','robina','picoroid','kuro','loki']}
  ];
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const byId=id=>SYSTEMS.find(s=>s.id===id);
  const realmColor=id=>'#'+new THREE.Color(REALMS[id].grade.accent).getHexString();

  function defaults(){return {
    open:false,visited:{shinobi:0,pirate:0,saiyan:0},scans:{shinobi:0,pirate:0,saiyan:0},
    transits:0,council:0,agentCompletions:0,focus:'gate',feed:[],bootedAt:Date.now()
  };}
  function loadState(){
    let raw=null;try{raw=JSON.parse(localStorage.getItem(LS_KEY)||'null');}catch(e){}
    const base=defaults(),s=Object.assign(base,raw||{});
    s.visited=Object.assign(defaults().visited,raw&&raw.visited||{});
    s.scans=Object.assign(defaults().scans,raw&&raw.scans||{});
    s.feed=Array.isArray(s.feed)?s.feed.slice(-28):[];
    return s;
  }
  const state=loadState();
  let saveTO=null,ready=false,renderTO=0,drawOn=false,storyOrbit=null,storyNodes={};
  function saveState(){clearTimeout(saveTO);saveTO=setTimeout(()=>{try{localStorage.setItem(LS_KEY,JSON.stringify(state));}catch(e){}},250);}
  function addFeed(type,text){
    state.feed.push({at:Date.now(),type,text});
    if(state.feed.length>28)state.feed.shift();
    saveState();if(state.open)renderSoon();
  }
  function pushStory(text){
    addFeed('story',text);
    try{if(window.LoqiBus)LoqiBus.push('story','🎬',text);}catch(e){}
  }
  function markVisit(id,why,quiet=false){
    if(!REALMS[id])return;
    const first=!state.visited[id];
    state.visited[id]=state.visited[id]||Date.now();
    state.focus=id;
    if(first&&!quiet)pushStory(`${REALMS[id].name} bound into the storyboard · ${why||'system online'}`);
    saveState();renderSoon();
  }
  function markScan(id,why){
    if(!REALMS[id])id=window._verse||'shinobi';
    state.scans[id]=(state.scans[id]||0)+1;
    state.focus=id;
    pushStory(`${REALMS[id].name} scan logged · ${why||'AERIS profile linked'}`);
  }
  function agentsConfigured(){
    const realmAgents=ROSTER.filter(c=>REALM_IDS.includes(c.realm));
    const rosterOk=realmAgents.length>=27&&realmAgents.every(c=>c.id&&c.name&&c.title&&c.ability&&c.ward&&c.kind&&c.realm);
    const coreOk=CORE_AGENTS.length===10&&CORE_AGENTS.every(c=>c.id&&c.name&&c.tree&&c.role&&c.programme);
    const perRealm=REALM_IDS.reduce((a,id)=>(a[id]=realmAgents.filter(c=>c.realm===id).length,a),{});
    const mapped=SYSTEMS.every(s=>s.agents.every(id=>realmAgents.some(r=>r.id===id)||CORE_AGENTS.some(c=>c.id===id)));
    return {ok:rosterOk&&coreOk&&mapped,realmAgents:realmAgents.length,coreAgents:CORE_AGENTS.length,perRealm,mapped};
  }
  function metrics(){
    const current=window._verse||'shinobi',cfg=agentsConfigured();
    const systems={};
    for(const id of REALM_IDS){
      const all=window.Planets?Planets.districtsOf(id):WORLD_SPEC.districts.filter(d=>realmAt(d.t).id===id);
      systems[id]={visited:!!state.visited[id],scans:state.scans[id]||0,
        districts:all.length,trails:(window.Planets&&Planets.trails[id]||[]).length,
        gems:(window._gemLog&&window._gemLog[id])||0,agents:cfg.perRealm[id]||0,active:current===id};
    }
    return {current,systems,visited:REALM_IDS.filter(id=>state.visited[id]).length,scans:Object.values(state.scans).reduce((a,b)=>a+(+b||0),0),
      transits:state.transits,council:state.council,agentCompletions:state.agentCompletions,
      dispatch:typeof doneSet!=='undefined'?doneSet.size:0,dispatchTotal:typeof TOTAL!=='undefined'?TOTAL:6,
      shards:typeof shardCount!=='undefined'?shardCount:0,shardTotal:typeof SHARD_GOAL!=='undefined'?SHARD_GOAL:24,
      artifacts:(window.Artifacts||[]).length,configured:cfg};
  }
  window.LoqiStoryboard={open:()=>toggle(true),close:()=>toggle(false),toggle,markVisit,markScan,metrics,agentsConfigured,get ready(){return ready;}};

  function systemProgress(id){
    const m=metrics(),s=m.systems[id];let n=0;
    if(s.visited)n++;if(s.active)n++;if(s.districts>0)n++;if(s.scans>0)n++;if(s.gems>0||m.artifacts>0||m.shards>0)n++;
    return Math.round(n/5*100);
  }
  function actProgress(id){
    const m=metrics();
    if(REALM_IDS.includes(id))return systemProgress(id);
    if(id==='gate'){
      let n=0;if(typeof gameOn!=='undefined'&&gameOn)n++;if(window._verse)n++;if(window.LoqiBus)n++;if(window.AERIS)n++;
      return Math.round(n/4*100);
    }
    let n=0;if(m.visited===3)n++;if(m.transits>=2)n++;if(m.configured.ok)n++;if(m.council>0)n++;
    return Math.round(n/4*100);
  }
  function currentTitle(){const id=(metrics().current||'shinobi');const sys=byId(id);return sys?sys.title:'Horizon Gate';}

  function mountUI(){
    if(document.getElementById('storyBoard'))return;
    const css=document.createElement('style');css.textContent=`
    #storyBoard{position:fixed;left:14px;top:96px;width:min(408px,calc(100vw - 28px));max-height:calc(100vh - 190px);
      z-index:66;overflow:auto;padding:15px;border:1px solid rgba(255,176,104,.22);border-radius:14px;
      background:rgba(5,6,15,.82);backdrop-filter:blur(18px) saturate(1.32);-webkit-backdrop-filter:blur(18px) saturate(1.32);
      box-shadow:0 26px 90px rgba(0,0,0,.44),inset 0 0 0 1px rgba(255,255,255,.025);font-family:var(--mono);
      color:var(--cream);opacity:0;pointer-events:none;transform:translateX(-14px);transition:.28s ease;}
    #storyBoard.open{opacity:1;pointer-events:all;transform:none;}#storyBoard::-webkit-scrollbar{width:5px}
    #storyBoard::-webkit-scrollbar-thumb{background:rgba(255,176,104,.28);border-radius:4px}
    .sbTop{display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(255,176,104,.12);padding-bottom:11px;margin-bottom:10px}
    .sbLogo{width:34px;height:34px;border-radius:10px;border:1px solid var(--gold);display:grid;place-items:center;color:var(--gold);
      box-shadow:0 0 20px rgba(255,176,104,.22)}.sbTitle{font-family:var(--disp);font-weight:800;font-size:.92rem;letter-spacing:.24em;text-transform:uppercase}
    .sbSub{font-size:.52rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(207,227,255,.56);margin-top:2px}.sbX{margin-left:auto;border:0;background:transparent;color:rgba(240,224,210,.58);font-size:1.1rem}
    #storyLinks{position:relative;inset:auto;display:block;width:100%;height:152px;border:1px solid rgba(255,255,255,.055);border-radius:10px;
      background:radial-gradient(circle at 50% 50%,rgba(155,124,246,.12),rgba(5,6,15,.28) 54%,rgba(0,0,0,.24));margin:10px 0 11px}
    .sbPulse{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px}.sbP{padding:7px 8px;border:1px solid rgba(255,255,255,.065);
      border-radius:9px;background:rgba(255,255,255,.035)}.sbP b{display:block;font-size:.48rem;letter-spacing:.16em;text-transform:uppercase;color:rgba(207,227,255,.56)}
    .sbP span{font-family:var(--disp);font-weight:800;font-size:.82rem}.sbHead{font-family:var(--disp);font-size:.6rem;letter-spacing:.22em;text-transform:uppercase;color:rgba(207,227,255,.62);margin:12px 0 7px}
    .sbSystem,.sbAct{border:1px solid rgba(255,255,255,.075);border-radius:11px;padding:10px 11px;margin-bottom:8px;background:rgba(255,255,255,.035)}
    .sbSystem.on{border-color:var(--sys);box-shadow:0 12px 38px -26px var(--sys),inset 0 0 0 1px color-mix(in srgb,var(--sys) 55%,transparent)}
    .sbH{display:flex;align-items:center;gap:7px;font-family:var(--disp);font-weight:800;font-size:.74rem;letter-spacing:.15em;text-transform:uppercase}.sbH i{font-style:normal;color:var(--sys)}
    .sbH small{margin-left:auto;font-family:var(--mono);font-size:.48rem;color:var(--sys);letter-spacing:.16em}.sbTone{font-size:.56rem;line-height:1.55;color:rgba(240,224,210,.64);margin:5px 0 8px}
    .sbMeta{display:flex;flex-wrap:wrap;gap:5px}.sbMeta span{font-size:.49rem;letter-spacing:.08em;text-transform:uppercase;color:rgba(207,227,255,.62);border:1px solid rgba(255,255,255,.06);border-radius:999px;padding:2px 7px}
    .sbBar{height:3px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden;margin-top:8px}.sbBar i{display:block;height:100%;background:var(--sys);width:0;transition:width .35s ease}
    .sbActions{display:flex;gap:6px;margin-top:9px}.sbActions button{flex:1;border:1px solid color-mix(in srgb,var(--sys) 58%,transparent);background:rgba(255,255,255,.035);
      color:var(--cream);border-radius:8px;padding:7px 6px;font-family:var(--disp);font-size:.56rem;letter-spacing:.16em;text-transform:uppercase}
    .sbAct{display:grid;grid-template-columns:54px 1fr 48px;gap:9px;align-items:center}.sbAct .lab{font-family:var(--disp);font-weight:800;font-size:.58rem;letter-spacing:.14em;color:var(--gold)}
    .sbAct .nm{font-family:var(--disp);font-weight:800;font-size:.68rem;letter-spacing:.12em}.sbAct .ag{font-size:.5rem;color:rgba(207,227,255,.55);line-height:1.45;margin-top:2px}
    .sbPct{font-family:var(--disp);font-weight:800;text-align:right;color:var(--gold)}.sbFeed{font-size:.55rem;line-height:1.48;color:rgba(240,224,210,.64);border-top:1px solid rgba(255,255,255,.06);padding-top:8px}
    .sbFeed div{display:flex;gap:7px;padding:3px 0}.sbFeed b{color:var(--teal);font-weight:600;white-space:nowrap}
    @media(max-width:760px){#storyBoard{top:92px;left:8px;right:8px;width:auto;max-height:calc(100vh - 218px)}#storyBoard.open{transform:none}.sbPulse{grid-template-columns:repeat(2,1fr)}}`;
    document.head.appendChild(css);
    const panel=document.createElement('div');panel.id='storyBoard';document.body.appendChild(panel);
    panel.addEventListener('click',handlePanelClick);
    const rail=document.getElementById('rail');
    if(rail&&!document.getElementById('storyRailBtn')){
      const btn=document.createElement('button');btn.className='rbtn';btn.id='storyRailBtn';btn.innerHTML='🎬<span class="tip">Story</span>';btn.onclick=()=>toggle();rail.insertBefore(btn,rail.firstChild);
    }
    document.addEventListener('keydown',e=>{if(e.code==='KeyY'&&gameOn&&!dialogOn)toggle();});
    buildSceneLinks();render();startDraw();
  }
  function toggle(force){
    state.open=force!==undefined?!!force:!state.open;
    const p=document.getElementById('storyBoard');if(p)p.classList.toggle('open',state.open);
    document.body.dataset.storyOpen=state.open?'1':'0';
    if(state.open)render();
  }
  function renderSoon(){clearTimeout(renderTO);renderTO=setTimeout(render,80);}
  function render(){
    const p=document.getElementById('storyBoard');if(!p)return;
    const m=metrics(),cfg=m.configured;
    p.innerHTML=`<div class="sbTop"><div class="sbLogo">◎</div><div><div class="sbTitle">Story Board</div><div class="sbSub">tri-system arc · ${esc(currentTitle())}</div></div><button class="sbX" data-close>×</button></div>
      <canvas id="storyLinks"></canvas>
      <div class="sbPulse"><div class="sbP"><b>Systems</b><span>${m.visited}/3</span></div><div class="sbP"><b>Transits</b><span>${m.transits}</span></div><div class="sbP"><b>Agents</b><span>${cfg.realmAgents+cfg.coreAgents}</span></div><div class="sbP"><b>Artifacts</b><span>${m.artifacts}</span></div></div>
      <div class="sbHead">Planetary Systems</div>${SYSTEMS.map(s=>systemHTML(s,m)).join('')}
      <div class="sbHead">Storyboard</div>${ACTS.map(actHTML).join('')}
      <div class="sbHead">Agent Configuration</div><div class="sbSystem ${cfg.ok?'on':''}" style="--sys:${cfg.ok?'var(--teal)':'var(--crimson)'}">
        <div class="sbH"><i>${cfg.ok?'●':'○'}</i> All agent lanes ${cfg.ok?'<small>configured</small>':'<small>needs map</small>'}</div>
        <div class="sbTone">${cfg.realmAgents} realm agents across Shinobi, Grandline, Sayajin plus ${cfg.coreAgents} LOQI core agents. Story acts reference actual courier and council identities.</div>
        <div class="sbMeta"><span>Shinobi ${cfg.perRealm.shinobi||0}</span><span>Grandline ${cfg.perRealm.pirate||0}</span><span>Sayajin ${cfg.perRealm.saiyan||0}</span><span>Core ${cfg.coreAgents}</span></div>
      </div>${feedHTML()}`;
  }
  function systemHTML(s,m){
    const st=m.systems[s.id],pct=systemProgress(s.id),active=st.active,style=`--sys:${realmColor(s.id)}`;
    return `<div class="sbSystem ${active?'on':''}" style="${style}"><div class="sbH"><i>${s.k}</i> ${esc(s.title)} <small>${active?'active':st.visited?'linked':'queued'}</small></div>
      <div class="sbTone">${esc(s.tone)}</div><div class="sbMeta"><span>${st.districts} districts</span><span>${st.trails} trails</span><span>${st.agents} agents</span><span>${st.scans} scans</span><span>${st.gems} gems</span></div>
      <div class="sbBar"><i style="width:${pct}%"></i></div><div class="sbActions">
        <button data-go="${s.id}">${gameOn?(active?'Focus':'Transit'):'Dive'}</button><button data-scan="${s.id}">Scan</button><button data-agents="${s.id}">Agents</button>
      </div></div>`;
  }
  function actHTML(a){
    const pct=actProgress(a.id),sys=REALM_IDS.includes(a.id)?a.id:(a.id==='synthesis'?'pirate':'shinobi');
    return `<div class="sbAct" style="--sys:${realmColor(sys)}"><div class="lab">${esc(a.label)}</div><div><div class="nm">${esc(a.title)}</div><div class="ag">${a.agents.map(esc).join(' · ')}</div><div class="sbBar"><i style="width:${pct}%"></i></div></div><div class="sbPct">${pct}%</div></div>`;
  }
  function feedHTML(){
    if(!state.feed.length)return '<div class="sbFeed"><div><b>feed</b><span>Storyboard is listening for landfalls, scans, agent completions and council calls.</span></div></div>';
    return `<div class="sbFeed">${state.feed.slice(-6).reverse().map(f=>`<div><b>${esc(f.type)}</b><span>${esc(f.text)}</span></div>`).join('')}</div>`;
  }
  function handlePanelClick(e){
    const close=e.target.closest('[data-close]');if(close){toggle(false);return;}
    const go=e.target.closest('[data-go]');if(go){routeTo(go.dataset.go);return;}
    const scan=e.target.closest('[data-scan]');if(scan){openScanner(scan.dataset.scan);return;}
    const agents=e.target.closest('[data-agents]');if(agents){openAgents(agents.dataset.agents);return;}
  }
  function routeTo(id){
    if(!REALMS[id])return;
    if(!gameOn&&typeof window.chooseVerse==='function'){window.chooseVerse(id);return;}
    if(gameOn&&window._verse!==id&&typeof window.transitTo==='function'){window.transitTo(id);return;}
    markVisit(id,'story focus');
    try{banner('Story Focus',`${REALMS[id].emo} ${REALMS[id].name} · ${byId(id).tag}`);}catch(e){}
  }
  function openScanner(id){
    markScan(id,'story scan command');
    if(gameOn&&window._verse!==id&&typeof window.transitTo==='function')window.transitTo(id);
    setTimeout(()=>{const b=document.getElementById('aerisRailBtn');if(b)b.click();},120);
  }
  function openAgents(id){
    state.focus=id;saveState();
    const b=document.getElementById('loqiBtn');if(b&&!document.getElementById('loqiOS')?.classList.contains('open'))b.click();
    pushStory(`${REALMS[id].name} agent lane opened · ${byId(id).agents.length} configured seats`);
  }

  function buildSceneLinks(){
    if(storyOrbit||typeof scene==='undefined'||!scene||!window.THREE)return;
    storyOrbit=new THREE.Group();storyOrbit.name='LOQI Storyboard Tri-System Links';scene.add(storyOrbit);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(PLANET_R*1.74,.018,6,180),new THREE.MeshBasicMaterial({color:0xffb068,transparent:true,opacity:.18,blending:THREE.AdditiveBlending,depthWrite:false}));
    ring.rotation.x=Math.PI/2.08;storyOrbit.add(ring);
    const pts=[];
    REALM_IDS.forEach((id,i)=>{
      const a=i*Math.PI*2/3-Math.PI/2,pos=new THREE.Vector3(Math.cos(a)*PLANET_R*1.65,Math.sin(a*1.7)*PLANET_R*.16,Math.sin(a)*PLANET_R*1.65);
      pts.push(pos);
      const node=new THREE.Mesh(new THREE.SphereGeometry(.46,18,12),new THREE.MeshBasicMaterial({color:REALMS[id].grade.accent,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false}));
      node.position.copy(pos);node.userData.storyId=id;storyOrbit.add(node);storyNodes[id]=node;
      const glow=new THREE.Mesh(new THREE.SphereGeometry(.86,16,10),new THREE.MeshBasicMaterial({color:REALMS[id].grade.accent,transparent:true,opacity:.14,blending:THREE.AdditiveBlending,depthWrite:false}));
      glow.position.copy(pos);glow.userData.storyGlow=id;storyOrbit.add(glow);
    });
    for(let i=0;i<pts.length;i++){
      const a=pts[i],b=pts[(i+1)%pts.length],mid=a.clone().add(b).multiplyScalar(.5).normalize().multiplyScalar(PLANET_R*1.92);
      const curve=new THREE.CatmullRomCurve3([a,mid,b]);
      const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(40)),new THREE.LineBasicMaterial({color:0xcfe3ff,transparent:true,opacity:.2,blending:THREE.AdditiveBlending,depthWrite:false}));
      storyOrbit.add(line);
    }
  }
  function updateSceneLinks(dt){
    if(!storyOrbit)return;const t=performance.now()*.001,cur=window._verse||'shinobi';
    storyOrbit.visible=!!gameOn;storyOrbit.rotation.y+=dt*.045;storyOrbit.rotation.x=Math.sin(t*.25)*.035;
    Object.entries(storyNodes).forEach(([id,node],i)=>{const on=id===cur,seen=!!state.visited[id],s=(on?1.65:seen?1.25:1.0)+Math.sin(t*2.2+i)*.08;
      node.scale.setScalar(s);node.material.opacity=on?.98:seen?.68:.42;});
  }

  function startDraw(){if(drawOn)return;drawOn=true;requestAnimationFrame(drawLinks);}
  function drawLinks(){
    const cv=document.getElementById('storyLinks');
    if(cv){
      const box=cv.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2),w=Math.max(1,box.width),h=Math.max(1,box.height);
      if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);}
      const x=cv.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,w,h);
      const t=performance.now()*.001,c={x:w/2,y:h/2},nodes=REALM_IDS.map((id,i)=>({id,x:c.x+Math.cos(i*Math.PI*2/3-Math.PI/2)*w*.31,y:c.y+Math.sin(i*Math.PI*2/3-Math.PI/2)*h*.34}));
      x.lineWidth=1.4;
      for(let i=0;i<nodes.length;i++){const a=nodes[i],b=nodes[(i+1)%nodes.length],seen=state.visited[a.id]&&state.visited[b.id];
        x.strokeStyle=seen?'rgba(207,227,255,.52)':'rgba(207,227,255,.16)';x.beginPath();x.moveTo(a.x,a.y);x.quadraticCurveTo(c.x,c.y,b.x,b.y);x.stroke();}
      x.fillStyle='rgba(255,176,104,.16)';x.beginPath();x.arc(c.x,c.y,21+Math.sin(t*2)*2,0,Math.PI*2);x.fill();
      x.strokeStyle='rgba(255,176,104,.65)';x.beginPath();x.arc(c.x,c.y,13,0,Math.PI*2);x.stroke();
      x.font='10px JetBrains Mono, monospace';x.textAlign='center';x.textBaseline='middle';
      nodes.forEach((n,i)=>{const active=n.id===(window._verse||'shinobi'),seen=!!state.visited[n.id],r=active?12:seen?9:7;
        x.fillStyle=realmColor(n.id);x.globalAlpha=active?.95:seen?.7:.42;x.beginPath();x.arc(n.x,n.y,r+Math.sin(t*2+i)*1.4,0,Math.PI*2);x.fill();
        x.globalAlpha=1;x.fillStyle='#f0e0d2';x.fillText(byId(n.id).k,n.x,n.y);});
    }
    requestAnimationFrame(drawLinks);
  }

  function installHooks(){
    if(window.LoqiBus&&LoqiBus.push&&!LoqiBus.push._storyWrapped){
      const old=LoqiBus.push.bind(LoqiBus);
      const wrapped=function(type,icon,text){const out=old(type,icon,text);ingestBus(type,text);return out;};
      wrapped._storyWrapped=true;LoqiBus.push=wrapped;
    }
    if(typeof window.chooseVerse==='function'&&!window.chooseVerse._storyWrapped){
      const old=window.chooseVerse;
      const wrapped=function(id){markVisit(id,'verse gate dive');return old.apply(this,arguments);};
      wrapped._storyWrapped=true;window.chooseVerse=wrapped;
    }
    if(typeof window.transitTo==='function'&&!window.transitTo._storyWrapped){
      const old=window.transitTo;
      const wrapped=function(id){const from=window._verse;if(from&&id&&from!==id){state.transits++;markVisit(id,`wormhole route ${from} to ${id}`,true);pushStory(`Wormhole link resolved · ${REALMS[from].name} to ${REALMS[id].name}`);}
        const out=old.apply(this,arguments);[700,1800,4200,6800].forEach(ms=>setTimeout(renderSoon,ms));return out;};
      wrapped._storyWrapped=true;window.transitTo=wrapped;
    }
    if(typeof window.banner==='function'&&!window.banner._storyWrapped){
      const old=window.banner;
      const wrapped=function(k,t){const out=old.apply(this,arguments);ingestBanner(k,t);return out;};
      wrapped._storyWrapped=true;window.banner=wrapped;
    }
    if(typeof window.updateLoqi==='function'&&!window.updateLoqi._storyWrapped){
      const old=window.updateLoqi;
      const wrapped=function(dt){const out=old.apply(this,arguments);update(dt||0);return out;};
      wrapped._storyWrapped=true;window.updateLoqi=wrapped;
    }
  }
  function ingestBus(type,text){
    if(type==='council'&&/Council convened/i.test(text||'')){state.council++;addFeed('council',text);}
    else if(type==='work'){state.agentCompletions++;addFeed('agent',text);}
    else if(type==='gem'){addFeed('artifact',text);}
    else if(type==='transit'){addFeed('transit',text);}
  }
  function ingestBanner(k,t){
    const text=`${k} · ${t}`;
    if(/AERIS/i.test(k||''))markScan(window._verse||'shinobi',k);
    else if(/Verse Landfall|Verse Dive/i.test(k||''))markVisit(window._verse||'shinobi',k,true);
    else if(/Final Delivery|Horizon Synced/i.test(k||'')){state.focus='synthesis';addFeed('story',text);}
  }
  function update(dt){
    if(gameOn)markVisit(window._verse||'shinobi','active runtime',true);
    updateSceneLinks(dt||0);
    if(state.open)renderSoon();
  }

  const prevInit=window.init;
  window.init=async function(){
    const out=await prevInit.apply(this,arguments);
    try{
      installHooks();mountUI();markVisit(window._verse||localStorage.getItem('trifable.verse')||'shinobi','boot restore',true);
      ready=true;document.body.dataset.storyboard='1';
      try{const qa=Game.selfTest();document.body.dataset.qa=qa.pass?'pass':'fail';document.body.dataset.storyQA=qa.checks.storyboardLayer&&qa.checks.agentsConfigured?'pass':'fail';}catch(e){}
      pushStory('Unified storyboard online · planets, wormhole, AERIS, LOQI and agents linked');
    }catch(e){console.warn('[storyboard] init skipped:',e);}
    return out;
  };
})();
