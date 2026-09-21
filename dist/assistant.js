// Ticketrue Assistant: a floating chat that answers questions about this website and its tickets only.
// It runs entirely in the browser (no API key, no server). Answers come from the site's own data and rules,
// and anything outside that scope gets a polite "I can't help with that".
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>' '+String(s).toLowerCase().replace(/[^a-z0-9/&+\- ]+/g,' ').replace(/\s+/g,' ').trim()+' ';
const has=(text,kw)=>text.includes(' '+kw+(kw.length<=3&&!kw.endsWith(' ')?' ':''));
const ID_WORDS=['apa','bagaimana','gimana','cara','berapa','kapan','dimana','tiket','beli','jual','saya','aku','kamu','bisa','tidak','nggak','gak','yang','untuk','dengan','harga','konser','tolong','mau','ingin','apakah','halo','hai','makasih','terima','kasih','ada','dan','atau','bisakah','dong','deh'];
const isID=t=>ID_WORDS.filter(w=>has(t,w)).length>=1;

const REFUSE={
  en:'Sorry, I can only help with Ticketrue: the concerts, buying tickets, your wallet, reselling and how this site works. I can’t answer questions outside of that. Try asking about one of those.',
  id:'Maaf, aku hanya bisa membantu soal Ticketrue: konser, cara beli tiket, wallet, resale, dan cara kerja website ini. Pertanyaan di luar itu tidak bisa aku jawab. Coba tanyakan salah satu dari itu ya.'
};
const CHIPS={
  en:['How to buy a ticket','How to resell a ticket','My ticket is missing','Can I get a refund?'],
  id:['Cara beli tiket','Cara jual kembali tiket','Tiket belum muncul','Bisa refund?']
};

