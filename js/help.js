/* Britland Academy: Help (tabs Dúvidas / Novidades / Contato) and the "O que há de novo" notice shown once after an update.
   Loaded on demand by gate.js. Texts: Portuguese in the English course (always), Spanish in the Spanish course. */
(function(){
'use strict';
var W=window,D=document;
function el(t,a){var e=D.createElement(t);a=a||{};for(var k in a){var v=a[k];if(k==='class')e.className=v;else if(k==='text')e.textContent=v;else if(k.slice(0,2)==='on')e.addEventListener(k.slice(2),v);else if(v!==false&&v!=null)e.setAttribute(k,v);}
  for(var i=2;i<arguments.length;i++){var c=arguments[i];(Array.isArray(c)?c:[c]).forEach(function(x){if(x==null)return;e.append(x.nodeType?x:D.createTextNode(x));});}return e;}
var ES=false;function T(pt,es){return ES?es:pt;}
function cmp(a,b){a=String(a).split('.');b=String(b).split('.');for(var i=0;i<3;i++){var x=+a[i]||0,y=+b[i]||0;if(x!==y)return x<y?-1:1;}return 0;}

var CSS='.g-hdlg.hp{max-height:90vh;overflow:auto;-webkit-overflow-scrolling:touch}'+
'.hp h2{margin:0 0 10px}.hp-tabs{display:flex;gap:6px;margin:0 0 12px}'+
'.hp-tab{flex:1;min-height:42px;padding:8px 6px;font:inherit;font-weight:700;border-radius:10px;border:2px solid var(--line,#999);background:transparent;color:var(--ink,inherit);cursor:pointer}'+
'.hp-tab[aria-selected=true]{background:var(--accent,#F5C542);border-color:var(--accent,#F5C542);color:var(--accent-ink,#0B1B33)}'+
'.hp-sc{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 14px}'+
'.hp-sc button{display:flex;align-items:center;gap:8px;min-height:48px;padding:8px 10px;text-align:left;font:inherit;font-weight:700;font-size:.92rem;border-radius:12px;border:2px solid var(--line,#999);background:var(--surface,transparent);color:var(--ink,inherit);cursor:pointer}'+
'.hp-sc button span:first-child{font-size:1.2rem}'+
'.hp-q{border-top:1px solid var(--line,#999)}.hp-q summary{cursor:pointer;padding:12px 0;font-weight:700;list-style:none;display:flex;justify-content:space-between;gap:10px}'+
'.hp-q summary::-webkit-details-marker{display:none}.hp-q summary::after{content:"\\25BE";color:var(--accent,#F5C542)}.hp-q[open] summary::after{content:"\\25B4"}'+
'.hp-q p{margin:0 0 12px;line-height:1.45}'+
'.hp-rel{list-style:none;margin:0;padding:0}.hp-rel li{padding:11px 0;border-top:1px solid var(--line,#999)}.hp-rel b{color:var(--accent,#F5C542)}.hp-rel small{display:block;color:var(--muted,#999)}'+
'.hp-nw{display:inline-block;margin-left:8px;padding:2px 8px;border-radius:9px;background:var(--accent,#F5C542);color:var(--accent-ink,#0B1B33);font:800 .66rem system-ui,sans-serif;letter-spacing:.08em;vertical-align:middle}'+
'.hp-ta{width:100%;min-height:84px;box-sizing:border-box;padding:10px;font:inherit;font-size:16px;color:var(--ink,#111);background:var(--surface,#fff);border:2px solid var(--line,#999);border-radius:8px;resize:vertical}'+
'.hp-ms{margin:6px 0 0;font-size:.88rem;min-height:1.2em}.hp-box{margin:0 0 14px}.hp-box h3{margin:0 0 6px;font-size:1rem}'+
'.hp-wn li{margin:0 0 8px;line-height:1.4}';

function loadRel(cb){
  if(W.BL_RELEASES)return cb();
  var s=D.createElement('script');s.src=(W.BL_BASE||'')+'js/releases.js';s.charset='utf-8';s.onload=cb;s.onerror=function(){W.BL_RELEASES=[];cb();};D.head.appendChild(s);
}
function rels(){return (W.BL_RELEASES||[]).filter(function(r){return !r.c||r.c===(ES?'es':'en');});}

function doUpdate(msgEl){
  msgEl.textContent=T('Procurando uma versão nova…','Buscando una versión nueva…');
  var done=function(){msgEl.textContent=T('Atualizando…','Actualizando…');setTimeout(function(){location.reload();},900);};
  try{if(navigator.serviceWorker&&navigator.serviceWorker.getRegistration){navigator.serviceWorker.getRegistration().then(function(r){if(r&&r.update)return r.update();}).then(done,done);return;}}catch(e){}
  done();
}
function waLink(ctx){
  var nm=(ctx.prof&&ctx.prof.name)||'',pg=(location.pathname.split('/').pop()||'index.html')+(location.search||'');
  var msg=ES?('¡Hola! Soy '+nm+', alumno(a) de Britland Academy. Necesito ayuda. (App '+(W.BL_VERSION||'')+', pantalla: '+pg+')')
            :('Olá! Aqui é '+nm+', aluno(a) da Britland Academy. Preciso de ajuda. (App '+(W.BL_VERSION||'')+', tela: '+pg+')');
  return 'https://wa.me/5511914881274?text='+encodeURIComponent(msg);
}

function faq(){return ES?[
 ['¿Cómo rehago una lección para ganar 3 estrellas?','En el Modo Juego, toca la estación de la lección en el mapa. Si ya la terminaste, se abre completa para que la rehagas.'],
 ['¿Qué es el Modo Juego?','Convierte las lecciones en una línea de metro: cada estación es una lección, con una pregunta a la vez, vidas, sonidos y estrellas. Actívalo o desactívalo en el menú de tu foto.'],
 ['¿Qué son los Stages?','Son las etapas del curso. Cada Stage reúne varias lecciones; en el mapa del Modo Juego cada Stage tiene una franja de color con su nombre.'],
 ['¿Cómo gano estrellas?','Depende de tu nota en la lección: 90 % o más son 3 estrellas, 60 % o más son 2 y menos de eso es 1.'],
 ['¿Cómo instalo la app en el celular?','Android (Chrome): menú ⋮ y "Instalar app" o "Añadir a pantalla de inicio". iPhone (Safari): botón Compartir y "Añadir a pantalla de inicio".'],
 ['No recibo notificaciones','Abre el menú de tu foto y activa las notificaciones. Revisa también que el celular permita notificaciones del navegador o de la app.'],
 ['Olvidé mi contraseña','En la pantalla de entrada usa la opción de recuperar contraseña. Si el correo no llega, revisa el spam.'],
 ['No veo las novedades después de actualizar','Abre la pestaña Novedades y toca "Actualizar la app".']
]:[
 ['Como refazer uma lição para ganhar 3 estrelas?','No Modo Jogo, toque na estação da lição no mapa. Se ela já foi concluída, abre inteira para você refazer.'],
 ['O que é o Modo Jogo?','Transforma as lições em uma linha de metrô: cada estação é uma lição, com uma pergunta por vez, vidas, sons e estrelas. Ative ou desative no menu da sua foto.'],
 ['O que são os Stages?','São as etapas do curso. Cada Stage reúne várias lições; no mapa do Modo Jogo, cada Stage tem uma faixa de cor com o nome.'],
 ['Como ganho estrelas?','Depende da sua nota na lição: 90% ou mais são 3 estrelas, 60% ou mais são 2 e abaixo disso é 1.'],
 ['Como instalo o app no celular?','Android (Chrome): menu ⋮ e "Instalar app" ou "Adicionar à tela inicial". iPhone (Safari): botão Compartilhar e "Adicionar à Tela de Início".'],
 ['Não recebo notificações','Abra o menu da sua foto e ative as notificações. Confira também se o celular permite notificações do navegador ou do app.'],
 ['Esqueci minha senha','Na tela de entrada, use a opção de recuperar a senha. Se o e-mail não chegar, olhe o spam.'],
 ['Não vejo as novidades depois de atualizar','Abra a aba Novidades e toque em "Atualizar o app".']
];}

function open(ctx,tab){
  ES=ctx.course==='es';
  if(!D.getElementById('hp-css')){var st=D.createElement('style');st.id='hp-css';st.textContent=CSS;D.head.appendChild(st);}
  loadRel(function(){
    var old=D.querySelector('.g-hov.hp-ov');if(old)old.remove();
    var ov=el('div',{class:'g-hov hp-ov','data-noi18n':'1'}),close=function(){D.removeEventListener('keydown',kd);ov.remove();},kd=function(e){if(e.key==='Escape')close();};
    var dlg=el('div',{class:'g-hdlg hp',role:'dialog','aria-modal':'true','aria-label':T('Ajuda','Ayuda')});
    var tabs=el('div',{class:'hp-tabs',role:'tablist'}),body=el('div',{class:'hp-body'});
    var names=[['q',T('Dúvidas','Dudas')],['n',T('Novidades','Novedades')],['c',T('Contato','Contacto')]];
    var cur=tab||'q';
    function sc(){
      var items=[['\uD83D\uDC64',T('Meu perfil e notas','Mi perfil y notas'),function(){location.href='account.html';}],
        ['\uD83D\uDDBC\uFE0F',T('Trocar foto','Cambiar foto'),function(){location.href='account.html#picture';}],
        ['\uD83C\uDF19',T('Tema, idioma e texto','Tema, idioma y texto'),function(){close();var b=D.querySelector('.g-avbtn');if(b)b.click();}],
        ['\uD83D\uDD04',T('Atualizar o app','Actualizar la app'),function(){show('n');}]];
      var g=el('div',{class:'hp-sc'});items.forEach(function(i){g.append(el('button',{type:'button',onclick:i[2]},el('span',{},i[0]),el('span',{},i[1])));});return g;
    }
    function viewQ(){
      var f=el('div',{});f.append(sc());
      faq().forEach(function(q){f.append(el('details',{class:'hp-q'},el('summary',{},q[0]),el('p',{},q[1])));});
      return f;
    }
    function viewN(){
      var f=el('div',{}),R=rels(),ul=el('ul',{class:'hp-rel'});
      if(!R.length)f.append(el('p',{},T('Ainda não há novidades registradas.','Aún no hay novedades registradas.')));
      R.forEach(function(r,i){
        var li=el('li',{},el('b',{},T('Versão ','Versión ')+r.v),i===0?el('span',{class:'hp-nw'},T('ATUAL','ACTUAL')):null,el('small',{},r.d[ES?1:0]),el('b',{style:'color:inherit'},r.t[ES?1:0]+'. '),(ES?r.p[1]:r.p[0]));
        ul.append(li);});
      f.append(ul);
      var ms=el('p',{class:'hp-ms','aria-live':'polite'});
      f.append(el('p',{class:'g-hint',style:'font-size:.85rem;margin:12px 0 8px'},T('Você está na versão ','Estás en la versión ')+(W.BL_VERSION||'')),
        el('button',{type:'button',class:'g-btn',onclick:function(){doUpdate(ms);}},T('Atualizar o app','Actualizar la app')),ms);
      return f;
    }
    function viewC(){
      var f=el('div',{});
      f.append(el('div',{class:'hp-box'},el('h3',{},T('Falar com a escola','Hablar con la escuela')),
        el('p',{style:'margin:0 0 8px'},T('A mensagem já vai com o seu nome, a versão do app e a tela em que você estava.','El mensaje ya lleva tu nombre, la versión de la app y la pantalla en la que estabas.')),
        el('a',{class:'g-btn',href:waLink(ctx),target:'_blank',rel:'noopener',style:'text-decoration:none;display:inline-flex;align-items:center'},'WhatsApp')));
      var ta=el('textarea',{class:'hp-ta',maxlength:'400','aria-label':T('Descreva o problema','Describe el problema'),placeholder:T('O que aconteceu? Em qual tela?','¿Qué pasó? ¿En qué pantalla?')}),ms=el('p',{class:'hp-ms','aria-live':'polite'});
      var send=el('button',{type:'button',class:'g-btn ghost',style:'margin-top:8px',onclick:function(){
        var txt=(ta.value||'').trim();if(txt.length<5){ms.textContent=T('Escreva um pouco mais para eu entender.','Escribe un poco más para entender.');return;}
        var sb=ctx.getSb&&ctx.getSb();if(!sb){ms.textContent=T('Não foi possível enviar agora. Use o WhatsApp.','No se pudo enviar ahora. Usa WhatsApp.');return;}
        send.disabled=true;ms.textContent=T('Enviando…','Enviando…');
        var row={code:'REPORT-'+(W.BL_VERSION||'')+'-'+Date.now().toString(36),kind:'REPORT',message:txt.slice(0,400),page:(location.pathname+location.search).slice(0,120),version:W.BL_VERSION||'',ua:navigator.userAgent.slice(0,200)};
        try{sb.from('app_errors').insert(row).then(function(r){send.disabled=false;if(r&&r.error){ms.textContent=T('Não foi possível enviar agora. Use o WhatsApp.','No se pudo enviar ahora. Usa WhatsApp.');}else{ta.value='';ms.textContent=T('Recebido! Obrigado por avisar.','¡Recibido! Gracias por avisar.');}},function(){send.disabled=false;ms.textContent=T('Não foi possível enviar agora. Use o WhatsApp.','No se pudo enviar ahora. Usa WhatsApp.');});}
        catch(e){send.disabled=false;ms.textContent=T('Não foi possível enviar agora. Use o WhatsApp.','No se pudo enviar ahora. Usa WhatsApp.');}
      }},T('Enviar relato','Enviar reporte'));
      f.append(el('div',{class:'hp-box'},el('h3',{},T('Relatar um problema','Reportar un problema')),ta,send,ms));
      var row2=el('div',{class:'hp-box',style:'display:flex;align-items:center;gap:12px;flex-wrap:wrap'});
      row2.append(el('span',{class:'g-hint',style:'font-size:.85rem'},T('Siga a escola','Sigue a la escuela')),
        el('a',{class:'g-ig',href:'https://www.instagram.com/britlandacademy/',target:'_blank',rel:'noopener','aria-label':'Instagram @britlandacademy',title:'@britlandacademy',html:null},ctx.insta?ctx.insta():'@'));
      row2.append(el('button',{type:'button',class:'g-btn ghost',onclick:function(){close();ctx.tour();}},T('Ver o tour','Ver el tour')));
      f.append(row2);return f;
    }
    function show(k){
      cur=k;body.textContent='';tabBtns.forEach(function(b){b.setAttribute('aria-selected',String(b.getAttribute('data-k')===k));});
      body.append(k==='q'?viewQ():k==='n'?viewN():viewC());
    }
    var tabBtns=names.map(function(n){var b=el('button',{type:'button',class:'hp-tab',role:'tab','data-k':n[0],onclick:function(){show(n[0]);}},n[1]);tabs.append(b);return b;});
    dlg.append(el('h2',{},T('Ajuda','Ayuda')),tabs,body,
      el('div',{class:'g-row',style:'justify-content:flex-end;margin-top:12px'},el('button',{type:'button',class:'g-btn ghost',onclick:close},T('Fechar','Cerrar'))));
    ov.append(dlg);ov.addEventListener('click',function(e){if(e.target===ov)close();});D.addEventListener('keydown',kd);D.body.append(ov);show(cur);
  });
}

/* "O que há de novo": once, right after an update (never for a brand-new student: the tour covers that) */
function whatsNew(ctx){
  ES=ctx.course==='es';
  var key='bl-ver-seen-'+(ctx.course||'en')+'-'+((ctx.user&&ctx.user.id)||'x'),cur=W.BL_VERSION;if(!cur)return;
  var seen=null;try{seen=localStorage.getItem(key);}catch(e){return;}
  var mark=function(){try{localStorage.setItem(key,cur);}catch(e){}};
  if(!seen){mark();return;}
  if(seen===cur)return;
  loadRel(function(){
    var list=rels().filter(function(r){return r.show&&cmp(r.v,seen)>0&&cmp(r.v,cur)<=0;}).slice(0,4);
    if(!list.length){mark();return;}
    var go=function(n){
      if(D.getElementById('bl-tour')||D.querySelector('.g-hov')){if(n<8)setTimeout(function(){go(n+1);},2500);return;}
      mark();
      if(!D.getElementById('hp-css')){var st=D.createElement('style');st.id='hp-css';st.textContent=CSS;D.head.appendChild(st);}
      var ov=el('div',{class:'g-hov','data-noi18n':'1'}),close=function(){D.removeEventListener('keydown',kd);ov.remove();},kd=function(e){if(e.key==='Escape')close();};
      var ul=el('ul',{class:'hp-wn',style:'margin:0 0 14px;padding-left:20px'});
      list.forEach(function(r){ul.append(el('li',{},el('b',{},r.t[ES?1:0]+': '),r.p[ES?1:0]));});
      var d=el('div',{class:'g-hdlg hp',role:'dialog','aria-modal':'true','aria-label':T('O que há de novo','Qué hay de nuevo')},
        el('h2',{style:'margin:0 0 4px'},T('O que há de novo \uD83C\uDF89','Qué hay de nuevo \uD83C\uDF89')),
        el('p',{class:'g-hint',style:'margin:0 0 12px;font-size:.85rem'},T('Versão ','Versión ')+cur),ul,
        el('div',{class:'g-row',style:'justify-content:space-between;gap:8px;flex-wrap:wrap'},
          el('button',{type:'button',class:'g-btn ghost',onclick:function(){close();open(ctx,'n');}},T('Ver versões anteriores','Ver versiones anteriores')),
          el('button',{type:'button',class:'g-btn',onclick:close},T('Entendi','Entendido'))));
      ov.append(d);ov.addEventListener('click',function(e){if(e.target===ov)close();});D.addEventListener('keydown',kd);D.body.append(ov);
    };
    setTimeout(function(){go(0);},2200);
  });
}
W.BLHelp={open:open,whatsNew:whatsNew};
})();
