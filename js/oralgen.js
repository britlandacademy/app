/* Sorteio das perguntas da prova oral: pergunta do livro (bloco "qa" das lessons do Stage), com troca de UMA palavra/expressao
   por outra da lista de vocabulario da mesma lesson. Toda palavra usada ja apareceu nas lessons ate o fim do Stage. */
(function(){
var CACHE={};
function toks(s){return String(s||'').toLowerCase().replace(/[’‘]/g,"'").match(/[a-z0-9']+/g)||[];}
function esc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function rnd(a){return a[Math.floor(Math.random()*a.length)];}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
async function load(sb,stage){
  if(CACHE[stage])return CACHE[stage];
  var st=window.STG||[[1,12],[13,27],[28,44],[45,63],[64,82],[83,101],[102,120],[121,138],[139,156],[157,174],[175,190],[191,206]];
  var lo=st[stage-1][0],hi=st[stage-1][1];
  var r=await sb.from('content').select('lesson,body').eq('kind','text').gte('lesson',1).lte('lesson',hi).order('lesson',{ascending:true}).limit(1000);
  if(r.error)throw r.error;
  var V={},pool=[],voc={};
  (r.data||[]).forEach(function(row){
    (row.body||[]).forEach(function(b){
      var k=b[0];
      if(k==='v'){(b[1]||[]).forEach(function(w){toks(w).forEach(function(t){V[t]=1;});(voc[row.lesson]=voc[row.lesson]||[]).push(String(w).trim());});}
      else if(k==='qa'){toks(b[1]).concat(toks(b[2])).forEach(function(t){V[t]=1;});
        if(row.lesson>=lo&&row.lesson<=hi){var q=String(b[1]||'').trim(),a=String(b[2]||'').split(' ~ ')[0].trim(),n=toks(q).length;
          if(n>=3&&n<=14&&a&&!/chart|\d/i.test(q+' '+a))pool.push({lesson:row.lesson,q:q,e:a});}}
      else if(k==='s'){toks(b[1]).forEach(function(t){V[t]=1;});}
      else if(k==='d'){toks(b[2]).forEach(function(t){V[t]=1;});}
    });
  });
  return CACHE[stage]={V:V,pool:pool,voc:voc};
}
function alter(c,voc){
  var list=voc[c.lesson]||[],hits=[];
  list.forEach(function(w){
    if(w.length<3)return;
    var re=new RegExp('(^|[^A-Za-z’\'])'+esc(w)+'(?![A-Za-z’\'])','i');
    if(re.test(c.q)&&re.test(c.e))hits.push(w);});
  if(!hits.length)return null;
  var w=rnd(hits),art=/^(a|an|the)\s/i.test(w),nw=w.split(/\s+/).length;
  var others=list.filter(function(x){return x.toLowerCase()!==w.toLowerCase()&&x.split(/\s+/).length===nw&&/^(a|an|the)\s/i.test(x)===art&&!/[,;()]/.test(x);});
  if(!others.length)return null;
  var n2=rnd(others),re2=new RegExp('(^|[^A-Za-z’\'])'+esc(w)+'(?![A-Za-z’\'])','ig');
  var f=function(s){return s.replace(re2,function(m,p){return p+n2;});};
  return {lesson:c.lesson,q:f(c.q),e:f(c.e),alt:true,from:c.q};
}
async function gen(sb,stage,n,avoid){
  var D=await load(sb,stage),used={};(avoid||[]).forEach(function(x){used[x]=1;});
  var out=[],lessons={},pool=shuffle(D.pool);
  for(var pass=0;pass<2&&out.length<n;pass++){
    for(var i=0;i<pool.length&&out.length<n;i++){
      var c=pool[i];if(used[c.q]||(pass===0&&lessons[c.lesson]))continue;
      var x=(Math.random()<.7?alter(c,D.voc):null)||{lesson:c.lesson,q:c.q,e:c.e,alt:false};
      used[c.q]=1;lessons[c.lesson]=1;out.push({q:x.q,e:x.e,alt:!!x.alt,lesson:x.lesson,s:[null,null,null,null]});}
  }
  return out;
}
async function unknown(sb,stage,text){var D=await load(sb,stage);return toks(text).filter(function(t){return !D.V[t];});}
window.BL_ORAL={gen:gen,unknown:unknown,load:load};
})();
