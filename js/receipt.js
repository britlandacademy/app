/* Britland Academy: lesson receipt (recibo) as a PNG, drawn on a canvas. Text is always Portuguese. */
(function(){
'use strict';
var CNPJ='44.073.803/0001-41';
var U=['zero','um','dois','três','quatro','cinco','seis','sete','oito','nove','dez','onze','doze','treze','catorze','quinze','dezesseis','dezessete','dezoito','dezenove'];
var T=['','','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa'];
var H=['','cento','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos'];
function w999(n){if(n===100)return'cem';var o=[],h=Math.floor(n/100),r=n%100;if(h)o.push(H[h]);if(r){if(r<20)o.push(U[r]);else{var t=T[Math.floor(r/10)],u=r%10;o.push(u?t+' e '+U[u]:t);}}return o.join(' e ');}
function words(n){if(n===0)return'zero';var m=Math.floor(n/1000),r=n%1000,p=[];if(m)p.push(m===1?'mil':w999(m)+' mil');if(r)p.push(w999(r));return p.length>1&&(r<100||r%100===0)?p.join(' e '):p.join(' ');}
function money(v,cur){
  var n=Math.round(Math.abs(+v)*100),i=Math.floor(n/100),c=n%100,eur=cur==='EUR';
  var un=eur?(i===1?'euro':'euros'):(i===1?'real':'reais'),cn=eur?(c===1?'cêntimo':'cêntimos'):(c===1?'centavo':'centavos');
  var s=(i||!c?words(i)+' '+(i>=1000000&&i%1000000===0?'de ':'')+un:'');
  if(c)s+=(s?' e ':'')+words(c)+' '+cn;
  return s;
}
function fmt(v,cur){return (cur==='EUR'?'€ ':'R$ ')+(+v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});}
function br(d){var p=String(d).slice(0,10).split('-');return p[2]+'/'+p[1]+'/'+p[0];}
var MES=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
function img(src){return new Promise(function(ok){var i=new Image();i.onload=function(){ok(i);};i.onerror=function(){ok(null);};i.src=src;});}
function wrap(c,t,x,y,mw,lh){var ws=t.split(' '),l='';ws.forEach(function(w){var s=l?l+' '+w:w;if(c.measureText(s).width>mw&&l){c.fillText(l,x,y);y+=lh;l=w;}else l=s;});if(l)c.fillText(l,x,y);return y;}
function number(ch){return 'BA-REC-'+String(ch.paid_on).slice(0,4)+'-'+String(ch.id).padStart(4,'0');}
/* opts: {charge, plan, name, base} */
async function make(o){
  var ch=o.charge,base=o.base||'',S=2,W=794,Hh=400;
  var cv=document.createElement('canvas');cv.width=W*S;cv.height=Hh*S;var c=cv.getContext('2d');c.scale(S,S);
  try{await Promise.all(['700 24px Lora','500 14px Montserrat','600 12px Montserrat'].map(function(f){return document.fonts.load(f);}));}catch(e){}
  var SERIF='Lora,Georgia,serif',SANS='Montserrat,Arial,sans-serif';
  var shield=await img(base+'img/britland-shield.png'),sig=await img(base+'img/assinatura.png');
  function ls(v){try{c.letterSpacing=v;}catch(e){}}
  c.fillStyle='#F9F9F7';c.fillRect(0,0,W,Hh);
  c.fillStyle='#0F2247';c.fillRect(0,0,W,70);
  if(shield)c.drawImage(shield,28,12,46*shield.width/shield.height,46);
  c.textBaseline='alphabetic';c.fillStyle='#fff';c.font='700 24px '+SERIF;c.textAlign='left';ls('0px');c.fillText('BRITLAND',92,38);
  c.fillStyle='#ff5a6a';c.font='500 14px '+SANS;ls('1px');c.fillText('ACADEMY',92,57);
  c.textAlign='right';c.fillStyle='#fff';c.font='700 24px '+SERIF;ls('3.4px');c.fillText('RECIBO',W-28+3.4,36);
  c.fillStyle='#E3C76F';c.font='500 10.5px '+SANS;ls('1.5px');c.fillText('Nº '+number(ch),W-28+1.5,54);
  c.textAlign='left';
  var dd=String(ch.due_date).slice(0,10).split('-'),ref=ch.title?ch.title:MES[+dd[1]-1]+'/'+dd[0];
  var cols=[['Recebi de',o.name||'—',28],['Plano',o.plan||'Avulsa',28+(W-56)*0.30+10],['Referência',ref,28+(W-56)*0.30+10+(W-56)*0.23+10],['Pago em',br(ch.paid_on),28+(W-56)*0.30+10+(W-56)*0.46+20]];
  cols.forEach(function(k,i){c.fillStyle='#7F6324';c.font='600 9px '+SANS;ls('1.6px');c.fillText(k[0].toUpperCase(),k[2],104);c.fillStyle='#0A192F';c.font=(i===0?'600 ':'400 ')+'12px '+SANS;ls('0px');c.fillText(k[1],k[2],123);});
  c.strokeStyle='#C5A880';c.lineWidth=1;c.beginPath();c.moveTo(28,160);c.lineTo(W-28,160);c.moveTo(28,250);c.lineTo(W-28,250);c.stroke();
  c.fillStyle='#7F6324';c.font='600 9px '+SANS;ls('1.6px');c.fillText('VALOR RECEBIDO',28,184);
  c.fillStyle='#0A192F';c.font='700 34px '+SERIF;ls('0px');c.fillText(fmt(ch.amount,ch.currency),28,226);
  c.fillStyle='#4a5468';c.font='400 11.5px '+SANS;
  var what=o.plan?'referentes às aulas do plano '+o.plan+'.':'referentes a '+(ch.title||'aulas')+'.';
  var tx=28+c.measureText(fmt(ch.amount,ch.currency)).width;tx=Math.max(tx,0);
  c.font='700 34px '+SERIF;var vw=c.measureText(fmt(ch.amount,ch.currency)).width;c.font='400 11.5px '+SANS;
  var x0=28+vw+22,mw=W-28-x0;
  var mt=money(ch.amount,ch.currency);mt=mt.charAt(0).toUpperCase()+mt.slice(1);var y=wrap(c,mt+', '+what,x0,198,mw,18.4);
  wrap(c,'Dou plena quitação. Franca/SP, '+br(ch.paid_on)+'.',x0,y+18.4,mw,18.4);
  c.fillStyle='#4a5468';c.font='400 10.5px '+SANS;c.fillText('Emitente: Paulo Sérgio Cruz · Britland Academy',28,352);c.fillText('CNPJ: '+CNPJ+' · Franca/SP',28,369);
  if(sig){c.drawImage(sig,W-28-250,282,250,250*sig.height/sig.width);}
  c.strokeStyle='#0A192F';c.lineWidth=1.5;c.beginPath();c.moveTo(W-28-250,350);c.lineTo(W-28,350);c.stroke();
  c.textAlign='center';c.fillStyle='#0A192F';c.font='600 10.5px '+SANS;c.fillText('Paulo Sérgio Cruz · Britland Academy',W-28-125,366);
  c.fillStyle='#4a5468';c.font='400 10.5px '+SANS;c.fillText('CNPJ: '+CNPJ,W-28-125,380);
  return {canvas:cv,number:number(ch)};
}
async function download(o){
  var r=await make(o);
  return new Promise(function(ok){r.canvas.toBlob(function(b){var u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='Recibo-'+r.number+'.png';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(u);a.remove();},4000);ok();},'image/png');});
}
window.Receipt={make:make,download:download,money:money,words:words,number:number};
})();
