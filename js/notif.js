/* Britland: central de notificações do aluno (sino na barra + lista). Avisos automáticos e do professor vêm da tabela notifications. */
(function(){
'use strict';
var ICONS={
  pay:'<rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M3 10h18M7 15h3"/>',
  makeup:'<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M8 3v4M16 3v4M9 15l2 2 4-4"/>',
  exam:'<circle cx="12" cy="9" r="5"/><path d="M9 13.5L7.5 21l4.5-2.5 4.5 2.5-1.5-7.5"/>',
  credit:'<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M12 9v11M3 6.5h18V9H3zM12 6.5C10 3 6.5 3.5 7.2 5.8 7.6 7 12 6.5 12 6.5zM12 6.5c2-3.500 5.500-3 4.800-.7C16.400 7 12 6.500 12 6.500z"/>',
  promo:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.500" cy="8.500" r="1.200"/>',
  msg:'<path d="M5 18l-1.500 3 4-1.500M5 18C3.700 16.700 3 15 3 13c0-4.400 4-8 9-8s9 3.600 9 8-4 8-9 8c-1.500 0-2.900-.3-4-.9"/>',
  bell:'<path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>'
};
var TX={
  title:{en:'Notifications',pt:'Notificações',es:'Notificaciones'},
  all:{en:'Mark all as read',pt:'Marcar tudo como lido',es:'Marcar todo como leído'},
  empty:{en:'You are all caught up.',pt:'Tudo em dia por aqui.',es:'Todo al día.'},
  close:{en:'Close',pt:'Fechar',es:'Cerrar'},
  bell:{en:'Notifications',pt:'Notificações',es:'Notificaciones'},
  today:{en:'Today',pt:'Hoje',es:'Hoy'},
  yday:{en:'Yesterday',pt:'Ontem',es:'Ayer'},
  ago:{en:'{n} days ago',pt:'há {n} dias',es:'hace {n} días'},
  offer:{en:'Offer',pt:'Promoção',es:'Oferta'},
  notice:{en:'Notice',pt:'Aviso',es:'Aviso'}
};
function lang(es){var l=window.I18N&&window.I18N.lang;return l==='pt'||l==='es'||l==='en'?l:(es?'es':'en');}
function t(k,L,o){var s=(TX[k]||{})[L]||(TX[k]||{}).en||k;if(o)Object.keys(o).forEach(function(x){s=s.replace('{'+x+'}',o[x]);});return s;}
function money(cur,a){var n=Number(a||0).toFixed(2);return(cur==='BRL'?'R$ ':'€')+(L2==='pt'||cur==='BRL'?n.replace('.',','):n);}
var L2='en';
function fdate(d){var p=String(d||'').slice(0,10).split('-');return p.length===3?p[2]+'/'+p[1]:'';}
/* texto de cada tipo automático; o aviso de pagamento atrasado é crítico e fica sempre em português */
function render(n,L){
  var i=n.info||{},o={n:i.n,s:i.stage};
  if(n.kind==='pay')return{t:'Pagamento atrasado',b:'A mensalidade de '+fdate(i.due)+' está em aberto. Abra Pagamentos para regularizar.'};
  if(n.kind==='makeup'){var one=Number(i.n)===1;return{
    en:{t:'Make-up class available',b:'You have '+i.n+(one?' class':' classes')+' to make up. Choose a time in Schedule.'},
    pt:{t:'Aula para repor',b:'Você tem '+i.n+(one?' aula':' aulas')+' para repor. Escolha um horário na Agenda.'},
    es:{t:'Clase para reponer',b:'Tienes '+i.n+(one?' clase':' clases')+' para reponer. Elige un horario en la Agenda.'}}[L];}
  if(n.kind==='exam')return{
    en:{t:'Stage '+i.stage+' exam released',b:'Your teacher released the exam. You can start whenever you are ready.'},
    pt:{t:'Prova do Stage '+i.stage+' liberada',b:'Seu professor liberou a prova. Você pode começar quando estiver pronto.'},
    es:{t:'Examen de la Etapa '+i.stage+' liberado',b:'Tu profesor liberó el examen. Puedes empezar cuando estés listo.'}}[L];
  if(n.kind==='credit')return{
    en:{t:'Referral credit: '+money(i.cur,i.amount),b:'Your friend joined. The credit will be applied to your next payment.'},
    pt:{t:'Crédito de indicação: '+money(i.cur,i.amount),b:'Seu amigo entrou. O crédito será aplicado no seu próximo pagamento.'},
    es:{t:'Crédito por referido: '+money(i.cur,i.amount),b:'Tu amigo se unió. El crédito se aplicará en tu próximo pago.'}}[L];
  if(n.kind==='referral'){var w=i.name;return{
    en:{t:'Your referral joined the Britland family!',b:(w?w+' is':'Your friend is')+' now studying with us, thanks to you. When they pay their monthly fee, your bonus is yours. Keep sharing the love for languages!'},
    pt:{t:'Sua indicação entrou para a família Britland!',b:(w||'Seu amigo')+' agora estuda com a gente, graças a você. Quando pagar a mensalidade, o seu bônus é seu. Continue espalhando o amor pelos idiomas!'},
    es:{t:'¡Tu referido ya es parte de la familia Britland!',b:(w||'Tu amigo')+' ahora estudia con nosotros, gracias a ti. Cuando pague su mensualidad, tu bono es tuyo. ¡Sigue compartiendo el amor por los idiomas!'}}[L];}
  if(n.kind==='stage')return{
    en:{t:'Stage '+i.stage+' unlocked',b:'Your teacher opened Stage '+i.stage+' for you.'},
    pt:{t:'Stage '+i.stage+' liberado',b:'Seu professor liberou o Stage '+i.stage+' para você.'},
    es:{t:'Etapa '+i.stage+' desbloqueada',b:'Tu profesor abrió la Etapa '+i.stage+' para ti.'}}[L];
  if(n.kind==='cert')return{
    en:{t:'Certificate available',b:'Your Stage '+i.stage+' certificate is ready. Open My Profile to see it.'},
    pt:{t:'Certificado disponível',b:'Seu certificado do Stage '+i.stage+' está pronto. Abra Meu Perfil para ver.'},
    es:{t:'Certificado disponible',b:'Tu certificado de la Etapa '+i.stage+' está listo. Abre Mi Perfil para verlo.'}}[L];
  if(n.kind==='lessons')return{
    en:{t:'New exercises available',b:'Your lesson plan opened exercises up to Lesson '+i.upto+'.'},
    pt:{t:'Novos exercícios disponíveis',b:'Seu plano de aula liberou exercícios até a Lição '+i.upto+'.'},
    es:{t:'Nuevos ejercicios disponibles',b:'Tu plan de clase abrió ejercicios hasta la Lección '+i.upto+'.'}}[L];
  if(n.kind==='push'){
    var k=i.k,hm=i.at?new Date(i.at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'';
    var P={
      lesson1h:{en:['Class starting soon','Your class starts in 1 hour'+(hm?' ('+hm+')':'')+'.'],pt:['Aula daqui a pouco','Sua aula começa em 1 hora'+(hm?' ('+hm+')':'')+'.'],es:['Clase en breve','Tu clase empieza en 1 hora'+(hm?' ('+hm+')':'')+'.']},
      lessonday:{en:['Class tomorrow','Reminder: you have a class tomorrow'+(hm?' at '+hm:'')+'.'],pt:['Aula amanhã','Lembrete: você tem aula amanhã'+(hm?' às '+hm:'')+'.'],es:['Clase mañana','Recordatorio: tienes clase mañana'+(hm?' a las '+hm:'')+'.']},
      newlesson:{en:['New lesson unlocked','Lesson '+(i.ref||'')+' is ready for you.'],pt:['Nova lição liberada','A Lição '+(i.ref||'')+' está pronta para você.'],es:['Nueva lección desbloqueada','La Lección '+(i.ref||'')+' está lista para ti.']},
      streak:{en:['Your streak is at risk','Study for 5 minutes today to keep your '+(i.n||'')+'-day streak.'],pt:['Sua sequência está em risco','Estude 5 minutos hoje para manter sua sequência de '+(i.n||'')+' dias.'],es:['Tu racha está en riesgo','Estudia 5 minutos hoy para mantener tu racha de '+(i.n||'')+' días.']},
      idle:{en:['We miss you','Come back and continue where you left off.'],pt:['Sentimos sua falta','Volte e continue de onde parou.'],es:['Te extrañamos','Vuelve y continúa donde lo dejaste.']},
      pay:{en:['Payment due soon','Your monthly fee is due in 2 days.'],pt:['Mensalidade vence em breve','Sua mensalidade vence em 2 dias.'],es:['Pago próximo','Tu mensualidad vence en 2 días.']},
      rank:{en:['Streak ranking','Someone passed you in the streak ranking.'],pt:['Ranking de sequência','Alguém passou você no ranking de sequência.'],es:['Ranking de racha','Alguien te superó en el ranking de racha.']},
      grade:{en:['Exam result','Your exam result is out.'],pt:['Resultado da prova','O resultado da sua prova saiu.'],es:['Resultado del examen','El resultado de tu examen salió.']},
      birthday:{en:['Happy birthday!','Have a wonderful day.'],pt:['Feliz aniversário!','Tenha um ótimo dia.'],es:['¡Feliz cumpleaños!','Que tengas un gran día.']}
    }[k];
    if(P){var v=P[k==='pay'?'pt':L]||P.en;return{t:v[0],b:v[1]};}
  }
  return{t:n.title||t(n.kind==='promo'?'offer':'notice',L),b:n.body||''};
}
function iconOf(n){var k=n.kind==='push'?(n.info||{}).k:n.kind;
  return {referral:'credit',stage:'exam',cert:'exam',lessons:'makeup',lesson1h:'makeup',lessonday:'makeup',newlesson:'exam',grade:'exam',streak:'promo',pay:'pay',birthday:'credit'}[k]||(ICONS[k]?k:'msg');}
function when(d,L){var days=Math.floor((Date.now()-new Date(d).getTime())/864e5);return days<=0?t('today',L):days===1?t('yday',L):days<30?t('ago',L,{n:days}):fdate(new Date(d).toISOString());}
function svg(k){return'<svg viewBox="0 0 24 24" aria-hidden="true">'+ICONS[k]+'</svg>';}

var CSS='.n-bell{position:absolute;right:62px;top:calc(50% - 19px);width:38px;height:38px;min-height:38px;padding:0;border-radius:50%;background:#132a5a;border:1px solid #27407a;display:grid;place-items:center;color:#e4c06a;cursor:pointer;z-index:2}'
+'.n-bell svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;transform-origin:50% 12%}'
+'.n-bell:active{transform:scale(.94)}.n-bell:focus-visible{outline:3px solid #e4c06a;outline-offset:2px}'
+'.n-bell i{position:absolute;top:-5px;right:-5px;min-width:18px;height:18px;border-radius:99px;background:#ff3b30;color:#fff;font:700 .72rem/18px system-ui,sans-serif;text-align:center;font-style:normal;padding:0 5px;border:2px solid #0b1733;box-sizing:content-box}'
+'.n-bell i[hidden]{display:none}'
+'html:not(.fx-off) .n-bell.ring svg{animation:n-ring 1.3s ease-in-out 1}'
+'html:not(.fx-off) .n-bell.ring i{animation:n-pop .5s ease-out 1}'
+'@keyframes n-ring{0%,100%{transform:rotate(0)}12%{transform:rotate(16deg)}26%{transform:rotate(-14deg)}40%{transform:rotate(11deg)}54%{transform:rotate(-8deg)}68%{transform:rotate(5deg)}82%{transform:rotate(-2deg)}}'
+'@keyframes n-pop{0%{transform:scale(.4)}70%{transform:scale(1.25)}100%{transform:scale(1)}}'
+'@media(prefers-reduced-motion:reduce){.n-bell.ring svg,.n-bell.ring i{animation:none!important}}'
+'.n-ov{position:fixed;inset:0;z-index:55;background:var(--bg,#faf8f3);overflow:auto;padding:92px 16px 32px;-webkit-overflow-scrolling:touch}'
+'.n-in{max-width:560px;margin:0 auto}.n-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:6px 0 14px}'
+'.n-top h1{margin:0;font-size:1.7rem;font-family:var(--font-head,Georgia,serif);color:var(--ink,#17202f)}'
+'.n-mark{background:none;border:0;min-height:44px;padding:0 4px;color:#1b3470;font:inherit;font-size:.9rem;font-weight:700;text-decoration:underline;cursor:pointer}'
+'html.dark .n-mark,html[data-theme=dark] .n-mark{color:#e4c06a}'
+'.n-it{display:flex;gap:14px;align-items:flex-start;width:100%;text-align:left;background:var(--card,#fff);border:1px solid var(--line,#e6e0d2);border-radius:16px;padding:14px 34px 14px 14px;margin:0 0 10px;position:relative;color:var(--ink,#17202f);font:inherit;cursor:pointer}'
+'.n-ic{width:44px;height:44px;border-radius:12px;background:var(--chip,#efe9d9);display:grid;place-items:center;color:#b88a1f;flex:none}'
+'.n-ic svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}'
+'.n-it b{display:block;font-size:1rem}.n-it small{display:block;color:var(--muted,#5a6577);font-size:.88rem;line-height:1.35}.n-it .n-w{margin-top:4px;color:#8a6a12;font-size:.78rem;font-weight:700}'
+'.n-dot{position:absolute;top:16px;right:14px;width:10px;height:10px;border-radius:50%;background:#ff3b30}.n-it.rd{opacity:.78}'
+'.n-it.crit{border-color:#b3202a;background:#fbeeee;color:#3a1014}.n-it.crit small{color:#6b2a30}.n-it.crit .n-ic{background:#f4d6d8;color:#b3202a}'
+'.n-empty{text-align:center;color:var(--muted,#5a6577);padding:40px 0}';

var st={sb:null,es:false,items:[],bell:null,badge:null,ov:null,open:false,L:'en'};
function style(){if(document.getElementById('n-css'))return;var s=document.createElement('style');s.id='n-css';s.textContent=CSS;document.head.appendChild(s);}
function unread(){return st.items.filter(function(x){return !x.read_at;}).length;}
function seenKey(){return'bl-nseen';}
function paintBell(ring){
  var n=unread();st.badge.textContent=n>9?'9+':String(n);st.badge.hidden=!n;
  st.bell.setAttribute('aria-label',t('bell',st.L)+(n?' ('+n+')':''));
  if(ring&&n){st.bell.classList.remove('ring');void st.bell.offsetWidth;st.bell.classList.add('ring');setTimeout(function(){st.bell.classList.remove('ring');},1500);}
}
function go(n){
  var done=function(){if(n.url){location.href=n.url;}};
  if(!n.read_at){n.read_at=new Date().toISOString();paintBell(false);try{Promise.resolve(st.sb.rpc('notif_mark_read',{p_ids:[n.id]})).then(done,done);return;}catch(e){}}
  done();
}
function draw(){
  var ov=st.ov;if(!ov)return;ov.textContent='';
  var in_=document.createElement('div');in_.className='n-in';in_.setAttribute('data-noi18n','1');
  var top=document.createElement('div');top.className='n-top';
  var h=document.createElement('h1');h.textContent=t('title',st.L);top.appendChild(h);
  var mk=document.createElement('button');mk.type='button';mk.className='n-mark';mk.textContent=t('all',st.L);
  mk.onclick=function(){st.items.forEach(function(x){x.read_at=x.read_at||new Date().toISOString();});paintBell(false);draw();try{st.sb.rpc('notif_mark_read',{p_ids:null});}catch(e){}};
  if(unread())top.appendChild(mk);in_.appendChild(top);
  if(!st.items.length){var e=document.createElement('p');e.className='n-empty';e.textContent=t('empty',st.L);in_.appendChild(e);}
  st.items.forEach(function(n){
    var r=render(n,st.L),b=document.createElement('button');b.type='button';b.className='n-it'+(n.crit?' crit':'')+(n.read_at?' rd':'');
    b.innerHTML='<span class="n-ic">'+svg(iconOf(n))+'</span><div><b></b><small></small><small class="n-w"></small></div>'+(n.read_at?'':'<i class="n-dot"></i>');
    b.querySelector('b').textContent=r.t;var sm=b.querySelectorAll('small');sm[0].textContent=r.b;sm[1].textContent=when(n.created_at,n.kind==='pay'?'pt':st.L);
    b.onclick=function(){go(n);};in_.appendChild(b);
  });
  ov.appendChild(in_);
}
function toggle(v){
  st.open=v==null?!st.open:v;
  if(st.open){
    st.L=lang(st.es);st.ov=document.createElement('div');st.ov.className='n-ov';st.ov.setAttribute('role','dialog');st.ov.setAttribute('aria-label',t('title',st.L));
    document.body.appendChild(st.ov);document.documentElement.style.overflow='hidden';draw();
    st.bell.setAttribute('aria-expanded','true');
  }else if(st.ov){st.ov.remove();st.ov=null;document.documentElement.style.overflow='';st.bell.setAttribute('aria-expanded','false');}
}
function load(first){
  var sb=st.sb;
  return Promise.resolve(sb.rpc('notif_sync_me')).catch(function(){}).then(function(){
    return sb.from('notifications').select('id,kind,title,body,url,crit,info,read_at,created_at').order('created_at',{ascending:false}).limit(60);
  }).then(function(r){
    if(!r||r.error)return;
    st.items=(r.data||[]).sort(function(a,b){return(b.crit-a.crit)||(new Date(b.created_at)-new Date(a.created_at));});
    var maxId=st.items.reduce(function(m,x){return Math.max(m,x.id);},0),prev=0;try{prev=+localStorage.getItem(seenKey())||0;localStorage.setItem(seenKey(),String(Math.max(prev,maxId)));}catch(e){}
    paintBell(first||maxId>prev);if(st.open)draw();
  });
}
window.Notif={init:function(bar,sb,o){
  if(!bar||st.bell||!sb)return;
  st.sb=sb;st.es=!!(o&&o.es);st.L=lang(st.es);L2=st.L;style();
  var b=document.createElement('button');b.type='button';b.className='n-bell';b.setAttribute('aria-haspopup','dialog');b.setAttribute('aria-expanded','false');
  b.innerHTML=svg('bell')+'<i hidden>0</i>';st.bell=b;st.badge=b.querySelector('i');
  b.onclick=function(){toggle();};
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&st.open)toggle(false);});
  bar.appendChild(b);paintBell(false);
  load(true);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)load(false);});
  setInterval(function(){if(!document.hidden)load(false);},300000);
}};
})();
