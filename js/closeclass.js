/* Painel do professor · "Fechar a aula": registra no app (sem planilha) o que foi dado, onde parou e a presença. */
(function(W){
'use strict';
var D=document,ES0=/\/espanol\//.test(location.pathname),ES=ES0,SN=ES?6:12,SL=ES?'Etapa ':'Stage ';   /* Spanish course: 6 etapas, single edition, no word index */
function el(t,c,x){var e=D.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function note(msg,title,auto){if(!window.BL_DLG){try{alert(msg);}catch(e){}return;}BL_DLG.alert(msg,{title:title||'Aviso'});var o=D.querySelectorAll('.bld-ov'),l=o[o.length-1];if(auto)setTimeout(function(){var b=l&&l.parentNode&&l.querySelector('.bld-a button');if(b)b.click();},auto);}
function css(){if(D.getElementById('cc-css'))return;var s=el('style');s.id='cc-css';s.textContent=
'.cc{border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:14px;background:var(--card);padding:12px 14px;display:grid;gap:10px}'+
'.cc .cc-k{font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:700}.cc .cc-m{color:var(--muted);font-size:.86rem}'+
'.cc .cc-seg{display:flex;flex-wrap:wrap;gap:6px}.cc .cc-seg button,.cc .cc-pill{min-height:36px;padding:2px 14px;border-radius:99px;font:inherit;font-weight:700;font-size:.86rem;background:transparent;color:var(--ink);border:2px solid var(--line);cursor:pointer}'+
'.cc .cc-seg button.on{background:var(--ok);border-color:var(--ok);color:var(--surface,#fff)}.cc .cc-seg button.bad.on{background:var(--bad);border-color:var(--bad)}.cc .cc-seg button.warn.on{background:var(--warn);border-color:var(--warn)}'+
'.cc .cc-pill.ok{border-color:var(--ok);color:var(--ok)}.cc .cc-pill.no{border-color:var(--bad);color:var(--bad);text-decoration:line-through;opacity:.85}'+
'.cc .cc-g{display:grid;grid-template-columns:1fr 1fr 1.4fr;gap:8px}@media(max-width:760px){.cc .cc-g{grid-template-columns:1fr}}'+
'.cc label{display:grid;gap:3px;font-size:.78rem;color:var(--muted);font-weight:700}.cc input,.cc textarea,.cc select{min-height:40px;padding:4px 10px;border:1px solid var(--line);border-radius:10px;background:transparent;color:var(--ink);font:inherit;min-width:0}.cc textarea{min-height:60px}'+
'.cc .cc-tk{border:1px solid var(--line);border-radius:12px;padding:10px 12px;background:var(--surface);display:grid;gap:8px}.cc .cc-seg button.on{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}'+
'.cc .cc-act{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.cc .cc-act .sp{flex:1}.cc .cc-b{min-height:40px;padding:0 20px;border-radius:99px;font:inherit;font-weight:700;cursor:pointer;border:2px solid var(--line);background:transparent;color:var(--ink)}.cc .cc-b.go{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}'+
'.cc.cc-in{border:0;background:none;padding:0;gap:8px}.cc-sel{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.cc-sel select,.cc-sel input{min-height:32px;border-radius:99px;padding:0 12px;border:1px solid var(--line);background:var(--surface,#fff)}'+
'.cc-sumt{font:700 1.05rem Georgia,serif}.cc-sums{font-size:.85rem;color:var(--muted)}.cc-sums.pl{font-style:italic}.cc-sumg{font-size:.78rem;font-weight:700;color:var(--warn)}'+
'.cc-ed{border-top:1px dashed var(--line);padding-top:8px;display:grid;gap:8px}.cc-ed[hidden]{display:none}.cc input.cc-plan{font-style:italic;color:var(--muted);font-weight:400}.cc-pt{display:inline-block;margin-left:6px;padding:0 7px;border-radius:99px;background:var(--warn-bg,#f3ead0);color:var(--warn);font-size:.66rem;font-weight:800;letter-spacing:.04em;font-style:normal}'+
'.cc-edit{display:inline-flex;gap:5px;align-items:center;min-height:26px;padding:0 11px;border-radius:99px;border:2px solid var(--navy,#0b1733);background:var(--surface,#fff);color:var(--navy,#0b1733);font:inherit;font-weight:700;font-size:.74rem;cursor:pointer}.cc-edit svg{width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}'+
'.cc .cc-seg button.act{display:inline-flex;gap:6px;align-items:center;border-color:var(--navy,#0b1733);color:var(--navy,#0b1733);margin-left:2px}.cc .cc-seg button.act svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}'+
'.cc .cc-seg button.act[hidden]{display:none}.cc label.cc-ck{display:inline-flex;gap:8px;align-items:center;font-size:.86rem;color:var(--ink);font-weight:600}.cc label.cc-ck input{min-height:0;width:18px;height:18px;padding:0;margin:0}'+
'.cc-mt{width:100%;min-height:150px;resize:vertical;font:inherit;font-size:.92rem;line-height:1.4;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:var(--surface,#fff);color:var(--ink);box-sizing:border-box}.cc-lg{display:flex;gap:6px;align-items:center;margin:0 0 8px;font-size:.8rem}.cc-lg button{min-height:30px;padding:0 14px;border-radius:99px;border:2px solid var(--navy,#0b1733);background:transparent;color:var(--navy,#0b1733);font:inherit;font-weight:700;cursor:pointer}.cc-lg button.on{background:var(--navy,#0b1733);color:#fff}.cc-hn{margin:8px 0 0;font-size:.8rem;opacity:.85}';
D.head.appendChild(s);}
function prow(stage,n){var PP=ES?W.BL_PLANS_ES:W.BL_PLANS,P=PP&&PP[String(stage)];return (P&&P.rows&&P.rows[n-1])||null;}
function plan(stage,n){var r=prow(stage,n);return r?r.c:'';}
function dash(v){v=String(v==null?'':v).trim();return /^[—–-]*$/.test(v)?'':v;}
var IDXQ=null;function loadIdx(cb){if(W.BL_WORDIDX)return cb(W.BL_WORDIDX);if(!IDXQ){IDXQ=[];var sc=D.querySelector('script[src*="closeclass.js"]'),base=sc?sc.src.replace(/closeclass\.js.*$/,''):'js/',t=D.createElement('script');t.src=base+'wordidx.js';t.onload=function(){var q=IDXQ;IDXQ=null;q.forEach(function(f){f(W.BL_WORDIDX);});};t.onerror=function(){var q=IDXQ;IDXQ=null;q.forEach(function(f){f(null);});};D.head.appendChild(t);}IDXQ.push(cb);}
function nrm(x){return String(x).trim().toLowerCase().replace(/\u2019/g,"'");}
var APP='https://www.britlandacademy.co.uk/app/',SP='America/Sao_Paulo';
function fn1(n){return String(n||'').trim().split(/\s+/)[0];}
function wdm(iso,tz,lang){var d=new Date(iso),z=tz||SP,wd=new Intl.DateTimeFormat(lang==='en'?'en-GB':'pt-BR',{weekday:'short',timeZone:z}).format(d).replace(/\./g,''),dm=new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'2-digit',timeZone:z}).format(d);return wd+' '+dm;}
function hmf(iso,tz){return new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZone:tz||SP}).format(new Date(iso));}
/* textos do WhatsApp (VIP) e do push (nao VIP): c={name,iso,tz,past,slotIso} */
function buildMsg(kind,lang,c){var en=lang==='en',n=c.name,dt=wdm(c.iso,c.tz,lang);
  if(kind==='repo'){var t=en?'Hi '+n+'! I had to reschedule our class from '+dt+', so you now have a make-up class.':'Olá, '+n+'! Precisei remarcar nossa aula de '+dt+'. Ela fica como crédito para você repor.';
    if(c.slotIso&&c.slotIso.length){var l=c.slotIso.map(function(i,k){return (k+1)+') '+wdm(i,c.tz,lang)+(en?' at ':' às ')+hmf(i,c.tz);}).join('  '),lt=c.tz&&c.tz!==SP;
      t+=en?' I’m free at: '+l+(lt?' (your local time)':'')+'. If you prefer, book it directly in the app: ':' Tenho estes horários livres: '+l+(lt?' (no seu horário)':'')+'. Se preferir, marque direto no app: ';}
    else t+=en?' Please choose the best time directly in the app: ':' Escolha o melhor horário direto no app: ';
    return t+APP+' (Agenda → Marcar reposição).';}
  var nx=c.past?'':dt;
  if(en)return 'Hi '+n+'! '+(nx?'Our next class is '+nx+'. If you can, do the app exercises before then so we make the most of our time.':'If you can, do the app exercises before our next class so we make the most of our time.')+' Open the app here: '+APP;
  return 'Oi, '+n+'! '+(nx?'Nossa próxima aula é '+nx+'. Se puder, faça os exercícios do app antes dela, assim aproveitamos melhor o tempo.':'Se puder, faça os exercícios do app antes da nossa próxima aula, assim aproveitamos melhor o tempo.')+' Entre direto por aqui: '+APP;}
