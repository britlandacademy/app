/* Painel do professor: aba Avisos (envio de avisos para a central de notificações dos alunos). */
(function(){
'use strict';
var TPL=[
  ['free','Livre','',''],
  ['makeup','Aula a repor','Aula de reposição','Você tem uma aula para repor. Escolha um horário na Agenda.'],
  ['exam','Prova liberada','Prova liberada','Sua prova foi liberada. Você pode começar quando estiver pronto.'],
  ['promo','Promoção','Promoção','Pague 6 meses à vista e ganhe 15% de desconto. Válido até 30/11.']
];
function d2(n){return String(n).padStart(2,'0');}
function fdt(s){var d=new Date(s);return d2(d.getDate())+'/'+d2(d.getMonth()+1)+' '+d2(d.getHours())+':'+d2(d.getMinutes());}
function mk(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}
function lab(t,child){var l=mk('label','',t);l.style.cssText='display:block;font-weight:700;margin:12px 0 4px';var w=mk('div');w.append(l,child);return w;}
window.NoticesAdmin={mount:function(box,o){
  var sb=o.sb,pub=sb.course?sb.course('en'):sb;box.textContent='';
  box.setAttribute('data-noi18n','1');
  var st=document.createElement('style');st.textContent='.nt-ch{display:flex;gap:6px;flex-wrap:wrap}.nt-ch button{min-height:40px;padding:0 12px;border-radius:999px;border:2px solid var(--accent,#111);background:transparent;color:var(--ink,#111);font:inherit;font-weight:700;cursor:pointer}.nt-ch button.on{background:var(--accent,#111);color:var(--accent-ink,#fff)}.nt-f input,.nt-f select,.nt-f textarea{width:100%;box-sizing:border-box;min-height:44px;padding:8px 10px;font:inherit;font-size:16px;border:2px solid var(--line,#b8b8b8);border-radius:8px;background:var(--surface,#fff);color:var(--ink,#111)}.nt-f textarea{min-height:96px}.nt-t{width:100%;border-collapse:collapse;font-size:.9rem;margin-top:8px}.nt-t th,.nt-t td{border:1px solid var(--line,#b8b8b8);padding:6px 8px;text-align:left;vertical-align:top}.nt-msg{font-weight:700;min-height:1.4em;margin-top:8px}';
  box.appendChild(st);
  var f=mk('div','nt-f');box.appendChild(f);
  var tpl='free',tb=mk('div','nt-ch'),tbtn={};
  var title=mk('input');title.type='text';title.maxLength=80;title.placeholder='Título (opcional)';
  var body=mk('textarea');body.maxLength=500;
  var who=mk('div','nt-ch'),wAll=mk('button','on','Todos os alunos'),wOne=mk('button','','Um aluno');wAll.type=wOne.type='button';who.append(wAll,wOne);
  var sel=mk('select');sel.hidden=true;
  var opt0=mk('option','','Escolha o aluno');opt0.value='';sel.appendChild(opt0);
  (o.profiles()||[]).filter(function(p){return !p.is_admin;}).sort(function(a,b){return String(a.name||a.email||'').localeCompare(String(b.name||b.email||''));}).forEach(function(p){var op=mk('option','',p.name||p.email||p.id);op.value=p.id;sel.appendChild(op);});
  var one=false;
  function setWho(v){one=v;wAll.classList.toggle('on',!v);wOne.classList.toggle('on',v);sel.hidden=!v;}
  wAll.onclick=function(){setWho(false);};wOne.onclick=function(){setWho(true);};
  TPL.forEach(function(t){var b=mk('button',t[0]==='free'?'on':'',t[1]);b.type='button';tbtn[t[0]]=b;b.onclick=function(){tpl=t[0];Object.keys(tbtn).forEach(function(k){tbtn[k].classList.toggle('on',k===tpl);});if(t[0]!=='free'){title.value=t[2];body.value=t[3];}};tb.appendChild(b);});
  var now=mk('button','on','Agora'),sch=mk('button','','Agendar'),wh=mk('div','nt-ch');now.type=sch.type='button';wh.append(now,sch);
  var at=mk('input');at.type='datetime-local';at.hidden=true;
  var sched=false;
  function setSched(v){sched=v;now.classList.toggle('on',!v);sch.classList.toggle('on',v);at.hidden=!v;if(v&&!at.value){var d=new Date(Date.now()+3600e3);d.setMinutes(0,0,0);at.value=d.getFullYear()+'-'+d2(d.getMonth()+1)+'-'+d2(d.getDate())+'T'+d2(d.getHours())+':00';}}
  now.onclick=function(){setSched(false);};sch.onclick=function(){setSched(true);};
  var exp=mk('input');exp.type='date';
  var go=mk('button','btn','Enviar aviso');go.type='button';go.style.marginTop='14px';
  var msg=mk('div','nt-msg');msg.setAttribute('role','status');
  f.append(lab('Modelo',tb),lab('Para',who),sel,lab('Título',title),lab('Mensagem',body),lab('Quando',wh),at,lab('Some sozinho em (opcional)',exp),go,msg);
  var hint=mk('p','hint','O aluno vê o aviso no sino do app. O push sai só entre 9h e 19h. Escreva no idioma do aluno; a mensagem é mostrada como você escreveu.');box.insertBefore(hint,f);
  var list=mk('div');box.append(mk('h2','','Enviados'),list);box.lastChild.style.marginTop='22px';
  function draw(){
    list.textContent='Carregando…';
    Promise.resolve(pub.rpc('notice_list')).then(function(r){
      list.textContent='';
      if(!r||r.error){list.textContent='Não foi possível carregar.';return;}
      var rows=r.data||[];if(!rows.length){list.append(mk('p','hint','Nenhum aviso enviado ainda.'));return;}
      var t=mk('table','nt-t'),h=mk('tr');['Quando','Para','Aviso','Lidos',''].forEach(function(x){h.appendChild(mk('th','',x));});t.appendChild(h);
      rows.forEach(function(n){
        var tr=mk('tr');
        tr.appendChild(mk('td','',fdt(n.send_at)+(n.delivered?'':' (agendado)')));
        tr.appendChild(mk('td','',n.who));
        var tx=(n.title?n.title+': ':'')+n.body;tr.appendChild(mk('td','',tx.length>80?tx.slice(0,80)+'…':tx));
        tr.appendChild(mk('td','',n.delivered?(n.read+'/'+n.total):'-'));
        var td=mk('td'),del=mk('button','ghost',n.delivered?'Apagar':'Cancelar');del.type='button';del.style.minHeight='36px';
        del.onclick=function(){if(del.dataset.s!=='1'){del.dataset.s='1';del.textContent='Confirmar?';setTimeout(function(){del.dataset.s='';del.textContent=n.delivered?'Apagar':'Cancelar';},4000);return;}
          del.disabled=true;Promise.resolve(pub.rpc('notice_delete',{p_id:n.id})).then(draw);};
        td.appendChild(del);tr.appendChild(td);t.appendChild(tr);
      });
      list.appendChild(t);
    });
  }
  go.onclick=function(){
    msg.className='nt-msg';msg.textContent='';
    var b=body.value.trim();if(!b){msg.textContent='Escreva a mensagem.';return;}
    if(one&&!sel.value){msg.textContent='Escolha o aluno.';return;}
    if(sched&&!at.value){msg.textContent='Escolha a data e a hora do envio.';return;}
    go.disabled=true;
    Promise.resolve(pub.rpc('notice_send',{p_user:one?sel.value:null,p_tpl:tpl,p_title:title.value.trim()||null,p_body:b,p_send_at:sched?new Date(at.value).toISOString():null,p_expires:exp.value||null})).then(function(r){
      go.disabled=false;
      if(r&&r.error){msg.textContent='Não foi possível enviar: '+r.error.message;return;}
      msg.textContent=sched?'Aviso agendado.':'Aviso enviado.';body.value='';title.value='';exp.value='';draw();
    },function(){go.disabled=false;msg.textContent='Não foi possível enviar.';});
  };
  draw();
}};
})();
