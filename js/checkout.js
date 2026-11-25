/* Britland: checkout dentro do app (opcao B, passo a passo: Plano, Pagamento, Pronto).
   Aberto pelo js/planpick.js quando o aluno sem plano toca em "Assinar", e pela aba Pagamentos do My profile
   para pagar uma mensalidade ja lancada (o.charge; Wise e "Enviar comprovante" chamam o.onProof).
   Pix e cartao em reais pelo Asaas, cartao em euro pelo Stripe (campo seguro embutido), Wise e outra forma viram pedido ao professor.
   Preco e calculado de novo no servidor (funcao checkout); aqui so mostramos.
   No app em ingles, toda esta parte fica em portugues (regra de precos e pagamentos); no espanhol, em espanhol. */
(function(){
'use strict';

var TX={
  s1:{en:'Plano',es:'Plan'},s2:{en:'Pagamento',es:'Pago'},s3:{en:'Pronto',es:'Listo'},
  how:{en:'Como você quer pagar?',es:'¿Cómo quieres pagar?'},
  pix:{en:'Pix',es:'Pix'},pixS:{en:'Na hora, com QR Code ou copia e cola',es:'Al instante, con código QR o copia y pega'},
  card:{en:'Cartão',es:'Tarjeta'},cardS:{en:'Mensal ou fidelidade de 6 meses',es:'Mensual o permanencia de 6 meses'},
  cardE:{en:'Crédito ou débito, pagamento seguro',es:'Crédito o débito, pago seguro'},
  wise:{en:'Wise',es:'Wise'},wiseS:{en:'Transferência; o professor envia o link',es:'Transferencia; tu profesor te envía el enlace'},
  other:{en:'Outra forma',es:'Otra forma'},otherS:{en:'Revolut ou outro meio, com comprovante',es:'Revolut u otro medio, con comprobante'},
  onlyAv:{en:'Só para mensal ou pagamento à vista',es:'Solo mensual o por adelantado'},
  onlyCard:{en:'Só para mensal ou fidelidade de 6 meses',es:'Solo mensual o permanencia de 6 meses'},
  soon:{en:'Em breve',es:'Próximamente'},
  cont:{en:'Continuar com ',es:'Continuar con '},
  back:{en:'Voltar e trocar o plano',es:'Volver y cambiar el plan'},
  back2:{en:'Voltar',es:'Volver'},
  total:{en:'Total',es:'Total'},perMonth:{en:'Por mês',es:'Por mes'},month:{en:'/mês',es:'/mes'},
  months:{en:' meses',es:' meses'},
  pixT:{en:'Pagar com Pix',es:'Pagar con Pix'},
  cpf:{en:'CPF',es:'CPF'},cpfH:{en:'O banco pede o CPF de quem paga.',es:'El banco pide el CPF de quien paga.'},
  gen:{en:'Gerar o Pix',es:'Generar el Pix'},
  valid:{en:'Válido por ',es:'Válido por '},expired:{en:'Este Pix venceu. Gere outro.',es:'Este Pix venció. Genera otro.'},
  copy:{en:'Copiar',es:'Copiar'},copied:{en:'Copiado',es:'Copiado'},
  paid:{en:'Já paguei',es:'Ya pagué'},
  wait:{en:'Aguardando a confirmação do banco. Pode levar alguns segundos.',es:'Esperando la confirmación del banco. Puede tardar unos segundos.'},
  auto:{en:'A confirmação chega sozinha, não precisa enviar comprovante.',es:'La confirmación llega sola, no hace falta enviar comprobante.'},
  cardT:{en:'Cartão de crédito',es:'Tarjeta de crédito'},
  cdata:{en:'Dados do cartão',es:'Datos de la tarjeta'},hdata:{en:'Dados do titular',es:'Datos del titular'},
  num:{en:'Número do cartão',es:'Número de la tarjeta'},exp:{en:'MM/AA',es:'MM/AA'},cvc:{en:'CVC',es:'CVC'},
  name:{en:'Nome como está no cartão',es:'Nombre como figura en la tarjeta'},
  phone:{en:'Telefone',es:'Teléfono'},cep:{en:'CEP',es:'CEP'},hnum:{en:'Número da casa',es:'Número de la casa'},
  acc:{en:'Li e aceito o contrato',es:'Leí y acepto el contrato'},
  acc6:{en:'Li e aceito o contrato e a fidelidade de 6 meses',es:'Leí y acepto el contrato y la permanencia de 6 meses'},
  accEU:{en:' e peço para começar as aulas antes do fim do prazo de 14 dias para desistir',es:' y pido empezar las clases antes de que terminen los 14 días para desistir'},
  needAcc:{en:'Marque que aceita o contrato para continuar.',es:'Marca que aceptas el contrato para continuar.'},
  pay:{en:'Pagar ',es:'Pagar '},
  secA:{en:'Processado pelo Asaas, a escola não guarda o número do cartão',es:'Procesado por Asaas, la escuela no guarda el número de la tarjeta'},
  secS:{en:'Processado pelo Stripe, a escola não vê o número do cartão',es:'Procesado por Stripe, la escuela no ve el número de la tarjeta'},
  fill:{en:'Preencha todos os campos.',es:'Rellena todos los campos.'},
  badCpf:{en:'CPF inválido. Confira os números.',es:'CPF inválido. Revisa los números.'},
  err:{en:'Não foi possível concluir. Tente de novo.',es:'No se pudo completar. Inténtalo de nuevo.'},
  off:{en:'Esta forma de pagamento ainda não está ligada. Escolha outra.',es:'Esta forma de pago aún no está activa. Elige otra.'},
  loading:{en:'Preparando o pagamento...',es:'Preparando el pago...'},
  wiseT:{en:'Pagar pela Wise',es:'Pagar con Wise'},otherT:{en:'Pagar de outra forma',es:'Pagar de otra forma'},
  wiseB:{en:'Ao enviar o pedido, o professor manda o link de pagamento da Wise com o valor certo. Depois de pagar, toque em "I\'ve paid" na aba Pagamentos e anexe o comprovante, se quiser.',
         es:'Al enviar el pedido, tu profesor te manda el enlace de pago de Wise con el importe correcto. Después de pagar, toca "Ya pagué" en la pestaña Pagos y adjunta el comprobante si quieres.'},
  otherB:{en:'Ao enviar o pedido, o professor combina com você a forma de pagamento (Revolut ou outra). Depois de pagar, anexe o comprovante na aba Pagamentos.',
          es:'Al enviar el pedido, tu profesor acuerda contigo la forma de pago (Revolut u otra). Después de pagar, adjunta el comprobante en la pestaña Pagos.'},
  send:{en:'Enviar pedido',es:'Enviar pedido'},
  okT:{en:'Pagamento confirmado',es:'Pago confirmado'},
  okB:{en:'Bem-vindo ao {p}. O professor vai combinar com você os horários das aulas regulares.',
       es:'Bienvenido a {p}. Tu profesor acordará contigo los horarios de las clases regulares.'},
  sentT:{en:'Pedido enviado',es:'Pedido enviado'},
  sentB:{en:'O professor recebeu seu pedido e vai enviar o pagamento. Você verá tudo aqui na aba Pagamentos.',
         es:'Tu profesor recibió tu pedido y te enviará el pago. Lo verás todo aquí en la pestaña Pagos.'},
  active:{en:'Ativo',es:'Activo'},pending:{en:'Aguardando',es:'Pendiente'},
  paidL:{en:'Pago',es:'Pagado'},until:{en:'Válido até',es:'Válido hasta'},next:{en:'Próxima cobrança',es:'Próximo cobro'},
  rcpt:{en:'Baixar recibo',es:'Descargar recibo'},done:{en:'Concluir',es:'Terminar'},
  /* mensalidade ja lancada (aba Pagamentos do My profile) */
  s1c:{en:'Mensalidade',es:'Mensualidad'},due:{en:'vence em ',es:'vence el '},
  cardC:{en:'Crédito, pagamento único',es:'Crédito, pago único'},
  wiseC:{en:'Pague pela Wise e envie o comprovante',es:'Paga con Wise y envía el comprobante'},
  proof:{en:'Enviar comprovante',es:'Enviar comprobante'},proofS:{en:'Pagou por fora? Anexe aqui',es:'¿Pagaste por fuera? Adjúntalo aquí'},
  okC:{en:'Mensalidade paga. Obrigado!',es:'Mensualidad pagada. ¡Gracias!'},
  okCB:{en:'A parcela já aparece como paga na aba Pagamentos.',es:'La cuota ya aparece como pagada en la pestaña Pagos.'}
};
function tx(k,L){return (TX[k]||{})[L]||(TX[k]||{}).en||k;}
function el(t,a,c){var n=document.createElement(t);if(a)Object.keys(a).forEach(function(k){if(a[k]!=null)n.setAttribute(k,a[k]);});
  (Array.isArray(c)?c:[c]).forEach(function(x){if(x==null||x===false)return;n.append(x.nodeType?x:document.createTextNode(String(x)));});return n;}
function money(cur,v){var s=Number(v||0).toFixed(2),i=s.split('.')[0],d=s.split('.')[1];i=i.replace(/\B(?=(\d{3})+(?!\d))/g,'.');return (cur==='BRL'?'R$ ':'€ ')+i+','+d;}
function fam(slug){return String(slug||'').replace(/-(brl|eur)$/,'');}
function dig(s){return String(s||'').replace(/\D/g,'');}
function cpfOk(c){if(c.length!==11||/^(\d)\1+$/.test(c))return false;
  function dv(n){var s=0;for(var i=0;i<n;i++)s+=(+c[i])*(n+1-i);var r=(s*10)%11;return r===10?0:r;}
  return dv(9)===+c[9]&&dv(10)===+c[10];}
function ddmmyyyy(d){return ('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+'/'+d.getFullYear();}

/* icones de linha, no padrao do app */
var IC={
  pix:'<path d="M12 3l9 9-9 9-9-9z"/><path d="M8 12l4-4 4 4-4 4z"/>',
  card:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>',
  wise:'<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
  other:'<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>',
  back:'<path d="M15 5l-7 7 7 7"/>',
  lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  clock:'<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  send:'<path d="M4 12l16-8-6 16-3-7z"/>'
};
function ico(k,cls){var s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 24 24');
  s.setAttribute('aria-hidden','true');s.setAttribute('class','co-i'+(cls?' '+cls:''));s.innerHTML=IC[k];return s;}

function css(){
  if(document.getElementById('co-css'))return;
  var s=document.createElement('style');s.id='co-css';s.textContent=[
  '.co-i{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:none}',
  '.co-steps{display:flex;align-items:center;gap:6px;margin:0 0 16px}',
  '.co-steps .s{display:flex;align-items:center;gap:6px;font-size:.82rem;color:var(--muted);white-space:nowrap}',
  '.co-steps .n{width:24px;height:24px;border-radius:50%;border:2px solid var(--line);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.78rem;box-sizing:border-box}',
  '.co-steps .n .co-i{width:14px;height:14px;stroke-width:3}',
  '.co-steps .s.on{color:var(--ink);font-weight:700}.co-steps .s.on .n{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}',
  '.co-steps .s.dn .n{border-color:var(--ok);color:var(--ok)}',
  '.co-steps .ln{flex:1;height:2px;background:var(--line);min-width:10px}',
  '.co-h{font-size:1.35rem;margin:0 0 4px}',
  '.co-sub{color:var(--muted);margin:0 0 14px;font-size:.95rem}.co-sub b{color:var(--ink)}',
  '.co-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
  '.co-tile{display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start;gap:6px;padding:14px;border-radius:18px!important;',
    'border:2px solid var(--line);background:var(--surface);color:var(--ink);font-weight:400;min-height:128px;text-align:left;width:100%}',
  '.co-tile[aria-pressed=true]{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}',
  '.co-tile[disabled]{opacity:.5}',
  '.co-tile .ic{width:40px;height:40px;border-radius:12px;background:var(--chip,var(--card));display:flex;align-items:center;justify-content:center;color:var(--accent)}',
  '.co-tile b{font-size:1rem}.co-tile small{color:var(--muted);font-size:.8rem;line-height:1.3}',
  '.co-tile .tg{border:1px solid var(--line);border-radius:999px;padding:0 8px;font-size:.72rem;color:var(--muted)}',
  '.co-top{display:flex;align-items:center;gap:10px;margin:0 0 6px}',
  '.co-bk{width:40px;height:40px;min-height:0;padding:0;border-radius:50%!important;background:var(--surface);border:1px solid var(--line);color:var(--ink);justify-content:center}',
  '.co-top h2{margin:0;font-size:1.25rem}',
  '.co-lbl{font-weight:700;margin:10px 0 6px;font-size:.95rem}',
  '.co-in{display:block;width:100%;box-sizing:border-box;min-height:46px;border-radius:12px!important;margin:0 0 8px}',
  '.co-two{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
  '.co-acc{display:flex;gap:8px;align-items:flex-start;font-size:.88rem;color:var(--muted);margin:8px 0 0}',
  '.co-acc input{min-height:0;width:20px;height:20px;margin-top:1px;flex:none}',
  '.co-sec{display:flex;align-items:center;gap:6px;justify-content:center;color:var(--muted);font-size:.8rem;margin:8px 0 0;text-align:center}',
  '.co-sec .co-i{width:16px;height:16px}',
  '.co-go{width:100%;min-height:50px;font-weight:700;margin:10px 0 0;border-radius:999px!important;justify-content:center;gap:8px}',
  '.co-go.ghost{background:transparent;color:var(--accent)}',
  '.co-go[disabled]{opacity:.55}',
  '.co-lnk{display:block;width:100%;margin:8px 0 0;background:transparent;border:0;color:var(--ink);text-decoration:underline;font-weight:700;font-size:.92rem;padding:6px;min-height:0;cursor:pointer}',
  '.co-msg{font-weight:700;min-height:1.3em;color:var(--bad);margin:6px 0 0}',
  '.co-qr{text-align:center}',
  '.co-qr img{width:200px;height:200px;background:#fff;border-radius:12px;padding:8px;margin:4px auto 8px;display:block;image-rendering:pixelated}',
  '.co-timer{display:flex;align-items:center;justify-content:center;gap:6px;color:var(--warn);font-size:.86rem;font-weight:700;margin:4px 0 8px}',
  '.co-timer .co-i{width:16px;height:16px}',
  '.co-cc{display:flex;gap:8px;align-items:center;background:var(--card);border:1px dashed var(--line);border-radius:12px;padding:8px 10px}',
  '.co-cc span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:monospace;font-size:.8rem;color:var(--muted)}',
  '.co-cc button{min-height:34px;padding:4px 14px;border-radius:999px!important;font-size:.85rem}',
  '.co-wait[hidden],.co-go[hidden]{display:none!important}',
  '.co-wait{display:flex;gap:10px;align-items:center;justify-content:center;color:var(--muted);font-size:.9rem;margin:10px 0 0}',
  '.co-spin{width:18px;height:18px;border-radius:50%;border:3px solid var(--line);border-top-color:var(--accent);animation:co-r 1s linear infinite;flex:none}',
  '@keyframes co-r{to{transform:rotate(360deg)}}',
  'html.fx-off .co-spin{animation:none}@media (prefers-reduced-motion:reduce){.co-spin{animation:none}}',
  '.co-big{text-align:center;padding:14px 6px 6px}',
  '.co-ok{width:84px;height:84px;border-radius:50%;background:var(--ok-bg);color:var(--ok);display:flex;align-items:center;justify-content:center;margin:0 auto 14px}',
  '.co-ok .co-i{width:44px;height:44px;stroke-width:2.2}',
  '.co-coin{margin:0 auto 14px;width:130px;height:130px}',
  '.co-big h2{margin:0 0 6px;font-size:1.5rem}.co-big p{color:var(--muted);margin:0 auto 16px;max-width:320px}',
  '.co-res{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:14px;margin:8px 0}',
  '.co-res .h{display:flex;justify-content:space-between;align-items:center;gap:8px}.co-res .h b{font-size:1.15rem}',
  '.co-res .g{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}',
  '.co-res small{display:block;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;font-size:.74rem}',
  '.co-res .g b{display:block;font-size:1.1rem}',
  '.co-stripe{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:12px;min-height:120px}'
  ].join('');document.head.append(s);
}

/* ---------- abre o checkout no lugar da escolha de plano ---------- */
function open(box,o){
  css();
  var L=o.L==='es'?'es':'en',sb=o.sb,C=o.charge||null;
  /* modo mensalidade: o.charge = {id,amount,currency,title,due_date,plan}; vira um "plano" de 1 mes so para mostrar */
  if(C)o=Object.assign({},o,{plan:{nome:C.plan||tx('s1c',L),moeda:C.currency==='EUR'?'EUR':'BRL',valor_centavos:Math.round(+C.amount*100),slug:null},
    per:'mensalidade',period:{months:1,label:C.title||(tx('due',L)+ddmmyyyy(new Date(C.due_date+'T12:00:00')))},val:+C.amount,off:0});
  var p=o.plan,cur=p.moeda,per=o.per,P2=o.period,months=P2.months||1;
  var full=p.valor_centavos/100,val=o.val,total=val*months,off=o.off||0;
  var cfg={asaas:false,stripe:false},pick=null,timers=[];
  function clear(){timers.forEach(function(t){clearInterval(t);clearTimeout(t);});timers=[];}
  function top(){try{box.scrollIntoView({block:'start',behavior:'smooth'});}catch(e){}}

  function steps(n){
    var w=el('div',{class:'co-steps'});
    [tx(C?'s1c':'s1',L),tx('s2',L),tx('s3',L)].forEach(function(t,i){
      if(i)w.append(el('span',{class:'ln'}));
      var k=i+1,nb=el('span',{class:'n'},k<n?ico('check'):String(k));
      w.append(el('div',{class:'s'+(k<n?' dn':k===n?' on':'')},[nb,t]));});
    return w;}

  function summary(){
    var sm=el('div',{class:'pp-card pp-sum',style:'margin-top:14px'});
    if(months>1){
      sm.append(el('div',{class:'r'},[el('span',{},months+' × '+money(cur,full)),el('span',{},money(cur,full*months))]));
      if(off)sm.append(el('div',{class:'r d'},[el('span',{},o.offLabel+' ('+off+'%)'),el('span',{},'−'+money(cur,(full-val)*months))]));
      sm.append(el('div',{class:'r t'},[el('span',{},tx('total',L)),el('span',{},money(cur,total))]));
    }else{
      sm.append(el('div',{class:'r'},[el('span',{},p.nome),el('span',{},money(cur,full))]));
      if(off)sm.append(el('div',{class:'r d'},[el('span',{},o.offLabel+' ('+off+'%)'),el('span',{},'−'+money(cur,full-val))]));
      sm.append(el('div',{class:'r t'},[el('span',{},tx('perMonth',L)),el('span',{},money(cur,val))]));
    }
    return sm;}
  function priceLine(){if(C)return money(cur,val);return months>1?money(cur,total):money(cur,val)+tx('month',L);}

  /* formas de pagamento conforme moeda, periodo e o que esta ligado no servidor */
  function methods(){
    var M=[];
    if(C){
      if(cur==='BRL'){
        M.push({k:'pix',t:tx('pix',L),s:tx('pixS',L),on:cfg.asaas,soon:!cfg.asaas});
        M.push({k:'card',t:tx('card',L),s:tx('cardC',L),on:cfg.asaas,soon:!cfg.asaas});
      }else M.push({k:'card',t:tx('card',L),s:tx('cardE',L),on:cfg.stripe,soon:!cfg.stripe});
      M.push({k:'wise',t:tx('wise',L),s:tx('wiseC',L),on:true});
      M.push({k:'proof',t:tx('proof',L),s:tx('proofS',L),on:true});
      return M;}
    if(cur==='BRL'){
      var pixOk=per!=='cartao6',cardOk=per==='mensal'||per==='cartao6';
      M.push({k:'pix',t:tx('pix',L),s:pixOk?tx('pixS',L):tx('onlyAv',L),on:pixOk&&cfg.asaas,soon:pixOk&&!cfg.asaas});
      M.push({k:'card',t:tx('card',L),s:cardOk?tx('cardS',L):tx('onlyCard',L),on:cardOk&&cfg.asaas,soon:cardOk&&!cfg.asaas});
    }else{
      M.push({k:'card',t:tx('card',L),s:tx('cardE',L),on:cfg.stripe,soon:!cfg.stripe});
    }
    M.push({k:'wise',t:tx('wise',L),s:tx('wiseS',L),on:true});
    M.push({k:'other',t:tx('other',L),s:tx('otherS',L),on:true});
    return M;}

  /* ---- etapa 2: escolher a forma ---- */
  function choose(){
    clear();box.textContent='';
    box.append(steps(2),el('h2',{class:'co-h'},tx('how',L)));
    var sub=el('p',{class:'co-sub'},[p.nome+' · '+P2.label+' · ',el('b',{},priceLine())]);box.append(sub);
    var M=methods();
    if(!pick||!M.some(function(m){return m.k===pick&&m.on;}))pick=(M.filter(function(m){return m.on;})[0]||{}).k;
    var g=el('div',{class:'co-grid'});
    M.forEach(function(m){
      var b=el('button',{type:'button',class:'co-tile','aria-pressed':m.k===pick?'true':'false'});
      if(!m.on)b.setAttribute('disabled','disabled');
      b.append(el('span',{class:'ic'},ico(m.k==='proof'?'send':m.k==='card'?'card':m.k)),el('b',{},m.t),el('small',{},m.s));
      if(m.soon)b.append(el('span',{class:'tg'},tx('soon',L)));
      b.addEventListener('click',function(){pick=m.k;choose();});
      g.append(b);});
    box.append(g,summary());
    var cm=M.filter(function(m){return m.k===pick;})[0];
    var go=el('button',{type:'button',class:'co-go'},tx('cont',L)+(cm?cm.t:''));
    go.addEventListener('click',function(){
      go_(pick);});
    var bk=el('button',{type:'button',class:'co-lnk'},tx(C?'back2':'back',L));
    bk.addEventListener('click',function(){clear();if(o.onBack)o.onBack();});
    box.append(go,bk);
  }

  function go_(k){
    if(k==='pix')pix();else if(k==='card')(cur==='BRL'?cardBR():cardEU());
    else if(C){clear();if(o.onProof)o.onProof(k==='wise'?'Wise':'Pix');}
    else manual(k);}
  function head(title){
    clear();box.textContent='';
    var bk=el('button',{type:'button',class:'co-bk','aria-label':tx('back2',L)},ico('back'));
    bk.addEventListener('click',choose);
    box.append(steps(2),el('div',{class:'co-top'},[bk,el('h2',{},title)]));
    var sub=el('p',{class:'co-sub'},[p.nome+' · '+P2.label+' · ',el('b',{},priceLine())]);
    if(off)sub.append(el('span',{class:'pp-off'},'−'+off+'%'));
    box.append(sub);top();}

  function start(body){
    body.action='start';
    if(C)body.charge_id=C.id;else{body.slug=p.slug;body.periodo=per;body.dupla=!!o.dupla;body.codigo=o.code||null;}
    return sb.functions.invoke('checkout',{body:body}).then(function(r){
      if(r&&r.error){
        var ctx=r.error.context,pr=ctx&&ctx.json?ctx.json().catch(function(){return {};}):Promise.resolve({});
        return pr.then(function(j){throw {code:(j&&j.error)||'err',message:j&&j.message};});}
      return r.data;});}
  function errText(e){
    if(e&&e.code==='cpf')return tx('badCpf',L);
    if(e&&(e.code==='asaas-off'||e.code==='stripe-off'))return tx('off',L);
    if(e&&e.code==='gateway'&&e.message)return e.message;
    return tx('err',L);}

  /* acompanha o checkout ate o webhook marcar como pago */
  function watch(id,onPaid){
    var n=0;var t=setInterval(function(){
      if(++n>240){clearInterval(t);return;}
      sb.from('checkouts').select('status').eq('id',id).maybeSingle().then(function(r){
        var st=r&&r.data&&r.data.status;
        if(st==='paid'){clearInterval(t);onPaid();}
      },function(){});},4000);
    timers.push(t);}

  /* ---- Pix ---- */
  function pix(){
    head(tx('pixT',L));
    var area=el('div',{});box.append(area);
    var msg=el('p',{class:'co-msg','aria-live':'polite'});
    area.append(el('div',{class:'co-lbl'},tx('cpf',L)));
    var cpf=el('input',{type:'text',class:'co-in',inputmode:'numeric',autocomplete:'off',placeholder:'000.000.000-00','aria-label':tx('cpf',L)});
    cpf.addEventListener('input',function(){var d=dig(cpf.value).slice(0,11);
      cpf.value=d.replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})\.(\d{3})(\d)/,'$1.$2.$3').replace(/(\d{3})-?(\d{1,2})$/,function(m,a,b){return d.length>9?a+'-'+b:m;});});
    area.append(cpf,el('p',{class:'pp-note',style:'margin:0'},tx('cpfH',L)),msg);
    var go=el('button',{type:'button',class:'co-go'},[ico('pix'),tx('gen',L)]);
    area.append(go);
    go.addEventListener('click',function(){
      var c=dig(cpf.value);if(!cpfOk(c)){msg.textContent=tx('badCpf',L);return;}
      msg.textContent='';go.setAttribute('disabled','disabled');go.textContent=tx('loading',L);
      start({metodo:'pix',cpf:c}).then(function(d){showQr(area,d);},function(e){
        msg.textContent=errText(e);go.removeAttribute('disabled');go.textContent='';go.append(ico('pix'),tx('gen',L));});
    });
  }
  function showQr(area,d){
    area.textContent='';
    var q=el('div',{class:'pp-card co-qr'});
    q.append(el('img',{src:'data:image/png;base64,'+d.image,alt:'QR Code Pix'}));
    var tm=el('div',{class:'co-timer'},[ico('clock'),el('span',{},'')]);q.append(tm);
    var cc=el('div',{class:'co-cc'}),cp=el('button',{type:'button'},tx('copy',L));
    cc.append(el('span',{},d.payload),cp);q.append(cc);
    cp.addEventListener('click',function(){
      var ok=function(){cp.textContent=tx('copied',L);setTimeout(function(){cp.textContent=tx('copy',L);},1800);};
      try{navigator.clipboard.writeText(d.payload).then(ok,ok);}catch(e){ok();}});
    area.append(q);
    /* contagem: o Asaas da a validade; sem ela, 30 minutos */
    var end=d.expires?Date.parse(String(d.expires).replace(' ','T')+'-03:00'):Date.now()+30*60e3;
    if(!(end>Date.now()))end=Date.now()+30*60e3;
    var lim=Math.min(end,Date.now()+24*3600e3);
    function tick(){var s=Math.max(0,Math.round((lim-Date.now())/1000));
      if(!s){tm.lastChild.textContent=tx('expired',L);return;}
      var h=Math.floor(s/3600),m=Math.floor(s%3600/60),ss=s%60;
      tm.lastChild.textContent=tx('valid',L)+(h?h+':'+('0'+m).slice(-2):m)+':'+('0'+ss).slice(-2);}
    tick();timers.push(setInterval(tick,1000));
    var w=el('div',{class:'co-wait',hidden:'hidden'},[el('span',{class:'co-spin'}),el('span',{},tx('wait',L))]);
    var b=el('button',{type:'button',class:'co-go'},tx('paid',L));
    b.addEventListener('click',function(){w.removeAttribute('hidden');b.setAttribute('hidden','hidden');});
    area.append(b,w,el('p',{class:'pp-note',style:'text-align:center'},tx('auto',L)));
    watch(d.id,function(){done(true,d.id);});
  }

  /* ---- cartao em reais (Asaas) ---- */
  function field(ph,attrs){var a={type:'text',class:'co-in',placeholder:ph,'aria-label':ph};Object.keys(attrs||{}).forEach(function(k){a[k]=attrs[k];});return el('input',a);}
  function accept(eu){
    if(C)return {node:document.createTextNode(''),ok:function(){return true;}}; /* mensalidade: o contrato ja foi aceito */
    var lb=el('label',{class:'co-acc'}),ck=el('input',{type:'checkbox'});
    lb.append(ck,el('span',{},tx(per==='cartao6'?'acc6':'acc',L)+(eu?tx('accEU',L):'')));
    return {node:lb,ok:function(){return ck.checked;}};}
  function cardBR(){
    head(tx('cardT',L));
    var num=field(tx('num',L),{inputmode:'numeric',autocomplete:'cc-number'}),
        exp=field(tx('exp',L),{inputmode:'numeric',autocomplete:'cc-exp'}),
        cvc=field(tx('cvc',L),{inputmode:'numeric',autocomplete:'cc-csc'}),
        nm=field(tx('name',L),{autocomplete:'cc-name'}),
        cpf=field(tx('cpf',L),{inputmode:'numeric'}),ph=field(tx('phone',L),{inputmode:'tel',autocomplete:'tel'}),
        cep=field(tx('cep',L),{inputmode:'numeric',autocomplete:'postal-code'}),hn=field(tx('hnum',L));
    num.addEventListener('input',function(){num.value=dig(num.value).slice(0,19).replace(/(\d{4})(?=\d)/g,'$1 ');});
    exp.addEventListener('input',function(){var d=dig(exp.value).slice(0,4);exp.value=d.length>2?d.slice(0,2)+'/'+d.slice(2):d;});
    cvc.addEventListener('input',function(){cvc.value=dig(cvc.value).slice(0,4);});
    cpf.addEventListener('input',function(){cpf.value=dig(cpf.value).slice(0,11);});
    cep.addEventListener('input',function(){var d=dig(cep.value).slice(0,8);cep.value=d.length>5?d.slice(0,5)+'-'+d.slice(5):d;});
    if(o.profile&&o.profile.name)nm.value=String(o.profile.name).toUpperCase();
    box.append(el('div',{class:'co-lbl'},tx('cdata',L)),num,el('div',{class:'co-two'},[exp,cvc]),nm,
      el('div',{class:'co-lbl'},tx('hdata',L)),el('div',{class:'co-two'},[cpf,ph]),el('div',{class:'co-two'},[cep,hn]));
    var ac=accept(false);box.append(ac.node);
    var msg=el('p',{class:'co-msg','aria-live':'polite'});
    var go=el('button',{type:'button',class:'co-go'},[ico('lock'),tx('pay',L)+money(cur,val)]);
    box.append(msg,go,el('div',{class:'co-sec'},[ico('lock'),tx('secA',L)]));
    go.addEventListener('click',function(){
      if([num,exp,cvc,nm,cpf,ph,cep,hn].some(function(i){return !String(i.value).trim();})){msg.textContent=tx('fill',L);return;}
      if(!cpfOk(dig(cpf.value))){msg.textContent=tx('badCpf',L);return;}
      if(!ac.ok()){msg.textContent=tx('needAcc',L);return;}
      msg.textContent='';go.setAttribute('disabled','disabled');
      start({metodo:'card',cpf:dig(cpf.value),
        card:{number:dig(num.value),exp:exp.value,cvc:dig(cvc.value),name:nm.value.trim()},
        holder:{name:nm.value.trim(),cpf:dig(cpf.value),phone:dig(ph.value),cep:dig(cep.value),number:hn.value.trim()}
      }).then(function(d){
        num.value='';cvc.value=''; /* nao deixa o numero na tela */
        if(d.status==='paid')done(true,d.id);
        else{box.append(el('div',{class:'co-wait'},[el('span',{class:'co-spin'}),el('span',{},tx('wait',L))]));watch(d.id,function(){done(true,d.id);});}
      },function(e){msg.textContent=errText(e);go.removeAttribute('disabled');});
    });
  }

  /* ---- cartao em euro (Stripe Payment Element) ---- */
  function loadStripe(){
    if(window.Stripe)return Promise.resolve();
    return new Promise(function(ok,ko){var s=document.createElement('script');s.src='https://js.stripe.com/v3/';s.onload=ok;s.onerror=ko;document.head.append(s);});}
  function cardEU(){
    head(tx('cardT',L));
    var mount=el('div',{class:'co-stripe'},el('div',{class:'co-wait'},[el('span',{class:'co-spin'}),el('span',{},tx('loading',L))]));
    box.append(mount);
    var ac=accept(true);box.append(ac.node);
    var msg=el('p',{class:'co-msg','aria-live':'polite'});
    var go=el('button',{type:'button',class:'co-go',disabled:'disabled'},[ico('lock'),tx('pay',L)+(months>1?money(cur,total):money(cur,val))]);
    box.append(msg,go,el('div',{class:'co-sec'},[ico('lock'),tx('secS',L)]));
    var stripe,elements,ckId;
    Promise.all([loadStripe(),start({metodo:'card'})]).then(function(a){
      var d=a[1];ckId=d.id;stripe=window.Stripe(d.pk);
      var cs=getComputedStyle(document.documentElement),v=function(n,f){return (cs.getPropertyValue(n)||'').trim()||f;};
      elements=stripe.elements({clientSecret:d.clientSecret,locale:L==='es'?'es':'pt-BR',appearance:{
        theme:document.documentElement.getAttribute('data-theme')==='light'?'stripe':'night',
        variables:{colorPrimary:v('--accent','#f5c542'),colorBackground:v('--surface','#1d212a'),colorText:v('--ink','#f3f4f6'),
          colorDanger:v('--bad','#ff9e94'),borderRadius:'12px',fontFamily:'inherit'}}});
      mount.textContent='';elements.create('payment',{layout:'tabs'}).mount(mount);
      go.removeAttribute('disabled');
    },function(e){mount.textContent='';msg.textContent=errText(e);});
    go.addEventListener('click',function(){
      if(!elements)return;
      if(!ac.ok()){msg.textContent=tx('needAcc',L);return;}
      msg.textContent='';go.setAttribute('disabled','disabled');
      stripe.confirmPayment({elements:elements,redirect:'if_required',confirmParams:{return_url:location.href.split('#')[0]}}).then(function(r){
        if(r.error){msg.textContent=r.error.message||tx('err',L);go.removeAttribute('disabled');return;}
        var st=r.paymentIntent&&r.paymentIntent.status;
        if(st==='succeeded')done(true,ckId);
        else{box.append(el('div',{class:'co-wait'},[el('span',{class:'co-spin'}),el('span',{},tx('wait',L))]));watch(ckId,function(){done(true,ckId);});}
      },function(){msg.textContent=tx('err',L);go.removeAttribute('disabled');});
    });
  }

  /* ---- Wise ou outra forma: vira pedido ao professor ---- */
  function manual(k){
    head(tx(k==='wise'?'wiseT':'otherT',L));
    box.append(el('div',{class:'pp-rule',style:'margin:0 0 6px'},tx(k==='wise'?'wiseB':'otherB',L)),summary());
    var msg=el('p',{class:'co-msg','aria-live':'polite'});
    var go=el('button',{type:'button',class:'co-go'},[ico('send'),tx('send',L)]);
    box.append(msg,go);
    go.addEventListener('click',function(){
      go.setAttribute('disabled','disabled');msg.textContent='';
      sb.from('plan_requests').insert({slug:p.slug,plano:p.nome,periodo:per,moeda:cur,valor_centavos:Math.round(val*100),
        desconto:o.desc||null,codigo:o.code?String(o.code).slice(0,40):null,tipo:'novo',obs:k==='wise'?'Quer pagar pela Wise':'Quer pagar de outra forma'
      }).then(function(q){
        if(q&&q.error){go.removeAttribute('disabled');msg.textContent=tx('err',L);return;}
        done(false);
      },function(){go.removeAttribute('disabled');msg.textContent=tx('err',L);});
    });
  }

  /* ---- etapa 3: pronto ---- */
  function done(paid,ckId){
    clear();box.textContent='';box.append(steps(3));
    var big=el('div',{class:'co-big'});
    var low=window.BLLow&&window.BLLow();
    var MO=(L==='es'?['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']:['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'])[new Date().getMonth()];
    if(paid&&!low){
      /* moeda 3D dourada (js/coin.js); em celular fraco ou sem a moeda, o selo plano */
      var c=el('div',{class:'co-coin'});big.append(c);
      var mk=function(){try{BLCoin.make(c,{size:130,tone:'gold',front:{text:MO}});BLCoin.sound('stamp');}catch(e){c.replaceWith(el('div',{class:'co-ok'},ico('check')));}};
      if(window.BLCoin)mk();else{var B=o.base||'',v=window.BL_VERSION||'1';
        var lk=document.createElement('link');lk.rel='stylesheet';lk.href=B+'js/coin.css?v='+v;document.head.append(lk);
        var sc=document.createElement('script');sc.src=B+'js/coin.js?v='+v;sc.onload=mk;sc.onerror=function(){c.replaceWith(el('div',{class:'co-ok'},ico('check')));};document.head.append(sc);}
    }else big.append(el('div',{class:'co-ok'},ico(paid?'check':'send')));
    if(C)big.append(el('h2',{},tx('okC',L)),el('p',{},tx('okCB',L)));
    else big.append(el('h2',{},tx(paid?'okT':'sentT',L)),el('p',{},paid?tx('okB',L).replace('{p}',p.nome):tx('sentB',L)));
    box.append(big);
    var today=new Date(),till=new Date();till.setMonth(till.getMonth()+months);
    var res=el('div',{class:'co-res'});
    res.append(el('div',{class:'h'},[el('b',{},p.nome),el('span',{class:'pill '+(paid?'ok':'wt')},tx(C?'paidL':paid?'active':'pending',L))]));
    if(C)res.append(el('div',{class:'g'},[
      el('div',{},[el('small',{},tx('paidL',L)),el('b',{},money(cur,val))]),
      el('div',{},[el('small',{},tx(C?'s1c':'next',L)),el('b',{},P2.label)])]));
    else res.append(el('div',{class:'g'},[
      el('div',{},[el('small',{},paid?tx('paidL',L):tx('total',L)),el('b',{},money(cur,months>1?total:val))]),
      el('div',{},[el('small',{},months>1?tx('until',L):tx('next',L)),el('b',{},ddmmyyyy(till))])]));
    box.append(res);
    if(paid&&window.Receipt){
      var rb=el('button',{type:'button',class:'co-go'},tx('rcpt',L));
      rb.addEventListener('click',function(){if(rb.disabled)return;rb.disabled=true;
        var iso=today.toISOString().slice(0,10);
        Promise.resolve(Receipt.download({charge:C?{id:C.id,amount:val,currency:cur,paid_on:iso,due_date:C.due_date,title:C.title||null}:{id:'C'+(ckId||''),amount:months>1?total:val,currency:cur,paid_on:iso,due_date:iso,
          title:p.nome+(months>1?' · '+months+tx('months',L):'')},plan:p.nome,name:(o.profile&&o.profile.name)||'',base:o.base||''}))
          .then(function(){rb.disabled=false;},function(){rb.disabled=false;});});
      box.append(rb);}
    var fin=el('button',{type:'button',class:'co-go ghost'},tx('done',L));
    fin.addEventListener('click',function(){if(o.onDone)o.onDone();});
    box.append(fin);top();
  }

  /* pergunta ao servidor o que esta ligado; se falhar, so Wise e outra forma */
  box.textContent='';box.append(steps(2),el('p',{class:'hint'},tx('loading',L)));
  var cfgP=sb.functions&&sb.functions.invoke?sb.functions.invoke('checkout',{body:{action:'config'}}):Promise.reject();
  Promise.resolve(cfgP).then(function(r){if(r&&r.data)cfg=r.data;},function(){}).then(function(){
    /* o.method: aberto direto numa forma (toque no quadrado do cartao da mensalidade) */
    var M=methods(),m0=o.method&&M.filter(function(m){return m.k===o.method&&m.on;})[0];
    if(m0){pick=m0.k;go_(m0.k);}else choose();top();});
}

window.Checkout={open:open,TX:TX};
})();
