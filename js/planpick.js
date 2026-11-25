/* Britland: escolha e troca de plano (aba Pagamentos). Abas por plano, periodo de pagamento,
   dupla/indicacao, resumo e barra fixa. Os descontos nunca acumulam: vale sempre o maior. */
(function(){
'use strict';

var ORDER=['essential','fluency-club','vip-intensive'];

var TX={
  pick:{en:'Choose your plan',es:'Elige tu plan'},
  change:{en:'Change plan',es:'Cambiar de plan'},
  cur:{en:'Current plan',es:'Plan actual'},
  month:{en:'/month',es:'/mes'},
  pace:{en:'Pace',es:'Ritmo'},
  how:{en:'How to pay',es:'Forma de pago'},
  more:{en:'See other ways to pay',es:'Ver otras formas de pago'},
  less:{en:'Show fewer options',es:'Ver menos opciones'},
  promo:{en:'Study partner or referral',es:'Pareja o recomendación'},
  code:{en:'Code (optional)',es:'Código (opcional)'},
  sum:{en:'Order summary',es:'Resumen del pedido'},
  total:{en:'Total per month',es:'Total por mes'},
  once:{en:'Charged once',es:'Cobro único'},
  nostack:{en:'Discounts do not stack: we always apply the best one.',
           es:'Los descuentos no se acumulan: siempre aplicamos el mayor.'},
  first:{en:'Billing starts on your 3rd lesson, the first regular one. The 2 trial lessons are free.',
         es:'El cobro empieza en tu 3.\u00AA clase, la primera regular. Las 2 clases de prueba son gratis.'},
  free:{en:'2 free lessons before you pay',es:'2 clases gratis antes de pagar'},
  go:{en:'Subscribe',es:'Suscribirme'},
  goc:{en:'Request change',es:'Pedir el cambio'},
  same:{en:'This is your current plan',es:'Este es tu plan actual'},
  up:{en:'An upgrade starts right away and is charged pro rata for the rest of the month.',
      es:'La subida de plan empieza enseguida y se cobra proporcional al resto del mes.'},
  down:{en:'A downgrade starts on your next billing date. Nothing changes this month.',
        es:'La bajada de plan empieza en tu próxima fecha de cobro. Este mes no cambia nada.'},
  sent:{en:'Request sent',es:'Pedido enviado'},
  sentb:{en:'Your teacher received it and will set everything up. You will see it here when it is done.',
         es:'Tu profesor lo recibió y lo dejará listo. Lo verás aquí cuando esté hecho.'},
  pend:{en:'Request sent. Waiting for your teacher.',es:'Pedido enviado. Esperando a tu profesor.'},
  cancel:{en:'Cancel request',es:'Cancelar pedido'},
  close:{en:'Close',es:'Cerrar'},
  err:{en:'Could not send. Please try again.',es:'No se pudo enviar. Inténtalo de nuevo.'},
  nop:{en:'Plans are not available right now.',es:'Los planes no están disponibles ahora.'}
};

/* o que cada plano entrega; o tamanho da turma e o que separa um plano do outro */
var META={
  'essential':{
    tag:{en:'Up to 4 students',es:'Hasta 4 alumnos'},
    sub:{en:'Steady weekly practice, at a lighter pace.',es:'Práctica semanal constante, a un ritmo más suave.'},
    li:[{en:'1 live lesson per week (50 min), small group of up to 4 students at your level',
         es:'1 clase en vivo por semana (50 min), grupo reducido de hasta 4 alumnos de tu nivel'},
        {en:'1 group conversation session per month',es:'1 sesión de conversación en grupo al mes'},
        {en:'Full access to the app: lessons, audio, smart revision and progress',
         es:'Acceso completo a la app: lecciones, audios, repaso inteligente y progreso'}],
    pace:{en:'1 full stage (25 lessons) in about 6 months',es:'1 etapa completa (25 clases) en unos 6 meses'}},
  'fluency-club':{
    tag:{en:'Up to 2 students',es:'Hasta 2 alumnos'},
    sub:{en:'For real speaking confidence at work and when travelling.',
         es:'Para hablar con confianza en el trabajo y en los viajes.'},
    li:[{en:'2 live lessons per week (50 min), in a pair of up to 2 students at your level',
         es:'2 clases en vivo por semana (50 min), en pareja de hasta 2 alumnos de tu nivel'},
        {en:'2 group conversation sessions per month',es:'2 sesiones de conversación en grupo al mes'},
        {en:'Full access to the app, plus tracking of your recurring mistakes',
         es:'Acceso completo a la app, más seguimiento de tus errores recurrentes'}],
    pace:{en:'1 full stage in about 3 months',es:'1 etapa completa en unos 3 meses'}},
  'vip-intensive':{
    tag:{en:'One to one',es:'Individual'},
    sub:{en:'For a set deadline: an interview, a move abroad or an exam.',
         es:'Para un plazo concreto: una entrevista, una mudanza o un examen.'},
    li:[{en:'3 private lessons per week (50 min), built around your goal',
         es:'3 clases particulares por semana (50 min), centradas en tu objetivo'},
        {en:'Free access to the group conversation sessions at your level',
         es:'Acceso libre a las sesiones de conversación de tu nivel'},
        {en:'Full access to the app, plus a stage-by-stage plan and priority support',
         es:'Acceso completo a la app, más un plan por etapa y soporte prioritario'}],
    pace:{en:'1 full stage in about 2 months',es:'1 etapa completa en unos 2 meses'}}
};

/* periodos de pagamento. off = desconto em %; months = ciclos cobrados de uma vez */
function periods(cur,L){
  var P=[{k:'mensal',off:0,months:1,
      t:{en:'Monthly',es:'Mensual'},s:{en:'Cancel whenever you want',es:'Cancela cuando quieras'}}];
  if(cur==='BRL')P.push({k:'cartao6',off:5,months:1,
      t:{en:'Card, 6 months',es:'Tarjeta, 6 meses'},
      s:{en:'Charged every month, 6-month commitment',es:'Cobro mensual, compromiso de 6 meses'}});
  P.push({k:'avista3',off:5,months:3,
      t:{en:'3 months upfront',es:'3 meses por adelantado'},
      s:cur==='BRL'?{en:'Pix or Wise',es:'Pix o Wise'}:{en:'Wise or card',es:'Wise o tarjeta'}});
  P.push({k:'avista6',off:10,months:6,
      t:{en:'6 months upfront',es:'6 meses por adelantado'},
      s:cur==='BRL'?{en:'Pix or Wise, biggest discount',es:'Pix o Wise, el mayor descuento'}
                   :{en:'Wise or card, biggest discount',es:'Wise o tarjeta, el mayor descuento'}});
  P.forEach(function(p){p.label=p.t[L]||p.t.en;p.note=p.s[L]||p.s.en;});
  return P;
}

var DUPLA=10; /* dupla: 10% para cada um, so no Fluency Club */

function money(cur,v){
  var s=Number(v||0).toFixed(2),i=s.split('.')[0],d=s.split('.')[1];
  i=i.replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  return (cur==='BRL'?'R$ ':'€ ')+i+','+d;
}
function el(t,a,c){var n=document.createElement(t);if(a)Object.keys(a).forEach(function(k){
  if(a[k]!=null)n.setAttribute(k,a[k]);});
  (Array.isArray(c)?c:[c]).forEach(function(x){if(x==null||x===false)return;
    n.append(x.nodeType?x:document.createTextNode(String(x)));});return n;}
function tx(k,L){return (TX[k]||{})[L]||(TX[k]||{}).en||k;}
function fam(slug){return String(slug||'').replace(/-(brl|eur)$/,'');}

function css(){
  if(document.getElementById('pp-css'))return;
  var s=document.createElement('style');s.id='pp-css';s.textContent=[
  '.pp{margin:0 0 18px}',
  '.pp-tabs{display:flex;gap:6px;margin:0 0 12px}',
  '.pp-tabs button{flex:1;min-height:44px;padding:8px 4px;justify-content:center;text-align:center;',
    'border-radius:20px!important;border:2px solid var(--line);background:var(--surface);color:var(--ink);',
    'font-size:.92rem;line-height:1.15}',
  '.pp-tabs button[aria-selected=true]{border-color:var(--accent);background:var(--accent);color:var(--accent-ink)}',
  '.pp-card{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:14px;margin:0 0 12px}',
  '.pp-top{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:8px}',
  '.pp-top b{font-size:1.2rem}',
  '.pp-pr{font-size:1.35rem;font-weight:700;white-space:nowrap}',
  '.pp-pr small{font-size:.8rem;font-weight:400;color:var(--muted)}',
  '.pp-tag{display:inline-block;border:1px solid var(--line);border-radius:999px;padding:1px 10px;',
    'font-size:.8rem;color:var(--muted);margin:6px 0 0}',
  '.pp-sub{color:var(--muted);margin:8px 0 0}',
  '.pp-li{list-style:none;margin:10px 0 0;padding:0}',
  '.pp-li li{position:relative;padding:0 0 0 24px;margin:0 0 6px;font-size:.95rem}',
  '.pp-li li svg{position:absolute;left:0;top:3px;width:16px;height:16px;fill:none;stroke:var(--ink);',
    'stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}',
  '.pp-pace{margin:10px 0 0;padding-top:8px;border-top:1px solid var(--line);color:var(--muted);font-size:.9rem}',
  '.pp-h{font-weight:700;margin:14px 0 8px}',
  '.pp-per{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}',
  '.pp-per button{display:block;width:100%;text-align:left;padding:10px 12px;border-radius:14px!important;',
    'border:2px solid var(--line);background:var(--surface);color:var(--ink);font-weight:400;min-height:0}',
  '.pp-per button[aria-pressed=true]{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}',
  '.pp-per b{display:block;font-size:1rem}',
  '.pp-per small{display:block;color:var(--muted);font-size:.82rem;margin-top:2px}',
  '.pp-off{display:inline-block;background:var(--ok-bg);color:var(--ok);border-radius:999px;',
    'padding:0 8px;font-size:.78rem;font-weight:700;margin-left:6px;vertical-align:1px}',
  '.pp-link{display:block;width:100%;margin:10px 0 0;background:transparent;border:0;color:var(--ink);',
    'text-decoration:underline;font-weight:700;font-size:.92rem;padding:6px;min-height:0;cursor:pointer}',
  '.pp-in{width:100%;margin-top:6px}',
  '.pp-sum .r{display:flex;justify-content:space-between;gap:10px;padding:3px 0}',
  '.pp-sum .r.d{color:var(--ok);font-weight:700}',
  '.pp-sum .r.t{font-weight:700;font-size:1.15rem;border-top:1px solid var(--line);margin-top:6px;padding-top:8px}',
  '.pp-note{color:var(--muted);font-size:.85rem;margin:8px 0 0}',
  '.pp-bar{position:sticky;bottom:0;z-index:4;display:flex;align-items:center;justify-content:space-between;',
    'gap:12px;background:var(--accent);color:var(--accent-ink);border-radius:18px;padding:12px 14px;margin:14px 0 0}',
  '.pp-bar b{font-size:1.15rem;display:block;white-space:nowrap}',
  '.pp-bar small{display:block;font-size:.8rem;opacity:.85}',
  '.pp-bar button{background:var(--accent-ink);color:var(--accent);border-color:var(--accent-ink);white-space:nowrap}',
  '.pp-bar button[disabled]{opacity:.55}',
  '.pp-free{text-align:center;color:var(--muted);font-size:.86rem;margin:8px 0 0}',
  '.pp-rule{margin:10px 0 0;padding:10px 12px;border-left:3px solid var(--accent);background:var(--card);',
    'border-radius:0 14px 14px 0;font-size:.9rem}',
  '.pp-msg{font-weight:700;min-height:1.3em;color:var(--bad);margin:6px 0 0}'
  ].join('');document.head.append(s);
}
var CK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>';

function mount(box,o){
  o=o||{};css();
  var sb=o.sb,L=(window.I18N&&window.I18N.lang==='es')||o.es?'es':'en';
  var wrap=el('div',{class:'pp'});box.append(wrap);
  wrap.append(el('p',{class:'hint'},'...'));

  sb.from('billing_plans').select('slug,nome,moeda,valor_centavos,checkout_url,ativo')
    .then(function(r){
      var rows=(r&&r.data)||[];
      if(r&&r.error||!rows.length){wrap.textContent='';wrap.append(el('p',{class:'hint'},tx('nop',L)));return;}
      draw(wrap,rows,sb,L,o);
    },function(){wrap.textContent='';wrap.append(el('p',{class:'hint'},tx('nop',L)));});
}

function draw(wrap,rows,sb,L,o){
  wrap.textContent='';
  /* moeda: a do plano atual; se nao houver, Brasil paga em real e o resto em euro */
  var cc=String((o.profile&&o.profile.country)||'').toUpperCase();
  var cur=o.currency||(cc==='BR'?'BRL':cc?'EUR':'BRL');
  if(!rows.some(function(x){return x.moeda===cur;}))cur=rows[0].moeda;

  var plans=ORDER.map(function(f){
    return rows.filter(function(x){return x.moeda===cur&&fam(x.slug)===f;})[0];
  }).filter(Boolean);
  if(!plans.length){wrap.append(el('p',{class:'hint'},TX.nop[L]||TX.nop.en));return;}

  var curFam=o.current?fam(o.current):null;
  var i=0;plans.forEach(function(p,k){if(fam(p.slug)===curFam)i=k;});
  var sel=i,per='mensal',dupla=false,code='',open=false,busy=false;

  var tabs=el('div',{class:'pp-tabs',role:'tablist'});
  var body=el('div',{});
  wrap.append(el('h3',{class:'sec'},tx(o.current?'change':'pick',L)),tabs,body);

  function pct(){
    var P=periods(cur,L),p=P.filter(function(x){return x.k===per;})[0]||P[0];
    var d=(dupla&&fam(plans[sel].slug)==='fluency-club')?DUPLA:0;
    return{off:Math.max(p.off,d),via:d>p.off?'dupla':'periodo',p:p};
  }
  function render(){
    tabs.textContent='';
    plans.forEach(function(p,k){
      var b=el('button',{type:'button',role:'tab','aria-selected':k===sel?'true':'false'},p.nome);
      b.addEventListener('click',function(){if(sel!==k){sel=k;if(fam(plans[sel].slug)!=='fluency-club')dupla=false;render();}});
      tabs.append(b);});

    body.textContent='';
    var p=plans[sel],m=META[fam(p.slug)]||{},full=p.valor_centavos/100;
    var c=el('div',{class:'pp-card'});
    c.append(el('div',{class:'pp-top'},[el('b',{},p.nome),
      el('span',{class:'pp-pr'},[money(cur,full),el('small',{},tx('month',L))])]));
    if(m.tag)c.append(el('span',{class:'pp-tag'},m.tag[L]||m.tag.en));
    if(m.sub)c.append(el('p',{class:'pp-sub'},m.sub[L]||m.sub.en));
    if(m.li){var ul=el('ul',{class:'pp-li'});m.li.forEach(function(x){
      var li=el('li',{});li.innerHTML=CK;li.append(x[L]||x.en);ul.append(li);});c.append(ul);}
    if(m.pace)c.append(el('div',{class:'pp-pace'},tx('pace',L)+': '+(m.pace[L]||m.pace.en)));
    body.append(c);

    /* periodo: dois visiveis (mensal e o de maior desconto) e o resto atras do link */
    body.append(el('div',{class:'pp-h'},tx('how',L)));
    var P=periods(cur,L),show=open?P:[P[0],P[P.length-1]];
    var gr=el('div',{class:'pp-per'});
    show.forEach(function(x){
      var v=full*(1-x.off/100);
      var b=el('button',{type:'button','aria-pressed':x.k===per?'true':'false'});
      var h=el('b',{},x.label);
      if(x.off)h.append(el('span',{class:'pp-off'},'−'+x.off+'%'));
      b.append(h,el('small',{},money(cur,v)+tx('month',L)+' · '+x.note));
      b.addEventListener('click',function(){per=x.k;render();});
      gr.append(b);});
    body.append(gr);
    var lk=el('button',{type:'button',class:'pp-link'},tx(open?'less':'more',L));
    lk.addEventListener('click',function(){open=!open;
      if(!open&&!show.some(function(x){return x.k===per;}))per='mensal';render();});
    body.append(lk);

    /* dupla e indicacao: a dupla so existe no Fluency Club, que e o plano de ate 2 alunos */
    var pc=el('div',{class:'pp-card'});
    pc.append(el('div',{style:'font-weight:700'},tx('promo',L)));
    if(fam(p.slug)==='fluency-club'){
      var lb=el('label',{style:'display:flex;gap:8px;align-items:flex-start;margin:8px 0 0;font-size:.95rem'});
      var ck=el('input',{type:'checkbox',style:'min-height:0;width:20px;height:20px;margin-top:2px'});
      if(dupla)ck.setAttribute('checked','checked');
      ck.addEventListener('change',function(){dupla=ck.checked;render();});
      lb.append(ck,el('span',{},(L==='es'
        ?'Estudio con una pareja (10% para cada uno mientras los dos sigan activos)'
        :'I study with a partner (10% off each while both stay active)')));
      pc.append(lb);}
    var inp=el('input',{type:'text',class:'pp-in',placeholder:tx('code',L),'aria-label':tx('code',L),value:code});
    inp.addEventListener('change',function(){code=inp.value;});
    pc.append(inp);
    body.append(pc);

    /* resumo */
    var r=pct(),val=full*(1-r.off/100),cut=full-val,P2=r.p;
    var sm=el('div',{class:'pp-card pp-sum'});
    sm.append(el('div',{class:'pp-h',style:'margin-top:0'},tx('sum',L)));
    sm.append(el('div',{class:'r'},[el('span',{},p.nome),el('span',{},money(cur,full))]));
    if(cut>0.004)sm.append(el('div',{class:'r d'},[
      el('span',{},r.via==='dupla'?(L==='es'?'Pareja de estudio (10%)':'Study partner (10%)'):P2.label+' ('+P2.off+'%)'),
      el('span',{},'−'+money(cur,cut))]));
    sm.append(el('div',{class:'r t'},[el('span',{},tx('total',L)),el('span',{},money(cur,val))]));
    if(P2.months>1)sm.append(el('div',{class:'r'},[
      el('span',{},tx('once',L)+' ('+P2.months+(L==='es'?' meses':' months')+')'),
      el('span',{},money(cur,val*P2.months))]));
    sm.append(el('p',{class:'pp-note'},tx('nostack',L)));
    sm.append(el('p',{class:'pp-note'},tx('first',L)));
    body.append(sm);

    /* troca de plano: subir vale na hora, descer vale no proximo ciclo */
    var same=curFam&&fam(p.slug)===curFam,upg=null;
    if(curFam&&!same){
      var ci=ORDER.indexOf(curFam),ni=ORDER.indexOf(fam(p.slug));
      upg=ni>ci;body.append(el('div',{class:'pp-rule'},tx(upg?'up':'down',L)));}

    var msg=el('p',{class:'pp-msg','aria-live':'polite'});body.append(msg);
    var go=el('button',{type:'button'},same?tx('same',L):tx(o.current?'goc':'go',L));
    if(same||busy)go.setAttribute('disabled','disabled');
    go.addEventListener('click',function(){send(p,r,val,msg,go);});
    if(!o.current)body.append(el('p',{class:'pp-free'},tx('free',L)));
    body.append(el('div',{class:'pp-bar'},[
      el('div',{},[el('b',{},money(cur,val)+tx('month',L)),
        el('small',{},(m.tag?(m.tag[L]||m.tag.en)+' · ':'')+P2.label)]),go]));
  }

  function send(p,r,val,msg,go){
    if(busy)return;busy=true;go.setAttribute('disabled','disabled');msg.textContent='';
    var P=periods(cur,L),P2=P.filter(function(x){return x.k===per;})[0]||P[0];
    /* se o gateway ja estiver ligado, o aluno vai direto para o checkout */
    if(p.ativo&&p.checkout_url&&per==='mensal'){
      try{window.open(p.checkout_url,'_blank','noopener');}catch(e){location.href=p.checkout_url;}
      busy=false;go.removeAttribute('disabled');return;}
    sb.from('plan_requests').insert({
      slug:p.slug,plano:p.nome,periodo:per,moeda:cur,
      valor_centavos:Math.round(val*100),
      desconto:r.off?(r.via==='dupla'?'dupla-10':P2.k+'-'+P2.off):null,
      codigo:code?String(code).slice(0,40):null,
      tipo:o.current?'troca':'novo'
    }).then(function(q){
      busy=false;
      if(q&&q.error){go.removeAttribute('disabled');msg.textContent=tx('err',L);return;}
      done(L,o);
    },function(){busy=false;go.removeAttribute('disabled');msg.textContent=tx('err',L);});
  }
  render();
}

/* a caixa segue o padrao do app (js/dialog.js), nunca o alert do navegador */
function done(L,o){
  var fin=function(){if(o.onDone)o.onDone();};
  if(window.BL_DLG&&BL_DLG.alert){
    try{BL_DLG.alert(tx('sentb',L),{title:tx('sent',L)}).then(fin,fin);return;}catch(e){}}
  var ov=el('div',{class:'g-hov',role:'dialog','aria-modal':'true'});
  var b=el('button',{type:'button'},tx('close',L));
  var cl=function(){ov.remove();fin();};
  b.addEventListener('click',cl);
  ov.append(el('div',{class:'g-hdlg'},[el('h2',{style:'margin:0 0 6px'},tx('sent',L)),
    el('p',{style:'margin:0 0 10px'},tx('sentb',L)),el('div',{class:'row'},b)]));
  ov.addEventListener('click',function(e){if(e.target===ov)cl();});
  document.body.append(ov);
}

window.PlanPick={mount:mount,TX:TX,META:META,periods:periods,ORDER:ORDER};
})();
