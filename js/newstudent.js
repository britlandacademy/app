/* Aluno novo: a partir do evento "TN" da Agenda cria a aba do aluno na planilha (via sheet-push / Apps Script v4). Só no painel do professor (inglês). */
(function(){
'use strict';
var TZ='America/Sao_Paulo',TPL='Lucas Rodrigues - Stage 6 3rd Edition';
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function ymd(i){return new Date(i).toLocaleDateString('en-CA',{timeZone:TZ});}
function hm(i){return new Date(i).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:TZ});}
function dm(i){return new Date(i).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',timeZone:TZ});}
function ord(n){var s=['th','st','nd','rd'],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0]);}
function money(a,c){var n=Number(a);n=n%1?n.toFixed(2):String(n);return c==='EUR'?n+' €':c==='BRL'?'R$ '+n:c==='USD'?'$'+n:c==='GBP'?'£'+n:n+' '+(c||'');}
function css(){if(document.getElementById('ns-css'))return;var s=document.createElement('style');s.id='ns-css';
s.textContent='.ns-c .ag-btn{font:inherit;font-weight:700;min-height:42px;padding:0 20px;border-radius:99px;cursor:pointer;border:2px solid var(--accent,#c9a13b);background:var(--accent,#c9a13b);color:var(--accent-ink,#1a1405)}.ns-c .ag-btn:hover{background:var(--gold2,#e4c06a);border-color:var(--gold2,#e4c06a)}.ns-c .ag-btn:disabled{opacity:.6;cursor:default}.ns-c{border:2px solid var(--warn,#6b4a00);border-radius:14px;background:var(--card);margin:8px 0;overflow:hidden}.ns-b{background:var(--warn-bg,#f3ead0);color:var(--warn,#6b4a00);font-weight:800;font-size:.82rem;padding:6px 12px;border-bottom:1px solid var(--warn,#6b4a00)}.ns-i{padding:10px 12px}.ns-r{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:6px 0}.ns-r label{font-size:.86rem;color:var(--muted)}.ns-r input[type=text],.ns-r select{min-height:40px;font:inherit;padding:4px 10px;border-radius:10px;border:1px solid var(--line);background:transparent;color:inherit}.ns-m{font-size:.86rem;color:var(--muted);margin:4px 0}.ns-r button{min-height:44px}';
document.head.appendChild(s);}
var ERR={ja_existe:'Já existe uma aba com esse nome.',modelo_nao_encontrado:'Aba modelo não encontrada na planilha.',cabecalho_nao_encontrado:'Cabeçalho do modelo não encontrado.',not_configured:'Planilha não configurada.',forbidden:'Sem permissão.',dados_incompletos:'Dados incompletos.'};
function create(sb,c,done){
  var P=window.BL_PLANS&&window.BL_PLANS[c.stage];if(!P){done('Plano do Stage '+c.stage+' indisponível.');return;}
  var tab=c.name+(c.vip?' VIP':'')+' - Stage '+c.stage+' 3rd Edition',first=String(c.name).split(' ')[0];
  var pl={sheetName:tab,lesson:1,action:'newStudent',tabName:tab,template:TPL,firstName:first,vip:!!c.vip,stage:c.stage,lessonsText:P.lessons,plan:P.rows,start:ymd(c.start_at)+'T'+hm(c.start_at)};
  if(c.fee)pl.fee=c.fee;
  sb.functions.invoke('sheet-push',{body:pl}).then(function(r){var q=r&&r.data;
    if(q&&q.ok){var fin=function(){done(null,tab);},gd=function(){if(!q.gid)return Promise.resolve();return Promise.resolve(sb.from('teacher_cfg').select('value').eq('key','plans_gids').limit(1)).then(function(g){var v=Object.assign({},(g&&g.data&&g.data[0]&&g.data[0].value)||{});v[tab]=q.gid;return sb.from('teacher_cfg').upsert({key:'plans_gids',value:v},{onConflict:'key'});}).catch(function(){});};
      Promise.resolve(sb.from('plan_links').upsert({user_id:c.uid,sheet_name:tab,student_col:first})).catch(function(){}).then(gd).then(fin,fin);return;}
    done(ERR[q&&q.error]||('Falhou'+(q&&q.error?' ('+q.error+')':'')));
  },function(){done('Falhou ao falar com a planilha.');});
}
function card(sb,p,ltr,su,hdr,vipDef,startAt,done){
          var uid=p.id,nm=String(p.display_name||p.name||'').trim()||'Aluno',st=(ltr&&ltr.stage)||p.start_stage||0,
          fee=su&&su.amount?money(su.amount,su.currency)+' / '+(su.due_day?ord(su.due_day)+' of every month':'month'):'',
          c=el('div','ns-c'),b=el('div','ns-b',hdr),i=el('div','ns-i'),
          r1=el('div','ns-r'),inN=el('input');inN.type='text';inN.value=nm;inN.setAttribute('aria-label','Nome na aba');
          var sel=el('select');sel.setAttribute('aria-label','Stage');var o0=el('option','','Stage…');o0.value='';sel.appendChild(o0);
          for(var s=1;s<=12;s++){var o=el('option','','Stage '+s);o.value=s;if(s===st)o.selected=true;sel.appendChild(o);}
          var vip=el('input');vip.type='checkbox';vip.checked=!!vipDef;var vl=el('label','','VIP (aula individual)');vl.insertBefore(vip,vl.firstChild);
          r1.appendChild(inN);r1.appendChild(sel);r1.appendChild(vl);i.appendChild(r1);
          var info=[];if(ltr)info.push('Teste de nível: Stage '+ltr.stage+(ltr.total?' ('+ltr.score+'/'+ltr.total+')':''));info.push(fee?('Mensalidade: '+fee):'Mensalidade: não encontrada em Pagamentos');
          i.appendChild(el('div','ns-m',info.join(' · ')));
          var msg=el('div','ns-m'),r2=el('div','ns-r'),go=el('button','ag-btn','Criar aba na planilha');go.type='button';r2.appendChild(go);i.appendChild(r2);i.appendChild(msg);c.appendChild(b);c.appendChild(i);
          go.onclick=function(){var stg=Number(sel.value);if(!stg){msg.textContent='Escolha o Stage.';return;}
            var tab=inN.value.trim()+(vip.checked?' VIP':'')+' - Stage '+stg+' 3rd Edition';
            var run=function(){go.disabled=true;msg.textContent='Criando…';
            create(sb,{uid:uid,name:inN.value.trim(),vip:vip.checked,stage:stg,start_at:startAt,fee:fee},function(e,t){if(e){go.disabled=false;msg.textContent=e;}else{msg.textContent='Aba criada ✅ '+t;go.hidden=true;if(done)done(t);}});};var q='Criar a aba "'+tab+'" na planilha?';if(window.BL_DLG)BL_DLG.confirm(q,{danger:false}).then(function(k){if(k)run();});else if(window.confirm(q))run();};
          return c;
}
function form(sb,uid,done){
  css();
  return Promise.all([sb.from('level_tests').select('user_id,stage,score,total,passed,taken_at').eq('user_id',uid),sb.from('subs').select('user_id,amount,currency,due_day,active').eq('user_id',uid),sb.from('profiles').select('id,name,display_name,start_stage').eq('id',uid).limit(1)]).then(function(R){
    var p=(R[2].data||[])[0];if(!p)return null;var l=null;(R[0].data||[]).forEach(function(x){if(x.taken_at&&(!l||x.taken_at>l.taken_at))l=x;});
    var su=null;(R[1].data||[]).forEach(function(x){if(x.active!==false)su=x;});
    return card(sb,p,l,su,'Sem planilha · criar agora',true,new Date().toISOString(),done);
  });
}
function mount(w,before,evl,stu,sb){
  css();
  var now=new Date(),tn=(evl||[]).filter(function(x){return /\bTN\b/i.test(x.title||'')&&new Date(x.end_at)>=new Date(now.getTime()-864e5);});
  if(!tn.length)return;
  var ids=[];tn.forEach(function(x){(x.ids||[]).forEach(function(i){if(ids.indexOf(i)<0&&stu.some(function(q){return q.id===i;}))ids.push(i);});});
  if(!ids.length)return;
  Promise.all([sb.from('plan_links').select('user_id').in('user_id',ids),sb.from('level_tests').select('user_id,stage,score,total,passed,taken_at').in('user_id',ids),
    sb.from('subs').select('user_id,amount,currency,due_day,active').in('user_id',ids),sb.from('profiles').select('id,name,display_name,start_stage').in('id',ids)]).then(function(R){
    var linked={};(R[0].data||[]).forEach(function(x){linked[x.user_id]=1;});
    var lt={};(R[1].data||[]).forEach(function(x){if(x.taken_at&&(!lt[x.user_id]||x.taken_at>lt[x.user_id].taken_at))lt[x.user_id]=x;});
    var sb_={};(R[2].data||[]).forEach(function(x){if(x.active!==false)sb_[x.user_id]=x;});
    var pf={};(R[3].data||[]).forEach(function(x){pf[x.id]=x;});
    tn.forEach(function(x){(x.ids||[]).forEach(function(uid){
      if(linked[uid]||!pf[uid]||!stu.some(function(q){return q.id===uid;}))return;
      var c=card(sb,pf[uid],lt[uid],sb_[uid],'🆕 Aluno novo · TN em '+dm(x.start_at)+' às '+hm(x.start_at),(x.ids||[]).length<2,x.start_at);before.parentNode.insertBefore(c,before);
    });});
  },function(){});
}
window.BL_NS={mount:mount,form:form};
})();
