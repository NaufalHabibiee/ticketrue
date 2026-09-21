// Home hero: a 3D concert ticket that tilts toward the cursor and can be switched left and right.
// Everything is driven by CSS custom properties on the active card, so the markup stays plain HTML.
const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));

export function mountHeroTicket(root){
  const scene=root?.querySelector('#tk-scene');
  if(!scene)return{dispose(){}};
  const cards=[...scene.querySelectorAll('.tk-card')],n=cards.length;
  if(!n)return{dispose(){}};
  const dots=[...root.querySelectorAll('[data-tk-dot]')],live=root.querySelector('#tk-live');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IDLE={rx:4,ry:-10,tx:0,ty:0,mx:28,my:18};
  const cur={...IDLE},target={...IDLE};
  let index=0,raf=0,disposed=false,down=null,moved=0;

  function layout(){
    cards.forEach((c,i)=>{
      let d=((i-index)%n+n)%n;if(d>n/2)d-=n;
      c.style.setProperty('--d',d);
      c.classList.toggle('is-active',d===0);
      c.toggleAttribute('inert',d!==0);
      c.setAttribute('aria-hidden',String(d!==0));
    });
    dots.forEach((b,i)=>{b.classList.toggle('on',i===index);b.setAttribute('aria-current',i===index?'true':'false')});
    if(live)live.textContent=`Concert ${index+1} of ${n}: ${cards[index].getAttribute('aria-label')}`;
    apply();
  }
  function apply(){
    const el=cards[index].querySelector('.tk-tilt');if(!el)return;
    el.style.setProperty('--rx',cur.rx.toFixed(2)+'deg');
    el.style.setProperty('--ry',cur.ry.toFixed(2)+'deg');
    el.style.setProperty('--tx',cur.tx.toFixed(1)+'px');
    el.style.setProperty('--ty',cur.ty.toFixed(1)+'px');
    el.style.setProperty('--mx',cur.mx.toFixed(1)+'%');
    el.style.setProperty('--my',cur.my.toFixed(1)+'%');
  }
  function tick(){
    raf=0;if(disposed)return;
    let busy=false;
    for(const k in cur){const diff=target[k]-cur[k];if(Math.abs(diff)>.02){cur[k]+=diff*.14;busy=true}else cur[k]=target[k]}
    apply();
    if(busy)raf=requestAnimationFrame(tick);
  }
  const kick=()=>{if(!raf&&!disposed)raf=requestAnimationFrame(tick)};

  function go(delta){index=((index+delta)%n+n)%n;layout()}
  function goTo(i){index=clamp(i,0,n-1);layout()}

  function onMove(e){
    if(reduced||(e.pointerType==='touch'&&!down))return;
    const r=cards[index].getBoundingClientRect();
    if(!r.width)return;
    const dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);
    const nx=clamp(dx/(window.innerWidth*.4),-1,1),ny=clamp(dy/(window.innerHeight*.45),-1,1);
    target.ry=nx*20;                       // turn toward the cursor
    target.rx=4-ny*14;
    target.tx=nx*12;target.ty=ny*8;
    target.mx=clamp((e.clientX-r.left)/r.width*100,0,100);
    target.my=clamp((e.clientY-r.top)/r.height*100,0,100);
    kick();
  }
  function onLeave(){Object.assign(target,IDLE);kick()}

  function onDown(e){if(e.target.closest('a,button'))return;down={x:e.clientX};moved=0}
  function onUp(e){
    if(!down)return;
    const dx=e.clientX-down.x;moved=Math.abs(dx);
    if(moved>60)go(dx<0?1:-1);
    down=null;
  }
  function onClickCapture(e){if(moved>8){e.preventDefault();e.stopPropagation();moved=0}}
  function onClick(e){
    if(e.target.closest('[data-tk-prev]'))go(-1);
    else if(e.target.closest('[data-tk-next]'))go(1);
    else{const d=e.target.closest('[data-tk-dot]');if(d)goTo(+d.dataset.tkDot)}
  }
  function onKey(e){
    if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;
    if(/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)||e.target.isContentEditable)return;
    if(!root.matches(':hover')&&!root.contains(document.activeElement))return;
    e.preventDefault();go(e.key==='ArrowLeft'?-1:1);
  }

  root.addEventListener('pointermove',onMove);
  root.addEventListener('pointerleave',onLeave);
  scene.addEventListener('pointerdown',onDown);
  window.addEventListener('pointerup',onUp);
  scene.addEventListener('click',onClickCapture,true);
  root.addEventListener('click',onClick);
  document.addEventListener('keydown',onKey);
  layout();

  return{
    next:()=>go(1),prev:()=>go(-1),goTo,
    dispose(){
      disposed=true;if(raf)cancelAnimationFrame(raf);
      root.removeEventListener('pointermove',onMove);root.removeEventListener('pointerleave',onLeave);
      scene.removeEventListener('pointerdown',onDown);window.removeEventListener('pointerup',onUp);
      scene.removeEventListener('click',onClickCapture,true);root.removeEventListener('click',onClick);
      document.removeEventListener('keydown',onKey);
    }
  };
}
