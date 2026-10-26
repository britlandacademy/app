/* Streak ("ofensiva") card + admin panel. Needs Gate.sb and the streak.sql functions. */
(function(){
var L={
 pt:{wk1:'Semana completa!',wkN:'{w} semanas seguidas!',m30:'Um mês de ofensiva!',m100:'100 dias de ofensiva!',m365:'Um ano inteiro!',ndays:'{n} dias seguidos',ph:['Continue assim!','Você é imparável!','Que constância!','O leão está orgulhoso!','Hábito de campeão!','Ninguém segura você!','Mais uma semana na conta!'],t:'Ofensiva',d:'dias seguidos',d1:'dia seguido',best:'Recorde',fz:'Congelamento disponível esta semana',nofz:'Congelamento já usado esta semana',
  go:'Estude hoje para manter sua ofensiva!',ok:'Hoje está feito. Volte amanhã!',rank:'Ranking da turma',me:'você',
  w:['S','T','Q','Q','S','S','D'],ms:'Ofensiva de {n} dias!',ms2:'Continue assim!',close:'Continuar',none:'Ninguém com ofensiva ainda.',
  at:'Painel de ofensivas',an:'Aluno',ac:'Atual',ab:'Recorde',al:'Último dia',ad:'Dias',ae:'Nenhum aluno ainda.'},
 en:{wk1:'Week complete!',wkN:'{w} weeks in a row!',m30:'A month-long streak!',m100:'100-day streak!',m365:'A whole year!',ndays:'{n} days in a row',ph:['Keep it up!','You are unstoppable!','What consistency!','The lion is proud of you!','Champion habits!','Nothing can stop you!','Another week in the bank!'],t:'Streak',d:'day streak',d1:'day streak',best:'Best',fz:'Freeze available this week',nofz:'Freeze already used this week',
  go:'Study today to keep your streak!',ok:'Done for today. See you tomorrow!',rank:'Class ranking',me:'you',
  w:['M','T','W','T','F','S','S'],ms:'{n}-day streak!',ms2:'Keep it up!',close:'Continue',none:'Nobody has a streak yet.',
  at:'Streak panel',an:'Student',ac:'Current',ab:'Best',al:'Last day',ad:'Days',ae:'No students yet.'},
 es:{wk1:'¡Semana completa!',wkN:'¡{w} semanas seguidas!',m30:'¡Un mes de racha!',m100:'¡100 días de racha!',m365:'¡Un año entero!',ndays:'{n} días seguidos',ph:['¡Sigue así!','¡Imparable!','¡Qué constancia!','¡El león está orgulloso!','¡Hábito de campeón!','¡Nadie te detiene!','¡Otra semana más!'],t:'Racha',d:'días seguidos',d1:'día seguido',best:'Récord',fz:'Congelación disponible esta semana',nofz:'Congelación ya usada esta semana',
  go:'¡Estudia hoy para mantener tu racha!',ok:'Listo por hoy. ¡Hasta mañana!',rank:'Ranking del grupo',me:'tú',
  w:['L','M','X','J','V','S','D'],ms:'¡Racha de {n} días!',ms2:'¡Sigue así!',close:'Continuar',none:'Nadie tiene racha todavía.',
  at:'Panel de rachas',an:'Alumno',ac:'Actual',ab:'Récord',al:'Último día',ad:'Días',ae:'Aún no hay alumnos.'}
};
var SPECIAL=[30,100,365];
function milestone(cur){var m=Math.floor(cur/7)*7;SPECIAL.forEach(function(x){if(cur>=x&&x>m)m=x;});return m>=7?m:0;}
function lang(){var l=(window.I18N&&window.I18N.lang)||'';if(/\/espanol(\/|$)/.test(location.pathname))return 'es';return L[l]?l:'en';}
function T(){return L[lang()];}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
var css='.sk{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 18px;margin-bottom:16px}'+
'.sk-top{display:flex;align-items:center;gap:14px;flex-wrap:wrap}'+
'.sk-gl{position:relative;display:block;width:54px;flex:none}.sk-gl.big{width:110px}.sk-li{display:block;width:100%;position:relative}.sk-halo{position:absolute;inset:-30%;background:radial-gradient(circle,rgba(255,215,110,.5),rgba(255,215,110,0) 62%)}.sk-sw{position:absolute;inset:0;-webkit-mask:var(--sk-m) center/contain no-repeat;mask:var(--sk-m) center/contain no-repeat;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.9) 50%,transparent 65%) -150% 0/250% 100% no-repeat;animation:sksw 3.5s 1s ease-in-out infinite}@keyframes sksw{0%{background-position:-150% 0}45%,100%{background-position:150% 0}}@media (prefers-reduced-motion:reduce){.sk-sw{animation:none}}'+
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
'.sk-wrap{position:relative;width:200px;margin:0 auto}.sk-art{display:block;width:100%;position:relative;overflow:visible}.sk-aura{position:absolute;inset:-6%;border-radius:50%;background:radial-gradient(circle,rgba(255,215,110,.5),rgba(255,215,110,0) 65%)}.sk-wrap.l5 .sk-aura{inset:-18%;background:radial-gradient(circle,rgba(255,215,110,.7),rgba(255,215,110,0) 65%)}.sk-rays{transform-origin:130px 178px;animation:skrot 14s linear infinite}@keyframes skrot{to{transform:rotate(360deg)}}.sk-shine{animation:skshine 2.6s .6s ease-in-out infinite}@keyframes skshine{0%{transform:translateX(0)}60%,100%{transform:translateX(400px)}}.sk-st{transform-box:fill-box;transform-origin:center;animation:sktw 1.8s ease-in-out infinite}@keyframes sktw{0%,100%{opacity:.4;transform:scale(.8)}50%{opacity:1;transform:scale(1.15)}}.sk-bx h2{font-size:1.4rem}.sk-big{font-weight:700;color:var(--hl,#d9a441)}.sk-ph{color:var(--muted);margin-top:2px}@media (prefers-reduced-motion:reduce){.sk-rays,.sk-shine,.sk-st{animation:none}}.sk-bx h2{margin:10px 0 4px}.sk-bx button{margin-top:16px;padding:10px 22px;border-radius:10px;border:0;background:#ff9a1f;color:#fff;font-weight:700;font-size:1rem;cursor:pointer}'+
'.sk-at{width:100%;border-collapse:collapse;font-size:.9rem}.sk-at th,.sk-at td{padding:7px 8px;border-bottom:1px solid var(--line);text-align:left}.sk-at td.n,.sk-at th.n{text-align:right}';
function lion(cur,big){var st=cur>=7?'gold':cur>0?'on':'off',src='img/lion-'+st+'.png';
  if(st==='gold')return '<span class="sk-gl'+(big?' big':'')+'"><i class="sk-halo"></i><img src="'+src+'" alt="" class="sk-li"><i class="sk-sw"></i></span>';
  return '<span class="sk-gl'+(big?' big':'')+'"><img src="'+src+'" alt="" class="sk-li"></span>';}
var sfxPending=null;
function muted(){try{return localStorage.getItem('callan-mute')==='1';}catch(e){return false;}}
function play(name){
  if(muted())return;
  try{var a=new Audio('js/sfx/'+name+'.mp3');a.volume=(name==='crepitar'?.25:.3);var r=a.play();
    if(r&&r.catch)r.catch(function(){if(sfxPending)return;sfxPending=function(){document.removeEventListener('pointerdown',sfxPending);sfxPending=null;try{a.play().catch(function(){});}catch(e){}};document.addEventListener('pointerdown',sfxPending);});
  }catch(e){}
}
function addCss(){if(document.getElementById('sk-css'))return;var s=document.createElement('style');s.id='sk-css';s.textContent=':root{--sk-m:url(img/lion-gold.png)}'+css;document.head.appendChild(s);}
function acc(level){
  /* level 1 gold lion; 2 laurel; 3 + stars; 4 + crown; 5 + rotating rays and bigger aura */
  var g='<defs><linearGradient id="skg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a5a12"/><stop offset=".35" stop-color="#f5d56b"/><stop offset=".6" stop-color="#d9a441"/><stop offset="1" stop-color="#8a5a12"/></linearGradient>'+
   '<linearGradient id="sksh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'+
   '<mask id="skm" style="mask-type:alpha"><image href="img/lion-gold.png" x="20" y="50" width="220" height="256"/></mask></defs>';
  var rays='';
  if(level>=5){for(var i=0;i<12;i++){rays+='<path d="M130 178 L'+(130+170*Math.cos(i*Math.PI/6-0.09)).toFixed(1)+' '+(178+170*Math.sin(i*Math.PI/6-0.09)).toFixed(1)+' L'+(130+170*Math.cos(i*Math.PI/6+0.09)).toFixed(1)+' '+(178+170*Math.sin(i*Math.PI/6+0.09)).toFixed(1)+'Z" fill="#ffd36a" opacity=".22"/>';}rays='<g class="sk-rays">'+rays+'</g>';}
  var laurel='';
  if(level>=2){var leaf=function(x,y,r){return '<ellipse cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" rx="12" ry="5" transform="rotate('+r.toFixed(1)+' '+x.toFixed(1)+' '+y.toFixed(1)+')" fill="url(#skg)" stroke="#1f3a68" stroke-width="1"/>';};
    for(var k=0;k<9;k++){var th=(100+k*11)*Math.PI/180,R=122,cx0=130,cy0=186;
      var lx=cx0+R*Math.cos(th),ly=cy0+R*Math.sin(th)*1.05,deg=th*180/Math.PI+90;
      laurel+=leaf(lx,ly,deg+25);laurel+=leaf(2*cx0-lx,ly,-(deg+25));}}
  var stars='';
  if(level>=3){[[88,30],[130,16],[172,30]].forEach(function(p,i){stars+='<path class="sk-st" style="animation-delay:'+(i*.4)+'s" d="M'+p[0]+' '+(p[1]-10)+' L'+(p[0]+3)+' '+(p[1]-3)+' L'+(p[0]+10)+' '+(p[1]-2)+' L'+(p[0]+4)+' '+(p[1]+3)+' L'+(p[0]+6)+' '+(p[1]+10)+' L'+p[0]+' '+(p[1]+6)+' L'+(p[0]-6)+' '+(p[1]+10)+' L'+(p[0]-4)+' '+(p[1]+3)+' L'+(p[0]-10)+' '+(p[1]-2)+' L'+(p[0]-3)+' '+(p[1]-3)+'Z" fill="#ffe27a" stroke="#b98524" stroke-width="1"/>';});}
  var crown='';
  if(level>=4)crown='<g transform="translate(138 58) rotate(14)"><path d="M-22 0 L-22 -22 L-11 -10 L0 -26 L11 -10 L22 -22 L22 0 Z" fill="url(#skg)" stroke="#1f3a68" stroke-width="2" stroke-linejoin="round"/><circle cx="-22" cy="-24" r="3.2" fill="#e5484d" stroke="#1f3a68"/><circle cx="0" cy="-28" r="3.6" fill="#4aa3ff" stroke="#1f3a68"/><circle cx="22" cy="-24" r="3.2" fill="#e5484d" stroke="#1f3a68"/></g>';
  return '<svg class="sk-art" viewBox="0 0 260 320" aria-hidden="true">'+g+rays+laurel+'<image href="img/lion-gold.png" x="20" y="50" width="220" height="256"/><g mask="url(#skm)"><rect class="sk-shine" x="-80" y="40" width="80" height="270" fill="url(#sksh)"/></g>'+stars+crown+'</svg>';
}
function celebrate(n,start){
  var t=T(),k='streak-ms-'+lang()+'-'+n+'-'+(start||'');
  try{if(localStorage.getItem(k))return;localStorage.setItem(k,'1');}catch(e){}
  var special=SPECIAL.indexOf(n)>=0,w=Math.floor(n/7),level=special?5:Math.min(w,5);
  var title=special?t['m'+n]:(w===1?t.wk1:t.wkN.replace('{w}',w));
  var phr=t.ph[(special?n:w-1)%t.ph.length];
  var o=document.createElement('div');o.className='sk-ov';
  o.innerHTML='<div class="sk-bx" role="dialog" aria-modal="true"><div class="sk-wrap l'+level+'"><i class="sk-aura"></i>'+acc(level)+'</div><h2>'+esc(title)+'</h2><div class="sk-big">'+esc(t.ndays.replace('{n}',n))+'</div><div class="sk-ph">'+esc(phr)+'</div><button type="button">'+esc(t.close)+'</button></div>';
  document.body.appendChild(o);
  o.querySelector('button').onclick=function(){o.remove();};
  try{window.Covers&&Covers.confetti&&Covers.confetti();}catch(e){}
  play('leao_7dias');
}
function mount(box){
  addCss();var t=T(),sb=window.Gate&&Gate.sb;if(!sb||!box)return;
  Promise.all([sb.rpc('my_streak'),sb.rpc('streak_board')]).then(function(r){
    var s=r[0].data;if(r[0].error||!s)return;var rows=(r[1]&&r[1].data)||[];
    var cur=s.cur||0,wk=s.week||[];
    var h='<div class="sk-top">'+lion(cur)+'<div class="sk-m"><div class="sk-n">'+cur+'</div><div class="sk-l">'+esc(cur===1?t.d1:t.d)+'</div></div><div class="sk-b">'+esc(t.best)+'<b>'+(s.best||0)+'</b></div></div>';
    h+='<div class="sk-w">'+wk.map(function(d,i){return '<div class="sk-d'+(d.on?' on':'')+(d.fz?' fz':'')+(d.today?' td':'')+'">'+esc(t.w[i])+'<i>'+(d.on?'✓':d.fz?'❄':'')+'</i></div>';}).join('')+'</div>';
    h+='<div class="sk-i"><span>'+(s.active_today?esc(t.ok):esc(t.go))+'</span><span>'+(s.freeze_left>0?'❄ '+esc(t.fz):esc(t.nofz))+'</span></div>';
    if(rows.length)h+='<details class="sk-r"><summary>🏆 '+esc(t.rank)+'</summary><ol>'+rows.map(function(x,i){return '<li'+(x.me?' class="me"':'')+'><span>'+(i+1)+'</span><span>'+esc(x.name)+(x.me?' ('+esc(t.me)+')':'')+'</span><span>🔥 '+x.cur+'</span></li>';}).join('')+'</ol></details>';
    box.className='sk';box.innerHTML=h;box.hidden=false;
    if(s.active_today&&cur>0&&cur<7){var dk='streak-snd-'+lang()+'-'+(wk.filter(function(d){return d.today;})[0]||{}).d;try{if(!localStorage.getItem(dk)){localStorage.setItem(dk,'1');play('crepitar');}}catch(e){}}
    var ms=milestone(cur);if(ms){var st='';try{var ld=new Date((s.last||'')+'T12:00:00');ld.setDate(ld.getDate()-(cur-1));st=ld.toISOString().slice(0,10);}catch(e){}celebrate(ms,st);}
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
