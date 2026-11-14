/* Britland: "Exercícios recomendados para você" on the Home.
   Reads this student's row of plan_progress (filled from the "Planos de Aula" sheet by plan-sync) and the
   student's own attempts. Plan.mount(ctx, {es:true|false}) -> adds the section after the welcome line. */
(function(){
'use strict';
var T={
  pt:{cdIn:'Faltam ',cdNow:'Começa em ',cdOn:'Sua aula começou',cdGo:'Entrar na aula',rsBtn:'Precisa remarcar?',rsQ:'Tem certeza que deseja remarcar essa aula?',rsNote:'Você vai escolher um novo horário e o professor precisa aprovar.',rsYes:'Sim, remarcar',rsNo:'Não, manter a aula',next:'Próxima aula',imp:'Importante',prep:'Prepare-se para a aula nº ',lastw:'Última palavra estudada:',rev:'Revisão das palavras ',nw:' e novas palavras ',again2:'toque para refazer',conv:'Aula de Conversation. Aproveite para praticar a fala!',miss:'Você faltou à aula nº ',missc:'Você faltou à aula de Conversation nº ',missr:'. Revise as palavras ',missl:' e ouça o Listening da Lição ',missx:'Aula perdida',act:'Atividade da aula: ',will:'Haverá ',dict:'ditado',read:'leitura',quiz:'Lesson Check',listen:'Listening · Lição ',again:'Ouça de novo antes da aula',
    rec:'Exercícios recomendados para você',lesson:'Lição ',lc:'Lesson Check · Lição ',gr:'Grammar · Lição ',wb:'Workbook · Lição ',done:'feito',doneL:'Concluído',recd:'Recomendado',
    all:'Tudo em dia! 🎉',allp:'Você fez todos os exercícios da Lição ',allp2:'. Parabéns pela dedicação!',redo:'Refazer o Lesson Check →',n:' de ',ex:' exercícios feitos',play:'Ouvir',pause:'Pausar'},
  es:{cdIn:'Faltan ',cdNow:'Empieza en ',cdOn:'Tu clase ha empezado',cdGo:'Entrar en la clase',rsBtn:'¿Necesitas reprogramar?',rsQ:'¿Seguro que quieres reprogramar esta clase?',rsNote:'Vas a elegir un nuevo horario y el profesor debe aprobarlo.',rsYes:'Sí, reprogramar',rsNo:'No, mantener la clase',next:'Próxima clase',imp:'Importante',prep:'Prepárate para la clase n.º ',lastw:'Última palabra estudiada:',rev:'Repaso de las palabras ',nw:' y palabras nuevas ',again2:'toca para repetir',conv:'Clase de conversación. ¡Aprovecha para practicar el habla!',miss:'Faltaste a la clase n.º ',missc:'Faltaste a la clase de conversación n.º ',missr:'. Repasa las palabras ',missl:' y escucha el Listening de la Lección ',missx:'Clase perdida',act:'Actividad de la clase: ',will:'Habrá ',dict:'dictado',read:'lectura',quiz:'Lesson Check',listen:'Listening · Lección ',again:'Escúchalo de nuevo antes de la clase',
    rec:'Ejercicios recomendados para ti',lesson:'Lección ',lc:'Lesson Check · Lección ',gr:'Gramática · Lección ',wb:'Workbook · Lección ',done:'hecho',doneL:'Completado',recd:'Recomendado',
    all:'¡Todo al día! 🎉',allp:'Has hecho todos los ejercicios de la Lección ',allp2:'. ¡Felicidades por tu dedicación!',redo:'Repetir el Lesson Check →',n:' de ',ex:' ejercicios hechos',play:'Escuchar',pause:'Pausar'}
};
function el(t,a,c){var e=document.createElement(t),k;a=a||{};for(k in a){if(k==='text')e.textContent=a[k];else if(k==='style')e.style.cssText=a[k];else e.setAttribute(k,a[k]);}
  (c||[]).forEach(function(x){if(x)e.append(x);});return e;}
var CSS='#plan{margin:0 0 16px;display:grid;gap:14px}#plan .pc{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 18px}#plan .pc small{color:var(--hl);letter-spacing:.14em;text-transform:uppercase;font-weight:700;font-size:.75rem}#plan h2{font-size:1.1rem;margin:4px 0}#plan .pm{color:var(--muted);font-size:.9rem;margin:0}'
+'#plan .imp{border:2px solid var(--hl);box-shadow:0 0 0 4px rgba(245,197,66,.14),0 8px 24px rgba(245,197,66,.12)}#plan .pr{display:flex;align-items:center;gap:14px}#plan .bd{background:var(--hl);color:var(--hli);font-size:.7rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border-radius:99px;padding:2px 10px;margin-left:auto}'
+'#plan .wd{background:var(--chip);border:1px solid var(--hl);color:var(--hl);border-radius:99px;padding:2px 12px;font-weight:700}#plan .li{padding:12px 0;border-top:1px solid var(--line);color:var(--ink);text-decoration:none;min-height:44px}#plan .li b{display:block}#plan .li span.s{color:var(--muted);font-size:.8rem}'
+'#plan .bx{font-size:1.3rem;flex:none;color:var(--muted)}#plan .li.ok .bx{color:var(--hl)}#plan .tg{margin-left:auto;font-size:.72rem;background:var(--chip);border-radius:20px;padding:2px 10px;color:var(--muted)}#plan .go{margin-left:auto;color:var(--hl);font-style:normal;font-size:1.2rem}'
+'#plan .pl{background:var(--chip);border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin-top:14px}#plan .pl button{flex:none;width:44px;height:44px;border-radius:99px;border:0;background:#c9a13b;color:#1a1405;font-size:1.1rem;box-shadow:0 3px 0 #8a6a14;cursor:pointer}#plan .pl button:active{transform:translateY(3px);box-shadow:none}'
+'#plan .tr{height:6px;background:var(--line);border-radius:9px;margin-top:6px;overflow:hidden}#plan .tr div{height:100%;width:0;background:var(--hl)}#plan .full{display:flex;justify-content:center;margin-top:12px}'
+'#plan .cdf{margin-top:14px;padding-top:12px;border-top:1px solid var(--line);color:var(--muted);font-size:.9rem;display:flex;flex-direction:column;gap:12px}#plan .cdf b{color:var(--hl);font-size:1.05rem}#plan .cdf.soon b{text-shadow:0 0 10px rgba(245,197,66,.7)}'
+'.bl-pill{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;box-sizing:border-box;min-height:54px;border:0;border-radius:999px;font:800 .95rem/1 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;cursor:pointer;padding:0 18px;transition:transform .08s,box-shadow .08s}.bl-pill:active{transform:translateY(4px);box-shadow:0 0 0 transparent!important}.bl-pill[hidden]{display:none!important}'
+'.bl-red{background:#d6453b;color:#fff;box-shadow:0 4px 0 #8f2620}.bl-gold{background:#c9a13b;color:#1a1405;box-shadow:0 4px 0 #8a6a14,0 0 18px rgba(201,161,59,.45);animation:blglow 2.4s ease-in-out infinite}.bl-gold svg{flex:none}@keyframes blglow{50%{box-shadow:0 4px 0 #8a6a14,0 0 28px rgba(228,192,106,.8)}}@media(prefers-reduced-motion:reduce){.bl-gold{animation:none}}'
+'.bl-sh{position:fixed;inset:0;z-index:2147482000;background:rgba(0,0,0,.6);display:flex;align-items:flex-end;justify-content:center}.bl-shb{width:100%;max-width:560px;box-sizing:border-box;background:var(--card,#10224a);color:var(--ink,#f3f4f6);border-radius:24px 24px 0 0;border-top:2px solid #c9a13b;padding:24px 18px max(24px,env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:14px;text-align:center}.bl-shb h3{margin:0;font:700 1.3rem/1.25 BLSerif,Georgia,serif;text-wrap:balance}.bl-shb .when{color:#c9a13b;font:700 1.15rem BLSerif,Georgia,serif}.bl-shb p{margin:0;color:var(--muted,inherit);font-size:.9rem;line-height:1.4}';
var ZOOM='https://us06web.zoom.us/j/2447679341';
/* Countdown strip at the foot of the "next class" card. Line 1: countdown. Line 2 (full width): red pill "needs to reschedule?" while there is more than 1 hour left, gold "join class" pill from 1 hour before until 1 hour after the start. */
var VID='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="6" width="13" height="12" rx="3"/><path d="M15.5 10.5l6-3.5v10l-6-3.5"/></svg>';
function cap(x){return x.charAt(0).toUpperCase()+x.slice(1);}
function whenLong(t,loc){try{var d=new Date(t),f=function(o){return new Intl.DateTimeFormat(loc,o).format(d).replace('.','');};return cap(f({weekday:'short'}))+', '+f({day:'numeric'})+' '+f({month:'short'})+' · '+new Intl.DateTimeFormat(loc,{hour:'2-digit',minute:'2-digit',hour12:false}).format(d);}catch(e){return new Date(t).toLocaleString();}}
function confirmSheet(L10,t0,loc,onYes){
  var bk=el('div',{class:'bl-sh',role:'dialog','aria-modal':'true','aria-label':L10.rsQ}),bx=el('div',{class:'bl-shb'});
  var yes=el('button',{type:'button',class:'bl-pill bl-red',text:L10.rsYes}),no=el('button',{type:'button',class:'bl-pill bl-gold',text:L10.rsNo});
  no.style.animation='none';
  function shut(){if(bk.parentNode)bk.parentNode.removeChild(bk);document.removeEventListener('keydown',kd);}
  function kd(e){if(e.key==='Escape')shut();}
  yes.onclick=function(){shut();onYes();};no.onclick=shut;bk.onclick=function(e){if(e.target===bk)shut();};
  bx.append(el('h3',{text:L10.rsQ}),el('div',{class:'when',text:whenLong(t0,loc)}),el('p',{text:L10.rsNote}),yes,no);
  bk.append(bx);document.body.append(bk);document.addEventListener('keydown',kd);no.focus();
}
function countdown(card,L10,es,uid){
  Gate.sb.from('lessons').select('id,title,start_at,end_at,is_group').eq('user_id',uid).gte('end_at',new Date().toISOString()).order('start_at').limit(1).then(function(r){
    var row=r&&r.data&&r.data[0];if(!row)return;
    var t0=new Date(row.start_at).getTime(),t1=new Date(row.end_at).getTime();if(!(t0>0))return;
    var loc=es?'es':'pt-BR',when;
    try{when=new Date(t0).toLocaleString(loc,{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});}catch(e){when=new Date(t0).toLocaleString();}
    var f=el('div',{class:'cdf'}),sp=el('span'),
      go=el('a',{class:'bl-pill bl-gold',href:ZOOM,target:'_blank',rel:'noopener'}),
      rs=el('button',{type:'button',class:'bl-pill bl-red',text:L10.rsBtn});
    go.innerHTML=VID;go.append(el('span',{text:L10.cdGo}));go.hidden=true;rs.hidden=true;
    f.append(sp,rs,go);card.append(f);
    var canRs=!row.is_group;
    if(canRs&&t0-Date.now()>3600000){
      Gate.sb.from('lesson_requests').select('id').eq('user_id',uid).eq('lesson_id',row.id).eq('status','pending').gte('created_at',new Date(Date.now()-86400000).toISOString()).limit(1).then(function(q){if(q&&q.data&&q.data.length)canRs=false;},function(){});
    }
    rs.onclick=function(){confirmSheet(L10,t0,loc,function(){if(window.Agenda&&Agenda.reschedule)Agenda.reschedule(row);});};
    function p2(n){return String(n).padStart(2,'0');}
    function tick(){
      if(!f.isConnected){clearInterval(iv);return;}
      var now=Date.now(),d=t0-now;
      if(now>=t1){f.hidden=true;clearInterval(iv);return;}
      rs.hidden=!(canRs&&d>3600000&&window.Agenda&&Agenda.reschedule);
      go.hidden=!(d<=3600000&&now<=t0+3600000);
      f.classList.toggle('soon',d<=3600000);
      sp.textContent='';
      if(d<=0){sp.append(el('b',{text:L10.cdOn}));return;}
      var days=Math.floor(d/86400000),h=Math.floor(d%86400000/3600000),m=Math.floor(d%3600000/60000),sc=Math.floor(d%60000/1000);
      if(d<=3600000){sp.append(document.createTextNode(L10.cdNow),el('b',{text:p2(m)+':'+p2(sc)}));}
      else{var u=[' d ',' h ',' min'];sp.append(document.createTextNode(L10.cdIn),el('b',{text:(days?days+u[0]:'')+(days||h?h+u[1]:'')+m+u[2]}),document.createTextNode(' · '+when));}
    }
    var iv=setInterval(tick,1000);tick();
  },function(){});
}

/* Pieces of the "next class" card (missed-class warning, class activity, Listening player) for the merged card drawn by classday.js. */
var PLAY='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>',PAUSE='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 5.5h3.2v13H7.5zM13.3 5.5h3.2v13h-3.2z"/></svg>';
function extras(row,es){
  var L10=es?T.es:T.pt,d=row&&row.data;if(!d||!d.nextClass||!d.nextClass.classNumber)return null;
  var nx=d.nextClass,me=d.me||null,ms=(me&&me.missed)||[],L=row.lesson||0,m0=ms.length?ms[ms.length-1]:null,out={warn:'',act:'',audio:null};
  if(m0)out.warn=m0.conversation?(L10.missc+m0.classNumber+'.'):(L10.miss+m0.classNumber+(m0.review&&m0.newWords?L10.missr+m0.newWords.from+'–'+m0.newWords.to:'')+(m0.lesson?L10.missl+m0.lesson:'')+'.');
  var s='';
  if(nx.conversation)s=L10.conv;
  else if(nx.activity)s=nx.activity+'.';
  var wl=[];if(nx.hasDictation)wl.push(L10.dict);if(nx.hasReading)wl.push(L10.read);if(nx.hasQuiz)wl.push(L10.quiz);
  if(wl.length)s+=(s?' ':'')+L10.will+wl.join(', ')+'.';
  out.act=s;out.actHead=nx.activity&&!nx.conversation?L10.act.replace(/:\s*$/,''):'';
  var mL=(m0&&!m0.conversation&&m0.lesson&&m0.lesson<=L)?m0.lesson:0;
  if((L>1||mL)&&window.Gate&&Gate.audioUrl){
    var P=mL||(L-1),n=Covers.stageOf(P),path=es?('Etapa '+n+'/Etapa '+n+' Lección '+String(P).padStart(3,'0')+'.mp3'):('Stage '+n+'/Stage '+n+' Lesson '+P+'.mp3');
    var au=el('audio',{preload:'none'}),btn=el('button',{type:'button','aria-label':L10.play}),bar=el('div'),tm=el('span',{class:'pm',style:'flex:none;font-size:.8rem',text:''});
    btn.innerHTML=PLAY;
    var box=el('div',{class:'pl pr'},[btn,el('div',{style:'min-width:0;flex:1'},[el('b',{style:'font-size:.95rem',text:L10.listen+P}),el('div',{class:'pm',style:'font-size:.8rem',text:L10.again}),el('div',{class:'tr'},[bar])]),tm,au]);
    var loaded=false;
    function fmt(x){x=Math.max(0,Math.round(x||0));return Math.floor(x/60)+':'+String(x%60).padStart(2,'0');}
    btn.onclick=function(){if(!au.paused){au.pause();return;}if(loaded){au.play();return;}Gate.audioUrl(path).then(function(u){au.src=u;loaded=true;au.play();},function(){box.hidden=true;});};
    au.addEventListener('play',function(){btn.innerHTML=PAUSE;btn.setAttribute('aria-label',L10.pause);});
    au.addEventListener('pause',function(){btn.innerHTML=PLAY;btn.setAttribute('aria-label',L10.play);});
    au.addEventListener('timeupdate',function(){bar.style.width=(au.duration?au.currentTime/au.duration*100:0)+'%';tm.textContent=fmt(au.duration-au.currentTime);});
    au.addEventListener('error',function(){if(loaded)box.hidden=true;});
    out.audio=box;
  }
  return out;
}
function mount(ctx,o){
  var L10=(o&&o.es)?T.es:T.pt,es=!!(o&&o.es),sec=document.getElementById('plan');
  if(!sec||!window.Gate||!Gate.sb||!ctx||!ctx.user)return;
  var q;try{q=Gate.sb.from('plan_progress').select('stage,lesson,data,updated_at').eq('user_id',ctx.user.id).maybeSingle();}catch(e){return;}
  q.then(function(r){
    var row=r&&r.data;if(!row||!row.data||!row.data.currentPosition)return;
    var d=row.data,cp=d.currentPosition,nx=d.nextClass,up=ctx.upto||0,me=d.me||null,ms=(me&&me.missed)||[];
    var L=row.lesson||up;if(!L||L<1)return;if(up>0&&L>up)L=up;
    var St=(window.Covers&&Covers.stageOf)?Covers.stageOf(L):(row.stage||1);
    var A=ctx.attempts||[],done={lc:{},gr:{},wb:{}};
    A.forEach(function(a){if(a.k==='check')done.lc[a.l]=1;else if(a.k==='ex'){if(/^wb/.test(String(a.e)))done.wb[a.l]=1;else done.gr[a.l]=1;}});
    var items=[];
    if(L>1)items.push({t:L10.lc+(L-1),d:!!done.lc[L-1],h:'check.html?stage='+Covers.stageOf(L-1)+'&lesson='+(L-1)});
    items.push({t:L10.lc+L,d:!!done.lc[L],h:'check.html?stage='+St+'&lesson='+L});
    if(!es){items.push({t:L10.gr+L,d:!!done.gr[L],h:'exercises.html?lesson='+L});
    items.push({t:L10.wb+L,d:!!done.wb[L],h:'workbook.html?lesson='+L});}
    var seenM={},extra=[];
    ms.slice().reverse().forEach(function(m){var M=m.lesson;if(!M||m.conversation||M>=L||seenM[M]||(up>0&&M>up))return;seenM[M]=1;
      if(!es&&!done.gr[M])extra.push({t:L10.gr+M,d:false,h:'exercises.html?lesson='+M,x:L10.missx});
      if(!es&&!done.wb[M])extra.push({t:L10.wb+M,d:false,h:'workbook.html?lesson='+M,x:L10.missx});});
    items=extra.concat(items);
    var pend=items.filter(function(x){return!x.d;}),first=pend[0];
    sec.textContent='';
    var st=document.createElement('style');st.textContent=CSS;sec.append(st);
    /* ---- next class ---- */
    if(nx&&nx.classNumber&&!(o&&o.takeover)){
      var c=el('div',{class:'pc imp'});
      c.append(el('div',{class:'pr'},[el('small',{text:L10.next}),el('span',{class:'bd',text:L10.imp})]));
      c.append(el('h2',{text:L10.prep+nx.classNumber}));
      var lw=(me&&me.lastWord)||cp.lastWord,ln=(me&&me.lastNewWord)||cp.lastNewWord;
      if(lw){c.append(el('div',{class:'pr',style:'gap:10px;flex-wrap:wrap;margin:2px 0 8px'},[el('span',{class:'pm',text:L10.lastw}),el('span',{class:'wd',text:lw}),ln?el('span',{class:'pm',style:'font-size:.8rem',text:'nº '+ln}):null]));}
      var m0=ms.length?ms[ms.length-1]:null;
      if(m0){var mt=m0.conversation?(L10.missc+m0.classNumber+'.'):(L10.miss+m0.classNumber+(m0.review&&m0.newWords?L10.missr+m0.newWords.from+'–'+m0.newWords.to:'')+(m0.lesson?L10.missl+m0.lesson:'')+'.');
        c.append(el('p',{class:'pm',style:'border-left:3px solid var(--hl);padding:4px 10px;margin:0 0 10px;color:var(--ink)',text:mt}));}
      var s='';
      if(nx.conversation)s=L10.conv;
      else if(nx.activity)s=L10.act+nx.activity+'.';
      else if(nx.review&&nx.newWords)s=L10.rev+nx.review.from+'–'+nx.review.to+L10.nw+nx.newWords.from+'–'+nx.newWords.to+'.';
      var wl=[];if(nx.hasDictation)wl.push(L10.dict);if(nx.hasReading)wl.push(L10.read);if(nx.hasQuiz)wl.push(L10.quiz);
      if(wl.length)s+=(s?' ':'')+L10.will+wl.join(', ')+'.';
      if(s)c.append(el('p',{class:'pm',text:s}));
      var mL=(m0&&!m0.conversation&&m0.lesson&&m0.lesson<=L)?m0.lesson:0;
      if((L>1||mL)&&Gate.audioUrl){
        var P=mL||(L-1),n=Covers.stageOf(P),path=es?('Etapa '+n+'/Etapa '+n+' Lección '+String(P).padStart(3,'0')+'.mp3'):('Stage '+n+'/Stage '+n+' Lesson '+P+'.mp3');
        var au=el('audio',{preload:'none'}),btn=el('button',{type:'button','aria-label':L10.play,text:'▶'}),bar=el('div'),tm=el('span',{class:'pm',style:'flex:none;font-size:.8rem',text:''});
        var box=el('div',{class:'pl pr'},[btn,el('div',{style:'min-width:0;flex:1'},[el('b',{style:'font-size:.95rem',text:L10.listen+P}),el('div',{class:'pm',style:'font-size:.8rem',text:L10.again}),el('div',{class:'tr'},[bar])]),tm,au]);
        var loaded=false;
        function fmt(x){x=Math.max(0,Math.round(x||0));return Math.floor(x/60)+':'+String(x%60).padStart(2,'0');}
        btn.onclick=function(){
          if(!au.paused){au.pause();return;}
          if(loaded){au.play();return;}
          Gate.audioUrl(path).then(function(u){au.src=u;loaded=true;au.play();},function(){box.hidden=true;});
        };
        au.addEventListener('play',function(){btn.textContent='❚❚';btn.setAttribute('aria-label',L10.pause);});
        au.addEventListener('pause',function(){btn.textContent='▶';btn.setAttribute('aria-label',L10.play);});
        au.addEventListener('timeupdate',function(){bar.style.width=(au.duration?au.currentTime/au.duration*100:0)+'%';tm.textContent=fmt(au.duration-au.currentTime);});
        au.addEventListener('error',function(){if(loaded)box.hidden=true;});
        c.append(box);
      }
      sec.append(c);
      try{countdown(c,L10,es,ctx.user.id);}catch(e){}
    }
    /* ---- recommended list ---- */
    var r2=el('div',{class:'pc',style:'padding-bottom:6px'});
    r2.append(el('small',{text:L10.rec}));
    if(!first){
      r2.append(el('h2',{text:L10.all}));
      r2.append(el('p',{class:'pm',text:L10.allp+L+L10.allp2}));
      items.forEach(function(x){r2.append(el('a',{class:'pr li ok',href:x.h,'aria-label':x.t+', '+L10.again2},[el('span',{class:'bx',text:'☑'}),el('b',{text:x.t}),el('span',{class:'tg',style:'margin-left:auto',text:L10.done}),el('i',{class:'go',style:'margin-left:8px','aria-hidden':'true',text:'↻'})]));});
      var a=el('a',{class:'btn primary full',href:'check.html?stage='+St+'&lesson='+L,text:L10.redo});
      r2.append(a);r2.lastChild.style.margin='10px 0 12px';
    }else{
      r2.append(el('h2',{text:L10.lesson+L}));
      items.forEach(function(x){
        if(x.d){r2.append(el('a',{class:'pr li ok',href:x.h,'aria-label':x.t+', '+L10.again2},[el('span',{class:'bx',text:'☑'}),el('div',{},[el('b',{text:x.t}),el('span',{class:'s',text:L10.doneL})]),el('span',{class:'tg',text:L10.done}),el('i',{class:'go',style:'margin-left:8px','aria-hidden':'true',text:'↻'})]));}
        else r2.append(el('a',{class:'pr li',href:x.h},[el('span',{class:'bx',text:'☐'}),el('div',{},[el('b',{text:x.t}),x.x?el('span',{class:'s',text:x.x}):(x===first?el('span',{class:'s',text:L10.recd}):null)]),el('i',{class:'go','aria-hidden':'true',text:'→'})]));
      });
    }
    if(o&&o.takeover)return;   /* English home: the merged next-class card (classday.js) replaces the next-class card and this list */
    sec.append(r2);sec.hidden=false;
  }).catch(function(){});
}
window.Plan={mount:mount,extras:extras,countdown:function(card,es,uid){countdown(card,es?T.es:T.pt,es,uid);}};
})();
