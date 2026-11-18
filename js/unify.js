/* Painel unico (ingles + espanhol). Envolve o cliente Supabase do painel do professor:
   - tabelas de ensino por aluno (tentativas, provas, planos, aulas registradas...) existem em dois lugares: "public" (ingles) e "es" (espanhol).
     As leituras juntam os dois; as gravacoes vao para o esquema do curso do aluno (profiles.course).
   - sb.course('es'|'en') devolve o cliente do esquema do curso (para conteudo, provas por etapa, links de aula).
   - sb.courseOf(uid) -> 'en'|'es' (depois de sb.ready()). */
(function(){
var PER_USER={attempts:1,attempt_errors:1,certificates:1,class_log:1,class_attendance:1,plan_progress:1,plan_links:1,plan_tabs:1,review_results:1,class_suggestions:1,class_ratings:1,exam_release:1,exam_results:1,stage_unlock:1,level_tests:1};
var CRS={};
function uidsOf(ops){
  var out=null;
  ops.forEach(function(o){var k=o[0],a=o[1];
    if((k==='eq')&&a[0]==='user_id'&&a[1]){out=(out||[]).concat([a[1]]);}
    else if(k==='in'&&a[0]==='user_id'&&Array.isArray(a[1])){out=(out||[]).concat(a[1]);}
  });
  return out;
}
function mergeRes(rs,ops){
  var err=null,data=null,count=null,single=ops.some(function(o){return o[0]==='single'||o[0]==='maybeSingle';});
  rs.forEach(function(r){if(!r)return;if(r.error&&!err)err=r.error;if(r.count!=null)count=(count||0)+r.count;});
  if(single){var f=rs.filter(function(r){return r&&r.data;})[0];data=f?f.data:null;}
  else{rs.forEach(function(r){if(r&&Array.isArray(r.data))data=(data||[]).concat(r.data);else if(r&&r.data&&data==null)data=r.data;});
    if(Array.isArray(data)){
      var ord=ops.filter(function(o){return o[0]==='order';});
      if(ord.length&&rs.length>1){data.sort(function(a,b){for(var i=0;i<ord.length;i++){var c=ord[i][1][0],asc=!(ord[i][1][1]&&ord[i][1][1].ascending===false);var x=a[c],y=b[c];if(x===y)continue;if(x==null)return 1;if(y==null)return -1;return (x<y?-1:1)*(asc?1:-1);}return 0;});}
      var lim=ops.filter(function(o){return o[0]==='limit';})[0];if(lim&&rs.length>1)data=data.slice(0,lim[1][0]);}}
  return {data:data,error:err,count:count,status:err?400:200,statusText:err?'error':'OK'};
}
function wrap(sb){
  if(sb&&sb.__unified)return sb;
  var es=sb.schema('es'),loaded=null;
  function client(c){return c==='es'?es:sb;}
  function ready(){return loaded||(loaded=Promise.resolve(sb.from('profiles').select('id,course')).then(function(r){((r&&r.data)||[]).forEach(function(x){CRS[x.id]=x.course==='es'?'es':'en';});return CRS;}).catch(function(){loaded=null;return CRS;}));}
  function courseOf(u){return CRS[u]==='es'?'es':'en';}
  function replay(c,table,ops){var b=client(c).from(table);ops.forEach(function(o){b=b[o[0]].apply(b,o[1]);});return b;}
  function from(t){
    if(!PER_USER[t])return sb.from(t);
    var ops=[],done=null,self={};
    function run(){
      if(done)return done;
      done=ready().then(function(){
        var first=ops[0]?ops[0][0]:'select',rows=ops[0]&&ops[0][1][0];
        if(first==='insert'||first==='upsert'){
          var arr=Array.isArray(rows)?rows:[rows],g={en:[],es:[]};
          arr.forEach(function(r){g[courseOf(r&&r.user_id)].push(r);});
          var jobs=[];
          ['en','es'].forEach(function(c){if(!g[c].length)return;var o2=ops.slice();o2[0]=[first,[Array.isArray(rows)?g[c]:g[c][0]].concat(ops[0][1].slice(1))];jobs.push(replay(c,t,o2));});
          return Promise.all(jobs).then(function(rs){return mergeRes(rs,ops);});
        }
        var us=uidsOf(ops),cs;
        if(us&&us.length){var m={};us.forEach(function(u){m[courseOf(u)]=1;});cs=Object.keys(m);}else cs=['en','es'];
        return Promise.all(cs.map(function(c){return replay(c,t,ops);})).then(function(rs){return mergeRes(rs,ops);});
      });
      return done;
    }
    var px=new Proxy(self,{get:function(tg,k){
      if(k==='then'||k==='catch'||k==='finally')return function(){var p=run();return p[k].apply(p,arguments);};
      if(typeof k!=='string')return undefined;
      return function(){ops.push([k,[].slice.call(arguments)]);return px;};
    }});
    return px;
  }
  function rpc(name,args,opt){
    var u=args&&args.p_user;
    if(!u)return sb.rpc(name,args,opt);
    return ready().then(function(){return client(courseOf(u)).rpc(name,args,opt);});
  }
  var api={__unified:true,from:from,rpc:rpc,ready:ready,courseOf:courseOf,course:client};
  return new Proxy(sb,{get:function(t,k){
    if(k in api)return api[k];
    var v=t[k];return typeof v==='function'?v.bind(t):v;
  }});
}
window.BL_UNIFY={wrap:wrap,courses:CRS};
})();
