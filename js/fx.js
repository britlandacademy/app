/* Britland UI animations and sounds. Public API: window.BLFX */
(function(){
var W=window,D=document,R=D.documentElement,B=W.BL_BASE||'',KEY='bl-fx';
function lsGet(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function lsSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}
function on(){return lsGet(KEY)!=='0';}
function reduced(){try{return W.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){return false;}}
function apply(){R.classList.toggle('fx-off',!on()||reduced());}
apply();
try{var nv=performance.getEntriesByType('navigation')[0];if(nv&&nv.type==='back_forward')R.classList.add('fx-back');}catch(e){}
var cache={};
function snd(n,vol,rate){
  if(!on()||lsGet('callan-mute')==='1')return;
  try{var a=cache[n]||(cache[n]=new Audio(B+'js/sfx/fx-'+n+'.mp3'));a=a.paused?a:a.cloneNode();a.volume=vol||.4;a.playbackRate=rate||1;a.currentTime=0;var p=a.play();if(p&&p.catch)p.catch(function(){});}catch(e){}
}
/* sparks */
function sparks(box,colors,n){
  if(R.classList.contains('fx-off'))return;
  var r=box.getBoundingClientRect();
  for(var i=0;i<n;i++){var s=D.createElement('i');s.className='fx-spark';var a=Math.random()*Math.PI*2,d=30+Math.random()*60;
    s.style.cssText='left:'+(r.left+r.width*(.2+Math.random()*.6))+'px;top:'+(r.top+r.height/2)+'px;--dx:'+Math.cos(a)*d+'px;--dy:'+(Math.sin(a)*d-20)+'px;background:'+colors[i%colors.length]+';--t:'+(.6+Math.random()*.5)+'s';
    D.body.appendChild(s);setTimeout(function(x){x.remove();}.bind(null,s),1300);}
}
/* fireworks: 3 soft bursts */
function fireworks(){
  var fxOn=!R.classList.contains('fx-off');
  var cv=D.createElement('canvas');cv.className='fx-fw';cv.setAttribute('aria-hidden','true');
  var dpr=Math.min(W.devicePixelRatio||1,2),w=W.innerWidth,h=W.innerHeight;cv.width=w*dpr;cv.height=h*dpr;D.body.appendChild(cv);
  var x=cv.getContext('2d');x.scale(dpr,dpr);
  var cols=['#E4C06A','#ffffff','#EC4654','#6FA8FF','#3DB37A'],P=[],t0=performance.now();
  var bursts=[0,.9,1.8].map(function(d,i){return {t:d*1000,x:w*(.2+Math.random()*.6),y:h*(.15+Math.random()*.3),done:false,c:cols[i%cols.length],rate:[1,1.12,1.26][i]};});
  function go(b){b.done=true;snd('win',.45,b.rate);for(var i=0;i<46;i++){var a=Math.PI*2*i/46+Math.random()*.2,v=2+Math.random()*3.2;P.push({x:b.x,y:b.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:1,c:i%3?b.c:cols[(i+1)%cols.length]});}}
  if(!fxOn){snd('win',.45,1);setTimeout(function(){snd('win',.45,1.12);},900);setTimeout(function(){snd('win',.45,1.26);},1800);cv.remove();return;}
  (function f(now){var t=now-t0;x.clearRect(0,0,w,h);
    bursts.forEach(function(b){if(!b.done&&t>=b.t)go(b);});
    P.forEach(function(p){p.x+=p.vx;p.y+=p.vy;p.vx*=.985;p.vy=p.vy*.985+.045;p.l-=.011;if(p.l>0){x.globalAlpha=Math.max(p.l,0);x.fillStyle=p.c;x.beginPath();x.arc(p.x,p.y,2.3,0,7);x.fill();}});
    P=P.filter(function(p){return p.l>0;});
    if(t<3600||P.length)requestAnimationFrame(f);else cv.remove();})(t0);
}
/* feedback on answers (.item gains ok/bad right after the user acts) */
var armed=0,pend=null;
['click','keydown','submit'].forEach(function(ev){D.addEventListener(ev,function(){armed=Date.now();},true);});
function flush(){var p=pend;pend=null;if(!p)return;snd(p.bad?'no':'ok',p.bad?.35:.4);}
new MutationObserver(function(ms){
  if(Date.now()-armed>1500)return;
  ms.forEach(function(m){var t=m.target;if(!t.classList||!t.classList.contains('item'))return;
    var s=t.classList.contains('ok')?'ok':t.classList.contains('bad')?'bad':'';
    if(!s||new RegExp('(^|\\s)'+s+'(\\s|$)').test(m.oldValue||''))return;
    if(!pend){pend={bad:false};setTimeout(flush,90);}
    if(s==='bad')pend.bad=true;
    else if(s==='ok'){sparks(t,['#3DB37A','#E4C06A','#fff'],14);}
  });
}).observe(D.documentElement,{subtree:true,attributes:true,attributeFilter:['class'],attributeOldValue:true});
/* menu and ranking sounds */
new MutationObserver(function(ms){ms.forEach(function(m){var t=m.target;
  if(t.classList&&t.classList.contains('g-mn')){var was=/(^|\s)on(\s|$)/.test(m.oldValue||''),now=t.classList.contains('on');if(was!==now)snd(now?'open':'close',.3);}
  else if(t.classList&&t.classList.contains('sk-hr')){var wasH=m.oldValue!==null;if(wasH!==t.hidden)snd(t.hidden?'close':'open',.3);}
});}).observe(D.documentElement,{subtree:true,attributes:true,attributeFilter:['class','hidden'],attributeOldValue:true});
/* screen transition (exit) */
D.addEventListener('click',function(e){
  if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;
  var h=a.getAttribute('href');if(!h||h.charAt(0)==='#'||/^(javascript|mailto|tel|sms):/i.test(h)||a.target&&a.target!=='_self'||a.hasAttribute('download'))return;
  if(a.origin!==location.origin||R.classList.contains('fx-off'))return;
  if(a.pathname===location.pathname&&a.search===location.search)return;
  e.preventDefault();snd('go',.3);R.classList.add('fx-out');
  setTimeout(function(){location.href=a.href;},200);
},false);
W.addEventListener('pageshow',function(e){if(e.persisted)R.classList.remove('fx-out');});
try{matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',apply);}catch(e){}
W.BLFX={on:on,set:function(v){lsSet(KEY,v?'1':'0');apply();if(v)snd('ok',.3);},snd:snd,sparks:sparks,
  celebrate:function(frac){if(frac>=.6)setTimeout(fireworks,350);}};
})();
