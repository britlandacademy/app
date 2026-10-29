/* Britland: "Exercícios recomendados para você" on the Home.
   Reads this student's row of plan_progress (filled from the "Planos de Aula" sheet by plan-sync) and the
   student's own attempts. Plan.mount(ctx, {es:true|false}) -> adds the section after the welcome line. */
(function(){
'use strict';
var T={
  pt:{next:'Próxima aula',imp:'Importante',prep:'Prepare-se para a aula nº ',lastw:'Última palavra estudada:',rev:'Revisão das palavras ',nw:' e novas palavras ',again2:'toque para refazer',conv:'Aula de Conversation. Aproveite para praticar a fala!',miss:'Você faltou à aula nº ',missc:'Você faltou à aula de Conversation nº ',missr:'. Revise as palavras ',missl:' e ouça o Listening da Lição ',missx:'Aula perdida',act:'Atividade da aula: ',will:'Haverá ',dict:'ditado',read:'leitura',quiz:'Lesson Check',listen:'Listening · Lição ',again:'Ouça de novo antes da aula',
    rec:'Exercícios recomendados para você',lesson:'Lição ',lc:'Lesson Check · Lição ',gr:'Grammar · Lição ',wb:'Workbook · Lição ',done:'feito',doneL:'Concluído',recd:'Recomendado',
    all:'Tudo em dia! 🎉',allp:'Você fez todos os exercícios da Lição ',allp2:'. Parabéns pela dedicação!',redo:'Refazer o Lesson Check →',n:' de ',ex:' exercícios feitos',play:'Ouvir',pause:'Pausar'},
  es:{next:'Próxima clase',imp:'Importante',prep:'Prepárate para la clase n.º ',lastw:'Última palabra estudiada:',rev:'Repaso de las palabras ',nw:' y palabras nuevas ',again2:'toca para repetir',conv:'Clase de conversación. ¡Aprovecha para practicar el habla!',miss:'Faltaste a la clase n.º ',missc:'Faltaste a la clase de conversación n.º ',missr:'. Repasa las palabras ',missl:' y escucha el Listening de la Lección ',missx:'Clase perdida',act:'Actividad de la clase: ',will:'Habrá ',dict:'dictado',read:'lectura',quiz:'Lesson Check',listen:'Listening · Lección ',again:'Escúchalo de nuevo antes de la clase',
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
+'#plan .tr{height:6px;background:var(--line);border-radius:9px;margin-top:6px;overflow:hidden}#plan .tr div{height:100%;width:0;background:var(--hl)}#plan .full{display:flex;justify-content:center;margin-top:12px}';
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
    items.push({t:L10.gr+L,d:!!done.gr[L],h:(es?'exercicios.html':'exercises.html')+'?lesson='+L});
    items.push({t:L10.wb+L,d:!!done.wb[L],h:'workbook.html?lesson='+L});
    var seenM={},extra=[];
    ms.slice().reverse().forEach(function(m){var M=m.lesson;if(!M||m.conversation||M>=L||seenM[M]||(up>0&&M>up))return;seenM[M]=1;
      if(!done.gr[M])extra.push({t:L10.gr+M,d:false,h:(es?'exercicios.html':'exercises.html')+'?lesson='+M,x:L10.missx});
      if(!done.wb[M])extra.push({t:L10.wb+M,d:false,h:'workbook.html?lesson='+M,x:L10.missx});});
    items=extra.concat(items);
    var pend=items.filter(function(x){return!x.d;}),first=pend[0];
    sec.textContent='';
    var st=document.createElement('style');st.textContent=CSS;sec.append(st);
    /* ---- next class ---- */
    if(nx&&nx.classNumber){
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
    sec.append(r2);sec.hidden=false;
  }).catch(function(){});
}
window.Plan={mount:mount};
})();
