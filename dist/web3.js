import {chainConfig,contractAddress,deployBlock} from './config.js';
import {selectors} from './abi.js';
import {keccak256,utf8,hexToBytes,bytesToHex} from './keccak.js';
let account='',provider;
const addressOK=a=>/^0x[0-9a-f]{40}$/i.test(a||'');
const emit=message=>window.dispatchEvent(new CustomEvent('ticketrue:wallet-change',{detail:{address:account,message}}));
function getProvider(){const p=window.ethereum?.providers?.find(x=>x.isMetaMask)||window.ethereum;if(!p)throw Error('MetaMask was not detected. Open this site in a browser with MetaMask, or use local demo checkout.');if(provider!==p){provider=p;p.on?.('accountsChanged',a=>{account=addressOK(a[0])?a[0]:'';emit('Wallet account changed. Review your order before continuing.')});p.on?.('chainChanged',()=>{account='';emit('Network changed. Reconnect to '+chainConfig.chainName+' before continuing.')});p.on?.('disconnect',()=>{account='';emit('Wallet disconnected. Reconnect to continue.')})}return p}
const request=async(method,params)=>{try{return await getProvider().request({method,params})}catch(e){if(e.code===4001)throw Error('Wallet request cancelled. Your order is still saved.');if(e.code===-32002)throw Error('A wallet request is already open. Check MetaMask.');throw e}};
export function disconnect(){account=''}
export async function connectWallet(){const a=await request('eth_requestAccounts');if(!addressOK(a[0]))throw Error('No wallet account selected.');let chain=await request('eth_chainId');if(chain.toLowerCase()!==chainConfig.chainId){try{await request('wallet_switchEthereumChain',[{chainId:chainConfig.chainId}])}catch(e){if(e.code===4902){await request('wallet_addEthereumChain',[chainConfig]);await request('wallet_switchEthereumChain',[{chainId:chainConfig.chainId}])}else throw e}}chain=await request('eth_chainId');if(chain.toLowerCase()!==chainConfig.chainId)throw Error('Switch to '+chainConfig.chainName+' to continue.');const current=await request('eth_accounts');account=current[0];return account}
function configured(){if(!addressOK(contractAddress))throw Error('A deployed BOT Chain contract address is required.');}
const word=x=>BigInt(x).toString(16).padStart(64,'0');
const isAddr=x=>typeof x==='string'&&addressOK(x);
const toWord=x=>typeof x==='boolean'?word(x?1:0):isAddr(x)?x.slice(2).toLowerCase().padStart(64,'0'):word(x);
// Minimal ABI encoder: any arg that is a JS array becomes a dynamic uint256[] tail; everything else is a static word.
function encodeCall(sig,args){
  let tail='';
  const head=args.map(a=>{
    if(Array.isArray(a)){const offset=32*args.length+tail.length/2;tail+=word(a.length)+a.map(toWord).join('');return word(offset)}
    return toWord(a);
  });
  return '0x'+selectors[sig]+head.join('')+tail;
}
const words=hex=>{if(!hex||hex==='0x')throw Error('Contract returned no data. Check the deployed address and network.');return hex.slice(2).match(/.{64}/g)};
async function call(sig,args){configured();return words(await rpc('eth_call',[{to:contractAddress,data:encodeCall(sig,args)},'latest']))}
async function ensureAccount(expected){const [accounts,chain]=await Promise.all([request('eth_accounts'),request('eth_chainId')]);if(accounts[0]?.toLowerCase()!==expected.toLowerCase()||chain.toLowerCase()!==chainConfig.chainId)throw Error('Wallet or network changed. Reconnect and review the order.');}
const bot=wei=>{const n=Number(wei)/1e18;return (n>=1?n.toFixed(2):n.toPrecision(4)).replace(/\.?0+$/,'')+' BOT'};

// ---- Read-only access goes straight to the BOT Chain RPC, so visitors see live data without a wallet. ----
const RPC_URL=chainConfig.rpcUrls[0];let rpcId=1;
async function rpcPost(payload){const r=await fetch(RPC_URL,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});if(!r.ok)throw Error('BOT Chain RPC returned '+r.status+'.');return r.json()}
async function rpc(method,params=[]){let j;try{j=await rpcPost({jsonrpc:'2.0',id:rpcId++,method,params})}catch{if(window.ethereum)return request(method,params);throw Error('Could not reach BOT Chain. Check your connection.')}if(j.error)throw Error(j.error.message||'BOT Chain RPC error.');return j.result}
async function rpcBatch(calls){const payload=calls.map(([method,params],i)=>({jsonrpc:'2.0',id:i+1,method,params}));try{const r=await rpcPost(payload);if(Array.isArray(r)){const by=new Map(r.map(x=>[x.id,x]));return payload.map(p=>by.get(p.id)||{})}}catch{}return Promise.all(calls.map(([m,p])=>rpc(m,p).then(result=>({result}),error=>({error}))))}
const ethCall=(sig,args)=>['eth_call',[{to:contractAddress,data:encodeCall(sig,args)},'latest']];
const wordAt=(hex,i)=>BigInt('0x'+hex.slice(2).slice(i*64,i*64+64));
const TICKET_ISSUED='0x85ac3e2a3d912eb02b05eed3314cf5d36994d8c7ea35900c0b9046971aab3514';
export async function restore(){if(!window.ethereum)return'';try{const [a,c]=await Promise.all([request('eth_accounts'),request('eth_chainId')]);if(addressOK(a[0])&&c.toLowerCase()===chainConfig.chainId){account=a[0];return account}}catch{}return''}

