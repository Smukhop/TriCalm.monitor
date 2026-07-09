/* === kurama.triforge.js — TriForge · Play→Platform bridge =================
   "Play is provisioning — your run is your repo." Every capability district
   you walk mints a REAL, exportable developer artifact. The Forge Console
   aggregates a builder's tasks / skills / agents / SFT refs / QB-engine into
   a single portable origin bundle they own.

   Decision (user): ship functional client-side export NOW; stub the deep
   GitHub/Vercel wiring behind a clearly-marked "connect" action for later.

   Self-contained: reads globals (WORLD_SPEC, ENV_PACKS, ROSTER, curChar,
   deliverIdx, doneSet, shardCount, CHAIN). Optionally enriches from
   _triforge.capabilities.json if present. Classic script, global scope. ==== */
(function(){
  // Base-district capability assignments (env packs carry their own via registerEnvPack)
  const BASE_CAPS = {
    dispatch:'Identity', market:'Marketplace', shrine:'Knowledge', forge:'Actuation',
    dojo:'Skills', harbor:'Distribution', grove:'Capacity', lookout:'Perception'
  };
  // Artifact file + field schema per capability (the "real dev artifact" minted by play)
  const CAP_ARTIFACT = {
    Knowledge:   { file:'knowledge.capability.json',  fields:['knowledgeRefs','sftModels','embeddings','retrievalPolicy'] },
    Skills:      { file:'skill-graph.json',           fields:['skills','toolchains','dependencies','triggers'] },
    Perception:  { file:'perception.capability.json', fields:['sensors','evals','scorers','observationSchema'] },
    Actuation:   { file:'qb-engine.cfg.json',         fields:['runtime','quantumBudget','actuators','executionPolicy'] },
    Marketplace: { file:'market.listing.json',        fields:['offers','pricing','licenses','revShare'] },
    Identity:    { file:'repo-origin.manifest.json',  fields:['origin','owner','visibility','branchPolicy','agents'] },
    Capacity:    { file:'capacity.profile.json',      fields:['compute','memory','concurrency','scaling'] },
    Distribution:{ file:'distribution.channel.json',  fields:['channels','endpoints','rateLimits','regions'] },
    Community:   { file:'community.guild.json',        fields:['members','roles','contributions','governance'] },
    Alignment:   { file:'alignment.policy.json',       fields:['guardrails','redlines','reviewers','evals'] },
    Deployment:  { file:'deploy.target.json',          fields:['provider','build','env','rollbackPolicy'] }
  };
  const CAP_BLURB = {
    Knowledge:'The Academy archives what your agents know — knowledge refs and SFT model pointers.',
    Skills:'The Forge graphs the abilities and toolchains your agents wield.',
    Perception:'The Observatory defines how your agents sense and evaluate the world.',
    Actuation:'The QB-Engine core configures how your agents act and how compute is budgeted.',
    Marketplace:'The Arcade lists what your agents trade — offers, licenses, rev-share.',
    Identity:'The Dispatch Core is your sovereign github-origin — owner, repo, branch policy.',
    Capacity:'The Giant Hall sizes the compute, memory and concurrency your stack can hold.',
    Distribution:'The Pier routes where your agents ship — channels, endpoints, regions.',
    Community:'The Plaza gathers your guild — members, roles, governance.',
    Alignment:'The Sanctum holds your guardrails, redlines and reviewers.',
    Deployment:'The Sky Docks declare your deploy targets and rollback policy.'
  };

  let MANIFEST = null;   // optional enrichment from _triforge.capabilities.json
  try{ MANIFEST = window.__CAPS__ || null; }catch(e){}
  // the REAL Kurama-Harness (chakra-core + 9 tails + adapters + skill registries + avatar binding)
  let HARNESS = null;
  try{ HARNESS = window.__HARNESS__ || null; }catch(e){}
  function avatarBinding(){ try{ const id=(ROSTER[curChar]||{}).id; return HARNESS&&HARNESS.avatarMapping&&HARNESS.avatarMapping.find(a=>a.courier===id)||null; }catch(e){ return null; } }

  function rosterName(){ try{ return (ROSTER[curChar]||{}).name || 'Courier'; }catch(e){ return 'Courier'; } }
  function slug(s){ return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }

  // Build the live capability list from base districts + registered env packs.
  function capabilities(){
    const out=[], seen={};
    function push(id,name,capability,theme){
      if(!capability||seen[capability]) return; seen[capability]=true;
      const a = CAP_ARTIFACT[capability] || {file:slug(capability)+'.capability.json',fields:['notes']};
      out.push({districtId:id, district:name, capability, theme:theme||'core', artifactFile:a.file, fields:a.fields,
        blurb:(CAP_BLURB[capability]||'')});
    }
    try{ (WORLD_SPEC.districts||[]).forEach(d=>{ const cap=BASE_CAPS[d.id]; if(cap) push(d.id,d.name,cap,'core'); }); }catch(e){}
    try{ (ENV_PACKS||[]).forEach(p=>{ const d=(WORLD_SPEC.districts||[]).find(x=>x.id===p.id); push(p.id,(d&&d.name)||p.title||p.id,p.capability,p.theme); }); }catch(e){}
    return out;
  }

  function builderState(){
    let done=[]; try{ done=[...doneSet]; }catch(e){}
    let chain=[]; try{ chain=(CHAIN||[]).map((c,i)=>({leg:i+1,parcel:c.parcel,from:c.from,to:c.to,complete:i<deliverIdx})); }catch(e){}
    return {
      builder:rosterName(),
      courierIndex:(typeof curChar==='number'?curChar:0),
      photonShards:(typeof shardCount==='number'?shardCount:0),
      dispatchLeg:(typeof deliverIdx==='number'?deliverIdx:0),
      discovered:done, tasks:chain
    };
  }

  function artifact(cap){
    const base={
      $schema:'trifable.miniverse/capability@1', capability:cap.capability, district:cap.district,
      theme:cap.theme, generatedAt:new Date().toISOString(), builder:rosterName(), version:'0.1.0'
    };
    // seed the declared fields with empty, editable placeholders the builder fills in their repo
    (cap.fields||[]).forEach(f=>{ base[f] = /s$/.test(f)?[]:''; });
    if(cap.capability==='Identity'){ base.origin=`github.com/${slug(rosterName())}/trifable-origin`; base.owner=slug(rosterName()); base.visibility='private'; base.agents=safeRoster(); }
    if(cap.capability==='Actuation'){ base.runtime='qb-engine'; base.quantumBudget={tokens:0,steps:0}; base.executionPolicy='sandboxed'; }
    return base;
  }
  function safeRoster(){ try{ return ROSTER.map(r=>({id:r.id,name:r.name,role:r.title,ability:r.ability})); }catch(e){ return []; } }

  function download(name,obj){
    const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});
    const u=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=u; a.download=name; a.style.display='none';
    document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(u);a.remove();},1500);
  }

  function mint(capName){
    const cap=capabilities().find(c=>c.capability===capName); if(!cap) return;
    download(cap.artifactFile, artifact(cap));
    try{ sfx.deliver(); }catch(e){}
    flash(`Minted ${cap.artifactFile}`);
  }

  function exportBundle(){
    const caps=capabilities();
    const bundle={
      $schema:'trifable.miniverse/origin-bundle@1',
      generatedAt:new Date().toISOString(),
      origin:{ repo:'trifable-origin', owner:slug(rosterName()), visibility:'private',
               createdWith:'TriFable · MiniVerse', remote:`github.com/${slug(rosterName())}/trifable-origin` },
      builder:builderState(),
      qbEngine:{ runtime:'qb-engine', quantumBudget:{tokens:0,steps:0}, executionPolicy:'sandboxed' },
      capabilities:caps.map(c=>({capability:c.capability,district:c.district,artifact:c.artifactFile,fields:c.fields})),
      agents:safeRoster(),
      skillGraph:{ nodes:caps.map(c=>c.capability), edges:[] },
      harness: HARNESS ? { name:HARNESS.name, version:HARNESS.version, chakraCore:HARNESS.chakraCore,
        tails:HARNESS.tails.map(t=>t.id), defaultTails:HARNESS.defaultTails, adapters:HARNESS.adapters,
        skills:{ engineering:HARNESS.skills.engineering.ids, badminton:HARNESS.skills.badminton.ids },
        integrations:HARNESS.integrations, avatarBinding:avatarBinding() } : null
    };
    download('trifable.origin.bundle.json', bundle);
    try{ sfx.deliver(); }catch(e){}
    flash('Exported your origin bundle — your run is your repo.');
  }

  // STUB (deep): real GitHub/Vercel wiring is deferred. Surface the exact CLI to do it.
  function connect(){
    const owner=slug(rosterName());
    const snippet=
`# TriForge → GitHub + Vercel (deep connect — stubbed in-browser, run locally)
gh repo create ${owner}/trifable-origin --private --source . --remote origin --push
vercel link && vercel --prod
# then commit your minted artifacts:
git add *.capability.json *.cfg.json *.manifest.json skill-graph.json trifable.origin.bundle.json
git commit -m "TriForge: provision origin from MiniVerse run" && git push`;
    try{ navigator.clipboard && navigator.clipboard.writeText(snippet); }catch(e){}
    flash('Deep connect is stubbed — CLI copied to clipboard.');
    const body=document.getElementById('forgeBody');
    if(body){ const pre=document.createElement('pre'); pre.className='forge-cli'; pre.textContent=snippet; body.appendChild(pre); }
  }

  let _t;
  function flash(msg){ try{ banner('TriForge', msg); }catch(e){}
    const el=document.getElementById('forgeFlash'); if(!el) return; el.textContent=msg; el.style.opacity='1';
    clearTimeout(_t); _t=setTimeout(()=>{el.style.opacity='0';},2600); }

  function fillForge(){
    const body=document.getElementById('forgeBody'); if(!body) return;
    const caps=capabilities();
    const intro = (MANIFEST&&MANIFEST.codexIntro) ||
      'Play is provisioning. Each capability district mints a real, portable developer artifact — own your stack, your run is your repo.';
    let html = `<div class="desc">${intro}</div>`;
    html += `<div id="forgeFlash" class="forge-flash"></div>`;
    html += `<div class="forge-actions">
      <button class="forge-btn primary" onclick="TriForge.exportBundle()">⬇ Export origin bundle</button>
      <button class="forge-btn" onclick="TriForge.connect()">🔗 Connect GitHub + Vercel <em>(stub)</em></button></div>`;
    html += `<div class="forge-caps">`;
    caps.forEach(c=>{
      html += `<div class="forge-cap">
        <div class="fc-h"><span class="fc-cap">${c.capability}</span><span class="fc-d">${c.district}</span></div>
        <div class="fc-b">${c.blurb||''}</div>
        <div class="fc-f"><code>${c.artifactFile}</code><button class="forge-btn sm" onclick="TriForge.mint('${c.capability}')">Mint</button></div>
      </div>`;
    });
    html += `</div>`;
    if(HARNESS){
      const b=avatarBinding();
      html += `<div class="forge-harness">
        <div class="fh-h">⛩ Kurama Harness · v${HARNESS.version} <span>${HARNESS.subtitle}</span></div>
        <div class="fh-row"><b>${HARNESS.tails.length}</b> tails · <b>${HARNESS.adapters.length}</b> model adapters · <b>${HARNESS.skills.engineering.count}</b> engineering + <b>${HARNESS.skills.badminton.count}</b> badminton skills · <b>${HARNESS.chakraCore.length}</b> locked chakra-core</div>
        ${b?`<div class="fh-row">Active courier <b>${(ROSTER[curChar]||{}).name}</b> &rarr; <code>${b.tail}</code> · adapter <code>${b.adapter}</code> · <code>${b.domain}</code></div>`:''}
        <div class="fh-tails">${HARNESS.tails.map((t,i)=>`<span class="fh-tail">${i+1}·${t.name}</span>`).join('')}</div>
        <div class="fh-int">${HARNESS.integrations.map(s=>`<span>${s}</span>`).join('')}</div>
      </div>`;
    }
    html += `<div class="fine">${caps.length} capabilities · ${HARNESS?(HARNESS.skills.engineering.count+HARNESS.skills.badminton.count)+' real harness skills':'harness manifest loading'} · client-side mint &amp; export · deep GitHub/Vercel wiring stubbed.</div>`;
    body.innerHTML = html;
  }

  function open(){
    if(typeof UI!=='undefined'&&UI.closeAll)UI.closeAll();
    fillForge();
    const el=document.getElementById('p-forge'); if(el)el.classList.add('open');
  }
  function close(){ const el=document.getElementById('p-forge'); if(el)el.classList.remove('open'); }

  window.TriForge={open,close,mint,exportBundle,connect,fillForge,capabilities};
})();
