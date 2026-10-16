/* Callan site: sign-in gate (Supabase). Each page calls Gate.start(options, callback).
   The callback runs only after the student is signed in and approved, and after the content
   that the teacher released to this student has been loaded from the server. */
(function(){
'use strict';
var CFG=window.CALLAN_CFG||{};
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
var TKEY='callan-theme',theme='dark',themeBtn=null;
try{var tv=localStorage.getItem(TKEY);if(tv==='light'||tv==='dark')theme=tv;}catch(e){}
function applyTheme(){document.documentElement.setAttribute('data-theme',theme);}
function setTheme(t){theme=t;applyTheme();try{localStorage.setItem(TKEY,t);}catch(e){}if(themeBtn){themeBtn.textContent=theme==='dark'?'\u2600 Light mode':'\u263E Dark mode';themeBtn.setAttribute('aria-label',theme==='dark'?'Switch to light mode':'Switch to dark mode');}}
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
'.g-ov{--bg:#250B0D;--card:#361215;--surface:#46161a;--ink:#FAF2F3;--muted:#C9AAAD;--mut:#C9AAAD;--line:#612C31;--chip:#541C21;--accent:#F5C542;--accent-ink:#310D10;--acc:#F5C542;--hl:#F5C542;--hli:#310D10;--link:#F0828B;--band1:#67161C;--band2:#310C0F}'+'html[data-theme="light"] .g-ov{--bg:#FAF4F5;--card:#FFFFFF;--surface:#FFFFFF;--ink:#310D10;--muted:#6f494c;--mut:#6f494c;--line:#E5D4D5;--chip:#F4E7E8;--accent:#F5C542;--accent-ink:#310D10;--acc:#F5C542;--hl:#F5C542;--hli:#310D10;--link:#94242D;--band1:#67161C;--band2:#310C0F}'+
'.g-ov *{box-sizing:border-box}'+
'.g-logo{display:block;width:min(100%,300px);height:auto;margin:0 auto 14px}.g-logo.l{display:none}html[data-theme="light"] .g-logo.d{display:none}html[data-theme="light"] .g-logo.l{display:block}'+
'.g-box{max-width:460px;margin:6vh auto 0;background:var(--card,#ececec);border:1px solid var(--line,#b8b8b8);border-radius:3px;padding:22px 20px}'+
'.g-box h1{font-size:1.5rem;line-height:1.2;margin:0 0 6px}'+
'.g-box p{margin:8px 0}'+
'.g-hint{color:var(--muted,#4d4d4d);font-size:.92rem}'+
'.g-box label{display:block;font-weight:700;margin:14px 0 4px}'+
'.g-box input{width:100%;min-height:46px;padding:8px 10px;font:inherit;font-size:16px;color:var(--ink,#111);background:var(--surface,var(--bg,#fff));border:2px solid var(--line,#b8b8b8);border-radius:3px}'+
'.g-box input:focus-visible,.g-btn:focus-visible,.g-tab:focus-visible{outline:3px solid var(--accent,#111);outline-offset:2px}'+
'.g-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}'+
'.g-btn{min-height:46px;padding:10px 20px;font:inherit;font-weight:700;cursor:pointer;border-radius:3px;border:2px solid var(--accent,#111);background:var(--accent,#111);color:var(--accent-ink,#fff)}'+
'html[data-theme="light"] .g-btn.g-cta,html[data-theme="light"] a.g-btn.g-cta:not(.ghost){border:2px solid #4d1217!important}'+
'.g-btn.g-cta,a.g-btn.g-cta:not(.ghost){background:#fff;border-color:#fff;color:#4d1217;font-weight:700;flex:1 1 100%;font-size:1.05rem;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;text-align:center;box-shadow:0 2px 0 rgba(0,0,0,.25)}.g-btn.g-cta:hover{filter:brightness(1.08)}'+
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

function injectCss(){var s=document.createElement('style');s.textContent=CSS;document.head.append(s);}

function showOverlay(){
  if(!overlay){if(window.I18N&&I18N.def)I18N.def('es');overlay=el('div',{class:'g-ov',role:'dialog','aria-modal':'true','aria-label':'Sign in'});document.body.append(overlay);}
  overlay.textContent='';return overlay;
}
function hideOverlay(){if(overlay){overlay.remove();overlay=null;if(window.I18N){if(I18N.after)I18N.after();else if(I18N.def)I18N.def('en');}}}
function langRow(){return window.I18N?el('div',{class:'g-langrow'},window.I18N.selector(false)):null;}
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
  return 'Something went wrong. Try again.'+(m?' ('+String(m).slice(0,140)+')':'')+(e&&e.stack?' ['+String(e.stack).split('\n').slice(1,3).join(' | ').replace(/https?:\/\/[^\/]+\/app\/espanol\//g,'').slice(0,200)+']':'');
}

/* ---------- login / request access ---------- */
function showLogin(mode){
  mode=mode||'in';
  var b=box(mode==='in'?'Sign in':'Request access');
  b.append(el('div',{class:'g-tabs',role:'group','aria-label':'Sign in or request access'},
    el('button',{type:'button',class:'g-tab','aria-pressed':String(mode==='in'),onclick:function(){showLogin('in');}},'Sign in'),
    el('button',{type:'button',class:'g-tab','aria-pressed':String(mode==='up'),onclick:function(){showLogin('up');}},'Request access')));
  if(mode==='up')b.append(el('p',{class:'g-hint'},'First time here? Fill in the form. Your teacher will approve your access.'));
  var name=el('input',{id:'g-name',type:'text',autocomplete:'name',maxlength:'60',enterkeyhint:'next'});
  var email=el('input',{id:'g-email',type:'email',autocomplete:'email',inputmode:'email',autocapitalize:'none',spellcheck:'false',enterkeyhint:'next'});
  var pass=el('input',{id:'g-pass',type:'password',autocomplete:mode==='in'?'current-password':'new-password',enterkeyhint:'go'});
  var err=el('p',{class:'g-err','aria-live':'polite'});
  var go=el('button',{type:'submit',class:'g-btn'},mode==='in'?'Sign in':'Send request');
  var form=el('form',{novalidate:true},
    mode==='up'?[el('label',{for:'g-name'},'Your name'),name]:null,
    el('label',{for:'g-email'},'E-mail'),email,
    el('label',{for:'g-pass'},mode==='in'?'Password':'Choose a password (at least 8 characters)'),pass,
    err,el('div',{class:'g-row'},go,el('a',{class:'g-btn g-cta',href:'placement.html'},'Take the free placement test')));
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
  return sb.auth.signOut().then(function(){location.reload();},function(){location.reload();});
}

/* ---------- top bar ---------- */
function addBar(){
  if(bar)bar.remove();
  var kids=[el('span',{},'Signed in: ',el('b',{},prof.name||user.email))];
  var minus=el('button',{type:'button','aria-label':'Smaller text',onclick:function(){setSize(fsIdx-1);}},'A\u2212');
  var plus=el('button',{type:'button','aria-label':'Larger text',onclick:function(){setSize(fsIdx+1);}},'A+');
  var reset=el('button',{type:'button','aria-label':'Normal text size',onclick:function(){setSize(1);}},'A');
  var lab=el('span',{'aria-live':'polite'});
  sizeUi={minus:minus,plus:plus,lab:lab};updateSizeUi();
  kids.push(el('span',{class:'g-sz',role:'group','aria-label':'Text size'},minus,reset,plus,lab));
  themeBtn=el('button',{type:'button',onclick:function(){setTheme(theme==='dark'?'light':'dark');}});setTheme(theme);
  kids.push(themeBtn);
  if(window.I18N)kids.push(window.I18N.selector());
  var tabsNav=document.getElementById('tabs');
  if(OPTS.noStageBox){}
  else if(tabsNav&&OPTS.kinds&&OPTS.kinds.length){var sb2=stageBox();if(sb2)tabsNav.parentNode.insertBefore(sb2,tabsNav);}
  else{var ss=stageSelect();if(ss)kids.push(ss);}
  kids.push(el('a',{href:'index.html'},'Home'));
  if(prof.is_admin)kids.push(el('a',{href:'admin.html'},'Teacher panel'));
  kids.push(el('button',{type:'button',onclick:signOut},'Sign out'));
  bar=el('div',{class:'g-bar'},kids);
  document.body.insertBefore(bar,document.body.firstChild);
}

/* ---------- content ---------- */
function upto(){return prof.is_admin?112:(prof.status==='approved'?prof.lessons_upto:0);}
var STG=[[1,16],[17,32],[33,52],[53,72],[73,92],[93,112]];
function stageOf(n){var i;for(i=0;i<STG.length;i++)if(n>=STG[i][0]&&n<=STG[i][1])return i+1;return 1;}
function curStage(){
  var top=Math.max(upto(),1),mx=stageOf(top),v=0;
  try{v=parseInt(new URLSearchParams(location.search).get('stage')||localStorage.getItem('callan-stage-es'),10);}catch(e){}
  return (v>=1&&v<=mx)?v:mx;
}
function setStage(n){try{localStorage.setItem('callan-stage-es',String(n));}catch(e){}
  try{var u=new URL(location.href);u.searchParams.delete('stage');location.href=u.toString();}catch(e){location.reload();}}
function loadContent(kinds){
  window.CHECKS=[];window.LESSON_TEXT={};window.EXLESSONS=[];
  window.LESSONS_UPTO=upto();
  if(!kinds||!kinds.length)return Promise.resolve();
  var st=curStage(),lo=STG[st-1][0],hi=Math.min(STG[st-1][1],Math.max(upto(),1));
  window.CALLAN_STAGE=st;
  function one(tries){
    return sb.from('content').select('lesson,kind,body').in('kind',kinds).gte('lesson',lo).lte('lesson',hi).order('lesson',{ascending:true}).then(function(r){
      if(r.error)throw r.error;return r.data||[];
    }).catch(function(e){if(tries>0)return one(tries-1);throw e;});
  }
  return one(2).then(function(rows){
    rows.forEach(function(row){
      if(row.kind==='check')window.CHECKS.push(row.body);
      else if(row.kind==='text')window.LESSON_TEXT[row.lesson]=row.body;
      else if(row.kind==='ex')window.EXLESSONS.push(row.body);
    });
  });
}
function stageSelect(){
  var mx=stageOf(Math.max(upto(),1));if(mx<2||!OPTS.kinds||!OPTS.kinds.length)return null;
  var sel=el('select',{'aria-label':'Stage',onchange:function(){setStage(parseInt(sel.value,10));}}),i,o;
  for(i=1;i<=mx;i++){o=el('option',{value:String(i)},'Stage '+i);if(i===window.CALLAN_STAGE)o.selected=true;sel.append(o);}
  return sel;
}
function stageBox(){
  var mx=stageOf(Math.max(upto(),1)),cur=curStage(),i,o;
  var sel=el('select',{id:'g-stage','aria-label':'Stage',onchange:function(){setStage(parseInt(sel.value,10));}});
  for(i=1;i<=6;i++){o=el('option',{value:String(i)},'Stage '+i);if(i>mx)o.disabled=true;if(i===cur)o.selected=true;sel.append(o);}
  return el('div',{class:'g-stagebox'},el('label',{for:'g-stage'},'Choose the Stage to load'),sel,el('span',{class:'g-hint'},'Only this Stage is downloaded, to save data.'));
}
function fetchAttempts(kind){
  return sb.from('attempts').select('lesson,ex,score,total,created_at').eq('kind',kind).eq('user_id',user.id)
    .order('created_at',{ascending:true}).limit(5000).then(function(r){
      if(r.error)throw r.error;
      return (r.data||[]).map(function(a){return {l:a.lesson,e:a.ex,s:a.score,t:a.total,at:Date.parse(a.created_at),k:kind};});
    });
}
function saveAttempt(kind,a){
  return sb.from('attempts').insert({kind:kind,lesson:a.l,ex:a.e,score:a.s,total:a.total!==undefined?a.total:a.t}).then(function(r){
    if(r.error)throw r.error;
  });
}
function audioUrl(path){
  return sb.storage.from('audio').createSignedUrl(path,7200).then(function(r){
    if(r.error||!r.data)throw (r.error||new Error('no url'));
    return r.data.signedUrl;
  });
}

/* ---------- routing ---------- */
var OPTS={kinds:[],attempts:null,admin:false},CB=null;
function route(){
  sb.auth.getSession().then(function(r){
    var s=r.data&&r.data.session;
    if(!s){showLogin('in');return;}
    user=s.user;
    return sb.from('profiles').select('*').eq('id',user.id).maybeSingle().then(function(pr){
      if(pr.error||!pr.data){
        message('Account not ready',['We could not read your account. Try again in a moment.'],[btn('Try again',route),btn('Sign out',signOut,true)]);return;
      }
      prof=pr.data;
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
      if(!OPTS.admin&&upto()<1){
        message('No lessons yet',['Your access is approved, but no lesson has been released to you yet. Talk to your teacher.'],[btn('Check again',route),btn('Sign out',signOut,true)]);return;
      }
      return loadContent(OPTS.kinds).then(function(){
        return OPTS.attempts?(Array.isArray(OPTS.attempts)?Promise.all(OPTS.attempts.map(fetchAttempts)).then(function(x){return [].concat.apply([],x);}):fetchAttempts(OPTS.attempts)):[];
      }).then(function(att){
        hideOverlay();addBar();
        if(!OPTS.admin&&/(lessons|check|dele|exercicios|workbook|audio)/.test(location.pathname.split('/').pop()||'')){try{sb.rpc('ping_activity').then(function(){},function(){});}catch(e){}}
        CB({user:user,profile:prof,attempts:att,upto:upto()});
      });
    });
  }).catch(function(e){
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
  message('Loading\u2026',['Please wait.']);
  loadLib(0,function(err){
    if(err){message('No connection',['Could not load the sign-in system. Check your internet and reload the page.'],[btn('Reload',function(){location.reload();})]);return;}
    sb=window.supabase.createClient(CFG.url,CFG.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
    window.Gate.sb=sb;
    route();
  });
}

window.Gate={start:start,signOut:signOut,saveAttempt:saveAttempt,audioUrl:audioUrl,el:el,
  get profile(){return prof;},get user(){return user;},sb:null};
})();
