/* Britland minimal motion: dialogs, answer feedback, lists, bars, counters. Off with html.fx-off or reduce-motion. */
(function(){
if(window.BLMotion)return;
var css='@media(prefers-reduced-motion:no-preference){'
+'html:not(.fx-off) .g-ov{animation:bmfi .18s ease-out}'
+'html:not(.fx-off) .g-box{animation:bmpop .2s cubic-bezier(.2,.7,.2,1)}'
+'html:not(.fx-off) .item.ok{animation:bmok .4s cubic-bezier(.2,.7,.2,1)}'
+'html:not(.fx-off) .item.bad{animation:bmshk .24s linear}'
+'html:not(.fx-off) .bar>i,html:not(.fx-off) .bar>div{transition:width .7s cubic-bezier(.2,.7,.2,1)}'
+'html:not(.fx-off) li[data-pid]{animation:bmli .22s cubic-bezier(.2,.7,.2,1) backwards}'
+'html:not(.fx-off) li[data-pid]:nth-child(2){animation-delay:35ms}html:not(.fx-off) li[data-pid]:nth-child(3){animation-delay:70ms}html:not(.fx-off) li[data-pid]:nth-child(4){animation-delay:105ms}html:not(.fx-off) li[data-pid]:nth-child(5){animation-delay:140ms}html:not(.fx-off) li[data-pid]:nth-child(n+6){animation-delay:175ms}'
+'}'
+'@keyframes bmfi{from{opacity:0}to{opacity:1}}'
+'@keyframes bmpop{from{opacity:0;transform:scale(.96) translateY(6px)}to{opacity:1;transform:none}}'
+'@keyframes bmok{0%{box-shadow:0 0 0 0 rgba(46,125,74,.45)}100%{box-shadow:0 0 0 8px rgba(46,125,74,0)}}'
+'@keyframes bmshk{0%,100%{transform:none}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}'
+'@keyframes bmli{from{opacity:0;transform:translateY(8px)}}';
var s=document.createElement('style');s.textContent=css;document.head.appendChild(s);
function off(){return document.documentElement.classList.contains('fx-off')||(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches);}
window.BLMotion={count:function(el,n,pre,suf){pre=pre||'';suf=suf||'';if(off()||!(n>0)){el.textContent=pre+n+suf;return;}
  var t0=performance.now();el.textContent=pre+'0'+suf;(function f(t){var k=Math.min(1,(t-t0)/700),e=1-Math.pow(1-k,3);el.textContent=pre+Math.round(n*e)+suf;if(k<1)requestAnimationFrame(f);})(t0);}};
})();
