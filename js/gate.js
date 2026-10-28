/* Callan site: sign-in gate (Supabase). Each page calls Gate.start(options, callback).
   The callback runs only after the student is signed in and approved, and after the content
   that the teacher released to this student has been loaded from the server. */
(function(){
'use strict';
var CFG=window.CALLAN_CFG||{};
var COURSE=window.BL_COURSE||{}; /* per-course settings (Spanish sets its own in espanol/js/config.js) */
var LIB=['https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js',
         'https://unpkg.com/@supabase/supabase-js@2.45.4/dist/umd/supabase.js'];
var sb=null,prof=null,user=null,overlay=null,bar=null;
var SIZES=[0.9,1,1.15,1.3,1.5],SKEY='callan-fs',fsIdx=1;
try{var sv=parseInt(localStorage.getItem(SKEY),10);if(sv>=0&&sv<SIZES.length)fsIdx=sv;}catch(e){}
function applySize(){document.documentElement.style.setProperty('--fs',String(SIZES[fsIdx]));}
function setSize(i){fsIdx=Math.max(0,Math.min(SIZES.length-1,i));applySize();try{localStorage.setItem(SKEY,String(fsIdx));}catch(e){}updateSizeUi();}
var sizeUi=null;
function updateSizeUi(){
  if(!sizeUi)return;
  sizeUi.minus.disabled=fsIdx===0;sizeUi.plus.disabled=fsIdx===SIZES.length-1;
  sizeUi.lab.textContent='Text size '+(fsIdx+1)+'/'+SIZES.length;
}
applySize();
var TKEY='callan-theme',theme='dark',themeSw=null;
try{var tv=localStorage.getItem(TKEY);if(tv==='light'||tv==='dark'||tv==='auto')theme=tv;}catch(e){}
var mq=window.matchMedia?window.matchMedia('(prefers-color-scheme: dark)'):null;
function shownTheme(){return theme==='auto'?(mq&&mq.matches?'dark':'light'):theme;}
function applyTheme(){document.documentElement.setAttribute('data-theme',shownTheme());if(themeSw){themeSw.setAttribute('aria-checked',String(shownTheme()==='dark'));themeSw.classList.toggle('on',shownTheme()==='dark');}}
function setTheme(t,fromServer){theme=t;applyTheme();try{localStorage.setItem(TKEY,t);}catch(e){}if(!fromServer&&sb&&user){try{sb.rpc('set_my_prefs',{p_theme:t}).then(function(){},function(){});}catch(e){}}}
if(mq&&mq.addEventListener)mq.addEventListener('change',function(){if(theme==='auto')applyTheme();});
applyTheme();

function el(tag,props){
  var e=document.createElement(tag),k,i,c;
  props=props||{};
  for(k in props){var v=props[k];
    if(v===null||v===undefined||v===false)continue;
    if(k==='class')e.className=v;
    else if(k==='text')e.textContent=v;
    else if(k.slice(0,2)==='on')e.addEventListener(k.slice(2),v);
    else if(v===true)e.setAttribute(k,'');
    else e.setAttribute(k,v);}
  for(i=2;i<arguments.length;i++){c=arguments[i];
    (Array.isArray(c)?c:[c]).forEach(function(x){if(x===null||x===undefined||x===false)return;e.append(x.nodeType?x:document.createTextNode(x));});}
  return e;
}

var CSS=
'html{font-size:calc(16px*var(--fs,1))}body{font-size:calc(17px*var(--fs,1))}'+
'.g-ov{position:fixed;inset:0;z-index:9999;overflow:auto;background:var(--bg,#fff);color:var(--ink,#111);padding:24px max(16px,env(safe-area-inset-right)) 40px max(16px,env(safe-area-inset-left));box-sizing:border-box}'+
'.g-ov{--bg:#0A1626;--card:#102038;--surface:#142848;--ink:#F2F5FA;--muted:#A9B6CA;--mut:#A9B6CA;--line:#2A3F63;--chip:#1A3156;--accent:#F5C542;--accent-ink:#0B1B33;--acc:#F5C542;--hl:#F5C542;--hli:#0B1B33;--link:#7DB2F5;--band1:#12376B;--band2:#0A1B33}'+'html[data-theme="light"] .g-ov{--bg:#F4F6FA;--card:#FFFFFF;--surface:#FFFFFF;--ink:#0B1B33;--muted:#475671;--mut:#475671;--line:#D3DAE6;--chip:#E6ECF5;--accent:#F5C542;--accent-ink:#0B1B33;--acc:#F5C542;--hl:#F5C542;--hli:#0B1B33;--link:#1F4E99;--band1:#12376B;--band2:#0A1B33}'+
'.g-ov *{box-sizing:border-box}'+
'.g-logo{display:block;width:min(100%,300px);height:auto;margin:0 auto 14px}.g-logo.l{display:none}html[data-theme="light"] .g-logo.d{display:none}html[data-theme="light"] .g-logo.l{display:block}'+
'.g-box{max-width:460px;margin:6vh auto 0;background:var(--card,#ececec);border:1px solid var(--line,#b8b8b8);border-radius:3px;padding:22px 20px}'+
'.g-box h1{font-size:1.5rem;line-height:1.2;margin:0 0 6px}'+
'.g-box p{margin:8px 0}'+
'.g-hint{color:var(--muted,#4d4d4d);font-size:.92rem}'+
'.g-box label{display:block;font-weight:700;margin:14px 0 4px}'+
'.g-box input{width:100%;min-height:46px;padding:8px 10px;font:inherit;font-size:16px;color:var(--ink,#111);background:var(--surface,var(--bg,#fff));border:2px solid var(--line,#b8b8b8);border-radius:3px}'+
'html input:not([type=checkbox]):not([type=radio]):not([type=range]),html select,html textarea{border-color:var(--muted,#6b7280)}'+
'@media (pointer:coarse){html button,html .btn,html .g-btn,html a.card{min-height:44px}html button.small{min-height:40px;padding-inline:14px}}'+
'.g-box input:focus-visible,.g-btn:focus-visible,.g-tab:focus-visible{outline:3px solid var(--accent,#111);outline-offset:2px}'+
'.g-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}'+
'.g-btn{min-height:46px;padding:10px 20px;font:inherit;font-weight:700;cursor:pointer;border-radius:3px;border:2px solid var(--accent,#111);background:var(--accent,#111);color:var(--accent-ink,#fff)}'+
'html[data-theme="light"] .g-btn.g-cta,html[data-theme="light"] a.g-btn.g-cta:not(.ghost){border:2px solid #0f2a50!important}'+
'.g-btn.g-cta,a.g-btn.g-cta:not(.ghost){background:#fff;border-color:#fff;color:#0f2a50;font-weight:700;flex:1 1 100%;font-size:1.05rem;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;text-align:center;box-shadow:0 2px 0 rgba(0,0,0,.25)}.g-btn.g-cta:hover{filter:brightness(1.08)}'+
'.g-btn.ghost{background:transparent;color:var(--accent,#111)}'+
'.g-btn[disabled]{opacity:.6;cursor:default}'+
'.g-tabs{display:flex;gap:8px;margin:14px 0 4px}'+
'.g-tab{flex:1;min-height:44px;font:inherit;font-weight:700;cursor:pointer;border:2px solid var(--line,#b8b8b8);background:transparent;color:var(--ink,#111);border-radius:3px}'+
'.g-tab[aria-pressed="true"]{background:var(--accent,#111);color:var(--accent-ink,#fff);border-color:var(--accent,#111)}'+
'.g-err{color:var(--bad,#9c2a22);font-weight:700;min-height:1.3em;margin:10px 0 0}'+
'.g-ok{color:var(--ok,#1d5e2e);font-weight:700}'+
'.g-stagebox{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;margin:14px 0;padding:12px 14px;border:2px solid var(--accent,#111);border-radius:3px;background:var(--surface,var(--bg,#fff))}'+
'.g-stagebox label{font-weight:700;margin:0}.g-stagebox select{min-height:46px;min-width:9em;padding:6px 10px;font:inherit;font-size:1.05rem;color:var(--ink,#111);background:var(--bg,#fff);border:2px solid var(--line,#b8b8b8);border-radius:3px}'+
'.g-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:6px 14px;max-width:1120px;margin:0 auto 10px;padding:6px 16px 0;box-sizing:border-box;font-size:.92rem;color:var(--muted,#4d4d4d)}'+
'.g-bar b{color:var(--ink,#111)}'+
'.g-sz{display:inline-flex;align-items:center;gap:6px}.g-sz button{border:2px solid var(--line,#b8b8b8);border-radius:3px;padding:2px 10px;min-width:44px;min-height:44px;font-weight:700;color:var(--ink,#111);background:none;cursor:pointer;text-decoration:none}.g-sz button[disabled]{opacity:.4;cursor:default}.g-sz span{min-width:7.5em;text-align:center}.g-bar a,.g-bar button{font:inherit;font-size:.92rem;color:var(--ink,#111);background:none;border:0;border-bottom:1px solid currentColor;padding:6px 2px;cursor:pointer;text-decoration:none;min-height:36px}';

var CSS2=
'.g-bar{align-items:center}.g-name{font-weight:700;color:var(--ink,#111);max-width:40vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
'.g-um{position:relative;display:inline-flex}.g-bar .g-avbtn{border:2px solid var(--accent,#c9a13b);border-bottom:2px solid var(--accent,#c9a13b);width:44px;height:44px;min-height:44px;padding:0;border-radius:50%}'+
'.g-mn{display:none;position:absolute;right:0;top:calc(100% + 8px);width:300px;max-width:92vw;background:var(--card,#fff);color:var(--ink,#111);border:1px solid var(--line,#999);border-top:4px solid var(--accent,#c9a13b);border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.4);padding:6px;z-index:9000;text-align:left}.g-mn.on{display:block}'+
'.g-mn-h{display:flex;align-items:center;gap:12px;padding:10px 10px 12px;border-bottom:1px solid var(--line,#999);margin-bottom:4px}.g-mn-h b{display:block}.g-mn-h small{display:block;color:var(--muted,#555);overflow:hidden;text-overflow:ellipsis}'+
'.g-bar .g-mi,.g-bar .g-mr{display:flex;align-items:center;gap:12px;width:100%;min-height:46px;padding:6px 10px;border:0;background:transparent;color:var(--ink,#111);text-align:left;border-radius:10px;font:inherit;font-size:1rem;text-decoration:none;box-sizing:border-box;cursor:pointer}.g-bar .g-mi:hover{background:var(--chip,#eee)}'+
'.g-mr>span:first-of-type{flex:1}.g-mi svg,.g-mr svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none}'+
'.g-bar .g-mi.out{border-top:1px solid var(--line,#999);border-radius:0 0 10px 10px;margin-top:4px}'+
'.g-bar .g-sw{width:46px;height:26px;min-height:26px;border-radius:13px;border:0;background:#8a8f99;position:relative;padding:0;flex:none}.g-sw u{position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:left .15s}.g-bar .g-sw.on{background:var(--accent,#c9a13b)}.g-sw.on u{left:23px}'+
'.g-mn .g-sz button{min-width:40px;min-height:36px;padding:0 8px}.g-mn .lang-sel{gap:6px}'+
'.g-hov{position:fixed;inset:0;z-index:10000;background:rgba(5,10,25,.65);display:flex;align-items:center;justify-content:center;padding:16px}.g-hdlg{background:var(--card,#fff);color:var(--ink,#111);border-top:6px solid var(--accent,#c9a13b);border-radius:14px;max-width:480px;width:100%;padding:20px;box-sizing:border-box;max-height:90vh;overflow:auto}'+
'@media(max-width:560px){.g-mn{position:fixed;left:8px;right:8px;top:auto;bottom:8px;width:auto;max-width:none;border-radius:18px;max-height:85vh;overflow:auto}.g-name{max-width:34vw}}';
var LDCSS='.g-ld{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:80vh}'+
'.g-ld img{width:min(34vw,150px);height:auto;animation:gLd 1.8s ease-in-out infinite;filter:drop-shadow(0 0 14px var(--ld,#F5C542))}'+
'.g-ld .bar{width:min(46vw,190px);height:3px;margin-top:26px;border-radius:3px;background:rgba(128,128,128,.28);overflow:hidden}'+
'.g-ld .bar i{display:block;height:100%;width:40%;border-radius:3px;background:var(--ld,#F5C542);animation:gBar 1.3s ease-in-out infinite}'+
'@keyframes gLd{0%,100%{transform:scale(.94);filter:drop-shadow(0 0 4px var(--ld,#F5C542));opacity:.88}50%{transform:scale(1.04);filter:drop-shadow(0 0 20px var(--ld,#F5C542));opacity:1}}'+
'@keyframes gBar{0%{transform:translateX(-110%)}100%{transform:translateX(260%)}}'+
'.bl-sk{display:block;border-radius:10px;background:linear-gradient(90deg,rgba(128,128,128,.16),rgba(128,128,128,.30),rgba(128,128,128,.16));background-size:200% 100%;animation:gSk 1.4s ease-in-out infinite}'+
'@keyframes gSk{0%{background-position:200% 0}100%{background-position:-200% 0}}'+
'@media(prefers-reduced-motion:reduce){.g-ld img,.g-ld .bar i,.bl-sk{animation:none}}';
function loadingView(){
  var o=showOverlay();o.setAttribute('aria-label','Loading');o.setAttribute('aria-busy','true');
  o.append(el('div',{class:'g-ld',role:'status'},el('img',{src:(window.BL_BASE||'')+'img/britland-shield.png',alt:''}),el('div',{class:'bar'},el('i',{}))));
}
function injectCss(){var s=document.createElement('style');s.textContent=CSS+CSS2+LDCSS+(COURSE.css||'');document.head.append(s);}

function showOverlay(){
  if(!overlay){if(window.I18N&&I18N.def)I18N.def(COURSE.loginLang||'pt');overlay=el('div',{class:'g-ov',role:'dialog','aria-modal':'true','aria-label':'Sign in'});document.body.append(overlay);}
  overlay.textContent='';overlay.removeAttribute('aria-busy');overlay.setAttribute('aria-label','Sign in');return overlay;
}
function hideOverlay(){if(overlay){overlay.remove();overlay=null;if(window.I18N){if(I18N.after)I18N.after();else if(I18N.def)I18N.def(COURSE.uiLang||'en');}}}
function langRow(){return window.I18N?el('div',{class:'g-langrow'},window.I18N.selector(true)):null;}
function brand(){return el('p',{class:'g-hint'},'Student Area - Teacher Paulo Cruz');}

function box(title){
  var o=showOverlay(),b=el('div',{class:'g-box'},langRow(),el('div',{class:'bl-lock','aria-label':'Britland Academy'},el('img',{src:'img/britland-shield.png',alt:''}),el('span',{class:'bl-name'},el('b',{},'BRITLAND'),el('i',{},'ACADEMY'))),brand(),el('h1',{},title));
  o.append(b);return b;
}
function message(title,lines,buttons){
  var b=box(title);
  lines.forEach(function(t){b.append(el('p',{},t));});
  if(buttons&&buttons.length)b.append(el('div',{class:'g-row'},buttons));
  var h=b.querySelector('h1');h.setAttribute('tabindex','-1');h.focus({preventScroll:true});
  return b;
}
function btn(label,fn,ghost){return el('button',{type:'button',class:'g-btn'+(ghost?' ghost':''),onclick:fn},label);}

function niceError(e){
  var m=(e&&e.message)||String(e||'');
  if(/invalid login/i.test(m))return 'Wrong e-mail or password.';
  if(/already registered|already been registered/i.test(m))return 'This e-mail is already registered. Use "Sign in".';
  if(/email not confirmed/i.test(m))return 'This e-mail is not confirmed yet. Ask your teacher.';
  if(/password/i.test(m)&&/(least|short|weak)/i.test(m))return 'Choose a longer password (at least 8 characters).';
  if(/rate limit|too many/i.test(m))return 'Too many attempts. Wait a few minutes and try again.';
  if(/failed to fetch|network/i.test(m))return 'No connection. Check your internet and try again.';
  return 'Something went wrong. Try again.'+(m?' ('+String(m).slice(0,140)+')':'');
}

/* ---------- login / request access ---------- */
function showLogin(mode){
  mode=mode||'in';
  var b=box(mode==='in'?'Sign in':'Create account');
  b.append(el('div',{class:'g-tabs',role:'group','aria-label':'Sign in or create account'},
    el('button',{type:'button',class:'g-tab','aria-pressed':String(mode==='in'),onclick:function(){showLogin('in');}},'Sign in'),
    el('button',{type:'button',class:'g-tab','aria-pressed':String(mode==='up'),onclick:function(){showLogin('up');}},'Create account')));
  if(mode==='up')b.append(el('p',{class:'g-hint'},'First time here? Fill in the form. Your teacher will approve your access.'));
  var name=el('input',{id:'g-name',type:'text',autocomplete:'name',maxlength:'60',enterkeyhint:'next'});
  var email=el('input',{id:'g-email',type:'email',autocomplete:'email',inputmode:'email',autocapitalize:'none',spellcheck:'false',enterkeyhint:'next'});
  var pass=el('input',{id:'g-pass',type:'password',autocomplete:mode==='in'?'current-password':'new-password',enterkeyhint:'go'});
  var err=el('p',{class:'g-err','aria-live':'polite'});
  var go=el('button',{type:'submit',class:'g-btn'},mode==='in'?'Sign in':'Create account');
  var form=el('form',{novalidate:true},
    mode==='up'?[el('label',{for:'g-name'},'Your name'),name]:null,
    el('label',{for:'g-email'},'E-mail'),email,
    el('label',{for:'g-pass'},mode==='in'?'Password':'Choose a password (at least 8 characters)'),pass,
    err,el('div',{class:'g-row'},go));
  form.addEventListener('submit',function(ev){
    ev.preventDefault();err.textContent='';
    var em=email.value.trim().toLowerCase(),pw=pass.value,nm=name.value.trim().replace(/\s+/g,' ');
    if(mode==='up'&&!nm){err.textContent='Type your name.';name.focus();return;}
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){err.textContent='Type a valid e-mail.';email.focus();return;}
    if(mode==='up'&&pw.length<8){err.textContent='The password needs at least 8 characters.';pass.focus();return;}
    if(!pw){err.textContent='Type your password.';pass.focus();return;}
    go.disabled=true;
    var p=mode==='in'?sb.auth.signInWithPassword({email:em,password:pw})
                     :sb.auth.signUp({email:em,password:pw,options:{data:{name:nm}}});
    p.then(function(r){
      go.disabled=false;
      if(r.error){err.textContent=niceError(r.error);return;}
      if(mode==='up'&&!r.data.session){
        message('Check your e-mail',['We sent a link to confirm your e-mail. After that, your teacher will approve your access.'],[btn('Back',function(){showLogin('in');})]);
        return;
      }
      route();
    },function(e){go.disabled=false;err.textContent=niceError(e);});
  });
  b.append(form);
  (mode==='up'?name:email).focus({preventScroll:true});
}

function signOut(){
  function wipe(){try{Object.keys(localStorage).forEach(function(k){if(/^sb-.*-auth-token/.test(k)||/^bl-off-/.test(k))localStorage.removeItem(k);});}catch(e){}location.reload();}
  return sb.auth.signOut({scope:'local'}).then(wipe,wipe);
}

/* ---------- top bar ---------- */
var SVG={bell:'<path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7"/><path d="M10 20a2 2 0 0 0 4 0"/>',user:'<path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17.3v.2"/>',out:'<path d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9"/>',panel:'<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 21h8"/>'};
function ico(k){var s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 24 24');s.setAttribute('aria-hidden','true');s.innerHTML=SVG[k];return s;}
function paintAvatars(){
  if(!window.Profile||!prof)return;
  Array.prototype.forEach.call(document.querySelectorAll('[data-pf-av]'),function(n){window.Profile.paint(n,prof.avatar,prof.id||user.id);});
}
function setAvatar(id){if(prof)prof.avatar=id;paintAvatars();}
function firstName(){return String((prof&&prof.name)||'').trim().split(/\s+/)[0]||'';}
function thanksPay(){
  if(!sb||!prof||prof.is_admin||BUS)return;
  sb.from('charges').select('id,due_date,paid_on').not('paid_on','is',null).order('paid_on',{ascending:false}).limit(3).then(function(r){
    var rows=(r&&r.data)||[],lim=new Date();lim.setDate(lim.getDate()-14);var cut=lim.toISOString().slice(0,10),c=null;
    rows.forEach(function(x){if(c||x.paid_on<cut)return;try{if(!localStorage.getItem('bl-thanks-'+x.id))c=x;}catch(e){}});
    if(!c)return;
    try{localStorage.setItem('bl-thanks-'+c.id,'1');}catch(e){}
    var M=['January','February','March','April','May','June','July','August','September','October','November','December'],mo=M[+String(c.due_date).slice(5,7)-1]||'';
    var n=firstName(),nn=n?', '+n:'',P=[
      'Thank you'+nn+'! Your payment has been received. We\u2019re glad to have you at Britland Academy.',
      'Payment received'+nn+'. Thank you for your trust. See you in class!',
      'Thank you'+nn+'! Your '+mo+' payment is confirmed. Keep up the great work.',
      'Obrigado'+nn+'! Recebemos o seu pagamento. Bons estudos!'];
    var msg=P[Math.floor(Math.random()*P.length)];
    var ov=el('div',{class:'g-hov'}),close=function(){document.removeEventListener('keydown',kd);ov.remove();},kd=function(e){if(e.key==='Escape')close();};
    var d=el('div',{class:'g-hdlg',role:'dialog','aria-modal':'true','aria-label':'Thank you'},el('h2',{style:'margin:0 0 10px'},'Thank you! \uD83D\uDC9B'),el('p',{},msg),el('div',{class:'g-row',style:'justify-content:flex-end'},el('button',{type:'button',class:'g-btn',onclick:close},'Close')));
    ov.append(d);ov.addEventListener('click',function(e){if(e.target===ov)close();});document.addEventListener('keydown',kd);document.body.append(ov);
  }).catch(function(){});
}
function pushInfo(text){
  var ov=el('div',{class:'g-hov'}),close=function(){document.removeEventListener('keydown',kd);ov.remove();},kd=function(e){if(e.key==='Escape')close();};
  var d=el('div',{class:'g-hdlg',role:'dialog','aria-modal':'true','aria-label':'Notifications'},el('h2',{style:'margin:0 0 10px'},'Notifications'),el('p',{},text),el('div',{class:'g-row',style:'justify-content:flex-end'},el('button',{type:'button',class:'g-btn',onclick:close},'Close')));
  ov.append(d);ov.addEventListener('click',function(e){if(e.target===ov)close();});document.addEventListener('keydown',kd);document.body.append(ov);
}
function pushRow(closeMenu){
  var P=function(){return window.BLPush;};
  var ios=/iPhone|iPad|iPod/.test(navigator.userAgent),can='serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
  if(!can&&!ios)return document.createComment('');
  var sw=el('button',{type:'button',class:'g-sw',role:'switch','aria-checked':'false','aria-label':'Notifications'},el('u'));
  var set=function(on){sw.setAttribute('aria-checked',on?'true':'false');sw.classList.toggle('on',!!on);};
  sw.addEventListener('click',function(){
    var p=P();
    if(!p){if(sw._ld)return;sw._ld=1;var ld=document.createElement('script');ld.src=(window.BL_BASE||'')+'js/push.js?v='+(window.BL_VERSION||'1');ld.onload=function(){sw._ld=0;sw.click();};ld.onerror=function(){sw._ld=0;closeMenu(false);pushInfo('Could not load the notifications module. Check your connection and try again. (push.js)');};document.head.append(ld);return;}
    if(!can){closeMenu(false);pushInfo('To get notifications on iPhone, first add the app to your Home Screen: tap Share, then Add to Home Screen. Open the app from there and turn Notifications on again.');return;}
    if(sw.getAttribute('aria-checked')==='true'){p.disable(sb).then(function(){set(false);},function(){});return;}
    if(Notification.permission==='denied'){closeMenu(false);pushInfo('Notifications are blocked for this app. Open your phone settings, find Britland, and allow notifications.');return;}
    p.enable(sb).then(function(){set(true);},function(e){if(e&&e.message==='denied'){closeMenu(false);pushInfo('Notifications were not allowed. You can allow them later in your phone settings.');}else{closeMenu(false);pushInfo('Could not turn notifications on. Try again in a moment. ('+String((e&&(e.message||e.details||e.code))||e).slice(0,120)+')');}});
  });
  if(can&&Notification.permission==='granted'){var t=setInterval(function(){var p=P();if(!p)return;clearInterval(t);p.current().then(function(s){set(!!s);if(s)p.sync(sb);}).catch(function(){});},300);setTimeout(function(){clearInterval(t);},6000);}
  return el('div',{class:'g-mr'},ico('bell'),el('span',{},'Notifications'),sw);
}
function showHelp(){
  var ov=el('div',{class:'g-hov'}),close=function(){document.removeEventListener('keydown',kd);ov.remove();},kd=function(e){if(e.key==='Escape')close();};
  var nm=(prof&&prof.name)||'';
  var wa=el('a',{class:'g-btn',href:'https://wa.me/5511914881274?text='+encodeURIComponent('Hello! This is '+nm+', a Britland Academy student. I need help.'),target:'_blank',rel:'noopener',style:'text-decoration:none;display:inline-flex;align-items:center'},'Talk to the school');
  var d=el('div',{class:'g-hdlg',role:'dialog','aria-modal':'true','aria-label':'Help'},
    el('h2',{style:'margin:0 0 10px'},'Help'),
    el('p',{},el('b',{},'Grades and payments:'),' open My Profile in the menu on your picture.'),
    el('p',{},el('b',{},'Change picture, theme, language or text size:'),' use the menu on your picture, or Settings in My Profile.'),
    el('p',{},el('b',{},'Need more help?'),' Write to your teacher on WhatsApp.'),
    el('p',{class:'g-hint',style:'font-size:.82rem'},'App version '+(window.BL_VERSION||'')),el('div',{class:'g-row',style:'justify-content:flex-end'},el('button',{type:'button',class:'g-btn ghost',onclick:close},'Close'),wa));
  ov.append(d);ov.addEventListener('click',function(e){if(e.target===ov)close();});document.addEventListener('keydown',kd);document.body.append(ov);
}
function addBar(){
  if(bar)bar.remove();
  var kids=[];
  var tabsNav=document.getElementById('tabs');
  if(OPTS.noStageBox){}
  else if(tabsNav&&OPTS.kinds&&OPTS.kinds.length){var sb2=stageBox();if(sb2)tabsNav.parentNode.insertBefore(sb2,tabsNav);}
  else{var ss=stageSelect();if(ss)kids.push(ss);}
  kids.push(el('a',{href:'index.html'},'Home'));
  kids.push(el('span',{class:'g-name'},prof.name||user.email));
  var av=el('button',{type:'button',class:'pf-av g-avbtn','data-pf-av':'1','aria-haspopup':'true','aria-expanded':'false','aria-label':'Menu'});
  var mn=el('div',{class:'g-mn',role:'menu'});
  var open=function(o){mn.classList.toggle('on',o);av.setAttribute('aria-expanded',String(o));};
  av.addEventListener('click',function(e){e.stopPropagation();open(!mn.classList.contains('on'));});
  var head=el('div',{class:'g-mn-h'},el('span',{class:'pf-av','data-pf-av':'1'}),el('div',{},el('b',{},prof.name||user.email),el('small',{},user.email||'')));
  var mi=function(k,label,props){var b=el(props.href?'a':'button',Object.assign({class:'g-mi',role:'menuitem'},props),ico(k),el('span',{},label));return b;};
  themeSw=el('button',{type:'button',class:'g-sw',role:'switch','aria-checked':'false','aria-label':'Dark mode',onclick:function(){setTheme(shownTheme()==='dark'?'light':'dark');}},el('u'));applyTheme();
  var minus=el('button',{type:'button','aria-label':'Smaller text',onclick:function(){setSize(fsIdx-1);}},'A−');
  var plus=el('button',{type:'button','aria-label':'Larger text',onclick:function(){setSize(fsIdx+1);}},'A+');
  var lab=el('span',{style:'display:none','aria-live':'polite'});
  sizeUi={minus:minus,plus:plus,lab:lab};updateSizeUi();
  mn.append(head,
    COURSE.profile===false?document.createComment(''):mi('user','My Profile',{href:'account.html'}),
    COURSE.profile===false?document.createComment(''):mi('edit','Change picture',{href:'account.html#picture'}),
    el('div',{class:'g-mr'},ico('moon'),el('span',{},'Dark mode'),themeSw),
    COURSE.push===false?document.createComment(''):pushRow(open),
    el('div',{class:'g-mr'},el('b',{style:'width:20px;text-align:center'},'Aa'),el('span',{},'Text size'),el('span',{class:'g-sz',role:'group','aria-label':'Text size'},minus,plus,lab)));
  if(window.I18N&&I18N.mode==='free')mn.append(el('div',{class:'g-mr'},el('span',{},'Language'),window.I18N.selector()));
  if(prof.is_admin)mn.append(mi('panel','Teacher panel',{href:'admin.html'}));
  mn.append(mi('help','Help',{onclick:function(){open(false);showHelp();}}),mi('out','Sign out',{class:'g-mi out',onclick:signOut}));
  mn.querySelectorAll('a.g-mi').forEach(function(a){a.addEventListener('click',function(){open(false);});});
  document.addEventListener('click',function(e){if(!mn.contains(e.target)&&e.target!==av)open(false);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')open(false);});
  kids.push(el('span',{class:'g-um'},av,mn));
  bar=el('div',{class:'g-bar'},kids);
  document.body.insertBefore(bar,document.body.firstChild);
  paintAvatars();
  if(BUS)fixLinks();
}
function fixLinks(){
  Array.prototype.forEach.call(document.querySelectorAll('a[href]'),function(a){
    var h=a.getAttribute('href')||'';
    if(/^(lessons|check|exercises)\.html/.test(h)&&h.indexOf('course=')<0)a.setAttribute('href',h+(h.indexOf('?')<0?'?':'&')+'course=business');
  });
}

/* ---------- content ---------- */
var BUS=/[?&]course=business/.test(location.search);window.CBUS=BUS;
function upto(){if(BUS)return prof.is_admin?17:(prof.status==='approved'?(prof.business_upto||0):0);return prof.is_admin?MAXL:(prof.status==='approved'?prof.lessons_upto:0);}
var STG=COURSE.stages||[[1,12],[13,27],[28,44],[45,63],[64,82],[83,101],[102,120],[121,138],[139,156],[157,174],[175,190],[191,206]];
var MAXL=COURSE.maxLesson||206,SKEYST=COURSE.stageKey||'callan-stage';
function stageOf(n){var i;for(i=0;i<STG.length;i++)if(n>=STG[i][0]&&n<=STG[i][1])return i+1;return 1;}
function curStage(){
  var top=Math.max(BUS?mainUpto():upto(),1),mx=stageOf(top),v=0;
  try{v=parseInt(new URLSearchParams(location.search).get('stage')||localStorage.getItem(SKEYST),10);}catch(e){}
  return (v>=1&&v<=mx)?v:mx;
}
function setStage(n){try{localStorage.setItem(SKEYST,String(n));}catch(e){}
  try{var u=new URL(location.href);u.searchParams.delete('stage');location.href=u.toString();}catch(e){location.reload();}}

/* ---------- offline support: lessons keep working without internet ---------- */
var OFF=false;
function okey(){return 'bl-off-'+String(CFG.url||'').replace(/[^a-z0-9]/gi,'').slice(-16);}
function isNet(e){var m=String((e&&e.message)||e||'');return navigator.onLine===false||/failed to fetch|networkerror|network request|load failed|timeout|offline/i.test(m);}
function idb(){return new Promise(function(res,rej){try{var q=indexedDB.open('bl-offline',1);q.onupgradeneeded=function(){q.result.createObjectStore('c',{keyPath:'k'});};q.onsuccess=function(){res(q.result);};q.onerror=function(){rej(q.error);};}catch(e){rej(e);}});}
function idbPut(rows){return idb().then(function(d){return new Promise(function(res){var t=d.transaction('c','readwrite'),st=t.objectStore('c');rows.forEach(function(r){st.put(r);});t.oncomplete=function(){res();};t.onerror=function(){res();};});}).catch(function(){});}
function idbAll(pre){return idb().then(function(d){return new Promise(function(res){var out=[],q=d.transaction('c').objectStore('c').openCursor();q.onsuccess=function(){var c=q.result;if(c){if(String(c.key).indexOf(pre)===0)out.push(c.value);c.continue();}else res(out);};q.onerror=function(){res([]);};});}).catch(function(){return [];});}
function offBanner(on){
  var b=document.getElementById('bl-off');
  if(!on){if(b)b.remove();return;}
  if(b)return;
  b=el('div',{id:'bl-off',role:'status',style:'position:fixed;left:0;right:0;bottom:0;z-index:99998;background:#7a4b00;color:#fff;padding:8px 14px;text-align:center;font:600 .92rem system-ui,sans-serif'},window.I18N?I18N.t('Offline mode · your results will be sent when you are back online.'):'Offline mode · your results will be sent when you are back online.');
  document.body.append(b);
  if(window.I18N&&I18N.after)try{I18N.after();}catch(e){}
}
function pq(){try{return JSON.parse(localStorage.getItem(okey()+'-q')||'[]');}catch(e){return [];}}
function pqSet(a){try{localStorage.setItem(okey()+'-q',JSON.stringify(a));}catch(e){}}
function flushQ(){
  var q=pq();if(!q.length||!sb||!user||navigator.onLine===false)return Promise.resolve();
  var left=[],chain=Promise.resolve();
  q.forEach(function(a){chain=chain.then(function(){return sb.from('attempts').insert(a).then(function(r){if(r.error&&isNet(r.error))left.push(a);},function(){left.push(a);});});});
  return chain.then(function(){pqSet(left);if(!left.length&&!OFF)offBanner(false);});
}
window.addEventListener('online',function(){flushQ();});
function cacheAcct(){try{localStorage.setItem(okey()+'-acct',JSON.stringify({user:{id:user.id,email:user.email},prof:prof}));}catch(e){}}
function cachedAcct(){try{var c=JSON.parse(localStorage.getItem(okey()+'-acct'));return c&&c.user&&c.prof?c:null;}catch(e){return null;}}
function prefetch(lo,hi){
  /* while online, quietly store the whole released stage (text, checks, exercises) and the shared files for offline use */
  var tag=okey()+'-pf-'+lo+'-'+hi,now=Date.now(),last=0;
  try{last=parseInt(localStorage.getItem(tag),10)||0;}catch(e){}
  if(now-last<864e5||navigator.onLine===false)return;
  setTimeout(function(){
    sb.from('content').select('lesson,kind,body').in('kind',['text','check','ex']).gte('lesson',lo).lte('lesson',hi).then(function(r){
      if(r.error||!r.data)return;
      idbPut(r.data.map(function(x){return {k:okey()+':'+x.kind+':'+x.lesson,lesson:x.lesson,kind:x.kind,body:x.body};}));
      try{localStorage.setItem(tag,String(now));}catch(e){}
    },function(){});
    var b=window.BL_BASE||'',own=window.BL_COURSE?['dele.html']:['exercises.html','workbook.html'];
    ['index.html','lessons.html','check.html'].concat(own,['js/gate.js','js/config.js','js/i18n.js','js/theme.css','js/wm.css','js/fonts.css','js/brand.css','js/protect.js','js/covers.js','js/profile.js','js/push.js','js/streak.js','js/avatars.js','js/facts.js','js/facts_i18n.js','js/pwa.js']).forEach(function(u){try{fetch(b+u,{credentials:'same-origin'}).catch(function(){});}catch(e){}});
  },2500);
}
function loadContent(kinds){
  window.CHECKS=[];window.LESSON_TEXT={};window.EXLESSONS=[];
  window.LESSONS_UPTO=upto();
  if(!kinds||!kinds.length)return Promise.resolve();
  var st=BUS?1:curStage(),lo=BUS?1001:STG[st-1][0],hi=BUS?1000+Math.max(upto(),1):Math.min(STG[st-1][1],Math.max(upto(),1));
  window.CALLAN_STAGE=st;
  function one(tries){
    return sb.from('content').select('lesson,kind,body').in('kind',kinds).gte('lesson',lo).lte('lesson',hi).order('lesson',{ascending:true}).then(function(r){
      if(r.error)throw r.error;return r.data||[];
    }).catch(function(e){if(tries>0)return one(tries-1);throw e;});
  }
  var pre=okey()+':';
  return one(2).then(function(rows){
    idbPut(rows.map(function(x){return {k:pre+x.kind+':'+x.lesson,lesson:x.lesson,kind:x.kind,body:x.body};}));
    prefetch(lo,hi);
    return rows;
  },function(e){
    return idbAll(pre).then(function(all){
      var rows=all.filter(function(x){return kinds.indexOf(x.kind)>=0&&x.lesson>=lo&&x.lesson<=hi;}).sort(function(a,b){return a.lesson-b.lesson;});
      if(!rows.length||!isNet(e))throw e;
      OFF=true;return rows;
    });
  }).then(function(rows){
    rows.forEach(function(row){
      if(row.kind==='check')window.CHECKS.push(row.body);
      else if(row.kind==='text')window.LESSON_TEXT[BUS?row.lesson-1000:row.lesson]=row.body;
      else if(row.kind==='ex')window.EXLESSONS.push(row.body);
    });
  });
}
function mainUpto(){return prof.is_admin?MAXL:(prof.status==='approved'?(prof.lessons_upto||0):0);}
function bizUpto(){return prof.is_admin?17:(prof.status==='approved'?(prof.business_upto||0):0);}
function goStage(v){
  try{
    if(v===13){var u=new URL(location.href);u.searchParams.set('course','business');u.searchParams.delete('stage');location.href=u.toString();return;}
    if(BUS){try{localStorage.setItem(SKEYST,String(v));}catch(e){}var w=new URL(location.href);w.searchParams.delete('course');w.searchParams.delete('stage');location.href=w.toString();return;}
  }catch(e){}
  setStage(v);
}
function stageOpts(sel,disableLocked){
  var mx=stageOf(Math.max(mainUpto(),1)),cur=BUS?13:curStage(),i,o;
  for(i=1;i<=STG.length;i++){if(!disableLocked&&i>mx)break;o=el('option',{value:String(i)},'Stage '+i);if(i>mx)o.disabled=true;if(i===cur)o.selected=true;sel.append(o);}
  if(bizUpto()>0||disableLocked){o=el('option',{value:'13'},'Business');if(bizUpto()<1)o.disabled=true;if(cur===13)o.selected=true;sel.append(o);}
}
function stageSelect(){
  if(!OPTS.kinds||!OPTS.kinds.length)return null;
  if(stageOf(Math.max(mainUpto(),1))<2&&bizUpto()<1)return null;
  var sel=el('select',{'aria-label':'Stage',onchange:function(){goStage(parseInt(sel.value,10));}});
  stageOpts(sel,false);
  return sel;
}
function stageBox(){
  var sel=el('select',{id:'g-stage','aria-label':'Stage',onchange:function(){goStage(parseInt(sel.value,10));}});
  stageOpts(sel,true);
  return el('div',{class:'g-stagebox'},el('label',{for:'g-stage'},'Choose the Stage to load'),sel,el('span',{class:'g-hint'},'Only this Stage is downloaded, to save data.'));
}
function fetchAttempts(kind){
  var q=sb.from('attempts').select('lesson,ex,score,total,created_at').eq('kind',kind).eq('user_id',user.id);
  q=BUS?q.gte('lesson',1001):q.lte('lesson',MAXL);
  var key=okey()+':att:'+kind+(BUS?':b':'');
  function pend(){return pq().filter(function(a){return a.kind===kind;}).map(function(a){return {l:BUS?a.lesson-1000:a.lesson,e:a.ex,s:a.score,t:a.total,at:Date.parse(a.created_at),k:kind};});}
  return q
    .order('created_at',{ascending:true}).limit(5000).then(function(r){
      if(r.error)throw r.error;
      var rows=(r.data||[]).map(function(a){return {l:BUS?a.lesson-1000:a.lesson,e:a.ex,s:a.score,t:a.total,at:Date.parse(a.created_at),k:kind};});
      idbPut([{k:key,rows:rows}]);
      return rows.concat(pend());
    }).catch(function(e){
      if(!isNet(e))throw e;
      return idbAll(key).then(function(all){OFF=true;return ((all[0]&&all[0].rows)||[]).concat(pend());});
    });
}
function saveAttempt(kind,a){
  var row={kind:kind,lesson:BUS?a.l+1000:a.l,ex:a.e,score:a.s,total:a.total!==undefined?a.total:a.t};
  function later(){var q=pq();q.push({kind:row.kind,lesson:row.lesson,ex:row.ex,score:row.score,total:row.total,created_at:new Date().toISOString()});pqSet(q);offBanner(true);}
  if(navigator.onLine===false){later();return Promise.resolve();}
  return sb.from('attempts').insert(row).then(function(r){
    if(r.error){if(isNet(r.error)){later();return;}throw r.error;}
    if(!OPTS.admin){try{sb.rpc('ping_activity').then(function(){},function(){});}catch(e){}}
  },function(e){if(isNet(e)){later();return;}throw e;});
}
function audioUrl(path){
  return sb.storage.from('audio').createSignedUrl(path,7200).then(function(r){
    if(r.error||!r.data)throw (r.error||new Error('no url'));
    return r.data.signedUrl;
  });
}

function applyServerPrefs(){
  try{
    if(prof.theme&&prof.theme!==theme&&/^(light|dark|auto)$/.test(prof.theme))setTheme(prof.theme,true);
    if(prof.lang&&window.I18N&&I18N.mode==='free'&&I18N.def)I18N.def(prof.lang);
  }catch(e){}
}
function loadProfile(cb){
  function go(){window.Profile.css();window.Profile.ready().then(cb||function(){});}
  if(window.Profile){go();return;}
  var sc=document.createElement('script');sc.src=(window.BL_BASE||'')+'js/profile.js';sc.onload=go;document.head.append(sc);var sp=document.createElement('script');sp.src=(window.BL_BASE||'')+'js/push.js';document.head.append(sp);
}
/* ---------- routing ---------- */
var OPTS={kinds:[],attempts:null,admin:false},CB=null;
/* ---------- small helpers: skip link, icon-button labels, gentle notification reminder ---------- */
function a11yPass(){
  try{
    var m=document.querySelector('main')||document.querySelector('[role=main]');
    if(m&&!document.querySelector('.bl-skip')){if(!m.id)m.id='bl-main';var a=el('a',{class:'bl-skip',href:'#'+m.id},window.I18N?I18N.t('Skip to content'):'Skip to content');document.body.prepend(a);
      var st=document.createElement('style');st.textContent='.bl-skip{position:absolute;left:8px;top:-60px;z-index:100000;padding:10px 14px;background:#111;color:#fff;border-radius:8px;font-weight:700}.bl-skip:focus{top:8px}';document.head.append(st);}
    Array.prototype.forEach.call(document.querySelectorAll('button,a[href]'),function(b){
      if(b.getAttribute('aria-label')||(b.textContent||'').trim()||b.getAttribute('aria-labelledby'))return;
      var t=b.getAttribute('title');if(t)b.setAttribute('aria-label',t);});
  }catch(e){}
}
function pushNudge(){
  try{
    if(OPTS.admin||OPTS.bare||OFF||!/(^|\/)(index\.html)?$/.test(location.pathname))return;
    if(!('Notification' in window)||!('PushManager' in window)||Notification.permission!=='default')return;
    var k=okey()+'-pn',last=parseInt(localStorage.getItem(k),10)||0;if(Date.now()-last<3*864e5)return;
    if(document.getElementById('bl-pn'))return;
    var bar=el('div',{id:'bl-pn',role:'region','aria-label':'Notifications',style:'display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:10px 14px;padding:10px 14px;border:2px solid var(--accent,#c9a13b);border-radius:12px;background:var(--card,#fff);color:var(--ink,#111)'},
      el('span',{style:'flex:1;min-width:180px'},'Turn on notifications to get your class reminders.'));
    var on=btn('Turn on',function(){
      on.disabled=true;
      function go(){var P=window.BLPush;if(!P||!P.supported()||(P.ios()&&!P.standalone())){bar.remove();return;}P.enable(sb).then(function(){bar.remove();},function(){bar.remove();});}
      if(window.BLPush)go();else{var sc=document.createElement('script');sc.src=(window.BL_BASE||'')+'js/push.js';sc.onload=go;document.head.append(sc);}
    });
    var no=btn('Not now',function(){try{localStorage.setItem(k,String(Date.now()));}catch(e){}bar.remove();},true);
    bar.append(on,no);
    var host=document.querySelector('main')||document.body;host.prepend(bar);
    if(window.I18N&&I18N.after)try{I18N.after();}catch(e){}
  }catch(e){}
}
/* ---------- welcome: three short screens for a brand-new student ---------- */
function welcome(done){
  var k='bl-welcome-'+user.id;
  try{if(localStorage.getItem(k))return done();}catch(e){return done();}
  function mark(){try{localStorage.setItem(k,'1');}catch(e){}}
  sb.from('attempts').select('id',{count:'exact',head:true}).eq('user_id',user.id).then(function(r){
    if(r.error||(r.count||0)>0){mark();return done();}
    var SP=!!window.BL_COURSE;
    var S=[['Welcome to Britland Academy!',['Your lessons are here: read the lesson text, listen to the audio and practise.','It takes only a few minutes a day.']],
      ['How to study',['1. Read the lesson and listen to the audio.','2. Do the Lesson Check and the exercises.','3. Your teacher sees your progress and opens new lessons.']],
      ['Keep it close',['Add Britland Academy to your home screen and turn on Notifications to get class reminders.','You can change this later in the menu on your picture.']],
      ['Try your first question',[SP?'Choose the correct word: Yo ___ estudiante.':'Choose the correct word: I ___ a student.']]];
    var Q=SP?['soy','eres','es']:['am','is','are'],QA=SP?0:0;
    function finish(go){mark();hideOverlay();if(go)location.href='lessons.html';else done();}
    function push(box){
      var P=window.BLPush;
      function ready(cb){if(window.BLPush)return cb();var sc=document.createElement('script');sc.src=(window.BL_BASE||'')+'js/push.js';sc.onload=cb;document.head.append(sc);}
      var row=el('div',{class:'g-row'});var note=el('p',{},'');
      var b=btn('Turn on notifications',function(){
        b.disabled=true;
        ready(function(){var P=window.BLPush;
          if(!P||!P.supported()){note.textContent='This device cannot receive notifications here. Install the app first.';b.disabled=false;return;}
          if(P.ios()&&!P.standalone()){note.textContent='On iPhone: tap Share, then “Add to Home Screen”, open the app from there and turn on notifications.';b.disabled=false;return;}
          P.enable(sb).then(function(){b.textContent='Notifications on ✓';},function(){note.textContent='Notifications are off. You can turn them on later in My Profile.';b.disabled=false;});
        });
      });
      row.append(b);box.append(row,note);
    }
    (function show(i){
      var last=i===S.length-1,box;
      if(i===3){
        box=message(S[i][0],S[i][1],[]);
        var fb=el('p',{role:'status'},''),row=el('div',{class:'g-row'});
        Q.forEach(function(w,k){row.append(btn(w,function(){
          if(k===QA){fb.textContent=SP?'¡Correcto! Todos los ejercicios funcionan así.':'Correct! Every Lesson Check works like this.';row.remove();
            var r2=el('div',{class:'g-row'});r2.append(btn(SP?'Ir a la Lección 1':'Go to Lesson 1',function(){finish(true);}),btn(SP?'Más tarde':'Later',function(){finish(false);},true));box.append(r2);}
          else fb.textContent=SP?'Todavía no. Inténtalo otra vez.':'Not yet. Try again.';
        }));});
        box.append(row,fb);
      }else{
        box=message(S[i][0],S[i][1],[btn('Next',function(){show(i+1);}),btn('Skip',function(){finish(false);},true)]);
        if(i===2)push(box);
      }
      if(window.I18N&&I18N.after)try{I18N.after();}catch(e){}
    })(0);
  },function(){done();});
}
function enter(){
    if(prof.status==='pending'){
      message('Waiting for approval',['Your request was sent, '+(prof.name||prof.email||'student')+'. Your teacher needs to approve your access.','Come back later and press "Check again".'],
        [btn('Check again',route),btn('Sign out',signOut,true)]);return;
    }
    if(prof.status==='blocked'){
      message('Access closed',['Your access is not active. Talk to your teacher.'],[btn('Sign out',signOut,true)]);return;
    }
    if(OPTS.admin&&!prof.is_admin){
      message('Teachers only',['This page is for the teacher.'],[el('a',{class:'g-btn',href:'index.html',style:'text-decoration:none;display:inline-flex;align-items:center'},'Home'),btn('Sign out',signOut,true)]);return;
    }
    if(!OPTS.admin&&upto()<1&&!(!BUS&&(prof.business_upto||0)>0&&(location.pathname.split('/').pop()||'index.html')==='index.html')){
      message('No lessons yet',['Your access is approved, but no lesson has been released to you yet. Talk to your teacher.'],[btn('Check again',route),btn('Sign out',signOut,true)]);return;
    }
    return loadContent(OPTS.kinds).then(function(){
      return OPTS.attempts?(Array.isArray(OPTS.attempts)?Promise.all(OPTS.attempts.map(fetchAttempts)).then(function(x){return [].concat.apply([],x);}):fetchAttempts(OPTS.attempts)):[];
    }).then(function(att){
      function fin(){
        hideOverlay();applyServerPrefs();if(OFF)offBanner(true);else flushQ();if(!OPTS.bare){addBar();loadProfile(paintAvatars);try{thanksPay();}catch(e){}}
        /* the streak counts finished activities only (see saveAttempt) */
        CB({user:user,profile:prof,attempts:att,upto:upto()});
        setTimeout(function(){a11yPass();pushNudge();},600);
      }
      if(OPTS.admin||OPTS.bare||OFF||prof.is_admin)fin();else welcome(fin);
    });
}
function route(){
  if(navigator.onLine===false){var c0=cachedAcct();if(c0){user=c0.user;prof=c0.prof;OFF=true;Promise.resolve().then(enter).catch(function(e){message('Could not load',[niceError(e)],[btn('Try again',route)]);});return;}}
  sb.auth.getSession().then(function(r){
    var s=r.data&&r.data.session;
    if(!s){showLogin('in');return;}
    user=s.user;
    return sb.from('profiles').select('*').eq('id',user.id).maybeSingle().then(function(pr){
      if(pr.error&&isNet(pr.error)){var c1=cachedAcct();if(c1&&c1.user.id===user.id){prof=c1.prof;OFF=true;return enter();}}
      if(pr.error||!pr.data){
        message('Account not ready',['We could not read your account. Try again in a moment.'],[btn('Try again',route),btn('Sign out',signOut,true)]);return;
      }
      prof=pr.data;cacheAcct();
      return enter();
    });
  }).catch(function(e){
    if(isNet(e)){var c2=cachedAcct();if(c2){user=c2.user;prof=c2.prof;OFF=true;return Promise.resolve().then(enter).catch(function(e2){message('Could not load',[niceError(e2)],[btn('Try again',route)]);});}}
    message('Could not load',[niceError(e)],[btn('Try again',route),btn('Sign out',signOut,true)]);
  });
}

function loadLib(i,cb){
  if(window.supabase&&window.supabase.createClient)return cb(null);
  if(i>=LIB.length)return cb(new Error('lib'));
  var s=document.createElement('script');s.src=LIB[i];
  s.onload=function(){loadLib(i+1,cb);};
  s.onerror=function(){loadLib(i+1,cb);};
  document.head.append(s);
}

function start(opts,cb){
  OPTS=opts||OPTS;CB=cb;
  injectCss();
  loadingView();
  loadLib(0,function(err){
    if(err){message('No connection',['Could not load the sign-in system. Check your internet and reload the page.'],[btn('Reload',function(){location.reload();})]);return;}
    sb=window.supabase.createClient(CFG.url,CFG.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
    window.Gate.sb=sb;
    route();
  });
}

function skel(box,n,h){if(!box)return;box.setAttribute('aria-busy','true');for(var i=0;i<(n||3);i++){var d=document.createElement('span');d.className='bl-sk';d.style.height=(h||52)+'px';d.style.marginBottom='10px';box.append(d);}}
function unskel(box){if(!box)return;box.removeAttribute('aria-busy');Array.prototype.slice.call(box.querySelectorAll(':scope>.bl-sk')).forEach(function(n){n.remove();});}
window.Gate={skel:skel,unskel:unskel,profile:function(){return prof;},start:start,signOut:signOut,setSize:setSize,setTheme:function(t){setTheme(t);},theme:function(){return theme;},shownTheme:shownTheme,setAvatar:setAvatar,loadProfile:loadProfile,sizeIdx:function(){return fsIdx;},sizeMax:function(){return SIZES.length-1;},saveAttempt:saveAttempt,audioUrl:audioUrl,el:el,
  get profile(){return prof;},bizUpto:function(){return bizUpto();},mainUpto:function(){return mainUpto();},get user(){return user;},sb:null};
})();
