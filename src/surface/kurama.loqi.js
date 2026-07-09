/* === kurama.loqi.js — LOQI⁘MONITOR Orchestration OS ========================
   The LOQI planetary framework ported into the game as the operating layer
   that watches all three verse-planets at once. One dock, four panes:
     ◉ VERSES    — live telemetry per planet: districts discovered, trails,
                   wire-gems banked, dispatch legs touching that verse,
                   one-tap wormhole transit
     ⛩ AGENTS    — the 27 realm subagents as a working council. The Shinobi
                   guild runs the ShuttleSensei sport-skills programme; the
                   Grandline crew and Sayajin cadre run the WorleyVerse
                   agentic-engineering programme. Each agent carries a live
                   task with progress; finished work posts to the feed.
                   A council box deliberates: three realm elders answer,
                   the Nine-Tail Kernel synthesizes.
     📡 FEED     — the notification centre: every banner, gem, transit,
                   delivery and agent completion lands here with timestamps
     💠 ARTIFACTS— everything banked: collected wire-gem dispatches, photon
                   shards, codex unlocks
   Toggle with the LOQI button or the L key. Classic script. =============== */
(function(){
  'use strict';

  /* ---------------- event bus (the notification centre spine) ------------- */
  const LOG=[];
  window.LoqiBus={
    log:LOG,
    push(type,icon,text){
      LOG.push({at:Date.now(),type,icon,text});
      if(LOG.length>140)LOG.shift();
      const b=document.getElementById('loqiBadge');
      if(b&&!state.open){state.unread++;b.textContent=state.unread;b.classList.add('on');}
      if(state.open&&state.pane==='feed')renderPane();
    }
  };

  /* ---------------- subagent work programmes ---------------- */
  const PROGRAMMES={
    engineering:{name:'WorleyVerse Agentic Engineering',icon:'🏗',tasks:[
      'Speed FEED Studio v3.4 · report defect sweep','Leonard LNG P&ID · ISA-5.1 symbol audit',
      'MR Studio · 13-vector V&V run','Class 3 estimate · escalation reconciliation',
      'Vendor Bridge · DXF exporter regression','WorleyVerse router · three-tier health probe',
      'Cache Strata · prompt-cache hit analysis','SCE/SIL register · barrier validation',
      'Procurement Gantt · MCHE lead-time check','GHG dashboard · flare-case recompute',
      'Tag traceability matrix · orphan sweep','FEED completeness · gap-scan on §12']},
    sportskills:{name:'ShuttleSensei Sport-Skills',icon:'🏸',tasks:[
      'PoseForge · clip labelling batch','Smash trajectory · release-angle calibration',
      'Footwork ladder · 6-point drill plan','ARENA ladder · weekend seeding',
      'Serve-receive stance · classifier retrain','Racket-path spline · smoothing pass',
      'DOJO session · defensive lift review','Net-kill reaction · timing gate tune',
      'Shuttle IDB · session persistence audit','Drop-shot deception · video breakdown']},
    orchestration:{name:'LOQI Core — Build · Perf · Route',icon:'⚙',
      /* per-agent task pools — each core agent runs its own real, grounded lane
         rather than a shared generic pool, so the panel reads as genuine division
         of labour under the three orchestrator trees. */
      byAgent:{
        kakashi:['Module review pass · duplication scan across kurama.*.js','Pattern audit · flag re-implemented logic already solved elsewhere','Integration gate · sign off Naruto+Sasuke merge before boot-order splice'],
        naruto:['Scaffold split-planet districts.js chunk','Parallel-build the wormhole tunnel star-streak buffer','Iterate on charModel kind branches until node --check is clean'],
        sasuke:['Refactor duplicate toon()/outline() call sites','Tighten PATH_CLEAR/RAVINE_LIVE type usage','Cut dead branches from the pre-split realmAt() detector'],
        kurama:['Kernel review · gate WORLD_STATS teardown against leak','Approve verse-skin colour-blend budget','Substrate check · confirm disposeDeep() covers new mesh types'],
        vegeta:['Profile updateAgents() cost with 27 agents live','Micro-benchmark pathTexture() cache hit rate','Flag any per-frame allocation inside loop()'],
        bulma:['Wire pathTexture cache invalidation on verse rebuild','Config pass · Playwright launch args for swiftshader','Namespace the LOQI CSS block against id collisions'],
        loki:['Synthesize elder council verdicts into one line','Aggregate verse-transit telemetry into a single status','Reconcile conflicting task priorities across the three trees'],
        nami:['Route the wormhole gate proximity check to avoid double-fire','Map cheapest transit sequence for a 3-planet loop test','Cost the LOQI panel render against panel-open frequency'],
        zoro:['Unit-check the ravine PATH_CLEAR early-return branch','Integration sweep · verse rebuild → beacon → collision index order','Adversarial input · malformed NPCS_LIVE offworld coordinate'],
        robin:['Index the split-planet architecture into the codex','Log LOQI decision trail to the feed for later audit','Document the teardown/rebuild pipeline order for future edits']
      }}
  };
  const CORE_CAST=[
    {id:'kakashi',name:'Kakashi',title:'Copy-Ninja Reviewer',emo:'📖',tree:'build',orch:true},
    {id:'naruto', name:'Naruto', title:'Shadow-Clone Builder',emo:'🍥',tree:'build'},
    {id:'sasuke', name:'Sasuke', title:'Sharingan Refactorer',emo:'⚡',tree:'build'},
    {id:'kurama', name:'Kurama', title:'Nine-Tail Kernel',   emo:'🦊',tree:'perf',orch:true},
    {id:'vegeta', name:'Vegeta', title:'Prince of Perf',     emo:'👑',tree:'perf'},
    {id:'bulma',  name:'Bulma',  title:'Tooling Engineer',   emo:'🔧',tree:'perf'},
    {id:'loki',   name:'Dev-Loki',title:'Trickster Aggregator',emo:'🌀',tree:'route',orch:true},
    {id:'nami',   name:'Nami',   title:'Navigator · Router', emo:'🧭',tree:'route'},
    {id:'zoro',   name:'Zoro',   title:'Three-Sword Tester', emo:'⚔',tree:'route'},
    {id:'robin',  name:'Robin',  title:'Archaeologist · Docs',emo:'🌸',tree:'route'}
  ];
  const CORE_TREES=[
    {id:'build',name:'Parallel Construction & Code Synthesis',orch:'kakashi'},
    {id:'perf', name:'System Performance & Substrate Hardening',orch:'kurama'},
    {id:'route',name:'Routing, Validation & Boundary Safeguards',orch:'loki'}
  ];
  const domainOf=cfg=>cfg.realm==='shinobi'||cfg.id==='choppa'?'sportskills':'engineering';
  const ELDERS={shinobi:'sage',pirate:'robina',saiyan:'picoroid'};
  let WORK=null;
  function initWork(){
    if(WORK)return;
    WORK={};
    for(const c of ROSTER){
      const dom=domainOf(c),pool=PROGRAMMES[dom].tasks;
      WORK[c.id]={dom,task:pool[(Math.random()*pool.length)|0],prog:Math.random()*60,rate:5+Math.random()*9};
    }
    for(const c of CORE_CAST){
      const pool=PROGRAMMES.orchestration.byAgent[c.id]||['Standing by for delegation'];
      WORK[c.id]={dom:'orchestration',task:pool[(Math.random()*pool.length)|0],prog:Math.random()*60,rate:6+Math.random()*8};
    }
  }
  let _wt=0;
  function tickWork(dt){
    initWork();_wt+=dt;
    if(_wt<1.6)return;_wt=0;
    // advance a few agents per tick so the panel feels alive without spamming
    const ids=Object.keys(WORK);
    for(let i=0;i<5;i++){
      const id=ids[(Math.random()*ids.length)|0],w=WORK[id];
      w.prog+=w.rate*(0.7+Math.random()*0.8);
      if(w.prog>=100){
        const c=ROSTER.find(r=>r.id===id)||CORE_CAST.find(r=>r.id===id);
        const pool=w.dom==='orchestration'?PROGRAMMES.orchestration.byAgent[id]:PROGRAMMES[w.dom].tasks;
        LoqiBus.push('work',c.emo,`${c.name} ✅ ${w.task}`);
        w.task=pool[(Math.random()*pool.length)|0];w.prog=0;w.rate=w.dom==='orchestration'?6+Math.random()*8:5+Math.random()*9;
      }
    }
    if(state.open&&state.pane==='agents')renderPane();
    if(state.open&&state.pane==='verses')renderPane();
  }

  /* ---------------- council deliberation (procedural MoA) ----------------- */
  const COUNCIL_LINES={
    sage:['Ground it in what already stands — the pattern lives in a module we shipped.','Gate the risky branch; let the calm path run first.','The old trail teaches: mark the corridor before you scatter the props.'],
    robina:['The archive holds a precedent — document the durable half before it drifts.','Index the decision; future crews will ask why.','Cross-reference the registry: two entries already answer this.'],
    picoroid:['Define the evidence that proves it done, or it is not a plan.','Regenerate after the failure case — then rerun the drill.','Validation first: name the check, then the change.'],
    kuro:['Kernel synthesis — take the elder consensus: smallest safe move now, gated follow-up next, and log the artifact to the feed.']
  };
  function deliberate(q){
    const order=['sage','robina','picoroid','kuro'];
    order.forEach((id,i)=>{
      setTimeout(()=>{
        const c=ROSTER.find(r=>r.id===id);
        const line=COUNCIL_LINES[id][(Math.random()*COUNCIL_LINES[id].length)|0];
        LoqiBus.push('council',c.emo,`${c.name} · ${line}`);
        if(state.open)renderPane();
      },420*i+120);
    });
    LoqiBus.push('council','🗳',`Council convened · "${q.slice(0,60)}"`);
    /* PRODUCTION: swap this block for a real MoA call — POST /api/council
       {prompt:q, refs:[elders], agg:'kuro'} → streamed labelled verdicts. */
  }

  /* ---------------- verse telemetry ---------------- */
  function verseStats(id){
    const r=REALMS[id];
    const all=window.Planets?Planets.districtsOf(id):[];
    const disc=[...(typeof discSet!=='undefined'?discSet:[])].filter(x=>all.some(d=>d.id===x)).length;
    let legs=0;
    try{
      for(const c of CHAIN){
        const gv=NPCS.find(n=>n.slot===c.from),tg=NPCS.find(n=>n.slot===c.to);
        if((gv&&realmAt(gv.t).id===id)||(tg&&realmAt(tg.t).id===id))legs++;
      }
    }catch(e){}
    let done=0;try{done=[...doneSet].length;}catch(e){}
    return {r,total:all.length,disc,legs,done,
      gems:(window._gemLog&&window._gemLog[id])||0,
      trails:(window.Planets&&Planets.trails[id]||[]).length,
      active:window._verse===id};
  }

  /* ---------------- UI ---------------- */
  const state={open:false,pane:'verses',unread:0};
  const css=document.createElement('style');css.textContent=`
  #loqiBtn{position:fixed;left:14px;bottom:76px;z-index:62;display:flex;align-items:center;gap:8px;
    padding:8px 14px;border:1px solid var(--line);border-radius:999px;background:var(--ink);
    backdrop-filter:blur(13px) saturate(1.25);-webkit-backdrop-filter:blur(13px) saturate(1.25);
    font-family:var(--disp);font-weight:800;font-size:.66rem;letter-spacing:.22em;color:var(--frost);
    cursor:pointer;opacity:0;pointer-events:none;transition:all .5s ease .9s;}
  #ui.live~#loqiBtn{opacity:1;pointer-events:all;}
  #loqiBtn:hover{border-color:var(--teal);color:#bff2ee;}
  #loqiBtn b{color:var(--teal);}
  #loqiBadge{display:none;min-width:16px;height:16px;border-radius:8px;background:var(--crimson);color:#fff;
    font-size:.55rem;line-height:16px;text-align:center;padding:0 4px;font-family:var(--mono);}
  #loqiBadge.on{display:block;}
  #loqiOS{position:fixed;right:14px;top:104px;bottom:88px;width:min(392px,calc(100vw - 28px));z-index:64;
    border:1px solid rgba(61,201,194,.22);border-radius:16px;background:rgba(4,7,17,.82);
    backdrop-filter:blur(18px) saturate(1.35);-webkit-backdrop-filter:blur(18px) saturate(1.35);
    box-shadow:0 26px 90px rgba(0,0,0,.45);display:flex;flex-direction:column;
    opacity:0;pointer-events:none;transform:translateX(16px);transition:.3s ease;font-family:var(--disp);color:var(--cream);}
  #loqiOS.open{opacity:1;pointer-events:all;transform:none;}
  #loqiTop{display:flex;align-items:center;gap:10px;padding:13px 15px;border-bottom:1px solid rgba(61,201,194,.15);}
  #loqiTop .lg{width:34px;height:34px;border-radius:10px;border:1px solid var(--teal);display:grid;place-items:center;
    color:var(--teal);box-shadow:0 0 20px rgba(61,201,194,.25);}
  #loqiTop .tt{font-weight:800;letter-spacing:.26em;font-size:.86rem;}
  #loqiTop .tt b{color:var(--teal);}
  #loqiTop .sub{font-family:var(--mono);font-size:.52rem;letter-spacing:.2em;color:var(--frost);opacity:.6;margin-top:2px;text-transform:uppercase;}
  #loqiTop .x{margin-left:auto;border:0;background:transparent;color:var(--frost);font-size:1.15rem;cursor:pointer;}
  #loqiDock{display:flex;gap:6px;padding:9px 12px;border-bottom:1px solid rgba(61,201,194,.12);}
  .loqiTab{flex:1;padding:7px 0;border:1px solid var(--line);border-radius:9px;background:transparent;text-align:center;
    font-family:var(--mono);font-size:.55rem;letter-spacing:.14em;text-transform:uppercase;color:var(--frost);cursor:pointer;transition:.18s;}
  .loqiTab.on{border-color:var(--teal);color:#bff2ee;background:rgba(61,201,194,.1);}
  #loqiBody{flex:1;min-height:0;overflow:auto;padding:12px 14px;font-family:var(--mono);}
  #loqiBody::-webkit-scrollbar{width:5px}#loqiBody::-webkit-scrollbar-thumb{background:rgba(61,201,194,.25);border-radius:4px}
  .lqVerse{border:1px solid var(--line);border-radius:12px;padding:11px 12px;margin-bottom:10px;transition:.18s;}
  .lqVerse.on{border-color:var(--vc);box-shadow:inset 0 0 0 1px var(--vc),0 10px 34px -22px var(--vc);}
  .lqVerse .h{display:flex;align-items:center;gap:8px;font-family:var(--disp);font-weight:800;font-size:.76rem;letter-spacing:.16em;text-transform:uppercase;}
  .lqVerse .h .now{margin-left:auto;font-size:.5rem;color:var(--vc);letter-spacing:.2em;}
  .lqVerse .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:9px;}
  .lqStat b{display:block;font-size:.48rem;letter-spacing:.16em;color:var(--frost);opacity:.55;text-transform:uppercase;}
  .lqStat span{font-size:.72rem;color:var(--cream);}
  .lqGo{margin-top:9px;width:100%;padding:7px 0;border-radius:8px;border:1px solid var(--vc);background:transparent;
    color:var(--vc);font-family:var(--disp);font-size:.56rem;letter-spacing:.22em;text-transform:uppercase;cursor:pointer;}
  .lqGo[disabled]{opacity:.35;cursor:default;}
  .lqProg{font-size:.55rem;color:var(--frost);opacity:.8;margin:2px 0 10px;line-height:1.7;}
  .lqAgent{display:flex;gap:9px;align-items:center;padding:7px 8px;border:1px solid var(--line);border-radius:10px;margin-bottom:7px;}
  .lqAgent .av{width:26px;height:26px;border-radius:8px;display:grid;place-items:center;background:rgba(255,255,255,.05);font-size:.85rem;}
  .lqAgent .nm{font-family:var(--disp);font-size:.62rem;font-weight:700;letter-spacing:.1em;}
  .lqAgent .tk{font-size:.52rem;color:var(--frost);opacity:.8;margin-top:2px;line-height:1.4;}
  .lqAgent .bar{height:3px;border-radius:2px;background:rgba(255,255,255,.08);margin-top:4px;overflow:hidden;}
  .lqAgent .bar i{display:block;height:100%;background:var(--teal);}
  .lqHead{font-family:var(--disp);font-size:.6rem;letter-spacing:.24em;text-transform:uppercase;color:var(--frost);
    opacity:.7;margin:12px 0 7px;display:flex;align-items:center;gap:7px;}
  .lqFeedIt{display:flex;gap:8px;padding:6px 2px;border-bottom:1px solid rgba(255,255,255,.05);font-size:.58rem;line-height:1.5;}
  .lqFeedIt .tm{color:var(--frost);opacity:.5;font-size:.5rem;white-space:nowrap;padding-top:2px;}
  .lqArt{border:1px solid var(--line);border-radius:10px;padding:8px 10px;margin-bottom:7px;}
  .lqArt .s{font-size:.5rem;letter-spacing:.16em;color:var(--teal);text-transform:uppercase;}
  .lqArt .t{font-size:.62rem;margin-top:3px;line-height:1.45;}
  #loqiCouncil{display:flex;gap:7px;margin-top:10px;}
  #loqiCouncil input{flex:1;background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:9px;
    padding:8px 10px;color:var(--cream);font-family:var(--mono);font-size:.6rem;outline:none;}
  #loqiCouncil button{padding:0 13px;border-radius:9px;border:1px solid var(--teal);background:rgba(61,201,194,.12);
    color:#bff2ee;font-family:var(--disp);font-size:.56rem;letter-spacing:.16em;text-transform:uppercase;cursor:pointer;}
  @media(max-width:760px){#loqiOS{top:96px;bottom:120px;right:8px;}}`;
  document.head.appendChild(css);

  const btn=document.createElement('div');btn.id='loqiBtn';
  btn.innerHTML=`LOQI<b>⁘</b>MONITOR <span id="loqiBadge">0</span>`;
  const os=document.createElement('div');os.id='loqiOS';
  os.innerHTML=`<div id="loqiTop"><div class="lg">◉</div>
    <div><div class="tt">LOQI<b>⁘</b>MONITOR</div><div class="sub">orchestration OS · tri-verse telemetry</div></div>
    <button class="x">×</button></div>
    <div id="loqiDock"></div><div id="loqiBody"></div>`;
  function mountUI(){
    document.body.appendChild(btn);document.body.appendChild(os);
    btn.onclick=toggle;os.querySelector('.x').onclick=()=>toggle(false);
    const dock=os.querySelector('#loqiDock');
    for(const [id,lab] of [['verses','◉ Verses'],['agents','⛩ Agents'],['feed','📡 Feed'],['arts','💠 Artifacts']]){
      const t=document.createElement('div');t.className='loqiTab';t.dataset.pane=id;t.textContent=lab;
      t.onclick=()=>{state.pane=id;renderPane();syncTabs();};dock.appendChild(t);
    }
    syncTabs();
    addEventListener('keydown',e=>{
      if(e.code==='KeyL'&&gameOn&&!dialogOn&&document.activeElement.tagName!=='INPUT'&&document.activeElement.tagName!=='TEXTAREA')toggle();
    });
  }
  function syncTabs(){os.querySelectorAll('.loqiTab').forEach(t=>t.classList.toggle('on',t.dataset.pane===state.pane));}
  function toggle(force){
    state.open=force!==undefined?force:!state.open;
    os.classList.toggle('open',state.open);
    if(state.open){state.unread=0;const b=document.getElementById('loqiBadge');b.classList.remove('on');renderPane();}
  }
  const esc=s=>String(s).replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));
  const tfmt=ms=>{const d=new Date(ms);return d.toTimeString().slice(0,5);};

  function renderPane(){
    const b=os.querySelector('#loqiBody');if(!b)return;
    if(state.pane==='verses'){
      const legsDone=(typeof doneSet!=='undefined')?doneSet.size:0;
      b.innerHTML=`<div class="lqProg">⚡ chakra ${Math.round(chakra)} · 🔷 shards ${shardCount}/${SHARD_GOAL} · 📦 dispatch ${legsDone}/${TOTAL} · 💠 artifacts ${(window.Artifacts||[]).length}</div>`+
        ['shinobi','pirate','saiyan'].map(id=>{
          const s=verseStats(id),hex='#'+new THREE.Color(s.r.grade.accent).getHexString();
          return `<div class="lqVerse ${s.active?'on':''}" style="--vc:${hex}">
            <div class="h">${s.r.emo} ${esc(s.r.name)} ${s.active?'<span class="now">◉ you are here</span>':''}</div>
            <div class="grid">
              <div class="lqStat"><b>Districts</b><span>${s.disc} / ${s.total}</span></div>
              <div class="lqStat"><b>Trails</b><span>${s.trails}</span></div>
              <div class="lqStat"><b>Wire-gems</b><span>${s.gems}</span></div>
              <div class="lqStat"><b>Chain legs</b><span>${s.legs}</span></div>
              <div class="lqStat"><b>Hub</b><span>${esc(s.r.hub)}</span></div>
              <div class="lqStat"><b>Grade</b><span>${s.r.grade.levels.toFixed(0)}·cel</span></div>
            </div>
            <button class="lqGo" data-id="${id}" ${s.active?'disabled':''}>${s.active?'Current verse':'🌀 Wormhole transit'}</button>
          </div>`;}).join('');
      b.querySelectorAll('.lqGo:not([disabled])').forEach(g=>g.onclick=()=>{toggle(false);transitTo(g.dataset.id);});
    }else if(state.pane==='agents'){
      initWork();
      const treeAgent=(id,orch)=>{const c=CORE_CAST.find(x=>x.id===id),w=WORK[id];
          return `<div class="lqAgent"><div class="av">${c.emo}</div>
            <div style="flex:1;min-width:0"><div class="nm">${esc(c.name)} · <span style="opacity:.6;font-weight:400">${esc(c.title)}${orch?' — orchestrator':''}</span></div>
            <div class="tk">⚙ ${esc(w.task)}</div>
            <div class="bar"><i style="width:${Math.min(100,w.prog)|0}%"></i></div></div></div>`;};
      const coreHTML=CORE_TREES.map(tr=>{
        const subs=CORE_CAST.filter(c=>c.tree===tr.id&&!c.orch);
        return `<div class="lqHead">⚙ ${esc(tr.name)}</div>`+treeAgent(tr.orch,true)+subs.map(s=>treeAgent(s.id,false)).join('');
      }).join('');
      const groups=[['shinobi','🏸 Shinobi Guild — ShuttleSensei sport-skills'],
                    ['pirate','🏗 Grandline Crew — agentic engineering'],
                    ['saiyan','🏗 Sayajin Cadre — agentic engineering']];
      b.innerHTML=coreHTML+groups.map(([rid,lab])=>`<div class="lqHead">${lab}</div>`+
        ROSTER.filter(c=>c.realm===rid).map(c=>{const w=WORK[c.id];
          return `<div class="lqAgent"><div class="av">${c.emo}</div>
            <div style="flex:1;min-width:0"><div class="nm">${esc(c.name)} · <span style="opacity:.6;font-weight:400">${esc(c.title)}</span></div>
            <div class="tk">${PROGRAMMES[w.dom].icon} ${esc(w.task)}</div>
            <div class="bar"><i style="width:${Math.min(100,w.prog)|0}%"></i></div></div></div>`;}).join('')).join('')+
        `<div id="loqiCouncil"><input id="lqQ" placeholder="Ask the council… (elders answer, kernel synthesizes)"><button id="lqGo">Deliberate</button></div>`;
      const inp=b.querySelector('#lqQ');
      const run=()=>{const q=inp.value.trim();if(!q)return;inp.value='';state.pane='feed';syncTabs();deliberate(q);renderPane();};
      b.querySelector('#lqGo').onclick=run;
      inp.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter')run();};
    }else if(state.pane==='feed'){
      b.innerHTML=LOG.length?[...LOG].reverse().map(l=>
        `<div class="lqFeedIt"><span class="tm">${tfmt(l.at)}</span><span>${l.icon}</span><span>${esc(l.text)}</span></div>`).join('')
        :'<div class="lqProg">Quiet horizon. Events, agent completions and transits land here.</div>';
    }else{
      const arts=window.Artifacts||[];
      b.innerHTML=`<div class="lqProg">🔷 photon shards ${shardCount}/${SHARD_GOAL} · 💠 wire-gem dispatches ${arts.length} · 📖 codex entries ${document.querySelectorAll('#codexBody .lore').length}</div>`+
        (arts.length?[...arts].reverse().map(a=>{const r=REALMS[a.realm];
          return `<div class="lqArt"><div class="s">${a.src} · ${r?r.emo:''} ${a.realm}${a.per?' · for you':''}</div>
            <div class="t">${esc(a.h)}</div></div>`;}).join('')
        :'<div class="lqProg">No wire-gem dispatches banked yet — walk the trails.</div>');
    }
  }

  /* ---------------- system hooks ---------------- */
  // every banner is a notification
  const _banner=window.banner;
  if(typeof _banner==='function'){
    window.banner=function(k,t){_banner(k,t);try{LoqiBus.push('sys','📣',`${k} — ${t}`);}catch(e){}};
  }
  window.updateLoqi=function(dt){tickWork(dt);};

  const prevInit=window.init;
  window.init=async function(){
    await prevInit();
    mountUI();initWork();
    LoqiBus.push('sys','◉','LOQI⁘MONITOR online · tri-verse telemetry linked');
  };
})();
