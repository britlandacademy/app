/* Stage-end forecast: a range (min-max weeks) + approximate dates. Pure functions, no DOM. */
(function(){
var DAY=864e5,MON={pt:['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'],en:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],es:['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']};
/* freq: classes per week from future lessons (35 days), else past lessons (28 days), else 1 */
function freq(fut,past){var n=fut||0,p=past||0;if(n>=2)return n/5;if(p>=2)return p/4;return n>=1?1:(p>=1?1:1);}
/* o: {done,total,freq,lagPar,missRate,now} */
function calc(o){o=o||{};var tot=+o.total||0,done=+o.done||0,rem=tot-done;if(!(tot>0)||rem<=0)return null;
  var f=Math.max(.5,+o.freq||1),now=o.now||Date.now(),rate=Math.min(.35,Math.max(.08,+o.missRate||0)),lag=Math.max(0,+o.lagPar||0);
  var extra=Math.ceil(rem*rate)+Math.ceil(lag/5),wmin=Math.max(1,Math.ceil(rem/f)),wmax=Math.max(wmin+1,Math.ceil((rem+extra)/f));
  return {rem:rem,wmin:wmin,wmax:wmax,dmin:new Date(now+wmin*7*DAY),dmax:new Date(now+wmax*7*DAY)};}
function dt(d,l){var m=(MON[l]||MON.pt)[d.getMonth()];return l==='en'?m+' '+d.getDate():d.getDate()+'/'+m;}
/* l: 'pt' | 'en' | 'es' ; s: stage name used in the text, e.g. "Stage 4" */
function fmt(r,l,s){if(!r)return '';l=l||'pt';
  var wk=l==='en'?'weeks':l==='es'?'semanas':'semanas',a=r.wmin===r.wmax?r.wmin:r.wmin+' – '+r.wmax,mid=l==='en'?'between':l==='es'?'entre':'entre',and=l==='en'?'and':l==='es'?'y':'e';
  var head=l==='en'?'End of '+(s||'the Stage'):l==='es'?'Fin de '+(s||'la Etapa'):'Fim do '+(s||'Stage');
  return head+': '+a+' '+wk+' · '+mid+' '+dt(r.dmin,l)+' '+and+' '+dt(r.dmax,l);}
window.BL_FORECAST={calc:calc,fmt:fmt,freq:freq};
})();
