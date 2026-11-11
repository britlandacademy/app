/* Britland teacher panel: weekly tips sent to students and their thumbs rating. */
(function(){
'use strict';
function fmt(d){var p=String(d).split('-');return p[2]+'/'+p[1];}
var FILTERS=[['wk','Esta semana'],['all','Todas'],['dn','👎 só'],['new','Não abertos']];
window.TipsAdmin={mount:function(box,o){
  var el=o.el;box.textContent='Carregando…';
  var st=document.createElement('style');st.textContent='.tpq{background:var(--surface);border-left:4px solid var(--accent);padding:9px 11px;border-radius:0 10px 10px 0;margin:8px 0 0}.tpd{display:block;width:100%;padding:0}.tpd>summary{list-style:none;display:flex;align-items:center;gap:12px;cursor:pointer;padding:12px 14px;min-height:44px}.tpd>summary::-webkit-details-marker{display:none}.tpd .tpb{padding:0 14px 12px}.tpd .tpv{transition:transform .2s}.tpd[open] .tpv{transform:rotate(180deg)}.tpav{width:40px;height:40px;border-radius:50%;background:var(--surface);border:2px solid var(--line);display:flex;align-items:center;justify-content:center;font-weight:700;flex:none}.tpl{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--muted);font-size:.9rem}.tpst{font-size:.85rem;color:var(--muted);white-space:nowrap}.tpf{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}.tpf .chp.on{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}';document.head.append(st);
  o.sb.from('weekly_tips').select('id,user_id,week_start,kind,body,stats,rating,rated_at,seen_at').order('week_start',{ascending:false}).limit(120).then(function(r){
    box.textContent='';
    if(r.error){box.append(el('p',{},['Não foi possível carregar: '+r.error.message]));return;}
    var rows=r.data||[],nm={};(o.profiles()||[]).forEach(function(p){nm[p.id]=p.name||p.email||'';});
    var up=rows.filter(function(x){return x.rating===1;}).length,dn=rows.filter(function(x){return x.rating===-1;}).length,seen=rows.filter(function(x){return x.seen_at;}).length;
    box.append(el('p',{class:'hint'},['Relatórios: '+rows.length+' · abertos: '+seen+' · 👍 '+up+' · 👎 '+dn+'. Enviados todo sábado, às 10h.']));
    if(!rows.length){box.append(el('p',{},['Nenhum relatório ainda. O primeiro sai no próximo sábado.']));return;}
    var last=rows[0].week_start,cur='wk',bar=el('div',{class:'tpf',role:'group','aria-label':'Filtro'}),list=el('div');
    function text(b){b=b||{};var t=b.praise||'';if(!t&&(b.fixes||[])[0])t=b.fixes[0].t||'';return t||b.closing||'';}
    function ok(x){return cur==='all'||(cur==='wk'&&x.week_start===last)||(cur==='dn'&&x.rating===-1)||(cur==='new'&&!x.seen_at);}
    function draw(){
      list.textContent='';var n=0;
      rows.forEach(function(x){if(!ok(x))return;n++;
        var who=nm[x.user_id]||'Aluno',b=x.body||{};
        var d=el('details',{class:'mtile tpd'}),
            stt=x.rating===1?'👍':x.rating===-1?'👎':(x.seen_at?'lido':'novo');
        d.append(el('summary',{},[el('span',{class:'tpav','aria-hidden':'true'},[(who.trim()[0]||'?').toUpperCase()]),
          el('span',{style:'flex:1;min-width:0'},[el('b',{},[who+' · '+fmt(x.week_start)]),el('div',{class:'tpl'},[text(b)])]),
          el('span',{class:'tpst'},[stt]),el('span',{class:'tpv','aria-hidden':'true'},['▾'])]));
        var body=el('div',{class:'tpb'});
        body.append(el('small',{},[(x.kind==='ai'?'Texto da IA':'Texto fixo')]));
        if(b.praise)body.append(el('div',{class:'tpq'},[b.praise]));
        (b.fixes||[]).forEach(function(f){body.append(el('div',{class:'tpq'},[el('b',{},[f.t||'']),' — '+(f.d||'')+' '+(f.e||'')]));});
        if(b.closing)body.append(el('div',{class:'tpq'},[b.closing]));
        if(x.stats)body.append(el('p',{class:'hint'},['Semana: '+(x.stats.n_ex||0)+' exercícios · '+(x.stats.days||0)+' dia(s) · '+(x.stats.avg_pct==null?'–':x.stats.avg_pct+'%')+' de acerto']));
        d.append(body);list.append(d);});
      if(!n)list.append(el('p',{class:'hint'},['Nenhum relatório neste filtro.']));
    }
    FILTERS.forEach(function(f){var c=el('button',{type:'button',class:'chp'+(f[0]===cur?' on':''),'aria-pressed':f[0]===cur?'true':'false'},[f[1]]);
      c.addEventListener('click',function(){cur=f[0];bar.querySelectorAll('.chp').forEach(function(z){var on=z===c;z.classList.toggle('on',on);z.setAttribute('aria-pressed',on?'true':'false');});draw();});bar.append(c);});
    box.append(bar,list);draw();
  },function(e){box.textContent='Erro ao carregar.';});
}};
})();
