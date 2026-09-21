// Renders text as a QR code (SVG or a plain module matrix). The generator is loaded lazily from dist/vendor,
// so the rest of the site keeps working even if the vendor file is missing.
let lib;
async function load(){if(!lib)lib=(await import('./vendor/qrcode.js')).default;return lib}
export async function qrMatrix(text,ecc='M'){
  const q=(await load())(0,ecc);q.addData(String(text));q.make();
  const n=q.getModuleCount();
  return{n,dark:(r,c)=>q.isDark(r,c)};
}
export function qrSvg(m,{quiet=2,fg='#0c2d50',bg='#ffffff',label='QR code'}={}){
  const size=m.n+quiet*2;let d='';
  for(let r=0;r<m.n;r++){let c=0;while(c<m.n){if(!m.dark(r,c)){c++;continue}let run=1;while(c+run<m.n&&m.dark(r,c+run))run++;d+=`M${c+quiet} ${r+quiet}h${run}v1h-${run}z`;c+=run}}
  return `<svg class="qr" viewBox="0 0 ${size} ${size}" role="img" aria-label="${label}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="${bg}"/><path d="${d}" fill="${fg}"/></svg>`;
}
