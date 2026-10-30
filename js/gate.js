/* Callan site: sign-in gate (Supabase). Each page calls Gate.start(options, callback).
   The callback runs only after the student is signed in and approved, and after the content
   that the teacher released to this student has been loaded from the server. */
(function(){
'use strict';
var CFG=window.CALLAN_CFG||{};
var COURSE=window.BL_COURSE||{};
try{var _u=document.createElement('link');_u.rel='stylesheet';_u.href=(window.BL_BASE||'')+'js/ui.css?v='+(window.BL_VERSION||'1');document.head.appendChild(_u);}catch(e){} /* per-course settings (Spanish sets its own in espanol/js/config.js) */
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
'.g-forgot{margin:8px 0 0}.g-forgot a{color:inherit;font-weight:600}'+
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
'.g-nav{position:fixed;left:0;right:0;bottom:0;z-index:5000;display:flex;background:var(--card,#fff);border-top:1px solid var(--line,#999);padding-bottom:env(safe-area-inset-bottom,0px)}.g-nav .gn-i{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px;min-height:56px;box-sizing:border-box;color:var(--muted,#666);text-decoration:none;font-size:.8rem;font-weight:700}.g-nav .gn-i.on{color:var(--accent,#c9a13b)}.g-nav .gn-e{font-size:1.4rem;line-height:1}.gp{display:block!important;max-width:none!important;margin:8px 0 0!important;padding:0!important}.g-gamebody{padding-bottom:calc(72px + env(safe-area-inset-bottom,0px))}'+
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
  if(/password/i.test(m)&&/(least|short|weak)/i.test(m))return 'Choose a longer password (at least 6 characters).';
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
  var bday=el('input',{id:'g-bd',type:'date',min:'1920-01-01',max:isoToday(),autocomplete:'bday'});
  var pass=el('input',{id:'g-pass',type:'password',autocomplete:mode==='in'?'current-password':'new-password',enterkeyhint:'go'});
  var err=el('p',{class:'g-err','aria-live':'polite'});
  var go=el('button',{type:'submit',class:'g-btn'},mode==='in'?'Sign in':'Create account');
  var form=el('form',{novalidate:true},
    mode==='up'?[el('label',{for:'g-name'},'Your name'),name,el('label',{for:'g-bd'},'Date of birth'),bday]:null,
    el('label',{for:'g-email'},'E-mail'),email,
    el('label',{for:'g-pass'},mode==='in'?'Password':'Choose a password (at least 6 characters)'),pass,
    mode==='in'?el('p',{class:'g-forgot'},el('a',{href:'#',onclick:function(ev){ev.preventDefault();showForgot(email.value.trim());}},'Forgot my password')):null,
    err,el('div',{class:'g-row'},go));
  form.addEventListener('submit',function(ev){
    ev.preventDefault();err.textContent='';
    var em=email.value.trim().toLowerCase(),pw=pass.value,nm=name.value.trim().replace(/\s+/g,' ');
    if(mode==='up'&&!nm){err.textContent='Type your name.';name.focus();return;}
    if(mode==='up'&&!bday.value){err.textContent='Choose your date of birth.';bday.focus();return;}
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){err.textContent='Type a valid e-mail.';email.focus();return;}
    if(mode==='up'&&pw.length<6){err.textContent='The password needs at least 6 characters.';pass.focus();return;}
    if(!pw){err.textContent='Type your password.';pass.focus();return;}
    go.disabled=true;
    var p=mode==='in'?sb.auth.signInWithPassword({email:em,password:pw})
                     :sb.auth.signUp({email:em,password:pw,options:{data:{name:nm}}});
    p.then(function(r){
      go.disabled=false;
      if(r.error){err.textContent=niceError(r.error);return;}
      if(mode==='up'){try{localStorage.setItem('bl-pending-bd',bday.value);}catch(e){}}
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

/* ---------- forgot / reset password ---------- */
function dirUrl(){return location.origin+location.pathname.replace(/[^\/]*$/,'');}
function showForgot(prefill){
  var b=box('Recover password');
  b.append(el('p',{class:'g-hint'},'Type your e-mail. We will send a link so you can create a new password.'));
  var email=el('input',{id:'g-femail',type:'email',autocomplete:'email',inputmode:'email',autocapitalize:'none',spellcheck:'false',enterkeyhint:'go'});
  if(prefill)email.value=prefill;
  var err=el('p',{class:'g-err','aria-live':'polite'});
  var go=el('button',{type:'submit',class:'g-btn'},'Send link');
  var form=el('form',{novalidate:true},el('label',{for:'g-femail'},'E-mail'),email,err,
    el('div',{class:'g-row'},go,btn('Back',function(){showLogin('in');},true)));
  form.addEventListener('submit',function(ev){
    ev.preventDefault();err.textContent='';
    var em=email.value.trim().toLowerCase();
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){err.textContent='Type a valid e-mail.';email.focus();return;}
    go.disabled=true;
    sb.auth.resetPasswordForEmail(em,{redirectTo:dirUrl()}).then(function(r){
      go.disabled=false;
      if(r.error&&/rate limit|too many|seconds/i.test(r.error.message||'')){err.textContent='Wait a few minutes before asking for another link.';return;}
      if(r.error&&isNet(r.error)){err.textContent=niceError(r.error);return;}
      message('Check your e-mail',['If this e-mail has an account, we sent a link to create a new password.','Not there? Look in the spam folder too. The link works for 1 hour.'],[btn('Back to sign in',function(){showLogin('in');})]);
    },function(e){go.disabled=false;err.textContent=niceError(e);});
  });
  b.append(form);email.focus({preventScroll:true});
}
function showNewPass(){
  var b=box('Create new password');
  b.append(el('p',{class:'g-hint'},'Choose a password with at least 6 characters.'));
  var p1=el('input',{id:'g-np1',type:'password',autocomplete:'new-password',enterkeyhint:'next'});
  var p2=el('input',{id:'g-np2',type:'password',autocomplete:'new-password',enterkeyhint:'go'});
  var err=el('p',{class:'g-err','aria-live':'polite'});
  var go=el('button',{type:'submit',class:'g-btn'},'Save and sign in');
  var form=el('form',{novalidate:true},el('label',{for:'g-np1'},'New password'),p1,el('label',{for:'g-np2'},'Repeat the new password'),p2,err,el('div',{class:'g-row'},go));
  form.addEventListener('submit',function(ev){
    ev.preventDefault();err.textContent='';
    if(p1.value.length<6){err.textContent='The password needs at least 6 characters.';p1.focus();return;}
    if(p1.value!==p2.value){err.textContent='The two passwords are different.';p2.focus();return;}
    go.disabled=true;
    sb.auth.updateUser({password:p1.value}).then(function(r){
      go.disabled=false;
      if(r.error){err.textContent=/same|different from the old/i.test(r.error.message||'')?'Choose a password different from the old one.':niceError(r.error);return;}
      route();
    },function(e){go.disabled=false;err.textContent=niceError(e);});
  });
  b.append(form);p1.focus({preventScroll:true});
}
function expiredLink(){message('Link expired',['This link is no longer valid. Ask for a new one.'],[btn('Ask for a new link',function(){showForgot('');}),btn('Back to sign in',function(){showLogin('in');},true)]);}
/* link from the e-mail: #access_token=...&type=recovery (or #error_code=otp_expired) */
function handleRecovery(){
  var h=location.hash||'';if(h.length<2||!/type=recovery|error_code=/.test(h))return false;
  var q={};h.slice(1).split('&').forEach(function(x){var i=x.indexOf('=');if(i>0)q[x.slice(0,i)]=decodeURIComponent(x.slice(i+1).replace(/\+/g,' '));});
  try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}
  if(q.error||q.error_code){expiredLink();return true;}
  if(q.type==='recovery'&&q.access_token&&q.refresh_token){
    sb.auth.setSession({access_token:q.access_token,refresh_token:q.refresh_token}).then(function(r){if(r.error)expiredLink();else showNewPass();},function(){expiredLink();});
    return true;
  }
  return false;
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
function setAvatar(id){if(prof)prof.avatar=id;try{if(user&&id!==localStorage.getItem('bl-pic-rand-'+user.id))localStorage.removeItem('bl-pic-rand-'+user.id);}catch(e){}paintAvatars();}
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
    el('p',{class:'g-hint',style:'font-size:.82rem'},'App version '+(window.BL_VERSION||'')),el('div',{class:'g-row',style:'justify-content:flex-end'},el('button',{type:'button',class:'g-btn ghost',onclick:close},'Close'),el('button',{type:'button',class:'g-btn ghost',onclick:function(){close();if(document.getElementById('today'))startTour(true);else location.href='index.html#tour';}},'See the tour'),wa));
  ov.append(d);ov.addEventListener('click',function(e){if(e.target===ov)close();});document.addEventListener('keydown',kd);document.body.append(ov);
}

function gLang(){var h=window.I18N&&window.I18N.hint;return h==='pt'?1:h==='es'?2:0;}
function gT(a){return a[gLang()];}
function gameIsOn(){try{return localStorage.getItem('bl-game')==='1';}catch(e){return false;}}
function gameConfirm(turnOn){
  var tt=turnOn?['Turn Game Mode on','Ativar o Modo Jogo','Activar el Modo Juego']:['Turn Game Mode off','Desativar o Modo Jogo','Desactivar el Modo Juego'];
  var no=['Cancel','Cancelar','Cancelar'],yes=['OK','OK','OK'];
  var ov=el('div',{class:'g-hov',role:'dialog','aria-modal':'true'});
  var close=function(){ov.remove();};
  var okb=el('button',{type:'button',class:'btn primary',onclick:function(){try{localStorage.setItem('bl-game',turnOn?'1':'0');}catch(e){}location.reload();}},gT(yes));
  var nob=el('button',{type:'button',class:'btn',onclick:close},gT(no));
  ov.append(el('div',{class:'g-hdlg','data-noi18n':'1'},el('h2',{style:'margin:0 0 16px'},gT(tt)),el('div',{style:'display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap'},nob,okb)));
  ov.addEventListener('click',function(e){if(e.target===ov)close();});
  document.body.append(ov);okb.focus();
}
function gameSwitch(){
  var on=gameIsOn();
  var sw=el('button',{type:'button',class:'g-sw'+(on?' on':''),role:'switch','aria-checked':String(on),'aria-label':'Game mode',onclick:function(){gameConfirm(!gameIsOn());}},el('u'));
  return sw;
}
function settingsBlock(){
  var w=el('div',{class:'g-bar gp'});
  var row=function(ic,lab,ctl){return el('div',{class:'g-mr'},el('b',{style:'width:20px;text-align:center;white-space:nowrap'},ic),el('span',{},lab),ctl);};
  var ds=el('button',{type:'button',class:'g-sw'+(shownTheme()==='dark'?' on':''),role:'switch','aria-checked':String(shownTheme()==='dark'),'aria-label':'Dark mode',onclick:function(){setTheme(shownTheme()==='dark'?'light':'dark');var d=shownTheme()==='dark';ds.classList.toggle('on',d);ds.setAttribute('aria-checked',String(d));}},el('u'));
  var mn=el('button',{type:'button','aria-label':'Smaller text',onclick:function(){setSize(fsIdx-1);}},'A\u2212'),pl=el('button',{type:'button','aria-label':'Larger text',onclick:function(){setSize(fsIdx+1);}},'A+');
  w.append(birthdayField(),row('\uD83C\uDF19','Dark mode',ds),row('Aa','Text size',el('span',{class:'g-sz',role:'group'},mn,pl)),row('\uD83C\uDFAE','Game mode',gameSwitch()));
  if(COURSE.push!==false){var pr=pushRow(function(){});if(pr&&pr.nodeType===1)w.append(pr);}
  if(window.I18N)w.append(el('div',{class:'g-mr'},el('b',{style:'width:20px;text-align:center'},'\uD83C\uDF10'),el('span',{},'Language'),I18N.selector('ui')));
  var hb=el('button',{type:'button',class:'g-mi'},el('b',{style:'width:20px;text-align:center'},'\u2753'),el('span',{},'Help'));hb.addEventListener('click',function(){showHelp();});w.append(hb);
  if(prof&&prof.is_admin)w.append(el('a',{class:'g-mi',href:'admin.html'},el('b',{style:'width:20px;text-align:center'},'\uD83D\uDEE0\uFE0F'),el('span',{},'Teacher panel')));
  var ob=el('button',{type:'button',class:'g-mi out'},el('b',{style:'width:20px;text-align:center'},'\u21AA'),el('span',{},'Sign out'));ob.addEventListener('click',signOut);w.append(ob);
  return w;
}
/* ---------- birthday: field in the Profile + celebration on the first visit of the day ---------- */
function isoToday(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function birthdayToday(){
  var b=prof&&prof.birthdate;if(!b||!/^\d{4}-\d\d-\d\d$/.test(b))return false;
  var d=new Date(),m=d.getMonth()+1,dd=d.getDate(),bm=+b.slice(5,7),bd=+b.slice(8,10);
  var leap=(d.getFullYear()%4===0&&d.getFullYear()%100!==0)||d.getFullYear()%400===0;
  if(bm===2&&bd===29&&!leap)return m===2&&dd===28;
  return bm===m&&bd===dd;
}
function birthdayField(){
  var L=gLang(),lab=['Birthday','Aniversário','Cumpleaños'][L],sv=['Save','Salvar','Guardar'][L],ok=['Saved ✓','Salvo ✓','Guardado ✓'][L];
  var inp=el('input',{type:'date',min:'1920-01-01',max:isoToday(),'aria-label':lab,value:(prof&&prof.birthdate)||'',style:'font:inherit;padding:8px;min-width:0;flex:1 1 130px;border-radius:8px;border:2px solid var(--line,#999);background:var(--card,#fff);color:var(--ink,#111);min-height:44px'});
  var msg=el('small',{style:'margin-left:8px'},'');
  var b=el('button',{type:'button',class:'btn',onclick:function(){
    if(!inp.value||!sb)return;
    sb.rpc('set_my_birthdate',{p_date:inp.value}).then(function(r){if(r.error){msg.textContent=niceError(r.error);return;}if(prof)prof.birthdate=inp.value;msg.textContent=ok;},function(){});
  }},sv);
  return el('div',{class:'g-mr',style:'flex-wrap:wrap;cursor:default'},el('b',{style:'width:20px;text-align:center'},'\uD83C\uDF82'),el('span',{style:'white-space:nowrap'},lab),el('div',{style:'flex:1 0 100%;display:flex;gap:8px;align-items:center;flex-wrap:wrap'},inp,b,msg));
}
function birthdayParty(){
  if(!birthdayToday()||!/(^|\/)(index\.html)?$/.test(location.pathname)||document.getElementById('bl-bd'))return;
  var key='bl-bday-'+(user&&user.id);try{if(localStorage.getItem(key)===isoToday())return;}catch(e){}
  var first=((prof.name||'').split(' ')[0])||'';
  var st=document.createElement('style');st.textContent='#bl-bd{position:fixed;inset:0;z-index:99999;background:radial-gradient(circle at 50% 30%,#1b2f66,#070d22);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px;overflow:hidden;font-family:inherit}'+
  '#bl-bd .bd-b{position:absolute;bottom:-90px;width:46px;height:58px;border-radius:50% 50% 48% 48%;animation:bd-up linear infinite;opacity:.95}#bl-bd .bd-b:after{content:"";position:absolute;left:50%;top:100%;width:1px;height:40px;background:#fff8}'+
  '@keyframes bd-up{to{transform:translateY(-130vh) rotate(8deg)}}'+
  '#bl-bd>:not(.bd-b){position:relative;z-index:2}#bl-bd .bd-l{position:relative;width:150px;height:150px;animation:bd-bob 1.2s ease-in-out infinite}#bl-bd .bd-l img{width:150px;height:150px;object-fit:contain}'+
  '#bl-bd .bd-h{position:absolute;left:80px;top:-24px;width:46px;height:54px;transform:rotate(16deg)}#bl-bd .bd-h svg{width:46px;height:54px}'+
  '@keyframes bd-bob{50%{transform:translateY(-10px)}}#bl-bd h1{font-size:2rem;margin:14px 0 4px}#bl-bd p{margin:4px 0 18px;font-size:1.1rem}#bl-bd .btn{font-size:1.1rem}#bl-bd .bd-gift{font-size:6rem;animation:bd-bob 1s ease-in-out infinite;background:none;border:0;cursor:pointer;color:inherit}';
  document.head.append(st);
  var ov=el('div',{id:'bl-bd',role:'dialog','aria-modal':'true','data-noi18n':'1'});
  var close=function(){try{localStorage.setItem(key,isoToday());}catch(e){}ov.remove();st.remove();};
  var gift=el('button',{type:'button',class:'bd-gift','aria-label':'Presente'},'🎁');
  ov.append(gift,el('p',{},'Toque para abrir seu presente'));
  gift.addEventListener('click',function(){
    ov.textContent='';
    var cols=['#ff5d73','#ffd54a','#46c37b','#4aa8ff','#b36bff','#ff9a3c'],i;
    for(i=0;i<22;i++){var b=el('i',{class:'bd-b',style:'left:'+(Math.random()*92)+'%;background:'+cols[i%6]+';animation-duration:'+(5+Math.random()*5)+'s;animation-delay:-'+(Math.random()*8)+'s'});ov.append(b);}
    var lion=el('div',{class:'bd-l'},el('img',{src:(window.BL_BASE||'')+'img/lion-gold.png',alt:''}),(function(){var s=el('span',{class:'bd-h'});s.innerHTML='<svg viewBox="0 0 44 52"><path d="M22 4 L40 48 L4 48Z" fill="#ff5d73"/><path d="M4 48 L40 48" stroke="#ffd54a" stroke-width="6"/><circle cx="22" cy="5" r="5" fill="#ffd54a"/></svg>';return s;})());
    var done=el('button',{type:'button',class:'btn primary',onclick:close},'Continuar');
    ov.append(lion,el('h1',{},'Parabéns'+(first?', '+first:'')+'! 🎂'),el('p',{},'Feliz aniversário!'),done);
    try{localStorage.setItem(key,isoToday());}catch(e){}
    try{var a=new Audio((window.BL_BASE||'')+'js/sfx/roar.mp3');a.volume=.7;a.play().catch(function(){});}catch(e){}
    birthdayTune();done.focus();
  });
  document.body.append(ov);
}
/* ---------- on the home page after login: ask for the birth date once, and the picture after a few visits ---------- */
function askBirthdate(done){
  var L=gLang(),T={t:['When is your birthday?','Qual é a sua data de nascimento?','¿Cuál es tu fecha de nacimiento?'],m:['So we can celebrate with you!','Para comemorarmos com você!','¡Para celebrar contigo!'],s:['Save','Salvar','Guardar'],x:['Close','Fechar','Cerrar']};
  var ov=el('div',{class:'g-hov',role:'dialog','aria-modal':'true','data-noi18n':'1'});
  var inp=el('input',{type:'date',min:'1920-01-01',max:isoToday(),'aria-label':T.t[L],style:'font:inherit;padding:10px;border-radius:8px;border:2px solid var(--line,#999);background:var(--card,#fff);color:var(--ink,#111);min-height:44px;width:100%;box-sizing:border-box'});
  var err=el('p',{class:'g-err','aria-live':'polite',style:'margin:8px 0 0'});
  var cl=el('button',{type:'button',class:'btn',style:'display:none',onclick:function(){ov.remove();done();}},T.x[L]);
  var sv=el('button',{type:'button',class:'btn primary',onclick:function(){
    if(!inp.value){inp.focus();return;}sv.disabled=true;
    sb.rpc('set_my_birthdate',{p_date:inp.value}).then(function(r){
      if(r.error){sv.disabled=false;err.textContent=niceError(r.error);cl.style.display='';return;}
      prof.birthdate=inp.value;ov.remove();done();
    },function(){sv.disabled=false;cl.style.display='';});
  }},T.s[L]);
  ov.append(el('div',{class:'g-hdlg'},el('h2',{style:'margin:0 0 6px'},T.t[L]),el('p',{style:'margin:0 0 12px'},T.m[L]),inp,err,el('div',{style:'display:flex;gap:10px;justify-content:flex-end;margin-top:14px;flex-wrap:wrap'},cl,sv)));
  document.body.append(ov);inp.focus();
}
function randomAvatar(cb){
  loadProfile(function(){
    var A=(window.BL_AVATARS_ALL||window.BL_AVATARS||[]).filter(function(a){return a.cat!=='flags';});
    if(!A.length)return;var id=A[Math.floor(Math.random()*A.length)].id;
    window.Profile.savePrefs(sb,{avatar:id}).then(function(){try{localStorage.setItem('bl-pic-rand-'+user.id,id);}catch(e){}setAvatar(id);if(cb)cb();},function(){});
  });
}
function profilePrompts(){
  if(!prof||!user||OFF||!/(^|\/)(index\.html)?$/.test(location.pathname))return;
  var fresh=!prof.avatar;
  if(fresh)randomAvatar();   /* first login: the student gets a random picture */
  var pend=null;try{pend=localStorage.getItem('bl-pending-bd');}catch(e){}
  if(!prof.birthdate&&pend&&/^\d{4}-\d\d-\d\d$/.test(pend)){
    try{sb.rpc('set_my_birthdate',{p_date:pend}).then(function(r){if(!r.error){prof.birthdate=pend;try{localStorage.removeItem('bl-pending-bd');}catch(e){}}},function(){});}catch(e){}
    return;
  }
  if(!prof.birthdate){askBirthdate(function(){});return;}
  if(fresh||birthdayToday())return;
  /* still on the random picture after a few visits: open the picture chooser (3rd visit, then once more after 7 visits, then never) */
  var rv=null;try{rv=localStorage.getItem('bl-pic-rand-'+user.id);}catch(e){}
  if(!rv||prof.avatar!==rv)return;
  var k='bl-pic-'+user.id,s={n:0,last:'',asked:0,at:0};
  try{s=Object.assign(s,JSON.parse(localStorage.getItem(k)||'{}'));}catch(e){}
  var today=isoToday();if(s.last===today)return;
  s.last=today;s.n++;
  var ask=(s.asked===0&&s.n>=3)||(s.asked===1&&s.n-s.at>=7);
  if(ask){s.asked++;s.at=s.n;}
  try{localStorage.setItem(k,JSON.stringify(s));}catch(e){}
  if(!ask)return;
  setTimeout(function(){loadProfile(function(){window.Profile.openPicker({sb:sb,uid:prof.id||user.id,current:prof.avatar,lang:COURSE.uiLang||'en',onSaved:function(id){setAvatar(id);}});});},1200);
}
function birthdayTune(){
  try{
    var AC=window.AudioContext||window.webkitAudioContext,ctx=new AC(),F={G4:392,A4:440,B4:493.88,C5:523.25,D5:587.33,E5:659.25,F5:698.46,G5:783.99};
    var S=[['G4',.75],['G4',.25],['A4',1],['G4',1],['C5',1],['B4',2],['G4',.75],['G4',.25],['A4',1],['G4',1],['D5',1],['C5',2],['G4',.75],['G4',.25],['G5',1],['E5',1],['C5',1],['B4',1],['A4',2],['F5',.75],['F5',.25],['E5',1],['C5',1],['D5',1],['C5',3]];
    var t=ctx.currentTime+.6,beat=.42;
    S.forEach(function(n){var o=ctx.createOscillator(),g=ctx.createGain();o.type='triangle';o.frequency.value=F[n[0]];g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.25,t+.03);g.gain.exponentialRampToValueAtTime(.001,t+n[1]*beat*.95);o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+n[1]*beat);t+=n[1]*beat;});
  }catch(e){}
}
function gameNav(){
  var L=gLang(),onProf=false;
  var a=function(href,ico,lab,act){return el('a',{href:href,class:'gn-i'+(act?' on':''),'data-noi18n':'1'},el('span',{class:'gn-e'},ico),el('span',{},lab));};
  var nav=el('nav',{class:'g-nav','aria-label':'Game'},a('index.html','🗺️',['Map','Mapa','Mapa'][L],!onProf));
  if(COURSE.profile!==false)nav.append(a('account.html','👤',['Profile','Perfil','Perfil'][L],onProf));
  document.body.append(nav);document.body.classList.add('g-gamebody');
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
  var gameSw=gameSwitch();
  var lab=el('span',{style:'display:none','aria-live':'polite'});
  sizeUi={minus:minus,plus:plus,lab:lab};updateSizeUi();
  mn.append(head,
    COURSE.profile===false?document.createComment(''):mi('user','My Profile',{href:'account.html'}),
    COURSE.profile===false?document.createComment(''):mi('edit','Change picture',{href:'account.html#picture'}),
    el('div',{class:'g-mr'},ico('moon'),el('span',{},'Dark mode'),themeSw),
    el('div',{class:'g-mr'},el('b',{style:'width:20px;text-align:center'},'\uD83C\uDFAE'),el('span',{},'Game mode'),gameSw),
    COURSE.push===false?document.createComment(''):pushRow(open),
    el('div',{class:'g-mr'},el('b',{style:'width:20px;text-align:center'},'Aa'),el('span',{},'Text size'),el('span',{class:'g-sz',role:'group','aria-label':'Text size'},minus,plus,lab)));
  if(window.I18N)mn.append(el('div',{class:'g-mr'},el('b',{style:'width:20px;text-align:center'},'\uD83C\uDF10'),el('span',{},'Language'),window.I18N.selector('ui')));
  if(prof.is_admin)mn.append(mi('panel','Teacher panel',{href:'admin.html'}));
  mn.append(mi('help','Help',{onclick:function(){open(false);showHelp();}}),mi('out','Sign out',{class:'g-mi out',onclick:signOut}));
  mn.querySelectorAll('a.g-mi').forEach(function(a){a.addEventListener('click',function(){open(false);});});
  document.addEventListener('click',function(e){if(!mn.contains(e.target)&&e.target!==av)open(false);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')open(false);});
  kids.push(el('span',{class:'g-um'},av,mn));
  bar=el('div',{class:'g-bar'},kids);
  bar.appendChild(el('span',{class:'g-logoc','aria-label':'Britland Academy'},el('img',{src:(window.BL_BASE||'')+'img/britland-shield.png',alt:''}),el('span',{},el('b',{},'BRITLAND'),el('i',{},'ACADEMY'))));
  document.body.insertBefore(bar,document.body.firstChild);
  if(gameIsOn()){bar.style.display='none';if(!/(^|\/)(index\.html)?$/.test(location.pathname))gameNav();}
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
var GATES=null;
function gateCap(){return (GATES&&GATES.cap)||99999;}
function loadGates(){if(BUS||prof.is_admin||OPTS.admin||OFF)return Promise.resolve();return sb.rpc('my_stage_gates').then(function(r){if(r&&!r.error&&r.data&&r.data.cap)GATES=r.data;},function(){});}
function upto(){if(BUS)return prof.is_admin?17:(prof.status==='approved'?(prof.business_upto||0):0);return prof.is_admin?MAXL:(prof.status==='approved'?Math.min(prof.lessons_upto||0,gateCap()):0);}
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
    ['index.html','lessons.html','check.html'].concat(own,['js/gate.js','js/config.js','js/i18n.js','js/theme.css','js/wm.css','js/fonts.css','js/brand.css','js/ui.css','js/protect.js','js/covers.js','js/profile.js','js/push.js','js/streak.js','js/avatars.js','js/facts.js','js/facts_i18n.js','js/pwa.js']).forEach(function(u){try{fetch(b+u,{credentials:'same-origin'}).catch(function(){});}catch(e){}});
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
function mainUpto(){return prof.is_admin?MAXL:(prof.status==='approved'?Math.min(prof.lessons_upto||0,gateCap()):0);}
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
    if(prof.lang&&/^(en|pt|es)$/.test(prof.lang)&&window.I18N&&I18N.mode!=='free'&&I18N.setUi&&!I18N.hasPref&&prof.lang!==I18N.lang)I18N.setUi(prof.lang);
  }catch(e){}
}
if(!window.__uilangBound){window.__uilangBound=true;window.addEventListener('uilang',function(e){try{if(sb&&user)sb.rpc('set_my_prefs',{p_avatar:null,p_theme:null,p_lang:e.detail}).then(function(){},function(){});}catch(x){}});}
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
/* ---------- guided tour: spotlight on the real home page, shown once to every student; "See the tour" in Help runs it again ---------- */
/* the tour is always shown in Portuguese */
function tourPt(root){
  if(!root||!window.I18N||!I18N.pt)return;
  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),n,l=[];while(n=w.nextNode())l.push(n);
  l.forEach(function(x){var s=x.nodeValue,c=s.trim();if(!c)return;var r=I18N.pt(c);if(r!==c)x.nodeValue=s.replace(c,r);});
}
function tourSeenKey(){return 'bl-tour1-'+user.id;}
function tourMaybe(){
  var force=location.hash==='#tour';
  if(!force){try{if(localStorage.getItem(tourSeenKey()))return;}catch(e){return;}}
  var n=0;(function wait(){
    var t=document.getElementById('today');
    if(document.querySelector('.sk-ov,.g-hov')&&n<200){n++;setTimeout(wait,500);return;}
    if(t&&(!t.hidden||n>12)||n>16){if(force)try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}startTour(force);return;}
    n++;setTimeout(wait,350);})();
}
function startTour(force){
  if(!document.getElementById('today')||document.getElementById('bl-tour'))return;
  var SP=!!window.BL_COURSE,base=(window.BL_BASE||'');
  function seen(){try{localStorage.setItem(tourSeenKey(),'1');}catch(e){}}
  function $(s){return document.querySelector(s);}
  function vis(e){return e&&e.getClientRects().length>0;}
  var S=[];
  S.push({h:'Let’s get to know the app in 1 minute',p:['I will show where each feature is and what it does. Tap Next to start.']});
  S.push({h:'Your study streak',p:['Studied today? The Lion lights up and your streak goes up. The more days in a row, the better.','Try it: tap the button below.'],sel:['#streak'],lion:1});
  S.push({h:'7 days in a row: the golden Lion',p:['After a full week the Lion turns gold, glows and roars to celebrate. Then come more weeks, the month and the year.','You have 1 freeze per week, so a missed day does not break your streak.'],sel:['#streak'],lion:7});
  S.push({h:'Class ranking',p:['See who is studying every day. Tap “Class ranking” to open the list. Your name appears highlighted.'],sel:['#streak .sk-r','#streak']});
  S.push({h:'What to do today',p:['This is your path for the day. The bar shows your progress and the Continue button goes straight to what is most behind.'].concat(SP?[]:['If you only do one kind of activity, the app warns you.']),sel:['#today']});
  S.push({h:'Lessons',p:['Read each lesson and listen to the audio. It also works offline after you open a lesson once.'],sel:['a.card[href="lessons.html"]']});
  if(SP){
    S.push({h:'Review exercises',p:['Do the review exercises from the book. When you get one wrong, the app explains why.'],sel:['a.card[href="check.html"]']});
    S.push({h:'DELE',p:['Prepare for the DELE exam, levels A1 to C2.'],sel:['a.card[href="dele.html"]']});
  }else{
    S.push({h:'The three activities',p:['Always do all three: Lesson Checks (the questions from the book), Grammar Exercises and Workbook (pictures, matching, reading and dictation). When you get one wrong, the app explains why.'],sel:['a.card[href="exercises.html"]','a.card[href="workbook.html"]','a.card[href="check.html"]']});
    S.push({h:'Stage Exam',p:['When your teacher opens it, the exam appears here. It is only visible while it is open.'],sel:['#examCard']});
  }
  S.push({h:'My Profile',p:['Your grades, exam history and payments are here. This is also where you turn on reminder notifications.'],sel:['a.card[href="account.html"]']});
  S.push({h:'The menu on your picture',p:['Tap your picture to change it, use dark mode, change the language, make the text larger, get help or sign out. To see this tour again, open Help.'],sel:['.g-avbtn']});
  S.push({h:'Game Mode',p:['Prefer to play? Game Mode turns your lessons into a metro line: every station is a lesson, and every 4 lessons you reach a Review at a famous landmark.','Questions come one at a time, with three lion lives, sounds and stars. Try one now.'],demo:1});
  S.push({h:'All set!',p:['Turn on notifications to get class reminders.'],last:1});
  S=S.filter(function(s){return !s.sel||document.querySelector(s.sel[s.sel.length-1])||s.sel.some(function(q){return document.querySelector(q);});});
  var i=0,ov=el('div',{id:'bl-tour',class:'tr','data-noi18n':'1'}),blk=el('div',{class:'tr-b'}),spot=el('div',{class:'tr-s'}),sheet=el('div',{class:'tr-sh',role:'dialog','aria-modal':'true','aria-label':'Tour','aria-live':'polite'}),conf=el('div',{class:'tr-c'});
  ov.append(blk,spot,conf,sheet);
  if(!document.getElementById('bl-tour-css')){var st=el('style',{id:'bl-tour-css'});st.textContent=
   '.tr{position:fixed;inset:0;z-index:9990;font-family:inherit}.tr-b{position:absolute;inset:0}'+
   '.tr-s{position:absolute;left:50%;top:50%;width:0;height:0;border-radius:8px;box-shadow:0 0 0 2px #F5C542,0 0 0 9999px rgba(3,8,16,.82);pointer-events:none;transition:left .3s,top .3s,width .3s,height .3s}.tr-s.off{box-shadow:0 0 0 9999px rgba(3,8,16,.82)}'+
   '.tr-sh{position:absolute;left:0;right:0;bottom:0;max-height:62vh;overflow:auto;background:#fff;color:#0B1B33;padding:16px max(18px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(18px,env(safe-area-inset-left));border-top:4px solid #F5C542;border-radius:14px 14px 0 0;box-sizing:border-box;max-width:560px;margin:0 auto}'+
   '.tr-sh h2{margin:0 0 6px;font-size:1.15rem;line-height:1.25}.tr-sh p{margin:0 0 8px;color:#475671;font-size:.95rem}'+
   '.tr-d{display:flex;gap:5px;margin:0 0 10px}.tr-d i{height:4px;flex:1;border-radius:2px;background:#D3DAE6}.tr-d i.on{background:#0B1B33}'+
   '.tr-f{display:flex;gap:8px;align-items:center;margin-top:10px;flex-wrap:wrap}.tr-f .sp{margin-left:auto}'+
   '.tr .tb{min-height:44px;padding:8px 16px;font:inherit;font-weight:700;cursor:pointer;border-radius:3px;border:2px solid #0B1B33;background:#0B1B33;color:#fff}.tr .tb.gh{background:transparent;color:#0B1B33;border-color:transparent}.tr .tb.dm{background:#F5C542;border-color:#F5C542;color:#0B1B33}.tr .tb.out{background:transparent;color:#0B1B33}'+
   '.tr .tb:focus-visible{outline:3px solid #1F4FA0;outline-offset:2px}.tr .tb[disabled]{opacity:.7;cursor:default}'+
   '.tr-m{font-weight:700;color:#14733a;min-height:1.3em}.tr-l{display:flex;gap:12px;align-items:center;margin:6px 0}.tr-lw{position:relative;width:54px;height:64px;flex:none}.tr-lw img{position:relative;width:100%;height:100%;object-fit:contain}.tr-lw i{position:absolute;inset:-14%;border-radius:50%;background:radial-gradient(circle,rgba(255,215,110,.7),transparent 68%);opacity:0}.tr-lw.g i{opacity:1;animation:trp 2s ease-in-out infinite}.tr-lw.pop img{animation:trpop .7s}'+
   '@keyframes trp{50%{transform:scale(1.15);opacity:.7}}@keyframes trpop{30%{transform:scale(1.25) rotate(-4deg)}}'+
   '.tr-c{position:absolute;inset:0;pointer-events:none;overflow:hidden}.tr-c i{position:absolute;top:-10px;width:7px;height:12px;animation:trf 2.2s linear forwards}@keyframes trf{to{transform:translateY(110vh) rotate(540deg)}}'+
   '@media (prefers-reduced-motion:reduce){.tr-s{transition:none}.tr-c i,.tr-lw.g i{animation:none}}';document.head.append(st);}
  function fx(n){if(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches)return;var cs=['#F5C542','#fff','#d33','#3b5bdb'];for(var k=0;k<46;k++){var c=el('i',{style:'left:'+Math.random()*100+'%;background:'+cs[k%4]+';animation-delay:'+(Math.random()*.6)+'s'});conf.append(c);}setTimeout(function(){conf.textContent='';},3200);}
  function snd(n){try{if(localStorage.getItem('callan-mute')==='1')return;}catch(e){}try{var a=new Audio('js/sfx/'+n+'.mp3');a.volume=n==='crepitar'?.3:.4;var p=a.play();if(p&&p.catch)p.catch(function(){});}catch(e){}}
  function targets(s){return (s.sel||[]).map(function(q){return $(q);}).filter(vis);}
  function place(s){
    var t=s.menu?[$('.g-avbtn'),$('.g-mn')].filter(vis):targets(s);
    if(!t.length){spot.className='tr-s off';spot.style.cssText='left:50%;top:50%;width:0;height:0';return;}
    spot.className='tr-s';
    var r=t[0].getBoundingClientRect(),L=r.left,T=r.top,R=r.right,B=r.bottom;
    t.forEach(function(e){var q=e.getBoundingClientRect();L=Math.min(L,q.left);T=Math.min(T,q.top);R=Math.max(R,q.right);B=Math.max(B,q.bottom);});
    spot.style.cssText='left:'+(L-5)+'px;top:'+(T-5)+'px;width:'+(R-L+10)+'px;height:'+(B-T+10)+'px';
  }
  function show(){
    var s=S[i],mn=$('.g-mn');
    sheet.textContent='';
    var dots=el('div',{class:'tr-d'});S.forEach(function(x,k){dots.append(el('i',{class:k<=i?'on':''}));});
    sheet.append(dots,el('h2',{},s.h));
    s.p.forEach(function(t){sheet.append(el('p',{},t));});
    function TB(l,c,fn){return el('button',{type:'button',class:'tb '+c,onclick:fn},l);}
    var msg=el('div',{class:'tr-m',role:'status'},'');
    if(s.lion){
      var lw=el('div',{class:'tr-lw'},el('i'),el('img',{alt:'',src:'img/lion-off.png'})),im=lw.querySelector('img');
      function setL(n){im.src='img/lion-'+(n>=7?'gold':n>0?'on':'off')+'.png';lw.className='tr-lw'+(n>=7?' g':'');void lw.offsetWidth;lw.classList.add('pop');}
      var b=TB(s.lion===1?'Study today':'Reach 7 days','dm',function(){
        if(s.lion===1){setL(1);snd('crepitar');msg.textContent='The Lion lit up! 1 day in a row.';}
        else{setL(7);snd('leao_7dias');fx();msg.textContent='Week complete! 7 days in a row.';}
        tourPt(document.getElementById('bl-tour'));});
      sheet.append(el('div',{class:'tr-l'},lw,b),msg);
    }
    if(s.demo){
      var dm=el('div',{style:'margin:8px 0;padding:10px 12px;border:2px solid #F5C542;border-radius:10px;background:#FFF9E6'}),lv=el('div',{style:'display:flex;gap:6px;margin-bottom:8px','aria-label':'Lives: 3'}),lis=[];
      for(var q=0;q<3;q++){var li=el('img',{src:'img/lion-gold.png',alt:'',width:'26',height:'30'});lis.push(li);lv.append(li);}
      var dq=el('p',{style:'font-weight:700;margin:0 0 8px;color:#0B1B33'},'She ___ a teacher.'),dr=el('div',{class:'tr-f',style:'margin:0'}),dfb=el('p',{role:'status',class:'tr-m',style:'margin:6px 0 0'},''),lost=0,fin=false;
      ['am','is','are'].forEach(function(w){dr.append(TB(w,'dm',function(){
        if(fin)return;
        if(w==='is'){fin=true;dfb.textContent='\u2713 Correct! Right answers build combos and win stars.';snd('crepitar');dr.remove();}
        else{if(lost<2){lis[lost].src='img/lion-off.png';lost++;}dfb.textContent='\u2717 Not quite. You lose a lion life. Try again.';}
        tourPt(document.getElementById('bl-tour'));}));});
      dm.append(lv,dq,dr,dfb);sheet.append(dm);
      var ga=el('div',{class:'tr-f'});
      ga.append(TB('Activate Game Mode','dm',function(){try{localStorage.setItem('bl-game','1');}catch(e){}seen();location.reload();}),el('span',{style:'font-size:.85rem;color:#475671'},'You can switch it any time in the menu on your picture.'));
      sheet.append(ga);
    }
    if(s.last){
      var box=el('div',{});sheet.append(box);tourPush(box,TB);
      sb.from('attempts').select('id',{count:'exact',head:true}).eq('user_id',user.id).then(function(r){
        if(r.error||(r.count||0)>0)return;
        box.append(el('h2',{style:'margin-top:12px'},'Try your first question'),el('p',{},SP?'Choose the correct word: Yo ___ estudiante.':'Choose the correct word: I ___ a student.'));
        var row=el('div',{class:'tr-f'}),fb=el('p',{role:'status',class:'tr-m'},'');
        (SP?['soy','eres','es']:['am','is','are']).forEach(function(w,k){row.append(TB(w,'dm',function(){
          if(k===0){fb.textContent='Correct! Every Lesson Check works like this.';row.remove();}
          else fb.textContent='Not yet. Try again.';
          tourPt(document.getElementById('bl-tour'));}));});
        box.append(row,fb);tourPt(document.getElementById('bl-tour'));});
    }
    var f=el('div',{class:'tr-f'});
    if(s.last){f.append(TB('Back','gh',function(){i--;show();}),TB('Done','sp dm',function(){close(true);}));}
    else{if(i>0)f.append(TB('Back','gh',function(){i--;show();}));if(i===0)f.append(TB('Skip','gh',function(){close(false);}));f.append(TB('Next','sp',function(){i++;show();}));}
    f.querySelectorAll('.sp').forEach(function(x){x.style.marginLeft='auto';});
    sheet.append(f);
    var t=s.menu?[$('.g-avbtn')].filter(vis):targets(s);
    if(t.length){var tp=t[0].getBoundingClientRect().top+window.pageYOffset;window.scrollTo(0,Math.max(0,tp-14));}
    else if(s.menu||i===0)window.scrollTo(0,0);
    tourPt(document.getElementById('bl-tour'));
    setTimeout(function(){place(s);},60);setTimeout(function(){if(S[i]===s)place(s);},450);
    var fb0=sheet.querySelector('.tb');if(fb0)fb0.focus({preventScroll:true});
  }
  function close(done){seen();var mn=$('.g-mn');if(mn)mn.classList.remove('on');document.removeEventListener('keydown',kd);window.removeEventListener('resize',rs);ov.remove();}
  function kd(e){if(e.key==='Escape')close(false);}
  function rs(){place(S[i]);}
  document.addEventListener('keydown',kd);window.addEventListener('resize',rs);
  document.body.append(ov);show();
}
function tourPush(box,TB){
  function Pp(s){return window.I18N&&I18N.pt?I18N.pt(s):s;}
  function ready(cb){if(window.BLPush)return cb();var sc=document.createElement('script');sc.src=(window.BL_BASE||'')+'js/push.js';sc.onload=cb;document.head.append(sc);}
  var note=el('p',{},'');
  var b=TB('Turn on notifications','dm',function(){
    b.disabled=true;
    ready(function(){var P=window.BLPush;
      if(!P||!P.supported()){note.textContent=Pp('This device cannot receive notifications here. Install the app first.');b.disabled=false;return;}
      if(P.ios()&&!P.standalone()){note.textContent=Pp('On iPhone: tap Share, then “Add to Home Screen”, open the app from there and turn on notifications.');b.disabled=false;return;}
      P.enable(sb).then(function(){b.textContent=Pp('Notifications on ✓');},function(){note.textContent=Pp('Notifications are off. You can turn them on later in My Profile.');b.disabled=false;});
      tourPt(document.getElementById('bl-tour'));
    });
  });
  box.append(el('div',{class:'tr-f'},b),note);
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
    return loadGates().then(function(){return loadContent(OPTS.kinds);}).then(function(){
      return OPTS.attempts?(Array.isArray(OPTS.attempts)?Promise.all(OPTS.attempts.map(fetchAttempts)).then(function(x){return [].concat.apply([],x);}):fetchAttempts(OPTS.attempts)):[];
    }).then(function(att){
      function fin(){
        hideOverlay();applyServerPrefs();if(OFF)offBanner(true);else flushQ();if(!OPTS.bare){addBar();loadProfile(paintAvatars);try{thanksPay();}catch(e){}try{birthdayParty();}catch(e){}try{profilePrompts();}catch(e){}}
        /* the streak counts finished activities only (see saveAttempt) */
        CB({user:user,profile:prof,attempts:att,upto:upto()});
        setTimeout(function(){a11yPass();if(!(OPTS.admin||OPTS.bare||OFF||prof.is_admin)&&document.getElementById('today'))tourMaybe();pushNudge();},600);
      }
      fin();
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
    if(!handleRecovery())route();
  });
}

