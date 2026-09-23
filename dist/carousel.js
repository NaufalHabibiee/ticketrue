let lastPointer=0;addEventListener('pointerdown',()=>{lastPointer=performance.now()},true);addEventListener('mousedown',()=>{lastPointer=performance.now()},true);
const byKeyboard=()=>performance.now()-lastPointer>600;
export function mountCarousel(viewport){
  const region=viewport.closest('.hero-carousel');
  const track=viewport.querySelector('.carousel-track');
  const originals=[...track.querySelectorAll('.hero-banner')];
  const count=originals.length;
  if(!count)return{dispose(){}};

  const before=originals.at(-1).cloneNode(true);
  const after=originals[0].cloneNode(true);
  for(const clone of [before,after]){clone.setAttribute('aria-hidden','true');clone.tabIndex=-1;clone.classList.add('banner-clone')}
  track.prepend(before);
  track.append(after);
  const slides=[before,...originals,after];
  let index=1,locked=false,disposed=false,paused=false,hovered=false,focused=false,visible=true,timer=0;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let resizeObserver,visibilityObserver;

  function redraw(animate=true){
    if(disposed)return;
    // Use layout width: getBoundingClientRect includes the scale on adjacent cards.
    const cardWidth=slides[0].offsetWidth;
    const gap=parseFloat(getComputedStyle(track).columnGap)||0;
    const left=(viewport.clientWidth-cardWidth)/2-index*(cardWidth+gap);
    track.style.transition=animate&&!reduced.matches?'transform .72s cubic-bezier(.22,1,.36,1)':'none';
    track.style.transform=`translate3d(${left}px,0,0)`;
    slides.forEach((slide,i)=>{slide.classList.toggle('is-active',i===index);if(!slide.classList.contains('banner-clone'))slide.tabIndex=i===index?0:-1});
  }
  // Autoplay keeps running on hover and after clicks; it only waits while the tab is hidden, the banner is off screen, or a keyboard user is inside it.
  function schedule(){
    clearTimeout(timer);
    if(!disposed&&!reduced.matches&&!document.hidden&&!focused&&visible)timer=setTimeout(()=>move(1),6000);
  }
  function move(delta){if(disposed||locked)return;locked=true;index+=delta;redraw();schedule();if(reduced.matches){settle()}else setTimeout(()=>{if(locked)settle()},900)}
  function settle(){if(disposed)return;if(index===count+1)index=1;else if(index===0)index=count;locked=false;redraw(false);schedule()}
  function next(){move(1)}
  function prev(){move(-1)}
  function onTransitionEnd(event){if(event.target===track&&event.propertyName==='transform'&&locked)settle()}
  function onSlideClick(event){
    const slide=event.target.closest('.hero-banner');
    if(!slide||slide.classList.contains('is-active'))return;
    event.preventDefault();
    const clicked=slides.indexOf(slide);
    move(clicked<index?-1:1);
  }
  function onKey(event){if(event.key==='ArrowLeft'){event.preventDefault();prev()}else if(event.key==='ArrowRight'){event.preventDefault();next()}}
  function onVisibility(){schedule()}
  function onReduce(){redraw(false);schedule()}
  function onEnter(){hovered=true;schedule()}
  function onLeave(){hovered=false;schedule()}
  function onFocus(){focused=byKeyboard();schedule()}
  function onBlur(event){if(!region.contains(event.relatedTarget)){focused=false;schedule()}}

  region.addEventListener('mouseenter',onEnter);
  region.addEventListener('mouseleave',onLeave);
  region.addEventListener('focusin',onFocus);
  region.addEventListener('focusout',onBlur);
  region.addEventListener('keydown',onKey);
  viewport.addEventListener('click',onSlideClick);
  track.addEventListener('transitionend',onTransitionEnd);
  document.addEventListener('visibilitychange',onVisibility);
  reduced.addEventListener?.('change',onReduce);
  if('ResizeObserver'in window){resizeObserver=new ResizeObserver(()=>redraw(false));resizeObserver.observe(viewport)}else window.addEventListener('resize',onReduce);
  if('IntersectionObserver'in window){visibilityObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule()},{threshold:.1});visibilityObserver.observe(viewport)}
  redraw(false);
  schedule();
  return {next,prev,dispose(){disposed=true;clearTimeout(timer);resizeObserver?.disconnect();visibilityObserver?.disconnect();region.removeEventListener('mouseenter',onEnter);region.removeEventListener('mouseleave',onLeave);region.removeEventListener('focusin',onFocus);region.removeEventListener('focusout',onBlur);region.removeEventListener('keydown',onKey);viewport.removeEventListener('click',onSlideClick);track.removeEventListener('transitionend',onTransitionEnd);document.removeEventListener('visibilitychange',onVisibility);reduced.removeEventListener?.('change',onReduce);window.removeEventListener('resize',onReduce)}};
}
