/* Britland: Medals 2.0 (shared by EN and ES).
   ~45 medals in bronze / silver / gold, secret ones shown as "?", a gold "achievement" bar (shield draws itself, bar opens from the centre,
   harp at the start and at the exit), a tap-tooltip with how to earn, and a Portuguese notice to the teacher for every medal (server side).
   Works on top of Gate: Gate.start and Gate.saveAttempt are wrapped, nothing else is replaced. Public API: Medals.render(box, allAttempts). */
(function(){
'use strict';
if(window.Medals)return;
var ES=/\/espanol\//.test(location.pathname),L=ES?1:0;
var STG=((window.BL_COURSE&&BL_COURSE.stages)||(ES?[[1,16],[17,32],[33,52],[53,72],[73,92],[93,112]]:[[1,12],[13,27],[28,44],[45,63],[64,82],[83,101],[102,120],[121,138],[139,156],[157,174],[175,190],[191,206]])).filter(function(r){return r[0]<1000;});
function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function el(t,c,x){var n=document.createElement(t);if(c)n.className=c;if(x!==undefined&&x!==null)n.textContent=x;return n;}
var STR={unlocked:['Conquista desbloqueada','Logro desbloqueado'],earned:['Conquistada em ','Conseguida el '],notyet:['Ainda não conquistada','Aún sin conseguir'],secret:['Medalha secreta. Continue estudando para descobrir.','Medalla secreta. Sigue estudiando para descubrirla.'],snd:['Achievement sound','Sonido de logros'],on:['on','activado'],off:['off','desactivado'],next:['Next medal','Próxima medalla'],g:{streak:['Streaks','Constancia'],checks:['Lesson Checks','Lesson Checks'],ex:['Exercises','Ejercicios'],stages:['Stages','Etapas'],special:['Special','Especiales'],game:['Game Mode','Modo Juego'],secret:['Secret','Secretas']}};
function s(k){return STR[k][L];}
/* ---------- icons (24x24 line paths) ---------- */
/* ---------- medal art: metallic medallion with ribbon (style A), tier gradients, detailed two-tone icons ---------- */
var TC={b:['#f3c9a0','#cf8a4b','#7a4a1d','#ffe3c8'],s:['#fbfdff','#c3ccd9','#76839a','#ffffff'],g:['#fff2b8','#e6c56a','#a67c1a','#fff9d6']},NV='#0a1330';
function defsSvg(){
  if(document.getElementById('mddefs'))return;var d='';
  ['b','s','g'].forEach(function(k){var c=TC[k];
    d+='<linearGradient id="mdg'+k+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+c[0]+'"/><stop offset=".5" stop-color="'+c[1]+'"/><stop offset="1" stop-color="'+c[2]+'"/></linearGradient>';
    d+='<linearGradient id="mdr'+k+'" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="'+c[2]+'"/><stop offset=".45" stop-color="'+c[1]+'"/><stop offset=".7" stop-color="'+c[0]+'"/><stop offset="1" stop-color="'+c[1]+'"/></linearGradient>';});
  d+='<radialGradient id="mdnv" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="#1c3472"/><stop offset="1" stop-color="#0a1330"/></radialGradient><radialGradient id="mdsh" cx=".35" cy=".25" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>';
  var s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.id='mddefs';s.setAttribute('width','0');s.setAttribute('height','0');s.style.cssText='position:absolute;width:0;height:0;overflow:hidden';s.innerHTML='<defs>'+d+'</defs>';document.body.appendChild(s);
}
function glyph(k,G,H){var N=NV;switch(k){
 case 'flame':return '<path d="M50 20c3 12 18 18 18 38a18 18 0 0 1-36 0c0-8 4-13 8-17 1 6 4 9 8 10-3-12-1-22 2-31z" fill="'+G+'"/><path d="M50 52c2 6 8 8 8 15a8 8 0 0 1-16 0c0-4 3-6 5-9 1 3 2 4 3 4z" fill="'+N+'" opacity=".85"/><path d="M42 40c-2 3-4 6-4 10" stroke="'+H+'" stroke-width="2" stroke-linecap="round" fill="none" opacity=".8"/>';
 case 'trophy':return '<path d="M34 24h32v16a16 16 0 0 1-32 0z" fill="'+G+'"/><path d="M34 29h-9v6a11 11 0 0 0 10 11M66 29h9v6a11 11 0 0 1-10 11" fill="none" stroke="'+G+'" stroke-width="4" stroke-linecap="round"/><path d="M46 56h8v8h-8z" fill="'+G+'"/><path d="M36 64h28l3 9H33z" fill="'+G+'"/><path d="M50 30l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" fill="'+N+'" opacity=".85"/><path d="M38 28v12" stroke="'+H+'" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>';
 case 'check':return '<path d="M50 20l24 9v18c0 16-10 26-24 33-14-7-24-17-24-33V29z" fill="'+G+'"/><path d="M38 51l8 8 16-17" fill="none" stroke="'+N+'" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/><path d="M33 31l17-6" stroke="'+H+'" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>';
 case 'book':return '<path d="M50 30c-8-5-18-6-27-4v38c9-2 19-1 27 4z" fill="'+G+'"/><path d="M50 30c8-5 18-6 27-4v38c-9-2-19-1-27 4z" fill="'+G+'" opacity=".88"/><path d="M50 30v38" stroke="'+N+'" stroke-width="2" opacity=".6"/><path d="M29 37c6-1 11 0 15 2M29 45c6-1 11 0 15 2M29 53c6-1 11 0 15 2M71 37c-6-1-11 0-15 2M71 45c-6-1-11 0-15 2M71 53c-6-1-11 0-15 2" stroke="'+N+'" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".7"/><path d="M45 20l5 7 5-7v14l-5-4-5 4z" fill="'+N+'" opacity=".85"/>';
 case 'sun':{var r='';[-72,-48,-24,0,24,48,72].forEach(function(a){r+='<path d="M50 22v8" stroke="'+G+'" stroke-width="4" stroke-linecap="round" transform="rotate('+a+' 50 62)"/>';});return r+'<path d="M30 62a20 20 0 0 1 40 0z" fill="'+G+'"/><path d="M22 68h56M30 75h40M38 82h24" stroke="'+G+'" stroke-width="4" stroke-linecap="round"/><path d="M38 55a13 13 0 0 1 8-9" stroke="'+H+'" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".8"/>';}
 case 'rise':{var r2='';[-60,-30,0,30,60].forEach(function(a){r2+='<path d="M50 30v7" stroke="'+G+'" stroke-width="4" stroke-linecap="round" transform="rotate('+a+' 50 66)"/>';});return r2+'<path d="M32 66a18 18 0 0 1 36 0z" fill="'+G+'"/><path d="M22 72h56M30 79h40" stroke="'+G+'" stroke-width="4" stroke-linecap="round"/><path d="M50 14l9 11H41z" fill="'+G+'"/><path d="M50 22v10" stroke="'+G+'" stroke-width="4"/>';}
 case 'bars':return '<rect x="24" y="52" width="13" height="26" rx="3" fill="'+G+'"/><rect x="43" y="40" width="13" height="38" rx="3" fill="'+G+'"/><rect x="62" y="28" width="13" height="50" rx="3" fill="'+G+'"/><path d="M24 38l14-8 12 5 18-13" stroke="'+H+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M62 20h10v9" stroke="'+H+'" stroke-width="3" stroke-linecap="round" fill="none"/>';
 case 'star':return '<path d="M50 16l10.4 21.1 23.3 3.4-16.9 16.4 4 23.2L50 69.2 29.2 80.1l4-23.2L16.3 40.5l23.3-3.4z" fill="'+G+'"/><path d="M50 30l4 8.2 9 1.3" stroke="'+H+'" stroke-width="2.6" stroke-linecap="round" fill="none" opacity=".85"/><path d="M80 18v10M75 23h10M20 70v8M16 74h8" stroke="'+H+'" stroke-width="2.4" stroke-linecap="round"/>';
 case 'target':return '<circle cx="46" cy="54" r="27" fill="none" stroke="'+G+'" stroke-width="6"/><circle cx="46" cy="54" r="15" fill="none" stroke="'+G+'" stroke-width="6"/><circle cx="46" cy="54" r="5" fill="'+G+'"/><path d="M48 52l26-28" stroke="'+H+'" stroke-width="3.5" stroke-linecap="round"/><path d="M68 22l10-2-2 10zM74 30l6-6" fill="'+G+'" stroke="'+G+'" stroke-width="2"/>';
 case 'miss':return '<circle cx="44" cy="56" r="26" fill="none" stroke="'+G+'" stroke-width="6"/><circle cx="44" cy="56" r="14" fill="none" stroke="'+G+'" stroke-width="6"/><circle cx="44" cy="56" r="4.5" fill="'+G+'"/><path d="M60 40l22-22" stroke="'+H+'" stroke-width="3.5" stroke-linecap="round"/><path d="M76 16l10-1-1 10zM66 34l10-6" fill="'+G+'" stroke="'+G+'" stroke-width="2"/>';
 case 'clock':{var t='';for(var i=0;i<12;i++)t+='<path d="M50 24v'+(i%3?3:6)+'" stroke="'+G+'" stroke-width="2.4" stroke-linecap="round" transform="rotate('+(i*30)+' 50 50)"/>';return '<circle cx="50" cy="50" r="31" fill="none" stroke="'+G+'" stroke-width="6"/>'+t+'<path d="M50 50V34M50 50l12 7" stroke="'+G+'" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="50" r="4" fill="'+G+'"/><path d="M30 34a24 24 0 0 1 10-9" stroke="'+H+'" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".85"/>';}
 case 'cal':return '<rect x="22" y="26" width="56" height="52" rx="7" fill="'+G+'"/><rect x="22" y="26" width="56" height="15" rx="7" fill="'+N+'" opacity=".55"/><rect x="32" y="18" width="6" height="16" rx="3" fill="'+G+'"/><rect x="62" y="18" width="6" height="16" rx="3" fill="'+G+'"/><path d="M36 60l8 8 18-18" stroke="'+N+'" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".85"/>';
 case 'moon':return '<path d="M60 20a30 30 0 1 0 22 46A25 25 0 0 1 60 20z" fill="'+G+'"/><path d="M72 28l2 5 5 .7-3.6 3.5.9 5-4.3-2.3-4.3 2.3.9-5-3.6-3.5 5-.7z" fill="'+G+'"/><path d="M36 36a20 20 0 0 1 12-10" stroke="'+H+'" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".85"/>';
 case 'pen':return '<g transform="rotate(40 50 50)"><rect x="41" y="14" width="18" height="50" rx="3" fill="'+G+'"/><rect x="41" y="14" width="18" height="10" rx="3" fill="'+N+'" opacity=".6"/><path d="M41 64h18l-9 18z" fill="'+G+'"/><path d="M46 74h8l-4 8z" fill="'+N+'" opacity=".85"/></g><path d="M22 84h26" stroke="'+G+'" stroke-width="4" stroke-linecap="round"/>';
 case 'refresh':return '<path d="M74 44a26 26 0 0 0-46-12" stroke="'+G+'" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M76 22v26H50z" fill="'+G+'"/><path d="M26 56a26 26 0 0 0 46 12" stroke="'+G+'" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M24 78V52h26z" fill="'+G+'"/>';
 case 'bolt':return '<path d="M58 14L30 54h18l-7 32 30-44H52z" fill="'+G+'"/><path d="M52 24L40 44" stroke="'+H+'" stroke-width="2.6" stroke-linecap="round" opacity=".85"/>';
 case 'cert':return '<rect x="20" y="22" width="60" height="44" rx="4" fill="'+G+'"/><path d="M30 34h40M30 43h28M30 52h18" stroke="'+N+'" stroke-width="3.2" stroke-linecap="round" opacity=".7"/><path d="M60 62l-5 20 11-5 11 5-5-20z" fill="'+G+'" stroke="'+N+'" stroke-width="1.5"/><circle cx="66" cy="58" r="11" fill="'+G+'" stroke="'+N+'" stroke-width="2.4"/><path d="M61 58l4 4 7-8" stroke="'+N+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
 case 'crown':return '<path d="M20 72V34l17 18 13-26 13 26 17-18v38z" fill="'+G+'"/><rect x="20" y="72" width="60" height="9" rx="3" fill="'+G+'"/><circle cx="20" cy="32" r="4.5" fill="'+G+'"/><circle cx="50" cy="22" r="4.5" fill="'+G+'"/><circle cx="80" cy="32" r="4.5" fill="'+G+'"/><circle cx="50" cy="58" r="5" fill="'+N+'" opacity=".8"/><circle cx="34" cy="64" r="3.2" fill="'+N+'" opacity=".6"/><circle cx="66" cy="64" r="3.2" fill="'+N+'" opacity=".6"/>';
 case 'search':return '<circle cx="42" cy="42" r="22" fill="'+N+'" fill-opacity=".35" stroke="'+G+'" stroke-width="7"/><path d="M58 58l22 22" stroke="'+G+'" stroke-width="10" stroke-linecap="round"/><path d="M32 42l7 7 13-14" stroke="'+H+'" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
 case 'flag':return '<path d="M30 84V20" stroke="'+G+'" stroke-width="6" stroke-linecap="round"/><path d="M33 22c14-8 22 8 38 0v32c-16 8-24-8-38 0z" fill="'+G+'"/><path d="M33 38c14-8 22 8 38 0" stroke="'+N+'" stroke-width="3" fill="none" opacity=".6"/><ellipse cx="30" cy="86" rx="14" ry="4" fill="'+G+'" opacity=".6"/>';
 case 'train':return '<rect x="24" y="22" width="52" height="46" rx="10" fill="'+G+'"/><rect x="31" y="30" width="38" height="18" rx="4" fill="'+N+'" opacity=".8"/><path d="M50 30v18" stroke="'+G+'" stroke-width="2"/><circle cx="36" cy="58" r="4" fill="'+N+'" opacity=".8"/><circle cx="64" cy="58" r="4" fill="'+N+'" opacity=".8"/><path d="M30 72l-8 12M70 72l8 12M30 86h40" stroke="'+G+'" stroke-width="5" stroke-linecap="round"/><path d="M42 18h16" stroke="'+H+'" stroke-width="3" stroke-linecap="round"/>';
 case 'warn':return '<path d="M50 18L84 78H16z" fill="'+G+'" stroke="'+G+'" stroke-width="6" stroke-linejoin="round"/><path d="M50 40v20" stroke="'+N+'" stroke-width="7" stroke-linecap="round"/><circle cx="50" cy="68" r="4" fill="'+N+'"/>';
 case 'door':return '<path d="M26 20h30v62H26z" fill="'+G+'"/><circle cx="48" cy="52" r="3" fill="'+N+'"/><path d="M26 20l16 6v50l-16 6z" fill="'+N+'" opacity=".35"/><path d="M62 50h22M76 40l10 10-10 10" stroke="'+G+'" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
 case 'mount':return '<path d="M12 80L38 34l14 22 10-14 26 38z" fill="'+G+'"/><path d="M38 34l-7 12 7-4 5 6zM62 42l-5 8 5-3 4 4z" fill="'+N+'" opacity=".4"/><path d="M38 34V18l12 4-12 5" fill="'+G+'" stroke="'+G+'" stroke-width="3" stroke-linejoin="round"/>';
 case 'chain':return '<rect x="14" y="40" width="40" height="22" rx="11" fill="none" stroke="'+G+'" stroke-width="7" transform="rotate(-35 34 51)"/><rect x="46" y="40" width="40" height="22" rx="11" fill="none" stroke="'+G+'" stroke-width="7" transform="rotate(-35 66 51)"/><path d="M44 18v10M30 24l6 8M58 24l-6 8" stroke="'+H+'" stroke-width="3.2" stroke-linecap="round"/>';
 case 'sprout':return '<path d="M50 80V44" stroke="'+G+'" stroke-width="5" stroke-linecap="round"/><path d="M50 50C50 34 38 26 24 28c0 16 12 26 26 22z" fill="'+G+'"/><path d="M50 44c0-14 10-22 26-20 0 16-12 24-26 20z" fill="'+G+'" opacity=".88"/><ellipse cx="50" cy="82" rx="26" ry="6" fill="'+G+'" opacity=".7"/><path d="M34 34c5 1 9 4 11 9" stroke="'+N+'" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".6"/>';
 }return '';}
var BADGE={streak3:'3',streak7:'7',streak30:'30',goal4:'4',checks10:'10',checks25:'25',checks50:'50',checks100:'100',perfect3:'×3',ex50:'50',ex100:'100',ex250:'250',ex500:'500',wb10:'10',grammar10:'10',top3:'3',hunter:'20'};
function medalSvg(m,has,hidden){
  var k=m.tier,G='url(#mdg'+k+')',H=TC[k][3],cy=46,ic='';
  var frame='<path d="M34 78l-8 18 12-4 6 9 8-24z" fill="url(#mdr'+k+')" opacity=".9"/><path d="M66 78l8 18-12-4-6 9-8-24z" fill="url(#mdr'+k+')" opacity=".75"/><circle cx="50" cy="46" r="42" fill="url(#mdr'+k+')"/><circle cx="50" cy="46" r="42" fill="url(#mdsh)"/><circle cx="50" cy="46" r="35" fill="url(#mdnv)" stroke="'+TC[k][2]+'" stroke-width="1.5"/><circle cx="50" cy="46" r="31" fill="none" stroke="url(#mdg'+k+')" stroke-width="1" stroke-dasharray="1.5 3.2" opacity=".8"/>';
  if(hidden)ic='<text x="50" y="62" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="44" fill="#8b97b4" opacity=".8">?</text>';
  else if(m.num){ic='<text x="50" y="30" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700" font-size="8" letter-spacing="2" fill="'+G+'">'+(ES?'ETAPA':'STAGE')+'</text><text x="50" y="66" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="'+(m.num>9?34:42)+'" fill="'+G+'">'+m.num+'</text><path d="M32 72h36" stroke="'+G+'" stroke-width="2.4" stroke-linecap="round"/>';}
  else{var bd=BADGE[m.id],sc=bd?.72:.8,ty=bd?-3:0;
    ic='<g transform="translate(50 '+(46+ty)+') scale('+sc+') translate(-50 -50)">'+glyph(m.ic,G,H)+'</g>';
    if(bd)ic+='<rect x="34" y="60" width="32" height="14" rx="7" fill="'+NV+'" stroke="url(#mdg'+k+')" stroke-width="1.6"/><text x="50" y="70.6" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700" font-size="10" fill="url(#mdg'+k+')">'+bd+'</text>';}
  return '<svg viewBox="0 0 100 108" aria-hidden="true">'+frame+ic+'</svg>';
}
/* ---------- catalog ---------- */
var CAT=[];
function M(id,g,tier,en,es,pt,esh,ic,val,goal,secret){CAT.push({id:id,g:g,tier:tier,n:[en,es],h:[pt,esh],ic:ic,val:val,goal:goal||1,secret:!!secret});}
M('streak3','streak','b','3 days in a row','3 días seguidos','Estude 3 dias seguidos.','Estudia 3 días seguidos.','flame',function(S){return S.maxRun;},3);
M('streak7','streak','s','7 days in a row','7 días seguidos','Estude 7 dias seguidos.','Estudia 7 días seguidos.','flame',function(S){return S.maxRun;},7);
M('streak30','streak','g','30 days in a row','30 días seguidos','Estude 30 dias seguidos.','Estudia 30 días seguidos.','flame',function(S){return S.maxRun;},30);
M('goalweek','streak','b','Weekly goal','Meta semanal','Bata sua meta semanal de dias de estudo.','Cumple tu meta semanal de días de estudio.','target',function(S){return S.weeksHit>0?1:0;});
M('goal4','streak','s','4 goal weeks','4 semanas de meta','Bata a meta semanal por 4 semanas seguidas.','Cumple la meta semanal 4 semanas seguidas.','target',function(S){return S.goalRun;},4);
M('weekend','streak','b','Weekend study','Fin de semana activo','Estude no sábado e no domingo da mesma semana.','Estudia el sábado y el domingo de la misma semana.','cal',function(S){return S.weekend?1:0;});
M('first_check','checks','b','First check','Primer check','Termine seu primeiro Lesson Check.','Termina tu primer Lesson Check.','check',function(S){return S.done;},1);
M('checks10','checks','b','10 checks','10 checks','Termine 10 Lesson Checks.','Termina 10 Lesson Checks.','bars',function(S){return S.done;},10);
M('checks25','checks','b','25 checks','25 checks','Termine 25 Lesson Checks.','Termina 25 Lesson Checks.','bars',function(S){return S.done;},25);
M('checks50','checks','s','50 checks','50 checks','Termine 50 Lesson Checks.','Termina 50 Lesson Checks.','bars',function(S){return S.done;},50);
M('checks100','checks','g','100 checks','100 checks','Termine 100 Lesson Checks.','Termina 100 Lesson Checks.','bars',function(S){return S.done;},100);
M('perfect','checks','s','Perfect score','Nota perfecta','Tire 100% em um Lesson Check.','Saca 100% en un Lesson Check.','star',function(S){return S.perfect;},1);
M('perfect3','checks','g','3 perfect scores','3 notas perfectas','Tire 100% em 3 Lesson Checks diferentes.','Saca 100% en 3 Lesson Checks distintos.','star',function(S){return S.perfect;},3);
M('top_student','checks','s','Top student','Alumno estrella','Mantenha 90% de média após 5 Lesson Checks.','Mantén un 90% de media tras 5 Lesson Checks.','trophy',function(S){return S.done>=5?Math.min(1,S.avg/.9):0;});
M('comeback','checks','s','Comeback','Remontada','Refaça um Lesson Check e melhore sua nota.','Repite un Lesson Check y mejora tu nota.','refresh',function(S){return S.improvedCheck?1:0;});
M('ex50','ex','b','50 exercises','50 ejercicios','Faça 50 exercícios.','Haz 50 ejercicios.','clock',function(S){return S.exN;},50);
M('ex100','ex','b','100 exercises','100 ejercicios','Faça 100 exercícios.','Haz 100 ejercicios.','clock',function(S){return S.exN;},100);
M('ex250','ex','s','250 exercises','250 ejercicios','Faça 250 exercícios.','Haz 250 ejercicios.','clock',function(S){return S.exN;},250);
M('ex500','ex','g','500 exercises','500 ejercicios','Faça 500 exercícios.','Haz 500 ejercicios.','clock',function(S){return S.exN;},500);
M('workbook','ex','b','Workbook','Workbook','Faça sua primeira seção do Workbook.','Haz tu primera sección del Workbook.','book',function(S){return S.wbN;},1);
M('wb10','ex','s','10 Workbook sections','10 secciones de Workbook','Faça 10 seções do Workbook.','Haz 10 secciones del Workbook.','book',function(S){return S.wbN;},10);
M('grammar10','ex','b','Grammar fan','Fan de la gramática','Faça 10 exercícios de Grammar.','Haz 10 ejercicios de Grammar.','pen',function(S){return S.gramN;},10);
STG.forEach(function(r,i){var n=i+1,q=Math.floor(i/(STG.length/3)),tier=['b','s','g'][Math.min(2,q)];
  CAT.push({id:'stage'+n,g:'stages',tier:tier,n:['Stage '+n+' finished','Etapa '+n+' completada'],h:['Termine todos os Lesson Checks do Stage '+n+'.','Termina todos los Lesson Checks de la Etapa '+n+'.'],ic:null,num:n,val:function(S){return S.stageN[i]||0;},goal:r[1]-r[0]+1,secret:false});});
M('certificate','stages','g','Certificate','Certificado','Receba o certificado de um Stage.','Recibe el certificado de una Etapa.','cert',function(S){return S.certs>0?1:0;});
M('hunter','special','s','Error hunter','Cazador de errores','Acerte 20 exercícios que você já tinha errado.','Acierta 20 ejercicios que antes habías fallado.','search',function(S){return S.fixed;},20);
M('top3','special','s','Top 3','Top 3','Fique entre os 3 primeiros do ranking de sequência.','Queda entre los 3 primeros del ranking de racha.','crown',function(S){return S.top3?1:0;});
M('early','special','b','Early bird','Madrugador','Estude antes das 7h da manhã.','Estudia antes de las 7 de la mañana.','sun',function(S){return S.early?1:0;});
M('owl','special','b','Night owl','Búho nocturno','Estude depois das 22h.','Estudia después de las 22 h.','moon',function(S){return S.owl?1:0;});
M('near','secret','b','So close!','¡Por poco!','Tire 90% ou mais, sem chegar a 100%, num Lesson Check.','Saca un 90% o más, sin llegar al 100%, en un Lesson Check.','miss',function(S){return S.near?1:0;},1,1);
M('stubborn','secret','b','Stubborn','Terco','Errou o mesmo exercício 5 vezes seguidas.','Fallaste el mismo ejercicio 5 veces seguidas.','chain',function(S){return S.stubborn?1:0;},1,1);
M('oops','secret','b','Oops!','¡Ups!','Tirou 0% num Lesson Check.','Sacaste 0% en un Lesson Check.','warn',function(S){return S.oops?1:0;},1,1);
M('hurry','secret','b','In a hurry','Con prisa','Terminou um check em menos de 25 segundos e errou quase tudo.','Terminaste un check en menos de 25 segundos y fallaste casi todo.','bolt',function(S){return S.hurry?1:0;},1,1);
M('restart','secret','s','Fresh start','Nuevo comienzo','Perdeu uma sequência de 7 dias ou mais e voltou no dia seguinte.','Perdiste una racha de 7 días o más y volviste al día siguiente.','sprout',function(S){return S.restart?1:0;},1,1);
M('welcome','secret','s','Welcome back','Bienvenido de nuevo','Voltou a estudar depois de 30 dias parado.','Volviste a estudiar tras 30 días parado.','door',function(S){return S.welcome?1:0;},1,1);
M('persist','secret','s','Persistent','Persistente','Errou 10 questões num só dia e continuou estudando.','Fallaste 10 preguntas en un día y seguiste estudiando.','mount',function(S){return S.persist?1:0;},1,1);
M('resur','secret','g','Back from zero','Resurrección','Tirou menos de 50% e, depois, 90% ou mais no mesmo check.','Sacaste menos de 50% y después 90% o más en el mismo check.','rise',function(S){return S.resur?1:0;},1,1);
/* Game Mode medals */
function lvlOfXP(x){var l=1;while(x>=l*(l+1)*25)l++;return l;}
M('xp1000','game','b','1,000 XP','1.000 XP','Junte 1.000 XP no Modo Jogo.','Reúne 1.000 XP en el Modo Juego.','bolt',function(S){return S.xp;},1000);
M('xp5000','game','s','5,000 XP','5.000 XP','Junte 5.000 XP no Modo Jogo.','Reúne 5.000 XP en el Modo Juego.','bolt',function(S){return S.xp;},5000);
M('xp20000','game','g','20,000 XP','20.000 XP','Junte 20.000 XP no Modo Jogo.','Reúne 20.000 XP en el Modo Juego.','bolt',function(S){return S.xp;},20000);
M('lvl5','game','b','Level 5','Nivel 5','Chegue ao nível 5 no Modo Jogo.','Llega al nivel 5 en el Modo Juego.','star',function(S){return S.lvl;},5);
M('lvl10','game','s','Level 10','Nivel 10','Chegue ao nível 10 no Modo Jogo.','Llega al nivel 10 en el Modo Juego.','star',function(S){return S.lvl;},10);
M('lvl20','game','g','Level 20','Nivel 20','Chegue ao nível 20 no Modo Jogo.','Llega al nivel 20 en el Modo Juego.','star',function(S){return S.lvl;},20);
M('st1','game','b','First station','Primera estación','Conclua sua primeira estação no Modo Jogo.','Completa tu primera estación en el Modo Juego.','flag',function(S){return S.stN;},1);
M('st10','game','b','10 stations','10 estaciones','Conclua 10 estações no Modo Jogo.','Completa 10 estaciones en el Modo Juego.','flag',function(S){return S.stN;},10);
M('st25','game','s','25 stations','25 estaciones','Conclua 25 estações no Modo Jogo.','Completa 25 estaciones en el Modo Juego.','flag',function(S){return S.stN;},25);
M('st50','game','g','50 stations','50 estaciones','Conclua 50 estações no Modo Jogo.','Completa 50 estaciones en el Modo Juego.','flag',function(S){return S.stN;},50);
M('line15','game','s','Full line','Línea completa','Conclua 15 estações de uma mesma linha.','Completa 15 estaciones de una misma línea.','train',function(S){return S.lineMax;},15);
M('linesall','game','g','All lines','Todas las líneas','Conclua 15 estações em cada linha.','Completa 15 estaciones en cada línea.','train',function(S){return S.lineMin;},15);
M('rvperfect','game','s','Perfect review','Repaso perfecto','Acerte todas as questões da Revisão de uma estação.','Acierta todas las preguntas del Repaso de una estación.','crown',function(S){return S.g.rv?1:0;});
M('combo10','game','s','Combo ×10','Combo ×10','Faça um combo de 10 acertos seguidos.','Haz un combo de 10 aciertos seguidos.','bolt',function(S){return S.g.mc||0;},10);
M('combo25','game','g','Combo ×25','Combo ×25','Faça um combo de 25 acertos seguidos.','Haz un combo de 25 aciertos seguidos.','bolt',function(S){return S.g.mc||0;},25);
M('flawless','game','s','Flawless station','Estación impecable','Conclua uma estação sem perder nenhum leão.','Completa una estación sin perder ningún león.','check',function(S){return S.g.fl?1:0;});
M('ltpass','game','g','Level test passed','Prueba de nivel superada','Passe num teste de nível.','Supera una prueba de nivel.','cert',function(S){return S.ltPass?1:0;});
M('gstreak7','game','s','Frequent rider','Pasajero frecuente','Jogue o Modo Jogo 7 dias seguidos.','Juega el Modo Juego 7 días seguidos.','cal',function(S){return S.gRun;},7);
M('trip','game','b','Train driver','Maquinista','Faça o passeio de trem até a sua estação atual.','Haz el paseo en tren hasta tu estación actual.','train',function(S){return S.g.tr?1:0;});
M('lost3','secret','b','Out of lions','Sin leones','Perdeu os 3 leões numa estação.','Perdiste los 3 leones en una estación.','warn',function(S){return S.g.l3?1:0;},1,1);
M('ltfail','secret','b','Next time','La próxima','Não passou num teste de nível.','No superaste una prueba de nivel.','door',function(S){return S.ltFail?1:0;},1,1);
M('missed','secret','b','Missed the train','Perdiste el tren','Jogou o Modo Jogo depois da meia-noite.','Jugaste el Modo Juego pasada la medianoche.','moon',function(S){return S.g.mn?1:0;},1,1);
var BYID={};CAT.forEach(function(m){BYID[m.id]=m;});
/* ---------- statistics ---------- */
function pc(a){return a.total?a.score/a.total:0;}
var GLINES=ES?4:2;
function stats(all,x){
  x=x||{};var S={},days={},byKey={},chk={},wb={},gr={},hours={early:false,owl:false};
  var exN=0,prev=null;S.hurry=false;S.near=false;S.oops=false;S.persist=false;
  var wrong={},cnt={};
  all.forEach(function(a){
    var d=new Date(a.created_at),k=iso(d),h=d.getHours();days[k]=(days[k]||0)+1;
    if(h<7&&h>=4)hours.early=true;if(h>=22)hours.owl=true;
    var key=a.kind+'|'+a.lesson+'|'+a.ex;(byKey[key]=byKey[key]||[]).push(a);
    if(a.kind==='check'){(chk[a.lesson]=chk[a.lesson]||[]).push(a);var p=pc(a);
      if(p>=.9&&p<1)S.near=true;if(a.score===0&&a.total>0)S.oops=true;
      if(prev&&p<=.4&&a.total>0&&(d-new Date(prev.created_at))<=25000&&(d-new Date(prev.created_at))>=0)S.hurry=true;}
    else if(a.kind==='ex'){exN++;var e=String(a.ex);if(/^wb/.test(e))wb[a.lesson+'|'+e]=1;else if(/^l\d+g\d+/.test(e))gr[a.lesson+'|'+e]=1;}
    wrong[k]=(wrong[k]||0)+Math.max(0,(a.total||0)-(a.score||0));cnt[k]=(cnt[k]||0)+1;prev=a;});
  Object.keys(wrong).forEach(function(k){if(wrong[k]>=10&&cnt[k]>=6)S.persist=true;});
  S.exN=exN;S.wbN=Object.keys(wb).length;S.gramN=Object.keys(gr).length;S.early=hours.early;S.owl=hours.owl;
  /* checks */
  var best={},cs=0,ct=0,perf={};S.improvedCheck=false;S.resur=false;
  Object.keys(chk).forEach(function(l){var arr=chk[l],b=arr[0];arr.forEach(function(a){if(pc(a)>pc(b))b=a;if(a.total&&a.score===a.total)perf[l]=1;});best[l]=b;
    for(var i=1;i<arr.length;i++){if(pc(arr[i])>pc(arr[0])&&arr[i].score>arr[0].score)S.improvedCheck=true;}
    for(var i2=0;i2<arr.length;i2++)if(pc(arr[i2])<.5&&arr[i2].total)for(var j=i2+1;j<arr.length;j++)if(pc(arr[j])>=.9)S.resur=true;});
  Object.keys(best).forEach(function(l){cs+=best[l].score;ct+=best[l].total;});
  S.done=Object.keys(best).length;S.avg=ct?cs/ct:0;S.perfect=Object.keys(perf).length;
  S.stageN=STG.map(function(r){var n=0;for(var l=r[0];l<=r[1];l++)if(best[l])n++;return n;});
  /* fixed errors / stubborn */
  var fixed=0;S.stubborn=false;
  Object.keys(byKey).forEach(function(k){var arr=byKey[k],hadWrong=false,ok=false,run=0;
    arr.forEach(function(a){var bad=a.total&&a.score<a.total;if(bad){hadWrong=true;run++;if(run>=5)S.stubborn=true;}else{run=0;if(hadWrong&&a.total&&a.score===a.total)ok=true;}});
    if(ok)fixed++;});
  S.fixed=fixed;
  /* days: streaks, gaps */
  var ds=Object.keys(days).sort(),runs=[],r0=0,pt=null,maxRun=0;S.welcome=false;S.restart=false;
  ds.forEach(function(k,i){var t=new Date(k+'T12:00:00').getTime();
    if(pt!==null){var g=Math.round((t-pt)/864e5);if(g>=30)S.welcome=true;
      if(g===1)r0++;else{runs.push({len:r0+1,gap:g});r0=0;}}
    pt=t;});
  if(ds.length){runs.push({len:r0+1,gap:0});}
  runs.forEach(function(r,i){if(r.len>maxRun)maxRun=r.len;if(r.len>=7&&r.gap===2&&i<runs.length-1)S.restart=true;});
  S.maxRun=maxRun;
  /* weeks: goal and weekend */
  var goal=+x.goal||5,wk={},wend={};
  ds.forEach(function(k){var d=new Date(k+'T12:00:00'),dow=(d.getDay()+6)%7,mon=new Date(d);mon.setDate(d.getDate()-dow);var mk=iso(mon);wk[mk]=(wk[mk]||0)+1;
    if(dow>=5){(wend[mk]=wend[mk]||{})[dow]=1;}});
  var hit=Object.keys(wk).filter(function(k){return wk[k]>=goal;}).sort();S.weeksHit=hit.length;
  var gr2=0,gm=0,pv=null;hit.forEach(function(k){var t=new Date(k+'T12:00:00').getTime();gr2=(pv!==null&&Math.round((t-pv)/864e5)===7)?gr2+1:1;pv=t;if(gr2>gm)gm=gr2;});S.goalRun=gm;
  S.weekend=Object.keys(wend).some(function(k){return wend[k][5]&&wend[k][6];});
  S.certs=x.certs||0;S.top3=!!x.top3;S.days=days;
  var g=x.g||{};S.g=g;S.xp=x.xp||0;S.lvl=S.xp>0?lvlOfXP(S.xp):0;
  var lines={},stN=0;Object.keys(g.st||{}).forEach(function(k){stN++;var c=k.split('|')[0];lines[c]=(lines[c]||0)+1;});
  S.stN=stN;var lv=Object.keys(lines).map(function(c){return lines[c];}).sort(function(a,b){return b-a;});
  S.lineMax=lv[0]||0;S.lineMin=lv.length>=GLINES?lv[GLINES-1]:0;
  S.ltPass=!!x.ltPass;S.ltFail=!!x.ltFail;
  var gd=(g.gd||[]).slice().sort(),gr=0,gm=0,gp=null;gd.forEach(function(k){var t=new Date(k+'T12:00:00').getTime();gr=(gp!==null&&Math.round((t-gp)/864e5)===1)?gr+1:1;gp=t;if(gr>gm)gm=gr;});S.gRun=gm;
  return S;
}
function evalAll(S){return CAT.map(function(m){var v=Number(m.val(S))||0;return {m:m,have:v>=m.goal,p:Math.min(1,v/m.goal)};});}
/* ---------- data ---------- */
var C={ctx:null,uid:null,sb:null,all:null,extra:null,mine:null,busy:false,top:false};
function sbx(){return C.sb||(window.Gate&&Gate.sb);}
function loadAll(){
  if(C.all)return C.all;
  C.all=(async function(){var out=[],from=0,sb=sbx();
    for(;;){var r=await sb.from('attempts').select('kind,lesson,ex,score,total,created_at').order('created_at',{ascending:true}).range(from,from+999);
      if(r.error)break;out=out.concat(r.data||[]);if((r.data||[]).length<1000)break;from+=1000;}
    return out;})();
  return C.all;
}
async function loadExtra(){
  var sb=sbx(),x={goal:5,certs:0,top3:false};
  try{var u=C.uid;if(u){var p=await sb.from('profiles').select('weekly_goal').eq('id',u).maybeSingle();if(p&&p.data&&p.data.weekly_goal)x.goal=+p.data.weekly_goal;}}catch(e){}
  try{var c=await sb.from('certificates').select('id',{count:'exact',head:true});x.certs=(c&&c.count)||((c&&c.data&&c.data.length)||0);}catch(e){}
  try{var b=await sb.rpc('streak_board');var rows=(b&&b.data)||[];for(var i=0;i<Math.min(3,rows.length);i++)if(rows[i].me&&rows[i].cur>=3)x.top3=true;}catch(e){}
  try{var u2=C.uid;var q=await sb.from('game_xp').select('xp').eq('user_id',u2).maybeSingle();x.xp=(q&&q.data&&q.data.xp)||0;}catch(e){}
  try{var q2=await sb.from('game_stats').select('data').eq('user_id',C.uid).maybeSingle();C.gs=(q2&&q2.data&&q2.data.data)||{};}catch(e){C.gs={};}
  x.g=C.gs||{};
  try{var q3=await sb.from('level_tests').select('taken_at,passed').eq('user_id',C.uid);((q3&&q3.data)||[]).forEach(function(r){if(r.taken_at){if(r.passed)x.ltPass=true;else x.ltFail=true;}});}catch(e){}
  C.extra=x;return x;
}
async function loadMine(){
  var r=await sbx().from('user_medals').select('medal_id,tier,earned_at');var m={};((r&&r.data)||[]).forEach(function(x){m[x.medal_id]=x;});C.mine=m;return m;
}
function award(m,silent){
  return sbx().rpc('award_medal',{p_id:m.id,p_tier:m.tier,p_name:m.n[0],p_silent:!!silent}).then(function(r){return !r.error&&r.data===true;},function(){return false;});
}
/* ---------- check & announce ---------- */
var queue=[],showing=false;
function enq(m){if(!m||queue.some(function(q){return q.id===m.id;}))return;queue.push(m);}
async function check(){
  if(C.busy||!sbx()||!C.uid)return;C.busy=true;
  try{
    var prof=window.Gate&&Gate.profile&&Gate.profile();if(prof&&prof.is_admin)return;
    var all=await loadAll(),x=C.extra||await loadExtra(),mine=await loadMine(),S=stats(all,x),res=evalAll(S);
    var earned=res.filter(function(r){return r.have;});
    if(!mine._sync){
      for(var i=0;i<earned.length;i++)if(!mine[earned[i].m.id]){await award(earned[i].m,true);mine[earned[i].m.id]={medal_id:earned[i].m.id,earned_at:new Date().toISOString()};}
      await award({id:'_sync',tier:'b',n:['sync']},true);mine._sync=1;return;}
    for(var j=0;j<earned.length;j++){var m=earned[j].m;if(mine[m.id])continue;
      if(await award(m,false)){mine[m.id]={medal_id:m.id,earned_at:new Date().toISOString()};enq(m);}}
    if(queue.length)run();
  }catch(e){}finally{C.busy=false;}
}
/* ---------- sound: harp at the start and at the exit ---------- */
var AC=null;
function sndOn(){try{return localStorage.getItem('bl-medal-snd')!=='0';}catch(e){return true;}}
function tone(a,t,f,d,v){var o=a.createOscillator(),g=a.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.05);}
function harp(){
  if(!sndOn())return;
  try{var C0=window.AudioContext||window.webkitAudioContext;if(!C0)return;AC=AC||new C0();if(AC.state==='suspended')AC.resume();
    var a=AC,t=a.currentTime+.05,up=[523.25,659.25,783.99,1046.5,1318.5,1567.98];
    up.forEach(function(f,i){tone(a,t+.3+i*.09,f,1.8,.17);});
    up.slice().reverse().forEach(function(f,i){tone(a,t+6.9+i*.1,f,1.1,.12-.01*i);});}catch(e){}
}
/* ---------- banner ---------- */
var CSS='.mdb{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 14px);width:min(340px,92vw);height:68px;transform:translateX(-50%);z-index:100000;cursor:pointer;-webkit-tap-highlight-color:transparent}'
+'.mdb .gd{position:absolute;top:0;bottom:0;left:50%;width:60px;opacity:0;transform:translateX(-50%);border-radius:40px;border:1px solid #fff3c4;background:linear-gradient(#f1d985,#d9b24a 55%,#b88f2a);box-shadow:0 10px 30px #0009,0 0 24px #e6c56a88}'
+'.mdb.ts .gd{background:linear-gradient(#f6f8fb,#c4ccd9 55%,#929fb2);border-color:#fff;box-shadow:0 10px 30px #0009,0 0 24px #c4ccd999}'
+'.mdb.tb .gd{background:linear-gradient(#efc395,#c9803f 55%,#8f5622);border-color:#ffe0bf;box-shadow:0 10px 30px #0009,0 0 24px #c9803f88}'
+'.mdb .sc{position:absolute;top:50%;left:50%;width:60px;height:60px;border-radius:50%;background:radial-gradient(#1c3472,#0b1530);border:2px solid #e6c56a;padding:9px 12px;box-shadow:0 4px 14px #0009,0 0 18px #e6c56a77;opacity:0;transform:translate(-50%,-50%) scale(.6)}'
+'.mdb .sc svg{display:block;width:100%;height:100%;overflow:visible}.mdb .ol{fill:none;stroke:#e6c56a;stroke-width:5;stroke-dasharray:1;stroke-dashoffset:1;filter:drop-shadow(0 0 6px #e6c56a)}.mdb .fl{opacity:0;clip-path:inset(0 0 100% 0)}'
+'.mdb .t2{position:absolute;left:78px;right:14px;top:50%;transform:translateY(-50%);opacity:0;color:#1a1405;font-family:system-ui,sans-serif;line-height:1.2}'
+'.mdb .t2 small{display:block;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:#5a4510}.mdb .t2 b{display:block;font:700 16px Georgia,serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mdb .t2 span{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;font-size:11.5px;line-height:1.15;color:#3d3110;overflow:hidden}'
+'.mdb.go .gd{animation:mdg 8s cubic-bezier(.3,.8,.2,1) .1s forwards}.mdb.go .sc{animation:mds 8s ease .1s forwards}.mdb.go .t2{animation:mdt 8s ease .1s forwards}'
+'.mdb.go .ol{animation:mdd 1.3s ease-in-out .45s forwards,mdo .5s ease 1.8s forwards}.mdb.go .fl{animation:mdf 1s ease-out 1.35s forwards}'
+'@keyframes mdg{0%,28%{width:60px;opacity:0}29%{width:60px;opacity:1}38%,84%{width:100%;opacity:1}93%{width:60px;opacity:1}95%,100%{width:60px;opacity:0}}'
+'@keyframes mds{0%,4%{opacity:0;left:50%;transform:translate(-50%,-50%) scale(.6)}8%,29%{opacity:1;left:50%;transform:translate(-50%,-50%) scale(1.15)}38%,84%{opacity:1;left:36px;transform:translate(-50%,-50%) scale(1)}93%{opacity:1;left:50%;transform:translate(-50%,-50%) scale(1.15)}98%,100%{opacity:0;left:50%;transform:translate(-50%,-50%) scale(.6)}}'
+'@keyframes mdt{0%,39%{opacity:0}45%,83%{opacity:1}88%,100%{opacity:0}}@keyframes mdd{to{stroke-dashoffset:0}}@keyframes mdo{to{opacity:0}}@keyframes mdf{from{opacity:1;clip-path:inset(0 0 100% 0)}to{opacity:1;clip-path:inset(0 0 0 0)}}'
+'html.fx-off .mdb .gd{width:100%;opacity:1;animation:none!important}html.fx-off .mdb .sc{left:36px;opacity:1;transform:translate(-50%,-50%);animation:none!important}html.fx-off .mdb .t2{opacity:1;animation:none!important}html.fx-off .mdb .ol{display:none}html.fx-off .mdb .fl{opacity:1;clip-path:none;animation:none!important}'
+'.mgw{position:relative}.mg{display:grid;grid-template-columns:repeat(4,1fr);gap:12px 6px;margin:6px 0 4px}.mgw .md2{display:block!important;width:100%!important;min-width:0!important;min-height:0!important;margin:0!important;background:none!important;border:0!important;box-shadow:none!important;padding:0!important;color:inherit!important;font:inherit;font-size:11px!important;line-height:1.2;text-align:center;cursor:pointer;-webkit-tap-highlight-color:transparent;border-radius:0!important}.md2 span{display:block;margin-top:2px}'
+'.md2 svg{display:block;width:62px;height:67px;margin:0 auto 2px;overflow:visible;filter:drop-shadow(0 3px 5px #0005)}.md2.off svg{filter:grayscale(1) brightness(.85);opacity:.4}.md2.sec.off svg{opacity:.34}'
+'.mgt{font:700 12px system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;opacity:.75;margin:14px 0 4px;display:flex;justify-content:space-between}'
+'.mtip{position:absolute;z-index:5;width:min(280px,86%);background:#f4ecd6;color:#14214a;border:1px solid #c9a23c;border-radius:14px;padding:11px 14px;box-shadow:0 12px 30px #0007;font-size:13px;line-height:1.35;display:none}.mtip.on{display:block}'
+'.mtip b{display:block;font:700 15px Georgia,serif;margin-bottom:2px}.mtip em{display:block;font-style:normal;font-size:11px;margin-top:6px;color:#7a5f12;letter-spacing:.05em;text-transform:uppercase}'
+'.msnd{margin-top:10px}';
function css(){if(document.getElementById('mdcss'))return;var s=document.createElement('style');s.id='mdcss';s.textContent=CSS;document.head.appendChild(s);}
function shield(){var b=(window.BL_BASE||'');return '<svg viewBox="0 0 240 281"><path class="ol" pathLength="1" d="M120 8C84 24 44 28 10 26V128c0 70 50 118 110 145 60-27 110-75 110-145V26C196 28 156 24 120 8z"/><image class="fl" href="'+b+'img/britland-shield.png" width="240" height="281"/></svg>';}
function run(){
  if(showing||!queue.length)return;showing=true;css();
  var m=queue.shift(),b=el('div','mdb t'+m.tier);b.setAttribute('role','status');b.setAttribute('aria-live','polite');
  b.innerHTML='<div class="gd"></div><div class="sc">'+shield()+'</div><div class="t2"><small></small><b></b><span></span></div>';
  b.querySelector('small').textContent=s('unlocked');b.querySelector('b').textContent=m.n[L];b.querySelector('span').textContent=m.h[L];
  document.body.appendChild(b);void b.offsetWidth;b.classList.add('go');harp();
  var done=false;function end(){if(done)return;done=true;b.remove();showing=false;setTimeout(run,1100);}
  b.addEventListener('click',end);setTimeout(end,document.documentElement.classList.contains('fx-off')?5000:8300);
}
/* ---------- grid (profile page) ---------- */
function fmt(d){try{return new Date(d).toLocaleDateString(ES?'es':'pt-BR',{day:'numeric',month:'short',year:'numeric'});}catch(e){return '';}}
async function render(box,all){
  css();defsSvg();var x=C.extra||await loadExtra();var mine={};try{mine=await loadMine();}catch(e){}
  var S=stats(all||await loadAll(),x),res=evalAll(S);
  var wrap=el('div','mgw'),tip=el('div','mtip');wrap.appendChild(tip);
  var tot=0,got=0;
  ['streak','checks','ex','stages','special','game','secret'].forEach(function(g){
    var items=res.filter(function(r){return r.m.g===g;});if(!items.length)return;
    var n=items.filter(function(r){return r.have||mine[r.m.id];}).length;tot+=items.length;got+=n;
    var h=el('div','mgt');h.appendChild(el('span','',STR.g[g][L]));h.appendChild(el('span','',n+'/'+items.length));wrap.appendChild(h);
    var grid=el('div','mg');
    items.forEach(function(r){var m=r.m,has=r.have||!!mine[m.id],hidden=m.secret&&!has;
      var b=el('button','md2 '+m.tier+(has?' on':' off')+(m.secret?' sec':''));b.type='button';
      b.innerHTML=medalSvg(m,has,hidden);b.appendChild(el('span','',hidden?'???':m.n[L]));
      b.addEventListener('click',function(e){e.stopPropagation();
        tip.textContent='';var t=el('b','',hidden?'???':m.n[L]);tip.appendChild(t);
        tip.appendChild(document.createTextNode(hidden?s('secret'):m.h[L]));
        var em=el('em','',has?(s('earned')+(mine[m.id]?fmt(mine[m.id].earned_at):'')):(hidden?'':s('notyet')));if(em.textContent)tip.appendChild(em);
        tip.classList.add('on');var wr=wrap.getBoundingClientRect(),br=b.getBoundingClientRect();
        var w=tip.offsetWidth,left=Math.max(0,Math.min(wr.width-w,br.left-wr.left+br.width/2-w/2));
        tip.style.left=left+'px';tip.style.top=(br.bottom-wr.top+6)+'px';});
      grid.appendChild(b);});
    wrap.appendChild(grid);});
  document.addEventListener('click',function(){tip.classList.remove('on');});
  box.appendChild(wrap);
  /* next medal */
  var nx=res.filter(function(r){return !r.have&&!mine[r.m.id]&&!r.m.secret;}).sort(function(a,b){return b.p-a.p;})[0];
  if(nx){var nb=el('div','pbar');var sm=el('span','sm',s('next'));nb.appendChild(sm);nb.appendChild(el('b','',' · '+nx.m.n[L]));var bar=el('div','bar');var i=el('i');i.style.width=Math.round(nx.p*100)+'%';bar.appendChild(i);nb.appendChild(bar);box.appendChild(nb);}
  /* sound switch */
  var sb2=el('button','btn msnd');sb2.type='button';function lab(){sb2.textContent=s('snd')+': '+(sndOn()?s('on'):s('off'));}lab();
  sb2.onclick=function(){try{localStorage.setItem('bl-medal-snd',sndOn()?'0':'1');}catch(e){}lab();if(sndOn())harp();};box.appendChild(sb2);
  return {got:got,tot:tot};
}
/* ---------- hooks ---------- */
function hook(){
  if(!window.Gate||!Gate.start||Gate.__md)return;Gate.__md=1;
  var st=Gate.start;Gate.start=function(o,cb){return st.call(Gate,o,function(ctx){
    try{C.ctx=ctx;C.uid=ctx&&ctx.user&&ctx.user.id;C.sb=Gate.sb;}catch(e){}
    var r;try{r=cb&&cb(ctx);}finally{setTimeout(check,1800);}return r;});};
  var sa=Gate.saveAttempt;if(sa)Gate.saveAttempt=function(kind,a){var p=sa.apply(Gate,arguments);
    try{Promise.resolve(p).then(function(){if(C.all)C.all.then(function(arr){arr.push({kind:kind,lesson:a.l,ex:a.e,score:a.s,total:a.total!==undefined?a.total:a.t,created_at:new Date().toISOString()});setTimeout(check,400);});});}catch(e){}return p;};
}
/* Game Mode counters (written by duo.js / metro.js): Medals.game(function(d){...}) mutates the student's row in game_stats */
var gsT=null,gsD=null;
function game(fn){
  try{if(!sbx()||!C.uid)return;
  (async function(){if(!C.gs){try{var q=await sbx().from('game_stats').select('data').eq('user_id',C.uid).maybeSingle();C.gs=(q&&q.data&&q.data.data)||{};}catch(e){C.gs={};}}
    fn(C.gs);gsD=1;clearTimeout(gsT);gsT=setTimeout(function(){gsD=null;
      sbx().from('game_stats').upsert({user_id:C.uid,data:C.gs,updated_at:new Date().toISOString()}).then(function(){C.extra=null;setTimeout(check,2500);},function(){});},1500);})();
  }catch(e){}
}
window.Medals={svg:function(id){var m=BYID[id];if(!m)return '';defsSvg();return medalSvg(m,true,false);},game:game,render:render,check:check,cat:CAT,stats:stats,evalAll:evalAll,_C:C,_harp:harp,_announce:function(id){var m=BYID[id];if(m){enq(m);run();}}};
hook();
})();