function skel(box,n,h){if(!box)return;box.setAttribute('aria-busy','true');for(var i=0;i<(n||3);i++){var d=document.createElement('span');d.className='bl-sk';d.style.height=(h||52)+'px';d.style.marginBottom='10px';box.append(d);}}
function unskel(box){if(!box)return;box.removeAttribute('aria-busy');Array.prototype.slice.call(box.querySelectorAll(':scope>.bl-sk')).forEach(function(n){n.remove();});}
window.Gate={gates:function(){return GATES;},rawUpto:function(){return prof.lessons_upto||0;},birthdayField:birthdayField,birthdayToday:birthdayToday,settingsBlock:settingsBlock,gameSwitch:gameSwitch,gameConfirm:gameConfirm,gameOn:gameIsOn,pushRow:pushRow,help:function(){showHelp();},skel:skel,unskel:unskel,profile:function(){return prof;},start:start,signOut:signOut,setSize:setSize,setTheme:function(t){setTheme(t);},theme:function(){return theme;},shownTheme:shownTheme,setAvatar:setAvatar,loadProfile:loadProfile,sizeIdx:function(){return fsIdx;},sizeMax:function(){return SIZES.length-1;},saveAttempt:saveAttempt,audioUrl:audioUrl,el:el,
  get profile(){return prof;},bizUpto:function(){return bizUpto();},mainUpto:function(){return mainUpto();},get user(){return user;},sb:null};
})();
