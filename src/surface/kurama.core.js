/* === Kurama · Quasar Horizon — flattened module (classic script, shared global scope). THREE + postprocessing provided as globals by the boot shim in index.html. === */
// ===== runtime state =====
let scene,camera,renderer,composer,bloomPass,inkPass,clock=new THREE.Clock();
let planet,player,playerMesh,carryMesh,playerShadow;
let skyRig,quasar,sunLight,starfield,skyDome,ambLight,hemiLight;
let agents=[],shards=[],particles=[],clouds=[],lanternLights=[];
let villagers=[],birds=[],landmarks=[],windowMats=[],bobbers=[];
let discoveredCount=0, TOTAL_LM=0;
let curChar=0, carrying=false, deliverIdx=0, giverSlot=0, targetSlot=1, doneSet=new Set();
let velocity=new THREE.Vector3(), onGround=true, running=false, animT=0,lastStepBeat=-1,jumpQueued=false;
let keys={}, joyOn=false, joyV={x:0,y:0};
let camYaw=0, camPitch=0.08, cameraMode='follow', ptr={down:false,x:0,y:0};
let currentDistrict='dispatch';
let gameOn=false, intro=0, gameTime=9.0, chakra=100, shardCount=0;
let near=null, dialogOn=false, dq=[];
let audioCtx,masterGain,audioOn=true,bloomLevel=2,dayLevel=1;
let toonRamp; const _up=new THREE.Vector3(0,1,0), _q=new THREE.Quaternion(),facingDir=new THREE.Vector3(0,0,1);
const worldColliders=[];
const wallColliders=[];              // {a,b,radius,label} capsule segments (bridge rails, ravine rims, plankway ropes)
let colHash=null;const COL_CELL=6.5; // static spatial hash over both collider sets, built once after world assembly
const WORLD_STATS={districts:0,buildings:0,roads:0,props:0,wires:0,paths:0,bridges:0,ghibli:0,gems:0,flora:0};
const SHARD_GOAL=24, DAYLENS=[0.025,0.05,0.1];

// ===== helpers =====
function s2c(t,p,r){return new THREE.Vector3(r*Math.sin(p)*Math.cos(t),r*Math.cos(p),r*Math.sin(p)*Math.sin(t));}
function placeOn(o,t,p,h=0){const pos=s2c(t,p,PLANET_R+h);o.position.copy(pos);
  _q.setFromUnitVectors(_up,pos.clone().normalize());o.quaternion.copy(_q);o.userData.t=t;o.userData.p=p;}
function makeRamp(){const c=document.createElement('canvas');c.width=4;c.height=1;const x=c.getContext('2d');
  ['#2d2c36','#6b6a76','#c6c5cf','#ffffff'].forEach((col,i)=>{x.fillStyle=col;x.fillRect(i,0,1,1);});
  const t=new THREE.CanvasTexture(c);t.minFilter=t.magFilter=THREE.NearestFilter;return t;}
function toon(col,em=0){return new THREE.MeshToonMaterial({color:new THREE.Color(col),gradientMap:toonRamp,
  emissive:new THREE.Color(col),emissiveIntensity:em});}
function outline(m,s=1.035){const o=m.clone();o.material=new THREE.MeshBasicMaterial({color:0x20242a,side:THREE.BackSide});
  o.scale.multiplyScalar(s);o.renderOrder=-1;o.castShadow=false;o.receiveShadow=false;return o;}

