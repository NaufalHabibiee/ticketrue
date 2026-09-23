import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

// Ticket vending machine.
// The printed ticket is a real sheet: a verlet strip fed out of the slot in small steps,
// pulled down by gravity, kept at a fixed length and given a little bending stiffness,
// so it pokes out, droops, swings and settles instead of stretching.
// The screen is a live canvas that walks through idle -> processing -> printing -> ready.

const SLOT={y:-.47,z:1.055};            // mouth of the ticket slot (model space)
const PAPER={w:1.28,h:.9};               // ticket size (model units)
const ROWS=30;                           // simulated points along the ticket's length
const FONT='Inter,Arial,sans-serif';

const lerp=(a,b,t)=>a+(b-a)*t;
const clamp01=t=>Math.min(1,Math.max(0,t));
const easeInOut=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

function roundRect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}

function ticketTexture(info){
  const W=1024,H=Math.round(1024*PAPER.h/PAPER.w),c=document.createElement('canvas');c.width=W;c.height=H;
  const g=c.getContext('2d');
  // paper
  const bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#fffdf8');bg.addColorStop(1,'#f4efe4');
  g.fillStyle=bg;g.fillRect(0,0,W,H);
  // soft fibre noise so it reads as paper, not plastic
  for(let i=0;i<2600;i++){g.fillStyle=`rgba(90,70,40,${Math.random()*.035})`;g.fillRect(Math.random()*W,Math.random()*H,1+Math.random()*2,1)}
  const stubY=Math.round(H*.7);
  // header band
  g.fillStyle='#0c2d50';g.fillRect(0,0,W,120);
  g.fillStyle='#F9A12B';g.fillRect(0,120,W,8);
  g.fillStyle='#fff';g.font=`800 54px ${FONT}`;g.textBaseline='middle';g.fillText('TICKETRUE',56,62);
  g.fillStyle='#F9A12B';g.beginPath();g.arc(56+g.measureText('TICKETRUE').width+14,78,8,0,Math.PI*2);g.fill();
  g.fillStyle='#9fc0e6';g.font=`700 26px ${FONT}`;g.textAlign='right';g.fillText(info.demo?'ADMIT ONE · DEMO':'ADMIT ONE · VERIFIED',W-56,62);g.textAlign='left';
  // event
  g.fillStyle='#0c2d50';g.font=`800 70px ${FONT}`;g.textBaseline='alphabetic';
  let title=(info.title||'YOUR NEXT NIGHT').toUpperCase();
  while(g.measureText(title).width>W-112&&title.length>4)title=title.slice(0,-2).trimEnd()+'…';
  g.fillText(title,56,236);
  g.fillStyle='#56708e';g.font=`600 32px ${FONT}`;g.fillText(info.meta||'ONE TICKET. ONE UNFORGETTABLE NIGHT.',56,292);
  g.fillStyle='#0c2d50';g.font=`700 30px ${FONT}`;g.fillText(info.seat||'GENERAL ADMISSION',56,352);
  if(info.venue){g.fillStyle='#56708e';g.font=`500 28px ${FONT}`;g.fillText(info.venue,56,400)}
  // tear line
  g.strokeStyle='#b9a98c';g.lineWidth=4;g.setLineDash([14,12]);g.beginPath();g.moveTo(40,stubY);g.lineTo(W-40,stubY);g.stroke();g.setLineDash([]);
  // stub: barcode + code
  let x=56;const seed=[...(info.code||'TR-0001')].reduce((a,ch)=>a*31+ch.charCodeAt(0)>>>0,7);let r=seed;
  g.fillStyle='#0c2d50';
  while(x<W*.62){r=(r*1103515245+12345)>>>0;const w=2+(r>>>28)%4;g.fillRect(x,stubY+44,w,H-stubY-96);x+=w+2+((r>>>24)%3)}
  g.font=`700 30px ${FONT}`;g.fillStyle='#0c2d50';g.textAlign='right';g.fillText(info.code||'TR-0001',W-56,stubY+84);
  g.fillStyle='#8a7a5c';g.font=`600 24px ${FONT}`;g.fillText('KEEP THIS STUB',W-56,stubY+124);g.textAlign='left';
  // notches at the tear line (cut out through alpha)
  g.globalCompositeOperation='destination-out';
  for(const nx of [0,W]){g.beginPath();g.arc(nx,stubY,26,0,Math.PI*2);g.fill()}
  g.globalCompositeOperation='source-over';
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;
  const m=document.createElement('canvas');m.width=256;m.height=Math.round(256*H/W);const mg=m.getContext('2d');
  mg.fillStyle='#fff';mg.fillRect(0,0,m.width,m.height);mg.fillStyle='#000';const k=m.width/W;
  for(const nx of [0,m.width]){mg.beginPath();mg.arc(nx,stubY*k,26*k,0,Math.PI*2);mg.fill()}
  return {tex:t,mask:new THREE.CanvasTexture(m)};
}

