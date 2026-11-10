/* Streak ("ofensiva") card + admin panel. Needs Gate.sb and the streak.sql functions. */
(function(){
var L={
 pt:{wk1:'Semana completa!',wkN:'{w} semanas seguidas!',m30:'Um mês de ofensiva!',m100:'100 dias de ofensiva!',m365:'Um ano inteiro!',ndays:'{n} dias seguidos',ph:['Continue assim!','Você é imparável!','Que constância!','O leão está orgulhoso!','Hábito de campeão!','Ninguém segura você!','Mais uma semana na conta!'],z:'Estude hoje para começar sua ofensiva!',t:'Ofensiva',d:'dias seguidos',d1:'dia seguido',best:'Recorde',fz:'Congelamento disponível esta semana',nofz:'Congelamento já usado esta semana',
  go:'Estude hoje para manter sua ofensiva!',ok:'Hoje está feito. Volte amanhã!',rank:'Ranking da turma',game:'Modo Jogo',me:'você',
  w:['S','T','Q','Q','S','S','D'],ms:'Ofensiva de {n} dias!',ms2:'Continue assim!',close:'Continuar',none:'Ninguém com ofensiva ainda.',
  at:'Painel de ofensivas',an:'Aluno',ac:'Atual',ab:'Recorde',al:'Último dia',ad:'Dias',ae:'Nenhum aluno ainda.'},
 en:{wk1:'Week complete!',wkN:'{w} weeks in a row!',m30:'A month-long streak!',m100:'100-day streak!',m365:'A whole year!',ndays:'{n} days in a row',ph:['Keep it up!','You are unstoppable!','What consistency!','The lion is proud of you!','Champion habits!','Nothing can stop you!','Another week in the bank!'],z:'Estude hoje para começar sua ofensiva!',t:'Streak',d:'day streak',d1:'day streak',best:'Best',fz:'Freeze available this week',nofz:'Freeze already used this week',
  game:'Game Mode',
  go:'Study today to keep your streak!',gos:['Hi{c}! Your next exercise is ready. Just 10 minutes today.','Small steps every day build fluent English{c}. Ready for yours?','Your English is waiting for you{c}. Come and practise!','A few minutes now will make tomorrow\u2019s class easier{c}.','You\u2019re closer than you think{c}. Let\u2019s do today\u2019s exercise!'],gok:['Keep your streak alive{c}! One exercise is all it takes.','Don\u2019t break the chain{c}: {d} days in a row so far!'],gom:['We miss you{c}! Come back and pick up where you left off.','No pressure{c}. Just one short exercise to get going again.'],ok:'Done for today. See you tomorrow!',rank:'Class ranking',me:'you',
  w:['M','T','W','T','F','S','S'],ms:'{n}-day streak!',ms2:'Keep it up!',close:'Continue',none:'Nobody has a streak yet.',
  at:'Streak panel',an:'Student',ac:'Current',ab:'Best',al:'Last day',ad:'Days',ae:'No students yet.'},
 es:{wk1:'¡Semana completa!',wkN:'¡{w} semanas seguidas!',m30:'¡Un mes de racha!',m100:'¡100 días de racha!',m365:'¡Un año entero!',ndays:'{n} días seguidos',ph:['¡Sigue así!','¡Imparable!','¡Qué constancia!','¡El león está orgulloso!','¡Hábito de campeón!','¡Nadie te detiene!','¡Otra semana más!'],z:'¡Estudia hoy para empezar tu racha!',t:'Racha',d:'días seguidos',d1:'día seguido',best:'Récord',fz:'Congelación disponible esta semana',nofz:'Congelación ya usada esta semana',
  go:'¡Estudia hoy para mantener tu racha!',ok:'Listo por hoy. ¡Hasta mañana!',rank:'Ranking del grupo',game:'Modo Juego',me:'tú',
  w:['L','M','X','J','V','S','D'],ms:'¡Racha de {n} días!',ms2:'¡Sigue así!',close:'Continuar',none:'Nadie tiene racha todavía.',
  at:'Panel de rachas',an:'Alumno',ac:'Actual',ab:'Récord',al:'Último día',ad:'Días',ae:'Aún no hay alumnos.'}
};
var SPECIAL=[30,100,365];
function milestone(cur){var m=Math.floor(cur/7)*7;SPECIAL.forEach(function(x){if(cur>=x&&x>m)m=x;});return m>=7?m:0;}
function lang(){var l=(window.I18N&&window.I18N.lang)||'';if(/\/espanol(\/|$)/.test(location.pathname))return 'es';return L[l]?l:'en';}
function T(){return L[lang()];}
function gameOff(){try{return localStorage.getItem('bl-game')!=='1';}catch(e){return false;}}
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
'.sk-ic{width:1.05em;height:1.05em;vertical-align:-.15em;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.sk-md circle{fill:currentColor;fill-opacity:.25}'+
'.sk-i{color:var(--muted);font-size:.82rem;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}'+
'.sk-r{margin-top:12px;border-top:1px solid var(--line);padding-top:10px}.sk-r summary{cursor:pointer;font-weight:700;font-size:.9rem}'+
'.sk-r ol{margin:8px 0 0;padding:0;list-style:none}.sk-r li{display:flex;gap:10px;padding:5px 0;font-size:.9rem}'+
'.sk-r li{align-items:center}.sk-r li[data-pid],.sk-hr li[data-pid]{cursor:pointer}.sk-r li .sk-p{width:24px;text-align:center;color:var(--muted)}.sk-r li .sk-nm{flex:1;min-width:0}.sk-r li.me{font-weight:800;color:var(--hl)}.sk-av{flex:none;width:34px;height:34px;border-radius:50%;border:2px solid var(--hl);overflow:hidden;display:block;background:var(--card)}.sk-av svg{width:100%;height:100%;display:block}'+
'.sk-ov{position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px}'+
'.sk-bx{background:var(--card);color:var(--ink);border-radius:18px;padding:28px 26px;text-align:center;max-width:340px;width:100%}'+
'.sk-wrap{position:relative;width:200px;margin:0 auto}.sk-art{display:block;width:100%;position:relative;overflow:visible}.sk-aura{position:absolute;inset:-6%;border-radius:50%;background:radial-gradient(circle,rgba(255,215,110,.5),rgba(255,215,110,0) 65%)}.sk-wrap.l5 .sk-aura{inset:-18%;background:radial-gradient(circle,rgba(255,215,110,.7),rgba(255,215,110,0) 65%)}.sk-rays{transform-origin:130px 178px;animation:skrot 14s linear infinite}@keyframes skrot{to{transform:rotate(360deg)}}.sk-shine{animation:skshine 2.6s .6s ease-in-out infinite}@keyframes skshine{0%{transform:translateX(0)}60%,100%{transform:translateX(400px)}}.sk-st{transform-box:fill-box;transform-origin:center;animation:sktw 1.8s ease-in-out infinite}@keyframes sktw{0%,100%{opacity:.4;transform:scale(.8)}50%{opacity:1;transform:scale(1.15)}}.sk-bx h2{font-size:1.4rem}.sk-big{font-weight:700;color:var(--hl,#d9a441)}.sk-ph{color:var(--muted);margin-top:2px}@media (prefers-reduced-motion:reduce){.sk-rays,.sk-shine,.sk-st{animation:none}}.sk-bx h2{margin:10px 0 4px}.sk-bx button{margin-top:16px;padding:10px 22px;border-radius:10px;border:0;background:#ff9a1f;color:#fff;font-weight:700;font-size:1rem;cursor:pointer}'+
'.sk-hd{flex:1 1 440px;min-width:0;display:flex;flex-wrap:wrap;align-items:center;gap:10px 18px;color:#fff}.sk-hd .sk-gl{width:58px}.sk-hd .sk-halo{background:radial-gradient(circle,rgba(245,197,66,.55),rgba(245,197,66,0) 62%)}'+
'.sk-hn{flex:none}.sk-hnn{font-family:BLSerif,Georgia,serif;font-weight:700;font-size:2.6rem;line-height:1;color:#fff}.sk-hl{color:#b4bfd6;font-size:.85rem;margin-top:2px}'+
'.sk-hm{flex:1 1 280px;min-width:0}.sk-hd .sk-w{margin:0 0 10px;gap:6px;justify-content:flex-start}.sk-hd .sk-d{flex:0 0 auto;width:34px;color:#b4bfd6}.sk-hd .sk-d.td{color:#fff}.sk-hd .sk-d i{border-color:rgba(255,255,255,.28)}.sk-hd .sk-d.on i{background:#ff9f1c;border-color:#ff9f1c;box-shadow:0 0 10px rgba(255,159,28,.45)}.sk-hd .sk-d.fz i{background:#7cc4f5;border-color:#7cc4f5}.sk-hd .sk-d.td i{box-shadow:0 0 0 3px rgba(255,159,28,.35),0 0 12px rgba(255,159,28,.55)}'+
'.sk-hi{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;color:#b4bfd6;font-size:.84rem}.sk-hi b{color:#e4c06a;font-weight:500}'+
'.sk-rb{font:inherit;font-weight:700;font-size:.84rem;color:#fff;background:rgba(255,255,255,.07);border:1px solid #2a3f63;border-radius:999px;padding:6px 13px;cursor:pointer}.sk-rb:hover,.sk-rb:focus-visible{border-color:#e4c06a}'+
'.sk-gb{font:inherit;font-weight:800;font-size:.84rem;color:#1a1405;background:#c9a13b;border:1px solid #e3c36a;border-radius:999px;padding:6px 13px;display:inline-flex;align-items:center;gap:6px;cursor:pointer;box-shadow:0 2px 0 #8a6d1f}.sk-gb:hover,.sk-gb:focus-visible{background:#d6b04a}.sk-gb svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}'+
'.sk-hr{flex:1 1 100%;margin:2px 0 0;border-top:1px solid #2a3f63;padding-top:8px}.sk-hr ol{margin:0;padding:0;list-style:none}.sk-hr li{display:flex;gap:10px;align-items:center;padding:5px 0;font-size:.9rem;color:#fff}.sk-hr li .sk-p{width:24px;text-align:center}.sk-hr li .sk-nm{flex:1;min-width:0}.sk-hr li.me{font-weight:800;color:#e4c06a}.sk-hr .sk-av{border-color:#e4c06a;background:transparent}'+
'html .head>.sk-hd{order:1}html .head>.logo{order:2}@media(max-width:760px){html .head>.logo{order:1}html .head>.sk-hd{order:3;flex-basis:100%}}'+
'.sk-at{width:100%;border-collapse:collapse;font-size:.9rem}.sk-at th,.sk-at td{padding:7px 8px;border-bottom:1px solid var(--line);text-align:left}.sk-at td.n,.sk-at th.n{text-align:right}';
function lion(cur,big){var st=cur>=7?'gold':cur>0?'on':'off',src='img/lion-'+st+'.png';
  if(st==='gold')return '<span class="sk-gl'+(big?' big':'')+'"><i class="sk-halo"></i><img src="'+src+'" alt="" class="sk-li"><i class="sk-sw"></i></span>';
  return '<span class="sk-gl'+(big?' big':'')+'"><img src="'+src+'" alt="" class="sk-li"></span>';}
var sfxPending=null;
var IC={tr:'<svg class="sk-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8v5a4 4 0 01-8 0z"/><path d="M8 6H5a3 3 0 003 4M16 6h3a3 3 0 01-3 4M12 13v4M9 20h6M10 17h4"/></svg>',
sn:'<svg class="sk-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9M9.5 4.5L12 6.5l2.5-2M9.5 19.5l2.5-2 2.5 2"/></svg>',
fl:'<svg class="sk-ic" viewBox="0 0 24 24" aria-hidden="true" style="color:#ff9f1c"><path d="M12 3c1 3 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/></svg>',
md:function(c){return '<svg class="sk-ic sk-md" viewBox="0 0 24 24" aria-hidden="true" style="color:'+c+'"><circle cx="12" cy="14.5" r="5.5"/><path d="M8.5 3l3.5 6.5M15.5 3L12 9.5"/></svg>';}};
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
  try{window.Covers&&Covers.confetti&&Covers.confetti(0,lang()==='es'?['#AA151B','#F1BF00','#AA151B','#F1BF00','#ffffff']:['#C8102E','#ffffff','#2a5db0','#C8102E','#ffffff','#2a5db0']);}catch(e){}
  play('leao_7dias');
}
function nudge(t,s,cur){
  if(!t.gos)return t.go;
  var nm=((function(){try{var p=window.Gate&&window.Gate.profile;return typeof p==='function'?p():p;}catch(e){return null;}})()||{}).name||'';nm=String(nm).trim().split(/\s+/)[0];
  var c=nm?', '+nm:'',gap=0;try{if(s.last)gap=Math.round((Date.now()-new Date(s.last+'T12:00:00'))/864e5);}catch(e){}
  var set=gap>=3?t.gom:(cur>=2?t.gos.concat(t.gok):t.gos);
  var d=new Date(),seed=d.getFullYear()*400+d.getMonth()*31+d.getDate();
  return set[seed%set.length].replace(/\{c\}/g,c).replace('{d}',cur);
}
function paintAv(box){
  if(!window.Profile)return;
  Profile.ready().then(function(){Array.prototype.forEach.call(box.querySelectorAll('.sk-av'),function(n){Profile.paint(n,n.getAttribute('data-av')||'',n.getAttribute('data-uid')||'');});});
}
function mount(box,opts){
  addCss();var t=T(),sb=window.Gate&&Gate.sb;if(!sb||!box)return;var hd=opts&&opts.head;
  var sk0=!hd&&!!(Gate.skel&&box.hidden);if(sk0){box.hidden=false;Gate.skel(box,2,72);}
  var undo=function(){if(sk0&&box.querySelector('.bl-sk')){box.textContent='';box.hidden=true;}};
  Promise.all([sb.rpc('my_streak'),sb.rpc('streak_board')]).then(function(r){
    var s=r[0].data;
    if(hd&&(r[0].error||!s||typeof s!=='object'))s={cur:0,best:0,active_today:false,freeze_left:0,week:[]};
    if(r[0].error||!s){undo();return;}var rows=(r[1]&&r[1].data)||[];if(!Array.isArray(rows))rows=[];
    var cur=s.cur||0,wk=s.week||[];
    if(hd&&wk.length!==7){var td=(new Date().getDay()+6)%7;wk=[0,1,2,3,4,5,6].map(function(i){return {today:i===td};});}
    var h='<div class="sk-top">'+lion(cur)+'<div class="sk-m"><div class="sk-n">'+cur+'</div><div class="sk-l">'+esc(cur===1?t.d1:t.d)+'</div></div><div class="sk-b">'+esc(t.best)+'<b>'+(s.best||0)+'</b></div></div>';
    h+='<div class="sk-w">'+wk.map(function(d,i){return '<div class="sk-d'+(d.on?' on':'')+(d.fz?' fz':'')+(d.today?' td':'')+'">'+esc(t.w[i])+'<i>'+(d.on?'✓':d.fz?IC.sn:'')+'</i></div>';}).join('')+'</div>';
    h+='<div class="sk-i"><span>'+(s.active_today?esc(t.ok):esc(nudge(t,s,cur)))+'</span><span>'+(s.freeze_left>0?IC.sn+' '+esc(t.fz):esc(t.nofz))+'</span></div>';
    if(rows.length)h+='<details class="sk-r"><summary>'+IC.tr+' '+esc(t.rank)+'</summary><ol aria-label="'+esc(t.rank)+'">'+rows.map(function(x,i){var pos=i<3?[IC.md('#E4C06A'),IC.md('#B8C2D6'),IC.md('#C98A5B')][i]:(i+1);return '<li'+(x.me?' class="me" aria-current="true"':'')+(x.pid?' data-pid="'+esc(x.pid)+'" tabindex="0" role="button"':'')+'><span class="sk-p" aria-label="'+(i+1)+'">'+pos+'</span>'+(window.Profile?'<span class="sk-av" data-av="'+esc(x.avatar||'')+'" data-uid="'+esc(x.uid||'')+'"></span>':'')+'<span class="sk-nm">'+esc(x.name)+(x.me?' ('+esc(t.me)+')':'')+'</span><span>'+IC.fl+' '+x.cur+'</span></li>';}).join('')+'</ol></details>';
    if(hd){
      var old=hd.querySelector('.sk-hd');if(old)old.remove();
      var el=document.createElement('div');el.className='sk-hd';
      var hh=lion(cur)+'<div class="sk-hn"><div class="sk-hnn">'+cur+'</div><div class="sk-hl">'+esc(cur===1?t.d1:t.d)+(s.best>cur?' \u00b7 '+esc(t.best)+' '+s.best:'')+'</div></div>';
      hh+='<div class="sk-hm"><div class="sk-w">'+wk.map(function(d,i){return '<div class="sk-d'+(d.on?' on':'')+(d.fz?' fz':'')+(d.today?' td':'')+'">'+esc(t.w[i])+'<i>'+(d.on?'\u2713':d.fz?IC.sn:'')+'</i></div>';}).join('')+'</div>';
      hh+='<div class="sk-hi"><span>'+(s.active_today?esc(t.ok):(cur===0&&t.z?esc(t.z):esc(nudge(t,s,cur))))+(s.freeze_left>0?' <b>\u00b7</b> '+IC.sn+' '+esc(t.fz):'')+'</span>'+('<button type="button" class="sk-rb" aria-expanded="false">'+IC.tr+' '+esc(t.rank)+' \u25B8</button>')+(gameOff()?'<button type="button" class="sk-gb"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="7" width="19" height="11" rx="5"/><path d="M7.5 10.5v4M5.5 12.5h4M15.5 11.5h.01M18 13.5h.01"/></svg> '+esc(t.game)+'</button>':'')+'</div></div>';
      hh+='<div class="sk-hr" hidden>'+(rows.length?'':'<div class="sk-hl">'+esc(t.none)+'</div>')+'<ol aria-label="'+esc(t.rank)+'">'+rows.map(function(x,i){var pos=i<3?[IC.md('#E4C06A'),IC.md('#B8C2D6'),IC.md('#C98A5B')][i]:(i+1);return '<li'+(x.me?' class="me" aria-current="true"':'')+(x.pid?' data-pid="'+esc(x.pid)+'" tabindex="0" role="button"':'')+'><span class="sk-p" aria-label="'+(i+1)+'">'+pos+'</span>'+(window.Profile?'<span class="sk-av" data-av="'+esc(x.avatar||'')+'" data-uid="'+esc(x.uid||'')+'"></span>':'')+'<span class="sk-nm">'+esc(x.name)+(x.me?' ('+esc(t.me)+')':'')+'</span><span>'+IC.fl+' '+x.cur+'</span></li>';}).join('')+'</ol></div>';
      el.innerHTML=hh;var lg=hd.querySelector('.logo');hd.insertBefore(el,lg||null);
      var gb=el.querySelector('.sk-gb');if(gb)gb.onclick=function(){try{localStorage.setItem('bl-game','1');localStorage.setItem('bl-tfx','in:'+Date.now());}catch(e){}location.reload();};
      var rb=el.querySelector('.sk-rb'),rl=el.querySelector('.sk-hr');
      if(rb&&rl)rb.onclick=function(){var o=rl.hidden;rl.hidden=!o;rb.setAttribute('aria-expanded',o?'true':'false');};
      paintAv(el);
    }else{box.className='sk';box.innerHTML=h;box.hidden=false;paintAv(box);}
    if(s.active_today&&cur>0&&cur<7){var dk='streak-snd-'+lang()+'-'+(wk.filter(function(d){return d.today;})[0]||{}).d;try{if(!localStorage.getItem(dk)){localStorage.setItem(dk,'1');play('crepitar');}}catch(e){}}
    var ms=milestone(cur);if(ms){var st='';try{var ld=new Date((s.last||'')+'T12:00:00');ld.setDate(ld.getDate()-(cur-1));st=ld.toISOString().slice(0,10);}catch(e){}celebrate(ms,st);}
  }).catch(function(){undo();});
}
function admin(box){
  addCss();var t=T(),sb=window.Gate&&Gate.sb;if(!sb||!box)return;
  var sk0=!!(Gate.skel&&box.hidden);if(sk0){box.hidden=false;Gate.skel(box,2,72);}
  var undo=function(){if(sk0&&box.querySelector('.bl-sk')){box.textContent='';box.hidden=true;}};
  sb.rpc('admin_streaks').then(function(r){
    if(r.error){undo();return;}var rows=(r.data||[]).slice().sort(function(a,b){return (b.cur||0)-(a.cur||0)||(b.best||0)-(a.best||0);});
    box.className='sk';
    box.innerHTML='<h3 style="margin:0 0 10px">'+IC.fl+' '+esc(t.at)+'</h3>'+(rows.length?'<div style="overflow-x:auto"><table class="sk-at"><tr><th scope="col">'+esc(t.an)+'</th><th scope="col" class="n">'+esc(t.ac)+'</th><th scope="col" class="n">'+esc(t.ab)+'</th><th>'+esc(t.al)+'</th><th scope="col" class="n">'+esc(t.ad)+'</th></tr>'+rows.map(function(x){return '<tr><td>'+esc(x.name||x.email)+'</td><td class="n">'+(x.cur||0)+'</td><td class="n">'+(x.best||0)+'</td><td>'+esc(x.last_day||'–')+'</td><td class="n">'+(x.total_days||0)+'</td></tr>';}).join('')+'</table></div>':'<div class="sk-l">'+esc(t.ae)+'</div>');
    box.hidden=false;
  }).catch(function(){undo();});
}
function openPid(e){var li=e.target&&e.target.closest&&e.target.closest('li[data-pid]');if(!li||!window.PubProfile)return;if(e.type==='keydown'&&e.key!=='Enter'&&e.key!==' ')return;e.preventDefault();PubProfile.open(li.getAttribute('data-pid'));}
document.addEventListener('click',openPid);document.addEventListener('keydown',openPid);
window.Streak={mount:mount,admin:admin};
})();
