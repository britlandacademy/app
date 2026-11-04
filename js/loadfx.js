/* Britland loading animation: shield drawn in gold, following real progress, plus dated effects.
   API: BLLoad.mount(host,{effect:'natal'|null,year:2026}) -> {progress(p0to1),finish(cb),destroy()}
        BLLoad.pick(date,course,birthdayMD) -> effect id | null ;  BLLoad.EFFECTS (list) */
(function(W,D){
var OUT=[120.0, 3.0, 125.2, 3.1, 130.5, 3.5, 135.7, 3.8, 140.9, 4.0, 146.1, 4.3, 151.4, 4.8, 156.5, 5.6, 161.7, 6.3, 166.9, 7.1, 172.1, 7.9, 177.2, 8.9, 182.3, 10.1, 187.4, 11.4, 192.4, 12.7, 197.5, 13.9, 202.5, 15.4, 207.5, 17.1, 212.4, 18.9, 217.3, 20.7, 222.2, 22.6, 227.1, 24.6, 231.6, 27.1, 234.9, 31.1, 236.0, 36.2, 236.0, 41.4, 236.0, 46.7, 236.0, 51.9, 236.0, 57.2, 236.0, 62.4, 236.0, 67.6, 236.0, 72.9, 236.0, 78.1, 236.0, 83.3, 236.0, 88.6, 236.0, 93.8, 236.0, 99.1, 236.0, 104.3, 236.0, 109.5, 236.0, 114.8, 236.0, 120.0, 236.0, 125.2, 236.0, 130.5, 236.0, 135.7, 235.9, 140.9, 235.7, 146.2, 235.2, 151.4, 234.5, 156.6, 233.3, 161.7, 232.3, 166.8, 230.9, 171.8, 229.2, 176.8, 227.2, 181.6, 225.1, 186.5, 223.0, 191.2, 220.6, 195.9, 217.9, 200.4, 215.1, 204.8, 212.1, 209.1, 209.0, 213.3, 205.8, 217.5, 202.4, 221.4, 199.0, 225.4, 195.2, 229.0, 191.5, 232.7, 187.6, 236.3, 183.6, 239.6, 179.5, 242.9, 175.3, 246.0, 171.1, 249.0, 166.7, 251.9, 162.3, 254.8, 157.8, 257.5, 153.3, 260.1, 148.8, 262.7, 144.1, 265.2, 139.5, 267.6, 134.7, 269.7, 129.9, 271.8, 125.0, 273.7, 119.8, 274.4, 114.7, 273.6, 109.8, 271.7, 105.0, 269.6, 100.3, 267.3, 95.6, 264.9, 91.1, 262.4, 86.5, 259.9, 81.9, 257.3, 77.4, 254.7, 73.0, 251.8, 68.7, 248.9, 64.4, 245.8, 60.2, 242.6, 56.1, 239.4, 52.1, 236.0, 48.3, 232.5, 44.5, 228.9, 40.8, 225.1, 37.3, 221.3, 34.0, 217.2, 30.8, 213.1, 27.7, 208.8, 24.8, 204.5, 22.0, 200.1, 19.5, 195.5, 17.0, 190.8, 14.8, 186.1, 12.7, 181.3, 10.7, 176.5, 9.1, 171.5, 7.6, 166.5, 6.4, 161.4, 5.3, 156.2, 4.5, 151.1, 4.1, 145.9, 3.9, 140.6, 3.7, 135.4, 3.7, 130.2, 3.8, 124.9, 4.0, 119.7, 4.0, 114.5, 4.0, 109.2, 4.0, 104.0, 3.8, 98.8, 3.8, 93.5, 3.8, 88.3, 4.0, 83.1, 3.9, 77.8, 3.8, 72.6, 3.7, 67.4, 3.8, 62.1, 3.7, 56.9, 3.7, 51.7, 3.7, 46.4, 3.8, 41.2, 3.7, 36.0, 4.9, 30.9, 8.3, 27.0, 12.9, 24.6, 17.8, 22.6, 22.7, 20.8, 27.6, 19.0, 32.5, 17.3, 37.5, 15.6, 42.5, 14.1, 47.6, 12.7, 52.6, 11.3, 57.7, 10.1, 62.8, 9.0, 67.9, 7.9, 73.1, 7.2, 78.3, 6.4, 83.5, 5.6, 88.6, 4.8, 93.9, 4.3, 99.1, 4.0, 104.3, 4.0, 109.5, 3.6, 114.8, 3.3],INN=[120.0, 18.0, 124.8, 18.0, 129.6, 18.1, 134.4, 18.4, 139.2, 19.0, 144.0, 19.8, 148.8, 20.5, 153.5, 21.2, 158.3, 22.0, 163.0, 22.9, 167.7, 24.0, 172.4, 25.2, 177.1, 26.3, 181.7, 27.5, 186.4, 28.8, 190.9, 30.2, 195.5, 31.8, 200.0, 33.5, 204.5, 35.1, 209.0, 36.9, 213.5, 38.7, 217.7, 41.1, 220.7, 44.8, 222.0, 49.4, 222.0, 54.2, 222.0, 59.0, 222.0, 63.9, 222.0, 68.7, 222.0, 73.5, 222.0, 78.3, 222.0, 83.1, 222.0, 88.0, 222.0, 92.8, 222.0, 97.6, 222.0, 102.4, 222.0, 107.2, 222.0, 112.1, 222.0, 116.9, 222.0, 121.7, 221.8, 126.5, 221.5, 131.3, 221.1, 136.1, 220.5, 140.9, 219.7, 145.7, 218.8, 150.4, 217.6, 155.1, 216.3, 159.7, 214.6, 164.2, 212.7, 168.6, 210.9, 173.1, 208.9, 177.5, 206.7, 181.7, 204.3, 185.9, 201.6, 190.0, 199.0, 194.0, 196.1, 197.9, 193.2, 201.7, 190.1, 205.4, 187.0, 209.0, 183.7, 212.6, 180.3, 216.0, 176.8, 219.4, 173.3, 222.6, 169.6, 225.7, 165.8, 228.7, 161.9, 231.5, 158.0, 234.3, 154.0, 237.0, 150.0, 239.7, 145.9, 242.3, 141.7, 244.6, 137.6, 247.1, 133.4, 249.5, 129.1, 251.7, 124.7, 253.7, 120.0, 254.5, 115.3, 253.6, 110.9, 251.6, 106.7, 249.3, 102.5, 246.9, 98.3, 244.6, 94.1, 242.2, 90.0, 239.8, 85.9, 237.1, 82.0, 234.4, 78.1, 231.5, 74.2, 228.6, 70.5, 225.6, 66.7, 222.6, 63.2, 219.3, 59.6, 216.0, 56.3, 212.6, 53.0, 209.1, 49.8, 205.5, 46.8, 201.7, 43.9, 197.9, 41.1, 193.9, 38.4, 189.9, 35.9, 185.8, 33.6, 181.6, 31.3, 177.4, 29.2, 173.0, 27.2, 168.6, 25.4, 164.2, 23.8, 159.6, 22.3, 155.0, 21.1, 150.4, 20.1, 145.7, 19.1, 140.9, 18.5, 136.2, 18.1, 131.4, 18.0, 126.6, 18.0, 121.7, 18.0, 116.9, 18.0, 112.1, 18.0, 107.3, 18.0, 102.5, 18.0, 97.6, 18.0, 92.8, 18.0, 88.0, 18.0, 83.2, 18.0, 78.4, 18.0, 73.5, 18.0, 68.7, 18.0, 63.9, 18.0, 59.1, 18.0, 54.3, 18.0, 49.4, 19.3, 44.8, 22.3, 41.1, 26.5, 38.7, 30.9, 36.9, 35.4, 35.2, 40.0, 33.6, 44.5, 32.0, 49.1, 30.4, 53.7, 29.0, 58.3, 27.6, 62.9, 26.3, 67.6, 25.0, 72.3, 23.9, 77.0, 22.9, 81.7, 22.0, 86.5, 21.3, 91.3, 20.6, 96.0, 19.9, 100.8, 19.2, 105.6, 18.5, 110.4, 18.2, 115.2, 18.0],SW=240,SH=281;
var GOLD=['#F5C542','#E4C06A','#fff3c4','#ffffff'];
function easter(y){var a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),dy=((h+l-7*m+114)%31)+1;return new Date(y,mo-1,dy);}
function addD(d,n){var x=new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);return x;}
function nthDow(y,mo,dow,n){var d=new Date(y,mo,1);while(d.getDay()!==dow)d.setDate(d.getDate()+1);d.setDate(d.getDate()+7*(n-1));return d;}
function md(m,d,y){return new Date(y,m-1,d);}
function inR(t,a,b){return t>=a&&t<=b;}
/* each effect: id,name,courses,test(date)->bool, look */
var E=[
{id:'aniversario',n:'Aniversário do aluno',c:'en,es',t:function(){return false;},shape:'rect',col:['#F5C542','#EC4654','#6FA8FF','#3DB37A','#fff'],mo:'burst',N:90,top:'balloons'},
{id:'ano-novo',n:'Ano Novo e Réveillon',c:'en,es',t:function(d){var y=d.getFullYear(),t=+d;return inR(t,+md(12,30,y),+md(12,31,y))||inR(t,+md(1,1,y),+md(1,2,y));},shape:'star',col:['#F5C542','#fff','#E4C06A','#6FA8FF'],mo:'burst',N:60,top:'year'},
{id:'reis-magos',n:'Dia de Reyes',c:'es',t:function(d){var y=d.getFullYear();return inR(+d,+md(1,4,y),+md(1,6,y));},shape:'star',col:['#F5C542','#E4C06A','#fff6cf'],mo:'float',N:26,top:'stars3'},
{id:'carnaval',n:'Carnaval',c:'en,es',t:function(d){var e=easter(d.getFullYear());return inR(+d,+addD(e,-51),+addD(e,-47));},shape:'rect',col:['#F5C542','#EC4654','#6FA8FF','#3DB37A','#B26BFF'],mo:'fall',N:70,top:null},
{id:'valentine',n:"Valentine's Day",c:'en',t:function(d){var y=d.getFullYear();return inR(+d,+md(2,12,y),+md(2,14,y));},shape:'heart',col:['#EC4654','#ff8fa3','#fff'],mo:'rise',N:30,top:null},
{id:'st-patrick',n:"St Patrick's Day",c:'en',t:function(d){var y=d.getFullYear();return inR(+d,+md(3,15,y),+md(3,17,y));},shape:'clover',col:['#3DB37A','#7be0a4','#F5C542'],mo:'fall',N:30,top:null},
{id:'pascoa',n:'Páscoa',c:'en,es',t:function(d){var e=easter(d.getFullYear());return inR(+d,+addD(e,-3),+addD(e,1));},shape:'egg',col:['#ffb3c6','#b8e0ff','#fff3a3','#c8f0c8','#e0c3ff'],mo:'float',N:22,top:null},
{id:'idioma',n:'Dia do Idioma',c:'en,es',t:function(d){var y=d.getFullYear();return inR(+d,+md(4,21,y),+md(4,23,y));},shape:'char',col:['#F5C542','#fff','#6FA8FF'],mo:'rise',N:34,top:null},
{id:'maes',n:'Dia das Mães',c:'en,es',t:function(d){var s=nthDow(d.getFullYear(),4,0,2);return inR(+d,+addD(s,-3),+s);},shape:'petal',col:['#ff8fa3','#ffc2d1','#fff','#F5C542'],mo:'rise',N:30,top:null},
{id:'namorados',n:'Dia dos Namorados',c:'en,es',t:function(d){var y=d.getFullYear();return inR(+d,+md(6,10,y),+md(6,12,y));},shape:'heart',col:['#EC4654','#ff8fa3','#F5C542'],mo:'rise',N:30,top:null},
{id:'junina',n:'Festa Junina',c:'en,es',t:function(d){var y=d.getFullYear();return inR(+d,+md(6,13,y),+md(6,24,y));},shape:'spark',col:['#ff9f1c','#F5C542','#EC4654','#fff3c4'],mo:'rise',N:40,top:'bunting'},
{id:'july4',n:'4th of July',c:'en',t:function(d){var y=d.getFullYear();return inR(+d,+md(7,2,y),+md(7,4,y));},shape:'star',col:['#EC4654','#fff','#6FA8FF'],mo:'burst',N:60,top:'flagUS'},
{id:'pais',n:'Dia dos Pais',c:'en,es',t:function(d){var s=nthDow(d.getFullYear(),7,0,2);return inR(+d,+addD(s,-3),+s);},shape:'star',col:['#6FA8FF','#B8C2D6','#fff'],mo:'float',N:24,top:null},
{id:'independencia',n:'Independência do Brasil',c:'en,es',t:function(d){var y=d.getFullYear();return inR(+d,+md(9,5,y),+md(9,7,y));},shape:'rect',col:['#3DB37A','#F5C542','#fff','#6FA8FF'],mo:'fall',N:46,top:'flagBR'},
{id:'hispanidad',n:'Día de la Hispanidad',c:'es',t:function(d){var y=d.getFullYear();return inR(+d,+md(10,10,y),+md(10,12,y));},shape:'petal',col:['#EC4654','#F5C542','#ff9f1c'],mo:'burst',N:50,top:null},
{id:'criancas',n:'Dia das Crianças',c:'en',t:function(d){var y=d.getFullYear();return inR(+d,+md(10,10,y),+md(10,12,y));},shape:'balloon',col:['#EC4654','#F5C542','#6FA8FF','#3DB37A','#B26BFF'],mo:'rise',N:16,top:null},
{id:'professor',n:'Dia do Professor',c:'en,es',t:function(d){var y=d.getFullYear();return inR(+d,+md(10,13,y),+md(10,15,y));},shape:'pencil',col:['#F5C542','#EC4654','#6FA8FF','#3DB37A'],mo:'fall',N:20,top:null},
{id:'halloween',n:'Halloween',c:'en',t:function(d){var y=d.getFullYear();return inR(+d,+md(10,29,y),+md(10,31,y));},shape:'bat',col:['#ff9f1c','#B26BFF','#1b1030'],mo:'float',N:16,top:null},
{id:'muertos',n:'Día de Muertos',c:'es',t:function(d){var y=d.getFullYear();return inR(+d,+md(10,31,y),+md(11,2,y));},shape:'petal',col:['#ff9f1c','#F5C542','#ffb347'],mo:'fall',N:40,top:null},
{id:'proclamacao',n:'Proclamação da República',c:'en,es',t:function(d){var y=d.getFullYear();return inR(+d,+md(11,13,y),+md(11,15,y));},shape:'diamond',col:['#3DB37A','#F5C542','#fff'],mo:'rise',N:26,top:null},
{id:'thanksgiving',n:'Thanksgiving',c:'en',t:function(d){var s=nthDow(d.getFullYear(),10,4,4);return inR(+d,+addD(s,-2),+s);},shape:'leaf',col:['#d9631e','#b3341f','#F5C542','#8c5a1c'],mo:'fall',N:30,top:null},
{id:'natal',n:'Natal',c:'en,es',t:function(d){var y=d.getFullYear();return inR(+d,+md(12,18,y),+md(12,26,y));},shape:'snow',col:['#fff','#dfefff','#F5C542','#EC4654'],mo:'fall',N:60,top:null}
];
var byId={};E.forEach(function(e){byId[e.id]=e;});
function pick(date,course,bd){
  date=date||new Date();
  if(bd&&bd===(('0'+(date.getMonth()+1)).slice(-2)+'-'+('0'+date.getDate()).slice(-2)))return 'aniversario';
  for(var i=1;i<E.length;i++){var e=E[i];if(e.c.split(',').indexOf(course||'en')>-1&&e.t(date))return e.id;}
  return null;
}
/* shapes */
function shape(x,s,sz,col,ch){
  x.fillStyle=col;x.strokeStyle=col;
  switch(s){
  case 'heart':x.beginPath();x.moveTo(0,sz*.35);x.bezierCurveTo(-sz,-sz*.3,-sz*.5,-sz*.9,0,-sz*.35);x.bezierCurveTo(sz*.5,-sz*.9,sz,-sz*.3,0,sz*.35+sz*.5);x.bezierCurveTo(-sz,-sz*.3,0,0,0,0);x.fill();break;
  case 'star':x.beginPath();for(var i=0;i<10;i++){var r=i%2?sz*.42:sz,a=i*Math.PI/5-Math.PI/2;x.lineTo(Math.cos(a)*r,Math.sin(a)*r);}x.closePath();x.fill();break;
  case 'rect':x.fillRect(-sz*.6,-sz*.25,sz*1.2,sz*.5);break;
  case 'diamond':x.beginPath();x.moveTo(0,-sz);x.lineTo(sz*.7,0);x.lineTo(0,sz);x.lineTo(-sz*.7,0);x.closePath();x.fill();break;
  case 'petal':x.beginPath();x.ellipse(0,0,sz*.45,sz,0,0,7);x.fill();break;
  case 'leaf':x.beginPath();x.moveTo(0,-sz);x.quadraticCurveTo(sz,-sz*.2,0,sz);x.quadraticCurveTo(-sz,-sz*.2,0,-sz);x.fill();x.strokeStyle='rgba(0,0,0,.25)';x.beginPath();x.moveTo(0,-sz);x.lineTo(0,sz);x.stroke();break;
  case 'egg':x.beginPath();x.ellipse(0,0,sz*.65,sz*.9,0,0,7);x.fill();x.fillStyle='rgba(255,255,255,.7)';x.fillRect(-sz*.65,-sz*.1,sz*1.3,sz*.2);break;
  case 'clover':for(var j=0;j<4;j++){x.save();x.rotate(j*Math.PI/2);x.beginPath();x.arc(sz*.35,0,sz*.38,0,7);x.fill();x.restore();}x.lineWidth=1.5;x.beginPath();x.moveTo(0,0);x.lineTo(sz*.2,sz);x.stroke();break;
  case 'snow':x.lineWidth=1.4;x.lineCap='round';for(var k=0;k<3;k++){x.save();x.rotate(k*Math.PI/3);x.beginPath();x.moveTo(-sz,0);x.lineTo(sz,0);x.stroke();x.restore();}break;
  case 'balloon':x.beginPath();x.ellipse(0,0,sz*.7,sz*.9,0,0,7);x.fill();x.lineWidth=1;x.strokeStyle='rgba(255,255,255,.5)';x.beginPath();x.moveTo(0,sz*.9);x.quadraticCurveTo(sz*.3,sz*1.4,0,sz*2);x.stroke();break;
  case 'bat':x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(-sz*.5,-sz*.9,-sz*1.3,-sz*.3);x.quadraticCurveTo(-sz*.9,-sz*.1,-sz*.8,sz*.3);x.quadraticCurveTo(-sz*.4,sz*.05,0,sz*.5);x.quadraticCurveTo(sz*.4,sz*.05,sz*.8,sz*.3);x.quadraticCurveTo(sz*.9,-sz*.1,sz*1.3,-sz*.3);x.quadraticCurveTo(sz*.5,-sz*.9,0,0);x.fill();break;
  case 'pencil':x.fillRect(-sz*.18,-sz,sz*.36,sz*1.5);x.fillStyle='#f3d9a8';x.beginPath();x.moveTo(-sz*.18,sz*.5);x.lineTo(sz*.18,sz*.5);x.lineTo(0,sz);x.closePath();x.fill();break;
  case 'spark':x.beginPath();x.arc(0,0,sz*.45,0,7);x.fill();break;
  case 'char':x.font='700 '+(sz*2)+'px Montserrat,Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(ch||'A',0,0);break;
  default:x.beginPath();x.arc(0,0,sz*.5,0,7);x.fill();}
}
var CH={en:'ABCabcSpeakEnglish',es:'ÁÑÉabcHablaEspañol¿?¡'};
function flagBR(){var c=D.createElement('canvas');c.width=84;c.height=58;var x=c.getContext('2d');x.fillStyle='#009C3B';x.fillRect(0,0,84,58);x.fillStyle='#FFDF00';x.beginPath();x.moveTo(42,6);x.lineTo(77,29);x.lineTo(42,52);x.lineTo(7,29);x.closePath();x.fill();x.fillStyle='#002776';x.beginPath();x.arc(42,29,13,0,7);x.fill();x.strokeStyle='#fff';x.lineWidth=2.4;x.beginPath();x.arc(42,52,34,Math.PI*1.27,Math.PI*1.73);x.stroke();return c;}
function flagUS(){var c=D.createElement('canvas');c.width=84;c.height=58;var x=c.getContext('2d');for(var i=0;i<13;i++){x.fillStyle=i%2?'#fff':'#B22234';x.fillRect(0,i*58/13,84,58/13+.5);}x.fillStyle='#3C3B6E';x.fillRect(0,0,38,31);x.fillStyle='#fff';for(var r=0;r<4;r++)for(var q=0;q<5;q++){x.beginPath();x.arc(5+q*7.3,5+r*7.3,1.2,0,7);x.fill();}return c;}
function ease(t){return t<0?0:t>1?1:t*t*(3-2*t);}
function mount(host,o){
  o=o||{};var ef=o.effect?byId[o.effect]:null,course=o.course||'en';
  var W0=300,H0=380,dpr=Math.min(W.devicePixelRatio||1,2);
  var cv=D.createElement('canvas');cv.width=W0*dpr;cv.height=H0*dpr;cv.className='bl-ld-cv';cv.style.cssText='width:min(78vw,'+W0+'px);height:auto;aspect-ratio:'+W0+'/'+H0+';display:block;margin:0 auto';cv.setAttribute('aria-hidden','true');
  host.appendChild(cv);var x=cv.getContext('2d');x.scale(dpr,dpr);
  var img=new Image();img.src=(W.BL_BASE||'')+'img/britland-shield.png';
  var SC=.66,ox=(W0-SW*SC)/2,oy=130;
  function P(a,i){return [ox+a[i*2]*SC,oy+a[i*2+1]*SC];}
  var nO=OUT.length/2,nI=INN.length/2;
  var reduce=false;try{reduce=W.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
  var tgt=0,cur=0,done=false,fin=null,sparks=[],ps=[],t0=performance.now(),raf=0,last=t0,flash=0,finCb=null,dead=false;
  var fl=ef&&ef.top==='flagBR'?flagBR():ef&&ef.top==='flagUS'?flagUS():null;
  function mk(init){var s=ef.shape,sz=4+Math.random()*5,p={x:Math.random()*W0,y:0,vx:0,vy:0,r:Math.random()*6.3,vr:(Math.random()-.5)*.08,sz:sz,c:ef.col[Math.floor(Math.random()*ef.col.length)],ph:Math.random()*6.3,l:1,ch:CH[course][Math.floor(Math.random()*CH[course].length)]};
    if(s==='balloon'){p.sz=8+Math.random()*4;}
    if(ef.mo==='fall'){p.y=init?Math.random()*H0:-10;p.vy=.5+Math.random()*1.1;}
    else if(ef.mo==='rise'){p.y=init?Math.random()*H0:H0+10;p.vy=-(.4+Math.random()*1);}
    else if(ef.mo==='float'){p.y=Math.random()*H0;p.vx=(Math.random()-.5)*.5;p.vy=(Math.random()-.5)*.4;}
    else{p.l=0;}
    return p;}
  if(ef&&ef.mo!=='burst'){for(var i=0;i<ef.N;i++)ps.push(mk(true));}
  var nextBurst=0;
  function burst(){var bx=40+Math.random()*(W0-80),by=40+Math.random()*130,cs=ef.col;for(var i=0;i<ef.N*.6;i++){var a=Math.PI*2*i/(ef.N*.6)+Math.random()*.2,v=1.4+Math.random()*2.4;ps.push({x:bx,y:by,vx:Math.cos(a)*v,vy:Math.sin(a)*v,r:Math.random()*6.3,vr:.05,sz:2+Math.random()*2.5,c:cs[i%cs.length],l:1,b:1,ph:0,ch:'A'});}}
  function spark(px,py,n){for(var i=0;i<n;i++){var a=Math.random()*6.3,v=.4+Math.random()*1.6;sparks.push({x:px,y:py,vx:Math.cos(a)*v,vy:Math.sin(a)*v-.4,l:1,c:GOLD[Math.floor(Math.random()*GOLD.length)],s:1+Math.random()*1.8});}}
  function path(arr,n,frac,st){x.beginPath();var m=Math.max(2,Math.floor(n*frac));for(var i=0;i<=m;i++){var q=P(arr,i%n),pt=i===m&&frac<1?lerpPt(arr,n,n*frac):q;if(i===0)x.moveTo(q[0],q[1]);else x.lineTo(pt[0],pt[1]);}x.stroke();}
  function lerpPt(arr,n,f){var i=Math.floor(f),u=f-i,a=P(arr,i%n),b=P(arr,(i+1)%n);return [a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u];}
  function topper(t,now){
    var cx=W0/2;
    if(ef.top==='year'){var y=(o.year||new Date().getFullYear());if(new Date().getMonth()===11&&!o.year)y++;x.font='700 46px "Noto Serif",Georgia,serif';x.textAlign='center';x.fillStyle='#F5C542';x.shadowColor='rgba(245,197,66,.7)';x.shadowBlur=14;x.fillText(String(y),cx,96+Math.sin(now/600)*2);x.shadowBlur=0;}
    else if(fl){var fw=84,fh=58,fx=cx-fw/2,fy=34;x.save();x.shadowColor='rgba(0,0,0,.4)';x.shadowBlur=6;for(var i=0;i<fw;i+=2){var dy=Math.sin(now/180+i/9)*4*(i/fw+.2);x.drawImage(fl,i,0,2,fh,fx+i,fy+dy,2,fh);}x.restore();x.fillStyle='#d8d8d8';x.fillRect(fx-3,fy-4,3,fh+34);}
    else if(ef.top==='stars3'){for(var s=-1;s<=1;s++){x.save();x.translate(cx+s*46,92-(s===0?8:0)+Math.sin(now/500+s)*2);x.shadowColor='#F5C542';x.shadowBlur=12;shape(x,'star',s===0?14:10,'#F5C542');x.restore();}}
    else if(ef.top==='bunting'){var cs=['#EC4654','#F5C542','#3DB37A','#6FA8FF'];x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=1;x.beginPath();x.moveTo(20,50);x.quadraticCurveTo(cx,90,W0-20,50);x.stroke();for(var b=0;b<9;b++){var u=(b+.5)/9,px=20+u*(W0-40),py=50+4*u*(1-u)*40*1.0;x.fillStyle=cs[b%4];x.beginPath();x.moveTo(px-9,py);x.lineTo(px+9,py);x.lineTo(px,py+20+Math.sin(now/300+b)*2);x.closePath();x.fill();}}
    else if(ef.top==='balloons'){var bc=['#EC4654','#F5C542','#6FA8FF'];for(var k=0;k<3;k++){x.save();x.translate(cx+(k-1)*34,70+Math.sin(now/500+k*2)*5);shape(x,'balloon',14,bc[k]);x.restore();}}
  }
  function frame(now){
    if(dead)return;raf=requestAnimationFrame(frame);var dt=Math.min(now-last,50)/16.67;last=now;
    cur+=(tgt-cur)*Math.min(1,.06*dt);if(tgt>=1&&cur>.995)cur=1;
    x.clearRect(0,0,W0,H0);
    if(ef){
      if(ef.mo==='burst'){if(now>=nextBurst&&ps.length<ef.N*3){burst();nextBurst=now+900+Math.random()*700;}}
      ps.forEach(function(p){
        if(p.b){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.985;p.vy=p.vy*.985+.04*dt;p.l-=.012*dt;}
        else{p.ph+=.03*dt;p.r+=p.vr*dt;p.x+=(p.vx+(ef.mo==='float'?Math.sin(p.ph)*.4:Math.sin(p.ph)*.35))*dt;p.y+=p.vy*dt;if(ef.shape==='spark'){p.l-=.006*dt;}
          if(ef.mo==='fall'&&p.y>H0+12){Object.assign(p,mk(false));}
          if(ef.mo==='rise'&&(p.y<-14||p.l<=0)){Object.assign(p,mk(false));}
          if(ef.mo==='float'){if(p.x<-10)p.x=W0+10;if(p.x>W0+10)p.x=-10;if(p.y<-10)p.y=H0+10;if(p.y>H0+10)p.y=-10;}}
        if(p.l>0){x.save();x.globalAlpha=Math.max(0,Math.min(1,p.l))*(ef.mo==='float'?.85:1);x.translate(p.x,p.y);x.rotate(ef.shape==='balloon'||ef.shape==='bat'?Math.sin(p.ph)*.25:p.r);shape(x,ef.shape,p.sz,p.c,p.ch);x.restore();}
      });
      ps=ps.filter(function(p){return !p.b||p.l>0;});
    }
    /* shield */
    var pr=reduce?tgt:cur,fr=Math.min(1,pr/.9);
    x.save();x.lineJoin='round';x.lineCap='round';
    x.shadowColor='rgba(245,197,66,.85)';x.shadowBlur=10+flash*18;x.strokeStyle='#F5C542';x.lineWidth=2.6;
    if(fr>0){path(OUT,nO,Math.min(1,fr),0);}
    var f2=Math.max(0,Math.min(1,(fr-.15)/.85));x.lineWidth=1.6;x.strokeStyle='#E4C06A';if(f2>0)path(INN,nI,f2,0);
    x.restore();
    if(fr<1&&fr>0){var tp=lerpPt(OUT,nO,nO*fr);spark(tp[0],tp[1],reduce?0:3);if(!reduce){var tp2=lerpPt(INN,nI,nI*f2);if(f2>0)spark(tp2[0],tp2[1],1);}}
    var ia=ease((pr-.55)/.45);if(img.complete&&ia>0){x.save();x.globalAlpha=ia;x.drawImage(img,ox,oy,SW*SC,SH*SC);x.restore();}
    if(pr>=1&&!done){done=true;flash=1;for(var q=0;q<26;q++)spark(ox+Math.random()*SW*SC,oy+Math.random()*SH*SC*.9,1);if(finCb)setTimeout(finCb,reduce?0:450);}
    if(flash>0){flash=Math.max(0,flash-.02*dt);}
    if(done&&!reduce){var gl=.25+.2*Math.sin(now/420);x.save();x.globalAlpha=gl*.0;x.restore();}
    sparks.forEach(function(s){s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=.02*dt;s.l-=.03*dt;if(s.l>0){x.globalAlpha=Math.max(0,s.l);x.fillStyle=s.c;x.beginPath();x.arc(s.x,s.y,s.s,0,7);x.fill();}});x.globalAlpha=1;
    sparks=sparks.filter(function(s){return s.l>0;});
    if(ef&&ef.top)topper(0,now);
  }
  raf=requestAnimationFrame(frame);
  return {progress:function(p){tgt=Math.max(tgt,Math.min(1,p));},reset:function(){tgt=0;cur=0;done=false;sparks=[];},finish:function(cb){finCb=cb;tgt=1;},destroy:function(){dead=true;cancelAnimationFrame(raf);if(cv.parentNode)cv.parentNode.removeChild(cv);},canvas:cv};
}
W.BLLoad={mount:mount,pick:pick,EFFECTS:E,easter:easter};
})(window,document);