function makeScreen(){
  const W=1024,H=Math.round(1024*1.14/1.5),c=document.createElement('canvas');c.width=W;c.height=H;
  const g=c.getContext('2d'),tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
  const steps=['Verifying ownership','Preparing your seat','Printing ticket'];
  function frame(accent){
    const bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#123f7a');bg.addColorStop(1,'#0a2447');
    g.fillStyle=bg;g.fillRect(0,0,W,H);
    const glow=g.createRadialGradient(W*.25,H*.1,10,W*.25,H*.1,W*.9);glow.addColorStop(0,accent);glow.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=glow;g.fillRect(0,0,W,H);
    g.fillStyle='rgba(255,255,255,.035)';for(let y=0;y<H;y+=6)g.fillRect(0,y,W,2);
    g.fillStyle='rgba(255,255,255,.55)';g.font=`700 26px ${FONT}`;g.textBaseline='alphabetic';g.fillText('TICKETRUE · KIOSK 01',64,74);
  }
  function draw(state,p,now){
    const t=now/1000;
    if(state==='idle'){
      frame('rgba(90,160,255,.28)');
      g.fillStyle='#fff';g.font=`800 92px ${FONT}`;g.fillText('YOUR NEXT',64,300);g.fillText('MOMENT.',64,400);
      g.fillStyle='#a9d4ff';g.font=`700 34px ${FONT}`;g.fillText('READY TO PRINT',64,520);
      if(Math.floor(t*2)%2===0){g.fillStyle='#F9A12B';g.fillRect(64+g.measureText('READY TO PRINT').width+12,494,18,32)}
    }else if(state==='processing'){
      frame('rgba(249,161,43,.22)');
      // spinner
      const cx=W-170,cy=190;g.lineWidth=14;g.lineCap='round';
      g.strokeStyle='rgba(255,255,255,.15)';g.beginPath();g.arc(cx,cy,64,0,Math.PI*2);g.stroke();
      g.strokeStyle='#F9A12B';g.beginPath();g.arc(cx,cy,64,t*5,t*5+Math.PI*1.25);g.stroke();
      g.fillStyle='#fff';g.font=`800 70px ${FONT}`;g.fillText('PROCESSING',64,200);
      g.fillStyle='#a9d4ff';g.font=`600 34px ${FONT}`;g.fillText('Please wait a moment'+'.'.repeat(1+Math.floor(t*3)%3),64,258);
      const done=Math.min(steps.length-1,Math.floor(p*steps.length));
      steps.forEach((s,i)=>{const y=370+i*78;
        g.fillStyle=i<done?'#3ecf8e':i===done?'#F9A12B':'rgba(255,255,255,.25)';g.beginPath();g.arc(84,y-12,14,0,Math.PI*2);g.fill();
        if(i<done){g.strokeStyle='#0a2447';g.lineWidth=5;g.beginPath();g.moveTo(77,y-12);g.lineTo(83,y-6);g.lineTo(92,y-19);g.stroke()}
        g.fillStyle=i<=done?'#fff':'rgba(255,255,255,.45)';g.font=`700 34px ${FONT}`;g.fillText(s,120,y)});
    }else if(state==='printing'){
      frame('rgba(249,161,43,.22)');
      g.fillStyle='#fff';g.font=`800 70px ${FONT}`;g.fillText('PRINTING…',64,200);
      g.fillStyle='#a9d4ff';g.font=`600 34px ${FONT}`;g.fillText('Your ticket is coming out below',64,258);
      const bx=64,by=360,bw=W-128,bh=38;
      g.fillStyle='rgba(255,255,255,.14)';roundRect(g,bx,by,bw,bh,19);g.fill();
      const fill=g.createLinearGradient(bx,0,bx+bw,0);fill.addColorStop(0,'#F9A12B');fill.addColorStop(1,'#ffd08a');
      g.fillStyle=fill;roundRect(g,bx,by,Math.max(bh,bw*p),bh,19);g.fill();
      // moving sheen on the bar
      const sx=bx+((t*420)%(bw+200))-100;g.save();roundRect(g,bx,by,Math.max(bh,bw*p),bh,19);g.clip();
      const sh=g.createLinearGradient(sx-60,0,sx+60,0);sh.addColorStop(0,'rgba(255,255,255,0)');sh.addColorStop(.5,'rgba(255,255,255,.55)');sh.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=sh;g.fillRect(sx-60,by,120,bh);g.restore();
      g.fillStyle='#fff';g.font=`800 48px ${FONT}`;g.fillText(Math.round(p*100)+'%',64,470);
      g.fillStyle='rgba(255,255,255,.55)';g.font=`600 30px ${FONT}`;g.textAlign='right';g.fillText('Do not pull the ticket',W-64,466);g.textAlign='left';
      // arrow pointing down to the slot
      const ay=560+Math.sin(t*6)*8;g.fillStyle='#F9A12B';g.beginPath();g.moveTo(W/2-26,ay);g.lineTo(W/2+26,ay);g.lineTo(W/2,ay+30);g.closePath();g.fill();
    }else{ // ready
      frame('rgba(62,207,142,.26)');
      const pulse=1+Math.sin(t*4)*.04,cx=W-180,cy=230;
      g.fillStyle='rgba(62,207,142,.18)';g.beginPath();g.arc(cx,cy,100*pulse,0,Math.PI*2);g.fill();
      g.fillStyle='#3ecf8e';g.beginPath();g.arc(cx,cy,72,0,Math.PI*2);g.fill();
      g.strokeStyle='#0a2447';g.lineWidth=14;g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(cx-32,cy+2);g.lineTo(cx-8,cy+26);g.lineTo(cx+36,cy-24);g.stroke();
      g.fillStyle='#fff';g.font=`800 78px ${FONT}`;g.fillText('TICKET',64,200);g.fillText('READY!',64,288);
      g.fillStyle='#bdf5dc';g.font=`700 36px ${FONT}`;g.fillText('Please take your ticket',64,400);
      g.fillStyle='rgba(255,255,255,.6)';g.font=`600 30px ${FONT}`;g.fillText('Enjoy the show.',64,452);
      for(let i=0;i<3;i++){const a=clamp01(Math.sin(t*5-i*.9)*.5+.5),ay=520+i*26;g.fillStyle=`rgba(62,207,142,${.25+a*.75})`;g.beginPath();g.moveTo(W/2-28,ay);g.lineTo(W/2+28,ay);g.lineTo(W/2,ay+22);g.closePath();g.fill()}
    }
    tex.needsUpdate=true;
  }
  return {tex,draw};
}

