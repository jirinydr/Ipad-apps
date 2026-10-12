/* Společné funkce pro všechny aplikace: hlas, konfety, obrazovky, kolo her, slovník obrázků. */
(function(){
"use strict";
const K = window.K = {};
const $ = K.$ = s => document.querySelector(s);
K.rnd = n => Math.floor(Math.random()*n);
K.shuffle = a => {for(let i=a.length-1;i>0;i--){const j=K.rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
K.pick = a => a[K.rnd(a.length)];
K.sample = (a,n) => K.shuffle(a.slice()).slice(0,n);
K.wait = ms => new Promise(r=>setTimeout(r,ms));
K.el = (tag,cls,html) => {const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e};

/* ---------- Uložení nastavení (jen v tomto zařízení) ---------- */
K.store = (key,def) => {
  let v=def; try{v=Object.assign({},def,JSON.parse(localStorage.getItem(key))||{})}catch(e){}
  v.save=()=>{try{const o=Object.assign({},v);delete o.save;localStorage.setItem(key,JSON.stringify(o))}catch(e){}};
  return v;
};

/* ---------- Písmena (stejné pořadí a názvy jako v Písmenkách) ---------- */
K.LETTERS=[['A','a','á'],['E','e','é'],['I','i','í'],['O','o','ó'],['U','u','ú'],['M','m','em'],['L','l','el'],['S','s','es'],
 ['P','p','pé'],['T','t','té'],['J','j','jé'],['V','v','vé'],['D','d','dé'],['N','n','en'],['K','k','ká'],['Z','z','zet'],
 ['B','b','bé'],['R','r','er'],['H','h','há'],['C','c','cé']].map(([u,l,name])=>({u,l,name}));
const NAMES={}; K.LETTERS.forEach(L=>NAMES[L.l]=L.name);
Object.assign(NAMES,{'á':'dlouhé á','é':'dlouhé é','í':'dlouhé í','ý':'dlouhé ý','ó':'dlouhé ó','ú':'dlouhé ú','ů':'ů s kroužkem',
  'y':'tvrdé y','č':'čé','š':'eš','ž':'žet','ř':'eř','ě':'é s háčkem','ď':'ďé','ť':'ťé','ň':'eň','f':'ef','g':'gé','ch':'chá'});
K.letterName = ch => NAMES[ch.toLowerCase()] || ch;
/* Kolik písmen už zná z aplikace Písmenka (stejná webová adresa = sdílené úložiště). */
K.knownLetters = (min) => {
  let n=0; try{n=(JSON.parse(localStorage.getItem('pismenka-v1'))||{}).unlocked||0}catch(e){}
  return K.LETTERS.slice(0,Math.max(min||0,n));
};

/* ---------- Obrázky: podstatná jména + emoji ---------- */
K.WORDS=[
 ['auto','🚗','věci'],['ananas','🍍','jídlo'],['oko','👁️','tělo'],['opice','🐒','zvířata'],['ovce','🐑','zvířata'],['ucho','👂','tělo'],
 ['myš','🐭','zvířata'],['med','🍯','jídlo'],['míč','⚽','věci'],['měsíc','🌙','příroda'],['lev','🦁','zvířata'],['list','🍃','příroda'],
 ['loď','⛵','věci'],['lízátko','🍭','jídlo'],['slon','🐘','zvířata'],['sova','🦉','zvířata'],['slunce','☀️','příroda'],['sýr','🧀','jídlo'],
 ['srdce','❤️','věci'],['pusa','💋','tělo'],['pes','🐕','zvířata'],['prase','🐖','zvířata'],['pták','🐦','zvířata'],['ponožka','🧦','věci'],
 ['tygr','🐯','zvířata'],['telefon','📱','věci'],['traktor','🚜','věci'],['jablko','🍎','jídlo'],['jahoda','🍓','jídlo'],['ježek','🦔','zvířata'],
 ['vlak','🚂','věci'],['vajíčko','🥚','jídlo'],['velryba','🐳','zvířata'],['vlk','🐺','zvířata'],['dům','🏠','věci'],['dort','🎂','jídlo'],
 ['deštník','☂️','věci'],['dýně','🎃','jídlo'],['drak','🐉','zvířata'],['nos','👃','tělo'],['nůžky','✂️','věci'],['noha','🦵','tělo'],
 ['kočka','🐈','zvířata'],['kráva','🐄','zvířata'],['kůň','🐴','zvířata'],['klíč','🔑','věci'],['kolo','🚲','věci'],['koruna','👑','věci'],
 ['zebra','🦓','zvířata'],['zmrzlina','🍦','jídlo'],['zub','🦷','tělo'],['zajíc','🐇','zvířata'],['bota','👢','věci'],['banán','🍌','jídlo'],
 ['balón','🎈','věci'],['beruška','🐞','zvířata'],['ryba','🐟','zvířata'],['raketa','🚀','věci'],['ruka','✋','tělo'],['rohlík','🥐','jídlo'],
 ['had','🐍','zvířata'],['hruška','🍐','jídlo'],['hodiny','⏰','věci'],['houba','🍄','příroda'],['hrad','🏰','věci'],['citrón','🍋','jídlo'],
 ['cibule','🧅','jídlo'],['slepice','🐔','zvířata'],['kachna','🦆','zvířata'],['žirafa','🦒','zvířata'],['motýl','🦋','zvířata'],['žába','🐸','zvířata'],
 ['mrkev','🥕','jídlo'],['hrozny','🍇','jídlo'],['třešně','🍒','jídlo'],['pizza','🍕','jídlo'],['strom','🌳','příroda'],['květina','🌷','příroda'],
 ['hvězda','⭐','příroda'],['duha','🌈','příroda'],['mrak','☁️','příroda'],['kytara','🎸','věci'],['autobus','🚌','věci'],['letadlo','✈️','věci'],
 ['lama','🦙','zvířata'],['koza','🐐','zvířata'],['voda','💧','příroda'],['lupa','🔍','věci'],['mapa','🗺️','věci'],['krab','🦀','zvířata'],
 ['kost','🦴','věci'],['vlna','🌊','příroda'],['robot','🤖','věci'],['máma','👩','lidé'],['táta','👨','lidé'],['mísa','🥣','věci'],
 ['máta','🌿','příroda'],['láva','🌋','příroda'],['vila','🏡','věci'],['sele','🐷','zvířata'],['tele','🐮','zvířata'],['jojo','🪀','věci'],
 ['jáma','🕳️','slabiky'],['les','🌲','příroda'],['kladivo','🔨','věci'],['tužka','✏️','věci'],['kniha','📕','věci'],['sníh','❄️','příroda']
].map(([w,e,g])=>({w,e,g}));
K.word = w => K.WORDS.find(x=>x.w===w);

/* ---------- Hlas ---------- */
let voice=null;
function pickVoice(){
  if(!('speechSynthesis' in window))return;
  const score=v=>(/enhanced|vylepš|premium/i.test(v.name)?4:0)+(/zuzana/i.test(v.name)?2:0)+(v.localService?1:0);
  const vs=speechSynthesis.getVoices().filter(v=>(v.lang||'').toLowerCase().startsWith('cs')).sort((a,b)=>score(b)-score(a));
  voice=vs[0]||null;
  const n=document.getElementById('voiceNote'); if(n)n.hidden=!!voice;
}
if('speechSynthesis' in window){speechSynthesis.onvoiceschanged=pickVoice}
pickVoice(); setTimeout(pickVoice,800);
let sayToken=0;
K.say = (text,rate) => new Promise(res=>{
  if(!('speechSynthesis' in window))return res();
  const my=++sayToken;
  try{
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.lang='cs-CZ'; if(voice)u.voice=voice; u.rate=rate||0.85; u.pitch=1.05;
    let done=false; const fin=()=>{if(!done){done=true;res(my===sayToken)}};
    u.onend=fin; u.onerror=fin; setTimeout(fin,2500+text.length*95);
    speechSynthesis.speak(u);
  }catch(e){res(false)}
});
K.stopSay = () => {sayToken++;try{speechSynthesis.cancel()}catch(e){}};
K.PRAISE=['Výborně!','Super!','Šikulka!','Paráda!','Skvělé!','To je ono!','Moc hezky!'];
K.praise = () => K.say(K.pick(K.PRAISE));

/* ---------- Konfety ---------- */
const cv=document.createElement('canvas');cv.id='confetti';
const cx=cv.getContext('2d');
const CCOL=['#F07E6E','#36A595','#8C7AE6','#4C8FD6','#F5B53F','#2FA463'];
let parts=[],raf=0;const dpr=Math.min(window.devicePixelRatio||1,2);
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function sizeCv(){cv.width=innerWidth*dpr;cv.height=innerHeight*dpr;cv.style.width=innerWidth+'px';cv.style.height=innerHeight+'px'}
K.burst = (x,y,n) => {
  n=reduce?Math.min(15,n||50):(n||50);
  for(let i=0;i<n;i++)parts.push({x,y,vx:(Math.random()-.5)*14,vy:-Math.random()*13-4,r:Math.random()*7+5,
    c:CCOL[K.rnd(CCOL.length)],a:Math.random()*6,va:(Math.random()-.5)*.4,life:80+K.rnd(40)});
  if(!raf)raf=requestAnimationFrame(tick);
};
K.burstEl = (el,n) => {const b=el.getBoundingClientRect();K.burst(b.left+b.width/2,b.top+b.height/2,n)};
function tick(){
  cx.setTransform(dpr,0,0,dpr,0,0);cx.clearRect(0,0,innerWidth,innerHeight);
  parts=parts.filter(p=>--p.life>0&&p.y<innerHeight+30);
  for(const p of parts){p.vy+=.42;p.vx*=.985;p.x+=p.vx;p.y+=p.vy;p.a+=p.va;
    cx.save();cx.translate(p.x,p.y);cx.rotate(p.a);cx.fillStyle=p.c;cx.fillRect(-p.r/2,-p.r/4,p.r,p.r/2);cx.restore()}
  raf=parts.length?requestAnimationFrame(tick):0;
  if(!raf)cx.clearRect(0,0,innerWidth,innerHeight);
}

/* ---------- Podržení tlačítka (aby dítě omylem neodešlo ze hry) ---------- */
K.hold = (el,ms,fn) => {
  let t=null;
  el.addEventListener('pointerdown',e=>{e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(_){}
    el.classList.add('holding');clearTimeout(t);t=setTimeout(()=>{t=null;el.classList.remove('holding');fn()},ms)});
  el.addEventListener('pointerup',()=>{if(t){clearTimeout(t);t=null;el.classList.remove('holding')}});
  el.addEventListener('contextmenu',e=>e.preventDefault());
};

/* ---------- Kostra aplikace: domů / hra / konec ---------- */
const ICON_HOME='<svg viewBox="0 0 24 24" fill="none" stroke="#22394A" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/></svg>';
const ICON_SPK='<svg viewBox="0 0 24 24" fill="none" stroke="#22394A" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="#F5B53F"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>';
const ICON_BACK='<svg viewBox="0 0 24 24" fill="none" stroke="#22394A" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
const ICON_PLAY='<svg viewBox="0 0 24 24"><path d="M6 3.8v16.4a1 1 0 0 0 1.5.86l13.2-8.2a1 1 0 0 0 0-1.72L7.5 2.94A1 1 0 0 0 6 3.8z" fill="#22394A"/></svg>';
const STAR='<svg class="star" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 6l12.6 27.4 29.9 3.3-22.3 20.2 6.2 29.5L50 71.4 23.6 86.4l6.2-29.5L7.5 36.7l29.9-3.3z" fill="#F5B53F" stroke="#C98A12" stroke-width="3" stroke-linejoin="round"/></svg>';
K.logoHTML = t => [...t].map(c=>c===' '?'<span class="sp"></span>':'<span>'+c+'</span>').join('');

/* opts: {title, controls: HTML pro volby na domovské obrazovce, onPlay(), noPlay} */
K.shell = opts => {
  const app=K.el('div','app');
  app.innerHTML=`
  <section class="screen home" id="home">
    <a class="back" href="../" aria-label="Zpět na všechny aplikace">${ICON_BACK}Aplikace</a>
    <h1 class="logo" aria-label="${opts.title}">${K.logoHTML(opts.title)}</h1>
    <div id="controls" style="display:flex;flex-direction:column;align-items:center;gap:18px">${opts.controls||''}</div>
    ${opts.noPlay?'':`<button class="play" id="playBtn" aria-label="Hrát">${ICON_PLAY}</button>`}
    <p class="note" id="voiceNote" hidden>Na tomto zařízení chybí český hlas. iPad: Nastavení → Zpřístupnění → Předčítaný obsah → Hlasy → Čeština → Zuzana (Vylepšený).</p>
  </section>
  <section class="screen" id="game" hidden>
    <div class="topbar">
      <button class="iconbtn hold" id="exitBtn" aria-label="Domů (podržet)">${ICON_HOME}</button>
      <div class="dots" id="dots"></div>
      <button class="iconbtn" id="againBtn" aria-label="Zopakovat zadání">${ICON_SPK}</button>
    </div>
    <p class="hint" id="hint"></p>
    <div class="stage" id="stage"></div>
  </section>
  <section class="screen end" id="end" hidden>
    ${STAR}
    <h2 class="end-title">Hotovo!</h2>
    <div class="row">
      <button class="bigbtn" id="moreBtn">Ještě jednou</button>
      <button class="bigbtn soft" id="homeBtn">Domů</button>
    </div>
  </section>`;
  document.body.prepend(app); document.body.append(cv); sizeCv(); addEventListener('resize',sizeCv);
  pickVoice();
  if(!opts.noPlay)$('#playBtn').onclick=()=>{unlockSpeech();opts.onPlay()};
  K.hold($('#exitBtn'),1000,()=>{K.stopSay();K.show('home')});
  $('#againBtn').onclick=()=>{const b=$('#againBtn');if(K.repeat){b.classList.add('talking');Promise.resolve(K.repeat()).then(()=>b.classList.remove('talking'))}};
  $('#homeBtn').onclick=()=>K.show('home');
  $('#moreBtn').onclick=()=>opts.onPlay();
  K.onPlay=opts.onPlay;
};
/* iOS spustí hlas jen po dotyku – první krátké „nic" ho odemkne. */
let unlocked=false;
function unlockSpeech(){if(unlocked||!('speechSynthesis' in window))return;unlocked=true;try{const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u)}catch(e){}}
document.addEventListener('pointerdown',unlockSpeech,{once:true});

K.show = id => {['home','game','end'].forEach(s=>$('#'+s).hidden=s!==id)};
K.hint = t => {$('#hint').textContent=t||''};
K.repeat = null;

/* Segmentové volby na domovské obrazovce. items: [[hodnota, popisek]] */
K.segHTML = (id,items) => `<div class="seg" id="${id}">${items.map(([v,l])=>`<button data-v="${v}" aria-pressed="false">${l}</button>`).join('')}</div>`;
K.bindSeg = (id,get,set) => {
  const box=$('#'+id); const sync=()=>box.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===String(get()))));
  box.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;set(b.dataset.v);sync()});
  sync();
};

