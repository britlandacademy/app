/* Painel do professor · "Fechar a aula": registra no app (sem planilha) o que foi dado, onde parou e a presença. */
(function(W){
'use strict';
var D=document;
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
'.cc .cc-act{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.cc .cc-act .sp{flex:1}.cc .cc-b{min-height:40px;padding:0 20px;border-radius:99px;font:inherit;font-weight:700;cursor:pointer;border:2px solid var(--line);background:transparent;color:var(--ink)}.cc .cc-b.go{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}';
D.head.appendChild(s);}
function prow(stage,n){var P=W.BL_PLANS&&W.BL_PLANS[String(stage)];return (P&&P.rows&&P.rows[n-1])||null;}
function plan(stage,n){var r=prow(stage,n);return r?r.c:'';}
function dash(v){v=String(v==null?'':v).trim();return /^[—–-]*$/.test(v)?'':v;}
var IDXQ=null;function loadIdx(cb){if(W.BL_WORDIDX)return cb(W.BL_WORDIDX);if(!IDXQ){IDXQ=[];var sc=D.querySelector('script[src*="closeclass.js"]'),base=sc?sc.src.replace(/closeclass\.js.*$/,''):'js/',t=D.createElement('script');t.src=base+'wordidx.js';t.onload=function(){var q=IDXQ;IDXQ=null;q.forEach(function(f){f(W.BL_WORDIDX);});};t.onerror=function(){var q=IDXQ;IDXQ=null;q.forEach(function(f){f(null);});};D.head.appendChild(t);}IDXQ.push(cb);}
function nrm(x){return String(x).trim().toLowerCase().replace(/\u2019/g,"'");}
function render(host,x){css();
  var sb=x.sb,uids=x.uids,group=uids.length>1,key=x.key,box=el('div','cc');host.appendChild(box);
  Promise.all([sb.from('class_log').select('*').in('user_id',uids).order('class_start',{ascending:false}).limit(200),
    sb.from('plan_links').select('user_id,sheet_name').in('user_id',uids)].map(function(q){return Promise.resolve(q).then(function(r){return r&&!r.error?r.data||[]:[];},function(){return [];});})).then(function(a){
    var logs=a[0],mine={},maxN=0;logs.forEach(function(l){if(l.event_key===key)mine[l.user_id]=l;if(l.status==='given'&&l.class_number>maxN&&l.event_key!==key)maxN=l.class_number;});
    var u0=uids[0],pr=(x.prog[u0]||{}),sm=a[1][0]&&/(?:stage|stg)\s*(\d+)/i.exec(a[1][0].sheet_name||'');
    var stage=+((mine[u0]&&mine[u0].stage)||pr.stage||(sm?sm[1]:0))||0,num=(mine[u0]&&mine[u0].class_number)||Math.max(maxN,+pr.class_number||0)+1;
    var sheet=(a[1][0]&&a[1][0].sheet_name)||'',ed=(mine[u0]&&mine[u0].edition)||(/2nd/i.test(sheet)?'e2':'e3');
    var absent={},status='given',saved=!!mine[u0];uids.forEach(function(u){if(mine[u]&&mine[u].status!=='given')absent[u]=1;});
    if(!group&&mine[u0])status=mine[u0].status;
    box.appendChild(el('div','cc-k','Fechar a aula'+(saved?' · salva ✓':'')));
    var fal=uids.filter(function(u){var r=logs.filter(function(l){return l.user_id===u&&l.event_key!==key&&(l.status==='given'||l.status==='missed');}).sort(function(a,b){return (b.class_number||0)-(a.class_number||0);}).slice(0,2);return r.length===2&&r[0].status==='missed'&&r[1].status==='missed';});
    if(fal.length){var al=el('div','cc-m','⚠ '+fal.map(x.name).join(', ')+' faltou às duas últimas aulas dadas: vale entrar em contato.');al.style.color='var(--warn)';al.style.fontWeight='700';box.appendChild(al);try{var kk='cc-fal-'+fal.join(',')+'-'+new Date().toISOString().slice(0,10);if(!localStorage.getItem(kk)){localStorage.setItem(kk,'1');setTimeout(function(){note(fal.map(x.name).join(', ')+' faltou às duas últimas aulas dadas.\n\nVale entrar em contato.','Atenção');},400);}}catch(e){}}
    var top=el('div','cc-act'),stSel=D.createElement('select');for(var s=1;s<=12;s++){var o=D.createElement('option');o.value=s;o.textContent='Stage '+s;stSel.appendChild(o);}stSel.value=stage||6;stSel.setAttribute('aria-label','Stage');var edSel=D.createElement('select');[['e3','3ª edição'],['e2','2ª edição']].forEach(function(e){var o2=D.createElement('option');o2.value=e[0];o2.textContent=e[1];edSel.appendChild(o2);});edSel.value=ed;edSel.setAttribute('aria-label','Edição');
    var nIn=D.createElement('input');nIn.type='number';nIn.min=1;nIn.value=num;nIn.style.width='80px';nIn.setAttribute('aria-label','Número da aula');
    top.appendChild(stSel);top.appendChild(edSel);top.appendChild(el('span','cc-m','aula nº'));top.appendChild(nIn);box.appendChild(top);
    var hint=el('div','cc-m');box.appendChild(hint);
    function setHint(){var t=plan(stSel.value,+nIn.value);hint.textContent=t?'Plano do Stage '+stSel.value+' · aula '+nIn.value+': '+t:'';}var fillTasks=function(){};stSel.onchange=nIn.onchange=function(){setHint();fillTasks();};setHint();
    var ctl=el('div','cc-seg'),btns={};
    function paint(){
      if(group){ctl.textContent='';uids.forEach(function(u){var b=el('button','cc-pill '+(absent[u]?'no':'ok'),(absent[u]?'':'✓ ')+x.name(u));b.type='button';b.onclick=function(){absent[u]=!absent[u];paint();};ctl.appendChild(b);});
        var ab=uids.filter(function(u){return absent[u];});msg.textContent=ab.length?ab.map(x.name).join(', ')+' vai ficar com a aula '+nIn.value+' em perdidas para revisar':'Toque no nome de quem faltou.';return;}
      Object.keys(btns).forEach(function(k){btns[k].classList.toggle('on',status===k);});}
    var msg=el('div','cc-m');
    if(!group){[['given','Dada',''],['missed','Faltou','bad'],['rescheduled','Remarcada','warn']].forEach(function(k){var b=el('button',k[2],k[1]);b.type='button';b.onclick=function(){status=k[0];paint();};btns[k[0]]=b;ctl.appendChild(b);});}
    box.appendChild(ctl);box.appendChild(msg);
    var g=el('div','cc-g'),L=mine[u0]||{};
    function fld(lab,val,ph){var l=el('label',null,lab),i=D.createElement('input');i.type='text';i.value=val||'';if(ph)i.placeholder=ph;l.appendChild(i);g.appendChild(l);return i;}
    var iL=fld('Lesson',L.lesson,''),iP=fld('Parágrafo',L.paragraph,''),iW=fld('Última palavra',L.last_word,'');box.appendChild(g);
    var chips=el('div','cc-seg');box.appendChild(chips);
    function suggest(){chips.textContent='';var v=nrm(iW.value);if(!v||!+stSel.value)return;loadIdx(function(X){var m=X&&X[edSel.value]&&X[edSel.value][String(stSel.value)];if(!m)return;var c=m[v];if(!c){var k=Object.keys(m).filter(function(w){return w.indexOf(v)===0||(' '+w).indexOf(' '+v)>=0;}).slice(0,3);if(k.length===1)c=m[k[0]];}
      if(!c||!c.length){chips.appendChild(el('span','cc-m','Palavra não achada no índice do Stage '+stSel.value+' ('+(edSel.value==='e3'?'3ª':'2ª')+' edição): digite o parágrafo.'));return;}
      var tg=+iP.value||0,best=c.slice().sort(function(a,b){return Math.abs(a-tg)-Math.abs(b-tg);})[0];if(!iP.dataset.manual)iP.value=best;
      if(c.length>1){chips.appendChild(el('span','cc-m','Parágrafo provável:'));c.slice(0,5).forEach(function(n){var b=el('button',String(n)===iP.value?'on':'',String(n));b.type='button';b.onclick=function(){iP.value=n;delete iP.dataset.manual;suggest();};chips.appendChild(b);});}});}
    var tmr=null;iW.addEventListener('input',function(){clearTimeout(tmr);tmr=setTimeout(suggest,250);});iP.addEventListener('input',function(){iP.dataset.manual=1;});edSel.onchange=suggest;
    var tk=el('div','cc-tk'),tg2=el('div','cc-g');tk.appendChild(el('div','cc-k','Tarefas da aula'));
    function tf(lab,val){var l=el('label',null,lab),i=D.createElement('input');i.type='text';i.value=val||'';l.appendChild(i);tg2.appendChild(l);return i;}
    var iR=tf('Leitura nº',L.reading),iD=tf('Ditado nº',L.dictation),iC=tf('Lesson Check',L.lesson_check);tk.appendChild(tg2);tk.appendChild(el('div','cc-m','Preenchido pelo plano; apague o que não foi dado.'));box.appendChild(tk);
    fillTasks=function(){var r=prow(stSel.value,+nIn.value);if(!r)return;if(!iR.dataset.t){iR.value=dash(r.read);}if(!iD.dataset.t){iD.value=dash(r.dict);}if(!iC.dataset.t){iC.value=dash(r.lc);}};
    [iR,iD,iC].forEach(function(i){i.addEventListener('input',function(){i.dataset.t=1;});});if(!saved)fillTasks();
    nIn.addEventListener('change',function(){if(!iL.value||iL.dataset.auto){var m=/LESSON\s*(\d+)/i.exec(plan(stSel.value,+nIn.value));if(m){iL.value=m[1];iL.dataset.auto=1;}}});
    iL.addEventListener('input',function(){delete iL.dataset.auto;});
    var det=D.createElement('details'),sm2=el('summary','cc-m',group?'Anotação da aula (opcional)':'Anotação (opcional)'),ta=D.createElement('textarea');ta.value=L.note||'';det.appendChild(sm2);det.appendChild(ta);if(L.note)det.open=true;box.appendChild(det);
    var sgW=el('div','cc-tk'),sgR=el('div','cc-act'),sgK=D.createElement('select'),sgT=D.createElement('input');
    sgW.appendChild(el('div','cc-k','Sugestão para os alunos (opcional)'));
    [['song','Música'],['video','Vídeo'],['film','Filme'],['activity','Atividade']].forEach(function(k){var o3=D.createElement('option');o3.value=k[0];o3.textContent=k[1];sgK.appendChild(o3);});sgK.setAttribute('aria-label','Tipo da sugestão');
    sgT.type='text';sgT.placeholder='Link ou nome';sgT.maxLength=300;sgT.style.flex='1';sgT.setAttribute('aria-label','Link ou nome da sugestão');
    sgR.appendChild(sgK);sgR.appendChild(sgT);sgW.appendChild(sgR);sgW.appendChild(el('div','cc-m','Aparece no card "Sua aula de hoje" e na lição, nos parágrafos desta aula, e vai para a coluna Notes / Callan Method da planilha.'));box.appendChild(sgW);
    function parRange(){var n=+nIn.value,to=parseInt(iP.value,10)||0,from=0,bn=-1;logs.forEach(function(l){var c=l.class_number||0;if(l.user_id===u0&&l.status==='given'&&l.event_key!==key&&c<n&&c>bn&&parseInt(l.paragraph,10)){bn=c;from=parseInt(l.paragraph,10)+1;}});if(!from||from>to)from=to;return {from:from,to:to};}
    function notesFor(){var r=parRange();if(!r.to)return Promise.resolve('');var KN={song:'Song',video:'Video',film:'Film',activity:'Activity'};
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
      box.appendChild(ex);box.appendChild(el('div','cc-m','Ao salvar, os dados também vão para a aba "'+sheet+'" (parágrafo, última palavra, leitura, ditado, presença e data; o Completed e a % de presença a planilha calcula pela data). O Lesson Check fica só no app.'));}
    var act=el('div','cc-act'),later=el('button','cc-b','Depois'),go=el('button','cc-b go','Salvar aula'),st=el('span','cc-m');later.type=go.type='button';
    later.onclick=function(){box.style.display='none';};
    var saveApp=function(cb){
      var n=+nIn.value,stg=+stSel.value,now=new Date().toISOString();if(!n){note('Informe o número da aula.','Falta o número');return;}
      var rows=[],att=[],prog=[];
      uids.forEach(function(u){var s=group?(absent[u]?'missed':'given'):status;
        rows.push({event_key:key,user_id:u,class_start:x.ev.start_at,stage:stg,class_number:n,status:s,lesson:iL.value.trim()||null,paragraph:iP.value.trim()||null,last_word:iW.value.trim()||null,reading:iR.value.trim()||null,dictation:iD.value.trim()||null,lesson_check:iC.value.trim()||null,edition:edSel.value,note:ta.value.trim()||null,updated_at:now});
        if(s==='given'&&!(x.att[u]&&x.att[u].status))att.push({event_key:key,user_id:u,status:'came',late_min:null,class_start:x.ev.start_at,updated_at:now});
        if(s==='missed'&&!(x.att[u]&&x.att[u].status==='ns'))att.push({event_key:key,user_id:u,status:'ns',late_min:null,class_start:x.ev.start_at,updated_at:now});});
      go.disabled=true;st.textContent='Salvando…';
      var P=function(q){return Promise.resolve(q).then(function(r){if(r&&r.error)throw r.error;return r;});};
      P(sb.from('class_log').upsert(rows)).then(function(){return att.length?P(sb.from('class_attendance').upsert(att)):0;}).then(function(){return status==='given'||group?saveSug():0;}).then(function(){
        return Promise.all(rows.map(function(r){var old=x.prog[r.user_id]||{},d=JSON.parse(JSON.stringify(old.data||{}));d.currentPosition=d.currentPosition||{};d.me=d.me||{};d.me.missed=(d.me.missed||[]).filter(function(m){return m.classNumber!==n;});
          if(r.status==='given'){var cp=d.currentPosition;cp.classNumber=n;if(r.lesson)cp.lesson=r.lesson;if(r.paragraph)cp.paragraph=r.paragraph;if(r.last_word)cp.lastWord=r.last_word;if(r.reading)cp.reading=r.reading;if(r.dictation)cp.dictation=r.dictation;if(r.lesson_check)cp.lessonCheck=r.lesson_check;d.classesDone=Math.max(d.classesDone||0,n);}
          else if(r.status==='missed')d.me.missed.push({classNumber:n,lesson:r.lesson||''});
          var row={user_id:r.user_id,stage:stg,lesson:r.status==='given'&&r.lesson?r.lesson:old.lesson||null,class_number:r.status==='given'?n:old.class_number||null,last_word:r.status==='given'&&r.last_word?r.last_word:old.last_word||null,data:d,updated_at:now};
          x.prog[r.user_id]=row;return P(sb.from('plan_progress').upsert(row,{onConflict:'user_id'}));}));
      }).then(function(){go.disabled=false;st.textContent='';box.firstChild.textContent='Fechar a aula · salva ✓';if(cb)cb();else note('Aula '+n+' salva no app ✓','Aula salva',3000);},function(e){go.disabled=false;st.textContent='';note('Não foi possível salvar ('+((e&&e.message)||'erro')+').\n\nToque em Salvar aula para tentar de novo.','Não salvou');});};
    function ymd(){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(new Date(x.ev.start_at));}
    function pushSheet(keep){
      var n=+nIn.value,fn=function(u){return String(x.name(u)).trim().split(/\s+/)[0];},a={},late={},nsAll=true,ct=ctOf(),isMock=/MOCK\s*EXAM/i.test(ct),isRev=!isMock&&!/OFFICIAL.*EXAM/i.test(ct)&&/FULL\s*REVISION|REVIS/i.test(ct);
      uids.forEach(function(u){var came=group?!absent[u]:status==='given',at=x.att[u];if(came)nsAll=false;a[fn(u)]=came&&!(at&&at.status==='ns');if(at&&at.status==='late')late[fn(u)]=at.late_min||10;});
      var pl={sheetName:sheet,lesson:n,date:ymd(),attendance:a};if(Object.keys(late).length)pl.late=late;
      if(nsAll){pl.paragraph='NS';pl.lastWord='NO SHOW';pl.insert=true;}
      else if(xc.conv&&xc.conv.checked){pl.conversation=true;pl.theme=thm.value.trim();pl.insert=true;pl.paragraph='E';pl.lastWord='CONVERSATION';}
      else{if(!keep){if(iP.value.trim())pl.paragraph=iP.value.trim();if(iW.value.trim())pl.lastWord=iW.value.trim();}if(xc.ins&&xc.ins.checked)pl.insert=true;if(iR.value.trim())pl.readingGiven=true;if(iD.value.trim())pl.dictationGiven=true;pl.lessonCheck=iC.value.trim()||'—';if(pl.readingGiven||pl.dictationGiven)pl.done=true;}
      st.textContent='Enviando à planilha…';
      return notesFor().then(function(nt){if(nt)pl.notes=nt;return sb.functions.invoke('sheet-push',{body:pl});}).then(function(r){var q=r&&r.data;
        if(q&&q.ok){st.textContent='';var ex=[];
          var sum=function(){var L=['Aula '+n+' salva no app e na planilha ✓'],pc=[];if(pl.paragraph)pc.push('par. '+pl.paragraph);if(pl.lastWord)pc.push('última palavra: '+pl.lastWord);if(pc.length)L.push(pc.join(' · '));
            var ab=Object.keys(a).filter(function(k){return !a[k];}),pr=Object.keys(a).filter(function(k){return a[k];});if(pr.length)L.push('Presente: '+pr.join(', '));if(ab.length)L.push('Faltou: '+ab.join(', '));
            if(pl.lessonCheck&&pl.lessonCheck!=='—')L.push('Lesson Check: '+pl.lessonCheck);if(q.inserted)L.push('Nova linha adicionada na planilha');return L.concat(ex).join('\n');};
          var gv=uids.filter(function(u){return group?!absent[u]:status==='given';});
          if(+stSel.value&&gv.length&&(isMock||(isRev&&xc.rev&&xc.rev.checked))){return sb.from('exam_release').upsert(gv.map(function(u){return {user_id:u,stage:+stSel.value};}),{onConflict:'user_id,stage',ignoreDuplicates:true}).then(function(z){ex.push(z&&z.error?'Não consegui liberar a prova':'Prova do Stage '+stSel.value+' liberada');note(sum(),'Aula salva',3500);});}
          note(sum(),'Aula salva',3500);return;}
        var e=q&&q.error,m={aba_nao_encontrada:'a aba não foi encontrada na planilha',licao_nao_encontrada:'a aula não foi achada na coluna Lesson',forbidden:'senha do script não confere',not_configured:'planilha não configurada'};
        st.textContent='';note('A aula foi salva no app, mas não foi para a planilha'+(e?' ('+(m[e]||e)+')':'')+'.\n\nToque em Salvar aula para tentar outra vez.','Planilha não atualizada');},function(){st.textContent='';note('A aula foi salva no app, mas sem conexão com a planilha.\n\nToque em Salvar aula para tentar outra vez.','Sem conexão');});}
    go.onclick=function(){
      var n=+nIn.value;if(!n){note('Informe o número da aula.','Falta o número');return;}
      if(!sheet||status!=='given'&&!group){saveApp(sheet&&status==='missed'?function(){pushSheet(false);}:null);return;}
      var cp=(((x.prog[u0]||{}).data||{}).currentPosition)||{},sp=cp.paragraph!=null?String(cp.paragraph):'',sw=cp.lastWord!=null?String(cp.lastWord):'',ap=iP.value.trim(),aw=iW.value.trim();
      var diff=+cp.classNumber===n&&((sp&&ap&&sp!==ap)||(sw&&aw&&sw.toLowerCase()!==aw.toLowerCase()));
      var go2=function(keep){if(keep){if(sp)iP.value=sp;if(sw)iW.value=sw;}saveApp(function(){pushSheet(keep);});};
      if(!diff){go2(false);return;}
      var dlg=window.BL_DLG?BL_DLG.confirm('A planilha já tem esta aula com outro valor.\n\nPlanilha: par. '+(sp||'—')+' · '+(sw||'—')+'\nApp: par. '+(ap||'—')+' · '+(aw||'—')+'\n\nOK usa o do app e atualiza a planilha. Cancelar mantém o da planilha.',{title:'Dados diferentes',ok:'Usar o do app',cancel:'Manter o da planilha',danger:false}):Promise.resolve(true);
      dlg.then(function(useApp){go2(!useApp);});};
    act.appendChild(later);act.appendChild(el('span','sp'));act.appendChild(st);act.appendChild(go);box.appendChild(act);paint();
  });
}
W.BL_CLOSE={render:render};
})(window);
