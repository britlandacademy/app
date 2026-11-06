/* Britland: weekly tips ("dicas da semana") card on the student home + full message with thumbs. Shared by EN and ES. */
(function(){
'use strict';
var CSS='.tipc{margin:0 0 16px;padding:16px;border:2px solid var(--acc);border-radius:14px;background:var(--card)}'+
'.tipc .tb,.tipm .tb{display:inline-block;margin:0 0 8px;padding:3px 10px;border-radius:999px;background:var(--acc);color:var(--hli,#111);font-size:.8rem;font-weight:800}'+
'.tipc h2{margin:0 0 6px;font-size:1.15rem}.tipc p{margin:0 0 12px;color:var(--ink)}'+
'.tipc button,.tipm .tx button.go{min-height:44px;padding:8px 16px;border:2px solid var(--acc);border-radius:10px;background:transparent;color:var(--ink);font:inherit;font-weight:800;cursor:pointer}'+
'.tipm{position:fixed;inset:0;z-index:2000;display:flex;align-items:flex-start;justify-content:center;padding:16px;background:rgba(0,0,0,.6);overflow:auto}'+
'.tipm .tx{width:100%;max-width:560px;margin:auto;padding:18px;border:2px solid var(--acc);border-radius:16px;background:var(--card);color:var(--ink)}'+
'.tipm h2{margin:0 0 10px;font-size:1.2rem}.tipm p{margin:0 0 12px;line-height:1.5}'+
'.tipm ol{list-style:none;margin:0 0 12px;padding:0;display:grid;gap:10px}'+
'.tipm li{padding:8px 12px;border-left:4px solid var(--acc)}.tipm li b{color:var(--hl,var(--acc))}.tipm li i{display:block;margin-top:4px}'+
'.tipm .sg{font-weight:800;margin:0 0 14px}.tipm .rt{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:0 0 14px}'+
'.tipm .rt button{min-width:52px;min-height:48px;font-size:1.4rem;border:2px solid var(--line);border-radius:12px;background:transparent;color:var(--ink);cursor:pointer}'+
'.tipm .rt button[aria-pressed=true]{border-color:var(--acc);background:var(--acc)}'+
'.tipm .cl{width:100%}';
function el(t,a,k){var e=document.createElement(t);for(var x in (a||{}))e.setAttribute(x,a[x]);(k||[]).forEach(function(c){e.append(c);});return e;}
function open(sb,tip){
  var prev=document.activeElement,fx=tip.body.fixes||[];
  var wrap=el('div',{class:'tipm',role:'dialog','aria-modal':'true','aria-labelledby':'tipm-h'}),box=el('div',{class:'tx'});
  box.append(el('span',{class:'tb'},['Dicas da semana']),el('h2',{id:'tipm-h'},['Suas dicas da semana']),el('p',{},[tip.body.praise||'']));
  if(fx.length){var ol=el('ol');fx.forEach(function(f){var li=el('li',{},[el('b',{},[f.t||'']),' — '+(f.d||'')]);if(f.e)li.append(el('i',{},[f.e]));ol.append(li);});box.append(ol);}
  box.append(el('p',{},[tip.body.closing||'']),el('p',{class:'sg'},['— Britland Academy']));
  var rt=el('div',{class:'rt'},[el('span',{},['Gostou deste relatório?'])]),thx=el('span',{role:'status'});
  function mark(v){up.setAttribute('aria-pressed',v===1?'true':'false');dn.setAttribute('aria-label','Não gostei');dn.setAttribute('aria-pressed',v===-1?'true':'false');}
  var up=el('button',{type:'button','aria-label':'Gostei','aria-pressed':'false'},['👍']),dn=el('button',{type:'button','aria-label':'Não gostei','aria-pressed':'false'},['👎']);
  function rate(v){tip.rating=v;mark(v);thx.textContent='Obrigado pela sua opinião!';try{sb.rpc('rate_weekly_tip',{p_id:tip.id,p_val:v}).then(function(){},function(){});}catch(e){}}
  up.onclick=function(){rate(1);};dn.onclick=function(){rate(-1);};mark(tip.rating||0);
  rt.append(up,dn,thx);box.append(rt);
  var cl=el('button',{type:'button',class:'go cl'},['Fechar']);box.append(cl);wrap.append(box);document.body.append(wrap);
  function close(){wrap.remove();document.removeEventListener('keydown',key);try{if(location.hash==='#dicas')history.replaceState(null,'',location.pathname+location.search);}catch(e){}try{prev&&prev.focus();}catch(e){}}
  function key(e){if(e.key==='Escape')close();}
  document.addEventListener('keydown',key);cl.onclick=close;wrap.addEventListener('click',function(e){if(e.target===wrap)close();});
  cl.focus();
  if(!tip.seen_at){tip.seen_at=new Date().toISOString();try{sb.rpc('seen_weekly_tip',{p_id:tip.id}).then(function(){},function(){});}catch(e){}}
}
window.Tips={mount:function(box,sb,name){
  if(!box||!sb)return;
  sb.from('weekly_tips').select('id,week_start,kind,body,rating,seen_at').order('week_start',{ascending:false}).limit(1).then(function(r){
    var t=r&&r.data&&r.data[0];if(!t||!t.body)return;
    if(Date.now()-new Date(t.week_start+'T12:00:00').getTime()>12*864e5)return;
    if(!document.getElementById('tipc-css')){var s=document.createElement('style');s.id='tipc-css';s.textContent=CSS;document.head.append(s);}
    var fx=t.body.fixes||[],nm=name?', '+name:'';
    var sub=fx.length?('Você tem '+fx.length+' dicas para a próxima semana: '+fx.map(function(f){return f.t;}).join(', ')+'.'):String(t.body.praise||'').replace(/^Oi,[^!]*!\s*/,'');
    box.textContent='';box.classList.add('tipc');
    var b=el('button',{type:'button'},['Ver as dicas →']);b.onclick=function(){open(sb,t);};
    if(!t.seen_at)box.append(el('span',{class:'tb'},['Novo · sábado']));
    box.append(el('h2',{},['Suas dicas da semana'+nm]),el('p',{},[sub]),b);
    box.hidden=false;box.setAttribute('aria-label','Suas dicas da semana');
    if(location.hash==='#dicas')open(sb,t);
  },function(){});
}};
})();