// ---- Zones/tiers: price + remaining per option, no individual seats. ----
export async function chainAvailability(e){configured();const ev=await call('events(uint256)',[e.id]);if(wordAt('0x'+ev[0],0)!==1n)return{live:false};const n=Number(wordAt('0x'+ev[3],0)),res=await rpcBatch(Array.from({length:n},(_,i)=>ethCall('getOption(uint256,uint256)',[e.id,i])));return{live:true,options:res.map(r=>r.result?{price:wordAt(r.result,0),remaining:wordAt(r.result,1)}:null)}}
export async function stockOf(e){const av=await chainAvailability(e);if(!av.live)return{live:false};let cap=0n,left=0n;av.options.forEach((o,i)=>{if(o){left+=o.remaining}});return{live:true,left:Number(left)}}
export async function walletCountFor(eventId,owner){configured();const r=await call('ticketCountOf(uint256,address)',[eventId,owner]);return Number(wordAt('0x'+r[0],0))}

// ---- Buying: a cart is [{tier, qty}, ...] for one concert, in one transaction. ----
async function contractExists(){const code=await request('eth_getCode',[contractAddress,'latest']);if(code==='0x')throw Error('No contract exists at the configured address.')}
export async function quoteCart(eventId,items){configured();const res=await Promise.all(items.map(it=>call('getOption(uint256,uint256)',[eventId,it.tier])));return items.map((it,i)=>({...it,price:wordAt('0x'+res[i][0],0),remaining:wordAt('0x'+res[i][1],0)}))}
export async function issueCart(eventId,items,{fiatDemo=false,status=()=>{}}={}){
  configured();const owner=await connectWallet();status('Checking ticket inventory…');await contractExists();
  const quoted=await quoteCart(eventId,items);
  for(const it of quoted){if(it.remaining<BigInt(it.qty))throw Error('One of the zones sold out while you were choosing. Refresh and try again.')}
  const have=await walletCountFor(eventId,owner),want=items.reduce((s,it)=>s+it.qty,0);
  if(have+want>4)throw Error(`This wallet already holds ${have} ticket${have===1?'':'s'} for this concert. Up to 4 per wallet, so it can take at most ${4-have} more.`);
  const total=quoted.reduce((s,it)=>s+it.price*BigInt(it.qty),0n),value=fiatDemo?0n:total;
  const tiers=items.map(it=>it.tier),qtys=items.map(it=>it.qty);
  const lines=quoted.map(it=>`${it.qty} × ${bot(it.price)}`).join(', ');
  if(!window.confirm(fiatDemo?`Claim ${want} free demo ticket${want===1?'':'s'} on BOT Chain? MetaMask will show network fees.`:`${lines} = ${bot(total)} plus network fees. Continue to MetaMask?`))throw Error('Transaction cancelled. Your selection is saved.');
  await ensureAccount(owner);status('Confirm the transaction in MetaMask.');
  const data=encodeCall(fiatDemo?'claimDemoTicket(uint256,uint256[],uint256[])':'buyTicket(uint256,uint256[],uint256[])',[eventId,tiers,qtys]);
  const tx=await request('eth_sendTransaction',[{from:owner,to:contractAddress,value:'0x'+value.toString(16),data}]);
  sessionStorage.setItem('tr2:pending',JSON.stringify({tx,owner,eventId,items}));
  status('Transaction submitted. Waiting for BOT Chain confirmation…');
  let receipt;for(let i=0;i<90;i++){await new Promise(r=>setTimeout(r,2000));await ensureAccount(owner);receipt=await request('eth_getTransactionReceipt',[tx]);if(receipt)break}
  if(!receipt)throw Error('Confirmation is taking longer than expected. Transaction '+tx+' remains pending. Refresh on-chain tickets later; do not submit again yet.');
  if(BigInt(receipt.status)!==1n)throw Error('The transaction failed on-chain. No ticket was issued.');
  const ids=(receipt.logs||[]).filter(l=>l.address?.toLowerCase()===contractAddress.toLowerCase()&&l.topics[0]===TICKET_ISSUED).map(l=>BigInt(l.topics[1]).toString());
  if(!ids.length)throw Error('Transaction confirmed, but no ticket could be found. Check the explorer.');
  sessionStorage.removeItem('tr2:pending');status(`${ids.length} ticket${ids.length===1?'':'s'} confirmed on BOT Chain.`);
  return{ids,tx};
}
export async function verifyTicket(t){configured();const result=await call('verifyTicket(uint256,address)',[t.id,t.owner]);return BigInt('0x'+result[0])===1n}
export async function getWalletTickets(){configured();const owner=await connectWallet(),r=await call('getWalletTickets(address)',[owner]);const n=Number(BigInt('0x'+r[1])),ids=r.slice(2,2+n).map(x=>BigInt('0x'+x).toString());return await Promise.all(ids.map(ticketInfo))}
export async function activity(limit=5){configured();const [next,head]=await Promise.all([call('nextTicketId()',[]),rpc('eth_blockNumber',[])]);const issued=Number(BigInt('0x'+next[0]))-1;if(issued<1)return{issued:0,items:[]};const tip=parseInt(head,16);let logs;for(const from of [deployBlock,Math.max(0,tip-5000)]){try{logs=await rpc('eth_getLogs',[{address:contractAddress,topics:[TICKET_ISSUED],fromBlock:'0x'+from.toString(16),toBlock:'latest'}]);break}catch{}}if(!logs)return{issued,items:[]};const last=logs.slice(-limit).reverse(),blocks=[...new Set(last.map(l=>l.blockNumber))],got=await rpcBatch(blocks.map(b=>['eth_getBlockByNumber',[b,false]])),ts=new Map(blocks.map((b,i)=>[b,got[i]?.result?Number(BigInt(got[i].result.timestamp))*1000:0]));return{issued,items:last.map(l=>({ticketId:BigInt(l.topics[1]).toString(),eventId:Number(BigInt(l.topics[2])),owner:'0x'+l.topics[3].slice(26),tx:l.transactionHash,at:ts.get(l.blockNumber)}))}}

