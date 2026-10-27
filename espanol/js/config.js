/* Supabase project for the SPANISH site (public values: the "anon" key is meant to be in the page; access is controlled by the database rules). */
window.CALLAN_CFG={
  url:'https://utjiyhjoretlgnlqpxrk.supabase.co',
  key:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0aml5aGpvcmV0bGdubHFweHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMTI1ODgsImV4cCI6MjEwNzY4ODU4OH0.mmDs5DP79enEaCn3w9yvr4ijto17nSNjLVKrxqW5Bzs'
};

/* ---- course settings read by the shared files in ../js (gate.js, i18n.js, covers.js, streak.js) ---- */
window.BL_BASE='../';
window.BL_COURSE={
  id:'es',name:'Callan Español',uiLang:'es',loginLang:'es',langKey:'callan-lang-es',whyKey:'callan-why-es',i18nMode:'lock',
  stageKey:'callan-stage-es',maxLesson:112,
  stages:[[1,16],[17,32],[33,52],[53,72],[73,92],[93,112]],
  checkLessons:[7,10,12,15,20,24,28,31,34,37,40,43,46,48,51,53,56,58,61,63,66,69,71,73,76,79,81,84,87,90,92,95,97,100,102,105,108,110,112],
  colors:['#b3262b','#381215','#e8b84a','#8f1f27','#c9a85a','#862f36'],
  coverEs:true,
  profile:true,push:true, /* push is switched on when the Spanish notification service exists */
  css:'.g-ov{--ld:#E0606C;--bg:#250B0D;--card:#361215;--surface:#46161a;--ink:#FAF2F3;--muted:#C9AAAD;--mut:#C9AAAD;--line:#612C31;--chip:#541C21;--accent:#F5C542;--accent-ink:#310D10;--acc:#F5C542;--hl:#F5C542;--hli:#310D10;--link:#F0828B;--band1:#67161C;--band2:#310C0F}'+'html[data-theme="light"] .g-ov{--bg:#FAF4F5;--card:#FFFFFF;--surface:#FFFFFF;--ink:#310D10;--muted:#6f494c;--mut:#6f494c;--line:#E5D4D5;--chip:#F4E7E8;--accent:#F5C542;--accent-ink:#310D10;--acc:#F5C542;--hl:#F5C542;--hli:#310D10;--link:#94242D;--band1:#67161C;--band2:#310C0F}'+
  'html[data-theme="light"] .g-btn.g-cta,html[data-theme="light"] a.g-btn.g-cta:not(.ghost){border:2px solid #4d1217!important}'+
  '.g-btn.g-cta,a.g-btn.g-cta:not(.ghost){background:#fff;border-color:#fff;color:#4d1217;font-weight:700;flex:1 1 100%;font-size:1.05rem;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;text-align:center;box-shadow:0 2px 0 rgba(0,0,0,.25)}.g-btn.g-cta:hover{filter:brightness(1.08)}',
  coversCss:'.cv-num{margin-top:5px;font-size:.72rem;line-height:1.25;color:var(--muted,#c9aaad)}.cv-num i{font-style:normal;display:inline-block}.cv-num b{display:block;color:var(--ink,#FAF2F3);font-weight:700}.cv-num span{display:block}.cv-a{display:block;line-height:0}.cv-a .cv-img{transition:transform .2s}.cv-a:hover .cv-img,.cv-a:focus-visible .cv-img{transform:translateY(-3px)}.cv-fx{position:fixed;inset:0;z-index:99990;pointer-events:none;overflow:hidden}.cv-head{display:flex;gap:16px;align-items:center;margin:0 0 14px}.cv-img{border-radius:4px;box-shadow:0 6px 16px rgba(0,0,0,.4);flex:none;height:auto}'+
'.cv-txt{display:flex;flex-direction:column;gap:3px;min-width:0}.cv-txt b{font:700 1.2rem BLSerif,Georgia,serif}.cv-txt span,.cv-txt small{color:var(--muted,#c9aaad);font-size:.88rem}'+
'.cv-bar{height:6px;background:var(--line,#612c31);border-radius:9px;overflow:hidden;width:min(260px,100%);margin-top:4px}.cv-bar i{display:block;height:100%;background:#F5C542;border-radius:9px}'+
'.cv-badge{font-style:normal;font-size:.82rem;font-weight:700;color:#310D10;background:#F5C542;border-radius:99px;padding:2px 10px;align-self:flex-start;margin-top:4px}'+
'.cv-path{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px;margin:0 0 18px}@media(min-width:720px){.cv-path{grid-template-columns:repeat(12,minmax(0,1fr));gap:10px}}.cv-p{position:relative;text-align:center}.cv-p .cv-img{width:100%;height:auto}'+
'.cv-p.lock .cv-img{opacity:.28;filter:grayscale(1)}.cv-p.cur .cv-img{outline:3px solid #F5C542;outline-offset:2px}.cv-p .cv-bar{width:100%}'+
'.cv-tick{position:absolute;top:-6px;right:-4px;width:22px;height:22px;border-radius:50%;background:#F5C542;color:#310D10;font-weight:800;font-size:.8rem;display:grid;place-items:center;box-shadow:0 2px 6px rgba(0,0,0,.4)}'+
'.cv-ov{position:fixed;inset:0;z-index:99999;background:rgba(23,6,7,.82);display:grid;place-items:center;padding:18px;overflow:hidden;animation:cvin .3s ease}.cv-ov.out{opacity:0;transition:opacity .25s}'+
'.cv-card{position:relative;z-index:2;background:#361215;color:#FAF2F3;border:1px solid #612C31;border-radius:18px;padding:26px 24px;max-width:460px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.6);animation:cvpop .55s cubic-bezier(.2,1.3,.4,1)}'+
'.cv-card h2{font:700 1.5rem BLSerif,Georgia,serif;margin:0 0 14px;color:#fff}.cv-row{display:flex;align-items:center;justify-content:center;gap:18px;margin:0 0 14px}.cv-arrow{font-size:2rem;color:#F5C542}'+
'.cv-shine{position:relative;overflow:hidden;border-radius:5px;line-height:0;animation:cvlift 1.2s ease both}.cv-shine .cv-img{box-shadow:0 10px 26px rgba(0,0,0,.55)}.cv-shine::after{content:"";position:absolute;top:0;bottom:0;width:45%;left:-60%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.65),transparent);animation:cvsh 1.6s ease .4s 2}'+
'.cv-nx{opacity:.8;animation:cvfade .8s ease .6s both}.cv-sub{color:#C9AAAD;margin:0 0 16px}.cv-act{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}'+
'.cv-btn{background:#F5C542;color:#310D10;font-family:inherit;font-weight:700;font-size:1rem;border:0;border-radius:10px;padding:12px 20px;min-height:44px;cursor:pointer}.cv-sec,.cv-snd{background:transparent;color:#FAF2F3;border:2px solid #612C31;border-radius:10px;padding:10px 16px;min-height:44px;cursor:pointer;font:inherit}.cv-snd{margin-top:12px;border-color:transparent;font-size:.85rem;color:#C9AAAD}'+
'.cv-btn:focus-visible,.cv-sec:focus-visible,.cv-snd:focus-visible{outline:3px solid #fff;outline-offset:2px}'+
'.cv-conf{position:absolute;top:-20px;border-radius:2px;z-index:1;animation-name:cvfall;animation-timing-function:linear;animation-fill-mode:both}'+
'@keyframes cvfall{to{top:105vh;margin-left:60px;filter:hue-rotate(40deg)}}@keyframes cvin{from{opacity:0}}@keyframes cvpop{from{transform:scale(.7);opacity:0}}@keyframes cvlift{from{transform:translateY(24px) scale(.9)}}@keyframes cvsh{to{left:130%}}@keyframes cvfade{from{opacity:0;transform:translateX(-10px)}}'+
'@media(prefers-reduced-motion:reduce){.cv-ov,.cv-card,.cv-shine,.cv-shine::after,.cv-nx{animation:none!important}}'
};
