/* Convites automaticos (Britland) — Google Apps Script
   O que faz: a cada 5 minutos pede ao Supabase (funcao invite-text) os convites das aulas que comecam nos proximos 25 minutos
   e grava um arquivo .json por aula na pasta do Google Drive "Avisos_WhatsApp/pendentes". O Power Automate Desktop (no seu PC)
   le a pasta e envia no WhatsApp 10 minutos antes da aula. O resultado volta por "enviados" e "erros".
   SEM SEGREDOS NESTE ARQUIVO: a chave fica em Configuracoes do projeto > Propriedades do script (INVITE_KEY e EMAIL_AVISO). */

var FN = 'https://isrvmwebubjcvzxkorpf.supabase.co/functions/v1/invite-text';
var RAIZ = 'Avisos_WhatsApp';
var FUSO = 'America/Sao_Paulo';

function _prop(k) { return PropertiesService.getScriptProperties().getProperty(k) || ''; }
function _pasta(nome) {
  var raiz = DriveApp.getRootFolder(), it = raiz.getFoldersByName(RAIZ), r = it.hasNext() ? it.next() : raiz.createFolder(RAIZ);
  if (!nome) return r;
  var s = r.getFoldersByName(nome);
  return s.hasNext() ? s.next() : r.createFolder(nome);
}
function _api(body) {
  var r = UrlFetchApp.fetch(FN, { method: 'post', contentType: 'application/json', headers: { 'x-invite-key': _prop('INVITE_KEY') }, payload: JSON.stringify(body), muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) throw new Error('invite-text ' + r.getResponseCode() + ': ' + r.getContentText().slice(0, 200));
  return JSON.parse(r.getContentText());
}
function _br(iso) { return Utilities.formatDate(new Date(iso), FUSO, 'yyyyMMddHHmm'); }
function _aviso(assunto, corpo) { var e = _prop('EMAIL_AVISO'); if (e) MailApp.sendEmail(e, '[Britland] ' + assunto, corpo); }
function _hash(s) { return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, s)).slice(0, 8); }
function _json(f) { return JSON.parse(f.getBlob().getDataAsString('UTF-8')); }
function _nomes(pasta) { var m = {}, it = pasta.getFiles(); while (it.hasNext()) { var f = it.next(); m[f.getName()] = true; } return m; }

/* resultados devolvidos pelo Power Automate: "enviados" -> status sent; "erros" -> status missed (nao reenvia) */
function _resultados(pasta, status) {
  var it = pasta.getFiles();
  while (it.hasNext()) {
    var f = it.next();
    try {
      var j = _json(f);
      _api({ action: 'mark', event_key: j.event_key, status: status, via: 'auto' });
      if (status === 'missed') _aviso('Convite NAO enviado: ' + j.title, 'A automacao nao conseguiu enviar o convite de "' + j.title + '" (' + j.start_at + ') para o grupo "' + j.group + '". Envie pelo app.');
      f.setTrashed(true);
    } catch (e) { Logger.log(e); }
  }
}

function convites() {
  var pend = _pasta('pendentes'), env = _pasta('enviando');
  _resultados(_pasta('enviados'), 'sent');
  _resultados(_pasta('erros'), 'missed');
  // arquivo parado em "enviando" ha mais de 15 min: o Power Automate travou no meio
  var it0 = env.getFiles();
  while (it0.hasNext()) { var g = it0.next(); if (Date.now() - g.getLastUpdated().getTime() > 15 * 60e3) { _aviso('Convite preso', 'O arquivo ' + g.getName() + ' ficou parado em "enviando". Confira o WhatsApp e o Power Automate; nada foi reenviado.'); g.setName('PRESO_' + g.getName()); } }

  var r = _api({ action: 'due', ahead_min: 25 });
  (r.problems || []).forEach(function (p) { _aviso('Aula sem grupo do WhatsApp: ' + p.title, 'A aula "' + p.title + '" (' + p.start_at + ') nao tem o nome do grupo do WhatsApp cadastrado. Nada foi enviado.'); });
  var validos = {}; (r.valid || []).forEach(function (k) { validos[k] = true; });

  // limpa a pasta: aula remarcada, cancelada, enviada pelo app ou vencida
  var it = pend.getFiles();
  while (it.hasNext()) {
    var f = it.next(), j;
    try { j = _json(f); } catch (e) { continue; }
    if (!validos[j.event_key]) { f.setTrashed(true); continue; }
    if (new Date(j.start_at).getTime() < Date.now()) { f.setTrashed(true); _api({ action: 'mark', event_key: j.event_key, status: 'missed', via: 'auto' }); _aviso('Convite vencido: ' + j.title, 'O convite de "' + j.title + '" nao foi enviado antes da aula (PC desligado?).'); }
  }
  // cria os novos
  var tem = _nomes(pend), tem2 = _nomes(env);
  (r.items || []).forEach(function (x) {
    var nome = 'convite_' + _br(x.send_at) + '_' + _hash(x.event_key) + '.json';
    if (tem[nome] || tem2[nome]) return;
    var j = { event_key: x.event_key, title: x.title, group: x.group, text: x.text, start_at: x.start_at, send_at_br: Number(_br(x.send_at)), start_at_br: Number(_br(x.start_at)) };
    pend.createFile(nome, JSON.stringify(j), 'application/json');
  });
}

/* rode UMA vez para criar o gatilho de 5 em 5 minutos */
function instalarGatilho() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'convites') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('convites').timeBased().everyMinutes(5).create();
  _pasta('pendentes'); _pasta('enviando'); _pasta('enviados'); _pasta('erros');
}

/* teste sem gravar nada: mostra no registro o que seria gerado nas proximas 24 h */
function testarSemGravar() {
  var r = _api({ action: 'due', ahead_min: 1440, dry: true, nosync: true });
  Logger.log(JSON.stringify(r, null, 2));
}