/* Kolo: n úkolů, task(i, hotovo) vykreslí úkol do #stage a zavolá hotovo() po vyřešení. */
K.round = (n,task) => {
  let i=0; const dots=$('#dots'); dots.innerHTML='';
  for(let k=0;k<n;k++)dots.append(K.el('span','dot'));
  K.show('game');
  const next=()=>{
    [...dots.children].forEach((d,k)=>{d.className='dot'+(k<i?' done':k===i?' now':'')});
    if(i>=n){finish();return}
    const my=i; $('#stage').innerHTML=''; K.hint('');
    task(my,()=>{if(my!==i)return;i++;setTimeout(next,900)});
  };
  next();
};
function finish(){
  K.repeat=null;
  setTimeout(()=>{K.show('end');K.say('Hotovo! '+K.pick(K.PRAISE));
    for(let k=0;k<4;k++)setTimeout(()=>K.burst(innerWidth*(.2+.6*Math.random()),innerHeight*.45,60),k*260)},500);
}
/* Krátký úspěch nad prvkem + pochvala. */
K.success = el => {if(el)K.burstEl(el,45)};

/* ---------- Offline: jeden service worker pro celý rozcestník ---------- */
if('serviceWorker' in navigator && location.protocol!=='file:'){
  addEventListener('load',()=>navigator.serviceWorker.register('../sw.js',{scope:'../'}).catch(()=>{}));
}
})();