// Screen-space ink pass: preserves the cel palette while adding drawn contour lines
// around road edges, building silhouettes, avatars, props and horizon transitions.
const AnimeInkShader={
  uniforms:{tDiffuse:{value:null},resolution:{value:new THREE.Vector2(1/innerWidth,1/innerHeight)},strength:{value:.82}},
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`uniform sampler2D tDiffuse;uniform vec2 resolution;uniform float strength;varying vec2 vUv;
    float lum(vec3 c){return dot(c,vec3(.299,.587,.114));}
    void main(){vec4 src=texture2D(tDiffuse,vUv);vec2 r=resolution;
      float tl=lum(texture2D(tDiffuse,vUv+vec2(-r.x,r.y)).rgb),tc=lum(texture2D(tDiffuse,vUv+vec2(0.,r.y)).rgb),tr=lum(texture2D(tDiffuse,vUv+r).rgb);
      float ml=lum(texture2D(tDiffuse,vUv+vec2(-r.x,0.)).rgb),mr=lum(texture2D(tDiffuse,vUv+vec2(r.x,0.)).rgb);
      float bl=lum(texture2D(tDiffuse,vUv-r).rgb),bc=lum(texture2D(tDiffuse,vUv+vec2(0.,-r.y)).rgb),br=lum(texture2D(tDiffuse,vUv+vec2(r.x,-r.y)).rgb);
      float gx=-tl-2.*ml-bl+tr+2.*mr+br,gy=tl+2.*tc+tr-bl-2.*bc-br;
      float edge=smoothstep(.07,.30,length(vec2(gx,gy)))*strength;
      float l=lum(src.rgb);vec3 cel=mix(vec3(l),src.rgb,1.36);cel=pow(max(cel,0.0),vec3(.92));
      gl_FragColor=vec4(mix(cel,vec3(.04,.05,.07),edge),src.a);}`
};

/* ---- audio ---- */
function initAudio(){try{audioCtx=new(window.AudioContext||window.webkitAudioContext)();
  masterGain=audioCtx.createGain();masterGain.gain.value=0.26;masterGain.connect(audioCtx.destination);}catch(e){}}
function tone(f,d,ty='sine',v=0.3){if(!audioOn||!audioCtx)return;const o=audioCtx.createOscillator(),g=audioCtx.createGain();
  o.type=ty;o.frequency.value=f;g.gain.setValueAtTime(v,audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0008,audioCtx.currentTime+d);o.connect(g);g.connect(masterGain);
  o.start();o.stop(audioCtx.currentTime+d);}
const sfx={step:()=>tone(78+Math.random()*36,0.06,'triangle',0.06),
  jump:()=>{tone(240,0.18,'sine',0.13);setTimeout(()=>tone(360,0.13,'sine',0.1),55);},
  pick:()=>{tone(620,0.1,'sine',0.12);setTimeout(()=>tone(880,0.16,'sine',0.1),70);},
  sign:()=>{tone(420,0.3,'sine',0.1);tone(640,0.4,'sine',0.08);},
  deliver:()=>{[523,659,784].forEach((f,i)=>setTimeout(()=>tone(f,0.26,'sine',0.13),i*110));},
  pickup:()=>{tone(330,0.12,'sine',0.1);setTimeout(()=>tone(494,0.2,'sine',0.1),90);},
  talk:()=>tone(262,0.09,'sine',0.08)};

/* ---- persistence ---- */
function openDB(){return new Promise((res,rej)=>{const r=indexedDB.open('quasarHorizon',1);
  r.onupgradeneeded=e=>{const db=e.target.result;if(!db.objectStoreNames.contains('s'))db.createObjectStore('s',{keyPath:'k'});};
  r.onsuccess=()=>res(r.result);r.onerror=rej;});}
async function save(){try{const db=await openDB();db.transaction('s','readwrite').objectStore('s').put({k:'state',
  d:{char:curChar,deliver:deliverIdx,carrying,giverSlot,targetSlot,done:[...doneSet],shards:shardCount,
     audio:audioOn,bloom:bloomLevel,day:dayLevel}});}catch(e){}}
async function load(){try{const db=await openDB();return await new Promise(r=>{
  const q=db.transaction('s','readonly').objectStore('s').get('state');q.onsuccess=()=>r(q.result?.d||null);q.onerror=()=>r(null);});}catch(e){return null;}}

