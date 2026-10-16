/* Streak ("ofensiva") card + admin panel. Needs Gate.sb and the streak.sql functions. */
(function(){
var L={
 pt:{t:'Ofensiva',d:'dias seguidos',d1:'dia seguido',best:'Recorde',fz:'Congelamento disponível esta semana',nofz:'Congelamento já usado esta semana',
  go:'Estude hoje para manter a chama acesa!',ok:'Hoje está feito. Volte amanhã!',rank:'Ranking da turma',me:'você',
  w:['S','T','Q','Q','S','S','D'],ms:'Ofensiva de {n} dias!',ms2:'Continue assim!',close:'Continuar',none:'Ninguém com ofensiva ainda.',
  at:'Painel de ofensivas',an:'Aluno',ac:'Atual',ab:'Recorde',al:'Último dia',ad:'Dias',ae:'Nenhum aluno ainda.'},
 en:{t:'Streak',d:'day streak',d1:'day streak',best:'Best',fz:'Freeze available this week',nofz:'Freeze already used this week',
  go:'Study today to keep the flame alive!',ok:'Done for today. See you tomorrow!',rank:'Class ranking',me:'you',
  w:['M','T','W','T','F','S','S'],ms:'{n}-day streak!',ms2:'Keep it up!',close:'Continue',none:'Nobody has a streak yet.',
  at:'Streak panel',an:'Student',ac:'Current',ab:'Best',al:'Last day',ad:'Days',ae:'No students yet.'},
 es:{t:'Racha',d:'días seguidos',d1:'día seguido',best:'Récord',fz:'Congelación disponible esta semana',nofz:'Congelación ya usada esta semana',
  go:'¡Estudia hoy para mantener la llama encendida!',ok:'Listo por hoy. ¡Hasta mañana!',rank:'Ranking del grupo',me:'tú',
  w:['L','M','X','J','V','S','D'],ms:'¡Racha de {n} días!',ms2:'¡Sigue así!',close:'Continuar',none:'Nadie tiene racha todavía.',
  at:'Panel de rachas',an:'Alumno',ac:'Actual',ab:'Récord',al:'Último día',ad:'Días',ae:'Aún no hay alumnos.'}
};
var MS=[3,7,14,30,50,100,200,365];
function lang(){var l=(window.I18N&&window.I18N.lang)||'';if(/\/espanol(\/|$)/.test(location.pathname))return 'es';return L[l]?l:'en';}
function T(){return L[lang()];}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
var css='.sk{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 18px;margin-bottom:16px}'+
'.sk-top{display:flex;align-items:center;gap:14px;flex-wrap:wrap}'+
'.sk-fl{width:54px;height:64px;flex:none}.sk-fl.off{filter:grayscale(1);opacity:.45}'+
'.sk-n{font-size:2.2rem;font-weight:800;line-height:1}.sk-l{color:var(--muted);font-size:.85rem;margin-top:2px}'+
'.sk-m{flex:1 1 140px;min-width:0}.sk-b{margin-left:auto;text-align:right;color:var(--muted);font-size:.8rem}.sk-b b{display:block;color:var(--ink);font-size:1.1rem}'+
'.sk-w{display:flex;gap:8px;justify-content:space-between;margin:14px 0 8px}'+
'.sk-d{flex:1;text-align:center;font-size:.72rem;color:var(--muted)}'+
'.sk-d i{display:block;width:26px;height:26px;margin:4px auto 0;border-radius:50%;border:2px solid var(--line);box-sizing:border-box;font-style:normal;line-height:22px;font-size:.8rem}'+
'.sk-d.on i{background:#ff9a1f;border-color:#ff9a1f;color:#fff}.sk-d.fz i{background:#7cc8f5;border-color:#7cc8f5;color:#fff}'+
'.sk-d.td i{box-shadow:0 0 0 3px rgba(255,154,31,.35)}.sk-d.td{color:var(--ink);font-weight:700}'+
'.sk-i{color:var(--muted);font-size:.82rem;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}'+
'.sk-r{margin-top:12px;border-top:1px solid var(--line);padding-top:10px}.sk-r summary{cursor:pointer;font-weight:700;font-size:.9rem}'+
'.sk-r ol{margin:8px 0 0;padding:0;list-style:none}.sk-r li{display:flex;gap:10px;padding:5px 0;font-size:.9rem}'+
'.sk-r li span:first-child{width:22px;color:var(--muted)}.sk-r li span:nth-child(2){flex:1}.sk-r li.me{font-weight:800;color:var(--hl)}'+
'.sk-ov{position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px}'+
'.sk-bx{background:var(--card);color:var(--ink);border-radius:18px;padding:28px 26px;text-align:center;max-width:340px;width:100%}'+
'.sk-bx svg{width:90px;height:105px}.sk-bx h2{margin:10px 0 4px}.sk-bx button{margin-top:16px;padding:10px 22px;border-radius:10px;border:0;background:#ff9a1f;color:#fff;font-weight:700;font-size:1rem;cursor:pointer}'+
'.sk-at{width:100%;border-collapse:collapse;font-size:.9rem}.sk-at th,.sk-at td{padding:7px 8px;border-bottom:1px solid var(--line);text-align:left}.sk-at td.n,.sk-at th.n{text-align:right}';
function flame(off){return '<svg class="sk-fl'+(off?' off':'')+'" viewBox="0 0 64 76" aria-hidden="true"><path d="M32 2c4 14 22 24 22 46a22 22 0 0 1-44 0c0-9 4-15 9-20 1 7 4 10 8 11C24 28 26 14 32 2z" fill="#ff7a00"/><path d="M32 30c3 9 13 14 13 26a13 13 0 0 1-26 0c0-6 3-9 6-12 1 4 3 6 5 6-1-7 0-14 2-20z" fill="#ffc933"/><path d="M32 52c2 4 6 6 6 10a6 6 0 0 1-12 0c0-3 3-5 4-7z" fill="#fff3b0"/></svg>';}
function addCss(){if(document.getElementById('sk-css'))return;var s=document.createElement('style');s.id='sk-css';s.textContent=css;document.head.appendChild(s);}
function celebrate(n){
  var t=T(),k='streak-ms-'+lang()+'-'+n;
  try{if(localStorage.getItem(k))return;localStorage.setItem(k,'1');}catch(e){}
  var o=document.createElement('div');o.className='sk-ov';
  o.innerHTML='<div class="sk-bx" role="dialog" aria-modal="true">'+flame()+'<h2>'+esc(t.ms.replace('{n}',n))+'</h2><div>'+esc(t.ms2)+'</div><button type="button">'+esc(t.close)+'</button></div>';
  document.body.appendChild(o);
  o.querySelector('button').onclick=function(){o.remove();};
  try{window.Covers&&Covers.confetti&&Covers.confetti();window.Covers&&Covers.chime&&Covers.chime();}catch(e){}
}
function mount(box){
  addCss();var t=T(),sb=window.Gate&&Gate.sb;if(!sb||!box)return;
  Promise.all([sb.rpc('my_streak'),sb.rpc('streak_board')]).then(function(r){
    var s=r[0].data;if(r[0].error||!s)return;var rows=(r[1]&&r[1].data)||[];
    var cur=s.cur||0,wk=s.week||[];
    var h='<div class="sk-top">'+flame(!cur)+'<div class="sk-m"><div class="sk-n">'+cur+'</div><div class="sk-l">'+esc(cur===1?t.d1:t.d)+'</div></div><div class="sk-b">'+esc(t.best)+'<b>'+(s.best||0)+'</b></div></div>';
    h+='<div class="sk-w">'+wk.map(function(d,i){return '<div class="sk-d'+(d.on?' on':'')+(d.fz?' fz':'')+(d.today?' td':'')+'">'+esc(t.w[i])+'<i>'+(d.on?'✓':d.fz?'❄':'')+'</i></div>';}).join('')+'</div>';
    h+='<div class="sk-i"><span>'+(s.active_today?esc(t.ok):esc(t.go))+'</span><span>'+(s.freeze_left>0?'❄ '+esc(t.fz):esc(t.nofz))+'</span></div>';
    if(rows.length)h+='<details class="sk-r"><summary>🏆 '+esc(t.rank)+'</summary><ol>'+rows.map(function(x,i){return '<li'+(x.me?' class="me"':'')+'><span>'+(i+1)+'</span><span>'+esc(x.name)+(x.me?' ('+esc(t.me)+')':'')+'</span><span>🔥 '+x.cur+'</span></li>';}).join('')+'</ol></details>';
    box.className='sk';box.innerHTML=h;box.hidden=false;
    for(var i=MS.length-1;i>=0;i--){if(cur>=MS[i]){celebrate(MS[i]);break;}}
  }).catch(function(){});
}
function admin(box){
  addCss();var t=T(),sb=window.Gate&&Gate.sb;if(!sb||!box)return;
  sb.rpc('admin_streaks').then(function(r){
    if(r.error)return;var rows=(r.data||[]).slice().sort(function(a,b){return (b.cur||0)-(a.cur||0)||(b.best||0)-(a.best||0);});
    box.className='sk';
    box.innerHTML='<h3 style="margin:0 0 10px">🔥 '+esc(t.at)+'</h3>'+(rows.length?'<div style="overflow-x:auto"><table class="sk-at"><tr><th>'+esc(t.an)+'</th><th class="n">'+esc(t.ac)+'</th><th class="n">'+esc(t.ab)+'</th><th>'+esc(t.al)+'</th><th class="n">'+esc(t.ad)+'</th></tr>'+rows.map(function(x){return '<tr><td>'+esc(x.name||x.email)+'</td><td class="n">'+(x.cur||0)+'</td><td class="n">'+(x.best||0)+'</td><td>'+esc(x.last_day||'–')+'</td><td class="n">'+(x.total_days||0)+'</td></tr>';}).join('')+'</table></div>':'<div class="sk-l">'+esc(t.ae)+'</div>');
    box.hidden=false;
  }).catch(function(){});
}
window.Streak={mount:mount,admin:admin};
})();
