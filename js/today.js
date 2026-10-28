/* Britland: "what to do today" box for the student home (shared by the English and Spanish sites). */
(function(){
'use strict';
var CSS='.today{margin:0 0 16px;padding:16px;border:1px solid var(--line);border-radius:14px;background:var(--card)}'+
'.today h2{margin:0 0 4px;font-size:1.15rem}.today .tsub{margin:0 0 10px;color:var(--mut);font-size:.95rem}'+
'.today .tbar{height:10px;border-radius:6px;background:var(--line);overflow:hidden;margin:0 0 4px}.today .tbar div{height:100%;background:var(--acc);border-radius:6px}'+
'.today .tpct{margin:0 0 12px;font-size:.9rem;color:var(--mut)}'+
'.today ol{list-style:none;margin:0;padding:0;display:grid;gap:8px}'+
'.today li a{display:flex;align-items:center;gap:12px;min-height:52px;padding:10px 14px;border:2px solid var(--line);border-radius:12px;color:var(--ink);text-decoration:none;font-weight:700}'+
'.today li a:hover,.today li a:focus-visible{border-color:var(--acc)}'+
'.today li.next a{border-color:var(--acc)}.today li.dn a{opacity:.7}'+
'.today .tn{flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:var(--line);font-size:.9rem}'+
'.today li.dn .tn{background:var(--acc);color:#111}'+
'.today .twarn{margin:0 0 12px;padding:10px 12px;border:2px solid var(--acc);border-radius:10px;font-weight:700}';
function el(t,a,k){var e=document.createElement(t);for(var x in (a||{}))e.setAttribute(x,a[x]);(k||[]).forEach(function(c){e.append(c);});return e;}
window.Today={mount:function(box,o){
  if(!box)return;
  if(!document.getElementById('today-css')){var s=document.createElement('style');s.id='today-css';s.textContent=CSS;document.head.append(s);}
  box.textContent='';
  var pct=o.total?Math.min(100,Math.round(100*o.done/o.total)):0;
  box.append(el('h2',{id:'today-h'},[o.title]),el('p',{class:'tsub'},[o.sub]));
  var bar=el('div',{class:'tbar',role:'progressbar','aria-valuemin':'0','aria-valuemax':'100','aria-valuenow':String(pct),'aria-label':o.stage},[el('div',{style:'width:'+pct+'%'})]);
  box.append(bar,el('p',{class:'tpct'},[o.stage+' · '+o.done+' / '+o.total]));
  if(o.warn)box.append(el('p',{class:'twarn',role:'status'},[o.warn]));
  if(o.steps&&o.steps.length){
    var ol=el('ol',{'aria-labelledby':'today-h'}),first=true;
    o.steps.forEach(function(st,i){
      var cls=st.done?'dn':(first?'next':'');if(!st.done)first=false;
      ol.append(el('li',{class:cls},[el('a',{href:st.href},[el('span',{class:'tn','aria-hidden':'true'},[st.done?'✓':String(i+1)]),st.t+(st.done?' ✓':'')])]));
    });
    box.append(ol);
  }
  box.hidden=false;box.setAttribute('aria-label',o.title);
}};
})();
