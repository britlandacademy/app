/* Britland: escolha e troca de plano (aba Pagamentos). Lista de planos, periodo de pagamento,
   dupla/indicacao, resumo e botao de assinar. Os descontos nunca acumulam: vale sempre o maior. */
(function(){
'use strict';

var ORDER=['essential','fluency-club','vip-intensive'];

var TX={
  pick:{en:'Escolha seu plano',es:'Elige tu plan'},
  change:{en:'Trocar de plano',es:'Cambiar de plan'},
  cur:{en:'Plano atual',es:'Plan actual'},
  month:{en:'/mês',es:'/mes'},
  main:{en:'Mais escolhido',es:'Más elegido'},
  how:{en:'Como pagar',es:'Forma de pago'},
  more:{en:'Ver outras formas de pagar',es:'Ver otras formas de pago'},
  less:{en:'Ver menos opções',es:'Ver menos opciones'},
  promo:{en:'Dupla ou indicação',es:'Pareja o recomendación'},
  code:{en:'Código (opcional)',es:'Código (opcional)'},
  sum:{en:'Resumo do pedido',es:'Resumen del pedido'},
  total:{en:'Total por mês',es:'Total por mes'},
  once:{en:'Cobrança única',es:'Cobro único'},
  nostack:{en:'Os descontos não acumulam: aplicamos sempre o maior.',
           es:'Los descuentos no se acumulan: siempre aplicamos el mayor.'},
  first:{en:'A cobrança começa na sua 3ª aula, a primeira regular. As 2 aulas de teste são grátis.',
         es:'El cobro empieza en tu 3.\u00AA clase, la primera regular. Las 2 clases de prueba son gratis.'},
  plan:{en:'Plano',es:'Plano'},
  free:{en:'2 aulas grátis antes de pagar',es:'2 clases gratis antes de pagar'},
  go:{en:'Assinar',es:'Suscribirme'},
  goc:{en:'Pedir a troca',es:'Pedir el cambio'},
  same:{en:'Este é o seu plano atual',es:'Este es tu plan actual'},
  up:{en:'A subida de plano vale na hora e é cobrada proporcional ao resto do mês.',
      es:'La subida de plan empieza enseguida y se cobra proporcional al resto del mes.'},
  down:{en:'A descida de plano vale na próxima data de cobrança. Este mês nada muda.',
        es:'La bajada de plan empieza en tu próxima fecha de cobro. Este mes no cambia nada.'},
  sent:{en:'Pedido enviado',es:'Pedido enviado'},
  sentb:{en:'O professor recebeu e vai deixar tudo pronto. Você verá aqui quando estiver feito.',
         es:'Tu profesor lo recibió y lo dejará listo. Lo verás aquí cuando esté hecho.'},
  pend:{en:'Pedido enviado. Aguardando o professor.',es:'Pedido enviado. Esperando a tu profesor.'},
  cancel:{en:'Cancelar pedido',es:'Cancelar pedido'},
  close:{en:'Fechar',es:'Cerrar'},
  err:{en:'Não foi possível enviar. Tente de novo.',es:'No se pudo enviar. Inténtalo de nuevo.'},
  nop:{en:'Os planos não estão disponíveis agora.',es:'Los planes no están disponibles ahora.'}
};

/* o que cada plano entrega; o tamanho da turma e o que separa um plano do outro */
var META={
  'essential':{
    tag:{en:'Até 4 alunos',es:'Hasta 4 alumnos'},
    line:{en:'1 aula por semana, ritmo leve',es:'1 clase por semana, ritmo suave'},
    sub:{en:'Prática semanal constante, em ritmo mais leve.',es:'Práctica semanal constante, a un ritmo más suave.'},
    li:[{en:'1 aula ao vivo por semana (50 min), em grupo de até 4 alunos do seu nível',
         es:'1 clase en vivo por semana (50 min), grupo reducido de hasta 4 alumnos de tu nivel'},
        {en:'1 sessão de conversação em grupo por mês',es:'1 sesión de conversación en grupo al mes'},
        {en:'Acesso completo ao app: lições, áudios, revisão inteligente e progresso',
         es:'Acceso completo a la app: lecciones, audios, repaso inteligente y progreso'}],
    pace:{en:'1 estágio completo (25 aulas) em cerca de 6 meses',es:'1 etapa completa (25 clases) en unos 6 meses'}},
  'fluency-club':{
    tag:{en:'Até 2 alunos',es:'Hasta 2 alumnos'},
    line:{en:'2 aulas por semana, para falar com confiança',es:'2 clases por semana, para hablar con confianza'},
    sub:{en:'Para falar com confiança de verdade no trabalho e em viagens.',
         es:'Para hablar con confianza en el trabajo y en los viajes.'},
    li:[{en:'2 aulas ao vivo por semana (50 min), em dupla de até 2 alunos do seu nível',
         es:'2 clases en vivo por semana (50 min), en pareja de hasta 2 alumnos de tu nivel'},
        {en:'2 sessões de conversação em grupo por mês',es:'2 sesiones de conversación en grupo al mes'},
        {en:'Acesso completo ao app, mais acompanhamento dos seus erros recorrentes',
         es:'Acceso completo a la app, más seguimiento de tus errores recurrentes'}],
    pace:{en:'1 estágio completo em cerca de 3 meses',es:'1 etapa completa en unos 3 meses'}},
  'vip-intensive':{
    tag:{en:'Individual',es:'Individual'},
    line:{en:'3 aulas por semana, para quem tem prazo',es:'3 clases por semana, para quien tiene plazo'},
    sub:{en:'Para um prazo definido: uma entrevista, uma mudança para o exterior ou uma prova.',
         es:'Para un plazo concreto: una entrevista, una mudanza o un examen.'},
    li:[{en:'3 aulas particulares por semana (50 min), feitas em torno do seu objetivo',
         es:'3 clases particulares por semana (50 min), centradas en tu objetivo'},
        {en:'Acesso livre às sessões de conversação em grupo do seu nível',
         es:'Acceso libre a las sesiones de conversación de tu nivel'},
        {en:'Acesso completo ao app, mais plano por estágio e suporte prioritário',
         es:'Acceso completo a la app, más un plan por etapa y soporte prioritario'}],
    pace:{en:'1 estágio completo em cerca de 2 meses',es:'1 etapa completa en unos 2 meses'}}
};

/* periodos de pagamento. off = desconto em %; months = ciclos cobrados de uma vez */
function periods(cur,L){
  var P=[{k:'mensal',off:0,months:1,
      t:{en:'Mensal',es:'Mensual'},s:{en:'Cancele quando quiser',es:'Cancela cuando quieras'}}];
  if(cur==='BRL')P.push({k:'cartao6',off:5,months:1,
      t:{en:'Cartão, 6 meses',es:'Tarjeta, 6 meses'},
      s:{en:'Cobrado todo mês, compromisso de 6 meses',es:'Cobro mensual, compromiso de 6 meses'}});
  P.push({k:'avista3',off:5,months:3,
      t:{en:'3 meses à vista',es:'3 meses por adelantado'},
      s:cur==='BRL'?{en:'Pix ou Wise',es:'Pix o Wise'}:{en:'Wise ou cartão',es:'Wise o tarjeta'}});
  P.push({k:'avista6',off:promo6(),months:6,
      t:{en:'6 meses à vista',es:'6 meses por adelantado'},
      s:cur==='BRL'?{en:'Pix ou Wise, o maior desconto',es:'Pix o Wise, el mayor descuento'}
                   :{en:'Wise ou cartão, o maior desconto',es:'Wise o tarjeta, el mayor descuento'}});
  if(promo6()>10)P[P.length-1].tip={en:'Até 30/11',es:'Hasta el 30/11'};
  P.forEach(function(p){p.label=p.t[L]||p.t.en;p.note=p.s[L]||p.s.en;});
  return P;
}

/* promocao de lancamento: 30% no semestre a vista ate 30/11/2026 (fim do dia em Brasilia); depois, 10% */
function promo6(){return Date.now()<Date.UTC(2026,11,1,3,0,0)?30:10;}
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
  '.pp-pl{display:block;width:100%;text-align:left;position:relative;padding:12px 14px;',
    'margin:0 0 8px;border-radius:14px!important;border:2px solid var(--line);background:var(--surface);',
    'color:var(--ink);font-weight:400;min-height:0}',
  '.pp-pl[aria-pressed=true]{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}',
  '.pp-pl .t{display:flex;justify-content:space-between;align-items:baseline;gap:8px}',
  '.pp-pl b{font-size:1.05rem}',
  '.pp-pl .pr{font-weight:700;white-space:nowrap}',
  '.pp-pl small{display:block;color:var(--muted);font-size:.86rem;margin-top:2px;padding-right:34px}',
  '.pp-pl .tg{display:inline-block;border:1px solid var(--line);border-radius:999px;padding:0 9px;',
    'font-size:.74rem;color:var(--muted);margin-top:6px}',
  '.pp-pl .rd{position:absolute;right:14px;bottom:14px;width:22px;height:22px;border-radius:50%;',
    'border:2px solid var(--line);box-sizing:border-box}',
  '.pp-pl[aria-pressed=true] .rd{border-color:var(--accent);background:var(--accent);',
    'box-shadow:inset 0 0 0 4px var(--surface)}',
  '.pp-star{display:inline-block;background:var(--accent);color:var(--accent-ink);border-radius:999px;',
    'padding:0 8px;font-size:.72rem;font-weight:700;margin-left:6px;vertical-align:1px}',
  '.pp-card{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:14px;margin:0 0 12px}',
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
  '.pp-go{width:100%;min-height:50px;font-weight:700;margin:4px 0 0}',
  '.pp-go[disabled]{opacity:.55}',
  '.pp-free{text-align:center;color:var(--muted);font-size:.86rem;margin:8px 0 0}',
  '.pp-rule{margin:10px 0 0;padding:10px 12px;border-left:3px solid var(--accent);background:var(--card);',
    'border-radius:0 14px 14px 0;font-size:.9rem}',
  '.pp-msg{font-weight:700;min-height:1.3em;color:var(--bad);margin:6px 0 0}'
  ].join('');document.head.append(s);
}

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
  var i=0;plans.forEach(function(p,k){if(fam(p.slug)===(curFam||'fluency-club'))i=k;});
  var sel=i,per='mensal',dupla=false,code='',open=false,busy=false;

  var body=el('div',{});
  wrap.append(el('h3',{class:'sec'},tx(o.current?'change':'pick',L)),body);

  function pct(){
    var P=periods(cur,L),p=P.filter(function(x){return x.k===per;})[0]||P[0];
    var d=(dupla&&fam(plans[sel].slug)==='fluency-club')?DUPLA:0;
    return{off:Math.max(p.off,d),via:d>p.off?'dupla':'periodo',p:p};
  }
  function render(){
    body.textContent='';
    var p=plans[sel],m=META[fam(p.slug)]||{},full=p.valor_centavos/100;

    /* lista de planos: um cartao por plano, o escolhido fica marcado */
    var lc=el('div',{class:'pp-card'});
    lc.append(el('div',{class:'pp-h',style:'margin-top:0'},tx('plan',L)));
    plans.forEach(function(q,k){
      var mq=META[fam(q.slug)]||{},b=el('button',{type:'button',class:'pp-pl','aria-pressed':k===sel?'true':'false'});
      var nm=el('b',{},q.nome);
      if(fam(q.slug)==='fluency-club')nm.append(el('span',{class:'pp-star'},tx('main',L)));
      b.append(el('div',{class:'t'},[nm,el('span',{class:'pr'},money(cur,q.valor_centavos/100))]),
        el('small',{},mq.line?(mq.line[L]||mq.line.en):''),
        el('span',{class:'tg'},mq.tag?(mq.tag[L]||mq.tag.en):''),el('span',{class:'rd'}));
      b.addEventListener('click',function(){if(sel!==k){sel=k;if(fam(plans[sel].slug)!=='fluency-club')dupla=false;render();}});
      lc.append(b);});
    body.append(lc);

    /* periodo: dois visiveis (mensal e o de maior desconto) e o resto atras do link */
    var hc=el('div',{class:'pp-card'});
    hc.append(el('div',{class:'pp-h',style:'margin-top:0'},tx('how',L)));
    var P=periods(cur,L),show=open?P:[P[0],P[P.length-1]];
    var gr=el('div',{class:'pp-per'});
    show.forEach(function(x){
      var v=full*(1-x.off/100);
      var b=el('button',{type:'button','aria-pressed':x.k===per?'true':'false'});
      var h=el('b',{},x.label);
      if(x.off)h.append(el('span',{class:'pp-off'},'−'+x.off+'%'));
      if(x.tip)h.append(el('span',{class:'pp-off'},x.tip[L]||x.tip.en));
      b.append(h,el('small',{},money(cur,v)+tx('month',L)+' · '+x.note));
      b.addEventListener('click',function(){per=x.k;render();});
      gr.append(b);});
    hc.append(gr);
    var lk=el('button',{type:'button',class:'pp-link'},tx(open?'less':'more',L));
    lk.addEventListener('click',function(){open=!open;
      if(!open&&!show.some(function(x){return x.k===per;}))per='mensal';render();});
    hc.append(lk);

    /* dupla e indicacao: a dupla so existe no Fluency Club, que e o plano de ate 2 alunos */
    var pc=hc;
    pc.append(el('div',{class:'pp-h'},tx('promo',L)));
    if(fam(p.slug)==='fluency-club'){
      var lb=el('label',{style:'display:flex;gap:8px;align-items:flex-start;margin:8px 0 0;font-size:.95rem'});
      var ck=el('input',{type:'checkbox',style:'min-height:0;width:20px;height:20px;margin-top:2px'});
      if(dupla)ck.setAttribute('checked','checked');
      ck.addEventListener('change',function(){dupla=ck.checked;render();});
      lb.append(ck,el('span',{},(L==='es'
        ?'Estudio con una pareja (10% para cada uno mientras los dos sigan activos)'
        :'Estudo com uma dupla (10% para cada um enquanto os dois estiverem ativos)')));
      pc.append(lb);}
    var inp=el('input',{type:'text',class:'pp-in',placeholder:tx('code',L),'aria-label':tx('code',L),value:code});
    inp.addEventListener('change',function(){code=inp.value;});
    pc.append(inp);
    body.append(hc);

    /* resumo */
    var r=pct(),val=full*(1-r.off/100),cut=full-val,P2=r.p;
    var sm=el('div',{class:'pp-card pp-sum'});
    sm.append(el('div',{class:'pp-h',style:'margin-top:0'},tx('sum',L)));
    sm.append(el('div',{class:'r'},[el('span',{},p.nome),el('span',{},money(cur,full))]));
    if(cut>0.004)sm.append(el('div',{class:'r d'},[
      el('span',{},r.via==='dupla'?(L==='es'?'Pareja de estudio (10%)':'Dupla (10%)'):P2.label+' ('+P2.off+'%)'),
      el('span',{},'−'+money(cur,cut))]));
    sm.append(el('div',{class:'r t'},[el('span',{},tx('total',L)),el('span',{},money(cur,val))]));
    if(P2.months>1)sm.append(el('div',{class:'r'},[
      el('span',{},tx('once',L)+' ('+P2.months+(L==='es'?' meses':' meses')+')'),
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
    var go=el('button',{type:'button'});
    if(same||busy)go.setAttribute('disabled','disabled');
    go.addEventListener('click',function(){send(p,r,val,msg,go);});
    go.className='pp-go';
    go.textContent=(same?tx('same',L):tx(o.current?'goc':'go',L)+' '+p.nome.split(' ')[0]+' · '+money(cur,val)+tx('month',L));
    body.append(go);
    if(!o.current)body.append(el('p',{class:'pp-free'},tx('free',L)));
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
