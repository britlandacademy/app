/* Britland teacher panel: weekly tips sent to students and their thumbs rating. */
(function(){
'use strict';
function fmt(d){var p=String(d).split('-');return p[2]+'/'+p[1];}
window.TipsAdmin={mount:function(box,o){
  var el=o.el;box.textContent='Carregando…';
  o.sb.from('weekly_tips').select('id,user_id,week_start,kind,body,stats,rating,rated_at,seen_at').order('week_start',{ascending:false}).limit(120).then(function(r){
    box.textContent='';
    if(r.error){box.append(el('p',{},['Não foi possível carregar: '+r.error.message]));return;}
    var rows=r.data||[],nm={};(o.profiles()||[]).forEach(function(p){nm[p.id]=p.name||p.email||'';});
    var up=rows.filter(function(x){return x.rating===1;}).length,dn=rows.filter(function(x){return x.rating===-1;}).length,seen=rows.filter(function(x){return x.seen_at;}).length;
    box.append(el('p',{},['Relatórios: '+rows.length+' · abertos: '+seen+' · 👍 '+up+' · 👎 '+dn+'. Enviados todo sábado, às 10h.']));
    if(!rows.length){box.append(el('p',{},['Nenhum relatório ainda. O primeiro sai no próximo sábado.']));return;}
    rows.forEach(function(x){
      var d=el('details',{class:'mtile',style:'display:block'}),sm=el('summary',{style:'cursor:pointer;font-weight:700'},[fmt(x.week_start)+' · '+(nm[x.user_id]||'Aluno')+' · '+(x.kind==='ai'?'IA':'texto fixo')+' · '+(x.rating===1?'👍':x.rating===-1?'👎':(x.seen_at?'lido':'não aberto'))]);
      d.append(sm);var b=x.body||{};d.append(el('p',{},[b.praise||'']));
      (b.fixes||[]).forEach(function(f){d.append(el('p',{},[el('b',{},[f.t||'']),' — '+(f.d||'')+' '+(f.e||'')]));});
      d.append(el('p',{},[b.closing||'']));
      if(x.stats)d.append(el('small',{},['Semana: '+(x.stats.n_ex||0)+' exercícios · '+(x.stats.days||0)+' dia(s) · '+(x.stats.avg_pct==null?'–':x.stats.avg_pct+'%')+' de acerto']));
      box.append(d);
    });
  },function(e){box.textContent='Erro ao carregar.';});
}};
})();
