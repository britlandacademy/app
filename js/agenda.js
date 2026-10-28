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
'.ag a.ag-btn,.ag .ag-btn{color:#1b1400!important}.ag .ag-btn.alt{color:inherit!important}.ag-btn{display:inline-block;min-height:44px;line-height:44px;padding:0 18px;border:0;border-radius:12px;background:#c9a23a;color:#1b1400;font:inherit;font-weight:700;letter-spacing:.5px;text-decoration:none;text-align:center;cursor:pointer;border-bottom:3px solid #8a6a14}'+
'.ag-btn.alt{background:transparent;color:inherit;border:2px solid #c9a23a;line-height:40px}.ag-btn:disabled{opacity:.6}'+
'.ag-row{display:flex;align-items:center;gap:10px;padding:10px 12px;margin:0 0 8px;border-radius:12px;background:rgba(127,127,127,.1);border:1px solid rgba(127,127,127,.25)}'+
'.ag-row b{display:block}.ag-row small{opacity:.75}.ag-acts{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}'+
'.ag-in{min-height:44px;padding:0 12px;border-radius:10px;border:1px solid rgba(127,127,127,.5);background:rgba(127,127,127,.12);color:inherit;font:inherit;margin:0 0 6px}.ag-ck{display:block;padding:8px 0;font-size:.95rem}.ag-g{margin-top:18px}.ag-row .ag-btn{min-height:40px;line-height:38px;padding:0 12px}';
function css(){if(document.getElementById('ag-css'))return;var s=document.createElement('style');s.id='ag-css';s.textContent=CSS;document.head.appendChild(s);}

/* ---------- student card ---------- */
function mount(box,ctx){
  if(!box||!window.Gate||!Gate.sb||!ctx||!ctx.user)return;
  css();var tm=null;
  function load(){return Gate.sb.from('lessons').select('id,title,start_at,end_at,meet_url').eq('user_id',ctx.user.id).gte('end_at',new Date().toISOString()).order('start_at').limit(6).then(function(r){return (r&&r.data)||[];},function(){return [];});}
  function draw(rows){
    clearTimeout(tm);box.textContent='';
    if(!rows.length){box.hidden=true;return;}
    box.hidden=false;var w=el('div','ag');w.appendChild(el('h2','',T('title')));
    var z='';try{z=Intl.DateTimeFormat().resolvedOptions().timeZone||'';}catch(e){}
    w.appendChild(el('p','ag-s',T('tz')+(z?' ('+z.replace(/_/g,' ')+')':'')));
    var now=Date.now(),f=rows[0],ms=new Date(f.start_at)-now,min=Math.ceil(ms/60000),live=ms<=0&&new Date(f.end_at)>now;
    if(live||(min>0&&min<=60)){
      var b=el('div','ag-ban');b.appendChild(el('b','',live?T('now'):T('soon',min)));b.appendChild(el('span','',fmtT(f.start_at)+' – '+fmtT(f.end_at)+' · '+(f.title||'')));
      if(f.meet_url){var a=el('a','ag-btn',T('join'));a.href=f.meet_url;a.target='_blank';a.rel='noopener';b.appendChild(a);}
      w.appendChild(b);
    }
    w.appendChild(el('h2','',T('next')));
    rows.forEach(function(x){var r=el('div','ag-row'),d=el('div');d.appendChild(el('b','',fmt(x.start_at)));d.appendChild(el('small','',fmtT(x.start_at)+' – '+fmtT(x.end_at)+(x.title?' · '+x.title:'')));r.appendChild(d);w.appendChild(r);});
    box.appendChild(w);
    tm=setTimeout(function(){draw(rows);},30000);
  }
  load().then(draw);
  try{Gate.sb.functions.invoke('gcal-sync',{body:{}}).then(function(r){if(r&&r.data&&r.data.ok&&!r.data.skipped)load().then(draw);},function(){});}catch(e){}
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
    if(gr)groupsUI(gr);
  }
  var edit=null;
  function load(t,sel,ord){var q=Gate.sb.from(t).select(sel);if(ord)q=q.order(ord);return q.then(function(r){return (r&&r.data)||[];},function(){return [];});}
  function refresh(){
    Promise.all([Gate.sb.rpc('gcal_status').then(function(r){return r&&r.data;},function(){return null;}),
      Gate.sb.from('lessons').select('id,title,start_at,user_id').gte('end_at',new Date().toISOString()).order('start_at').limit(12).then(function(r){return (r&&r.data)||[];},function(){return [];}),
      load('class_groups','id,name','name'),load('class_group_members','group_id,user_id'),
      Gate.sb.from('profiles').select('id,name,email').eq('is_admin',false).order('name').then(function(r){return (r&&r.data)||[];},function(){return [];})
    ]).then(function(v){render(v[0],v[1],{groups:v[2],members:v[3],students:v[4]});});
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
