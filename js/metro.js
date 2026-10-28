/* Britland Academy: Game mode home as a metro map (shared by the English and Spanish sites).
   Window.Metro.mount(ctx,opts). Only used when Game mode is on (localStorage 'bl-game'==='1').
   - Each time the student opens the game, the city rotates (London, New York, Sydney, Toronto / Madrid, Mexico City, Buenos Aires, Santiago).
   - The route is drawn with 45-degree bends and is different every time.
   - Three tabs: Home (map), Trophies, Profile. One school logo only. */
(function(){
'use strict';
var W=window,D=document,NS='http://www.w3.org/2000/svg',B=W.BL_BASE||'';
var ES=!!W.BL_COURSE,KEY=(W.BL_COURSE&&W.BL_COURSE.langKey)||'callan-lang';
function lang(){try{var l=localStorage.getItem(KEY);return l==='en'||l==='es'||l==='pt'?l:'pt';}catch(e){return 'pt';}}

/* ---------- text ---------- */
var TX={en:{home:'Home',tro:'Trophies',pro:'Profile',lesson:'Lesson',here:'YOU ARE HERE',welcome:'Welcome to',next:'NEXT STOP',locked:'Complete the current lesson first',tap:'Tap the lesson to open it',
 open:'Open lesson',medals:'Medals',streak:'Streak',stages:'My stages',days:'days in a row',lessons:'lessons',stars:'stars',pay:'Grades and payments',all:'All done! Ask your teacher for the next lessons.',
 m:['First lesson','3 lessons','10 lessons','7-day streak','Perfect score','30-day streak'],week:'SMTWTFS',stage:'Stage'},
 es:{home:'Inicio',tro:'Trofeos',pro:'Perfil',lesson:'Lección',here:'ESTÁS AQUÍ',welcome:'Bienvenido a',next:'PRÓXIMA PARADA',locked:'Primero completa la lección actual',tap:'Toca la lección para abrirla',
 open:'Abrir lección',medals:'Medallas',streak:'Racha',stages:'Mis etapas',days:'días seguidos',lessons:'lecciones',stars:'estrellas',pay:'Notas y pagos',all:'¡Todo listo! Pide a tu profesor las próximas lecciones.',
 m:['Primera lección','3 lecciones','10 lecciones','Racha de 7 días','Nota perfecta','Racha de 30 días'],week:'LMXJVSD',stage:'Etapa'}};
function T(){return ES?TX.es:TX.en;}

/* ---------- flags (own simple drawings) ---------- */
var FL={
 uk:'<svg viewBox="0 0 60 30"><rect width="60" height="30" fill="#012169"/><path d="M0 0L60 30M60 0L0 30" stroke="#fff" stroke-width="6"/><path d="M0 0L60 30M60 0L0 30" stroke="#C8102E" stroke-width="2"/><path d="M30 0V30M0 15H60" stroke="#fff" stroke-width="10"/><path d="M30 0V30M0 15H60" stroke="#C8102E" stroke-width="6"/></svg>',
 us:(function(){var s='<svg viewBox="0 0 60 30"><rect width="60" height="30" fill="#fff"/>';for(var i=0;i<13;i+=2)s+='<rect y="'+(i*30/13).toFixed(2)+'" width="60" height="'+(30/13).toFixed(2)+'" fill="#B22234"/>';s+='<rect width="26" height="16.15" fill="#3C3B6E"/>';for(var r=0;r<4;r++)for(var c=0;c<5;c++)s+='<circle cx="'+(3+c*5)+'" cy="'+(3+r*3.9)+'" r="1" fill="#fff"/>';return s+'</svg>';})(),
 au:'<svg viewBox="0 0 60 30"><rect width="60" height="30" fill="#012169"/><path d="M0 0L30 15M30 0L0 15" stroke="#fff" stroke-width="3"/><path d="M15 0V15M0 7.5H30" stroke="#fff" stroke-width="5"/><path d="M15 0V15M0 7.5H30" stroke="#C8102E" stroke-width="3"/><circle cx="15" cy="23" r="3.5" fill="#fff"/><circle cx="44" cy="8" r="1.8" fill="#fff"/><circle cx="50" cy="15" r="1.8" fill="#fff"/><circle cx="44" cy="24" r="1.8" fill="#fff"/><circle cx="38" cy="15" r="1.8" fill="#fff"/></svg>',
 ca:'<svg viewBox="0 0 60 30"><rect width="60" height="30" fill="#fff"/><rect width="15" height="30" fill="#D52B1E"/><rect x="45" width="15" height="30" fill="#D52B1E"/><path d="M30 6l2 4 3-1-1 6 3-2 1 3-6 2 1 4h-6l1-4-6-2 1-3 3 2-1-6 3 1z" fill="#D52B1E"/></svg>'
};
function flagHTML(c){return c.img?'<img alt="" src="'+B+c.img+'">':FL[c.flag];}

/* ---------- cities, real stations, line colours, landmark silhouettes ---------- */
var A={
 bigben:'<rect x="62" y="40" width="26" height="110" fill="#fff"/><path d="M62 40L75 8L88 40Z" fill="#fff"/><rect x="58" y="36" width="34" height="8" fill="#fff"/><circle cx="75" cy="62" r="8" fill="@C"/><rect x="40" y="100" width="22" height="50" fill="#fff"/><rect x="88" y="100" width="40" height="50" fill="#fff"/>',
 bridge:'<rect x="30" y="50" width="14" height="100" fill="#fff"/><rect x="106" y="50" width="14" height="100" fill="#fff"/><path d="M0 135Q37 70 37 52Q75 120 113 52Q113 70 150 135" stroke="#fff" stroke-width="3" fill="none"/><path d="M37 52L10 135M37 52L60 135M113 52L90 135M113 52L140 135" stroke="#fff" stroke-width="1.5"/><rect x="0" y="135" width="150" height="6" fill="#fff"/>',
 opera:'<path d="M15 140Q25 70 70 70Q70 110 15 140Z" fill="#fff"/><path d="M60 140Q70 50 118 50Q118 100 60 140Z" fill="#fff"/><path d="M100 140Q108 90 138 92Q138 120 100 140Z" fill="#fff"/><rect x="5" y="140" width="140" height="8" fill="#fff"/>',
 cn:'<rect x="72" y="30" width="6" height="120" fill="#fff"/><ellipse cx="75" cy="78" rx="22" ry="8" fill="#fff"/><rect x="73" y="8" width="4" height="30" fill="#fff"/><path d="M60 150L72 80M90 150L78 80" stroke="#fff" stroke-width="4"/>',
 alcala:'<rect x="20" y="70" width="110" height="14" fill="#fff"/><rect x="26" y="52" width="98" height="18" fill="#fff"/><rect x="62" y="36" width="26" height="16" fill="#fff"/><rect x="20" y="84" width="16" height="64" fill="#fff"/><rect x="60" y="84" width="8" height="64" fill="#fff"/><rect x="82" y="84" width="8" height="64" fill="#fff"/><rect x="114" y="84" width="16" height="64" fill="#fff"/><rect x="14" y="146" width="122" height="6" fill="#fff"/>',
 angel:'<rect x="68" y="50" width="14" height="60" fill="#fff"/><path d="M75 12l5 12-5 6-5-6z" fill="#fff"/><path d="M52 34Q64 22 75 30Q86 22 98 34Q86 36 75 40Q64 36 52 34Z" fill="#fff"/><rect x="58" y="108" width="34" height="10" fill="#fff"/><rect x="46" y="118" width="58" height="12" fill="#fff"/><rect x="34" y="130" width="82" height="18" fill="#fff"/>',
 obelisk:'<path d="M70 14L80 14L84 40L66 40Z" fill="#fff"/><path d="M66 40L84 40L90 140L60 140Z" fill="#fff"/><rect x="50" y="140" width="50" height="8" fill="#fff"/>',
 torre:'<rect x="62" y="22" width="26" height="126" fill="#fff"/><rect x="68" y="10" width="14" height="14" fill="#fff"/><rect x="74" y="0" width="2" height="12" fill="#fff"/><path d="M66 40h18M66 62h18M66 84h18M66 106h18" stroke="@C" stroke-width="2"/><path d="M0 148Q40 110 75 130Q110 100 150 148Z" fill="#fff" opacity=".6"/>'
};
var CITIES=ES?[
 {city:'Madrid',line:'Línea 1',color:'#2DBEF0',ink:'#10224a',img:'img/es/flag-es.png',art:'alcala',welcome:'Madrid',phrase:'¡Qué pasada!',tr:{pt:'Que demais!',en:'How amazing!'},stn:['Chamartín','Plaza de Castilla','Cuatro Caminos','Bilbao','Gran Vía','Sol','Atocha']},
 {city:'Ciudad de México',line:'Línea 3',color:'#B0B215',ink:'#10224a',img:'img/es/flag-mx.png',art:'angel',welcome:'Ciudad de México',phrase:'¡Ahorita vengo!',tr:{pt:'Já volto!',en:'Be right back!'},stn:['Indios Verdes','La Raza','Guerrero','Hidalgo','Juárez','Centro Médico','Universidad']},
 {city:'Buenos Aires',line:'Línea A',color:'#18B7E8',ink:'#10224a',img:'img/es/flag-ar.png',art:'obelisk',welcome:'Buenos Aires',phrase:'¡Dale, vamos!',tr:{pt:'Beleza, vamos!',en:'Okay, let’s go!'},stn:['Plaza de Mayo','Perú','Piedras','Lima','Sáenz Peña','Congreso','Primera Junta']},
 {city:'Santiago',line:'Línea 1',color:'#E3001B',ink:'#fff',img:'img/es/flag-cl.png',art:'torre',welcome:'Santiago',phrase:'¿Cachai?',tr:{pt:'Entendeu?',en:'Get it?'},stn:['Estación Central','República','Los Héroes','La Moneda','Universidad de Chile','Baquedano','Tobalaba']}
]:[
 {city:'London',line:'Central line',color:'#dc241f',ink:'#fff',flag:'uk',art:'bigben',welcome:'London',phrase:'Mind the gap.',tr:{pt:'Cuidado com o vão.',es:'Cuidado con el hueco.'},stn:['Notting Hill Gate','Bond Street','Oxford Circus','Tottenham Court Road','Holborn','St Paul’s','Bank']},
 {city:'New York',line:'6 train',color:'#00933c',ink:'#fff',flag:'us',art:'bridge',welcome:'New York',phrase:'It’s on me.',tr:{pt:'Fica por minha conta.',es:'Invito yo.'},stn:['Grand Central–42 St','33 St','Astor Place','Bleecker St','Spring St','Canal St','Brooklyn Bridge']},
 {city:'Sydney',line:'T1 North Shore line',color:'#f99d1c',ink:'#1a1a1a',flag:'au',art:'opera',welcome:'Sydney',phrase:'No worries!',tr:{pt:'Sem problemas!',es:'¡Sin problema!'},stn:['Central','Town Hall','Wynyard','Circular Quay','Milsons Point','North Sydney','Chatswood']},
 {city:'Toronto',line:'Line 1',color:'#ffcd00',ink:'#1a1a1a',flag:'ca',art:'cn',welcome:'Toronto',phrase:'Take a rain check.',tr:{pt:'Fica para outra vez.',es:'Lo dejamos para otra.'},stn:['Union','St Andrew','King','Queen','Dundas','College','Wellesley']}
];

/* ---------- sound (WebAudio, same flag as the exercises) ---------- */
var ac=null;
function sndOn(){try{return localStorage.getItem('bl-duo-snd')!=='0';}catch(e){return true;}}
function ctx(){try{ac=ac||new (W.AudioContext||W.webkitAudioContext)();if(ac.state==='suspended')ac.resume();}catch(e){}return ac;}
function tone(f,t0,dd,type,g,f2){var c=ctx();if(!c||!sndOn())return;try{var o=c.createOscillator(),v=c.createGain(),t=c.currentTime+t0;o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dd);v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(g||.15,t+.015);v.gain.exponentialRampToValueAtTime(.0001,t+dd);o.connect(v);v.connect(c.destination);o.start(t);o.stop(t+dd+.05);}catch(e){}}
function tick(){tone(660,0,.06,'square',.05);tone(990,.03,.05,'square',.03);}
function dingdong(){tone(784,0,.9,'sine',.17);tone(1568,0,.4,'sine',.05);tone(587.3,.42,1.1,'sine',.17);tone(1174.6,.42,.45,'sine',.05);}
function whistle(){tone(880,0,.55,'triangle',.1,1250);tone(884,0,.55,'sine',.05,1260);tone(1320,.62,.35,'triangle',.07,1100);}
function chug(n){for(var i=0;i<n;i++)tone(120,i*.22,.1,'square',.035,60);}
function buzz(){tone(233,0,.2,'triangle',.12);tone(175,.1,.25,'triangle',.11);}

/* ---------- css ---------- */
var CSS=
'body.bl-mg main>:not(#bl-metro){display:none!important}body.bl-mg main{padding-bottom:96px}:root:root body.bl-mg,:root[data-theme="light"]:root body.bl-mg{background:var(--bg)!important}'+
'#bl-metro{--lc:#dc241f;--n0:#0b1733;--n1:#12214a;--n2:#2b4070;--cr:#f4f1e8;--mu:#9fb0d0;--go:#e8b923;max-width:440px;margin:0 auto;color:var(--cr);font-family:var(--font-body,system-ui,Arial,sans-serif);position:relative;background:#0b1733;border-radius:24px;padding:10px 12px 22px;box-shadow:0 0 0 2px #2b4070}'+
'#bl-metro *{box-sizing:border-box}'+
'#bl-metro .top{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 2px 10px}'+
'#bl-metro .av{width:42px;height:42px;border-radius:50%;border:3px solid var(--go);overflow:hidden;background:#fff;padding:0;cursor:pointer;flex:none}#bl-metro .av svg,#bl-metro .av img{width:100%;height:100%;display:block;object-fit:cover}'+
'#bl-metro .lk{display:flex;align-items:center;gap:8px}#bl-metro .lk img{height:34px;width:auto}#bl-metro .lk b{display:block;font:700 17px Georgia,serif;letter-spacing:.06em;line-height:1}#bl-metro .lk i{display:block;font:600 8px sans-serif;letter-spacing:.32em;color:#e0524c;font-style:normal;margin-top:3px}'+
'#bl-metro .fl{font:700 15px sans-serif;min-width:42px;text-align:right}'+
'#bl-metro .hd{display:flex;align-items:center;gap:12px;background:var(--n1);border:2px solid var(--n2);border-radius:16px;padding:12px 14px;margin-bottom:6px}'+
'#bl-metro .flag{width:54px;height:36px;border-radius:5px;overflow:hidden;flex:none;box-shadow:0 0 0 2px #fff,0 3px 0 2px rgba(0,0,0,.4)}#bl-metro .flag svg,#bl-metro .flag img{width:100%;height:100%;display:block;object-fit:cover}'+
'#bl-metro .hd .tx{flex:1;min-width:0}#bl-metro .hd small{display:block;font:700 10px sans-serif;letter-spacing:.14em;color:var(--go);text-transform:uppercase}#bl-metro .hd b{display:block;font:700 16px sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
'#bl-metro .rnd{width:36px;height:36px;border-radius:50%;background:#fff;border:7px solid var(--lc);display:flex;align-items:center;justify-content:center;color:#10224a;font:800 13px sans-serif;flex:none}'+
'#bl-metro .map{display:block;width:100%;height:auto;margin-top:4px}'+
'#bl-metro .map text{font-family:system-ui,Arial,sans-serif}#bl-metro .stg{outline:none;cursor:pointer;-webkit-tap-highlight-color:transparent}#bl-metro .stg:focus-visible circle.hit{stroke:#4fc3f7;stroke-width:3}'+
'#bl-metro .in{animation:mt-casc .45s cubic-bezier(.3,1.5,.5,1) both;transform-box:fill-box;transform-origin:center}'+
'#bl-metro .pulse{transform-box:fill-box;transform-origin:center;animation:mt-ring 1.6s ease-in-out infinite}#bl-metro .lion{transform-box:fill-box;transform-origin:50% 90%;animation:mt-sway 1.6s ease-in-out infinite}'+
'#bl-metro .pop{animation:mt-pop .55s cubic-bezier(.3,1.7,.5,1);transform-box:fill-box;transform-origin:center}#bl-metro .shk{animation:mt-shk .4s;transform-box:fill-box;transform-origin:center}'+
'@keyframes mt-casc{from{opacity:0;transform:translateY(14px) scale(.7)}to{opacity:1;transform:none}}@keyframes mt-ring{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.35);opacity:.12}}'+
'@keyframes mt-sway{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg) scale(1.06)}}@keyframes mt-pop{0%{transform:scale(.6)}60%{transform:scale(1.25)}100%{transform:scale(1)}}@keyframes mt-shk{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}'+
'#bl-metro .toast{position:fixed;left:50%;bottom:90px;transform:translate(-50%,20px);background:#fff;color:#10224a;font:700 13px sans-serif;padding:9px 14px;border-radius:12px;opacity:0;pointer-events:none;transition:all .3s;z-index:60;max-width:86vw;text-align:center}#bl-metro .toast.on{opacity:1;transform:translate(-50%,0)}'+
'#bl-metro .sign{position:fixed;left:50%;bottom:84px;transform:translate(-50%,40px);opacity:0;transition:all .45s cubic-bezier(.3,1.4,.5,1);z-index:55;pointer-events:none;width:min(86vw,340px)}#bl-metro .sign.on{opacity:1;transform:translate(-50%,0)}'+
'#bl-metro .plate{background:#fff;border-radius:14px;padding:12px 14px 10px;text-align:center;box-shadow:0 8px 0 rgba(0,0,0,.35);color:#10224a}#bl-metro .plate small{display:block;font:700 9.5px sans-serif;letter-spacing:.16em;color:#5a6a8c;margin-bottom:6px}'+
'#bl-metro .plate .art{border-radius:9px;height:84px;display:flex;justify-content:center;overflow:hidden;margin-bottom:8px}#bl-metro .plate .art svg{height:84px;width:auto}'+
'#bl-metro .pbar{background:#1d3f8a;border-radius:4px;color:#fff;font:700 15px sans-serif;padding:7px}#bl-metro .plate .ph{margin-top:8px;font:700 13px sans-serif}#bl-metro .plate .pt{font:500 11px sans-serif;color:#5a6a8c}'+
'#bl-metro .wel{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;text-align:center;background:rgba(5,11,28,.94);animation:mt-fade .4s both;cursor:pointer}#bl-metro .wel.out{opacity:0;transition:opacity .5s;pointer-events:none}'+
'#bl-metro .wel .fw{width:190px;height:120px;margin:0 auto 18px;border-radius:8px;overflow:hidden;box-shadow:0 0 0 4px #fff,0 10px 0 4px rgba(0,0,0,.4);transform:rotate(-3deg);animation:mt-wave 1.8s ease-in-out infinite}#bl-metro .wel .fw svg,#bl-metro .wel .fw img{width:100%;height:100%;display:block;object-fit:cover}'+
'#bl-metro .wel small{display:block;font:700 11px sans-serif;letter-spacing:.2em;color:var(--go)}#bl-metro .wel h2{margin:6px 0 8px;font:800 30px Georgia,serif;line-height:1.1;color:#fff}#bl-metro .wel .ln{display:inline-flex;align-items:center;gap:8px;font:700 12px sans-serif;color:#fff}#bl-metro .wel .ln i{width:30px;height:9px;border-radius:5px;background:var(--lc)}'+
'@keyframes mt-fade{from{opacity:0}to{opacity:1}}@keyframes mt-wave{0%,100%{transform:rotate(-3deg) skewY(0)}50%{transform:rotate(-1deg) skewY(2deg)}}'+
'#bl-metro .tabbar{position:fixed;left:0;right:0;bottom:0;z-index:50;display:flex;justify-content:center;gap:6px;background:#0e1c3f;border-top:2px solid var(--n2);padding:6px 10px calc(6px + env(safe-area-inset-bottom,0px))}'+
'#bl-metro .tab{flex:1;max-width:140px;display:flex;flex-direction:column;align-items:center;gap:2px;min-height:52px;font:700 10px sans-serif;color:var(--mu);background:transparent;border:2px solid transparent;border-radius:12px;cursor:pointer;padding:4px 6px;transition:transform .12s}#bl-metro .tab b{font-size:22px;line-height:1.1}#bl-metro .tab:active{transform:translateY(3px) scale(.96)}#bl-metro .tab[aria-selected=true]{border-color:#4fc3f7;background:var(--n1);color:#fff}'+
'#bl-metro h3{font:700 11px sans-serif;letter-spacing:.14em;color:var(--mu);text-transform:uppercase;margin:16px 0 8px}'+
'#bl-metro .ph0{text-align:center;margin-top:8px}#bl-metro .big{width:116px;height:116px;border-radius:50%;margin:0 auto;border:6px solid var(--lc);box-shadow:0 0 0 4px #fff,0 0 28px color-mix(in srgb,var(--lc) 55%,transparent);overflow:hidden;background:#fff;padding:0;display:block}#bl-metro .big svg,#bl-metro .big img{width:100%;height:100%;display:block;object-fit:cover}'+
'#bl-metro h2.nm{margin:12px 0 0;font:700 21px Georgia,serif}#bl-metro .sub{font:700 10px sans-serif;letter-spacing:.14em;color:var(--go);margin-top:4px;text-transform:uppercase}'+
'#bl-metro .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}#bl-metro .stats div{background:var(--n1);border:2px solid var(--n2);border-radius:12px;padding:8px 4px;text-align:center}#bl-metro .stats b{display:block;font:800 20px sans-serif}#bl-metro .stats small{font:600 10px sans-serif;color:var(--mu)}'+
'#bl-metro .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}#bl-metro .md{text-align:center;animation:mt-casc .5s both}#bl-metro .md .c{width:54px;height:54px;border-radius:50%;margin:0 auto 4px;background:radial-gradient(circle at 35% 30%,#ffe68a,#e8b923);display:flex;align-items:center;justify-content:center;font-size:25px;box-shadow:0 3px 0 #9a7a10;position:relative;overflow:hidden}'+
'#bl-metro .md:not(.off) .c::after{content:"";position:absolute;top:-30%;left:-60%;width:40%;height:160%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.7),transparent);transform:rotate(20deg);animation:mt-shine 3.2s ease-in-out infinite}@keyframes mt-shine{0%,60%{left:-60%}100%{left:130%}}'+
'#bl-metro .md small{font:600 10px sans-serif;color:#cdd6ea}#bl-metro .md.off .c{background:var(--n1);box-shadow:none;filter:grayscale(1);opacity:.45}'+
'#bl-metro .week{display:flex;gap:6px}#bl-metro .d{flex:1;height:52px;border-radius:10px;background:var(--n1);border:2px solid var(--n2);text-align:center;font-size:17px;padding-top:4px}#bl-metro .d.f{border-color:var(--go)}#bl-metro .d small{display:block;font:700 9px sans-serif;color:var(--mu)}'+
'#bl-metro .row{display:flex;align-items:center;gap:10px;background:var(--n1);border:2px solid var(--n2);border-radius:12px;padding:9px 12px;margin-bottom:6px}#bl-metro .row i{width:8px;height:30px;border-radius:4px;background:var(--lc);flex:none}#bl-metro .row div{flex:1;min-width:0}#bl-metro .row b{display:block;font:700 13px sans-serif}#bl-metro .row small{font:500 10px sans-serif;color:var(--mu)}#bl-metro .row span{font:700 12px sans-serif;color:var(--go)}'+
'#bl-metro a.mb,#bl-metro button.mb{display:flex;align-items:center;justify-content:center;gap:8px;min-height:50px;width:100%;border:0;border-radius:14px;background:var(--go);color:#2a2000;font:700 15px sans-serif;text-decoration:none;box-shadow:0 4px 0 #9a7a10;cursor:pointer;margin-top:10px;transition:transform .1s,box-shadow .1s}#bl-metro a.mb:active,#bl-metro button.mb:active{transform:translateY(4px);box-shadow:0 0 0 #9a7a10}#bl-metro a.mb.alt{background:var(--n1);color:#fff;border:2px solid var(--n2);box-shadow:0 4px 0 #050b1c}'+
'#bl-metro .sheet{position:fixed;inset:0;z-index:70;display:flex;align-items:flex-end;justify-content:center;background:rgba(5,11,28,.6)}#bl-metro .sheet>div{width:min(100%,440px);background:var(--n0);border:2px solid var(--n2);border-bottom:0;border-radius:22px 22px 0 0;padding:16px 16px calc(18px + env(safe-area-inset-bottom,0px));animation:mt-up .3s cubic-bezier(.3,1.2,.5,1)}@keyframes mt-up{from{transform:translateY(100%)}to{transform:none}}'+
'#bl-metro .sheet h4{margin:0 0 2px;font:700 18px sans-serif}#bl-metro .sheet p{margin:0 0 6px;font:600 11px sans-serif;letter-spacing:.1em;color:var(--go);text-transform:uppercase}'+
'@media (prefers-reduced-motion:reduce){#bl-metro *{animation:none!important;transition:none!important}}';

/* ---------- helpers ---------- */
function el(n,a,p){var e=D.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
function h(tag,cls,html){var e=D.createElement(tag);if(cls)e.className=cls;if(html!==undefined)e.innerHTML=html;return e;}
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
var VH=520;
function genRoute(seed){
  var r=rng(seed),x=70+r()*200,y=34,pts=[[x,y],[x,y+46]],last='d',guard=0;y+=46;
  while(y<VH-6&&guard++<300){
    var ks=['d','se','sw','d','se','sw','e','w'].filter(function(k){return k!==last&&!((k==='e'||k==='w')&&(last==='e'||last==='w'));});
    var k=ks[Math.floor(r()*ks.length)],len=50+r()*60,nx=x,ny=y;
    if(k==='d')ny=y+len;else if(k==='se'){nx=x+len*.8;ny=y+len*.8;}else if(k==='sw'){nx=x-len*.8;ny=y+len*.8;}else if(k==='e')nx=x+len*.7;else nx=x-len*.7;
    if(nx<44||nx>296)continue;
    ny=Math.min(ny,VH);pts.push([+nx.toFixed(1),+ny.toFixed(1)]);x=nx;y=ny;last=k;
  }
  if(pts[pts.length-1][1]<VH-6)pts.push([pts[pts.length-1][0],VH]);
  return pts;
}
function pathD(r){return 'M'+r.map(function(p){return p[0]+' '+p[1];}).join(' L');}
function spaced(r,n){
  var pa=el('path',{d:pathD(r)}),L=pa.getTotalLength(),q=[];
  for(var i=0;i<n;i++)q.push(pa.getPointAtLength(L*(.02+.96*i/Math.max(1,n-1))));
  for(var i=0;i<n;i++)for(var j=i+1;j<n;j++){var dx=q[i].x-q[j].x,dy=q[i].y-q[j].y;if(Math.sqrt(dx*dx+dy*dy)<(j-i===1?44:78))return false;}
  return true;
}
function newRoute(n){var r,k=0;do{r=genRoute((Math.random()*1e9)|0);}while(!spaced(r,n)&&k++<400);return r;}

function pickCity(){
  var k='bl-metro-city',i=0;
  try{i=(parseInt(localStorage.getItem(k),10)+1);if(!(i>=0))i=0;i=i%CITIES.length;localStorage.setItem(k,String(i));}catch(e){i=Math.floor(Math.random()*CITIES.length);}
  return i;
}

/* ---------- mount ---------- */
function mount(c,o){
  /* o: {upto,max,best,done(l),doneCount,links:[{t,href}],mark,stages:[[a,b]...],badge} */
  var C=CITIES[pickCity()],tx=T(),upto=o.upto||0,max=o.max||206,best=o.best||{},profile=(c&&c.profile)||{};
  var st=D.createElement('style');st.textContent=CSS;D.head.append(st);
  D.body.classList.add('bl-mg');
  var main=D.querySelector('main')||D.body,root=h('div');root.id='bl-metro';main.append(root);
  root.style.setProperty('--lc',C.color);
  var cur=0;for(var l=1;l<=Math.min(upto,max);l++){if(!o.done(l)){cur=l;break;}}
  var N=7,ref=cur||Math.min(upto,max)||1,start=Math.max(1,Math.min(ref-3,max-N+1));
  var cnt=Math.max(2,Math.min(N,max-start+1)),streak={cur:0,best:0,last:''};
  var tab='home',busy=false,route=null,mapEl,pathEl,fillEl,trainEl,Ltot=0,lens=[],signEl,toastEl;
  var lessonsDone=o.doneCount||0;

  function say(t){toastEl.textContent=t;toastEl.classList.add('on');clearTimeout(say.t);say.t=setTimeout(function(){toastEl.classList.remove('on');},1900);}
  function plate(i){
    var ink=C.ink==='#fff'?'#fff':'#1a1a1a',svg=A[C.art].replace(/#fff/g,ink).replace(/@C/g,C.color),tr=C.tr[lang()]||C.tr.pt||'';
    signEl.innerHTML='<div class="plate"><small>'+C.city.toUpperCase()+' · '+tx.here+'</small><div class="art" style="background:'+C.color+'"><svg viewBox="0 0 150 150" aria-hidden="true">'+svg+'</svg></div><div class="pbar"></div><div class="ph"></div><div class="pt"></div></div>';
    signEl.querySelector('.pbar').textContent=C.stn[i];signEl.querySelector('.ph').textContent='“'+C.phrase+'”';signEl.querySelector('.pt').textContent=tr;
    signEl.classList.add('on');clearTimeout(plate.t);plate.t=setTimeout(function(){signEl.classList.remove('on');},3200);
  }
  function pt(len){return pathEl.getPointAtLength(Math.max(0,Math.min(Ltot,len)));}
  function ang(len){var a=pt(len-3),b=pt(len+3);return Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI-90;}
  function setProg(len){fillEl.style.strokeDashoffset=Ltot-len;var p=pt(len);trainEl.setAttribute('transform','translate('+p.x+' '+p.y+') rotate('+ang(len)+')');}
  function ease(x){return x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;}
  function reduced(){return W.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;}
  function sheet(l){
    var s=h('div','sheet'),b=h('div'),p=h('p'),t=h('h4');p.textContent=C.stn[l-start]||'';t.textContent=tx.lesson+' '+l;b.append(p,t);
    var first=true;o.links.forEach(function(k){var a=h('a','mb'+(first?'':' alt'));a.href=k.href;a.textContent=k.t;a.addEventListener('click',tick);b.append(a);first=false;});
    s.append(b);s.addEventListener('click',function(e){if(e.target===s)s.remove();});root.append(s);
  }
  function tap(i){
    var l=start+i;if(busy)return;ctx();tick();
    if(l>upto||(cur&&l>cur)){var g=mapEl.querySelector('[data-i="'+i+'"] .in');g.classList.remove('shk');void g.getBoundingClientRect();g.classList.add('shk');buzz();say(tx.locked);return;}
    sheet(l);
  }
  function build(animate){
    mapEl.textContent='';
    pathEl=el('path',{d:pathD(route),fill:'none'},mapEl);pathEl.style.display='none';Ltot=pathEl.getTotalLength();
    lens=[];for(var i=0;i<cnt;i++)lens.push(Ltot*(.02+.96*i/(cnt-1)));
    el('path',{d:pathD(route),fill:'none',stroke:'#2b4070','stroke-width':12,'stroke-linecap':'round','stroke-linejoin':'round'},mapEl);
    fillEl=el('path',{d:pathD(route),fill:'none',stroke:C.color,'stroke-width':12,'stroke-linecap':'round','stroke-linejoin':'round'},mapEl);
    fillEl.style.strokeDasharray=Ltot+' '+Ltot;fillEl.style.strokeDashoffset=Ltot;
    for(var i=0;i<cnt;i++){
      var l=start+i,p=pt(lens[i]),right=p.x<175,locked=l>upto,isCur=l===cur,isDone=!locked&&!isCur&&(cur?l<cur:true),rr=isCur?24:11;
      var g=el('g',{transform:'translate('+p.x.toFixed(1)+' '+p.y.toFixed(1)+')','class':'stg',tabindex:0,role:'button','data-i':i},mapEl);
      g.setAttribute('aria-label',tx.lesson+' '+l+', '+C.stn[i]+(isDone?', ✓':isCur?', '+tx.here:', 🔒'));
      var inn=el('g',{'class':'in'},g);inn.style.animationDelay=(i*.08)+'s';
      if(!animate)inn.style.animation='none';
      el('rect',{x:right?-(rr+10):-(rr+10)-150,y:-38,width:rr+10+150,height:64,fill:'transparent'},inn);el('circle',{'class':'hit',r:rr+10,fill:'transparent'},inn);
      if(isCur){el('circle',{r:rr+7,fill:'#fff','class':'pulse'},inn);el('circle',{r:rr,fill:C.color,stroke:'#fff','stroke-width':6},inn);el('image',{href:B+'img/lion-gold.png',x:-13,y:-15,width:26,height:30,'class':'lion'},inn);}
      else if(isDone){el('circle',{r:rr,fill:'#fff',stroke:C.color,'stroke-width':5},inn);el('path',{d:'M-4 0L-1 3.5L5 -4',stroke:'#10224a','stroke-width':2.4,fill:'none','stroke-linecap':'round'},inn);}
      else el('circle',{r:rr,fill:'#0b1733',stroke:'#2b4070','stroke-width':5},inn);
      var lx=right?rr+14:-(rr+14),an=right?'start':'end',dim=locked;
      var X=function(txt,y,sz,w,col,ls){var t=el('text',{x:lx,y:y,'text-anchor':an,'font-size':sz,'font-weight':w,fill:col,'letter-spacing':ls||0},inn);t.textContent=txt;};
      if(isCur){var tw=ES?104:96,rx=right?lx:lx-tw;el('rect',{x:rx,y:-34,width:tw,height:16,rx:8,fill:'#e8b923'},inn);var tg=el('text',{x:rx+tw/2,y:-22.5,'text-anchor':'middle','font-size':9,'font-weight':700,fill:'#2a2000','letter-spacing':'.8'},inn);tg.textContent=tx.here;}
      X(tx.lesson+' '+l,-6,13.5,700,dim?'#7d8db3':'#f4f1e8');
      X(C.stn[i].toUpperCase(),12,9,700,dim?'#5f6f96':(C.color==='#E3001B'||C.color==='#dc241f'?'#ff8a80':C.color),'.4');
      g.addEventListener('click',function(e){tap(+e.currentTarget.getAttribute('data-i'));});
      g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();tap(+e.currentTarget.getAttribute('data-i'));}});
    }
    trainEl=el('g',{opacity:0,'pointer-events':'none'},mapEl);
    el('rect',{x:-11,y:-16,width:22,height:32,rx:7,fill:C.color,stroke:'#fff','stroke-width':2.5},trainEl);el('rect',{x:-7,y:-12,width:14,height:8,rx:2,fill:'#1d3f8a'},trainEl);
    el('circle',{cx:-4,cy:9,r:2,fill:'#fff'},trainEl);el('circle',{cx:4,cy:9,r:2,fill:'#fff'},trainEl);
    var ci=cur?cur-start:cnt-1;setProg(lens[Math.max(0,Math.min(cnt-1,ci))]);
  }
  function fillTo(idx,ms){fillEl.style.transition='stroke-dashoffset '+ms+'ms cubic-bezier(.45,.05,.4,1)';fillEl.style.strokeDashoffset=Ltot-lens[Math.max(0,Math.min(cnt-1,idx))];}

  /* ----- views ----- */
  function homeView(box){
    var hd=h('div','hd');
    var f=h('div','flag',flagHTML(C)),t=h('div','tx'),rn=h('div','rnd');
    t.innerHTML='<small></small><b></b>';t.firstChild.textContent=C.city+' · '+C.line;
    var stg=1;(o.stages||[]).forEach(function(r,k){if((cur||upto)>=r[0]&&(cur||upto)<=r[1])stg=k+1;});
    t.lastChild.textContent=tx.stage+' '+stg+' · '+tx.lesson+' '+(cur||Math.min(upto,max)||1);rn.textContent=stg;
    hd.append(f,t,rn);box.append(hd);
    if(!cur&&upto>0){var m=h('p');m.style.cssText='margin:6px 2px;font:600 13px sans-serif;color:#cdd6ea';m.textContent=tx.all;box.append(m);}
    var svg=el('svg',{'class':'map',viewBox:'0 0 340 '+VH,role:'group','aria-label':C.city});mapEl=svg;box.append(svg);
    route=route||newRoute(cnt);build(true);
    var prev=0;try{prev=parseInt(localStorage.getItem('bl-metro-pos'),10)||0;localStorage.setItem('bl-metro-pos',String(cur||upto));}catch(e){}
    setTimeout(function(){try{var r=svg.getBoundingClientRect(),cy=r.top+scrollY+r.height*(cur?(cur-start)/Math.max(1,cnt-1):1);scrollTo({top:Math.max(0,cy-innerHeight*.45),behavior:'auto'});}catch(e){}},60);
    setTimeout(function(){
      var ci=cur?cur-start:cnt-1;
      if(cur&&prev&&prev<cur&&prev>=start&&!reduced()){busy=true;fillTo(prev-start,10);whistle();setTimeout(function(){chug(6);},120);trainEl.setAttribute('opacity',1);
        var a=lens[prev-start],b=lens[ci],t0=null;(function fr(ts){if(t0===null)t0=ts;var k=Math.min(1,(ts-t0)/1500);setProg(a+(b-a)*ease(k));if(k<1)requestAnimationFrame(fr);else{dingdong();trainEl.setAttribute('opacity',0);plate(ci);busy=false;}})(performance.now());}
      else{fillTo(ci,1200);if(cur)setTimeout(function(){plate(ci);},1400);}
    },350);
  }
  function medals(){
    var s=streak,doneAll=o.stages&&o.stages[0]?(function(){for(var l=o.stages[0][0];l<=Math.min(o.stages[0][1],max);l++)if(!o.done(l)||l>upto)return false;return true;})():false;
    var perfect=false;for(var k in best)if(best[k]>=0.999)perfect=true;
    var sb=Math.max(s.best||0,s.cur||0),m=tx.m,L=lessonsDone;
    return [['⭐',m[0],L>=1],['🚇',m[1],L>=3],['🏅',m[2],L>=10],['🔥',m[3],sb>=7],['🦁',m[4],perfect],['🌟',m[5],sb>=30]];
  }
  function medalsHTML(list){return list.map(function(x,i){return '<div class="md'+(x[2]?'':' off')+'" style="animation-delay:'+(i*.07)+'s"><div class="c">'+x[0]+'</div><small>'+x[1]+'</small></div>';}).join('');}
  function trophiesView(box){
    var wk=h('div','week'),last=streak.last?new Date(streak.last+'T12:00:00'):null,today=new Date();today.setHours(12,0,0,0);
    var t=T().week.split('');
    var tl=ES?[1,2,3,4,5,6,0]:[0,1,2,3,4,5,6]; /* Monday first in Spanish, Sunday first in English */
    var ws=new Date(today);var dow=ES?(today.getDay()+6)%7:today.getDay();ws.setDate(today.getDate()-dow);
    for(var i=0;i<7;i++){var d=new Date(ws);d.setDate(ws.getDate()+i);var on=false;if(last&&streak.cur>0){var diff=Math.round((last-d)/864e5);on=diff>=0&&diff<streak.cur;}
      var e=h('div','d'+(on?' f':''),(on?'🔥':'')+'<small>'+t[i]+'</small>');wk.append(e);}
    var h1=h('h3');h1.textContent=tx.streak+' · '+streak.cur+' '+tx.days;box.append(h1,wk);
    var h2=h('h3');h2.textContent=tx.stages;box.append(h2);
    (o.stages||[]).forEach(function(r,k){if(r[0]>upto)return;var tot=0,dn=0;for(var l=r[0];l<=Math.min(r[1],upto);l++){tot++;if(o.done(l))dn++;}
      var row=h('div','row','<i></i><div><b></b><small></small></div><span></span>');row.querySelector('b').textContent=tx.stage+' '+(k+1);row.querySelector('small').textContent=r[0]+'–'+r[1];row.querySelector('span').textContent=dn+'/'+tot+(dn===tot&&tot?' ✓':'');box.append(row);});
    var h3=h('h3');h3.textContent=tx.medals;box.append(h3);var g=h('div','grid',medalsHTML(medals()));box.append(g);
  }
  function profileView(box){
    var p=h('div','ph0'),big=h('button','big');big.type='button';big.setAttribute('data-pf-av','1');big.setAttribute('aria-label',tx.pro);
    var nm=h('h2','nm');nm.className='nm';nm.textContent=profile.name||'';var sub=h('div','sub');sub.textContent=C.city+' · '+C.line;
    p.append(big,nm,sub);box.append(p);
    try{if(W.Profile&&W.Profile.paint)W.Profile.paint(big,profile.avatar,profile.id);}catch(e){}
    var stars=0;for(var k in best){var r=best[k];stars+=r>=.9?3:r>=.7?2:1;}
    var sts=h('div','stats','<div><b>'+streak.cur+'</b><small>'+tx.days+'</small></div><div><b>'+lessonsDone+'</b><small>'+tx.lessons+'</small></div><div><b>'+stars+'</b><small>'+tx.stars+'</small></div>');box.append(sts);
    var h3=h('h3');h3.textContent=tx.medals;box.append(h3,h('div','grid',medalsHTML(medals())));
    var a=h('a','mb alt');a.href='account.html';a.textContent=tx.pay;a.addEventListener('click',tick);box.append(a);
  }
  function view(){
    var box=D.getElementById('mt-view');box.textContent='';
    if(tab==='home')homeView(box);else if(tab==='tro')trophiesView(box);else profileView(box);
    Array.prototype.forEach.call(root.querySelectorAll('.tab'),function(b){b.setAttribute('aria-selected',String(b.getAttribute('data-t')===tab));});
    var av=root.querySelector('.top .av');
    try{if(W.Profile&&av)W.Profile.paint(av,profile.avatar,profile.id);}catch(e){}
  }
  /* ----- skeleton ----- */
  var top=h('div','top');
  var av=h('button','av');av.type='button';av.setAttribute('data-pf-av','1');av.setAttribute('aria-label',tx.pro);av.addEventListener('click',function(){tick();tab='pro';view();});
  var lk=h('div','lk','<img alt="" src="'+B+'img/britland-shield.png"><div><b>BRITLAND</b><i>ACADEMY</i></div>');
  var fl=h('div','fl');fl.id='mt-fl';fl.textContent='🔥 0';
  top.append(av,lk,fl);
  var vw=h('div');vw.id='mt-view';
  signEl=h('div','sign');toastEl=h('div','toast');toastEl.setAttribute('role','status');
  var bar=h('nav','tabbar');bar.setAttribute('role','tablist');
  [['home','🏠',tx.home],['tro','🏆',tx.tro],['pro','👤',tx.pro]].forEach(function(x){var b=h('button','tab','<b>'+x[1]+'</b>'+x[2]);b.type='button';b.setAttribute('role','tab');b.setAttribute('data-t',x[0]);b.addEventListener('click',function(){if(busy)return;ctx();tick();tab=x[0];view();});bar.append(b);});
  root.append(top,vw,signEl,toastEl,bar);
  view();
  /* streak numbers (days in a row) */
  try{if(W.Gate&&Gate.sb)Gate.sb.rpc('my_streak').then(function(r){var s=r&&r.data;if(!s)return;streak={cur:s.cur||0,best:s.best||s.longest||0,last:s.last||''};D.getElementById('mt-fl').textContent='🔥 '+streak.cur;if(tab!=='home')view();}).catch(function(){});}catch(e){}
  /* welcome banner: flag + city, 2 seconds */
  var wel=h('div','wel','<div><div class="fw">'+flagHTML(C)+'</div><small>'+tx.next+'</small><h2></h2><div class="ln"><i></i><span></span></div></div>');
  wel.querySelector('h2').innerHTML=tx.welcome+'<br>';wel.querySelector('h2').append(D.createTextNode(C.welcome));wel.querySelector('.ln span').textContent=C.line;
  wel.setAttribute('role','status');root.append(wel);
  function endWel(){wel.classList.add('out');setTimeout(function(){wel.remove();},600);}
  wel.addEventListener('click',function(){ctx();endWel();});
  if(reduced())setTimeout(endWel,1200);else{setTimeout(function(){dingdong();},150);setTimeout(endWel,2200);}
}
W.Metro={mount:mount,gameOn:function(){try{return localStorage.getItem('bl-game')==='1';}catch(e){return false;}}};
})();
