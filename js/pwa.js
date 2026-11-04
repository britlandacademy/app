/* Britland Academy: registers the service worker and tells the student when a new version is ready. */
(function(){
'use strict';
/* o app sempre abre no modo normal: a cada nova abertura (sessão nova) desliga o Modo Jogo; ligar de novo vale até fechar o app */
try{if(!sessionStorage.getItem('bl-boot')){sessionStorage.setItem('bl-boot','1');localStorage.setItem('bl-game','0');}}catch(e){}
window.BL_VERSION='1.9.60'; /* keep equal to VERSION in sw.js */
/* ---- error codes: erros são gravados em silêncio em app_errors (aba Estatísticas); o aluno não vê nada ---- */
(function(){
var V=window.BL_VERSION,seen={},sent=0,queue=[];
function hash(str){var h=5381,i;for(i=0;i<str.length;i++)h=((h<<5)+h+str.charCodeAt(i))|0;return ('0000'+(h>>>0).toString(16)).slice(-4);}
function flush(){
  var sb=window.Gate&&window.Gate.sb;if(!sb||!queue.length)return false;
  while(queue.length){var e=queue.shift();try{sb.from('app_errors').insert(e).then(function(){},function(){});}catch(x){}}
  return true;
}
function report(kind,detail,ref,show){
  var code=kind+'-'+V+'-'+(ref||hash(String(detail)));
  if(seen[code])return code;seen[code]=1;
  if(sent<10){sent++;queue.push({code:code,kind:kind,message:String(detail).slice(0,500),page:location.pathname+location.search.slice(0,80),version:V,ua:navigator.userAgent.slice(0,200)});
    var n=0,iv=setInterval(function(){if(flush()||++n>20)clearInterval(iv);},1500);}
  return code;
}
window.BL_ERR=report;
window.addEventListener('error',function(e){
  if(e.target&&e.target!==window&&(e.target.src||e.target.href)){var u=e.target.src||e.target.href;if(u.indexOf(location.origin)===0)report('RES',u.replace(location.origin,''));return;}
  var m=e.message||'';if(/ResizeObserver|^Script error/.test(m))return;
  if(e.filename&&e.filename.indexOf('http')!==0)return;
  report('JS',m+' '+(e.filename||'').split('/').pop()+':'+e.lineno);
},true);
window.addEventListener('unhandledrejection',function(e){
  var r=e.reason,m=r&&(r.message||r.toString&&r.toString())||'rejection';
  if(/AbortError|NotAllowedError|play\(\)/.test(m+(r&&r.name||'')))return;
  report('JS',m);
});
if(window.fetch){var of=window.fetch;window.fetch=function(u,o){
  var url=typeof u==='string'?u:(u&&u.url)||'';
  var mine=url.indexOf('app_errors')>=0;
  return of.apply(this,arguments).then(function(res){
    if(!mine&&res&&res.status>=400&&/supabase\.co/.test(url)&&!/\/auth\/v1\/(token|user)/.test(url)){
      res.clone().json().then(function(j){report('DB',(j&&(j.message||j.msg||j.error_description))||res.status,(j&&j.code)||String(res.status));},function(){report('DB',res.status,String(res.status));});}
    return res;
  },function(err){
    if(!mine&&/supabase\.co/.test(url))report('NET',(err&&err.message)||'fetch failed',undefined,false);
    throw err;});
};}
})();

/* ---- registro de uso (aparelho, PWA/navegador, notificações, telas) para a aba Estatísticas do professor ---- */
try{var cs=document.currentScript||{},st=document.createElement('script');st.src=(cs.src||'js/pwa.js').replace(/pwa\.js(\?.*)?$/,'stats.js');st.async=true;(document.head||document.documentElement).appendChild(st);}catch(e){}

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
navigator.serviceWorker.addEventListener('message',function(e){if(e.data&&e.data.type==='bl-roar'){try{var a=new Audio((window.BL_BASE||'')+'js/sfx/leao_7dias.mp3');a.volume=.8;a.play().catch(function(){});}catch(x){}}});
window.addEventListener('load',function(){
  navigator.serviceWorker.register((window.BL_BASE||'')+'sw.js').then(function(reg){
    try{reg.update();}catch(e){}
  }).catch(function(){});
});
})();
