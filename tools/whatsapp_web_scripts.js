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

/* 3) Confere o chat aberto e cola o texto (saida: Result -> 'OK' ou 'ERRO:...') */
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
  /* Seleciona todo o conteudo da caixa e cola o texto inteiro por cima (colagem simulada).
     Testado no WhatsApp Business Web: substitui qualquer rascunho e mantem as quebras de linha.
     (execCommand selectAll/delete/insertLineBreak nao funcionam nessa caixa.) A caixa atualiza com um pequeno atraso,
     entao a conferencia de caixa vazia fica por conta do script 4, que roda 1,5 s depois. */
  box.focus();
  var sel = window.getSelection(), rg = document.createRange();
  rg.selectNodeContents(box);
  sel.removeAllRanges();
  sel.addRange(rg);
  var dt = new DataTransfer();
  dt.setData('text/plain', String(d.text));
  box.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  return 'OK';
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

/* ===== Confirmacao semanal (pasta Avisos_Semana) =====
   ENVIO: os arquivos de "pendentes" tem {key, group, text}; o fluxo usa os MESMOS scripts 1 a 5 acima (Convite = objeto do arquivo).
   LEITURA: os arquivos de "ler" tem {key, group, marks[]}; o fluxo usa os scripts 1 e 2 (busca e abre o grupo) e depois o 6 abaixo,
   e grava o retorno (texto JSON) em "respostas" com o mesmo nome do arquivo. */

/* 6) Le as mensagens que chegaram depois da ultima confirmacao semanal (saida: Lidas -> JSON)
   Nao depende das classes do WhatsApp Web (.message-in/out mudam): usa os blocos [data-pre-plain-text].
   Direcao: data-id true_/false_ > classe message-out/in > icone de status (msg-*) > lado da tela. */
function ExecuteScript() {
  var d = %Conteudo%;
  var g = d.group, marks = d.marks || [];
  var main = document.querySelector('#main');
  var hd = main ? main.querySelector('header') : null;
  var ls = hd ? (hd.innerText || '').split(/\r?\n/).map(function (s) { return s.trim(); }).filter(function (s) { return s; }) : [];
  var nm = ls[0] || '';
  if (!(nm === g || nm.indexOf(g) === 0)) return JSON.stringify({ key: d.key, ok: false, error: 'CHAT:' + nm.slice(0, 40) });
  var norm = function (s) { return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase(); };
  var mr = main.getBoundingClientRect();
  var cs = main.querySelectorAll('[data-pre-plain-text]');
  var list = [];
  for (var i = 0; i < cs.length; i++) {
    var c = cs[i];
    if (c.parentElement && c.parentElement.closest('[data-pre-plain-text]')) continue;
    var row = c.closest('[role="row"]') || c.closest('[data-id]') || c.parentElement;
    var id = '', di = c.closest('[data-id]');
    if (di) id = di.getAttribute('data-id') || '';
    var out;
    if (/^true_/.test(id)) out = true;
    else if (/^false_/.test(id)) out = false;
    else if (c.closest('.message-out')) out = true;
    else if (c.closest('.message-in')) out = false;
    else if (row && row.querySelector('[data-icon^="msg-"],[data-icon*="check"],[data-icon="msg-time"]')) out = true;
    else { var r = c.getBoundingClientRect(); out = (r.left - mr.left) > (mr.right - r.right); }
    var pre = c.getAttribute('data-pre-plain-text') || '';
    var tx = c.querySelector('.selectable-text');
    var text = tx ? tx.innerText : c.innerText;
    list.push({ dir: out ? 'out' : 'in', who: pre.replace(/^\[[^\]]*\]\s*/, '').replace(/:\s*$/, ''), at: (pre.match(/^\[([^\]]*)\]/) || [])[1] || '', text: text || '', all: norm(c.innerText) });
  }
  /* a confirmacao desta semana e a ULTIMA mensagem que contem o inicio de marks[0]; tudo que veio depois dela conta */
  var last = -1, m0 = norm(marks[0]).slice(0, 25);
  for (var j = list.length - 1; j >= 0; j--) { if (m0 && list[j].all.indexOf(m0) >= 0) { last = j; break; } }
  if (last < 0) {
    var rows = main.querySelectorAll('[role="row"]').length, ids = main.querySelectorAll('[data-id]').length, sel = main.querySelectorAll('.selectable-text').length;
    return JSON.stringify({ key: d.key, ok: false, error: 'SEM_MENSAGEM_SEMANAL:pre=' + cs.length + ',rows=' + rows + ',ids=' + ids + ',sel=' + sel + ':' + list.slice(-2).map(function (x) { return x.dir + '>' + x.all.slice(0, 40); }).join('|') });
  }
  var res = list.slice(last + 1).filter(function (x) { return x.text; }).map(function (x) { return { dir: x.dir, who: x.who, at: x.at, text: x.text }; });
  return JSON.stringify({ key: d.key, ok: true, msgs: res });
}
