// Home hero: a 3D concert ticket that tilts toward the cursor, fans the other concerts behind it,
// plays through them on its own, and throws a little confetti when "View tickets" is pressed.
// Everything visual is driven by CSS custom properties, so the markup stays plain HTML.
const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
let lastPointer=0;addEventListener('pointerdown',()=>{lastPointer=performance.now()},true);addEventListener('mousedown',()=>{lastPointer=performance.now()},true);
const byKeyboard=()=>performance.now()-lastPointer>600;

function confetti(x,y){
  const c=document.createElement('canvas'),ctx=c.getContext?.('2d');if(!ctx)return;
  const dpr=Math.min(devicePixelRatio||1,2);c.width=innerWidth*dpr;c.height=innerHeight*dpr;
  c.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999';
  document.body.append(c);ctx.scale(dpr,dpr);
  const cols=['#F9A12B','#ffd08a','#5483b3','#9cc4ee','#ffffff','#0c2d50'];
  const parts=Array.from({length:70},(_,i)=>{const a=Math.random()*Math.PI*2,s=4+Math.random()*9;return{x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-6,r:Math.random()*6.3,vr:(Math.random()-.5)*.35,w:8+Math.random()*9,h:5+Math.random()*4,c:cols[i%cols.length],t:0}});
  (function frame(){
    ctx.clearRect(0,0,innerWidth,innerHeight);let alive=0;
    for(const p of parts){if(p.t>120)continue;alive++;p.t++;p.vy+=.3;p.vx*=.985;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.globalAlpha=Math.min(1,(120-p.t)/30);ctx.fillStyle=p.c;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);ctx.restore()}
    alive?requestAnimationFrame(frame):c.remove();
  })();
}

