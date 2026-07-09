/* === kurama.planets.js — Split-Verse Planetary Engine =====================
   The tri-fabled horizon is now THREE planets. Each verse builds the whole
   globe from only its own districts, respread across the full sphere, with
   its own terrain wash, sea colour, atmosphere and authored trail network.
   Travelling between verses is no longer a walk — you ride the wormhole
   (kurama.wormhole.js). This module owns:
     • prepVerse(id)      — filter + longitude-respread the world spec,
                            live anchors, live NPC stations, live ravine
     • applyVerseSkin()   — per-planet terrain/sea/atmosphere identity
     • buildPathNetwork() — verse-aware override: flagship trails per planet
                            (bridge only where the ravine is carved) + flora
     • Planets.rebuild(id)— teardown + rebuild pipeline for transits
   Classic script; loads after the verse gate, before the wormhole. ======== */
(function(){
  'use strict';

  /* ---------------- master snapshot + realm classification ---------------- */
  let MASTER=null,NPC_MASTER=null;
  function snapshot(){
    if(MASTER)return;
    MASTER=WORLD_SPEC.districts.map(d=>({...d}));
    NPC_MASTER=NPCS.map(n=>({...n}));
  }
  const spanOf=r=>((r.range[1]-r.range[0])+TAU)%TAU||TAU;
  function remapT(t,r){
    const tn=((t%TAU)+TAU)%TAU;
    const frac=(((tn-r.range[0])+TAU)%TAU)/spanOf(r);
    return frac*TAU;
  }

  /* ---------------- per-planet identity ---------------- */
  const PLANET_SKIN={
    shinobi:{land:0x8fbf5a,landAmt:.14,sea:0x2f6fae,seaEm:0x16335a,atmo:0x62d8dc,fog:0x0a140f},
    pirate:{land:0x59c0a8,landAmt:.20,sea:0x1f8fb0,seaEm:0x0d3d54,atmo:0x3DC9C2,fog:0x08131c},
    saiyan:{land:0x9a8ad0,landAmt:.18,sea:0x3a3a7e,seaEm:0x1c1440,atmo:0x9B7CF6,fog:0x0b0d16}
  };
  window.applyVerseSkin=function(){
    const v=window._verse;if(!v||!planet)return;
    const S=PLANET_SKIN[v];if(!S)return;
    try{
      const terra=planet.userData.surface;
      if(terra&&terra.geometry.attributes.color){
        const col=terra.geometry.attributes.color,tint=new THREE.Color(S.land),c=new THREE.Color();
        for(let i=0;i<col.count;i++){c.setRGB(col.getX(i),col.getY(i),col.getZ(i)).lerp(tint,S.landAmt);
          col.setXYZ(i,c.r,c.g,c.b);}
        col.needsUpdate=true;
      }
      const water=planet.userData.water;
      if(water){water.material.color.setHex(S.sea);water.material.emissive.setHex(S.seaEm);}
      const atmo=planet.userData.atmo;
      if(atmo&&atmo.material.uniforms)atmo.material.uniforms.color.value.setHex(S.atmo);
    }catch(e){console.warn('[planets] skin:',e);}
  };

  /* ---------------- verse preparation ---------------- */
  window.prepVerse=function(id){
    snapshot();
    const r=REALMS[id];if(!r)return;
    window._verse=id;
    // districts of this verse, respread across the whole globe
    WORLD_SPEC.districts=MASTER
      .filter(d=>realmAt(d.t).id===id)
      .map(d=>({...d,t:remapT(d.t,r)}));
    // live anchors: every realm keeps one, but only the local hub is on-planet
    for(const rr of Object.values(REALMS)){
      const hub=(rr.id===id)?WORLD_SPEC.districts.find(d=>d.id===rr.hub):null;
      rr.anchorLive=hub?{t:hub.t,p:hub.p}:{...rr.anchor};
    }
    // live ravine: shinobi planet only, carved between the remapped endpoints
    window._verseCarve=(id==='shinobi');
    window.RAVINE_LIVE={a:{t:remapT(RAVINE.a.t,REALMS.shinobi),p:RAVINE.a.p},
                        b:{t:remapT(RAVINE.b.t,REALMS.shinobi),p:RAVINE.b.p},
                        halfWidth:RAVINE.halfWidth,depth:RAVINE.depth};
    // live NPC stations: local couriers remap; foreign ones park offworld at the gate
    window.NPCS_LIVE=NPC_MASTER.map(n=>{
      const home=realmAt(n.t);
      if(home.id===id)return {t:remapT(n.t,home),p:n.p,offworld:false};
      const A=r.anchorLive;return {t:A.t+.42,p:A.p-.02,offworld:true};
    });
    document.body.dataset.verse=id;
  };

  /* ---------------- verse-aware trail network (overrides paths module) ---- */
  const TRAILS={
    shinobi:[
      {id:'kurama-crossing',name:'Kurama Crossing',from:'shrine',to:'hiddenleaf',width:1.7,curve:.045,style:'dirt',bridge:true},
      {id:'lantern-wood',name:'Lantern Wood Trail',from:'hiddenleaf',to:'festival',width:1.6,curve:-.05,style:'dirt',forest:true}],
    pirate:[
      {id:'grand-plankway',name:'Grand Plankway',from:'boardwalk',to:'elbaf',width:1.8,curve:.03,style:'plank',rails:true},
      {id:'cliff-watch-run',name:'Cliff Watch Run',from:'lookout',to:'dojo',width:1.6,curve:.05,style:'dirt',forest:true}],
    saiyan:[
      {id:'capsule-lane',name:'Capsule Energy Lane',from:'forge',to:'harbor',width:1.7,curve:-.04,style:'tech'},
      {id:'gravity-mile',name:'Gravity Mile',from:'capsulecorp',to:'skillforge',width:1.6,curve:.04,style:'tech'}]
  };
  window.buildPathNetwork=function(){
    const specs=TRAILS[window._verse]||[];
    const D=id=>WORLD_SPEC.districts.find(d=>d.id===id);
    for(const sp of specs){
      const a=D(sp.from),b=D(sp.to);if(!a||!b)continue;
      const path=createPath({id:sp.id,name:sp.name,realm:window._verse,
        a:{t:a.t,p:a.p},b:{t:b.t,p:b.p},width:sp.width,curve:sp.curve,style:sp.style,rails:sp.rails});
      if(sp.bridge&&window._verseCarve)buildKuramaBridge(path);
      if(sp.forest)dressForestCorridor(path);
      dressTrailFlora(path);
    }
    flushGhibliProps();
    window.PathSystem={list:()=>PATHS.map(p=>({id:p.id,name:p.name,style:p.style,realm:p.realm,points:p.pts.length})),
      count:PATHS.length,clear:PATH_CLEAR};
  };

  /* ---------------- teardown + rebuild ---------------- */
  function disposeDeep(root){
    root.traverse(o=>{
      if(o.geometry)o.geometry.dispose();
      if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];
        for(const m of ms){if(m.map&&!m.map.userData?.shared)m.map.dispose&&m.map.dispose();m.dispose&&m.dispose();}}
    });
  }
  function teardown(){
    if(planet){scene.remove(planet);try{disposeDeep(planet);}catch(e){}}
    worldColliders.length=0;wallColliders.length=0;colHash=null;
    PATHS.length=0;villagers.length=0;landmarks.length=0;windowMats.length=0;
    bobbers.length=0;lanternLights.length=0;shards.length=0;agents.length=0;
    if(typeof resetGhibliBudget==='function')resetGhibliBudget();
    Object.assign(WORLD_STATS,{districts:0,buildings:0,roads:0,props:0,wires:0,paths:0,bridges:0,ghibli:0,gems:0,flora:0});
  }
  window.rebuildVerse=function(id){
    prepVerse(id);
    teardown();
    buildPlanet();
    buildWorld();
    agents=NPCS.map(makeAgent);
    makeShards();
    if(typeof buildRealmBeacons==='function')buildRealmBeacons();
    if(typeof buildCollisionIndex==='function')buildCollisionIndex();
    if(typeof buildWormholeGate==='function')buildWormholeGate();
    if(typeof window._socialRebuildGems==='function')window._socialRebuildGems();
    if(typeof buildCollisionIndex==='function')buildCollisionIndex(); // gate + beacon colliders
    if(typeof updateRealms==='function')updateRealms(0.3);
    save&&save();
  };
  window.Planets={
    current:()=>window._verse,
    skin:PLANET_SKIN,trails:TRAILS,
    master:()=>MASTER,
    rebuild:window.rebuildVerse,
    districtsOf:id=>{snapshot();return MASTER.filter(d=>realmAt(d.t).id===id);}
  };

  /* ---------------- boot: the first planet is the remembered verse -------- */
  const prevInit=window.init;
  window.init=async function(){
    snapshot();
    prepVerse(localStorage.getItem('trifable.verse')||'shinobi');
    await prevInit();
  };
})();
