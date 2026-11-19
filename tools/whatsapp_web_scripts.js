/* Scripts JavaScript do fluxo "Enviar convites WhatsApp" (Power Automate Desktop).
   Cada bloco vai em uma acao "Run JavaScript function on web page" (Browser = instancia do Edge com web.whatsapp.com).
   Os trechos %Variavel% sao substituidos pelo proprio Power Automate antes de rodar:
     %Convite['group']%  -> nome do grupo (objeto do JSON)
     %Conteudo%          -> JSON inteiro do arquivo (vira objeto JS: {group, text, ...})
     %SendResult%        -> retorno do script 5
   Variaveis de saida: BuscaRes, SelRes, Result, SendResult, VerifResult.
   Pausas sugeridas: 1,5 s entre cada acao; 2 s antes da verificacao final.
   Aviso: o texto do convite precisa vir como JSON valido (o Power Automate injeta %Conteudo% cru). */

/* 1) Busca o grupo (saida: BuscaRes -> 'OK' ou 'ERRO_BUSCA') */
function ExecuteScript() {
  var s = document.querySelector('#side input[data-tab="3"]') || document.querySelector('#side input[type="text"]') || document.querySelector('#side input');
  if (!s) return 'ERRO_BUSCA';
  s.focus();
  var setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  setter.call(s, '');
  s.dispatchEvent(new Event('input', { bubbles: true }));
  setter.call(s, '%Convite['group']%');
  s.dispatchEvent(new Event('input', { bubbles: true }));
  return 'OK';
}

/* 2) Abre o chat (saida: SelRes -> 'TENTOU:<titulo>' ou 'SEM_GRUPO:...') */
function ExecuteScript() {
  var g = '%Convite['group']%';
  var els = document.querySelectorAll('#pane-side span[title]');
  var alvo = null;
  for (var i = 0; i < els.length; i++) {
    var t = els[i].getAttribute('title') || '';
    if (t === g || t.indexOf(g) === 0) { alvo = els[i]; break; }
  }
  if (!alvo) return 'SEM_GRUPO:' + els.length;
  var row = alvo.closest('[role="row"]') || alvo.closest('[role="listitem"]') || alvo.parentElement;
  var cands = [row.querySelector('[role="gridcell"]'), row.firstElementChild, row, alvo.parentElement, alvo];
  ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(function (tp) {
    cands.forEach(function (c) {
      if (c) c.dispatchEvent(new MouseEvent(tp, { bubbles: true, cancelable: true, view: window }));
    });
  });
  row.click();
  var s = document.querySelector('#side input[data-tab="3"]') || document.querySelector('#side input');
  if (s) {
    ['keydown', 'keypress', 'keyup'].forEach(function (tp) {
      s.dispatchEvent(new KeyboardEvent(tp, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
    });
  }
  return 'TENTOU:' + (alvo.getAttribute('title') || '');
}

/* 3) Confere o chat aberto e insere o texto (saida: Result -> 'OK' ou 'ERRO:...') */
function ExecuteScript() {
  var d = %Conteudo%;
  var g = d.group;
  var hd = document.querySelector('#main header');
  if (!hd) return 'ERRO:CHAT:SEM_HEADER';
  var nm = (hd.innerText || '').split('\n').filter(function (x) { return x.trim(); })[0] || '';
  nm = nm.trim();
  if (!(nm === g || nm.indexOf(g) === 0)) return 'ERRO:CHAT:' + nm;
  var box = document.querySelector('#main footer div[contenteditable="true"]');
  if (!box) return 'ERRO:SEM_CAIXA';
  box.focus();
  document.execCommand('selectAll', false, null);
  document.execCommand('delete', false, null);
  var linhas = String(d.text).split('\n');
  for (var i = 0; i < linhas.length; i++) {
    if (i > 0) document.execCommand('insertLineBreak', false, null);
    if (linhas[i]) document.execCommand('insertText', false, linhas[i]);
  }
  return (box.innerText || '').trim() ? 'OK' : 'ERRO:CAIXA_VAZIA';
}

/* 4) Clica em Enviar (saida: SendResult -> 'CLICADO' ou 'NAO_ENVIADO:...') */
function ExecuteScript() {
  var g = '%Convite['group']%';
  var hd = document.querySelector('#main header');
  var nm = hd ? ((hd.innerText || '').split('\n').filter(function (x) { return x.trim(); })[0] || '').trim() : '';
  if (!(nm === g || nm.indexOf(g) === 0)) return 'NAO_ENVIADO:CHAT:' + nm;
  var box = document.querySelector('#main footer div[contenteditable="true"]');
  if (!box || !(box.innerText || '').trim()) return 'NAO_ENVIADO:CAIXA_VAZIA';
  var b = document.querySelector('#main footer button[aria-label="Enviar"]') || document.querySelector('#main footer button[aria-label="Send"]');
  if (!b) {
    var ic = document.querySelector('#main footer span[data-icon="send"]');
    b = ic ? (ic.closest('button') || ic.parentElement) : null;
  }
  if (!b) return 'NAO_ENVIADO:SEM_BOTAO';
  b.click();
  return 'CLICADO';
}

/* 5) Verificacao final (saida: VerifResult -> 'ENVIADO' ou 'ERRO:...') */
function ExecuteScript() {
  if ('%SendResult%' !== 'CLICADO') return 'ERRO:SEND:%SendResult%';
  var g = '%Convite['group']%';
  var hd = document.querySelector('#main header');
  var nm = hd ? ((hd.innerText || '').split('\n').filter(function (x) { return x.trim(); })[0] || '').trim() : '';
  if (!(nm === g || nm.indexOf(g) === 0)) return 'ERRO:CHAT:' + nm;
  var box = document.querySelector('#main footer div[contenteditable="true"]');
  if (box && (box.innerText || '').trim()) return 'ERRO:CAIXA_NAO_ESVAZIOU';
  return 'ENVIADO';
}
