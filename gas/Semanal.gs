/* Confirmacao semanal das aulas (Britland) — Google Apps Script, no MESMO projeto dos convites (Convites.gs).
   O que faz: a cada 5 minutos pergunta ao Supabase (funcao weekly-confirm) o que deve ser feito agora e conversa com o
   Power Automate Desktop por arquivos na pasta do Google Drive "Avisos_Semana":
     pendentes/  mensagens para enviar (confirmacao de quinta/sexta, lembrete, "Thanks for your message!")
     ler/        grupos cujas respostas o Power Automate deve ler
     respostas/  o que o Power Automate leu (volta para o Supabase, que classifica com o Gemini)
     enviados/ e erros/  resultado de cada envio
   Os convites das aulas usam outra pasta (Avisos_WhatsApp) e continuam com prioridade no Power Automate.
   SEM SEGREDOS NESTE ARQUIVO: usa a mesma propriedade INVITE_KEY dos convites (ou WEEKLY_KEY, se existir). */

var WFN = 'https://isrvmwebubjcvzxkorpf.supabase.co/functions/v1/weekly-confirm';
var WRAIZ = 'Avisos_Semana';

function _wprop(k) { return PropertiesService.getScriptProperties().getProperty(k) || ''; }
function _wpasta(nome) {
  var raiz = DriveApp.getRootFolder(), it = raiz.getFoldersByName(WRAIZ), r = it.hasNext() ? it.next() : raiz.createFolder(WRAIZ);
  if (!nome) return r;
  var s = r.getFoldersByName(nome);
  return s.hasNext() ? s.next() : r.createFolder(nome);
}
function _wapi(body) {
  var r = UrlFetchApp.fetch(WFN, { method: 'post', contentType: 'application/json', headers: { 'x-invite-key': _wprop('WEEKLY_KEY') || _wprop('INVITE_KEY') }, payload: JSON.stringify(body), muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) throw new Error('weekly-confirm ' + r.getResponseCode() + ': ' + r.getContentText().slice(0, 200));
  return JSON.parse(r.getContentText());
}
function _wjson(f) { return JSON.parse(f.getBlob().getDataAsString('UTF-8')); }
function _wnome(key) { return key.replace(/[^A-Za-z0-9-]/g, '_') + '.json'; }

function semanal() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return;
  try {
    // 1) resultados dos envios
    [['enviados', 'sent'], ['erros', 'missed']].forEach(function (p) {
      var it = _wpasta(p[0]).getFiles();
      while (it.hasNext()) { var f = it.next(); try { var j = _wjson(f); _wapi({ action: 'mark', key: j.key, status: p[1] }); f.setTrashed(true); } catch (e) { Logger.log(e); } }
    });
    // 2) respostas lidas no WhatsApp
    var ir = _wpasta('respostas').getFiles();
    while (ir.hasNext()) {
      var g = ir.next();
      try {
        var t = g.getBlob().getDataAsString('UTF-8'), o;
        try { o = JSON.parse(t); } catch (e) { o = { error: 'resposta invalida: ' + t.slice(0, 80) }; }
        var key = o.key || ('r|' + g.getName().replace(/^r_/, '').replace(/\.json$/, ''));
        _wapi({ action: 'replies', key: key, msgs: o.msgs || [], error: o.ok === false ? (o.error || 'erro') : (o.error || null) });
        g.setTrashed(true);
      } catch (e) { Logger.log(e); }
    }
    // 3) o que fazer agora
    var r = _wapi({ action: 'tick' }), pend = _wpasta('pendentes'), ler = _wpasta('ler');
    (r.send || []).forEach(function (x) { pend.createFile(_wnome(x.key), JSON.stringify({ key: x.key, group: x.group, text: x.text }), 'application/json'); });
    (r.read || []).forEach(function (x) { ler.createFile(_wnome(x.key), JSON.stringify({ key: x.key, group: x.group, marks: x.marks }), 'application/json'); });
    if (r.log && Object.keys(r.log).length) Logger.log(JSON.stringify(r.log));
  } finally { lock.releaseLock(); }
}

/* rode UMA vez para criar o gatilho de 5 em 5 minutos e as pastas */
function instalarGatilhoSemanal() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'semanal') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('semanal').timeBased().everyMinutes(5).create();
  ['pendentes', 'enviando', 'enviados', 'erros', 'ler', 'respostas'].forEach(_wpasta);
}

/* teste sem enviar nada: mostra no registro as mensagens que sairiam na quinta e na sexta */
function testarSemanalSemEnviar() {
  Logger.log(JSON.stringify(_wapi({ action: 'preview', phase: 'thu' }), null, 2));
  Logger.log(JSON.stringify(_wapi({ action: 'preview', phase: 'fri' }), null, 2));
}
