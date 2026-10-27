/* Britland Academy: registers the service worker and tells the student when a new version is ready. */
(function(){
'use strict';
window.BL_VERSION='1.0.79'; /* keep equal to VERSION in sw.js */
if(!('serviceWorker' in navigator))return;
var had=!!navigator.serviceWorker.controller,shown=false;
function banner(){
  if(shown||!had)return;shown=true;
  var b=document.createElement('div');b.setAttribute('role','status');
  b.style.cssText='position:fixed;left:8px;right:8px;bottom:8px;z-index:10001;background:#0b1733;color:#fff;border:1px solid #c9a13b;border-radius:12px;padding:10px 14px;display:flex;gap:12px;align-items:center;justify-content:space-between;font:16px/1.4 system-ui,sans-serif;max-width:520px;margin:0 auto;box-shadow:0 8px 30px rgba(0,0,0,.4)';
  var t=document.createElement('span');t.textContent='A new version is ready.';
  var r=document.createElement('button');r.type='button';r.textContent='Update';r.style.cssText='font:inherit;font-weight:700;background:#c9a13b;color:#1a1405;border:0;border-radius:8px;padding:8px 16px;min-height:40px;cursor:pointer';
  r.onclick=function(){location.reload();};
  b.append(t,r);document.body.append(b);
}
navigator.serviceWorker.addEventListener('controllerchange',banner);
navigator.serviceWorker.addEventListener('message',function(e){if(e.data&&e.data.type==='bl-roar'){try{var a=new Audio('js/sfx/leao_7dias.mp3');a.volume=.8;a.play().catch(function(){});}catch(x){}}});
window.addEventListener('load',function(){
  navigator.serviceWorker.register('sw.js').then(function(reg){
    try{reg.update();}catch(e){}
  }).catch(function(){});
});
})();
