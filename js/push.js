/* Britland Academy: web push notifications (student side). Needs the service worker (sw.js). */
(function(){
'use strict';
var KEY='BI1VGF54mtGuKY4JcivZIssbM4s2skP72dj3-NeiUFPJWtLz1f0Q37e4vcIJIpBK_LmsjDKygpPIHs-yKP2r3r8';
function toBytes(s){var p='='.repeat((4-s.length%4)%4),b=(s+p).replace(/-/g,'+').replace(/_/g,'/'),r=atob(b),o=new Uint8Array(r.length),i;for(i=0;i<r.length;i++)o[i]=r.charCodeAt(i);return o;}
function b64(buf){var a=new Uint8Array(buf),s='',i;for(i=0;i<a.length;i++)s+=String.fromCharCode(a[i]);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
var P={
  supported:function(){return 'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;},
  ios:function(){return /iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);},
  standalone:function(){return (window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;},
  current:function(){return navigator.serviceWorker.ready.then(function(r){return r.pushManager.getSubscription();});},
  save:function(sb,sub){var j=sub.toJSON(),k=j.keys||{};return sb.rpc('save_push_sub',{p_endpoint:sub.endpoint,p_p256dh:k.p256dh,p_auth:k.auth}).then(function(r){if(r.error)throw r.error;});},
  /* turn on: ask permission, subscribe, store */
  enable:function(sb){
    return Notification.requestPermission().then(function(perm){
      if(perm!=='granted')throw new Error('denied');
      return navigator.serviceWorker.ready;
    }).then(function(reg){
      return reg.pushManager.getSubscription().then(function(s){return s||reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:toBytes(KEY)}).catch(function(e){throw new Error('step 2 (phone registration): '+(e&&e.name?e.name+' - ':'')+(e&&e.message||e));});});
    }).then(function(sub){return P.save(sb,sub).catch(function(e){throw new Error('step 3 (saving): '+((e&&(e.message||e.details||e.code))||e));});});
  },
  disable:function(sb){
    return P.current().then(function(sub){
      if(!sub)return;var ep=sub.endpoint;
      return sub.unsubscribe().then(function(){return sb.rpc('delete_push_sub',{p_endpoint:ep});});
    });
  },
  /* keep the stored subscription fresh when the student is already subscribed */
  sync:function(sb){
    if(!P.supported()||Notification.permission!=='granted')return Promise.resolve();
    return P.current().then(function(sub){if(sub)return P.save(sb,sub);}).catch(function(){});
  }
};
window.BLPush=P;
})();