// Each topic: keywords in English and Indonesian, plus an answer per language. Longer keywords score higher.
const TOPICS=[
 {k:['thank','thanks','terima kasih','makasih','thx'],en:()=>'You’re welcome! Ask me anything else about Ticketrue.',id:()=>'Sama-sama! Tanya lagi kalau ada yang ingin diketahui soal Ticketrue.'},
 {k:['hi','hello','hey','halo','hai','selamat pagi','selamat siang','selamat malam'],en:()=>'Hi! I can help with concerts, buying tickets, wallets, resale and how Ticketrue works. What would you like to know?',id:()=>'Halo! Aku bisa bantu soal konser, cara beli tiket, wallet, resale, dan cara kerja Ticketrue. Mau tanya apa?'},
 {k:['what is ticketrue','about ticketrue','how does it work','how does ticketrue work','apa itu ticketrue','tentang ticketrue','cara kerja','ticketrue'],
  en:()=>'Ticketrue is a concert ticketing prototype built on BOT Chain. Your ticket is recorded on-chain under your wallet, so ownership can be verified later. All concerts here are fictional. See [Our story](#/about).',
  id:()=>'Ticketrue adalah prototipe tiket konser di BOT Chain. Tiketmu tercatat on-chain atas nama wallet-mu, jadi kepemilikannya bisa diverifikasi. Semua konser di sini fiktif. Lihat [Our story](#/about).'},
 {k:['how to buy','how do i buy','buy a ticket','buy ticket','purchase','order','checkout','get a ticket','beli tiket','cara beli','membeli','pesan tiket','beli','pesan'],
  en:()=>'1. Open [Concerts](#/discover) and pick a show.\n2. Choose a seat (seated shows) or a tier.\n3. Press **Continue to checkout**.\n4. On the **BOT Chain** tab, connect MetaMask and press **Buy on BOT Chain**, then confirm in MetaMask.\nNo BOT? Use the free testnet claim, or the **Demo** tab to try the flow without a wallet.',
  id:()=>'1. Buka [Concerts](#/discover) dan pilih konser.\n2. Pilih kursi (konser berkursi) atau tier.\n3. Tekan **Continue to checkout**.\n4. Di tab **BOT Chain**, hubungkan MetaMask lalu tekan **Buy on BOT Chain** dan konfirmasi di MetaMask.\nTidak punya BOT? Pakai klaim tiket testnet gratis, atau tab **Demo** untuk mencoba alurnya tanpa wallet.'},
 {k:['wallet','metamask','connect wallet','connect','hubungkan','sambungkan','dompet'],
  en:()=>'Press **Connect wallet** in the header (no login needed). Ticketrue uses MetaMask and will ask you to add or switch to **BOT Chain Testnet** if needed. It never asks for your recovery phrase.',
  id:()=>'Tekan **Connect wallet** di header (tidak perlu login). Ticketrue memakai MetaMask dan akan meminta kamu menambah atau pindah ke **BOT Chain Testnet** bila perlu. Situs ini tidak pernah meminta recovery phrase.'},
 {k:['faucet','testnet','network','chain id','gas','network fee','biaya jaringan','token bot','free bot','bot chain','botchain','jaringan'],
  en:()=>'Ticketrue runs on BOT Chain (testnet chain ID 968). Get free test BOT at the [faucet](https://faucet.botchain.ai/basic). MetaMask shows the network fee before you confirm.',
  id:()=>'Ticketrue berjalan di BOT Chain (testnet chain ID 968). Ambil BOT uji gratis di [faucet](https://faucet.botchain.ai/basic). MetaMask menampilkan biaya jaringan sebelum kamu konfirmasi.'},
 {k:['payment','pay','bayar','pembayaran','qris','bank','e-wallet','ewallet','gopay','dana','ovo','shopeepay','va','real money','uang asli','rupiah','rp'],
  en:()=>'The **Demo** tab simulates QRIS, bank and e-wallet payments: no real money moves and it is not scannable. Real purchases use BOT on BOT Chain, and the price is shown in BOT at checkout.',
  id:()=>'Tab **Demo** mensimulasikan pembayaran QRIS, bank, dan e-wallet: tidak ada uang sungguhan dan QR-nya tidak bisa dipindai. Pembelian asli memakai BOT di BOT Chain, dan harganya tampil dalam BOT di checkout.'},
 {k:['seat selection','seat','seats','tier','tiers','category','cat 1','cat 2','vip','zone','zona','kursi','kategori','tipe tiket','ticket type','ticket types'],
  en:(c)=>'There are two kinds of shows. **Seat selection** shows let you pick a seat on the venue map (three zones, each with its own on-chain price). **Tier** shows let you pick a ticket category such as Festival, CAT 1 or VIP. '+(c.seated.length?`Seated: ${c.seated.map(e=>e.title).join(', ')}.`:'')  ,
  id:(c)=>'Ada dua jenis konser. **Seat selection**: kamu memilih kursi di denah venue (tiga zona, tiga harga). **Tier**: kamu memilih kategori tiket seperti Festival, CAT 1, atau VIP. '+(c.seated.length?`Konser berkursi: ${c.seated.map(e=>e.title).join(', ')}.`:'')},
 {k:['one ticket','per wallet','limit','maximum','how many tickets','satu tiket','maksimal','berapa tiket','batas'],
  en:()=>'Each wallet can hold one ticket per concert. Buying a second one for the same concert is blocked.',
  id:()=>'Satu wallet hanya bisa memegang satu tiket per konser. Membeli tiket kedua untuk konser yang sama akan ditolak.'},
 {k:['my ticket is missing','my ticket is not showing','ticket is missing','ticket missing','ticket not showing','not showing up','cant see my ticket','can t see my ticket','ticket not appearing','ticket not found','tiket belum muncul','tiket tidak muncul','tiket belum masuk','e-tiket belum masuk','tiket hilang','tiket saya tidak ada'],
  en:(c)=>`Tickets belong to the wallet that bought them. Try this: 1) Connect the same wallet you used (its address shows in the header). 2) Open [My Tickets](#/tickets) and press **Refresh on-chain tickets**. 3) Make sure MetaMask is on **${c.chainName||'BOT Chain'}**. 4) Demo tickets only exist in the browser where you made them. Still missing? Open your transaction on the explorer. If it says success, the ticket is yours.`,
  id:(c)=>`Tiket tercatat atas wallet yang membelinya. Coba: 1) Hubungkan wallet yang sama (alamatnya tampil di header). 2) Buka [My Tickets](#/tickets) lalu tekan **Refresh on-chain tickets**. 3) Pastikan MetaMask ada di **${c.chainName||'BOT Chain'}**. 4) Tiket demo hanya ada di browser tempat kamu membuatnya. Masih belum muncul? Buka transaksimu di explorer. Kalau statusnya berhasil, tiket itu milikmu.`},
 {k:['qr','qr code','scan','live pass','signed pass','my ticket','my tickets','tiket saya','verify','verification','verifikasi','ownership','kepemilikan','valid','proof','bukti'],
  en:()=>'Open [My Tickets](#/tickets) and press **View ticket**. Every ticket has a QR code that opens a public check page. For on-chain tickets, **Show live pass** makes your wallet sign a 5-minute pass, so a screenshot stops working, and the check page confirms the holder. Demo tickets are labelled and are not valid for admission.',
  id:()=>'Buka [My Tickets](#/tickets) lalu tekan **View ticket**. Setiap tiket punya kode QR yang membuka halaman cek publik. Untuk tiket on-chain, **Show live pass** meminta wallet-mu menandatangani pass 5 menit, jadi screenshot tidak berguna, dan halaman cek mengonfirmasi pemegangnya. Tiket demo diberi label dan tidak valid untuk masuk.'},
 {k:['sold out','waitlist','wait list','notify me','on sale soon','only left','habis','sold','daftar tunggu','kehabisan','wishlist','save concert','saved','favorite','favourite','simpan konser','favorit'],en:()=>'Concert cards show **Sold out**, **Only N left** or **On sale soon** based on live stock. On a sold-out or not-yet-open concert you can **Join the waitlist** (saved on this device, and you get a note when tickets return), and any resale tickets are listed there. The heart button saves a concert to your list, shown under [My Tickets](#/tickets).',id:()=>'Kartu konser menampilkan **Sold out**, **Only N left**, atau **On sale soon** sesuai stok langsung. Di konser yang habis atau belum dibuka kamu bisa **Join the waitlist** (tersimpan di perangkat ini, dan kamu diberi tahu saat tiket kembali), dan tiket resale yang tersedia ditampilkan di sana. Tombol hati menyimpan konser ke daftarmu, tampil di [My Tickets](#/tickets).'},
 {k:['calendar','add to calendar','ics','reminder','remind me','kalender','pengingat','share','bagikan','download ticket','unduh tiket','unduh','save ticket','simpan tiket'],en:()=>'On a ticket page you can **Add to calendar** (a .ics file with the date, venue and a 3-hour reminder), **Share** the concert link, and **Download ticket** as an image with its QR code.',id:()=>'Di halaman tiket kamu bisa **Add to calendar** (file .ics berisi tanggal, venue, dan pengingat 3 jam sebelumnya), **Share** link konser, dan **Download ticket** sebagai gambar lengkap dengan QR.'},
 {k:['dashboard','sales','revenue','withdraw','payout','penjualan','pendapatan','tarik dana','staff','gate staff'],en:()=>'Organizers have a [Dashboard](#/dashboard): tickets sold per concert, resale volume, check-ins, a withdraw button, gate staff management, and a form to publish each concert on-chain. Actions only work with the organizer wallet.',id:()=>'Organizer punya [Dashboard](#/dashboard): tiket terjual per konser, volume resale, jumlah check-in, tombol tarik dana, pengelolaan staf gerbang, dan form untuk mempublikasikan tiap konser on-chain. Aksi hanya bisa dengan wallet organizer.'},
 {k:['cancel listing','resale ticket','buy resale','tiket resale','beli resale','resell','resale','re-sell','sell my ticket','sell ticket','sell','scalp','scalper','calo','jual ulang','jual kembali','jual tiket','menjual','jual','marketplace'],
  en:()=>'Go to [Resell](#/resell). You can list a ticket you paid for at any price **up to what you paid**, never above it. The buyer pays and gets the ticket in one step, and 5% of each resale goes to the organizer. Free-claimed and already-used tickets can’t be resold. Right now resale may run in demo mode, which is simulated in your browser.',
  id:()=>'Buka [Resell](#/resell). Kamu bisa menjual tiket yang kamu beli dengan harga **maksimal sebesar yang kamu bayar**, tidak boleh lebih. Pembeli membayar dan langsung menerima tiket dalam satu langkah, dan 5% dari tiap resale untuk organizer. Tiket klaim gratis dan tiket yang sudah dipakai tidak bisa dijual. Saat ini resale bisa berjalan di mode demo yang disimulasikan di browser.'},
 {k:['gate','check in','check-in','checkin','entry','admission','used ticket','scan','masuk venue','gerbang','tiket terpakai'],
  en:()=>'At the gate, staff open [Gate check-in](#/gate), enter the ticket ID and mark it as used. A ticket can be admitted only once, and a used ticket can’t be resold.',
  id:()=>'Di gerbang, petugas membuka [Gate check-in](#/gate), memasukkan ID tiket dan menandainya terpakai. Tiket hanya bisa dipakai masuk sekali, dan tiket yang sudah dipakai tidak bisa dijual ulang.'},
 {k:['login','log in','sign in','sign up','signup','register','password','account','masuk akun','daftar','akun','kata sandi'],
  en:()=>'Browsing, connecting a wallet, and on-chain checkout need no login. The [login](#/login) page is a demo: it accepts sample details, stores no password, and is only needed for demo tickets, Profile and Organizer.',
  id:()=>'Melihat konser, connect wallet, dan checkout on-chain tidak perlu login. Halaman [login](#/login) hanya demo: menerima data contoh, tidak menyimpan password, dan hanya dibutuhkan untuk tiket demo, Profile, dan Organizer.'},
 {k:['refund','cancel','cancellation','reschedule','money back','batal','pembatalan','pengembalian dana','uang kembali'],
  en:()=>'Ticketrue is a prototype: there are no real payments, so there are no refunds. If you can’t attend, you can resell your ticket at or below what you paid on the [Resell](#/resell) page.',
  id:()=>'Ticketrue adalah prototipe: tidak ada pembayaran sungguhan, jadi tidak ada refund. Kalau tidak bisa hadir, kamu bisa menjual ulang tiket di halaman [Resell](#/resell) dengan harga maksimal sebesar yang kamu bayar.'},
 {k:['contract','smart contract','kontrak','deployed','on-chain','onchain','blockchain','contract address','alamat kontrak'],
  en:(c)=>c.live?`Tickets are issued by the Ticketrue smart contract on BOT Chain at \`${c.address}\`. You can check it on the explorer.`:'The Ticketrue smart contract is not deployed on BOT Chain yet, so real on-chain purchases are not active. The demo flow works meanwhile, and the site switches to on-chain automatically once the contract address is set.',
  id:(c)=>c.live?`Tiket diterbitkan oleh smart contract Ticketrue di BOT Chain pada \`${c.address}\`. Kamu bisa mengeceknya di explorer.`:'Smart contract Ticketrue belum ter-deploy di BOT Chain, jadi pembelian on-chain asli belum aktif. Alur demo tetap bisa dicoba, dan situs otomatis pindah ke on-chain setelah alamat kontrak dipasang.'},
 {k:['organizer','create event','make an event','buat event','penyelenggara','dashboard'],
  en:()=>'The [Organizer](#/organizer) page (after demo login) lets you create, edit, draft and publish events locally in your browser. It is a prototype and not a real authorization boundary; on-chain administration is restricted to the contract organizer.',
  id:()=>'Halaman [Organizer](#/organizer) (setelah login demo) untuk membuat, mengedit, draft, dan publish event secara lokal di browser. Ini prototipe dan bukan batas otorisasi sungguhan; administrasi on-chain dibatasi untuk organizer kontrak.'},
 {k:['seed phrase','recovery phrase','private key','scam','safe','security','secure','aman','keamanan','penipuan','phishing'],
  en:()=>'Never share your seed or recovery phrase. Ticketrue will never ask for it, only for a MetaMask connection and transaction approvals you can review first.',
  id:()=>'Jangan pernah membagikan seed atau recovery phrase. Ticketrue tidak akan memintanya, hanya koneksi MetaMask dan persetujuan transaksi yang bisa kamu periksa dulu.'},
 {k:['demo','fictional','fiktif','prototype','prototipe','real event','asli'],
  en:()=>'Every concert on Ticketrue is fictional and no real money is charged. **Demo** tickets live only in your browser and are clearly labelled. **On-chain** tickets are recorded on BOT Chain.',
  id:()=>'Semua konser di Ticketrue fiktif dan tidak ada uang sungguhan yang ditagih. Tiket **Demo** hanya ada di browser-mu dan diberi label jelas. Tiket **On-chain** tercatat di BOT Chain.'},
 {k:['privacy','privasi','terms','syarat','data','stored','disimpan'],
  en:()=>'Data stays in your browser only. See [Privacy](#/privacy) and [Terms](#/terms).',
  id:()=>'Data hanya tersimpan di browser-mu. Lihat [Privacy](#/privacy) dan [Terms](#/terms).'},
 {k:['help','support','contact','bantuan','hubungi','customer service','admin','what can you do','bisa apa'],
  en:()=>'I can answer questions about the concerts (dates, venues, prices), buying tickets, wallets, resale, gate check-in and how Ticketrue works. There is no human support desk in this prototype.',
  id:()=>'Aku bisa menjawab soal konser (tanggal, venue, harga), cara beli tiket, wallet, resale, check-in gerbang, dan cara kerja Ticketrue. Prototipe ini tidak punya layanan bantuan manusia.'},
 {k:['concert','concerts','konser','lineup','line up','events','event','acara','schedule','jadwal','what is on','apa saja'],list:true,en:()=>'',id:()=>''}
];
const ATTRS={
  date:['when','date','time','what time','kapan','tanggal','jam','hari','waktu'],
  place:['where','venue','location','city','dimana','di mana','lokasi','tempat','kota'],
  price:['price','cost','how much','harga','berapa','biaya','tarif','murah'],
  tiers:['tier','category','kategori','seat','kursi','types','tipe'],
  who:['who','artist','performer','siapa','penyanyi','band','bintang'],
  genre:['genre','music','musik','style','aliran'],
  sched:['schedule','doors','door','set time','set times','running order','jadwal','pintu','mulai jam','jam berapa'],
  age:['age','umur','usia','kids','children','anak','bag','bags','tas']
};

