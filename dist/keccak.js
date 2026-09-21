// Keccak-256 (the Ethereum hash, not NIST SHA3). Used to check wallet-signed ticket passes in the browser.
const RC=[0x0000000000000001n,0x0000000000008082n,0x800000000000808an,0x8000000080008000n,0x000000000000808bn,0x0000000080000001n,0x8000000080008081n,0x8000000000008009n,0x000000000000008an,0x0000000000000088n,0x0000000080008009n,0x000000008000000an,0x000000008000808bn,0x800000000000008bn,0x8000000000008089n,0x8000000000008003n,0x8000000000008002n,0x8000000000000080n,0x000000000000800an,0x800000008000000an,0x8000000080008081n,0x8000000000008080n,0x0000000080000001n,0x8000000080008008n];
const ROT=[[0,36,3,41,18],[1,44,10,45,2],[62,6,43,15,61],[28,55,25,21,56],[27,20,39,8,14]];
const M=(1n<<64n)-1n;
const rotl=(x,n)=>n?((x<<BigInt(n))|(x>>BigInt(64-n)))&M:x;
function permute(s){
  for(let r=0;r<24;r++){
    const c=[0,1,2,3,4].map(x=>s[x]^s[x+5]^s[x+10]^s[x+15]^s[x+20]);
    for(let x=0;x<5;x++){const d=c[(x+4)%5]^rotl(c[(x+1)%5],1);for(let y=0;y<5;y++)s[x+5*y]^=d}
    const b=new Array(25);
    for(let x=0;x<5;x++)for(let y=0;y<5;y++)b[y+5*((2*x+3*y)%5)]=rotl(s[x+5*y],ROT[x][y]);
    for(let x=0;x<5;x++)for(let y=0;y<5;y++)s[x+5*y]=b[x+5*y]^((~b[(x+1)%5+5*y]&M)&b[(x+2)%5+5*y]);
    s[0]^=RC[r];
  }
}
export const utf8=s=>new TextEncoder().encode(s);
export const hexToBytes=h=>Uint8Array.from((h.replace(/^0x/,'').match(/.{2}/g)||[]).map(b=>parseInt(b,16)));
export const bytesToHex=b=>[...b].map(x=>x.toString(16).padStart(2,'0')).join('');
export function keccak256(bytes){
  const rate=136,s=new Array(25).fill(0n),padded=new Uint8Array(Math.ceil((bytes.length+1)/rate)*rate);
  padded.set(bytes);padded[bytes.length]=0x01;padded[padded.length-1]|=0x80;
  for(let off=0;off<padded.length;off+=rate){
    for(let i=0;i<rate/8;i++){let lane=0n;for(let j=7;j>=0;j--)lane=(lane<<8n)|BigInt(padded[off+i*8+j]);s[i]^=lane}
    permute(s);
  }
  const out=new Uint8Array(32);
  for(let i=0;i<4;i++){let lane=s[i];for(let j=0;j<8;j++){out[i*8+j]=Number(lane&0xffn);lane>>=8n}}
  return out;
}
