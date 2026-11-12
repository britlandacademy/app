/* Nota da prova: as partes oficiais do livro (total 50, minimo de 30 no exam) + conversa do professor separada (15). 
   BL_EXAM.compose(scores, maxes, oral) -> {rows, T, M, written:{s,m}, oral:{s,m,done}, pct, ok}
   oral = {q:[{q:'pergunta', e:'resposta esperada', s:[entendeu0-1, completa0-1, gramatica0-2, pronuncia0-1] (null = sem nota)}]} */
(function(){
var LABEL={dictation:'Ditado',yesno:'Yes/No',mc:'M\u00faltipla escolha',err:'Corre\u00e7\u00e3o de erros',gap:'Gap fill',oral:'Listening (escolha oral)',orala:'Conversa'};
var CRIT=[['Entendeu',1],['Completa',1],['Gram\u00e1tica',2],['Pron\u00fancia',1]];
function r1(x){return Math.round(x*10)/10;}
function oralTot(o){var s=0,done=false,q=(o&&o.q)||[];if(!q.length)return {s:0,m:15,done:false};
  done=q.every(function(x){return x.s&&x.s.length===4&&x.s.every(function(v){return v!=null;});});
  q.forEach(function(x){(x.s||[]).forEach(function(v){s+=(v||0);});});return {s:s,m:15,done:done};}
function compose(sc,mx,oral){
  sc=sc||{};mx=mx||{};var rows=[],T=0,M=0,k;
  for(k in mx){if(!mx[k])continue;var s=r1(sc[k]||0);rows.push({id:k,label:LABEL[k]||k,s:s,m:mx[k]});T+=s;M+=mx[k];}
  var o=oralTot(oral);T=r1(T);
  return {rows:rows,T:T,M:M,written:{s:T,m:M},oral:o,grand:r1(T+o.s),pct:M?Math.round(100*T/M):0,ok:T>=30};}
function fmt(n){return String(r1(n));}
function line(c){return fmt(c.T)+'/'+c.M+(c.oral.done?' \u00b7 conversa '+c.oral.s+'/15':' \u00b7 conversa pendente');}
window.BL_EXAM={CRIT:CRIT,LABEL:LABEL,compose:compose,line:line,fmt:fmt,oralTot:oralTot};
})();
