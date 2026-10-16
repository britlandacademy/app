/* Britland Academy · Student's Book covers: headers, path, completion celebration */
(function(){
'use strict';
var STG=[[1,16],[17,32],[33,52],[53,72],[73,92],[93,112]];
var PER={ex:2,wb:4,check:1},MIN=0.7;
var COL=['#b3262b','#10273a','#e8b84a','#8f1f27','#c9a85a','#2b5a8a'];
function T(s){try{return window.I18N&&I18N.t?I18N.t(s):s;}catch(e){return s;}}
function stageOf(l){for(var i=0;i<STG.length;i++)if(l>=STG[i][0]&&l<=STG[i][1])return i+1;return 1;}
function src(n,es){return 'img/covers/es-'+n+'.png';}
function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}
function cover(n,w,es){var i=new Image();i.src=src(n,es);i.alt=es?'Libro del Estudiante · Etapa '+n:"Student's Book · Stage "+n;i.width=w||90;i.height=Math.round((w||90)*1.42);i.className='cv-img';i.decoding='async';return i;}
/* progress of a Stage from the attempts list, independent of loaded content */
function stats(att,kind,n,upto){
  var lo=STG[n-1][0],hi=STG[n-1][1],best={},cnt={},k,a,e,p,l;
  for(k=0;k<att.length;k++){a=att[k];l=a.l;if(l<lo||l>hi)continue;e=String(a.e);
    if(kind==='wb'){if(!/^wb/.test(e))continue;}
    else if(kind==='ex'){if(a.k==='check'||!/^l\d+e/.test(e))continue;}
    else{if(a.k&&a.k!=='check')continue;if(!/^c\d+$/.test(e))continue;}
    p=a.t?a.s/a.t:0;if(best[e]===undefined||p>best[e])best[e]=p;}
  var done=0,sum=0,total=PER[kind]*(hi-lo+1),byL={};
  for(e in best){var m=e.match(/\d+/);l=m?+m[0]:0;if(kind==='wb'){l=+(e.match(/^wb(\d+)/)||[0,0])[1];}
    (byL[l]=byL[l]||[]).push(best[e]);}
  for(l in byL){var arr=byL[l].sort(function(x,y){return y-x;}).slice(0,PER[kind]);done+=arr.length;arr.forEach(function(v){sum+=v;});}
  var avg=done?sum/done:0;
  var avail=upto?PER[kind]*Math.max(0,Math.min(hi,upto)-lo+1):total;
  return {done:done,total:total,avail:avail,avg:avg,complete:done>=total&&avg>=MIN};
}
/* header: cover + title + progress */
function head(o){
  var w=el('div','cv-head'),img=cover(o.n,84),box=el('div','cv-txt');
  box.append(el('b','',(o.title==='Exercises'||o.title==='Workbook'||o.title==='Lesson Checks')?T(o.title):o.title));
  if(o.total){var bar=el('div','cv-bar'),fill=el('i');fill.style.width=Math.round(100*o.done/o.total)+'%';bar.append(fill);box.append(bar);
    box.append(el('small','',T(o.done+' of '+o.total+' lessons completed')));}
  if(o.badge)box.append(el('em','cv-badge','✔ '+T(o.badge)));
  w.append(img,box);return w;
}
/* path of 12 covers */
function path(o){
  var w=el('div','cv-path'),i,b,s;
  for(i=1;i<=(o.es?6:12);i++){s=o.state(i);
    b=el('div','cv-p '+s.cls);b.append(cover(i,60,o.es));
    if(s.cls==='done'){b.append(el('span','cv-tick','✔'));}
    if(o.txt&&s.cls!=='lock'&&s.avail!=null){var t=el('div','cv-num'),pc=s.avail?Math.round(100*s.done/s.avail):0;
      var bb=el('b','');bb.append(el('i','',s.done+' / '+s.avail),document.createTextNode(' '),el('i','','('+pc+'%)'));t.append(bb);
      if(s.done&&s.acc!=null)t.append(el('span','',Math.round(s.acc*100)+'% '+T('correct')));b.append(t);}
    else if(s.pct!=null&&s.cls!=='lock'){var bar=el('div','cv-bar'),fl=el('i');fl.style.width=Math.round(s.pct)+'%';bar.append(fl);b.append(bar);}
    if(o.href&&s.cls!=='lock'){var a=el('a','cv-a');a.href=o.href(i);a.setAttribute('aria-label',(o.es?'Etapa ':'Stage ')+i);a.append(b.firstChild);b.insertBefore(a,b.firstChild);}
    w.append(b);}
  return w;
}
/* sound */
var actx=null;
function muted(){try{return localStorage.getItem('callan-mute')==='1';}catch(e){return false;}}
function chime(){
  if(muted())return;
  try{var C=window.AudioContext||window.webkitAudioContext;if(!C)return;actx=actx||new C();if(actx.state==='suspended')actx.resume();
    [523.25,659.25,783.99,1046.5].forEach(function(f,i){var o=actx.createOscillator(),g=actx.createGain(),t=actx.currentTime+i*.14;
      o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.22,t+.03);g.gain.exponentialRampToValueAtTime(.001,t+.9);
      o.connect(g);g.connect(actx.destination);o.start(t);o.stop(t+1);});}catch(e){}
}
/* celebration, first time only */
function key(o){return 'callan-cele-'+(o.uid||'x')+'-'+o.kind+'-'+o.n;}
function seen(o){try{return localStorage.getItem(key(o))==='1';}catch(e){return false;}}
function mark(o){try{localStorage.setItem(key(o),'1');}catch(e){}}
function celebrate(o){
  if(seen(o)||document.querySelector('.cv-ov'))return false;
  mark(o);
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ov=el('div','cv-ov'),card=el('div','cv-card');card.setAttribute('role','dialog');card.setAttribute('aria-modal','true');
  var kindT=o.kind,h=el('h2','',kindT+' · '+T('Stage '+o.n+' completed!'));h.id='cv-h';card.setAttribute('aria-labelledby','cv-h');
  var row=el('div','cv-row'),sh=el('div','cv-shine');sh.append(cover(o.n,130));row.append(sh);
  if(o.n<12&&o.canNext){row.append(el('span','cv-arrow','→'));var nx=el('div','cv-nx');nx.append(cover(o.n+1,100));row.append(nx);}
  var pct=Math.round(o.avg*100);
  var sub=el('p','cv-sub',o.kind==='Workbook'?T('Workbook: all sections done, average '+pct+'%.'):T('Lesson Checks: all checks done, average '+pct+'%.'));
  var act=el('div','cv-act'),go=el('button','cv-btn',o.n<12&&o.canNext?T('Go to Stage '+(o.n+1)+' →'):T('Continue'));
  go.type='button';
  function close(){document.removeEventListener('keydown',kd);ov.classList.add('out');setTimeout(function(){ov.remove();},250);}
  function kd(e){if(e.key==='Escape')close();}
  go.onclick=function(){if(o.n<12&&o.canNext&&o.next){close();o.next(o.n+1);}else close();};
  var sec=el('button','cv-sec',T('Close'));sec.type='button';sec.onclick=close;
  var snd=el('button','cv-snd',muted()?'🔇 '+T('Sound off'):'🔊 '+T('Sound on'));snd.type='button';
  snd.onclick=function(){try{localStorage.setItem('callan-mute',muted()?'0':'1');}catch(e){}snd.textContent=muted()?'🔇 '+T('Sound off'):'🔊 '+T('Sound on');if(!muted())chime();};
  act.append(go,sec);card.append(h,row,sub,act,snd);ov.append(card);document.body.append(ov);
  ov.addEventListener('click',function(e){if(e.target===ov)close();});document.addEventListener('keydown',kd);
  if(!reduce){var c=['#F5C542','#ffffff',COL[o.n-1],COL[o.n-1],'#F5C542'],i,p;
    for(i=0;i<90;i++){p=el('i','cv-conf');p.style.left=(Math.random()*100)+'vw';p.style.background=c[i%c.length];
      p.style.animationDelay=(Math.random()*1.2)+'s';p.style.animationDuration=(2.4+Math.random()*2)+'s';p.style.transform='rotate('+(Math.random()*360)+'deg)';
      p.style.width=(6+Math.random()*6)+'px';p.style.height=(8+Math.random()*8)+'px';ov.append(p);}}
  chime();
  setTimeout(function(){go.focus();},50);
  return true;
}
/* confetti burst on a fixed, click-through layer */
function confetti(n){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;if(reduce)return;
  var ov=el('div','cv-fx'),c=['#F5C542','#ffffff',COL[(n||1)-1],COL[(n||1)-1],'#F5C542'],i,p;
  for(i=0;i<80;i++){p=el('i','cv-conf');p.style.left=(Math.random()*100)+'vw';p.style.background=c[i%c.length];
    p.style.animationDelay=(Math.random()*1)+'s';p.style.animationDuration=(2.4+Math.random()*2)+'s';p.style.transform='rotate('+(Math.random()*360)+'deg)';
    p.style.width=(6+Math.random()*6)+'px';p.style.height=(8+Math.random()*8)+'px';ov.append(p);}
  document.body.append(ov);setTimeout(function(){ov.remove();},6000);
}
/* styles */
var css='.cv-num{margin-top:5px;font-size:.72rem;line-height:1.25;color:var(--muted,#a9b6ca)}.cv-num i{font-style:normal;display:inline-block}.cv-num b{display:block;color:var(--ink,#F2F5FA);font-weight:700}.cv-num span{display:block}.cv-a{display:block;line-height:0}.cv-a .cv-img{transition:transform .2s}.cv-a:hover .cv-img,.cv-a:focus-visible .cv-img{transform:translateY(-3px)}.cv-fx{position:fixed;inset:0;z-index:99990;pointer-events:none;overflow:hidden}.cv-head{display:flex;gap:16px;align-items:center;margin:0 0 14px}.cv-img{border-radius:4px;box-shadow:0 6px 16px rgba(0,0,0,.4);flex:none;height:auto}'+
'.cv-txt{display:flex;flex-direction:column;gap:3px;min-width:0}.cv-txt b{font:700 1.2rem BLSerif,Georgia,serif}.cv-txt span,.cv-txt small{color:var(--muted,#a9b6ca);font-size:.88rem}'+
'.cv-bar{height:6px;background:var(--line,#2a3f63);border-radius:9px;overflow:hidden;width:min(260px,100%);margin-top:4px}.cv-bar i{display:block;height:100%;background:#F5C542;border-radius:9px}'+
'.cv-badge{font-style:normal;font-size:.82rem;font-weight:700;color:#0B1B33;background:#F5C542;border-radius:99px;padding:2px 10px;align-self:flex-start;margin-top:4px}'+
'.cv-path{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px;margin:0 0 18px}@media(min-width:720px){.cv-path{grid-template-columns:repeat(12,minmax(0,1fr));gap:10px}}.cv-p{position:relative;text-align:center}.cv-p .cv-img{width:100%;height:auto}'+
'.cv-p.lock .cv-img{opacity:.28;filter:grayscale(1)}.cv-p.cur .cv-img{outline:3px solid #F5C542;outline-offset:2px}.cv-p .cv-bar{width:100%}'+
'.cv-tick{position:absolute;top:-6px;right:-4px;width:22px;height:22px;border-radius:50%;background:#F5C542;color:#0B1B33;font-weight:800;font-size:.8rem;display:grid;place-items:center;box-shadow:0 2px 6px rgba(0,0,0,.4)}'+
'.cv-ov{position:fixed;inset:0;z-index:99999;background:rgba(5,12,24,.82);display:grid;place-items:center;padding:18px;overflow:hidden;animation:cvin .3s ease}.cv-ov.out{opacity:0;transition:opacity .25s}'+
'.cv-card{position:relative;z-index:2;background:#102038;color:#F2F5FA;border:1px solid #2A3F63;border-radius:18px;padding:26px 24px;max-width:460px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.6);animation:cvpop .55s cubic-bezier(.2,1.3,.4,1)}'+
'.cv-card h2{font:700 1.5rem BLSerif,Georgia,serif;margin:0 0 14px;color:#fff}.cv-row{display:flex;align-items:center;justify-content:center;gap:18px;margin:0 0 14px}.cv-arrow{font-size:2rem;color:#F5C542}'+
'.cv-shine{position:relative;overflow:hidden;border-radius:5px;line-height:0;animation:cvlift 1.2s ease both}.cv-shine .cv-img{box-shadow:0 10px 26px rgba(0,0,0,.55)}.cv-shine::after{content:"";position:absolute;top:0;bottom:0;width:45%;left:-60%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.65),transparent);animation:cvsh 1.6s ease .4s 2}'+
'.cv-nx{opacity:.8;animation:cvfade .8s ease .6s both}.cv-sub{color:#A9B6CA;margin:0 0 16px}.cv-act{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}'+
'.cv-btn{background:#F5C542;color:#0B1B33;font-family:inherit;font-weight:700;font-size:1rem;border:0;border-radius:10px;padding:12px 20px;min-height:44px;cursor:pointer}.cv-sec,.cv-snd{background:transparent;color:#F2F5FA;border:2px solid #2A3F63;border-radius:10px;padding:10px 16px;min-height:44px;cursor:pointer;font:inherit}.cv-snd{margin-top:12px;border-color:transparent;font-size:.85rem;color:#A9B6CA}'+
'.cv-btn:focus-visible,.cv-sec:focus-visible,.cv-snd:focus-visible{outline:3px solid #fff;outline-offset:2px}'+
'.cv-conf{position:absolute;top:-20px;border-radius:2px;z-index:1;animation-name:cvfall;animation-timing-function:linear;animation-fill-mode:both}'+
'@keyframes cvfall{to{top:105vh;margin-left:60px;filter:hue-rotate(40deg)}}@keyframes cvin{from{opacity:0}}@keyframes cvpop{from{transform:scale(.7);opacity:0}}@keyframes cvlift{from{transform:translateY(24px) scale(.9)}}@keyframes cvsh{to{left:130%}}@keyframes cvfade{from{opacity:0;transform:translateX(-10px)}}'+
'@media(prefers-reduced-motion:reduce){.cv-ov,.cv-card,.cv-shine,.cv-shine::after,.cv-nx{animation:none!important}}';
var st=document.createElement('style');st.textContent=css;document.head.append(st);
window.Covers={STG:STG,stageOf:stageOf,src:src,cover:cover,stats:stats,head:head,path:path,celebrate:celebrate,confetti:confetti,seen:seen,chime:chime};
})();
