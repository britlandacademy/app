/* Britland: lesson agenda (Google Calendar). Student card on the home page + teacher box in admin.
   Data comes from table `lessons`, filled by the edge function `gcal-sync`. Needs Gate.sb (Supabase client). */
(function(){
'use strict';
var C=window.BL_COURSE||{},KEY=C.langKey||'callan-lang';
var forced='';
function lang(){if(forced)return forced;var l='';try{l=localStorage.getItem(KEY)||'';}catch(e){}return /^(en|pt|es)$/.test(l)?l:(C.uiLang||'en');}
var S={
 title:{en:'My lessons',pt:'Minhas aulas',es:'Mis clases'},
 tz:{en:'Times shown in your time zone',pt:'Horários no seu fuso horário',es:'Horarios en tu zona horaria'},
 soon:{en:'Your lesson starts in {0} min',pt:'Sua aula começa em {0} min',es:'Tu clase empieza en {0} min'},
 now:{en:'Your lesson is happening now',pt:'Sua aula está acontecendo agora',es:'Tu clase está en curso'},
 join:{en:'Join lesson',pt:'Entrar na aula',es:'Entrar a la clase'},
 next:{en:'Upcoming lessons',pt:'Próximas aulas',es:'Próximas clases'},
 none:{en:'No lessons scheduled yet.',pt:'Nenhuma aula agendada ainda.',es:'Aún no hay clases programadas.'},
 aTitle:{en:'Lesson agenda (Google Calendar)',pt:'Agenda de aulas (Google Agenda)',es:'Agenda de clases (Google Calendar)'},
 aOff:{en:'Not connected yet.',pt:'Ainda não conectada.',es:'Aún no conectada.'},
 aOn:{en:'Connected to calendar: {0}',pt:'Conectada à agenda: {0}',es:'Conectada al calendario: {0}'},
 conn:{en:'Connect Google Calendar',pt:'Conectar Google Agenda',es:'Conectar Google Calendar'},
 reconn:{en:'Reconnect',pt:'Reconectar',es:'Reconectar'},
 sync:{en:'Sync now',pt:'Sincronizar agora',es:'Sincronizar ahora'},
 last:{en:'Last sync: {0}',pt:'Última sincronização: {0}',es:'Última sincronización: {0}'},
 err:{en:'Last error: {0}',pt:'Último erro: {0}',es:'Último error: {0}'},
 ok:{en:'Google Calendar connected.',pt:'Google Agenda conectada.',es:'Google Calendar conectado.'},
 nm:{en:'no student matched',pt:'nenhum aluno identificado',es:'ningún alumno identificado'},
 rs:{en:'Reschedule',pt:'Remarcar',es:'Reprogramar'},rsT:{en:'Reschedule lesson',pt:'Remarcar aula',es:'Reprogramar clase'},rsSoon:{en:'Rescheduling inside the app is coming soon. For now, message your teacher.',pt:'Remarcar pelo app chega em breve. Por enquanto, fale com o professor.',es:'Reprogramar desde la app llegará pronto. Por ahora, habla con tu profesor.'},

 bNew:{en:'Book a new lesson',pt:'Marcar nova aula',es:'Reservar una clase nueva'},
 bCur:{en:'Current lesson',pt:'Aula atual',es:'Clase actual'},
 bPick:{en:'Choose a new time',pt:'Escolha um novo horário',es:'Elige un nuevo horario'},
 bPickN:{en:'Choose a time',pt:'Escolha o horário',es:'Elige el horario'},
 bNote:{en:'Only free times are shown, in your time zone. You can reschedule or cancel up to 1 hour before the lesson.',pt:'Só aparecem horários livres, no seu fuso. Dá para remarcar ou cancelar até 1 hora antes da aula.',es:'Solo se muestran horarios libres, en tu zona horaria. Puedes reprogramar o cancelar hasta 1 hora antes de la clase.'},
 bNew2:{en:'New time',pt:'Novo horário',es:'Nuevo horario'},
 bAsk:{en:'REQUEST NEW TIME',pt:'PEDIR REMARCAÇÃO',es:'PEDIR CAMBIO'},
 bAskN:{en:'REQUEST LESSON',pt:'PEDIR AULA',es:'PEDIR CLASE'},
 bNoSlots:{en:'No free times right now. Please message your teacher.',pt:'Nenhum horário livre agora. Fale com o professor.',es:'No hay horarios libres ahora. Habla con tu profesor.'},
 bBack:{en:'Back',pt:'Voltar',es:'Volver'},
 sTitle:{en:'Request sent!',pt:'Pedido enviado!',es:'¡Pedido enviado!'},
 sBodyR:{en:'I asked your teacher to move your lesson to {0}. You will see the answer here in the app.',pt:'Pedi ao professor para mover sua aula para {0}. Você recebe a resposta aqui no app.',es:'Le pedí al profesor mover tu clase a {0}. Verás la respuesta aquí en la app.'},
 sBodyN:{en:'I asked your teacher for a lesson on {0}. You will see the answer here in the app.',pt:'Pedi ao professor uma aula em {0}. Você recebe a resposta aqui no app.',es:'Le pedí al profesor una clase el {0}. Verás la respuesta aquí en la app.'},
 sHold:{en:'Meanwhile the new time is held for you. With no answer in 24 h it becomes free again.',pt:'Enquanto isso, o horário novo fica reservado para você. Se não houver resposta em 24 h, ele volta a ficar livre.',es:'Mientras tanto el horario nuevo queda reservado. Sin respuesta en 24 h vuelve a quedar libre.'},
 sSit:{en:'Status',pt:'Situação',es:'Situación'},
 pend:{en:'Waiting for answer',pt:'Aguardando resposta',es:'Esperando respuesta'},
 sBackL:{en:'BACK TO LESSONS',pt:'VOLTAR ÀS AULAS',es:'VOLVER A LAS CLASES'},
 sWith:{en:'Withdraw request',pt:'Cancelar pedido',es:'Retirar pedido'},
 cx:{en:'Cancel lesson',pt:'Cancelar aula',es:'Cancelar clase'},
 cxQ:{en:'Cancel the lesson on {0}?',pt:'Cancelar a aula de {0}?',es:'¿Cancelar la clase del {0}?'},
 cxN:{en:'The time becomes free again. You cannot cancel less than 1 hour before the lesson.',pt:'O horário volta a ficar livre. Não dá para cancelar a menos de 1 hora da aula.',es:'El horario vuelve a quedar libre. No se puede cancelar a menos de 1 hora de la clase.'},
 cxYes:{en:'YES, CANCEL LESSON',pt:'SIM, CANCELAR AULA',es:'SÍ, CANCELAR CLASE'},
 newReq:{en:'New lesson',pt:'Aula nova',es:'Clase nueva'},
 okMsg:{en:'Your request for {0} was approved.',pt:'Seu pedido para {0} foi aprovado.',es:'Tu pedido para {0} fue aprobado.'},
 noMsg:{en:'Your request for {0} was declined. Pick another time or message your teacher.',pt:'Seu pedido para {0} foi recusado. Escolha outro horário ou fale com o professor.',es:'Tu pedido para {0} fue rechazado. Elige otro horario o habla con tu profesor.'},
 eTaken:{en:'That time was just taken. Pick another one.',pt:'Esse horário acabou de ser ocupado. Escolha outro.',es:'Ese horario acaba de ocuparse. Elige otro.'},
 eLate:{en:'Less than 1 hour is left, so this lesson can no longer be changed.',pt:'Falta menos de 1 hora, então esta aula não pode mais ser alterada.',es:'Falta menos de 1 hora, así que esta clase ya no se puede cambiar.'},
 ePend:{en:'This lesson already has a pending request.',pt:'Esta aula já tem um pedido aguardando resposta.',es:'Esta clase ya tiene un pedido pendiente.'},
 eMany:{en:'You already have 3 pending requests. Wait for an answer first.',pt:'Você já tem 3 pedidos aguardando resposta. Espere uma resposta antes.',es:'Ya tienes 3 pedidos pendientes. Espera una respuesta antes.'},
 eGroup:{en:'Group lessons are changed by your teacher only.',pt:'Aulas em turma só o professor altera.',es:'Las clases en grupo solo las cambia el profesor.'},
 gT:{en:'Groups',pt:'Turmas',es:'Grupos'},
 gH:{en:'Use the group name as it appears in the event title (e.g. BTS). All members then see the lesson.',pt:'Use o nome da turma como aparece no título do evento (ex.: BTS). Todos os membros passam a ver a aula.',es:'Usa el nombre del grupo como aparece en el título del evento (ej.: BTS). Todos los miembros verán la clase.'},
 gNew:{en:'New group',pt:'Nova turma',es:'Nuevo grupo'},gNm:{en:'Group name',pt:'Nome da turma (como no título)',es:'Nombre del grupo'},
 gSave:{en:'Save',pt:'Salvar',es:'Guardar'},gCan:{en:'Cancel',pt:'Cancelar',es:'Cancelar'},gEdit:{en:'Edit',pt:'Editar',es:'Editar'},
 gDel:{en:'Delete',pt:'Excluir',es:'Eliminar'},gSure:{en:'Sure? Tap again',pt:'Certeza? Toque de novo',es:'¿Seguro? Toca otra vez'},
 gNone:{en:'No groups yet.',pt:'Nenhuma turma ainda.',es:'Aún no hay grupos.'},gNoM:{en:'no members',pt:'sem alunos',es:'sin alumnos'},
 gErr:{en:'Enter a name and pick at least one student.',pt:'Informe o nome e marque ao menos um aluno.',es:'Escribe un nombre y marca al menos un alumno.'},
 busy:{en:'Working…',pt:'Aguarde…',es:'Espera…'},
 fail:{en:'Something went wrong. Try again.',pt:'Algo deu errado. Tente de novo.',es:'Algo salió mal. Inténtalo de nuevo.'}
};
function T(k,a){var s=(S[k]||{})[lang()]||(S[k]||{}).en||k;if(a!==undefined)s=s.replace('{0}',a);return s;}
function loc(){return {en:'en-GB',pt:'pt-BR',es:'es'}[lang()]||'en-GB';}
function fmt(iso){try{return new Intl.DateTimeFormat(loc(),{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(iso));}catch(e){return iso;}}
function fmtT(iso){try{return new Intl.DateTimeFormat(loc(),{hour:'2-digit',minute:'2-digit'}).format(new Date(iso));}catch(e){return '';}}
function el(t,c,x){var n=document.createElement(t);if(c)n.className=c;if(x!==undefined)n.textContent=x;return n;}
var CSS='.ag{margin:14px 0;font:inherit}.ag h2{font-size:1.05rem;margin:0 0 4px}.ag .ag-s{font-size:.82rem;opacity:.75;margin:0 0 10px}'+
'.ag-ban{background:#10224a;color:#fff;border-radius:14px;padding:14px;margin:0 0 10px;border-bottom:4px solid #c9a23a;display:flex;flex-direction:column;gap:8px}'+
'.ag-ban b{font-size:1.05rem}.ag-ban span{font-size:.9rem;opacity:.9}'+
'.ag a.ag-btn,.ag .ag-btn{color:#1b1400!important}.ag .ag-btn.alt{color:inherit!important}.ag-btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;line-height:1.1;padding:0 18px;border:0;border-radius:12px;background:#c9a23a;color:#1b1400;font:inherit;font-weight:700;letter-spacing:.5px;text-decoration:none;text-align:center;cursor:pointer;border-bottom:3px solid #8a6a14}'+
'.ag-btn.alt{background:transparent;color:inherit;border:2px solid #c9a23a;line-height:40px}.ag-btn:disabled{opacity:.6}'+
'.ag-row{display:flex;align-items:center;gap:12px;padding:14px;margin:0 0 8px;border-radius:14px;background:var(--card,rgba(127,127,127,.1));border:1px solid var(--line,rgba(127,127,127,.25));border-left:5px solid #c9a23a}.ag-date{width:52px;text-align:center;display:flex;flex-direction:column;flex:none}.ag-wd{font-size:.7rem;letter-spacing:1px;text-transform:uppercase;font-weight:700;opacity:.75}.ag-dn{font:700 1.6rem Georgia,serif;line-height:1.1}.ag h2{letter-spacing:2px;text-transform:uppercase;font-size:.8rem;opacity:.85}.ag-soon{padding:10px 12px;border-radius:10px;background:rgba(201,162,58,.18)}'+
'.ag-row b{display:block}.ag-row small{opacity:.75}.ag-acts{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}'+
'.ag-in{min-height:44px;padding:0 12px;border-radius:10px;border:1px solid rgba(127,127,127,.5);background:rgba(127,127,127,.12);color:inherit;font:inherit;margin:0 0 6px}.ag-ck{display:block;padding:8px 0;font-size:.95rem}.ag-g{margin-top:18px}.ag-row .ag-btn{min-height:40px;padding:0 12px}'+
'.ag-row{flex-wrap:wrap}.ag-racts{display:flex;gap:8px;flex-wrap:wrap;flex:1 1 100%}.ag-racts:empty{display:none}.ag-dim{opacity:.8}.ag-pill{display:inline-block;padding:6px 10px;border-radius:999px;background:rgba(201,162,58,.22);font-size:.78rem;font-weight:700;text-align:center}'+
'.ag-ov{position:fixed;inset:0;z-index:2147483000;overflow-y:auto;background:var(--bg,#0f1115);color:var(--ink,#f3f4f6);font:inherit;padding:max(16px,env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) max(24px,env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px))}'+
'.ag-ovt{display:flex;align-items:center;gap:12px;margin:0 0 14px}.ag-ovt h1,.ag-ovb h1{margin:0;font:700 1.5rem Georgia,serif}.ag-back{width:44px;height:44px;border-radius:12px;border:1px solid var(--line,rgba(127,127,127,.4));background:var(--card,transparent);color:inherit;font-size:1.6rem;line-height:1;cursor:pointer}'+
'.ag-ovb{max-width:560px;margin:0 auto;display:flex;flex-direction:column;gap:12px}.ag-ovb h2{margin:8px 0 0;font:700 .78rem system-ui,sans-serif;letter-spacing:2.5px;text-transform:uppercase;color:var(--mut,inherit);opacity:.9}.ag-ovb .ag-s{font-size:.8rem;line-height:1.4;color:var(--mut,inherit)}.ag-sp{flex:1}.ag-ov{display:flex;flex-direction:column}.ag-ovb{flex:1;width:100%;box-sizing:border-box}.ag-center{align-items:center;text-align:center;padding-top:40px;gap:16px}.ag-center h1{font-size:1.75rem}.ag-center .ag-lead{color:var(--mut,inherit)}.ag-center .ag-lead b{color:var(--ink,inherit)}.ag-center .ag-alt2{background:transparent;border:0;color:#b4532f!important;min-height:48px;line-height:1.1;box-shadow:none}[data-theme="light"] .ag-center .ag-go{background:#10224a;color:#fff!important;border-bottom-color:#050c1f;letter-spacing:1.5px}.ag-lead{margin:0;font-size:1rem;line-height:1.45}'+
'.ag-info{width:100%;box-sizing:border-box;padding:12px 14px;border-radius:14px;background:var(--card,rgba(127,127,127,.1));border:1px solid var(--line,rgba(127,127,127,.25));display:flex;flex-direction:column;gap:2px;text-align:left}.ag-lbl{font-size:.7rem;letter-spacing:2px;text-transform:uppercase;font-weight:700;opacity:.75}'+
'.ag-sum{gap:10px}.ag-sr{display:flex;justify-content:space-between;gap:8px;align-items:center;font-size:.9rem}'+
'.ag-check{width:92px;height:92px;border-radius:50%;background:rgba(88,204,2,.2);color:#3f9a00;font-size:3rem;display:flex;align-items:center;justify-content:center;border-bottom:4px solid rgba(88,204,2,.5)}'+
'.ag-day{display:flex;flex-direction:column;gap:8px}.ag-chips{display:flex;gap:8px;flex-wrap:wrap}.ag-chip{min-height:44px;padding:0 16px;border-radius:10px;border:1px solid var(--line,rgba(127,127,127,.4));background:var(--card,transparent);color:inherit;font:inherit;font-weight:600;cursor:pointer}.ag-chip.on{border:2px solid #c9a23a;background:rgba(201,162,58,.25);font-weight:700}'+
'.ag-two{flex-wrap:nowrap}.ag-two .ag-btn{flex:1;min-height:46px}.ag-rej{color:#b4532f!important;border-color:var(--line,#c9a23a)!important}.ag-ln{font-size:.9rem}.ag-go{width:100%;min-height:54px;font-size:.95rem}.ag-m{min-height:1.2em}.ag-ok{background:#58cc02;border-bottom-color:#3f9a00}.ag-row .ag-m{min-height:0;margin:0}';
function css(){if(document.getElementById('ag-css'))return;var s=document.createElement('style');s.id='ag-css';s.textContent=CSS;document.head.appendChild(s);}

/* ---------- student card ---------- */
function dayKey(iso){try{return new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(iso));}catch(e){return iso.slice(0,10);}}
function fmtDay(iso){try{var t=new Intl.DateTimeFormat(loc(),{weekday:'long',day:'2-digit',month:'2-digit'}).format(new Date(iso)).replace('-feira','');return t.charAt(0).toUpperCase()+t.slice(1);}catch(e){return iso;}}
function fmtS(iso){try{var w=new Intl.DateTimeFormat(loc(),{weekday:'short'}).format(new Date(iso)).replace('.','');w=w.charAt(0).toUpperCase()+w.slice(1);return w+', '+new Intl.DateTimeFormat(loc(),{day:'2-digit',month:'2-digit'}).format(new Date(iso))+' · '+fmtT(iso);}catch(e){return iso;}}
function fmtFull(iso){return fmtDay(iso)+' · '+fmtT(iso);}
function tzName(){var z='';try{z=Intl.DateTimeFormat().resolvedOptions().timeZone||'';}catch(e){}return z.replace(/_/g,' ');}
function errText(c){return {slot_taken:T('eTaken'),too_late:T('eLate'),already_pending:T('ePend'),too_many:T('eMany'),group:T('eGroup')}[c]||T('fail');}
function mount(box,ctx){
  if(!box||!window.Gate||!Gate.sb||!ctx||!ctx.user)return;
  css();var tm=null,sb=Gate.sb,uid=ctx.user.id,HOUR=3600000,ov=null;
  function lessons(){return sb.from('lessons').select('id,title,start_at,end_at,meet_url,is_group').eq('user_id',uid).gte('end_at',new Date().toISOString()).order('start_at').limit(6).then(function(r){return (r&&r.data)||[];},function(){return [];});}
  function requests(){var since=new Date(Date.now()-3*86400000).toISOString();return sb.from('lesson_requests').select('id,kind,lesson_id,new_start,status,created_at').eq('user_id',uid).neq('kind','cancel').gte('created_at',since).order('created_at',{ascending:false}).limit(10).then(function(r){return (r&&r.data)||[];},function(){return [];});}
  function reload(){return Promise.all([lessons(),requests()]).then(function(v){draw(v[0],v[1]);});}
  function isPend(q){return q.status==='pending'&&Date.now()-new Date(q.created_at)<24*HOUR;}
  function draw(rows,reqs){
    clearTimeout(tm);box.textContent='';reqs=reqs||[];
    var pend=reqs.filter(isPend);
    if(!rows.length&&!pend.length){box.hidden=true;return;}
    box.hidden=false;var w=el('div','ag');w.appendChild(el('h2','',T('title')));
    var z=tzName();w.appendChild(el('p','ag-s',T('tz')+(z?' ('+z+')':'')));
    var now=Date.now(),f=rows[0];
    if(f){var ms=new Date(f.start_at)-now,min=Math.ceil(ms/60000),live=ms<=0&&new Date(f.end_at)>now;
      if(live||(min>0&&min<=60)){
        var b=el('div','ag-ban');b.appendChild(el('b','',live?T('now'):T('soon',min)));b.appendChild(el('span','',fmtT(f.start_at)+' – '+fmtT(f.end_at)+' · '+(f.title||'')));
        if(f.meet_url){var a=el('a','ag-btn',T('join'));a.href=f.meet_url;a.target='_blank';a.rel='noopener';b.appendChild(a);}
        w.appendChild(b);}}
    reqs.filter(function(q){return q.status==='approved'||q.status==='rejected';}).slice(0,2).forEach(function(q){var m=el('p','ag-s ag-soon',T(q.status==='approved'?'okMsg':'noMsg',fmtFull(q.new_start)));m.setAttribute('role','status');w.appendChild(m);});
    w.appendChild(el('h2','',T('next')));
    rows.forEach(function(x){
      var r=el('div','ag-row'),dt=new Date(x.start_at),db=el('div','ag-date'),d=el('div');
      var wd='';try{wd=new Intl.DateTimeFormat(loc(),{weekday:'short'}).format(dt).replace('.','');}catch(e){}
      db.appendChild(el('span','ag-wd',wd));db.appendChild(el('span','ag-dn',String(dt.getDate())));r.appendChild(db);
      d.style.flex='1';d.style.minWidth='0';d.appendChild(el('b','',fmtT(x.start_at)+' – '+fmtT(x.end_at)));if(x.title)d.appendChild(el('small','',x.title));r.appendChild(d);
      var q=pend.filter(function(p){return p.lesson_id===x.id;})[0];
      var acts=el('div','ag-racts');
      if(q){acts.appendChild(el('span','ag-pill',T('pend')));}
      else if(!x.is_group&&new Date(x.start_at)-now>HOUR){
        var rb=el('button','ag-btn alt',T('rs'));rb.type='button';rb.onclick=function(){book('reschedule',x);};
        var cb=el('button','ag-btn alt ag-dim',T('cx'));cb.type='button';cb.onclick=function(){cancelAsk(x);};
        acts.appendChild(rb);acts.appendChild(cb);}
      r.appendChild(acts);w.appendChild(r);});
    pend.filter(function(q){return q.kind==='new';}).forEach(function(q){
      var r=el('div','ag-row'),d=el('div');d.style.flex='1';d.appendChild(el('b','',fmtFull(q.new_start)));d.appendChild(el('small','',T('newReq')));r.appendChild(d);
      r.appendChild(el('span','ag-pill',T('pend')));w.appendChild(r);});
    var nb=el('button','ag-btn',T('bNew'));nb.type='button';nb.onclick=function(){book('new',null);};
    var a2=el('div','ag-acts');a2.appendChild(nb);w.appendChild(a2);
    box.appendChild(w);
    tm=setTimeout(function(){draw(rows,reqs);},30000);
  }
  /* ---- full-screen sheet ---- */
  function sheet(title,body,nohead){
    if(ov&&ov.parentNode)ov.parentNode.removeChild(ov);
    ov=el('div','ag-ov');ov.setAttribute('role','dialog');ov.setAttribute('aria-label',title);
    var top=el('div','ag-ovt'),bk=el('button','ag-back','‹');bk.type='button';bk.setAttribute('aria-label',T('bBack'));bk.onclick=close;
    top.appendChild(bk);top.appendChild(el('h1','',title));if(!nohead)ov.appendChild(top);ov.appendChild(body);document.body.appendChild(ov);document.body.style.overflow='hidden';
  }
  function close(){if(ov&&ov.parentNode)ov.parentNode.removeChild(ov);ov=null;document.body.style.overflow='';reload();}
  function info(lbl,val){var c=el('div','ag-info');c.appendChild(el('span','ag-lbl',lbl));c.appendChild(el('b','',val));return c;}
  function book(kind,lesson){
    var body=el('div','ag-ovb');body.appendChild(el('p','ag-s',T('busy')));sheet(kind==='new'?T('bNew'):T('rsT'),body);
    sb.functions.invoke('gcal-book',{body:{action:'slots'}}).then(function(r){
      var slots=(r&&r.data&&r.data.slots)||[];body.textContent='';
      if(kind==='reschedule')body.appendChild(info(T('bCur'),fmtFull(lesson.start_at)+' – '+fmtT(lesson.end_at)));
      body.appendChild(el('h2','',kind==='new'?T('bPickN'):T('bPick')));
      if(!slots.length){body.appendChild(el('p','ag-s',T('bNoSlots')));return;}
      var days={},order=[];slots.forEach(function(iso){var k=dayKey(iso);if(!days[k]){days[k]=[];order.push(k);}days[k].push(iso);});
      var sel=null,chips=[];
      var chosen=info(T('bNew2'),'—');chosen.className+=' ag-chosen';
      var go=el('button','ag-btn ag-go',kind==='new'?T('bAskN'):T('bAsk'));go.type='button';go.disabled=true;
      var msg=el('p','ag-s ag-m','');msg.setAttribute('role','status');
      order.forEach(function(k){
        var g=el('div','ag-day');g.appendChild(el('b','',fmtDay(days[k][0])));var rw=el('div','ag-chips');
        days[k].forEach(function(iso){var c=el('button','ag-chip',fmtT(iso));c.type='button';
          c.onclick=function(){sel=iso;chips.forEach(function(x){x.classList.remove('on');});c.classList.add('on');chosen.querySelector('b').textContent=fmtFull(iso)+' – '+fmtT(new Date(new Date(iso).getTime()+(r.data.dur||50)*60000).toISOString());go.disabled=false;msg.textContent='';};
          chips.push(c);rw.appendChild(c);});
        g.appendChild(rw);body.appendChild(g);});
      body.appendChild(el('p','ag-s',T('bNote')+(tzName()?' ('+tzName()+')':'')));
      var sp=el('div','ag-sp');body.appendChild(sp);body.appendChild(chosen);body.appendChild(msg);body.appendChild(go);
      go.onclick=function(){
        if(!sel)return;go.disabled=true;msg.textContent=T('busy');
        sb.functions.invoke('gcal-book',{body:{action:'request',kind:kind,lesson_id:lesson?lesson.id:undefined,start:sel}}).then(function(q){
          var d=q&&q.data;
          if(d&&d.ok){sent(kind,lesson,sel,d.id);}
          else{msg.textContent=errText(d&&d.error);if(d&&d.error==='slot_taken')setTimeout(function(){book(kind,lesson);},1200);else go.disabled=false;}
        },function(){msg.textContent=T('fail');go.disabled=false;});
      };
    },function(){body.textContent='';body.appendChild(el('p','ag-s',T('fail')));});
  }
  function sent(kind,lesson,iso,id){
    var body=el('div','ag-ovb ag-center');var ck=el('div','ag-check','✓');body.appendChild(ck);
    body.appendChild(el('h1','',T('sTitle')));body.appendChild(el('p','ag-lead',T(kind==='new'?'sBodyN':'sBodyR',fmtFull(iso).toLowerCase())));
    var c=el('div','ag-info ag-sum');
    if(lesson){var r1=el('div','ag-sr');r1.appendChild(el('span','',T('bCur')));r1.appendChild(el('b','',fmtS(lesson.start_at)));c.appendChild(r1);}
    var r2=el('div','ag-sr');r2.appendChild(el('span','',T('bNew2')));r2.appendChild(el('b','',fmtS(iso)));c.appendChild(r2);
    var r3=el('div','ag-sr');r3.appendChild(el('span','',T('sSit')));r3.appendChild(el('span','ag-pill',T('pend')));c.appendChild(r3);body.appendChild(c);
    body.appendChild(el('p','ag-s',T('sHold')));
    var ok=el('button','ag-btn ag-go',T('sBackL'));ok.type='button';ok.onclick=close;body.appendChild(ok);
    var sp2=el('div','ag-sp');body.insertBefore(sp2,ok);var wd=el('button','ag-btn ag-alt2',T('sWith'));wd.type='button';wd.onclick=function(){wd.disabled=true;sb.functions.invoke('gcal-book',{body:{action:'withdraw',id:id}}).then(close,close);};body.appendChild(wd);
    sheet(kind==='new'?T('bNew'):T('rsT'),body,true);
  }
  function cancelAsk(x){
    var body=el('div','ag-ovb ag-center');body.appendChild(el('h1','',T('cxQ',fmtFull(x.start_at))));body.appendChild(el('p','ag-lead',T('cxN')));
    var msg=el('p','ag-s ag-m','');msg.setAttribute('role','status');
    var yes=el('button','ag-btn ag-go',T('cxYes'));yes.type='button';
    yes.onclick=function(){yes.disabled=true;msg.textContent=T('busy');sb.functions.invoke('gcal-book',{body:{action:'cancel',lesson_id:x.id}}).then(function(q){var d=q&&q.data;if(d&&d.ok)close();else{msg.textContent=errText(d&&d.error);yes.disabled=false;}},function(){msg.textContent=T('fail');yes.disabled=false;});};
    var no=el('button','ag-btn alt',T('bBack'));no.type='button';no.onclick=close;
    body.appendChild(msg);body.appendChild(yes);body.appendChild(no);sheet(T('cx'),body);
  }
  reload();
  try{sb.functions.invoke('gcal-sync',{body:{}}).then(function(r){if(r&&r.data&&r.data.ok&&!r.data.skipped)reload();},function(){});}catch(e){}
}

/* ---------- teacher box (admin) ---------- */
function admin(box,lg){
  if(lg)forced=lg;
  if(!box||!window.Gate||!Gate.sb)return;css();
  var w=el('div','ag');box.textContent='';box.appendChild(w);
  function msg(t){var m=w.querySelector('.ag-m');if(!m){m=el('p','ag-s ag-m');w.appendChild(m);}m.textContent=t||'';}
  function render(st,rows,gr){
    w.textContent='';w.appendChild(el('h2','',T('aTitle')));
    var conn=st&&st.connected;
    w.appendChild(el('p','ag-s',conn?T('aOn',st.calendar||''):T('aOff')));
    if(conn&&st.last_sync)w.appendChild(el('p','ag-s',T('last',new Date(st.last_sync).toLocaleString(loc()))));
    if(st&&st.last_error)w.appendChild(el('p','ag-s',T('err',st.last_error)));
    var acts=el('div','ag-acts'),b1=el('button','ag-btn'+(conn?' alt':''),conn?T('reconn'):T('conn'));b1.type='button';
    b1.onclick=function(){b1.disabled=true;msg(T('busy'));Gate.sb.functions.invoke('gcal-auth',{body:{}}).then(function(r){var u=r&&r.data&&r.data.url;if(u)location.href=u;else{b1.disabled=false;msg(T('fail'));}},function(){b1.disabled=false;msg(T('fail'));});};
    acts.appendChild(b1);
    if(conn){var b2=el('button','ag-btn',T('sync'));b2.type='button';b2.onclick=function(){b2.disabled=true;msg(T('busy'));Gate.sb.functions.invoke('gcal-sync',{body:{force:true}}).then(function(){refresh();},function(){b2.disabled=false;msg(T('fail'));});};acts.appendChild(b2);}
    w.appendChild(acts);
    (rows||[]).forEach(function(x){var r=el('div','ag-row'),d=el('div');d.appendChild(el('b','',fmt(x.start_at)+' · '+(x.title||'')));if(!x.user_id)d.appendChild(el('small','',T('nm')));r.appendChild(d);w.appendChild(r);});
    if(/[?&]gcal=ok/.test(location.search))msg(T('ok'));
    if(gr){requestsUI(gr);availUI(gr);groupsUI(gr);}
  }
  var edit=null;
  function load(t,sel,ord){var q=Gate.sb.from(t).select(sel);if(ord)q=q.order(ord);return q.then(function(r){return (r&&r.data)||[];},function(){return [];});}
  function refresh(){
    Promise.all([Gate.sb.rpc('gcal_status').then(function(r){return r&&r.data;},function(){return null;}),
      Gate.sb.from('lessons').select('id,title,start_at,user_id').gte('end_at',new Date().toISOString()).order('start_at').limit(12).then(function(r){return (r&&r.data)||[];},function(){return [];}),
      load('class_groups','id,name','name'),load('class_group_members','group_id,user_id'),
      Gate.sb.from('profiles').select('id,name,email').eq('is_admin',false).order('name').then(function(r){return (r&&r.data)||[];},function(){return [];}),
      Gate.sb.from('lesson_requests').select('id,user_id,kind,lesson_id,old_start,new_start,new_end,status,created_at').in('status',['pending','approved']).gte('created_at',new Date(Date.now()-7*86400000).toISOString()).order('created_at',{ascending:false}).limit(40).then(function(r){return (r&&r.data)||[];},function(){return [];}),
      Gate.sb.from('availability').select('id,weekday,start_time,end_time').order('start_time').then(function(r){return (r&&r.data)||[];},function(){return [];}),
      Gate.sb.from('availability_blocks').select('id,day,note').gte('day',new Date(Date.now()-86400000).toISOString().slice(0,10)).order('day').then(function(r){return (r&&r.data)||[];},function(){return [];})
    ]).then(function(v){render(v[0],v[1],{groups:v[2],members:v[3],students:v[4],reqs:v[5],av:v[6],blocks:v[7]});});
  }

  /* ---- pedidos de aula, disponibilidade e datas bloqueadas (painel do professor, sempre em portugues) ---- */
  var BR='America/Sao_Paulo';
  function brF(iso){try{return new Intl.DateTimeFormat('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',timeZone:BR}).format(new Date(iso));}catch(e){return iso;}}
  function sname(gr,id){var n=id,i;for(i=0;i<gr.students.length;i++)if(gr.students[i].id===id)n=gr.students[i].name||gr.students[i].email||id;return n;}
  function requestsUI(gr){
    var pend=gr.reqs.filter(function(q){return q.status==='pending'&&Date.now()-new Date(q.created_at)<86400000&&q.kind!=='cancel';});
    var canc=gr.reqs.filter(function(q){return q.kind==='cancel';}).slice(0,5);
    var sec=el('div','ag-g');sec.appendChild(el('h2','','Pedidos de aula'+(pend.length?' ('+pend.length+')':'')));
    if(!pend.length&&!canc.length)sec.appendChild(el('p','ag-s','Nenhum pedido aguardando resposta.'));
    pend.forEach(function(q){
      var c=el('div','ag-row');c.style.flexDirection='column';c.style.alignItems='stretch';
      var nm=el('b','',sname(gr,q.user_id));nm.style.fontSize='1.1rem';c.appendChild(nm);
      function ln(l,iso,strong){var d=el('span','ag-ln');d.appendChild(el('span','ag-dim',l+' '));d.appendChild(el(strong?'b':'span','',fmtS(iso)));d.appendChild(el('span','ag-dim',' (Brasília)'));d.querySelector('b,span:nth-child(2)').style.display='inline';return d;}
      if(q.kind==='reschedule'){c.appendChild(ln('De:',q.old_start,false));c.appendChild(ln('Para:',q.new_start,true));}
      else c.appendChild(ln('Nova aula:',q.new_start,true));
      var m=el('p','ag-s ag-m','');m.setAttribute('role','status');
      var acts=el('div','ag-acts ag-two'),ok=el('button','ag-btn ag-ok','Aprovar'),no=el('button','ag-btn alt ag-rej','Recusar');ok.type=no.type='button';
      function dec(a){ok.disabled=no.disabled=true;m.textContent=T('busy');Gate.sb.functions.invoke('gcal-book',{body:{action:'decide',id:q.id,approve:a}}).then(function(r){var d=r&&r.data;if(d&&d.ok)refresh();else{ok.disabled=no.disabled=false;m.textContent=d&&d.error==='conflict'?'Esse horário já foi ocupado. Recuse o pedido.':T('fail');}},function(){ok.disabled=no.disabled=false;m.textContent=T('fail');});}
      ok.onclick=function(){dec(true);};no.onclick=function(){dec(false);};
      acts.appendChild(ok);acts.appendChild(no);c.appendChild(acts);c.appendChild(m);sec.appendChild(c);});
    canc.forEach(function(q){sec.appendChild(el('p','ag-s',sname(gr,q.user_id)+' cancelou a aula de '+brF(q.old_start)+'.'));});
    w.appendChild(sec);
  }
  var WD=[[1,'Segunda'],[2,'Terça'],[3,'Quarta'],[4,'Quinta'],[5,'Sexta'],[6,'Sábado'],[0,'Domingo']];
  function availUI(gr){
    var sec=el('div','ag-g');sec.appendChild(el('h2','','Sua disponibilidade'));
    sec.appendChild(el('p','ag-s','Horários em que o aluno pode marcar ou remarcar (horário de Brasília). Aulas de 50 min, de hora em hora a partir do início de cada faixa. Aulas e pedidos já existentes ficam ocupados.'));
    var m=el('p','ag-s ag-m','');m.setAttribute('role','status');
    var SH={1:'Seg',2:'Ter',3:'Qua',4:'Qui',5:'Sex',6:'Sáb',0:'Dom'};
    var grp={},ord=[];
    gr.av.forEach(function(a){var k=String(a.start_time).slice(0,5)+' – '+String(a.end_time).slice(0,5);if(!grp[k]){grp[k]={days:[],ids:[]};ord.push(k);}grp[k].days.push(a.weekday);grp[k].ids.push(a.id);});
    ord.sort();
    if(!ord.length)sec.appendChild(el('p','ag-s','Nenhum horário cadastrado ainda.'));
    ord.forEach(function(k){
      var g=grp[k],r=el('div','ag-row'),d=el('div');d.style.flex='1';
      var names=WD.filter(function(x){return g.days.indexOf(x[0])>-1;}).map(function(x){return SH[x[0]];}).join(', ');
      d.appendChild(el('b','',k));d.appendChild(el('small','',names));r.appendChild(d);
      var x=el('button','ag-btn alt','Remover');x.type='button';
      x.onclick=function(){x.disabled=true;Gate.sb.from('availability').delete().in('id',g.ids).then(refresh,refresh);};r.appendChild(x);sec.appendChild(r);});
    var nf=el('div','ag-row');nf.style.flexDirection='column';nf.style.alignItems='stretch';
    nf.appendChild(el('b','','Adicionar horário'));
    var picked={},dr=el('div','ag-chips');
    WD.forEach(function(d){var c=el('button','ag-chip',SH[d[0]]);c.type='button';c.setAttribute('aria-pressed','false');c.onclick=function(){picked[d[0]]=!picked[d[0]];c.classList.toggle('on',!!picked[d[0]]);c.setAttribute('aria-pressed',picked[d[0]]?'true':'false');};dr.appendChild(c);});
    nf.appendChild(dr);
    var tf=el('div','ag-acts'),i1=el('input','ag-in'),i2=el('input','ag-in'),ad=el('button','ag-btn','Adicionar');i1.type=i2.type='time';i1.step=i2.step=900;i1.setAttribute('aria-label','Início');i2.setAttribute('aria-label','Fim');ad.type='button';
    ad.onclick=function(){
      var days=WD.filter(function(d){return picked[d[0]];}).map(function(d){return d[0];});
      if(!days.length){m.textContent='Marque ao menos um dia da semana.';return;}
      if(!i1.value||!i2.value||i2.value<=i1.value){m.textContent='Informe início e fim (o fim depois do início).';return;}
      ad.disabled=true;m.textContent=T('busy');
      Gate.sb.from('availability').insert(days.map(function(d){return {weekday:d,start_time:i1.value,end_time:i2.value};})).then(function(q){if(q&&q.error){ad.disabled=false;m.textContent=T('fail');}else refresh();},function(){ad.disabled=false;m.textContent=T('fail');});};
    tf.appendChild(i1);tf.appendChild(i2);tf.appendChild(ad);nf.appendChild(tf);sec.appendChild(nf);
    sec.appendChild(el('h2','','Datas bloqueadas'));
    gr.blocks.forEach(function(bk){var r=el('div','ag-row'),d=el('div');d.style.flex='1';d.appendChild(el('b','',bk.day.split('-').reverse().join('/')));if(bk.note)d.appendChild(el('small','',bk.note));r.appendChild(d);
      var x=el('button','ag-btn alt','Liberar');x.type='button';x.onclick=function(){x.disabled=true;Gate.sb.from('availability_blocks').delete().eq('id',bk.id).then(refresh,refresh);};r.appendChild(x);sec.appendChild(r);});
    var f=el('div','ag-acts'),dd=el('input','ag-in'),nt=el('input','ag-in'),bb=el('button','ag-btn alt','Bloquear data');dd.type='date';nt.placeholder='Motivo (opcional)';nt.setAttribute('aria-label','Motivo');bb.type='button';
    bb.onclick=function(){if(!dd.value){m.textContent='Escolha a data.';return;}bb.disabled=true;Gate.sb.from('availability_blocks').insert({day:dd.value,note:nt.value||null}).then(function(q){if(q&&q.error){bb.disabled=false;m.textContent='Essa data já está bloqueada.';}else refresh();},function(){bb.disabled=false;m.textContent=T('fail');});};
    f.appendChild(dd);f.appendChild(nt);f.appendChild(bb);sec.appendChild(f);sec.appendChild(m);
    w.appendChild(sec);
  }
  function groupsUI(gr){
    var sec=el('div','ag-g');sec.appendChild(el('h2','',T('gT')));sec.appendChild(el('p','ag-s',T('gH')));
    var sn={};gr.students.forEach(function(p){sn[p.id]=p.name||p.email||'?';});
    function done(){Gate.sb.functions.invoke('gcal-sync',{body:{force:true}}).then(refresh,refresh);}
    if(edit){
      var f=el('div','ag-row');f.style.flexDirection='column';f.style.alignItems='stretch';
      var inp=el('input','ag-in');inp.placeholder=T('gNm');inp.value=edit.name||'';inp.setAttribute('aria-label',T('gNm'));f.appendChild(inp);
      gr.students.forEach(function(p){var l=el('label','ag-ck'),c=document.createElement('input');c.type='checkbox';c.checked=edit.members.has(p.id);c.onchange=function(){if(c.checked)edit.members.add(p.id);else edit.members.delete(p.id);};l.appendChild(c);l.appendChild(document.createTextNode(' '+(p.name||p.email)));f.appendChild(l);});
      var em=el('p','ag-s','');f.appendChild(em);
      var acts=el('div','ag-acts'),ok=el('button','ag-btn',T('gSave')),no=el('button','ag-btn alt',T('gCan'));ok.type=no.type='button';
      no.onclick=function(){edit=null;refresh();};
      ok.onclick=function(){
        var nm=inp.value.trim();if(!nm||!edit.members.size){em.textContent=T('gErr');return;}
        ok.disabled=true;em.textContent=T('busy');
        var p=edit.id?Gate.sb.from('class_groups').update({name:nm}).eq('id',edit.id).select('id').single():Gate.sb.from('class_groups').insert({name:nm}).select('id').single();
        p.then(function(r){
          if(r.error||!r.data){ok.disabled=false;em.textContent=T('fail');return;}
          var gid=r.data.id,rows=[];edit.members.forEach(function(u){rows.push({group_id:gid,user_id:u});});
          return Gate.sb.from('class_group_members').delete().eq('group_id',gid).then(function(){return Gate.sb.from('class_group_members').insert(rows);}).then(function(r2){if(r2&&r2.error){ok.disabled=false;em.textContent=T('fail');return;}edit=null;done();});
        },function(){ok.disabled=false;em.textContent=T('fail');});
      };
      acts.appendChild(ok);acts.appendChild(no);f.appendChild(acts);sec.appendChild(f);
    }else{
      if(!gr.groups.length)sec.appendChild(el('p','ag-s',T('gNone')));
      gr.groups.forEach(function(g){
        var ids=gr.members.filter(function(m){return m.group_id===g.id;}).map(function(m){return m.user_id;});
        var r=el('div','ag-row'),d=el('div');d.style.flex='1';d.appendChild(el('b','',g.name));
        d.appendChild(el('small','',ids.length?ids.map(function(u){return sn[u]||'?';}).join(', '):T('gNoM')));r.appendChild(d);
        var e1=el('button','ag-btn alt',T('gEdit')),e2=el('button','ag-btn alt',T('gDel'));e1.type=e2.type='button';
        e1.onclick=function(){edit={id:g.id,name:g.name,members:new Set(ids)};refresh();};
        var arm=false;e2.onclick=function(){if(!arm){arm=true;e2.textContent=T('gSure');return;}Gate.sb.from('class_groups').delete().eq('id',g.id).then(done,done);};
        r.appendChild(e1);r.appendChild(e2);sec.appendChild(r);
      });
      var nb=el('button','ag-btn',T('gNew'));nb.type='button';nb.onclick=function(){edit={id:null,name:'',members:new Set()};refresh();};
      var a2=el('div','ag-acts');a2.appendChild(nb);sec.appendChild(a2);
    }
    w.appendChild(sec);
  }
  refresh();
}
window.Agenda={mount:mount,admin:admin};
})();
