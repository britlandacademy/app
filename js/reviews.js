/* Britland Academy: student reviews. Home card after a Stage certificate + pop-up form (English and Spanish apps).
   Reviews.mount(box,{sb,uid,es}). The student always writes or approves the final text; the AI only drafts (review-help function).
   Public site shows only reviews that the student allowed AND the teacher approved (public_reviews RPC). */
(function(){
'use strict';
var D=document;
var TX={
 en:{done:function(n){return 'Stage '+n+' completed!';},cta:'Leave a review',later:'Maybe later',notnow:'Not now',title:function(n){return 'How was Stage '+n+'?';},
  nameLbl:'How should we show your name?',full:'Full name',initial:'First name + initial',anon:'Anonymous',send:'Send review',help:'Help me start',
  sending:'Sending...',thinking:'Writing a draft...',close:'Close',rate:function(i){return i+' of 5 stars';}},
 es:{done:function(n){return '¡Etapa '+n+' completada!';},cta:'Dejar una opinión',later:'Quizás luego',notnow:'Ahora no',title:function(n){return '¿Cómo fue la Etapa '+n+'?';},
  nameLbl:'¿Cómo mostramos tu nombre?',full:'Nombre completo',initial:'Nombre + inicial',anon:'Anónimo',send:'Enviar opinión',help:'Ayúdame a empezar',
  sending:'Enviando...',thinking:'Escribiendo un borrador...',close:'Cerrar',rate:function(i){return i+' de 5 estrellas';}}
};
/* Warnings, encouragement and instructions are always in Portuguese (teacher's rule). */
var PT={
 card:function(n){return 'Parabéns pelo Stage '+n+'! Quer deixar uma avaliação? Leva 1 minuto.';},
 consent:'Autorizo a Britland Academy a exibir esta avaliação no site da escola, com o nome escolhido acima. Posso pedir a remoção a qualquer momento.',
 hint:'Conte do seu jeito…',note:'O texto enviado será sempre o que você escrever ou aprovar.',
 ideas:'Toque nas ideias da sua jornada para começar:',
 needStars:'Escolha de 1 a 5 estrelas.',needText:'Escreva pelo menos uma frase para a avaliação aparecer no site, ou desmarque a autorização.',
 thanks:'Obrigado! Sua avaliação foi enviada.',thanksLow:'Obrigado por contar. Sinto muito que não tenha sido como esperava; vou ler com atenção.',
 aiFail:'Não foi possível gerar o rascunho agora. Escreva do seu jeito.',aiLimit:'Você já usou a ajuda várias vezes hoje. Escreva do seu jeito.',
 aiNote:'Rascunho gerado a partir da sua jornada. Leia, edite e só envie se concordar.',sendFail:'Não foi possível enviar agora. Tente de novo em instantes.'
};
var ES_=/\/espanol\//.test(location.pathname);
var css='.rvc{margin:16px 0;background:#10224a;color:#f2f5fa;border:1px solid #27407a;border-top:4px solid #c9a13b;border-radius:16px;padding:18px 20px}'
+'.rvc h3{margin:0 0 4px;font:700 1.15rem Georgia,serif}.rvc p{margin:0 0 12px;color:#a9b6d3;font-size:.92rem;line-height:1.45}'
+'.rv-b{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:10px 22px;border-radius:99px;border:2px solid #c9a13b;background:#c9a13b;color:#1a1405;font:700 .95rem inherit;font-family:inherit;cursor:pointer}'
+'.rv-b.o{background:transparent;color:#e4c06a}.rv-b.g{background:transparent;border-color:transparent;color:#a9b6d3;font-weight:600}.rv-b:disabled{opacity:.55;cursor:default}'
+'.rvc .row{display:flex;gap:8px;flex-wrap:wrap}'
+'.rv-ov{position:fixed;inset:0;z-index:99998;display:flex;align-items:flex-end;justify-content:center;background:rgba(5,10,24,.72);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}'
+'.rv-d{box-sizing:border-box;width:min(520px,100%);max-height:94vh;overflow:auto;background:#10224a;color:#f2f5fa;border-top:4px solid #c9a13b;border-radius:22px 22px 0 0;padding:24px 22px calc(22px + env(safe-area-inset-bottom,0px));box-shadow:0 -18px 50px rgba(0,0,0,.5)}'
+'@media(min-width:620px){.rv-ov{align-items:center}.rv-d{border-radius:22px;border:1px solid #27407a;border-top:4px solid #c9a13b}}'
+'.rv-d h3{margin:0 0 6px;font:700 1.35rem Georgia,serif;text-align:center}'
+'.rv-st{display:flex;justify-content:center;gap:6px;margin:6px 0 14px}.rv-st button{background:none;border:0;padding:2px;cursor:pointer;line-height:0;border-radius:8px}.rv-st svg{width:38px;height:38px;fill:#27407a;transition:fill .15s,transform .15s}.rv-st button.on svg{fill:#e4c06a}.rv-st button:focus-visible{outline:3px solid #e4c06a}'
+'.rv-q{margin:0 0 12px;font-size:.93rem;line-height:1.45;text-align:center}.rv-q b{color:#e4c06a}'
+'.rv-ch{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 12px;justify-content:center}.rv-c{padding:8px 14px;border-radius:99px;border:1px solid #c9a13b;background:#0b1733;color:#e4c06a;font:600 .82rem inherit;font-family:inherit;cursor:pointer;min-height:38px}'
+'.rv-c.n{border-color:#27407a;color:#f2f5fa}.rv-c.on{background:#c9a13b;color:#1a1405;border-color:#c9a13b;font-weight:700}'
+'.rv-ta{box-sizing:border-box;width:100%;min-height:104px;border-radius:20px;border:1px solid #27407a;background:#0b1733;color:#f2f5fa;padding:14px 16px;font:inherit;font-size:.95rem;resize:vertical}.rv-ta:focus{outline:2px solid #e4c06a}'
+'.rv-l{font:700 .7rem system-ui;letter-spacing:.12em;color:#e4c06a;margin:16px 0 8px;text-transform:uppercase}'
+'.rv-ck{display:flex;gap:10px;align-items:flex-start;margin:16px 0;font-size:.8rem;color:#a9b6d3;line-height:1.45;cursor:pointer}.rv-ck input{appearance:none;-webkit-appearance:none;flex:none;width:22px;height:22px;border-radius:6px;border:2px solid #c9a13b;background:transparent;margin:0;cursor:pointer;display:grid;place-items:center}.rv-ck input:checked{background:#c9a13b}.rv-ck input:checked:after{content:"";width:6px;height:11px;border:solid #1a1405;border-width:0 3px 3px 0;transform:rotate(45deg) translate(-1px,-1px)}.rv-ck input:focus-visible{outline:3px solid #e4c06a;outline-offset:2px}'
+'.rv-n{font-size:.78rem;color:#a9b6d3;margin:8px 2px 0;line-height:1.4}.rv-e{color:#ff9e94;font-size:.85rem;margin:8px 2px 0;min-height:1.2em}'
+'.rv-f{display:flex;flex-direction:column;gap:6px;margin-top:6px}.rv-f .rv-b{width:100%}'
+'.rv-hp{margin-top:10px}.rv-ok{text-align:center;padding:20px 4px}.rv-ok p{margin:0 0 16px;line-height:1.5}'
+'@media(prefers-reduced-motion:reduce){.rv-st svg{transition:none}}';
var star='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>';
var spark='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z"/></svg>';
function el(t,c,h){var e=D.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function ensureCss(){if(D.getElementById('rv-css'))return;var s=el('style');s.id='rv-css';s.textContent=css;D.head.appendChild(s);}
function lsGet(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function lsSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}

/* facts from real data -> personalised question and idea chips (no AI needed) */
function facts(j,stage){
  var f=[],s=[];j=j||{};
  if(j.best_streak>=3){f.push({t:j.best_streak+' dias seguidos',ins:'Estudei '+j.best_streak+' dias seguidos. '});s.push('estudou <b>'+j.best_streak+' dias seguidos</b>');}
  else if(j.days>=5){f.push({t:j.days+' dias de estudo',ins:'Estudei em '+j.days+' dias diferentes. '});s.push('estudou em <b>'+j.days+' dias</b>');}
  if(j.n_ex>=20){f.push({t:j.n_ex+' exercícios',ins:'Fiz '+j.n_ex+' exercícios. '});s.push('fez <b>'+j.n_ex+' exercícios</b>');}
  if(j.perfect>=5){f.push({t:j.perfect+' com 100%',ins:'Acertei tudo em '+j.perfect+' exercícios. '});s.push('acertou tudo em <b>'+j.perfect+'</b> deles');}
  if(j.best_exam_pct>=70){f.push({t:'Prova final: '+Math.round(j.best_exam_pct)+'%',ins:'Tirei '+Math.round(j.best_exam_pct)+'% na prova final. '});s.push('tirou <b>'+Math.round(j.best_exam_pct)+'%</b> na prova final');}
  var q='Você concluiu o <b>Stage '+stage+'</b>'+(s.length?', '+s.join(', ').replace(/, ([^,]*)$/,' e $1'):'')+'. O que mudou no seu inglês?';
  return {chips:f,question:q};
}

function openForm(ctx,pend,j,done){
  ensureCss();var T=TX[ctx.es?'es':'en'],stage=pend.stage;
  var F=facts(j,stage);if(ctx.es)F.question=F.question.replace('seu inglês','seu espanhol').replace('Stage','Etapa');
  var rating=0,showAs='initial',ai=false,aiText='',busy=false;
  var ov=el('div','rv-ov'),d=el('div','rv-d');d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label',T.title(stage));
  d.appendChild(el('h3','',esc(T.title(stage))));
  var st=el('div','rv-st');st.setAttribute('role','radiogroup');var sb=[];
  for(var i=1;i<=5;i++)(function(i){var b=el('button','',star);b.type='button';b.setAttribute('role','radio');b.setAttribute('aria-label',T.rate(i));b.setAttribute('aria-checked','false');
    b.onclick=function(){rating=i;sb.forEach(function(x,k){x.classList.toggle('on',k<i);x.setAttribute('aria-checked',k===i-1?'true':'false');});};sb.push(b);st.appendChild(b);})(i);
  d.appendChild(st);
  d.appendChild(el('p','rv-q',F.question));
  if(F.chips.length){var ch=el('div','rv-ch');F.chips.forEach(function(c){var b=el('button','rv-c',esc(c.t));b.type='button';
    b.onclick=function(){var v=ta.value;if(v.indexOf(c.ins)<0){ta.value=(v&&!/\s$/.test(v)?v+' ':v)+c.ins;}b.classList.add('on');ta.focus();};ch.appendChild(b);});d.appendChild(ch);}
  var ta=el('textarea','rv-ta');ta.maxLength=600;ta.placeholder=PT.hint;ta.setAttribute('aria-label',PT.hint);d.appendChild(ta);
  var hb=el('button','rv-b o rv-hp',spark+' '+esc(T.help));hb.type='button';d.appendChild(hb);
  var note=el('p','rv-n',esc(PT.note));d.appendChild(note);
  hb.onclick=async function(){if(hb.disabled)return;hb.disabled=true;var old=hb.innerHTML;hb.innerHTML=spark+' '+esc(T.thinking);
    try{var r=await ctx.sb.functions.invoke('review-help',{body:{stage:stage}});var txt=r&&r.data&&r.data.text;
      if(txt){ta.value=ta.value&&ta.value.trim()?ta.value.replace(/\s+$/,'')+' '+txt:txt;ai=true;aiText=txt;note.textContent=PT.aiNote;ta.focus();}
      else{var code=r&&r.error&&r.error.context&&r.error.context.status;err.textContent=code===429?PT.aiLimit:PT.aiFail;}
    }catch(e){err.textContent=PT.aiFail;}
    hb.disabled=false;hb.innerHTML=old;};
  d.appendChild(el('div','rv-l',esc(T.nameLbl)));
  var nr=el('div','rv-ch');nr.style.justifyContent='flex-start';var nb={};
  [['full',T.full],['initial',T.initial],['anon',T.anon]].forEach(function(o){var b=el('button','rv-c n'+(o[0]===showAs?' on':''),esc(o[1]));b.type='button';b.onclick=function(){showAs=o[0];Object.keys(nb).forEach(function(k){nb[k].classList.toggle('on',k===showAs);});};nb[o[0]]=b;nr.appendChild(b);});
  d.appendChild(nr);
  var lab=el('label','rv-ck');var cb=el('input');cb.type='checkbox';lab.appendChild(cb);lab.appendChild(el('span','',esc(PT.consent)));d.appendChild(lab);
  var err=el('div','rv-e');err.setAttribute('role','alert');d.appendChild(err);
  var fo=el('div','rv-f'),sd=el('button','rv-b',esc(T.send)),nn=el('button','rv-b g',esc(T.notnow));sd.type='button';nn.type='button';fo.appendChild(sd);fo.appendChild(nn);d.appendChild(fo);
  ov.appendChild(d);D.body.appendChild(ov);var prevOv=D.body.style.overflow;D.body.style.overflow='hidden';
  function close(){D.removeEventListener('keydown',kd);D.body.style.overflow=prevOv;ov.remove();}
  function kd(e){if(e.key==='Escape'&&!busy)close();}D.addEventListener('keydown',kd);
  ov.addEventListener('click',function(e){if(e.target===ov&&!busy)close();});
  nn.onclick=function(){lsSet('bl-rv-later-'+stage,String(Date.now()));close();if(done)done(false);};
  sd.onclick=async function(){if(busy)return;err.textContent='';
    if(!rating){err.textContent=PT.needStars;return;}
    var txt=ta.value.trim();if(cb.checked&&txt.length<8){err.textContent=PT.needText;return;}
    busy=true;sd.disabled=true;sd.textContent=T.sending;
    var row={user_id:ctx.uid,stage:stage,course:ctx.es?'espanol':'english',rating:rating,comment:txt||null,allow_public:!!cb.checked,show_as:showAs,ai_assisted:ai&&!!txt,ai_draft:ai?aiText:null};
    try{var r=await ctx.sb.from('student_reviews').insert(row);
      if(r&&r.error&&r.error.code!=='23505')throw r.error;
      lsSet('bl-rv-done-'+stage,'1');
      d.innerHTML='';var ok=el('div','rv-ok');ok.appendChild(el('p','',esc(rating<=2?PT.thanksLow:PT.thanks)));var cl=el('button','rv-b',esc(T.close));cl.type='button';cl.onclick=close;ok.appendChild(cl);d.appendChild(ok);cl.focus();
      busy=false;if(done)done(true);
    }catch(e){busy=false;sd.disabled=false;sd.textContent=T.send;err.textContent=PT.sendFail;}
  };
  setTimeout(function(){sb[0].focus();},50);
}

async function mount(box,ctx){
  try{
    if(!box||!ctx||!ctx.sb||!ctx.uid)return;
    var r=await ctx.sb.rpc('review_pending');var p=r&&r.data&&r.data[0];if(!p)return;
    if(lsGet('bl-rv-done-'+p.stage)==='1')return;
    var later=+lsGet('bl-rv-later-'+p.stage)||0;if(later&&Date.now()-later<3*86400000)return;
    ensureCss();ctx.es=ctx.es||ES_;var T=TX[ctx.es?'es':'en'];
    box.innerHTML='';var c=el('div','rvc');c.appendChild(el('h3','',esc(T.done(p.stage))));c.appendChild(el('p','',esc(PT.card(p.stage))));
    var row=el('div','row'),go=el('button','rv-b',esc(T.cta)),lt=el('button','rv-b g',esc(T.later));go.type='button';lt.type='button';row.appendChild(go);row.appendChild(lt);c.appendChild(row);
    box.appendChild(c);box.hidden=false;
    lt.onclick=function(){lsSet('bl-rv-later-'+p.stage,String(Date.now()));box.hidden=true;box.innerHTML='';};
    go.onclick=async function(){go.disabled=true;var jr=null;try{jr=(await ctx.sb.rpc('review_journey')).data;}catch(e){}go.disabled=false;
      openForm(ctx,p,jr,function(sent){if(sent){box.hidden=true;box.innerHTML='';}});};
  }catch(e){}
}
window.Reviews={mount:mount,_facts:facts};
})();
