/* Britland teacher panel: tab "Avaliações". Pending / approved / rejected student reviews; approve & publish, edit text, reject.
   ReviewsAdmin.mount(box,{sb,profiles}). Public site shows only status=approved AND allow_public (public_reviews RPC). */
(function(){
'use strict';
if(window.ReviewsAdmin)return;
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
var SHOW={full:'nome completo',initial:'nome + inicial',anon:'anônimo'};
var ST={pending:'Pendentes',approved:'Aprovadas',rejected:'Rejeitadas'};
function css(){if(document.getElementById('rva-css'))return;var s=document.createElement('style');s.id='rva-css';
 s.textContent='.rva-f{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 12px}.rva-f button{min-height:40px;padding:0 14px;border:2px solid var(--line);background:var(--surface);color:var(--ink);font-weight:700;border-radius:3px;cursor:pointer}.rva-f button.on{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}'
 +'.rva-c{border:1px solid var(--line);background:var(--surface);border-radius:3px;padding:14px;margin:0 0 10px}.rva-h{display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:.9rem}.rva-h b{font-size:1rem}.rva-s{letter-spacing:2px;font-weight:700}'
 +'.rva-t{margin:8px 0;line-height:1.5;white-space:pre-wrap}.rva-m{color:var(--muted);font-size:.82rem}.rva-g{display:inline-block;border:1px solid var(--line);border-radius:99px;padding:1px 9px;font-size:.76rem;font-weight:700}.rva-g.w{border-color:var(--bad);color:var(--bad)}.rva-g.k{border-color:var(--ok);color:var(--ok)}'
 +'.rva-a{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.rva-a button{min-height:40px;padding:0 14px;border:2px solid var(--accent);background:var(--accent);color:var(--accent-ink);font-weight:700;border-radius:3px;cursor:pointer}.rva-a button.g{background:transparent;color:var(--ink);border-color:var(--line)}.rva-a button:disabled{opacity:.5}'
 +'.rva-ta{box-sizing:border-box;width:100%;min-height:90px;margin-top:8px;padding:10px;font:inherit;font-size:16px;color:var(--ink);background:var(--surface);border:2px solid var(--line);border-radius:3px}';
 document.head.appendChild(s);}
function who(r,prof){var p=(prof||[]).find(function(x){return x.id===r.user_id;});return (p&&(p.name||p.display_name))||'Aluno';}
function shown(name,how){var n=String(name).trim().split(/\s+/);if(how==='anon')return 'Aluno(a)';if(how==='full')return name;return n[0]+(n.length>1?' '+n[n.length-1][0]+'.':'');}
function mount(box,o){
 css();var cur=(box.__rvf)||'pending';
 function draw(){
  box.textContent='';
  var f=document.createElement('div');f.className='rva-f';
  Object.keys(ST).forEach(function(k){var b=document.createElement('button');b.type='button';b.textContent=ST[k];b.className=k===cur?'on':'';b.onclick=function(){cur=k;box.__rvf=k;draw();};f.appendChild(b);});
  box.appendChild(f);
  var L=document.createElement('div');box.appendChild(L);L.textContent='Carregando…';
  Promise.resolve(o.sb.from('student_reviews').select('*').eq('status',cur).order('created_at',{ascending:false}).limit(100)).then(function(r){
   var rows=(r&&r.data)||[];L.textContent='';
   if(!rows.length){var m=document.createElement('p');m.className='rva-m';m.textContent='Nenhuma avaliação aqui.';L.appendChild(m);return;}
   rows.forEach(function(x){L.appendChild(card(x));});
  },function(){L.textContent='Não foi possível carregar.';});
 }
 function card(x){
  var nm=who(x,o.profiles&&o.profiles()),c=document.createElement('div');c.className='rva-c';
  var stars='★★★★★'.slice(0,x.rating)+'☆☆☆☆☆'.slice(0,5-x.rating);
  var low=x.rating<=2;
  c.innerHTML='<div class="rva-h"><b>'+esc(nm)+'</b><span class="rva-s" aria-label="'+x.rating+' de 5">'+stars+'</span><span class="rva-m">Stage '+x.stage+' · '+(x.course==='espanol'?'Espanhol':'Inglês')+' · '+new Date(x.created_at).toLocaleDateString('pt-BR')+'</span></div>'
   +'<div class="rva-h" style="margin-top:6px">'+(x.allow_public?'<span class="rva-g k">autorizou publicar</span><span class="rva-m">aparece como: '+esc(shown(nm,x.show_as))+' ('+SHOW[x.show_as]+')</span>':'<span class="rva-g">não autorizou publicar</span>')
   +(x.ai_assisted?'<span class="rva-g">rascunho com IA, aluno editou</span>':'')+(low?'<span class="rva-g w">nota baixa: responder em privado</span>':'')+'</div>'
   +'<div class="rva-t">'+(x.comment?esc(x.edited_comment||x.comment):'<span class="rva-m">(sem comentário)</span>')+'</div>'
   +(x.edited_comment&&x.edited_comment!==x.comment?'<div class="rva-m">Texto original do aluno: '+esc(x.comment)+'</div>':'');
  var a=document.createElement('div');a.className='rva-a';c.appendChild(a);
  function set(patch,btn){btn.disabled=true;Promise.resolve(o.sb.from('student_reviews').update(Object.assign({reviewed_at:new Date().toISOString()},patch)).eq('id',x.id)).then(function(q){if(q&&q.error){btn.disabled=false;return;}draw();});}
  function btn(t,cls,fn){var b=document.createElement('button');b.type='button';b.textContent=t;if(cls)b.className=cls;b.onclick=function(){fn(b);};a.appendChild(b);return b;}
  if(x.status!=='approved'&&x.allow_public&&x.comment&&!low)btn('Aprovar e publicar','',function(b){set({status:'approved'},b);});
  if(x.status!=='approved'&&!(x.allow_public&&x.comment&&!low))btn('Guardar (privada)','',function(b){set({status:x.status==='pending'?'rejected':x.status},b);});
  if(x.allow_public&&x.comment)btn('Editar texto','g',function(b){
   b.disabled=true;var ta=document.createElement('textarea');ta.className='rva-ta';ta.maxLength=600;ta.value=x.edited_comment||x.comment;c.insertBefore(ta,a);
   var n=document.createElement('p');n.className='rva-m';n.textContent='Só corrija ortografia e pontuação. Não mude o sentido do que o aluno escreveu.';c.insertBefore(n,a);
   var sv=document.createElement('button');sv.type='button';sv.textContent='Salvar texto e publicar';sv.onclick=function(){set({edited_comment:ta.value.trim()||null,status:'approved'},sv);};a.appendChild(sv);});
  if(x.status!=='rejected')btn('Rejeitar','g',function(b){set({status:'rejected'},b);});
  if(x.status==='approved')btn('Despublicar','g',function(b){set({status:'pending'},b);});
  return c;
 }
 draw();
}
window.ReviewsAdmin={mount:mount};
})();
