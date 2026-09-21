// Small, restrained text motion: headline words rise in, sections reveal on scroll, numbers count up.
// Everything is skipped when the visitor prefers reduced motion, and the text always stays real text in the DOM.
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const REVEAL='.section-title,.card,.steps>div,.editorial-image,.editorial>div,.chain-band,.live-chain,.rs-rules>div,.rs-row,.rs-cta-card,.rs-mine,.rs-empty,.ticket-item,.about-facts .container>div,.about-heading,.about-choice-preview,.about-proof,.about-trust-copy>.notice,.about-encore>div,.about-reveal-link,.how-card,.guide-block,.waitlist,.save-col,.dash-kpi';
// Headings that animate when scrolled into view (h1 animates right away), and sections that get an `.in` class for CSS-driven entrances.
const LATER='.about-page h2,.about-ticket h3,.how h2',IN_SEL='.how,.about-intro,.about-facts,.about-choose,.about-trust,.about-encore';
let revealIO,countIO,splitIO,inIO,mutations,lastPath=null;

function splitWords(h,later=false){
  if(h.dataset.mw)return;h.dataset.mw='1';let n=0;
  const walk=node=>[...node.childNodes].forEach(c=>{
    if(c.nodeType===3){
      const parts=c.textContent.split(/(\s+)/);if(!parts.some(p=>p.trim()))return;
      const frag=document.createDocumentFragment();
      parts.forEach(p=>{if(!p)return;if(/^\s+$/.test(p))frag.append(p);else{const s=document.createElement('span');s.className='mw';s.style.setProperty('--i',n++);s.textContent=p;frag.append(s)}});
      c.replaceWith(frag);
    }else if(c.nodeType===1&&!c.classList.contains('mw'))walk(c);
  });
  walk(h);
  if(later&&splitIO)splitIO.observe(h);
  else requestAnimationFrame(()=>requestAnimationFrame(()=>h.classList.add('mw-go')));
}

function prepReveal(root,skip=false){
  if(!root||root.nodeType!==1)return;
  const list=[...(root.matches?.(REVEAL)?[root]:[]),...root.querySelectorAll(REVEAL)];
  for(const el of list){
    if(el.dataset.rv)continue;el.dataset.rv='1';
    if(skip||!revealIO)continue;
    const sibs=[...(el.parentElement?.children||[])].filter(x=>x.matches(REVEAL));
    el.style.setProperty('--d',Math.min(sibs.indexOf(el),6)*70+'ms');
    el.classList.add('rv');revealIO.observe(el);
  }
}

export function countTo(el,to,{from=0,dur=1100,pad=0}={}){
  if(!el)return;
  const fmt=n=>String(n).padStart(pad,'0');
  if(reduced()||from===to){el.textContent=fmt(to);return}
  const t0=performance.now();
  const step=()=>{const p=Math.min(1,(performance.now()-t0)/dur),e=1-Math.pow(1-p,3);el.textContent=fmt(Math.round(from+(to-from)*e));if(p<1&&el.isConnected)requestAnimationFrame(step)};
  requestAnimationFrame(step);
}

function prepCounts(root){
  if(!root||reduced()||!countIO)return;
  root.querySelectorAll('[data-count]').forEach(el=>{
    if(el.dataset.counted)return;el.dataset.counted='1';
    el.textContent=String(0).padStart(+el.dataset.pad||0,'0');
    countIO.observe(el);
  });
}

export function initMotion(path){
  const main=document.getElementById('main'),footer=document.getElementById('footer');
  if(reduced()||!('IntersectionObserver' in window))return;
  if(!revealIO){
    revealIO=new IntersectionObserver(entries=>entries.forEach(e=>{
      if(!e.isIntersecting)return;const el=e.target;revealIO.unobserve(el);el.classList.add('rv-in');
      setTimeout(()=>el.classList.remove('rv','rv-in'),1000+parseInt(el.style.getPropertyValue('--d')||0));
    }),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    countIO=new IntersectionObserver(entries=>entries.forEach(e=>{
      if(!e.isIntersecting)return;const el=e.target;countIO.unobserve(el);countTo(el,+el.dataset.count,{pad:+el.dataset.pad||0});
    }),{threshold:.4});
    splitIO=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;splitIO.unobserve(e.target);requestAnimationFrame(()=>e.target.classList.add('mw-go'))}),{threshold:.3});
    inIO=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;inIO.unobserve(e.target);e.target.classList.add('in')}),{threshold:.2});
    mutations=new MutationObserver(list=>list.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1){prepReveal(n);prepCounts(n)}})));
    [main,footer].forEach(t=>t&&mutations.observe(t,{childList:true,subtree:true}));
  }
  // Re-rendering the same page (for example after listing a ticket) should not replay the entrance.
  document.documentElement.classList.add('motion-on');
  const samePage=path===lastPath;lastPath=path;
  if(main){
    if(!samePage){main.querySelectorAll('h1:not(.sr-only)').forEach(h=>splitWords(h));main.querySelectorAll(LATER).forEach(h=>splitWords(h,true))}
    main.querySelectorAll(IN_SEL).forEach(el=>{if(el.dataset.in)return;el.dataset.in='1';if(samePage)el.classList.add('in');else inIO.observe(el)});
    prepReveal(main,samePage);
  }
  prepCounts(footer);
}