const STOP=['world','tour','night','nights','lights','after','collective','live','festival','city','hour','blue','fest','seven','vale','the','and'];
const aliases=e=>[...new Set([e.title,e.artist,e.slug.replace(/-/g,' '),...(e.title+' '+e.artist).toLowerCase().replace(/[^a-z0-9/ ]+/g,' ').split(' ').filter(w=>w.length>=4&&!STOP.includes(w))].map(x=>x.toLowerCase()))];

export function mountAssistant(getCtx){
  if(document.querySelector('.as-fab'))return;
  const BUBBLE='<svg class="ai" viewBox="0 0 32 30" aria-hidden="true"><path class="bubble" d="M9 6h10a6 6 0 0 1 6 6v4a6 6 0 0 1-6 6h-5.5l-4.3 3.6a.7.7 0 0 1-1.2-.53V22A6 6 0 0 1 3 16v-4a6 6 0 0 1 6-6Z"/><circle class="d d1" cx="9.5" cy="14" r="1.6"/><circle class="d d2" cx="14" cy="14" r="1.6"/><circle class="d d3" cx="18.5" cy="14" r="1.6"/><path class="spark" d="M26.5 1.6l1.1 2.9 2.9 1.1-2.9 1.1-1.1 2.9-1.1-2.9-2.9-1.1 2.9-1.1z"/></svg>';
  const ICON=BUBBLE,TILE=BUBBLE;
  const CLOSE='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
  const fab=document.createElement('button');fab.type='button';fab.className='as-fab';fab.setAttribute('aria-label','Open Rue, the Ticketrue assistant');fab.setAttribute('aria-expanded','false');fab.setAttribute('aria-controls','as-panel');fab.innerHTML=ICON+'<span class="as-fab-tip">Ask Rue</span>';
  const panel=document.createElement('section');panel.id='as-panel';panel.className='as-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Rue, the Ticketrue assistant');panel.hidden=true;
  panel.innerHTML='<header class="as-head"><span class="as-tile" aria-hidden="true">'+TILE+'</span><div class="as-title"><strong>Rue, Ticketrue assistant</strong><small>Help with tickets and this website</small></div><button type="button" class="as-x" aria-label="Close assistant">'+CLOSE+'</button></header><div class="as-log" role="log" aria-live="polite"></div><div class="as-chips"></div><form class="as-form"><label class="as-sr" for="as-input">Message</label><div class="as-field"><input id="as-input" maxlength="300" autocomplete="off" placeholder="Type your question…"><button class="as-send" aria-label="Send message"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></div></form><p class="as-fine">Rue only answers about Ticketrue and can be wrong. There is no human support desk in this prototype.</p>';
  document.body.append(fab,panel);
  const log=panel.querySelector('.as-log'),chips=panel.querySelector('.as-chips'),form=panel.querySelector('.as-form'),input=panel.querySelector('#as-input');
  let lang=/^id/i.test(navigator.language||'')?'id':'en',started=false,busy=false;

  const fmt=s=>esc(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/\[([^\]]+)\]\((#\/[^)\s]*|https:\/\/[^)\s]*)\)/g,(m,t,u)=>u.startsWith('#')?`<a href="${u}" data-as-nav>${t}</a>`:`<a href="${u}" target="_blank" rel="noreferrer">${t} ↗</a>`).replace(/\n/g,'<br>');
  const add=(who,html)=>{const m=document.createElement('div');m.className='as-msg '+who;m.innerHTML=html;log.append(m);log.scrollTop=log.scrollHeight;return m};
  const setChips=()=>{chips.innerHTML=CHIPS[lang].map(c=>`<button type="button" class="as-chip">${esc(c)}</button>`).join('')};

  const ctx=()=>{const c=getCtx(),events=c.events;return{...c,events,seated:events.filter(e=>e.mode==='seat'),live:!!c.contractAddress,address:c.contractAddress}};
  const describe=(e,c,l,only)=>{const when=`${c.date(e.date)} · ${e.time} WIB`,where=`${e.venue}, ${e.city}`,link=`[${e.title}](#/event/${e.slug})`;
    const tiers=e.mode==='seat'?c.seatZones.map(z=>`${z.name} ${c.money(e.price+z.add)}`).join(' / '):e.tiers.map((t,i)=>`${t} ${c.money(e.price+i*250000)}`).join(' / ');
    const parts=[];
    if(only.date)parts.push(l==='id'?`Waktu: ${when}.`:`When: ${when}.`);
    if(only.place)parts.push(l==='id'?`Tempat: ${where}.`:`Where: ${where}.`);
    if(only.who)parts.push(l==='id'?`Pengisi acara: ${e.artist}.`:`Performer: ${e.artist}.`);
    if(only.genre)parts.push(`Genre: ${e.genre}.`);
    if((only.sched||only.age)&&e.info){if(only.sched)parts.push((l==='id'?'Jadwal: ':'Schedule: ')+e.info.schedule.map(([t,x])=>`${t} ${x}`).join(' · ')+'.');if(only.age)parts.push((l==='id'?'Aturan: ':'Good to know: ')+e.info.age+' '+e.info.bag)}
    if(only.price||only.tiers)parts.push((l==='id'?'Harga: ':'Prices: ')+tiers+'.');
    if(parts.length)return `**${link}**\n`+parts.join('\n');
    return `**${link}** · ${e.artist}\n${when} · ${where}\n${e.mode==='seat'?(l==='id'?'Pilih kursi':'Seat selection'):(l==='id'?'Pilih tier':'Ticket tiers')}: ${tiers}.`};

  function answer(raw){
    const t=norm(raw),c=ctx();
    if(has(t,'ignore previous')||has(t,'system prompt')||has(t,'abaikan instruksi'))return REFUSE[lang];
    if(isID(t))lang='id';else if(/[a-z]{3,}/.test(t)&&!ID_WORDS.some(w=>has(t,w))&&t.trim().split(' ').length>2)lang='en';
    // 1. a specific concert, artist, city or venue
    const hit=c.events.filter(e=>aliases(e).some(n=>has(t,n)));
    const attrs=Object.fromEntries(Object.entries(ATTRS).map(([k,v])=>[k,v.some(w=>has(t,w))]));
    if(hit.length)return hit.slice(0,3).map(e=>describe(e,c,lang,attrs)).join('\n\n');
    const cityHit=c.events.filter(e=>has(t,e.city.toLowerCase())||has(t,e.venue.toLowerCase()));
    if(cityHit.length&&(attrs.place||attrs.date||attrs.price||attrs.who||has(t,'concert')||has(t,'konser')||has(t,'event')||has(t,'acara')||has(t,'in ')||has(t,'di ')))return (lang==='id'?'Konser yang cocok:\n':'Matching concerts:\n')+cityHit.map(e=>`• [${e.title}](#/event/${e.slug}) · ${c.date(e.date)} · ${e.venue}, ${e.city}`).join('\n');
    // 2. topics by weighted keyword match
    let best=null,score=0;
    for(const topic of TOPICS){let s=0;for(const kw of topic.k)if(has(t,kw))s+=kw.split(' ').length+kw.length/20;if(s>score){score=s;best=topic}}
    if(!best||score===0)return REFUSE[lang];
    if(best.list){const head=lang==='id'?'Konser yang sedang tersedia:':'Concerts on right now:';return head+'\n'+c.events.map(e=>`• [${e.title}](#/event/${e.slug}) · ${e.artist} · ${c.date(e.date)} · ${e.city}`).join('\n')}
    return best[lang](c);
  }

  function ask(text){
    const q=text.trim().slice(0,300);if(!q||busy)return;busy=true;add('user',esc(q));chips.hidden=true;
    const typing=add('bot typing','<i></i><i></i><i></i>');
    const reply=answer(q);
    setTimeout(()=>{typing.className='as-msg bot';typing.innerHTML=fmt(reply);log.scrollTop=log.scrollHeight;busy=false;chips.hidden=false;setChips()},450+Math.min(reply.length,400)*1.2);
  }
  function open(){
    panel.hidden=false;fab.setAttribute('aria-expanded','true');fab.classList.add('open');fab.innerHTML=CLOSE;fab.setAttribute('aria-label','Close Rue, the Ticketrue assistant');
    if(!started){started=true;add('bot',fmt(lang==='id'?'Halo! Aku Rue. Ada yang bisa aku bantu seputar Ticketrue? Pilih salah satu di bawah atau tulis pertanyaanmu.':'Hi! I’m Rue. What can I help you with about Ticketrue? Pick one below or type your question.'));setChips()}
    setTimeout(()=>input.focus(),50);
  }
  function close(){panel.hidden=true;fab.setAttribute('aria-expanded','false');fab.classList.remove('open');fab.innerHTML=ICON+'<span class="as-fab-tip">Ask Rue</span>';fab.setAttribute('aria-label','Open Rue, the Ticketrue assistant');fab.focus()}
  fab.addEventListener('click',()=>panel.hidden?open():close());
  panel.querySelector('.as-x').addEventListener('click',close);
  form.addEventListener('submit',e=>{e.preventDefault();const v=input.value;input.value='';ask(v)});
  chips.addEventListener('click',e=>{const b=e.target.closest('.as-chip');if(b)ask(b.textContent)});
  log.addEventListener('click',e=>{if(e.target.closest('[data-as-nav]')&&matchMedia('(max-width:560px)').matches)close()});
  panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();close()}});
}
