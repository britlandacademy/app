/* Britland teacher panel: class suggestions (strip) and the students' last class rating. Teacher only; shown with the student's name. */
(function(){
'use strict';
if(window.ClassDayAdmin)return;
var IC={
 song:'<path d="M9 18V5.5l10-2V16"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
 video:'<rect x="3" y="5.5" width="18" height="13" rx="3"/><path d="M10.2 9.4v5.2l4.4-2.6z"/>',
 film:'<rect x="3.5" y="9.5" width="17" height="10" rx="2"/><path d="M3.8 9.5l-.6-3.8 15.4-2.4.6 3.8M8 7.1l1.6 2.4M12.6 6.3l1.6 2.4"/>',
 activity:'<path d="M4 20.5h16"/><path d="M4 18l1-3.5L15.5 4a2 2 0 013 3L8 17.5z"/><path d="M13.5 6l3 3"/>'};
var KN={song:'canção',video:'vídeo',film:'filme',activity:'atividade'};
function ic(k){return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none;vertical-align:middle">'+(IC[k]||IC.song)+'</svg>';}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function css(){if(document.getElementById('cda-css'))return;var s=document.createElement('style');s.id='cda-css';
 s.textContent='.cda-it{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 0;border-top:1px solid var(--line,#e3dcc8);font-size:.9rem}.cda-it:first-of-type{border-top:0}.cda-it b{overflow-wrap:anywhere}'+
 '.cda-st{border-radius:99px;padding:1px 9px;font-size:.76rem;font-weight:700;background:rgba(240,195,106,.2)}.cda-st.ok{background:rgba(127,210,154,.22)}.cda-st.no{background:rgba(255,158,148,.22)}'+
 '.cda-b{display:inline-flex;align-items:center;min-height:32px;padding:0 12px;border-radius:99px;border:2px solid #c9a232;font-weight:700;font-size:.8rem;background:transparent;color:inherit;cursor:pointer;font-family:inherit;text-decoration:none}.cda-b.g{background:#c9a232;color:#111}'+
 '.cda-rate{margin:4px 0 8px;padding:8px 12px;border:1px dashed #c9a232;border-radius:12px;font-size:.88rem}.cda-rate .m{opacity:.75}';
 document.head.appendChild(s);}
function url(x){return /^https?:\/\//i.test(x.title)?x.title:(x.kind==='activity'?'':'https://www.youtube.com/results?search_query='+encodeURIComponent(x.title));}
function panel(box,o){
 css();
 Promise.resolve(o.sb.from('class_suggestions').select('id,kind,title,status,source,by_name,par_from,par_to,created_at').lte('par_from',o.to).gte('par_to',o.from).neq('status','rejected').order('created_at',{ascending:false})).then(function(r){
  var list=(r&&r.data)||[];box.textContent='';
  var k=document.createElement('div');k.className='nc-k';k.textContent='SUGESTÕES PARA PAR. '+o.from+(o.to!==o.from?'–'+o.to:'')+' · '+list.length;box.appendChild(k);
  if(!list.length){var m=document.createElement('div');m.className='nc-m';m.textContent='Nenhuma sugestão para estes parágrafos.';box.appendChild(m);return;}
  list.forEach(function(x){
   var d=document.createElement('div');d.className='cda-it';var u=url(x);
   d.innerHTML=ic(x.kind)+'<b>'+esc(x.title)+'</b><span class="nc-m">· '+KN[x.kind]+(x.source==='student'&&x.by_name?' · '+esc(x.by_name):'')+'</span><span style="margin-left:auto;display:flex;gap:6px;align-items:center;flex-wrap:wrap"><span class="cda-st '+(x.status==='approved'?'ok':'')+'">'+(x.status==='approved'?(x.source==='student'?'aprovada':'no ar'):'pendente')+'</span></span>';
   var a=d.lastChild;
   if(u){var l=document.createElement('a');l.className='cda-b';l.target='_blank';l.rel='noopener';l.href=u;l.textContent='Abrir';a.appendChild(l);}
   if(x.status!=='approved'){var ap=document.createElement('button');ap.type='button';ap.className='cda-b g';ap.textContent='Aprovar';
    ap.onclick=function(){ap.disabled=true;Promise.resolve(o.sb.from('class_suggestions').update({status:'approved'}).eq('id',x.id)).then(function(q){if(q&&q.error){ap.disabled=false;return;}panel(box,o);});};a.appendChild(ap);
    var rj=document.createElement('button');rj.type='button';rj.className='cda-b';rj.textContent='Recusar';
    rj.onclick=function(){rj.disabled=true;Promise.resolve(o.sb.from('class_suggestions').update({status:'rejected'}).eq('id',x.id)).then(function(){panel(box,o);});};a.appendChild(rj);}
   box.appendChild(d);});
 },function(){});
}
function rates(rows,o){
 css();if(!o.uids||!o.uids.length)return;
 Promise.resolve(o.sb.from('class_ratings').select('user_id,rating,reason,can_do,created_at').in('user_id',o.uids).order('created_at',{ascending:false}).limit(200)).then(function(r){
  var seen={};((r&&r.data)||[]).forEach(function(x){if(seen[x.user_id]||!rows[x.user_id])return;seen[x.user_id]=1;
   var n=x.rating,tag=n<=2?'nota baixa':(n>=4?'elogio':'neutra'),cls=n<=2?'no':(n>=4?'ok':'');
   var can=Object.keys(x.can_do||{});
   var d=document.createElement('div');d.className='cda-rate';
   d.innerHTML='<b>'+esc(o.name?o.name(x.user_id):'Aluno')+'</b> · última aula: nota '+n+'/5 <span class="cda-st '+cls+'">'+tag+'</span>'+(x.reason?' · “'+esc(x.reason)+'”':'')+'<br><span class="m">Eu consigo: '+(can.length?esc(can.join(' · ')):'—')+'</span>';
   rows[x.user_id].after(d);});
 },function(){});
}
window.ClassDayAdmin={panel:panel,rates:rates};
})();
