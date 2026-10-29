// Google Apps Script (script.google.com, logado em pscenesp@gmail.com).
// 1) Projeto > Configurações > Propriedades do script: SECRET (a mesma senha PAY_SECRET do Supabase). As chaves públicas (anon) abaixo já são as do app.
// 2) Rode setup() uma vez (autorize). Ele cria um gatilho de 1 minuto.
function setup(){ScriptApp.getProjectTriggers().forEach(t=>ScriptApp.deleteTrigger(t));ScriptApp.newTrigger('check').timeBased().everyMinutes(1).create();}
const TARGETS=[{url:'https://isrvmwebubjcvzxkorpf.supabase.co/functions/v1/pay-email',key:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzcnZtd2VidWJqY3Z6eGtvcnBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5NzY4NTgsImV4cCI6MjEwNzU1Mjg1OH0.xMFhMUmDg4VcnMiY49XQMP4btXMPEEmIDpP8qweewHk'},{url:'https://utjiyhjoretlgnlqpxrk.supabase.co/functions/v1/pay-email',key:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0aml5aGpvcmV0bGdubHFweHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMTI1ODgsImV4cCI6MjEwNzY4ODU4OH0.mmDs5DP79enEaCn3w9yvr4ijto17nSNjLVKrxqW5Bzs'}];
function check(){
  const secret=PropertiesService.getScriptProperties().getProperty('SECRET');
  const lbl=GmailApp.getUserLabelByName('pago-lido')||GmailApp.createLabel('pago-lido');
  GmailApp.search('(from:wise.com subject:Pix OR from:wise.com subject:"Dinheiro recebido" OR from:xpi.com.br OR from:xp.com.br subject:Pix) -label:pago-lido newer_than:3d').forEach(th=>{
    th.getMessages().forEach(m=>{
      const body=m.getPlainBody();
      TARGETS.forEach(t=>UrlFetchApp.fetch(t.url,{method:'post',contentType:'application/json',headers:{'x-secret':secret,'Authorization':'Bearer '+t.key,'apikey':t.key},payload:JSON.stringify({subject:m.getSubject(),body:body}),muteHttpExceptions:true}));
    });
    th.addLabel(lbl);
  });
}
