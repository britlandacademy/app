/* Nota da prova: as partes oficiais do livro (total 50, minimo de 30 no exam) + conversa do professor separada (15). 
   BL_EXAM.compose(scores, maxes, oral) -> {rows, T, M, written:{s,m}, oral:{s,m,done}, pct, ok}
   oral = {q:[{q:'pergunta', e:'resposta esperada', s:[entendeu0-1, completa0-1, gramatica0-2, pronuncia0-1] (null = sem nota)}]} */
(function(){
var PATH_ES=/\/espanol\//.test(location.pathname);   /* Spanish exam: 100 points, pass mark 60% (course argument overrides the path) */
var LAB_ES={dictation:'Dictado',yesno:'S\u00ed/No',mc:'Opci\u00f3n m\u00faltiple',err:'Correcci\u00f3n de errores',gap:'Test de vocabulario',oral:'Comprensi\u00f3n oral',orala:'Conversa'};
var LAB_EN={dictation:'Ditado',yesno:'Yes/No',mc:'M\u00faltipla escolha',err:'Corre\u00e7\u00e3o de erros',gap:'Gap fill',oral:'Listening (escolha oral)',orala:'Conversa'};
function isES(c){return c?c==='es':PATH_ES;}
function labels(c){return isES(c)?LAB_ES:LAB_EN;}
var LABEL=labels();
var CRIT=[['Comprehension',1],['Fluency',1],['Grammar',1],['Pronunciation',2]];
function r1(x){return Math.round(x*10)/10;}
function oralTot(o){var s=0,done=false,q=(o&&o.q)||[];if(!q.length)return {s:0,m:15,done:false};
  done=q.every(function(x){return x.s&&x.s.length===4&&x.s.every(function(v){return v!=null;});});
  q.forEach(function(x){(x.s||[]).forEach(function(v){s+=(v||0);});});return {s:s,m:15,done:done};}
function compose(sc,mx,oral,course){var ES=isES(course),LABEL=labels(course);
  sc=sc||{};mx=mx||{};var rows=[],T=0,M=0,k;
  for(k in mx){if(!mx[k])continue;var s=r1(sc[k]||0);rows.push({id:k,label:LABEL[k]||k,s:s,m:mx[k]});T+=s;M+=mx[k];}
  var o=oralTot(oral),min=ES?r1(M*0.6):30;T=r1(T);
  return {rows:rows,T:T,M:M,min:min,written:{s:T,m:M},oral:o,grand:r1(T+o.s),pct:M?Math.round(100*T/M):0,ok:T>=min};}
function fmt(n){return String(r1(n));}
function line(c){return fmt(c.T)+'/'+c.M+(c.oral.done?' \u00b7 conversa '+c.oral.s+'/15':' \u00b7 conversa pendente');}
window.BL_EXAM={CRIT:CRIT,LABEL:LABEL,labels:labels,compose:compose,line:line,fmt:fmt,oralTot:oralTot};
})();