export function mountHeroTicket(root){
  const scene=root?.querySelector('#tk-scene');
  if(!scene)return{dispose(){}};
  const cards=[...scene.querySelectorAll('.tk-card')],n=cards.length;
  if(!n)return{dispose(){}};
  const stage=root.querySelector('.hh-stage')||root;
  const dots=[...root.querySelectorAll('[data-tk-dot]')],live=root.querySelector('#tk-live');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IDLE={rx:4,ry:-10,tx:0,ty:0,mx:28,my:18};
  const cur={...IDLE},target={...IDLE};
  let index=0,raf=0,disposed=false,down=null,moved=0,hover=false,focus=false,offscreen=false,io=null,navTimer=0;

  const tiltOf=c=>c.querySelector('.tk-tilt');
  function restartBar(){
    dots.forEach(b=>{const bar=b.querySelector('i');if(!bar)return;bar.style.animation='none';void bar.offsetWidth;bar.style.animation=''});
  }
  function layout(dir=0){
    cards.forEach((c,i)=>{
      let d=((i-index)%n+n)%n;if(d>n/2)d-=n;
      c.style.setProperty('--d',d);
      c.style.zIndex=String(10-Math.abs(d));
      c.classList.toggle('is-active',d===0);
      c.classList.toggle('is-near',Math.abs(d)===1);
      c.toggleAttribute('inert',d!==0);
      c.setAttribute('aria-hidden',String(d!==0));
      if(d!==0){const t=tiltOf(c);['--rx','--ry','--tx','--ty','--mx','--my'].forEach(k=>t?.style.removeProperty(k))}
    });
    dots.forEach((b,i)=>{b.classList.toggle('on',i===index);b.setAttribute('aria-current',i===index?'true':'false')});
    restartBar();
    if(live)live.textContent=`Concert ${index+1} of ${n}: ${cards[index].getAttribute('aria-label')}`;
    if(dir&&!reduced){const t=tiltOf(cards[index]);t.style.setProperty('--dir',dir);t.classList.remove('tk-enter');void t.offsetWidth;t.classList.add('tk-enter')}
    apply();
  }
  function apply(){
    const el=tiltOf(cards[index]);if(!el)return;
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

  function go(delta){index=((index+delta)%n+n)%n;layout(Math.sign(delta))}
  function goTo(i){const to=clamp(i,0,n-1);if(to===index)return;const dir=to>index?1:-1;index=to;layout(dir)}

  // Autoplay: the bar inside the active dot fills up, then the next concert comes forward.
  const auto=!reduced&&n>1;
  root.classList.toggle('tk-auto',auto);
  const syncPause=()=>root.classList.toggle('tk-paused',hover||focus||offscreen||document.hidden||!!down);
  function onBarEnd(e){if(auto&&e.animationName==='tkFill'&&e.target.parentElement?.classList.contains('on'))go(1)}

  function onMove(e){
    if(e.pointerType==='mouse')root.classList.add('tk-engaged');
    if(reduced||(e.pointerType==='touch'&&!down))return;
    const r=cards[index].getBoundingClientRect();
    if(!r.width)return;
    const dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);
    const nx=clamp(dx/(window.innerWidth*.4),-1,1),ny=clamp(dy/(window.innerHeight*.45),-1,1);
    target.ry=nx*20;
    target.rx=4-ny*14;
    target.tx=nx*12;target.ty=ny*8;
    target.mx=clamp((e.clientX-r.left)/r.width*100,0,100);
    target.my=clamp((e.clientY-r.top)/r.height*100,0,100);
    kick();
  }
  function onLeave(){Object.assign(target,IDLE);kick()}
  // Hovering the ticket no longer pauses autoplay: the tilt and holo still follow the cursor while it plays.
  function onStageEnter(){}
  function onStageLeave(){}
  // Only keyboard focus pauses (so screen-reader and keyboard users are not interrupted); a mouse click does not.
  function onFocusIn(){focus=byKeyboard();syncPause()}
  function onFocusOut(e){if(!root.contains(e.relatedTarget)){focus=false;syncPause()}}

  function onDown(e){if(e.target.closest('a,button'))return;down={x:e.clientX};moved=0;syncPause()}
  function onUp(e){
    if(!down)return;
    const dx=e.clientX-down.x;moved=Math.abs(dx);
    down=null;syncPause();
    if(moved>60)go(dx<0?1:-1);
  }
  function onClickCapture(e){if(moved>8){e.preventDefault();e.stopPropagation();moved=0}}
  function onClick(e){
    const cta=e.target.closest('.tk-cta');
    if(cta&&!reduced&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey){
      e.preventDefault();const r=cta.getBoundingClientRect();confetti(r.left+r.width/2,r.top+r.height/2);
      cta.classList.add('is-pressed');clearTimeout(navTimer);navTimer=setTimeout(()=>{location.hash=cta.getAttribute('href')},420);return;
    }
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
  stage.addEventListener('pointerenter',onStageEnter);
  stage.addEventListener('pointerleave',onStageLeave);
  root.addEventListener('focusin',onFocusIn);
  root.addEventListener('focusout',onFocusOut);
  scene.addEventListener('pointerdown',onDown);
  window.addEventListener('pointerup',onUp);
  scene.addEventListener('click',onClickCapture,true);
  root.addEventListener('click',onClick);
  root.addEventListener('animationend',onBarEnd);
  document.addEventListener('keydown',onKey);
  document.addEventListener('visibilitychange',syncPause);
  if('IntersectionObserver' in window){io=new IntersectionObserver(([en])=>{offscreen=!en.isIntersecting;syncPause()},{threshold:.3});io.observe(scene)}
  layout();

  return{
    next:()=>go(1),prev:()=>go(-1),goTo,
    dispose(){
      disposed=true;if(raf)cancelAnimationFrame(raf);clearTimeout(navTimer);io?.disconnect();
      root.removeEventListener('pointermove',onMove);root.removeEventListener('pointerleave',onLeave);
      stage.removeEventListener('pointerenter',onStageEnter);stage.removeEventListener('pointerleave',onStageLeave);
      root.removeEventListener('focusin',onFocusIn);root.removeEventListener('focusout',onFocusOut);
      scene.removeEventListener('pointerdown',onDown);window.removeEventListener('pointerup',onUp);
      scene.removeEventListener('click',onClickCapture,true);root.removeEventListener('click',onClick);
      root.removeEventListener('animationend',onBarEnd);
      document.removeEventListener('keydown',onKey);document.removeEventListener('visibilitychange',syncPause);
    }
  };
}
