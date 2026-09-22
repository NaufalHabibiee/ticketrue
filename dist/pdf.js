// Dependency-free PDF writer, just enough for a one-page e-ticket: shapes, standard fonts, QR modules.
// Text uses the built-in Helvetica / Courier fonts (WinAnsi), so non-ASCII characters are simplified.
const REG=[278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
const BOLD=[278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584];
const SIMPLE={'·':'-','•':'-','’':"'",'‘':"'",'“':'"','”':'"','–':'-','—':'-','…':'...','×':'x','→':'->','✓':'v'};
const clean=s=>String(s??'').replace(/[^\x20-\x7E]/g,c=>SIMPLE[c]??'?');
const esc=s=>clean(s).replace(/([\\()])/g,'\\$1');
const num=n=>(Math.round(n*100)/100).toString();
const rgb=hex=>{const h=hex.replace('#','');return [0,2,4].map(i=>num(parseInt(h.slice(i,i+2),16)/255)).join(' ')};

export class Pdf{
  constructor(w=595.28,h=841.89){this.w=w;this.h=h;this.ops=[]}
  // --- measuring ---
  width(str,size,font='reg'){const s=clean(str);if(font==='mono')return s.length*.6*size;const t=font==='bold'?BOLD:REG;let w=0;for(const ch of s)w+=t[ch.charCodeAt(0)-32]??556;return w*size/1000}
  wrap(str,max,size,font='reg'){const out=[];for(const para of clean(str).split('\n')){let cur='';for(const word of para.split(' ')){const next=cur?cur+' '+word:word;if(cur&&this.width(next,size,font)>max){out.push(cur);cur=word}else cur=next}out.push(cur)}return out}
  // --- drawing (top-left origin) ---
  _path(x,y,w,h,r){
    const X=x,Y=this.h-(y+h),k=.5523*r;
    if(!r)return `${num(X)} ${num(Y)} ${num(w)} ${num(h)} re`;
    return [`${num(X+r)} ${num(Y)} m`,`${num(X+w-r)} ${num(Y)} l`,`${num(X+w-r+k)} ${num(Y)} ${num(X+w)} ${num(Y+r-k)} ${num(X+w)} ${num(Y+r)} c`,`${num(X+w)} ${num(Y+h-r)} l`,`${num(X+w)} ${num(Y+h-r+k)} ${num(X+w-r+k)} ${num(Y+h)} ${num(X+w-r)} ${num(Y+h)} c`,`${num(X+r)} ${num(Y+h)} l`,`${num(X+r-k)} ${num(Y+h)} ${num(X)} ${num(Y+h-r+k)} ${num(X)} ${num(Y+h-r)} c`,`${num(X)} ${num(Y+r)} l`,`${num(X)} ${num(Y+r-k)} ${num(X+r-k)} ${num(Y)} ${num(X+r)} ${num(Y)} c`,'h'].join('\n');
  }
  rect(x,y,w,h,{fill,stroke,lw=.6,r=0}={}){
    const o=[];if(fill)o.push(`${rgb(fill)} rg`);if(stroke){o.push(`${rgb(stroke)} RG`,`${num(lw)} w`)}
    o.push(this._path(x,y,w,h,r),fill&&stroke?'B':fill?'f':'S');this.ops.push(o.join('\n'));
  }
  circle(cx,cy,r,{fill,stroke,lw=.6}={}){const k=.5523*r,X=cx,Y=this.h-cy,o=[];if(fill)o.push(`${rgb(fill)} rg`);if(stroke)o.push(`${rgb(stroke)} RG`,`${num(lw)} w`);o.push(`${num(X+r)} ${num(Y)} m`,`${num(X+r)} ${num(Y+k)} ${num(X+k)} ${num(Y+r)} ${num(X)} ${num(Y+r)} c`,`${num(X-k)} ${num(Y+r)} ${num(X-r)} ${num(Y+k)} ${num(X-r)} ${num(Y)} c`,`${num(X-r)} ${num(Y-k)} ${num(X-k)} ${num(Y-r)} ${num(X)} ${num(Y-r)} c`,`${num(X+k)} ${num(Y-r)} ${num(X+r)} ${num(Y-k)} ${num(X+r)} ${num(Y)} c`,'h',fill&&stroke?'B':fill?'f':'S');this.ops.push(o.join('\n'))}
  line(x1,y1,x2,y2,{color='#dce6f0',lw=.6,dash}={}){this.ops.push([`${rgb(color)} RG`,`${num(lw)} w`,dash?`[${dash.join(' ')}] 0 d`:'[] 0 d',`${num(x1)} ${num(this.h-y1)} m ${num(x2)} ${num(this.h-y2)} l S`,'[] 0 d'].join('\n'))}
  text(str,x,y,{size=10,font='reg',color='#0c2d50',align='left',space=0}={}){
    const s=clean(str),w=this.width(s,size,font)+space*Math.max(0,s.length-1);
    const X=align==='right'?x-w:align==='center'?x-w/2:x;
    const f=font==='bold'?'F2':font==='mono'?'F3':'F1';
    this.ops.push(`BT\n${rgb(color)} rg\n/${f} ${num(size)} Tf\n${num(space)} Tc\n${num(X)} ${num(this.h-y)} Td\n(${esc(s)}) Tj\nET`);
    return w;
  }
  // rotated text, used for a light watermark
  stamp(str,cx,cy,deg,{size=64,font='bold',color='#eef2f7'}={}){
    const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a),w=this.width(str,size,font),f=font==='bold'?'F2':'F1';
    this.ops.push(`q\n${num(c)} ${num(s)} ${num(-s)} ${num(c)} ${num(cx)} ${num(this.h-cy)} cm\nBT\n${rgb(color)} rg\n/${f} ${num(size)} Tf\n${num(-w/2)} ${num(-size/3)} Td\n(${esc(str)}) Tj\nET\nQ`);
  }
  // draw a QR module matrix ({n, dark(r,c)}) as merged horizontal runs
  qr(m,x,y,size,fill='#0c2d50'){
    const cell=size/m.n,o=[`${rgb(fill)} rg`];
    for(let r=0;r<m.n;r++){let c=0;while(c<m.n){if(!m.dark(r,c)){c++;continue}let run=1;while(c+run<m.n&&m.dark(r,c+run))run++;o.push(`${num(x+c*cell)} ${num(this.h-(y+(r+1)*cell))} ${num(run*cell+.15)} ${num(cell+.15)} re`);c+=run}}
    o.push('f');this.ops.push(o.join('\n'));
  }
  build(title='Document'){
    const content=this.ops.join('\n'),objs=[];
    objs.push('<</Type/Catalog/Pages 2 0 R>>');
    objs.push('<</Type/Pages/Kids[3 0 R]/Count 1>>');
    objs.push(`<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${num(this.w)} ${num(this.h)}]/Resources<</Font<</F1 5 0 R/F2 6 0 R/F3 7 0 R>>>>/Contents 4 0 R>>`);
    objs.push(`<</Length ${content.length}>>\nstream\n${content}\nendstream`);
    for(const f of ['Helvetica','Helvetica-Bold','Courier'])objs.push(`<</Type/Font/Subtype/Type1/BaseFont/${f}/Encoding/WinAnsiEncoding>>`);
    objs.push(`<</Title(${esc(title)})/Producer(Ticketrue)/Creator(Ticketrue)>>`);
    let out='%PDF-1.4\n',offsets=[];
    objs.forEach((o,i)=>{offsets.push(out.length);out+=`${i+1} 0 obj\n${o}\nendobj\n`});
    const xref=out.length;
    out+=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`+offsets.map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('');
    out+=`trailer\n<</Size ${objs.length+1}/Root 1 0 R/Info ${objs.length} 0 R>>\nstartxref\n${xref}\n%%EOF`;
    return new Blob([Uint8Array.from(out,c=>c.charCodeAt(0))],{type:'application/pdf'});
  }
}

// One-page e-ticket. `d` is plain data so this module has no dependency on the app.
export function buildTicketPdf(d){
  const P=new Pdf(),NAVY='#0c2d50',ORANGE='#F9A12B',ORANGE_D='#b06a05',MUTED='#56708e',LABEL='#7f93ab',LINE='#dce6f0';
  const L=40,R=555,CW=R-L;
  // header
  P.rect(0,0,P.w,92,{fill:NAVY});P.rect(0,92,P.w,3,{fill:ORANGE});
  const bw=P.text('ticketrue',L,60,{size:28,font:'bold',color:'#ffffff'});P.text('.',L+bw,60,{size:28,font:'bold',color:ORANGE});
  P.text('E-TICKET',R,46,{size:14,font:'bold',color:'#ffffff',align:'right',space:2});
  P.text(d.demo?'Demo ticket - not valid for admission':'Show this ticket at the entrance',R,63,{size:9,color:d.demo?'#ffd08a':'#b9d0ea',align:'right'});
  // event + QR
  P.text('ADMIT ONE',L,130,{size:8.5,font:'bold',color:ORANGE_D,space:1.6});
  let y=162;for(const ln of P.wrap(d.title,340,26,'bold').slice(0,2)){P.text(ln,L,y,{size:26,font:'bold'});y+=30}
  P.text(String(d.artist).toUpperCase(),L,y+2,{size:10.5,font:'bold',color:ORANGE_D,space:.8});
  if(d.genre)P.text(d.genre,L,y+20,{size:9.5,color:MUTED});
  const qx=405,qy=118,qs=150;
  P.rect(qx,qy,qs,qs,{fill:'#ffffff',stroke:'#c4d6e8',lw:.7,r:8});
  if(d.qr)P.qr(d.qr,qx+12,qy+12,qs-24);
  P.text('SCAN AT THE ENTRANCE',qx+qs/2,qy+qs+16,{size:7.5,font:'bold',color:MUTED,align:'center',space:1});
  P.text(String(d.ticketId).slice(0,26),qx+qs/2,qy+qs+29,{size:8,font:'mono',color:NAVY,align:'center'});
  // details grid
  const gy=318,gh=150;
  P.rect(L,gy,CW,gh,{fill:'#f6faff',stroke:LINE,lw:.6,r:6});
  const col=[L+18,L+18+165,L+18+330],cw=150,cells=[
    ['DATE',d.date,0,0],['TIME',d.time,1,0],['VENUE',d.venue,2,0],
    ['CITY',d.city,0,1],['TICKET TYPE',d.ticketType,1,1],['PRICE PAID',d.amount,2,1],
    ['TICKET ID',d.ticketId,0,2],['HOLDER',d.holder,1,2]
  ];
  for(const [label,val,c,r] of cells){
    const x=col[c],top=gy+26+r*46,width=label==='HOLDER'?cw*2+15:cw,mono=label==='HOLDER'&&/^0x/i.test(val)||label==='TICKET ID';
    P.text(label,x,top,{size:7,font:'bold',color:LABEL,space:1.2});
    const lines=P.wrap(val,width,mono?8.5:10.5,mono?'mono':'bold').slice(0,2);
    lines.forEach((ln,i)=>P.text(ln,x,top+14+i*12,{size:mono?8.5:10.5,font:mono?'mono':'bold'}));
  }
  // perforation
  const py=496;P.line(58,py,P.w-58,py,{color:'#b7cbe0',lw:.8,dash:[4,3]});
  P.circle(0,py,9,{fill:'#e9f0f8'});P.circle(P.w,py,9,{fill:'#e9f0f8'});
  // order details
  P.text('ORDER DETAILS',L,py+30,{size:8.5,font:'bold',color:ORANGE_D,space:1.6});
  let oy=py+50;
  const rows=[['Order / ticket ID',d.ticketId,true],['Payment',d.payment],['Amount paid',d.amount],['Issued',d.issued],['Network',d.network]];
  if(d.contract)rows.push(['Contract',d.contract,true]);if(d.tx)rows.push(['Transaction',d.tx,true]);
  rows.forEach(([k,v,mono],i)=>{
    P.text(k,L,oy,{size:9,color:MUTED});
    P.text(String(v),R,oy,{size:mono?7.6:9.5,font:mono?'mono':'bold',align:'right'});
    if(i<rows.length-1)P.line(L,oy+8,R,oy+8,{color:'#eaf0f7',lw:.5});
    oy+=21;
  });
  if(d.demo){P.rect(L,oy-6,CW,34,{fill:'#fff4e0',stroke:'#f0c88a',lw:.7,r:5});P.text('DEMO TICKET',L+14,oy+9,{size:8.5,font:'bold',color:ORANGE_D,space:1.2});P.text('Not recorded on a blockchain and not valid for admission. No real payment was made.',L+14,oy+21,{size:8.3,color:'#7a5a20'});oy+=40}
  // how to use + terms
  const by=Math.max(oy+14,700),half=(CW-24)/2;
  P.text('HOW TO USE',L,by,{size:8.5,font:'bold',color:ORANGE_D,space:1.6});
  P.text('TERMS',L+half+24,by,{size:8.5,font:'bold',color:ORANGE_D,space:1.6});
  let hy=by+16;
  for(const [i,s] of d.steps.entries())for(const [j,ln] of P.wrap(s,half-14,8.3).entries()){if(j===0)P.text(String(i+1)+'.',L,hy,{size:8.3,font:'bold',color:NAVY});P.text(ln,L+14,hy,{size:8.3,color:'#243b57'});hy+=10.6}
  let ty=by+16;
  for(const s of d.terms)for(const [j,ln] of P.wrap(s,half-10,7.6).entries()){if(j===0)P.text('-',L+half+24,ty,{size:7.6,font:'bold'});P.text(ln,L+half+24+10,ty,{size:7.6,color:'#3d5670'});ty+=9.8}
  // footer
  P.line(L,P.h-46,R,P.h-46,{color:LINE,lw:.6});
  P.text(d.footerLeft,L,P.h-32,{size:7.2,color:LABEL});
  P.text(d.verifyUrl,L,P.h-21,{size:6.8,font:'mono',color:MUTED});
  P.text('Page 1 of 1',R,P.h-32,{size:7.2,color:LABEL,align:'right'});
  P.text(d.generated,R,P.h-21,{size:7.2,color:LABEL,align:'right'});
  return P.build(d.title+' - E-ticket');
}