function pushMsg(kind,c){var n=c.name,dt=wdm(c.iso,c.tz,'pt');
  if(kind==='repo')return n+', sua aula de '+dt+' foi remarcada e você tem 1 aula a repor. Abra a Agenda no app e marque o melhor horário.';
  return 'Oi, '+n+'! '+(c.past?'Se puder, faça os exercícios do app antes da nossa próxima aula, assim aproveitamos melhor o tempo.':'Nossa próxima aula é '+dt+'. Se puder, faça os exercícios do app antes dela, assim aproveitamos melhor o tempo.');}
function render(host,x){ES=x.course?x.course==='es':ES0;SN=ES?6:12;SL=ES?'Etapa ':'Stage ';css();
  var sb=x.sb,uids=x.uids,group=uids.length>1,key=x.key,box=el('div','cc');host.appendChild(box);
  Promise.all([sb.from('class_log').select('*').in('user_id',uids).order('class_start',{ascending:false}).limit(200),
    sb.from('plan_links').select('user_id,sheet_name').in('user_id',uids)].map(function(q){return Promise.resolve(q).then(function(r){return r&&!r.error?r.data||[]:[];},function(){return [];});})).then(function(a){
    var logs=a[0],mine={},maxN=0;logs.forEach(function(l){if(l.event_key===key)mine[l.user_id]=l;if(l.status==='given'&&l.class_number>maxN&&l.event_key!==key)maxN=l.class_number;});
    var u0=uids[0],pr=(x.prog[u0]||{}),sm=a[1][0]&&/(?:stage|stg)\s*(\d+)/i.exec(a[1][0].sheet_name||'');
    var stage=+((mine[u0]&&mine[u0].stage)||pr.stage||(sm?sm[1]:0))||0,num=(mine[u0]&&mine[u0].class_number)||Math.max(maxN,+pr.class_number||0)+1;
    var sheet=(a[1][0]&&a[1][0].sheet_name)||'',ed=ES?'es':((mine[u0]&&mine[u0].edition)||(/2nd/i.test(sheet)?'e2':'e3'));
    var absent={},status='given',saved=!!mine[u0];function isAbs(u){var at=x.att&&x.att[u];return !!absent[u]||!!(at&&at.status==='ns');}uids.forEach(function(u){if(mine[u]&&mine[u].status!=='given')absent[u]=1;});
    if(!group&&mine[u0])status=mine[u0].status;
    box.appendChild(el('div','cc-k','Fechar a aula'+(saved?' · salva ✓':'')));
    var fal=uids.filter(function(u){var r=logs.filter(function(l){return l.user_id===u&&l.event_key!==key&&(l.status==='given'||l.status==='missed');}).sort(function(a,b){return (b.class_number||0)-(a.class_number||0);}).slice(0,2);return r.length===2&&r[0].status==='missed'&&r[1].status==='missed';});
    if(fal.length){var al=el('div','cc-m','⚠ '+fal.map(x.name).join(', ')+' faltou às duas últimas aulas dadas: vale entrar em contato.');al.style.color='var(--warn)';al.style.fontWeight='700';box.appendChild(al);try{var kk='cc-fal-'+fal.join(',')+'-'+new Date().toISOString().slice(0,10);if(!localStorage.getItem(kk)){localStorage.setItem(kk,'1');setTimeout(function(){note(fal.map(x.name).join(', ')+' faltou às duas últimas aulas dadas.\n\nVale entrar em contato.','Atenção');},400);}}catch(e){}}
    var top=el('div','cc-act'),stSel=D.createElement('select');for(var s=1;s<=SN;s++){var o=D.createElement('option');o.value=s;o.textContent=SL+s;stSel.appendChild(o);}stSel.value=stage||(ES?1:6);stSel.setAttribute('aria-label','Stage');var edSel=D.createElement('select');(ES?[['es','Tercera edición']]:[['e3','3ª edição'],['e2','2ª edição']]).forEach(function(e){var o2=D.createElement('option');o2.value=e[0];o2.textContent=e[1];edSel.appendChild(o2);});edSel.value=ed;edSel.setAttribute('aria-label','Edição');
    var nIn=D.createElement('input');nIn.type='number';nIn.min=1;nIn.value=num;nIn.style.width='80px';nIn.setAttribute('aria-label','Número da aula');
    var cont=x.slot||box;if(x.slot){x.slot.classList.add('cc','cc-in');}
    var selRow=el('div','cc-sel');selRow.appendChild(stSel);if(!ES)selRow.appendChild(edSel);selRow.appendChild(el('span','cc-m','aula nº'));selRow.appendChild(nIn);cont.appendChild(selRow);
    var sumT=el('div','cc-sumt'),sumS=el('div','cc-sums'),sumG=el('div','cc-sumg');cont.appendChild(sumT);cont.appendChild(sumS);cont.appendChild(sumG);
    var edBox=x.slot?el('div','cc-ed'):box;if(x.slot){edBox.hidden=true;}
    var hint=el('div','cc-m');edBox.appendChild(hint);
    function setHint(){var t=plan(stSel.value,+nIn.value);hint.textContent=t?'Plano da '+(ES?'etapa ':'Stage ')+stSel.value+' · aula '+nIn.value+': '+t:'';}var fillTasks=function(){};stSel.onchange=nIn.onchange=function(){setHint();fillTasks();planFill(false);refreshSum();};setHint();
    var ctl=el('div','cc-seg'),btns={};
    function paint(){
      if(group){var ab=uids.filter(isAbs);msg.textContent=ab.length?ab.map(x.name).join(', ')+' vai ficar com a aula '+nIn.value+' em perdidas para revisar (presença marcada no card)':'';return;}
      Object.keys(btns).forEach(function(k){btns[k].classList.toggle('on',status===k);});showAct();}
    var msg=el('div','cc-m');
    if(!group){[['given','Dada',''],['missed','Faltou','bad'],['rescheduled','Remarcada','warn']].forEach(function(k){var b=el('button',k[2],k[1]);b.type='button';b.onclick=function(){status=k[0];paint();};btns[k[0]]=b;ctl.appendChild(b);});}
    var ICN={cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',chat:'<path d="M4 5h16v11H9l-5 4z"/>'};
    function actBtn(ic,txt,fn){var b=el('button','act');b.type='button';b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+ICN[ic]+'</svg>';b.appendChild(el('span',null,txt));b.onclick=fn;return b;}
    var bRep=null,bNud=null;
    if(!group){bRep=actBtn('cal','Combinar reposição',function(){sendMsg('repo');});bNud=actBtn('chat','Lembrar de estudar',function(){sendMsg('nudge');});ctl.appendChild(bRep);ctl.appendChild(bNud);}
    function showAct(){if(bRep)bRep.hidden=status!=='rescheduled';}
    if(!group)box.appendChild(ctl);box.appendChild(msg);box.appendChild(top);
    var g=el('div','cc-g'),L=mine[u0]||{};
    function fld(lab,val,ph){var l=el('label',null,lab),i=D.createElement('input');i.type='text';i.value=val||'';if(ph)i.placeholder=ph;l.appendChild(i);g.appendChild(l);return i;}
    var iL=fld('Lesson',L.lesson,''),iP=fld('Parágrafo',L.paragraph,''),iW=fld('Última palavra',L.last_word,'');edBox.appendChild(g);
    var chips=el('div','cc-seg');edBox.appendChild(chips);
    function suggest(){chips.textContent='';if(ES)return;var v=nrm(iW.value);if(!v||!+stSel.value)return;loadIdx(function(X){var m=X&&X[edSel.value]&&X[edSel.value][String(stSel.value)];if(!m)return;var c=m[v];if(!c){var k=Object.keys(m).filter(function(w){return w.indexOf(v)===0||(' '+w).indexOf(' '+v)>=0;}).slice(0,3);if(k.length===1)c=m[k[0]];}
      if(!c||!c.length){chips.appendChild(el('span','cc-m','Palavra não achada no índice do Stage '+stSel.value+' ('+(edSel.value==='e3'?'3ª':'2ª')+' edição): digite o parágrafo.'));return;}
      var tg=+iP.value||0,best=c.slice().sort(function(a,b){return Math.abs(a-tg)-Math.abs(b-tg);})[0];if(!iP.dataset.manual)iP.value=best;
      if(c.length>1){chips.appendChild(el('span','cc-m','Parágrafo provável:'));c.slice(0,5).forEach(function(n){var b=el('button',String(n)===iP.value?'on':'',String(n));b.type='button';b.onclick=function(){iP.value=n;delete iP.dataset.manual;suggest();};chips.appendChild(b);});}});}
    var tmr=null;iW.addEventListener('input',function(){clearTimeout(tmr);tmr=setTimeout(suggest,250);});iP.addEventListener('input',function(){iP.dataset.manual=1;});edSel.onchange=suggest;
    var tk=el('div','cc-tk'),tg2=el('div','cc-g');tk.appendChild(el('div','cc-k','Tarefas da aula'));
    function tf(lab,val){var l=el('label',null,lab),i=D.createElement('input');i.type='text';i.value=val||'';l.appendChild(i);tg2.appendChild(l);return i;}
    var iR=tf('Leitura nº',L.reading),iD=tf('Ditado nº',L.dictation),iC=tf('Lesson Check',L.lesson_check);tk.appendChild(tg2);tk.appendChild(el('div','cc-m','Preenchido pelo plano; apague o que não foi dado (volta na próxima aula).'));edBox.appendChild(tk);
    fillTasks=function(){var r=prow(stSel.value,+nIn.value);if(!r)return;
      /* leitura/ditado de aula anterior que nao foi dado (numero ainda na planilha, sem Done): entra no lugar do da aula, nunca pulado */
      var pn=x.pend&&x.plan&&+nIn.value===+x.plan.n?x.pend:{};
      if(!iR.dataset.t){var pR=pn.read;iR.value=pR?String(pR.val):dash(r.read);iR.dataset.pend=pR?pR.row:'';iR.dataset.pv=pR?String(pR.val):'';mkPl(iR,iR.value);}
      if(!iD.dataset.t){var pD=pn.dict;iD.value=pD?String(pD.val):dash(r.dict);iD.dataset.pend=pD?pD.row:'';iD.dataset.pv=pD?String(pD.val):'';mkPl(iD,iD.value);}if(!iC.dataset.t){iC.value=dash(r.lc);mkPl(iC,iC.value);}};
    /* valor vindo do plano: cinza/itálico até você editar */
    function mkPl(i,v){if(v){i.dataset.plan=1;i.classList.add('cc-plan');}else{delete i.dataset.plan;i.classList.remove('cc-plan');}}
    function unPl(i){delete i.dataset.plan;i.classList.remove('cc-plan');}
    [iL,iP,iW,iR,iD,iC].forEach(function(i){i.addEventListener('input',function(){unPl(i);if(i===iR||i===iD||i===iC)i.dataset.t=1;refreshSum();});});
    function planFill(force){var pl=x.plan||{},m=/LESSON\s*(\d+)/i.exec(ctOf()||''),okN=pl.n==null||+nIn.value===+pl.n;
      function put(i,v){if(v==null||v==='')return;if(force||!i.value.trim()||i.dataset.plan){i.value=v;mkPl(i,v);}}
      put(iL,m?m[1]:'');if(okN){put(iP,pl.par);put(iW,pl.word);}}
    if(!saved){fillTasks();planFill(false);}
    nIn.addEventListener('change',function(){if(!iL.value||iL.dataset.auto){var m=/LESSON\s*(\d+)/i.exec(plan(stSel.value,+nIn.value));if(m){iL.value=m[1];iL.dataset.auto=1;}}});
    iL.addEventListener('input',function(){delete iL.dataset.auto;});
    var FL=[iL,iP,iW,iR,iD,iC],snap=null,edBtn=el('button','cc-edit');edBtn.type='button';edBtn.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>';edBtn.appendChild(D.createTextNode(' Editar'));
    function refreshSum(){if(!x.slot)return;sumT.textContent=ctOf()||'Sem conteúdo indicado pelo plano';var pr=[];
      if(iP.value.trim())pr.push('par. '+iP.value.trim());if(iW.value.trim())pr.push('última palavra: '+iW.value.trim());if(iL.value.trim())pr.push('Lesson '+iL.value.trim());if(iR.value.trim())pr.push('Leitura '+iR.value.trim());if(iD.value.trim())pr.push('Ditado '+iD.value.trim());if(iC.value.trim())pr.push('Lesson Check '+iC.value.trim());
      sumS.textContent=pr.join(' · ')||'Nada indicado pelo plano';var pl=FL.some(function(i){return i.dataset.plan;});sumS.classList.toggle('pl',pl);
      sumG.textContent=pl?'Do plano. Clique em Editar para ajustar o que foi dado.':(saved?'Aula já registrada. Clique em Editar para ajustar.':'Editado por você.');}
    function openEd(o){edBox.hidden=!o;edBtn.hidden=o;if(o)snap=FL.map(function(i){return [i.value,i.dataset.plan?1:0,i.dataset.t?1:0];});refreshSum();}
    if(x.slot){
      var eb=el('div','cc-act'),bOk=el('button','cc-b go','Concluir edição'),bCx=el('button','cc-b','Cancelar'),bRs=el('button','cc-b','Restaurar plano');bOk.type=bCx.type=bRs.type='button';
      bOk.onclick=function(){openEd(false);};
      bCx.onclick=function(){if(snap)FL.forEach(function(i,k){i.value=snap[k][0];if(snap[k][1])mkPl(i,i.value||'x');else unPl(i);if(snap[k][2])i.dataset.t=1;else delete i.dataset.t;});openEd(false);suggest();};
      bRs.onclick=function(){[iR,iD,iC].forEach(function(i){delete i.dataset.t;});fillTasks();planFill(true);suggest();refreshSum();};
      eb.appendChild(bRs);eb.appendChild(el('span','sp'));eb.appendChild(bCx);eb.appendChild(bOk);edBox.appendChild(eb);cont.appendChild(edBox);
      edBtn.onclick=function(){openEd(true);};(x.btnHost||cont).appendChild(edBtn);
    }else{sumT.hidden=sumS.hidden=sumG.hidden=true;}
    var det=D.createElement('details'),sm2=el('summary','cc-m',group?'Anotação da aula (opcional)':'Anotação (opcional)'),ta=D.createElement('textarea');ta.value=L.note||'';det.appendChild(sm2);det.appendChild(ta);if(L.note)det.open=true;box.appendChild(det);
    var sgW=el('div','cc-tk'),sgR=el('div','cc-act'),sgK=D.createElement('select'),sgT=D.createElement('input');
    sgW.appendChild(el('div','cc-k','Sugestão para os alunos (opcional)'));
    [['song','Música'],['video','Vídeo'],['film','Filme'],['series','Série'],['podcast','Podcast'],['text','Leitura'],['game','Jogo'],['activity','Atividade']].forEach(function(k){var o3=D.createElement('option');o3.value=k[0];o3.textContent=k[1];sgK.appendChild(o3);});sgK.setAttribute('aria-label','Tipo da sugestão');
    sgT.type='text';sgT.placeholder='Link ou nome';sgT.maxLength=300;sgT.style.flex='1';sgT.setAttribute('aria-label','Link ou nome da sugestão');
    sgR.appendChild(sgK);sgR.appendChild(sgT);sgW.appendChild(sgR);sgW.appendChild(el('div','cc-m','Aparece no card "Sua aula de hoje" e na lição, nos parágrafos desta aula, e vai para a coluna Notes / Callan Method da planilha.'));box.appendChild(sgW);
    function parRange(){var n=+nIn.value,to=parseInt(iP.value,10)||0,from=0,bn=-1;logs.forEach(function(l){var c=l.class_number||0;if(l.user_id===u0&&l.status==='given'&&l.event_key!==key&&c<n&&c>bn&&parseInt(l.paragraph,10)){bn=c;from=parseInt(l.paragraph,10)+1;}});if(!from||from>to)from=to;return {from:from,to:to};}
    function notesFor(){var r=parRange();if(!r.to)return Promise.resolve('');var KN={song:'Song',video:'Video',film:'Film',series:'Series',podcast:'Podcast',text:'Reading',game:'Game',activity:'Activity'};
      return Promise.resolve(sb.from('class_suggestions').select('kind,title').eq('status','approved').lte('par_from',r.to).gte('par_to',r.from).order('created_at',{ascending:true})).then(function(q){return ((q&&q.data)||[]).map(function(z){return KN[z.kind]+': '+z.title;}).join(' | ');},function(){return '';});}
    function saveSug(){var v=sgT.value.trim(),r=parRange();if(!v||!r.to)return Promise.resolve();
      return Promise.resolve(sb.from('class_suggestions').insert({kind:sgK.value,title:v,par_from:r.from,par_to:r.to,status:'approved',source:'teacher'})).then(function(q){if(q&&q.error)throw q.error;sgT.value='';});}
    var ex=el('div','cc-seg'),xc={};
    function ckx(k,txt,on){var l=el('label','cc-ck'),c=D.createElement('input');c.type='checkbox';c.checked=on;l.appendChild(c);l.appendChild(D.createTextNode(' '+txt));ex.appendChild(l);xc[k]=c;l.hidden=false;return l;}
    var thm=D.createElement('input');thm.type='text';thm.placeholder='Tema da conversação';thm.style.display='none';
    function ctOf(){var nx=((x.prog[u0]||{}).data||{}).nextClass;return nx&&+nx.classNumber===+nIn.value?String(nx.contents||''):plan(stSel.value,+nIn.value);}
    var lRev=null;
    if(sheet){ckx('ins','Não deu tempo de terminar (adicionar nova linha)',false);ckx('conv','Aula de conversação (conta como dada)',false);lRev=ckx('rev','Terminei a revisão do Stage (liberar a prova)',false);ex.appendChild(thm);
      xc.conv.onchange=function(){thm.style.display=xc.conv.checked?'':'none';};
      var tgl=function(){lRev.hidden=!/FULL\s*REVISION|REVIS/i.test(ctOf())||/OFFICIAL.*EXAM|MOCK\s*EXAM/i.test(ctOf());};tgl();var f0=fillTasks;fillTasks=function(){f0();tgl();};
      top.appendChild(ex);box.appendChild(el('div','cc-m','Ao salvar, os dados também vão para a aba "'+sheet+'" (parágrafo, última palavra, leitura, ditado, presença e data; o Completed e a % de presença a planilha calcula pela data). O Lesson Check fica só no app.'));}
    var act=el('div','cc-act'),later=el('button','cc-b','Depois'),go=el('button','cc-b go','Salvar aula'),st=el('span','cc-m');later.type=go.type='button';
    later.onclick=function(){box.style.display='none';};
    /* Faltou/Remarcada: nada do que veio do plano e gravado; "Aula incompleta" tambem nao grava par./palavra se ainda sao os do plano */
    function gv(i,s){return s==='given'?(i.value.trim()||null):null;}
    function gvp(i,s){return s==='given'&&!(xc.ins&&xc.ins.checked&&i.dataset.plan)?(i.value.trim()||null):null;}
    var CRN='Remarcada no Fechar a aula';
    function syncCredit(){if(group)return 0;
      return Promise.resolve(sb.from('class_credits').select('id,made_up_at,note').eq('user_id',u0).eq('event_id',key)).then(function(r){var ex=(r&&r.data)||[];
        if(status==='rescheduled'){if(ex.length)return 0;return Promise.resolve(sb.from('class_credits').insert({user_id:u0,event_id:key,title:(x.ev&&x.ev.title)||'Aula',class_at:x.ev.start_at,note:CRN})).then(function(q){if(q&&q.error)throw q.error;});}
        var del=ex.filter(function(c){return !c.made_up_at&&c.note===CRN;}).map(function(c){return c.id;});
        return del.length?Promise.resolve(sb.from('class_credits').delete().in('id',del)).then(function(q){if(q&&q.error)throw q.error;}):0;});}
    var saveApp=function(cb){
      var n=+nIn.value,stg=+stSel.value,now=new Date().toISOString();if(!n){note('Informe o número da aula.','Falta o número');return;}
      var rows=[],att=[],prog=[];
      uids.forEach(function(u){var s=group?(isAbs(u)?'missed':'given'):status;
        rows.push({event_key:key,user_id:u,class_start:x.ev.start_at,stage:stg,class_number:n,status:s,lesson:gv(iL,s),paragraph:gvp(iP,s),last_word:gvp(iW,s),reading:gv(iR,s),dictation:gv(iD,s),lesson_check:gv(iC,s),edition:edSel.value,note:ta.value.trim()||null,updated_at:now});
        if(s==='given'&&!(x.att[u]&&x.att[u].status))att.push({event_key:key,user_id:u,status:'came',late_min:null,class_start:x.ev.start_at,updated_at:now});
        if(s==='missed'&&!(x.att[u]&&x.att[u].status==='ns'))att.push({event_key:key,user_id:u,status:'ns',late_min:null,class_start:x.ev.start_at,updated_at:now});});
      go.disabled=true;st.textContent='Salvando…';
      var P=function(q){return Promise.resolve(q).then(function(r){if(r&&r.error)throw r.error;return r;});};
      P(sb.from('class_log').upsert(rows)).then(function(){return syncCredit();}).then(function(){return att.length?P(sb.from('class_attendance').upsert(att)):0;}).then(function(){return status==='given'||group?saveSug():0;}).then(function(){
        return Promise.all(rows.map(function(r){var old=x.prog[r.user_id]||{},d=JSON.parse(JSON.stringify(old.data||{}));d.currentPosition=d.currentPosition||{};d.me=d.me||{};d.me.missed=(d.me.missed||[]).filter(function(m){return m.classNumber!==n;});
          if(r.status==='given'){var cp=d.currentPosition;cp.classNumber=n;if(r.lesson)cp.lesson=r.lesson;if(r.paragraph)cp.paragraph=r.paragraph;if(r.last_word)cp.lastWord=r.last_word;if(r.reading)cp.reading=r.reading;if(r.dictation)cp.dictation=r.dictation;if(r.lesson_check)cp.lessonCheck=r.lesson_check;d.classesDone=Math.max(d.classesDone||0,n);}
          else if(r.status==='missed')d.me.missed.push({classNumber:n,lesson:r.lesson||''});
          var lnum=parseInt(r.lesson,10);/* plan_progress.lesson é número: texto como "TM" fica só no histórico (class_log) */
          var row={user_id:r.user_id,stage:stg,lesson:r.status==='given'&&lnum>0?lnum:old.lesson||null,class_number:r.status==='given'?n:old.class_number||null,last_word:r.status==='given'&&r.last_word?r.last_word:old.last_word||null,data:d,updated_at:now};
          x.prog[r.user_id]=row;return P(sb.from('plan_progress').upsert(row,{onConflict:'user_id'}));}));
      }).then(function(){go.disabled=false;st.textContent='';box.firstChild.textContent='Fechar a aula · salva ✓';try{document.dispatchEvent(new CustomEvent('bl-class-closed'));}catch(e){}if(cb)cb();else note('Aula '+n+' salva no app ✓','Aula salva',3000);},function(e){go.disabled=false;st.textContent='';note('Não foi possível salvar ('+((e&&e.message)||'erro')+').\n\nToque em Salvar aula para tentar de novo.','Não salvou');});};
    function ymd(){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(new Date(x.ev.start_at));}
    function pushSheet(keep){
      var n=+nIn.value,fn=function(u){return String(x.name(u)).trim().split(/\s+/)[0];},a={},late={},nsAll=true,ct=ctOf(),isMock=/MOCK\s*EXAM/i.test(ct),isRev=!isMock&&!/OFFICIAL.*EXAM/i.test(ct)&&/FULL\s*REVISION|REVIS/i.test(ct);
      uids.forEach(function(u){var came=group?!isAbs(u):status==='given',at=x.att[u];if(came)nsAll=false;a[fn(u)]=came&&!(at&&at.status==='ns');if(at&&at.status==='late')late[fn(u)]=at.late_min||10;});
      var pl={sheetName:sheet,lesson:n,date:ymd(),attendance:a};if(Object.keys(late).length)pl.late=late;
      if(nsAll){pl.paragraph='NS';pl.lastWord='NO SHOW';pl.insert=true;}
      else if(xc.conv&&xc.conv.checked){pl.conversation=true;pl.theme=thm.value.trim();pl.insert=true;pl.paragraph='E';pl.lastWord='CONVERSATION';}
      else{if(!keep){var pp=gvp(iP,'given'),ww=gvp(iW,'given');if(pp)pl.paragraph=pp;if(ww)pl.lastWord=ww;}if(xc.ins&&xc.ins.checked)pl.insert=true;var pvR=iR.dataset.pend&&iR.value.trim()===iR.dataset.pv,pvD=iD.dataset.pend&&iD.value.trim()===iD.dataset.pv;
        if(pvR)pl.resolveRead=+iR.dataset.pend;else if(iR.value.trim())pl.readingGiven=true;
        if(pvD)pl.resolveDict=+iD.dataset.pend;else if(iD.value.trim())pl.dictationGiven=true;pl.lessonCheck=iC.value.trim()||'—';if(pl.readingGiven||pl.dictationGiven)pl.done=true;}
      st.textContent='Enviando à planilha…';
      return notesFor().then(function(nt){if(nt)pl.notes=nt;return sb.functions.invoke('sheet-push',{body:pl});}).then(function(r){var q=r&&r.data;
        if(q&&q.ok){st.textContent='';var ex=[];
          var sum=function(){var L=['Aula '+n+' salva no app e na planilha ✓'],pc=[];if(pl.paragraph)pc.push('par. '+pl.paragraph);if(pl.lastWord)pc.push('última palavra: '+pl.lastWord);if(pc.length)L.push(pc.join(' · '));
            var ab=Object.keys(a).filter(function(k){return !a[k];}),pr=Object.keys(a).filter(function(k){return a[k];});if(pr.length)L.push('Presente: '+pr.join(', '));if(ab.length)L.push('Faltou: '+ab.join(', '));
            if(pl.lessonCheck&&pl.lessonCheck!=='—')L.push('Lesson Check: '+pl.lessonCheck);if(q.inserted)L.push('Nova linha adicionada na planilha');return L.concat(ex).join('\n');};
          var gv=uids.filter(function(u){return group?!isAbs(u):status==='given';});
          if(+stSel.value&&gv.length&&(isMock||(isRev&&xc.rev&&xc.rev.checked))){return sb.from('exam_release').upsert(gv.map(function(u){return {user_id:u,stage:+stSel.value};}),{onConflict:'user_id,stage',ignoreDuplicates:true}).then(function(z){ex.push(z&&z.error?'Não consegui liberar a prova':'Prova do Stage '+stSel.value+' liberada');note(sum(),'Aula salva',3500);});}
          note(sum(),'Aula salva',3500);return;}
        var e=q&&q.error,m={aba_nao_encontrada:'a aba não foi encontrada na planilha',licao_nao_encontrada:'a aula não foi achada na coluna Lesson',forbidden:'senha do script não confere',not_configured:'planilha não configurada'};
        st.textContent='';note('A aula foi salva no app, mas não foi para a planilha'+(e?' ('+(m[e]||e)+')':'')+'.\n\nToque em Salvar aula para tentar outra vez.','Planilha não atualizada');},function(){st.textContent='';note('A aula foi salva no app, mas sem conexão com a planilha.\n\nToque em Salvar aula para tentar outra vez.','Sem conexão');});}
    go.onclick=function(){
      var n=+nIn.value;if(!n){note('Informe o número da aula.','Falta o número');return;}
      if(!sheet||status!=='given'&&!group){saveApp(sheet&&status==='missed'?function(){pushSheet(false);}:null);return;}
      var cp=(((x.prog[u0]||{}).data||{}).currentPosition)||{},sp=cp.paragraph!=null?String(cp.paragraph):'',sw=cp.lastWord!=null?String(cp.lastWord):'',ap=gvp(iP,'given')||'',aw=gvp(iW,'given')||'';
      var diff=+cp.classNumber===n&&((sp&&ap&&sp!==ap)||(sw&&aw&&sw.toLowerCase()!==aw.toLowerCase()));
      var go2=function(keep){if(keep){if(sp)iP.value=sp;if(sw)iW.value=sw;}saveApp(function(){pushSheet(keep);});};
      if(!diff){go2(false);return;}
      var dlg=window.BL_DLG?BL_DLG.confirm('A planilha já tem esta aula com outro valor.\n\nPlanilha: par. '+(sp||'—')+' · '+(sw||'—')+'\nApp: par. '+(ap||'—')+' · '+(aw||'—')+'\n\nOK usa o do app e atualiza a planilha. Cancelar mantém o da planilha.',{title:'Dados diferentes',ok:'Usar o do app',cancel:'Manter o da planilha',danger:false}):Promise.resolve(true);
      dlg.then(function(useApp){go2(!useApp);});};
    /* Combinar reposição / Lembrar de estudar: VIP = texto no grupo de WhatsApp (fila invite_sent, mesmo caminho do convite); não VIP = push no app */
    function sendMsg(kind){
      var pf=(x.profiles?x.profiles():[]).filter(function(p){return p.id===u0;})[0]||{},tz=pf.tz||SP,vip=!group&&/\sVIP\b/i.test(sheet||''),stg=+stSel.value||0,lang=(!ES&&stg>=3)?'en':'pt';
      var c={name:fn1(x.name(u0)),iso:x.ev.start_at,tz:tz,past:new Date(x.ev.start_at)<new Date(),slotIso:null};
      if(vip&&!pf.wa_group){note('Não há nome de grupo do WhatsApp cadastrado para '+c.name+'.\n\nCadastre em Alunos, no campo do grupo, e tente de novo.','Sem grupo de WhatsApp');return;}
      if(!W.BL_DLG){note('A janela de confirmação não carregou. Recarregue a página.','Aguarde');return;}
      var node=el('div'),ta=el('textarea','cc-mt'),hn=el('p','cc-hn'),lg=el('div','cc-lg'),bs={};
      function regen(){ta.value=vip?buildMsg(kind,lang,c):pushMsg(kind,c);}
      if(vip&&!ES){lg.appendChild(el('span',null,'Idioma'));[['pt','Português'],['en','English']].forEach(function(k){var b=el('button',lang===k[0]?'on':'',k[1]);b.type='button';b.onclick=function(){lang=k[0];Object.keys(bs).forEach(function(z){bs[z].classList.toggle('on',z===lang);});regen();};bs[k[0]]=b;lg.appendChild(b);});lg.appendChild(el('span','cc-m',stg>=3?'(Stage 3 ou mais: padrão inglês)':'(Stage 1 e 2: padrão português)'));node.appendChild(lg);}
      node.appendChild(ta);node.appendChild(hn);
      var hSP=+new Intl.DateTimeFormat('en-GB',{timeZone:SP,hour:'2-digit',hourCycle:'h23'}).format(new Date()),late=hSP<9||hSP>=19;
      hn.textContent=vip?('Será enviada ao grupo de WhatsApp "'+pf.wa_group+'"'+(late?'. Agora está fora do horário de 9h às 19h: ela sai a partir das 9h.':'.')):'Aluno não VIP: só o push do app é enviado (em português).';
      if(kind==='repo')hn.textContent+=' O crédito de reposição é criado quando você salva a aula como Remarcada.';
      regen();
      if(vip&&kind==='repo'){hn.textContent+=' Buscando horários livres…';
        Promise.resolve(sb.functions.invoke('gcal-book',{body:{action:'slots'}})).then(function(r){var all=((r&&r.data&&r.data.slots)||[]).slice().sort(),lim=Date.now()+12*36e5,seen={},pick=[];
          all.forEach(function(i){var t=new Date(i);if(t.getTime()<lim||t.getMinutes()!==0||pick.length>=3)return;var d=wdm(i,tz,'en');if(seen[d])return;seen[d]=1;pick.push(i);});
          c.slotIso=pick.length?pick:null;hn.textContent=hn.textContent.replace(' Buscando horários livres…',pick.length?'':' Não achei horários livres na Agenda: a mensagem manda só o link do app.');if(!ta.dataset.t)regen();},function(){hn.textContent=hn.textContent.replace(' Buscando horários livres…',' Não consegui buscar horários livres: a mensagem manda só o link do app.');});}
      ta.addEventListener('input',function(){ta.dataset.t=1;});
      BL_DLG.confirm('',{title:kind==='repo'?'Combinar reposição':'Lembrar de estudar',node:node,ok:vip?'Enviar ao WhatsApp':'Enviar push',cancel:'Cancelar',danger:false}).then(function(y){
        var txt=ta.value.trim();if(!y||!txt)return;
        var job=vip?sb.from('invite_sent').upsert({event_key:key+'|'+new Date(x.ev.start_at).toISOString(),kind:kind,via:'app',status:'now',text_sent:txt,sent_at:new Date().toISOString()}):sb.rpc('teacher_msg',{p_user:u0,p_body:txt,p_url:'index.html'});
        Promise.resolve(job).then(function(r){if(r&&r.error)throw r.error;note(vip?'Mensagem na fila para o grupo "'+pf.wa_group+'" ✓\n'+(late?'Ela sai a partir das 9h.':'O envio acontece em instantes.'):'Push enviado para '+c.name+' ✓','Pronto',3500);},function(e){note('Não foi possível enviar ('+((e&&e.message)||'erro')+').','Não enviou');});});}
    var ox=D.createElement('details'),oxs=el('summary','cc-m','Outras ações da aula'),oxa=el('div','cc-act'),oxr=el('button','cc-b','Remarcar'),oxc=el('button','cc-b','Cancelar aula');
    oxs.style.cursor='pointer';oxa.style.marginTop='8px';oxc.style.borderColor='var(--bad)';oxc.style.color='var(--bad)';oxr.type=oxc.type='button';
    var oxNames=uids.map(function(u){try{return String(x.name(u)).trim().split(/\s+/)[0];}catch(e){return '';}}).filter(Boolean).join(', ');
    function oxGo(mode){if(!W.Agenda||!W.Agenda.change){note('A Agenda ainda não carregou. Abra a aba Agenda e tente de novo.','Aguarde');return;}
      W.Agenda.change({k:key,start_at:x.ev&&x.ev.start_at,title:x.ev&&x.ev.title},mode,oxNames,uids,function(){box.style.display='none';});}
    oxr.onclick=function(){oxGo(uids.length>1?'move':'ask');};oxc.onclick=function(){oxGo('cancel');};
    oxa.appendChild(oxr);oxa.appendChild(oxc);ox.appendChild(oxs);ox.appendChild(oxa);box.appendChild(ox);
    act.appendChild(later);act.appendChild(el('span','sp'));act.appendChild(st);act.appendChild(go);box.appendChild(act);paint();refreshSum();
  });
}
W.BL_CLOSE={render:render};
})(window);