// ---- Resale and gate check-in ----
const TICKET_LISTED='0x7fcebcf72427ecf9710bb03f1e03a6eb59b7eef703a03dd385ba24259a76550e';
async function transact(sig,args,{value=0n,status=()=>{}}={}){configured();const owner=await connectWallet();await ensureAccount(owner);status('Confirm the transaction in MetaMask.');const tx=await request('eth_sendTransaction',[{from:owner,to:contractAddress,value:'0x'+value.toString(16),data:encodeCall(sig,args)}]);status('Transaction submitted. Waiting for BOT Chain confirmation…');let receipt;for(let i=0;i<90;i++){await new Promise(r=>setTimeout(r,2000));receipt=await request('eth_getTransactionReceipt',[tx]);if(receipt)break}if(!receipt)throw Error('Confirmation is taking longer than expected. Transaction '+tx+' remains pending.');if(BigInt(receipt.status)!==1n)throw Error('The transaction failed on-chain.');return{tx,owner}}
export const listForResale=(id,price,status)=>transact('listForResale(uint256,uint256)',[id,price],{status});
export const cancelResale=(id,status)=>transact('cancelResale(uint256)',[id],{status});
export const buyResale=(id,price,status)=>transact('buyResale(uint256)',[id],{value:price,status});
export const checkIn=(id,status)=>transact('checkIn(uint256)',[id],{status});
export async function ticketInfo(id){configured();const [t,rp]=await Promise.all([call('tickets(uint256)',[id]),call('resalePrice(uint256)',[id])]);return{id:String(id),exists:wordAt('0x'+t[4],0)===1n,eventId:Number(wordAt('0x'+t[1],0)),owner:'0x'+t[2].slice(24),issuedAt:new Date(Number(wordAt('0x'+t[3],0))*1000).toISOString(),tierIndex:Number(wordAt('0x'+t[5],0)),used:wordAt('0x'+t[6],0)===1n,paid:wordAt('0x'+t[7],0),listed:wordAt('0x'+rp[0],0)}}
export async function isGate(who){configured();const [org,st]=await Promise.all([call('organizer()',[]),call('staff(address)',[who])]);return '0x'+org[0].slice(24)===who.toLowerCase()||wordAt('0x'+st[0],0)===1n}
export async function listings(eventId){configured();const tip=parseInt(await rpc('eth_blockNumber',[]),16);let logs;for(const from of [deployBlock,Math.max(0,tip-5000)]){try{logs=await rpc('eth_getLogs',[{address:contractAddress,topics:eventId==null?[TICKET_LISTED]:[TICKET_LISTED,null,'0x'+BigInt(eventId).toString(16).padStart(64,'0')],fromBlock:'0x'+from.toString(16),toBlock:'latest'}]);break}catch{}}if(!logs)return[];const ids=[...new Set(logs.map(l=>BigInt(l.topics[1]).toString()))],infos=await Promise.all(ids.map(ticketInfo));return infos.filter(t=>t.exists&&!t.used&&t.listed>0n)}

