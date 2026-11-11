/* Britland Academy: book banner on the student home (shared by the English and Spanish sites).
   Switches the "working book" in place (no navigation), shows progress rings per activity and the Stage test medal. */
(function(){
'use strict';
var CSS='.bk{display:block!important}'+
'.bk .bkn{display:flex;flex-wrap:wrap;gap:16px 20px;align-items:center;justify-content:space-between}'+
'.bk .bkcw{position:relative;flex:none;display:block;line-height:0}.bk .bkrib{position:absolute;left:-6px;right:-6px;bottom:14px;border:0;background:linear-gradient(90deg,#a67c1a,#e6c56a,#a67c1a);color:#1a1405;font:700 10.5px system-ui,sans-serif;line-height:1.2;text-align:center;padding:4px 0;box-shadow:0 3px 8px rgba(0,0,0,.5);transform:rotate(-4deg);letter-spacing:.03em;cursor:pointer}.bk .bkrib:focus-visible{outline:2px solid #fff;outline-offset:1px}.bk .bkrib:disabled{opacity:.6}'+
'.bk .bkcv{width:90px;height:auto;border-radius:4px;box-shadow:0 6px 16px rgba(0,0,0,.4);flex:none}@media(max-width:560px){.bk .bkcv{width:70px}}'+
'.bk .bkg{text-align:center;font-size:.72rem;color:var(--mut);min-width:0;flex:1}.bk .bkg strong{display:block;color:var(--ink);font-size:.78rem;margin-top:4px}'+
'.bk .bkr{width:62px;height:62px;border-radius:50%;display:flex;align-items:center;justify-content:center;position:relative;margin:0 auto;background:var(--line)}'+
'.bk .bkr:before{content:"";position:absolute;inset:16%;border-radius:50%;background:var(--card)}.bk .bkr b{position:relative;font-size:.66rem;color:var(--ink)}'+
'.bk .bkr.dash{border:2px dashed var(--mut);background:transparent!important;opacity:.7}.bk .bkr.dash:before{display:none}'+
'.bk .bkm{width:76px;height:82px;margin:-6px auto -2px;position:relative;filter:drop-shadow(0 3px 6px #0009)}.bk .bkm svg{width:100%;height:100%;display:block;overflow:visible}'+
'.bk .bktt{display:inline-block;margin-top:2px;padding:3px 10px;border-radius:999px;background:var(--hl);color:var(--hli);font-weight:700;font-size:.7rem;text-decoration:none}'+
'.bk .bkb{display:flex;flex-direction:column;gap:8px;align-items:stretch}'+
'.bk .bkb a{text-align:center;text-decoration:none;border-radius:999px;padding:12px 26px;font-weight:700;font-size:.95rem}'+
'.bk .bkb .bkgo{background:var(--hl);color:var(--hli);box-shadow:0 4px 0 rgba(0,0,0,.35)}'+
'.bk .bkb .bkback{border:2px solid var(--hl);color:var(--hl);padding:9px 22px}'+
'.bk .bknote{flex:1 1 100%;background:var(--chip,rgba(255,255,255,.06));border-radius:10px;padding:8px 12px;font-size:.8rem;color:var(--mut)}'+
'.bk .cstrip{margin-top:14px;border-top:1px solid var(--line);padding-top:16px}'+
'.bk .cv-p{cursor:pointer}.bk .cv-p.sel .cv-img{outline:3px solid var(--hl);outline-offset:2px;border-radius:3px}'+
'.bk .cv-p.bksk .cv-img{filter:grayscale(.85) brightness(.75)}.bk .cv-p .bkskt{position:absolute;right:-3px;top:-4px;background:#46506a;color:#e5e9f5;border-radius:999px;font-size:9px;font-weight:700;padding:1px 5px;pointer-events:none}'+
'@keyframes bksh{0%,60%{transform:translateX(-120%) rotate(20deg)}100%{transform:translateX(220%) rotate(20deg)}}.bk .bkshine{transform-box:fill-box;animation:bksh 3.2s ease-in-out infinite}'+
'@media(prefers-reduced-motion:reduce){.bk .bkshine{animation:none}}'+
'.bk .bks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 10px;align-items:start;flex:1 1 220px;max-width:340px}'+
'@media(max-width:560px){.bk .bkn{flex-wrap:wrap}.bk .bkcv{width:84px}.bk .bks{flex:1 1 0;min-width:0}.bk .bkb{flex:1 1 100%}.bk .bkg strong{font-size:.74rem}}';
var COL={check:'#7fd29a',ex:'#f2c94c',wb:'#6aa8ff'};
var K={b:{r:'mdrb',g:'mdgb',st:'#a8672a',tx:'#fff3df'},s:{r:'mdrs',g:'mdgs',st:'#76839a',tx:'#fff'},g:{r:'mdrg',g:'mdgg',st:'#a67c1a',tx:'#fff9d6'}};
var UID=0;
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function T(s){try{return window.I18N&&I18N.t?I18N.t(s):s;}catch(e){return s;}}
function F(s,a){var r=T(s);return r.replace(/\{(\d+)\}/g,function(m,i){return a[+i];});}
function css(){if(document.getElementById('bk-css'))return;var s=el('style');s.id='bk-css';s.textContent=CSS;document.head.append(s);}
function defs(){try{if(window.Medals&&Medals.cat&&Medals.cat[0])Medals.svg(Medals.cat[0].id);}catch(e){}}
function medal(t,n){var k=K[t],id='bkc'+(++UID);return '<div class="bkm"><svg viewBox="0 0 100 108" aria-hidden="true"><defs><clipPath id="'+id+'"><circle cx="50" cy="46" r="42"/></clipPath></defs>'+
'<path d="M34 78l-8 18 12-4 6 9 8-24z" fill="url(#'+k.r+')" opacity=".9"/><path d="M66 78l8 18-12-4-6 9-8-24z" fill="url(#'+k.r+')" opacity=".75"/>'+
'<circle cx="50" cy="46" r="42" fill="url(#'+k.r+')"/><circle cx="50" cy="46" r="42" fill="url(#mdsh)"/>'+
'<circle cx="50" cy="46" r="35" fill="url(#mdnv)" stroke="'+k.st+'" stroke-width="1.5"/><circle cx="50" cy="46" r="31" fill="none" stroke="url(#'+k.g+')" stroke-width="1" stroke-dasharray="1.5 3.2" opacity=".8"/>'+
'<text x="50" y="52" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="800" font-size="25" fill="url(#'+k.g+')">'+n+'<tspan font-size="13">%</tspan></text>'+
'<g clip-path="url(#'+id+')"><rect class="bkshine" x="10" y="0" width="14" height="100" fill="#fff" opacity=".35"/></g>'+
'<path d="M80 18v10M75 23h10M20 70v8M16 74h8" stroke="'+k.tx+'" stroke-width="1.6" stroke-linecap="round" opacity=".8"/></svg></div>';}
function ash(n){var id='bka'+(++UID);return '<div class="bkm" style="opacity:.9"><svg viewBox="0 0 100 108" aria-hidden="true"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8d96a8"/><stop offset=".5" stop-color="#4b5569"/><stop offset="1" stop-color="#2b3345"/></linearGradient></defs><circle cx="50" cy="46" r="42" fill="url(#'+id+')"/><circle cx="50" cy="46" r="35" fill="#101a38" stroke="#5b6680" stroke-width="1.5"/><text x="50" y="53" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="800" font-size="'+(n==null?26:25)+'" fill="#9aa5bd">'+(n==null?'—':n+'<tspan font-size="13">%</tspan>')+'</text></svg></div>';}
function fillRing(box,pct,color,delay,still){
  var r=box.querySelector('.bkr'),b=r.querySelector('b'),full=still||(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches);
  function set(v){r.style.background='conic-gradient('+color+' '+v+'%,var(--line) 0)';b.textContent=Math.round(v)+'%';}
  if(full||!pct){set(pct);return;}
  set(0);var t0=null,dur=800;
  function step(t){if(t0==null)t0=t+delay;var q=Math.max(0,Math.min(1,(t-t0)/dur));q=1-Math.pow(1-q,3);set(pct*q);if(q<1)requestAnimationFrame(step);}
  requestAnimationFrame(step);
}
function mount(o){
  css();defs();
  var box=o.box,ctx=o.ctx,upto=o.upto,ST=o.stages,att=ctx.attempts||[],prof=ctx.profile||{},es=!!o.es;
  var real=1;ST.forEach(function(r,i){if(Math.max(upto,1)>=r[0])real=i+1;});
  var key=o.key||'callan-stage',chosen=real;
  try{var sv=parseInt(sessionStorage.getItem('bl-book'),10);if(sv>=1&&sv<=real)chosen=sv;}catch(e){}
  var startSt=+prof.start_stage||0,LT=null,CERTS=null,uid=(prof.id)||(ctx.user&&ctx.user.id)||'';
  var KINDS=o.acts;
  function st(kind,n){return o.stat?o.stat(kind,n):Covers.stats(att,kind,n,upto);}
  function active(n){return KINDS.some(function(a){return st(a.kind,n).done>0;});}
  function skipped(n){return n<real&&!active(n)&&(!startSt||n<startSt);}
  function nextL(kind,n){if(o.nextL)return o.nextL(kind,n);var lo=ST[n-1][0],hi=Math.min(ST[n-1][1],upto),done={},i;
    att.forEach(function(a){var k=a.k==='check'?'check':(/^wb/.test(a.e)?'wb':'ex');if(k===kind)done[a.l]=1;});
    for(i=lo;i<=hi;i++)if(!done[i])return i;return lo;}
  function href(a,n){var l=nextL(a.kind,n);return a.href+(a.href.indexOf('?')<0?'?':'&')+'lesson='+l;}
  function lt(n){if(!LT)return null;for(var i=0;i<LT.length;i++)if(LT[i].stage===n)return LT[i];return null;}
  function stageTest(n){
    var r=lt(n),d=el('div','bkg'),tk=!!(r&&r.taken_at&&r.total);if(tk){d=el('a','bkg');d.href='account.html#journey';d.setAttribute('aria-label',T('Stage test'));d.style.cssText='text-decoration:none;color:inherit;display:block';}
    if(r&&r.taken_at&&r.total){var p=Math.round(100*r.score/r.total);
      d.innerHTML=(p>=90?medal('g',p):p>=80?medal('s',p):p>=70?medal('b',p):ash(p));
      var dt='';try{dt=new Date(r.taken_at).toLocaleDateString(undefined,{day:'numeric',month:'short'});}catch(e){}
      d.append(el('strong','','Stage test'),el('span','',dt));}
    else{d.innerHTML=ash(null);d.append(el('strong','','Stage test'));
      if(r&&!r.taken_at){var a=el('a','bktt','Take test');a.href='check.html?lt='+n;d.append(a);}else d.append(el('span','','—'));}
    return d;}
  function certOf(n){if(!CERTS)return null;for(var i=0;i<CERTS.length;i++)if(+CERTS[i].stage===n)return CERTS[i];return null;}
  function loadJs(u){return new Promise(function(ok,no){var s=document.createElement('script');s.src=u;s.onload=ok;s.onerror=no;document.head.append(s);});}
  function ribbon(row){var b=el('button','bkrib','\ud83c\udfc5 '+T('Certificate'));b.type='button';b.setAttribute('aria-label',T('Download certificate'));
    b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();if(b.disabled)return;b.disabled=true;var px=es?'../js/':'js/';
      Promise.resolve(window.QR||loadJs(px+'qr.js')).then(function(){return window.Certificate||loadJs(px+'certificate.js');})
        .then(function(){return Certificate.download({cert:row,lang:es?'es':'en',base:es?'../':''});}).catch(function(){}).then(function(){b.disabled=false;});});
    return b;}
  function render(still){
    var n=chosen,sk=skipped(n);box.textContent='';box.classList.add('bk');
    var top=el('div','bkn'),stk=el('div','bks'),rings=[],cv=new Image();cv.src=Covers.src(n,es);cv.alt=es?'Libro del Estudiante \u00b7 Etapa '+n:"Student's Book \u00b7 Stage "+n;cv.width=90;cv.height=128;cv.className='cvr bkcv';cv.decoding='async';var cw=cv,cr=certOf(n);if(cr){cw=el('div','bkcw');cw.append(cv,ribbon(cr));}top.append(cw);
    KINDS.forEach(function(a){var s=st(a.kind,n),d=el('a','bkg'),r=el('div','bkr'+(sk?' dash':'')),b=el('b','',sk?'—':'0%');r.append(b);d.append(r);
      d.href=href(a,n);d.setAttribute('aria-label',a.label);d.style.cssText='text-decoration:none;color:inherit;display:block';d.append(el('strong','',a.label));
      d.append(el('span','',sk?T('not done'):(s.avail?F('{0} of {1}',[s.done,s.avail]):'—')));stk.append(d);
      if(!sk&&s.avail)rings.push([d,Math.min(100,Math.round(100*s.done/s.avail)),COL[a.kind]]);});
    stk.append(stageTest(n));top.append(stk);
    var bt=el('div','bkb'),go=el('a','bkgo','Continue →');go.href=href(KINDS[0],n);bt.append(go);
    top.append(bt);
    if(sk)top.append(el('div','bknote','⏭ '+F('Skipped: you started at Stage {0}. You can still practise this book.',[startSt||real])));
    box.append(top);
    var sb=el('div','cstrip');
    sb.append(Covers.path({es:es,href:function(){return '#';},state:function(i){var open=ST[i-1][0]<=upto,s=st(KINDS[0].kind,i);return {cls:!open?'lock':(s.complete?'done':(i===real?'cur':'')),pct:s.total?100*s.done/s.total:0};}}));
    Array.prototype.forEach.call(sb.querySelectorAll('.cv-p'),function(p,i){var m=i+1;
      if(m===n)p.classList.add('sel');
      if(m<real&&skipped(m)){p.classList.add('bksk');p.append(el('span','bkskt',T('skipped')));}
      var a=p.querySelector('.cv-a');if(a)a.addEventListener('click',function(e){e.preventDefault();pick(m);});});
    box.append(sb);
    rings.forEach(function(r,i){fillRing(r[0],r[1],r[2],i*120,still);});
    if(window.I18N&&I18N.after)try{I18N.after();}catch(e){}
  }
  function pick(n){chosen=n;
    try{sessionStorage.setItem('bl-book',String(n));}catch(e){}
    try{localStorage.setItem(key,String(n));}catch(e){}
    render();if(o.onChange)o.onChange(n);}
  render();
  if(o.sb){try{o.sb.from('certificates').select('id,student_name,stage,hours,exam_pct,distinction,completed_on').then(function(r){CERTS=(r&&!r.error&&r.data)||[];if(CERTS.length)render(true);},function(){});}catch(e){}
  try{var q=o.sb.from('level_tests').select('stage,taken_at,score,total,passed');if(uid)q=q.eq('user_id',uid);
    q.then(function(r){LT=(r&&!r.error&&r.data)||[];render(true);},function(){});}catch(e){}}
  return {chosen:function(){return chosen;},real:real,hrefFor:function(a,n){return href(a,n||chosen);}};
}
window.Book={mount:mount};
})();
