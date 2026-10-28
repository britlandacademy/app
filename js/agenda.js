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
'.ag-row b{display:block}.ag-row small{opacity:.75}.ag-acts{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}';
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
  function render(st,rows){
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
  }
  function refresh(){
    Promise.all([Gate.sb.rpc('gcal_status').then(function(r){return r&&r.data;},function(){return null;}),
      Gate.sb.from('lessons').select('id,title,start_at,user_id').gte('end_at',new Date().toISOString()).order('start_at').limit(12).then(function(r){return (r&&r.data)||[];},function(){return [];})
    ]).then(function(v){render(v[0],v[1]);});
  }
  refresh();
}
window.Agenda={mount:mount,admin:admin};
})();
