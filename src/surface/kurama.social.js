/* === kurama.social.js — Social Connect + Agentic News Wire ================
   One streamlined layer replacing the sketched "X/IG login + news gems" spec:
     • Social Connect Dock (𝕏 / 📷) under the realm dock, live status pills
     • Provider modals — real OAuth 2.0 PKCE structure (verifier, S256
       challenge, state, scopes, authorize URL) built for both providers;
       mock mode resolves locally, production mode redirects. One flag flip.
     • Interest graph — chip picks + deterministic defaults per handle,
       persisted in localStorage ('trifable.social.v1')
     • fetchAgenticNews() — personalized, interest-weighted, dedup'd feed;
       single swap-point for a real backend
     • News Gems — three collectible wire-gems per authored trail; walk-over
       opens a news card, rewards chakra, gem re-arms with a fresh item
   Classic script, shared global scope. Loaded after kurama.realms.js. ==== */
(function(){
  'use strict';
  const LS_KEY='trifable.social.v1';

  /* ================= provider registry =================
     Everything a real integration needs lives here; the mock never invents
     structure the production flow wouldn't have. To go live: set
     Social.production=true and fill clientId + redirectUri per provider,
     then stand up the token-exchange endpoint referenced in _exchangeCode(). */
  const PROVIDERS={
    x:{ id:'x', label:'X', icon:'𝕏', color:'#d7dbe0',
        authUrl:'https://x.com/i/oauth2/authorize',
        tokenUrl:'https://api.x.com/2/oauth2/token',
        scopes:['users.read','tweet.read','follows.read','offline.access'],
        clientId:'YOUR_X_CLIENT_ID', redirectUri:location.origin+location.pathname,
        scopeNote:'Read profile, posts and follows to infer interests.'},
    ig:{ id:'ig', label:'Instagram', icon:'📷', color:'#ff9d8a',
        authUrl:'https://www.instagram.com/oauth/authorize',
        tokenUrl:'https://api.instagram.com/oauth/access_token',
        scopes:['instagram_business_basic'],
        clientId:'YOUR_IG_APP_ID', redirectUri:location.origin+location.pathname,
        scopeNote:'Read profile and media to infer interests.'}
  };

  const INTEREST_CHIPS=['anime','gaming','ai','space','engineering','music',
    'esports','film','travel','food','fitness','design'];

  /* ================= persisted state ================= */
  const Social={production:false,accounts:{},
    interests(){ const s=new Set();
      for(const k in Social.accounts){(Social.accounts[k].interests||[]).forEach(i=>s.add(i));}
      return [...s]; },
    connected(){ return Object.keys(Social.accounts).length; }};
  window.Social=Social;
  function persist(){ try{localStorage.setItem(LS_KEY,JSON.stringify(Social.accounts));}catch(e){} }
  function restore(){ try{const d=JSON.parse(localStorage.getItem(LS_KEY)||'{}');
    if(d&&typeof d==='object')Social.accounts=d;}catch(e){} }
  restore();

  /* ================= PKCE utilities (real, spec-compliant) ================= */
  function _rand(n){ const a=new Uint8Array(n);(crypto.getRandomValues?crypto.getRandomValues(a):a.map(()=>Math.random()*256));return a; }
  function _b64url(buf){ return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
  async function makePKCE(){
    const verifier=_b64url(_rand(48));
    let challenge=verifier, method='plain';
    if(crypto.subtle){ challenge=_b64url(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier)));method='S256'; }
    return {verifier,challenge,method,state:_b64url(_rand(12))};
  }
  function buildAuthUrl(pv,pkce){
    const q=new URLSearchParams({response_type:'code',client_id:pv.clientId,
      redirect_uri:pv.redirectUri,scope:pv.scopes.join(' '),state:pkce.state,
      code_challenge:pkce.challenge,code_challenge_method:pkce.method});
    return pv.authUrl+'?'+q.toString();
  }
  async function _exchangeCode(pv,code,verifier){
    /* PRODUCTION: proxy through your backend so the client secret never ships:
       POST /api/oauth/${pv.id}/token {code, code_verifier} ->
         backend calls pv.tokenUrl, returns {access_token, expires_in, user}.
       Mock returns the same shape so downstream code is swap-free. */
    return {access_token:'mock.'+_b64url(_rand(18)),token_type:'bearer',
      expires_in:7200,obtained_at:Date.now()};
  }

  /* deterministic default interests from a handle, so mock feels personal */
  function defaultInterests(handle){
    let h=0;for(let i=0;i<handle.length;i++)h=(h*31+handle.charCodeAt(i))>>>0;
    const out=[];for(let i=0;i<3;i++)out.push(INTEREST_CHIPS[(h>>(i*4))%INTEREST_CHIPS.length]);
    return [...new Set(out)];
  }

  /* ================= agentic news wire ================= */
  const NEWS_WIRE={
    general:[
      {h:'Quasar disc flare paints the night rim gold',src:'Horizon Wire',tags:['space']},
      {h:'Courier guild logs record six-leg completion times',src:'Dispatch Ledger',tags:['gaming','esports']},
      {h:'Photon shard density up 12% along the equator',src:'Horizon Wire',tags:['space','engineering']},
      {h:'Wandering chef review: best street food on the walkable planet',src:'Globe Gourmet',tags:['food','travel']}],
    shinobi:[
      {h:'Hidden Leaf lantern festival extends to a third night',src:'Leaf Bulletin',tags:['anime','travel','film']},
      {h:'Shrine keystone restoration reaches final phase',src:'Leaf Bulletin',tags:['engineering','design']},
      {h:'Academy sparring bracket: quarterfinals set',src:'Shinobi Sports',tags:['esports','fitness','gaming']},
      {h:'Night-market ramen stalls debut a foxfire broth',src:'Globe Gourmet',tags:['food','anime']}],
    pirate:[
      {h:'Grand Plankway regatta draws crews from every cove',src:'Tide Signal',tags:['travel','esports','fitness']},
      {h:'Elbaf giants recast the harbor bell in bronze',src:'Tide Signal',tags:['engineering','music']},
      {h:'Lighthouse sessions: dusk shanty recordings released',src:'Tide Signal',tags:['music','film']},
      {h:'Boardwalk fish market posts record dawn catch',src:'Globe Gourmet',tags:['food','travel']}],
    saiyan:[
      {h:'Capsule Corp unveils gravity-dome training tiers',src:'Capsule Press',tags:['ai','fitness','gaming']},
      {h:'Skillforge AI tutor passes ten thousand courier drills',src:'Capsule Press',tags:['ai','engineering','esports']},
      {h:'Energy-lane pylons tuned for 8% brighter night glow',src:'Capsule Press',tags:['engineering','design','space']},
      {h:'Synthwave set announced atop the harbor crane',src:'Capsule Press',tags:['music','design']}]
  };
  const _recent=[];
  async function fetchAgenticNews(realmId,interests,n=1){
    /* PRODUCTION: replace body with a backend call that aggregates the
       connected accounts' live graphs:
         GET /api/news?realm=${realmId}&interests=${interests.join(',')}
       Return [{h,src,tags,url?}] and the gems render it unchanged. */
    const pool=[...(NEWS_WIRE[realmId]||[]),...NEWS_WIRE.general];
    const score=it=>{let s=Math.random()*.5;
      if(interests&&interests.length)for(const t of it.tags)if(interests.includes(t))s+=1;
      if(_recent.includes(it.h))s-=2;return s;};
    const picked=pool.map(it=>({it,s:score(it)})).sort((a,b)=>b.s-a.s).slice(0,n).map(o=>o.it);
    for(const p of picked){_recent.push(p.h);if(_recent.length>6)_recent.shift();}
    return picked.map(it=>({...it,personalized:!!(interests&&interests.length&&it.tags.some(t=>interests.includes(t)))}));
  }
  window.fetchAgenticNews=fetchAgenticNews;

  /* ================= UI: dock, modal, news card ================= */
  const css=document.createElement('style');css.textContent=`
  #socialDock{position:fixed;top:56px;left:50%;transform:translateX(-50%);z-index:60;display:flex;gap:8px;
    opacity:0;pointer-events:none;transition:opacity .8s ease .7s;}
  #ui.live~#socialDock{opacity:1;pointer-events:all;}
  .socBtn{padding:5px 13px;display:flex;align-items:center;gap:7px;border:1px solid var(--line);border-radius:999px;
    background:var(--ink);backdrop-filter:blur(13px) saturate(1.2);-webkit-backdrop-filter:blur(13px) saturate(1.2);
    font-family:var(--disp);font-weight:600;font-size:.6rem;letter-spacing:.16em;text-transform:uppercase;
    color:var(--frost);cursor:pointer;transition:all .22s;}
  .socBtn:hover{border-color:var(--gold);}
  .socBtn.on{border-color:var(--teal);color:#bff2ee;}
  .socBtn .dot{width:6px;height:6px;border-radius:50%;background:#5a6273;}
  .socBtn.on .dot{background:var(--teal);box-shadow:0 0 8px var(--teal);}
  #socModalWrap{position:fixed;inset:0;z-index:80;display:none;align-items:center;justify-content:center;
    background:rgba(5,6,15,.66);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}
  #socModalWrap.open{display:flex;}
  #socModal{width:min(360px,88vw);border:1px solid var(--line);border-radius:18px;background:var(--ink);
    padding:20px 22px;font-family:var(--disp);color:var(--cream);box-shadow:0 24px 60px -20px #000;}
  #socModal h3{margin:0 0 4px;font-size:.95rem;letter-spacing:.14em;text-transform:uppercase;}
  #socModal .scopes{font-family:var(--mono);font-size:.6rem;color:var(--frost);opacity:.8;margin:8px 0 12px;line-height:1.7;}
  #socModal input{width:100%;box-sizing:border-box;background:rgba(255,255,255,.05);border:1px solid var(--line);
    border-radius:10px;padding:9px 12px;color:var(--cream);font-family:var(--mono);font-size:.78rem;outline:none;}
  #socModal input:focus{border-color:var(--gold);}
  #socChips{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0 4px;}
  .socChip{padding:4px 10px;border:1px solid var(--line);border-radius:999px;font-size:.58rem;
    letter-spacing:.1em;text-transform:uppercase;color:var(--frost);cursor:pointer;transition:all .18s;}
  .socChip.on{border-color:var(--gold);color:var(--hot);background:rgba(255,176,104,.1);}
  #socModal .row{display:flex;gap:10px;margin-top:16px;}
  #socModal button{flex:1;padding:9px 0;border-radius:10px;border:1px solid var(--line);background:transparent;
    color:var(--cream);font-family:var(--disp);font-weight:600;font-size:.66rem;letter-spacing:.16em;
    text-transform:uppercase;cursor:pointer;transition:all .2s;}
  #socModal button.go{border-color:var(--gold);color:var(--hot);}
  #socModal button.warn{border-color:var(--crimson);color:#ffb2ac;}
  #socModal button:hover{background:rgba(255,255,255,.06);}
  #newsCard{position:fixed;left:50%;bottom:96px;transform:translate(-50%,14px);z-index:70;width:min(380px,90vw);
    border:1px solid var(--line);border-radius:14px;background:var(--ink);padding:13px 16px;
    font-family:var(--disp);color:var(--cream);opacity:0;pointer-events:none;transition:all .35s ease;
    backdrop-filter:blur(13px) saturate(1.2);-webkit-backdrop-filter:blur(13px) saturate(1.2);}
  #newsCard.show{opacity:1;transform:translate(-50%,0);pointer-events:all;cursor:pointer;}
  #newsCard .src{font-family:var(--mono);font-size:.56rem;letter-spacing:.18em;text-transform:uppercase;color:var(--teal);}
  #newsCard .hl{font-size:.84rem;margin:4px 0 6px;line-height:1.35;}
  #newsCard .meta{display:flex;gap:6px;font-size:.54rem;letter-spacing:.12em;text-transform:uppercase;color:var(--frost);opacity:.85;}
  #newsCard .meta .per{color:var(--gold);}`;
  document.head.appendChild(css);

  const dock=document.createElement('div');dock.id='socialDock';
  const modalWrap=document.createElement('div');modalWrap.id='socModalWrap';
  modalWrap.innerHTML='<div id="socModal"></div>';
  const card=document.createElement('div');card.id='newsCard';
  function mountUI(){ document.body.appendChild(dock);document.body.appendChild(modalWrap);document.body.appendChild(card);
    for(const k of['x','ig'])dock.appendChild(makeDockBtn(PROVIDERS[k]));syncDock(); }
  function makeDockBtn(pv){ const b=document.createElement('div');b.className='socBtn';b.dataset.pv=pv.id;
    b.onclick=()=>openModal(pv.id);return b; }
  function syncDock(){ dock.querySelectorAll('.socBtn').forEach(b=>{
    const acc=Social.accounts[b.dataset.pv],pv=PROVIDERS[b.dataset.pv];
    b.classList.toggle('on',!!acc);
    b.innerHTML=`<span class="dot"></span>${pv.icon} ${acc?'@'+acc.user:'Connect '+pv.label}`;}); }

  let _mPv=null,_mChips=new Set();
  function openModal(pvId){ const pv=PROVIDERS[pvId];_mPv=pv;const acc=Social.accounts[pvId];
    const m=modalWrap.querySelector('#socModal');
    if(acc){ // manage / disconnect
      m.innerHTML=`<h3>${pv.icon} @${acc.user}</h3>
        <div class="scopes">Connected ${new Date(acc.connectedAt).toLocaleDateString()}<br>
        Interests · ${acc.interests.join(' · ')||'—'}</div>
        <div class="row"><button id="socClose">Close</button><button id="socRevoke" class="warn">Disconnect</button></div>`;
      m.querySelector('#socClose').onclick=closeModal;
      m.querySelector('#socRevoke').onclick=()=>{delete Social.accounts[pvId];persist();syncDock();closeModal();
        banner('Account Disconnected',`${pv.icon} ${pv.label} unlinked — news gems return to the open wire.`);};
    }else{
      _mChips=new Set();
      m.innerHTML=`<h3>${pv.icon} Connect ${pv.label}</h3>
        <div class="scopes">OAuth 2.0 · PKCE S256<br>scopes · ${pv.scopes.join(' ')}<br>${pv.scopeNote}</div>
        <input id="socUser" placeholder="@handle" autocomplete="off" maxlength="24">
        <div id="socChips">${INTEREST_CHIPS.map(c=>`<div class="socChip" data-c="${c}">${c}</div>`).join('')}</div>
        <div class="row"><button id="socCancel">Cancel</button><button id="socGo" class="go">Authorize</button></div>`;
      m.querySelectorAll('.socChip').forEach(ch=>ch.onclick=()=>{const c=ch.dataset.c;
        _mChips.has(c)?_mChips.delete(c):_mChips.add(c);ch.classList.toggle('on');});
      m.querySelector('#socCancel').onclick=closeModal;
      m.querySelector('#socGo').onclick=()=>authorize(pv);
      const inp=m.querySelector('#socUser');inp.onkeydown=e=>{if(e.key==='Enter')authorize(pv);e.stopPropagation();};
      setTimeout(()=>inp.focus(),60);
    }
    modalWrap.classList.add('open');
  }
  function closeModal(){modalWrap.classList.remove('open');_mPv=null;}
  modalWrap.onclick=e=>{if(e.target===modalWrap)closeModal();};

  async function authorize(pv){
    const inp=modalWrap.querySelector('#socUser');
    const user=(inp&&inp.value||'').trim().replace(/^@/,'');
    if(!user){inp&&(inp.style.borderColor='var(--crimson)');return;}
    const pkce=await makePKCE();
    const authUrl=buildAuthUrl(pv,pkce);
    if(Social.production){
      sessionStorage.setItem('pkce.'+pv.id,JSON.stringify({verifier:pkce.verifier,state:pkce.state}));
      location.href=authUrl;return; // returns with ?code=&state= → handleOAuthReturn()
    }
    const token=await _exchangeCode(pv,'mock_code',pkce.verifier);
    const interests=_mChips.size?[..._mChips]:defaultInterests(user);
    Social.accounts[pv.id]={user,interests,token,connectedAt:Date.now(),flow:{method:pkce.method,authUrl}};
    persist();syncDock();closeModal();
    banner('Account Linked',`${pv.icon} @${user} connected — news gems on the trails now follow your interests.`);
    refreshAllGems();
  }
  /* PRODUCTION return leg: call this on load; consumes ?code & ?state */
  async function handleOAuthReturn(){
    const q=new URLSearchParams(location.search);const code=q.get('code'),state=q.get('state');
    if(!code||!state)return;
    for(const id in PROVIDERS){ const raw=sessionStorage.getItem('pkce.'+id);if(!raw)continue;
      const saved=JSON.parse(raw);if(saved.state!==state)continue;
      const token=await _exchangeCode(PROVIDERS[id],code,saved.verifier);
      Social.accounts[id]={user:'linked',interests:[],token,connectedAt:Date.now()};
      persist();sessionStorage.removeItem('pkce.'+id);
      history.replaceState(null,'',location.pathname);break; }
  }
  Social.handleOAuthReturn=handleOAuthReturn;

  /* ================= news gems on the authored trails ================= */
  const gems=[];
  function makeGemMesh(accent){
    const g=new THREE.Group();
    const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.22,0),
      new THREE.MeshBasicMaterial({color:accent,transparent:true,opacity:.92,blending:THREE.AdditiveBlending,depthWrite:false}));
    core.position.y=.95;g.add(core);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.34,.022,6,26),
      new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.4,blending:THREE.AdditiveBlending,depthWrite:false}));
    ring.position.y=.95;ring.rotation.x=Math.PI/2;g.add(ring);
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(.05,.16,1.7,8,1,true),
      new THREE.MeshBasicMaterial({color:accent,transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
    beam.position.y=.85;g.add(beam);
    g.userData={core,ring};return g;
  }
  function buildNewsGems(){
    if(typeof PATHS==='undefined'||!PATHS.length)return;
    for(const path of PATHS){
      const realm=realmAt(path.tp[Math.floor(path.tp.length/2)].t);
      for(const u of[.25,.5,.75]){
        const i=Math.min(path.tp.length-1,Math.round(u*(path.tp.length-1)));
        const s=path.tp[i];
        const g=makeGemMesh(realm.grade.accent);
        placeOn(g,s.t,s.p,0);planet.add(g);
        gems.push({group:g,t:s.t,p:s.p,realm:realm.id,armed:true,cool:0,spin:Math.random()*6});
        WORLD_STATS.gems++;
      }
    }
  }
  function refreshAllGems(){for(const gm of gems){gm.armed=true;gm.cool=0;gm.group.visible=true;}}
  window._socialRebuildGems=function(){gems.length=0;buildNewsGems();};
  window._gemLog=window._gemLog||{shinobi:0,pirate:0,saiyan:0};
  window.Artifacts=window.Artifacts||[];
  let _cardT=null;
  function showNewsCard(item,realmId){
    const per=item.personalized;
    const provs=Object.keys(Social.accounts).map(k=>PROVIDERS[k].icon).join(' ');
    card.innerHTML=`<div class="src">${item.src}</div><div class="hl">${item.h}</div>
      <div class="meta"><span>${REALMS[realmId].emo} ${REALMS[realmId].name}</span>
      <span>· ${item.tags.join(' · ')}</span>${per?`<span class="per">· for you ${provs}</span>`:''}</div>`;
    card.classList.add('show');
    clearTimeout(_cardT);_cardT=setTimeout(()=>card.classList.remove('show'),6200);
    card.onclick=()=>card.classList.remove('show');
  }
  const _gp=new THREE.Vector3();
  window.updateSocialGems=function(dt){
    if(!player||window._cine)return;
    for(const gm of gems){
      gm.spin+=dt;
      const ud=gm.group.userData;
      if(ud.core){ud.core.rotation.y=gm.spin*1.4;ud.core.position.y=.95+Math.sin(gm.spin*2)*.08;
        ud.ring.rotation.z=gm.spin*.8;}
      if(!gm.armed){gm.cool-=dt;if(gm.cool<=0){gm.armed=true;gm.group.visible=true;}continue;}
      gm.group.getWorldPosition(_gp);
      if(_gp.distanceToSquared(player.position)<1.8){
        gm.armed=false;gm.cool=75;gm.group.visible=false;
        chakra=Math.min(100,chakra+2);syncMeters&&syncMeters();
        window._gemLog[gm.realm]=(window._gemLog[gm.realm]||0)+1;
        fetchAgenticNews(gm.realm,Social.interests(),1).then(items=>{
          if(items[0]){showNewsCard(items[0],gm.realm);
            window.Artifacts.push({at:Date.now(),realm:gm.realm,h:items[0].h,src:items[0].src,tags:items[0].tags,per:!!items[0].personalized});
            if(window.LoqiBus)LoqiBus.push('gem','💠',`Wire-gem · ${items[0].h}`);}});
        sfx&&sfx.pick&&sfx.pick();
      }
    }
  };

  /* ================= boot hook ================= */
  const prevInit=window.init;
  window.init=async function(){
    await prevInit();
    mountUI();
    handleOAuthReturn();
    buildNewsGems();
    // re-stamp the QA badge now that the full layer stack has built
    try{const qa=Game.selfTest();document.body.dataset.qa=qa.pass?'pass':'fail';}catch(e){}
  };
})();
