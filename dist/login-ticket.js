import * as THREE from 'three';

// A real extruded ticket with a printed front, animated only on auth routes.
export function mountLoginTicket(container){
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.setClearColor(0xffffff,0);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(35,1,.1,50);
  camera.position.set(0,0,9.5);
  const group=new THREE.Group();scene.add(group);
  const w=4.5,h=2.65,r=.15,n=.19;
  const shape=new THREE.Shape();
  shape.moveTo(-w/2+r,-h/2);shape.lineTo(w/2-r,-h/2);shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);
  shape.lineTo(w/2,-n);shape.absarc(w/2,0,n,-Math.PI/2,Math.PI/2,true);
  shape.lineTo(w/2,h/2-r);shape.quadraticCurveTo(w/2,h/2,w/2-r,h/2);shape.lineTo(-w/2+r,h/2);
  shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);shape.lineTo(-w/2,n);shape.absarc(-w/2,0,n,Math.PI/2,Math.PI*1.5,true);
  shape.lineTo(-w/2,-h/2+r);shape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:.06,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:3,steps:1,curveSegments:24});
  const pos=geometry.attributes.position,uv=geometry.attributes.uv;
  for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)+w/2)/w,(pos.getY(i)+h/2)/h);
  const print=document.createElement('canvas');print.width=1440;print.height=848;
  const ctx=print.getContext('2d');
  if(!ctx){geometry.dispose();renderer.dispose();throw Error('Canvas unavailable')}
  ctx.fillStyle='#ecf6ff';ctx.fillRect(0,0,1440,848);
  ctx.fillStyle='#0c315c';ctx.fillRect(0,0,1440,145);
  ctx.fillStyle='#ffffff';ctx.font='bold 48px Arial';ctx.fillText('ticketrue.',70,91);
  ctx.font='23px Arial';ctx.fillStyle='#b9d7f6';ctx.fillText('LIVE / 2026',1120,87);
  ctx.fillStyle='#47779f';ctx.font='23px Arial';ctx.fillText('THE NIGHT IS YOURS',72,230);
  ctx.fillStyle='#0a2b50';ctx.font='bold 91px Arial';ctx.fillText('FEEL IT',66,350);ctx.fillText('LIVE.',66,454);
  ctx.font='27px Arial';ctx.fillStyle='#3f6f9a';ctx.fillText('ONE TICKET. A THOUSAND MEMORIES.',72,532);
  ctx.strokeStyle='#96b9db';ctx.lineWidth=3;ctx.setLineDash([8,10]);ctx.beginPath();ctx.moveTo(1050,165);ctx.lineTo(1050,805);ctx.stroke();ctx.setLineDash([]);
  ctx.save();ctx.translate(1215,478);ctx.rotate(-Math.PI/2);ctx.fillStyle='#0c315c';ctx.font='bold 48px Arial';ctx.textAlign='center';ctx.fillText('ADMIT ONE',0,0);ctx.font='22px Arial';ctx.fillStyle='#5580a8';ctx.fillText('TICKETRUE / CONCERT PASS',0,45);ctx.restore();
  ctx.fillStyle='#f9a12b';ctx.fillRect(70,612,200,73);ctx.fillStyle='#0c315c';ctx.font='bold 35px Arial';ctx.fillText('VIP / 01',91,660);
  ctx.font='23px Arial';ctx.fillStyle='#466f95';ctx.fillText('YOUR PEOPLE. YOUR MUSIC.',310,643);ctx.font='18px Arial';ctx.fillText('DEMO PREVIEW · NOT VALID FOR ENTRY',310,675);
  ctx.fillStyle='#1a4a77';for(let i=0,x=74;i<95;i++){const bw=i%4===0?5:2;ctx.fillRect(x,744,bw,40);x+=bw+4;}
  ctx.font='18px Arial';ctx.fillStyle='#668bac';ctx.fillText('TR—LIVE—0001',780,772);
  const texture=new THREE.CanvasTexture(print);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),4);
  const front=new THREE.MeshStandardMaterial({map:texture,roughness:.46,metalness:.08});
  const edge=new THREE.MeshStandardMaterial({color:0x598bc0,roughness:.3,metalness:.35});
  const ticket=new THREE.Mesh(geometry,[front,edge]);group.add(ticket);
  const rearMaterial=new THREE.MeshStandardMaterial({color:0x7da8d6,roughness:.5,metalness:.05});
  const rear=new THREE.Mesh(geometry,rearMaterial);rear.position.set(.1,-.07,-.17);rear.rotation.z=.055;group.add(rear);
  scene.add(new THREE.HemisphereLight(0xffffff,0x87a5c3,2.6));
  const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-3,5,6);scene.add(key);
  const fill=new THREE.DirectionalLight(0xc1e8ff,1.7);fill.position.set(4,0,3);scene.add(fill);
  const canvas=renderer.domElement;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Animated three-dimensional blue Ticketrue concert ticket');
  container.appendChild(canvas);
  let disposed=false,frame=0,last=0,elapsed=0,visible=true;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');let paused=reduce.matches;
  function pose(){group.rotation.set(-.13+Math.sin(elapsed*.46)*.045,-.19+Math.sin(elapsed*.4)*.19,-.13+Math.sin(elapsed*.3)*.035);group.position.y=Math.sin(elapsed*.65)*.11;renderer.render(scene,camera)}
  function draw(now){frame=0;if(disposed||paused||!visible||document.hidden)return;if(last&&now-last<32){frame=requestAnimationFrame(draw);return}elapsed+=last?Math.min((now-last)/1000,.05):0;last=now;pose();frame=requestAnimationFrame(draw)}
  function schedule(){if(!disposed&&!paused&&visible&&!document.hidden&&!frame){last=0;frame=requestAnimationFrame(draw)}}
  function resize(){if(disposed)return;const rect=container.getBoundingClientRect();if(!rect.width||!rect.height)return;renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.position.z=camera.aspect<1.4?9.7:8.6;camera.updateProjectionMatrix();pose()}
  const ro=new ResizeObserver(resize);ro.observe(container);
  const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){cancelAnimationFrame(frame);frame=0}else schedule()});io.observe(container);
  function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0}else schedule()}
  function reduced(){paused=reduce.matches;cancelAnimationFrame(frame);frame=0;pose();schedule();const b=document.querySelector('.login-animation-toggle');if(b){b.textContent=paused?'Play animation':'Pause animation';b.setAttribute('aria-pressed',String(paused))}}
  document.addEventListener('visibilitychange',visibility);reduce.addEventListener?.('change',reduced);
  const fallback=container.querySelector('.login-ticket-fallback');
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();dispose();const b=document.querySelector('.login-animation-toggle');if(b)b.hidden=true},{once:true});
  resize();pose();if(fallback)fallback.hidden=true;schedule();
  function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);ro.disconnect();io.disconnect();document.removeEventListener('visibilitychange',visibility);reduce.removeEventListener?.('change',reduced);geometry.dispose();texture.dispose();front.dispose();edge.dispose();rearMaterial.dispose();renderer.dispose();canvas.remove();if(fallback)fallback.hidden=false;}
  return {dispose,get paused(){return paused},toggle(){paused=!paused;cancelAnimationFrame(frame);frame=0;schedule();return paused}};
}
