/* Review quiz: ?rev=<from>-<to>&rid=<n>. Draws ~3 questions from each of the 4 lessons.
   Review.run({tab,cands:function(lessonId)->[{title,pre,items:[{why,ans,make}]}]}) */
(function(){
  var W=window;
  function params(){
    var q=new URLSearchParams(W.location.search),r=(q.get('rev')||'').match(/^(\d+)-(\d+)$/),id=parseInt(q.get('rid'),10);
    return r&&id?{from:+r[1],to:+r[2],rid:id}:null;
  }
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function back(msg){try{if(msg)sessionStorage.setItem('bl-rev-msg',JSON.stringify(msg));}catch(e){}W.location.href='index.html';}
  function save(tab,rid,s,t){
    return Gate.sb.from('review_results').insert({tab:tab,rid:rid,score:s,total:t}).then(function(r){if(r&&r.error)throw r.error;});
  }
  function run(o){
    var p=params();if(!p||!W.Duo)return false;
    var groups=[];
    for(var l=p.from;l<=p.to;l++){
      var cs=shuffle(o.cands(l)||[]),need=3;
      for(var i=0;i<cs.length&&need>0;i++){
        var g=cs[i],idx=shuffle(g.items.map(function(_,k){return k;})).slice(0,need).sort(function(a,b){return a-b;});
        if(!idx.length)continue;need-=idx.length;
        groups.push({title:g.title,pre:g.pre,items:idx.map(function(k){return g.items[k];})});
      }
    }
    var N=groups.length,done=0,R=0,T=0;
    if(!N){save(o.tab,p.rid,1,1).then(function(){back({pass:true,pct:100});},function(){back(null);});return true;}
    groups.forEach(function(g){g.save=function(r,t){R+=r;T+=t;done++;if(done<N)return Promise.resolve();return save(o.tab,p.rid,R,T);};});
    var anySaved=false;
    Duo.start({groups:groups,nolives:true,next:null,
      verdict:function(r,t){var ok=t&&r/t>=.7;return ok?'Review aprovada! A próxima estação está aberta.':'Você precisa de 70% para abrir a próxima estação. Volte e tente a Review de novo.';},
      onDone:function(saved){anySaved=saved;var pct=T?Math.round(100*R/T):0;back(done>=N?{pass:pct>=70,pct:pct}:null);}});
    return true;
  }
  W.Review={params:params,run:run};
})();
