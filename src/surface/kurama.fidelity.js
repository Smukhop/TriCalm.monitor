/* === kurama.fidelity.js — production-grade anime fidelity pass ============
   Loaded LAST (after kurama.main.js, before init() runs). Two jobs:
     1) register a density decorator so the horizon reads edge-to-edge full,
        closer to the painterly "tiny-planet" reference;
     2) wrap window.init() to strengthen the screen-space ink contours and
        deepen the sky once the renderer/passes exist.
   All effects are guarded — if a hook is missing the base game is untouched.
   Classic script, shared global scope. ===================================== */
(function(){
  // ---- 1) ambient density: fills the band between authored hubs ----
  if(typeof registerDecorator==='function'){
    registerDecorator(function densityPass(){
      // extra hillside homes scattered around the populated equatorial band
      if(typeof building==='function'){
        const homes=[
          [0.30,Math.PI/2+0.30,0xf0e7d6,0xb76a63,.7],[2.05,Math.PI/2+0.34,0xc9d8c0,0x6f7b62,.72],
          [-1.15,Math.PI/2+0.30,0xe7d8c0,0x9a5a4e,.7],[3.05,Math.PI/2+0.10,0xd7c2a0,0x6f533b,.72],
          [-2.55,Math.PI/2-0.12,0xbcd0e0,0x5f6f8f,.7],[4.55,Math.PI/2+0.06,0xf0e0cc,0xc27b76,.72],
          [0.95,Math.PI/2+0.50,0xd9e0d0,0x6a7b5a,.68],[-0.45,Math.PI/2+0.46,0xe7dccb,0x8e5648,.7]];
        for(const [t,p,c,r,sc] of homes){ try{ if(typeof PATH_CLEAR==='function'&&!PATH_CLEAR(t,p,1.5))continue; building('villageHouse',t,p,c,r,sc); }catch(e){} }
      }
      // small prop clutter to break up empty ground
      if(typeof surfaceDetail==='function'){
        const clutter=[['pottedPlants',0.34,Math.PI/2+0.26],['crateStack',2.0,Math.PI/2+0.30],
          ['bench',-1.1,Math.PI/2+0.26],['signboard',3.0,Math.PI/2+0.06],['pottedPlants',-2.5,Math.PI/2-0.16],
          ['crateStack',4.5,Math.PI/2+0.02],['bench',0.9,Math.PI/2+0.46],['cone',-0.4,Math.PI/2+0.42],
          ['vendingMachine',2.1,Math.PI/2+0.26],['redMailbox',-1.2,Math.PI/2+0.34]];
        for(const [k,t,p] of clutter){ try{ if(typeof PATH_CLEAR==='function'&&!PATH_CLEAR(t,p,1.0))continue; surfaceDetail(k,t,p,0.92,Math.random()*Math.PI); }catch(e){} }
      }
      // denser greenery for the lush painterly feel
      if(typeof tree==='function'){
        const kinds=['round','pine','sakura','round'];
        for(let i=0;i<46;i++){ try{ const tt=Math.random()*Math.PI*2,pp=0.5+Math.random()*1.9; if(typeof PATH_CLEAR==='function'&&!PATH_CLEAR(tt,pp,0.9))continue; tree(tt,pp,kinds[i%4],0.5+Math.random()*0.8); }catch(e){} }
      }
    });
  }

  // ---- painterly "watercolor cel" post pass — makes the 3D world read as hand-drawn anime ----
  // (posterized luminance bands + S-curve ink shadows + warm paint tint + paper grain)
  const AnimePainterlyShader = {
    uniforms:{ tDiffuse:{value:null}, resolution:{value:new THREE.Vector2(1/innerWidth,1/innerHeight)},
      uLevels:{value:7.0}, uGrain:{value:0.042}, uWarm:{value:0.05}, uStrength:{value:0.92}, uOutline:{value:0.28} },
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`
      uniform sampler2D tDiffuse;uniform vec2 resolution;uniform float uLevels;uniform float uGrain;uniform float uWarm;uniform float uStrength;uniform float uOutline;
      varying vec2 vUv;
      float lum(vec3 c){return dot(c,vec3(.299,.587,.114));}
      float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
      vec3 sample9(vec2 uv){
        vec2 px=resolution;
        vec3 c=texture2D(tDiffuse,uv).rgb*4.0;
        c+=texture2D(tDiffuse,uv+vec2(px.x,0.)).rgb;
        c+=texture2D(tDiffuse,uv-vec2(px.x,0.)).rgb;
        c+=texture2D(tDiffuse,uv+vec2(0.,px.y)).rgb;
        c+=texture2D(tDiffuse,uv-vec2(0.,px.y)).rgb;
        return c/8.0;
      }
      void main(){
        vec3 src=texture2D(tDiffuse,vUv).rgb;
        vec3 wash=mix(src,sample9(vUv),0.45);
        float l=lum(wash);
        float ql=floor(l*uLevels+0.5)/uLevels;
        vec3 c=wash*((l>0.001)?(ql/max(l,0.001)):1.0);
        c=pow(clamp(c,0.0,1.0),vec3(0.94));
        c=mix(c,c*c*(3.0-2.0*c),0.30);
        vec3 coolShadow=vec3(0.92,0.96,1.05);
        vec3 warmLight=vec3(1.07,1.01,0.95);
        c*=mix(coolShadow,warmLight,smoothstep(0.15,0.95,ql));
        c+=vec3(uWarm,uWarm*0.36,-uWarm*0.45);

        vec2 r=resolution;
        float tl=lum(texture2D(tDiffuse,vUv+vec2(-r.x,r.y)).rgb),tc=lum(texture2D(tDiffuse,vUv+vec2(0.,r.y)).rgb),tr=lum(texture2D(tDiffuse,vUv+r).rgb);
        float ml=lum(texture2D(tDiffuse,vUv+vec2(-r.x,0.)).rgb),mr=lum(texture2D(tDiffuse,vUv+vec2(r.x,0.)).rgb);
        float bl=lum(texture2D(tDiffuse,vUv-r).rgb),bc=lum(texture2D(tDiffuse,vUv+vec2(0.,-r.y)).rgb),br=lum(texture2D(tDiffuse,vUv+vec2(r.x,-r.y)).rgb);
        float gx=-tl-2.*ml-bl+tr+2.*mr+br,gy=tl+2.*tc+tr-bl-2.*bc-br;
        float edge=smoothstep(.08,.28,length(vec2(gx,gy)))*uOutline;

        float grain = hash(floor((vUv/resolution)/2.0));
        float paper = hash(floor(vUv*vec2(540.0,380.0))*0.73);
        c*= (1.0-uGrain) + grain*uGrain*1.75;
        c = mix(c, c*(0.98+paper*0.04), 0.35);
        c = mix(c, vec3(0.11,0.12,0.16), edge);
        gl_FragColor=vec4(mix(src,clamp(c,0.0,1.0),uStrength),1.0);
      }`
  };

  // ---- 2) post-build render polish (runs after the base init resolves) ----
  const _init = window.init;
  if(typeof _init==='function'){
    window.init = async function(){
      const r = await _init.apply(this, arguments);
      try{ applyRenderPolish(); }catch(e){ console.warn('[fidelity] render polish skipped:', e); }
      return r;
    };
  }
  let _painterlyAdded=false;
  function applyRenderPolish(){
    // stronger drawn contour lines — the reference reads as hard ink over cel fills
    if(typeof inkPass!=='undefined' && inkPass && inkPass.uniforms && inkPass.uniforms.strength){
      inkPass.uniforms.strength.value = 1.08;
    }
    // flatter, more COHESIVE anime daylight: lift fill light, ease the harsh key (matches the reference grid)
    try{
      if(typeof ambLight!=='undefined'&&ambLight) ambLight.intensity=0.52;
      if(typeof hemiLight!=='undefined'&&hemiLight) hemiLight.intensity=0.36;
      if(typeof sunLight!=='undefined'&&sunLight){ sunLight.intensity=1.34; sunLight.color.set(0xfff3dd); }
    }catch(e){}
    // a touch more atmospheric depth on the rim without washing the planet
    try{ planet.userData.atmo.material.uniforms.intensity.value = 0.58; }catch(e){}
    // insert the painterly watercolor-cel pass just before OutputPass so it grades the whole scene
    try{
      if(!_painterlyAdded && typeof composer!=='undefined' && composer && composer.passes && typeof ShaderPass!=='undefined'){
        const pass=new ShaderPass(AnimePainterlyShader);
        pass.uniforms.resolution.value.set(1/innerWidth,1/innerHeight);
        composer.insertPass(pass, Math.max(0, composer.passes.length-1)); // before OutputPass (last)
        window._painterlyPass=pass; _painterlyAdded=true;
        addEventListener('resize',()=>{ pass.uniforms.resolution.value.set(1/innerWidth,1/innerHeight); });
      }
    }catch(e){ console.warn('[fidelity] painterly pass skipped:', e); }
  }
})();
