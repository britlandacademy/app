/* Britland: public student profile (opened from the class ranking). Shared by EN and ES.
   PubProfile.open(userId) -> overlay with avatar, first name + initial, ranking position, achievement score, Game Mode XP,
   medal counts, showcase, recent medals and a "compare with me" bar. Data: RPC public_profile (no address, e-mail or payment data). */
(function(){
'use strict';
if(window.PubProfile)return;
var ES=/\/espanol\//.test(location.pathname);
var STG=((window.BL_COURSE&&BL_COURSE.stages)||(ES?[[1,16],[17,32],[33,52],[53,72],[73,92],[93,112]]:[[1,12],[13,27],[28,44],[45,63],[64,82],[83,101],[102,120],[121,138],[139,156],[157,174],[175,190],[191,206]])).filter(function(r){return r[0]<1000;});
var TX={
 en:{rank:'RANKING',pts:'ACHIEVEMENT SCORE',of:'{a} of {b} medals',gm:'GAME MODE',lvl:'Level {n}',nxt:'{n} XP to level {m}',ex:'exercises',avg:'check average',day:'day streak',days:'days streak',stage:'Stage {n}',stageE:'Stage',rec:'RECENT ACHIEVEMENTS',cmp:'COMPARE WITH ME',you:'You',close:'Close',none:'No medals yet.',err:'This profile is not available.',load:'Loading…',all:'Showcase'},
 pt:{rank:'RANKING',pts:'PONTUAÇÃO DE CONQUISTAS',of:'{a} de {b} medalhas',gm:'MODO JOGO',lvl:'Nível {n}',nxt:'{n} XP para o nível {m}',ex:'exercícios',avg:'média nos checks',day:'dia seguido',days:'dias seguidos',stage:'Stage {n}',stageE:'Stage',rec:'CONQUISTAS RECENTES',cmp:'COMPARAR COMIGO',you:'Você',close:'Fechar',none:'Ainda sem medalhas.',err:'Este perfil não está disponível.',load:'Carregando…',all:'Vitrine'},
 es:{rank:'RANKING',pts:'PUNTOS DE LOGROS',of:'{a} de {b} medallas',gm:'MODO JUEGO',lvl:'Nivel {n}',nxt:'{n} XP para el nivel {m}',ex:'ejercicios',avg:'media en checks',day:'día seguido',days:'días seguidos',stage:'Etapa {n}',stageE:'Etapa',rec:'LOGROS RECIENTES',cmp:'COMPARAR CONMIGO',you:'Tú',close:'Cerrar',none:'Aún sin medallas.',err:'Este perfil no está disponible.',load:'Cargando…',all:'Vitrina'}};
function lang(){if(ES)return 'es';var l=(window.I18N&&window.I18N.lang)||'';return TX[l]?l:'en';}
function T(k,o){var s=TX[lang()][k]||'';if(o)Object.keys(o).forEach(function(x){s=s.replace('{'+x+'}',o[x]);});return s;}
var PT={b:10,s:25,g:50},TN={b:'#cf8a4b',s:'#c3ccd9',g:'#e6c56a'};
function lvlOf(x){var l=1;while(x>=l*(l+1)*25)l++;return l;}
function el(t,c,x){var n=document.createElement(t);if(c)n.className=c;if(x!==undefined&&x!==null)n.textContent=x;return n;}
function css(){if(document.getElementById('pp-css'))return;var s=el('style');s.id='pp-css';s.textContent=
'#pp{position:fixed;inset:0;z-index:99000;background:rgba(4,9,24,.72);display:flex;justify-content:center;overflow-y:auto;-webkit-overflow-scrolling:touch}'+
'#pp .pp{width:min(480px,100%);min-height:100%;background:#0f1f45;color:#e9edf7;padding:calc(env(safe-area-inset-top,0px) + 14px) 16px calc(env(safe-area-inset-bottom,0px) + 28px);position:relative;animation:ppin .28s ease-out;font:14px/1.35 system-ui,-apple-system,"Segoe UI",sans-serif}'+
'@keyframes ppin{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}html.fx-off #pp .pp{animation:none}'+
'#pp .x{position:absolute;right:12px;top:calc(env(safe-area-inset-top,0px) + 10px);width:38px;height:38px;border-radius:50%;border:1px solid #26376a;background:#16295a;color:#e9edf7;font-size:20px;line-height:1;cursor:pointer;display:block!important;padding:0!important}'+
'#pp .top{display:flex;align-items:center;gap:14px;margin:6px 44px 0 0}#pp .av{flex:none;width:72px;height:72px;border-radius:50%;overflow:hidden;border:3px solid #c9a23c;background:#16295a}'+
'#pp .nm{flex:1;min-width:0}#pp .nm b{display:block;font-size:20px;line-height:1.15;overflow-wrap:anywhere}#pp .nm span{color:#8d9bbd}'+
'#pp .rk{text-align:right}#pp .rk small{display:block;font-size:10px;letter-spacing:.18em;color:#e6c56a;font-weight:700}#pp .rk b{font-size:26px}'+
'#pp .cd{background:#16295a;border:1px solid #26376a;border-radius:14px;padding:12px;margin-top:12px}'+
'#pp .cd.hero{background:linear-gradient(135deg,#1c3472,#16295a)}#pp .lb{font-size:11px;letter-spacing:.16em;color:#8d9bbd;font-weight:700}'+
'#pp .big{line-height:1.35;margin-top:6px;font-size:38px;font-weight:700;color:#e6c56a;line-height:1.1}#pp .xp{color:#7fd1ff}#pp .rw{display:flex;align-items:baseline;gap:8px}#pp .sp{flex:1}#pp .mu{color:#8d9bbd;font-size:12px}'+
'#pp .bar{height:8px;border-radius:6px;background:#26376a;overflow:hidden;margin-top:8px}#pp .bar i{display:block;height:100%;border-radius:6px;background:linear-gradient(90deg,#a67c1a,#e6c56a)}#pp .bar.xb i{background:linear-gradient(90deg,#2a7fd0,#7fd1ff)}'+
'#pp .pill{background:#0a1330;border:1px solid #26376a;border-radius:20px;padding:3px 10px;font-size:12px;white-space:nowrap}'+
'#pp .g3{display:flex;gap:8px;margin-top:12px}#pp .g3>div{flex:1;text-align:center;background:#16295a;border:1px solid #26376a;border-radius:14px;padding:10px 4px}#pp .g3 i{display:block;width:30px;height:30px;border-radius:50%;margin:0 auto 4px;border:3px solid;background:#0a1330}#pp .g3 b{font-size:16px}'+
'#pp .st{display:flex;gap:8px;margin-top:10px}#pp .st>div{flex:1;text-align:center}#pp .st b{display:block;font-size:16px}'+
'#pp h3{text-transform:uppercase;margin:16px 0 8px;font-size:11px;letter-spacing:.16em;color:#8d9bbd;font-weight:700}'+
'#pp .sv{display:flex;gap:6px;justify-content:space-around;background:#16295a;border:1px solid #26376a;border-radius:14px;padding:10px 4px}#pp .sv svg{width:64px;height:69px;display:block;filter:drop-shadow(0 3px 5px #0005)}'+
'#pp .ml{display:flex;align-items:center;gap:10px;background:#16295a;border:1px solid #26376a;border-radius:14px;padding:8px 12px;margin-bottom:8px}#pp .ml svg{flex:none;width:40px;height:43px}#pp .ml div{flex:1;min-width:0}#pp .ml b{display:block}#pp .ml em{font-style:normal;font-weight:700;color:#e6c56a}'+
'#pp .cp{display:flex;align-items:center;gap:10px;margin-top:8px}#pp .cp span{width:58px}#pp .cp .bar{flex:1;margin:0}#pp .cp b{width:54px;text-align:right}';
document.head.appendChild(s);}
function stageOf(u){u=+u||0;for(var i=0;i<STG.length;i++)if(u<=STG[i][1])return i+1;return STG.length;}
function pts(list){var t=0;(list||[]).forEach(function(m){t+=PT[m.tier]||0;});return t;}
function name(id){var c=window.Medals&&Medals.cat,i;if(c)for(i=0;i<c.length;i++)if(c[i].id===id){return c[i];}return null;}
function build(box,d,mine,myxp){
  var L=lang(),ls=(d.medals||[]).filter(function(m){return name(m.id);}),mp=pts(ls),cat=(window.Medals&&Medals.cat)||[],tot=cat.length||47;
  var cnt={b:0,s:0,g:0};ls.forEach(function(m){cnt[m.tier]=(cnt[m.tier]||0)+1;});
  var top=el('div','top'),av=el('div','av');top.appendChild(av);
  var nm=el('div','nm');nm.appendChild(el('b','',d.name));nm.appendChild(el('span','',T('stage',{n:stageOf(d.upto)})));top.appendChild(nm);
  var rk=el('div','rk');rk.appendChild(el('small','',T('rank')));rk.appendChild(el('b','','#'+d.rank));top.appendChild(rk);box.appendChild(top);
  if(window.Profile&&Profile.paint)Profile.ready().then(function(){Profile.paint(av,d.avatar||'',d.uid||'');});
  var pl=el('div','',''),row=el('div','rw');
  var hero=el('div','cd hero');hero.appendChild(el('div','lb',T('pts')));var bigEl=el('div','big','Ⓖ '+mp);row.appendChild(bigEl);if(window.BLMotion)BLMotion.count(bigEl,mp,'Ⓖ ');row.appendChild(el('div','sp'));row.appendChild(el('div','mu',T('of',{a:ls.length,b:tot})));hero.appendChild(row);
  var b1=el('div','bar'),i1=el('i');i1.style.width=Math.min(100,Math.round(ls.length/tot*100))+'%';b1.appendChild(i1);hero.appendChild(b1);box.appendChild(hero);
  var xp=d.xp||0;
  if(xp>0){var l=lvlOf(xp),a=(l-1)*l*25,b=l*(l+1)*25,gm=el('div','cd'),r2=el('div','rw');var r0=el('div','rw');r0.appendChild(el('div','lb',T('gm')));r0.appendChild(el('div','sp'));r0.appendChild(el('span','pill',T('lvl',{n:l})));gm.appendChild(r0);
    r2.appendChild(el('div','big xp',xp.toLocaleString(L==='es'?'es-ES':'en-US')+' XP'));r2.appendChild(el('div','sp'));r2.appendChild(el('div','mu',T('nxt',{n:b-xp,m:l+1})));gm.appendChild(r2);
    var b2=el('div','bar xb'),i2=el('i');i2.style.width=Math.round((xp-a)/(b-a)*100)+'%';b2.appendChild(i2);gm.appendChild(b2);box.appendChild(gm);}
  var g3=el('div','g3');['b','s','g'].forEach(function(k){var c=el('div');var i=el('i');i.style.borderColor=TN[k];c.appendChild(i);c.appendChild(el('b','',String(cnt[k])));g3.appendChild(c);});box.appendChild(g3);
  var st=el('div','cd st');[[d.cur||0,(d.cur===1?T('day'):T('days'))],[d.ex||0,T('ex')],[Math.round((d.avg||0)*100)+'%',T('avg')]].forEach(function(x){var c=el('div');c.appendChild(el('b','',String(x[0])));c.appendChild(el('span','mu',x[1]));st.appendChild(c);});box.appendChild(st);
  var tr={g:3,s:2,b:1},show=ls.slice().sort(function(x,y){return (tr[y.tier]||0)-(tr[x.tier]||0)||(x.at<y.at?1:-1);}).slice(0,3);
  if(show.length){box.appendChild(el('h3','',T('all')));var sv=el('div','sv');show.forEach(function(m){var w=el('div');w.innerHTML=Medals.svg(m.id);sv.appendChild(w.firstChild);});box.appendChild(sv);}
  box.appendChild(el('h3','',T('rec')));
  var rec=ls.slice(0,3);if(!rec.length)box.appendChild(el('div','mu',T('none')));
  rec.forEach(function(m){var c=name(m.id),r=el('div','ml'),w=el('div');w.innerHTML=Medals.svg(m.id);r.appendChild(w.firstChild);var t=el('div');t.appendChild(el('b','',c.n[ES?1:0]));t.appendChild(el('span','mu',c.h[ES?1:0]));r.appendChild(t);r.appendChild(el('em','','+'+(PT[m.tier]||0)));box.appendChild(r);});
  if(!d.me){box.appendChild(el('h3','',T('cmp')));var cm=el('div','cd'),mx=Math.max(mine,mp,1);
    [[T('you'),mine],[d.name.split(' ')[0],mp]].forEach(function(x,i){var r=el('div','cp');r.appendChild(el('span','',x[0]));var bb=el('div','bar'),ii=el('i');ii.style.width=Math.round(x[1]/mx*100)+'%';bb.appendChild(ii);r.appendChild(bb);r.appendChild(el('b',i?'':'',String(x[1])));if(i)r.lastChild.style.color='#e6c56a';cm.appendChild(r);});box.appendChild(cm);}
}
function open(uid){
  if(!uid||!window.Gate||!Gate.sb||!window.Medals)return;css();
  var old=document.getElementById('pp');if(old)old.remove();
  var ov=el('div');ov.id='pp';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');
  var pp=el('div','pp'),x=el('button','x','×');x.type='button';x.setAttribute('aria-label',T('close'));pp.appendChild(x);
  var body=el('div','',T('load'));body.style.cssText='padding:40px 0;text-align:center;color:#8d9bbd';pp.appendChild(body);ov.appendChild(pp);document.body.appendChild(ov);
  var prev=document.body.style.overflow;document.body.style.overflow='hidden';
  function close(){ov.remove();document.body.style.overflow=prev;document.removeEventListener('keydown',kd);}
  function kd(e){if(e.key==='Escape')close();}
  document.addEventListener('keydown',kd);x.addEventListener('click',close);ov.addEventListener('click',function(e){if(e.target===ov)close();});
  Gate.sb.rpc('public_profile',{p_uid:uid}).then(function(r){
    var d=r&&r.data;if(!d){body.textContent=T('err');return;}
    Gate.sb.from('user_medals').select('tier,medal_id').then(function(m){
      var mine=pts(((m&&m.data)||[]).filter(function(z){return z.medal_id!=='_sync';}));
      body.textContent='';body.style.cssText='';build(body,d,mine);try{x.focus();}catch(e){}
    },function(){body.textContent='';body.style.cssText='';build(body,d,0);});
  },function(){body.textContent=T('err');});
}
window.PubProfile={open:open};
})();
