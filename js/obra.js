/* Britland: "station under construction" card (lessons the teacher has not released yet).
   Obra.card(o) -> HTML of the white plate with the animated excavator; Obra.screen(o) -> full-screen notice for direct links.
   o: {what:'station'|'lesson', lang:'pt'|'en'|'es', name, line, num, stage (Stage the item belongs to), cur (Stage the student is in)} */
(function(W){
'use strict';
var D=W.document;
var X={
 pt:{tag:'EM OBRAS',st:'Essa estação ainda está em construção!',ls:'Essa lição ainda está em construção!',soon:'O professor vai liberá-la em breve.',back:function(n){return 'Volte quando terminar o Stage '+n+'.';},home:'Voltar ao início'},
 en:{tag:'UNDER CONSTRUCTION',st:'This station is still under construction!',ls:'This lesson is still under construction!',soon:'Your teacher will open it soon.',back:function(n){return 'Come back when you finish Stage '+n+'.';},home:'Back to home'},
 es:{tag:'EN OBRAS',st:'¡Esta estación aún está en construcción!',ls:'¡Esta lección aún está en construcción!',soon:'El profesor la abrirá pronto.',back:function(n){return 'Vuelve cuando termines la Etapa '+n+'.';},home:'Volver al inicio'}
};
var CSS='.ob-s{height:130px;border-radius:10px;overflow:hidden;position:relative}.ob-s svg{width:100%;height:100%;display:block}'
+'.ob-arm{transform-origin:46px 38px;animation:ob-arm 2.6s ease-in-out infinite}.ob-stick{transform-origin:78px 18px;animation:ob-stick 2.6s ease-in-out infinite}.ob-bucket{transform-origin:104px 46px;animation:ob-bucket 2.6s ease-in-out infinite}.ob-body{transform-origin:40px 60px;animation:ob-body 2.6s ease-in-out infinite}'
+'.ob-dirt{opacity:0;animation:ob-dirt 2.6s ease-in infinite}.ob-d2{animation-delay:.12s}.ob-d3{animation-delay:.24s}.ob-blink{animation:ob-blink 1s steps(2) infinite}'
+'@keyframes ob-arm{0%,100%{transform:rotate(-12deg)}50%{transform:rotate(8deg)}}@keyframes ob-stick{0%,100%{transform:rotate(10deg)}50%{transform:rotate(-24deg)}}@keyframes ob-bucket{0%,100%{transform:rotate(15deg)}50%{transform:rotate(-30deg)}}@keyframes ob-body{0%,100%{transform:translateY(0)}50%{transform:translateY(1px)}}@keyframes ob-dirt{0%,45%{opacity:0;transform:translate(0,0)}55%{opacity:1}100%{opacity:0;transform:translate(14px,-22px)}}@keyframes ob-blink{50%{opacity:.15}}'
+'@media(prefers-reduced-motion:reduce){.ob-arm,.ob-stick,.ob-bucket,.ob-body,.ob-dirt,.ob-blink{animation:none}.ob-dirt{opacity:1}}'
+'.ob-ov{position:fixed;inset:0;z-index:2147482000;background:var(--bg,#0b1733);display:flex;align-items:center;justify-content:center;padding:16px}.ob-pl{width:min(100%,360px);background:#fff;color:#10224a;border-radius:16px;padding:14px;text-align:center;box-shadow:0 8px 0 rgba(0,0,0,.35);font-family:system-ui,sans-serif}'
+'.ob-pl small{display:block;font:700 .66rem system-ui;letter-spacing:.16em;color:#5a6b8c;margin-bottom:8px}.ob-nm{margin-top:10px;border-radius:5px;padding:8px;font:800 1rem system-ui;color:#fff;background:#4a5586}.ob-t{margin-top:8px;font:700 .95rem/1.3 system-ui}.ob-x{font:500 .8rem system-ui;color:#5a6b8c;margin-top:3px}'
+'.ob-go{margin-top:14px;width:100%;min-height:46px;border:0;border-radius:99px;background:#c9a13b;color:#1a1405;font:800 .85rem system-ui;letter-spacing:.07em;text-transform:uppercase;box-shadow:0 4px 0 #8a6a14;cursor:pointer}.ob-go:active{transform:translateY(4px);box-shadow:none}';
var SVG='<svg viewBox="0 0 160 130" aria-hidden="true"><rect width="160" height="130" fill="#d9c58d"/><path d="M0 100Q40 90 80 100T160 98V130H0Z" fill="#b9a26a"/><circle class="ob-blink" cx="20" cy="40" r="4" fill="#dc241f"/><rect x="16" y="44" width="8" height="56" fill="#555"/>'
+'<g class="ob-body"><rect x="14" y="88" width="62" height="14" rx="7" fill="#222"/><rect x="20" y="62" width="40" height="28" rx="4" fill="#f7c41f"/><rect x="26" y="68" width="16" height="14" rx="2" fill="#9fd3ff"/><g class="ob-arm"><rect x="46" y="32" width="46" height="9" rx="4" fill="#e0a800" transform="rotate(-22 46 38)"/><g class="ob-stick"><rect x="76" y="14" width="34" height="8" rx="4" fill="#c99700" transform="rotate(48 78 18)"/><g class="ob-bucket"><path d="M100 44l18 6-4 14-16-6Z" fill="#8a6a14"/></g></g></g></g>'
+'<circle class="ob-dirt" cx="124" cy="82" r="3" fill="#7a5f2e"/><circle class="ob-dirt ob-d2" cx="130" cy="86" r="2.4" fill="#7a5f2e"/><circle class="ob-dirt ob-d3" cx="120" cy="88" r="2" fill="#7a5f2e"/></svg>';
function css(){if(D.getElementById('ob-css'))return;var s=D.createElement('style');s.id='ob-css';s.textContent=CSS;D.head.appendChild(s);}
function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function lg(o){var l=(o&&o.lang)||(W.I18N&&W.I18N.hint)||'pt';return X[l]?l:'pt';}
function texts(o){var x=X[lg(o)],far=o&&o.stage&&o.cur&&o.stage>o.cur;return {tag:x.tag,t:o&&o.what==='lesson'?x.ls:x.st,s:far?x.back(o.stage-1):x.soon,home:x.home};}
function card(o){css();var t=texts(o);return '<div class="ob-card"><small>'+esc(o&&o.line?o.line:'')+(o&&o.line?' · ':'')+t.tag+'</small><div class="ob-s">'+SVG+'</div>'+(o&&o.name?'<div class="ob-nm">'+esc(o.name)+'</div>':'')+'<div class="ob-t">'+esc(t.t)+'</div><div class="ob-x">'+esc(t.s)+'</div></div>';}
function screen(o){css();var t=texts(o),ov=D.createElement('div');ov.className='ob-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');
 ov.innerHTML='<div class="ob-pl">'+card(o)+'<button type="button" class="ob-go">'+esc(t.home)+'</button></div>';
 ov.querySelector('.ob-card').style.cssText='';ov.querySelector('.ob-go').onclick=function(){W.location.href=(o&&o.home)||'index.html';};D.body.appendChild(ov);}
function stageOf(l,stg){for(var i=0;i<(stg||[]).length;i++)if(l>=stg[i][0]&&l<=stg[i][1])return i+1;return 0;}
W.Obra={card:card,screen:screen,stageOf:stageOf};
})(window);
