/* Britland loading animation: the whole logo is drawn in gold with sparks, following the real progress,
   then the colours come in. Plus dated effects (22).
   API: BLLoad.mount(host,{effect:id|null,course:'en'|'es',year:n}) -> {progress(p),finish(cb),reset(),destroy()}
        BLLoad.pick(date,course,birthdayMD,schoolMD) -> effect id | null ;  BLLoad.EFFECTS */
(function(W,D){
var PENS=[[[102,17,101,18,84,19,83,20,77,20,43,28,18,37,17,39,17,144,18,145,18,152,21,166,27,182,33,194,45,211,64,230,85,245,111,259,122,262,151,248,178,229,200,206,208,194,214,182,221,162,223,152,223,144,224,143,224,39,221,36,208,32,205,30,170,21,151,19,150,18,140,18,139,17,103,17],[99,28,104,27,106,30,106,42,104,45,99,48,98,47,98,29],[124,42,125,45,124,46,117,45,106,49,105,53,107,54,99,61,96,67,94,75,99,76,97,85,99,100,102,100,105,91,108,97,113,102,121,106,125,111,128,111,127,105,123,99,125,98,135,109,138,117,138,124,141,124,143,118,143,108,144,107,146,111,146,117,149,117,150,101,147,93,144,91,142,94,132,84,130,80,131,79,134,82,138,82,140,78,142,87,146,88,150,91,154,91,156,85,155,82,153,81,158,80,158,75,156,75,154,73,158,72,158,69,151,64,148,59,144,56,144,49,142,46,138,47,134,44,125,42],[28,58,30,57,55,76,53,78,28,59],[136,62,136,65,145,68,146,65,143,62,137,62],[80,84,81,83,84,87,84,93,80,99,79,98,81,94,81,86,80,85],[177,85,178,84,180,87,185,88,183,91,178,92,181,97,179,99,174,100,163,116,162,114,159,114,154,118,153,117,155,112,155,107,170,96,177,86],[104,100,100,110,95,117,89,121,89,124,100,125,111,131,115,131,116,127,119,136,122,136,135,127,133,114,130,114,127,120,124,113,121,110,112,105,107,100,105,100],[57,108,50,115,47,120,46,131,47,131,47,125,49,120,59,109,58,108],[148,130,134,134,127,138,123,142,123,198,126,198,131,194,143,189,161,187,161,132,160,130,149,130],[27,135,28,134,45,134,48,141,47,142,28,142,27,141,27,136],[167,141,168,140,170,142,170,198,169,199,159,198,158,197,141,198,140,197,144,195,166,194,167,192,167,142],[180,145,181,144,184,145,207,162,209,165,207,166,181,146],[46,172,47,171,48,174,46,177,45,183,41,186,37,179,45,173],[140,208,141,207,143,208,143,240,136,244,135,243,135,211,139,208]],[[102,19,103,18,138,18,139,19,149,19,150,20,169,22,204,31,207,33,220,37,223,40,223,142,222,143,222,151,220,161,214,178,207,192,199,204,175,229,149,247,121,261,99,251,75,236,66,229,46,209,34,192,26,176,20,157,19,144,18,143,18,40,21,37,51,27,78,21,101,19],[110,27,111,26,132,26,134,28,134,38,133,39,126,37,116,38,114,41,108,43,107,42,107,28,109,27],[128,45,130,44,134,46,140,52,138,53,138,56,145,59,148,62,148,64,156,70,155,71,151,70,151,74,154,77,149,81,144,81,143,85,142,84,142,79,143,78,142,74,138,77,136,81,130,74,130,68,127,68,126,70,125,69,126,65,129,62,128,58,131,57,131,53,125,50,120,50,115,53,114,61,116,65,114,68,114,73,118,74,118,78,120,83,121,83,122,80,126,86,129,86,130,84,140,94,139,96,138,95,135,96,135,98,142,109,142,117,140,121,136,107,115,86,112,80,112,75,109,75,109,83,111,89,124,104,123,105,115,101,109,95,106,90,106,83,105,83,104,87,103,84,102,84,103,93,101,97,99,92,100,77,104,70,109,66,108,63,105,63,98,70,97,68,100,63,106,57,113,54,112,51,109,50,118,46,129,48,129,46],[117,54,118,53,119,54,117,63,115,60,116,55],[70,78,66,80,63,79,58,80,56,82,56,87,52,93,52,97,59,96,63,93,66,94,68,91,69,85,71,83,76,83,80,88,80,93,68,106,58,113,52,121,50,128,52,139,58,144,62,144,62,138,57,133,56,130,58,123,65,115,75,108,81,102,85,94,84,83,80,79,71,78],[152,84,153,83,155,86,152,90,145,86,151,84],[27,97,28,96,42,96,45,100,48,101,60,101,65,99,67,100,62,104,28,104,27,103,27,98],[105,103,106,102,110,106,119,111,123,115,125,121,128,122,131,117,133,119,134,125,131,128,120,134,115,121,112,121,112,124,114,127,113,130,107,126,93,123,92,122,96,119,101,112,104,104],[59,115,60,114,62,115,56,123,55,131,56,135,61,140,60,143,53,137,51,131,52,125,58,116],[148,132,149,131,158,131,160,133,160,185,158,187,142,188,133,191,125,196,124,195,124,144,132,137,138,134,147,132],[70,139,69,140,69,198,70,200,95,198,110,201,111,200,110,198,93,193,77,193,75,191,75,139,71,139],[185,135,186,134,213,134,214,135,214,141,213,142,185,142,184,141,185,136],[59,164,54,167,52,178,54,179,53,183,54,193,56,194,61,194,62,193,62,186,61,185,62,184,62,164,60,164],[44,186,45,185,48,186,43,190,42,189,43,187]],[[110,25,109,26,88,27,87,28,81,28,65,31,42,37,33,41,30,41,29,43,26,43,26,95,27,96,26,97,26,149,29,163,31,165,31,169,34,177,36,178,36,182,39,187,41,188,41,190,43,191,43,194,56,211,75,228,94,241,97,241,100,244,105,245,106,247,116,252,121,253,133,248,136,245,141,244,144,241,148,240,171,224,191,204,198,194,199,190,201,189,205,181,205,178,207,177,209,168,212,163,215,149,215,43,202,38,194,37,193,35,167,29,155,28,154,27,134,26,133,25,111,25],[135,28,136,27,141,27,143,29,143,40,142,41,135,37,135,29],[211,44,212,43,214,45,214,55,207,62,189,75,181,74,176,76,172,80,168,88,158,97,156,96,160,91,161,82,166,77,210,44],[122,59,124,58,127,60,124,66,124,73,127,73,128,71,130,76,129,78,126,77,125,81,123,76,121,76,120,78,119,77,120,67,117,66,118,62,120,64,123,64,122,60],[70,80,71,79,76,79,79,81,78,82,74,81,69,82,68,87,64,92,61,92,59,94,55,95,54,94,58,88,57,84,60,81,69,80],[181,79,176,83,174,88,168,95,154,105,152,120,155,120,159,117,162,120,177,100,185,99,185,96,180,93,187,90,190,90,190,87,185,85,186,83,189,82,189,79,184,80,182,79],[78,99,79,98,80,100,72,107,71,106,77,100],[145,97,146,96,149,102,149,112,148,113,146,107,141,99,145,98],[81,130,80,131,80,187,98,189,110,194,115,198,118,198,118,143,117,141,105,133,92,130,82,130],[171,127,168,128,168,132,175,133,178,136,181,136,180,130,178,128,172,127],[71,141,72,140,74,141,74,193,75,194,92,194,97,196,96,197,84,197,72,199,70,197,70,142],[186,144,187,143,213,143,214,148,211,161,210,162,187,145],[59,167,60,166,61,167,61,183,60,184,61,191,59,193,57,193,55,191,54,187,55,177,53,176,55,169,58,167],[98,208,100,207,105,210,105,243,104,244,97,240,98,239,98,209]],[[88,29,89,28,95,28,97,30,97,50,98,51,100,51,102,48,106,46,107,43,110,44,113,42,116,42,118,39,123,38,132,40,134,39,141,43,144,43,144,29,145,28,166,30,188,35,192,37,158,63,158,66,160,67,164,67,200,39,208,42,205,46,165,76,163,75,163,69,162,69,162,75,164,76,160,80,158,91,153,95,153,100,157,100,169,90,173,82,178,77,182,75,191,76,213,59,214,60,214,94,213,95,189,95,188,101,178,103,172,113,165,120,165,124,171,124,172,123,177,124,185,131,184,127,182,125,175,122,170,123,167,122,177,109,178,105,179,106,212,105,214,107,214,131,212,133,184,133,184,137,179,143,179,147,181,149,179,150,179,157,180,157,180,150,181,149,205,166,208,169,207,173,204,176,182,159,179,159,179,176,197,190,197,192,190,202,169,223,146,239,144,238,144,206,134,208,134,244,131,247,123,251,118,251,106,244,107,243,106,241,106,236,107,235,106,233,106,212,107,210,105,207,97,206,97,238,95,239,81,230,65,217,51,202,44,192,49,188,49,184,47,184,46,181,49,175,48,171,50,169,50,166,59,161,60,148,57,147,51,148,32,163,30,161,27,148,28,143,49,143,47,133,29,133,27,131,27,107,29,105,64,105,73,98,72,96,73,94,74,95,76,94,76,89,72,88,71,91,72,94,71,95,68,95,63,99,59,100,49,100,44,95,28,95,27,94,27,63,28,62,51,79,55,79,57,78,57,76,55,73,27,52,27,45,29,44,69,74,76,74,82,77,86,81,87,85,89,87,90,90,89,93,90,93,90,91,93,90,93,84,90,82,90,75,91,74,90,70,48,38,50,36,53,36,57,34,61,34,76,30,87,29],[42,39,43,38,46,39,85,68,90,73,89,74,89,80,88,81,84,76,80,74,71,73,31,43,41,39],[193,39,194,38,197,39,162,66,160,64,192,40],[120,52,124,51,127,53,126,54,119,54,118,53,119,52],[59,75,59,76,67,76,67,75,60,75],[88,95,83,104,62,122,60,126,61,133,69,132,72,129,74,124,81,123,89,118,94,113,96,108,93,108,94,110,87,117,81,121,72,123,72,126,66,132,63,132,61,130,61,127,70,117,81,109,83,104,84,105,94,105,95,96,94,95,89,95],[89,97,92,96,94,98,94,101,92,104,87,104,86,103,89,98],[190,97,191,96,213,96,214,97,214,103,213,104,190,104,189,103,190,98],[82,132,83,131,97,132,107,136,116,143,117,145,117,195,116,196,108,191,99,188,83,187,81,185,81,133],[171,129,174,128,179,132,178,133,172,132,169,130,170,129],[166,139,166,191,164,193,143,194,131,198,130,200,135,201,146,198,157,198,158,199,171,200,171,140,167,139],[54,149,56,148,59,150,58,159,56,161,50,163,49,167,37,177,33,171,32,166,53,149],[180,162,181,161,204,179,199,189,180,174,180,163],[109,209,110,211,117,214,124,214,132,210,132,209,130,209,122,213,119,213,110,209]]],OUT=[120.0,3.0,125.2,3.1,130.5,3.5,135.7,3.8,140.9,4.0,146.1,4.3,151.4,4.8,156.5,5.6,161.7,6.3,166.9,7.1,172.1,7.9,177.2,8.9,182.3,10.1,187.4,11.4,192.4,12.7,197.5,13.9,202.5,15.4,207.5,17.1,212.4,18.9,217.3,20.7,222.2,22.6,227.1,24.6,231.6,27.1,234.9,31.1,236.0,36.2,236.0,41.4,236.0,46.7,236.0,51.9,236.0,57.2,236.0,62.4,236.0,67.6,236.0,72.9,236.0,78.1,236.0,83.3,236.0,88.6,236.0,93.8,236.0,99.1,236.0,104.3,236.0,109.5,236.0,114.8,236.0,120.0,236.0,125.2,236.0,130.5,236.0,135.7,235.9,140.9,235.7,146.2,235.2,151.4,234.5,156.6,233.3,161.7,232.3,166.8,230.9,171.8,229.2,176.8,227.2,181.6,225.1,186.5,223.0,191.2,220.6,195.9,217.9,200.4,215.1,204.8,212.1,209.1,209.0,213.3,205.8,217.5,202.4,221.4,199.0,225.4,195.2,229.0,191.5,232.7,187.6,236.3,183.6,239.6,179.5,242.9,175.3,246.0,171.1,249.0,166.7,251.9,162.3,254.8,157.8,257.5,153.3,260.1,148.8,262.7,144.1,265.2,139.5,267.6,134.7,269.7,129.9,271.8,125.0,273.7,119.8,274.4,114.7,273.6,109.8,271.7,105.0,269.6,100.3,267.3,95.6,264.9,91.1,262.4,86.5,259.9,81.9,257.3,77.4,254.7,73.0,251.8,68.7,248.9,64.4,245.8,60.2,242.6,56.1,239.4,52.1,236.0,48.3,232.5,44.5,228.9,40.8,225.1,37.3,221.3,34.0,217.2,30.8,213.1,27.7,208.8,24.8,204.5,22.0,200.1,19.5,195.5,17.0,190.8,14.8,186.1,12.7,181.3,10.7,176.5,9.1,171.5,7.6,166.5,6.4,161.4,5.3,156.2,4.5,151.1,4.1,145.9,3.9,140.6,3.7,135.4,3.7,130.2,3.8,124.9,4.0,119.7,4.0,114.5,4.0,109.2,4.0,104.0,3.8,98.8,3.8,93.5,3.8,88.3,4.0,83.1,3.9,77.8,3.8,72.6,3.7,67.4,3.8,62.1,3.7,56.9,3.7,51.7,3.7,46.4,3.8,41.2,3.7,36.0,4.9,30.9,8.3,27.0,12.9,24.6,17.8,22.6,22.7,20.8,27.6,19.0,32.5,17.3,37.5,15.6,42.5,14.1,47.6,12.7,52.6,11.3,57.7,10.1,62.8,9.0,67.9,7.9,73.1,7.2,78.3,6.4,83.5,5.6,88.6,4.8,93.9,4.3,99.1,4.0,104.3,4.0,109.5,3.6,114.8,3.3],SW=240,SH=281;
var GOLD=['#F5C542','#E4C06A','#fff3c4','#ffffff'];
function easter(y){var a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),dy=((h+l-7*m+114)%31)+1;return new Date(y,mo-1,dy);}
function addD(d,n){return new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);}
function nthDow(y,mo,dow,n){var d=new Date(y,mo,1);while(d.getDay()!==dow)d.setDate(d.getDate()+1);d.setDate(d.getDate()+7*(n-1));return d;}
function md(m,d,y){return new Date(y,m-1,d);}
function inR(t,a,b){return t>=a&&t<=b;}
function R(m1,d1,m2,d2){return function(d){var y=d.getFullYear();return inR(+d,+md(m1,d1,y),+md(m2,d2,y));};}
var never=function(){return false;};
/* order matters: first match wins. Courses: en, es */
var E=[
{id:'aniversario-aluno',n:'Aniversário do aluno',c:'en,es',t:never,mo:'rise',shape:'balloon',col:['#EC4654','#F5C542','#6FA8FF','#3DB37A'],N:6,corner:1,top:'star'},
{id:'aniversario-escola',n:'Aniversário da escola',c:'en,es',t:never,mo:'none',N:0,ring:1,top:'star'},
{id:'ano-novo',n:'Ano Novo',c:'en,es',t:function(d){var y=d.getFullYear(),t=+d;return inR(t,+md(12,30,y),+md(12,31,y))||inR(t,+md(1,1,y),+md(1,2,y));},mo:'float',shape:'star',col:['#F5C542','#fff'],N:6,tw:1,top:'year',fw:1},
{id:'reis-magos',n:'Reyes Magos',c:'es',t:R(1,4,1,6),mo:'float',shape:'star',col:['#F5C542','#E4C06A','#fff6cf'],N:22,tw:1,shoot:1},
{id:'carnaval',n:'Carnaval',c:'en,es',t:function(d){var e=easter(d.getFullYear());return inR(+d,+addD(e,-51),+addD(e,-47));},mo:'fall',shape:'rect',col:['#F5C542','#EC4654','#6FA8FF','#3DB37A','#B26BFF','#ff9f1c'],N:60},
{id:'st-patrick',n:"St Patrick's Day",c:'en',t:R(3,15,3,17),mo:'fall',shape:'clover',col:['#3DB37A','#7be0a4','#2f9b63'],N:22,top:'flagIE'},
{id:'pascoa',n:'Páscoa',c:'en,es',t:function(d){var e=easter(d.getFullYear());return inR(+d,+addD(e,-3),+addD(e,1));},mo:'rise',shape:'egg',col:['#ffb3c6','#b8e0ff','#fff3a3','#c8f0c8','#e0c3ff'],N:7,corner:1},
{id:'idioma',n:'Dia do Idioma',c:'en,es',t:R(4,21,4,23),mo:'none',N:0,top:'words'},
{id:'feria-abril',n:'Feria de Abril',c:'es',t:function(d){var e=easter(d.getFullYear());return inR(+d,+addD(e,15),+addD(e,20));},mo:'none',N:0,top:'lanterns'},
{id:'trabalhador',n:'Dia do Trabalhador',c:'en,es',t:R(4,29,5,1),mo:'float',shape:'star',col:['#F5C542','#fff'],N:5,tw:1,top:'star'},
{id:'junina',n:'Festa Junina',c:'en,es',t:R(6,13,6,24),mo:'fall',shape:'spark',col:['#ff9f1c','#F5C542','#EC4654','#fff3c4'],N:34,top:'bunting'},
{id:'july4',n:'4 de Julho',c:'en',t:R(7,2,7,4),mo:'none',N:0,top:'flagUS',fw:1},
{id:'independencia',n:'Independência do Brasil',c:'en,es',t:R(9,5,9,7),mo:'fall',shape:'rect',col:['#3DB37A','#F5C542','#fff','#6FA8FF'],N:44,top:'flagBR'},
{id:'fiestas-patrias',n:'Fiestas Patrias',c:'es',t:R(9,16,9,18),mo:'fall',shape:'rect',col:['#2d6be0','#fff','#EC4654','#3DB37A','#F5C542'],N:44,top:'flagCL'},
{id:'professor',n:'Dia do Professor',c:'en,es',t:R(10,13,10,15),mo:'float',shape:'star',col:['#F5C542','#E4C06A','#fff6cf'],N:24,tw:1,top:'star'},
{id:'halloween',n:'Halloween',c:'en',t:R(10,29,10,31),mo:'float',shape:'bat',col:['#B26BFF','#8a4fd6'],N:7},
{id:'muertos',n:'Día de Muertos',c:'es',t:R(10,31,11,2),mo:'fall',shape:'petal',col:['#ff9f1c','#F5C542','#ffb347'],N:34},
{id:'bonfire',n:'Bonfire Night',c:'en',t:R(11,3,11,5),mo:'none',N:0,top:'flagUK',fw:1},
{id:'thanksgiving',n:'Thanksgiving',c:'en',t:function(d){var s=nthDow(d.getFullYear(),10,4,4);return inR(+d,+addD(s,-2),+s);},mo:'fall',shape:'leaf',col:['#d9631e','#b3341f','#F5C542','#8c5a1c'],N:22,top:'flagUS'},
{id:'natal',n:'Natal',c:'en,es',t:R(12,18,12,25),mo:'fall',shape:'spark',col:['#fff','#fff','#dfefff'],N:60},
{id:'boxing-day',n:'Boxing Day',c:'en',t:R(12,26,12,26),mo:'float',shape:'star',col:['#F5C542','#fff'],N:5,tw:1,top:'bow'},
{id:'stage-concluido',n:'Stage concluído',c:'en,es',t:never,mo:'float',shape:'star',col:['#F5C542','#E4C06A','#fff6cf'],N:16,tw:1,top:'star'}
];
var byId={};E.forEach(function(e){byId[e.id]=e;});
function pick(date,course,bd,sd){
  date=date||new Date();var s=('0'+(date.getMonth()+1)).slice(-2)+'-'+('0'+date.getDate()).slice(-2);
  if(bd&&bd===s)return 'aniversario-aluno';
  if(sd&&sd===s)return 'aniversario-escola';
  for(var i=2;i<E.length;i++){var e=E[i];if(e.c.split(',').indexOf(course||'en')>-1&&e.t(date))return e.id;}
  return null;
}
function shape(x,s,sz,col,ch){
  x.fillStyle=col;x.strokeStyle=col;
  switch(s){
  case 'star':x.beginPath();for(var i=0;i<10;i++){var r=i%2?sz*.42:sz,a=i*Math.PI/5-Math.PI/2;x.lineTo(Math.cos(a)*r,Math.sin(a)*r);}x.closePath();x.fill();break;
  case 'rect':x.fillRect(-sz*.6,-sz*.25,sz*1.2,sz*.5);break;
  case 'petal':x.beginPath();x.ellipse(0,0,sz*.45,sz,0,0,7);x.fill();break;
  case 'leaf':x.beginPath();x.moveTo(0,-sz);x.quadraticCurveTo(sz,-sz*.2,0,sz);x.quadraticCurveTo(-sz,-sz*.2,0,-sz);x.fill();x.strokeStyle='rgba(0,0,0,.25)';x.beginPath();x.moveTo(0,-sz);x.lineTo(0,sz);x.stroke();break;
  case 'egg':x.beginPath();x.ellipse(0,0,sz*.65,sz*.9,0,0,7);x.fill();x.fillStyle='rgba(255,255,255,.7)';x.fillRect(-sz*.6,-sz*.1,sz*1.2,sz*.2);break;
  case 'clover':for(var j=0;j<4;j++){x.save();x.rotate(j*Math.PI/2);x.beginPath();x.arc(sz*.35,0,sz*.38,0,7);x.fill();x.restore();}x.lineWidth=1.5;x.beginPath();x.moveTo(0,0);x.lineTo(sz*.2,sz);x.stroke();break;
  case 'balloon':x.beginPath();x.ellipse(0,0,sz*.7,sz*.9,0,0,7);x.fill();x.lineWidth=1;x.strokeStyle='rgba(255,255,255,.5)';x.beginPath();x.moveTo(0,sz*.9);x.quadraticCurveTo(sz*.3,sz*1.4,0,sz*2);x.stroke();break;
  case 'bat':x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(-sz*.5,-sz*.9,-sz*1.3,-sz*.3);x.quadraticCurveTo(-sz*.9,-sz*.1,-sz*.8,sz*.3);x.quadraticCurveTo(-sz*.4,sz*.05,0,sz*.5);x.quadraticCurveTo(sz*.4,sz*.05,sz*.8,sz*.3);x.quadraticCurveTo(sz*.9,-sz*.1,sz*1.3,-sz*.3);x.quadraticCurveTo(sz*.5,-sz*.9,0,0);x.fill();break;
  default:x.beginPath();x.arc(0,0,sz*.4,0,7);x.fill();}
}
function mk(w,h,fn){var c=D.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);return c;}
var FL={
BR:function(){return mk(84,58,function(x){x.fillStyle='#009C3B';x.fillRect(0,0,84,58);x.fillStyle='#FFDF00';x.beginPath();x.moveTo(42,6);x.lineTo(77,29);x.lineTo(42,52);x.lineTo(7,29);x.closePath();x.fill();x.fillStyle='#002776';x.beginPath();x.arc(42,29,13,0,7);x.fill();x.strokeStyle='#fff';x.lineWidth=2.4;x.beginPath();x.arc(42,52,34,Math.PI*1.27,Math.PI*1.73);x.stroke();});},
US:function(){return mk(84,58,function(x){for(var i=0;i<13;i++){x.fillStyle=i%2?'#fff':'#B22234';x.fillRect(0,i*58/13,84,58/13+.5);}x.fillStyle='#3C3B6E';x.fillRect(0,0,38,31);x.fillStyle='#fff';for(var r=0;r<4;r++)for(var q=0;q<5;q++){x.beginPath();x.arc(5+q*7.3,5+r*7.3,1.2,0,7);x.fill();}});},
UK:function(){return mk(84,58,function(x){x.fillStyle='#012169';x.fillRect(0,0,84,58);x.strokeStyle='#fff';x.lineWidth=10;x.beginPath();x.moveTo(0,0);x.lineTo(84,58);x.moveTo(84,0);x.lineTo(0,58);x.stroke();x.strokeStyle='#C8102E';x.lineWidth=4;x.stroke();x.strokeStyle='#fff';x.lineWidth=16;x.beginPath();x.moveTo(42,0);x.lineTo(42,58);x.moveTo(0,29);x.lineTo(84,29);x.stroke();x.strokeStyle='#C8102E';x.lineWidth=9;x.stroke();});},
IE:function(){return mk(84,58,function(x){x.fillStyle='#169B62';x.fillRect(0,0,28,58);x.fillStyle='#fff';x.fillRect(28,0,28,58);x.fillStyle='#FF883E';x.fillRect(56,0,28,58);});},
CL:function(){return mk(84,58,function(x){x.fillStyle='#fff';x.fillRect(0,0,84,29);x.fillStyle='#D52B1E';x.fillRect(0,29,84,29);x.fillStyle='#0039A6';x.fillRect(0,0,28,29);x.fillStyle='#fff';x.beginPath();for(var i=0;i<10;i++){var r=i%2?3.2:8,a=i*Math.PI/5-Math.PI/2;x.lineTo(14+Math.cos(a)*r,14.5+Math.sin(a)*r);}x.closePath();x.fill();});}
};
var CH={en:['Hello','Hola','Bonjour','Hallo','Ciao','Hej','Merhaba'],es:['Hola','Hello','Bonjour','Hallo','Ciao','Hej','Merhaba']};
var WCOL=['#F5C542','#fff','#9fd0ff','#fff3c4'];
function ease(t){return t<0?0:t>1?1:t*t*(3-2*t);}
function mount(host,o){
  o=o||{};var ef=o.effect?byId[o.effect]:null,course=o.course||'en';
  var W0=300,H0=440,dpr=Math.min(W.devicePixelRatio||1,2);
  var cv=D.createElement('canvas');cv.width=W0*dpr;cv.height=H0*dpr;cv.className='bl-ld-cv';cv.style.cssText='width:min(78vw,'+W0+'px);height:auto;aspect-ratio:'+W0+'/'+H0+';display:block;margin:0 auto';cv.setAttribute('aria-hidden','true');
  host.appendChild(cv);var x=cv.getContext('2d');x.scale(dpr,dpr);
  var img=new Image();img.src=o.src||(W.BL_BASE||'')+'img/britland-shield.png';
  var SC=.7,ox=(W0-SW*SC)/2,oy=165,CX=W0/2,CY=oy+SH*SC/2;
  var reduce=false;try{reduce=W.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
  /* pens: cumulative lengths */
  var pens=PENS.map(function(list){var tot=0,segs=list.map(function(f){var L=0;for(var i=2;i<f.length;i+=2)L+=Math.hypot(f[i]-f[i-2],f[i+1]-f[i-1]);var s={f:f,L:L,s:tot};tot+=L;return s;});return {segs:segs,tot:tot};});
  var tgt=0,cur=0,done=false,sparks=[],ps=[],raf=0,last=performance.now(),flash=0,finCb=null,dead=false,nextFw=0,nextShoot=1500,shoot=null;
  var flagKey=ef&&ef.top&&ef.top.indexOf('flag')===0?ef.top.slice(4):null,fl=flagKey?FL[flagKey]():null;
  function PT(f,i){return [ox+f[i]*SC,oy+f[i+1]*SC];}
  function mkp(init){var s=ef.shape,sz=3+Math.random()*4,p={x:Math.random()*W0,y:0,vx:0,vy:0,r:Math.random()*6.3,vr:(Math.random()-.5)*.08,sz:sz,c:ef.col[Math.floor(Math.random()*ef.col.length)],ph:Math.random()*6.3,l:1};
    if(s==='balloon'){p.sz=8+Math.random()*3;}if(s==='bat'){p.sz=5+Math.random()*3;}if(s==='spark')p.sz=2.2+Math.random()*2.2;if(s==='star')p.sz=3+Math.random()*5;
    if(ef.corner){p.x=Math.random()<.5?8+Math.random()*52:W0-60+Math.random()*52;}
    if(ef.mo==='fall'){p.y=init?Math.random()*H0:-10;p.vy=.5+Math.random()*1.1;}
    else if(ef.mo==='rise'){p.y=init?H0*(.4+Math.random()*.6):H0+14;p.vy=-(.5+Math.random()*.8);}
    else{p.y=Math.random()*H0*.85;p.vx=(Math.random()-.5)*.35;p.vy=(Math.random()-.5)*.25;}
    return p;}
  if(ef&&ef.N)for(var i=0;i<ef.N;i++)ps.push(mkp(true));
  function spark(px,py,n){for(var i=0;i<n;i++){var a=Math.random()*6.3,v=.3+Math.random()*1.5;sparks.push({x:px,y:py,vx:Math.cos(a)*v,vy:Math.sin(a)*v-.35,l:1,c:GOLD[Math.floor(Math.random()*GOLD.length)],s:.8+Math.random()*1.8});}}
  function ringfw(){var bx=34,by=CY+8,cs=['#ff8fa3','#F5C542','#fff'];for(var i=0;i<22;i++){var a=Math.PI*2*i/22,v=1.1+Math.random()*.6;ps.push({x:bx,y:by,vx:Math.cos(a)*v,vy:Math.sin(a)*v,r:0,vr:0,sz:1.8,c:cs[i%3],l:1,b:1,ph:0});}}
  function topper(now){
    if(!ef||!ef.top)return;var t=ef.top;
    if(t==='year'){var y=o.year||new Date().getFullYear();if(!o.year&&new Date().getMonth()===11)y++;x.font='700 44px "Noto Serif",Georgia,serif';x.textAlign='center';x.fillStyle='#E4C06A';x.shadowColor='rgba(245,197,66,.75)';x.shadowBlur=14;x.fillText(String(y),CX,128+Math.sin(now/700)*2);x.shadowBlur=0;}
    else if(fl){var fw=84,fh=58,fx=CX-fw/2+6,fy=70;x.save();x.shadowColor='rgba(0,0,0,.4)';x.shadowBlur=5;for(var i=0;i<fw;i+=2){var dy=Math.sin(now/170+i/9)*3.6*(i/fw+.15);x.drawImage(fl,i,0,2,fh,fx+i,fy+dy,2,fh);}x.restore();x.fillStyle='#e8d9a0';x.fillRect(fx-4,fy-4,3,fh+32);x.beginPath();x.arc(fx-2.5,fy-5,2.4,0,7);x.fill();}
    else if(t==='star'||t==='bow'){x.save();x.translate(CX+(t==='star'?6:0),128+Math.sin(now/600)*2);x.shadowColor='#F5C542';x.shadowBlur=12;shape(x,'star',11,'#F5C542');if(t==='bow'){x.translate(0,14);x.fillStyle='#C9A13B';for(var s=-1;s<=1;s+=2){x.save();x.rotate(s*.5);x.beginPath();x.ellipse(s*9,0,9,5,0,0,7);x.fill();x.restore();}x.beginPath();x.arc(0,0,4,0,7);x.fill();}x.restore();}
    else if(t==='bunting'){var cs=['#EC4654','#F5C542','#3DB37A','#6FA8FF','#B26BFF','#ff9f1c'];x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=1;x.beginPath();x.moveTo(8,40);x.quadraticCurveTo(CX,92,W0-8,40);x.stroke();for(var b=0;b<13;b++){var u=(b+.5)/13,px=8+u*(W0-16),py=40+2*u*(1-u)*52;x.fillStyle=cs[b%6];x.beginPath();x.moveTo(px-8,py);x.lineTo(px+8,py);x.lineTo(px,py+17);x.closePath();x.fill();}}
    else if(t==='lanterns'){var lc=['#EC4654','#fff','#F5C542','#3DB37A'];x.strokeStyle='rgba(255,255,255,.4)';x.lineWidth=1;x.beginPath();x.moveTo(8,56);x.quadraticCurveTo(CX,92,W0-8,56);x.stroke();for(var q=0;q<11;q++){var v=(q+.5)/11,lx=8+v*(W0-16),ly=56+2*v*(1-v)*36;x.save();x.shadowColor=lc[q%4];x.shadowBlur=9;x.fillStyle=lc[q%4];x.beginPath();x.ellipse(lx,ly+7,4.6,6.5,0,0,7);x.fill();x.restore();}}
    else if(t==='words'){var ws=CH[course],pos=[[40,110],[250,95],[30,200],[262,215],[60,330],[240,320],[150,92]];ws.forEach(function(w,i){var ph=(now/2600+i*.37)%1,al=Math.sin(ph*Math.PI);x.globalAlpha=Math.max(0,al)*.95;x.font='700 15px "Noto Serif",Georgia,serif';x.textAlign='center';x.fillStyle=WCOL[i%4];x.fillText(w,pos[i][0],pos[i][1]-ph*10);});x.globalAlpha=1;}
  }
  function frame(now){
    if(dead)return;raf=requestAnimationFrame(frame);var dt=Math.min(now-last,50)/16.67;last=now;
    cur+=(tgt-cur)*Math.min(1,.06*dt);if(tgt>=1&&cur>.995)cur=1;
    x.clearRect(0,0,W0,H0);
    var g=x.createRadialGradient(CX,CY,5,CX,CY,170);g.addColorStop(0,'rgba(36,70,150,.6)');g.addColorStop(1,'rgba(36,70,150,0)');x.fillStyle=g;x.fillRect(0,0,W0,H0);
    if(ef){
      if(ef.fw&&now>=nextFw&&ps.length<80){ringfw();nextFw=now+1700;}
      if(ef.shoot){if(!shoot&&now>nextShoot){shoot={x:230,y:30,vx:-3.2,vy:1.5,l:1};}if(shoot){shoot.x+=shoot.vx*dt;shoot.y+=shoot.vy*dt;shoot.l-=.013*dt;sparks.push({x:shoot.x,y:shoot.y,vx:0,vy:0,l:.7,c:'#fff3c4',s:1.2});x.save();x.globalAlpha=Math.max(0,shoot.l);x.translate(shoot.x,shoot.y);shape(x,'star',4,'#fff');x.restore();if(shoot.l<=0){shoot=null;nextShoot=now+2600;}}}
      ps.forEach(function(p){
        if(p.b){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.985;p.vy=p.vy*.985+.025*dt;p.l-=.011*dt;}
        else{p.ph+=.03*dt;p.r+=p.vr*dt;p.x+=(p.vx+Math.sin(p.ph)*(ef.mo==='float'?.2:.3))*dt;p.y+=p.vy*dt;
          if(ef.mo==='fall'&&p.y>H0+12)Object.assign(p,mkp(false));
          if(ef.mo==='rise'&&p.y<-24)Object.assign(p,mkp(false));
          if(ef.mo==='float'){if(p.x<-10)p.x=W0+10;if(p.x>W0+10)p.x=-10;if(p.y<-10)p.y=H0*.85;if(p.y>H0*.9)p.y=-10;}}
        if(p.l>0){var al=Math.max(0,Math.min(1,p.l));if(ef.tw&&!p.b)al*=.55+.45*Math.sin(p.ph*3);x.save();x.globalAlpha=al;x.translate(p.x,p.y);x.rotate(ef.shape==='balloon'||ef.shape==='bat'?Math.sin(p.ph)*.25:p.r);shape(x,p.b?'spark':ef.shape,p.sz,p.c);x.restore();}
      });
      ps=ps.filter(function(p){return !p.b||p.l>0;});
      if(ef.ring){var rr=122+Math.sin(now/500)*3;x.save();x.translate(CX,CY);x.rotate(now/6000);x.fillStyle='#F5C542';x.shadowColor='#F5C542';x.shadowBlur=6;for(var k=0;k<48;k++){var a=k/48*Math.PI*2;x.globalAlpha=.35+.45*Math.sin(now/300+k);x.beginPath();x.arc(Math.cos(a)*rr,Math.sin(a)*rr,1.7,0,7);x.fill();}x.restore();x.globalAlpha=1;}
    }
    /* logo drawn in gold */
    var pr=reduce?tgt:cur,fr=Math.min(1,pr/.88);
    x.save();x.lineJoin='round';x.lineCap='round';x.shadowColor='rgba(245,197,66,.8)';x.shadowBlur=6+flash*14;
    var la=1-ease((pr-.9)/.1)*.85;x.globalAlpha=la;
    if(fr>0){
      x.strokeStyle='#E4C06A';x.lineWidth=1.25;
      var of=Math.min(1,fr*3.2);x.beginPath();var m=Math.floor(OUT.length/2*of);for(var q=0;q<=m;q++){var u=OUT[(q%(OUT.length/2))*2]*SC+ox,v=OUT[(q%(OUT.length/2))*2+1]*SC+oy;if(q===0)x.moveTo(u,v);else x.lineTo(u,v);}x.stroke();
      if(of<1){var qi=Math.min(m,OUT.length/2-1);spark(OUT[qi*2]*SC+ox,OUT[qi*2+1]*SC+oy,reduce?0:3);}
      var pf=Math.max(0,(fr-.12)/.88);
      pens.forEach(function(pen){var lim=pf*pen.tot;x.beginPath();var tip=null;pen.segs.forEach(function(sg){if(sg.s>lim)return;var f=sg.f,rem=lim-sg.s,acc=0,p0=PT(f,0);x.moveTo(p0[0],p0[1]);tip=p0;for(var i=2;i<f.length;i+=2){var a=PT(f,i-2),b=PT(f,i),L=Math.hypot(b[0]-a[0],b[1]-a[1])/SC;if(acc+L>rem){var u=(rem-acc)/L;tip=[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u];x.lineTo(tip[0],tip[1]);return;}acc+=L;x.lineTo(b[0],b[1]);tip=b;}});x.stroke();if(tip&&pf<1&&!reduce)spark(tip[0],tip[1],2);});
    }
    x.restore();
    var ia=ease((pr-.62)/.38);if(img.complete&&img.naturalWidth&&ia>0){x.save();x.globalAlpha=ia;if(done||pr>=1){x.shadowColor='rgba(245,197,66,'+(.55+.35*flash)+')';x.shadowBlur=14+flash*18;}x.drawImage(img,ox,oy,SW*SC,SH*SC);x.restore();}
    if(pr>=1&&!done){done=true;flash=1;if(!reduce)for(var z=0;z<30;z++)spark(ox+Math.random()*SW*SC,oy+Math.random()*SH*SC*.9,1);if(finCb)setTimeout(finCb,reduce?0:500);}
    if(flash>0)flash=Math.max(0,flash-.015*dt);
    /* progress bar */
    var by=oy+SH*SC+30,bw=150,bx=(W0-bw)/2;x.fillStyle='rgba(255,255,255,.18)';x.fillRect(bx,by,bw,2);x.fillStyle='#E4C06A';x.fillRect(bx,by,bw*Math.min(1,pr),2);
    sparks.forEach(function(s){s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=.02*dt;s.l-=.03*dt;if(s.l>0){x.globalAlpha=Math.max(0,s.l);x.fillStyle=s.c;x.beginPath();x.arc(s.x,s.y,s.s,0,7);x.fill();}});x.globalAlpha=1;
    sparks=sparks.filter(function(s){return s.l>0;});
    topper(now);
  }
  raf=requestAnimationFrame(frame);
  return {progress:function(p){tgt=Math.max(tgt,Math.min(1,p));},reset:function(){tgt=0;cur=0;done=false;sparks=[];},finish:function(cb){finCb=cb;tgt=1;},destroy:function(){dead=true;cancelAnimationFrame(raf);if(cv.parentNode)cv.parentNode.removeChild(cv);},canvas:cv};
}
W.BLLoad={mount:mount,pick:pick,EFFECTS:E,easter:easter};
})(window,document);
