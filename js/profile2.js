/* Britland: My Profile 2.0 (shared by EN and ES). Adds a polaroid header, Journey and Mistakes tabs, weekly goal, 30-day calendar,
   medal hints, share image, ranking opt-out. Works on top of account.html (Gate.start is wrapped, nothing else is replaced). */
(function(){
'use strict';
if(!window.Gate||!Gate.start)return;
var $=function(id){return document.getElementById(id);};
function el(t,c,x){var n=document.createElement(t);if(c)n.className=c;if(x!==undefined&&x!==null)n.textContent=x;return n;}
function ap(p){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c)p.appendChild(typeof c==='string'?document.createTextNode(c):c);}return p;}
function svg(h,c){var d=document.createElement('div');d.innerHTML=h;var s=d.firstElementChild;if(c)s.setAttribute('class',c);return s;}
var ES=/\/espanol\//.test(location.pathname),LANG=(window.BL_COURSE&&BL_COURSE.uiLang)||(ES?'es':'en');
var STG=(window.BL_COURSE&&BL_COURSE.stages)||(ES?[[1,16],[17,32],[33,52],[53,72],[73,92],[93,112]]:[[1,12],[13,27],[28,44],[45,63],[64,82],[83,101],[102,120],[121,138],[139,156],[157,174],[175,190],[191,206]]);
STG=STG.filter(function(r){return r[0]<1000;});
function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function loc(){return {en:'en-GB',pt:'pt-BR',es:'es'}[(window.I18N&&I18N.lang)||LANG]||'en-GB';}
function norm(s){return String(s||'').toLowerCase().replace(/[.,!?;:"“”']/g,'').replace(/\s+/g,' ').trim();}
var IC={
 jr:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h5a3 3 0 0 0 0-6h-2a3 3 0 0 1 0-6h5"/></svg>',
 mi:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/></svg>',
 sh:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4M8 8l4-4 4 4M5 13v6h14v-6"/></svg>',
 dl:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 11l5 5 5-5M5 20h14"/></svg>'
};
var S={ctx:null,all:null,me:null,sb:null};
function loadAll(){
  if(S.all)return S.all;
  S.all=(async function(){var out=[],from=0;
    for(;;){var r=await S.sb.from('attempts').select('kind,lesson,ex,score,total,created_at').order('created_at',{ascending:true}).range(from,from+999);
      if(r.error)break;out=out.concat(r.data||[]);if((r.data||[]).length<1000)break;from+=1000;}
    return out;})();
  return S.all;
}
function stats(all){
  var days={},checks={};
  all.forEach(function(a){days[iso(new Date(a.created_at))]=(days[iso(new Date(a.created_at))]||0)+1;if(a.kind==='check')checks[a.lesson]=1;});
  var si=-1,per=STG.map(function(r,i){var n=0;for(var l=r[0];l<=r[1];l++)if(checks[l])n++;if(n)si=i;return {n:n,tot:r[1]-r[0]+1};});
  var cur=0,d0=new Date();if(!days[iso(d0)])d0.setDate(d0.getDate()-1);while(days[iso(d0)]){cur++;d0.setDate(d0.getDate()-1);}
  return {days:days,nd:Object.keys(days).length,checks:Object.keys(checks).length,per:per,si:Math.max(si,0),streak:cur,first:all.length?new Date(all[0].created_at):null};
}
/* ---------- header ---------- */
function header(st){
  var hero=$('hero');if(!hero||hero.getAttribute('data-p2'))return;hero.setAttribute('data-p2','1');hero.classList.add('p2h');
  var n=st.si+1,frame=n>=10?'gold':(n>=5?'silver':'cream');hero.setAttribute('data-frame',frame);
  var hi=hero.querySelector('.hi'),h2=$('hn');
  var k=el('span','p2k','My Profile');hi.insertBefore(k,h2);
  var seal=el('div','p2seal');seal.innerHTML='<small>STAGE</small><b>'+n+'</b>';hero.appendChild(seal);
  var since=st.first||(S.me&&S.me.created_at?new Date(S.me.created_at):null);
  if(since){var m=since.toLocaleDateString(loc(),{month:'short',year:'numeric'});var p=el('p','p2since');
    p.setAttribute('data-n',st.nd);p.textContent='Student since '+m;
    var sp=el('span','','· '+st.nd+' days of study');p.appendChild(document.createTextNode(' '));p.appendChild(sp);
    hi.insertBefore(p,$('hbar')||null);}
  var chg=$('chg');if(chg){chg.textContent='Change picture';chg.classList.add('p2chg');}
  var shr=el('button','btn p2share');shr.type='button';shr.innerHTML=IC.sh;shr.appendChild(el('span','','Share'));shr.onclick=function(){shareImg(st);};
  if(chg&&chg.parentNode)chg.parentNode.appendChild(shr);
}
/* ---------- share image ---------- */
function shareImg(st){
  var W=1080,H=1350,c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d');
  var g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#1b3270');g.addColorStop(1,'#0e1f4a');x.fillStyle=g;x.fillRect(0,0,W,H);
  x.strokeStyle='#c9a23a';x.lineWidth=10;x.strokeRect(36,36,W-72,H-72);
  x.textAlign='center';x.fillStyle='#f0cf6b';x.font='700 38px Georgia,serif';x.fillText('BRITLAND ACADEMY',W/2,150);
  x.fillStyle='#fff';x.font='700 84px Georgia,serif';x.fillText((S.me&&S.me.name||'').split(' ')[0]||'',W/2,430);
  x.fillStyle='#c5d0ea';x.font='400 42px Arial,sans-serif';x.fillText((ES?'Callan Español':'Callan English'),W/2,500);
  x.fillStyle='#c9a23a';x.beginPath();x.arc(W/2,700,130,0,7);x.fill();x.fillStyle='#f0cf6b';x.beginPath();x.arc(W/2,700,104,0,7);x.fill();
  x.fillStyle='#0e1f4a';x.font='700 34px Arial,sans-serif';x.fillText('STAGE',W/2,680);x.font='700 100px Georgia,serif';x.fillText(String(st.si+1),W/2,770);
  var rows=[[st.nd,'days of study'],[st.checks,'Lesson Checks'],[st.streak,'days in a row']];
  rows.forEach(function(r,i){var cx=W/2+(i-1)*320;x.fillStyle='#fff';x.font='700 90px Georgia,serif';x.fillText(String(r[0]),cx,1010);x.fillStyle='#c5d0ea';x.font='400 34px Arial,sans-serif';x.fillText(tr(r[1]),cx,1064);});
  x.fillStyle='#f0cf6b';x.font='700 40px Georgia,serif';x.fillText(tr('Keep going!'),W/2,1230);
  c.toBlob(function(b){if(!b)return;var f=new File([b],'britland.png',{type:'image/png'});
    if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'Britland Academy'}).catch(function(){});return;}
    var u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='britland.png';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u);},4000);},'image/png');
}
function tr(s){return(window.I18N&&I18N.ptx&&LANG==='pt')?I18N.ptx(s):s;}
/* ---------- tabs ---------- */
function tabs(){
  var tb=document.querySelector('.tabs');if(!tb||tb.getAttribute('data-p2'))return;tb.setAttribute('data-p2','1');
  var g=$('t-g');if(g){var sp=g.querySelector('span');if(sp)sp.textContent='Overview';}
  function mk(id,ic,label){var b=el('button');b.type='button';b.setAttribute('role','tab');b.id='t-'+id;b.setAttribute('aria-selected','false');b.innerHTML=ic;b.appendChild(el('span','',label));return b;}
  var j=mk('j',IC.jr,'Journey'),m=mk('m',IC.mi,'Mistakes');
  tb.insertBefore(m,$('t-p'));tb.insertBefore(j,m);
  var pg=$('p-g');
  var pj=el('section','card');pj.id='p-j';pj.hidden=true;pj.appendChild(el('div','')).id='j';
  var pm=el('section','card');pm.id='p-m';pm.hidden=true;pm.appendChild(el('div','')).id='m';
  pg.parentNode.insertBefore(pj,$('p-p'));pg.parentNode.insertBefore(pm,$('p-p'));
  var ids=['g','j','m','p','s'];
  tb.addEventListener('click',function(e){var b=e.target.closest('button[role=tab]');if(!b)return;var w=b.id.slice(2);
    ids.forEach(function(k){var p=$('p-'+k),t=$('t-'+k);if(p)p.hidden=k!==w;if(t)t.setAttribute('aria-selected',String(k===w));});
    if(w==='j')journey();if(w==='m')mistakes();});
}
/* ---------- overview: goal + 30-day calendar ---------- */
function overview(st){
  var box=$('p2o');if(!box){box=el('div','p2o');box.id='p2o';var g=$('g');g.parentNode.insertBefore(box,g);}
  box.textContent='';
  var goal=+(S.me&&S.me.weekly_goal)||5,now=new Date(),dow=(now.getDay()+6)%7,mon=new Date(now);mon.setDate(now.getDate()-dow);
  var done=0;for(var i=0;i<7;i++){var d=new Date(mon);d.setDate(mon.getDate()+i);if(st.days[iso(d)])done++;}
  var wrap=el('div','p2g');
  var R=30,C=2*Math.PI*R,v=Math.min(1,done/goal);
  wrap.appendChild(svg('<svg viewBox="0 0 80 80" role="img" aria-label="'+done+'/'+goal+'"><circle cx="40" cy="40" r="'+R+'" fill="none" stroke="var(--line)" stroke-width="9"/><circle cx="40" cy="40" r="'+R+'" fill="none" stroke="#c9a23a" stroke-width="9" stroke-linecap="round" stroke-dasharray="'+(C*v).toFixed(1)+' '+C.toFixed(1)+'" transform="rotate(-90 40 40)"/><text x="40" y="46" text-anchor="middle" class="p2rt">'+done+'/'+goal+'</text></svg>'));
  var tx=el('div','p2gt');tx.appendChild(el('h3','sec','Weekly goal'));
  var msg=done>=goal?'Goal reached this week!':'Study '+goal+' days a week.';tx.appendChild(el('p','hint',msg));
  var ch=el('div','choices p2goals');[3,5,7].forEach(function(n){var b=el('button','',n+' days');b.type='button';b.setAttribute('aria-pressed',String(n===goal));
    b.onclick=function(){S.sb.rpc('set_my_goal',{p_goal:n}).then(function(r){if(!r.error){S.me.weekly_goal=n;overview(st);}});};ch.appendChild(b);});
  tx.appendChild(ch);wrap.appendChild(tx);box.appendChild(wrap);
  box.appendChild(el('h3','sec','Last 30 days'));
  var cal=el('div','p2cal'),n30=0,mx=1;
  for(var k=29;k>=0;k--){var dd=new Date();dd.setDate(dd.getDate()-k);var c=st.days[iso(dd)]||0;if(c>mx)mx=c;}
  for(var k2=29;k2>=0;k2--){var d2=new Date();d2.setDate(d2.getDate()-k2);var cc=st.days[iso(d2)]||0;if(cc)n30++;
    var cell=el('i','p2c'+(cc?' on l'+(cc>mx*.66?3:cc>mx*.33?2:1):''));cell.title=d2.toLocaleDateString(loc(),{day:'numeric',month:'short'})+(cc?' · '+cc:'');
    cal.appendChild(cell);}
  box.appendChild(cal);box.appendChild(el('p','hint',n30+' days studied'));
}
/* ---------- overview extras (watch #g): remove weekly line chart, medal hints ---------- */
var HOW=[['First check','Finish your first Lesson Check'],['10 checks','Finish 10 Lesson Checks'],['Perfect score','Get 100% in a Lesson Check'],['7 days in a row','Study 7 days in a row'],['Stage finished','Finish every Lesson Check of a Stage'],['Workbook','Do your first Workbook section'],['50 exercises','Do 50 exercises'],['Top student','Keep a 90% average after 5 Lesson Checks']];
function tidy(){
  var g=$('g');if(!g)return;
  Array.prototype.slice.call(g.querySelectorAll('h3.sec')).forEach(function(h){
    var t=h.textContent;
    if(t==='Activity per week'||t==='Atividade por semana'||t==='Actividad por semana'){var nx=h.nextElementSibling;if(nx&&nx.classList.contains('chart'))nx.remove();h.remove();}
  });
  var md=g.querySelector('.medals');
  if(md&&!md.getAttribute('data-p2')){md.setAttribute('data-p2','1');
    var d=el('details','p2how');d.appendChild(el('summary','','How to earn medals'));
    HOW.forEach(function(h){var p=el('p','hint');var b=el('b','',h[0]);p.appendChild(b);p.appendChild(document.createTextNode(' — '));p.appendChild(el('span','',h[1]));d.appendChild(p);});
    md.parentNode.insertBefore(d,md.nextSibling);
  }
}
/* ---------- journey ---------- */
async function journey(){
  var box=$('j');if(box.getAttribute('data-done'))return;box.setAttribute('data-done','1');
  var all=await loadAll(),st=stats(all),up=(S.ctx&&S.ctx.upto)||0;
  box.textContent='';box.appendChild(el('h2','','My Journey'));box.appendChild(el('p','hint','Your Stages, one by one.'));
  var certs={};try{var r=await S.sb.from('certificates').select('id,student_name,stage,hours,exam_pct,distinction,completed_on').order('stage');((r&&r.data)||[]).forEach(function(x){certs[x.stage]=x;});}catch(e){}
  var ol=el('ol','p2tl');
  STG.forEach(function(r,i){
    var p=st.per[i],full=p.n>=p.tot,locked=r[0]>up&&!p.n,cur=!full&&!locked&&(i===st.si||(!p.n&&r[0]<=up&&(i===0||st.per[i-1].n>=st.per[i-1].tot)));
    var li=el('li',full?'done':(cur?'cur':(locked?'lock':'')));
    li.appendChild(el('span','p2n',full?'✓':String(i+1)));
    var b=el('div','p2b');b.appendChild(el('b','','Stage '+(i+1)));
    var bar=el('div','bar');bar.appendChild(el('i'));bar.firstChild.style.width=Math.round(p.n/p.tot*100)+'%';b.appendChild(bar);
    b.appendChild(el('small','',p.n+' / '+p.tot));li.appendChild(b);
    if(full||certs[i+1]){var c=certs[i+1],bt=el('button','p2dl');bt.type='button';bt.innerHTML=IC.dl;
      bt.setAttribute('aria-label',c?'Download certificate':'Certificate not available yet');
      if(!c||!window.Certificate){bt.disabled=true;bt.title='Available after your teacher approves it';}
      else bt.onclick=async function(){bt.disabled=true;try{await Certificate.download({cert:c,lang:ES?'es':'en',base:''});}catch(e){}bt.disabled=false;};
      li.appendChild(bt);}
    ol.appendChild(li);});
  box.appendChild(ol);
  /* tips history */
  try{var tr2=await S.sb.from('weekly_tips').select('id,week_start,body,rating').order('week_start',{ascending:false}).limit(8);
    var rows=(tr2&&tr2.data)||[];
    if(rows.length){box.appendChild(el('h3','sec','Weekly tips history'));
      rows.forEach(function(t){var d=el('details','p2tip');var s=el('summary','',new Date(t.week_start+'T12:00:00').toLocaleDateString(loc(),{day:'numeric',month:'short'}));
        if(t.rating===1){var hb=el('span','p2helpful','Helpful');s.appendChild(document.createTextNode(' '));s.appendChild(hb);}
        d.appendChild(s);var bd=t.body||{};d.appendChild(el('p','',bd.praise||''));
        (bd.fixes||[]).forEach(function(f){var p=el('p','hint');p.appendChild(el('b','',f.t||''));p.appendChild(document.createTextNode(' — '+(f.d||'')));d.appendChild(p);});
        box.appendChild(d);});}}catch(e){}
}
/* ---------- mistakes ---------- */
async function mistakes(){
  var box=$('m');if(box.getAttribute('data-done'))return;box.setAttribute('data-done','1');
  box.textContent='';box.appendChild(el('h2','','Where you miss most'));
  var r;try{r=await S.sb.from('attempt_errors').select('kind,lesson,ex,item,given,expected,created_at').order('created_at',{ascending:false}).limit(400);}catch(e){r=null;}
  var rows=(r&&r.data)||[];
  if(!rows.length){box.appendChild(el('p','hint','No mistakes saved yet. Keep practising!'));return;}
  var by={};rows.forEach(function(x){var k=x.kind+'|'+x.lesson;(by[k]||(by[k]={kind:x.kind,lesson:x.lesson,n:0}));by[k].n++;});
  var top=Object.keys(by).map(function(k){return by[k];}).sort(function(a,b){return b.n-a.n;}).slice(0,6),mx=top[0].n;
  top.forEach(function(t){
    var row=el('div','sp'),nm=t.kind==='check'?'Lesson Check':'Exercises';
    var lab=el('span','',nm);row.appendChild(lab);
    var bar=el('div','bar');bar.appendChild(el('i'));bar.firstChild.style.width=Math.round(t.n/mx*100)+'%';row.appendChild(bar);
    row.appendChild(el('span','','L'+(t.lesson>1000?t.lesson-1000:t.lesson)));
    var a=el('a','btn p2redo','Redo');a.href=(t.kind==='check'?'check.html':'exercises.html')+'?lesson='+t.lesson;row.appendChild(a);box.appendChild(row);});
  /* drill */
  var seen={},pool=[];rows.forEach(function(x){var k=norm(x.item)+'|'+norm(x.expected);if(x.item&&x.expected&&!seen[k]){seen[k]=1;pool.push(x);}});pool=pool.slice(0,10);
  if(pool.length){var go=el('button','p2drill','Redo only these ('+pool.length+')');go.type='button';box.appendChild(go);
    var dr=el('div','p2dr');dr.hidden=true;box.appendChild(dr);
    go.onclick=function(){go.hidden=true;dr.hidden=false;var i=0,ok=0;
      (function next(){dr.textContent='';
        if(i>=pool.length){dr.appendChild(el('h3','','Done!'));dr.appendChild(el('p','',ok+' / '+pool.length));var b=el('button','btn','Close');b.type='button';b.onclick=function(){dr.hidden=true;go.hidden=false;};dr.appendChild(b);return;}
        var q=pool[i];dr.appendChild(el('p','hint',(i+1)+' / '+pool.length));dr.appendChild(el('p','p2q',q.item));
        var inp=el('input');inp.type='text';inp.autocomplete='off';inp.setAttribute('aria-label','Your answer');dr.appendChild(inp);
        var res=el('p','msg');var chk=el('button','','Check');chk.type='button';
        chk.onclick=function(){if(chk.getAttribute('data-d')){i++;next();return;}
          var good=norm(inp.value)===norm(q.expected);if(good)ok++;res.className='msg '+(good?'ok':'bad');res.textContent=good?'Correct!':'Correct answer: '+q.expected;chk.textContent='Next';chk.setAttribute('data-d','1');inp.disabled=true;};
        inp.addEventListener('keydown',function(e){if(e.key==='Enter')chk.click();});
        dr.appendChild(chk);dr.appendChild(res);inp.focus();})();};}
  box.appendChild(el('h3','sec','Recent mistakes'));
  rows.slice(0,12).forEach(function(x){var d=el('div','p2err');d.appendChild(el('b','',x.item||''));var p=el('p','');p.appendChild(el('span','bad',x.given||'—'));p.appendChild(document.createTextNode('  →  '));p.appendChild(el('span','ok',x.expected||''));d.appendChild(p);box.appendChild(d);});
}
/* ---------- settings ---------- */
function settings(){
  var s=$('p-s');if(!s||s.getAttribute('data-p2'))return;s.setAttribute('data-p2','1');
  function sw(label,on,fn,hint){var w=el('div','p2sw');var t=el('div');t.appendChild(el('b','',label));if(hint)t.appendChild(el('small','',hint));w.appendChild(t);
    var b=el('button','g-sw'+(on?' on':''));b.type='button';b.setAttribute('role','switch');b.setAttribute('aria-checked',String(!!on));b.setAttribute('aria-label',label);b.appendChild(el('i'));
    b.onclick=function(){on=!on;b.classList.toggle('on',on);b.setAttribute('aria-checked',String(on));fn(on);};w.appendChild(b);return w;}
  var h=el('h3','','Privacy and effects');s.insertBefore(h,s.children[1]);
  var ranking=sw('Show me in the class ranking',!(S.me&&S.me.show_in_ranking===false),function(v){S.sb.rpc('set_my_ranking',{p_show:v});},'Other students can see your first name and streak.');
  var fx=sw('Animations and sounds',window.BLFX?BLFX.on():true,function(v){if(window.BLFX)BLFX.set(v);});
  s.insertBefore(fx,h.nextSibling);s.insertBefore(ranking,h.nextSibling);
}
/* ---------- boot ---------- */
var st0=Gate.start;
Gate.start=function(o,cb){return st0.call(Gate,o,function(ctx){
  var r,err=null;try{r=cb(ctx);}catch(e){err=e;}
  try{S.ctx=ctx;S.sb=Gate.sb;S.me=ctx.profile||{};tabs();settings();
    loadAll().then(function(all){var st=stats(all);header(st);overview(st);tidy();
      var g=$('g');if(g&&window.MutationObserver){var t=null;new MutationObserver(function(){clearTimeout(t);t=setTimeout(tidy,60);}).observe(g,{childList:true,subtree:true});}
      var hs=$('hs');if(hs&&ES)hs.textContent=hs.textContent;});
  }catch(e){}
  if(err)throw err;
  return r;});};
})();
