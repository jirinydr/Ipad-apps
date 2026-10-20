/* Společné funkce číselných aplikací: názvy čísel, rozsah, kostka / rámeček / předměty, dlaždice. */
(function(){
"use strict";
const C = window.C = {};

/* Při počítání se říká „jedna, dva, tři…“ */
C.WORDS=['nula','jedna','dva','tři','čtyři','pět','šest','sedm','osm','devět','deset','jedenáct','dvanáct','třináct',
  'čtrnáct','patnáct','šestnáct','sedmnáct','osmnáct','devatenáct','dvacet'];
C.word = n => C.WORDS[n] ?? String(n);

/* Společné nastavení všech číselných aplikací (rozsah a podoba množství). */
C.S = K.store('cisla-global',{max:5,show:'mix'});
C.max = () => +C.S.max || 5;
C.range = (from,to) => {const a=[];for(let i=from;i<=(to??C.max());i++)a.push(i);return a};
C.rangeHTML = () => `<p class="seg-label">Čísla</p>${K.segHTML('rangeSeg',[['5','0 – 5'],['10','0 – 10'],['20','0 – 20']])}`;
C.bindRange = cb => K.bindSeg('rangeSeg',()=>C.S.max,v=>{C.S.max=+v;C.S.save();if(cb)cb()});

/* Předměty k počítání: emoji + 2. pád množného čísla („Kolik je tu jablíček?“) */
C.THINGS=[['🍎','jablíček'],['🍓','jahod'],['🍐','hrušek'],['🍌','banánů'],['🐟','rybiček'],['🐥','kuřátek'],['🐞','berušek'],
  ['⭐','hvězdiček'],['🎈','balónků'],['🚗','autíček'],['🐸','žabiček'],['🌷','kytiček'],['🦋','motýlků'],['🍄','hříbků']]
  .map(([e,gen])=>({e,gen}));
C.thing = () => K.pick(C.THINGS);
C.COLORS=['var(--t1)','var(--t2)','var(--t3)','var(--t4)'];

/* ---------- Zobrazení množství ---------- */
const DICE={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
/* kind: 'dots' | 'objects' | 'mix' (podle nastavení). Vrací prvek .qty, jehož .it lze postupně rozsvěcet. */
C.quantity = (n,kind,emoji,color) => {
  kind = kind || C.S.show || 'mix';
  if(kind==='mix')kind=Math.random()<.5?'dots':'objects';
  const q=K.el('div','qty'); if(color)q.style.setProperty('--c',color);
  if(n===0){q.append(K.el('div','zero','žádné'));return q}
  if(kind==='objects'){
    const o=K.el('div','objs');const cols=n<=3?n:n<=4?2:n<=9?3:n<=12?4:5;o.style.setProperty('--cols',cols);
    const e=emoji||C.thing().e;
    for(let i=0;i<n;i++)o.append(K.el('span','it',e));
    q.append(o);return q;
  }
  if(n<=6){
    const d=K.el('div','dice card');
    DICE[n].forEach(p=>{const i=K.el('i','it');i.style.gridArea=`${Math.floor(p/3)+1}/${p%3+1}`;d.append(i)});
    q.append(d);return q;
  }
  /* desítkový rámeček: plné desítky nahoře, zbytek dole */
  for(let f=0;f<Math.ceil(n/10);f++){
    const tf=K.el('div','tf');
    for(let k=0;k<10;k++){const i=K.el('i',f*10+k<n?'on it':'');tf.append(i)}
    q.append(tf);
  }
  return q;
};
/* Postupně rozsvítí položky a nahlas je spočítá. */
let countTok=0;
C.countAlong = async (q) => {
  const my=++countTok;const its=[...q.querySelectorAll('.it')];
  for(let k=0;k<its.length;k++){
    if(my!==countTok)return;
    its[k].classList.add('lit');
    await K.say(C.word(k+1),1);
  }
  await K.wait(400);its.forEach(i=>i.classList.remove('lit'));
};
C.stopCount = () => {countTok++};

/* ---------- Dlaždice s čísly ---------- */
C.tile = (n,k) => {
  const b=K.el('button','opt'+(n>9?' two':''),String(n));
  b.style.setProperty('--c',C.COLORS[(k??n)%C.COLORS.length]);b.dataset.n=n;b.setAttribute('aria-label',C.word(n));
  return b;
};
/* Nabídka: správné číslo + sousední čísla jako „zrádné“ možnosti. */
C.options = (target,count,lo,hi) => {
  lo=lo??0;hi=hi??C.max();
  const set=new Set([target]);
  for(const d of [...K.shuffle([-1,1]),...K.shuffle([-2,2]),...K.shuffle([-3,3]),4,-4,5,-5])if(set.size<count){const v=target+d;if(v>=lo&&v<=hi)set.add(v)}
  for(let v=lo;set.size<count&&v<=hi;v++)set.add(v);
  return K.shuffle([...set]);
};
C.wrong = b => {b.classList.remove('wrong');void b.offsetWidth;b.classList.add('wrong')};
/* Velikost dlaždic podle toho, kolik jich je na obrazovce. */
C.tileSize = n => n<=6?'':n<=11?'clamp(56px,min(13vw,10.5vh),120px)':'clamp(46px,min(9vw,8vh),86px)';
})();
