import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
export async function mountMachine(container){
  if(!container.isConnected)throw Error('Detached');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.6;
  let model;
  try{const gltf=await Promise.race([new GLTFLoader().loadAsync(new URL('./assets/ticketrue-machine.glb',import.meta.url).href),new Promise((_,reject)=>setTimeout(()=>reject(Error('Model timeout')),10000))]);model=gltf.scene;}catch(e){renderer.dispose();throw e;}
  const scene=new THREE.Scene();scene.add(model);model.rotation.y=-.25;
  const ticket=model.getObjectByName('PrintedTicket');ticket.visible=false;
  model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true; const mats=Array.isArray(o.material)?o.material:[o.material]; for(const m of mats){if(m?.color && m.color.g>m.color.r*1.15 && m.color.g>m.color.b*1.1)m.color.setHex(0x5483b3);}}});
  scene.add(new THREE.AmbientLight(0xffffff,1.2));
  const key=new THREE.DirectionalLight(0xffffff,3.7);key.position.set(-3,7,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-4;key.shadow.camera.right=4;key.shadow.camera.top=5;key.shadow.camera.bottom=-4;key.shadow.normalBias=.03;scene.add(key);
  const fill=new THREE.DirectionalLight(0xc1e8ff,1.5);fill.position.set(4,2,-3);scene.add(fill);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.15}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.825;floor.receiveShadow=true;scene.add(floor);
  const camera=new THREE.PerspectiveCamera(36,1,.1,100);camera.position.set(4.4,2.65,8.1);camera.lookAt(0,.2,0);
  let stopped=false,frame=0,printing=0,last=0,angle=-.25,dragging=false,startX=0,startAngle=0,visible=true;
  const canvas=renderer.domElement;canvas.setAttribute('aria-label','Cinematic 3D Ticketrue ticket vending machine.');canvas.setAttribute('role','img');canvas.style.touchAction='pan-y';
  container.appendChild(canvas);const fallback=container.querySelector('#machine-fallback');if(fallback)fallback.hidden=true;
  function resize(){if(stopped)return;const {width,height}=container.getBoundingClientRect();renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();draw(performance.now());}
  function draw(now){if(stopped||!visible)return;if(now-last<30 && !reduced)return;last=now;model.rotation.y+=(angle-model.rotation.y)*.1;if(printing){const t=Math.min(1,(now-printing)/3200);const ease=1-Math.pow(1-t,3);ticket.scale.y=Math.max(.01,ease);ticket.position.y=-.47-.45*ease;ticket.position.z=1.09+.11*ease;if(t===1)printing=0;}renderer.render(scene,camera);}
  function tick(now){if(stopped)return;draw(now);frame=requestAnimationFrame(tick);}
  function down(e){dragging=true;startX=e.clientX;startAngle=angle;canvas.setPointerCapture(e.pointerId);}
  function move(e){if(!dragging)return;angle=THREE.MathUtils.clamp(startAngle+(e.clientX-startX)*.008,-1.15,.55);if(reduced){model.rotation.y=angle;draw(performance.now());}}
  function up(){dragging=false;}
  // Cinematic only: no user rotation or inspect controls.
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();if(fallback){fallback.hidden=false;if(ticket.visible)fallback.classList.add('printed');}canvas.hidden=true;dispose();},{once:true});
  const observer=new ResizeObserver(resize);observer.observe(container);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)draw(performance.now());});intersection.observe(container);
  resize();if(!reduced)frame=requestAnimationFrame(tick);
  function print(){ticket.visible=true;if(reduced){ticket.scale.y=1;ticket.position.y=-.92;ticket.position.z=1.2;draw(performance.now());}else{printing=performance.now();ticket.scale.y=.01;}}
  function dispose(){if(stopped)return;stopped=true;cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();scene.traverse(o=>{o.geometry?.dispose();if(o.material){const materials=Array.isArray(o.material)?o.material:[o.material];materials.forEach(m=>m.dispose());}});renderer.dispose();canvas.remove();}
  return {print,dispose};
}
