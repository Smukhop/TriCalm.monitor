/* === TriFable · MiniVerse — environment registry =========================
   Classic script, shared global scope (loaded after kurama.core.js, before
   kurama.world.js). Lets self-contained env.*.js "build environment" packs
   register new districts, building/prop builders, colliders, inter-hub road
   links and ambient decorators WITHOUT editing the core dispatch chains.

   A pack is one file that calls these register* functions at load time.
   Geometry is authored against the same helper context the core uses, so
   anime cel + ink-outline styling stays uniform across the whole planet.
   ------------------------------------------------------------------------
   Contract (read once, build many):

   registerBuilding(type, fn)         fn(ctx) builds into ctx.g. ctx fields:
       g        THREE.Group (the building root — add meshes here)
       add(m,sh=true)                 -> casts/receives shadow, adds to g, returns m
       bx(w,h,d,c)                    -> Box mesh, toon(c). NOTE: NOT scaled — multiply sizes/positions by ctx.s
       cy(rt,rb,h,seg,c)              -> Cylinder mesh, toon(c). NOT scaled.
       cn(r,h,seg,c)                  -> Cone mesh, toon(c). NOT scaled.
       win(x,y,z)                     -> warm window plane that lights at night
       plat()                         -> stone platform disc
       outline(m,k=1.035)             -> backside ink hull; do g.add(outline(mesh,1.03))
       toon(col,em=0)                 -> MeshToonMaterial on the shared gradient ramp
       s, col, roof                   -> scale + the district-chosen body/roof colors
       PAL, TAU, DEG, THREE           -> palette + math + three
       bobbers, particles, windowMats -> push {m,bob|spinY|amp} to animate; petals; lit panes
       bannerG, thatchRoofG, stonePillarsG, pagodaG  -> shared sub-builders
     A registered builder takes precedence over the core if/else chain.

   registerProp(kind, fn, colliderRadius)   fn(ctx) builds into ctx.g. ctx fields:
       g, add, toon, outline, PAL, TAU, THREE, bobbers, particles, s
       bx(w,h,d,c)/cy(rt,rb,h,seg,c)/cn(r,h,seg,c)  -> ALREADY multiplied by s.
     colliderRadius (optional) adds a soft body-collision blocker for this prop.

   registerDistrict(spec)   spec = {
       id, name, t, p, radius,
       buildings:[{type, offset:[dt,dp], col, roof, s, rot}],
       roads:[{offset:[dt,dp], to:[dt,dp], width, curve, color, markings}],
       props:[[kind,[dt,dp],s,rot], ...],          // these increment the prop count
       wires:[[[dt,dp],[dt,dp]], ...] }
     t,p are absolute globe coords (theta longitude, phi colatitude). Offsets
     are added to the district t,p. Keep |offset|<~0.3 so a district stays local.

   registerLink(a, b, spec)        connector road between two district ids.
   registerDecorator(fn)           fn() runs at the end of buildWorld for ambient
                                   scatter (call global surfaceDetail()/tree()/rock()).
   registerEnvPack({id,theme,title,capability})   manifest entry for the Codex/diagnostics.
=========================================================================== */
const BUILDERS={};        // type  -> fn(ctx)
const PROPS={};           // kind  -> fn(ctx)
const EXT_COLLIDERS={};   // kind  -> collider radius (merged into surfaceDetail blocker map)
const EXT_LINKS=[];       // {a,b,spec} inter-district connector roads
const EXT_DECORATORS=[];  // fn() ambient scatter run at the end of buildWorld
const ENV_PACKS=[];       // {id,theme,title,capability} manifest for diagnostics + codex

function registerBuilding(type,fn){ if(type&&typeof fn==='function') BUILDERS[type]=fn; }
function registerProp(kind,fn,colliderRadius){ if(kind&&typeof fn==='function'){ PROPS[kind]=fn; if(colliderRadius) EXT_COLLIDERS[kind]=colliderRadius; } }
function registerDistrict(spec){ if(spec&&spec.id&&typeof WORLD_SPEC==='object'){ WORLD_SPEC.districts.push(spec); } return spec; }
function registerLink(a,b,spec={}){ if(a&&b) EXT_LINKS.push({a,b,spec}); }
function registerDecorator(fn){ if(typeof fn==='function') EXT_DECORATORS.push(fn); }
function registerEnvPack(meta){ ENV_PACKS.push(meta||{}); }

// Safe invoke: a single faulty pack logs and is skipped — it can never abort the world build.
function _extBuild(map,key,ctx){ const fn=map[key]; if(!fn) return false;
  try{ fn(ctx); return true; }catch(e){ console.warn('[env] builder failed for "'+key+'":',e); return false; } }
function _runDecorators(){ for(const fn of EXT_DECORATORS){ try{ fn(); }catch(e){ console.warn('[env] decorator failed:',e); } } }

window.TriFableRegistry={BUILDERS,PROPS,EXT_COLLIDERS,EXT_LINKS,EXT_DECORATORS,ENV_PACKS,
  count:()=>({builders:Object.keys(BUILDERS).length,props:Object.keys(PROPS).length,
    links:EXT_LINKS.length,decorators:EXT_DECORATORS.length,packs:ENV_PACKS.length})};
