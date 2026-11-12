/* Feriados: bancários da Irlanda e nacionais do Brasil. window.BL_HOL.of('YYYY-MM-DD', ['IE','BR']) -> [{c:'IE',n:'St Patrick\'s Day'}] */
(function(){
function easter(y){var a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1;return Date.UTC(y,mo-1,da);}
function k(t){return new Date(t).toISOString().slice(0,10);}
function nth(y,mo,wd,n){var d=new Date(Date.UTC(y,mo,1)),off=(wd-d.getUTCDay()+7)%7;return Date.UTC(y,mo,1+off+7*(n-1));}
function last(y,mo,wd){var d=new Date(Date.UTC(y,mo+1,0)),off=(d.getUTCDay()-wd+7)%7;return Date.UTC(y,mo,d.getUTCDate()-off);}
var cache={};
function year(y){if(cache[y])return cache[y];var m={IE:{},BR:{}},E=easter(y),D=864e5;
function ie(t,n){var s=k(t);(m.IE[s]=m.IE[s]||[]).push(n);}function br(t,n){var s=k(t);(m.BR[s]=m.BR[s]||[]).push(n);}
ie(Date.UTC(y,0,1),"New Year's Day");
var feb1=new Date(Date.UTC(y,1,1)).getUTCDay();ie(feb1===5?Date.UTC(y,1,1):nth(y,1,1,1),"St Brigid's Day");
ie(Date.UTC(y,2,17),"St Patrick's Day");ie(E+D,'Easter Monday');
ie(nth(y,4,1,1),'May Bank Holiday');ie(nth(y,5,1,1),'June Bank Holiday');ie(nth(y,7,1,1),'August Bank Holiday');ie(last(y,9,1),'October Bank Holiday');
ie(Date.UTC(y,11,25),'Christmas Day');ie(Date.UTC(y,11,26),"St Stephen's Day");
br(Date.UTC(y,0,1),'Confraternização Universal');br(E-2*D,'Sexta-feira Santa');br(Date.UTC(y,3,21),'Tiradentes');br(Date.UTC(y,4,1),'Dia do Trabalho');
br(E+60*D,'Corpus Christi');br(Date.UTC(y,8,7),'Independência do Brasil');br(Date.UTC(y,9,12),'Nossa Senhora Aparecida');br(Date.UTC(y,10,2),'Finados');
br(Date.UTC(y,10,15),'Proclamação da República');if(y>=2024)br(Date.UTC(y,10,20),'Consciência Negra');br(Date.UTC(y,11,25),'Natal');
return cache[y]=m;}
window.BL_HOL={
 of:function(day,cs){var y=+String(day).slice(0,4),m=year(y),o=[];(cs||['IE','BR']).forEach(function(c){(m[c]&&m[c][day]||[]).forEach(function(n){o.push({c:c,n:n});});});return o;},
 label:function(h){var ie=h.filter(function(x){return x.c==='IE';}),br=h.filter(function(x){return x.c==='BR';}),p=[];
  if(ie.length)p.push('🇮🇪 Feriado na Irlanda: '+ie.map(function(x){return x.n;}).join(', '));
  if(br.length)p.push('🇧🇷 Feriado no Brasil: '+br.map(function(x){return x.n;}).join(', '));return p;},
 cc:function(s){s=String(s||'').toLowerCase();return /irlanda|ireland/.test(s)?'IE':/brasil|brazil/.test(s)?'BR':null;}
};})();
