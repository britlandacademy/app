// Google Apps Script (script.google.com, logado em pscenesp@gmail.com).
// 1) Projeto > Configurações > Propriedades do script: URL (https://<projeto>.supabase.co/functions/v1/pay-email) e SECRET.
// 2) Rode setup() uma vez (autorize). Ele cria um gatilho de 1 minuto.
function setup(){ScriptApp.getProjectTriggers().forEach(t=>ScriptApp.deleteTrigger(t));ScriptApp.newTrigger('check').timeBased().everyMinutes(1).create();}
function check(){
  const P=PropertiesService.getScriptProperties(),urls=(P.getProperty('URL')||'').split(','),secret=P.getProperty('SECRET');
  const lbl=GmailApp.getUserLabelByName('pago-lido')||GmailApp.createLabel('pago-lido');
  GmailApp.search('(from:wise.com subject:Pix OR from:wise.com subject:"Dinheiro recebido" OR from:xpi.com.br OR from:xp.com.br subject:Pix) -label:pago-lido newer_than:3d').forEach(th=>{
    th.getMessages().forEach(m=>{
      const body=m.getPlainBody();
      urls.forEach(u=>UrlFetchApp.fetch(u.trim(),{method:'post',contentType:'application/json',headers:{'x-secret':secret},payload:JSON.stringify({subject:m.getSubject(),body:body}),muteHttpExceptions:true}));
    });
    th.addLabel(lbl);
  });
}