export async function mountMachine(container,opts={}){
  if(!container.isConnected)throw Error('Detached');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const onState=typeof opts.onState==='function'?opts.onState:()=>{};
  const info={title:container.dataset.title,meta:container.dataset.meta,seat:container.dataset.seat,venue:container.dataset.venue,code:container.dataset.code,demo:container.dataset.demo==='1',...(opts.ticket||{})};
  try{await Promise.race([Promise.all([document.fonts.load(`800 40px Inter`),document.fonts.load(`600 40px Inter`)]),new Promise(r=>setTimeout(r,1200))])}catch{}
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.6;
  let model;
  try{const gltf=await Promise.race([new GLTFLoader().loadAsync(new URL('./assets/ticketrue-machine.glb',import.meta.url).href),new Promise((_,reject)=>setTimeout(()=>reject(Error('Model timeout')),10000))]);model=gltf.scene;}catch(e){renderer.dispose();throw e;}
  const scene=new THREE.Scene();scene.add(model);model.rotation.y=-.25;
  const root=model.getObjectByName('TicketRueDispenser')||model;
  // The model's stiff ticket and fixed screen text are replaced by a live sheet and a live screen.
  const oldTicket=model.getObjectByName('PrintedTicket');if(oldTicket)oldTicket.visible=false;
  for(const n of ['ScreenLineOne','ScreenLineTwo','ScreenReady']){const o=model.getObjectByName(n);if(o)o.visible=false}
  model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true; const mats=Array.isArray(o.material)?o.material:[o.material]; for(const m of mats){if(m?.color && m.color.g>m.color.r*1.15 && m.color.g>m.color.b*1.1)m.color.setHex(0x5483b3);}}});
  // Indicator LED gets its own material so it can blink amber while printing and turn green when ready.
  const led=model.getObjectByName('Indicator');let ledMat=null;
  if(led?.isMesh){ledMat=new THREE.MeshStandardMaterial({color:0x5483b3,emissive:0x5483b3,emissiveIntensity:.6,roughness:.4});led.material=ledMat}

  // live screen
  const screen=makeScreen();
  const screenMesh=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1.14),new THREE.MeshBasicMaterial({map:screen.tex,toneMapped:false}));
  screenMesh.position.set(0,.79,.9965);root.add(screenMesh);

  // the ticket sheet
  const cols=6;
  const geo=new THREE.PlaneGeometry(PAPER.w,PAPER.h,cols,ROWS-1);
  const pos=geo.attributes.position;
  const {tex:face,mask}=ticketTexture(info);
  const frontMat=new THREE.MeshStandardMaterial({map:face,roughness:.92,metalness:0,side:THREE.FrontSide,alphaTest:.5});
  const backMat=new THREE.MeshStandardMaterial({color:0xf3eee3,roughness:.95,metalness:0,side:THREE.BackSide,alphaMap:mask,alphaTest:.5});
  const paperFront=new THREE.Mesh(geo,frontMat),paperBack=new THREE.Mesh(geo,backMat);
  for(const m of [paperFront,paperBack]){m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;m.visible=false;root.add(m)}
  paperFront.customDepthMaterial=paperBack.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,alphaMap:mask,alphaTest:.5});

  // Verlet strip along the ticket's length (2D: y,z). Point i sits i*ds from the leading (bottom) edge.
  const ds=PAPER.h/(ROWS-1);
  const P=Array.from({length:ROWS},(_,i)=>({y:SLOT.y,z:SLOT.z-(i*ds),py:SLOT.y,pz:SLOT.z-(i*ds)}));
  let fed=0;                       // how much paper has left the slot
  const G=5.2,DAMP=.986,STEP=1/120;
  const TILT=-.16;                 // paper leaves the slot pointing slightly down
  const dirY=Math.sin(TILT),dirZ=Math.cos(TILT);
  function inside(p,s){p.y=SLOT.y+dirY*s;p.z=SLOT.z+dirZ*s;p.py=p.y;p.pz=p.z}   // s<=0: still in the feed path
  function simulate(dt){
    // integrate free points
    for(let i=0;i<ROWS;i++){const p=P[i],s=fed-i*ds;if(s<=0){inside(p,s);continue}
      const vy=(p.y-p.py)*DAMP,vz=(p.z-p.pz)*DAMP;p.py=p.y;p.pz=p.z;p.y+=vy-G*dt*dt;p.z+=vz;}
    for(let k=0;k<14;k++){
      // keep length (inextensible paper)
      for(let i=0;i<ROWS-1;i++){const a=P[i],b=P[i+1],sa=fed-i*ds>0,sb=fed-(i+1)*ds>0;if(!sa&&!sb)continue;
        const dy=b.y-a.y,dz=b.z-a.z,d=Math.hypot(dy,dz)||1e-6,diff=(d-ds)/d;
        const wa=sa?(sb?.5:1):0,wb=sb?(sa?.5:1):0;a.y+=dy*diff*wa;a.z+=dz*diff*wa;b.y-=dy*diff*wb;b.z-=dz*diff*wb;}
      // bending stiffness: paper resists folding, strongest near the slot where it is supported
      for(let i=0;i<ROWS-2;i++){const a=P[i],b=P[i+1],c=P[i+2];if(fed-i*ds<=0)continue;
        const s=fed-(i+1)*ds,stiff=s<.04?.5:.075;
        const my=(a.y+c.y)/2,mz=(a.z+c.z)/2,wa=1,wc=fed-(i+2)*ds>0?1:0;
        const oy=(b.y-my)*stiff,oz=(b.z-mz)*stiff;b.y-=oy;b.z-=oz;a.y+=oy*.5*wa;a.z+=oz*.5*wa;c.y+=oy*.5*wc;c.z+=oz*.5*wc;}
      // the sheet cannot pass through the machine's front
      for(let i=0;i<ROWS;i++){const p=P[i];if(fed-i*ds<=0)continue;const wall=p.y>SLOT.y-.06?SLOT.z-.02:1.045;if(p.z<wall)p.z=wall;}
    }
  }
  const tmpN=new THREE.Vector3();
  function writeSheet(){
    // PlaneGeometry rows run top (index 0) to bottom; the bottom row is the leading edge (P[0]).
    for(let row=0;row<ROWS;row++){
      const i=ROWS-1-row,p=P[Math.max(0,Math.min(ROWS-1,i))];
      const q=P[Math.min(ROWS-1,i+1)],o=P[Math.max(0,i-1)];
      let ty=o.y-q.y,tz=o.z-q.z;const tl=Math.hypot(ty,tz)||1;ty/=tl;tz/=tl;      // along the sheet, toward the leading edge
      tmpN.set(0,tz,-ty);                                                           // sheet normal (faces the viewer when hanging)
      for(let c=0;c<=cols;c++){const idx=row*(cols+1)+c,x=pos.getX(idx),u=x/(PAPER.w/2);
        const curl=.035*u*u*Math.min(1,Math.max(0,(fed-i*ds)/.25));                 // gentle cross-curl (edges lift toward the viewer), like paper off a roll
        pos.setXYZ(idx,x,p.y+tmpN.y*curl,p.z+tmpN.z*curl);}
    }
    pos.needsUpdate=true;geo.computeVertexNormals();geo.computeBoundingSphere();
  }

  scene.add(new THREE.AmbientLight(0xffffff,1.2));
  const key=new THREE.DirectionalLight(0xffffff,3.7);key.position.set(-3,7,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-4;key.shadow.camera.right=4;key.shadow.camera.top=5;key.shadow.camera.bottom=-4;key.shadow.normalBias=.03;scene.add(key);
  const fill=new THREE.DirectionalLight(0xc1e8ff,1.5);fill.position.set(4,2,-3);scene.add(fill);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.15}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.825;floor.receiveShadow=true;scene.add(floor);
  const camera=new THREE.PerspectiveCamera(36,1,.1,100);const CAM={x:3.45,y:2.05,z:6.35},LOOK=new THREE.Vector3(0,-.12,0);
  function frameCamera(){const a=camera.aspect||1,k=a<1.05?1+(1.05-a)*.95:1;camera.position.set(CAM.x*k,CAM.y*k,CAM.z*k);camera.lookAt(LOOK)}frameCamera();
  let stopped=false,frame=0,last=0,angle=-.25,visible=true,acc=0,lastScreen=0;
  let state='idle',stateAt=performance.now(),printProgress=0,printStart=0;
  const PROCESS_MS=1900,PRINT_MS=3600;
  const canvas=renderer.domElement;canvas.setAttribute('aria-label','Cinematic 3D Ticketrue ticket vending machine.');canvas.setAttribute('role','img');canvas.style.touchAction='pan-y';
  container.appendChild(canvas);const fallback=container.querySelector('#machine-fallback');if(fallback)fallback.hidden=true;
  function setState(s){state=s;stateAt=performance.now();onState(s);}
  function resize(){if(stopped)return;const {width,height}=container.getBoundingClientRect();renderer.setSize(width,height,false);camera.aspect=width/height;frameCamera();camera.updateProjectionMatrix();draw(performance.now());}
  function feedTarget(now){
    // stepper-motor feel: quick pushes with tiny pauses, easing in and out overall
    const t=clamp01((now-printStart)/PRINT_MS),base=easeInOut(t)*PAPER.h;if(t>=1)return PAPER.h;
    const steps=26,local=(t*steps)%1,stepEase=local<.7?local/.7:1;
    return Math.min(PAPER.h,Math.max(0,base-PAPER.h/steps*(1-stepEase)*.6));
  }
  function draw(now){
    if(stopped||!visible)return;if(now-last<16)return;
    const dt=Math.min(.05,(now-(last||now))/1000);last=now;
    model.rotation.y+=(angle-model.rotation.y)*.1;
    // state machine
    if(state==='processing'){const p=clamp01((now-stateAt)/PROCESS_MS);if(p>=1){setState('printing');printStart=now;paperFront.visible=paperBack.visible=true}}
    if(state==='printing'){printProgress=clamp01((now-printStart)/PRINT_MS);fed=Math.max(fed,feedTarget(now));
      // the cabinet hums a little while the motor runs
      root.position.x=Math.sin(now*.09)*.0025;root.position.y=Math.abs(Math.sin(now*.045))*.002;
      if(printProgress>=1){fed=PAPER.h;root.position.set(0,0,0);setState('ready')}}
    if(paperFront.visible){acc+=dt;let n=0;while(acc>=STEP&&n<8){simulate(STEP);acc-=STEP;n++}if(n===8)acc=0;
      // a faint breeze keeps the hanging ticket alive
      if(state==='ready'){const w=Math.sin(now*.0011)*.00004+Math.sin(now*.0023)*.00002;for(let i=0;i<ROWS;i++)if(fed-i*ds>.1)P[i].z+=w*(1-i/ROWS)}
      writeSheet()}
    // LED
    if(ledMat){if(state==='processing'||state==='printing'){const on=Math.sin(now*.012)>0;ledMat.color.setHex(0xF9A12B);ledMat.emissive.setHex(0xF9A12B);ledMat.emissiveIntensity=on?1.6:.2}
      else if(state==='ready'){ledMat.color.setHex(0x3ecf8e);ledMat.emissive.setHex(0x3ecf8e);ledMat.emissiveIntensity=1.1+Math.sin(now*.005)*.4}
      else{ledMat.color.setHex(0x5483b3);ledMat.emissive.setHex(0x5483b3);ledMat.emissiveIntensity=.6}}
    // screen redraw ~20fps
    if(now-lastScreen>50){lastScreen=now;const p=state==='processing'?clamp01((now-stateAt)/PROCESS_MS):state==='printing'?printProgress:1;screen.draw(state,p,now)}
    renderer.render(scene,camera);
  }
  function tick(now){if(stopped)return;draw(now);frame=requestAnimationFrame(tick);}
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();if(fallback){fallback.hidden=false;if(state!=='idle')fallback.classList.add('printed');}canvas.hidden=true;dispose();},{once:true});
  const observer=new ResizeObserver(resize);observer.observe(container);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){last=0;draw(performance.now())}});intersection.observe(container);
  screen.draw('idle',0,performance.now());
  resize();frame=requestAnimationFrame(tick);
  function print(){
    if(state!=='idle')return;
    if(reduced){fed=PAPER.h;paperFront.visible=paperBack.visible=true;for(let i=0;i<400;i++)simulate(STEP);writeSheet();setState('ready');return}
    setState('processing');
  }
  function dispose(){if(stopped)return;stopped=true;cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();scene.traverse(o=>{o.geometry?.dispose();if(o.material){const materials=Array.isArray(o.material)?o.material:[o.material];materials.forEach(m=>{m.map?.dispose();m.dispose()});}});face.dispose();mask.dispose();screen.tex.dispose();renderer.dispose();canvas.remove();}
  return {print,dispose,get state(){return state}};
}