// ---- Wallet-signed ticket pass ----
// The holder signs "Ticketrue pass / ticket / expires" with their wallet. Anyone can check it: the hash is computed locally
// and the signer is recovered by the EVM's ecrecover precompile through a plain eth_call, so no crypto library is needed.
export const passMessage=(id,exp)=>`Ticketrue pass\nticket:${id}\nexpires:${exp}`;
export async function signPass(id,ttl=300){configured();const owner=await connectWallet();await ensureAccount(owner);const exp=Math.floor(Date.now()/1000)+ttl,msg=passMessage(id,exp),sig=await request('personal_sign',['0x'+bytesToHex(utf8(msg)),owner]);return{exp,sig,owner}}
export async function recoverSigner(msg,sig){const body=utf8(msg),hash=keccak256(new Uint8Array([...utf8('\x19Ethereum Signed Message:\n'+body.length),...body])),raw=hexToBytes(sig);if(raw.length!==65)throw Error('Malformed signature.');let v=raw[64];if(v<27)v+=27;const input='0x'+bytesToHex(hash)+v.toString(16).padStart(64,'0')+bytesToHex(raw.slice(0,32))+bytesToHex(raw.slice(32,64));const out=await rpc('eth_call',[{to:'0x0000000000000000000000000000000000000001',data:input},'latest']);if(!out||out==='0x'||/^0x0*$/.test(out))throw Error('Signature could not be recovered.');return '0x'+out.slice(-40)}

// ---- Organizer dashboard ----
const T_RESOLD='0xd59a36d8310ffb140214be490baf3fe8961f859a17199ec1bf9015c8b7340011',T_CHECKIN='0x9d5d33c284ff2f352ea76eadac5ca814eb48f81ef3e7f4fe19c3de4b75eb4b23',T_STAFF='0x650d8a7e9c57c77230a3caace02daed677de5ea7a0f51c295faaf94fca19ba37';
async function logsOf(topic){const tip=parseInt(await rpc('eth_blockNumber',[]),16);for(const from of [deployBlock,Math.max(0,tip-5000)]){try{return await rpc('eth_getLogs',[{address:contractAddress,topics:[topic],fromBlock:'0x'+from.toString(16),toBlock:'latest'}])}catch{}}return[]}
export async function dashboard(events){configured();
  const [org,next,bal]=await Promise.all([call('organizer()',[]),call('nextTicketId()',[]),rpc('eth_getBalance',[contractAddress,'latest'])]);
  const perEvent=await Promise.all(events.map(async e=>{const ev=await call('events(uint256)',[e.id]);if(wordAt('0x'+ev[0],0)!==1n)return{id:e.id,live:false};const n=Number(wordAt('0x'+ev[3],0)),res=await rpcBatch(Array.from({length:n},(_,i)=>ethCall('options(uint256,uint256)',[e.id,i])));return{id:e.id,live:true,seated:wordAt('0x'+ev[1],0)===1n,demo:wordAt('0x'+ev[2],0)===1n,options:res.map(r=>r.result?{price:wordAt(r.result,0),capacity:wordAt(r.result,1),issued:wordAt(r.result,2)}:null)}}));
  const [resold,checkins,staffLogs]=await Promise.all([logsOf(T_RESOLD),logsOf(T_CHECKIN),logsOf(T_STAFF)]);
  const staff=new Map();staffLogs.forEach(l=>staff.set('0x'+l.topics[1].slice(26),BigInt(l.data)===1n));
  return{organizer:'0x'+org[0].slice(24),issued:Number(BigInt('0x'+next[0]))-1,balance:BigInt(bal),perEvent,resales:{count:resold.length,volume:resold.reduce((s,l)=>s+BigInt(l.data),0n)},checkins:checkins.length,staff:[...staff].filter(([,on])=>on).map(([a])=>a)}}
export const createEventTx=(id,{seated,demo,startsAt,prices,caps},status)=>transact('createEvent(uint256,bool,bool,uint256,uint256[],uint256[])',[id,seated,demo,startsAt,prices,caps],{status});
export const withdrawTx=(to,status)=>transact('withdraw(address)',[to],{status});
export const setStaffTx=(who,allowed,status)=>transact('setStaff(address,bool)',[who,allowed],{status});
