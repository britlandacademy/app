/* Britland Academy: stage completion certificate. A4 landscape PDF drawn on a canvas (needs js/qr.js). */
(function(){
'use strict';
var W=794*0+1123,H=794,S=2;
var NAVY='#0A192F',GOLD='#D4AF37',TAN='#C5A880',DGOLD='#7F6324',SLATE='#33415A';
var MEN=['January','February','March','April','May','June','July','August','September','October','November','December'];
var MES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
var TX={
  en:{title:'CERTIFICATE OF ACHIEVEMENT',cert:'This is to certify that',body:['has successfully mastered the direct method curriculum','and completed all required coursework and fluency assessments for'],stage:'STAGE ',lang:'ENGLISH LANGUAGE',exam:'Final exam ',dist:'With Distinction',hours:' ACADEMIC HOURS',done:'Completed ',scan:'Scan to verify',dir:'DIRECTOR OF STUDIES',
    date:function(d){return d[2].replace(/^0/,'')+' '+MEN[+d[1]-1]+' '+d[0];},path:'verify.html'},
  es:{title:'CERTIFICADO DE FINALIZACIÓN',cert:'Se certifica que',body:['ha dominado el programa del método directo y completado','todas las lecciones y evaluaciones requeridas de'],stage:'ETAPA ',lang:'LENGUA ESPAÑOLA',exam:'Examen final ',dist:'Con Distinción',hours:' HORAS ACADÉMICAS',done:'Concluido el ',scan:'Escanee para verificar',dir:'DIRECTOR DE ESTUDIOS',
    date:function(d){return d[2].replace(/^0/,'')+' de '+MES[+d[1]-1]+' de '+d[0];},path:'espanol/verify.html'}
};
var HOST='https://britlandacademy.github.io/app/';
function link(id,lang){return HOST+TX[lang].path+'?id='+encodeURIComponent(id);}
function img(src){return new Promise(function(ok){var i=new Image();i.onload=function(){ok(i);};i.onerror=function(){ok(null);};i.src=src;});}
function fonts(){
  if(!document.getElementById('blcf')){var l=document.createElement('link');l.id='blcf';l.rel='stylesheet';
    l.href='https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Libre+Baskerville:ital@1&family=Lora:wght@700&family=Montserrat:wght@400;500;600&display=swap';document.head.appendChild(l);}
  return Promise.all(['italic 400 40px "Libre Baskerville"','600 20px "Cormorant Garamond"','italic 500 20px "Cormorant Garamond"','700 20px "Cormorant Garamond"','700 20px Lora','500 14px Montserrat','600 14px Montserrat','400 14px Montserrat'].map(function(f){return document.fonts.load(f).catch(function(){});}));
}
async function make(o){
  var lang=o.lang==='es'?'es':'en',t=TX[lang],ce=o.cert,base=o.base||'';
  var cv=document.createElement('canvas');cv.width=W*S;cv.height=H*S;var c=cv.getContext('2d');c.scale(S,S);
  await Promise.race([fonts(),new Promise(function(r){setTimeout(r,4000);})]);
  var shield=await img(base+'img/britland-shield.png'),sig=await img(base+'img/assinatura.png');
  var SERIF='"Cormorant Garamond",Georgia,serif',SANS='Montserrat,Arial,sans-serif';
  function ls(v){try{c.letterSpacing=v;}catch(e){}}
  function txt(s,x,y,font,col,al,sp){c.font=font;c.fillStyle=col;c.textAlign=al||'left';ls(sp||'0px');
    var adj=0;if(sp&&al==='center')adj=parseFloat(sp)/2;c.fillText(s,x+adj,y);ls('0px');}
  c.textBaseline='alphabetic';
  c.fillStyle='#F9F9F7';c.fillRect(0,0,W,H);
  if(shield){c.globalAlpha=.035;c.drawImage(shield,381,200,360,360*shield.height/shield.width);c.globalAlpha=1;}
  c.strokeStyle=NAVY;c.lineWidth=2.5;c.strokeRect(26,26,W-52,H-52);
  c.strokeStyle=TAN;c.lineWidth=1;c.strokeRect(36.5,36.5,W-73,H-73);
  /* corners */
  c.strokeStyle=GOLD;c.lineWidth=2;
  [[52,52,1,1],[W-52,52,-1,1],[52,H-52,1,-1],[W-52,H-52,-1,-1]].forEach(function(k){
    c.beginPath();c.moveTo(k[0],k[1]+46*k[3]);c.lineTo(k[0],k[1]);c.lineTo(k[0]+46*k[2],k[1]);c.stroke();
    c.save();c.translate(k[0],k[1]);c.rotate(Math.PI/4);c.fillStyle=NAVY;c.fillRect(-7,-7,14,14);c.fillStyle=GOLD;c.fillRect(-3,-3,6,6);c.restore();});
  /* lockup */
  if(shield){var sh=78;c.drawImage(shield,W/2-sh*shield.width/shield.height/2,40,sh*shield.width/shield.height,sh);}
  txt('BRITLAND',W/2,40+78+8+26,'700 31px Lora,Georgia,serif','#102C50','center');
  txt('ACADEMY',W/2,40+78+8+26+5+16,'500 17.5px '+SANS,'#B11929','center','1.2px');
  /* title */
  txt(t.title,W/2,219,'600 13px '+SANS,DGOLD,'center','6px');
  txt(t.cert,W/2,262,'italic 500 23px '+SERIF,SLATE,'center');
  /* name */
  var nm=ce.student_name||'',fs=50;c.font='italic 400 '+fs+'px "Libre Baskerville",Georgia,serif';
  while(c.measureText(nm).width>860&&fs>26){fs-=2;c.font='italic 400 '+fs+'px "Libre Baskerville",Georgia,serif';}
  var nw=c.measureText(nm).width;
  txt(nm,W/2,330,'italic 400 '+fs+'px "Libre Baskerville",Georgia,serif',NAVY,'center');
  c.strokeStyle=TAN;c.lineWidth=1.5;var lw=Math.max(nw+112,420);c.beginPath();c.moveTo(W/2-lw/2,348);c.lineTo(W/2+lw/2,348);c.stroke();
  txt(t.body[0],W/2,386,'400 16.5px '+SANS,SLATE,'center');
  txt(t.body[1],W/2,414,'400 16.5px '+SANS,SLATE,'center');
  /* stage */
  var st=t.stage+ce.stage;c.font='700 58px '+SERIF;ls('8px');var sw=c.measureText(st).width;ls('0px');
  txt(st,W/2,484,'700 58px '+SERIF,NAVY,'center','8px');
  c.strokeStyle=TAN;c.lineWidth=1;
  c.beginPath();c.moveTo(W/2-sw/2-22-80,468);c.lineTo(W/2-sw/2-22,468);c.moveTo(W/2+sw/2+22,468);c.lineTo(W/2+sw/2+22+80,468);c.stroke();
  txt(t.lang,W/2,517,'600 13px '+SANS,DGOLD,'center','4.4px');
  if(ce.exam_pct!=null){
    var a=t.exam,b=Math.round(ce.exam_pct)+'%',d=ce.distinction?t.dist:'';
    c.font='400 12px '+SANS;ls('1px');var wa=c.measureText(a).width;c.font='600 12px '+SANS;var wb=c.measureText(b).width;
    c.font='400 12px '+SANS;var wd=d?c.measureText(d).width+40:0;ls('0px');
    var x=W/2-(wa+wb+wd)/2,y=545;
    txt(a,x,y,'400 12px '+SANS,SLATE,'left','1px');txt(b,x+wa,y,'600 12px '+SANS,NAVY,'left','1px');
    if(d){txt('◆',x+wa+wb+20,y,'400 12px '+SANS,TAN,'center');txt(d,x+wa+wb+40,y,'400 12px '+SANS,SLATE,'left','1px');}
  }
  /* footer left */
  var bt=H-68,dp=ce.completed_on.slice(0,10).split('-');
  txt(ce.hours+t.hours,100,bt-48,'600 12px '+SANS,DGOLD,'left','2.4px');
  c.font='400 13px '+SANS;var dl=t.done;var w1=c.measureText(dl).width;
  txt(dl,100,bt-24,'400 13px '+SANS,SLATE);txt(t.date(dp),100+w1,bt-24,'600 13px '+SANS,NAVY);
  txt('ID ',100,bt-4,'400 13px '+SANS,SLATE);var w2=c.measureText('ID ').width;txt(ce.id,100+w2,bt-4,'600 13px '+SANS,NAVY,'left','.5px');
  /* QR */
  var m=window.BLQR.matrix(link(ce.id,lang)),n=m.length,box=92,pad=6,qs=Math.floor((box-pad*2)*S/n)/S,qw=qs*n;
  var qx=W/2-box/2,qy=bt-box-18;
  c.fillStyle='#fff';c.fillRect(qx,qy,box,box);c.strokeStyle=TAN;c.lineWidth=1;c.strokeRect(qx+.5,qy+.5,box-1,box-1);
  c.fillStyle=NAVY;var ox=qx+(box-qw)/2,oy=qy+(box-qw)/2;
  for(var r=0;r<n;r++)for(var k=0;k<n;k++)if(m[r][k])c.fillRect(ox+k*qs,oy+r*qs,qs+.02,qs+.02);
  txt(t.scan,W/2,bt,'400 9.5px '+SANS,SLATE,'center','.8px');
  /* signature */
  var sx=W-100-280,sw2=280;
  if(sig){var sgw=320;c.drawImage(sig,sx+sw2/2-sgw/2,bt-24-sig.height/sig.width*sgw+8,sgw,sig.height/sig.width*sgw);}
  c.fillStyle=NAVY;c.fillRect(sx,bt-22,sw2,1.5);
  txt(t.dir,sx+sw2/2,bt-3,'600 12px '+SANS,NAVY,'center','2.6px');
  return cv;
}
/* ---- minimal PDF (one page, one JPEG) ---- */
function pdf(cv){
  var jpg=atob(cv.toDataURL('image/jpeg',.93).split(',')[1]);
  var pw=841.89,ph=595.28,parts=[],off=[],len=0;
  function add(s){parts.push(s);len+=s.length;}
  function obj(n,s){off[n]=len;add(n+' 0 obj\n'+s+'\nendobj\n');}
  add('%PDF-1.4\n');
  obj(1,'<< /Type /Catalog /Pages 2 0 R >>');
  obj(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  obj(3,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+pw+' '+ph+'] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');
  off[4]=len;add('4 0 obj\n<< /Type /XObject /Subtype /Image /Width '+cv.width+' /Height '+cv.height+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+jpg.length+' >>\nstream\n');add(jpg);add('\nendstream\nendobj\n');
  var cs='q '+pw+' 0 0 '+ph+' 0 0 cm /Im0 Do Q';
  obj(5,'<< /Length '+cs.length+' >>\nstream\n'+cs+'\nendstream');
  var x=len;add('xref\n0 6\n0000000000 65535 f \n');
  for(var i=1;i<=5;i++)add(('0000000000'+off[i]).slice(-10)+' 00000 n \n');
  add('trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+x+'\n%%EOF');
  var u=new Uint8Array(len),p=0;parts.forEach(function(s){for(var i=0;i<s.length;i++)u[p++]=s.charCodeAt(i)&255;});
  return new Blob([u],{type:'application/pdf'});
}
async function blob(o){return pdf(await make(o));}
function fname(o){return (o.lang==='es'?'Certificado':'Certificate')+'-'+o.cert.id+'.pdf';}
async function download(o){
  var b=await blob(o),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=fname(o);document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},4000);
}
window.Certificate={make:make,blob:blob,download:download,link:link};
})();
