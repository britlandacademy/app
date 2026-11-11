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
    var sp=el('span','','· '+st.nd+(st.nd===1?' day of study':' days of study'));p.appendChild(document.createTextNode(' '));p.appendChild(sp);
    hi.insertBefore(p,$('hbar')||null);}
  var chg=$('chg');if(chg){chg.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';chg.appendChild(el('span','','Change picture'));chg.classList.add('p2chg');}
  var shr=el('button','btn p2share');shr.type='button';shr.innerHTML=IC.sh;shr.appendChild(el('span','','Share'));shr.onclick=function(){shareImg(st);};
  if(chg&&chg.parentNode){chg.parentNode.classList.add('p2btns');chg.parentNode.appendChild(shr);}
}
/* ---------- share image ---------- */
function shareImg(st){
  var W=1080,H=1350,L=(LANG==='pt'||LANG==='es')?LANG:'en';
  var TX={en:{rank:'RANKING',pts:'ACHIEVEMENT SCORE',gm:'GAME MODE',lvl:'Level',stage:'Stage',of:'of',med:'medals'},pt:{rank:'RANKING',pts:'PONTUAÇÃO DE CONQUISTAS',gm:'MODO JOGO',lvl:'Nível',stage:'Stage',of:'de',med:'medalhas'},es:{rank:'RANKING',pts:'PUNTOS DE LOGROS',gm:'MODO JUEGO',lvl:'Nivel',stage:'Etapa',of:'de',med:'medallas'}}[L];
  var PT={b:10,s:25,g:50},TO={g:3,s:2,b:1};
  function img(src){return new Promise(function(ok){var i=new Image();i.onload=function(){ok(i);};i.onerror=function(){ok(null);};i.src=src;});}
  function medImg(id){try{var sv=window.Medals&&Medals.svg&&Medals.svg(id),d=document.getElementById('mddefs');if(!sv||!d)return Promise.resolve(null);
    var defs=d.innerHTML.replace(/^<defs>|<\/defs>$/g,''),x=sv.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="200" height="216" ').replace(/^(<svg[^>]*>)/,'$1<defs>'+defs+'</defs>');
    return img('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(x));}catch(e){return Promise.resolve(null);}}
  var uid=S.me&&S.me.id,pr=(S.sb&&uid)?S.sb.rpc('public_profile',{p_uid:uid}).then(function(r){return (r&&r.data)||null;},function(){return null;}):Promise.resolve(null);
  Promise.all([pr,img((ES?'../':'')+'img/britland-shield.png')]).then(function(r){
    var d=r[0]||{},logo=r[1],cat=(window.Medals&&Medals.cat)||[],byId={};cat.forEach(function(m){byId[m.id]=m;});
    var ms=(d.medals||[]).filter(function(m){return byId[m.id];}),mp=0;ms.forEach(function(m){mp+=PT[m.tier]||0;});
    var top=ms.slice().sort(function(p,q){return (TO[q.tier]||0)-(TO[p.tier]||0)||(p.at<q.at?1:-1);}).slice(0,3);
    return Promise.all(top.map(function(m){return medImg(m.id);})).then(function(mi){draw(d,logo,ms,mp,mi);});
  });
  function draw(d,logo,ms,mp,mi){
    var c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d'),SER='Georgia,serif',SAN='system-ui,-apple-system,Segoe UI,Arial,sans-serif';
    function ls(v){try{x.letterSpacing=v+'px';}catch(e){}}
    function rr(px,py,w,h,r){x.beginPath();x.moveTo(px+r,py);x.arcTo(px+w,py,px+w,py+h,r);x.arcTo(px+w,py+h,px,py+h,r);x.arcTo(px,py+h,px,py,r);x.arcTo(px,py,px+w,py,r);x.closePath();}
    var g=x.createLinearGradient(0,0,W*.4,H);g.addColorStop(0,'#10224f');g.addColorStop(.7,'#0a1536');x.fillStyle=g;x.fillRect(0,0,W,H);
    var gl=x.createRadialGradient(W*.85,H*.06,0,W*.85,H*.06,W*.5);gl.addColorStop(0,'rgba(230,197,106,.2)');gl.addColorStop(1,'rgba(230,197,106,0)');x.fillStyle=gl;x.fillRect(0,0,W,H);
    var lw=0;if(logo){lw=168;var lh=lw*logo.naturalHeight/logo.naturalWidth;x.drawImage(logo,64,60,lw,lh);}
    x.textAlign='left';x.textBaseline='alphabetic';x.fillStyle='#f0cf6b';x.font='700 52px '+SER;ls(8);x.fillText('BRITLAND',lw?260:64,135);
    x.fillStyle='#e0576b';x.font='400 26px '+SAN;ls(16);x.fillText('ACADEMY',lw?262:66,178);
    if(d.rank){x.textAlign='right';x.fillStyle='#f0cf6b';x.font='700 20px '+SAN;ls(6);x.fillText(TX.rank,W-64,110);x.fillStyle='#fff';x.font='700 60px '+SER;ls(0);x.fillText('#'+d.rank,W-64,174);}
    x.textAlign='left';ls(0);x.fillStyle='#fff';x.font='700 92px '+SER;var nm=((S.me&&S.me.name)||'').split(' ')[0]||'';x.fillText(nm,64,340);
    x.fillStyle='#a9b8de';x.font='400 30px '+SAN;x.fillText(TX.stage+' '+(st.si+1),64,392);
    /* score card */
    var y0=452,sg=x.createLinearGradient(64,y0,1016,y0+300);sg.addColorStop(0,'#2a4a9c');sg.addColorStop(1,'#16295a');rr(64,y0,952,296,32);x.fillStyle=sg;x.fill();x.strokeStyle='rgba(230,197,106,.35)';x.lineWidth=2;x.stroke();
    x.fillStyle='#a9b8de';x.font='700 20px '+SAN;ls(6);x.fillText(TX.pts,102,y0+58);ls(0);
    x.strokeStyle='#f0cf6b';x.lineWidth=8;x.beginPath();x.arc(150,y0+148,46,0,7);x.stroke();x.fillStyle='#f0cf6b';x.font='700 56px '+SER;x.textAlign='center';x.fillText('G',150,y0+168);
    x.textAlign='left';x.font='700 116px '+SER;x.fillText(String(mp),224,y0+178);
    x.textAlign='right';x.fillStyle='#a9b8de';x.font='400 28px '+SAN;x.fillText(ms.length+' '+TX.of+' '+((window.Medals&&Medals.cat&&Medals.cat.length)||69)+' '+TX.med,W-102,y0+160);
    rr(102,y0+232,876,14,7);x.fillStyle='#26376a';x.fill();var tot=((window.Medals&&Medals.cat&&Medals.cat.length)||69),pw=Math.max(14,876*ms.length/tot);rr(102,y0+232,pw,14,7);var bg=x.createLinearGradient(102,0,978,0);bg.addColorStop(0,'#a67c1a');bg.addColorStop(1,'#e6c56a');x.fillStyle=bg;x.fill();
    var yy=y0+296+22;
    /* game mode card */
    if(d.xp>0){var l=1;while(d.xp>=l*(l+1)*25)l++;rr(64,yy,952,190,32);x.fillStyle='#16295a';x.fill();x.strokeStyle='#26376a';x.lineWidth=2;x.stroke();
      x.textAlign='left';x.fillStyle='#a9b8de';x.font='700 20px '+SAN;ls(6);x.fillText(TX.gm,102,yy+54);ls(0);
      var pt=TX.lvl+' '+l;x.font='400 24px '+SAN;var pw2=x.measureText(pt).width+40;rr(W-102-pw2,yy+24,pw2,44,22);x.fillStyle='#0a1330';x.fill();x.strokeStyle='#26376a';x.stroke();x.fillStyle='#e9edf7';x.textAlign='center';x.fillText(pt,W-102-pw2/2,yy+54);
      x.textAlign='left';x.fillStyle='#7fd1ff';x.font='700 72px '+SER;x.fillText(d.xp.toLocaleString(L==='es'?'es-ES':L==='pt'?'pt-BR':'en-US')+' XP',102,yy+142);yy+=190+30;}
    else yy+=10;
    /* medals */
    var n=mi.length,mw=156,mh=168,gap=36,sx=(W-(n*mw+(n-1)*gap))/2,my=yy+6;
    mi.forEach(function(im,i){if(im)x.drawImage(im,sx+i*(mw+gap),my,mw,mh);});
    /* stats */
    var rows=[[st.nd,st.nd===1?'day of study':'days of study'],[st.checks,'Lesson Checks'],[st.streak,st.streak===1?'day in a row':'days in a row']];x.textAlign='center';
    rows.forEach(function(r,i){var cx=W/2+(i-1)*320;x.fillStyle='#fff';x.font='700 64px '+SER;x.fillText(String(r[0]),cx,1236);x.fillStyle='#a9b8de';x.font='400 28px '+SAN;x.fillText(tr(r[1]),cx,1282);});
    c.toBlob(function(b){if(!b)return;var f=new File([b],'britland.png',{type:'image/png'});
      if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'Britland Academy'}).catch(function(){});return;}
      var u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='britland.png';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u);},4000);},'image/png');
  }
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
  /* month calendar (Mon-first): studied days in gold, today ringed */
  var mc=el('div','p2m'),mh=el('div','p2mh'),ym=new Date(now.getFullYear(),now.getMonth(),1),nd=new Date(now.getFullYear(),now.getMonth()+1,0).getDate(),nm=0;
  for(var q=1;q<=nd;q++){if(st.days[iso(new Date(now.getFullYear(),now.getMonth(),q))])nm++;}
  var mname=ym.toLocaleDateString(loc(),{month:'long'});mname=mname.charAt(0).toUpperCase()+mname.slice(1);
  mh.appendChild(el('h3','sec',mname));mh.appendChild(el('span','p2mn',nm+(nm===1?' day studied':' days studied')));mc.appendChild(mh);
  var cal=el('div','p2cal'),wd0=new Date(2024,0,1);
  for(var w=0;w<7;w++){var wdd=new Date(wd0);wdd.setDate(1+w);cal.appendChild(el('span','p2wd',wdd.toLocaleDateString(loc(),{weekday:'narrow'})));}
  for(var e0=0;e0<(ym.getDay()+6)%7;e0++)cal.appendChild(el('i','p2c e'));
  for(var dn=1;dn<=nd;dn++){var dd=new Date(now.getFullYear(),now.getMonth(),dn),cc=st.days[iso(dd)]||0,fut=dd>now&&iso(dd)!==iso(now);
    var cell=el('i','p2c'+(cc?' on':'')+(iso(dd)===iso(now)?' td':'')+(fut?' fut':''),String(dn));cell.title=dd.toLocaleDateString(loc(),{day:'numeric',month:'short'})+(cc?' · '+cc:'');cal.appendChild(cell);}
  mc.appendChild(cal);box.appendChild(mc);
  /* weekly goal */
  var tx=el('div','p2gt');tx.appendChild(el('h3','sec','Weekly goal'));
  var msg=done>=goal?'Goal reached this week!':'Study '+goal+' days a week \u00b7 '+done+'/'+goal;tx.appendChild(el('p','hint',msg));
  var ch=el('div','choices p2goals');[3,5,7].forEach(function(n){var b=el('button','',n+' days');b.type='button';b.setAttribute('aria-pressed',String(n===goal));
    b.onclick=function(){S.sb.rpc('set_my_goal',{p_goal:n}).then(function(r){if(!r.error){S.me.weekly_goal=n;overview(st);}});};ch.appendChild(b);});
  tx.appendChild(ch);box.appendChild(tx);
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
