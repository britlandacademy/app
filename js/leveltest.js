/* Level test: ?lt=<stage> on check.html. Draws 20 random Lesson Check questions from the whole Stage; 80% or more passes the Stage
   (server side: level_test_submit moves "Liberado até" to the next Stage). LevelTest.run({groups:[{title,pre,items:[{why,ans,make}]}]}) */
(function(){
  var W=window;
  function stage(){var q=parseInt(new URLSearchParams(W.location.search).get('lt'),10);return q>0?q:0;}
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function back(msg){try{if(msg)sessionStorage.setItem('bl-lt-msg',JSON.stringify(msg));}catch(e){}W.location.href='index.html';}
  function run(o){
    var S=stage();if(!S||!W.Duo)return false;
    var pairs=[];(o.groups||[]).forEach(function(g){g.items.forEach(function(it,k){pairs.push([g,k]);});});
    pairs=shuffle(pairs).slice(0,20);
    var by=[];pairs.forEach(function(p){var e=null;by.forEach(function(x){if(x.g===p[0])e=x;});if(!e){e={g:p[0],idx:[]};by.push(e);}e.idx.push(p[1]);});
    var groups=by.map(function(e){return {title:e.g.title,pre:e.g.pre,items:e.idx.sort(function(a,b){return a-b;}).map(function(k){return e.g.items[k];})};});
    var N=groups.length,done=0,R=0,T=0,res=null;
    if(!N){back(null);return true;}
    groups.forEach(function(g){g.save=function(r,t){R+=r;T+=t;done++;if(done<N)return Promise.resolve();
      return W.Gate.sb.rpc('level_test_submit',{p_stage:S,p_score:R,p_total:T}).then(function(x){if(x.error)throw x.error;res=x.data;});};});
    var inf=null;try{if(W.Metro&&Metro.info){inf=Metro.info('London',1)||Metro.info('Madrid',1);if(inf)inf.station='Test';}}catch(e){}
    Duo.start({groups:groups,nolives:true,next:null,station:inf,passMin:.8,
      verdict:function(r,t){return t&&r/t>=.8?'80% ou mais: você passou neste Stage! / ¡80 % o más: pasaste esta Etapa!':'Você precisa de 80% para passar. / Necesitas 80 % para pasar.';},
      onDone:function(){if(res&&res.ok)back({pass:!!res.passed,pct:res.pct,next:res.next,stage:S});else back(null);}});
    return true;
  }
  W.LevelTest={stage:stage,run:run};
})();
